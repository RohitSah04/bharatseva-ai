"""services/auth_service.py — Authentication and token management."""
from __future__ import annotations

import hashlib
import os
import secrets
from datetime import datetime, timedelta, timezone

import bcrypt
from flask_jwt_extended import create_access_token

from app.extensions import db
from models.user import PasswordResetToken, RefreshToken, User
from middleware.logging_middleware import get_logger

logger = get_logger()


def _hash_token(raw: str) -> str:
    return hashlib.sha256(raw.encode()).hexdigest()


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def signup_user(email: str, password: str, bcrypt_cost: int = 12) -> tuple[User, None] | tuple[None, str]:
    if User.query.filter_by(email=email.lower()).first():
        return None, "email_taken"
    pw_hash = bcrypt.hashpw(password.encode(), bcrypt.gensalt(rounds=bcrypt_cost)).decode()
    user = User(email=email.lower(), password_hash=pw_hash, role="citizen")
    db.session.add(user)
    db.session.commit()
    return user, None


def login_user(
    email: str, password: str, access_expires: timedelta, refresh_expires_seconds: int
) -> tuple[dict, None] | tuple[None, str]:
    user = User.query.filter_by(email=email.lower(), is_active=1).first()
    if not user:
        logger.warning("Failed login — user not found", extra={"event": "login_fail", "email": email})
        return None, "invalid_credentials"
    if not bcrypt.checkpw(password.encode(), user.password_hash.encode()):
        logger.warning("Failed login — wrong password", extra={"event": "login_fail", "email": email})
        return None, "invalid_credentials"

    # JWT sub must be a string. Role stored in additional_claims for RBAC.
    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role, "user_id": user.id},
        expires_delta=access_expires,
    )

    raw_refresh = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_refresh)
    expires_at = (datetime.now(timezone.utc) + timedelta(seconds=refresh_expires_seconds)).isoformat()

    rt = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.session.add(rt)
    db.session.commit()

    return {
        "access_token": access_token,
        "refresh_token": raw_refresh,
        "expires_in": 900,
        "user_id": user.id,
        "role": user.role,
    }, None


def refresh_access_token(raw_refresh: str, access_expires: timedelta) -> tuple[str, None] | tuple[None, str]:
    token_hash = _hash_token(raw_refresh)
    rt: RefreshToken | None = RefreshToken.query.filter_by(token_hash=token_hash, revoked=0).first()
    if not rt:
        return None, "invalid_token"
    if datetime.fromisoformat(rt.expires_at) < datetime.now(timezone.utc):
        return None, "expired_token"
    user = db.session.get(User, rt.user_id)
    if not user or not user.is_active:
        return None, "invalid_token"
    access_token = create_access_token(
        identity=user.id,
        additional_claims={"role": user.role, "user_id": user.id},
        expires_delta=access_expires,
    )
    return access_token, None


def logout_user(raw_refresh: str) -> bool:
    token_hash = _hash_token(raw_refresh)
    rt: RefreshToken | None = RefreshToken.query.filter_by(token_hash=token_hash).first()
    if not rt:
        return False
    rt.revoked = 1
    db.session.commit()
    return True


def request_password_reset(email: str) -> str | None:
    """Create a reset token (stub — logs token instead of emailing). Returns token for test visibility."""
    user = User.query.filter_by(email=email.lower()).first()
    if not user:
        return None  # Don't reveal user existence
    raw_token = secrets.token_urlsafe(32)
    token_hash = _hash_token(raw_token)
    expires_at = (datetime.now(timezone.utc) + timedelta(hours=1)).isoformat()
    prt = PasswordResetToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.session.add(prt)
    db.session.commit()
    # STUB: In production this would send an email. Log for demo.
    logger.info("Password reset token created (stub — would email)", extra={
        "event": "password_reset_request", "user_id": user.id, "token_stub": raw_token[:8] + "..."
    })
    return raw_token


def confirm_password_reset(raw_token: str, new_password: str, bcrypt_cost: int = 12) -> bool:
    token_hash = _hash_token(raw_token)
    prt: PasswordResetToken | None = PasswordResetToken.query.filter_by(
        token_hash=token_hash, used=0
    ).first()
    if not prt:
        return False
    if datetime.fromisoformat(prt.expires_at) < datetime.now(timezone.utc):
        return False
    user = db.session.get(User, prt.user_id)
    if not user:
        return False
    user.password_hash = bcrypt.hashpw(new_password.encode(), bcrypt.gensalt(rounds=bcrypt_cost)).decode()
    prt.used = 1
    db.session.commit()
    return True
