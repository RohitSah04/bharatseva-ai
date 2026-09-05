"""services/deadline_service.py — Aggregate deadline calendar.

Deadline sources (in priority order):
1. Saved schemes with a deadline date.
2. Active goal's applications — each linked scheme's deadline from the DB.
3. Active goal plan JSON deadlines[] array (Granite-generated, may be empty).

All three sources are deduped by scheme_id + deadline.
"""
from __future__ import annotations

import json
from datetime import date

from models.application import Application
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
    seen: set[tuple] = set()   # (scheme_id, deadline) — dedup key

    def _add(entry: dict) -> None:
        key = (entry.get("scheme_id"), entry.get("deadline"))
        if key not in seen:
            seen.add(key)
            results.append(entry)

    def _priority(days: int) -> str:
        return "HIGH" if days <= 7 else "MEDIUM" if days <= 30 else "LOW"

    # ── Source 1: Saved schemes ──────────────────────────────────────────────
    saved = SavedScheme.query.filter_by(user_id=user_id).all()
    for ss in saved:
        scheme: Scheme | None = ss.scheme
        if scheme and scheme.deadline:
            try:
                dl = date.fromisoformat(scheme.deadline)
            except ValueError:
                continue
            days = (dl - today).days
            _add({
                "scheme_id": scheme.id,
                "scheme_name": scheme.name,
                "deadline": scheme.deadline,
                "days_remaining": days,
                "source": "saved_scheme",
                "priority": _priority(days),
            })

    # ── Source 2: Active goal applications — scheme deadlines from DB ─────────
    # This is the primary source for Copilot plan activations.
    active_apps = (
        Application.query
        .join(CitizenGoal, Application.goal_id == CitizenGoal.id)
        .filter(
            Application.user_id == user_id,
            CitizenGoal.status == "ACTIVE",
        )
        .all()
    )
    for app in active_apps:
        scheme: Scheme | None = app.scheme
        if scheme and scheme.deadline:
            try:
                dl = date.fromisoformat(scheme.deadline)
            except ValueError:
                continue
            days = (dl - today).days
            _add({
                "scheme_id": scheme.id,
                "scheme_name": scheme.name,
                "deadline": scheme.deadline,
                "days_remaining": days,
                "source": "goal_application",
                "goal_id": app.goal_id,
                "application_id": app.id,
                "application_status": app.status,
                "priority": _priority(days),
            })

    # ── Source 3: Active goal plan JSON deadlines[] ───────────────────────────
    # Granite sometimes emits explicit deadline objects — include them too.
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
            days = (dl - today).days
            _add({
                "scheme_id": dl_entry.get("scheme_id"),
                "scheme_name": dl_entry.get("scheme_name", ""),
                "deadline": dl_str,
                "days_remaining": days,
                "source": "goal_plan",
                "goal_id": goal.id,
                "priority": _priority(days),
            })

    # ── Date range filter ────────────────────────────────────────────────────
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
