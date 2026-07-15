# /backend/middleware

Flask middleware (implemented as `before_request` / `after_request` hooks and decorators). Applied to every request in the order listed below.

## Middleware Execution Order

1. **`request_id.py`** — Attach `X-Request-ID` (reuse from header or generate UUID v4); store in `flask.g`.
2. **`logging_middleware.py`** — Emit structured JSON `request_in` log line; emit `request_out` log line after response with status code + latency.
3. **`auth.py`** — Parse and verify JWT Bearer token; populate `flask.g.current_user` with `{ user_id, role }`. Returns `401` if token is missing or invalid on protected routes.
4. **`rbac.py`** — Per-route role check using the RBAC matrix defined in `SECURITY_AND_RBAC.md`. Returns `403` on denial before any business logic runs.
5. **`validation.py`** — Marshmallow schema validation for request bodies. Returns `422` with structured field errors on failure.
6. **`rate_limit.py`** — Flask-Limiter integration; per-IP for unauthenticated routes, per-user-ID for authenticated routes. Returns `429` with `Retry-After` header.
7. **`response_envelope.py`** — Wraps all route return values in the standard `{ success, data, error, meta }` envelope before the response is sent.

## Important

- Middleware must never execute business logic or DB queries (except auth token verification).
- Every middleware function must propagate `request_id` to its own log lines.
