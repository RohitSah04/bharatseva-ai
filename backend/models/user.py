"""models/user.py — User, RefreshToken, PasswordResetToken ORM models."""
from __future__ import annotations

import uuid
from datetime import datetime, timezone

from app.extensions import db


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def _uuid() -> str:
    return str(uuid.uuid4())


class User(db.Model):
    __tablename__ = "users"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    email = db.Column(db.String, nullable=False, unique=True)
    password_hash = db.Column(db.String, nullable=False)
    role = db.Column(
        db.String,
        nullable=False,
        default="citizen",
    )
    is_active = db.Column(db.Integer, nullable=False, default=1)
    created_at = db.Column(db.String, nullable=False, default=_now)
    updated_at = db.Column(db.String, nullable=False, default=_now, onupdate=_now)

    # Relationships
    profile = db.relationship(
        "CitizenProfile",
        back_populates="user",
        uselist=False,
        foreign_keys="CitizenProfile.user_id",
        primaryjoin="User.id == CitizenProfile.user_id",
    )
    refresh_tokens = db.relationship("RefreshToken", back_populates="user", cascade="all, delete-orphan")
    reset_tokens = db.relationship("PasswordResetToken", back_populates="user", cascade="all, delete-orphan")

    def to_dict(self) -> dict:
        return {
            "user_id": self.id,
            "email": self.email,
            "role": self.role,
            "is_active": bool(self.is_active),
            "created_at": self.created_at,
        }


class RefreshToken(db.Model):
    __tablename__ = "refresh_tokens"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = db.Column(db.String, nullable=False, unique=True)  # SHA-256 of raw token
    expires_at = db.Column(db.String, nullable=False)
    revoked = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.String, nullable=False, default=_now)

    user = db.relationship("User", back_populates="refresh_tokens")


class PasswordResetToken(db.Model):
    __tablename__ = "password_reset_tokens"

    id = db.Column(db.String, primary_key=True, default=_uuid)
    user_id = db.Column(db.String, db.ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash = db.Column(db.String, nullable=False, unique=True)
    expires_at = db.Column(db.String, nullable=False)
    used = db.Column(db.Integer, nullable=False, default=0)
    created_at = db.Column(db.String, nullable=False, default=_now)

    user = db.relationship("User", back_populates="reset_tokens")
