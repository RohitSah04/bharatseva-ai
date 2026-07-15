"""models/kb_source.py — Knowledge Base provenance tracking."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class KbSource(db.Model):
    __tablename__ = "kb_sources"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    source_name = db.Column(db.String, nullable=False)
    source_url = db.Column(db.String, nullable=False)
    category = db.Column(db.String, nullable=False)
    state_or_all_india = db.Column(db.String, nullable=False, default="ALL_INDIA")
    last_verified_date = db.Column(db.String, nullable=False)
    version = db.Column(db.String, nullable=False)
    document_count = db.Column(db.Integer, nullable=False, default=0)
    ingest_status = db.Column(db.String, nullable=False, default="PENDING")
    created_at = db.Column(db.String, nullable=False, default=_now)
    updated_at = db.Column(db.String, nullable=False, default=_now, onupdate=_now)

    def to_dict(self) -> dict:
        from datetime import date, timedelta
        try:
            vd = date.fromisoformat(self.last_verified_date)
            stale = (date.today() - vd).days > 90
        except ValueError:
            stale = False
        return {
            "id": self.id,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "category": self.category,
            "state_or_all_india": self.state_or_all_india,
            "last_verified_date": self.last_verified_date,
            "version": self.version,
            "document_count": self.document_count,
            "ingest_status": self.ingest_status,
            "is_stale": stale,
            "updated_at": self.updated_at,
        }
