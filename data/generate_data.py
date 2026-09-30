"""
AVENUE — Intelligent Branch Service Load & Customer Experience Optimizer
Synthetic Data Generation Pipeline

Generates a realistic, correlated synthetic banking dataset covering:
- Branches (10 branches with distinct operating profiles)
- Staff (75 staff members with skill specializations)
- Service Categories (14 banking services with duration, complexity, digital eligibility)
- Customers (Synthetic demographic segments, NO real PII)
- Calendar & External Factors (Holidays, salary periods, month-end, local events)
- Appointments (Scheduled customer visits)
- Visits & Queue Logs (60,000+ realistic queuing records with realistic bottleneck dynamics)
- Tokens / Queue Data (Token issuance, wait times, counters)
- Customer Feedback (Textual comments, rating, sentiment labels, issue categories)
"""

from __future__ import annotations

import argparse
import datetime
import json
import math
from pathlib import Path
import random
import sys
import numpy as np
import pandas as pd


def set_seed(seed: int = 42) -> None:
    random.seed(seed)
    np.random.seed(seed)


# ─────────────────────────────────────────────────────────────────────────────
# 1. REFERENCE DATA DEFINITIONS
# ─────────────────────────────────────────────────────────────────────────────

BRANCH_DEFINITIONS = [
    {
        "branch_id": "BR001",
        "branch_code": "METRO-01",
        "branch_name": "Metro Central Flagship",
        "city": "Bengaluru",
        "area": "MG Road / CBD",
        "latitude": 12.9716,
        "longitude": 77.5946,
        "branch_capacity": 120,
        "number_of_counters": 14,
        "operating_hours": "09:30-16:30",
        "branch_type": "Flagship / Business District",
        "baseline_traffic_level": "High",
        "traffic_multiplier": 1.45,
    },
    {
        "branch_id": "BR002",
        "branch_code": "TECH-02",
        "branch_name": "Tech Corridor Cyber Branch",
        "city": "Bengaluru",
        "area": "Electronic City",
        "latitude": 12.8399,
        "longitude": 77.6770,
        "branch_capacity": 90,
        "number_of_counters": 10,
        "operating_hours": "09:30-16:30",
        "branch_type": "Urban Commercial / Tech Hub",
        "baseline_traffic_level": "High",
        "traffic_multiplier": 1.30,
    },
    {
        "branch_id": "BR003",
        "branch_code": "TRD-03",
        "branch_name": "Old Town Commercial Hub",
        "city": "Bengaluru",
        "area": "Chickpet Market",
        "latitude": 12.9698,
        "longitude": 77.5750,
        "branch_capacity": 100,
        "number_of_counters": 12,
        "operating_hours": "09:30-16:30",
        "branch_type": "Commercial / Wholesale Market",
        "baseline_traffic_level": "High",
        "traffic_multiplier": 1.35,
    },
    {
        "branch_id": "BR004",
        "branch_code": "SUB-04",
        "branch_name": "Green Valley Suburban Branch",
        "city": "Bengaluru",
        "area": "Jayanagar Residential",
        "latitude": 12.9308,
        "longitude": 77.5838,
        "branch_capacity": 60,
        "number_of_counters": 7,
        "operating_hours": "09:30-16:30",
        "branch_type": "Suburban Retail / Residential",
        "baseline_traffic_level": "Medium",
        "traffic_multiplier": 0.95,
    },
    {
        "branch_id": "BR005",
        "branch_code": "CAMP-05",
        "branch_name": "University Campus Branch",
        "city": "Bengaluru",
        "area": "Jnana Bharati Campus",
        "latitude": 12.9465,
        "longitude": 77.5028,
        "branch_capacity": 50,
        "number_of_counters": 5,
        "operating_hours": "10:00-16:00",
        "branch_type": "Institutional / University",
        "baseline_traffic_level": "Medium",
        "traffic_multiplier": 0.80,
    },
    {
        "branch_id": "BR006",
        "branch_code": "CORP-06",
        "branch_name": "Westside Business Park",
        "city": "Bengaluru",
        "area": "Whitefield",
        "latitude": 12.9698,
        "longitude": 77.7500,
        "branch_capacity": 75,
        "number_of_counters": 8,
        "operating_hours": "09:30-16:30",
        "branch_type": "Corporate MSME Hub",
        "baseline_traffic_level": "Medium",
        "traffic_multiplier": 1.05,
    },
    {
        "branch_id": "BR007",
        "branch_code": "MKT-07",
        "branch_name": "Eastend Market Junction",
        "city": "Bengaluru",
        "area": "Indiranagar",
        "latitude": 12.9784,
        "longitude": 77.6408,
        "branch_capacity": 70,
        "number_of_counters": 8,
        "operating_hours": "09:30-16:30",
        "branch_type": "High-Street Retail",
        "baseline_traffic_level": "Medium",
        "traffic_multiplier": 1.00,
    },
    {
        "branch_id": "BR008",
        "branch_code": "PRM-08",
        "branch_name": "Northern Heights Wealth Centre",
        "city": "Bengaluru",
        "area": "Sadashivanagar",
        "latitude": 13.0068,
        "longitude": 77.5813,
        "branch_capacity": 45,
        "number_of_counters": 6,
        "operating_hours": "09:30-16:30",
        "branch_type": "Affluent Residential / Wealth",
        "baseline_traffic_level": "Low",
        "traffic_multiplier": 0.70,
    },
    {
        "branch_id": "BR009",
        "branch_code": "IND-09",
        "branch_name": "Industrial Township Branch",
        "city": "Bengaluru",
        "area": "Peenya Industrial Area",
        "latitude": 13.0285,
        "longitude": 77.5197,
        "branch_capacity": 85,
        "number_of_counters": 9,
        "operating_hours": "09:00-16:30",
        "branch_type": "Industrial & Remittance Hub",
        "baseline_traffic_level": "Medium",
        "traffic_multiplier": 1.15,
    },
    {
        "branch_id": "BR010",
        "branch_code": "EXP-10",
        "branch_name": "Airport Expressway Branch",
        "city": "Bengaluru",
        "area": "Hebbal Outer Ring",
        "latitude": 13.0358,
        "longitude": 77.5970,
        "branch_capacity": 40,
        "number_of_counters": 5,
        "operating_hours": "09:00-17:00",
        "branch_type": "Transit / Express Branch",
        "baseline_traffic_level": "Low",
        "traffic_multiplier": 0.65,
    },
]

SERVICE_CATEGORIES = [
    {
        "service_id": "SRV01",
        "service_type": "Cash Withdrawal",
        "category_group": "Cash Operations",
        "average_service_time": 4.5,
        "minimum_service_time": 2.0,
        "maximum_service_time": 9.0,
        "complexity_level": "Low",
        "required_skill": "Cash",
        "digital_available": True,
        "priority_level": "Standard",
        "base_share": 0.16,
    },
    {
        "service_id": "SRV02",
        "service_type": "Cash Deposit",
        "category_group": "Cash Operations",
        "average_service_time": 6.5,
        "minimum_service_time": 3.0,
        "maximum_service_time": 14.0,
        "complexity_level": "Low",
        "required_skill": "Cash",
        "digital_available": True,
        "priority_level": "Standard",
        "base_share": 0.14,
    },
    {
        "service_id": "SRV03",
        "service_type": "Account Opening",
        "category_group": "Customer Onboarding",
        "average_service_time": 24.0,
        "minimum_service_time": 14.0,
        "maximum_service_time": 40.0,
        "complexity_level": "High",
        "required_skill": "Account Services",
        "digital_available": True,
        "priority_level": "High",
        "base_share": 0.08,
    },
    {
        "service_id": "SRV04",
        "service_type": "KYC Update",
        "category_group": "Compliance & Profile",
        "average_service_time": 13.5,
        "minimum_service_time": 7.0,
        "maximum_service_time": 24.0,
        "complexity_level": "Medium",
        "required_skill": "KYC",
        "digital_available": True,
        "priority_level": "High",
        "base_share": 0.11,
    },
    {
        "service_id": "SRV05",
        "service_type": "Address Update",
        "category_group": "Compliance & Profile",
        "average_service_time": 8.0,
        "minimum_service_time": 4.0,
        "maximum_service_time": 15.0,
        "complexity_level": "Low",
        "required_skill": "KYC",
        "digital_available": True,
        "priority_level": "Standard",
        "base_share": 0.05,
    },
    {
        "service_id": "SRV06",
        "service_type": "Cheque Services",
        "category_group": "Cash Operations",
        "average_service_time": 6.0,
        "minimum_service_time": 2.5,
        "maximum_service_time": 12.0,
        "complexity_level": "Low",
        "required_skill": "Cash",
        "digital_available": True,
        "priority_level": "Standard",
        "base_share": 0.07,
    },
    {
        "service_id": "SRV07",
        "service_type": "Loan Enquiry",
        "category_group": "Lending Services",
        "average_service_time": 18.0,
        "minimum_service_time": 10.0,
        "maximum_service_time": 30.0,
        "complexity_level": "Medium",
        "required_skill": "Loans",
        "digital_available": True,
        "priority_level": "High",
        "base_share": 0.06,
    },
    {
        "service_id": "SRV08",
        "service_type": "Loan Application",
        "category_group": "Lending Services",
        "average_service_time": 34.0,
        "minimum_service_time": 20.0,
        "maximum_service_time": 55.0,
        "complexity_level": "High",
        "required_skill": "Loans",
        "digital_available": False,
        "priority_level": "Urgent",
        "base_share": 0.05,
    },
    {
        "service_id": "SRV09",
        "service_type": "Credit Card Service",
        "category_group": "Cards & Payment",
        "average_service_time": 12.0,
        "minimum_service_time": 6.0,
        "maximum_service_time": 22.0,
        "complexity_level": "Medium",
        "required_skill": "Credit Cards",
        "digital_available": True,
        "priority_level": "Standard",
        "base_share": 0.06,
    },
    {
        "service_id": "SRV10",
        "service_type": "Investment Enquiry",
        "category_group": "Wealth Management",
        "average_service_time": 26.0,
        "minimum_service_time": 15.0,
        "maximum_service_time": 45.0,
        "complexity_level": "High",
        "required_skill": "General Banking",
        "digital_available": True,
        "priority_level": "Standard",
        "base_share": 0.04,
    },
    {
        "service_id": "SRV11",
        "service_type": "Complaint",
        "category_group": "Customer Support",
        "average_service_time": 16.5,
        "minimum_service_time": 8.0,
        "maximum_service_time": 32.0,
        "complexity_level": "Medium",
        "required_skill": "Customer Support",
        "digital_available": True,
        "priority_level": "Urgent",
        "base_share": 0.04,
    },
    {
        "service_id": "SRV12",
        "service_type": "General Customer Support",
        "category_group": "Customer Support",
        "average_service_time": 10.0,
        "minimum_service_time": 4.0,
        "maximum_service_time": 20.0,
        "complexity_level": "Low",
        "required_skill": "Customer Support",
        "digital_available": True,
        "priority_level": "Standard",
        "base_share": 0.06,
    },
    {
        "service_id": "SRV13",
        "service_type": "Statement Request",
        "category_group": "Account Services",
        "average_service_time": 5.0,
        "minimum_service_time": 2.0,
        "maximum_service_time": 10.0,
        "complexity_level": "Low",
        "required_skill": "Account Services",
        "digital_available": True,
        "priority_level": "Standard",
        "base_share": 0.05,
    },
    {
        "service_id": "SRV14",
        "service_type": "Digital Banking Support",
        "category_group": "Digital & Tech Assistance",
        "average_service_time": 12.5,
        "minimum_service_time": 5.0,
        "maximum_service_time": 25.0,
        "complexity_level": "Medium",
        "required_skill": "Account Services",
        "digital_available": False,
        "priority_level": "Standard",
        "base_share": 0.04,
    },
]

SKILL_ROSTER = [
    "Cash",
    "KYC",
    "Account Services",
    "Loans",
    "Credit Cards",
    "Customer Support",
    "General Banking",
]

CUSTOMER_SEGMENTS = [
    {"segment": "Retail", "weight": 0.35, "digital_tendency": 0.45},
    {"segment": "Salaried", "weight": 0.28, "digital_tendency": 0.75},
    {"segment": "Senior", "weight": 0.14, "digital_tendency": 0.20},
    {"segment": "Small Business", "weight": 0.11, "digital_tendency": 0.40},
    {"segment": "Student", "weight": 0.07, "digital_tendency": 0.85},
    {"segment": "Premium", "weight": 0.05, "digital_tendency": 0.65},
]


# ─────────────────────────────────────────────────────────────────────────────
# 2. GENERATION FUNCTIONS
# ─────────────────────────────────────────────────────────────────────────────

def generate_branches(output_dir: Path) -> pd.DataFrame:
    """Generate branch reference data with operational profiles."""
    df = pd.DataFrame(BRANCH_DEFINITIONS)
    output_path = output_dir / "branches.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} branches -> {output_path}")
    return df


def generate_services(output_dir: Path) -> pd.DataFrame:
    """Generate service category metadata."""
    df = pd.DataFrame(SERVICE_CATEGORIES)
    output_path = output_dir / "services.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} services -> {output_path}")
    return df


def generate_staff(output_dir: Path, branches_df: pd.DataFrame) -> pd.DataFrame:
    """
    Generate realistic staff members across 10 branches.
    Staff roles and skills are heterogeneous:
    - Dedicated tellers (Cash)
    - KYC officers
    - Loan officers
    - Relationship managers (Wealth / General Banking)
    - Customer Support executives
    """
    staff_records = []
    staff_id_counter = 1

    # Staff count per branch roughly proportional to counters
    for _, branch in branches_df.iterrows():
        b_id = branch["branch_id"]
        counters = branch["number_of_counters"]
        # Staff count is typically counters + 1 or 2 for shifts/relief
        num_staff = counters + random.randint(1, 2)

        # Allocate realistic skill composition
        role_templates = [
            ("Senior Cashier / Teller", "Cash", ["Cash", "General Banking"], "Senior"),
            ("Cash Teller", "Cash", ["Cash"], "Mid"),
            ("Junior Cash Teller", "Cash", ["Cash"], "Junior"),
            ("KYC & Compliance Officer", "KYC", ["KYC", "Account Services"], "Senior"),
            ("KYC Specialist", "KYC", ["KYC"], "Mid"),
            ("Account Services Officer", "Account Services", ["Account Services", "KYC"], "Mid"),
            ("Loan Officer", "Loans", ["Loans", "Credit Cards"], "Senior"),
            ("Assistant Loan Officer", "Loans", ["Loans"], "Junior"),
            ("Credit Card Specialist", "Credit Cards", ["Credit Cards", "Customer Support"], "Mid"),
            ("Customer Support Representative", "Customer Support", ["Customer Support", "General Banking"], "Junior"),
            ("Senior Service Executive", "Customer Support", ["Customer Support", "Account Services"], "Senior"),
            ("Wealth Relationship Manager", "General Banking", ["General Banking", "Account Services"], "Senior"),
            ("Branch Operations Assistant", "General Banking", ["General Banking", "Cash"], "Mid"),
        ]

        # Select roles for this branch
        selected_roles = role_templates[:num_staff]
        if len(selected_roles) < num_staff:
            selected_roles += random.choices(role_templates, k=num_staff - len(selected_roles))

        for role_title, primary_skill, secondary_skills, exp in selected_roles:
            st_id = f"STF_{staff_id_counter:04d}"
            staff_id_counter += 1

            shift_start = "09:00:00" if random.random() < 0.5 else "09:30:00"
            shift_end = "17:30:00" if shift_start == "09:00:00" else "18:00:00"
            availability_rate = round(random.uniform(0.88, 0.98), 2)

            staff_records.append({
                "staff_id": st_id,
                "branch_id": b_id,
                "role": role_title,
                "primary_skill": primary_skill,
                "secondary_skills": ";".join(secondary_skills),
                "shift_start": shift_start,
                "shift_end": shift_end,
                "availability": availability_rate,
                "experience_level": exp,
                "status": "Active" if random.random() < 0.94 else "On-Leave",
            })

    df = pd.DataFrame(staff_records)
    output_path = output_dir / "staff.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} staff members -> {output_path}")
    return df


def generate_customers(output_dir: Path, num_customers: int = 15000) -> pd.DataFrame:
    """Generate synthetic customer profiles without any real PII."""
    customers = []
    age_groups = ["18-25", "26-35", "36-50", "51-65", "65+"]
    age_weights = [0.15, 0.35, 0.28, 0.14, 0.08]
    channels = ["Branch", "Mobile App", "Net Banking", "ATM"]
    areas = [
        "MG Road / CBD", "Electronic City", "Chickpet Market",
        "Jayanagar Residential", "Jnana Bharati Campus", "Whitefield",
        "Indiranagar", "Sadashivanagar", "Peenya Industrial Area", "Hebbal Outer Ring"
    ]

    seg_choices = [s["segment"] for s in CUSTOMER_SEGMENTS]
    seg_weights = [s["weight"] for s in CUSTOMER_SEGMENTS]

    for i in range(1, num_customers + 1):
        c_id = f"CUST_{i:05d}"
        segment = random.choices(seg_choices, weights=seg_weights)[0]
        age_group = random.choices(age_groups, weights=age_weights)[0]

        # Determine digital usage based on age and segment
        if age_group in ["18-25", "26-35"] or segment in ["Student", "Salaried"]:
            digital_usage = random.choices(["High", "Medium", "Low"], weights=[0.60, 0.30, 0.10])[0]
        elif age_group == "65+" or segment == "Senior":
            digital_usage = random.choices(["High", "Medium", "Low"], weights=[0.05, 0.25, 0.70])[0]
        else:
            digital_usage = random.choices(["High", "Medium", "Low"], weights=[0.30, 0.45, 0.25])[0]

        pref_channel = "Mobile App" if digital_usage == "High" else ("Branch" if digital_usage == "Low" else random.choice(channels))
        service_freq = random.choices(["Frequent", "Occasional", "Rare"], weights=[0.20, 0.55, 0.25])[0]
        high_value = 1 if (segment in ["Premium", "Small Business"] or (segment == "Salaried" and random.random() < 0.2)) else 0

        customers.append({
            "customer_id": c_id,
            "age_group": age_group,
            "customer_segment": segment,
            "preferred_channel": pref_channel,
            "digital_banking_usage": digital_usage,
            "location_area": random.choice(areas),
            "service_frequency": service_freq,
            "high_value_service_flag": high_value,
        })

    df = pd.DataFrame(customers)
    output_path = output_dir / "customers.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} synthetic customer profiles -> {output_path}")
    return df


def generate_calendar(output_dir: Path, start_date_str: str = "2025-10-01", days: int = 180) -> pd.DataFrame:
    """
    Generate calendar and external factors:
    - Days of week
    - Holidays (National, Festival)
    - Salary periods (28th-5th of every month)
    - Month-start and Month-end
    - Seasonal factors
    - Local events
    """
    start_date = datetime.datetime.strptime(start_date_str, "%Y-%m-%d").date()
    calendar_records = []

    # Known public bank holidays in Karnataka / India within the period
    holiday_dict = {
        "2025-10-02": ("Gandhi Jayanti", "National"),
        "2025-10-20": ("Diwali / Deepavali", "Festival"),
        "2025-10-21": ("Diwali Balipadyami", "Festival"),
        "2025-11-01": ("Kannada Rajyotsava", "Regional"),
        "2025-12-25": ("Christmas Day", "National"),
        "2026-01-01": ("New Year Bank Closure", "Annual"),
        "2026-01-14": ("Makar Sankranti / Pongal", "Festival"),
        "2026-01-26": ("Republic Day", "National"),
        "2026-03-04": ("Holi", "Festival"),
        "2026-03-20": ("Ugadi / Telugu New Year", "Regional"),
    }

    for d in range(days):
        curr_date = start_date + datetime.timedelta(days=d)
        date_str = curr_date.strftime("%Y-%m-%d")
        dow_num = curr_date.weekday()  # 0=Monday, 6=Sunday
        dow_names = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
        dow_str = dow_names[dow_num]

        # Indian banks are closed on Sundays and 2nd/4th Saturdays
        dom = curr_date.day
        is_sunday = (dow_num == 6)
        # Check if 2nd or 4th Saturday:
        is_saturday = (dow_num == 5)
        sat_num = (dom - 1) // 7 + 1
        is_bank_saturday_off = is_saturday and (sat_num in [2, 4])

        is_weekend = is_sunday or is_bank_saturday_off
        is_holiday_named = date_str in holiday_dict
        is_holiday = is_weekend or is_holiday_named

        h_name, h_type = holiday_dict.get(date_str, ("Regular Banking Day", "Working Day"))
        if is_sunday:
            h_name, h_type = "Sunday", "Weekend"
        elif is_bank_saturday_off:
            h_name, h_type = f"{sat_num}th Saturday", "Weekend"

        # Salary period: 28th to 5th
        is_salary_period = (dom >= 28 or dom <= 5)
        is_month_start = (dom <= 3)
        is_month_end = (dom >= 26)

        # Seasonal period
        month = curr_date.month
        if month in [10, 11]:
            seasonal_period = "Festive Season"
        elif month in [1, 2, 3]:
            seasonal_period = "Fiscal Year-End Tax Planning"
        else:
            seasonal_period = "Regular Operations"

        # Local event simulation
        local_event_flag = 1 if (random.random() < 0.05 and not is_holiday) else 0
        event_impact = 1.25 if local_event_flag else 1.0

        calendar_records.append({
            "date": date_str,
            "day_of_week": dow_str,
            "is_weekend": int(is_weekend),
            "is_holiday": int(is_holiday),
            "holiday_name": h_name,
            "holiday_type": h_type,
            "is_salary_period": int(is_salary_period),
            "is_month_start": int(is_month_start),
            "is_month_end": int(is_month_end),
            "seasonal_period": seasonal_period,
            "local_event_flag": local_event_flag,
            "event_impact_factor": event_impact,
        })

    df = pd.DataFrame(calendar_records)
    output_path = output_dir / "calendar.csv"
    df.to_csv(output_path, index=False)
    print(f"Generated {len(df)} calendar days -> {output_path}")
    return df


def generate_appointments_and_visits(
    output_dir: Path,
    branches_df: pd.DataFrame,
    services_df: pd.DataFrame,
    staff_df: pd.DataFrame,
    customers_df: pd.DataFrame,
    calendar_df: pd.DataFrame,
    target_visits: int = 65000,
) -> tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Generates appointments, visits, tokens, and feedback with realistic queuing relationships:
    - Queue growth during peak hours
    - Non-linear wait time escalation under high load
    - Longer service duration for complex services (Loans, Account Opening)
    - Realistic staff assignment with skill matching
    - Feedback ratings directly correlated to waiting time and staff service
    """
    open_calendar = calendar_df[calendar_df["is_holiday"] == 0].copy().reset_index(drop=True)
    num_open_days = len(open_calendar)
    print(f"Simulating visits over {num_open_days} banking operating days...")

    # Build lookup dictionaries
    service_dict = {row["service_type"]: row for _, row in services_df.iterrows()}
    service_names = list(service_dict.keys())
    service_shares = [service_dict[s]["base_share"] for s in service_names]
    # Normalize shares
    total_share = sum(service_shares)
    service_shares = [s / total_share for s in service_shares]

    branch_dict = {row["branch_id"]: row for _, row in branches_df.iterrows()}
    customer_ids = customers_df["customer_id"].tolist()
    customer_map = {row["customer_id"]: row for _, row in customers_df.iterrows()}

    # Group staff by branch and skill
    staff_by_branch_skill: dict[str, dict[str, list[dict]]] = {}
    for _, st in staff_df.iterrows():
        b_id = st["branch_id"]
        if b_id not in staff_by_branch_skill:
            staff_by_branch_skill[b_id] = {skill: [] for skill in SKILL_ROSTER}
        primary = st["primary_skill"]
        if primary in staff_by_branch_skill[b_id]:
            staff_by_branch_skill[b_id][primary].append(st.to_dict())
        for sec in st["secondary_skills"].split(";"):
            if sec in staff_by_branch_skill[b_id] and sec != primary:
                staff_by_branch_skill[b_id][sec].append(st.to_dict())

    # Hourly distribution weights (09:00 to 16:00)
    # Peak 1: 10:00 - 11:30, Peak 2: 13:00 - 14:00 (lunch), Peak 3: 15:00 - 16:00
    hourly_arrival_weights = {
        9: 0.08,
        10: 0.18,
        11: 0.20,
        12: 0.14,
        13: 0.16,
        14: 0.10,
        15: 0.12,
        16: 0.02,
    }

    appointments_list = []
    visits_list = []
    tokens_list = []
    feedback_list = []

    visit_counter = 1
    appointment_counter = 1
    token_counter = 1
    feedback_counter = 1

    # Base visits per day per branch
    # Target 65,000 visits across ~140 open days and 10 branches => ~46 visits/branch/day baseline
    base_visits_per_branch_day = target_visits / (num_open_days * len(branches_df))

    # Pre-select days with simulated staff shortage events (e.g., flu season, training days)
    shortage_events = set()
    for b in branches_df["branch_id"]:
        sampled_shortage_days = random.sample(range(num_open_days), k=max(3, num_open_days // 15))
        for day_idx in sampled_shortage_days:
            shortage_events.add((b, day_idx))

    for day_idx, cal_row in open_calendar.iterrows():
        date_str = cal_row["date"]
        dow = cal_row["day_of_week"]
        is_salary = cal_row["is_salary_period"]
        is_month_start = cal_row["is_month_start"]
        is_month_end = cal_row["is_month_end"]
        local_event = cal_row["local_event_flag"]

        # Day of week multiplier (Mondays and Fridays are heavier)
        dow_mult = 1.22 if dow in ["Monday", "Friday"] else (1.10 if dow == "Saturday" else 0.95)
        # Salary period multiplier
        salary_mult = 1.30 if is_salary else 1.0
        # Month end multiplier
        month_end_mult = 1.15 if is_month_end else 1.0

        for _, branch in branches_df.iterrows():
            b_id = branch["branch_id"]
            b_mult = branch["traffic_multiplier"]
            has_staff_shortage = (b_id, day_idx) in shortage_events

            # Calculate daily visits for this branch on this day
            daily_mean = base_visits_per_branch_day * b_mult * dow_mult * salary_mult * month_end_mult
            if local_event and b_id in ["BR002", "BR003", "BR006"]:
                daily_mean *= 1.25

            num_day_visits = max(15, int(np.random.poisson(daily_mean)))

            # Service distribution adjustment for branch type:
            branch_service_shares = list(service_shares)
            if branch["branch_type"] == "Commercial / Wholesale Market":
                # More Cash and Cheques
                branch_service_shares[0] *= 1.6  # Cash Withdrawal
                branch_service_shares[1] *= 1.8  # Cash Deposit
                branch_service_shares[5] *= 1.7  # Cheque Services
            elif branch["branch_type"] == "Corporate MSME Hub":
                # More Loans and Accounts
                branch_service_shares[6] *= 1.8  # Loan Enquiry
                branch_service_shares[7] *= 2.0  # Loan Application
                branch_service_shares[2] *= 1.4  # Account Opening
            elif branch["branch_type"] == "Affluent Residential / Wealth":
                branch_service_shares[9] *= 2.5  # Investment Enquiry
                branch_service_shares[8] *= 1.5  # Credit Card Service

            # Normalize branch service shares
            s_sum = sum(branch_service_shares)
            branch_service_shares = [s / s_sum for s in branch_service_shares]

            # Generate appointments first (approx 12% of visits)
            num_appointments = int(num_day_visits * random.uniform(0.10, 0.16))
            day_appointments_custs = random.sample(customer_ids, k=min(num_appointments, len(customer_ids)))

            # Track ongoing counter availability in minutes from 09:30 (minute 0 = 09:30, minute 420 = 16:30)
            # Counters count
            num_counters = branch["number_of_counters"]
            if has_staff_shortage:
                # 25-40% of counters unstaffed today!
                effective_counters = max(2, int(num_counters * random.uniform(0.55, 0.70)))
            else:
                effective_counters = num_counters

            # Simulated queue per skill category to track waiting buildup
            counter_next_available = [0.0] * effective_counters

            # Generate hourly arrival schedule
            hours = list(hourly_arrival_weights.keys())
            h_weights = [hourly_arrival_weights[h] for h in hours]

            # Distribute visits across hours
            hourly_visits_counts = np.random.multinomial(num_day_visits, h_weights)

            current_queue_depth = 0

            for h_idx, hour in enumerate(hours):
                n_visits_this_hour = hourly_visits_counts[h_idx]

                for _ in range(n_visits_this_hour):
                    v_id = f"VIS_{visit_counter:07d}"
                    visit_counter += 1

                    cust_id = random.choice(customer_ids)
                    cust_info = customer_map[cust_id]

                    # Service choice
                    selected_service = random.choices(service_names, weights=branch_service_shares)[0]
                    srv_meta = service_dict[selected_service]
                    req_skill = srv_meta["required_skill"]

                    # Check if appointment
                    is_appointment = 0
                    if day_appointments_custs and random.random() < 0.20:
                        is_appointment = 1
                        app_cust = day_appointments_custs.pop()
                        cust_id = app_cust
                        app_id = f"APP_{appointment_counter:06d}"
                        appointment_counter += 1

                        app_status = random.choices(["Completed", "Cancelled", "No-Show"], weights=[0.88, 0.08, 0.04])[0]
                        app_time = f"{date_str} {hour:02d}:{random.randint(0, 55):02d}:00"

                        appointments_list.append({
                            "appointment_id": app_id,
                            "customer_id": cust_id,
                            "branch_id": b_id,
                            "appointment_timestamp": app_time,
                            "service_type": selected_service,
                            "appointment_status": app_status,
                            "expected_duration": srv_meta["average_service_time"],
                        })

                    # Minute of arrival within the day (0 = 09:30, 60 = 10:30, etc.)
                    # Hour 9 = 09:30 to 10:00 (minutes 0 to 30)
                    if hour == 9:
                        arrival_min = random.uniform(0, 30)
                    else:
                        base_min = (hour - 9.5) * 60
                        arrival_min = base_min + random.uniform(0, 59)

                    # Arrival timestamp
                    arr_hour = int(9.5 + arrival_min // 60)
                    arr_minute = int(arrival_min % 60)
                    arr_sec = random.randint(0, 59)
                    arr_dt = datetime.datetime.strptime(f"{date_str} {arr_hour:02d}:{arr_minute:02d}:{arr_sec:02d}", "%Y-%m-%d %H:%M:%S")

                    # Find earliest available counter
                    earliest_counter_idx = int(np.argmin(counter_next_available))
                    earliest_avail_min = counter_next_available[earliest_counter_idx]

                    # Queue mechanics:
                    # If counter is free, wait is minimal (1-3 mins token delay)
                    # If all counters busy, customer waits until earliest counter finishes
                    if arrival_min >= earliest_avail_min:
                        # No physical queue, just quick token dispatch
                        wait_minutes = round(random.uniform(0.8, 3.5), 1)
                        service_start_min = arrival_min + wait_minutes
                        current_queue_depth = max(0, current_queue_depth - 1)
                    else:
                        # Queuing delay: customer arrives before counter is free
                        raw_wait = min(50.0, earliest_avail_min - arrival_min)
                        # If appointment, priority queue cuts wait by 50%
                        if is_appointment:
                            raw_wait *= 0.50
                        # Queue buildup factor during peak hours or staff shortage
                        if has_staff_shortage:
                            raw_wait *= 1.25
                        wait_minutes = round(max(2.0, min(65.0, raw_wait + random.uniform(0.5, 2.5))), 1)
                        service_start_min = arrival_min + wait_minutes
                        current_queue_depth += 1

                    # Service duration calculation based on service complexity and noise
                    avg_dur = srv_meta["average_service_time"]
                    min_dur = srv_meta["minimum_service_time"]
                    max_dur = srv_meta["maximum_service_time"]

                    # Log-normal distribution for service duration (skewed positive)
                    duration = float(np.random.normal(avg_dur, (max_dur - min_dur) / 5.5))
                    duration = round(max(min_dur, min(max_dur * 1.25, duration)), 1)

                    service_end_min = service_start_min + duration

                    # Update counter next available time
                    counter_next_available[earliest_counter_idx] = service_end_min

                    # Timestamps
                    srv_start_hour = int(9.5 + service_start_min // 60)
                    srv_start_minute = int(service_start_min % 60)
                    srv_start_sec = random.randint(0, 59)
                    # Cap within realistic range
                    srv_start_dt = arr_dt + datetime.timedelta(minutes=wait_minutes)
                    srv_end_dt = srv_start_dt + datetime.timedelta(minutes=duration)

                    # Determine completion status (Abandonment occurs if wait > 38 mins)
                    completion_status = "Completed"
                    if wait_minutes > 38.0 and not is_appointment and random.random() < 0.65:
                        completion_status = "Abandoned"
                        # If abandoned, service was never started
                        duration = 0.0
                        srv_end_dt = srv_start_dt

                    # Staff assignment: Match skilled staff for this branch
                    avail_skilled_staff = staff_by_branch_skill.get(b_id, {}).get(req_skill, [])
                    if avail_skilled_staff:
                        assigned_staff = random.choice(avail_skilled_staff)["staff_id"]
                    else:
                        # Fallback to any staff member in branch
                        all_branch_staff = [s for s in staff_df[staff_df["branch_id"] == b_id]["staff_id"]]
                        assigned_staff = random.choice(all_branch_staff) if all_branch_staff else "STF_0001"

                    token_num = f"{selected_service[:2].upper()}-{token_counter % 900 + 100}"
                    token_counter += 1

                    channel = "Appointment" if is_appointment else "Walk-in"

                    # Visit record
                    visits_list.append({
                        "visit_id": v_id,
                        "customer_id": cust_id,
                        "branch_id": b_id,
                        "arrival_timestamp": arr_dt.strftime("%Y-%m-%d %H:%M:%S"),
                        "service_type": selected_service,
                        "token_number": token_num,
                        "queue_position": current_queue_depth,
                        "service_start_timestamp": srv_start_dt.strftime("%Y-%m-%d %H:%M:%S"),
                        "service_end_timestamp": srv_end_dt.strftime("%Y-%m-%d %H:%M:%S"),
                        "service_duration": duration,
                        "waiting_time": wait_minutes,
                        "completion_status": completion_status,
                        "staff_id": assigned_staff,
                        "channel": channel,
                        "appointment_flag": is_appointment,
                    })

                    # Token record
                    tok_id = f"TOK_{token_counter:07d}"
                    tokens_list.append({
                        "token_id": tok_id,
                        "visit_id": v_id,
                        "branch_id": b_id,
                        "service_type": selected_service,
                        "issue_time": arr_dt.strftime("%Y-%m-%d %H:%M:%S"),
                        "called_time": srv_start_dt.strftime("%Y-%m-%d %H:%M:%S"),
                        "waiting_time": wait_minutes,
                        "counter_number": earliest_counter_idx + 1,
                        "staff_id": assigned_staff,
                        "queue_status": "Served" if completion_status == "Completed" else "Expired",
                    })

                    # Generate customer feedback conditionally (approx 14% of visits leave feedback)
                    if random.random() < 0.14:
                        fb_id = f"FB_{feedback_counter:06d}"
                        feedback_counter += 1

                        # Realistic relationship: High waiting time -> Low rating & Negative sentiment!
                        if completion_status == "Abandoned":
                            rating = 1
                            sentiment = "Negative"
                            issue_cat = "Waiting Time"
                            feedback_text = random.choice([
                                "I waited over 40 minutes and no counter called my token. Had to leave without service.",
                                "Terrible queue management. Left after 45 minutes of waiting.",
                                "Waited far too long, the branch was suffocatingly crowded so I abandoned my visit.",
                                "The queue was barely moving. Token display was completely stagnant.",
                            ])
                        elif wait_minutes > 25.0:
                            rating = random.choices([1, 2], weights=[0.65, 0.35])[0]
                            sentiment = "Negative"
                            issue_cat = random.choices(
                                ["Waiting Time", "Branch Congestion", "Staff Shortage"],
                                weights=[0.55, 0.25, 0.20]
                            )[0]
                            if issue_cat == "Waiting Time":
                                feedback_text = random.choice([
                                    f"Waited nearly {int(wait_minutes)} minutes before my token was called. Way too slow.",
                                    "Waiting time is unbearable during peak hours. Please add more counters.",
                                    f"Spent {int(wait_minutes)} minutes waiting for a simple {selected_service}.",
                                    "Token queue took forever. Needs serious optimization.",
                                ])
                            elif issue_cat == "Branch Congestion":
                                feedback_text = random.choice([
                                    "Branch was overcrowded, no seating space and long queues.",
                                    "Complete chaos at the counter area today. Waiting area was packed.",
                                    "Congestion was very high today, waited a long time standing.",
                                ])
                            else:
                                feedback_text = random.choice([
                                    "Only two counters were operating while dozens of people were waiting.",
                                    "Staff seemed overloaded and desks were empty.",
                                    f"Severe staff shortage for {selected_service} desk today.",
                                ])
                        elif wait_minutes > 12.0:
                            rating = random.choices([2, 3, 4], weights=[0.25, 0.50, 0.25])[0]
                            sentiment = "Neutral" if rating == 3 else ("Negative" if rating == 2 else "Positive")
                            issue_cat = random.choice(["Service Quality", "Staff Behavior", "General Experience"])
                            feedback_text = random.choice([
                                "Service was acceptable, but waited around 15 minutes.",
                                "Counter staff was polite, though the queue took longer than expected.",
                                "Standard banking experience. Could be faster.",
                                f"Completed my {selected_service}. Moderate wait time today.",
                            ])
                        else:
                            # Fast service!
                            rating = random.choices([4, 5], weights=[0.35, 0.65])[0]
                            sentiment = "Positive"
                            issue_cat = random.choices(
                                ["Service Quality", "Staff Behavior", "Digital Service Experience", "Appointment Experience"],
                                weights=[0.35, 0.35, 0.15, 0.15]
                            )[0]
                            if is_appointment:
                                feedback_text = random.choice([
                                    "Booking an appointment worked wonders! Called within 2 minutes of arrival.",
                                    "Appointment system saved me so much time today. Great job.",
                                    "In and out smoothly thanks to prior booking.",
                                ])
                            elif srv_meta["digital_available"] and random.random() < 0.3:
                                feedback_text = random.choice([
                                    f"Quick service at counter! Executive also guided me on how to do {selected_service} online.",
                                    "Great assistance. The staff helped me install the mobile app for future requests.",
                                    "Fast token turnaround and clear guidance on digital self-service.",
                                ])
                            else:
                                feedback_text = random.choice([
                                    f"Very swift {selected_service} at the counter. Handled in less than 10 minutes!",
                                    "The staff explained the process clearly and served me with zero fuss.",
                                    "Impressive speed and courteous behavior from the counter executive.",
                                    "Seamless experience, token was called almost immediately.",
                                ])

                        feedback_list.append({
                            "feedback_id": fb_id,
                            "customer_id": cust_id,
                            "branch_id": b_id,
                            "timestamp": srv_end_dt.strftime("%Y-%m-%d %H:%M:%S"),
                            "service_type": selected_service,
                            "feedback_text": feedback_text,
                            "rating": rating,
                            "sentiment_label": sentiment,
                            "issue_category": issue_cat,
                            "waiting_time_experienced": wait_minutes,
                        })

    appointments_df = pd.DataFrame(appointments_list)
    visits_df = pd.DataFrame(visits_list)
    tokens_df = pd.DataFrame(tokens_list)
    feedback_df = pd.DataFrame(feedback_list)

    # Save to processed directory
    appointments_df.to_csv(output_dir / "appointments.csv", index=False)
    visits_df.to_csv(output_dir / "visits.csv", index=False)
    tokens_df.to_csv(output_dir / "queue_data.csv", index=False)
    feedback_df.to_csv(output_dir / "feedback.csv", index=False)

    print(f"Generated {len(appointments_df)} appointments -> {output_dir / 'appointments.csv'}")
    print(f"Generated {len(visits_df)} visits -> {output_dir / 'visits.csv'}")
    print(f"Generated {len(tokens_df)} tokens/queue logs -> {output_dir / 'queue_data.csv'}")
    print(f"Generated {len(feedback_df)} customer feedback records -> {output_dir / 'feedback.csv'}")

    return appointments_df, visits_df, tokens_df, feedback_df


def save_copy_to_raw(processed_dir: Path, raw_dir: Path) -> None:
    """Save raw copies of all generated data for provenance."""
    for file in processed_dir.glob("*.csv"):
        dest = raw_dir / file.name
        dest.write_bytes(file.read_bytes())
    print(f"Saved exact raw copies to {raw_dir}")


def main() -> None:
    parser = argparse.ArgumentParser(description="AVENUE Synthetic Banking Data Generator")
    parser.add_argument("--seed", type=int, default=42, help="Random seed for reproducibility")
    parser.add_argument("--days", type=int, default=180, help="Number of calendar days (default 180)")
    parser.add_argument("--target-visits", type=int, default=65000, help="Target visits (default 65000)")
    parser.add_argument("--customers", type=int, default=15000, help="Customer profiles (default 15000)")
    parser.add_argument("--output-dir", type=str, default=None, help="Custom output directory")
    args = parser.parse_args()

    set_seed(args.seed)

    base_dir = Path(__file__).resolve().parent
    # Handle whether running in data/ or branchiq/data/
    processed_dir = Path(args.output_dir) if args.output_dir else base_dir / "processed"
    raw_dir = base_dir / "raw"

    processed_dir.mkdir(parents=True, exist_ok=True)
    raw_dir.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("AVENUE SYNTHETIC DATA GENERATION PIPELINE")
    print("==================================================")
    print(f"Output directory: {processed_dir}")
    print(f"Calendar days:    {args.days}")
    print(f"Target visits:    {args.target_visits}")
    print(f"Random seed:      {args.seed}")
    print("==================================================")

    branches_df = generate_branches(processed_dir)
    services_df = generate_services(processed_dir)
    staff_df = generate_staff(processed_dir, branches_df)
    customers_df = generate_customers(processed_dir, num_customers=args.customers)
    calendar_df = generate_calendar(processed_dir, days=args.days)

    generate_appointments_and_visits(
        output_dir=processed_dir,
        branches_df=branches_df,
        services_df=services_df,
        staff_df=staff_df,
        customers_df=customers_df,
        calendar_df=calendar_df,
        target_visits=args.target_visits,
    )

    save_copy_to_raw(processed_dir, raw_dir)

    # If running from root data/, also sync to branchiq/data/ if it exists
    alt_dir = Path("branchiq/data") if not str(base_dir).endswith("branchiq\\data") and not str(base_dir).endswith("branchiq/data") else Path("data")
    if alt_dir.exists():
        alt_proc = alt_dir / "processed"
        alt_raw = alt_dir / "raw"
        alt_proc.mkdir(parents=True, exist_ok=True)
        alt_raw.mkdir(parents=True, exist_ok=True)
        for f in processed_dir.glob("*.csv"):
            (alt_proc / f.name).write_bytes(f.read_bytes())
        for f in raw_dir.glob("*.csv"):
            (alt_raw / f.name).write_bytes(f.read_bytes())
        print(f"Synchronized datasets to alternate directory: {alt_dir}")

    print("==================================================")
    print("DATA GENERATION COMPLETED SUCCESSFULLY!")
    print("==================================================")


if __name__ == "__main__":
    main()
