"""
Configuration rules and constants for the AP Rules Engine.
"""

# Categories and their policy limits & PO requirements
CATEGORY_POLICY = {
    "Office Supplies": {"limit": 25000.0, "po_required": False},
    "IT Equipment": {"limit": 500000.0, "po_required": True},
    "Travel": {"limit": 60000.0, "po_required": False},
    "Catering": {"limit": 40000.0, "po_required": False},
    "Logistics": {"limit": 150000.0, "po_required": True},
    "Professional Services": {"limit": 1000000.0, "po_required": True},
    "Facilities": {"limit": 300000.0, "po_required": True},
    "Marketing": {"limit": 200000.0, "po_required": False},
}

# Approval ladder thresholds (who is allowed to approve up to what amount)
APPROVER_LADDER = {
    "Team Manager": 10000.0,
    "Department Head": 100000.0,
    "Finance Controller": 1000000.0,
    "CFO": float("inf"),
}

# PO amount tolerance (5%)
PO_TOLERANCE_PERCENT = 0.05

# Duplicate matching thresholds (tightened for precision)
DUPLICATE_DATE_WINDOW_DAYS = 7            # Within 7 days
FUZZY_VENDOR_SIMILARITY_THRESHOLD = 90.0  # RapidFuzz ratio >= 90%
FUZZY_AMOUNT_TOLERANCE_PERCENT = 0.01     # Amount within 1%
