"""
middleware/rbac.py — Role-based access control decorator.

Usage:
    @require_role("admin")
    def my_view(): ...

    @require_role("citizen", "admin", "csc_operator")
    def another_view(): ...

RBAC is enforced server-side here. The frontend may hide buttons for UX,
but it must never be the sole gate for access control (SECURITY_AND_RBAC.md §1).
"""
from __future__ import annotations

import functools
from typing import Callable

from flask import g
from flask_jwt_extended import get_jwt, get_jwt_identity, verify_jwt_in_request

from middleware.logging_middleware import get_logger
from utils.response import error_response

logger = get_logger()


def require_role(*roles: str) -> Callable:
    """Decorator that enforces one of the given roles is present in the JWT."""
    def decorator(fn: Callable) -> Callable:
        @functools.wraps(fn)
        def wrapper(*args, **kwargs):
            try:
                verify_jwt_in_request()
            except Exception:
                return error_response(
                    401, "UNAUTHORIZED", "Valid bearer token required."
                )
            claims = get_jwt()
            role = claims.get("role", "")
            user_id = claims.get("user_id") or get_jwt_identity()
            if role not in roles:
                logger.warning(
                    "RBAC denial",
                    extra={
                        "event": "rbac_denial",
                        "user_id": user_id,
                        "role": role,
                        "required": list(roles),
                        "path": g.get("path", ""),
                    },
                )
                return error_response(
                    403, "FORBIDDEN",
                    "You do not have permission to access this resource."
                )
            return fn(*args, **kwargs)
        return wrapper
    return decorator


def get_current_user_id() -> str | None:
    """Safe helper to extract user_id from JWT; returns None outside auth context."""
    try:
        verify_jwt_in_request(optional=True)
        claims = get_jwt()
        return claims.get("user_id") or get_jwt_identity()
    except Exception:
        return None


def get_current_role() -> str | None:
    try:
        verify_jwt_in_request(optional=True)
        claims = get_jwt()
        return claims.get("role", "")
    except Exception:
        return None
