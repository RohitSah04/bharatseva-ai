"""services/goal_service.py — AI Copilot goal creation and plan activation.

activate_goal() is fully transactional:
- All Application and Notification rows are created in a single transaction.
- If any DB write fails the entire transaction is rolled back and an error is returned.
- Duplicate activation (status != DRAFT) is rejected before any writes.
- Idempotent per scheme: existing Application rows are skipped without crashing.
"""
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


def _find_scheme(name: str) -> Scheme | None:
    """
    Robust scheme lookup: tries progressively looser matches.

    1. Exact case-insensitive match on full name.
    2. ilike match on the first 40 characters.
    3. Token-based: match any of the significant words (≥5 chars) in the name.
    Returns the first active match, or None.
    """
    if not name:
        return None

    # 1. Exact match
    scheme = Scheme.query.filter(
        Scheme.is_active == 1,
        db.func.lower(Scheme.name) == name.strip().lower(),
    ).first()
    if scheme:
        return scheme

    # 2. 40-char prefix ilike
    prefix = name.strip()[:40]
    scheme = Scheme.query.filter(
        Scheme.is_active == 1,
        Scheme.name.ilike(f"%{prefix}%"),
    ).first()
    if scheme:
        return scheme

    # 3. Token-based: any significant word
    tokens = [t for t in name.split() if len(t) >= 5]
    for token in tokens:
        scheme = Scheme.query.filter(
            Scheme.is_active == 1,
            Scheme.name.ilike(f"%{token}%"),
        ).first()
        if scheme:
            return scheme

    return None


def activate_goal(user_id: str, goal_id: str) -> dict | None:
    """
    Transactionally activate a DRAFT goal:
    1. Validate goal ownership and DRAFT status.
    2. Parse the plan JSON and look up matching schemes.
    3. Create Application rows (idempotent — skip duplicates).
    4. Create Notification (deadline reminder) rows for schemes with deadlines.
    5. Mark goal as ACTIVE.
    6. Single db.session.commit() — all or nothing.

    Returns:
        None          — goal not found / wrong user
        {"error": …}  — goal is not in DRAFT status
        dict          — activation result with tracker_ids and calendar_entries_created
    """
    goal: CitizenGoal | None = CitizenGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return None
    if goal.status != "DRAFT":
        return {"error": "only_draft_goals_can_be_activated"}

    try:
        plan = json.loads(goal.generated_plan_json or "{}")
    except (ValueError, TypeError):
        plan = {}

    tracker_ids: list[str] = []
    calendar_entries_created = 0
    schemes_matched: list[dict] = []   # enriched data returned to frontend

    for scheme_info in plan.get("relevant_schemes", []):
        s_name = scheme_info.get("scheme_name", "")

        # ── Robust scheme name resolution ────────────────────────────────
        scheme = _find_scheme(s_name)
        if not scheme:
            # Still track the scheme name even if we can't match to DB — reported in response
            schemes_matched.append({
                "scheme_name": s_name,
                "matched": False,
                "reason": "scheme_not_found_in_db",
            })
            continue

        # ── Application Tracker row (idempotent) ─────────────────────────
        existing = Application.query.filter_by(
            user_id=user_id,
            scheme_id=scheme.id,
        ).first()

        if not existing:
            app = Application(
                user_id=user_id,
                scheme_id=scheme.id,
                goal_id=goal.id,
            )
            app.append_history("NOT_STARTED", "Created on Copilot plan activation")
            db.session.add(app)
            db.session.flush()   # Get app.id assigned before appending to list
            tracker_ids.append(app.id)
            schemes_matched.append({
                "scheme_name": scheme.name,
                "scheme_id": scheme.id,
                "application_id": app.id,
                "matched": True,
                "was_duplicate": False,
            })
        else:
            # Already tracked — don't duplicate, but include in response
            tracker_ids.append(existing.id)
            schemes_matched.append({
                "scheme_name": scheme.name,
                "scheme_id": scheme.id,
                "application_id": existing.id,
                "matched": True,
                "was_duplicate": True,
            })

        # ── Deadline Calendar entry (Notification) ────────────────────────
        # Source 1: scheme.deadline from the database (most reliable)
        deadline_str = scheme.deadline
        # Source 2: deadline from the AI plan for this scheme (fallback)
        if not deadline_str:
            deadline_str = scheme_info.get("deadline") or scheme_info.get("apply_by")

        if deadline_str:
            # Avoid duplicate deadline notifications for the same scheme+goal
            dup_notif = Notification.query.filter_by(
                user_id=user_id,
                type="deadline_reminder",
                related_scheme_id=scheme.id,
                related_goal_id=goal.id,
            ).first()
            if not dup_notif:
                notif = Notification(
                    user_id=user_id,
                    message=f"Deadline approaching: {scheme.name} — {deadline_str}",
                    type="deadline_reminder",
                    priority="HIGH" if _days_remaining(deadline_str) <= 30 else "MEDIUM",
                    related_date=deadline_str,
                    related_scheme_id=scheme.id,
                    related_goal_id=goal.id,
                )
                db.session.add(notif)
                calendar_entries_created += 1

    # ── Mark goal ACTIVE ─────────────────────────────────────────────────────
    goal.status = "ACTIVE"
    goal.updated_at = _now()

    # ── Single atomic commit ─────────────────────────────────────────────────
    try:
        db.session.commit()
    except Exception as exc:
        db.session.rollback()
        return {"error": f"database_write_failed: {exc}"}

    return {
        "goal_id": goal.id,
        "status": "ACTIVE",
        "tracker_ids": tracker_ids,
        "calendar_entries_created": calendar_entries_created,
        "schemes_matched": schemes_matched,
        "applications_created": len([s for s in schemes_matched if s.get("matched") and not s.get("was_duplicate")]),
        "applications_already_existed": len([s for s in schemes_matched if s.get("was_duplicate")]),
        "schemes_not_found": len([s for s in schemes_matched if not s.get("matched")]),
    }


def _days_remaining(deadline_str: str) -> int:
    """Return days until deadline_str (ISO date string). Returns 999 on parse error."""
    from datetime import date
    try:
        return (date.fromisoformat(deadline_str) - date.today()).days
    except (ValueError, TypeError):
        return 999
