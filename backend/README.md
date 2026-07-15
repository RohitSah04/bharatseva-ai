# BharatSeva AI — Backend

Python 3.11 / Flask REST API. Every endpoint in `/docs/API_CONTRACT.md` is implemented under `/api/v1`. No stubs, no 501s.

## Quick Start

```bash
# 1. Create and activate a virtual environment
python -m venv .venv && source .venv/bin/activate  # Windows: .venv\Scripts\activate

# 2. Install dependencies
pip install -r requirements.txt

# 3. Configure environment
cp .env.example .env
# Edit .env — fill in JWT_SECRET_KEY and SECRET_KEY at minimum

# 4. Start the server (auto-seeds DB on first run)
python run.py
# Server: http://localhost:5000
# Docs:   http://localhost:5000/api/v1/docs (Swagger UI)
```

## Demo Credentials (seeded automatically)

| Role    | Email                    | Password     |
|---------|--------------------------|--------------|
| admin   | admin@bharatseva.ai      | Admin@12345  |
| citizen | ramesh@demo.ai           | Citizen@123  |
| citizen | priya@demo.ai            | Citizen@123  |

## Running Tests

```bash
# From /backend directory
pytest tests/ -v

# With coverage report
pytest tests/ -v --cov=. --cov-report=term-missing

# Specific test file
pytest tests/test_rbac.py -v

# Fast run (stop on first failure)
pytest tests/ -x -q
```

Expected output: **75 tests pass**.

### Test coverage areas

| File | What is tested |
|------|---------------|
| `test_auth.py` | Signup, login, refresh, logout, password reset, duplicate email, weak password |
| `test_rbac.py` | Admin routes reject citizen token (403), unauthenticated routes return 401, health is public |
| `test_profile.py` | GET/PUT profile, completeness %, invalid category validation |
| `test_schemes.py` | List, filter by category, keyword search, detail, 404, cache |
| `test_eligibility.py` | Check success, invalid scheme, missing field, audit row created |
| `test_applications.py` | Create, list, valid transition, append-only history, invalid transition |
| `test_goals.py` | Create goal, validate input, list, get detail, activate |
| `test_chat.py` | Send message, history saved, empty message rejected, language override |
| `test_saved_schemes.py` | Save, list, duplicate 409, unsave, deadline calendar |
| `test_health.py` | Liveness, readiness, version, X-Request-ID header, envelope shape |
| `test_notifications.py` | List, mark single read, mark all read |
| `test_admin.py` | All analytics endpoints, feature flags CRUD, audit logs, demo reset |

## Architecture

```
run.py
└── app/__init__.py          # create_app() factory
    ├── app/extensions.py    # SQLAlchemy, JWT, Limiter, Cache, CORS
    ├── config.py            # All config from env vars — no hardcoded values
    ├── models/              # SQLAlchemy ORM (one file per table)
    ├── middleware/
    │   ├── request_id.py    # X-Request-ID injection
    │   ├── logging_middleware.py  # Structured JSON logging
    │   ├── rbac.py          # @require_role("admin") decorator
    │   └── errors.py        # Global exception → standard error envelope
    ├── utils/
    │   ├── response.py      # success_response() / error_response() envelope
    │   ├── validators.py    # Marshmallow schemas for every request body
    │   └── auth.py          # current_identity() JWT helper
    ├── routes/              # One Blueprint per domain, registered under /api/v1
    ├── services/            # Business logic — routes call services, never DB directly
    ├── ai/ai_service.py     # AI interface stub (MOCK — swap internals in Prompt 4)
    └── seed_data.py         # 27 schemes + admin + demo users + feature flags
```

## Key Design Decisions

### RBAC
All admin routes use `@require_role("admin")` — enforced server-side before any query runs. Frontend role checks are UX-only. See `SECURITY_AND_RBAC.md`.

### Response Envelope
Every response uses the standard envelope via `success_response()` / `error_response()`:
```json
{
  "success": true,
  "data": {...},
  "error": null,
  "meta": {"request_id": "uuid", "api_version": "v1", "degraded": false}
}
```

### Caching
`GET /api/v1/schemes` and `GET /api/v1/schemes/{id}` are cached via Flask-Caching (SimpleCache, 5-min TTL). This is a deliberate engineering-maturity signal for high-traffic read paths.

### Audit Tables
`eligibility_checks` and `agent_logs` are **append-only**. No `UPDATE` or `DELETE` operations exist in the service layer for these tables. `applications.status_history_json` is also append-only.

### AI Service Stub
`ai/ai_service.py` exposes 6 functions that return realistic mock responses. Every route calls **only** these functions — no inline AI logic in routes or services. Prompt 4 replaces the internals without touching any other file.

### Prompt Injection Boundary
Every function in `ai/ai_service.py` that accepts user text is marked with a `# PROMPT-INJECTION BOUNDARY` comment. The real Prompt 4 implementation will wrap user text in `<user_input>` delimiters before any LLM call.

## Phase 2 Upgrade Notes

- **SQLite → PostgreSQL**: Change `DATABASE_URL` env var. SQLAlchemy dialect swap; no schema changes needed.
- **In-memory cache → Redis**: Change `RATELIMIT_STORAGE_URI` and `CACHE_TYPE` env vars.
- **Local filesystem → IBM COS**: Update `document_service.py` storage backend only.
