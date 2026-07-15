"""routes/eligibility.py — Eligibility check blueprint."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from app.extensions import limiter
from services import eligibility_service
from utils.response import error_response, success_response
from utils.validators import EligibilityCheckSchema, validate_request

eligibility_bp = Blueprint("eligibility", __name__)


@eligibility_bp.post("/eligibility/check")
@jwt_required()
@limiter.limit("10 per minute")
def check_eligibility():
    identity = current_identity()
    user_id = identity["user_id"]

    data, errors = validate_request(EligibilityCheckSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))

    result = eligibility_service.run_eligibility_check(user_id, data["scheme_id"])
    if "error" in result:
        if result["error"] == "scheme_not_found":
            return error_response(404, "NOT_FOUND", "Scheme not found.")
        return error_response(400, "ELIGIBILITY_ERROR", result["error"])

    degraded = result.get("fallback_used", False)
    return success_response(result, degraded=degraded)
