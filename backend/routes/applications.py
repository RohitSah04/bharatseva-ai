"""routes/applications.py — Application Tracker blueprint."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from services import application_service
from utils.response import error_response, success_response
from utils.validators import ApplicationCreateSchema, ApplicationUpdateSchema, validate_request

applications_bp = Blueprint("applications", __name__)


@applications_bp.get("/applications")
@jwt_required()
def list_applications():
    identity = current_identity()
    user_id = identity["user_id"]
    status = request.args.get("status")
    scheme_id = request.args.get("scheme_id")
    apps = application_service.get_applications(user_id, status=status, scheme_id=scheme_id)
    return success_response({"applications": apps})


@applications_bp.post("/applications")
@jwt_required()
def create_application():
    identity = current_identity()
    user_id = identity["user_id"]
    data, errors = validate_request(ApplicationCreateSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    result = application_service.create_application(user_id, data["scheme_id"])
    if result == "scheme_not_found":
        return error_response(404, "NOT_FOUND", "Scheme not found.")
    if result == "already_exists":
        return error_response(409, "CONFLICT", "You already have a tracker entry for this scheme.")
    return success_response(result, 201)


@applications_bp.patch("/applications/<string:app_id>")
@jwt_required()
def update_application(app_id: str):
    identity = current_identity()
    user_id = identity["user_id"]
    data, errors = validate_request(ApplicationUpdateSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    result = application_service.update_application_status(
        user_id, app_id, data["status"], data.get("note")
    )
    if result == "not_found":
        return error_response(404, "NOT_FOUND", "Application not found.")
    if isinstance(result, str) and result.startswith("invalid_transition"):
        return error_response(400, "INVALID_TRANSITION", f"Status transition not allowed: {result}")
    return success_response(result)
