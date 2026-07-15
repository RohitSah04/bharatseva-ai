# /backend/services

Business logic layer. Each service module corresponds to a domain. Services are called by route handlers and call models, the AI orchestrator, or external utilities. They must never import from `routes/`.

## Service Map

| File | Responsibilities |
|---|---|
| `auth_service.py` | Password hashing/checking, JWT generation, token refresh/revocation, password reset |
| `profile_service.py` | Profile create/update, completeness % computation |
| `scheme_service.py` | Scheme list/filter queries, scheme detail retrieval, cache management |
| `eligibility_service.py` | Orchestrate eligibility check; persist result to eligibility_checks |
| `goal_service.py` | Submit goal to GoalPlanning agent; store plan; activate plan (create tracker + calendar rows) |
| `application_service.py` | Create tracker rows; append status history (never overwrite) |
| `document_service.py` | Handle file storage; invoke DocumentVerification agent; persist metadata |
| `deadline_service.py` | Compute deadlines from saved schemes + active goals; trigger notifications |
| `chat_service.py` | Route messages to Conversation agent; persist chat_history |
| `notification_service.py` | Create, list, mark-read notifications |
| `admin_service.py` | Analytics queries, feature-flag CRUD, audit log queries, demo reset |
| `recommendation_service.py` | Profile-driven scheme recommendation, cached per user session |

## Error Handling Convention

Services raise typed exceptions (e.g., `NotFoundError`, `ValidationError`, `RBACError`) that are caught by route handlers and mapped to HTTP status codes. Services must never return HTTP response objects.
