"""tests/test_saved_schemes.py — Saved schemes and deadline calendar tests."""
from __future__ import annotations


def test_save_scheme(client, auth_headers, first_scheme_id):
    resp = client.post(
        "/api/v1/saved-schemes",
        json={"scheme_id": first_scheme_id},
        headers=auth_headers,
    )
    assert resp.status_code in (201, 409)


def test_list_saved_schemes(client, auth_headers, first_scheme_id):
    client.post("/api/v1/saved-schemes", json={"scheme_id": first_scheme_id}, headers=auth_headers)
    resp = client.get("/api/v1/saved-schemes", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "saved_schemes" in data


def test_save_duplicate_returns_409(client, auth_headers, first_scheme_id):
    client.post("/api/v1/saved-schemes", json={"scheme_id": first_scheme_id}, headers=auth_headers)
    resp = client.post("/api/v1/saved-schemes", json={"scheme_id": first_scheme_id}, headers=auth_headers)
    assert resp.status_code == 409


def test_unsave_scheme(client, auth_headers, first_scheme_id):
    client.post("/api/v1/saved-schemes", json={"scheme_id": first_scheme_id}, headers=auth_headers)
    resp = client.delete(f"/api/v1/saved-schemes/{first_scheme_id}", headers=auth_headers)
    assert resp.status_code in (200, 404)


def test_deadlines_calendar(client, auth_headers, first_scheme_id):
    # Save a scheme with a deadline
    client.post("/api/v1/saved-schemes", json={"scheme_id": first_scheme_id}, headers=auth_headers)
    resp = client.get("/api/v1/deadlines", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "deadlines" in data
