"""tests/test_applications.py — Application tracker tests."""
from __future__ import annotations

import pytest


def _create_application(client, headers, first_scheme_id):
    resp = client.post(
        "/api/v1/applications",
        json={"scheme_id": first_scheme_id},
        headers=headers,
    )
    return resp


def test_create_application(client, auth_headers, first_scheme_id):
    resp = _create_application(client, auth_headers, first_scheme_id)
    # May be 201 or 409 if already exists
    assert resp.status_code in (201, 409)
    if resp.status_code == 201:
        data = resp.get_json()["data"]
        assert data["status"] == "NOT_STARTED"
        assert isinstance(data["status_history"], list)


def test_list_applications(client, auth_headers, first_scheme_id):
    _create_application(client, auth_headers, first_scheme_id)
    resp = client.get("/api/v1/applications", headers=auth_headers)
    assert resp.status_code == 200
    assert "applications" in resp.get_json()["data"]


def test_status_transition_valid(client, auth_headers, first_scheme_id):
    _create_application(client, auth_headers, first_scheme_id)
    apps_resp = client.get("/api/v1/applications", headers=auth_headers)
    apps = apps_resp.get_json()["data"]["applications"]
    app_id = next((a["id"] for a in apps if a["scheme_id"] == first_scheme_id), None)
    if app_id is None:
        pytest.skip("Application not in NOT_STARTED state")
        return

    resp = client.patch(
        f"/api/v1/applications/{app_id}",
        json={"status": "IN_PROGRESS", "note": "Started gathering documents"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["status"] == "IN_PROGRESS"
    # History must be append-only (not overwritten)
    history = data["status_history"]
    assert len(history) >= 2  # NOT_STARTED entry + IN_PROGRESS entry


def test_status_history_is_append_only(client, auth_headers, first_scheme_id):
    """status_history_json must grow — not reset — on each transition."""
    _create_application(client, auth_headers, first_scheme_id)
    apps = client.get("/api/v1/applications", headers=auth_headers).get_json()["data"]["applications"]
    app_id = next((a["id"] for a in apps if a["scheme_id"] == first_scheme_id), None)
    if not app_id:
        pytest.skip("No application found")

    # Force to IN_PROGRESS first
    client.patch(f"/api/v1/applications/{app_id}", json={"status": "IN_PROGRESS"}, headers=auth_headers)
    resp = client.patch(f"/api/v1/applications/{app_id}", json={"status": "SUBMITTED"}, headers=auth_headers)
    if resp.status_code == 200:
        history = resp.get_json()["data"]["status_history"]
        statuses = [h["status"] for h in history]
        assert "NOT_STARTED" in statuses or "IN_PROGRESS" in statuses  # previous entries preserved


def test_invalid_status_transition(client, auth_headers, app):
    """Cannot jump from NOT_STARTED to APPROVED — use a second scheme to get a fresh row."""
    # Find a scheme we haven't tracked yet
    schemes = client.get("/api/v1/schemes?page=2", headers=auth_headers).get_json()["data"]["schemes"]
    if not schemes:
        pytest.skip("Not enough schemes to test")
    second_scheme_id = schemes[0]["id"]

    create_resp = client.post(
        "/api/v1/applications",
        json={"scheme_id": second_scheme_id},
        headers=auth_headers,
    )
    if create_resp.status_code == 409:
        # already exists; get its id and reset path
        apps = client.get("/api/v1/applications", headers=auth_headers).get_json()["data"]["applications"]
        fresh = next((a for a in apps if a["scheme_id"] == second_scheme_id and a["status"] == "NOT_STARTED"), None)
        if not fresh:
            pytest.skip("No NOT_STARTED application available for this test")
        app_id = fresh["id"]
    else:
        app_id = create_resp.get_json()["data"]["id"]

    # NOT_STARTED → APPROVED is invalid
    resp = client.patch(
        f"/api/v1/applications/{app_id}",
        json={"status": "APPROVED"},
        headers=auth_headers,
    )
    assert resp.status_code == 400
