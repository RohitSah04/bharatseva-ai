"""models/scheme.py — Scheme ORM model."""
from __future__ import annotations

import json
import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class Scheme(db.Model):
    __tablename__ = "schemes"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    name = db.Column(db.String, nullable=False)
    name_hi = db.Column(db.String)
    category = db.Column(db.String, nullable=False)
    state_or_all_india = db.Column(db.String, nullable=False)
    description = db.Column(db.String, nullable=False)
    description_hi = db.Column(db.String)
    eligibility_rules_json = db.Column(db.String, nullable=False, default="{}")
    required_documents_json = db.Column(db.String, nullable=False, default="[]")
    application_url = db.Column(db.String)
    deadline = db.Column(db.String)
    source_name = db.Column(db.String, nullable=False)
    source_url = db.Column(db.String, nullable=False)
    last_verified_date = db.Column(db.String, nullable=False)
    kb_version = db.Column(db.String, nullable=False)
    office_address = db.Column(db.String)
    office_contact = db.Column(db.String)
    is_active = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.String, nullable=False, default=_now)
    updated_at = db.Column(db.String, nullable=False, default=_now, onupdate=_now)

    def to_dict(self, include_rules: bool = True) -> dict:
        d = {
            "id": self.id,
            "name": self.name,
            "name_hi": self.name_hi,
            "category": self.category,
            "state_or_all_india": self.state_or_all_india,
            "description": self.description,
            "description_hi": self.description_hi,
            "application_url": self.application_url,
            "deadline": self.deadline,
            "source_name": self.source_name,
            "source_url": self.source_url,
            "last_verified_date": self.last_verified_date,
            "kb_version": self.kb_version,
            "office_address": self.office_address,
            "office_contact": self.office_contact,
            "is_active": bool(self.is_active),
            "created_at": self.created_at,
        }
        if include_rules:
            try:
                d["eligibility_rules"] = json.loads(self.eligibility_rules_json or "{}")
                d["required_documents"] = json.loads(self.required_documents_json or "[]")
            except json.JSONDecodeError:
                d["eligibility_rules"] = {}
                d["required_documents"] = []
        return d
