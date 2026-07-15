"""utils/auth.py — JWT identity helper.

get_jwt_identity() returns the raw sub (user_id string).
get_jwt() returns all claims including role and user_id.

This helper normalises both into the {user_id, role} dict
used throughout route handlers.
"""
from __future__ import annotations

from flask_jwt_extended import get_jwt, get_jwt_identity


def current_identity() -> dict:
    """Return {'user_id': str, 'role': str} from the active JWT token."""
    claims = get_jwt()
    return {
        "user_id": claims.get("user_id") or get_jwt_identity(),
        "role": claims.get("role", "citizen"),
    }
