"""
ai/granite_service.py — IBM Granite text-generation service.

Provides a single public function:

    generate(system_prompt, user_prompt, model=None, app=None) -> GraniteResult

Where GraniteResult carries:
    .text         str   — raw model output
    .model        str   — actual model ID used
    .degraded     bool  — True if we fell back to mock/rule-based logic
    .fallback_reason str | None

All IBM SDK exceptions are caught here. Callers must NEVER let the SDK bubble
up — every upstream caller (ai_service.py, routes) must treat a degraded
result as valid but visually flagged.

SDK API reference (ibm-watsonx-ai==1.6.0)
------------------------------------------
    from ibm_watsonx_ai.credentials import Credentials          # credentials object
    from ibm_watsonx_ai.foundation_models import ModelInference  # ← correct submodule path

    ModelInference(
        model_id=...,
        credentials=...,      # Credentials instance
        project_id=...,
        validate=False,       # REQUIRED: validate=True (the default) makes a live
    )                         # network call at construction time — fails without creds

    ModelInference.chat(
        messages=[...],       # list of {"role": str, "content": str}
        params={              # passed as the `params` keyword arg, NOT inside messages
            "max_tokens": 512,
            "temperature": 0.2,
        }
    )
    # Response: {"choices": [{"message": {"content": "..."}}], ...}

PROMPT-INJECTION NOTE:
    User-supplied content passed as user_prompt must already be envelope-delimited
    by the caller BEFORE reaching this function.
    Example:  user_prompt = f"<user_input>{sanitised_text}</user_input>"
    This function does NOT apply its own sanitisation.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from flask import Flask

from middleware.logging_middleware import get_logger


@dataclass
class GraniteResult:
    text: str
    model: str
    degraded: bool
    fallback_reason: str | None = None


def generate(
    system_prompt: str,
    user_prompt: str,
    *,
    model: str | None = None,
    max_tokens: int = 512,
    temperature: float = 0.2,
    use_chat_model: bool = True,
    app: "Flask | None" = None,
) -> GraniteResult:
    """
    Send a chat prompt to IBM Granite and return the generated text.

    Parameters
    ----------
    system_prompt : str
        Instruction context for the model.
    user_prompt : str
        User-facing input. Envelope-delimit user-supplied text BEFORE calling.
    model : str | None
        Override the model ID. If None, uses chat_model from config.
    max_tokens : int
        Maximum tokens to generate. Callers should tune this per use-case
        (e.g. 300 for eligibility checks, 1800 for goal plans).
    temperature : float
        Sampling temperature. Lower = more deterministic (use 0.1–0.2 for JSON
        structured output, 0.5 for conversational chat).
    use_chat_model : bool
        When True (default), uses WATSONX_MODEL_CHAT.
        When False, uses WATSONX_MODEL_INSTRUCT.
    app : Flask | None
        Explicit app reference. Needed outside request context.

    Returns
    -------
    GraniteResult
        Always returns a result. Check .degraded to know if fallback was used.
    """
    import time as _time
    logger = get_logger()
    _t0 = _time.monotonic()
    prompt_chars = len(system_prompt) + len(user_prompt)

    from ai.watsonx_client import get_watsonx_client, get_init_error

    handle = get_watsonx_client(app=app)

    if handle is None:
        reason = get_init_error() or "IBM watsonx.ai client is not available."
        logger.warning(
            "Granite generate: falling back — client unavailable.",
            extra={"event": "granite_fallback", "reason": reason},
        )
        return GraniteResult(
            text="",
            model="mock",
            degraded=True,
            fallback_reason=reason,
        )

    # Resolve which model to use
    if model is not None:
        resolved_model = model
    elif use_chat_model:
        resolved_model = handle.chat_model
    else:
        resolved_model = handle.instruct_model

    # Build messages in OpenAI-compatible chat format (watsonx.ai 1.6.0 accepts this)
    messages = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_prompt},
    ]

    try:
        # ── Fix 1: ModelInference lives in ibm_watsonx_ai.foundation_models ──
        # NOT at ibm_watsonx_ai (top-level only re-exports Credentials, not ModelInference)
        from ibm_watsonx_ai.foundation_models import ModelInference

        # ── Fix 2: validate=False ──────────────────────────────────────────────
        # The default validate=True fires a live GET /ml/v1/foundation_model_specs
        # network call at construction time. This will always fail when called
        # outside a live request (e.g. during startup smoke tests or unit tests).
        # validate=False skips that call; the actual auth check happens on .chat().
        model_obj = ModelInference(
            model_id=resolved_model,
            credentials=handle.credentials,
            project_id=handle.project_id,
            validate=False,
        )

        # ── Fix 3: params is a top-level kwarg to .chat(), NOT nested in messages ──
        # Signature: chat(messages, params=None, tools=None, ...)
        # Passing params as a dict is supported (SDK converts to TextChatParameters).
        response = model_obj.chat(
            messages=messages,
            params={
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )

        # Extract assistant reply: response["choices"][0]["message"]["content"]
        text = (
            response.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )

        response_time_ms = int((_time.monotonic() - _t0) * 1000)
        logger.info(
            "Granite generate: success.",
            extra={
                "event": "granite_generate_ok",
                "model": resolved_model,
                "prompt_chars": prompt_chars,
                "response_chars": len(text),
                "response_time_ms": response_time_ms,
                "max_tokens": max_tokens,
                "temperature": temperature,
            },
        )

        return GraniteResult(text=text, model=resolved_model, degraded=False)

    except Exception as exc:
        response_time_ms = int((_time.monotonic() - _t0) * 1000)
        reason = f"IBM Granite call failed: {type(exc).__name__}: {exc}"
        logger.error(
            reason,
            extra={
                "event": "granite_generate_error",
                "model": resolved_model,
                "prompt_chars": prompt_chars,
                "response_time_ms": response_time_ms,
            },
        )
        return GraniteResult(
            text="",
            model=resolved_model,
            degraded=True,
            fallback_reason=reason,
        )
