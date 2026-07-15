"""tests/test_profile.py — Profile endpoints."""
from __future__ import annotations


def test_get_profile_creates_if_missing(client, auth_headers):
    resp = client.get("/api/v1/profile", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "profile_completeness_pct" in data


def test_update_profile(client, auth_headers):
    resp = client.put(
        "/api/v1/profile",
        json={
            "full_name": "Ramesh Kumar Updated",
            "state": "Bihar",
            "occupation": "farmer",
            "income_band": "below_1L",
            "category": "general",
            "age": 42,
            "gender": "male",
            "disability_status": "none",
            "education_level": "primary",
            "preferred_language": "hi",
        },
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["full_name"] == "Ramesh Kumar Updated"
    assert data["profile_completeness_pct"] > 0


def test_update_profile_invalid_category(client, auth_headers):
    resp = client.put(
        "/api/v1/profile",
        json={"category": "invalid_caste"},
        headers=auth_headers,
    )
    assert resp.status_code == 422


def test_profile_completeness_increases_with_fields(client, auth_headers):
    r1 = client.get("/api/v1/profile", headers=auth_headers)
    old_pct = r1.get_json()["data"]["profile_completeness_pct"]

    client.put("/api/v1/profile", json={"district": "Patna"}, headers=auth_headers)
    r2 = client.get("/api/v1/profile", headers=auth_headers)
    new_pct = r2.get_json()["data"]["profile_completeness_pct"]

    # Completeness should be >= (may already be 100% if pre-seeded)
    assert new_pct >= old_pct
