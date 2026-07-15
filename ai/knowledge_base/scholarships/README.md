# /ai/knowledge_base/scholarships

Scholarship scheme files — both central (National Scholarship Portal) and state scholarships. These are a subset of the scheme corpus with education-specific fields.

## Additional Fields for Scholarships

```json
{
  "scheme_type": "scholarship",
  "level": "undergraduate | postgraduate | school",
  "income_ceiling_annual": 250000,
  "category_eligible": ["sc", "st", "obc", "general_ews"],
  "institution_type": "government | aided | private_recognised",
  "portal": "NSP",
  "portal_url": "https://scholarships.gov.in",
  "application_window_opens": "2025-09-01",
  "application_window_closes": "2025-11-30"
}
```

The `application_window_opens` and `application_window_closes` fields power the Deadline Calendar for students (Priya persona).
