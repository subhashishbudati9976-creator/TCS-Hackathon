"""
Feedback NLP and customer appointment routes.
"""

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.schemas import (
    FeedbackRequest,
    FeedbackAnalysis,
    AppointmentCreate,
    AppointmentRead,
)
from app.services import branch_service

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


@router.post(
    "/analyze",
    summary="Analyze customer feedback sentiment and save entry",
)
async def analyze_and_submit_feedback(request: FeedbackRequest, db: Session = Depends(get_db)):
    """Analyzes customer feedback text, scores sentiment, and stores review."""
    return branch_service.submit_feedback_service(db, request)


@router.get(
    "/",
    summary="Get recent customer feedback",
)
async def list_feedback(
    branch_code: str = Query(default="ALL", description="Branch code filter or ALL"),
    db: Session = Depends(get_db),
):
    """Returns recent customer reviews and NLP sentiment classifications."""
    return branch_service.get_all_feedback(db, branch_code)


@router.post(
    "/appointments",
    response_model=AppointmentRead,
    summary="Book customer appointment with dynamic queue token",
)
async def book_appointment(req: AppointmentCreate, db: Session = Depends(get_db)):
    """Creates a guaranteed appointment slot with an assigned token number."""
    return branch_service.book_appointment_service(db, req)


@router.get(
    "/appointments",
    response_model=list[AppointmentRead],
    summary="Get scheduled appointments",
)
async def list_appointments(
    branch_code: str = Query(default="ALL", description="Branch code filter or ALL"),
    db: Session = Depends(get_db),
):
    """Returns upcoming customer appointments."""
    return branch_service.get_appointments(db, branch_code)
