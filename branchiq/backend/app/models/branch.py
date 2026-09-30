"""
SQLAlchemy ORM models for AVENUE - Intelligent Branch Service Load & Experience Optimizer.
"""

from datetime import datetime
from sqlalchemy import Float, Integer, String, DateTime, Text, Boolean
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class Branch(Base):
    """Represents a bank branch with operational metrics."""
    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    branch_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    location: Mapped[str] = mapped_column(String(200))
    total_counters: Mapped[int] = mapped_column(Integer, default=8)
    active_counters: Mapped[int] = mapped_column(Integer, default=6)
    current_load: Mapped[int] = mapped_column(Integer, default=78)  # 0-100%
    current_queue: Mapped[int] = mapped_column(Integer, default=24)
    avg_wait_minutes: Mapped[int] = mapped_column(Integer, default=22)
    staff_count: Mapped[int] = mapped_column(Integer, default=9)
    staff_utilization: Mapped[int] = mapped_column(Integer, default=88)  # 0-100%
    csat_score: Mapped[float] = mapped_column(Float, default=4.2)
    distance_miles: Mapped[float] = mapped_column(Float, default=0.0)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)


class Bottleneck(Base):
    """Service-level queue and capacity bottleneck alert."""
    __tablename__ = "bottlenecks"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    branch_code: Mapped[str] = mapped_column(String(20), index=True)
    service_name: Mapped[str] = mapped_column(String(80))
    severity: Mapped[str] = mapped_column(String(20))  # high | medium | low
    queue_length: Mapped[int] = mapped_column(Integer, default=0)
    avg_wait_minutes: Mapped[int] = mapped_column(Integer, default=0)
    capacity_per_hour: Mapped[int] = mapped_column(Integer, default=10)
    staff_allocated: Mapped[int] = mapped_column(Integer, default=2)
    impact_reason: Mapped[str] = mapped_column(String(255))
    recommended_action: Mapped[str] = mapped_column(String(255))


class Recommendation(Base):
    """Operational action recommended by the AI engine."""
    __tablename__ = "recommendations"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, index=True)
    branch_code: Mapped[str] = mapped_column(String(20), index=True)
    action_type: Mapped[str] = mapped_column(String(40))  # reallocate_staff, redirect_customers, book_appointment, open_counter
    title: Mapped[str] = mapped_column(String(120))
    description: Mapped[str] = mapped_column(Text)
    explanation: Mapped[str] = mapped_column(Text)
    priority: Mapped[str] = mapped_column(String(20))  # high | medium | low
    estimated_impact: Mapped[str] = mapped_column(String(120))
    applied: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class CustomerFeedback(Base):
    """Customer satisfaction feedback and NLP sentiment scoring."""
    __tablename__ = "customer_feedback"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    branch_code: Mapped[str] = mapped_column(String(20), index=True)
    customer_name: Mapped[str] = mapped_column(String(100), default="Anonymous Customer")
    service_type: Mapped[str] = mapped_column(String(80), default="General Banking")
    rating: Mapped[int] = mapped_column(Integer, default=4)
    comment: Mapped[str] = mapped_column(Text)
    sentiment: Mapped[str] = mapped_column(String(20))  # positive | neutral | negative
    sentiment_score: Mapped[float] = mapped_column(Float, default=0.0)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Appointment(Base):
    """Scheduled customer appointment."""
    __tablename__ = "appointments"

    id: Mapped[str] = mapped_column(String(40), primary_key=True, index=True)
    branch_code: Mapped[str] = mapped_column(String(20), index=True)
    customer_name: Mapped[str] = mapped_column(String(100))
    service_type: Mapped[str] = mapped_column(String(80))
    slot_time: Mapped[str] = mapped_column(String(40))
    status: Mapped[str] = mapped_column(String(20), default="confirmed")
    token_number: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
