"""
config.py — All application configuration is read from environment variables.
No secrets or environment-specific values are hardcoded here.
"""
from __future__ import annotations

import os
from datetime import timedelta


class Config:
    # ── Application ──────────────────────────────────────────────────────────
    APP_ENV: str = os.environ.get("APP_ENV", "development")
    LOG_FORMAT: str = os.environ.get("LOG_FORMAT", "json")
    SECRET_KEY: str = os.environ.get("SECRET_KEY", "")
    VERSION: str = os.environ.get("VERSION", "1.0.0")
    GIT_SHA: str = os.environ.get("GIT_SHA", "unknown")

    # ── Database ─────────────────────────────────────────────────────────────
    SQLALCHEMY_DATABASE_URI: str = os.environ.get(
        "DATABASE_URL", "sqlite:///./data/bharatseva.db"
    )
    SQLALCHEMY_TRACK_MODIFICATIONS: bool = False
    SQLALCHEMY_ENGINE_OPTIONS: dict = {
        "connect_args": {"check_same_thread": False},  # SQLite only; ignored by Postgres
    }

    # ── JWT ──────────────────────────────────────────────────────────────────
    JWT_SECRET_KEY: str = os.environ.get("JWT_SECRET_KEY", "")
    JWT_ACCESS_TOKEN_EXPIRES: timedelta = timedelta(
        seconds=int(os.environ.get("JWT_ACCESS_TOKEN_EXPIRES_SECONDS", "900"))
    )
    # Refresh tokens are managed manually (opaque string + DB hash),
    # not via Flask-JWT-Extended's built-in refresh mechanism.
    REFRESH_TOKEN_EXPIRES_SECONDS: int = int(
        os.environ.get("JWT_REFRESH_TOKEN_EXPIRES_SECONDS", "604800")
    )

    # ── Security ─────────────────────────────────────────────────────────────
    BCRYPT_COST: int = max(12, int(os.environ.get("BCRYPT_COST", "12")))
    CORS_ALLOWED_ORIGINS: list[str] = [
        o.strip()
        for o in os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost:3000").split(",")
        if o.strip()
    ]

    # ── Rate limiting ─────────────────────────────────────────────────────────
    RATELIMIT_STORAGE_URI: str = os.environ.get("RATELIMIT_STORAGE_URI", "memory://")
    RATELIMIT_HEADERS_ENABLED: bool = True
    RATELIMIT_DEFAULT = "200 per day;60 per minute"

    # ── Caching ───────────────────────────────────────────────────────────────
    CACHE_TYPE: str = os.environ.get("CACHE_TYPE", "SimpleCache")
    CACHE_DEFAULT_TIMEOUT: int = int(os.environ.get("CACHE_DEFAULT_TIMEOUT", "300"))

    # ── File uploads ──────────────────────────────────────────────────────────
    UPLOAD_FOLDER: str = os.environ.get("UPLOAD_FOLDER", "./data/uploads")
    MAX_CONTENT_LENGTH: int = int(os.environ.get("MAX_CONTENT_LENGTH", str(10 * 1024 * 1024)))
    ALLOWED_MIME_TYPES: frozenset[str] = frozenset(
        {"application/pdf", "image/jpeg", "image/png"}
    )
    ALLOWED_EXTENSIONS: frozenset[str] = frozenset({"pdf", "jpg", "jpeg", "png"})

    # ── watsonx.ai ────────────────────────────────────────────────────────────
    WATSONX_API_KEY: str = os.environ.get("WATSONX_API_KEY", "")
    WATSONX_PROJECT_ID: str = os.environ.get("WATSONX_PROJECT_ID", "")
    WATSONX_URL: str = os.environ.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")
    WATSONX_MODEL_CHAT: str = os.environ.get(
        "WATSONX_MODEL_CHAT", "ibm/granite-4-h-small"
    )
    WATSONX_MODEL_INSTRUCT: str = os.environ.get(
        "WATSONX_MODEL_INSTRUCT", "ibm/granite-4-h-small"
    )
    WATSONX_TIMEOUT_SECONDS: int = int(os.environ.get("WATSONX_TIMEOUT_SECONDS", "30"))

    # ── OpenAPI / docs ────────────────────────────────────────────────────────
    API_TITLE: str = "BharatSeva AI API"
    API_VERSION: str = "v1"
    OPENAPI_VERSION: str = "3.0.3"
    OPENAPI_URL_PREFIX: str = "/api/v1"
    OPENAPI_SWAGGER_UI_PATH: str = "/docs"
    OPENAPI_SWAGGER_UI_URL: str = "https://cdn.jsdelivr.net/npm/swagger-ui-dist/"


class DevelopmentConfig(Config):
    LOG_FORMAT: str = os.environ.get("LOG_FORMAT", "pretty")
    SQLALCHEMY_ECHO: bool = False


class ProductionConfig(Config):
    LOG_FORMAT: str = "json"
    SQLALCHEMY_ECHO: bool = False


_config_map: dict[str, type[Config]] = {
    "development": DevelopmentConfig,
    "production": ProductionConfig,
    "testing": DevelopmentConfig,
}


def get_config() -> type[Config]:
    env = os.environ.get("APP_ENV", "development")
    return _config_map.get(env, DevelopmentConfig)
