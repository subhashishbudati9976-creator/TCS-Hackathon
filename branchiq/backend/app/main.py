"""
BranchIQ FastAPI Application

Entry point for the backend API.
Run with: uvicorn app.main:app --reload
"""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import init_db
from app.routes import (
    health,
    branches,
    forecast,
    bottlenecks,
    recommendations,
    simulation,
    feedback,
)


# ─────────────────────────────────────────────────────────────────────────────
# Lifespan — startup / shutdown hooks
# ─────────────────────────────────────────────────────────────────────────────

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize DB tables on startup."""
    init_db()
    yield
    # Add teardown logic here if needed in future


# ─────────────────────────────────────────────────────────────────────────────
# Application factory
# ─────────────────────────────────────────────────────────────────────────────

app = FastAPI(
    title="BranchIQ API",
    description=(
        "Intelligent Branch Service Load and Customer Experience Optimizer — "
        "TCS Hackathon Backend API"
    ),
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
    lifespan=lifespan,
)

# ─────────────────────────────────────────────────────────────────────────────
# CORS — allow frontend dev server
# ─────────────────────────────────────────────────────────────────────────────

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ─────────────────────────────────────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────────────────────────────────────

app.include_router(health.router)
app.include_router(branches.router)
app.include_router(forecast.router)
app.include_router(bottlenecks.router)
app.include_router(recommendations.router)
app.include_router(simulation.router)
app.include_router(feedback.router)
