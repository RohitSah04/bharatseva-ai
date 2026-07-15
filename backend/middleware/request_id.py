"""
middleware/request_id.py — Attach X-Request-ID to every request and response.

Per OBSERVABILITY.md §2:
  1. Reuse incoming X-Request-ID header if present (set by load balancer / CDN).
  2. Otherwise generate a UUID v4.
  3. Store in flask.g.request_id for use anywhere in the request lifecycle.
  4. Add X-Request-ID to every response header.
"""
from __future__ import annotations

import uuid

from flask import Flask, g, request


def init_request_id(app: Flask) -> None:
    @app.before_request
    def _attach_request_id() -> None:
        rid = request.headers.get("X-Request-ID") or str(uuid.uuid4())
        g.request_id = rid

    @app.after_request
    def _add_request_id_header(response):
        response.headers["X-Request-ID"] = getattr(g, "request_id", "")
        return response
