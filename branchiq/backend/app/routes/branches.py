"""
Branch routes — CRUD and real-time load.

Placeholder: endpoints are defined and typed but not yet fully implemented.
Will be wired to the database and ML services in later steps.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from app.schemas import BranchRead

router = APIRouter(prefix="/api/branches", tags=["branches"])


@router.get("/", response_model=list[BranchRead], summary="List all branches")
async def list_branches(db: Session = Depends(get_db)) -> list:
    """Returns all branches in the database."""
    # TODO: query db for branches
    return []
