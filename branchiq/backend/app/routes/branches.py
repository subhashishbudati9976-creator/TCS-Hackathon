"""
AVENUE — Branch API Routes

Fully wired development endpoints consuming the DataAnalysisService.

GET /api/branches                          → list all branches + summary stats
GET /api/branches/{branch_id}/summary      → comprehensive single-branch summary
GET /api/branches/{branch_id}/capacity     → service-level capacity & load score
GET /api/branches/{branch_id}/workload     → workload breakdown + digital opportunity
GET /api/branches/{branch_id}/waiting-times → waiting time distributions
"""

from __future__ import annotations

from fastapi import APIRouter, HTTPException
from app.services.data_analysis import data_service

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("/", summary="List all branches with summary operational stats")
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
