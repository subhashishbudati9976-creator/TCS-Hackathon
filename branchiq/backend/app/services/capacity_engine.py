"""
AVENUE — Capacity & Workload Calculation Engine

Provides reusable, explainable operational capacity calculations:
- Service workload (minutes)
- Staff capacity by skill matrix (minutes)
- Capacity utilization and capacity gap
- Skill-based bottleneck severity indicator
- Transparent, multi-factor Branch Load Score with explainable components
"""

from __future__ import annotations

from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional
import numpy as np


@dataclass
class ServiceDemandInput:
    service_type: str
    request_count: int
    avg_duration_minutes: float
    required_skill: str
    complexity_level: str
    digital_available: bool = False


@dataclass
class StaffSkillInput:
    staff_id: str
    branch_id: str
    primary_skill: str
    secondary_skills: List[str]
    availability_rate: float = 0.95
    is_active: bool = True
    shift_hours: float = 7.0  # standard 09:30 - 16:30


@dataclass
class ServiceCapacityResult:
    service_type: str
    required_skill: str
    request_count: int
    avg_duration_minutes: float
    workload_minutes: float
    assigned_staff_count: float
    capacity_minutes: float
    utilization_rate: float
    capacity_gap_minutes: float
    bottleneck_severity: str  # Normal | Moderate | High | Critical
    digital_reduction_potential_minutes: float


@dataclass
class BranchLoadBreakdown:
    branch_id: str
    overall_load_score: float  # 0 to 100
    utilization_score: float   # 0 to 100 (35% weight)
    wait_time_score: float     # 0 to 100 (25% weight)
    queue_pressure_score: float# 0 to 100 (20% weight)
    complexity_score: float    # 0 to 100 (10% weight)
    appointment_score: float   # 0 to 100 (10% weight)
    total_workload_minutes: float
    total_capacity_minutes: float
    net_capacity_gap_minutes: float
    overall_utilization: float
    avg_waiting_time: float
    total_visits: int
    active_counters: int
    risk_level: str            # Low | Moderate | Elevated | Severe
    component_weights: Dict[str, float] = field(default_factory=lambda: {
        "utilization": 0.35,
        "waiting_time": 0.25,
        "queue_pressure": 0.20,
        "complexity": 0.10,
        "appointment_ratio": 0.10,
    })


class CapacityEngine:
    """
    Reusable Capacity Engine.
    Handles skill constraints, shift hours, and multi-factor load scoring.
    """

    DEFAULT_SERVICE_DURATIONS: Dict[str, float] = {
        "Cash Withdrawal": 4.5,
        "Cash Deposit": 6.5,
        "Account Opening": 24.0,
        "KYC Update": 13.5,
        "Address Update": 8.0,
        "Cheque Services": 6.0,
        "Loan Enquiry": 18.0,
        "Loan Application": 34.0,
        "Credit Card Service": 12.0,
        "Investment Enquiry": 26.0,
        "Complaint": 16.5,
        "General Customer Support": 10.0,
        "Statement Request": 5.0,
        "Digital Banking Support": 12.5,
    }

    SKILL_MAPPING: Dict[str, str] = {
        "Cash Withdrawal": "Cash",
        "Cash Deposit": "Cash",
        "Cheque Services": "Cash",
        "KYC Update": "KYC",
        "Address Update": "KYC",
        "Account Opening": "Account Services",
        "Statement Request": "Account Services",
        "Digital Banking Support": "Account Services",
        "Loan Enquiry": "Loans",
        "Loan Application": "Loans",
        "Credit Card Service": "Credit Cards",
        "Investment Enquiry": "General Banking",
        "Complaint": "Customer Support",
        "General Customer Support": "Customer Support",
    }

    COMPLEXITY_MAP: Dict[str, str] = {
        "Account Opening": "High",
        "Loan Application": "High",
        "Investment Enquiry": "High",
        "KYC Update": "Medium",
        "Loan Enquiry": "Medium",
        "Credit Card Service": "Medium",
        "Complaint": "Medium",
        "Digital Banking Support": "Medium",
        "Cash Withdrawal": "Low",
        "Cash Deposit": "Low",
        "Address Update": "Low",
        "Cheque Services": "Low",
        "General Customer Support": "Low",
        "Statement Request": "Low",
    }

    @staticmethod
    def calculate_service_workload(request_count: int, avg_duration_minutes: float) -> float:
        """workload_minutes = request_count * avg_duration_minutes"""
        if request_count <= 0 or avg_duration_minutes <= 0:
            return 0.0
        return round(float(request_count * avg_duration_minutes), 2)

    @staticmethod
    def calculate_staff_capacity(
        available_staff_count: float,
        available_minutes_per_staff: float = 420.0,  # 7 operating hours
    ) -> float:
        """staff_capacity_minutes = available_staff * available_minutes"""
        if available_staff_count <= 0 or available_minutes_per_staff <= 0:
            return 0.0
        return round(float(available_staff_count * available_minutes_per_staff), 2)

    @staticmethod
    def calculate_utilization(workload_minutes: float, capacity_minutes: float) -> float:
        """Safeguarded capacity utilization."""
        if capacity_minutes <= 0.0:
            return 9.99 if workload_minutes > 0.0 else 0.0
        return round(float(workload_minutes / capacity_minutes), 3)

    @staticmethod
    def determine_bottleneck_severity(utilization: float, avg_wait: float = 0.0) -> str:
        """Classify bottleneck severity transparently."""
        if utilization >= 1.25 or avg_wait >= 35.0:
            return "Critical"
        if utilization >= 1.00 or avg_wait >= 25.0:
            return "High"
        if utilization >= 0.80 or avg_wait >= 15.0:
            return "Moderate"
        return "Normal"

    @classmethod
    def evaluate_service_capacities(
        cls,
        demand_items: List[ServiceDemandInput],
        staff_pool: List[StaffSkillInput],
        window_minutes: float = 420.0,
    ) -> List[ServiceCapacityResult]:
        """
        Calculates service-specific workload vs skilled staff capacity.
        Skill mapping:
        - Primary skill contributes 1.0 capacity unit
        - Secondary skill contributes 0.5 capacity unit if needed
        """
        # Calculate available staff weight per skill
        skill_capacity_units: Dict[str, float] = {}
        for st in staff_pool:
            if not st.is_active:
                continue
            effective_avail = st.availability_rate
            prim = st.primary_skill
            skill_capacity_units[prim] = skill_capacity_units.get(prim, 0.0) + (1.0 * effective_avail)
            for sec in st.secondary_skills:
                if sec != prim:
                    skill_capacity_units[sec] = skill_capacity_units.get(sec, 0.0) + (0.4 * effective_avail)

        results = []
        for d in demand_items:
            req_skill = d.required_skill or cls.SKILL_MAPPING.get(d.service_type, "General Banking")
            assigned_staff_units = round(skill_capacity_units.get(req_skill, 0.5), 2)

            workload = cls.calculate_service_workload(d.request_count, d.avg_duration_minutes)
            capacity = cls.calculate_staff_capacity(assigned_staff_units, window_minutes)
            utilization = cls.calculate_utilization(workload, capacity)
            gap = round(workload - capacity, 2)
            severity = cls.determine_bottleneck_severity(utilization)

            digital_potential = 0.0
            if d.digital_available:
                # Up to 40% of digital-eligible requests could realistically be shifted
                digital_potential = round(workload * 0.40, 2)

            results.append(
                ServiceCapacityResult(
                    service_type=d.service_type,
                    required_skill=req_skill,
                    request_count=d.request_count,
                    avg_duration_minutes=d.avg_duration_minutes,
                    workload_minutes=workload,
                    assigned_staff_count=assigned_staff_units,
                    capacity_minutes=capacity,
                    utilization_rate=utilization,
                    capacity_gap_minutes=gap,
                    bottleneck_severity=severity,
                    digital_reduction_potential_minutes=digital_potential,
                )
            )

        return results

    @classmethod
    def calculate_branch_load_score(
        cls,
        branch_id: str,
        total_visits: int,
        total_workload_minutes: float,
        total_capacity_minutes: float,
        avg_waiting_time: float,
        active_counters: int,
        appointment_count: int = 0,
        high_complexity_visits: int = 0,
    ) -> BranchLoadBreakdown:
        """
        Explainable, transparent Branch Load Score calculation.
        Weights:
        - 35% Capacity Utilization
        - 25% Waiting Time (SLA target: 15 mins)
        - 20% Queue Pressure (Visits per active counter)
        - 10% Service Complexity Mix (ratio of high complexity requests)
        - 10% Appointment Concentration
        """
        utilization = cls.calculate_utilization(total_workload_minutes, total_capacity_minutes)
        net_gap = round(total_workload_minutes - total_capacity_minutes, 2)

        # 1. Utilization score (0 - 100): 1.0 utilization -> 75 score; 1.33+ -> 100
        u_score = min(100.0, max(0.0, utilization * 75.0))

        # 2. Wait time score (0 - 100): 15 mins SLA -> 50 score; 30+ mins -> 100
        w_score = min(100.0, max(0.0, (avg_waiting_time / 15.0) * 50.0))

        # 3. Queue pressure score (Visits per active counter per day):
        # Target: ~20 visits/counter/day = 50 score; 40+ visits/counter = 100 score
        visits_per_counter = (total_visits / max(1, active_counters))
        q_score = min(100.0, max(0.0, (visits_per_counter / 20.0) * 50.0))

        # 4. Complexity score (% of high complexity visits):
        # Normal mix is ~20% high complexity. 40%+ high complexity -> 100 score
        comp_ratio = (high_complexity_visits / max(1, total_visits))
        c_score = min(100.0, max(0.0, (comp_ratio / 0.35) * 100.0))

        # 5. Appointment ratio score (Concentration of scheduled vs walk-in):
        # High appointment volume adds committed pre-allocated workload
        app_ratio = (appointment_count / max(1, total_visits))
        a_score = min(100.0, max(0.0, (app_ratio / 0.25) * 100.0))

        # Composite score
        overall = round(
            0.35 * u_score +
            0.25 * w_score +
            0.20 * q_score +
            0.10 * c_score +
            0.10 * a_score,
            2
        )

        if overall >= 80.0:
            risk = "Severe"
        elif overall >= 65.0:
            risk = "Elevated"
        elif overall >= 45.0:
            risk = "Moderate"
        else:
            risk = "Low"

        return BranchLoadBreakdown(
            branch_id=branch_id,
            overall_load_score=overall,
            utilization_score=round(u_score, 2),
            wait_time_score=round(w_score, 2),
            queue_pressure_score=round(q_score, 2),
            complexity_score=round(c_score, 2),
            appointment_score=round(a_score, 2),
            total_workload_minutes=round(total_workload_minutes, 2),
            total_capacity_minutes=round(total_capacity_minutes, 2),
            net_capacity_gap_minutes=net_gap,
            overall_utilization=utilization,
            avg_waiting_time=round(avg_waiting_time, 2),
            total_visits=total_visits,
            active_counters=active_counters,
            risk_level=risk,
        )
