"""
Demand Forecasting Engine — AVENUE
Predicts hourly customer footfall, queue pressure, and wait times for bank branches.
"""

from __future__ import annotations
import math
from typing import Any


# Typical banking intraday arrival distribution (weights per hour from 09:00 to 17:00)
INTRADAY_WEIGHTS = {
    "09:00": 0.55,
    "10:00": 0.82,
    "11:00": 1.15,
    "12:00": 1.45,  # Lunch peak
    "13:00": 1.50,  # Peak rush
    "14:00": 1.25,
    "15:00": 0.95,
    "16:00": 0.78,
    "17:00": 0.40,
}


def forecast_branch_demand(
    branch_code: str = "AV-CENTRAL",
    base_hourly_customers: int = 25,
    weather_multiplier: float = 1.0,
    day_multiplier: float = 1.1,  # e.g., Midweek / Friday rush
) -> list[dict[str, Any]]:
    """
    Generate hourly forecast from 09:00 to 17:00.
    Returns predicted customers, historical actuals (for past hours),
    counter capacity, and predicted wait times.
    """
    results = []
    # Branch specific baseline factor
    branch_factors = {
        "AV-CENTRAL": 1.25,  # High traffic flagship
        "AV-NORTH": 0.65,    # Low traffic sub-branch
        "AV-WEST": 0.85,     # Medium traffic hub
    }
    factor = branch_factors.get(branch_code, 1.0)

    # Current simulated hour is 13:00 (1 PM)
    current_hour_idx = 4  # 09:00=0, 10:00=1, 11:00=2, 12:00=3, 13:00=4

    for idx, (hour_str, weight) in enumerate(INTRADAY_WEIGHTS.items()):
        predicted = int(base_hourly_customers * weight * factor * weather_multiplier * day_multiplier)
        capacity = int(32 * (1.1 if factor > 1 else 0.9))

        # For hours already passed or current, give realistic actual values
        if idx <= current_hour_idx:
            # actual had a slight variance (+10% to -5%)
            actual = int(predicted * (1.12 if idx in [3, 4] else 0.96))
        else:
            actual = None

        # Predicted wait time based on capacity ratio
        load_ratio = predicted / max(capacity, 1)
        wait_mins = max(5, int(10 * math.exp(1.2 * max(0.0, load_ratio - 0.5))))

        results.append({
            "hour": hour_str,
            "predicted_customers": predicted,
            "actual_customers": actual,
            "predicted_wait_minutes": min(wait_mins, 48),
            "counter_capacity": capacity,
        })

    return results


def get_hourly_queue_trend(branch_code: str = "AV-CENTRAL") -> list[dict[str, Any]]:
    """Generates queue backlog and service throughput trend across the day."""
    queue_data = [
        {"hour": "09:00", "active_queue": 8, "completed_services": 16, "avg_service_time": 9},
        {"hour": "10:00", "active_queue": 14, "completed_services": 24, "avg_service_time": 10},
        {"hour": "11:00", "active_queue": 19, "completed_services": 28, "avg_service_time": 12},
        {"hour": "12:00", "active_queue": 28, "completed_services": 31, "avg_service_time": 14},
        {"hour": "13:00", "active_queue": 26, "completed_services": 34, "avg_service_time": 13},
        {"hour": "14:00", "active_queue": 20, "completed_services": 30, "avg_service_time": 11},
        {"hour": "15:00", "active_queue": 15, "completed_services": 26, "avg_service_time": 10},
        {"hour": "16:00", "active_queue": 10, "completed_services": 22, "avg_service_time": 9},
        {"hour": "17:00", "active_queue": 4, "completed_services": 14, "avg_service_time": 8},
    ]
    if branch_code == "AV-NORTH":
        # Scale down for lower load branch
        return [
            {
                "hour": d["hour"],
                "active_queue": max(2, int(d["active_queue"] * 0.35)),
                "completed_services": int(d["completed_services"] * 0.6),
                "avg_service_time": max(6, int(d["avg_service_time"] * 0.8)),
            }
            for d in queue_data
        ]
    elif branch_code == "AV-WEST":
        return [
            {
                "hour": d["hour"],
                "active_queue": max(3, int(d["active_queue"] * 0.65)),
                "completed_services": int(d["completed_services"] * 0.8),
                "avg_service_time": int(d["avg_service_time"] * 0.9),
            }
            for d in queue_data
        ]
    return queue_data
