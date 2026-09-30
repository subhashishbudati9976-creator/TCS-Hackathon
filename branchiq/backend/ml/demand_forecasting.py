"""
Demand Forecasting Module — AVENUE
"""

from __future__ import annotations
from typing import Any, Dict, List
from ml.forecast_service import forecast_service


def forecast_demand(branch_id: str, horizon_hours: int = 8) -> List[Dict[str, Any]]:
    res = forecast_service.forecast_branch(branch_id=branch_id, horizon_hours=horizon_hours)
    return res["forecast"]
