"""models/eligibility_check.py — Immutable audit log. NEVER update or delete rows."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class EligibilityCheck(db.Model):
    __tablename__ = "eligibility_checks"
    # AUDIT TABLE — rows are append-only. No UPDATE or DELETE in service layer.

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = db.Column(db.String, db.ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    verdict = db.Column(db.String, nullable=False)
    confidence_score = db.Column(db.Float, nullable=False)
    reasoning = db.Column(db.String, nullable=False)
    sources_json = db.Column(db.String, nullable=False, default="[]")
    fallback_used = db.Column(db.Integer, nullable=False, default=0)
    agent_log_id = db.Column(db.String, db.ForeignKey("agent_logs.id"), nullable=True)
    checked_at = db.Column(db.String, nullable=False, default=_now)

    scheme = db.relationship("Scheme")

    def to_dict(self) -> dict:
        import json
        return {
            "id": self.id,
            "user_id": self.user_id,
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme.name if self.scheme else None,
            "verdict": self.verdict,
            "confidence_score": self.confidence_score,
            "reasoning": self.reasoning,
            "sources": json.loads(self.sources_json or "[]"),
            "fallback_used": bool(self.fallback_used),
            "checked_at": self.checked_at,
        }
