"""utils/validators.py — Common Marshmallow schemas for request validation."""
from __future__ import annotations

from marshmallow import Schema, ValidationError, fields, validate, validates


# ── Auth ─────────────────────────────────────────────────────────────────────

class SignupSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=validate.Length(min=8))


class LoginSchema(Schema):
    email = fields.Email(required=True)
    password = fields.Str(required=True)


class RefreshTokenSchema(Schema):
    refresh_token = fields.Str(required=True)


class PasswordResetRequestSchema(Schema):
    email = fields.Email(required=True)


class PasswordResetConfirmSchema(Schema):
    token = fields.Str(required=True)
    new_password = fields.Str(required=True, validate=validate.Length(min=8))


# ── Profile ───────────────────────────────────────────────────────────────────

_CATEGORIES = ("general", "obc", "sc", "st", "ews")
_GENDERS = ("male", "female", "transgender", "prefer_not_to_say")
_DISABILITY = ("none", "locomotor", "visual", "hearing", "intellectual", "other")
_INCOME_BANDS = ("below_1L", "1L_3L", "3L_6L", "6L_8L", "above_8L")
_OCCUPATIONS = ("farmer", "student", "msme_owner", "startup_founder", "government_employee",
                 "private_employee", "self_employed", "unemployed", "homemaker", "other")
_EDUCATION = ("none", "primary", "secondary", "graduate", "postgraduate")
_LANGUAGES = ("en", "hi", "ta", "te", "or", "mr", "kn", "bn", "gu", "pa")


class ProfileUpdateSchema(Schema):
    full_name = fields.Str(validate=validate.Length(max=200))
    state = fields.Str(validate=validate.Length(max=100))
    district = fields.Str(validate=validate.Length(max=100))
    occupation = fields.Str(validate=validate.OneOf(_OCCUPATIONS))
    income_band = fields.Str(validate=validate.OneOf(_INCOME_BANDS))
    category = fields.Str(validate=validate.OneOf(_CATEGORIES))
    age = fields.Int(validate=validate.Range(min=1, max=120))
    gender = fields.Str(validate=validate.OneOf(_GENDERS))
    disability_status = fields.Str(validate=validate.OneOf(_DISABILITY))
    education_level = fields.Str(validate=validate.OneOf(_EDUCATION))
    preferred_language = fields.Str(validate=validate.OneOf(_LANGUAGES))
    business_type = fields.Str()
    business_sector = fields.Str()
    udyam_number = fields.Str()
    dpiit_recognised = fields.Bool()


# ── Eligibility ───────────────────────────────────────────────────────────────

class EligibilityCheckSchema(Schema):
    scheme_id = fields.Str(required=True)


# ── Goals ──────────────────────────────────────────────────────────────────────

class GoalCreateSchema(Schema):
    goal_text = fields.Str(required=True, validate=validate.Length(min=5, max=1000))


# ── Applications ──────────────────────────────────────────────────────────────

_APP_STATUSES = ("NOT_STARTED", "IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED")


class ApplicationCreateSchema(Schema):
    scheme_id = fields.Str(required=True)


class ApplicationUpdateSchema(Schema):
    status = fields.Str(
        required=True,
        validate=validate.OneOf(("IN_PROGRESS", "SUBMITTED", "APPROVED", "REJECTED"))
    )
    note = fields.Str(validate=validate.Length(max=500))


# ── Documents ─────────────────────────────────────────────────────────────────

class DocumentUploadSchema(Schema):
    category = fields.Str()
    scheme_id = fields.Str()


# ── Chat ─────────────────────────────────────────────────────────────────────

_VALID_LANGUAGES = ("en", "hi", "ta", "te", "or", "mr", "kn", "bn", "gu", "pa")


class ChatMessageSchema(Schema):
    message = fields.Str(required=True, validate=validate.Length(min=1, max=2000))
    language = fields.Str(validate=validate.OneOf(_VALID_LANGUAGES))


# ── Saved Schemes ─────────────────────────────────────────────────────────────

class SaveSchemeSchema(Schema):
    scheme_id = fields.Str(required=True)


# ── Feature Flags ─────────────────────────────────────────────────────────────

class FeatureFlagUpdateSchema(Schema):
    enabled = fields.Bool(required=True)


def validate_request(schema_class: type[Schema], data: dict) -> tuple[dict, dict | None]:
    """
    Validate `data` against `schema_class`.
    Returns (validated_data, None) on success or ({}, errors_dict) on failure.
    """
    schema = schema_class()
    try:
        return schema.load(data), None
    except ValidationError as e:
        return {}, e.messages
