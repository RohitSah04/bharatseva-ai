"""routes/deadlines.py — Deadline Calendar blueprint."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from services import deadline_service
from utils.response import success_response

deadlines_bp = Blueprint("deadlines", __name__)


@deadlines_bp.get("/deadlines")
@jwt_required()
def get_deadlines():
    identity = current_identity()
    user_id = identity["user_id"]
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")
    deadlines = deadline_service.get_deadlines(user_id, from_date=from_date, to_date=to_date)
    return success_response({"deadlines": deadlines})
