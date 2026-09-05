"""routes/admin.py — Admin portal blueprint.

All routes require role=admin (enforced by require_role decorator, not just JWT).
Analytics computed from real DB data — never fabricated numbers.
"""
from __future__ import annotations

import json
import os
from datetime import date, datetime, timezone

from flask import Blueprint, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity
from sqlalchemy import func, text

from app.extensions import db, limiter
from middleware.logging_middleware import get_logger
from middleware.rbac import require_role
from models.agent_log import AgentLog
from models.eligibility_check import EligibilityCheck
from models.feature_flag import FeatureFlag
from models.kb_source import KbSource
from models.saved_scheme import SavedScheme
from models.scheme import Scheme
from models.user import User
from utils.response import error_response, success_response
from utils.validators import FeatureFlagUpdateSchema, validate_request

admin_bp = Blueprint("admin", __name__)
logger = get_logger()


# ── Analytics ─────────────────────────────────────────────────────────────────

@admin_bp.get("/admin/analytics/user-growth")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def user_growth():
    """Daily user registration counts — real aggregates from users table."""
    rows = (
        db.session.query(
            func.substr(User.created_at, 1, 10).label("date"),
            func.count(User.id).label("count"),
        )
        .group_by(func.substr(User.created_at, 1, 10))
        .order_by(func.substr(User.created_at, 1, 10).desc())
        .limit(30)
        .all()
    )
    return success_response({
        "user_growth": [{"date": r.date, "count": r.count} for r in rows],
        "total_users": User.query.count(),
    })


@admin_bp.get("/admin/analytics/popular-schemes")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def popular_schemes():
    """Most viewed (saved) and most eligibility-checked schemes."""
    saves = (
        db.session.query(
            SavedScheme.scheme_id,
            func.count(SavedScheme.id).label("save_count"),
        )
        .group_by(SavedScheme.scheme_id)
        .order_by(func.count(SavedScheme.id).desc())
        .limit(10)
        .all()
    )
    checks = (
        db.session.query(
            EligibilityCheck.scheme_id,
            func.count(EligibilityCheck.id).label("check_count"),
        )
        .group_by(EligibilityCheck.scheme_id)
        .order_by(func.count(EligibilityCheck.id).desc())
        .limit(10)
        .all()
    )
    scheme_names = {s.id: s.name for s in Scheme.query.all()}
    return success_response({
        "most_saved": [
            {"scheme_id": r.scheme_id, "scheme_name": scheme_names.get(r.scheme_id, ""), "save_count": r.save_count}
            for r in saves
        ],
        "most_checked": [
            {"scheme_id": r.scheme_id, "scheme_name": scheme_names.get(r.scheme_id, ""), "check_count": r.check_count}
            for r in checks
        ],
    })


@admin_bp.get("/admin/analytics/agent-performance")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def agent_performance():
    """Per-agent aggregates from agent_logs — latency, confidence, fallback_rate."""
    rows = (
        db.session.query(
            AgentLog.agent_name,
            func.count(AgentLog.id).label("call_count"),
            func.avg(AgentLog.latency_ms).label("avg_latency_ms"),
            func.avg(AgentLog.confidence).label("avg_confidence"),
            func.sum(AgentLog.fallback_used).label("fallback_count"),
            func.sum(
                db.case((AgentLog.escalated_to.isnot(None), 1), else_=0)
            ).label("escalation_count"),
        )
        .group_by(AgentLog.agent_name)
        .all()
    )
    return success_response({
        "agent_performance": [
            {
                "agent_name": r.agent_name,
                "call_count": r.call_count,
                "avg_latency_ms": round(r.avg_latency_ms or 0, 1),
                "avg_confidence": round(r.avg_confidence or 0, 3),
                "fallback_rate": round((r.fallback_count or 0) / r.call_count, 3) if r.call_count else 0,
                "escalation_rate": round((r.escalation_count or 0) / r.call_count, 3) if r.call_count else 0,
            }
            for r in rows
        ]
    })


@admin_bp.get("/admin/analytics/search-trends")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def search_trends():
    """Top search queries extracted from scheme_discovery agent_logs."""
    logs = (
        AgentLog.query.filter(AgentLog.agent_name == "scheme_discovery")
        .order_by(AgentLog.created_at.desc())
        .limit(200)
        .all()
    )
    queries: dict[str, int] = {}
    for log in logs:
        try:
            inp = json.loads(log.input_json)
            q = inp.get("q") or inp.get("query", "")
            if q:
                queries[q] = queries.get(q, 0) + 1
        except (json.JSONDecodeError, TypeError):
            pass
    sorted_q = sorted(queries.items(), key=lambda x: x[1], reverse=True)[:20]
    return success_response({
        "search_trends": [{"query": q, "count": c} for q, c in sorted_q]
    })


@admin_bp.get("/admin/analytics/system-health")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def system_health():
    """DB stats, error counts, AI provider status, real vector store inspection."""
    from models.document import Document
    from models.application import Application
    from models.eligibility_check import EligibilityCheck

    user_count = User.query.count()
    scheme_count = Scheme.query.filter_by(is_active=1).count()
    agent_log_count = AgentLog.query.count()
    fallback_count = AgentLog.query.filter_by(fallback_used=1).count()
    fallback_rate = round(fallback_count / agent_log_count, 3) if agent_log_count else 0
    doc_count = Document.query.count()
    app_count = Application.query.count()
    eligibility_count = EligibilityCheck.query.count()

    # DB file size (SQLite only)
    db_url = db.engine.url.database or ""
    db_size_mb = 0.0
    if db_url and os.path.exists(db_url):
        db_size_mb = round(os.path.getsize(db_url) / (1024 * 1024), 2)

    # ── Real vector store status ─────────────────────────────────────────
    chroma_dir = os.environ.get("CHROMA_PERSIST_DIR", "./data/chroma")
    vs_status = _vector_store_status(chroma_dir)

    # ── IBM Granite / watsonx.ai status ──────────────────────────────────
    from ai.watsonx_client import get_watsonx_client, get_init_error
    handle = get_watsonx_client()
    if handle is not None:
        ai_status = "ok"
        ai_detail = f"Connected — model: {handle.chat_model}"
    else:
        ai_status = "degraded"
        ai_detail = get_init_error() or "WATSONX_API_KEY not configured"

    # ── Recent activity (last 10 agent log entries) ───────────────────────
    recent = (
        AgentLog.query.order_by(AgentLog.created_at.desc()).limit(10).all()
    )
    recent_activity = [
        {
            "id": r.id,
            "agent_name": r.agent_name,
            "user_id": r.user_id,
            "confidence": r.confidence,
            "latency_ms": r.latency_ms,
            "fallback_used": bool(r.fallback_used),
            "created_at": r.created_at,
        }
        for r in recent
    ]

    return success_response({
        # Summary KPIs
        "users": user_count,
        "active_schemes": scheme_count,
        "documents": doc_count,
        "applications": app_count,
        "eligibility_checks": eligibility_count,
        "agent_log_entries": agent_log_count,
        "overall_fallback_rate": fallback_rate,
        "db_size_mb": db_size_mb,
        # Component statuses
        "status": "ok",
        "ai_status": ai_status,
        "ai_detail": ai_detail,
        "vector_store": vs_status,
        "recent_activity": recent_activity,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    })


def _vector_store_status(chroma_dir: str) -> dict:
    """
    Inspect the ChromaDB persistence directory on disk.
    Returns a structured status dict without requiring chromadb installed.
    """
    if not os.path.isdir(chroma_dir):
        return {
            "status": "not_initialised",
            "detail": f"Persist directory does not exist: {chroma_dir}",
            "collections": 0,
            "total_documents": 0,
        }

    # chromadb stores each collection as a subdirectory containing an sqlite3 file
    try:
        collection_dirs = [
            d for d in os.listdir(chroma_dir)
            if os.path.isdir(os.path.join(chroma_dir, d))
            and not d.startswith(".")
        ]
        total_docs = 0
        collection_info = []
        for cdir in collection_dirs:
            cpath = os.path.join(chroma_dir, cdir)
            # Count .bin or sqlite files as proxy for indexed documents
            files = os.listdir(cpath)
            doc_proxy = sum(1 for f in files if f.endswith((".bin", ".sqlite3", ".parquet")))
            total_docs += doc_proxy
            collection_info.append({"name": cdir, "file_count": doc_proxy})

        # Try to get real document counts if chromadb is installed
        try:
            import chromadb  # type: ignore
            client = chromadb.PersistentClient(path=chroma_dir)
            colls = client.list_collections()
            collection_info = []
            total_docs = 0
            for c in colls:
                n = c.count()
                total_docs += n
                collection_info.append({"name": c.name, "document_count": n})
            status = "active" if total_docs > 0 else "empty"
        except ImportError:
            status = "active" if collection_dirs else "empty"
        except Exception as exc:
            status = "error"
            return {
                "status": status,
                "detail": str(exc),
                "collections": len(collection_dirs),
                "total_documents": total_docs,
            }

        return {
            "status": status,
            "persist_dir": chroma_dir,
            "collections": len(collection_info),
            "total_documents": total_docs,
            "collection_detail": collection_info[:5],  # show up to 5
        }
    except Exception as exc:
        return {"status": "error", "detail": str(exc), "collections": 0, "total_documents": 0}




@admin_bp.get("/admin/analytics/kb-status")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def kb_status():
    """KB source freshness — highlights sources > 90 days stale."""
    sources = KbSource.query.order_by(KbSource.last_verified_date.asc()).all()
    return success_response({
        "kb_sources": [s.to_dict() for s in sources],
        "stale_count": sum(1 for s in sources if s.to_dict()["is_stale"]),
        "total": len(sources),
    })


# ── Audit logs ────────────────────────────────────────────────────────────────

@admin_bp.get("/admin/audit-logs")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def audit_logs():
    """Paginated audit log browser over eligibility_checks and agent_logs."""
    page = max(1, int(request.args.get("page", 1)))
    per_page = min(50, int(request.args.get("per_page", 20)))
    agent_name = request.args.get("agent_name")
    user_id = request.args.get("user_id")
    from_date = request.args.get("from_date")
    to_date = request.args.get("to_date")
    fallback_only = request.args.get("fallback_only", "false").lower() == "true"

    q = AgentLog.query
    if agent_name:
        q = q.filter(AgentLog.agent_name == agent_name)
    if user_id:
        q = q.filter(AgentLog.user_id == user_id)
    if from_date:
        q = q.filter(AgentLog.created_at >= from_date)
    if to_date:
        q = q.filter(AgentLog.created_at <= to_date + "T23:59:59")
    if fallback_only:
        q = q.filter(AgentLog.fallback_used == 1)

    total = q.count()
    logs = q.order_by(AgentLog.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    return success_response({
        "agent_logs": [l.to_dict() for l in logs],
        "logs": [l.to_dict() for l in logs],  # alias for frontend
        "total": total,
        "page": page,
        "per_page": per_page,
    })


# ── Feature Flags ─────────────────────────────────────────────────────────────

@admin_bp.get("/admin/feature-flags")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def list_feature_flags():
    flags = FeatureFlag.query.order_by(FeatureFlag.flag_name).all()
    return success_response({"feature_flags": [f.to_dict() for f in flags]})


@admin_bp.patch("/admin/feature-flags/<string:flag_name>")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def update_feature_flag(flag_name: str):
    data, errors = validate_request(FeatureFlagUpdateSchema, request.get_json(silent=True) or {})
    if errors:
        return error_response(422, "VALIDATION_ERROR", str(errors))
    flag = FeatureFlag.query.filter_by(flag_name=flag_name).first()
    if not flag:
        return error_response(404, "NOT_FOUND", f"Feature flag '{flag_name}' not found.")
    identity = current_identity()
    flag.enabled = 1 if data["enabled"] else 0
    flag.updated_by = identity["user_id"]
    flag.updated_at = datetime.now(timezone.utc).isoformat()
    db.session.commit()
    return success_response(flag.to_dict())


# ── Demo Reset ────────────────────────────────────────────────────────────────

@admin_bp.post("/admin/demo-reset")
@jwt_required()
@require_role("admin")
@limiter.limit("5 per minute")
def demo_reset():
    """
    Reset demo environment — clears transactional data, keeps seed schemes and users.
    Safe to run between judge walkthroughs. Idempotent.
    """
    from models.application import Application
    from models.chat_history import ChatHistory
    from models.citizen_goal import CitizenGoal
    from models.document import Document
    from models.notification import Notification
    from models.eligibility_check import EligibilityCheck
    from models.saved_scheme import SavedScheme
    from seed_data import seed_feature_flags, seed_kb_sources

    identity = current_identity()
    logger.info(
        "Admin demo-reset executed",
        extra={"event": "demo_reset", "admin_user_id": identity["user_id"]},
    )

    rows_deleted = 0
    for model in [Application, ChatHistory, CitizenGoal, Document, Notification,
                  EligibilityCheck, SavedScheme, AgentLog]:
        count = model.query.count()
        model.query.delete()
        rows_deleted += count

    db.session.commit()

    # Re-seed feature flags (idempotent)
    seed_feature_flags()

    return success_response({
        "message": "demo reset complete",
        "rows_deleted": rows_deleted,
    })


@admin_bp.get("/admin/users")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def list_users():
    """List users with search, role filter, status filter, and pagination."""
    page     = max(1, int(request.args.get("page", 1)))
    per_page = min(100, int(request.args.get("per_page", 20)))
    search   = request.args.get("search", "").strip()
    role     = request.args.get("role", "").strip()
    status   = request.args.get("status", "").strip()   # "active" | "suspended"

    q = User.query
    if search:
        q = q.filter(User.email.ilike(f"%{search}%"))
    if role in ("admin", "citizen"):
        q = q.filter(User.role == role)
    if status == "active":
        q = q.filter(User.is_active == 1)
    elif status == "suspended":
        q = q.filter(User.is_active == 0)

    total = q.count()
    users = q.order_by(User.created_at.desc()).offset((page - 1) * per_page).limit(per_page).all()

    # Attach profile summary
    from models.citizen_profile import CitizenProfile
    user_list = []
    for u in users:
        d = u.to_dict()
        profile = CitizenProfile.query.filter_by(user_id=u.id).first()
        d["profile"] = {
            "full_name": profile.full_name if profile else None,
            "state":     profile.state     if profile else None,
            "occupation": profile.occupation if profile else None,
            "completeness": profile.completeness_score if profile else 0,
        }
        user_list.append(d)

    return success_response({
        "users": user_list,
        "total": total,
        "page": page,
        "per_page": per_page,
    })


@admin_bp.get("/admin/users/<string:user_id>")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def get_user(user_id: str):
    """Get full user details including profile for admin view."""
    from models.citizen_profile import CitizenProfile
    from models.document import Document
    from models.application import Application

    user = db.session.get(User, user_id)
    if not user:
        return error_response(404, "NOT_FOUND", "User not found.")

    profile = CitizenProfile.query.filter_by(user_id=user_id).first()
    doc_count = Document.query.filter_by(user_id=user_id).count()
    app_count = Application.query.filter_by(user_id=user_id).count()

    d = user.to_dict()
    d["profile"]    = profile.to_dict() if profile else None
    d["doc_count"]  = doc_count
    d["app_count"]  = app_count
    return success_response(d)


@admin_bp.patch("/admin/users/<string:user_id>/status")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def update_user_status(user_id: str):
    """Suspend or activate a user account. Admins cannot suspend themselves."""
    identity = current_identity()
    if user_id == identity["user_id"]:
        return error_response(400, "SELF_ACTION", "You cannot change your own account status.")

    user = db.session.get(User, user_id)
    if not user:
        return error_response(404, "NOT_FOUND", "User not found.")

    body = request.get_json(silent=True) or {}
    action = body.get("action", "")   # "suspend" | "activate"
    if action not in ("suspend", "activate"):
        return error_response(400, "INVALID_ACTION", "action must be 'suspend' or 'activate'.")

    user.is_active = 0 if action == "suspend" else 1
    user.updated_at = datetime.now(timezone.utc).isoformat()

    # Revoke all refresh tokens on suspend
    if action == "suspend":
        from models.user import RefreshToken
        RefreshToken.query.filter_by(user_id=user_id).update({"revoked": 1})

    db.session.commit()
    logger.info(
        "Admin user status change",
        extra={"event": f"user_{action}", "target_user_id": user_id, "admin_id": identity["user_id"]},
    )
    return success_response({
        "user_id": user.id,
        "is_active": bool(user.is_active),
        "action": action,
    })


@admin_bp.patch("/admin/users/<string:user_id>/role")
@jwt_required()
@require_role("admin")
@limiter.limit("30 per minute")
def update_user_role(user_id: str):
    """Promote citizen to admin or demote admin to citizen."""
    identity = current_identity()
    if user_id == identity["user_id"]:
        return error_response(400, "SELF_ACTION", "You cannot change your own role.")

    user = db.session.get(User, user_id)
    if not user:
        return error_response(404, "NOT_FOUND", "User not found.")

    body = request.get_json(silent=True) or {}
    new_role = body.get("role", "")
    if new_role not in ("admin", "citizen"):
        return error_response(400, "INVALID_ROLE", "role must be 'admin' or 'citizen'.")

    old_role = user.role
    user.role = new_role
    user.updated_at = datetime.now(timezone.utc).isoformat()
    db.session.commit()

    logger.info(
        "Admin role change",
        extra={"event": "user_role_change", "target_user_id": user_id,
               "old_role": old_role, "new_role": new_role, "admin_id": identity["user_id"]},
    )
    return success_response({
        "user_id": user.id,
        "role": user.role,
        "old_role": old_role,
    })

