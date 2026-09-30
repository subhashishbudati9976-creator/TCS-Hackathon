"""
Data generation script for BranchIQ.

Generates synthetic bank branch customer traffic data for model training.

IMPLEMENTATION STATUS: Placeholder — data schema is defined, generation
logic will be implemented in the next step.

Usage:
    python data/generate_data.py

Output files:
    data/raw/branch_traffic.csv
    data/raw/customer_feedback.csv
    data/raw/staff_schedules.csv
"""

import argparse
import sys
from pathlib import Path


def generate_branch_traffic(output_path: Path, num_branches: int, days: int) -> None:
    """Generate synthetic branch customer traffic data."""
    raise NotImplementedError(
        "Branch traffic generation is not yet implemented. "
        "Implement using pandas + numpy with realistic distributions."
    )


def generate_customer_feedback(output_path: Path, num_records: int) -> None:
    """Generate synthetic customer feedback text records."""
    raise NotImplementedError(
        "Customer feedback generation is not yet implemented."
    )


def generate_staff_schedules(output_path: Path, num_branches: int, days: int) -> None:
    """Generate synthetic staff scheduling data."""
    raise NotImplementedError(
        "Staff schedule generation is not yet implemented."
    )


def main() -> None:
    parser = argparse.ArgumentParser(description="BranchIQ synthetic data generator")
    parser.add_argument("--branches", type=int, default=10, help="Number of branches")
    parser.add_argument("--days", type=int, default=90, help="Days of historical data")
    parser.add_argument("--feedback", type=int, default=1000, help="Feedback records")
    args = parser.parse_args()

    raw_dir = Path(__file__).parent / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    print("BranchIQ Data Generator")
    print(f"  Branches: {args.branches}")
    print(f"  Days:     {args.days}")
    print(f"  Feedback: {args.feedback}")
    print()
    print("NOTE: Data generation is not yet implemented.")
    print("      Implement generate_branch_traffic() and related functions.")
    sys.exit(0)


if __name__ == "__main__":
    main()
