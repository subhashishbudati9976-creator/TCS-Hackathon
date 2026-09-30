"""
Feedback NLP routes.

Placeholder: route is registered but NLP analysis is not yet implemented.
"""

from fastapi import APIRouter

from app.schemas import FeedbackRequest, FeedbackAnalysis

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post(
    "/analyze",
    response_model=FeedbackAnalysis,
    summary="Analyze customer feedback sentiment",
)
async def analyze_feedback(request: FeedbackRequest) -> dict:
    """
    Analyzes customer feedback text and returns sentiment.
    NOT YET IMPLEMENTED — NLP pipeline will be wired here in a later step.
    """
    return {
        "feedback_id": "not_implemented",
        "text": request.text,
        "sentiment": "neutral",
        "score": 0.0,
    }
