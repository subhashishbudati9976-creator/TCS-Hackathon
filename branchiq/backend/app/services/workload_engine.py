"""
AVENUE — Workload Engine

Detailed workload modeling by service category, time window, and customer channel.
Computes:
- Service-level workload aggregates
- Peak hour workload surges
- Channel-specific workloads (Walk-in vs Appointment)
- Shift to digital workload reduction scenarios
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
import pandas as pd


class WorkloadEngine:
    """Workload modeling and service demand distribution."""

    @staticmethod
    def compute_service_workload_breakdown(visits_df: pd.DataFrame, services_df: Optional[pd.DataFrame] = None) -> pd.DataFrame:
        """
        Calculates total visits, total service time, average duration,
        and share of overall branch workload for each service type.
        """
        grouped = visits_df.groupby("service_type").agg(
            total_requests=("visit_id", "count"),
            avg_duration=("service_duration", "mean"),
            total_duration_minutes=("service_duration", "sum"),
            avg_waiting_time=("waiting_time", "mean"),
            p90_waiting_time=("waiting_time", lambda s: s.quantile(0.90)),
            appointment_count=("appointment_flag", "sum"),
        ).reset_index()

        total_workload = grouped["total_duration_minutes"].sum()
        grouped["workload_share"] = (grouped["total_duration_minutes"] / max(1.0, total_workload)).round(4)
        grouped["avg_duration"] = grouped["avg_duration"].round(2)
        grouped["avg_waiting_time"] = grouped["avg_waiting_time"].round(2)
        grouped["p90_waiting_time"] = grouped["p90_waiting_time"].round(2)
        grouped["total_duration_minutes"] = grouped["total_duration_minutes"].round(1)

        if services_df is not None:
            merged = pd.merge(
                grouped,
                services_df[["service_type", "complexity_level", "required_skill", "digital_available", "priority_level"]],
                on="service_type",
                how="left",
            )
            return merged.sort_values(by="total_duration_minutes", ascending=False)

        return grouped.sort_values(by="total_duration_minutes", ascending=False)

    @staticmethod
    def compute_hourly_workload_profile(visits_df: pd.DataFrame) -> pd.DataFrame:
        """Computes hourly workload (minutes) and visitor arrival counts."""
        df = visits_df.copy()
        if "arrival_hour" not in df.columns:
            df["arrival_hour"] = pd.to_datetime(df["arrival_timestamp"]).dt.hour

        hourly = df.groupby("arrival_hour").agg(
            arrival_count=("visit_id", "count"),
            workload_minutes=("service_duration", "sum"),
            avg_waiting_time=("waiting_time", "mean"),
            max_waiting_time=("waiting_time", "max"),
            abandoned_count=("completion_status", lambda s: (s == "Abandoned").sum()),
        ).reset_index()

        hourly["workload_minutes"] = hourly["workload_minutes"].round(1)
        hourly["avg_waiting_time"] = hourly["avg_waiting_time"].round(2)
        hourly["max_waiting_time"] = hourly["max_waiting_time"].round(2)
        return hourly.sort_values(by="arrival_hour")

    @staticmethod
    def compute_digital_diversion_impact(visits_df: pd.DataFrame, services_df: pd.DataFrame, adoption_rate: float = 0.35) -> Dict[str, Any]:
        """
        Estimates the operational workload and waiting time relief
        if a fraction of digital-eligible services are diverted to online/mobile/ATM.
        """
        digital_services = set(services_df[services_df["digital_available"] == True]["service_type"])
        total_visits = len(visits_df)
        total_workload = float(visits_df["service_duration"].sum())

        digital_eligible_visits = visits_df[visits_df["service_type"].isin(digital_services)]
        num_eligible = len(digital_eligible_visits)
        eligible_workload = float(digital_eligible_visits["service_duration"].sum())

        diverted_visits = int(num_eligible * adoption_rate)
        saved_workload_minutes = round(eligible_workload * adoption_rate, 1)

        pct_visits_reducible = round((diverted_visits / max(1, total_visits)) * 100, 2)
        pct_workload_reducible = round((saved_workload_minutes / max(1.0, total_workload)) * 100, 2)

        return {
            "total_visits": total_visits,
            "total_workload_minutes": round(total_workload, 1),
            "digital_eligible_visits": num_eligible,
            "digital_eligible_workload_minutes": round(eligible_workload, 1),
            "target_adoption_rate": adoption_rate,
            "potential_diverted_visits": diverted_visits,
            "potential_workload_minutes_saved": saved_workload_minutes,
            "potential_staff_hours_saved": round(saved_workload_minutes / 60.0, 1),
            "pct_visits_reducible": pct_visits_reducible,
            "pct_workload_reducible": pct_workload_reducible,
        }
