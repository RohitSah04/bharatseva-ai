# /ai/knowledge_base

Raw source material for BharatSeva AI's scheme knowledge base. Everything in this directory feeds the vector store (via ingestion scripts) and the `schemes` / `kb_sources` DB tables.

## Directories

| Directory | Contents |
|---|---|
| `schemes/` | All-India central government schemes (one JSON file per scheme) |
| `eligibility_rules/` | Structured rule files for rule-based fallback eligibility evaluation |
| `documents/` | Sample documents and extraction test cases (synthetic data only) |
| `faqs/` | Per-scheme FAQ files for conversational answers |
| `circulars/` | Government circulars and amendment notifications |
| `state_schemes/` | State-specific schemes organised by 2-letter state code |
| `scholarships/` | Scholarship schemes (central + state) |

## KB Version Lifecycle

1. **Curate** — KB team adds/updates files in this directory from official sources.
2. **Review** — Human review before ingestion (no hallucinated scheme data).
3. **Tag** — Assign new `kb_version` string (format: `YYYY-QN-vN`).
4. **Ingest** — Run ingestion script: chunk → embed → upsert vector store + DB.
5. **Verify** — Update `kb_sources.ingest_status = INGESTED` and `last_verified_date`.

## Integrity Rules

- No real citizen PII in `documents/`.
- All content sourced from official `.gov.in` URLs; `source_url` required in every scheme JSON.
- `last_verified_date` must be updated whenever a file is revised.
