"""models/application.py — Application tracker. status_history_json is append-only."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from app.extensions import db

VALID_STATUSES = ("NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED")

# Valid transitions — forward only, never backward (except SUBMITTED → APPROVED/REJECTED)
VALID_TRANSITIONS: dict[str, tuple[str, ...]] = {
    "NOT_STARTED": ("IN_PROGRESS",),
    "IN_PROGRESS": ("SUBMITTED",),
    "SUBMITTED": ("APPROVED", "REJECTED"),
    "APPROVED": (),
    "REJECTED": (),
}


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class Application(db.Model):
    __tablename__ = "applications"
    __table_args__ = (db.UniqueConstraint("user_id", "scheme_id"),)

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = db.Column(db.String, db.ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    goal_id = db.Column(db.String, db.ForeignKey("citizen_goals.id", ondelete="SET NULL"), nullable=True)
    status = db.Column(db.String, nullable=False, default="NOT_STARTED")
    # APPEND-ONLY: service layer enforces this — never overwrite, only append entries
    status_history_json = db.Column(db.String, nullable=False, default="[]")
    created_at = db.Column(db.String, nullable=False, default=_now)
    updated_at = db.Column(db.String, nullable=False, default=_now, onupdate=_now)

    scheme = db.relationship("Scheme")
    goal = db.relationship("CitizenGoal", back_populates="applications")

    def append_history(self, new_status: str, note: str | None = None) -> None:
        """Append a history entry. Never overwrites; always grows the array."""
        history = json.loads(self.status_history_json or "[]")
        history.append({
            "status": new_status,
            "changed_at": _now(),
            "note": note or "",
        })
        self.status_history_json = json.dumps(history)
        self.status = new_status
        self.updated_at = _now()

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme.name if self.scheme else None,
            "goal_id": self.goal_id,
            "status": self.status,
            "status_history": json.loads(self.status_history_json or "[]"),
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
