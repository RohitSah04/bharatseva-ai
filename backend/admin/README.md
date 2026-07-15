# /backend/admin

Admin-only route handlers and services. All routes in this directory are RBAC-gated to the `admin` role. A non-admin caller hitting any route here must receive `403 Forbidden` before any query is executed.

## Files (to be created in Phase 2)

- `routes.py` — Blueprint for `/api/v1/admin/*`
- Analytics handlers: user-growth, popular-schemes, agent-performance, search-trends, system-health, kb-status
- `audit_log.py` — Paginated audit log browser (queries eligibility_checks + agent_logs)
- `feature_flags.py` — GET all flags, PATCH individual flag
- `demo_reset.py` — POST to flush non-seed data for demos

## Admin Portal Data Sources

| Panel | Source table(s) |
|---|---|
| User growth | `users.created_at` |
| Popular schemes | `eligibility_checks`, `saved_schemes` |
| Agent performance | `agent_logs` — avg latency, confidence, fallback_rate |
| Search trends | `agent_logs` input_json (scheme_discovery calls) |
| System health | live DB + AI provider ping |
| KB freshness | `kb_sources.last_verified_date` |
| Audit log browser | `eligibility_checks`, `agent_logs` |
