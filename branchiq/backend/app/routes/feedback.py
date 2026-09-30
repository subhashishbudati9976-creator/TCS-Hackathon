"""
Feedback NLP routes.
Analyzes customer reviews using Gemini NLP and sentiment heuristics.
"""

from fastapi import APIRouter
from app.schemas import FeedbackRequest, FeedbackAnalysis
from app.services.gemini_client import analyze_customer_feedback_nlp

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post(
    "/analyze",
    response_model=FeedbackAnalysis,
    summary="Analyze customer feedback sentiment",
)
async def analyze_feedback(request: FeedbackRequest) -> FeedbackAnalysis:
    """
    Analyzes customer feedback text and returns sentiment and score.
    """
    result = analyze_customer_feedback_nlp(request.text)
    return FeedbackAnalysis(
        feedback_id="FB_LIVE_01",
        text=request.text,
        sentiment=result["sentiment"],
        score=result["score"],
    )
