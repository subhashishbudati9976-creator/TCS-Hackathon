"""
Branch routes — CRUD and real-time load.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas.schemas import BranchRead, BranchCreate, DashboardSummary
from app.services import branch_service

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("/", response_model=list[BranchRead], summary="List all branches")
async def list_branches(db: Session = Depends(get_db)):
    """Returns all branches in the database."""
    return branch_service.get_all_branches(db)


@router.get("/{branch_code}/summary", response_model=DashboardSummary, summary="Get full dashboard summary")
async def get_dashboard_summary(branch_code: str, db: Session = Depends(get_db)):
    """Returns aggregated KPIs, alerts, recommendations, and forecast for a branch."""
    return branch_service.get_dashboard_summary(db, branch_code)


@router.get("/{branch_code}", response_model=BranchRead, summary="Get branch details")
async def get_branch(branch_code: str, db: Session = Depends(get_db)):
    """Returns details for a single branch."""
    branch = branch_service.get_branch_by_code(db, branch_code)
    if not branch:
        raise HTTPException(status_code=404, detail="Branch not found")
    return branch


@router.post("/", response_model=BranchRead, summary="Create a branch")
async def create_branch(data: BranchCreate, db: Session = Depends(get_db)):
    return branch_service.create_branch(db, data)
