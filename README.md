# BharatSeva AI

India's Agentic AI Citizen Intelligence Platform — built on IBM watsonx.ai Granite + RAG.

## Project Structure

| Directory | Purpose |
|---|---|
| `/backend` | Python Flask REST API — all business logic, RBAC, AI orchestration |
| `/frontend` | React + TypeScript SPA — citizen and admin UIs |
| `/ai` | Agent implementations, knowledge base, vector store utilities |
| `/docs` | Architecture, schema, API contract, agent specs, security, observability |
| `/deployment` | Docker, Render, and Vercel configuration |

## Quick Start (Phase 1)

1. Copy `.env.example` → `.env` and fill in `WATSONX_API_KEY`, `WATSONX_PROJECT_ID`, `JWT_SECRET_KEY`.
2. `cd backend && pip install -r requirements.txt && flask run`
3. `cd frontend && npm install && npm run dev`

## Documentation Index

- [Architecture](docs/ARCHITECTURE.md)
- [Personas & Requirements](docs/PERSONAS_AND_REQUIREMENTS.md)
- [API Contract](docs/API_CONTRACT.md)
- [Database Schema](docs/DATABASE_SCHEMA.sql)
- [Agents Overview](docs/AGENTS_OVERVIEW.md)
- [Security & RBAC](docs/SECURITY_AND_RBAC.md)
- [Observability](docs/OBSERVABILITY.md)
