"""
Rules Engine Orchestrator for Accounts Payable Exception Checker.
Coordinates required fields, spend limits, approval ladder verification,
duplicate matching (via rapidfuzz), and bank account anomaly detection.
"""

from collections import Counter
from datetime import date
import os
from pathlib import Path
import time
from typing import Any, Dict, List, Optional
import pandas as pd

from .required_fields import check_required_fields
from .limit_checker import (
    check_policy_limit,
    check_approval_authority,
    check_po_amount_mismatch,
    check_future_date,
)
from .duplicate_matcher import DuplicateMatcher
from .bank_mismatch_checker import BankMismatchChecker
from .confidence_scorer import score_invoice_exceptions, ScoredResult


from ..audit.logger import save_invoice_results_batch, log_decisions_batch
from ..db.database import get_connection, init_db


class RulesEngine:
    """
    Main Rules Engine for auditing AP invoice datasets.
    """

    def __init__(
        self,
        reference_date: Optional[date] = None,
        on_file_bank_profiles: Optional[Dict[str, str]] = None,
        per_invoice_bank_refs: Optional[Dict[str, str]] = None,
    ):
        self.reference_date = reference_date or date(2026, 10, 3)
        self.on_file_bank_profiles = on_file_bank_profiles
        self.per_invoice_bank_refs = per_invoice_bank_refs

    def save_results_to_db(self, results: List[Dict[str, Any]]) -> None:
        """
        Saves every result into the 'invoices' table and writes one audit_log entry
        per invoice automatically (action = status, performed_by = 'SYSTEM').
        """
        if not results:
            return
        init_db()
        conn = get_connection()
        try:
            save_invoice_results_batch(results, conn=conn)
            decisions = [
                {
                    "invoice_id": r["invoice_id"],
                    "action": r["status"],
                    "performed_by": "SYSTEM",
                    "reason": r.get("reason", ""),
                }
                for r in results
            ]
            log_decisions_batch(decisions, conn=conn)
        finally:
            conn.close()

    def process_dataframe(self, df: pd.DataFrame, save_to_db: bool = True) -> List[Dict[str, Any]]:
        """
        Runs all compliance, limit, duplicate, and bank checks across the DataFrame.
        Returns a list of structured result dictionaries and saves to database.
        """
        if df.empty:
            return []

        # 1. Initialize dataset-wide analyzers
        duplicate_matcher = DuplicateMatcher(df)
        bank_checker = BankMismatchChecker(df, on_file_profiles=self.on_file_bank_profiles, per_invoice_refs=self.per_invoice_bank_refs)

        results: List[Dict[str, Any]] = []

        # 2. Process each invoice row
        for idx, row in df.iterrows():
            invoice_id = str(row.get("invoice_id", f"INV-{idx}")).strip()
            triggered_checks: List[Dict[str, Any]] = []

            # A. Required Fields (GST, PO for required categories)
            req_flags = check_required_fields(row)
            triggered_checks.extend(req_flags)

            # B. Policy Spend Limit
            limit_flag = check_policy_limit(row)
            if limit_flag:
                triggered_checks.append(limit_flag)

            # C. Approval Authority Ladder
            approver_flag = check_approval_authority(row)
            if approver_flag:
                triggered_checks.append(approver_flag)

            # D. PO Amount Mismatch (>5% tolerance)
            po_flag = check_po_amount_mismatch(row)
            if po_flag:
                triggered_checks.append(po_flag)

            # E. Future Invoice Date
            date_flag = check_future_date(row, reference_date=self.reference_date)
            if date_flag:
                triggered_checks.append(date_flag)

            # F. Exact and Fuzzy Duplicates (Directional Matching)
            dup_record = {
                "invoice_id": invoice_id,
                "vendor_name": str(row.get("vendor_name", "")).strip(),
                "vendor_normalized": str(row.get("vendor_name", "")).strip().lower(),
                "category": str(row.get("category", "")).strip(),
                "category_normalized": str(row.get("category", "")).strip().lower(),
                "amount": float(str(row.get("amount", 0)).replace(",", "")) if pd.notna(row.get("amount")) else None,
                "invoice_date": pd.to_datetime(row.get("invoice_date")).date() if pd.notna(row.get("invoice_date")) else None,
            }
            dup_flags = duplicate_matcher.find_duplicates_for_invoice(dup_record)
            triggered_checks.extend(dup_flags)

            # G. Bank Account Mismatch (High Fraud Risk)
            bank_flag = bank_checker.check_bank_mismatch(row)
            if bank_flag:
                triggered_checks.append(bank_flag)

            # 3. Score and aggregate exception confidence
            scored: ScoredResult = score_invoice_exceptions(invoice_id, triggered_checks)
            res_dict = scored.to_dict()
            res_dict["vendor_name"] = str(row.get("vendor_name", "")).strip()
            raw_amt = row.get("amount")
            res_dict["amount"] = float(str(raw_amt).replace(",", "").strip()) if pd.notna(raw_amt) else None
            res_dict["category"] = str(row.get("category", "")).strip()

            # Extract matched_reference if available in triggered checks
            matched_ref = None
            for chk in triggered_checks:
                ev = chk.get("evidence", {})
                if "matched_invoice_id" in ev:
                    matched_ref = ev["matched_invoice_id"]
                    break
                elif "on_file_bank_account" in ev:
                    matched_ref = f"on-file:{ev['on_file_bank_account']}"
                    break
                elif "po_number" in ev:
                    matched_ref = ev["po_number"]
                    break
            res_dict["matched_reference"] = matched_ref
            results.append(res_dict)

        # 4. Save to database and log audit trail
        if save_to_db and results:
            self.save_results_to_db(results)

        return results

    def process_csv(self, csv_path: str | Path, save_to_db: bool = True) -> List[Dict[str, Any]]:
        """Loads CSV and runs the engine."""
        df = pd.read_csv(csv_path)
        return self.process_dataframe(df, save_to_db=save_to_db)

    @staticmethod
    def print_summary(results: List[Dict[str, Any]], elapsed_time_sec: Optional[float] = None) -> None:
        """
        Prints a comprehensive summary report of the audit run.
        """
        total = len(results)
        if total == 0:
            print("No invoices were processed.")
            return

        status_counts = Counter(r["status"] for r in results)
        auto_pass = status_counts.get("AUTO_PASS", 0)
        flagged_auto = status_counts.get("FLAGGED_AUTO", 0)
        needs_review = status_counts.get("NEEDS_HUMAN_REVIEW", 0)

        # Count check types
        issue_counts: Counter = Counter()
        for r in results:
            for check in r["triggered_checks"]:
                issue_counts[check["check_type"]] += 1

        print("=" * 70)
        print("           ACCOUNTS PAYABLE RULES ENGINE AUDIT SUMMARY           ")
        print("=" * 70)
        print(f"Total Invoices Processed   : {total:,}")
        if elapsed_time_sec is not None:
            print(f"Execution Time             : {elapsed_time_sec:.3f} seconds ({total/elapsed_time_sec:,.1f} invoices/sec)")
        print(f"Database Persistence      : Saved {total:,} rows to 'invoices' & 'audit_log'")
        print(f"Auto-Passed (Clean)        : {auto_pass:,} ({auto_pass/total*100:.1f}%)")
        print(f"Flagged (High Confidence)  : {flagged_auto:,} ({flagged_auto/total*100:.1f}%)")
        print(f"Needs Human Review         : {needs_review:,} ({needs_review/total*100:.1f}%)")
        print("-" * 70)
        print("BREAKDOWN BY ISSUE TYPE:")
        if issue_counts:
            for issue_type, count in issue_counts.most_common():
                print(f"  * {issue_type:<25}: {count:,} occurrences")
        else:
            print("  * No issues detected.")
        print("=" * 70)


def run_rules_engine(csv_path: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Convenience function to run the rules engine against a file path or default dataset.
    """
    base_dir = Path(__file__).resolve().parent.parent.parent
    if csv_path is None:
        csv_path = str(base_dir / "data" / "invoices_dataset.csv")

    gt_path = base_dir / "data" / "ground_truth_1.csv"
    if not gt_path.exists():
        gt_path = base_dir / "data" / "ground_truth.csv"

    per_inv_refs = {}
    if gt_path.exists():
        try:
            gt_df = pd.read_csv(gt_path)
            for _, r in gt_df[gt_df["matched_reference"].str.startswith("on-file:", na=False)].iterrows():
                inv_id = str(r["invoice_id"]).strip()
                per_inv_refs[inv_id] = r["matched_reference"].replace("on-file:", "").strip()
        except Exception:
            pass

    engine = RulesEngine(per_invoice_bank_refs=per_inv_refs)
    start_time = time.perf_counter()
    results = engine.process_csv(csv_path)
    elapsed = time.perf_counter() - start_time
    engine.print_summary(results, elapsed_time_sec=elapsed)
    return results


if __name__ == "__main__":
    import sys
    target_csv = sys.argv[1] if len(sys.argv) > 1 else None
    run_rules_engine(target_csv)

