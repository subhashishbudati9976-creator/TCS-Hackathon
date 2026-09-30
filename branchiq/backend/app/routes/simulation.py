"""
AVENUE — What-If Simulation Routes

POST /api/simulate
"""

from __future__ import annotations

from typing import Any, Dict
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, Field

from ml.simulation_engine import simulate_action

router = APIRouter(prefix="/api/simulate", tags=["simulation"])


class SimulationInput(BaseModel):
    branch_id: str = Field(..., description="Target branch identifier (e.g. BR001)")
    action_type: str = Field(..., description="Action type: STAFF_REASSIGNMENT, DIGITAL_DIVERSION, CUSTOMER_REDIRECTION")
    parameters: Dict[str, Any] = Field(default_factory=dict, description="Scenario-specific parameters")


@router.post(
    "",
    summary="Simulate the operational impact of a proposed intervention",
)
async def run_simulation(payload: SimulationInput) -> Dict[str, Any]:
    """
    Executes a what-if simulation WITHOUT mutating underlying rosters or historical datasets.
    Returns: BEFORE, AFTER, and IMPACT operational metrics.
    """
    try:
        return simulate_action(
            branch_id=payload.branch_id,
            action_type=payload.action_type,
            parameters=payload.parameters,
        )
    except KeyError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
