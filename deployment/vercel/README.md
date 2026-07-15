# /deployment/vercel

Vercel deployment configuration for the React frontend.

## Files (to be created in Phase 2)

- `vercel.json` — Rewrites for SPA routing (all paths → index.html)

## vercel.json Preview

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "DENY" },
        { "key": "Referrer-Policy", "value": "strict-origin-when-cross-origin" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

## Environment Variables (set in Vercel dashboard)

- `VITE_API_BASE_URL` — Backend URL (Render service URL in production)
