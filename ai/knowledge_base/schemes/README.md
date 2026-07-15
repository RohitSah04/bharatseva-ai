# /ai/knowledge_base/schemes

Central (All-India) government scheme JSON files. One file per scheme.

## File Format

Each file follows the canonical scheme JSON schema that mirrors the `schemes` DB table. Example:

```json
{
  "id": "pm-kisan-001",
  "name": "PM-KISAN (Pradhan Mantri Kisan Samman Nidhi)",
  "name_hi": "प्रधानमंत्री किसान सम्मान निधि",
  "category": "farmer",
  "state_or_all_india": "ALL_INDIA",
  "description": "Income support of ₹6,000 per year to small and marginal farmers...",
  "eligibility_rules_json": {
    "required": [
      { "field": "occupation", "operator": "eq", "value": "farmer" },
      { "field": "land_holding_ha", "operator": "lte", "value": 2 }
    ],
    "exclusions": ["government_employees", "income_tax_payers"]
  },
  "required_documents_json": [
    { "name": "Aadhaar Card", "mandatory": true },
    { "name": "Land ownership record (Khatoni)", "mandatory": true },
    { "name": "Bank account linked to Aadhaar", "mandatory": true }
  ],
  "application_url": "https://pmkisan.gov.in",
  "deadline": null,
  "source_name": "PM-KISAN Official Portal",
  "source_url": "https://pmkisan.gov.in/documents/circular.pdf",
  "last_verified_date": "2025-06-01",
  "kb_version": "2025-Q2-v1",
  "office_address": "Ministry of Agriculture, Krishi Bhavan, New Delhi",
  "office_contact": "1800-180-1551"
}
```

## Population

Files in this directory are populated by the KB curation team from official government portals. Each file undergoes a human review before ingestion.
