"""routes/saved_schemes.py — Saved schemes blueprint."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from services import saved_scheme_service
from utils.response import error_response, success_response
from utils.validators import SaveSchemeSchema, validate_request

saved_schemes_bp = Blueprint("saved_schemes", __name__)


@saved_schemes_bp.get("/saved-schemes")
@jwt_required()
def list_saved():
    identity = current_identity()
    user_id = identity["user_id"]
    return success_response({"saved_schemes": saved_scheme_service.get_saved(user_id)})


@saved_schemes_bp.post("/saved-schemes")
@jwt_required()
def save_scheme():
    identity = current_identity()
    user_id = identity["user_id"]
    data, errors = validate_request(SaveSchemeSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    result = saved_scheme_service.save_scheme(user_id, data["scheme_id"])
    if result == "scheme_not_found":
        return error_response(404, "NOT_FOUND", "Scheme not found.")
    if result == "already_saved":
        return error_response(409, "CONFLICT", "Scheme already saved.")
    return success_response(result, 201)


@saved_schemes_bp.delete("/saved-schemes/<string:scheme_id>")
@jwt_required()
def unsave_scheme(scheme_id: str):
    identity = current_identity()
    user_id = identity["user_id"]
    ok = saved_scheme_service.unsave_scheme(user_id, scheme_id)
    if not ok:
        return error_response(404, "NOT_FOUND", "Saved scheme not found.")
    return success_response({"message": "removed"})
