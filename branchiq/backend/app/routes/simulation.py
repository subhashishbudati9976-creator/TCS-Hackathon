"""
Simulation engine routes.
"""

from fastapi import APIRouter
from app.schemas.schemas import SimulationRequest, SimulationResult
from ml.simulation_engine import simulate_scenario

router = APIRouter(prefix="/api/simulate", tags=["simulation"])


@router.post(
    "/",
    response_model=SimulationResult,
    summary="Simulate the impact of an operational action",
)
async def run_simulation(request: SimulationRequest):
    """
    Simulates the expected outcome of changing staffing, demand surges,
    and counter allocations using queueing models.
    """
    return simulate_scenario(
        branch_code=request.branch_code,
        staff_count=request.staff_count,
        demand_multiplier=request.demand_multiplier,
        active_counters=request.active_counters,
        cross_trained_reallocated=request.cross_trained_reallocated,
    )
