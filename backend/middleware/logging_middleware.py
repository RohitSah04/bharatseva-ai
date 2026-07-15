"""
middleware/logging_middleware.py — Structured JSON request/response logging.

Per OBSERVABILITY.md §1, every log line is a single-line JSON object.
Human-readable (pretty) format is enabled when LOG_FORMAT=pretty.

Fields:
  request_in:  timestamp, level, service, environment, request_id,
               event, method, path, user_id, role, user_agent
  request_out: timestamp, level, service, environment, request_id,
               event, method, path, status_code, latency_ms, degraded
"""
from __future__ import annotations

import json
import logging
import time
from datetime import datetime, timezone

from flask import Flask, g, request


class _JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        entry: dict = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname,
            "service": "bharatseva-api",
            "environment": getattr(record, "environment", "development"),
            "request_id": getattr(g, "request_id", "") if _in_request() else "",
            "message": record.getMessage(),
            "module": record.module,
            "line": record.lineno,
        }
        # Merge any extra fields passed via record.__dict__
        for key, val in record.__dict__.items():
            if key not in (
                "name", "msg", "args", "created", "filename", "funcName",
                "levelname", "levelno", "lineno", "module", "msecs",
                "message", "pathname", "process", "processName",
                "relativeCreated", "stack_info", "thread", "threadName",
                "exc_info", "exc_text",
            ) and not key.startswith("_"):
                entry[key] = val
        if record.exc_info:
            entry["traceback"] = self.formatException(record.exc_info)
        return json.dumps(entry, default=str)


def _in_request() -> bool:
    try:
        from flask import _request_ctx_stack  # type: ignore[attr-defined]
        return _request_ctx_stack.top is not None
    except Exception:
        try:
            g._get_current_object()  # raises RuntimeError outside context
            return True
        except RuntimeError:
            return False


_logger = logging.getLogger("bharatseva")


def get_logger() -> logging.Logger:
    return _logger


def init_logging(app: Flask) -> None:
    fmt = app.config.get("LOG_FORMAT", "json")

    _logger.setLevel(logging.DEBUG if app.debug else logging.INFO)
    _logger.handlers.clear()

    handler = logging.StreamHandler()
    if fmt == "pretty":
        handler.setFormatter(logging.Formatter(
            "[%(asctime)s] %(levelname)s %(name)s — %(message)s"
        ))
    else:
        handler.setFormatter(_JsonFormatter())
    _logger.addHandler(handler)
    _logger.propagate = False

    env = app.config.get("APP_ENV", "development")

    @app.before_request
    def _log_request_in() -> None:
        g._request_start = time.monotonic()
        claims: dict = {}
        try:
            from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request
            verify_jwt_in_request(optional=True)
            claims = get_jwt()
        except Exception:
            pass
        _logger.info(
            "request_in",
            extra={
                "environment": env,
                "event": "request_in",
                "method": request.method,
                "path": request.path,
                "user_id": claims.get("user_id"),
                "role": claims.get("role"),
                "user_agent": request.user_agent.string,
            },
        )

    @app.after_request
    def _log_request_out(response):
        latency_ms = int(
            (time.monotonic() - getattr(g, "_request_start", time.monotonic())) * 1000
        )
        _logger.info(
            "request_out",
            extra={
                "environment": env,
                "event": "request_out",
                "method": request.method,
                "path": request.path,
                "status_code": response.status_code,
                "latency_ms": latency_ms,
                "degraded": response.headers.get("X-Degraded", "false") == "true",
            },
        )
        return response
