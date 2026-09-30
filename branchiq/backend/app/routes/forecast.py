"""
AVENUE — Forecast Routes

Provides ML demand forecasting endpoints.
GET /api/forecast/{branch_id}
POST /api/forecast
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ml.forecast_service import forecast_service

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


class ForecastRequest(BaseModel):
    branch_id: str = Field(..., description="Branch code (e.g. BR001)")
    horizon_hours: int = Field(default=8, ge=1, le=24, description="Forecast horizon in hours (4 or 8)")
    date: Optional[str] = Field(default=None, description="Reference date YYYY-MM-DD")


@router.get(
    "/{branch_id}",
    summary="Get demand forecast for a branch",
)
async def get_branch_forecast(
    branch_id: str,
    horizon_hours: int = Query(default=8, ge=1, le=24, description="Horizon in hours (e.g. 4 or 8)"),
) -> Dict[str, Any]:
    """Returns real XGBoost demand predictions for the specified branch and horizon."""
    try:
        return forecast_service.forecast_branch(branch_id=branch_id, horizon_hours=horizon_hours)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "",
    summary="Generate demand forecast from payload",
)
async def create_forecast(req: ForecastRequest) -> Dict[str, Any]:
    """Returns demand prediction for specified branch and horizon."""
    try:
        return forecast_service.forecast_branch(
            branch_id=req.branch_id,
            horizon_hours=req.horizon_hours,
            date_str=req.date
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
