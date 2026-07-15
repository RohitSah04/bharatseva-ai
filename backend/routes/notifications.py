"""routes/notifications.py — Notifications blueprint."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from services import notification_service
from utils.response import error_response, success_response

notifications_bp = Blueprint("notifications", __name__)


@notifications_bp.get("/notifications")
@jwt_required()
def list_notifications():
    identity = current_identity()
    user_id = identity["user_id"]
    unread_only = request.args.get("unread_only", "false").lower() == "true"
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(100, int(request.args.get("per_page", 20)))
    result = notification_service.get_notifications(user_id, unread_only=unread_only, page=page, per_page=per_page)
    return success_response(result)


@notifications_bp.patch("/notifications/<string:notif_id>/read")
@jwt_required()
def mark_read(notif_id: str):
    identity = current_identity()
    user_id = identity["user_id"]
    ok = notification_service.mark_read(user_id, notif_id)
    if not ok:
        return error_response(404, "NOT_FOUND", "Notification not found.")
    return success_response({"read": True})


@notifications_bp.patch("/notifications/read-all")
@jwt_required()
def mark_all_read():
    identity = current_identity()
    user_id = identity["user_id"]
    updated = notification_service.mark_all_read(user_id)
    return success_response({"updated": updated})
