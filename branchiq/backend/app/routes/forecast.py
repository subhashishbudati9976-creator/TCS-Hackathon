"""
Forecast routes — demand prediction and queue trend endpoints.
"""

from fastapi import APIRouter
from app.schemas.schemas import ForecastPoint, QueueTrendPoint
from ml.demand_forecasting import forecast_branch_demand, get_hourly_queue_trend

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.get(
    "/{branch_id}",
    response_model=list[ForecastPoint],
    summary="Get demand forecast for a branch",
)
async def get_branch_forecast(branch_id: str):
    """Returns predicted customer demand and wait times for the day."""
    return forecast_branch_demand(branch_id)


@router.get(
    "/{branch_id}/queue-trend",
    response_model=list[QueueTrendPoint],
    summary="Get hourly queue and service throughput trend",
)
async def get_queue_trend(branch_id: str):
    """Returns hourly queue backlog and throughput metrics."""
    return get_hourly_queue_trend(branch_id)
