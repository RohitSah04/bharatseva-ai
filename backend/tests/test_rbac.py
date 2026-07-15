"""tests/test_rbac.py — RBAC enforcement tests. Admin routes must reject citizen tokens."""
from __future__ import annotations

import pytest


def test_admin_analytics_rejects_citizen(client, auth_headers):
    """Citizen token must not access admin analytics (SECURITY_AND_RBAC.md §1)."""
    resp = client.get("/api/v1/admin/analytics/user-growth", headers=auth_headers)
    assert resp.status_code == 403
    assert resp.get_json()["error"]["code"] == "FORBIDDEN"


def test_admin_feature_flags_rejects_citizen(client, auth_headers):
    resp = client.get("/api/v1/admin/feature-flags", headers=auth_headers)
    assert resp.status_code == 403


def test_admin_audit_logs_rejects_citizen(client, auth_headers):
    resp = client.get("/api/v1/admin/audit-logs", headers=auth_headers)
    assert resp.status_code == 403


def test_admin_demo_reset_rejects_citizen(client, auth_headers):
    resp = client.post("/api/v1/admin/demo-reset", headers=auth_headers)
    assert resp.status_code == 403


def test_admin_analytics_accepts_admin(client, admin_headers):
    resp = client.get("/api/v1/admin/analytics/user-growth", headers=admin_headers)
    assert resp.status_code == 200


def test_unauthenticated_profile_returns_401(client):
    resp = client.get("/api/v1/profile")
    assert resp.status_code == 401


def test_unauthenticated_schemes_returns_401(client):
    resp = client.get("/api/v1/schemes")
    assert resp.status_code == 401


def test_unauthenticated_chat_returns_401(client):
    resp = client.post("/api/v1/chat", json={"message": "Hello"})
    assert resp.status_code == 401


def test_health_is_public(client):
    """Health endpoint must be accessible without auth."""
    resp = client.get("/api/v1/health")
    assert resp.status_code == 200


def test_version_is_public(client):
    resp = client.get("/api/v1/version")
    assert resp.status_code == 200
