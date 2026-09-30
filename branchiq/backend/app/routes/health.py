"""
Health check route.

GET /api/health — returns service status.
"""

from fastapi import APIRouter

from app.config import settings
from app.schemas import HealthResponse

router = APIRouter(prefix="/api", tags=["health"])


@router.get("/health", response_model=HealthResponse, summary="Health check")
async def health_check() -> HealthResponse:
    """Returns a simple JSON payload confirming the backend is running."""
    return HealthResponse(
        status="healthy",
        service="avenue-api",
        version=settings.app_version,
    )
