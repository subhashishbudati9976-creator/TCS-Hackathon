"""
Bottleneck detection routes.
"""

from datetime import datetime, timezone
from fastapi import APIRouter
from app.schemas import BottleneckAlert

router = APIRouter(prefix="/api/bottlenecks", tags=["bottlenecks"])


@router.get(
    "/",
    response_model=list[BottleneckAlert],
    summary="Get active bottleneck alerts",
)
async def get_bottleneck_alerts() -> list[BottleneckAlert]:
    """
    Returns active bottleneck alerts across banking branches.
    """
    now = datetime.now(timezone.utc).isoformat()
    return [
        BottleneckAlert(
            branch_id="BR_MUM_01",
            severity="high",
            message="Counter 01 wait time exceeded 30 mins for Cash Operations. 6 customers in queue.",
            detected_at=now,
        ),
        BottleneckAlert(
            branch_id="BR_MUM_01",
            severity="medium",
            message="Desk 02 (KYC & Account Services) staff member currently on break. Backlog forming.",
            detected_at=now,
        ),
    ]
