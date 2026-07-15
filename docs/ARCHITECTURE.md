# BharatSeva AI — System Architecture

> Version: 1.0 | Status: Approved for Implementation

---

## 1. High-Level System Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        CITIZEN / OPERATOR                               │
│        (Browser · Mobile Browser · CSC Terminal · Screen Reader)        │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ HTTPS
┌────────────────────────────▼────────────────────────────────────────────┐
│                     REACT FRONTEND  (Vite + TypeScript)                  │
│  Pages: Auth · Profile · Dashboard · Schemes · Eligibility · Copilot   │
│         Documents · Chat · Tracker · Calendar · Notifications · Admin   │
│  State: Zustand store · React Query (server-state + caching)            │
│  A11y: WCAG 2.1 AA enforced — semantic HTML, ARIA, keyboard nav         │
│  i18n: react-i18next, language list driven by config (not hardcoded)    │
└────────────────────────────┬────────────────────────────────────────────┘
                             │ REST  /api/v1/*
                             │ JWT Bearer token (access + refresh)
┌────────────────────────────▼────────────────────────────────────────────┐
│                  FLASK REST API  (Python 3.11+)                          │
│                                                                          │
│  ┌──────────────────────────────────────────────────────────────────┐   │
│  │ Middleware pipeline (applied to every request)                   │   │
│  │  1. Request-ID injection (X-Request-ID header / UUID v4)         │   │
│  │  2. Structured JSON logging (request in / response out)          │   │
│  │  3. JWT verification + RBAC guard (server-side, no client trust) │   │
│  │  4. Input validation (marshmallow schemas)                       │   │
│  │  5. Rate limiting (Flask-Limiter, Redis-backed or in-memory)     │   │
│  │  6. Response envelope wrapper                                    │   │
│  └──────────────────────────────────────────────────────────────────┘   │
│                                                                          │
│  Route groups (all under /api/v1):                                      │
│  auth · profile · schemes · eligibility · goals · applications          │
│  documents · deadlines · chat · saved-schemes · notifications           │
│  health · admin                                                          │
└──────┬──────────────────────┬───────────────────────────────────────────┘
       │                      │
       │ SQLAlchemy ORM        │ Agent Orchestrator call
       ▼                      ▼
┌─────────────┐    ┌──────────────────────────────────────────────────────┐
│   SQLite    │    │              AI ORCHESTRATION LAYER                  │
│  (Phase 1)  │    │                                                      │
│  ──────── ──│    │  ┌─────────────────────────────────────────────┐    │
│  Upgrade    │    │  │  Orchestrator (routes intents → agents,     │    │
│  path to    │    │  │  logs every call to agent_logs table,       │    │
│  Postgres   │    │  │  handles fallback + escalation)             │    │
│  documented │    │  └──────────────┬──────────────────────────────┘    │
│  in Phase 2 │    │                 │ dispatches to one or more agents   │
└─────────────┘    │  ┌──────────────▼──────────────────────────────┐    │
                   │  │  SPECIALIST AGENTS  (one Python class each)  │    │
                   │  │                                              │    │
                   │  │  CitizenProfile · SchemeDiscovery            │    │
                   │  │  Eligibility · DocumentVerification          │    │
                   │  │  ApplicationGuide · LanguageTranslation      │    │
                   │  │  DeadlineReminder · KnowledgeRetrieval       │    │
                   │  │  Conversation · Reasoning                    │    │
                   │  │  Recommendation · GoalPlanning               │    │
                   │  └──────────┬───────────────────────────────────┘    │
                   │             │                                         │
                   │  ┌──────────▼───────────────────────────────────┐    │
                   │  │  INFERENCE + RETRIEVAL LAYER                 │    │
                   │  │                                              │    │
                   │  │  IBM watsonx.ai Granite                      │    │
                   │  │   · granite-13b-chat  (dialogue, copilot)    │    │
                   │  │   · granite-13b-instruct  (eligibility,      │    │
                   │  │     reasoning, plan generation)              │    │
                   │  │   · granite-embedding  (semantic search)     │    │
                   │  │                                              │    │
                   │  │  Hybrid Vector Store (Phase 1: ChromaDB      │    │
                   │  │  local; Phase 2: IBM watsonx Discovery or    │    │
                   │  │  managed Milvus)                             │    │
                   │  │   · BM25 keyword index  +  dense embeddings  │    │
                   │  │   · Versioned scheme KB  (kb_sources table   │    │
                   │  │     tracks freshness)                        │    │
                   │  └──────────────────────────────────────────────┘    │
                   └──────────────────────────────────────────────────────┘
```

---

## 2. Request Lifecycle (illustrative — Eligibility Check)

```
Citizen → POST /api/v1/eligibility/check
    │
    ├─ Middleware: attach X-Request-ID, log request
    ├─ Middleware: validate JWT → extract user_id + role
    ├─ Middleware: RBAC check (citizen or admin allowed)
    ├─ Middleware: validate request body (marshmallow)
    ├─ Middleware: rate-limit check
    │
    ├─ Route handler: load citizen_profile from DB
    ├─ Orchestrator.dispatch(intent=ELIGIBILITY, profile, scheme_id)
    │     ├─ KnowledgeRetrieval agent: hybrid RAG fetch for scheme chunks
    │     ├─ Eligibility agent: Granite call with profile + chunks
    │     │     returns AgentResponse(result, confidence, reasoning,
    │     │                           sources, fallback_used, ...)
    │     └─ Orchestrator: write agent_logs row, return AgentResponse
    │
    ├─ Route handler: write eligibility_checks row (immutable audit)
    ├─ Route handler: build API response envelope
    └─ Middleware: log response (status, latency, request_id)
    → 200 JSON
```

---

## 3. Shared Agent Response Contract

Every agent in the system **must** return an object conforming to this contract. No agent may return a bare string or untyped dict. The Orchestrator validates conformance before writing agent_logs.

```
AgentResponse {
  result          : any          // structured output — varies by agent type
  confidence      : float        // 0.0 – 1.0; 0.0 means "no signal at all"
  reasoning       : string       // human-readable explanation in English;
                                 // translated downstream by LanguageTranslation agent
  sources         : list[Source] // each Source: {name, url, kb_version, excerpt}
  fallback_used   : bool         // true if AI provider unreachable or timed out
  fallback_reason : string|null  // non-null when fallback_used is true
  escalate_to     : string|null  // agent name if this agent cannot fully resolve
  agent_name      : string       // canonical agent identifier (snake_case)
  latency_ms      : int          // wall-clock ms for this agent's execution
  request_id      : string       // propagated from the HTTP X-Request-ID header
}
```

**Rules:**
- `confidence` must never be omitted or set to a sentinel outside [0, 1].
- `reasoning` must never be the raw LLM output — agents are responsible for extracting or summarising it.
- When `fallback_used = true`, the API response envelope must include `"degraded": true` at the top level and the UI must surface a visible degraded-mode badge. Silent degradation is prohibited.
- `sources` must list only records actually retrieved and used — never hallucinated citations.
- The Orchestrator writes every AgentResponse to `agent_logs` verbatim (input + output as JSON), regardless of whether the call succeeded or fell back.

---

## 4. AI Provider Timeout and Fallback Policy

| Scenario | Behaviour |
|---|---|
| watsonx.ai responds within 15 s | Normal flow |
| watsonx.ai timeout (> 15 s) | Fallback: rule-based logic from `eligibility_rules_json` in DB; `fallback_used = true` |
| watsonx.ai HTTP 5xx | Same as timeout |
| watsonx.ai HTTP 429 (rate limit) | Retry once after 2 s; if second attempt also fails, fallback |
| Vector store unavailable | Fallback to full-text SQL search; note in `fallback_reason` |

---

## 5. Scalability and Phase 2 Upgrade Path

### Current Ceiling (Phase 1)
- SQLite is single-writer; cannot support concurrent multi-instance writes.
- ChromaDB local vector store is single-process.
- File uploads stored on local filesystem.

### Phase 2 Migration (documented, not built in Phase 1)
| Component | Phase 1 | Phase 2 |
|---|---|---|
| Relational DB | SQLite | PostgreSQL (schema is identical — SQLAlchemy dialect swap) |
| Vector store | ChromaDB local | IBM watsonx Discovery or managed Milvus |
| File storage | Local filesystem | IBM Cloud Object Storage |
| Session / rate limit backend | In-memory | Redis cluster |
| API layer | Single Flask process | Gunicorn workers behind Nginx or Cloud Run |

The Flask API layer is **stateless by design** (no in-process session state, all state in DB). Horizontal scaling requires only adding Postgres and Redis in Phase 2.

---

## 6. Knowledge Base Versioning

- Every scheme document ingested into the vector store is tagged with a `kb_version` string (e.g., `2025-Q2-v1`).
- `kb_sources` table records the source URL, last verified date, and version for every corpus entry.
- The Admin Portal surfaces stale sources (last verified > 90 days) as a warning.
- When a Granite call cites a chunk, the `kb_version` of that chunk is included in `AgentResponse.sources`.
- Re-ingestion produces a new `kb_version` without deleting the old one, preserving audit trails for historical eligibility checks.

---

## 7. Language Architecture

- Language preference is stored in `citizen_profiles.preferred_language`.
- All Granite generation prompts are templated to accept a target language code.
- The `LanguageTranslation` agent is invoked by the Orchestrator **after** all other agents return their English `reasoning` string — translations are never baked into primary agent logic.
- Supported language codes live in `config/languages.json` (not hardcoded conditionals). Adding a new language requires only adding its code to that file and verifying Granite coverage.
- Launch languages: `en` (English), `hi` (Hindi). Architecture ready for all 22 scheduled Indian languages.
