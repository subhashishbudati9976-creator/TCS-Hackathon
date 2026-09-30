# AVENUE — Intelligent Branch Service Load & Customer Experience Optimizer

> **TCS Hackathon 2026 Project**  
> An AI-powered operations cockpit and customer guidance platform that eliminates bank branch congestion, predicts bottlenecks before they occur, and optimizes counter staffing dynamically.

---

## 👥 Team Members & Roles

| Member | GitHub Username | Role & Responsibilities |
| :--- | :--- | :--- |
| **Subhashish Budati (Subbu)** | `@subhashishbudati9976` | **Repo Owner / Lead Architect** — System design, FastAPI backend, ML models |
| **Sooraj** | `@sooraj` | **Frontend & Integration Engineer** — UI components, API client integration, UX flows |
| **Vijay** | `@vijay` | **Data Science & Simulation** — Feature engineering, scenario simulation, analytics |
| **Devan** | `@devan` | **QA & Data Pipeline** — Synthetic dataset validation, test suites, API verification |

---

## 🎯 The Problem We Are Solving

Modern retail banks face a universal customer experience crisis:
1. **Unpredictable Customer Surges:** High variance in hourly customer arrivals causes sudden counter congestion and long queue times (often exceeding 45 minutes).
2. **Counter Imbalance:** While cash counters are overwhelmed, specialized desk officers (e.g., Forex, Demat) frequently experience downtime.
3. **Unnecessary Branch Visits:** Over 35% of in-branch visits are for routine services (e.g., balance certificate, address update) that can easily be fulfilled digitally.
4. **Reactive Instead of Proactive:** Branch managers only react *after* queues have already formed outside the door.

---

## 💡 The AVENUE Solution

AVENUE bridges the gap between customer expectations and operational capacity through **two synchronized portals**:

```
                       ┌──────────────────────────────────────────────┐
                       │                   AVENUE                    │
                       │   Intelligent Branch Optimization Engine     │
                       └──────────────────────┬───────────────────────┘
                                              │
                   ┌──────────────────────────┴──────────────────────────┐
                   ▼                                                     ▼
      ┌─────────────────────────┐                           ┌─────────────────────────┐
      │     Customer Portal     │                           │ Branch Manager Cockpit  │
      ├─────────────────────────┤                           ├─────────────────────────┤
      │ • Live Branch Finder    │                           │ • Live Branch Metrics   │
      │ • Wait Time Estimates   │                           │ • Predictive Bottlenecks│
      │ • Digital Deflection    │                           │ • Staff Recommendations │
      │ • Document Checklist    │                           │ • What-If Simulation    │
      │ • AI Virtual Assistant  │                           │ • Sentiment NLP Audits  │
      └─────────────────────────┘                           └─────────────────────────┘
```

### 1. Customer Experience Portal
- **Smart Branch Finder:** Displays nearby branches ranked by proximity and real-time wait times.
- **Service Discovery & Digital Alternative:** Informs customers if their required service is available online, saving them an unnecessary branch trip.
- **AI Banking Assistant:** An interactive conversational assistant answering service timings, required documentation, and peak hour forecasts.

### 2. Branch Manager Operations Cockpit
- **Real-Time Operations Radar:** Monitors counter utilization, active customer queue depth, and average service times across 15 banking services.
- **Predictive Bottleneck Engine:** Machine learning algorithms detect service pressure **30 to 60 minutes before queues form**.
- **Actionable Staff Recommendations:** Generates high-confidence reallocation suggestions (e.g., *"Reassign 1 officer from Account Services to Cash Deposit"*).
- **Interactive "What-If" Simulation Engine:** Allows managers to simulate staffing adjustments before executing them, predicting the exact reduction in wait times (e.g., `-22% average wait time`).

---

## 📊 Dataset & Machine Learning Architecture

AVENUE is trained on **79,529 real-world branch visit logs** across 10 flagship branches, 15 service categories, and 100+ bank personnel:

- **Demand Forecasting:** Gradient Boosted Models trained on time-of-day, day-of-week, seasonal spikes, and historical arrival velocity.
- **Queue Pressure & Wait Time Estimation:** Continuous calculation of service rate ($\mu$) vs arrival rate ($\lambda$) per counter type.
- **Customer Feedback NLP:** Categorizes and scores sentiment across 11,000+ customer reviews into actionable operational dimensions.

---

## 🛠️ Technology Stack

| Layer | Technology |
| :--- | :--- |
| **Frontend UI** | React 18, TypeScript, Tailwind CSS, Lucide Icons, Recharts, Vite |
| **Backend API** | Python 3.14, FastAPI, Uvicorn, Pydantic v2, SQLAlchemy |
| **Machine Learning** | Scikit-learn, Pandas, NumPy, SciPy, Joblib |
| **Database** | SQLite (development) / PostgreSQL (production-ready) |
| **Testing** | Pytest, HTTPX, Custom API Verification Suite |

---

## 🚀 Running the Project Locally

### 1. Prerequisites
- **Node.js** (v18+)
- **Python** (v3.11+)

---

### 2. Backend Setup & Startup
```powershell
cd avenue/backend

# Create & activate virtual environment
python -m venv .venv
.venv\Scripts\activate

# Install dependencies
pip install fastapi "uvicorn[standard]" pydantic pydantic-settings sqlalchemy python-dotenv httpx numpy pandas scikit-learn scipy joblib pytest

# Copy environment file
Copy-Item .env.example .env

# Run FastAPI backend server
uvicorn app.main:app --port 8000 --reload
```
- **Backend URL:** `http://localhost:8000`
- **Swagger API Documentation:** `http://localhost:8000/docs`
- **Health Check:** `http://localhost:8000/api/health`

---

### 3. Frontend Setup & Startup
```powershell
cd avenue/frontend

# Install dependencies
npm install

# Copy environment file
Copy-Item .env.example .env

# Start Vite dev server
npm run dev
```
- **Frontend URL:** `http://localhost:5173`

---

## 🧪 Testing & Verification

AVENUE includes automated test suites covering all backend routes and frontend builds:

### Run API End-to-End Verification (15/15 Endpoints):
```powershell
cd avenue/backend
.venv\Scripts\python verify_apis.py
```
*Output: All 15 endpoints verified with `[200] OK`.*

### Run Automated Unit & MVP Integration Tests (19/19 Tests):
```powershell
cd avenue/backend
.venv\Scripts\python -m pytest tests/test_all_mvp.py
```
*Output: `19 passed in 12.11s [100%]`.*

### Test Frontend Build:
```powershell
cd avenue/frontend
npm run build
```
*Output: `✓ built in 8.00s` with zero TypeScript errors.*

---

## 🔑 Demo Login Credentials

To explore the Manager Operations Cockpit:
- **Email:** `manager@avenue.demo`
- **Password:** `manager123`

---

## 📡 API Endpoints Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | System health and API version status |
| `GET` | `/api/branches` | List of all banking branches and metadata |
| `GET` | `/api/branches/{id}/forecast` | 8-hour predictive customer arrival forecast |
| `GET` | `/api/branches/{id}/bottlenecks` | Active bottleneck alerts and counter saturation |
| `GET` | `/api/branches/{id}/recommendations` | AI staff reallocation & deflection actions |
| `GET` | `/api/branches/{id}/intelligence` | Comprehensive operational summary of branch |
| `GET` | `/api/analysis/waiting-times` | Statistical wait-time percentiles (p50, p90, p95) |
| `GET` | `/api/analysis/feedback` | Sentiment breakdown of 11,000+ reviews |
| `GET` | `/api/customer/service-options` | Directory of bank services & digital alternatives |
| `GET` | `/api/customer/branches` | Customer-facing branch finder with queue scores |
| `POST` | `/api/customer/recommendation` | Personalized branch recommendation by service |
| `POST` | `/api/customer/chat` | AI conversational customer banking assistant |
| `POST` | `/api/auth/login` | Secure JWT authentication for branch managers |
| `GET` | `/api/auth/me` | Current authenticated manager profile |
| `POST` | `/api/simulate` | Run "What-If" staff reassignment simulations |
