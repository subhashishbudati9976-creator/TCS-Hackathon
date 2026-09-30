"""
AVENUE — Operational Recommendations Routes

GET /api/recommendations/{branch_id}
GET /api/recommendations
"""

from __future__ import annotations

from typing import Any, Dict, List
from fastapi import APIRouter, HTTPException

from ml.recommendation_engine import generate_recommendations

router = APIRouter(prefix="/api/recommendations", tags=["recommendations"])


@router.get(
    "/{branch_id}",
    summary="Get operational recommendations for a branch",
)
async def get_branch_recommendations(branch_id: str) -> List[Dict[str, Any]]:
    """Returns grounded recommendations (staff reassignment, digital diversion, etc.) for branch."""
    try:
        return generate_recommendations(branch_id=branch_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
