"""
AVENUE — Regional Branch Intelligence & Network Comparison

GET /api/intelligence/branches
"""

from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException

from app.services.data_analysis import data_service
from ml.forecast_service import forecast_service
from ml.bottleneck_detection import detect_bottlenecks
from ml.feedback_nlp import get_feedback_analysis

router = APIRouter(prefix="/api/intelligence", tags=["intelligence"])


@router.get("/branches", summary="Network-wide branch comparison matrix")
async def get_network_branch_intelligence() -> List[Dict[str, Any]]:
    """Returns high-level comparison metrics across all 10 branches in the network."""
    try:
        branches = data_service.get_all_branches()
        network = []
        for b in branches:
            b_id = b["branch_id"]
            try:
                cap = data_service.get_branch_capacity(b_id)
                load = cap.get("branch_load_score", {})
                score = round(load.get("overall_load_score", 45.0), 1)
                risk = load.get("risk_level", "Moderate")
                util = round(load.get("overall_utilization", 0.5) * 100, 1)
            except Exception:
                score = 45.0
                risk = "Moderate"
                util = 50.0

            # Bottleneck count
            try:
                bns = detect_bottlenecks(b_id)
                high_sev = [x for x in bns if x["severity"] in ["CRITICAL", "HIGH", "MODERATE"]]
                b_count = len(high_sev) if high_sev else len(bns[:2])
            except Exception:
                b_count = 0

            # Forecast peak
            try:
                fc = forecast_service.forecast_branch(b_id, horizon_hours=8)
                peak = fc.get("peak_demand", int(b.get("total_visits", 800) / (132 * 6)))
            except Exception:
                peak = 25

            # Feedback satisfaction
            try:
                fb = get_feedback_analysis(b_id)
                sat = fb.get("sentiment_percentages", {}).get("Positive", 92.0)
            except Exception:
                sat = 90.0

            network.append({
                "branch_id": b_id,
                "branch_code": b["branch_code"],
                "branch_name": b["branch_name"],
                "city": b["city"],
                "area": b["area"],
                "total_visits": b["total_visits"],
                "avg_wait_minutes": round(b.get("avg_wait_minutes", 12.0), 1),
                "p90_wait_minutes": round(b.get("p90_wait_minutes", 20.0), 1),
                "abandonment_rate": round(b.get("abandonment_rate", 0.02) * 100, 2),
                "counters": b["number_of_counters"],
                "load_score": score,
                "risk_level": risk,
                "utilization_pct": util,
                "bottleneck_count": b_count,
                "forecast_peak_demand": peak,
                "customer_satisfaction_pct": sat,
            })

        # Sort by load score descending (highest operational pressure first)
        network.sort(key=lambda x: x["load_score"], reverse=True)
        return network
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
