# /ai

AI assets that exist outside the Flask application: the raw scheme knowledge base, ingestion scripts, and standalone AI tooling.

## Structure

| Directory | Purpose |
|---|---|
| `knowledge_base/` | Raw source documents and structured JSON for all scheme categories |
| `knowledge_base/schemes/` | National schemes JSON (one JSON file per scheme, sourced from official portals) |
| `knowledge_base/eligibility_rules/` | Structured eligibility rule files (one per scheme) consumed by rule-based fallback |
| `knowledge_base/documents/` | Sample document templates and extraction examples for testing the DocumentVerification agent |
| `knowledge_base/faqs/` | FAQ files per scheme (used by KnowledgeRetrieval for conversational answers) |
| `knowledge_base/circulars/` | Government circulars and notifications (indexed into vector store) |
| `knowledge_base/state_schemes/` | State-specific scheme files, organised by state code |
| `knowledge_base/scholarships/` | Scholarship-specific scheme and eligibility files |

## Ingestion

KB ingestion scripts (Phase 2) will:
1. Parse JSON files in this directory.
2. Chunk each document.
3. Embed chunks via Granite embedding API.
4. Upsert into ChromaDB with `kb_version` and source metadata.
5. Upsert scheme records into the `schemes` DB table.
6. Update `kb_sources` table with ingest status and timestamp.

KB version format: `YYYY-QN-vN` (e.g., `2025-Q3-v1`).
