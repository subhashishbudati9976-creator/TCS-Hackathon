"""
Recommendation engine routes.

Placeholder: route is registered but recommendation logic is not yet implemented.
"""

from fastapi import APIRouter

from app.schemas import Recommendation

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get(
    "/{branch_id}",
    response_model=list[Recommendation],
    summary="Get operational recommendations for a branch",
)
async def get_recommendations(branch_id: str) -> list:
    """
    Returns recommended operational actions for a branch.
    NOT YET IMPLEMENTED — recommendation engine will be wired here in a later step.
    """
    return []
