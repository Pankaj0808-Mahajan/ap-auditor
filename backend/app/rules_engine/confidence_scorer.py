"""
Confidence Scorer and Exception Aggregator for AP Invoices.
Synthesizes individual rule checks into calibrated confidence scores, exception status, and human-readable evidence summaries.
"""

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional


@dataclass
class ScoredResult:
    invoice_id: str
    status: str  # "AUTO_PASS", "FLAGGED_AUTO", "NEEDS_HUMAN_REVIEW"
    confidence_score: float
    triggered_checks: List[Dict[str, Any]] = field(default_factory=list)
    reason: str = ""

    def to_dict(self) -> Dict[str, Any]:
        return {
            "invoice_id": self.invoice_id,
            "status": self.status,
            "confidence_score": self.confidence_score,
            "triggered_checks": self.triggered_checks,
            "reason": self.reason,
        }


def score_invoice_exceptions(
    invoice_id: str,
    triggered_checks: List[Dict[str, Any]],
    threshold_auto_flag: float = 0.80,
) -> ScoredResult:
    """
    Combines rule violation flags for a single invoice to compute an aggregate confidence score and decision status.

    Status logic:
    - 0 checks failed: confidence = 1.0, status = "AUTO_PASS"
    - 1+ checks failed:
        * Checks are scored based on certainty (Exact Duplicate / Bank Mismatch / Missing Field = 0.85-0.98;
          Fuzzy Duplicate / Limits / Approvals = 0.50-0.85 scaled).
        * Aggregate confidence reflects the strongest and combined signals.
        * If confidence >= threshold_auto_flag (0.80): "FLAGGED_AUTO"
        * If confidence < threshold_auto_flag: "NEEDS_HUMAN_REVIEW"
    """
    if not triggered_checks:
        return ScoredResult(
            invoice_id=invoice_id,
            status="AUTO_PASS",
            confidence_score=1.0,
            triggered_checks=[],
            reason="All AP compliance checks passed without exception.",
        )

    # Calculate aggregate confidence
    # Near-certain checks have high base confidence (>= 0.85)
    # Scaled checks have medium confidence (0.50 - 0.85)
    confidences = [check.get("base_confidence", 0.70) for check in triggered_checks]
    max_confidence = max(confidences)

    # If multiple checks fail, the likelihood of a genuine issue is even higher
    if len(confidences) > 1:
        combined_confidence = min(0.99, max_confidence + 0.04 * (len(confidences) - 1))
    else:
        combined_confidence = max_confidence

    final_score = round(combined_confidence, 3)

    # Determine status
    if final_score >= threshold_auto_flag:
        status = "FLAGGED_AUTO"
    else:
        status = "NEEDS_HUMAN_REVIEW"

    # Assemble comprehensive plain-English reason string
    reasons = [check.get("reason", "").strip() for check in triggered_checks if check.get("reason")]
    combined_reason = " | ".join(reasons)

    return ScoredResult(
        invoice_id=invoice_id,
        status=status,
        confidence_score=final_score,
        triggered_checks=triggered_checks,
        reason=combined_reason,
    )
