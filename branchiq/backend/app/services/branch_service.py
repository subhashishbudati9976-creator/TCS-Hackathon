"""
Branch service — business logic for AVENUE operations.
Connects database models with ML intelligence engines.
"""

from __future__ import annotations
from typing import Any
import uuid
from datetime import datetime
from sqlalchemy.orm import Session

from app.models.branch import (
    Branch as BranchModel,
    Bottleneck as BottleneckModel,
    Recommendation as RecommendationModel,
    CustomerFeedback as FeedbackModel,
    Appointment as AppointmentModel,
)
from app.schemas.schemas import (
    BranchCreate,
    FeedbackRequest,
    AppointmentCreate,
)
from ml.bottleneck_detection import detect_bottlenecks, get_service_demand_distribution
from ml.demand_forecasting import forecast_branch_demand, get_hourly_queue_trend
from ml.recommendation_engine import generate_recommendations, get_ai_insight
from ml.feedback_nlp import analyze_customer_feedback


def get_all_branches(db: Session) -> list[BranchModel]:
    """Returns all branches."""
    return db.query(BranchModel).all()


def get_branch_by_code(db: Session, branch_code: str) -> BranchModel | None:
    """Returns a branch by branch code or ID."""
    branch = db.query(BranchModel).filter(BranchModel.branch_code == branch_code).first()
    if not branch and branch_code.isdigit():
        branch = db.query(BranchModel).filter(BranchModel.id == int(branch_code)).first()
    if not branch:
        # Fallback to first branch
        branch = db.query(BranchModel).first()
    return branch


def create_branch(db: Session, data: BranchCreate) -> BranchModel:
    branch = BranchModel(**data.model_dump())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch


def get_dashboard_summary(db: Session, branch_code: str = "AV-CENTRAL") -> dict[str, Any]:
    """Generates complete aggregated dashboard payload for executive overview."""
    branch = get_branch_by_code(db, branch_code)
    all_branches = get_all_branches(db)

    active_code = branch.branch_code if branch else "AV-CENTRAL"

    # AI Insight
    ai_insight = get_ai_insight(active_code)

    # Recommendations from DB (with fallback to engine)
    db_recs = db.query(RecommendationModel).filter(RecommendationModel.branch_code == active_code).all()
    if not db_recs:
        recs_data = generate_recommendations(active_code)
    else:
        recs_data = [
            {
                "id": r.id,
                "branch_code": r.branch_code,
                "action_type": r.action_type,
                "title": r.title,
                "description": r.description,
                "explanation": r.explanation,
                "priority": r.priority,
                "estimated_impact": r.estimated_impact,
                "applied": r.applied,
            }
            for r in db_recs
        ]

    # Bottlenecks from DB (with fallback)
    db_bottlenecks = db.query(BottleneckModel).filter(BottleneckModel.branch_code == active_code).all()
    if not db_bottlenecks:
        bottlenecks_data = detect_bottlenecks(active_code)
    else:
        bottlenecks_data = [
            {
                "id": b.id,
                "branch_code": b.branch_code,
                "service_name": b.service_name,
                "severity": b.severity,
                "queue_length": b.queue_length,
                "avg_wait_minutes": b.avg_wait_minutes,
                "capacity_per_hour": b.capacity_per_hour,
                "staff_allocated": b.staff_allocated,
                "impact_reason": b.impact_reason,
                "recommended_action": b.recommended_action,
            }
            for b in db_bottlenecks
        ]

    # Demand forecast & queue trend
    hourly_traffic = forecast_branch_demand(active_code)
    queue_trend = get_hourly_queue_trend(active_code)
    service_distribution = get_service_demand_distribution(active_code)

    return {
        "branch": branch,
        "all_branches": all_branches,
        "ai_insight": ai_insight,
        "recommendations": recs_data,
        "bottlenecks": bottlenecks_data,
        "hourly_traffic": hourly_traffic,
        "queue_trend": queue_trend,
        "service_distribution": service_distribution,
    }


def apply_recommendation_action(db: Session, rec_id: str, branch_code: str | None = None) -> dict[str, Any]:
    """
    Executes the operational recommendation and updates branch metrics in real-time.
    """
    rec = db.query(RecommendationModel).filter(RecommendationModel.id == rec_id).first()
    target_branch_code = branch_code or (rec.branch_code if rec else "AV-CENTRAL")
    branch = db.query(BranchModel).filter(BranchModel.branch_code == target_branch_code).first()

    if rec:
        rec.applied = True

    # Mutate branch metrics positively to reflect action execution
    if branch:
        if rec and rec.action_type == "reallocate_staff":
            branch.avg_wait_minutes = max(10, branch.avg_wait_minutes - 8)
            branch.current_load = max(45, branch.current_load - 14)
            branch.staff_utilization = max(60, branch.staff_utilization - 9)
            branch.csat_score = min(5.0, round(branch.csat_score + 0.3, 2))
        elif rec and rec.action_type == "redirect_customers":
            branch.current_queue = max(5, branch.current_queue - 8)
            branch.avg_wait_minutes = max(8, branch.avg_wait_minutes - 6)
            branch.current_load = max(40, branch.current_load - 16)
        elif rec and rec.action_type == "open_counter":
            branch.active_counters = min(branch.total_counters, branch.active_counters + 1)
            branch.avg_wait_minutes = max(8, branch.avg_wait_minutes - 5)
            branch.current_load = max(40, branch.current_load - 10)
        else:
            branch.current_load = max(35, branch.current_load - 10)
            branch.avg_wait_minutes = max(8, branch.avg_wait_minutes - 4)

        db.commit()
        db.refresh(branch)

    return {
        "success": True,
        "message": f"Recommendation {rec_id} applied successfully! Branch operational load updated.",
        "updated_branch": branch,
        "recommendation_id": rec_id,
    }


def submit_feedback_service(db: Session, req: FeedbackRequest) -> dict[str, Any]:
    """Runs NLP sentiment analysis on feedback and saves to database."""
    analysis = analyze_customer_feedback(req.comment, req.branch_code)

    feedback_entry = FeedbackModel(
        branch_code=req.branch_code,
        customer_name=req.customer_name,
        service_type=req.service_type,
        rating=req.rating,
        comment=req.comment,
        sentiment=analysis["sentiment"],
        sentiment_score=analysis["score"],
        created_at=datetime.utcnow(),
    )
    db.add(feedback_entry)
    db.commit()
    db.refresh(feedback_entry)

    return {
        **analysis,
        "id": feedback_entry.id,
        "rating": feedback_entry.rating,
        "customer_name": feedback_entry.customer_name,
        "service_type": feedback_entry.service_type,
    }


def get_all_feedback(db: Session, branch_code: str | None = None) -> list[FeedbackModel]:
    """Retrieves customer feedback entries."""
    query = db.query(FeedbackModel)
    if branch_code and branch_code != "ALL":
        query = query.filter(FeedbackModel.branch_code == branch_code)
    return query.order_by(FeedbackModel.id.desc()).all()


def book_appointment_service(db: Session, req: AppointmentCreate) -> AppointmentModel:
    """Creates a confirmed appointment with digital queue token."""
    token_suffix = str(uuid.uuid4().int)[:3]
    token_number = f"AV-{token_suffix}"

    appt = AppointmentModel(
        id=f"APT-{uuid.uuid4().hex[:8].upper()}",
        branch_code=req.branch_code,
        customer_name=req.customer_name,
        service_type=req.service_type,
        slot_time=req.slot_time,
        token_number=token_number,
        status="confirmed",
        created_at=datetime.utcnow(),
    )
    db.add(appt)
    db.commit()
    db.refresh(appt)
    return appt


def get_appointments(db: Session, branch_code: str | None = None) -> list[AppointmentModel]:
    query = db.query(AppointmentModel)
    if branch_code and branch_code != "ALL":
        query = query.filter(AppointmentModel.branch_code == branch_code)
    return query.order_by(AppointmentModel.created_at.desc()).all()
