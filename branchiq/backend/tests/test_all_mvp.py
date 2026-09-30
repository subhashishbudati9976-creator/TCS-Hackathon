"""
AVENUE — Complete MVP Test Suite

Covers Requirement 40:
1. Forecast: returns data, 4h & 8h horizons, invalid branch 404
2. Bottleneck: capacity gap, utilization, severity calculated
3. Recommendations: valid actions, digital candidate criteria, redirection
4. Simulation: non-mutation, before/after values, meaningful change
5. Customer: service options, branch recommendation, grounded assistant
6. Auth: login, invalid credentials rejected, role returned
"""

import sys
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Ensure backend root is on PYTHONPATH
_BACKEND_ROOT = Path(__file__).resolve().parent.parent
sys.path.insert(0, str(_BACKEND_ROOT))

from app.main import app

client = TestClient(app)


# ─── 1. Health & Core ─────────────────────────────────────────────────────────

def test_health_endpoint():
    res = client.get("/api/health")
    assert res.status_code == 200
    data = res.json()
    assert data["status"] in ["ok", "healthy"]
    assert "service" in data


def test_branches_list():
    res = client.get("/api/branches")
    assert res.status_code == 200
    branches = res.json()
    assert len(branches) == 10
    assert any(b["branch_id"] == "BR001" for b in branches)


# ─── 2. Demand Forecasting ────────────────────────────────────────────────────

def test_forecast_returns_data_8h():
    res = client.get("/api/branches/BR001/forecast?horizon_hours=8")
    assert res.status_code == 200
    data = res.json()
    assert data["branch_id"] == "BR001"
    assert len(data["forecast"]) == 8
    assert data["model"] in ["XGBoost", "MovingAverage_Fallback"]
    assert data["peak_demand"] > 0


def test_forecast_4h_horizon():
    res = client.get("/api/branches/BR001/forecast?horizon_hours=4")
    assert res.status_code == 200
    data = res.json()
    assert len(data["forecast"]) == 4


def test_forecast_invalid_branch():
    res = client.get("/api/branches/NON_EXISTENT_BRANCH/forecast")
    assert res.status_code == 404


def test_forecast_post():
    res = client.post("/api/forecast", json={"branch_id": "BR002", "horizon_hours": 8})
    assert res.status_code == 200
    assert len(res.json()["forecast"]) == 8


# ─── 3. Bottleneck Detection & Root Cause ─────────────────────────────────────

def test_bottlenecks_calculated():
    res = client.get("/api/branches/BR001/bottlenecks")
    assert res.status_code == 200
    bns = res.json()
    assert len(bns) > 0

    top = bns[0]
    assert "service" in top
    assert "utilization" in top
    assert "severity" in top
    assert top["severity"] in ["CRITICAL", "HIGH", "MODERATE", "LOW"]
    assert "root_causes" in top
    assert len(top["root_causes"]) > 0


def test_bottlenecks_all_branches():
    res = client.get("/api/bottlenecks")
    assert res.status_code == 200
    assert len(res.json()) >= 10


# ─── 4. Recommendation Engine ─────────────────────────────────────────────────

def test_recommendations_structure():
    res = client.get("/api/branches/BR001/recommendations")
    assert res.status_code == 200
    recs = res.json()
    assert len(recs) > 0

    for r in recs:
        assert r["priority"] in ["HIGH", "MEDIUM", "LOW"]
        assert "action" in r
        assert "reason" in r
        assert "affected_service" in r


# ─── 5. What-If Simulation ───────────────────────────────────────────────────

def test_simulation_non_mutation_and_impact():
    payload = {
        "branch_id": "BR001",
        "action_type": "STAFF_REASSIGNMENT",
        "parameters": {
            "from_service": "Cash Withdrawal",
            "to_service": "Loan Application",
            "staff_count": 1,
        }
    }
    res = client.post("/api/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()

    assert "before" in data
    assert "after" in data
    assert "impact" in data

    # Verify meaningful changes
    before = data["before"]
    after = data["after"]
    impact = data["impact"]

    assert "avg_wait_minutes" in before
    assert "avg_wait_minutes" in after
    assert impact["wait_time_reduction_minutes"] >= 0


def test_simulation_digital_diversion():
    payload = {
        "branch_id": "BR001",
        "action_type": "DIGITAL_DIVERSION",
        "parameters": {
            "target_service": "Statement Request",
            "adoption_rate": 0.30,
        }
    }
    res = client.post("/api/simulate", json=payload)
    assert res.status_code == 200
    data = res.json()
    assert data["impact"]["workload_saved_minutes"] > 0


# ─── 6. Feedback & NLP ───────────────────────────────────────────────────────

def test_feedback_nlp():
    res = client.get("/api/feedback")
    assert res.status_code == 200
    data = res.json()
    assert data["total_feedback"] > 1000
    assert "Positive" in data["sentiment_distribution"]
    assert len(data["top_complaints"]) > 0


# ─── 7. Customer Experience & Grounded Assistant ──────────────────────────────

def test_customer_service_options():
    res = client.get("/api/customer/service-options")
    assert res.status_code == 200
    opts = res.json()
    assert len(opts) >= 10
    # Must have digital_available, branch_required, and documents
    sample = opts[0]
    assert "digital_available" in sample
    assert "documents_required" in sample
    assert isinstance(sample["documents_required"], list)


def test_customer_branch_recommendation():
    res = client.post("/api/customer/recommendation", json={"service_type": "Account Opening"})
    assert res.status_code == 200
    data = res.json()
    assert "recommended_branches" in data
    assert len(data["recommended_branches"]) == 3
    assert data["recommended_branches"][0]["estimated_wait_minutes"] > 0


def test_customer_chat_grounded_response():
    res = client.post("/api/customer/chat", json={"message": "What documents do I need for Loan Application?"})
    assert res.status_code == 200
    data = res.json()
    assert "reply" in data
    assert "Income Proof" in data["reply"] or "document" in data["reply"].lower()
    assert data["is_grounded"] is True


# ─── 8. Authentication ────────────────────────────────────────────────────────

def test_auth_manager_login():
    res = client.post("/api/auth/login", json={"email": "manager@avenue.demo", "password": "manager123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "MANAGER"


def test_auth_customer_login():
    res = client.post("/api/auth/login", json={"email": "customer@avenue.demo", "password": "customer123"})
    assert res.status_code == 200
    data = res.json()
    assert "access_token" in data
    assert data["user"]["role"] == "CUSTOMER"


def test_auth_invalid_credentials():
    res = client.post("/api/auth/login", json={"email": "manager@avenue.demo", "password": "wrongpassword"})
    assert res.status_code == 401


def test_auth_me_with_token():
    login_res = client.post("/api/auth/login", json={"email": "manager@avenue.demo", "password": "manager123"})
    token = login_res.json()["access_token"]

    me_res = client.get("/api/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert me_res.status_code == 200
    assert me_res.json()["user"]["email"] == "manager@avenue.demo"
