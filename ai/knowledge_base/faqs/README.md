# /ai/knowledge_base/faqs

Frequently asked questions for each scheme, used by the KnowledgeRetrieval and Conversation agents to answer common citizen questions without a full Granite call.

## File Format

One JSON file per scheme: `<scheme_id>_faqs.json`

```json
{
  "scheme_id": "pm-kisan-001",
  "faqs": [
    {
      "question": "When is the PM-KISAN instalment credited?",
      "answer": "Instalments are credited in three equal tranches of ₹2,000 each: April–July, August–November, and December–March.",
      "tags": ["payment", "timeline"]
    }
  ]
}
```

FAQs are indexed into the vector store alongside scheme chunks so the KnowledgeRetrieval agent can surface them as source citations.
