"""
AVENUE — Feature Engineering for Demand Forecasting

Builds a chronologically safe hourly demand dataset from Phase 1 data.

LEAKAGE PREVENTION:
- Only lag/rolling features computed from data PRIOR to each prediction window.
- All lags are shifted so no target-period information leaks into features.
- Calendar/appointment features are from information knowable before the forecast window.
- No future actual counts, wait times, queue lengths, or feedback used.

Outputs:
- Branch-level: (branch_id, date, hour) → customer_count + features
- Service-level: (branch_id, service_type, date, hour) → customer_count + features
"""

from __future__ import annotations

from pathlib import Path
from typing import Optional
import numpy as np
import pandas as pd


# ─── Constants ────────────────────────────────────────────────────────────────

DATA_DIR = Path(__file__).resolve().parents[3] / "data" / "processed"
BRANCH_HOURS = list(range(9, 17))  # 09:00 – 16:00 operating window

SEASONAL_MAP = {
    "Festive Season": 2,
    "Fiscal Year-End Tax Planning": 1,
    "Regular Operations": 0,
}

DOW_MAP = {
    "Monday": 0, "Tuesday": 1, "Wednesday": 2, "Thursday": 3,
    "Friday": 4, "Saturday": 5, "Sunday": 6,
}


def _resolve_data_dir() -> Path:
    """Find data/processed regardless of working directory."""
    candidates = [
        Path("data/processed"),
        Path("avenue/data/processed"),
        Path("branchiq/data/processed"),
        DATA_DIR,
    ]
    for c in candidates:
        if (c / "visits.csv").exists():
            return c.resolve()
    raise FileNotFoundError("Cannot locate data/processed/visits.csv")


def build_hourly_branch_features(data_dir: Optional[Path] = None) -> pd.DataFrame:
    """
    Constructs the hourly branch-level demand feature matrix.

    Steps:
    1. Aggregate visits into (branch_id, date, hour) → customer_count
    2. Merge calendar features
    3. Merge appointment counts (known before prediction window opens)
    4. Merge active staff count per branch per day
    5. Add temporal features
    6. Add lag features (chronologically safe - shifted by 1+ hours)
    7. Add rolling mean features (computed over historical window only)

    Returns DataFrame with columns ready for XGBoost training.
    """
    d = data_dir or _resolve_data_dir()

    visits = pd.read_csv(d / "visits.csv", parse_dates=["arrival_timestamp"])
    calendar = pd.read_csv(d / "calendar.csv", parse_dates=["date"])
    appointments = pd.read_csv(d / "appointments.csv", parse_dates=["appointment_timestamp"])
    staff = pd.read_csv(d / "staff.csv")

    # ── Step 1: Aggregate hourly customer counts ────────────────────────────
    visits["date"] = visits["arrival_timestamp"].dt.date.astype(str)
    visits["hour"] = visits["arrival_timestamp"].dt.hour

    hourly = (
        visits.groupby(["branch_id", "date", "hour"])
        .size()
        .reset_index(name="customer_count")
    )

    # Create complete grid: every branch × operating date × operating hour
    branches = visits["branch_id"].unique()
    dates = calendar[calendar["is_holiday"] == 0]["date"].dt.strftime("%Y-%m-%d").tolist()
    hours = BRANCH_HOURS

    full_grid = pd.DataFrame(
        [(b, d, h) for b in branches for d in dates for h in hours],
        columns=["branch_id", "date", "hour"],
    )
    hourly = full_grid.merge(hourly, on=["branch_id", "date", "hour"], how="left")
    hourly["customer_count"] = hourly["customer_count"].fillna(0).astype(int)

    # ── Step 2: Calendar features ───────────────────────────────────────────
    cal = calendar.copy()
    cal["date_str"] = cal["date"].dt.strftime("%Y-%m-%d")
    cal["seasonal_encoded"] = cal["seasonal_period"].map(SEASONAL_MAP).fillna(0).astype(int)
    cal["holiday_type_encoded"] = cal["holiday_type"].map(
        {"Working Day": 0, "Weekend": 1, "National": 2, "Festival": 2, "Regional": 2, "Annual": 2}
    ).fillna(0).astype(int)

    cal_cols = [
        "date_str", "is_weekend", "is_holiday", "is_salary_period",
        "is_month_start", "is_month_end", "local_event_flag",
        "event_impact_factor", "seasonal_encoded", "holiday_type_encoded",
    ]
    hourly = hourly.merge(cal[cal_cols], left_on="date", right_on="date_str", how="left")

    # Fill calendar defaults for any unmatched dates
    for col in ["is_weekend", "is_holiday", "is_salary_period", "is_month_start",
                "is_month_end", "local_event_flag"]:
        hourly[col] = hourly[col].fillna(0).astype(int)
    hourly["event_impact_factor"] = hourly["event_impact_factor"].fillna(1.0)
    hourly["seasonal_encoded"] = hourly["seasonal_encoded"].fillna(0).astype(int)
    hourly["holiday_type_encoded"] = hourly["holiday_type_encoded"].fillna(0).astype(int)

    # ── Step 3: Appointment counts (known-in-advance information) ───────────
    appointments["app_date"] = appointments["appointment_timestamp"].dt.date.astype(str)
    appointments["app_hour"] = appointments["appointment_timestamp"].dt.hour
    app_counts = (
        appointments[appointments["appointment_status"] != "Cancelled"]
        .groupby(["branch_id", "app_date", "app_hour"])
        .size()
        .reset_index(name="appointment_count")
    )
    hourly = hourly.merge(
        app_counts,
        left_on=["branch_id", "date", "hour"],
        right_on=["branch_id", "app_date", "app_hour"],
        how="left",
    )
    hourly["appointment_count"] = hourly["appointment_count"].fillna(0).astype(int)

    # ── Step 4: Staff availability per branch per day ───────────────────────
    active_staff = (
        staff[staff["status"] == "Active"]
        .groupby("branch_id")
        .size()
        .reset_index(name="staff_available")
    )
    hourly = hourly.merge(active_staff, on="branch_id", how="left")
    hourly["staff_available"] = hourly["staff_available"].fillna(0).astype(int)

    # ── Step 5: Temporal features ───────────────────────────────────────────
    hourly["date_dt"] = pd.to_datetime(hourly["date"])
    hourly["day_of_week"] = hourly["date_dt"].dt.weekday          # 0=Mon
    hourly["day_of_month"] = hourly["date_dt"].dt.day
    hourly["month"] = hourly["date_dt"].dt.month
    hourly["week_of_year"] = hourly["date_dt"].dt.isocalendar().week.astype(int)

    # Hour-of-day peak encoding (peak hours get higher ordinal)
    hourly["hour_of_day"] = hourly["hour"]
    hourly["is_peak_hour"] = hourly["hour"].isin([10, 11, 13, 15]).astype(int)

    # ── Step 6: Sort chronologically and compute lag features ───────────────
    hourly = hourly.sort_values(["branch_id", "date", "hour"]).reset_index(drop=True)

    # Lag within each branch's time-ordered series
    hourly["lag_1h"] = (
        hourly.groupby("branch_id")["customer_count"].shift(1)
    )
    hourly["lag_24h"] = (
        hourly.groupby("branch_id")["customer_count"].shift(24)
    )
    hourly["lag_same_hour_prev_week"] = (
        hourly.groupby(["branch_id", "hour"])["customer_count"].shift(7)
    )

    # ── Step 7: Rolling means (computed over past only, min_periods guarded) ─
    grp = hourly.groupby("branch_id")["customer_count"]
    hourly["rolling_mean_3h"] = (
        grp.transform(lambda s: s.shift(1).rolling(3, min_periods=1).mean())
    )
    hourly["rolling_mean_6h"] = (
        grp.transform(lambda s: s.shift(1).rolling(6, min_periods=1).mean())
    )
    hourly["rolling_mean_24h"] = (
        grp.transform(lambda s: s.shift(1).rolling(24, min_periods=1).mean())
    )
    hourly["rolling_mean_7d"] = (
        grp.transform(lambda s: s.shift(1).rolling(7 * 8, min_periods=1).mean())
    )

    # Round lag/rolling features
    for col in ["lag_1h", "lag_24h", "lag_same_hour_prev_week",
                "rolling_mean_3h", "rolling_mean_6h", "rolling_mean_24h", "rolling_mean_7d"]:
        hourly[col] = hourly[col].fillna(0).round(2)

    hourly = hourly.drop(columns=["date_str", "date_dt", "app_date", "app_hour"], errors="ignore")
    return hourly


def build_service_level_features(data_dir: Optional[Path] = None) -> pd.DataFrame:
    """
    Builds (branch_id, service_type, date, hour) → customer_count feature matrix.

    Architecture decision: single model with service_type encoded as a feature.
    Rationale: With 14 services × 10 branches × 132 days × 8 hours = ~148k potential
    rows but only ~79k actual visits, separate per-service models would be data-sparse
    for minority services (Loan Application ~5% share). A single model with service
    encoding generalises better across services.
    """
    d = data_dir or _resolve_data_dir()

    visits = pd.read_csv(d / "visits.csv", parse_dates=["arrival_timestamp"])
    services = pd.read_csv(d / "services.csv")

    visits["date"] = visits["arrival_timestamp"].dt.date.astype(str)
    visits["hour"] = visits["arrival_timestamp"].dt.hour

    svc_hourly = (
        visits.groupby(["branch_id", "service_type", "date", "hour"])
        .size()
        .reset_index(name="customer_count")
    )

    # Service metadata features
    svc_meta = services[["service_type", "average_service_time", "complexity_level", "digital_available"]].copy()
    svc_meta["complexity_encoded"] = svc_meta["complexity_level"].map({"Low": 0, "Medium": 1, "High": 2})
    svc_meta["digital_available_int"] = svc_meta["digital_available"].astype(int)

    svc_hourly = svc_hourly.merge(svc_meta, on="service_type", how="left")

    # Encode service_type as integer category
    svc_cats = sorted(svc_hourly["service_type"].unique())
    svc_map = {s: i for i, s in enumerate(svc_cats)}
    svc_hourly["service_type_encoded"] = svc_hourly["service_type"].map(svc_map)

    # Add temporal features
    svc_hourly["date_dt"] = pd.to_datetime(svc_hourly["date"])
    svc_hourly["day_of_week"] = svc_hourly["date_dt"].dt.weekday
    svc_hourly["month"] = svc_hourly["date_dt"].dt.month
    svc_hourly["hour_of_day"] = svc_hourly["hour"]

    # Service-specific lag (same service, 1 day ago, same hour)
    svc_hourly = svc_hourly.sort_values(["branch_id", "service_type", "date", "hour"])
    svc_hourly["lag_same_service_24h"] = (
        svc_hourly.groupby(["branch_id", "service_type", "hour"])["customer_count"].shift(1).fillna(0)
    )
    svc_hourly["rolling_mean_3d"] = (
        svc_hourly.groupby(["branch_id", "service_type", "hour"])["customer_count"]
        .transform(lambda s: s.shift(1).rolling(3, min_periods=1).mean())
        .fillna(0)
        .round(2)
    )

    svc_hourly = svc_hourly.drop(columns=["date_dt"], errors="ignore")
    return svc_hourly, svc_map


BRANCH_FEATURE_COLS = [
    "hour_of_day", "day_of_week", "day_of_month", "month", "week_of_year",
    "is_weekend", "is_salary_period", "is_month_start", "is_month_end",
    "local_event_flag", "event_impact_factor", "seasonal_encoded",
    "appointment_count", "staff_available", "is_peak_hour",
    "lag_1h", "lag_24h", "lag_same_hour_prev_week",
    "rolling_mean_3h", "rolling_mean_6h", "rolling_mean_24h", "rolling_mean_7d",
]

SERVICE_FEATURE_COLS = [
    "service_type_encoded", "hour_of_day", "day_of_week", "month",
    "average_service_time", "complexity_encoded", "digital_available_int",
    "lag_same_service_24h", "rolling_mean_3d",
]

TARGET_COL = "customer_count"

# Chronological split dates (based on dataset: 2025-10-01 → 2026-03-27)
TRAIN_END_DATE = "2026-02-04"   # ~70% of 132 operating days
VAL_END_DATE   = "2026-03-02"   # ~85% of 132 operating days
# TEST: 2026-03-02 → 2026-03-27 (~15%)
