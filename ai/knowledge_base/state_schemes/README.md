# /ai/knowledge_base/state_schemes

State-specific scheme files, organised by 2-letter state code directory.

## Structure

```
state_schemes/
  BR/   ← Bihar
  RJ/   ← Rajasthan
  MH/   ← Maharashtra
  TN/   ← Tamil Nadu
  KA/   ← Karnataka
  UP/   ← Uttar Pradesh
  OD/   ← Odisha
  ...
```

Each state directory contains scheme JSON files in the same format as `/ai/knowledge_base/schemes/`, with `state_or_all_india` set to the 2-letter state code.

## Priority States for v1 KB

Bihar, Rajasthan, Maharashtra, Tamil Nadu, Karnataka, Uttar Pradesh, Odisha — covering all 7 primary personas in `PERSONAS_AND_REQUIREMENTS.md`.
