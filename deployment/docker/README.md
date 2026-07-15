# /deployment/docker

Docker configuration for local development and CI.

## Files (to be created in Phase 2)

- `Dockerfile.backend` — Multi-stage build: builder (pip install) → runtime (slim Python 3.11)
- `Dockerfile.frontend` — Multi-stage build: Node builder → Nginx static server
- `docker-compose.yml` — Local dev stack: backend + frontend + (optional) ChromaDB

## docker-compose Services

```yaml
services:
  backend:
    build: { context: ../../backend, dockerfile: ../deployment/docker/Dockerfile.backend }
    ports: ["5000:5000"]
    env_file: ../../.env
    volumes:
      - ../../backend:/app         # hot-reload in dev
      - bharatseva_data:/app/data  # persistent SQLite + vector store

  frontend:
    build: { context: ../../frontend, dockerfile: ../deployment/docker/Dockerfile.frontend }
    ports: ["3000:80"]
    environment:
      VITE_API_BASE_URL: http://localhost:5000

volumes:
  bharatseva_data:
```

## Production Build

The production Dockerfile.backend uses `gunicorn` with multiple workers (one per CPU core) and does **not** mount a source volume. All secrets are injected via environment variables — never baked into the image.
