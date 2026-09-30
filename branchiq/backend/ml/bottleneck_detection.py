"""
AVENUE — Bottleneck Detection & Root-Cause Analysis Engine

Identifies service-level and branch-level operational bottlenecks using:
- Predicted demand (from XGBoost / historical profile)
- Staff skill capacity (respecting primary and secondary skill matrices)
- Service duration and workload
- Queue pressure and waiting time estimation
- Transparent root-cause attribution based on actual metrics
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from app.services.data_analysis import data_service
from app.services.capacity_engine import CapacityEngine
from ml.forecast_service import forecast_service


def detect_bottlenecks(branch_id: Optional[str] = None) -> List[Dict[str, Any]]:
    """
    Detect service-level bottlenecks for a branch (or all branches).
    Returns list of structured bottleneck items with root-cause attribution.
    """
    branches_to_check = [branch_id] if branch_id else data_service.branches["branch_id"].unique().tolist()
    all_bottlenecks = []

    for b_id in branches_to_check:
        try:
            # 1. Get branch capacity data
            cap_data = data_service.get_branch_capacity(b_id)
            services_data = cap_data.get("service_capacity_breakdown", [])
            load_breakdown = cap_data.get("branch_load_score", {})
            
            # 2. Get forecast demand
            try:
                fc = forecast_service.forecast_branch(b_id, horizon_hours=8)
                peak_forecast = fc.get("peak_demand", 0)
                fc_points = fc.get("forecast", [])
            except Exception:
                peak_forecast = 0
                fc_points = []

            # 3. Check visits for historical wait times and abandonment by service
            visits_df = data_service.visits
            b_visits = visits_df[visits_df["branch_id"] == b_id]
            svc_stats = b_visits.groupby("service_type").agg(
                avg_wait=("waiting_time", "mean"),
                p90_wait=("waiting_time", lambda s: np.percentile(s, 90) if len(s) > 0 else 0),
                abandoned=("completion_status", lambda s: (s == "Abandoned").sum()),
                total=("visit_id", "count")
            ).reset_index().set_index("service_type").to_dict(orient="index")

            # 4. Check digital opportunities
            digital_meta = data_service.services.set_index("service_type")["digital_available"].to_dict()

            # Find peak forecast hour
            peak_point = max(fc_points, key=lambda p: p.get("predicted_demand", 0)) if fc_points else None
            peak_hour_str = f"{peak_point['hour']}:00 - {peak_point['hour']+1}:00" if peak_point else "11:00 - 12:00"
            peak_total_demand = peak_point.get("predicted_demand", 25) if peak_point else 25
            peak_service_breakdown = peak_point.get("service_breakdown", {}) if peak_point else {}

            for s in services_data:
                svc_name = s.get("service_type")
                assigned_staff = max(0.5, float(s.get("assigned_staff_count", 1.0)))
                avg_duration = float(s.get("avg_duration_minutes", 10.0))
                req_skill = s.get("required_skill", "General")

                # Hourly capacity in a 1-hour peak slot (60 min per staff member)
                hourly_capacity_minutes = assigned_staff * 60.0
                hourly_capacity_customers = max(1, int(round(hourly_capacity_minutes / avg_duration)))

                # Demand for this service in peak hour
                predicted_peak_demand = peak_service_breakdown.get(svc_name, max(1, int(round(peak_total_demand * 0.08))))
                hourly_workload_minutes = predicted_peak_demand * avg_duration

                # Peak hourly utilization
                util = round(hourly_workload_minutes / hourly_capacity_minutes, 3)
                gap_minutes = round(hourly_workload_minutes - hourly_capacity_minutes, 1)
                capacity_gap_customers = max(0, int(round(gap_minutes / avg_duration))) if gap_minutes > 0 else 0

                # Determine severity
                if util >= 1.0:
                    severity = "CRITICAL"
                elif util >= 0.85:
                    severity = "HIGH"
                elif util >= 0.70:
                    severity = "MODERATE"
                else:
                    severity = "LOW"

                # Wait time estimation
                stat = svc_stats.get(svc_name, {})
                base_wait = stat.get("avg_wait", 12.0)
                est_wait = round(base_wait * max(0.8, (1.0 + max(0.0, util - 0.7) * 1.5)), 1)
                queue_pressure = round(util, 2)

                # Root Cause Analysis: identify real supported contributors
                root_causes = []
                if util > 1.0:
                    root_causes.append(f"Workload exceeds maximum capacity by {abs(gap_minutes)} minutes")
                if assigned_staff <= 1.5 and util > 0.8:
                    root_causes.append(f"Limited specialized staff ({assigned_staff:.1f} staff in '{req_skill}' area)")
                if avg_duration >= 20.0:
                    root_causes.append(f"High transaction duration ({avg_duration:.1f} min avg service time)")
                if digital_meta.get(svc_name, False):
                    root_causes.append("Significant digital diversion candidate (service is fully available online)")
                if stat.get("abandoned", 0) > 20:
                    root_causes.append(f"Elevated customer abandonment observed ({stat.get('abandoned')} historical dropouts)")
                if load_breakdown.get("risk_level") in ["Severe", "Elevated"]:
                    root_causes.append(f"Overall branch congestion (Load score: {load_breakdown.get('overall_load_score', 0):.1f}/100)")
                if not root_causes:
                    root_causes.append("Demand within standard operational thresholds")

                bottleneck_item = {
                    "branch_id": b_id,
                    "service": svc_name,
                    "time": peak_hour_str,
                    "predicted_demand": predicted_peak_demand,
                    "capacity": hourly_capacity_customers,
                    "utilization": round(util, 3),
                    "capacity_gap": capacity_gap_customers,
                    "capacity_gap_minutes": gap_minutes,
                    "workload_minutes": round(hourly_workload_minutes, 1),
                    "severity": severity,
                    "queue_pressure": queue_pressure,
                    "estimated_wait_minutes": est_wait,
                    "required_skill": req_skill,
                    "assigned_staff": round(assigned_staff, 1),
                    "root_causes": root_causes,
                }
                all_bottlenecks.append(bottleneck_item)

        except Exception as e:
            print(f"Error computing bottlenecks for {b_id}: {e}")

    # Sort bottlenecks by severity: CRITICAL first, then HIGH, MODERATE, LOW
    severity_rank = {"CRITICAL": 0, "HIGH": 1, "MODERATE": 2, "LOW": 3}
    all_bottlenecks.sort(key=lambda x: (severity_rank.get(x["severity"], 9), -x["utilization"]))

    return all_bottlenecks
