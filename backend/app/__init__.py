"""
app/__init__.py — Application factory.

Initialisation order matters:
  1. Extensions (db, jwt, limiter, cache, cors) — bound to app before anything else
  2. Request-ID middleware — must run first so all subsequent logging has a request_id
  3. Logging middleware — needs request_id set
  4. Error handlers — must be registered before blueprints
  5. Blueprints — all under /api/v1 per API_CONTRACT.md

No business logic lives here.
"""
from __future__ import annotations

import os
from pathlib import Path

from flask import Flask

from config import get_config

# Absolute path to the /backend directory (where this package lives).
# Used to create data dirs and to build an absolute SQLite URI that works
# regardless of the process working directory.
_BACKEND_DIR = Path(__file__).resolve().parent.parent  # app/ -> backend/


def create_app(test_config: dict | None = None) -> Flask:
    # NOTE: do NOT call load_dotenv() here. It must be called in run.py
    # *before* this module is imported, because Config class attributes are
    # evaluated at import time (class-body os.environ.get calls). Calling
    # load_dotenv() inside create_app() is always too late for class-level
    # defaults — the Config class has already been parsed and its attributes
    # frozen. run.py handles this correctly with an explicit early load.

    app = Flask(__name__)

    # ── Configuration ────────────────────────────────────────────────────────
    cfg = get_config()
    app.config.from_object(cfg)
    if test_config:
        app.config.update(test_config)

    # ── Ensure the SQLite URI uses an absolute path ───────────────────────────
    # sqlite:///./data/bharatseva.db is relative to the process cwd.
    # Convert it to an absolute sqlite:////absolute/path so it works when the
    # server is started from any working directory (project root, Docker, Render).
    # Only rewrite if no test_config overrides the URI.
    if test_config is None or "SQLALCHEMY_DATABASE_URI" not in (test_config or {}):
        uri: str = app.config.get("SQLALCHEMY_DATABASE_URI", "")
        if uri.startswith("sqlite:///") and not uri.startswith("sqlite:////") and uri != "sqlite:///:memory:":
            # Strip the scheme prefix to get the (possibly relative) file path
            rel = uri[len("sqlite:///"):]
            if not os.path.isabs(rel):
                abs_path = _BACKEND_DIR / rel
                app.config["SQLALCHEMY_DATABASE_URI"] = f"sqlite:///{abs_path}"

    _validate_secrets(app)

    # ── Ensure data dirs exist (using absolute paths) ─────────────────────────
    data_dir = _BACKEND_DIR / "data"
    data_dir.mkdir(parents=True, exist_ok=True)

    upload_raw = app.config.get("UPLOAD_FOLDER", "./data/uploads")
    upload_dir = Path(upload_raw) if os.path.isabs(upload_raw) else _BACKEND_DIR / upload_raw
    upload_dir.mkdir(parents=True, exist_ok=True)

    # ── Extensions ───────────────────────────────────────────────────────────
    from app.extensions import cache, cors, db, jwt, limiter
    db.init_app(app)
    jwt.init_app(app)
    limiter.init_app(app)
    cache.init_app(app)
    cors.init_app(
        app,
        origins=app.config["CORS_ALLOWED_ORIGINS"],
        supports_credentials=True,
    )

    # ── Middleware ───────────────────────────────────────────────────────────
    from middleware.request_id import init_request_id
    from middleware.logging_middleware import init_logging
    from middleware.errors import init_error_handlers

    init_request_id(app)
    init_logging(app)
    init_error_handlers(app)

    # ── Create DB tables + seed ───────────────────────────────────────────────
    with app.app_context():
        import models  # noqa: F401 — triggers SQLAlchemy model discovery
        db.create_all()
        _seed_if_empty()

    # ── Register blueprints under /api/v1 ────────────────────────────────────
    prefix = "/api/v1"
    from routes.auth import auth_bp
    from routes.profile import profile_bp
    from routes.schemes import schemes_bp
    from routes.eligibility import eligibility_bp
    from routes.goals import goals_bp
    from routes.applications import applications_bp
    from routes.documents import documents_bp
    from routes.deadlines import deadlines_bp
    from routes.chat import chat_bp
    from routes.saved_schemes import saved_schemes_bp
    from routes.notifications import notifications_bp
    from routes.health import health_bp
    from routes.admin import admin_bp
    from routes.ai_test import ai_test_bp

    for bp in [
        auth_bp, profile_bp, schemes_bp, eligibility_bp, goals_bp,
        applications_bp, documents_bp, deadlines_bp, chat_bp,
        saved_schemes_bp, notifications_bp, health_bp, admin_bp,
        ai_test_bp,
    ]:
        app.register_blueprint(bp, url_prefix=prefix)

    return app


def _validate_secrets(app: Flask) -> None:
    """Warn loudly if critical secrets are unset or using defaults."""
    from middleware.logging_middleware import get_logger
    logger = get_logger()
    for key in ("SECRET_KEY", "JWT_SECRET_KEY"):
        val = app.config.get(key, "")
        if not val or val.startswith("change-me"):
            logger.warning(
                f"SECURITY WARNING: {key} is not set or using default placeholder. "
                "Set a strong random value in .env before deploying.",
                extra={"event": "weak_secret", "key": key},
            )


def _seed_if_empty() -> None:
    """Run seeding only if the DB is brand-new (no schemes yet)."""
    from models.scheme import Scheme
    if Scheme.query.count() == 0:
        try:
            import seed_data
            seed_data.run()
        except Exception as e:
            from middleware.logging_middleware import get_logger
            get_logger().error(f"Seed failed: {e}", extra={"event": "seed_error"})
