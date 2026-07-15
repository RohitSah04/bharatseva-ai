"""models/chat_history.py"""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class ChatHistory(db.Model):
    __tablename__ = "chat_history"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    role = db.Column(db.String, nullable=False)  # 'user' | 'assistant' | 'system'
    message = db.Column(db.String, nullable=False)
    agent_used = db.Column(db.String)
    confidence_score = db.Column(db.Float)
    sources_json = db.Column(db.String)
    fallback_used = db.Column(db.Integer, nullable=False, default=0)
    language = db.Column(db.String, nullable=False, default="en")
    created_at = db.Column(db.String, nullable=False, default=_now)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "role": self.role,
            "message": self.message,
            "agent_used": self.agent_used,
            "confidence_score": self.confidence_score,
            "sources": json.loads(self.sources_json or "[]"),
            "fallback_used": bool(self.fallback_used),
            "language": self.language,
            "created_at": self.created_at,
        }
