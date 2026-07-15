# /backend/ai/rag

Hybrid Retrieval-Augmented Generation utilities. Provides the retrieval backbone used by the KnowledgeRetrieval agent and any agent that needs to ground a Granite call in real scheme data.

## Files (to be created in Phase 2)

- `retriever.py` — `HybridRetriever` class: merges BM25 (keyword) + dense embedding (semantic) results via Reciprocal Rank Fusion
- `vector_store.py` — ChromaDB client wrapper; collection management; batch upsert; similarity search
- `bm25_index.py` — BM25 index built from `schemes.description` and scheme name; re-built on KB ingest
- `embedder.py` — Thin wrapper around Granite embedding API; caches embeddings for identical inputs within a request
- `chunker.py` — Splits long scheme documents into overlapping chunks for indexing

## Retrieval Strategy

| Mode | Trigger |
|---|---|
| Hybrid (BM25 + semantic) | Default; `feature_flags.semantic_search = enabled` |
| Keyword-only (BM25) | Fallback when vector store is unavailable |
| SQL LIKE | Final fallback when BM25 index is also unavailable |

Results from each mode include the retrieval mode used in `AgentResponse.reasoning` so the Admin Portal can surface when semantic search is degraded.
