"""routes/chat.py — Chat blueprint."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from app.extensions import limiter
from services import chat_service
from utils.response import error_response, success_response
from utils.validators import ChatMessageSchema, validate_request

chat_bp = Blueprint("chat", __name__)


@chat_bp.post("/chat")
@jwt_required()
@limiter.limit("10 per minute")
def send_message():
    identity = current_identity()
    user_id = identity["user_id"]
    data, errors = validate_request(ChatMessageSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    result = chat_service.send_message(user_id, data["message"], data.get("language"))
    return success_response(result)


@chat_bp.get("/chat/history")
@jwt_required()
def get_history():
    identity = current_identity()
    user_id = identity["user_id"]
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(100, int(request.args.get("per_page", 50)))
    history = chat_service.get_history(user_id, page=page, per_page=per_page)
    return success_response(history)
