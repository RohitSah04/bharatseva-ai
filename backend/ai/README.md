# /backend/ai

AI orchestration layer. The Orchestrator lives here and all 12 specialist agents. Also contains the Granite client wrapper, the hybrid RAG retriever, and the prompt template library.

## Structure

| Path | Purpose |
|---|---|
| `orchestrator.py` | Routes intents to agent(s); writes agent_logs; handles timeouts + fallback |
| `base_agent.py` | Abstract base class all agents must extend; enforces AgentResponse contract |
| `agents/` | One file per agent (see below) |
| `granite_client.py` | Thin wrapper around IBM watsonx.ai REST API; handles auth, retry, timeout |
| `rag/` | Hybrid retriever (BM25 + semantic), vector store client, embedding utilities |
| `prompts/` | Jinja2 prompt templates, one per agent task; never inline strings in agent code |

## Agents Directory

| File | Agent | Canonical name |
|---|---|---|
| `agents/citizen_profile.py` | CitizenProfile | `citizen_profile` |
| `agents/scheme_discovery.py` | SchemeDiscovery | `scheme_discovery` |
| `agents/eligibility.py` | Eligibility | `eligibility` |
| `agents/document_verification.py` | DocumentVerification | `document_verification` |
| `agents/application_guide.py` | ApplicationGuide | `application_guide` |
| `agents/language_translation.py` | LanguageTranslation | `language_translation` |
| `agents/deadline_reminder.py` | DeadlineReminder | `deadline_reminder` |
| `agents/knowledge_retrieval.py` | KnowledgeRetrieval | `knowledge_retrieval` |
| `agents/conversation.py` | Conversation | `conversation` |
| `agents/reasoning.py` | Reasoning | `reasoning` |
| `agents/recommendation.py` | Recommendation | `recommendation` |
| `agents/goal_planning.py` | GoalPlanning | `goal_planning` |

> All agents must return an `AgentResponse` (see `base_agent.py`). Agents that call Granite must set a 15-second timeout on the call and catch `TimeoutError` to trigger fallback.
