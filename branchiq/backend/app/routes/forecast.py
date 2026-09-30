"""
Forecast routes — demand prediction endpoints.

Placeholder: route is registered but ML inference is not yet implemented.
"""

from fastapi import APIRouter

from app.schemas import ForecastPoint

router = APIRouter(prefix="/api/forecast", tags=["forecast"])


@router.get(
    "/{branch_id}",
    response_model=list[ForecastPoint],
    summary="Get demand forecast for a branch",
)
async def get_branch_forecast(branch_id: str) -> list:
    """
    Returns predicted customer demand for the next N hours.
    NOT YET IMPLEMENTED — ML model will be wired here in a later step.
    """
    return []
