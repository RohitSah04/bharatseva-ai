# /ai/knowledge_base/circulars

Government circulars, notifications, and gazette excerpts relevant to scheme eligibility and application procedures. Indexed into the vector store to provide Granite with authoritative recent policy context.

## File Format

Markdown files (`.md`) or plain text (`.txt`), named `<source>_<date>_<slug>.md`.

Example filename: `moafw_2024-11_pm-kisan-amendment.md`

## Ingestion Priority

Circulars that amend eligibility rules for existing schemes must trigger a `kb_version` bump and re-ingestion of the affected scheme's chunks. The KB curation team must update the corresponding `eligibility_rules` file when a circular changes a rule.
