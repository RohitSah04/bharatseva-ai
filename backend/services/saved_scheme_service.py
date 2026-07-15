"""services/saved_scheme_service.py"""
from __future__ import annotations

from sqlalchemy.exc import IntegrityError

from app.extensions import db
from models.saved_scheme import SavedScheme
from models.scheme import Scheme


def get_saved(user_id: str) -> list[dict]:
    items = SavedScheme.query.filter_by(user_id=user_id).order_by(SavedScheme.saved_at.desc()).all()
    return [s.to_dict() for s in items]


def save_scheme(user_id: str, scheme_id: str) -> dict | str:
    if not Scheme.query.filter_by(id=scheme_id, is_active=1).first():
        return "scheme_not_found"
    try:
        ss = SavedScheme(user_id=user_id, scheme_id=scheme_id)
        db.session.add(ss)
        db.session.commit()
        return ss.to_dict()
    except IntegrityError:
        db.session.rollback()
        return "already_saved"


def unsave_scheme(user_id: str, scheme_id: str) -> bool:
    ss = SavedScheme.query.filter_by(user_id=user_id, scheme_id=scheme_id).first()
    if not ss:
        return False
    db.session.delete(ss)
    db.session.commit()
    return True
