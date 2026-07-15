"""models/citizen_goal.py — Citizen Copilot goals. generated_plan_json is immutable once written."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class CitizenGoal(db.Model):
    __tablename__ = "citizen_goals"
    # PLAN IMMUTABILITY: generated_plan_json is written once and never mutated.
    # A revised plan creates a NEW row; the old row is archived (status=ARCHIVED).

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    goal_text = db.Column(db.String, nullable=False)
    goal_text_normalised = db.Column(db.String)
    generated_plan_json = db.Column(db.String)
    plan_confidence = db.Column(db.Float)
    status = db.Column(db.String, nullable=False, default="DRAFT")
    agent_log_id = db.Column(db.String, db.ForeignKey("agent_logs.id"), nullable=True)
    created_at = db.Column(db.String, nullable=False, default=_now)
    updated_at = db.Column(db.String, nullable=False, default=_now, onupdate=_now)

    applications = db.relationship("Application", back_populates="goal")

    def to_dict(self, include_plan: bool = True) -> dict:
        d = {
            "id": self.id,
            "user_id": self.user_id,
            "goal_text": self.goal_text,
            "status": self.status,
            "plan_confidence": self.plan_confidence,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
        if include_plan:
            try:
                d["plan"] = json.loads(self.generated_plan_json) if self.generated_plan_json else None
            except json.JSONDecodeError:
                d["plan"] = None
        return d
