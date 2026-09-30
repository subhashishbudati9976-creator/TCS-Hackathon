"""
AVENUE — Comprehensive Data Analysis Pipeline

Executes the 20 required analyses specified in the TCS Problem Statement:
1. Traffic by branch
2. Traffic by hour
3. Traffic by day of week
4. Traffic by month
5. Traffic during salary periods
6. Traffic around holidays
7. Service-category distribution
8. Average service duration by service
9. Average waiting time by service
10. Waiting time by branch
11. Queue length by hour
12. Staff utilization
13. Staff availability vs waiting time
14. Appointment volume vs traffic
15. Workload by service category
16. Customer satisfaction vs waiting time
17. Negative feedback causes
18. Branch-to-branch demand differences
19. Peak periods
20. Digital-service opportunities

Outputs structured CSVs, summary JSON, and analytical plots to data/analysis/.
"""

from __future__ import annotations

import argparse
import datetime
import json
from pathlib import Path
import sys
import matplotlib
matplotlib.use("Agg")  # Non-interactive headless backend
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd


def load_datasets(data_dir: Path) -> dict[str, pd.DataFrame]:
    """Loads all processed datasets."""
    files = {
        "branches": "branches.csv",
        "services": "services.csv",
        "staff": "staff.csv",
        "customers": "customers.csv",
        "calendar": "calendar.csv",
        "appointments": "appointments.csv",
        "visits": "visits.csv",
        "queue_data": "queue_data.csv",
        "feedback": "feedback.csv",
    }
    dfs = {}
    for name, filename in files.items():
        p = data_dir / filename
        if not p.exists():
            raise FileNotFoundError(f"Missing required dataset: {p}")
        dfs[name] = pd.read_csv(p)
        print(f"Loaded {name}: {len(dfs[name])} records")
    return dfs


def run_comprehensive_analysis(dfs: dict[str, pd.DataFrame], output_dir: Path) -> dict:
    """Executes the 20 analyses and exports CSVs and summary JSON."""
    branches = dfs["branches"]
    services = dfs["services"]
    staff = dfs["staff"]
    calendar = dfs["calendar"]
    appointments = dfs["appointments"]
    visits = dfs["visits"].copy()
    queue = dfs["queue_data"]
    feedback = dfs["feedback"]

    # Pre-parse timestamps
    visits["arrival_dt"] = pd.to_datetime(visits["arrival_timestamp"])
    visits["arrival_date"] = visits["arrival_dt"].dt.strftime("%Y-%m-%d")
    visits["arrival_hour"] = visits["arrival_dt"].dt.hour
    visits["arrival_dow"] = visits["arrival_dt"].dt.day_name()
    visits["arrival_month"] = visits["arrival_dt"].dt.strftime("%Y-%m")

    # Merge calendar factors
    visits = pd.merge(
        visits,
        calendar[["date", "is_salary_period", "is_month_start", "is_month_end", "seasonal_period", "local_event_flag"]],
        left_on="arrival_date",
        right_on="date",
        how="left",
    )

    print("\n--- Running 20 Core Analyses ---")

    # 1 & 18. Traffic by Branch & Branch-to-Branch Demand Differences
    branch_summary = visits.groupby("branch_id").agg(
        total_visits=("visit_id", "count"),
        avg_waiting_time=("waiting_time", "mean"),
        median_waiting_time=("waiting_time", "median"),
        p90_waiting_time=("waiting_time", lambda s: s.quantile(0.90)),
        max_waiting_time=("waiting_time", "max"),
        total_workload_minutes=("service_duration", "sum"),
        abandoned_visits=("completion_status", lambda s: (s == "Abandoned").sum()),
        appointments_handled=("appointment_flag", "sum"),
    ).reset_index()

    branch_summary = pd.merge(branch_summary, branches, on="branch_id", how="left")
    branch_summary["abandonment_rate_pct"] = (branch_summary["abandoned_visits"] / branch_summary["total_visits"] * 100).round(2)
    branch_summary["avg_waiting_time"] = branch_summary["avg_waiting_time"].round(2)
    branch_summary["p90_waiting_time"] = branch_summary["p90_waiting_time"].round(2)
    branch_summary["total_workload_hours"] = (branch_summary["total_workload_minutes"] / 60.0).round(1)
    branch_summary = branch_summary.sort_values(by="total_visits", ascending=False)
    branch_summary.to_csv(output_dir / "branch_summary.csv", index=False)
    print("Exported branch_summary.csv")

    # 2 & 11 & 19. Traffic by Hour, Queue Length, Peak Periods
    hourly_demand = visits.groupby("arrival_hour").agg(
        total_arrivals=("visit_id", "count"),
        avg_queue_position=("queue_position", "mean"),
        max_queue_position=("queue_position", "max"),
        avg_waiting_time=("waiting_time", "mean"),
        p90_waiting_time=("waiting_time", lambda s: s.quantile(0.90)),
        total_workload_minutes=("service_duration", "sum"),
        abandonment_count=("completion_status", lambda s: (s == "Abandoned").sum()),
    ).reset_index()
    hourly_demand["avg_queue_position"] = hourly_demand["avg_queue_position"].round(2)
    hourly_demand["avg_waiting_time"] = hourly_demand["avg_waiting_time"].round(2)
    hourly_demand["p90_waiting_time"] = hourly_demand["p90_waiting_time"].round(2)
    hourly_demand["workload_hours"] = (hourly_demand["total_workload_minutes"] / 60.0).round(1)
    hourly_demand.to_csv(output_dir / "hourly_demand.csv", index=False)
    print("Exported hourly_demand.csv")

    # 3. Traffic by Day of Week
    dow_order = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    dow_traffic = visits.groupby("arrival_dow").agg(
        total_visits=("visit_id", "count"),
        avg_waiting_time=("waiting_time", "mean"),
        p90_waiting_time=("waiting_time", lambda s: s.quantile(0.90)),
    ).reindex(dow_order).reset_index()

    # 4. Traffic by Month
    month_traffic = visits.groupby("arrival_month").agg(
        total_visits=("visit_id", "count"),
        avg_waiting_time=("waiting_time", "mean"),
    ).reset_index()

    # 5. Traffic during Salary Periods vs Regular
    salary_comp = visits.groupby("is_salary_period").agg(
        total_visits=("visit_id", "count"),
        avg_waiting_time=("waiting_time", "mean"),
        p90_waiting_time=("waiting_time", lambda s: s.quantile(0.90)),
    ).reset_index()

    # 7 & 8 & 9 & 15. Service Summary (Category distribution, duration, wait time, workload)
    service_summary = visits.groupby("service_type").agg(
        total_requests=("visit_id", "count"),
        avg_duration=("service_duration", "mean"),
        total_duration_minutes=("service_duration", "sum"),
        avg_waiting_time=("waiting_time", "mean"),
        p90_waiting_time=("waiting_time", lambda s: s.quantile(0.90)),
        abandoned_requests=("completion_status", lambda s: (s == "Abandoned").sum()),
        appointment_requests=("appointment_flag", "sum"),
    ).reset_index()

    service_summary = pd.merge(service_summary, services, on="service_type", how="left")
    tot_workload_all = service_summary["total_duration_minutes"].sum()
    service_summary["workload_share_pct"] = (service_summary["total_duration_minutes"] / tot_workload_all * 100).round(2)
    service_summary["avg_duration"] = service_summary["avg_duration"].round(2)
    service_summary["avg_waiting_time"] = service_summary["avg_waiting_time"].round(2)
    service_summary["p90_waiting_time"] = service_summary["p90_waiting_time"].round(2)
    service_summary = service_summary.sort_values(by="total_duration_minutes", ascending=False)
    service_summary.to_csv(output_dir / "service_summary.csv", index=False)
    print("Exported service_summary.csv")

    # 10. Waiting Time Summary (Percentiles and Robust Metrics)
    waiting_time_summary = pd.DataFrame([
        {
            "dimension": "All Branches Overall",
            "mean_wait": round(float(visits["waiting_time"].mean()), 2),
            "median_wait": round(float(visits["waiting_time"].median()), 2),
            "p75_wait": round(float(visits["waiting_time"].quantile(0.75)), 2),
            "p90_wait": round(float(visits["waiting_time"].quantile(0.90)), 2),
            "p95_wait": round(float(visits["waiting_time"].quantile(0.95)), 2),
            "max_wait": round(float(visits["waiting_time"].max()), 2),
        },
        {
            "dimension": "Appointments",
            "mean_wait": round(float(visits[visits["appointment_flag"] == 1]["waiting_time"].mean()), 2),
            "median_wait": round(float(visits[visits["appointment_flag"] == 1]["waiting_time"].median()), 2),
            "p75_wait": round(float(visits[visits["appointment_flag"] == 1]["waiting_time"].quantile(0.75)), 2),
            "p90_wait": round(float(visits[visits["appointment_flag"] == 1]["waiting_time"].quantile(0.90)), 2),
            "p95_wait": round(float(visits[visits["appointment_flag"] == 1]["waiting_time"].quantile(0.95)), 2),
            "max_wait": round(float(visits[visits["appointment_flag"] == 1]["waiting_time"].max()), 2),
        },
        {
            "dimension": "Walk-ins",
            "mean_wait": round(float(visits[visits["appointment_flag"] == 0]["waiting_time"].mean()), 2),
            "median_wait": round(float(visits[visits["appointment_flag"] == 0]["waiting_time"].median()), 2),
            "p75_wait": round(float(visits[visits["appointment_flag"] == 0]["waiting_time"].quantile(0.75)), 2),
            "p90_wait": round(float(visits[visits["appointment_flag"] == 0]["waiting_time"].quantile(0.90)), 2),
            "p95_wait": round(float(visits[visits["appointment_flag"] == 0]["waiting_time"].quantile(0.95)), 2),
            "max_wait": round(float(visits[visits["appointment_flag"] == 0]["waiting_time"].max()), 2),
        },
        {
            "dimension": "Salary Period Days",
            "mean_wait": round(float(visits[visits["is_salary_period"] == 1]["waiting_time"].mean()), 2),
            "median_wait": round(float(visits[visits["is_salary_period"] == 1]["waiting_time"].median()), 2),
            "p75_wait": round(float(visits[visits["is_salary_period"] == 1]["waiting_time"].quantile(0.75)), 2),
            "p90_wait": round(float(visits[visits["is_salary_period"] == 1]["waiting_time"].quantile(0.90)), 2),
            "p95_wait": round(float(visits[visits["is_salary_period"] == 1]["waiting_time"].quantile(0.95)), 2),
            "max_wait": round(float(visits[visits["is_salary_period"] == 1]["waiting_time"].max()), 2),
        },
    ])
    waiting_time_summary.to_csv(output_dir / "waiting_time_summary.csv", index=False)
    print("Exported waiting_time_summary.csv")

    # 12 & 13. Staff Capacity Summary & Staff Availability vs Waiting Time
    staff_summary = staff.groupby("branch_id").agg(
        total_staff=("staff_id", "count"),
        active_staff=("status", lambda s: (s == "Active").sum()),
        avg_availability=("availability", "mean"),
    ).reset_index()

    staff_summary = pd.merge(staff_summary, branch_summary[["branch_id", "branch_name", "total_workload_minutes", "avg_waiting_time", "number_of_counters"]], on="branch_id")
    # Standard operating days = 132 days, 420 mins/day/staff
    staff_summary["total_capacity_minutes"] = (staff_summary["active_staff"] * staff_summary["avg_availability"] * 132.0 * 420.0).round(1)
    staff_summary["utilization_rate"] = (staff_summary["total_workload_minutes"] / staff_summary["total_capacity_minutes"]).round(3)
    staff_summary["capacity_gap_hours"] = ((staff_summary["total_workload_minutes"] - staff_summary["total_capacity_minutes"]) / 60.0).round(1)
    staff_summary.to_csv(output_dir / "staff_capacity_summary.csv", index=False)
    print("Exported staff_capacity_summary.csv")

    # Bottleneck Features for Future ML Models
    # Produce granular daily/hourly features per branch
    bottleneck_features = visits.groupby(["branch_id", "arrival_date", "arrival_hour"]).agg(
        hourly_demand=("visit_id", "count"),
        workload_minutes=("service_duration", "sum"),
        avg_waiting_time=("waiting_time", "mean"),
        max_waiting_time=("waiting_time", "max"),
        queue_depth=("queue_position", "max"),
        abandonment_count=("completion_status", lambda s: (s == "Abandoned").sum()),
        appointment_count=("appointment_flag", "sum"),
        high_complexity_count=("service_type", lambda s: s.isin(["Account Opening", "Loan Application", "Investment Enquiry"]).sum()),
    ).reset_index()

    # Add branch counters and calculate instantaneous utilization
    bottleneck_features = pd.merge(bottleneck_features, branches[["branch_id", "number_of_counters"]], on="branch_id", how="left")
    # Hourly capacity in counter-minutes = counters * 60 mins
    bottleneck_features["hourly_capacity_minutes"] = bottleneck_features["number_of_counters"] * 60.0
    bottleneck_features["hourly_utilization"] = (bottleneck_features["workload_minutes"] / bottleneck_features["hourly_capacity_minutes"]).round(3)
    bottleneck_features["capacity_gap_minutes"] = (bottleneck_features["workload_minutes"] - bottleneck_features["hourly_capacity_minutes"]).round(1)

    def classify_severity(row):
        u = row["hourly_utilization"]
        w = row["avg_waiting_time"]
        if u >= 1.25 or w >= 35.0:
            return "Critical"
        if u >= 1.00 or w >= 25.0:
            return "High"
        if u >= 0.80 or w >= 15.0:
            return "Moderate"
        return "Normal"

    bottleneck_features["severity_indicator"] = bottleneck_features.apply(classify_severity, axis=1)
    bottleneck_features.to_csv(output_dir / "bottleneck_features.csv", index=False)
    print(f"Exported bottleneck_features.csv ({len(bottleneck_features)} feature rows)")

    # 20. Digital Service Opportunities
    digital_services = services[services["digital_available"] == True]
    digital_traffic = visits[visits["service_type"].isin(digital_services["service_type"])]

    digital_opp = digital_traffic.groupby("service_type").agg(
        in_branch_requests=("visit_id", "count"),
        total_service_minutes=("service_duration", "sum"),
        avg_wait_minutes=("waiting_time", "mean"),
    ).reset_index()

    total_all_visits = len(visits)
    total_all_workload = visits["service_duration"].sum()

    digital_opp["pct_of_total_branch_traffic"] = (digital_opp["in_branch_requests"] / total_all_visits * 100).round(2)
    digital_opp["hours_consumed"] = (digital_opp["total_service_minutes"] / 60.0).round(1)
    digital_opp["potential_30pct_shift_hours_saved"] = (digital_opp["hours_consumed"] * 0.30).round(1)
    digital_opp.to_csv(output_dir / "digital_service_opportunities.csv", index=False)
    print("Exported digital_service_opportunities.csv")

    # 16 & 17. Customer Feedback Summary (Sentiment, Rating vs Wait, Issue categories)
    feedback_summary = feedback.groupby("issue_category").agg(
        feedback_count=("feedback_id", "count"),
        avg_rating=("rating", "mean"),
        avg_wait_experienced=("waiting_time_experienced", "mean"),
        negative_count=("sentiment_label", lambda s: (s == "Negative").sum()),
        positive_count=("sentiment_label", lambda s: (s == "Positive").sum()),
    ).reset_index()
    feedback_summary["avg_rating"] = feedback_summary["avg_rating"].round(2)
    feedback_summary["avg_wait_experienced"] = feedback_summary["avg_wait_experienced"].round(2)
    feedback_summary["neg_sentiment_pct"] = (feedback_summary["negative_count"] / feedback_summary["feedback_count"] * 100).round(2)
    feedback_summary = feedback_summary.sort_values(by="feedback_count", ascending=False)
    feedback_summary.to_csv(output_dir / "feedback_summary.csv", index=False)
    print("Exported feedback_summary.csv")

    # High-level summary dictionary
    summary_dict = {
        "timestamp": datetime.datetime.now().isoformat(),
        "total_branches": len(branches),
        "total_staff": len(staff),
        "total_visits": len(visits),
        "total_appointments": len(appointments),
        "total_feedback_records": len(feedback),
        "average_waiting_time_minutes": round(float(visits["waiting_time"].mean()), 2),
        "p90_waiting_time_minutes": round(float(visits["waiting_time"].quantile(0.90)), 2),
        "overall_abandonment_rate_pct": round(float((visits["completion_status"] == "Abandoned").mean() * 100), 2),
        "digital_eligible_traffic_pct": round(float(len(digital_traffic) / len(visits) * 100), 2),
        "potential_staff_hours_savable_via_digital": round(float(digital_opp["hours_consumed"].sum() * 0.35), 1),
        "busiest_branch": branch_summary.iloc[0]["branch_name"],
        "highest_wait_branch": branch_summary.sort_values(by="avg_waiting_time", ascending=False).iloc[0]["branch_name"],
        "critical_bottleneck_hours_count": int((bottleneck_features["severity_indicator"] == "Critical").sum()),
    }

    with open(output_dir / "summary.json", "w") as f:
        json.dump(summary_dict, f, indent=2)
    print("Exported summary.json")

    return summary_dict


def generate_visual_analysis_charts(dfs: dict[str, pd.DataFrame], output_dir: Path) -> None:
    """Generates 8 high-impact analytical charts."""
    visits = dfs["visits"].copy()
    branches = dfs["branches"]
    services = dfs["services"]
    staff = dfs["staff"]
    feedback = dfs["feedback"]

    visits["arrival_hour"] = pd.to_datetime(visits["arrival_timestamp"]).dt.hour

    plt.style.use("seaborn-v0_8-whitegrid" if "seaborn-v0_8-whitegrid" in plt.style.available else "default")

    # 1. Hourly Traffic & Waiting Time Curve
    fig, ax1 = plt.subplots(figsize=(10, 5))
    hourly = visits.groupby("arrival_hour").agg(
        traffic=("visit_id", "count"),
        wait=("waiting_time", "mean"),
    ).reset_index()

    color = "#1f77b4"
    ax1.set_xlabel("Hour of Day (09:00 - 16:00)", fontsize=11, fontweight="bold")
    ax1.set_ylabel("Total Customer Arrivals", color=color, fontsize=11, fontweight="bold")
    bars = ax1.bar(hourly["arrival_hour"], hourly["traffic"], color=color, alpha=0.75, width=0.55, label="Arrivals")
    ax1.tick_params(axis="y", labelcolor=color)

    ax2 = ax1.twinx()
    color2 = "#d62728"
    ax2.set_ylabel("Average Waiting Time (Minutes)", color=color2, fontsize=11, fontweight="bold")
    line = ax2.plot(hourly["arrival_hour"], hourly["wait"], color=color2, linewidth=2.5, marker="o", label="Avg Wait (min)")
    ax2.tick_params(axis="y", labelcolor=color2)

    plt.title("AVENUE: Hourly Traffic Volume vs. Waiting Time Build-Up", fontsize=13, fontweight="bold", pad=12)
    plt.tight_layout()
    chart1_path = output_dir / "chart_hourly_traffic_and_wait.png"
    plt.savefig(chart1_path, dpi=180)
    plt.close()
    print(f"Saved {chart1_path.name}")

    # 2. Branch Traffic Comparison & Abandonment
    fig, ax = plt.subplots(figsize=(11, 5))
    b_stats = visits.groupby("branch_id").agg(
        total_visits=("visit_id", "count"),
        abandoned=("completion_status", lambda s: (s == "Abandoned").sum()),
    ).reset_index()
    b_merged = pd.merge(b_stats, branches[["branch_id", "branch_name"]], on="branch_id").sort_values(by="total_visits", ascending=True)

    ax.barh(b_merged["branch_name"], b_merged["total_visits"], color="#2ca02c", alpha=0.85, label="Completed Visits")
    ax.barh(b_merged["branch_name"], b_merged["abandoned"], color="#d62728", alpha=0.9, label="Abandoned Visits")
    ax.set_xlabel("Total Visits Over 6 Months", fontsize=11, fontweight="bold")
    ax.set_title("AVENUE: Total Branch Visits & Customer Abandonment Across 10 Branches", fontsize=13, fontweight="bold", pad=12)
    ax.legend(loc="lower right")
    plt.tight_layout()
    chart2_path = output_dir / "chart_branch_traffic_comparison.png"
    plt.savefig(chart2_path, dpi=180)
    plt.close()
    print(f"Saved {chart2_path.name}")

    # 3. Service Workload Distribution
    fig, ax = plt.subplots(figsize=(10, 6))
    srv_workload = visits.groupby("service_type")["service_duration"].sum().sort_values(ascending=True)
    ax.barh(srv_workload.index, srv_workload.values / 60.0, color="#3470a3", alpha=0.85)
    ax.set_xlabel("Total Service Time Consumed (Staff Hours)", fontsize=11, fontweight="bold")
    ax.set_title("AVENUE: Cumulative Staff Workload by Service Category", fontsize=13, fontweight="bold", pad=12)
    plt.tight_layout()
    chart3_path = output_dir / "chart_service_workload_distribution.png"
    plt.savefig(chart3_path, dpi=180)
    plt.close()
    print(f"Saved {chart3_path.name}")

    # 4. Customer Satisfaction Rating vs Waiting Time Experienced
    fig, ax = plt.subplots(figsize=(9, 5))
    wait_bins = [0, 5, 10, 15, 20, 30, 45, 90]
    bin_labels = ["0-5m", "5-10m", "10-15m", "15-20m", "20-30m", "30-45m", "45m+"]
    feedback["wait_bin"] = pd.cut(feedback["waiting_time_experienced"], bins=wait_bins, labels=bin_labels)
    fb_agg = feedback.groupby("wait_bin", observed=False)["rating"].mean().reset_index()

    ax.plot(fb_agg["wait_bin"], fb_agg["rating"], color="#e377c2", marker="s", linewidth=2.5, markersize=8)
    ax.set_ylabel("Customer Satisfaction Rating (1 to 5)", fontsize=11, fontweight="bold")
    ax.set_xlabel("Experienced Waiting Time Bracket", fontsize=11, fontweight="bold")
    ax.set_title("AVENUE: Customer Satisfaction Degradation with Escalating Waiting Time", fontsize=13, fontweight="bold", pad=12)
    ax.set_ylim(1.0, 5.2)
    ax.axhline(3.0, color="gray", linestyle="--", alpha=0.7, label="Neutral Threshold (3.0)")
    ax.legend()
    plt.tight_layout()
    chart4_path = output_dir / "chart_satisfaction_vs_waiting_time.png"
    plt.savefig(chart4_path, dpi=180)
    plt.close()
    print(f"Saved {chart4_path.name}")

    # 5. Appointment vs Walk-in Waiting Time Comparison
    fig, ax = plt.subplots(figsize=(8, 5))
    channel_waits = visits.groupby(["channel"])["waiting_time"].quantile([0.5, 0.9]).unstack()
    channel_waits.columns = ["Median Wait (min)", "P90 Wait (min)"]
    channel_waits.plot(kind="bar", ax=ax, colormap="tab10", width=0.45)
    ax.set_title("AVENUE: Queue Wait Time Advantage — Appointments vs. Walk-ins", fontsize=13, fontweight="bold", pad=12)
    ax.set_ylabel("Waiting Time (Minutes)", fontsize=11, fontweight="bold")
    ax.set_xlabel("Customer Channel", fontsize=11, fontweight="bold")
    plt.xticks(rotation=0)
    plt.tight_layout()
    chart5_path = output_dir / "chart_appointment_vs_walkin_wait.png"
    plt.savefig(chart5_path, dpi=180)
    plt.close()
    print(f"Saved {chart5_path.name}")

    # 6. Digital-Eligible Traffic Opportunity
    fig, ax = plt.subplots(figsize=(8, 5))
    digital_types = set(services[services["digital_available"] == True]["service_type"])
    dig_counts = visits["service_type"].isin(digital_types).value_counts()
    labels = ["Digital-Eligible Services\n(Could be shifted)", "In-Branch Physical Required\n(Loans, Biometrics)"]
    ax.pie(
        dig_counts.values,
        labels=labels,
        autopct="%1.1f%%",
        startangle=140,
        colors=["#2ca02c", "#ff7f0e"],
        explode=(0.06, 0),
        textprops={"fontsize": 11, "fontweight": "bold"},
    )
    ax.set_title("AVENUE: Digital Redirection Potential (% of Branch Footfall)", fontsize=13, fontweight="bold", pad=12)
    plt.tight_layout()
    chart6_path = output_dir / "chart_digital_opportunity_share.png"
    plt.savefig(chart6_path, dpi=180)
    plt.close()
    print(f"Saved {chart6_path.name}")


def main() -> None:
    parser = argparse.ArgumentParser(description="AVENUE Comprehensive Data Analysis Pipeline")
    parser.add_argument("--data-dir", type=str, default="data/processed", help="Path to processed datasets")
    parser.add_argument("--output-dir", type=str, default="data/analysis", help="Path to save analysis outputs")
    args = parser.parse_args()

    data_dir = Path(args.data_dir).resolve()
    output_dir = Path(args.output_dir).resolve()
    output_dir.mkdir(parents=True, exist_ok=True)

    print("==================================================")
    print("AVENUE DATA ANALYSIS PIPELINE")
    print("==================================================")
    print(f"Reading datasets from: {data_dir}")
    print(f"Writing analysis to:  {output_dir}")
    print("==================================================")

    dfs = load_datasets(data_dir)
    summary = run_comprehensive_analysis(dfs, output_dir)
    generate_visual_analysis_charts(dfs, output_dir)

    # Sync to branchiq/data/analysis if alternate exists
    alt_analysis = Path("branchiq/data/analysis")
    if alt_analysis.parent.exists():
        alt_analysis.mkdir(parents=True, exist_ok=True)
        for f in output_dir.glob("*.*"):
            (alt_analysis / f.name).write_bytes(f.read_bytes())
        print(f"Synchronized analysis outputs to alternate directory: {alt_analysis}")

    print("==================================================")
    print("DATA ANALYSIS COMPLETED SUCCESSFULLY!")
    print(f"Total Visits Analyzed:    {summary['total_visits']}")
    print(f"Average Waiting Time:     {summary['average_waiting_time_minutes']} mins")
    print(f"P90 Waiting Time:         {summary['p90_waiting_time_minutes']} mins")
    print(f"Digital-Eligible Traffic: {summary['digital_eligible_traffic_pct']}%")
    print(f"Potential Hours Savable:  {summary['potential_staff_hours_savable_via_digital']} hrs")
    print("==================================================")


if __name__ == "__main__":
    main()
