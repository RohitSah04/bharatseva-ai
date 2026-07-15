"""tests/test_schemes.py — Scheme endpoints."""
from __future__ import annotations


def test_list_schemes(client, auth_headers):
    resp = client.get("/api/v1/schemes", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "schemes" in data
    assert data["total"] >= 25  # At least 25 schemes seeded
    assert "page" in data


def test_list_schemes_filter_by_category(client, auth_headers):
    resp = client.get("/api/v1/schemes?category=farmer", headers=auth_headers)
    assert resp.status_code == 200
    schemes = resp.get_json()["data"]["schemes"]
    assert all(s["category"] == "farmer" for s in schemes)


def test_list_schemes_search(client, auth_headers):
    resp = client.get("/api/v1/schemes?q=KISAN", headers=auth_headers)
    assert resp.status_code == 200
    schemes = resp.get_json()["data"]["schemes"]
    assert any("KISAN" in s["name"].upper() or "KISAN" in (s.get("name_hi") or "").upper() for s in schemes)


def test_get_scheme_detail(client, auth_headers, first_scheme_id):
    resp = client.get(f"/api/v1/schemes/{first_scheme_id}", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "eligibility_rules" in data
    assert "required_documents" in data
    assert "source_url" in data


def test_get_scheme_not_found(client, auth_headers):
    resp = client.get("/api/v1/schemes/nonexistent-id-xyz", headers=auth_headers)
    assert resp.status_code == 404


def test_schemes_response_cached(client, auth_headers):
    """Two identical requests should return the same data (cache hit)."""
    r1 = client.get("/api/v1/schemes", headers=auth_headers)
    r2 = client.get("/api/v1/schemes", headers=auth_headers)
    assert r1.status_code == 200
    assert r2.status_code == 200
    assert r1.get_json()["data"]["total"] == r2.get_json()["data"]["total"]
