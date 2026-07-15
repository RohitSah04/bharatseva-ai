# /backend/routes

Flask Blueprint definitions. One Blueprint per API domain. Each Blueprint is registered in `app/create_app()` with the `/api/v1` prefix.

## Blueprint Map

| File | Blueprint prefix | Domains covered |
|---|---|---|
| `auth.py` | `/api/v1/auth` | signup, login, refresh, logout, password reset |
| `profile.py` | `/api/v1/profile` | GET + PUT citizen profile |
| `schemes.py` | `/api/v1/schemes` | scheme list, filters, detail |
| `eligibility.py` | `/api/v1/eligibility` | eligibility check |
| `goals.py` | `/api/v1/goals` | AI Copilot goal create, activate, list, get |
| `applications.py` | `/api/v1/applications` | application tracker |
| `documents.py` | `/api/v1/documents` | document upload and vault |
| `deadlines.py` | `/api/v1/deadlines` | aggregated calendar |
| `chat.py` | `/api/v1/chat` | conversation and history |
| `saved_schemes.py` | `/api/v1/saved-schemes` | save/unsave |
| `notifications.py` | `/api/v1/notifications` | list, mark read |
| `health.py` | `/api/v1/health` | liveness + readiness |

> Routes must **only** validate input, call a service, and return the response envelope. No business logic or DB queries in route handlers.
