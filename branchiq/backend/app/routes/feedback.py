"""
AVENUE — Feedback & NLP Analysis Routes

GET /api/feedback
POST /api/feedback/analyze
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field

from ml.feedback_nlp import get_feedback_analysis, analyze_feedback

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


class FeedbackTextInput(BaseModel):
    text: str = Field(..., description="Customer feedback comment to analyze")
    feedback_id: Optional[str] = Field(default=None)


@router.get(
    "",
    summary="Get aggregated feedback NLP metrics and sentiment distributions",
)
async def get_feedback_summary(
    branch_id: Optional[str] = Query(default=None, description="Optional branch ID filter")
) -> Dict[str, Any]:
    """Returns sentiment breakdown, top complaints, service-specific sentiment, and recent feedback."""
    try:
        return get_feedback_analysis(branch_id=branch_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post(
    "/analyze",
    summary="Real-time sentiment and topic analysis for a single text comment",
)
async def analyze_single_feedback(payload: FeedbackTextInput) -> Dict[str, Any]:
    """Analyzes a customer feedback text comment and returns sentiment score and category."""
    try:
        return analyze_feedback(text=payload.text, feedback_id=payload.feedback_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
