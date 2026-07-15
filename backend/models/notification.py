"""models/notification.py"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class Notification(db.Model):
    __tablename__ = "notifications"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    message = db.Column(db.String, nullable=False)
    message_hi = db.Column(db.String)
    type = db.Column(db.String, nullable=False)
    priority = db.Column(db.String, nullable=False, default="MEDIUM")
    related_date = db.Column(db.String)
    related_scheme_id = db.Column(db.String, db.ForeignKey("schemes.id", ondelete="SET NULL"), nullable=True)
    related_goal_id = db.Column(db.String, db.ForeignKey("citizen_goals.id", ondelete="SET NULL"), nullable=True)
    read = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.String, nullable=False, default=_now)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "message": self.message,
            "message_hi": self.message_hi,
            "type": self.type,
            "priority": self.priority,
            "related_date": self.related_date,
            "related_scheme_id": self.related_scheme_id,
            "related_goal_id": self.related_goal_id,
            "read": bool(self.read),
            "created_at": self.created_at,
        }
