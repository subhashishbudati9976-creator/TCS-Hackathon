"""
AVENUE — Operational Recommendation Engine

Generates grounded, actionable operational interventions based on:
1. Staff Reassignment: Cross-skilling rules, secondary skill match, capacity surplus in donor service.
2. Digital Diversion: Eligible digital services with high walk-in volume.
3. Customer Redirection: Alternate branches with lower utilization.
4. Appointment Preparation: High complexity services (Loans, Accounts) with missing prep.
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import pandas as pd

from app.services.data_analysis import data_service
from ml.bottleneck_detection import detect_bottlenecks


def generate_recommendations(branch_id: str) -> List[Dict[str, Any]]:
    """
    Generate contextual operational recommendations for a branch.
    """
    # 1. Fetch bottlenecks for this branch
    bottlenecks = detect_bottlenecks(branch_id)
    high_pressure = [b for b in bottlenecks if b["severity"] in ["CRITICAL", "HIGH", "MODERATE"]]
    top_pressure = bottlenecks[:3] if not high_pressure else high_pressure

    recommendations = []
    rec_counter = 1

    # Staff skills at this branch
    staff_df = data_service.staff
    b_staff = staff_df[staff_df["branch_id"] == branch_id]
    
    # Branch capacity breakdown
    cap_data = data_service.get_branch_capacity(branch_id)
    svc_cap = {s["service_type"]: s for s in cap_data.get("service_capacity_breakdown", [])}
    services_df = data_service.services.set_index("service_type")

    # ── Action A: Staff Reassignment ──────────────────────────────────────────
    # Look for highest utilized service that needs help
    if top_pressure:
        target_bottleneck = top_pressure[0]
        target_svc = target_bottleneck["service"]
        target_skill = target_bottleneck["required_skill"]

        # Find donor service with lowest utilization (< 40%) that has staff with target skill as secondary
        donor_candidates = sorted(
            [s for s in svc_cap.values() if s["service_type"] != target_svc and s["utilization_rate"] < 0.5],
            key=lambda x: x["utilization_rate"]
        )

        donor_found = None
        donor_staff_id = None
        for cand in donor_candidates:
            cand_svc = cand["service_type"]
            cand_skill = cand["required_skill"]
            # Check if any staff member in branch has cand_skill as primary AND target_skill in secondary
            for _, st in b_staff.iterrows():
                sec_skills = str(st.get("secondary_skills", "")).split(";")
                sec_skills = [s.strip() for s in sec_skills]
                if st.get("primary_skill") == cand_skill and target_skill in sec_skills:
                    donor_found = cand_svc
                    donor_staff_id = st.get("staff_id")
                    break
            if donor_found:
                break

        if donor_found:
            recommendations.append({
                "id": f"REC_{branch_id}_{rec_counter:03d}",
                "branch_id": branch_id,
                "type": "STAFF_REASSIGNMENT",
                "action_type": "STAFF_REASSIGNMENT",
                "priority": "HIGH" if target_bottleneck["severity"] in ["CRITICAL", "HIGH"] else "MEDIUM",
                "action": f"Reassign 1 cross-trained staff member from {donor_found} to {target_svc}",
                "reason": f"Projected utilization for {target_svc} is {int(target_bottleneck['utilization']*100)}%, while {donor_found} is operating at {int(svc_cap[donor_found]['utilization_rate']*100)}% capacity.",
                "affected_service": target_svc,
                "donor_service": donor_found,
                "staff_count": 1,
                "expected_operational_effect": "Balances queue pressure and reduces target wait times by an estimated 20-30%.",
                "simulatable": True,
                "simulation_params": {
                    "action_type": "STAFF_REASSIGNMENT",
                    "from_service": donor_found,
                    "to_service": target_svc,
                    "staff_count": 1,
                }
            })
            rec_counter += 1
        else:
            # Fallback staff recommendation: generic cross-skilling support
            recommendations.append({
                "id": f"REC_{branch_id}_{rec_counter:03d}",
                "branch_id": branch_id,
                "type": "STAFF_REASSIGNMENT",
                "action_type": "STAFF_REASSIGNMENT",
                "priority": "MEDIUM",
                "action": f"Activate secondary counter for {target_svc} during peak hours",
                "reason": f"Peak demand for {target_svc} approaches operational threshold ({target_bottleneck['predicted_demand']} peak arrivals).",
                "affected_service": target_svc,
                "donor_service": "Cash",
                "staff_count": 1,
                "expected_operational_effect": "Absorbs peak arrival surges during mid-day rush.",
                "simulatable": True,
                "simulation_params": {
                    "action_type": "STAFF_REASSIGNMENT",
                    "from_service": "Cash Withdrawal",
                    "to_service": target_svc,
                    "staff_count": 1,
                }
            })
            rec_counter += 1

    # ── Action B: Digital Diversion ───────────────────────────────────────────
    # Look for digitally eligible services with notable volume
    workload_data = data_service.get_branch_workload(branch_id)
    dig_opp = workload_data.get("digital_diversion_opportunity", {})
    if dig_opp and dig_opp.get("digital_eligible_visits", 0) > 0:
        eligible_svcs = [
            s["service_type"] for s in cap_data.get("service_capacity_breakdown", [])
            if s.get("digital_reduction_potential_minutes", 0) > 0
        ]
        target_dig_svc = eligible_svcs[0] if eligible_svcs else "Statement Request"
        recommendations.append({
            "id": f"REC_{branch_id}_{rec_counter:03d}",
            "branch_id": branch_id,
            "type": "DIGITAL_DIVERSION",
            "action_type": "DIGITAL_DIVERSION",
            "priority": "HIGH",
            "action": f"Deploy digital kiosk assistant and SMS link guidance for {target_dig_svc}",
            "reason": f"Approximately {dig_opp.get('potential_diverted_visits', 0):,} visits could be completed digitally, potentially saving {dig_opp.get('potential_staff_hours_saved', 0):.1f} staff hours.",
            "affected_service": target_dig_svc,
            "expected_operational_effect": f"Could reduce branch workload by up to {dig_opp.get('pct_workload_reducible', 0):.1f}%.",
            "simulatable": True,
            "simulation_params": {
                "action_type": "DIGITAL_DIVERSION",
                "target_service": target_dig_svc,
                "adoption_rate": 0.25,
            }
        })
        rec_counter += 1

    # ── Action C: Customer Redirection ────────────────────────────────────────
    # Find a nearby branch with lower load score
    all_branches = data_service.get_all_branches()
    current_b = next((b for b in all_branches if b["branch_id"] == branch_id), None)
    current_wait = current_b.get("avg_wait_minutes", 15.0) if current_b else 15.0
    
    # Potential target branches with significantly lower wait times
    alt_branches = [
        b for b in all_branches 
        if b["branch_id"] != branch_id and b.get("avg_wait_minutes", 15.0) < (current_wait - 2.0)
    ]
    if alt_branches:
        best_alt = min(alt_branches, key=lambda x: x.get("avg_wait_minutes", 15.0))
        recommendations.append({
            "id": f"REC_{branch_id}_{rec_counter:03d}",
            "branch_id": branch_id,
            "type": "CUSTOMER_REDIRECTION",
            "action_type": "CUSTOMER_REDIRECTION",
            "priority": "MEDIUM",
            "action": f"Direct flexible walk-in customers to {best_alt['branch_name']} ({best_alt['branch_id']})",
            "reason": f"{best_alt['branch_name']} currently has a shorter average wait time ({best_alt.get('avg_wait_minutes', 15.0):.1f} min vs {current_wait:.1f} min).",
            "affected_service": "General Walk-ins",
            "target_branch": best_alt["branch_id"],
            "expected_operational_effect": "Distributes arrival surges across the regional branch network.",
            "simulatable": True,
            "simulation_params": {
                "action_type": "CUSTOMER_REDIRECTION",
                "target_branch": best_alt["branch_id"],
                "pct_redirected": 0.15,
            }
        })
        rec_counter += 1

    # ── Action D: Appointment Preparation ────────────────────────────────────
    recommendations.append({
        "id": f"REC_{branch_id}_{rec_counter:03d}",
        "branch_id": branch_id,
        "type": "APPOINTMENT_PREPARATION",
        "action_type": "APPOINTMENT_PREPARATION",
        "priority": "LOW",
        "action": "Send automated SMS checklist of required documents 2 hours before appointments",
        "reason": "Missing documents for complex services (Loans, KYC) increase counter handling time by up to 35%.",
        "affected_service": "Loan Application & KYC",
        "expected_operational_effect": "Improves first-time completion rate and shortens consultation duration.",
        "simulatable": False,
    })

    return recommendations
