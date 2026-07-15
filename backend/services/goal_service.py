"""services/goal_service.py — AI Copilot goal creation and plan activation."""
from __future__ import annotations

import json
from datetime import datetime, timezone
from flask import g

from app.extensions import db
from models.agent_log import AgentLog
from models.citizen_goal import CitizenGoal
from models.application import Application
from models.citizen_profile import CitizenProfile
from models.notification import Notification
from models.scheme import Scheme
import ai.ai_service as ai_svc


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def create_goal(user_id: str, goal_text: str) -> dict:
    profile: CitizenProfile | None = db.session.get(CitizenProfile, user_id)
    profile_dict = profile.to_dict() if profile else {}

    result = ai_svc.generate_goal_plan(profile_dict, goal_text)
    plan_data = result["plan"]

    request_id = getattr(g, "request_id", "")
    log = AgentLog(
        request_id=request_id,
        agent_name=result["agent_name"],
        input_json=json.dumps({"user_id": user_id, "goal_text": goal_text[:200]}),
        output_json=json.dumps(result, default=str),
        confidence=result["confidence"],
        latency_ms=result["latency_ms"],
        fallback_used=1 if result["fallback_used"] else 0,
        user_id=user_id,
    )
    db.session.add(log)
    db.session.flush()

    # Archive any previous DRAFT goals for this user (only one active draft at a time)
    CitizenGoal.query.filter_by(user_id=user_id, status="DRAFT").update({"status": "ARCHIVED"})

    goal = CitizenGoal(
        user_id=user_id,
        goal_text=goal_text,
        generated_plan_json=json.dumps(plan_data),
        plan_confidence=result["confidence"],
        status="DRAFT",
        agent_log_id=log.id,
    )
    db.session.add(goal)
    db.session.commit()

    return {
        "goal_id": goal.id,
        "goal_text": goal.goal_text,
        "plan": plan_data,
        "status": goal.status,
        "confidence": result["confidence"],
        "sources": result.get("sources", []),
        "reasoning": result["reasoning"],
        "fallback_used": result.get("fallback_used", False),
        "degraded": result.get("fallback_used", False),
        "provider": result.get("provider", "IBM watsonx.ai"),
        "model": result.get("model", "ibm/granite-4-h-small"),
    }


def activate_goal(user_id: str, goal_id: str) -> dict | None:
    goal: CitizenGoal | None = CitizenGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return None
    if goal.status != "DRAFT":
        return {"error": "only_draft_goals_can_be_activated"}

    plan = json.loads(goal.generated_plan_json or "{}")
    tracker_ids = []
    calendar_entries_created = 0

    for scheme_info in plan.get("relevant_schemes", []):
        s_name = scheme_info.get("scheme_name", "")
        # Try to find matching scheme by name
        scheme = Scheme.query.filter(Scheme.name.ilike(f"%{s_name[:30]}%")).first()
        if not scheme:
            continue
        # Create Application tracker row (idempotent — skip if exists)
        existing = Application.query.filter_by(user_id=user_id, scheme_id=scheme.id).first()
        if not existing:
            app = Application(user_id=user_id, scheme_id=scheme.id, goal_id=goal.id)
            app.append_history("NOT_STARTED", "created on goal activation")
            db.session.add(app)
            db.session.flush()
            tracker_ids.append(app.id)

        # Notification for scheme deadline
        if scheme.deadline:
            notif = Notification(
                user_id=user_id,
                message=f"Deadline approaching for {scheme.name}: {scheme.deadline}",
                type="deadline_reminder",
                priority="HIGH",
                related_date=scheme.deadline,
                related_scheme_id=scheme.id,
                related_goal_id=goal.id,
            )
            db.session.add(notif)
            calendar_entries_created += 1

    goal.status = "ACTIVE"
    goal.updated_at = _now()
    db.session.commit()

    return {
        "goal_id": goal.id,
        "status": "ACTIVE",
        "tracker_ids": tracker_ids,
        "calendar_entries_created": calendar_entries_created,
    }
