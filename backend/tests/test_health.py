"""tests/test_health.py — Health, readiness, and version endpoint tests."""
from __future__ import annotations


def test_liveness(client):
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["status"] == "ok"
    assert "timestamp" in data


def test_readiness(client):
    resp = client.get("/api/v1/health/ready")
    # DB is in-memory — should be ready
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert data["checks"]["db"]["status"] == "ok"
    assert "ai_provider" in data["checks"]


def test_version(client):
    resp = client.get("/api/v1/version")
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "version" in data
    assert "git_sha" in data


def test_request_id_in_response_header(client):
    """X-Request-ID must be present in every response (OBSERVABILITY.md §2)."""
    resp = client.get("/api/v1/health")
    assert "X-Request-ID" in resp.headers


def test_response_envelope_shape(client):
    """Every response must conform to the standard envelope."""
    resp = client.get("/api/v1/health")
    body = resp.get_json()
    assert "success" in body
    assert "data" in body
    assert "error" in body
    assert "meta" in body
    assert "request_id" in body["meta"]
    assert "api_version" in body["meta"]
    assert body["meta"]["api_version"] == "v1"
