# BharatSeva AI — API Contract

> Version: v1 | Base path: `/api/v1` | All responses use the standard envelope below.

---

## Standard Response Envelope

All responses (success and error) return a JSON object conforming to:

```json
{
  "success": true | false,
  "data":    <payload — varies by endpoint>,
  "error":   null | { "code": "string", "message": "string" },
  "meta":    {
    "request_id": "uuid-v4",
    "api_version": "v1",
    "degraded": false | true
  }
}
```

- `degraded: true` is set whenever an AI call fell back to rule-based logic.
- `request_id` matches the `X-Request-ID` header on the response.
- HTTP status codes follow REST conventions (200, 201, 400, 401, 403, 404, 422, 429, 500).

---

## Rate Limit Headers

Every response includes:
```
X-RateLimit-Limit: <requests per window>
X-RateLimit-Remaining: <remaining in window>
X-RateLimit-Reset: <epoch timestamp>
```

See `SECURITY_AND_RBAC.md` for per-route tier definitions.

---

## Authentication

All endpoints except `/auth/*`, `/health`, `/health/ready`, and `/version` require:
```
Authorization: Bearer <access_token>
```

---

## 1. Auth

### POST /api/v1/auth/signup
| Field | Value |
|---|---|
| Purpose | Register a new citizen account |
| Required role | None (public) |
| Rate limit tier | Strict (5 req/min per IP) |
| Request body | `{ "email": string, "password": string }` |
| Response 201 | `{ "user_id": uuid, "email": string, "role": "citizen" }` |
| Errors | 400 invalid input, 409 email already registered |

### POST /api/v1/auth/login
| Field | Value |
|---|---|
| Purpose | Authenticate and receive access + refresh tokens |
| Required role | None (public) |
| Rate limit tier | Strict (10 req/min per IP) |
| Request body | `{ "email": string, "password": string }` |
| Response 200 | `{ "access_token": string, "refresh_token": string, "expires_in": 900 }` |
| Errors | 401 invalid credentials |

### POST /api/v1/auth/refresh
| Field | Value |
|---|---|
| Purpose | Exchange refresh token for a new access token |
| Required role | None (requires valid refresh token in body) |
| Rate limit tier | Standard |
| Request body | `{ "refresh_token": string }` |
| Response 200 | `{ "access_token": string, "expires_in": 900 }` |
| Errors | 401 invalid or expired refresh token |

### POST /api/v1/auth/logout
| Field | Value |
|---|---|
| Purpose | Revoke refresh token server-side |
| Required role | citizen, admin, csc_operator |
| Rate limit tier | Standard |
| Request body | `{ "refresh_token": string }` |
| Response 200 | `{ "message": "logged out" }` |

### POST /api/v1/auth/password-reset/request
| Field | Value |
|---|---|
| Purpose | Request password-reset email (stub in v1) |
| Required role | None (public) |
| Rate limit tier | Strict (3 req/min per IP) |
| Request body | `{ "email": string }` |
| Response 200 | `{ "message": "reset email sent if account exists" }` |

### POST /api/v1/auth/password-reset/confirm
| Field | Value |
|---|---|
| Purpose | Confirm reset with token and new password |
| Required role | None (public) |
| Rate limit tier | Strict |
| Request body | `{ "token": string, "new_password": string }` |
| Response 200 | `{ "message": "password updated" }` |
| Errors | 400 invalid/expired token |

---

## 2. Profile

### GET /api/v1/profile
| Field | Value |
|---|---|
| Purpose | Retrieve authenticated citizen's profile + completeness % |
| Required role | citizen, admin |
| Response 200 | Full citizen_profile object + `profile_completeness_pct` |

### PUT /api/v1/profile
| Field | Value |
|---|---|
| Purpose | Create or update authenticated citizen's profile |
| Required role | citizen |
| Request body | Any subset of profile fields (partial update supported) |
| Response 200 | Updated profile + `profile_completeness_pct` |
| Errors | 400 invalid field values, 422 validation error |

---

## 3. Schemes

### GET /api/v1/schemes
| Field | Value |
|---|---|
| Purpose | List / search / filter schemes |
| Required role | citizen, admin |
| Query params | `category`, `state`, `occupation`, `q` (keyword/semantic search), `page`, `per_page` |
| Response 200 | `{ "schemes": [...], "total": int, "page": int, "per_page": int }` |

### GET /api/v1/schemes/{id}
| Field | Value |
|---|---|
| Purpose | Retrieve full detail for one scheme |
| Required role | citizen, admin |
| Response 200 | Full scheme object including eligibility_rules_json, required_documents_json, office_address, office_contact |
| Errors | 404 scheme not found |

---

## 4. Eligibility

### POST /api/v1/eligibility/check
| Field | Value |
|---|---|
| Purpose | Run AI + rule-based eligibility check for a citizen + scheme pair |
| Required role | citizen |
| Request body | `{ "scheme_id": string }` |
| Response 200 | `{ "verdict": "ELIGIBLE\|NOT_ELIGIBLE\|PARTIALLY_ELIGIBLE", "confidence": float, "reasoning": string, "sources": [...], "fallback_used": bool, "check_id": uuid }` |
| Notes | Result persisted to eligibility_checks. Degraded flag set if fallback_used. |

---

## 5. AI Citizen Copilot (Goals)

### POST /api/v1/goals
| Field | Value |
|---|---|
| Purpose | Submit a free-text life goal; trigger GoalPlanning agent; return structured plan |
| Required role | citizen |
| Rate limit tier | AI tier (2 req/min per user) |
| Request body | `{ "goal_text": string }` |
| Response 201 | `{ "goal_id": uuid, "goal_text": string, "plan": <generated_plan_json>, "status": "DRAFT", "confidence": float, "sources": [...] }` |
| Notes | Plan is DRAFT until citizen explicitly activates it |

### POST /api/v1/goals/{id}/activate
| Field | Value |
|---|---|
| Purpose | Citizen confirms plan — creates tracker rows, calendar entries, notifications |
| Required role | citizen |
| Response 200 | `{ "goal_id": uuid, "status": "ACTIVE", "tracker_ids": [...], "calendar_entries_created": int }` |

### GET /api/v1/goals
| Field | Value |
|---|---|
| Purpose | List citizen's goals (all statuses) |
| Required role | citizen |
| Response 200 | `{ "goals": [ { id, goal_text, status, created_at } ] }` |

### GET /api/v1/goals/{id}
| Field | Value |
|---|---|
| Purpose | Retrieve full goal including generated_plan_json |
| Required role | citizen |
| Response 200 | Full citizen_goals object |
| Errors | 404 goal not found or not owned by caller |

---

## 6. Applications (Tracker)

### GET /api/v1/applications
| Field | Value |
|---|---|
| Purpose | List all application tracker rows for authenticated citizen |
| Required role | citizen |
| Query params | `status`, `scheme_id` |
| Response 200 | `{ "applications": [...] }` |

### POST /api/v1/applications
| Field | Value |
|---|---|
| Purpose | Manually create a tracker entry for a scheme |
| Required role | citizen |
| Request body | `{ "scheme_id": string }` |
| Response 201 | Application tracker object |

### PATCH /api/v1/applications/{id}
| Field | Value |
|---|---|
| Purpose | Update tracker status |
| Required role | citizen |
| Request body | `{ "status": "IN_PROGRESS\|SUBMITTED\|APPROVED\|REJECTED", "note": string (optional) }` |
| Response 200 | Updated application object with appended status_history_json |
| Errors | 400 invalid status transition, 404 not found or not owned |

---

## 7. Documents (Vault)

### POST /api/v1/documents
| Field | Value |
|---|---|
| Purpose | Upload a document to the personal vault |
| Required role | citizen |
| Rate limit tier | Upload tier (20 uploads/hour per user) |
| Request body | `multipart/form-data` — file + optional `category` + optional `scheme_id` |
| Response 201 | `{ "document_id": uuid, "filename": string, "category": string, "extracted_text": string, "ai_explanation": string, "verified_against_requirement": "VERIFIED\|MISMATCH\|UNREADABLE\|PENDING" }` |

### GET /api/v1/documents
| Field | Value |
|---|---|
| Purpose | List all documents in citizen's vault |
| Required role | citizen |
| Query params | `category`, `scheme_id` |
| Response 200 | `{ "documents": [...] }` |

### GET /api/v1/documents/{id}
| Field | Value |
|---|---|
| Purpose | Retrieve full document record including extracted text and AI explanation |
| Required role | citizen |
| Response 200 | Full document object |
| Errors | 404 not found or not owned |

---

## 8. Deadlines (Calendar)

### GET /api/v1/deadlines
| Field | Value |
|---|---|
| Purpose | Aggregated calendar — all deadlines from saved schemes + active goals |
| Required role | citizen |
| Query params | `from_date`, `to_date` (ISO 8601) |
| Response 200 | `{ "deadlines": [ { scheme_id, scheme_name, deadline, days_remaining, source } ] }` |

---

## 9. Chat

### POST /api/v1/chat
| Field | Value |
|---|---|
| Purpose | Send a message to the Conversation agent |
| Required role | citizen |
| Rate limit tier | AI tier (10 req/min per user) |
| Request body | `{ "message": string, "language": string (optional, overrides profile preference) }` |
| Response 200 | `{ "reply": string, "reasoning": string, "sources": [...], "agent_used": string, "confidence": float, "fallback_used": bool }` |

### GET /api/v1/chat/history
| Field | Value |
|---|---|
| Purpose | Retrieve paginated chat history for authenticated citizen |
| Required role | citizen |
| Query params | `page`, `per_page` |
| Response 200 | `{ "history": [ { role, message, agent_used, confidence, sources_json, created_at } ] }` |

---

## 10. Saved Schemes

### GET /api/v1/saved-schemes
| Field | Value |
|---|---|
| Purpose | List citizen's saved schemes |
| Required role | citizen |
| Response 200 | `{ "saved_schemes": [ { scheme_id, scheme_name, saved_at } ] }` |

### POST /api/v1/saved-schemes
| Field | Value |
|---|---|
| Purpose | Save a scheme |
| Required role | citizen |
| Request body | `{ "scheme_id": string }` |
| Response 201 | `{ "saved_at": timestamp }` |
| Errors | 409 already saved |

### DELETE /api/v1/saved-schemes/{scheme_id}
| Field | Value |
|---|---|
| Purpose | Remove a scheme from saved list |
| Required role | citizen |
| Response 200 | `{ "message": "removed" }` |

---

## 11. Notifications

### GET /api/v1/notifications
| Field | Value |
|---|---|
| Purpose | List notifications for authenticated citizen |
| Required role | citizen |
| Query params | `unread_only` (bool), `page`, `per_page` |
| Response 200 | `{ "notifications": [...], "unread_count": int }` |

### PATCH /api/v1/notifications/{id}/read
| Field | Value |
|---|---|
| Purpose | Mark a notification as read |
| Required role | citizen |
| Response 200 | `{ "read": true }` |

### PATCH /api/v1/notifications/read-all
| Field | Value |
|---|---|
| Purpose | Mark all notifications for citizen as read |
| Required role | citizen |
| Response 200 | `{ "updated": int }` |

---

## 12. Health & Version

### GET /api/v1/health
| Field | Value |
|---|---|
| Purpose | Liveness check — is the process alive? |
| Required role | None (public) |
| Response 200 | `{ "status": "ok", "timestamp": ISO8601 }` |
| Notes | Returns 200 as long as Flask is running. Does NOT check DB or AI. |

### GET /api/v1/health/ready
| Field | Value |
|---|---|
| Purpose | Readiness check — can the app serve traffic? |
| Required role | None (public) |
| Response 200 | `{ "status": "ready", "db": "ok", "ai_provider": "ok\|degraded", "vector_store": "ok\|degraded" }` |
| Response 503 | Same shape, `"status": "not_ready"`, if DB is unreachable |

### GET /api/v1/version
| Field | Value |
|---|---|
| Purpose | Return deployed API version and build info |
| Required role | None (public) |
| Response 200 | `{ "version": "1.0.0", "git_sha": string, "deployed_at": ISO8601 }` |

---

## 13. Admin — Analytics

> All admin routes require role = `admin`. Non-admin callers receive 403.

### GET /api/v1/admin/analytics/user-growth
Returns daily/weekly user registration counts.

### GET /api/v1/admin/analytics/popular-schemes
Returns top N most-viewed and most-eligibility-checked schemes.

### GET /api/v1/admin/analytics/agent-performance
Returns per-agent aggregates: avg latency_ms, avg confidence, fallback_rate, escalation_rate, call_count. Sourced from agent_logs.

### GET /api/v1/admin/analytics/search-trends
Returns top search queries (keyword + semantic) over a time window.

### GET /api/v1/admin/analytics/system-health
Returns current DB size, vector store index stats, AI provider status, error rate.

### GET /api/v1/admin/analytics/kb-status
Returns kb_sources records, highlighting sources with last_verified_date > 90 days ago.

### GET /api/v1/admin/audit-logs
Returns paginated eligibility_checks and agent_logs for admin audit browser.
Query params: `agent_name`, `user_id`, `from_date`, `to_date`, `fallback_only`.

---

## 14. Admin — Feature Flags

### GET /api/v1/admin/feature-flags
Returns all feature_flags rows.

### PATCH /api/v1/admin/feature-flags/{flag_name}
| Request body | `{ "enabled": bool }` |
Updates a flag at runtime. No redeploy required.

---

## 15. Admin — Demo Reset

### POST /api/v1/admin/demo-reset
| Field | Value |
|---|---|
| Purpose | Reset demo environment: clear non-seed data (applications, goals, chat_history, notifications, documents) |
| Required role | admin |
| Notes | Never deletes users, schemes, or KB data. Idempotent. |
| Response 200 | `{ "message": "demo reset complete", "rows_deleted": int }` |
