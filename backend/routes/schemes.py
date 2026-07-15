"""routes/schemes.py — Scheme discovery blueprint with caching."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required

from app.extensions import cache
from services import scheme_service
from utils.response import error_response, success_response

schemes_bp = Blueprint("schemes", __name__)


@schemes_bp.get("/schemes")
@jwt_required()
def list_schemes():
    # Deliberate cache: scheme list changes infrequently; this is the highest-traffic
    # read endpoint. Cache TTL = CACHE_DEFAULT_TIMEOUT (default 300s, configurable).
    # Cache key includes all filter params so different queries don't collide.
    category = request.args.get("category", "")
    state = request.args.get("state", "")
    occupation = request.args.get("occupation", "")
    q = request.args.get("q", "")
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(100, int(request.args.get("per_page", 20)))

    cache_key = f"schemes:{category}:{state}:{occupation}:{q}:{page}:{per_page}"
    cached = cache.get(cache_key)
    if cached:
        return success_response(cached)

    result = scheme_service.get_schemes(
        category=category or None,
        state=state or None,
        occupation=occupation or None,
        q=q or None,
        page=page,
        per_page=per_page,
    )
    cache.set(cache_key, result)
    return success_response(result)


@schemes_bp.get("/schemes/<string:scheme_id>")
@jwt_required()
def get_scheme(scheme_id: str):
    cache_key = f"scheme:{scheme_id}"
    cached = cache.get(cache_key)
    if cached:
        return success_response(cached)
    scheme = scheme_service.get_scheme_by_id(scheme_id)
    if not scheme:
        return error_response(404, "NOT_FOUND", "Scheme not found.")
    data = scheme.to_dict(include_rules=True)
    cache.set(cache_key, data)
    return success_response(data)
