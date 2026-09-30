"""
AVENUE — Data Analysis Service

Loads generated datasets, processes historical metrics, and provides
fast analytical queries for the API routes and frontend dashboards.
"""

from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict, List, Optional
import numpy as np
import pandas as pd

from app.services.capacity_engine import (
    CapacityEngine,
    ServiceDemandInput,
    StaffSkillInput,
    BranchLoadBreakdown,
)
from app.services.workload_engine import WorkloadEngine


class DataAnalysisService:
    """Service for querying and analyzing AVENUE operational banking data."""

    def __init__(self, data_dir: Optional[Path] = None):
        if data_dir is None:
            # Check data/processed or branchiq/data/processed
            candidates = [
                Path("data/processed"),
                Path("branchiq/data/processed"),
                Path("../data/processed"),
                Path("../../data/processed"),
            ]
            for c in candidates:
                if (c / "branches.csv").exists():
                    self.data_dir = c.resolve()
                    break
            else:
                self.data_dir = Path("data/processed").resolve()
        else:
            self.data_dir = data_dir

        self._branches_df: Optional[pd.DataFrame] = None
        self._services_df: Optional[pd.DataFrame] = None
        self._staff_df: Optional[pd.DataFrame] = None
        self._visits_df: Optional[pd.DataFrame] = None
        self._appointments_df: Optional[pd.DataFrame] = None
        self._feedback_df: Optional[pd.DataFrame] = None
        self._calendar_df: Optional[pd.DataFrame] = None

    def _load(self, filename: str) -> pd.DataFrame:
        path = self.data_dir / filename
        if not path.exists():
            # Try alternate path
            alt = Path("branchiq/data/processed") / filename
            if alt.exists():
                return pd.read_csv(alt)
            alt_root = Path("data/processed") / filename
            if alt_root.exists():
                return pd.read_csv(alt_root)
            raise FileNotFoundError(f"Could not find {filename} in {self.data_dir} or alternates.")
        return pd.read_csv(path)

    @property
    def branches(self) -> pd.DataFrame:
        if self._branches_df is None:
            self._branches_df = self._load("branches.csv")
        return self._branches_df

    @property
    def services(self) -> pd.DataFrame:
        if self._services_df is None:
            self._services_df = self._load("services.csv")
        return self._services_df

    @property
    def staff(self) -> pd.DataFrame:
        if self._staff_df is None:
            self._staff_df = self._load("staff.csv")
        return self._staff_df

    @property
    def visits(self) -> pd.DataFrame:
        if self._visits_df is None:
            self._visits_df = self._load("visits.csv")
        return self._visits_df

    @property
    def appointments(self) -> pd.DataFrame:
        if self._appointments_df is None:
            self._appointments_df = self._load("appointments.csv")
        return self._appointments_df

    @property
    def feedback(self) -> pd.DataFrame:
        if self._feedback_df is None:
            self._feedback_df = self._load("feedback.csv")
        return self._feedback_df

    @property
    def calendar(self) -> pd.DataFrame:
        if self._calendar_df is None:
            self._calendar_df = self._load("calendar.csv")
        return self._calendar_df

    def get_all_branches(self) -> List[Dict[str, Any]]:
        """Returns list of all branches with baseline and operational overview."""
        b_df = self.branches.copy()
        v_df = self.visits
        # Group visits by branch for quick summary
        summary = v_df.groupby("branch_id").agg(
            total_visits=("visit_id", "count"),
            avg_wait_minutes=("waiting_time", "mean"),
            p90_wait_minutes=("waiting_time", lambda s: s.quantile(0.90)),
            abandonment_rate=("completion_status", lambda s: (s == "Abandoned").mean()),
        ).reset_index()

        summary["avg_wait_minutes"] = summary["avg_wait_minutes"].round(1)
        summary["p90_wait_minutes"] = summary["p90_wait_minutes"].round(1)
        summary["abandonment_rate"] = (summary["abandonment_rate"] * 100).round(2)

        merged = pd.merge(b_df, summary, on="branch_id", how="left")
        return merged.to_dict(orient="records")

    def get_branch_summary(self, branch_id: str) -> Dict[str, Any]:
        """Comprehensive operational summary for a single branch."""
        b_match = self.branches[self.branches["branch_id"] == branch_id]
        if b_match.empty:
            raise KeyError(f"Branch ID '{branch_id}' not found.")
        branch = b_match.iloc[0].to_dict()

        b_visits = self.visits[self.visits["branch_id"] == branch_id]
        b_staff = self.staff[self.staff["branch_id"] == branch_id]
        b_apps = self.appointments[self.appointments["branch_id"] == branch_id]
        b_fb = self.feedback[self.feedback["branch_id"] == branch_id]

        total_v = len(b_visits)
        avg_wait = float(b_visits["waiting_time"].mean()) if total_v > 0 else 0.0
        p90_wait = float(b_visits["waiting_time"].quantile(0.90)) if total_v > 0 else 0.0
        max_wait = float(b_visits["waiting_time"].max()) if total_v > 0 else 0.0
        abandoned_count = int((b_visits["completion_status"] == "Abandoned").sum())
        total_workload = float(b_visits["service_duration"].sum())

        avg_rating = float(b_fb["rating"].mean()) if not b_fb.empty else 0.0
        neg_sentiment_count = int((b_fb["sentiment_label"] == "Negative").sum()) if not b_fb.empty else 0

        # Run capacity evaluation
        capacity_info = self.get_branch_capacity(branch_id)

        return {
            "branch": branch,
            "metrics": {
                "total_visits": total_v,
                "total_appointments": len(b_apps),
                "total_staff": len(b_staff),
                "active_staff": int((b_staff["status"] == "Active").sum()),
                "avg_waiting_time_minutes": round(avg_wait, 2),
                "p90_waiting_time_minutes": round(p90_wait, 2),
                "max_waiting_time_minutes": round(max_wait, 2),
                "abandoned_visits": abandoned_count,
                "abandonment_rate_pct": round((abandoned_count / max(1, total_v)) * 100, 2),
                "total_workload_hours": round(total_workload / 60.0, 1),
                "customer_satisfaction_rating": round(avg_rating, 2),
                "negative_feedback_count": neg_sentiment_count,
            },
            "load_assessment": capacity_info["branch_load_score"],
        }

    def get_branch_capacity(self, branch_id: str) -> Dict[str, Any]:
        """Calculates service-specific and overall capacity & workload for branch."""
        b_match = self.branches[self.branches["branch_id"] == branch_id]
        if b_match.empty:
            raise KeyError(f"Branch ID '{branch_id}' not found.")
        branch = b_match.iloc[0]

        b_visits = self.visits[self.visits["branch_id"] == branch_id]
        b_staff = self.staff[self.staff["branch_id"] == branch_id]
        srv_df = self.services

        # Calculate average daily metrics (assuming 132 operating days in 6 months)
        num_days = 132.0

        # Construct staff inputs
        staff_pool = []
        for _, st in b_staff.iterrows():
            staff_pool.append(
                StaffSkillInput(
                    staff_id=st["staff_id"],
                    branch_id=branch_id,
                    primary_skill=st["primary_skill"],
                    secondary_skills=str(st["secondary_skills"]).split(";"),
                    availability_rate=float(st["availability"]),
                    is_active=(st["status"] == "Active"),
                )
            )

        # Build demand inputs per service (daily average)
        demand_inputs = []
        srv_counts = b_visits["service_type"].value_counts().to_dict()

        for _, s in srv_df.iterrows():
            s_name = s["service_type"]
            total_req = srv_counts.get(s_name, 0)
            daily_req = max(1, int(round(total_req / num_days)))

            demand_inputs.append(
                ServiceDemandInput(
                    service_type=s_name,
                    request_count=daily_req,
                    avg_duration_minutes=float(s["average_service_time"]),
                    required_skill=s["required_skill"],
                    complexity_level=s["complexity_level"],
                    digital_available=bool(s["digital_available"]),
                )
            )

        service_capacities = CapacityEngine.evaluate_service_capacities(
            demand_items=demand_inputs,
            staff_pool=staff_pool,
            window_minutes=420.0,
        )

        total_daily_workload = sum(c.workload_minutes for c in service_capacities)
        total_daily_capacity = sum(c.capacity_minutes for c in service_capacities)
        avg_wait = float(b_visits["waiting_time"].mean()) if not b_visits.empty else 0.0
        daily_visits = int(round(len(b_visits) / num_days))

        # Count high complexity visits
        high_complex_srvs = set(srv_df[srv_df["complexity_level"] == "High"]["service_type"])
        high_complex_count = int(b_visits[b_visits["service_type"].isin(high_complex_srvs)]["visit_id"].count() / num_days)
        daily_app_count = int(b_visits[b_visits["appointment_flag"] == 1]["visit_id"].count() / num_days)

        load_breakdown = CapacityEngine.calculate_branch_load_score(
            branch_id=branch_id,
            total_visits=daily_visits,
            total_workload_minutes=total_daily_workload,
            total_capacity_minutes=total_daily_capacity,
            avg_waiting_time=avg_wait,
            active_counters=int(branch["number_of_counters"]),
            appointment_count=daily_app_count,
            high_complexity_visits=high_complex_count,
        )

        return {
            "branch_id": branch_id,
            "branch_name": branch["branch_name"],
            "counters": int(branch["number_of_counters"]),
            "staff_headcount": len(b_staff),
            "service_capacity_breakdown": [c.__dict__ for c in service_capacities],
            "branch_load_score": load_breakdown.__dict__,
        }

    def get_branch_workload(self, branch_id: str) -> Dict[str, Any]:
        """Returns workload breakdown and digital reduction potential."""
        b_visits = self.visits[self.visits["branch_id"] == branch_id]
        if b_visits.empty:
            raise KeyError(f"Branch ID '{branch_id}' not found.")

        service_breakdown = WorkloadEngine.compute_service_workload_breakdown(b_visits, self.services)
        hourly_profile = WorkloadEngine.compute_hourly_workload_profile(b_visits)
        digital_opportunity = WorkloadEngine.compute_digital_diversion_impact(b_visits, self.services, adoption_rate=0.35)

        return {
            "branch_id": branch_id,
            "service_workload": service_breakdown.to_dict(orient="records"),
            "hourly_profile": hourly_profile.to_dict(orient="records"),
            "digital_opportunity": digital_opportunity,
        }

    def get_branch_waiting_times(self, branch_id: str) -> Dict[str, Any]:
        """Detailed waiting time statistics and percentile distributions."""
        b_visits = self.visits[self.visits["branch_id"] == branch_id].copy()
        if b_visits.empty:
            raise KeyError(f"Branch ID '{branch_id}' not found.")

        waits = b_visits["waiting_time"]
        overall_stats = {
            "mean": round(float(waits.mean()), 2),
            "median": round(float(waits.median()), 2),
            "p75": round(float(waits.quantile(0.75)), 2),
            "p90": round(float(waits.quantile(0.90)), 2),
            "p95": round(float(waits.quantile(0.95)), 2),
            "max": round(float(waits.max()), 2),
            "min": round(float(waits.min()), 2),
        }

        # By Service
        by_service = b_visits.groupby("service_type")["waiting_time"].agg(
            mean="mean",
            median="median",
            p90=lambda s: s.quantile(0.90),
            max="max",
            count="count",
        ).round(2).reset_index().to_dict(orient="records")

        # By Hour
        b_visits["arrival_hour"] = pd.to_datetime(b_visits["arrival_timestamp"]).dt.hour
        by_hour = b_visits.groupby("arrival_hour")["waiting_time"].agg(
            mean="mean",
            median="median",
            p90=lambda s: s.quantile(0.90),
            max="max",
            count="count",
        ).round(2).reset_index().to_dict(orient="records")

        # Appointment vs Walk-in comparison
        channel_comp = b_visits.groupby("channel")["waiting_time"].agg(
            mean="mean",
            median="median",
            p90=lambda s: s.quantile(0.90),
            count="count",
        ).round(2).reset_index().to_dict(orient="records")

        return {
            "branch_id": branch_id,
            "overall": overall_stats,
            "by_service": by_service,
            "by_hour": by_hour,
            "channel_comparison": channel_comp,
        }


# Singleton service instance
data_service = DataAnalysisService()
