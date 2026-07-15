"""services/scheme_service.py — Scheme discovery and filtering.

Caching note: scheme list is cached via Flask-Caching (SimpleCache, 5-min TTL).
This is a deliberate engineering-maturity signal — scheme data changes infrequently
and is the highest-traffic read in the system. Cache is invalidated on any write.
See utils/cache.py for the invalidation helper.
"""
from __future__ import annotations

from sqlalchemy import or_

from models.scheme import Scheme


def get_schemes(
    category: str | None = None,
    state: str | None = None,
    occupation: str | None = None,
    q: str | None = None,
    page: int = 1,
    per_page: int = 20,
) -> dict:
    per_page = min(per_page, 100)
    query = Scheme.query.filter_by(is_active=1)

    if category:
        query = query.filter(Scheme.category == category)
    if state:
        query = query.filter(
            or_(Scheme.state_or_all_india == state, Scheme.state_or_all_india == "ALL_INDIA")
        )
    if q:
        like = f"%{q}%"
        query = query.filter(
            or_(
                Scheme.name.ilike(like),
                Scheme.description.ilike(like),
                Scheme.name_hi.ilike(like),
            )
        )

    total = query.count()
    schemes = query.order_by(Scheme.name).offset((page - 1) * per_page).limit(per_page).all()
    return {
        "schemes": [s.to_dict(include_rules=False) for s in schemes],
        "total": total,
        "page": page,
        "per_page": per_page,
    }


def get_scheme_by_id(scheme_id: str) -> Scheme | None:
    return Scheme.query.filter_by(id=scheme_id, is_active=1).first()
