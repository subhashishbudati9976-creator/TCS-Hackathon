"""
Pydantic schemas for AVENUE API request/response validation.
"""

from __future__ import annotations
from typing import Any
from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Overall service health")
    service: str = Field(default="AVENUE Intelligent Optimizer API", description="Service name")
    version: str = Field(description="API version string")


# ─────────────────────────────────────────────────────────────────────────────
# Branch
# ─────────────────────────────────────────────────────────────────────────────

class BranchBase(BaseModel):
    branch_code: str
    name: str
    location: str
    total_counters: int = 8
    active_counters: int = 6
    current_load: int = 75
    current_queue: int = 24
    avg_wait_minutes: int = 22
    staff_count: int = 9
    staff_utilization: int = 88
    csat_score: float = 4.2
    distance_miles: float = 0.0


class BranchCreate(BranchBase):
    pass


class BranchRead(BranchBase):
    id: int

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────────────────────
# Forecast & Queue Trend
# ─────────────────────────────────────────────────────────────────────────────

class ForecastPoint(BaseModel):
    hour: str
    predicted_customers: int
    actual_customers: int | None = None
    predicted_wait_minutes: int
    counter_capacity: int


class QueueTrendPoint(BaseModel):
    hour: str
    active_queue: int
    completed_services: int
    avg_service_time: int


class ServiceDemandPoint(BaseModel):
    service: str
    demand_share: int  # percentage
    current_waiting: int
    avg_duration_mins: int
    status: str  # optimal | strained | critical


# ─────────────────────────────────────────────────────────────────────────────
# Bottleneck
# ─────────────────────────────────────────────────────────────────────────────

class BottleneckAlert(BaseModel):
    id: int
    branch_code: str
    service_name: str
    severity: str  # high | medium | low
    queue_length: int
    avg_wait_minutes: int
    capacity_per_hour: int
    staff_allocated: int
    impact_reason: str
    recommended_action: str

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────────────────────
# Recommendation
# ─────────────────────────────────────────────────────────────────────────────

class RecommendationRead(BaseModel):
    id: str
    branch_code: str
    action_type: str
    title: str
    description: str
    explanation: str
    priority: str  # high | medium | low
    estimated_impact: str
    applied: bool = False

    model_config = {"from_attributes": True}


class ApplyRecommendationRequest(BaseModel):
    recommendation_id: str
    branch_code: str | None = None


# ─────────────────────────────────────────────────────────────────────────────
# Simulation
# ─────────────────────────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    branch_code: str = "AV-CENTRAL"
    staff_count: int = 9
    demand_multiplier: float = 1.0  # 0.5 to 2.0
    active_counters: int = 6
    cross_trained_reallocated: int = 0


class SimulationMetrics(BaseModel):
    branch_load: int
    avg_wait_minutes: int
    queue_pressure: int
    staff_utilization: int
    predicted_csat: float


class SimulationResult(BaseModel):
    scenario_id: str
    branch_code: str
    before: SimulationMetrics
    after: SimulationMetrics
    delta: dict[str, Any]
    ai_verdict: str


# ─────────────────────────────────────────────────────────────────────────────
# Feedback / NLP
# ─────────────────────────────────────────────────────────────────────────────

class FeedbackRequest(BaseModel):
    branch_code: str = "AV-CENTRAL"
    customer_name: str = "Guest Customer"
    service_type: str = "General Banking"
    rating: int = 4
    comment: str


class FeedbackAnalysis(BaseModel):
    feedback_id: str
    branch_code: str
    sentiment: str  # positive | neutral | negative
    score: float
    key_themes: list[str]
    ai_summary: str


class FeedbackItem(BaseModel):
    id: int
    branch_code: str
    customer_name: str
    service_type: str
    rating: int
    comment: str
    sentiment: str
    sentiment_score: float
    created_at: str

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────────────────────
# Appointments
# ─────────────────────────────────────────────────────────────────────────────

class AppointmentCreate(BaseModel):
    branch_code: str
    customer_name: str
    service_type: str
    slot_time: str


class AppointmentRead(BaseModel):
    id: str
    branch_code: str
    customer_name: str
    service_type: str
    slot_time: str
    token_number: str
    status: str

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────────────────────
# Overall Dashboard Data
# ─────────────────────────────────────────────────────────────────────────────

class AIInsight(BaseModel):
    title: str
    summary: str
    confidence: int
    urgency: str
    timestamp: str


class DashboardSummary(BaseModel):
    branch: BranchRead
    all_branches: list[BranchRead]
    ai_insight: AIInsight
    recommendations: list[RecommendationRead]
    bottlenecks: list[BottleneckAlert]
    hourly_traffic: list[ForecastPoint]
    queue_trend: list[QueueTrendPoint]
    service_distribution: list[ServiceDemandPoint]
