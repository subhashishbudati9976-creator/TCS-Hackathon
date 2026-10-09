# AVENUE — Intelligent Branch Service Load & Customer Experience Optimizer

> **TCS Hackathon Project**

AVENUE is an AI-powered operations platform designed to help bank branch managers
reduce queue wait times, detect service bottlenecks before they happen, and
make smarter staffing and customer-routing decisions through data-driven
recommendations.

The platform combines **data analytics, machine learning, NLP, simulation,
real-time operational insights, and an interactive branch management
dashboard** into a single system.

---

<p align="center">
  <img src="./Images/Screenshot 2026-10-01 145844.png" alt="AVENUE Dashboard" width="100%">
</p>
Deployed Frontend link : https://tcs-hackathon-gold.vercel.app/login
---

## Problem Statement

Banks experience uneven customer traffic across branches and time periods,
leading to long queues, staff overload, service bottlenecks, and inconsistent
customer experiences.

Traditional branch management is largely reactive — managers often identify
operational problems only after queues have already formed.

AVENUE addresses this problem by combining historical branch data,
machine-learning predictions, queue-pressure analysis, customer feedback,
and operational simulations to help managers make proactive decisions.

---

## 📸 Platform Preview

<p align="center">
  <img src="./Images/Screenshot 2026-10-01 145844.png" alt="Branch Manager Dashboard" width="48%">
  <img src="./Images/Screenshot 2026-10-01 145850.png" alt="Customer Dashboard" width="48%">
</p>

<p align="center">
  <img src="./Images/Screenshot 2026-10-01 145909.png" alt="Analytics Dashboard" width="48%">
  <img src="./Images/Screenshot 2026-10-01 145916.png" alt="Operational Recommendations" width="48%">
</p>

<p align="center">
  <img src="./Images/Screenshot 2026-10-01 145923.png" alt="Branch Analytics" width="48%">
  <img src="./Images/Screenshot 2026-10-01 145929.png" alt="Customer Service Interface" width="48%">
</p>

<p align="center">
  <img src="./Images/Screenshot 2026-10-01 150058.png" alt="AVENUE Operational Dashboard" width="48%">
</p>

<p align="center">
  <img src="./Images/Screenshot 2026-09-30 125144.png" alt="AVENUE Dashboard" width="48%">
  <img src="./Images/Screenshot 2026-09-30 134630.png" alt="AVENUE Analytics" width="48%">
</p>

---

## System Capabilities

| # | Capability | Status |
|---|-----------|--------|
| 1 | Demand Forecasting — predict future branch traffic | ✅ Completed |
| 2 | Bottleneck Detection — detect pressure before queues form | ✅ Completed |
| 3 | Wait Time Estimation — real-time queue pressure scores | ✅ Completed |
| 4 | Recommendation Engine — staff reassignment and customer redirection | ✅ Completed |
| 5 | Simulation Engine — model the impact of proposed actions | ✅ Completed |
| 6 | Feedback NLP — sentiment analysis on customer comments | ✅ Completed |
| 7 | Branch Manager Dashboard — operational monitoring and insights | ✅ Completed |
| 8 | Customer Service Interface — customer-facing recommendations | ✅ Completed |
| 9 | Data Generation & Analysis Pipeline — synthetic branch operations data | ✅ Completed |
| 10 | API & Frontend Integration — complete end-to-end application flow | ✅ Completed |

---

## 🧠 Intelligence Layer

AVENUE is built around multiple analytical and intelligent components.

### 📈 Demand Forecasting

Predicts future customer traffic using historical branch activity and
machine-learning models.

The forecasting layer helps identify periods where additional staff or
operational preparation may be required.

### 🚨 Bottleneck Detection

Analyzes branch activity and queue pressure to identify potential service
bottlenecks before they become severe.

### ⏱️ Wait Time Estimation

Uses current queue and service-pressure information to estimate operational
wait-time conditions and generate branch pressure scores.

### 💡 Recommendation Engine

Generates actionable operational recommendations such as:

- Staff reassignment
- Customer redirection
- Service prioritization
- Capacity adjustments

### 🧪 Simulation Engine

Allows proposed operational changes to be evaluated before applying them.

This helps managers understand the potential impact of actions such as
staff reassignment or customer redistribution.

### 💬 Feedback NLP

Analyzes customer feedback and extracts sentiment information that can be
used as an additional signal for understanding customer experience.

---

## 🏗️ Architecture

```text
AVENUE
│
├── frontend/
│   └── src/
│       ├── api/               # API client and backend communication
│       ├── types/             # Shared TypeScript interfaces
│       ├── components/        # Dashboard and UI components
│       └── App.tsx            # Application shell
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI application
│   │   ├── config.py          # Application configuration
│   │   ├── routes/            # API route definitions
│   │   ├── services/          # Application and business logic
│   │   ├── models/            # SQLAlchemy database models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── database/          # Database engine and session management
│   │
│   └── ml/
│       ├── demand_forecasting/
│       ├── bottleneck_detection/
│       ├── wait_time_estimation/
│       ├── recommendation_engine/
│       ├── simulation/
│       └── feedback_nlp/
│
├── data/
│   ├── raw/                   # Generated operational datasets
│   ├── processed/             # Cleaned and processed datasets
│   ├── generate_data.py       # Synthetic dataset generator
│   ├── analyze_data.py        # Data analysis pipeline
│   └── validate_data.py       # Dataset validation and QA
│
├── notebooks/                 # Data exploration and experimentation
├── .env.example               # Environment configuration reference
├── docker-compose.yml         # Container orchestration
└── README.md
```
## 🔄 Data & Intelligence Pipeline
Branch & Customer Data
          ↓
   Data Generation
          ↓
   Data Validation
          ↓
    Data Analysis
          ↓
 ┌────────┴─────────┐
 ↓                  ↓
Forecasting      NLP Analysis
 ↓                  ↓
Bottleneck       Customer
Detection        Feedback
 ↓                  ↓
Wait Time        Experience
Estimation       Insights
 └────────┬─────────┘
          ↓
 Recommendation Engine
          ↓
   Simulation Engine
          ↓
 Manager Decisions

The platform separates data processing, machine-learning logic, business
services, and API routing to keep the system modular and maintainable.
## 🗃️ Data Pipeline
AVENUE includes a synthetic branch-operations data pipeline designed to model
realistic banking scenarios.
The generated data incorporates operational conditions such as:
- Customer traffic
- Queue formation
- Service demand
- Staff availability
- Staff shortages
- Salary-period traffic variations
- Appointments
- Branch capacity
- Customer feedback
The data analysis pipeline processes the generated datasets and produces
operational insights and visual analytics.
A dedicated validation pipeline is also used to verify dataset consistency
and quality before the data is used by the intelligence layer.
## 🖥️ Branch Manager Experience
The manager dashboard provides a centralized view of branch operations.
Managers can access:
- Current branch conditions
- Queue pressure
- Wait-time information
- Demand forecasts
- Bottleneck alerts
- Operational recommendations
- Simulation results
- Customer feedback insights
- Branch performance analytics
The objective is to move branch management from reactive problem solving
toward proactive operational decision-making.
## 👤 Customer Experience
AVENUE also includes a customer-facing service interface.
Customers can access service information and receive recommendations based on
available branch and operational information.
This creates a two-sided system:
Branch Manager
      ↕
AVENUE Intelligence Layer
      ↕
Customer

The manager receives operational intelligence while customers receive a more
efficient service experience.
## ⚙️ Tech Stack
Layer	Technology
Frontend	React 18, TypeScript, Vite, Tailwind CSS, Recharts, Axios
Backend	Python, FastAPI, Uvicorn, Pydantic, pydantic-settings
Database	SQLite, SQLAlchemy
ML / Data	Pandas, NumPy, Scikit-learn, XGBoost
NLP	TextBlob
API	REST APIs
Containerization	Docker, Docker Compose
Development	Git, GitHub, VS Code


## 🔌 API
The completed backend exposes API endpoints for the major AVENUE capabilities.
Method	Path	Status	Description
GET	/api/health	✅ Active	Service health check
GET	/api/branches/	✅ Active	Retrieve branch information
GET	/api/forecast/{branch_id}	✅ Active	Generate branch demand forecast
GET	/api/bottlenecks/	✅ Active	Retrieve bottleneck conditions
GET	/api/recommendations/{branch_id}	✅ Active	Generate operational recommendations
POST	/api/simulate/	✅ Active	Simulate operational actions
POST	/api/feedback/analyze	✅ Active	Analyze customer feedback sentiment


The frontend communicates with the backend through the configured API client,
with TypeScript interfaces aligned with the backend request and response
schemas.
## 🧪 Verification & Testing
The completed implementation was verified through automated and integration
checks.
Backend Tests
19 / 19 PASSED

Additional verification included:
- Backend startup verification
- API health checks
- API endpoint verification
- Frontend production build
- Frontend/backend integration checks
- Data pipeline validation
- Dataset QA checks
- End-to-end application verification
The data validation pipeline successfully completed its configured QA checks.
## 🐳 Running Locally
Prerequisites
- Node.js 18+
- Python 3.11+
Backend
cd avenue/backend

# Create virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate

# Linux/macOS
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env

# Start the backend
uvicorn app.main:app --reload

Backend:
http://localhost:8000

API documentation:
http://localhost:8000/docs

Health check:
http://localhost:8000/api/health

Frontend
cd avenue/frontend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Start development server
npm run dev

Frontend:
http://localhost:5173

## 🔐 Environment Variables
Variable	Location	Description
VITE_API_BASE_URL	Frontend .env	Backend API base URL
APP_ENV	Backend .env	Application environment
APP_VERSION	Backend .env	Application version
DATABASE_URL	Backend .env	SQLAlchemy database connection
ALLOWED_ORIGINS	Backend .env	Allowed CORS origins


⚠️ Never commit .env files to version control.

## 🧩 Engineering Principles
The project follows a modular architecture so that individual components can
be developed and maintained independently.
- Business logic is separated from API route handlers.
- Machine-learning logic is isolated inside the ML layer.
- Database operations are handled through SQLAlchemy.
- Pydantic schemas define structured API contracts.
- TypeScript interfaces maintain frontend type safety.
- Data generation, analysis and validation are separated into dedicated
  pipeline stages.
- Frontend and backend communicate through defined REST API boundaries.
## 📊 Project Verification
The project was tested across the major system layers:
<p>
                    AVENUE
                       │
          ┌────────────┼────────────┐
          ↓            ↓            ↓
       Frontend     Backend       Data
          │            │            │
          ↓            ↓            ↓
       UI Build     API Tests    QA Checks
          │            │            │
          └────────────┼────────────┘
                       ↓
                Integrated System
                       ↓
                 ✅ VERIFIED
</p>

## 🏆 Final Outcome
AVENUE evolved from a branch-operations concept into a complete intelligent
decision-support platform for banking environments.
The final system combines:
- 📈 Demand forecasting
- 🚨 Bottleneck detection
- ⏱️ Wait-time estimation
- 💡 Operational recommendations
- 🧪 What-if simulation
- 💬 Customer feedback NLP
- 📊 Branch analytics
- 👤 Customer-facing services
- 🖥️ Interactive manager dashboard
- 🔌 Integrated REST APIs
- 🗃️ Data generation and validation
- 🧪 Automated verification
The result is a unified platform designed to help bank branches identify
operational pressure earlier, understand its causes, evaluate possible
actions, and make better decisions using data.
## 🚀 Project Status
AVENUE is complete.
All planned intelligence modules, data pipelines, backend services, frontend
interfaces, analytics capabilities, recommendations, simulations, NLP
processing, and integration components have been implemented and verified.
