"""models/saved_scheme.py"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class SavedScheme(db.Model):
    __tablename__ = "saved_schemes"
    __table_args__ = (db.UniqueConstraint("user_id", "scheme_id"),)

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = db.Column(db.String, db.ForeignKey("schemes.id", ondelete="CASCADE"), nullable=False)
    saved_at = db.Column(db.String, nullable=False, default=_now)

    scheme = db.relationship("Scheme")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "scheme_id": self.scheme_id,
            "scheme_name": self.scheme.name if self.scheme else None,
            "saved_at": self.saved_at,
        }
