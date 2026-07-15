"""routes/goals.py — AI Citizen Copilot (goals) blueprint."""
from __future__ import annotations

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from app.extensions import limiter
from models.citizen_goal import CitizenGoal
from services import goal_service
from utils.response import error_response, success_response
from utils.validators import GoalCreateSchema, validate_request

goals_bp = Blueprint("goals", __name__)


@goals_bp.post("/goals")
@jwt_required()
@limiter.limit("10 per minute")
def create_goal():
    identity = current_identity()
    user_id = identity["user_id"]

    data, errors = validate_request(GoalCreateSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))

    result = goal_service.create_goal(user_id, data["goal_text"])
    return success_response(result, 201)


@goals_bp.post("/goals/<string:goal_id>/activate")
@jwt_required()
def activate_goal(goal_id: str):
    identity = current_identity()
    user_id = identity["user_id"]
    result = goal_service.activate_goal(user_id, goal_id)
    if result is None:
        return error_response(404, "NOT_FOUND", "Goal not found.")
    if "error" in result:
        return error_response(400, "GOAL_ERROR", result["error"])
    return success_response(result)


@goals_bp.get("/goals")
@jwt_required()
def list_goals():
    identity = current_identity()
    user_id = identity["user_id"]
    goals = (
        CitizenGoal.query.filter_by(user_id=user_id)
        .order_by(CitizenGoal.created_at.desc())
        .all()
    )
    return success_response({
        "goals": [g.to_dict(include_plan=False) for g in goals]
    })


@goals_bp.get("/goals/<string:goal_id>")
@jwt_required()
def get_goal(goal_id: str):
    identity = current_identity()
    user_id = identity["user_id"]
    goal = CitizenGoal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return error_response(404, "NOT_FOUND", "Goal not found.")
    return success_response(goal.to_dict(include_plan=True))
