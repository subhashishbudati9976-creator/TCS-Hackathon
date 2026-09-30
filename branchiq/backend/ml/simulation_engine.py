"""
Simulation Engine — AVENUE
Calculates What-If operational scenarios for branch staffing, demand surges,
and counter capacity configurations using queueing mathematics.
"""

from __future__ import annotations
import math
from typing import Any
import uuid


def simulate_scenario(
    branch_code: str = "AV-CENTRAL",
    staff_count: int = 9,
    demand_multiplier: float = 1.0,
    active_counters: int = 6,
    cross_trained_reallocated: int = 0,
) -> dict[str, Any]:
    """
    Simulates operational performance under hypothetical manager configurations.
    Uses multi-server queueing theory (M/M/c) principles.
    """
    # Baseline metrics by branch
    baselines = {
        "AV-CENTRAL": {
            "branch_load": 84,
            "avg_wait_minutes": 28,
            "queue_pressure": 26,
            "staff_utilization": 91,
            "predicted_csat": 4.1,
            "base_counters": 6,
            "base_staff": 9,
        },
        "AV-NORTH": {
            "branch_load": 38,
            "avg_wait_minutes": 8,
            "queue_pressure": 6,
            "staff_utilization": 52,
            "predicted_csat": 4.8,
            "base_counters": 5,
            "base_staff": 7,
        },
        "AV-WEST": {
            "branch_load": 58,
            "avg_wait_minutes": 15,
            "queue_pressure": 13,
            "staff_utilization": 68,
            "predicted_csat": 4.4,
            "base_counters": 4,
            "base_staff": 6,
        },
    }

    base = baselines.get(branch_code, baselines["AV-CENTRAL"])

    # Compute capacity enhancement factor
    effective_staff = staff_count + (cross_trained_reallocated * 0.85)
    counter_factor = active_counters / max(base["base_counters"], 1)
    staff_factor = effective_staff / max(base["base_staff"], 1)
    overall_capacity_factor = (counter_factor * 0.55) + (staff_factor * 0.45)

    # Congestion ratio
    congestion = demand_multiplier / max(overall_capacity_factor, 0.25)

    # Calculated "After" state
    sim_utilization = min(99, max(22, int(base["staff_utilization"] * (congestion ** 0.85))))
    sim_load = min(100, max(18, int(base["branch_load"] * (congestion ** 0.95))))

    # Nonlinear wait-time response curve (standard M/M/c queueing delay behavior)
    wait_exponent = 1.6 if congestion > 1.0 else 1.2
    sim_wait = min(60, max(3, int(base["avg_wait_minutes"] * (congestion ** wait_exponent))))
    sim_queue = min(50, max(2, int(base["queue_pressure"] * (congestion ** 1.3))))

    # CSAT impact calculation
    wait_improvement = base["avg_wait_minutes"] - sim_wait
    load_improvement = base["branch_load"] - sim_load
    sim_csat = round(
        min(5.0, max(2.5, base["predicted_csat"] + (wait_improvement * 0.04) + (load_improvement * 0.01))),
        2,
    )

    # Generate AI diagnostic summary
    if congestion < 0.85:
        verdict = (
            f"Superb operational improvement! Branch load drops by {base['branch_load'] - sim_load}% "
            f"and wait times reduce by {base['avg_wait_minutes'] - sim_wait} mins. "
            f"Customer satisfaction expected to rise to {sim_csat}/5.0 with low counter strain."
        )
    elif congestion <= 1.05:
        verdict = (
            f"Balanced configuration. Average wait time settles at {sim_wait} mins with {sim_load}% branch load. "
            f"Staff utilization remains sustainable at {sim_utilization}%."
        )
    else:
        verdict = (
            f"Warning: Configuration leads to customer backlog. Wait time escalates to {sim_wait} mins "
            f"(+{sim_wait - base['avg_wait_minutes']} mins) and staff utilization hits {sim_utilization}%. "
            f"Recommend adding at least 1 counter or cross-allocating 1 floater."
        )

    return {
        "scenario_id": f"SIM-{uuid.uuid4().hex[:6].upper()}",
        "branch_code": branch_code,
        "before": {
            "branch_load": base["branch_load"],
            "avg_wait_minutes": base["avg_wait_minutes"],
            "queue_pressure": base["queue_pressure"],
            "staff_utilization": base["staff_utilization"],
            "predicted_csat": base["predicted_csat"],
        },
        "after": {
            "branch_load": sim_load,
            "avg_wait_minutes": sim_wait,
            "queue_pressure": sim_queue,
            "staff_utilization": sim_utilization,
            "predicted_csat": sim_csat,
        },
        "delta": {
            "branch_load": sim_load - base["branch_load"],
            "avg_wait_minutes": sim_wait - base["avg_wait_minutes"],
            "queue_pressure": sim_queue - base["queue_pressure"],
            "staff_utilization": sim_utilization - base["staff_utilization"],
            "predicted_csat": round(sim_csat - base["predicted_csat"], 2),
        },
        "ai_verdict": verdict,
    }
