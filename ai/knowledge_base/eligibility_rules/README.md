# /ai/knowledge_base/eligibility_rules

Structured eligibility rule files — the machine-readable rule set stored in `schemes.eligibility_rules_json`. These are the canonical source for the rule-based fallback in the Eligibility agent.

## Rule Schema

Rules are expressed as a simple decision tree of field comparisons, combined with AND / OR logic:

```json
{
  "scheme_id": "pm-kisan-001",
  "version": "2025-Q2-v1",
  "logic": "AND",
  "rules": [
    { "field": "occupation",     "operator": "in",  "values": ["farmer", "agricultural_labourer"] },
    { "field": "age",            "operator": "gte", "value": 18 },
    { "field": "land_holding_ha","operator": "lte", "value": 2 },
    { "field": "state",          "operator": "any" }
  ],
  "exclusions": [
    { "field": "occupation",     "operator": "in",  "values": ["government_employee", "psu_employee"] },
    { "field": "annual_income",  "operator": "gt",  "value": 200000 }
  ]
}
```

The `eligibility` agent's rule-based fallback evaluates this JSON against the citizen profile fields without calling Granite.
