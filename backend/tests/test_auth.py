"""tests/test_auth.py — Auth endpoint tests including RBAC and token lifecycle."""
from __future__ import annotations

import pytest


def test_signup_success(client):
    resp = client.post(
        "/api/v1/auth/signup",
        json={"email": "newuser@test.com", "password": "Password123"},
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert data["success"] is True
    assert data["data"]["role"] == "citizen"
    assert "password_hash" not in str(data)


def test_signup_duplicate_email(client):
    email = "duplicate@test.com"
    client.post("/api/v1/auth/signup", json={"email": email, "password": "Password123"})
    resp = client.post("/api/v1/auth/signup", json={"email": email, "password": "Password123"})
    assert resp.status_code == 409
    assert resp.get_json()["error"]["code"] == "CONFLICT"


def test_signup_weak_password(client):
    resp = client.post(
        "/api/v1/auth/signup",
        json={"email": "weak@test.com", "password": "short"},
    )
    assert resp.status_code == 422


def test_login_success(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "ramesh@demo.ai", "password": "Citizen@123"},
    )
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "access_token" in data
    assert "refresh_token" in data
    assert data["expires_in"] == 900


def test_login_wrong_password(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "ramesh@demo.ai", "password": "wrongpassword"},
    )
    assert resp.status_code == 401
    assert resp.get_json()["error"]["code"] == "INVALID_CREDENTIALS"


def test_login_unknown_email(client):
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "nobody@example.com", "password": "Password123"},
    )
    assert resp.status_code == 401


def test_refresh_token(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "ramesh@demo.ai", "password": "Citizen@123"},
    )
    refresh_token = login_resp.get_json()["data"]["refresh_token"]
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": refresh_token})
    assert resp.status_code == 200
    assert "access_token" in resp.get_json()["data"]


def test_refresh_invalid_token(client):
    resp = client.post("/api/v1/auth/refresh", json={"refresh_token": "invalid-token"})
    assert resp.status_code == 401


def test_logout(client):
    login_resp = client.post(
        "/api/v1/auth/login",
        json={"email": "ramesh@demo.ai", "password": "Citizen@123"},
    )
    data = login_resp.get_json()["data"]
    resp = client.post(
        "/api/v1/auth/logout",
        json={"refresh_token": data["refresh_token"]},
        headers={"Authorization": f"Bearer {data['access_token']}"},
    )
    assert resp.status_code == 200


def test_password_reset_request(client):
    resp = client.post(
        "/api/v1/auth/password-reset/request",
        json={"email": "ramesh@demo.ai"},
    )
    assert resp.status_code == 200
    assert resp.get_json()["data"]["message"] == "reset email sent if account exists"


def test_password_reset_nonexistent_email(client):
    # Should return 200 (never reveal existence)
    resp = client.post(
        "/api/v1/auth/password-reset/request",
        json={"email": "nobody@example.com"},
    )
    assert resp.status_code == 200


def test_password_reset_invalid_token(client):
    resp = client.post(
        "/api/v1/auth/password-reset/confirm",
        json={"token": "not-a-real-token", "new_password": "NewPass@456"},
    )
    assert resp.status_code == 400
