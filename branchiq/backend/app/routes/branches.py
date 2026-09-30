"""
AVENUE — Branch API Routes

Fully wired endpoints consuming DataAnalysisService, ML demand forecast,
bottleneck detection, and recommendation engine.

GET /api/branches                          → list all branches + summary stats
GET /api/branches/{branch_id}/summary      → comprehensive single-branch summary
GET /api/branches/{branch_id}/capacity     → service-level capacity & load score
GET /api/branches/{branch_id}/workload     → workload breakdown + digital opportunity
GET /api/branches/{branch_id}/waiting-times → waiting time distributions
GET /api/branches/{branch_id}/forecast     → ML demand forecast (4-8 hours)
GET /api/branches/{branch_id}/bottlenecks  → detected service bottlenecks & root causes
GET /api/branches/{branch_id}/recommendations → operational recommendations
GET /api/branches/{branch_id}/intelligence → bundled complete intelligence package
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query

from app.services.data_analysis import data_service
from ml.forecast_service import forecast_service
from ml.bottleneck_detection import detect_bottlenecks
from ml.recommendation_engine import generate_recommendations
from ml.feedback_nlp import get_feedback_analysis

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("", summary="List all branches with summary operational stats")
@router.get("/", summary="List all branches with summary operational stats (trailing slash)")
async def list_branches():
    """Returns all branches with visit counts, average wait times, and abandonment rates."""
    try:
        return data_service.get_all_branches()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{branch_id}/summary", summary="Comprehensive single-branch operational summary")
async def get_branch_summary(branch_id: str):
    """Returns detailed metrics: visits, staff, waiting times, feedback, and load score."""
    try:
        return data_service.get_branch_summary(branch_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{branch_id}/capacity", summary="Service-level capacity, workload, and branch load score")
async def get_branch_capacity(branch_id: str):
    """
    Returns per-service: demand, workload minutes, staff skill capacity,
    utilization rate, capacity gap, and bottleneck severity.
    Also returns the overall multi-factor Branch Load Score (0-100) with risk level.
    """
    try:
        return data_service.get_branch_capacity(branch_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{branch_id}/workload", summary="Service workload breakdown and digital diversion opportunity")
async def get_branch_workload(branch_id: str):
    """
    Returns:
    - Workload breakdown per service (total duration, avg duration, share)
    - Hourly workload profile (arrivals, workload, wait time by hour)
    - Digital diversion opportunity estimate
    """
    try:
        return data_service.get_branch_workload(branch_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{branch_id}/waiting-times", summary="Detailed waiting time statistics and distributions")
async def get_branch_waiting_times(branch_id: str):
    """
    Returns:
    - Overall mean, median, P75, P90, P95, max waiting times
    - Waiting time by service category
    - Waiting time by hour (peak hour identification)
    - Appointment vs Walk-in channel comparison
    """
    try:
        return data_service.get_branch_waiting_times(branch_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{branch_id}/forecast", summary="Get 4-8 hour demand forecast for branch")
async def get_branch_forecast(
    branch_id: str,
    horizon_hours: int = Query(default=8, ge=1, le=24, description="Forecast horizon in hours (4 or 8)")
):
    """Returns real XGBoost demand forecast for the branch."""
    try:
        return forecast_service.forecast_branch(branch_id=branch_id, horizon_hours=horizon_hours)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{branch_id}/bottlenecks", summary="Get detected service-level bottlenecks for branch")
async def get_branch_bottlenecks(branch_id: str):
    """Returns detected service bottlenecks and root causes for the branch."""
    try:
        return detect_bottlenecks(branch_id=branch_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{branch_id}/recommendations", summary="Get operational recommendations for branch")
async def get_branch_recommendations(branch_id: str):
    """Returns actionable operational interventions for the branch."""
    try:
        return generate_recommendations(branch_id=branch_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/{branch_id}/intelligence", summary="Comprehensive bundled branch intelligence")
async def get_branch_intelligence(branch_id: str):
    """
    Bundled single-roundtrip endpoint returning summary, capacity, workload,
    forecast, bottlenecks, recommendations, and customer sentiment for a branch.
    """
    try:
        summary = data_service.get_branch_summary(branch_id)
        capacity = data_service.get_branch_capacity(branch_id)
        workload = data_service.get_branch_workload(branch_id)
        forecast = forecast_service.forecast_branch(branch_id=branch_id, horizon_hours=8)
        bottlenecks = detect_bottlenecks(branch_id=branch_id)
        recommendations = generate_recommendations(branch_id=branch_id)
        feedback = get_feedback_analysis(branch_id=branch_id)

        return {
            "branch_id": branch_id,
            "summary": summary,
            "capacity": capacity,
            "workload": workload,
            "forecast": forecast,
            "bottlenecks": bottlenecks,
            "recommendations": recommendations,
            "feedback": feedback,
        }
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
