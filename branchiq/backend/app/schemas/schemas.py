"""
Pydantic schemas for API request/response validation.

These mirror the TypeScript interfaces in frontend/src/types/index.ts.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


# ─────────────────────────────────────────────────────────────────────────────
# Health
# ─────────────────────────────────────────────────────────────────────────────

class HealthResponse(BaseModel):
    status: str = Field(default="ok", description="Overall service health")
    service: str = Field(default="BranchIQ API", description="Service name")
    version: str = Field(description="API version string")


# ─────────────────────────────────────────────────────────────────────────────
# Branch
# ─────────────────────────────────────────────────────────────────────────────

class BranchBase(BaseModel):
    branch_code: str
    name: str
    location: str
    total_counters: int = 5


class BranchCreate(BranchBase):
    pass


class BranchRead(BranchBase):
    id: int

    model_config = {"from_attributes": True}


# ─────────────────────────────────────────────────────────────────────────────
# Forecast (placeholder — will be filled when ML module is ready)
# ─────────────────────────────────────────────────────────────────────────────

class ForecastPoint(BaseModel):
    timestamp: str
    predicted_customers: float
    branch_id: str


# ─────────────────────────────────────────────────────────────────────────────
# Bottleneck (placeholder)
# ─────────────────────────────────────────────────────────────────────────────

class BottleneckAlert(BaseModel):
    branch_id: str
    severity: str  # low | medium | high
    message: str
    detected_at: str


# ─────────────────────────────────────────────────────────────────────────────
# Recommendation (placeholder)
# ─────────────────────────────────────────────────────────────────────────────

class Recommendation(BaseModel):
    id: str
    branch_id: str
    action_type: str
    description: str
    priority: str  # low | medium | high


# ─────────────────────────────────────────────────────────────────────────────
# Simulation (placeholder)
# ─────────────────────────────────────────────────────────────────────────────

class SimulationRequest(BaseModel):
    branch_id: str
    action_type: str
    parameters: dict


class SimulationResult(BaseModel):
    scenario_id: str
    before: dict
    after: dict


# ─────────────────────────────────────────────────────────────────────────────
# Feedback / NLP (placeholder)
# ─────────────────────────────────────────────────────────────────────────────

class FeedbackRequest(BaseModel):
    text: str
    branch_id: str | None = None


class FeedbackAnalysis(BaseModel):
    feedback_id: str
    text: str
    sentiment: str  # positive | neutral | negative
    score: float
