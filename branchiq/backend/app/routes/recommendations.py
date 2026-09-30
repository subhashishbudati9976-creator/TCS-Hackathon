"""
Recommendation engine routes.
"""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import RecommendationRead, ApplyRecommendationRequest
from app.services import branch_service

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get(
    "/{branch_id}",
    response_model=list[RecommendationRead],
    summary="Get operational recommendations for a branch",
)
async def get_recommendations(branch_id: str, db: Session = Depends(get_db)):
    """Returns recommended operational actions with AI reasoning for a branch."""
    summary = branch_service.get_dashboard_summary(db, branch_id)
    return summary["recommendations"]


@router.post(
    "/apply",
    summary="Apply an operational recommendation",
)
async def apply_recommendation(
    req: ApplyRecommendationRequest,
    db: Session = Depends(get_db),
):
    """Executes the recommendation and updates branch operational metrics."""
    return branch_service.apply_recommendation_action(db, req.recommendation_id, req.branch_code)
