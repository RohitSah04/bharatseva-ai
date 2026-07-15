"""services/deadline_service.py — Aggregate deadline calendar."""
from __future__ import annotations

import json
from datetime import date, datetime

from models.citizen_goal import CitizenGoal
from models.saved_scheme import SavedScheme
from models.scheme import Scheme


def get_deadlines(
    user_id: str,
    from_date: str | None = None,
    to_date: str | None = None,
) -> list[dict]:
    today = date.today()
    results: list[dict] = []

    # ── Deadlines from saved schemes ─────────────────────────────────────────
    saved = SavedScheme.query.filter_by(user_id=user_id).all()
    for ss in saved:
        scheme: Scheme | None = ss.scheme
        if scheme and scheme.deadline:
            try:
                dl = date.fromisoformat(scheme.deadline)
            except ValueError:
                continue
            days_remaining = (dl - today).days
            results.append({
                "scheme_id": scheme.id,
                "scheme_name": scheme.name,
                "deadline": scheme.deadline,
                "days_remaining": days_remaining,
                "source": "saved_scheme",
                "priority": "HIGH" if days_remaining <= 7 else "MEDIUM" if days_remaining <= 30 else "LOW",
            })

    # ── Deadlines from active goal plans ─────────────────────────────────────
    goals = CitizenGoal.query.filter_by(user_id=user_id, status="ACTIVE").all()
    for goal in goals:
        try:
            plan = json.loads(goal.generated_plan_json or "{}")
        except (ValueError, TypeError):
            continue
        for dl_entry in plan.get("deadlines", []):
            dl_str = dl_entry.get("deadline")
            if not dl_str:
                continue
            try:
                dl = date.fromisoformat(dl_str)
            except ValueError:
                continue
            days_remaining = (dl - today).days
            results.append({
                "scheme_id": None,
                "scheme_name": dl_entry.get("scheme_name", ""),
                "deadline": dl_str,
                "days_remaining": days_remaining,
                "source": "goal_plan",
                "goal_id": goal.id,
                "priority": "HIGH" if days_remaining <= 7 else "MEDIUM" if days_remaining <= 30 else "LOW",
            })

    # ── Date range filter ─────────────────────────────────────────────────────
    if from_date:
        try:
            fd = date.fromisoformat(from_date)
            results = [r for r in results if date.fromisoformat(r["deadline"]) >= fd]
        except ValueError:
            pass
    if to_date:
        try:
            td = date.fromisoformat(to_date)
            results = [r for r in results if date.fromisoformat(r["deadline"]) <= td]
        except ValueError:
            pass

    # Sort by deadline ascending
    results.sort(key=lambda r: r["deadline"])
    return results
