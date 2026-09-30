"""
AVENUE — Customer Portal & Experience Routes

GET /api/customer/service-options
GET /api/customer/branches
POST /api/customer/recommendation
POST /api/customer/chat
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from app.services.customer_service import customer_service

router = APIRouter(prefix="/api/customer", tags=["customer"])


class RecommendationQuery(BaseModel):
    service_type: str = Field(..., description="Service needed by customer (e.g. Account Opening)")
    preferred_area: Optional[str] = Field(default=None, description="Optional preferred location/area")


class ChatQuery(BaseModel):
    message: str = Field(..., description="Customer question or query")


@router.get("/service-options", summary="Get service catalog with digital availability and preparation checklist")
async def get_service_options() -> List[Dict[str, Any]]:
    """Returns all banking services with digital/branch requirement, duration, and required docs."""
    try:
        return customer_service.get_service_options()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/branches", summary="Get customer-facing branch view with real wait times and crowding status")
async def get_customer_branches() -> List[Dict[str, Any]]:
    """Returns branches with current wait times, load scores, and congestion levels."""
    try:
        return customer_service.get_customer_branches()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/recommendation", summary="Recommend best branches and digital channel options for a requested service")
async def get_recommendation(payload: RecommendationQuery) -> Dict[str, Any]:
    """Recommends lowest-wait branches and informs if the transaction can be completed digitally."""
    try:
        return customer_service.recommend_branches(
            service_type=payload.service_type,
            preferred_area=payload.preferred_area
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/chat", summary="Customer AI assistant conversation endpoint (grounded with zero external LLM dependency)")
async def chat_with_assistant(payload: ChatQuery) -> Dict[str, Any]:
    """Answers customer banking inquiries regarding services, wait times, documents, and digital options."""
    try:
        return customer_service.chat_assistant(message=payload.message)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
