# AVENUE — TCS Problem Statement Coverage Map

> **Project:** AVENUE — Intelligent Branch Service Load & Customer Experience Optimizer  
> **Stage:** Data Layer, Capacity Engine, Analysis Pipeline (Phase 1 Complete)  
> **Updated:** 2026-09-30

---

## Coverage Status Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Fully implemented in this phase |
| 🔧 | Foundation built; full implementation in next phase |
| 📋 | Planned with architecture in place |

---

## TCS DATA CONSIDERATIONS — Coverage

| Requirement | Implementation | Files |
|---|---|---|
| **Operational data** (visit logs, queues, counters) | ✅ 79,528 visits, 79,528 tokens, counter assignments simulated | `processed/visits.csv`, `processed/queue_data.csv` |
| **Textual comments / Customer feedback** | ✅ 11,183 structured feedback records with realistic text | `processed/feedback.csv` |
| **Customer feedback** (ratings, sentiment) | ✅ Rating 1-5, sentiment labels (Positive/Neutral/Negative), issue categories | `processed/feedback.csv` |
| **Arrival patterns** | ✅ Realistic hourly curves with dual morning + post-lunch peaks | `analysis/hourly_demand.csv` |
| **Service times** | ✅ Per-service avg/min/max durations; log-normal sampling per visit | `processed/services.csv`, `processed/visits.csv` |
| **Customer information** | ✅ 15,000 synthetic customers across 6 segments: Retail, Salaried, Senior, Student, Small Business, Premium. Zero PII | `processed/customers.csv` |
| **Customer intent** | ✅ Service type captures intent (Loan Enquiry, KYC Update, Complaint, etc.) | `processed/visits.csv` |
| **Customer sentiment** | ✅ Sentiment labels and ratings correlated with wait time experienced | `processed/feedback.csv` |
| **Holidays** | ✅ 10 Karnataka/India bank holidays embedded; holiday-filtered simulation | `processed/calendar.csv` |
| **Salary periods** | ✅ Days 28–5 flagged as salary period; generates +50% traffic multiplier | `processed/calendar.csv` |
| **Seasonal patterns** | ✅ Festive season (Oct–Nov), Fiscal year-end tax season (Jan–Mar) identified | `processed/calendar.csv` |
| **Staff shortages** | ✅ Random shortage events (~1 in 15 days/branch) with 30–45% counter reduction | `processed/staff.csv`, `generate_data.py` |
| **Demand shifts across branches** | ✅ 10 branches with distinct traffic multipliers (0.65x to 1.45x) and service mixes | `processed/branches.csv`, `analysis/branch_summary.csv` |

**Result: 13/13 data considerations covered ✅**

---

## TCS SOLUTION EXPECTATIONS — Coverage

| Requirement | Status | Implementation | Next Steps |
|---|---|---|---|
| **Load Forecasts** | 🔧 Foundation ready | Historical demand data, hourly patterns, bottleneck features generated | ML forecasting module (LSTM / XGBoost) |
| **Bottleneck Alerts** | 🔧 Foundation ready | `bottleneck_features.csv` (9,803 feature rows) with severity labels | Threshold-based + ML bottleneck detector |
| **Staff Suggestions** | 🔧 Capacity gap calculated | Utilization per skill, capacity gap per service available | Recommendation engine (skill-based reassignment) |
| **Customer Redirection** | 🔧 Opportunity calculated | Digital service opportunity identified; 90.9% of traffic digitally eligible | Recommendation engine (digital channel suggestions) |
| **Decision Support** | ✅ Core foundation | Branch Load Score (0–100), service workload, waiting times, capacity gap APIs | Manager dashboard consuming these APIs |
| **Workflow Enablement** | 🔧 Architecture in place | Role-aware schema, no hardcoded manager-only paths | Signup/login flow with role routing |

---

## TCS OPERATIONAL PROBLEMS — Coverage

| Operational Problem | Implementation |
|---|---|
| Long queues during peak hours | ✅ Hourly queue depth and abandonment tracked; peak hours identified at 10:00–11:30 and 13:00–14:00 |
| Staff overload / workload imbalance | ✅ Service-level workload vs skilled staff capacity calculated per branch/skill |
| Service bottlenecks | ✅ Bottleneck severity (Normal/Moderate/High/Critical) computed per branch/hour window |
| Uneven demand across branches | ✅ Traffic multipliers 0.65x–1.45x; branch demand differences in `branch_summary.csv` |
| Staff skill mismatches | ✅ Skill-constrained capacity: KYC demand only served by KYC/Account staff, Loans by Loan officers, etc. |
| Unpredictable salary period surges | ✅ Salary period flag with +30% demand multiplier; 50% higher avg wait observed (6.3m vs 4.19m) |
| Holiday and pre-holiday demand shifts | ✅ 10 holidays in calendar; visits restricted to banking days; pre-holiday demand patterns in data |

---

## TCS CUSTOMER EXPERIENCE PROBLEMS — Coverage

| Customer Experience Problem | Implementation |
|---|---|
| Excessive waiting times | ✅ P90 wait = 10.5m; peak conditions with staff shortage generate up to 65m wait |
| High abandonment rate | ✅ 1,148 abandonment events (≥38 min wait triggers abandonment logic) |
| Poor appointment experience | ✅ Appointment holders get 50% priority wait reduction; appointment vs walk-in comparison in API |
| Digital services not communicated | ✅ 90.9% of traffic is digitally redirectable; `digital_service_opportunities.csv` |
| Negative feedback on wait time | ✅ Feedback text, sentiment, and rating directly correlated to wait experienced |

---

## TCS BRANCH MANAGEMENT PROBLEMS — Coverage

| Management Problem | Implementation |
|---|---|
| No visibility into branch load | ✅ Branch Load Score (multi-factor, explainable) per branch |
| No workload-aware staffing | ✅ Skill-based capacity gap per service type; `staff_capacity_summary.csv` |
| No demand forecasting | 🔧 Historical data + features ready; ML module planned |
| No proactive bottleneck detection | 🔧 Features generated; bottleneck engine to consume these |
| No customer redirection playbook | 🔧 Digital opportunity quantified; recommendation engine planned |

---

## Architecture: Future Role-Based Flow

```
Signup / Login [PLANNED — Auth module]
       ↓
Role identification: BANK_MANAGER | CUSTOMER
       ↓
  ┌──────────────────────┬──────────────────────────┐
  ↓                      ↓
MANAGER                CUSTOMER
Dashboard              Services Portal
  ↓                      ↓
Branch Intelligence    AI Banking Assistant
[uses /api/branches/*] [uses structured service data]
  ↓                      ↓
Forecasts              Recommendations
Bottleneck Alerts      Service Guidance
Staff Planning         Digital Alternatives
Action Recommendations Appointment Booking
```

### Current API Layer (Ready)

| Endpoint | Status | Serves |
|---|---|---|
| `GET /api/branches/` | ✅ Live | All branches with summary |
| `GET /api/branches/{id}/summary` | ✅ Live | Branch metrics + load score |
| `GET /api/branches/{id}/capacity` | ✅ Live | Skill-based capacity breakdown |
| `GET /api/branches/{id}/workload` | ✅ Live | Service workload + digital opportunity |
| `GET /api/branches/{id}/waiting-times` | ✅ Live | Waiting time distributions |
| `GET /api/analysis/summary` | ✅ Live | System-wide KPIs |
| `GET /api/analysis/bottleneck-features` | ✅ Live | ML feature rows for bottleneck model |
| `GET /api/analysis/digital-opportunities` | ✅ Live | Digital redirection analysis |
| `GET /api/analysis/feedback-summary` | ✅ Live | Sentiment and issue categories |
| `GET /api/analysis/hourly-demand` | ✅ Live | Hourly traffic profile |
| `GET /api/analysis/service-summary` | ✅ Live | Service workload stats |
| `GET /api/analysis/branch-summary` | ✅ Live | All-branch comparison |
| `GET /api/analysis/waiting-time-summary` | ✅ Live | Cross-dimension wait stats |

---

## Phase 2 — Planned Modules

| Module | Description |
|---|---|
| **Demand Forecasting (ML)** | LSTM or Prophet on `bottleneck_features.csv` — predict hourly branch traffic |
| **Bottleneck Detection Engine** | Threshold + ML-based severity alerts using pre-computed features |
| **Recommendation Engine** | Action suggestions: redistribute staff, open counter, redirect to digital |
| **Signup / Login / Auth** | JWT-based role auth with MANAGER and CUSTOMER roles |
| **Manager Dashboard UI** | React dashboard consuming `/api/branches/*` and `/api/analysis/*` |
| **Customer Portal UI** | Service guide, digital banking recommendations, appointment booking |
| **Customer AI Assistant** | Structured RAG chatbot over banking service knowledge base |

---

## Data Quality Summary

| Check | Result |
|---|---|
| Missing values | ✅ 0 missing cells |
| Timestamp chronology | ✅ All `arrival <= start <= end` |
| Negative durations | ✅ 0 invalid records |
| Impossible wait times | ✅ All within 0–65 minute physical bounds |
| Duplicate identifiers | ✅ 0 duplicates across 9 tables |
| Referential integrity | ✅ 0 orphaned foreign keys |
| Staff skill consistency | ✅ 97.5% skill-matched serving |
| Appointment on holidays | ✅ 0 appointments on bank holidays |
| Capacity engine bounds | ✅ Zero-division guarded, load score in [0, 100] |
| Report generation | ✅ JSON + Markdown reports produced |

**Overall QA: 10/10 PASS**
