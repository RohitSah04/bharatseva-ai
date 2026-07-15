"""routes/auth.py — Authentication blueprint."""
from __future__ import annotations

from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required

from app.extensions import limiter
from middleware.rbac import require_role
from services import auth_service
from utils.response import error_response, success_response
from utils.validators import (
    LoginSchema,
    PasswordResetConfirmSchema,
    PasswordResetRequestSchema,
    RefreshTokenSchema,
    SignupSchema,
    validate_request,
)

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/auth/signup")
@limiter.limit("5 per minute")
def signup():
    data, errors = validate_request(SignupSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    user, err = auth_service.signup_user(
        data["email"],
        data["password"],
        current_app.config["BCRYPT_COST"],
    )
    if err == "email_taken":
        return error_response(409, "CONFLICT", "An account with this email already exists.")
    return success_response(user.to_dict(), 201)


@auth_bp.post("/auth/login")
@limiter.limit("10 per minute")
def login():
    data, errors = validate_request(LoginSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    tokens, err = auth_service.login_user(
        data["email"],
        data["password"],
        current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
        current_app.config["REFRESH_TOKEN_EXPIRES_SECONDS"],
    )
    if err:
        return error_response(401, "INVALID_CREDENTIALS", "Invalid email or password.")
    return success_response(tokens)


@auth_bp.post("/auth/refresh")
@limiter.limit("60 per minute")
def refresh():
    data, errors = validate_request(RefreshTokenSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    access_token, err = auth_service.refresh_access_token(
        data["refresh_token"],
        current_app.config["JWT_ACCESS_TOKEN_EXPIRES"],
    )
    if err:
        return error_response(401, "INVALID_TOKEN", "Refresh token is invalid or expired.")
    return success_response({"access_token": access_token, "expires_in": 900})


@auth_bp.post("/auth/logout")
@jwt_required()
@limiter.limit("60 per minute")
def logout():
    data, errors = validate_request(RefreshTokenSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    auth_service.logout_user(data["refresh_token"])
    return success_response({"message": "logged out"})


@auth_bp.post("/auth/password-reset/request")
@limiter.limit("3 per minute")
def pw_reset_request():
    data, errors = validate_request(PasswordResetRequestSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    auth_service.request_password_reset(data["email"])
    # Always return the same message to avoid user-existence leakage
    return success_response({"message": "reset email sent if account exists"})


@auth_bp.post("/auth/password-reset/confirm")
@limiter.limit("3 per minute")
def pw_reset_confirm():
    data, errors = validate_request(PasswordResetConfirmSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    ok = auth_service.confirm_password_reset(
        data["token"],
        data["new_password"],
        current_app.config["BCRYPT_COST"],
    )
    if not ok:
        return error_response(400, "INVALID_TOKEN", "Token is invalid, expired, or already used.")
    return success_response({"message": "password updated"})
