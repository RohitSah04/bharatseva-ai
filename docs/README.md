# /docs

Planning and architecture artifacts. Every later implementation phase must follow these documents exactly.

| File | Description |
|---|---|
| `ARCHITECTURE.md` | System diagram, request lifecycle, agent contract, scalability notes |
| `PERSONAS_AND_REQUIREMENTS.md` | 7 personas, 2 user journeys, full functional + non-functional requirements |
| `API_CONTRACT.md` | Every endpoint: method, path, purpose, role, request/response shape |
| `DATABASE_SCHEMA.sql` | CREATE TABLE statements for all 14 tables |
| `AGENTS_OVERVIEW.md` | All 12 agents described + shared AgentResponse contract |
| `SECURITY_AND_RBAC.md` | Roles, permissions matrix, JWT policy, rate limits, secrets handling |
| `OBSERVABILITY.md` | Log format, request-ID strategy, health checks, audit policy |

> **Rule:** Do not edit these files to match implementation shortcuts. If implementation diverges from a doc, fix the implementation or raise a documented ADR (Architecture Decision Record) explaining why.
