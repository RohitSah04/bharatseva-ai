# /backend/ai/agents

Specialist agent implementations. Each file contains exactly one agent class that extends `BaseAgent` from `../base_agent.py`.

## Contract

Every agent class must:
1. Define `AGENT_NAME: str` as a class attribute (snake_case, matching AGENTS_OVERVIEW.md).
2. Implement `execute(self, payload: dict, request_id: str) -> AgentResponse`.
3. Never return a bare string or raise an unhandled exception to the Orchestrator.
4. If the AI provider call fails, catch the exception, set `fallback_used=True`, and produce a deterministic result.
5. Include its own unit test in `/backend/tests/agents/test_<agent_name>.py`.

See `/docs/AGENTS_OVERVIEW.md` for each agent's purpose, inputs, and output shape.
