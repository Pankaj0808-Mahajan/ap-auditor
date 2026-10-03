"""
Bank Account Mismatch Checker for AP Invoices.
Checks invoice bank accounts against externally-provided on-file references.
Supports both per-vendor profiles and per-invoice override references.
Only flags mismatches when an on-file account is known.
"""

from typing import Any, Dict, Optional
import pandas as pd


def _clean_str(val: Any) -> str:
    """Cleans and standardizes string representation."""
    if val is None or pd.isna(val):
        return ""
    s = str(val).strip()
    if s.lower() in ("nan", "none", "null", "n/a"):
        return ""
    return s


class BankMismatchChecker:
    """
    Detects bank account mismatches by comparing invoice bank accounts
    against known on-file references.
    
    Supports two modes:
    1. Per-invoice references: specific invoice_id -> expected_bank_account 
       (from vendor master DB or ground truth)
    2. Per-vendor profiles: vendor_name -> on-file bank_account
       (fallback when per-invoice data is unavailable)
    """

    def __init__(
        self,
        df: Optional[pd.DataFrame] = None,
        on_file_profiles: Optional[Dict[str, str]] = None,
        per_invoice_refs: Optional[Dict[str, str]] = None,
    ):
        # vendor_key (lowercase) -> known on-file bank account
        self.vendor_on_file: Dict[str, str] = {}
        # invoice_id -> expected on-file bank account  
        self.invoice_on_file: Dict[str, str] = {}
        
        if on_file_profiles:
            for vendor_name, account in on_file_profiles.items():
                v_key = _clean_str(vendor_name).lower()
                if v_key and account:
                    self.vendor_on_file[v_key] = _clean_str(account)
        
        if per_invoice_refs:
            for inv_id, account in per_invoice_refs.items():
                if inv_id and account:
                    self.invoice_on_file[str(inv_id).strip()] = _clean_str(account)

    def check_bank_mismatch(self, row: Dict[str, Any] | pd.Series) -> Optional[Dict[str, Any]]:
        """
        Flags if invoice bank_account differs from the known on-file account.
        Checks per-invoice references first, then falls back to per-vendor profiles.
        Returns None if no on-file account is known.
        """
        invoice_id = _clean_str(row.get("invoice_id"))
        vendor = _clean_str(row.get("vendor_name"))
        bank_acc = _clean_str(row.get("bank_account"))

        if not vendor or not bank_acc:
            return None

        # Priority 1: Per-invoice reference
        on_file_account = self.invoice_on_file.get(invoice_id)
        
        # Priority 2: Per-vendor profile
        if not on_file_account:
            vendor_key = vendor.lower()
            on_file_account = self.vendor_on_file.get(vendor_key)

        if not on_file_account:
            return None

        if bank_acc != on_file_account:
            return {
                "check_type": "BANK_MISMATCH",
                "severity": "HIGH",
                "base_confidence": 0.95,
                "evidence": {
                    "vendor_name": vendor,
                    "invoice_bank_account": bank_acc,
                    "on_file_bank_account": on_file_account,
                },
                "reason": (
                    f"Bank account '{bank_acc}' differs from vendor '{vendor}' on-file account "
                    f"'{on_file_account}'. High fraud risk payment diversion signal."
                ),
            }
        return None


