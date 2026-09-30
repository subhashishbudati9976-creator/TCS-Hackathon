"""
AVENUE — What-If Simulation Engine

Allows branch operations managers to simulate operational interventions
WITHOUT mutating actual historical data or production rosters.

Scenarios supported:
1. STAFF_REASSIGNMENT (reassign N staff from source service to target service)
2. DIGITAL_DIVERSION (divert % of eligible walk-in visits to online/kiosk)
3. CUSTOMER_REDIRECTION (redirect % of walk-ins to alternate branch)
"""

from __future__ import annotations

import copy
import uuid
from typing import Any, Dict, Optional
import pandas as pd

from app.services.data_analysis import data_service
from ml.bottleneck_detection import detect_bottlenecks


def simulate_action(branch_id: str, action_type: str, parameters: Dict[str, Any]) -> Dict[str, Any]:
    """
    Simulate the effect of an operational intervention on a branch.
    Does not mutate underlying datasets. Clones and recalculates in-memory.
    """
    scenario_id = f"SIM_{uuid.uuid4().hex[:8].upper()}"
    action_type = action_type.upper()

    # 1. Fetch current baseline metrics for the branch
    cap_data = data_service.get_branch_capacity(branch_id)
    load_score = cap_data.get("branch_load_score", {})
    services_list = cap_data.get("service_capacity_breakdown", [])
    
    # Baseline summary
    base_workload = float(load_score.get("total_workload_minutes", 1000.0))
    base_capacity = float(load_score.get("total_capacity_minutes", 1200.0))
    base_util = float(load_score.get("overall_utilization", base_workload / max(1.0, base_capacity)))
    base_gap = float(load_score.get("net_capacity_gap_minutes", base_workload - base_capacity))
    base_wait = float(load_score.get("avg_waiting_time", 15.0))
    base_score = float(load_score.get("overall_load_score", 50.0))
    base_visits = int(load_score.get("total_visits", 100))

    # Clone service breakdowns for service-level adjustments
    sim_services = copy.deepcopy(services_list)

    # 2. Apply scenario logic
    action_description = ""
    sim_workload = base_workload
    sim_capacity = base_capacity
    sim_visits = base_visits

    if action_type in ["STAFF_REASSIGNMENT", "STAFF_ALLOCATION"]:
        from_svc = parameters.get("from_service")
        to_svc = parameters.get("to_service")
        staff_count = float(parameters.get("staff_count", 1))

        # Reassign staff minutes (1 staff = ~420 mins standard shift)
        shift_minutes = staff_count * 420.0
        
        target_found = False
        donor_found = False
        target_before_util = 0.0
        target_after_util = 0.0

        for s in sim_services:
            if s["service_type"] == from_svc:
                s["assigned_staff_count"] = max(0.5, s["assigned_staff_count"] - staff_count)
                s["capacity_minutes"] = max(60.0, s["capacity_minutes"] - shift_minutes)
                s["utilization_rate"] = round(s["workload_minutes"] / max(1.0, s["capacity_minutes"]), 3)
                donor_found = True
            elif s["service_type"] == to_svc:
                target_before_util = s["utilization_rate"]
                s["assigned_staff_count"] += staff_count
                s["capacity_minutes"] += shift_minutes
                s["utilization_rate"] = round(s["workload_minutes"] / max(1.0, s["capacity_minutes"]), 3)
                target_after_util = s["utilization_rate"]
                target_found = True

        action_description = f"Reassign {int(staff_count)} staff member(s) from {from_svc or 'general'} to {to_svc}"
        # Total capacity doesn't change, but bottleneck service capacity increases
        # Effective wait time decreases because queue bottlenecks are relieved
        wait_relief_factor = 0.85 if target_found else 0.95

    elif action_type in ["DIGITAL_DIVERSION", "DIGITAL_ADOPTION"]:
        target_svc = parameters.get("target_service", "Statement Request")
        adoption_rate = float(parameters.get("adoption_rate", 0.25))

        diverted_minutes = 0.0
        diverted_customers = 0

        for s in sim_services:
            if target_svc == "ALL" or s["service_type"] == target_svc:
                red_potential = s.get("digital_reduction_potential_minutes", 0.0)
                reduction = (s["workload_minutes"] * adoption_rate) if red_potential > 0 else (s["workload_minutes"] * (adoption_rate * 0.5))
                s["workload_minutes"] = max(0.0, s["workload_minutes"] - reduction)
                s["utilization_rate"] = round(s["workload_minutes"] / max(1.0, s["capacity_minutes"]), 3)
                diverted_minutes += reduction
                diverted_customers += int(round(s["request_count"] * adoption_rate))

        sim_workload = max(0.0, sim_workload - diverted_minutes)
        sim_visits = max(1, sim_visits - diverted_customers)
        action_description = f"Divert {int(adoption_rate*100)}% of eligible transactions for {target_svc} to digital banking channels"
        wait_relief_factor = max(0.65, 1.0 - (diverted_minutes / max(1.0, base_workload)) * 0.8)

    elif action_type in ["CUSTOMER_REDIRECTION", "BRANCH_REDIRECTION"]:
        target_branch = parameters.get("target_branch", "BR002")
        pct_redirected = float(parameters.get("pct_redirected", 0.15))

        redirected_visits = int(round(sim_visits * pct_redirected))
        redirected_workload = sim_workload * pct_redirected

        sim_workload = max(0.0, sim_workload - redirected_workload)
        sim_visits = max(1, sim_visits - redirected_visits)

        for s in sim_services:
            s["workload_minutes"] = max(0.0, s["workload_minutes"] * (1.0 - pct_redirected))
            s["utilization_rate"] = round(s["workload_minutes"] / max(1.0, s["capacity_minutes"]), 3)

        action_description = f"Redirect {int(pct_redirected*100)}% of walk-in traffic to branch {target_branch}"
        wait_relief_factor = max(0.70, 1.0 - pct_redirected * 0.9)

    else:
        # Default scenario
        action_description = f"Generic operational adjustment ({action_type})"
        wait_relief_factor = 0.95

    # 3. Compute AFTER metrics
    sim_util = round(sim_workload / max(1.0, sim_capacity), 3)
    sim_gap = round(sim_workload - sim_capacity, 1)
    sim_wait = round(base_wait * wait_relief_factor, 1)
    sim_score = max(5.0, round(base_score * max(0.6, (sim_util / max(0.01, base_util))), 1))

    # 4. Compute IMPACT metrics
    util_change = round((sim_util - base_util) * 100, 1)
    wait_reduction = round(base_wait - sim_wait, 1)
    gap_reduction = round(base_gap - sim_gap, 1)
    workload_reduction = round(base_workload - sim_workload, 1)

    return {
        "scenario_id": scenario_id,
        "branch_id": branch_id,
        "action_type": action_type,
        "action_description": action_description,
        "parameters": parameters,
        "before": {
            "total_visits": base_visits,
            "workload_minutes": round(base_workload, 1),
            "capacity_minutes": round(base_capacity, 1),
            "utilization": round(base_util, 3),
            "utilization_pct": round(base_util * 100, 1),
            "capacity_gap_minutes": round(base_gap, 1),
            "avg_wait_minutes": round(base_wait, 1),
            "branch_load_score": round(base_score, 1),
            "queue_pressure": round(base_util, 2),
        },
        "after": {
            "total_visits": sim_visits,
            "workload_minutes": round(sim_workload, 1),
            "capacity_minutes": round(sim_capacity, 1),
            "utilization": round(sim_util, 3),
            "utilization_pct": round(sim_util * 100, 1),
            "capacity_gap_minutes": round(sim_gap, 1),
            "avg_wait_minutes": round(sim_wait, 1),
            "branch_load_score": round(sim_score, 1),
            "queue_pressure": round(sim_util, 2),
        },
        "impact": {
            "workload_saved_minutes": workload_reduction,
            "utilization_change_pct": util_change,
            "wait_time_reduction_minutes": wait_reduction,
            "capacity_gap_reduced_minutes": gap_reduction,
            "estimated_operational_improvement": (
                f"Estimated operational improvement: {wait_reduction} min wait time reduction, "
                f"{abs(gap_reduction)} min capacity gap relieved"
            ),
        }
    }
