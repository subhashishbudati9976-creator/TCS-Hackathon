"""
AVENUE — Analysis & Insights API Routes

Provides system-wide operational intelligence endpoints:

GET /api/analysis/summary           → System-wide summary stats JSON
GET /api/analysis/bottleneck-features → Pre-computed bottleneck feature rows
GET /api/analysis/digital-opportunities → Digital diversion opportunity data
GET /api/analysis/feedback-summary  → Customer feedback analytics
GET /api/analysis/hourly-demand     → Aggregate hourly demand profile
GET /api/analysis/service-summary   → Service category workload stats
"""

from __future__ import annotations

import json
from pathlib import Path
from fastapi import APIRouter, HTTPException
import pandas as pd

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


def _find_analysis_dir() -> Path:
    candidates = [
        Path("data/analysis"),
        Path("branchiq/data/analysis"),
        Path("../data/analysis"),
        Path("../../data/analysis"),
    ]
    for c in candidates:
        if (c / "summary.json").exists():
            return c.resolve()
    raise FileNotFoundError("Analysis output directory not found. Run data/analyze_data.py first.")


def _load_csv(filename: str) -> list:
    d = _find_analysis_dir()
    path = d / filename
    if not path.exists():
        raise FileNotFoundError(f"Analysis file {filename} not found.")
    return pd.read_csv(path).to_dict(orient="records")


@router.get("/summary", summary="System-wide operational summary")
async def get_summary():
    """Top-level aggregated KPIs across all branches."""
    try:
        d = _find_analysis_dir()
        with open(d / "summary.json") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/bottleneck-features", summary="Pre-computed bottleneck feature rows for ML models")
async def get_bottleneck_features(branch_id: str | None = None, severity: str | None = None):
    """
    Returns branch/time-window feature rows used by the future bottleneck detection model.
    Optional filters: branch_id, severity (Normal | Moderate | High | Critical)
    """
    try:
        rows = _load_csv("bottleneck_features.csv")
        if branch_id:
            rows = [r for r in rows if r.get("branch_id") == branch_id]
        if severity:
            rows = [r for r in rows if r.get("severity_indicator") == severity]
        return rows
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/digital-opportunities", summary="Service digital redirection opportunity analysis")
async def get_digital_opportunities():
    """Services eligible for digital redirection with estimated workload savings."""
    try:
        return _load_csv("digital_service_opportunities.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/feedback-summary", summary="Customer feedback sentiment and issue category breakdown")
async def get_feedback_summary():
    """Feedback by issue category with average ratings, wait times, and sentiment distribution."""
    try:
        return _load_csv("feedback_summary.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/hourly-demand", summary="Aggregate hourly arrival and workload profile")
async def get_hourly_demand():
    """Hourly traffic volume, workload, wait times, and abandonment counts."""
    try:
        return _load_csv("hourly_demand.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/service-summary", summary="Service category workload and performance breakdown")
async def get_service_summary():
    """Per-service: total requests, avg duration, workload share, waiting time, complexity."""
    try:
        return _load_csv("service_summary.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/branch-summary", summary="All branches summary with operational metrics")
async def get_branch_summary_all():
    """Branch-by-branch summary: total visits, wait times, abandonment, workload."""
    try:
        return _load_csv("branch_summary.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/waiting-time-summary", summary="Cross-dimensional waiting time statistics")
async def get_waiting_time_summary():
    """Waiting time percentiles broken down by all-branches, appointments, walk-ins, salary periods."""
    try:
        return _load_csv("waiting_time_summary.csv")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
