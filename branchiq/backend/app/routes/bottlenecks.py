"""
Bottleneck detection routes.
"""

from fastapi import APIRouter, Query, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import BottleneckAlert, ServiceDemandPoint
from ml.bottleneck_detection import detect_bottlenecks, get_service_demand_distribution
from app.models.branch import Bottleneck as BottleneckModel

router = APIRouter(prefix="/api/bottlenecks", tags=["bottlenecks"])


@router.get(
    "/",
    response_model=list[BottleneckAlert],
    summary="Get active bottleneck alerts",
)
async def get_bottleneck_alerts(
    branch_code: str = Query(default="AV-CENTRAL", description="Branch code identifier"),
    db: Session = Depends(get_db),
):
    """Returns active bottleneck alerts for the given branch."""
    db_items = db.query(BottleneckModel).filter(BottleneckModel.branch_code == branch_code).all()
    if db_items:
        return db_items
    return detect_bottlenecks(branch_code)


@router.get(
    "/services",
    response_model=list[ServiceDemandPoint],
    summary="Get service demand distribution",
)
async def get_service_distribution(
    branch_code: str = Query(default="AV-CENTRAL", description="Branch code identifier"),
):
    """Returns demand breakdown and operational status per service type."""
    return get_service_demand_distribution(branch_code)
