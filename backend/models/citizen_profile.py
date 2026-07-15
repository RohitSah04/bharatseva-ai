"""models/citizen_profile.py — CitizenProfile ORM model."""
from __future__ import annotations

from datetime import datetime, timezone

from app.extensions import db

# Profile fields that contribute to completeness calculation
COMPLETENESS_FIELDS = [
    "full_name", "state", "district", "occupation", "income_band",
    "category", "age", "gender", "disability_status", "education_level",
]


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def compute_completeness(profile: "CitizenProfile") -> int:
    """Compute profile completeness percentage (0-100)."""
    filled = sum(
        1 for f in COMPLETENESS_FIELDS
        if getattr(profile, f) is not None and getattr(profile, f) != ""
    )
    return int((filled / len(COMPLETENESS_FIELDS)) * 100)


class CitizenProfile(db.Model):
    __tablename__ = "citizen_profiles"

    user_id = db.Column(
        db.String, db.ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    full_name = db.Column(db.String)
    state = db.Column(db.String)
    district = db.Column(db.String)
    occupation = db.Column(db.String)
    income_band = db.Column(db.String)
    category = db.Column(db.String)
    age = db.Column(db.Integer)
    gender = db.Column(db.String)
    disability_status = db.Column(db.String)
    education_level = db.Column(db.String)
    preferred_language = db.Column(db.String, nullable=False, default="en")
    # MSME / Startup
    business_type = db.Column(db.String)
    business_sector = db.Column(db.String)
    udyam_number = db.Column(db.String)
    dpiit_recognised = db.Column(db.Integer)
    # CSC operator context
    operator_id = db.Column(
        db.String, db.ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    profile_completeness_pct = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.String, nullable=False, default=_now)
    updated_at = db.Column(db.String, nullable=False, default=_now, onupdate=_now)

    user = db.relationship(
        "User",
        back_populates="profile",
        foreign_keys="CitizenProfile.user_id",
        primaryjoin="CitizenProfile.user_id == User.id",
    )

    def refresh_completeness(self) -> None:
        self.profile_completeness_pct = compute_completeness(self)

    def to_dict(self) -> dict:
        return {
            "user_id": self.user_id,
            "full_name": self.full_name,
            "state": self.state,
            "district": self.district,
            "occupation": self.occupation,
            "income_band": self.income_band,
            "category": self.category,
            "age": self.age,
            "gender": self.gender,
            "disability_status": self.disability_status,
            "education_level": self.education_level,
            "preferred_language": self.preferred_language,
            "business_type": self.business_type,
            "business_sector": self.business_sector,
            "udyam_number": self.udyam_number,
            "dpiit_recognised": bool(self.dpiit_recognised) if self.dpiit_recognised is not None else None,
            "operator_id": self.operator_id,
            "profile_completeness_pct": self.profile_completeness_pct,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }
