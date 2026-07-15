"""
routes/ai_test.py — Temporary IBM watsonx.ai connectivity test endpoint.

GET /api/v1/ai/test

Sends a minimal prompt to IBM Granite and returns the raw response.
No authentication required — this endpoint exists solely for integration
verification during Phase 4 development.

REMOVE or protect this endpoint before any public/production deployment.
"""
from __future__ import annotations

from flask import Blueprint, current_app

from ai.granite_service import generate
from utils.response import error_response, success_response

ai_test_bp = Blueprint("ai_test", __name__)

_SYSTEM_PROMPT = "You are IBM Granite, a helpful AI assistant."
_USER_PROMPT = "Reply with exactly: IBM Granite connection successful."


@ai_test_bp.get("/ai/test")
def test_watsonx_connection():
    """
    Verify that the IBM watsonx.ai / Granite integration is wired correctly.

    Returns 200 with the model response, or 503 if the client is not configured
    or the call fails.

    Example success response:
    {
        "success": true,
        "data": {
            "provider": "IBM watsonx.ai",
            "model": "ibm/granite-13b-chat-v2",
            "response": "IBM Granite connection successful.",
            "degraded": false,
            "fallback_reason": null
        },
        "error": null,
        "meta": { ... }
    }

    Example degraded (no credentials) response — still 200 but degraded=true:
    {
        "success": true,
        "data": {
            "provider": "IBM watsonx.ai",
            "model": "mock",
            "response": "",
            "degraded": true,
            "fallback_reason": "WATSONX_API_KEY is not configured."
        },
        ...
    }
    """
    result = generate(
        system_prompt=_SYSTEM_PROMPT,
        user_prompt=_USER_PROMPT,
        app=current_app._get_current_object(),  # safe outside request context
    )

    data = {
        "provider": "IBM watsonx.ai",
        "model": result.model,
        "response": result.text,
        "degraded": result.degraded,
        "fallback_reason": result.fallback_reason,
    }

    if result.degraded:
        # Return 200 but surface the degradation clearly so the caller can act.
        # The response envelope already carries degraded=true in meta (set by
        # success_response), but we also echo it in data for easy inspection.
        return success_response(data, degraded=True)

    return success_response(data)
