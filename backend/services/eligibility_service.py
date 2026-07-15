"""services/eligibility_service.py — Eligibility check persistence and orchestration."""
from __future__ import annotations

import json
import time
from datetime import datetime, timezone
from flask import g

from app.extensions import db
from models.agent_log import AgentLog
from models.eligibility_check import EligibilityCheck
from models.scheme import Scheme
from models.citizen_profile import CitizenProfile
import ai.ai_service as ai_svc


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def run_eligibility_check(user_id: str, scheme_id: str) -> dict:
    scheme: Scheme | None = Scheme.query.filter_by(id=scheme_id, is_active=1).first()
    if not scheme:
        return {"error": "scheme_not_found"}

    profile: CitizenProfile | None = db.session.get(CitizenProfile, user_id)
    profile_dict = profile.to_dict() if profile else {}

    result = ai_svc.check_eligibility(profile_dict, scheme.to_dict())

    request_id = getattr(g, "request_id", "")

    # Persist agent log (immutable audit)
    log = AgentLog(
        request_id=request_id,
        agent_name=result["agent_name"],
        input_json=json.dumps({"user_id": user_id, "scheme_id": scheme_id}),
        output_json=json.dumps(result, default=str),
        confidence=result["confidence"],
        latency_ms=result["latency_ms"],
        fallback_used=1 if result["fallback_used"] else 0,
        fallback_reason=result.get("fallback_reason"),
        user_id=user_id,
    )
    db.session.add(log)
    db.session.flush()  # get log.id before committing

    # Persist eligibility check (immutable audit — NEVER update or delete)
    check = EligibilityCheck(
        user_id=user_id,
        scheme_id=scheme_id,
        verdict=result["verdict"],
        confidence_score=result["confidence"],
        reasoning=result["reasoning"],
        sources_json=json.dumps(result.get("sources", [])),
        fallback_used=1 if result["fallback_used"] else 0,
        agent_log_id=log.id,
        checked_at=_now(),
    )
    db.session.add(check)
    db.session.commit()

    return {
        "check_id": check.id,
        "verdict": result["verdict"],
        "confidence": result["confidence"],
        "reasoning": result["reasoning"],
        "sources": result.get("sources", []),
        "fallback_used": result["fallback_used"],
        "degraded": result.get("fallback_used", False),
        "provider": result.get("provider", "IBM watsonx.ai"),
        "model": result.get("model", "ibm/granite-4-h-small"),
    }
