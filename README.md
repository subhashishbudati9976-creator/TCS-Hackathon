# AVENUE — Intelligent Branch Service Load & Customer Experience Optimizer

> **TCS Hackathon Project**

BranchIQ is an AI-powered operations platform that helps bank branch managers
reduce queue wait times, detect service bottlenecks before they happen, and
make smarter staffing decisions through data-driven recommendations.

---

## Problem Statement

Banks suffer from uneven customer traffic across branches and time periods,
causing long queues, staff overload, service bottlenecks, and inconsistent
customer experience.

---

## System Capabilities (Roadmap)

| # | Capability | Status |
|---|-----------|--------|
| 1 | Demand Forecasting — predict future branch traffic | 🔲 Planned |
| 2 | Bottleneck Detection — detect pressure before queues form | 🔲 Planned |
| 3 | Wait Time Estimation — real-time queue pressure scores | 🔲 Planned |
| 4 | Recommendation Engine — staff reassignment, customer redirection | 🔲 Planned |
| 5 | Simulation Engine — model impact of proposed actions | 🔲 Planned |
| 6 | Feedback NLP — sentiment analysis on customer comments | 🔲 Planned |
| 7 | Branch Manager Dashboard — premium real-time UI | 🔲 Planned |
| ✅ | Project foundation — API + frontend shell | **Done** |

---

## Architecture

```
branchiq/
├── frontend/                  # React + TypeScript + Vite + Tailwind + Recharts
│   └── src/
│       ├── api/               # Axios client (VITE_API_BASE_URL)
│       ├── types/             # TypeScript interfaces (mirrors backend schemas)
│       └── App.tsx            # Shell UI (health check)
│
├── backend/
│   ├── app/
│   │   ├── main.py            # FastAPI app factory + CORS + lifespan
│   │   ├── config.py          # pydantic-settings (reads .env)
│   │   ├── routes/            # One file per domain (health, branches, forecast…)
│   │   ├── services/          # Business logic (separate from routes)
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   └── database/          # Engine, session factory, Base, init_db()
│   └── ml/                    # ML modules (demand_forecasting, bottleneck_detection…)
│
├── data/
│   ├── raw/                   # Raw synthetic / real data files
│   ├── processed/             # Cleaned data ready for training
│   └── generate_data.py       # Synthetic data generator
│
├── notebooks/                 # Jupyter notebooks for exploration / prototyping
├── .env.example               # Environment variable documentation
├── docker-compose.yml         # Container setup (for future deployment)
└── README.md
```

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, TypeScript, Vite 8, Tailwind CSS 4, Recharts, Axios |
| **Backend** | Python 3.x, FastAPI, Uvicorn, Pydantic v2, pydantic-settings |
| **Database** | SQLite (dev) → PostgreSQL (prod) via SQLAlchemy |
| **ML / Data** | Pandas, NumPy, Scikit-learn, XGBoost |
| **NLP** | TextBlob (baseline) |

---

## Running Locally

### Prerequisites

- Node.js 18+
- Python 3.11+

### Backend

```bash
cd branchiq/backend

# Create virtual environment (first time only)
python -m venv .venv

# Activate
# Windows:
.venv\Scripts\activate
# Linux/macOS:
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Copy env file
cp .env.example .env

# Start the server
uvicorn app.main:app --reload
```

Backend runs on **http://localhost:8000**

- API docs: http://localhost:8000/docs
- Health check: http://localhost:8000/api/health

### Frontend

```bash
cd branchiq/frontend

# Install dependencies (first time only)
npm install

# Copy env file
cp .env.example .env

# Start dev server
npm run dev
```

Frontend runs on **http://localhost:5173**

The Vite dev server automatically proxies `/api/*` requests to the backend,
so no CORS configuration is needed during local development.

---

## Environment Variables

| Variable | Where | Description |
|----------|-------|-------------|
| `VITE_API_BASE_URL` | Frontend `.env` | Backend base URL (defaults to `/api` which is proxied) |
| `APP_ENV` | Backend `.env` | `development` or `production` |
| `APP_VERSION` | Backend `.env` | Semantic version string |
| `DATABASE_URL` | Backend `.env` | SQLAlchemy connection string |
| `ALLOWED_ORIGINS` | Backend `.env` | Comma-separated CORS origins |

> ⚠️ **Never commit `.env` files to version control.**

---

## API Endpoints

| Method | Path | Status | Description |
|--------|------|--------|-------------|
| GET | `/api/health` | ✅ Active | Service health check |
| GET | `/api/branches/` | 🔲 Placeholder | List all branches |
| GET | `/api/forecast/{branch_id}` | 🔲 Placeholder | Demand forecast |
| GET | `/api/bottlenecks/` | 🔲 Placeholder | Active bottleneck alerts |
| GET | `/api/recommendations/{branch_id}` | 🔲 Placeholder | Operational recommendations |
| POST | `/api/simulate/` | 🔲 Placeholder | Simulate action impact |
| POST | `/api/feedback/analyze` | 🔲 Placeholder | Analyze feedback sentiment |

---

## Development Notes

- Business logic lives in `services/`, not in route handlers.
- ML inference code lives in `ml/`, not in `services/` or `routes/`.
- TypeScript interfaces in `src/types/index.ts` mirror backend Pydantic schemas.
- The database layer is database-agnostic — swap `DATABASE_URL` to migrate from SQLite to PostgreSQL.
- Placeholder ML modules raise `NotImplementedError` to prevent accidental use before implementation.
