# /ai/knowledge_base/documents

Sample document templates and extraction test cases used for developing and testing the DocumentVerification agent.

## Contents

- `samples/` — Sample anonymised documents (Aadhaar format, income certificate format, land record format) for agent development only. No real citizen data.
- `extraction_tests/` — JSON test cases: `{ "document_type": "income_cert", "expected_category": "income_cert", "expected_verified": "VERIFIED" }` paired with sample files for automated testing.
- `templates/` — Blank template PDFs for each document type, showing the structure the DocumentVerification agent should recognise.

## Important

No real citizen PII is stored here. All samples are synthetic. This directory must never contain actual Aadhaar numbers, names, or financial records.
