"""routes/health.py — Liveness, readiness, and version endpoints.

/health   → liveness probe (is the process alive?)
/health/ready → readiness probe (can we serve traffic — checks DB + AI provider config)
/version  → build info

Per OBSERVABILITY.md §3, these are unauthenticated public endpoints.
"""
from __future__ import annotations

import os
import time
from datetime import datetime, timezone

from flask import Blueprint, current_app

from utils.response import success_response

health_bp = Blueprint("health", __name__)


@health_bp.get("/health")
def liveness():
    """Liveness — process is alive. Does NOT check dependencies."""
    return success_response({
        "status": "ok",
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


@health_bp.get("/health/ready")
def readiness():
    """
    Readiness — can the app serve traffic?
    Checks DB (SELECT 1), AI provider config presence, vector store (Phase 2: always ok).
    Returns 503 if DB is unreachable; 200 with component-level 'degraded' if AI provider absent.
    """
    checks: dict = {}

    # ── DB check ─────────────────────────────────────────────────────────────
    db_ok = False
    db_latency = 0
    try:
        from app.extensions import db
        t0 = time.monotonic()
        db.session.execute(db.text("SELECT 1"))
        db_latency = int((time.monotonic() - t0) * 1000)
        db_ok = True
        checks["db"] = {"status": "ok", "latency_ms": db_latency}
    except Exception as e:
        checks["db"] = {"status": "error", "detail": str(e)}

    # ── AI provider check (config presence only in Phase 1) ─────────────────
    api_key = current_app.config.get("WATSONX_API_KEY", "")
    if api_key and api_key != "your_ibm_cloud_api_key_here":
        checks["ai_provider"] = {"status": "ok", "latency_ms": 0}
    else:
        checks["ai_provider"] = {
            "status": "degraded",
            "detail": "WATSONX_API_KEY not configured — AI calls will use mock responses",
        }

    # ── Vector store check (Phase 1: always ok — ChromaDB not yet wired) ────
    checks["vector_store"] = {"status": "ok", "latency_ms": 0, "detail": "Phase 1 — not yet active"}

    if not db_ok:
        from flask import make_response, jsonify
        body = {
            "success": False,
            "data": {"status": "not_ready", "checks": checks, "timestamp": datetime.now(timezone.utc).isoformat()},
            "error": None,
            "meta": {"request_id": "", "api_version": "v1", "degraded": False},
        }
        return make_response(jsonify(body), 503)

    return success_response({
        "status": "ready",
        "checks": checks,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


@health_bp.get("/version")
def version():
    """Return deployed build info."""
    return success_response({
        "version": current_app.config.get("VERSION", "1.0.0"),
        "git_sha": current_app.config.get("GIT_SHA", "unknown"),
        "deployed_at": datetime.now(timezone.utc).isoformat(),
    })
