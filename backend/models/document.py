"""models/document.py — Document vault."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class Document(db.Model):
    __tablename__ = "documents"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    scheme_id = db.Column(db.String, db.ForeignKey("schemes.id", ondelete="SET NULL"), nullable=True)
    filename = db.Column(db.String, nullable=False)
    file_path = db.Column(db.String, nullable=False)
    mime_type = db.Column(db.String, nullable=False)
    file_size_bytes = db.Column(db.Integer, nullable=False)
    category = db.Column(db.String)
    extracted_text = db.Column(db.String)
    ai_explanation = db.Column(db.String)
    verified_against_requirement = db.Column(db.String, default="PENDING")
    agent_log_id = db.Column(db.String, db.ForeignKey("agent_logs.id"), nullable=True)
    uploaded_at = db.Column(db.String, nullable=False, default=_now)

    scheme = db.relationship("Scheme")

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "user_id": self.user_id,
            "scheme_id": self.scheme_id,
            "filename": self.filename,
            "mime_type": self.mime_type,
            "file_size_bytes": self.file_size_bytes,
            "category": self.category,
            "extracted_text": self.extracted_text,
            "ai_explanation": self.ai_explanation,
            "verified_against_requirement": self.verified_against_requirement,
            "uploaded_at": self.uploaded_at,
        }
