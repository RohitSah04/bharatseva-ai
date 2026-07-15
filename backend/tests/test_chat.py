"""tests/test_chat.py — Chat endpoint tests."""
from __future__ import annotations


def test_send_chat_message(client, auth_headers):
    resp = client.post(
        "/api/v1/chat",
        json={"message": "What schemes are available for farmers?"},
        headers=auth_headers,
    )
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert isinstance(data["reply"], str) and len(data["reply"]) > 10
    assert "reasoning" in data
    assert "sources" in data
    assert "confidence" in data
    assert 0.0 <= data["confidence"] <= 1.0


def test_chat_history_saved(client, auth_headers):
    client.post(
        "/api/v1/chat",
        json={"message": "Tell me about disability welfare schemes"},
        headers=auth_headers,
    )
    resp = client.get("/api/v1/chat/history", headers=auth_headers)
    assert resp.status_code == 200
    history = resp.get_json()["data"]["history"]
    assert len(history) >= 2  # user + assistant turns


def test_chat_empty_message_rejected(client, auth_headers):
    resp = client.post("/api/v1/chat", json={"message": ""}, headers=auth_headers)
    assert resp.status_code == 422


def test_chat_with_language_override(client, auth_headers):
    resp = client.post(
        "/api/v1/chat",
        json={"message": "Eligibility for PM-KISAN?", "language": "hi"},
        headers=auth_headers,
    )
    assert resp.status_code == 200


def test_chat_history_pagination(client, auth_headers):
    resp = client.get("/api/v1/chat/history?page=1&per_page=5", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert len(data["history"]) <= 5
