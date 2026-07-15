"""routes/profile.py — Citizen profile blueprint."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from services import profile_service
from utils.response import error_response, success_response
from utils.validators import ProfileUpdateSchema, validate_request

profile_bp = Blueprint("profile", __name__)


@profile_bp.get("/profile")
@jwt_required()
def get_profile():
    identity = current_identity()
    user_id = identity["user_id"]
    profile = profile_service.get_or_create_profile(user_id)
    return success_response(profile.to_dict())


@profile_bp.put("/profile")
@jwt_required()
def update_profile():
    identity = current_identity()
    if identity["role"] not in ("citizen", "csc_operator"):
        return error_response(403, "FORBIDDEN", "Only citizens can update their profile.")
    user_id = identity["user_id"]
    data, errors = validate_request(ProfileUpdateSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    profile = profile_service.update_profile(user_id, data)
    return success_response(profile.to_dict())
