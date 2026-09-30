"""
Demand Forecasting Module — BranchIQ

Predicts future customer traffic per branch and time slot.

IMPLEMENTATION STATUS: Placeholder — not yet implemented.

Planned approach:
- Feature engineering: hour-of-day, day-of-week, holidays, branch history
- Model: XGBoost regressor or LSTM (time-series)
- Output: predicted_customers per (branch_id, timestamp) for the next 24 h
"""

from __future__ import annotations


def forecast_demand(branch_id: str, horizon_hours: int = 24) -> list[dict]:
    """
    Forecast customer demand for a branch over the next `horizon_hours`.

    Args:
        branch_id: The unique branch identifier.
        horizon_hours: How many hours ahead to forecast.

    Returns:
        A list of dicts with keys: timestamp, predicted_customers, branch_id.

    Raises:
        NotImplementedError: Until the model is trained and wired up.
    """
    raise NotImplementedError(
        "Demand forecasting is not yet implemented. "
        "Train a model with ml/train_forecast.py first."
    )
