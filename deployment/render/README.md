# /deployment/render

Render.com deployment configuration.

## Files (to be created in Phase 2)

- `render.yaml` — Infrastructure-as-code for Render: defines backend web service and (Phase 2) Postgres DB

## render.yaml Preview

```yaml
services:
  - type: web
    name: bharatseva-backend
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "gunicorn -w 2 -b 0.0.0.0:$PORT 'app:create_app()'"
    envVars:
      - key: APP_ENV
        value: production
      - key: WATSONX_API_KEY
        sync: false   # injected via Render secret
      - key: JWT_SECRET_KEY
        sync: false
      - key: DATABASE_URL
        sync: false
    disk:
      name: bharatseva-data
      mountPath: /app/data
      sizeGB: 5
```

Secrets (`sync: false`) are set via the Render dashboard, not committed to this file.
