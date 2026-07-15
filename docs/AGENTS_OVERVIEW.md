# BharatSeva AI — Agents Overview

> Version: 1.0 | Status: Approved for Implementation
> Full orchestration contract and inter-agent message passing is specified in Prompt 4. This document describes each agent's purpose, inputs, outputs, and constraints.

---

## Shared Agent Response Contract

Every agent in BharatSeva AI returns an `AgentResponse` object. No exceptions. The Orchestrator validates this shape before writing `agent_logs` and before returning a response to the route handler.

```
AgentResponse {
  result          : any          // structured payload — type varies by agent
  confidence      : float        // 0.0 – 1.0  (never omit, never outside range)
  reasoning       : string       // English prose explanation; translated downstream
  sources         : list[Source] // only records actually retrieved and used
  fallback_used   : bool         // true if AI call timed out or failed
  fallback_reason : string|null  // non-null when fallback_used = true
  escalate_to     : string|null  // agent name for escalation, or null
  agent_name      : string       // snake_case canonical agent identifier
  latency_ms      : int          // wall-clock execution time
  request_id      : string       // propagated X-Request-ID from HTTP layer
}

Source {
  name       : string  // display name of the scheme document or KB record
  url        : string  // source URL
  kb_version : string  // KB ingest version this chunk came from
  excerpt    : string  // the specific passage retrieved (max 300 chars)
}
```

**Mandatory behaviours for every agent:**
1. If the AI provider call fails or exceeds 15 seconds, set `fallback_used = true` and produce a deterministic result from structured DB data.
2. Never return a `reasoning` that is a raw LLM completion. Extract, paraphrase, or summarise.
3. Never fabricate source citations. If no chunks were retrieved, `sources` is an empty list.
4. `confidence = 0.0` means "no signal" — do not confuse it with "I know the answer is 0%".

---

## 1. CitizenProfile Agent

**Canonical name:** `citizen_profile`

Responsible for loading, validating, and enriching the citizen's profile for use by other agents. When invoked, it reads the `citizen_profiles` row, computes the `profile_completeness_pct`, identifies missing fields that would materially affect eligibility results, and returns a normalised profile dictionary. It also raises escalation to the `conversation` agent when the profile is below a threshold (default 60%) so the Conversation agent can prompt the citizen to complete their profile before running eligibility. This agent does not call Granite; it is a deterministic profile-shaping utility used as the first step in most Orchestrator chains.

**result shape:** `{ profile: <citizen_profile_dict>, completeness_pct: int, missing_critical_fields: [string] }`

---

## 2. GovernmentSchemeDiscovery Agent

**Canonical name:** `scheme_discovery`

Accepts filter criteria (category, state, occupation, income band, keyword query) and returns a ranked list of matching schemes. Internally executes a hybrid retrieval: BM25 keyword search against the schemes table plus a semantic search against the vector store using a Granite embedding of the query. The two result sets are merged via Reciprocal Rank Fusion (RRF). When the vector store is unavailable, falls back to SQL full-text search and sets `fallback_used = true`. Returns a list of scheme summaries with relevance scores and the specific retrieval path used as `reasoning`.

**result shape:** `{ schemes: [{ scheme_id, name, category, state, relevance_score }], retrieval_mode: "hybrid|keyword_only|semantic_only" }`

---

## 3. Eligibility Agent

**Canonical name:** `eligibility`

The core decision agent. Takes a citizen profile (from CitizenProfile agent) and a scheme ID. First retrieves the scheme's `eligibility_rules_json` from the DB and the most relevant KB chunks via KnowledgeRetrieval agent. Then calls Granite with a structured prompt containing both the rule set and the citizen's profile fields, asking for a verdict (ELIGIBLE / NOT_ELIGIBLE / PARTIALLY_ELIGIBLE) with a confidence score and a plain-language reason. The prompt is enveloped to prevent injection: citizen-supplied data is strictly separated from system instructions. When Granite is unavailable, rule-based evaluation is performed purely from `eligibility_rules_json` (deterministic, no AI). Result is persisted to `eligibility_checks` by the route handler (not by the agent itself).

**result shape:** `{ verdict: string, confidence: float, reasoning: string, sources: [Source], rule_based_fallback: bool }`

---

## 4. DocumentVerification Agent

**Canonical name:** `document_verification`

Processes an uploaded document: extracts text using Granite's vision/OCR capability, classifies the document type (Aadhaar, income certificate, land record, etc.), and — when a scheme context is provided — verifies whether the document satisfies the scheme's specific requirement. Returns a structured verdict (VERIFIED / MISMATCH / UNREADABLE) with a plain-language explanation of what was found and why it does or does not satisfy the requirement. Handles multi-page PDFs by chunking. When AI extraction fails, sets `verified_against_requirement = PENDING` and `fallback_used = true` so a human reviewer can follow up.

**result shape:** `{ document_type: string, extracted_text: string, verification_status: string, ai_explanation: string }`

---

## 5. ApplicationGuide Agent

**Canonical name:** `application_guide`

Produces a step-by-step application walkthrough for a specific scheme, tailored to the citizen's profile. Steps include: which documents to gather first (sorted by difficulty to obtain), which office or portal to visit, what to expect at each stage, and common rejection reasons to avoid. This agent is invoked from the Copilot plan and from the Chat agent when a citizen asks "how do I apply for X?". It pulls from the scheme's `required_documents_json`, KB FAQs, and any stored circulars. Does not make eligibility decisions.

**result shape:** `{ steps: [{ step_num, action, estimated_days, office, tips }], total_estimated_days: int }`

---

## 6. LanguageTranslation Agent

**Canonical name:** `language_translation`

Translates any string (or a structured JSON's string fields) into the citizen's `preferred_language`. Invoked by the Orchestrator as a post-processing step — all primary agents produce English output, and this agent translates before the response is returned to the route handler. Uses Granite's multilingual generation capability with a strict translation-only prompt (no paraphrasing, no added content). When translation fails, the English original is returned with a `fallback_used = true` flag and a note in `fallback_reason`. Never used in-process by other agents to avoid cascading latency.

**result shape:** `{ translated_text: string, source_language: "en", target_language: string }`

---

## 7. DeadlineReminder Agent

**Canonical name:** `deadline_reminder`

Scans the citizen's saved schemes and active citizen_goals, computes days-remaining for every deadline, and returns a sorted list of upcoming events. Also called by the Copilot's GoalPlanning agent to populate the timeline section of a plan. In the background (scheduled task), it generates `notifications` rows at T-30, T-7, and T-1 days before each deadline. This agent is purely deterministic (reads DB, does arithmetic); `confidence` is always 1.0 and `fallback_used` is always false. Does not call Granite.

**result shape:** `{ deadlines: [{ scheme_id, scheme_name, deadline, days_remaining, priority }] }`

---

## 8. KnowledgeRetrieval Agent

**Canonical name:** `knowledge_retrieval`

The RAG layer shared by all agents that need grounded scheme information. Accepts a query string and optional filters (category, state, kb_version) and returns the top-K most relevant document chunks from the hybrid vector store. Responsible for constructing the embedding request to Granite, querying ChromaDB, de-duplicating results, and returning chunks with their source metadata (name, URL, kb_version, excerpt). Other agents call this agent first to ground their prompts; they must not bypass it and call the vector store directly. When the vector store is unavailable, falls back to SQL LIKE search against `schemes.description`.

**result shape:** `{ chunks: [{ text, score, source: Source }], retrieval_mode: "semantic|keyword|hybrid" }`

---

## 9. Conversation Agent

**Canonical name:** `conversation`

The primary citizen-facing agent. Receives the citizen's free-text message, classifies the intent (eligibility question, goal statement, document help, general info, complaint), and routes to the appropriate specialist agent. Returns a conversational reply that embeds the specialist agent's `reasoning` and `sources` in natural language. Maintains conversational context by reading the last N turns from `chat_history`. If intent classification confidence is below a threshold (< 0.4), it asks a clarifying question rather than hallucinating intent. This agent is the only one that writes to `chat_history` directly; all others write only to `agent_logs`.

**result shape:** `{ reply: string, intent_classified: string, specialist_agent_used: string|null, sources: [Source] }`

---

## 10. Reasoning Agent

**Canonical name:** `reasoning`

A utility agent that takes a structured set of facts (profile + scheme rules + context) and produces a step-by-step chain-of-thought reasoning trace explaining *why* an eligibility verdict or plan step was reached. Invoked by the Eligibility agent and GoalPlanning agent when a deeper explanation is needed than the primary agent can generate inline. Uses Granite's instruction-following capability with an explicit "think step by step, then summarise" prompt structure. The intermediate reasoning chain is stored in `output_json` in `agent_logs` but only the summary is surfaced to the citizen. This separation supports auditability without overwhelming the UI.

**result shape:** `{ chain_of_thought: [string], summary: string, conclusion_confidence: float }`

---

## 11. Recommendation Agent

**Canonical name:** `recommendation`

Generates the personalised scheme list shown on the citizen's dashboard. Runs on profile updates and on login if the profile has changed since the last recommendation. For each category relevant to the citizen's profile, invokes SchemeDiscovery to get candidates, runs Eligibility in batch (lightweight mode: rule-based only, no Granite, for speed), ranks by eligibility confidence × deadline urgency, and returns the top N with brief reasons. Results are cached for the citizen's session (invalidated on profile change). Does not call Granite in the critical path; Granite is only called if the citizen drills into a specific recommendation.

**result shape:** `{ recommendations: [{ scheme_id, name, category, confidence, reason, deadline_urgency }], cache_hit: bool }`

---

## 12. GoalPlanning Agent

**Canonical name:** `goal_planning`

The orchestrating "brain" of the AI Citizen Copilot feature. Accepts a free-text citizen goal, coordinates a multi-agent sub-workflow (KnowledgeRetrieval → SchemeDiscovery → Eligibility batch → DocumentVerification for requirements → DeadlineReminder → LanguageTranslation), and synthesises the results into a structured `generated_plan_json` (see Journey B schema in PERSONAS_AND_REQUIREMENTS.md). Produces a confidence score for the plan as a whole (weighted average of constituent agent confidences). The plan is flagged `DRAFT` until the citizen explicitly activates it. Calls Reasoning agent to produce the human-readable roadmap narrative. This is the highest-latency agent in the system; it has a 30-second overall timeout (vs. the standard 15 s per individual AI call) and must surface partial results if sub-agents fail.

**result shape:** `{ goal_summary: string, relevant_schemes: [...], aggregated_document_checklist: [...], step_by_step_roadmap: [...], estimated_total_timeline_days: int, deadlines: [...], next_actions: [...] }`
