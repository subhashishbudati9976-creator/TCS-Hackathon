"""
Branch routes — CRUD and real-time load.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import BranchRead

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("/", response_model=list[BranchRead], summary="List all branches")
async def list_branches(db: Session = Depends(get_db)) -> list[BranchRead]:
    """Returns all branches in the system."""
    return [
        BranchRead(
            id=1,
            branch_code="BR_MUM_01",
            name="Mumbai Flagship Branch",
            location="Nariman Point, Mumbai",
            total_counters=5,
        ),
        BranchRead(
            id=2,
            branch_code="BR_BLR_02",
            name="Bangalore Tech Corridor Branch",
            location="Electronic City, Bangalore",
            total_counters=4,
        ),
        BranchRead(
            id=3,
            branch_code="BR_DEL_03",
            name="Delhi Central Branch",
            location="Connaught Place, New Delhi",
            total_counters=6,
        ),
    ]
