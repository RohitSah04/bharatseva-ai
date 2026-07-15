# /deployment

Deployment configuration for all target platforms. Infrastructure-as-code where practical; no application code here.

## Subdirectories

| Directory | Purpose |
|---|---|
| `docker/` | Dockerfile and docker-compose for local development and CI |
| `render/` | render.yaml for Render.com deployment (backend + frontend) |
| `vercel/` | vercel.json for Vercel frontend deployment |

## Phase 1 Target

- Backend: Render.com (free tier, single instance, SQLite persisted via render disk)
- Frontend: Vercel (free tier, CDN-served SPA)

## Phase 2 Upgrade Path (documented, not built)

| Component | Phase 1 | Phase 2 |
|---|---|---|
| Backend host | Render single instance | Render multi-instance or IBM Code Engine |
| Database | SQLite on Render disk | Postgres (Render Postgres or IBM Db2) |
| Vector store | ChromaDB local | IBM watsonx Discovery or managed Milvus |
| File storage | Render disk | IBM Cloud Object Storage |
| Rate limit state | In-memory | Redis (Render Redis or IBM Databases for Redis) |
| CI/CD | GitHub Actions (build + test) | GitHub Actions + automated deployment pipeline |

See `ARCHITECTURE.md §5` for full scalability rationale.
