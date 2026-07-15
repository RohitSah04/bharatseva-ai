"""tests/test_notifications.py — Notifications endpoint tests."""
from __future__ import annotations

from app.extensions import db
from models.notification import Notification


def test_list_notifications_empty(client, auth_headers):
    resp = client.get("/api/v1/notifications", headers=auth_headers)
    assert resp.status_code == 200
    data = resp.get_json()["data"]
    assert "notifications" in data
    assert "unread_count" in data


def test_mark_notification_read(client, app, auth_headers):
    """Create a notification for the test user and mark it read."""
    from flask_jwt_extended import decode_token
    # Get user ID from token
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "ramesh@demo.ai", "password": "Citizen@123"},
    )
    token = resp.get_json()["data"]["access_token"]

    with app.app_context():
        from models.user import User
        user = User.query.filter_by(email="ramesh@demo.ai").first()
        notif = Notification(
            user_id=user.id,
            message="Test notification",
            type="info",
            priority="LOW",
        )
        db.session.add(notif)
        db.session.commit()
        notif_id = notif.id

    resp = client.patch(
        f"/api/v1/notifications/{notif_id}/read",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert resp.status_code == 200
    assert resp.get_json()["data"]["read"] is True


def test_mark_all_read(client, auth_headers):
    resp = client.patch("/api/v1/notifications/read-all", headers=auth_headers)
    assert resp.status_code == 200
    assert isinstance(resp.get_json()["data"]["updated"], int)
