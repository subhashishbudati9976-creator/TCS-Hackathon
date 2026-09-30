"""
Health check route.

GET /api/health and GET /health — returns service status.
"""

from fastapi import APIRouter
from app.config import settings
from app.schemas import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Health check")
@router.get("/api/health", response_model=HealthResponse, summary="Health check (api prefix)")
async def health_check() -> HealthResponse:
    """Returns a JSON payload confirming AVENUE API service is running."""
    return HealthResponse(
        status="ok",
        service="AVENUE Intelligent Optimizer API",
        version=settings.app_version,
    )
