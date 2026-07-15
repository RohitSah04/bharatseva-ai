"""
ai/watsonx_client.py — IBM watsonx.ai singleton client.

Initialises once per process, reuses the connection, and fails gracefully.
All credentials are read from Flask app config (which reads from .env).

Usage
-----
    from ai.watsonx_client import get_watsonx_client
    client = get_watsonx_client(app)   # first call initialises; subsequent calls return cached

The module-level singleton is stored in _client. Callers outside a request
context can pass an explicit Flask app; inside a request context they can
use current_app.

Design notes
------------
- We use ibm_watsonx_ai.ModelInference for chat/text generation.
- The ModelInference object is stateless per request; we rebuild it per call
  so that model selection (chat vs instruct) remains flexible.
- The Credentials object is shared and reused — it holds the IAM token cache.
"""
from __future__ import annotations

import threading
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from flask import Flask

from middleware.logging_middleware import get_logger

_lock = threading.Lock()
_credentials = None          # ibm_watsonx_ai.Credentials instance
_project_id: str = ""
_chat_model: str = ""
_instruct_model: str = ""
_timeout: int = 15
_initialised: bool = False
_init_error: str | None = None   # set if init failed; callers check this


def get_watsonx_client(app: "Flask | None" = None) -> "WatsonxHandle | None":
    """
    Return a WatsonxHandle that wraps the shared Credentials + project config.

    Returns None if credentials are not configured or initialisation failed.
    Sets _init_error with a human-readable reason if it returns None.
    """
    global _credentials, _project_id, _chat_model, _instruct_model
    global _timeout, _initialised, _init_error

    if _initialised:
        if _init_error:
            return None
        return WatsonxHandle(
            credentials=_credentials,
            project_id=_project_id,
            chat_model=_chat_model,
            instruct_model=_instruct_model,
            timeout=_timeout,
        )

    with _lock:
        # Double-checked locking
        if _initialised:
            if _init_error:
                return None
            return WatsonxHandle(
                credentials=_credentials,
                project_id=_project_id,
                chat_model=_chat_model,
                instruct_model=_instruct_model,
                timeout=_timeout,
            )

        logger = get_logger()

        # Resolve config — prefer explicit app argument, fall back to current_app
        cfg = _resolve_config(app)
        if cfg is None:
            _init_error = "No Flask app context available to read watsonx config."
            _initialised = True
            logger.error(_init_error, extra={"event": "watsonx_init_error"})
            return None

        api_key = cfg.get("WATSONX_API_KEY", "")
        project_id = cfg.get("WATSONX_PROJECT_ID", "")
        url = cfg.get("WATSONX_URL", "https://us-south.ml.cloud.ibm.com")

        if not api_key or api_key.startswith("your_"):
            _init_error = "WATSONX_API_KEY is not configured."
            _initialised = True
            logger.warning(_init_error, extra={"event": "watsonx_no_key"})
            return None

        if not project_id or project_id.startswith("your_"):
            _init_error = "WATSONX_PROJECT_ID is not configured."
            _initialised = True
            logger.warning(_init_error, extra={"event": "watsonx_no_project"})
            return None

        try:
            # Credentials is in ibm_watsonx_ai.credentials (also re-exported at top-level)
            # Using the canonical submodule path for explicitness.
            from ibm_watsonx_ai.credentials import Credentials
            creds = Credentials(url=url, api_key=api_key)
        except Exception as exc:
            _init_error = f"Failed to create IBM watsonx.ai Credentials: {exc}"
            _initialised = True
            logger.error(_init_error, extra={"event": "watsonx_init_error"})
            return None

        _credentials = creds
        _project_id = project_id
        _chat_model = cfg.get("WATSONX_MODEL_CHAT", "ibm/granite-13b-chat-v2")
        _instruct_model = cfg.get("WATSONX_MODEL_INSTRUCT", "ibm/granite-13b-instruct-v2")
        _timeout = int(cfg.get("WATSONX_TIMEOUT_SECONDS", 15))
        _initialised = True

        logger.info(
            "IBM watsonx.ai client initialised.",
            extra={
                "event": "watsonx_init_ok",
                "url": url,
                "chat_model": _chat_model,
                "instruct_model": _instruct_model,
            },
        )
        return WatsonxHandle(
            credentials=_credentials,
            project_id=_project_id,
            chat_model=_chat_model,
            instruct_model=_instruct_model,
            timeout=_timeout,
        )


def reset_client() -> None:
    """Reset the singleton — used in tests to force re-initialisation."""
    global _credentials, _project_id, _chat_model, _instruct_model
    global _timeout, _initialised, _init_error
    with _lock:
        _credentials = None
        _project_id = ""
        _chat_model = ""
        _instruct_model = ""
        _timeout = 15
        _initialised = False
        _init_error = None


def get_init_error() -> str | None:
    """Return the last initialisation error message, or None if healthy."""
    return _init_error


def _resolve_config(app: "Flask | None") -> "dict | None":
    """Return a dict-like config, trying explicit app then current_app."""
    if app is not None:
        return app.config
    try:
        from flask import current_app
        return current_app.config
    except RuntimeError:
        return None


class WatsonxHandle:
    """
    Thin wrapper that carries shared Credentials + project metadata.
    Callers use this to build ModelInference instances per request.
    """

    __slots__ = ("credentials", "project_id", "chat_model", "instruct_model", "timeout")

    def __init__(
        self,
        credentials,
        project_id: str,
        chat_model: str,
        instruct_model: str,
        timeout: int,
    ) -> None:
        self.credentials = credentials
        self.project_id = project_id
        self.chat_model = chat_model
        self.instruct_model = instruct_model
        self.timeout = timeout
