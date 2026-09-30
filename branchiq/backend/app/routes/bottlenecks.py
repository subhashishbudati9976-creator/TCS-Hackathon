"""
Bottleneck detection routes.

Placeholder: route is registered but detection logic is not yet implemented.
"""

from fastapi import APIRouter

from app.schemas import BottleneckAlert

router = APIRouter(prefix="/api/bottlenecks", tags=["bottlenecks"])


@router.get(
    "/",
    response_model=list[BottleneckAlert],
    summary="Get active bottleneck alerts",
)
async def get_bottleneck_alerts() -> list:
    """
    Returns active bottleneck alerts across all branches.
    NOT YET IMPLEMENTED — detection engine will be wired here in a later step.
    """
    return []
