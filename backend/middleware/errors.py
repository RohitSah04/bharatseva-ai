"""
middleware/errors.py — Global error handler.

No unhandled exception may ever reach the client as a raw stack trace
(SECURITY_AND_RBAC.md §5). Every error is logged with the request_id
and returned as the standard error envelope.
"""
from __future__ import annotations

import traceback

from flask import Flask
from werkzeug.exceptions import HTTPException

from middleware.logging_middleware import get_logger
from utils.response import error_response

logger = get_logger()


def init_error_handlers(app: Flask) -> None:
    @app.errorhandler(400)
    def bad_request(e):
        return error_response(400, "BAD_REQUEST", str(e.description))

    @app.errorhandler(401)
    def unauthorized(e):
        return error_response(401, "UNAUTHORIZED", "Authentication required.")

    @app.errorhandler(403)
    def forbidden(e):
        return error_response(403, "FORBIDDEN", "Access denied.")

    @app.errorhandler(404)
    def not_found(e):
        return error_response(404, "NOT_FOUND", "Resource not found.")

    @app.errorhandler(405)
    def method_not_allowed(e):
        return error_response(405, "METHOD_NOT_ALLOWED", str(e.description))

    @app.errorhandler(409)
    def conflict(e):
        return error_response(409, "CONFLICT", str(e.description))

    @app.errorhandler(422)
    def unprocessable(e):
        return error_response(422, "VALIDATION_ERROR", str(e.description))

    @app.errorhandler(429)
    def too_many_requests(e):
        logger.warning("Rate limit hit", extra={"event": "rate_limit_hit"})
        return error_response(429, "RATE_LIMITED", "Too many requests. Please slow down.")

    @app.errorhandler(HTTPException)
    def http_exception(e):
        return error_response(e.code or 500, "HTTP_ERROR", str(e.description))

    @app.errorhandler(Exception)
    def unhandled_exception(e):
        tb = traceback.format_exc()
        logger.error(
            "Unhandled exception",
            extra={
                "event": "unhandled_exception",
                "exception": type(e).__name__,
                "traceback": tb,
            },
            exc_info=True,
        )
        return error_response(
            500, "INTERNAL_ERROR",
            "An unexpected error occurred. Please try again later."
        )
