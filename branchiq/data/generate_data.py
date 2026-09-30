"""
Data generation script for AVENUE.
Generates synthetic bank branch customer traffic, staff schedules,
and customer feedback data for model evaluation.

Usage:
    python data/generate_data.py --branches 5 --days 30 --feedback 200
"""

import argparse
import csv
import random
from datetime import datetime, timedelta
from pathlib import Path


SERVICES = ["Loan & Mortgages", "Account Opening & KYC", "Cash & Deposits", "Wealth & Forex"]
BRANCH_CODES = ["AV-CENTRAL", "AV-NORTH", "AV-WEST", "AV-EAST", "AV-SOUTH"]


def generate_branch_traffic(output_path: Path, num_branches: int, days: int) -> None:
    """Generate synthetic branch customer traffic records."""
    fieldnames = [
        "timestamp", "branch_code", "service_name", "customer_id",
        "wait_time_minutes", "service_duration_minutes", "counter_id", "satisfaction_rating"
    ]
    records = []
    base_time = datetime.now() - timedelta(days=days)

    selected_branches = BRANCH_CODES[:num_branches]

    for d in range(days):
        day_date = base_time + timedelta(days=d)
        if day_date.weekday() >= 5:  # Skip weekends or half-day
            continue

        for hour in range(9, 17):
            hour_weight = 1.4 if hour in [12, 13] else (1.1 if hour in [10, 11, 14] else 0.7)
            for branch in selected_branches:
                branch_mult = 1.3 if branch == "AV-CENTRAL" else (0.7 if branch == "AV-NORTH" else 1.0)
                customer_count = int(random.gauss(18 * hour_weight * branch_mult, 3))

                for i in range(max(1, customer_count)):
                    service = random.choice(SERVICES)
                    if service == "Loan & Mortgages":
                        wait_time = int(random.gauss(28, 8))
                        serv_dur = int(random.gauss(24, 6))
                    elif service == "Account Opening & KYC":
                        wait_time = int(random.gauss(18, 5))
                        serv_dur = int(random.gauss(16, 4))
                    elif service == "Cash & Deposits":
                        wait_time = int(random.gauss(6, 3))
                        serv_dur = int(random.gauss(5, 2))
                    else:
                        wait_time = int(random.gauss(15, 6))
                        serv_dur = int(random.gauss(18, 5))

                    record_time = day_date.replace(hour=hour, minute=random.randint(0, 59))
                    records.append({
                        "timestamp": record_time.isoformat(),
                        "branch_code": branch,
                        "service_name": service,
                        "customer_id": f"CUST-{random.randint(10000, 99999)}",
                        "wait_time_minutes": max(2, wait_time),
                        "service_duration_minutes": max(3, serv_dur),
                        "counter_id": f"CNT-{random.randint(1, 8)}",
                        "satisfaction_rating": max(1, min(5, int(random.gauss(4.2 - (wait_time / 30.0), 0.7)))),
                    })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"Generated {len(records)} traffic records at {output_path}")


def generate_customer_feedback(output_path: Path, num_records: int) -> None:
    """Generate synthetic customer feedback text records."""
    fieldnames = ["feedback_id", "branch_code", "service_type", "rating", "comment", "timestamp"]
    templates = [
        (5, "Cash deposit was smooth and fast, zero queue today.", "Cash & Deposits"),
        (5, "The Avenue app wait time was accurate! Saved 25 minutes.", "General Banking"),
        (4, "Pleasant staff, but waiting area was slightly crowded.", "Account Opening & KYC"),
        (2, "Waited over 40 minutes for mortgage consultation. Only 1 advisor on duty.", "Loan & Mortgages"),
        (1, "Long queues during lunch rush. Need more active counters.", "Cash & Deposits"),
        (4, "Visited North branch upon suggestion. Much faster than Downtown!", "General Banking"),
        (3, "Staff was polite, but KYC process took longer than promised.", "Account Opening & KYC"),
        (5, "Fast-lane appointment booking worked seamlessly.", "Wealth & Forex"),
    ]
    records = []
    base_time = datetime.now() - timedelta(days=14)

    for i in range(num_records):
        tpl = random.choice(templates)
        delta_hours = random.randint(0, 14 * 24)
        records.append({
            "feedback_id": f"FB-{1000 + i}",
            "branch_code": random.choice(BRANCH_CODES[:3]),
            "service_type": tpl[2],
            "rating": tpl[0],
            "comment": tpl[1],
            "timestamp": (base_time + timedelta(hours=delta_hours)).isoformat(),
        })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"Generated {len(records)} feedback records at {output_path}")


def generate_staff_schedules(output_path: Path, num_branches: int, days: int) -> None:
    """Generate synthetic staff scheduling data."""
    fieldnames = ["staff_id", "name", "branch_code", "primary_role", "is_cross_trained", "shift", "status"]
    names = [
        ("Emily Davis", "Teller", True),
        ("Marcus Vance", "Customer Service Specialist", True),
        ("Sarah Jenkins", "Loan Officer", False),
        ("Robert Lee", "KYC Officer", True),
        ("David Miller", "Teller", False),
        ("Sophia Ramirez", "Branch Greeter", False),
        ("Alex Turner", "Wealth Advisor", False),
        ("Rachel Green", "Teller", True),
    ]
    records = []
    selected_branches = BRANCH_CODES[:num_branches]

    for branch in selected_branches:
        for idx, (name, role, cross) in enumerate(names):
            records.append({
                "staff_id": f"STF-{branch}-{idx+1}",
                "name": name,
                "branch_code": branch,
                "primary_role": role,
                "is_cross_trained": cross,
                "shift": "08:30 - 17:30",
                "status": "Available" if idx != 2 else "Break/Consult",
            })

    output_path.parent.mkdir(parents=True, exist_ok=True)
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(records)
    print(f"Generated {len(records)} staff schedule records at {output_path}")


def main() -> None:
    parser = argparse.ArgumentParser(description="AVENUE synthetic banking data generator")
    parser.add_argument("--branches", type=int, default=3, help="Number of branches")
    parser.add_argument("--days", type=int, default=14, help="Days of historical data")
    parser.add_argument("--feedback", type=int, default=100, help="Feedback records")
    args = parser.parse_args()

    raw_dir = Path(__file__).parent / "raw"
    raw_dir.mkdir(parents=True, exist_ok=True)

    print("Generating AVENUE Banking Datasets...")
    generate_branch_traffic(raw_dir / "branch_traffic.csv", args.branches, args.days)
    generate_customer_feedback(raw_dir / "customer_feedback.csv", args.feedback)
    generate_staff_schedules(raw_dir / "staff_schedules.csv", args.branches, args.days)
    print("Data generation complete!")


if __name__ == "__main__":
    main()
