# BharatSeva AI — Personas, Journeys & Requirements

> Version: 1.0 | Status: Approved for Implementation

---

## 1. User Personas

Every UI decision, API response shape, language choice, and accessibility implementation must be evaluated against at least one of the seven personas below. A feature that works for Priya but excludes Suresh or Kamla Devi has not met the product requirement.

---

### Persona 1 — Ramesh (Farmer)
| Attribute | Value |
|---|---|
| Age | 42 |
| Location | Rural Bihar |
| Occupation | Small-scale farmer (< 2 hectares) |
| Digital literacy | Low — owns a basic Android phone, types slowly |
| Language | Hindi (primary), basic Hindi literacy |
| Primary goals | Input subsidy (fertiliser, seeds), crop insurance (PM-FASAL), Kisan Credit Card |
| Key frustrations | Portal language is English or dense Hindi legalese; eligibility forms ask for Aadhaar-linked bank details he's unsure about; paid "agents" charge ₹200–500 per application |
| Design implications | Large tap targets; voice-first option; Hindi UI mandatory (not optional); minimal form fields per screen; offline-resilient where possible |

---

### Persona 2 — Priya (Student)
| Attribute | Value |
|---|---|
| Age | 19 |
| Location | Bhubaneswar, Odisha (hostel resident) |
| Occupation | B.Tech second year, Government Engineering College |
| Digital literacy | High — comfortable with apps and forms |
| Language | Odia (preferred), English (proficient) |
| Primary goals | State and central scholarships (NSP, Odia state scholarship), income-certificate-based filtering |
| Key frustrations | NSP and state portals have different income slabs, and she can't quickly find which she qualifies for given her family's exact income |
| Design implications | Fast eligibility filter by category + income; clear document checklist per scholarship; comparative view across schemes; deadline calendar is critical |

---

### Persona 3 — Kamla Devi (Senior Citizen / Widow)
| Attribute | Value |
|---|---|
| Age | 68 |
| Location | Rural Rajasthan |
| Occupation | Retired, widow |
| Digital literacy | Very low — relies on her grandson for phone help |
| Language | Hindi |
| Primary goals | IGNOAPS (Indira Gandhi National Old Age Pension), widow pension, Ayushman Bharat |
| Key frustrations | Cannot read small text; the word "portal" is meaningless; multiple schemes for widows and seniors are confusing |
| Design implications | Mandatory large-text / high-contrast mode; simple three-step flows maximum; no jargon; assisted mode via CSC operator (Meera's use case) is the realistic access path for her |

---

### Persona 4 — Anjali (Women MSME Founder)
| Attribute | Value |
|---|---|
| Age | 30 |
| Location | Chennai, Tamil Nadu |
| Occupation | Sole proprietor, boutique food-processing unit, 8 employees |
| Digital literacy | High |
| Language | Tamil (primary), English (fluent) |
| Primary goals | MUDRA loan (Shishu/Kishore), Udyam registration, Tamil Nadu women-entrepreneur grants, CGTMSE guarantee |
| Key frustrations | Each scheme has a different sponsoring ministry with no unified eligibility check; document requirements overlap but are listed separately |
| Design implications | Document Vault with reuse across multiple applications; AI Copilot "start a food processing business" journey is her primary touchpoint; Tamil language support important |

---

### Persona 5 — Suresh (Person with Locomotor Disability)
| Attribute | Value |
|---|---|
| Age | 35 |
| Location | Pune, Maharashtra |
| Occupation | Self-employed, home-based data-entry work |
| Digital literacy | Medium-high — uses adaptive keyboard and screen reader (NVDA + Chrome) |
| Language | Marathi (primary), Hindi, English |
| Primary goals | NHFDC loans, disability certificate renewal, state disability pension, accessible housing schemes |
| Key frustrations | Websites with non-semantic HTML, missing ARIA labels, and inaccessible file-upload widgets break his workflow entirely |
| Design implications | **WCAG 2.1 AA is non-negotiable.** Every component must pass keyboard navigation, screen-reader announcement, and colour-contrast checks. Document upload must be keyboard-accessible. |

---

### Persona 6 — Vikram (Startup Founder)
| Attribute | Value |
|---|---|
| Age | 27 |
| Location | Bengaluru, Karnataka |
| Occupation | First-generation tech startup founder, pre-revenue |
| Digital literacy | Very high |
| Language | English (primary), Kannada |
| Primary goals | Startup India registration, Karnataka Elevate / BIG scheme, NIDHI Prayas, BIRAC SPARSH |
| Key frustrations | Government scheme eligibility for startups depends on DPIIT recognition status, incorporation date, and sector — and he can never find a single place that explains the intersection |
| Design implications | AI Copilot "I want to build an agritech startup" journey; scheme comparison view; deadline calendar for application windows (BIRAC rounds, etc.) |

---

### Persona 7 — Meera (CSC Operator)
| Attribute | Value |
|---|---|
| Age | 26 |
| Location | Rural Uttar Pradesh |
| Occupation | Common Service Centre (CSC) VLE (Village-Level Entrepreneur) |
| Digital literacy | High |
| Language | Hindi |
| Primary goals | Serve 20–30 citizens per day efficiently — check eligibility, fill forms, upload documents on behalf of low-literacy clients like Kamla Devi and Ramesh |
| Key frustrations | She must switch between multiple portals for different citizens; no single tool gives her an operator-optimised view |
| Design implications | Role `csc_operator` must be addable without schema migration (designed in from day one). Operator mode: citizen-selector at top of session, bulk save, assisted profile creation, summary printout. This persona keeps the last-mile deployment story honest. |

---

## 2. End-to-End User Journeys

### Journey A — Reactive (v1 Baseline)

```
1. SIGNUP / LOGIN
   Citizen creates account → email (stub) + password → JWT issued
   Role = citizen assigned automatically

2. GUIDED PROFILE ONBOARDING
   Step-by-step form: state, district, age, gender, occupation,
   income band, category (General/OBC/SC/ST/EWS), disability status,
   education level, preferred language
   → Profile completeness % computed and shown
   → Incomplete profile triggers contextual nudges on dashboard

3. PERSONALISED DASHBOARD
   → Top 5–10 recommended schemes ranked by eligibility confidence
   → Profile completeness banner (if < 80%)
   → Upcoming deadlines (next 30 days)
   → Recent notifications

4. SCHEME DETAIL
   → Full description in preferred language
   → Eligibility verdict: ELIGIBLE / NOT ELIGIBLE / PARTIALLY ELIGIBLE
   → Confidence score (0–1) displayed as percentage
   → Plain-language reasoning (translated if needed)
   → Source citations (scheme document name + URL)
   → Required documents checklist

5. DOCUMENT UPLOAD (Document Vault)
   → Upload file (PDF, JPG, PNG)
   → AI extracts text, identifies document type, checks against
     requirement for the specific scheme
   → Verification status: VERIFIED / MISMATCH / UNREADABLE
   → AI explanation stored and shown

6. AI CHAT AGENT
   → Conversational follow-ups about any scheme
   → Can trigger Eligibility check or Copilot plan inline
   → Every response shows: reasoning summary + sources used

7. SAVE SCHEME
   → Scheme added to saved_schemes
   → Deadline Calendar entry created automatically (if scheme has deadline)
   → Application Tracker row initialised (status: NOT_STARTED)

8. DEADLINE NOTIFICATIONS
   → System checks deadlines nightly
   → Notifications created: 30 days before, 7 days before, 1 day before
   → Priority = HIGH for < 7 days, MEDIUM otherwise

9. APPLICATION TRACKER
   → Citizen manually updates status as they proceed
   → Status history preserved in status_history_json (immutable log)
   → States: NOT_STARTED → IN_PROGRESS → SUBMITTED → APPROVED / REJECTED
```

---

### Journey B — Proactive "AI Citizen Copilot" (Key Differentiator)

```
1. GOAL STATEMENT
   Citizen types a free-text life goal in their preferred language
   Examples:
     "मैं डेयरी फार्म शुरू करना चाहता हूँ"  (Ramesh)
     "I want to apply for a scholarship for my engineering degree"  (Priya)
     "I want to start a food processing business"  (Anjali)

2. GOAL PLANNING AGENT INVOCATION
   Orchestrator dispatches to GoalPlanning agent, which internally
   coordinates with:
     a. KnowledgeRetrieval agent — fetches relevant scheme chunks via RAG
     b. SchemeDiscovery agent — filters by citizen profile
     c. Eligibility agent — pre-checks eligibility for each relevant scheme
     d. DocumentVerification agent — aggregates document requirements
     e. DeadlineReminder agent — maps deadlines to a timeline
     f. LanguageTranslation agent — translates final plan

3. STRUCTURED PLAN GENERATION
   GoalPlanning returns a generated_plan_json containing:
   {
     "goal_summary": "...",
     "relevant_schemes": [
       {
         "scheme_id": "...",
         "scheme_name": "...",
         "eligibility_verdict": "ELIGIBLE|PARTIAL|INELIGIBLE",
         "confidence": 0.0–1.0,
         "priority_rank": 1,
         "application_url": "...",
         "office_address": "...",
         "office_contact": "..."
       }
     ],
     "aggregated_document_checklist": ["Aadhaar", "Land record", ...],
     "step_by_step_roadmap": [
       {
         "step": 1,
         "action": "Obtain Aadhaar-linked bank account",
         "estimated_days": 3,
         "responsible_office": "...",
         "depends_on": []
       }
     ],
     "estimated_total_timeline_days": 45,
     "deadlines": [...],
     "next_actions": ["Start with Step 1 — ...", ...]
   }

4. CITIZEN REVIEW
   → Plan presented as structured, readable output (not a chat bubble)
   → Citizen can expand any step, view scheme details, or ask follow-ups
   → Each plan item is individually explainable (confidence + sources)
   → Plan is NEVER auto-executed — citizen must confirm before any
     Application Tracker rows or Calendar entries are created

5. PLAN ACTIVATION
   → On citizen confirmation:
     - citizen_goals row updated: status = ACTIVE
     - Application Tracker rows created for each scheme in plan
     - Deadline Calendar entries created for each relevant deadline
     - Notification schedule created for upcoming deadlines

6. ONGOING TRACKING
   → Plan remains linked to citizen_goals.id
   → Application Tracker and Calendar reflect plan progress
   → Citizen can return to plan, re-run it (if profile changed), or archive it
```

---

## 3. Functional Requirements

### 3.1 Auth & RBAC
- FR-AUTH-1: Citizen signup with email + password (bcrypt hashed). Email verification is a stub in v1.
- FR-AUTH-2: Login returns a short-lived JWT access token (15 min) and a longer-lived refresh token (7 days).
- FR-AUTH-3: Token refresh endpoint issues new access token without re-login.
- FR-AUTH-4: Logout invalidates the refresh token server-side.
- FR-AUTH-5: Password reset flow via stub email (token-based, 1-hour expiry).
- FR-AUTH-6: Roles: `citizen`, `admin`. Schema must support `csc_operator` without migration (role field is a string, not an enum at DB level).
- FR-AUTH-7: Every protected route enforces RBAC server-side. Frontend role checks are UI-only conveniences.

### 3.2 Profile
- FR-PROF-1: Citizen can create and update their profile at any time.
- FR-PROF-2: Profile drives all scheme recommendations and eligibility checks — stale profile must not silently produce stale results.
- FR-PROF-3: API returns a computed `profile_completeness_pct` (0–100) based on filled optional + required fields.

### 3.3 Scheme Discovery
- FR-DISC-1: Schemes browsable with filters: category, state_or_all_india, occupation, keyword search.
- FR-DISC-2: Search supports both keyword (BM25) and semantic (embedding) modes, merged via hybrid ranking.
- FR-DISC-3: Every scheme record includes: name, category, state, description, eligibility rules (JSON), required documents (JSON), application URL, deadline, source, office address, office contact.

### 3.4 Eligibility Engine
- FR-ELIG-1: POST /api/v1/eligibility/check returns verdict: ELIGIBLE | NOT_ELIGIBLE | PARTIALLY_ELIGIBLE.
- FR-ELIG-2: Every verdict includes: confidence_score (0–1), reasoning string (plain language), sources_json.
- FR-ELIG-3: Every check is persisted in eligibility_checks (immutable audit row).
- FR-ELIG-4: When AI is unavailable, rule-based fallback uses eligibility_rules_json from DB; response labelled degraded.

### 3.5 AI Citizen Copilot
- FR-COP-1: POST /api/v1/goals accepts free-text goal in any language.
- FR-COP-2: GoalPlanning agent produces structured generated_plan_json (schema defined above in Journey B).
- FR-COP-3: Plan is stored in citizen_goals and never mutated after creation — new version creates a new row.
- FR-COP-4: Plan activation is an explicit citizen action; nothing is auto-executed.
- FR-COP-5: Every plan step is individually explainable with confidence + sources.

### 3.6 Document Vault
- FR-DOC-1: Citizens can upload documents (PDF, JPG, PNG, max 10 MB).
- FR-DOC-2: AI extracts text and identifies document type using Granite.
- FR-DOC-3: For each uploaded document linked to a scheme, AI verifies against requirement and returns VERIFIED | MISMATCH | UNREADABLE.
- FR-DOC-4: Extracted text and AI explanation stored in documents table.

### 3.7 AI Chat
- FR-CHAT-1: Conversational endpoint accepts a message and returns a response with reasoning and sources.
- FR-CHAT-2: Chat agent can internally trigger Eligibility and Copilot agents and surface their structured output inline.
- FR-CHAT-3: Full chat history stored per user; history retrievable via GET.

### 3.8 Application Tracker
- FR-TRACK-1: Every saved scheme and every activated Copilot plan scheme gets a tracker row.
- FR-TRACK-2: Status transitions: NOT_STARTED → IN_PROGRESS → SUBMITTED → APPROVED | REJECTED.
- FR-TRACK-3: status_history_json records every transition with timestamp and actor — this log is append-only.

### 3.9 Deadline Calendar
- FR-CAL-1: Aggregated view of all deadlines relevant to citizen's saved schemes and active goals.
- FR-CAL-2: iCal export (Phase 2) — architecture must not prevent it.

### 3.10 Notifications
- FR-NOTIF-1: Deadline reminders at T-30, T-7, T-1 days.
- FR-NOTIF-2: Application status change notifications.
- FR-NOTIF-3: Priority field (HIGH / MEDIUM / LOW) drives UI badge colour.

### 3.11 Multilingual
- FR-LANG-1: Every citizen-facing AI response available in citizen's preferred_language.
- FR-LANG-2: Language list in config, not hardcoded. Launch: en, hi.

### 3.12 Admin Portal
- FR-ADM-1: All admin routes RBAC-gated to `admin` role only.
- FR-ADM-2: Analytics: user growth, popular schemes, agent performance (latency, confidence, fallback rate), search trends, system health, KB freshness.
- FR-ADM-3: Audit log browser: searchable view of eligibility_checks and agent_logs.
- FR-ADM-4: Feature flag toggles (GET + PATCH).
- FR-ADM-5: Demo reset endpoint (flushes non-essential data for demo purposes).

### 3.13 Feature Flags
- FR-FF-1: feature_flags table with enabled boolean, description.
- FR-FF-2: Backend checks flag before executing gated code paths.
- FR-FF-3: Flags changeable at runtime via admin API without redeploy.

---

## 4. Non-Functional Requirements

### 4.1 Performance
- NFR-PERF-1: API p95 response time < 500 ms excluding AI calls (measured at gateway).
- NFR-PERF-2: Every AI call has a documented 15-second timeout; requests never hang indefinitely.
- NFR-PERF-3: Frequently-accessed scheme lists cached (cache TTL configurable via env var, default 5 min).

### 4.2 Security
- NFR-SEC-1: Passwords hashed with bcrypt (min cost factor 12).
- NFR-SEC-2: JWT access tokens: 15-minute expiry. Refresh tokens: 7-day expiry, stored server-side hash for revocation.
- NFR-SEC-3: RBAC enforced server-side on every protected route. No route relies solely on frontend guards.
- NFR-SEC-4: Input validation on every endpoint using marshmallow schemas (or equivalent).
- NFR-SEC-5: Rate limiting tiered by route sensitivity (see SECURITY_AND_RBAC.md for tiers).
- NFR-SEC-6: Secrets in environment variables only. No secret committed to source control. `.env` in `.gitignore`.
- NFR-SEC-7: Prompt injection: every endpoint that passes user text to an LLM must sanitise/envelope the input so user-supplied content cannot override system instructions.
- NFR-SEC-8: File uploads: MIME type and extension validated server-side; files scanned for embedded scripts.
- NFR-SEC-9: HTTPS enforced in production (TLS termination at load balancer or CDN).

### 4.3 Observability
- NFR-OBS-1: Structured JSON logging on every request and response (see OBSERVABILITY.md).
- NFR-OBS-2: X-Request-ID propagated through every log line for a single request.
- NFR-OBS-3: /api/v1/health (liveness) and /api/v1/health/ready (readiness including DB + AI provider).
- NFR-OBS-4: Every agent invocation logged to agent_logs with latency, confidence, fallback_used.

### 4.4 Explainability & Auditability
- NFR-EXP-1: Every AI-influenced decision carries confidence_score + reasoning + sources.
- NFR-EXP-2: Every eligibility check written immutably to eligibility_checks table.
- NFR-EXP-3: Every agent call written to agent_logs (input + output). Rows are never updated or deleted.
- NFR-EXP-4: Degraded-mode responses must be labelled — `"degraded": true` in response envelope.

### 4.5 Scalability
- NFR-SCALE-1: API layer is stateless. All mutable state lives in DB or external stores.
- NFR-SCALE-2: Phase 1 ceiling (SQLite, local ChromaDB) documented. Phase 2 migration path specified in ARCHITECTURE.md §5.

### 4.6 Availability
- NFR-AVAIL-1: AI provider outage must produce a degraded (rule-based / cached) response, never a blank error page.
- NFR-AVAIL-2: Degraded responses must be clearly labelled and never presented as confident AI outputs.

### 4.7 Localization
- NFR-L10N-1: UI and AI responses in en + hi at launch.
- NFR-L10N-2: Language list in config/languages.json. Adding a language requires no code change.

### 4.8 API Versioning
- NFR-VER-1: Every route under /api/v1/ from day one. No unversioned routes except /healthz alias.

### 4.9 Accessibility
- NFR-A11Y-1: WCAG 2.1 AA compliance for all citizen-facing pages.
- NFR-A11Y-2: All interactive elements keyboard-navigable.
- NFR-A11Y-3: All images have alt text; all form fields have associated labels.
- NFR-A11Y-4: Colour contrast ratio ≥ 4.5:1 for normal text, ≥ 3:1 for large text.
- NFR-A11Y-5: Document upload widget must be fully keyboard and screen-reader accessible (Suresh's requirement).
- NFR-A11Y-6: Large-text / high-contrast mode available (Kamla Devi's requirement).
