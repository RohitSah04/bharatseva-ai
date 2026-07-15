"""services/profile_service.py"""
from __future__ import annotations

from datetime import datetime, timezone

from app.extensions import db
from models.citizen_profile import CitizenProfile
from models.user import User


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def get_or_create_profile(user_id: str) -> CitizenProfile:
    profile = db.session.get(CitizenProfile, user_id)
    if not profile:
        profile = CitizenProfile(user_id=user_id)
        db.session.add(profile)
        db.session.commit()
    return profile


def update_profile(user_id: str, data: dict) -> CitizenProfile:
    profile = get_or_create_profile(user_id)
    allowed = {
        "full_name", "state", "district", "occupation", "income_band",
        "category", "age", "gender", "disability_status", "education_level",
        "preferred_language", "business_type", "business_sector",
        "udyam_number", "dpiit_recognised",
    }
    for key, value in data.items():
        if key in allowed:
            setattr(profile, key, value)
    profile.refresh_completeness()
    profile.updated_at = _now()
    db.session.commit()
    return profile
