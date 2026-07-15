"""tests/test_eligibility.py — Eligibility check endpoint tests."""
from __future__ import annotations


def test_eligibility_check_success(client, auth_headers, first_scheme_id):
    resp = client.post(
        "/api/v1/eligibility/check",
        json={"scheme_id": first_scheme_id},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["verdict"] in ("ELIGIBLE", "NOT_ELIGIBLE", "PARTIALLY_ELIGIBLE")
    assert 0.0 <= data["confidence"] <= 1.0
    assert isinstance(data["reasoning"], str) and len(data["reasoning"]) > 10
    assert isinstance(data["sources"], list)
    assert "check_id" in data


def test_eligibility_check_invalid_scheme(client, auth_headers):
    resp = client.post(
        "/api/v1/eligibility/check",
        json={"scheme_id": "nonexistent-scheme"},
        headers=auth_headers,
    )
    assert resp.status_code == 404


def test_eligibility_check_missing_scheme_id(client, auth_headers):
    resp = client.post(
        "/api/v1/eligibility/check",
        json={},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_eligibility_check_audit_row_created(client, auth_headers, first_scheme_id, app):
    """Every eligibility check must persist an immutable audit row."""
    client.post(
        "/api/v1/eligibility/check",
        json={"scheme_id": first_scheme_id},
        headers=auth_headers,
    )
    with app.app_context():
        from models.eligibility_check import EligibilityCheck
        count = EligibilityCheck.query.count()
        assert count >= 1
