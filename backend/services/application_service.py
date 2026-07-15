"""services/application_service.py — Application Tracker service.
status_history_json is APPEND-ONLY — this service never overwrites it.
"""
from __future__ import annotations

from app.extensions import db
from models.application import Application, VALID_TRANSITIONS
from models.scheme import Scheme


def get_applications(user_id: str, status: str | None = None, scheme_id: str | None = None) -> list[dict]:
    q = Application.query.filter_by(user_id=user_id)
    if status:
        q = q.filter(Application.status == status)
    if scheme_id:
        q = q.filter(Application.scheme_id == scheme_id)
    return [a.to_dict() for a in q.order_by(Application.updated_at.desc()).all()]


def create_application(user_id: str, scheme_id: str) -> dict | str:
    scheme = Scheme.query.filter_by(id=scheme_id, is_active=1).first()
    if not scheme:
        return "scheme_not_found"
    existing = Application.query.filter_by(user_id=user_id, scheme_id=scheme_id).first()
    if existing:
        return "already_exists"
    app = Application(user_id=user_id, scheme_id=scheme_id)
    app.append_history("NOT_STARTED", "created manually")
    db.session.add(app)
    db.session.commit()
    return app.to_dict()


def update_application_status(
    user_id: str, app_id: str, new_status: str, note: str | None = None
) -> dict | str:
    app: Application | None = Application.query.filter_by(id=app_id, user_id=user_id).first()
    if not app:
        return "not_found"
    allowed = VALID_TRANSITIONS.get(app.status, ())
    if new_status not in allowed:
        return f"invalid_transition:{app.status}→{new_status}"
    app.append_history(new_status, note)
    db.session.commit()
    return app.to_dict()
