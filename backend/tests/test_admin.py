"""tests/test_admin.py — Admin analytics and feature flag tests."""
from __future__ import annotations


def test_user_growth_analytics(client, admin_headers):
    resp = client.get("/api/v1/admin/analytics/user-growth", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "user_growth" in data
    assert "total_users" in data
    assert data["total_users"] >= 3  # at least 3 seeded users


def test_popular_schemes_analytics(client, admin_headers):
    resp = client.get("/api/v1/admin/analytics/popular-schemes", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "most_saved" in data
    assert "most_checked" in data


def test_agent_performance_analytics(client, admin_headers, auth_headers, first_scheme_id):
    # Generate some agent_log entries first
    client.post(
        "/api/v1/eligibility/check",
        json={"scheme_id": first_scheme_id},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/admin/analytics/agent-performance", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "agent_performance" in data


def test_kb_status_analytics(client, admin_headers):
    resp = client.get("/api/v1/admin/analytics/kb-status", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "kb_sources" in data
    assert "total" in data


def test_system_health_analytics(client, admin_headers):
    resp = client.get("/api/v1/admin/analytics/system-health", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "users" in data
    assert data["users"] >= 1


def test_feature_flags_list(client, admin_headers):
    resp = client.get("/api/v1/admin/feature-flags", headers=admin_headers)
    assert resp.status_code == 200
    flags = resp.get_json()["data"]["feature_flags"]
    assert len(flags) >= 5
    assert any(f["flag_name"] == "ai_copilot" for f in flags)


def test_feature_flag_patch(client, admin_headers):
    resp = client.patch(
        "/api/v1/admin/feature-flags/ai_copilot",
        json={"enabled": False},
        headers=admin_headers,
    )
    assert resp.status_code == 200
    assert resp.get_json()["data"]["enabled"] is False


def test_feature_flag_not_found(client, admin_headers):
    resp = client.patch(
        "/api/v1/admin/feature-flags/nonexistent_flag",
        json={"enabled": True},
        headers=admin_headers,
    )
    assert resp.status_code == 404


def test_audit_logs(client, admin_headers, auth_headers, first_scheme_id):
    # Generate audit entry
    client.post("/api/v1/eligibility/check", json={"scheme_id": first_scheme_id}, headers=auth_headers)
    resp = client.get("/api/v1/admin/audit-logs", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "agent_logs" in data


def test_demo_reset(client, admin_headers):
    resp = client.post("/api/v1/admin/demo-reset", headers=admin_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "rows_deleted" in data
    assert isinstance(data["rows_deleted"], int)
