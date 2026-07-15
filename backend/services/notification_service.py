"""services/notification_service.py"""
from __future__ import annotations

from app.extensions import db
from models.notification import Notification


def get_notifications(user_id: str, unread_only: bool = False, page: int = 1, per_page: int = 20) -> dict:
    per_page = min(per_page, 100)
    q = Notification.query.filter_by(user_id=user_id)
    if unread_only:
        q = q.filter_by(read=0)
    total = q.count()
    unread_count = Notification.query.filter_by(user_id=user_id, read=0).count()
    items = q.order_by(Notification.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "notifications": [n.to_dict() for n in items],
        "total": total,
        "unread_count": unread_count,
        "page": page,
        "per_page": per_page,
    }


def mark_read(user_id: str, notif_id: str) -> bool:
    n = Notification.query.filter_by(id=notif_id, user_id=user_id).first()
    if not n:
        return False
    n.read = 1
    db.session.commit()
    return True


def mark_all_read(user_id: str) -> int:
    result = Notification.query.filter_by(user_id=user_id, read=0).all()
    count = len(result)
    for n in result:
        n.read = 1
    db.session.commit()
    return count
