"""
Recommendation engine routes.
Powered by Google Gemini and intelligent operational heuristics.
"""

from fastapi import APIRouter
from app.schemas import Recommendation
from app.services.gemini_client import generate_manager_recommendation

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get(
    "/{branch_id}",
    response_model=list[Recommendation],
    summary="Get operational recommendations for a branch",
)
async def get_recommendations(branch_id: str) -> list[Recommendation]:
    """
    Returns AI-generated actionable operational recommendations for a branch.
    """
    gemini_result = generate_manager_recommendation(branch_id)
    rec_text = gemini_result.get("recommendation_text", "")

    return [
        Recommendation(
            id="REC_001",
            branch_id=branch_id,
            action_type="STAFF_REALLOCATION",
            description="Reassign Vikram Sen (Floater) to Counter 03 to relieve 35-min Cash Deposit wait queue.",
            priority="high",
        ),
        Recommendation(
            id="REC_002",
            branch_id=branch_id,
            action_type="DIGITAL_DEFLECTION",
            description="Direct passbook printing and KYC status inquiries to Self-Service Kiosks via Floor Greeter.",
            priority="medium",
        ),
        Recommendation(
            id="REC_003",
            branch_id=branch_id,
            action_type="AI_EXPLAINABLE_ADVICE",
            description=rec_text[:250] + ("..." if len(rec_text) > 250 else ""),
            priority="high",
        ),
    ]
