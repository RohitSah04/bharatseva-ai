# /backend/tests

Pytest test suite. All tests are written before or alongside the code they test. No business logic is considered "done" without a corresponding test.

## Structure

| Directory | What is tested |
|---|---|
| `unit/` | Individual service functions, model methods, utility functions — no HTTP, no DB |
| `integration/` | Route handlers with a real (in-memory SQLite) DB; mocked AI provider |
| `agents/` | One test file per agent; tests both AI-success and fallback-used paths |
| `fixtures/` | Shared pytest fixtures: test DB setup, seed data, mock Granite responses |

## Test Conventions

- Every agent test must include a **fallback path test**: verify that setting the AI client to raise `TimeoutError` results in `fallback_used=True` and a deterministic result, not an exception.
- Every RBAC-protected route must have a test that verifies a `403` is returned when called with an insufficient role.
- Audit tables (`eligibility_checks`, `agent_logs`) must have tests verifying rows are created and never updated.
- Use `pytest-cov` for coverage. Target: 80% line coverage on services and agents.

## Running Tests

```bash
cd backend
pytest tests/ -v --cov=. --cov-report=term-missing
```
