"""
Simulation engine routes.

Placeholder: route is registered but simulation logic is not yet implemented.
"""

from fastapi import APIRouter

from app.schemas import SimulationRequest, SimulationResult

router = APIRouter(prefix="/api/simulate", tags=["simulation"])


@router.post(
    "/",
    response_model=SimulationResult,
    summary="Simulate the impact of an operational action",
)
async def run_simulation(request: SimulationRequest) -> dict:
    """
    Simulates the expected outcome of applying a recommended action.
    NOT YET IMPLEMENTED — simulation engine will be wired here in a later step.
    """
    return {
        "scenario_id": "not_implemented",
        "before": {},
        "after": {},
    }
