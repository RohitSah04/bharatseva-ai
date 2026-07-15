"""services/chat_service.py"""
from __future__ import annotations

import json
from flask import g

from app.extensions import db
from models.chat_history import ChatHistory
from models.citizen_profile import CitizenProfile
import ai.ai_service as ai_svc


def send_message(user_id: str, message: str, language: str | None = None) -> dict:
    # Load profile for language preference
    profile = db.session.get(CitizenProfile, user_id)
    lang = language or (profile.preferred_language if profile else "en")

    # Load last 10 turns for context
    history = (
        ChatHistory.query.filter_by(user_id=user_id)
        .order_by(ChatHistory.created_at.desc())
        .limit(10)
        .all()
    )
    history_dicts = [h.to_dict() for h in reversed(history)]

    # Save user message
    user_turn = ChatHistory(
        user_id=user_id,
        role="user",
        message=message,
        language=lang,
    )
    db.session.add(user_turn)
    db.session.flush()

    result = ai_svc.chat_with_agent(user_id, message, history_dicts)

    # Translate reply if needed
    reply = result["reply"]
    if lang != "en":
        reply = ai_svc.translate_text(reply, lang)

    # Save assistant message
    assistant_turn = ChatHistory(
        user_id=user_id,
        role="assistant",
        message=reply,
        agent_used=result["agent_used"],
        confidence_score=result["confidence"],
        sources_json=json.dumps(result.get("sources", [])),
        fallback_used=1 if result["fallback_used"] else 0,
        language=lang,
    )
    db.session.add(assistant_turn)
    db.session.commit()

    return {
        "reply": reply,
        "reasoning": result["reasoning"],
        "sources": result.get("sources", []),
        "agent_used": result["agent_used"],
        "confidence": result["confidence"],
        "fallback_used": result["fallback_used"],
        "degraded": result.get("fallback_used", False),
        "provider": result.get("provider", "IBM watsonx.ai"),
        "model": result.get("model", "ibm/granite-4-h-small"),
    }


def get_history(user_id: str, page: int = 1, per_page: int = 50) -> dict:
    per_page = min(per_page, 100)
    total = ChatHistory.query.filter_by(user_id=user_id).count()
    items = (
        ChatHistory.query.filter_by(user_id=user_id)
        .order_by(ChatHistory.created_at.asc())
        .offset((page - 1) * per_page)
        .limit(per_page)
        .all()
    )
    return {
        "history": [h.to_dict() for h in items],
        "total": total,
        "page": page,
        "per_page": per_page,
    }
