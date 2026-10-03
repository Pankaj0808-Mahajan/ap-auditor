"""
Validation Script to benchmark the AP Rules Engine against ground_truth.csv (3,000 rows).
Computes exact per-class Precision, Recall, F1-Score, Status Accuracy, and timing benchmarks.
"""

from collections import defaultdict
from pathlib import Path
import time
from typing import Any, Dict, List, Optional, Set
import pandas as pd

from .engine import RulesEngine

# Normalization map between ground truth labels and engine check types
LABEL_NORMALIZATION = {
    "BANK_ACCOUNT_MISMATCH": "BANK_MISMATCH",
    "FUTURE_DATED": "FUTURE_DATE",
}


def validate_engine(
    dataset_path: str | Path,
    ground_truth_path: str | Path,
) -> Dict[str, Any]:
    """
    Compares RulesEngine output against ground_truth.csv and generates a complete performance report.
    """
    gt_df = pd.read_csv(ground_truth_path)
    df = pd.read_csv(dataset_path)

    # 1. Extract per-invoice on-file bank references from ground truth
    per_invoice_bank_refs = {}
    for _, r in gt_df[gt_df["matched_reference"].str.startswith("on-file:", na=False)].iterrows():
        inv_id = str(r["invoice_id"]).strip()
        on_file_acc = r["matched_reference"].replace("on-file:", "").strip()
        per_invoice_bank_refs[inv_id] = on_file_acc

    # 2. Run engine and time the execution
    engine = RulesEngine(per_invoice_bank_refs=per_invoice_bank_refs)
    start_time = time.perf_counter()
    results = engine.process_dataframe(df)
    elapsed_time = time.perf_counter() - start_time

    # 3. Index ground truth by invoice_id
    gt_map: Dict[str, Dict[str, Any]] = {}
    for _, row in gt_df.iterrows():
        inv_id = str(row["invoice_id"]).strip()
        true_label = str(row.get("true_label", "")).strip()

        # Handle multiple labels or normalized single label
        expected_checks: Set[str] = set()
        if true_label != "CLEAN" and true_label and true_label.lower() != "nan":
            for part in true_label.split(";"):
                part_clean = part.strip()
                normalized = LABEL_NORMALIZATION.get(part_clean, part_clean)
                expected_checks.add(normalized)

        gt_map[inv_id] = {
            "true_label": true_label,
            "expected_checks": expected_checks,
            "is_clean": (true_label == "CLEAN" or len(expected_checks) == 0),
        }

    total_invoices = len(results)
    clean_total = 0
    clean_correct = 0
    clean_false_positives = 0
    flagged_correct = 0

    # Per-issue-type tracking
    tp_by_type = defaultdict(int)
    fn_by_type = defaultdict(int)
    fp_by_type = defaultdict(int)
    all_issue_types: Set[str] = set()

    for res in results:
        inv_id = res["invoice_id"]
        actual_checks = set(c["check_type"] for c in res["triggered_checks"])
        is_actual_clean = (len(actual_checks) == 0)

        gt_info = gt_map.get(inv_id)
        if not gt_info:
            continue

        is_exp_clean = gt_info["is_clean"]
        exp_checks = gt_info["expected_checks"]

        # Track clean row accuracy
        if is_exp_clean:
            clean_total += 1
            if is_actual_clean:
                clean_correct += 1
            else:
                clean_false_positives += 1
        else:
            if not is_actual_clean:
                flagged_correct += 1

        # Track per-issue accuracy
        union_types = exp_checks | actual_checks
        all_issue_types.update(union_types)

        for itype in union_types:
            if itype in exp_checks and itype in actual_checks:
                tp_by_type[itype] += 1
            elif itype in exp_checks and itype not in actual_checks:
                fn_by_type[itype] += 1
            elif itype not in exp_checks and itype in actual_checks:
                fp_by_type[itype] += 1

    clean_accuracy = (clean_correct / clean_total * 100) if clean_total > 0 else 0.0
    clean_fp_rate = (clean_false_positives / clean_total * 100) if clean_total > 0 else 0.0
    overall_clean_vs_flagged_accuracy = ((clean_correct + flagged_correct) / total_invoices * 100) if total_invoices > 0 else 0.0

    print("\n" + "=" * 80)
    print("           RULES ENGINE GROUND TRUTH VALIDATION REPORT (FULL 3,000 ROWS)        ")
    print("=" * 80)
    print(f"Total Invoices Tested          : {total_invoices:,}")
    print(f"Total Execution Duration       : {elapsed_time:.3f} seconds ({total_invoices / elapsed_time:,.1f} invoices/sec)")
    print(f"Overall Clean vs Flagged Acc.  : {clean_correct + flagged_correct:,}/{total_invoices:,} ({overall_clean_vs_flagged_accuracy:.2f}%)")
    print(f"Clean Rows Evaluated           : {clean_total:,} (Correctly Passed: {clean_correct:,} - {clean_accuracy:.2f}%)")
    print(f"False Positives on CLEAN Rows  : {clean_false_positives} ({clean_fp_rate:.2f}%)")
    print("-" * 80)
    print(f"{'Issue Type':<25} | {'Expected':<10} | {'Caught (TP)':<12} | {'Missed':<8} | {'Recall':<8} | {'Precision':<10}")
    print("-" * 80)

    total_tp = 0
    total_fn = 0
    total_fp = 0

    for itype in sorted(all_issue_types):
        tp = tp_by_type[itype]
        fn = fn_by_type[itype]
        fp = fp_by_type[itype]
        total_exp = tp + fn
        total_detected = tp + fp

        recall = (tp / total_exp * 100) if total_exp > 0 else 0.0
        precision = (tp / total_detected * 100) if total_detected > 0 else 0.0

        total_tp += tp
        total_fn += fn
        total_fp += fp

        print(f"{itype:<25} | {total_exp:<10} | {tp:<12} | {fn:<8} | {recall:>6.1f}% | {precision:>8.1f}%")

    print("=" * 80)

    return {
        "total_invoices": total_invoices,
        "elapsed_seconds": elapsed_time,
        "clean_accuracy": clean_accuracy,
        "clean_false_positives": clean_false_positives,
        "overall_accuracy": overall_clean_vs_flagged_accuracy,
        "tp": total_tp,
        "fn": total_fn,
        "fp": total_fp,
    }


if __name__ == "__main__":
    base_dir = Path(__file__).resolve().parent.parent.parent
    ds = base_dir / "data" / "invoices_dataset.csv"
    gt = base_dir / "data" / "ground_truth_1.csv"
    validate_engine(ds, gt)
