# /backend/config

Configuration classes and static configuration files. All environment-specific settings are loaded from environment variables here — never scattered across the codebase.

## Files (to be created in Phase 2)

- `settings.py` — `BaseConfig`, `DevelopmentConfig`, `ProductionConfig`; loaded in `create_app()` based on `APP_ENV`
- `languages.json` — Supported language list; adding a language here requires no code change
- `feature_flag_seeds.json` — Default feature flag values inserted on first run
- `logging.json` — Python logging configuration (structured JSON handler)

## languages.json Format

```json
{
  "supported": [
    { "code": "en", "name": "English",    "native": "English" },
    { "code": "hi", "name": "Hindi",      "native": "हिन्दी" },
    { "code": "ta", "name": "Tamil",      "native": "தமிழ்"  },
    { "code": "te", "name": "Telugu",     "native": "తెలుగు" },
    { "code": "or", "name": "Odia",       "native": "ଓଡ଼ିଆ"  },
    { "code": "mr", "name": "Marathi",    "native": "मराठी"  },
    { "code": "kn", "name": "Kannada",    "native": "ಕನ್ನಡ"  }
  ],
  "default": "en",
  "launch_languages": ["en", "hi"]
}
```

Adding a language requires only adding it to this array — no conditional code changes.
