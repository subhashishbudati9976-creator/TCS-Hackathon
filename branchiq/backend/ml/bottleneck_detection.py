"""
Bottleneck Detection Module — BranchIQ

Detects upcoming service bottlenecks before they cause queue overload.

IMPLEMENTATION STATUS: Placeholder — not yet implemented.

Planned approach:
- Threshold rules + anomaly detection on queue depth and counter utilization
- Alert severity classification: low / medium / high
- Output: BottleneckAlert objects with severity, message, and timestamp
"""

from __future__ import annotations


def detect_bottlenecks(branch_id: str | None = None) -> list[dict]:
    """
    Detect bottlenecks across branches (or a specific branch).

    Args:
        branch_id: Optional filter. If None, checks all branches.

    Returns:
        A list of dicts with keys: branch_id, severity, message, detected_at.

    Raises:
        NotImplementedError: Until detection logic is implemented.
    """
    raise NotImplementedError(
        "Bottleneck detection is not yet implemented. "
        "Implement threshold rules and anomaly detection first."
    )
