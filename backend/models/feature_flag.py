"""models/feature_flag.py"""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class FeatureFlag(db.Model):
    __tablename__ = "feature_flags"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    flag_name = db.Column(db.String, nullable=False, unique=True)
    enabled = db.Column(db.Integer, nullable=False, default=0)
    description = db.Column(db.String, nullable=False)
    updated_at = db.Column(db.String, nullable=False, default=_now, onupdate=_now)
    updated_by = db.Column(db.String, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True)

    def to_dict(self) -> dict:
        return {
            "flag_name": self.flag_name,
            "enabled": bool(self.enabled),
            "description": self.description,
            "updated_at": self.updated_at,
            "updated_by": self.updated_by,
        }
