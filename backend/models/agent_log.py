"""models/agent_log.py — Immutable audit log for every AI agent call. NEVER update or delete."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class AgentLog(db.Model):
    __tablename__ = "agent_logs"
    # AUDIT TABLE — append-only. No UPDATE or DELETE operations permitted.

    id = db.Column(db.String, primary_key=True, default=_uuid)
    request_id = db.Column(db.String, nullable=False)
    agent_name = db.Column(db.String, nullable=False)
    input_json = db.Column(db.String, nullable=False)
    output_json = db.Column(db.String, nullable=False)
    confidence = db.Column(db.Float)
    latency_ms = db.Column(db.Integer, nullable=False)
    fallback_used = db.Column(db.Integer, nullable=False, default=0)
    fallback_reason = db.Column(db.String)
    escalated_to = db.Column(db.String)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    created_at = db.Column(db.String, nullable=False, default=_now)

    def to_dict(self) -> dict:
        import json
        return {
            "id": self.id,
            "request_id": self.request_id,
            "agent_name": self.agent_name,
            "input": json.loads(self.input_json or "{}"),
            "output": json.loads(self.output_json or "{}"),
            "confidence": self.confidence,
            "latency_ms": self.latency_ms,
            "fallback_used": bool(self.fallback_used),
            "fallback_reason": self.fallback_reason,
            "escalated_to": self.escalated_to,
            "user_id": self.user_id,
            "created_at": self.created_at,
        }
