"""tests/test_goals.py — AI Copilot goals endpoint tests."""
from __future__ import annotations


def test_create_goal(client, auth_headers):
    resp = client.post(
        "/api/v1/goals",
        json={"goal_text": "I want to start a dairy farm in Bihar"},
        headers=auth_headers,
    )
    assert resp.status_code == 201
    data = resp.get_json()["data"]
    assert "goal_id" in data
    assert data["status"] == "DRAFT"
    assert data["plan"] is not None
    assert 0.0 <= data["confidence"] <= 1.0


def test_create_goal_too_short(client, auth_headers):
    resp = client.post(
        "/api/v1/goals",
        json={"goal_text": "hi"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_list_goals(client, auth_headers):
    client.post(
        "/api/v1/goals",
        json={"goal_text": "I want to apply for a scholarship"},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/goals", headers=auth_headers)
    assert resp.status_code == 200
    goals = resp.get_json()["data"]["goals"]
    assert len(goals) >= 1


def test_get_goal_detail(client, auth_headers):
    create_resp = client.post(
        "/api/v1/goals",
        json={"goal_text": "Help me start a food processing business"},
        headers=auth_headers,
    )
    goal_id = create_resp.get_json()["data"]["goal_id"]

    resp = client.get(f"/api/v1/goals/{goal_id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["plan"] is not None


def test_activate_goal(client, auth_headers):
    create_resp = client.post(
        "/api/v1/goals",
        json={"goal_text": "I want to get PM-KISAN benefits"},
        headers=auth_headers,
    )
    goal_id = create_resp.get_json()["data"]["goal_id"]

    resp = client.post(f"/api/v1/goals/{goal_id}/activate", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["status"] == "ACTIVE"
    assert "tracker_ids" in data


def test_goal_not_found(client, auth_headers):
    resp = client.get("/api/v1/goals/nonexistent-goal-id", headers=auth_headers)
    assert resp.status_code == 404
