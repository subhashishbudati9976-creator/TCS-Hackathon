"""
AVENUE — Bottleneck Detection Routes

GET /api/bottlenecks
GET /api/bottlenecks/{branch_id}
"""

from __future__ import annotations

from typing import Any, Dict, List, Optional
from fastapi import APIRouter, HTTPException, Query

from ml.bottleneck_detection import detect_bottlenecks

router = APIRouter(prefix="/api/bottlenecks", tags=["bottlenecks"])


@router.get(
    "",
    summary="Get active bottleneck alerts across all branches",
)
async def get_all_bottlenecks(
    severity: Optional[str] = Query(default=None, description="Optional filter: CRITICAL, HIGH, MODERATE, LOW")
) -> List[Dict[str, Any]]:
    """Returns detected service-level bottlenecks across all branches."""
    try:
        results = detect_bottlenecks()
        if severity:
            results = [b for b in results if b["severity"].upper() == severity.upper()]
        return results
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get(
    "/{branch_id}",
    summary="Get service-level bottlenecks for a specific branch",
)
async def get_branch_bottlenecks(branch_id: str) -> List[Dict[str, Any]]:
    """Returns service-level bottlenecks with transparent root-cause analysis for branch."""
    try:
        return detect_bottlenecks(branch_id=branch_id)
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
