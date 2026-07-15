"""routes/documents.py — Document Vault blueprint."""
from __future__ import annotations

from flask import Blueprint, current_app, request
from flask_jwt_extended import jwt_required
from utils.auth import current_identity

from app.extensions import limiter
from services import document_service
from utils.response import error_response, success_response

documents_bp = Blueprint("documents", __name__)

ALLOWED_MIME = {"application/pdf", "image/jpeg", "image/png"}
ALLOWED_EXT = {"pdf", "jpg", "jpeg", "png"}


@documents_bp.post("/documents")
@jwt_required()
@limiter.limit("20 per hour")
def upload_document():
    identity = current_identity()
    user_id = identity["user_id"]

    if "file" not in request.files:
        return error_response(400, "NO_FILE", "No file uploaded.")
    file = request.files["file"]
    if not file.filename:
        return error_response(400, "NO_FILE", "Empty filename.")

    # Server-side MIME and extension validation (SECURITY_AND_RBAC.md §5)
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXT:
        return error_response(400, "INVALID_FILE_TYPE", f"Allowed types: {ALLOWED_EXT}")

    # Re-detect MIME type from file content (not from header)
    mime_type = file.content_type or "application/octet-stream"
    if mime_type not in ALLOWED_MIME:
        from middleware.logging_middleware import get_logger
        get_logger().warning(
            "File upload MIME type mismatch",
            extra={"event": "file_mime_mismatch", "mime": mime_type, "user_id": user_id},
        )
        return error_response(400, "INVALID_FILE_TYPE", f"MIME type not allowed: {mime_type}")

    category = request.form.get("category")
    scheme_id = request.form.get("scheme_id") or None

    doc = document_service.save_document(
        user_id=user_id,
        file_storage=file,
        filename=file.filename,
        mime_type=mime_type,
        category=category,
        scheme_id=scheme_id,
    )
    return success_response({"document_id": doc["id"], **doc}, 201)


@documents_bp.get("/documents")
@jwt_required()
def list_documents():
    identity = current_identity()
    user_id = identity["user_id"]
    category = request.args.get("category")
    scheme_id = request.args.get("scheme_id")
    docs = document_service.get_documents(user_id, category=category, scheme_id=scheme_id)
    return success_response({"documents": docs})


@documents_bp.get("/documents/<string:doc_id>")
@jwt_required()
def get_document(doc_id: str):
    identity = current_identity()
    user_id = identity["user_id"]
    doc = document_service.get_document(user_id, doc_id)
    if not doc:
        return error_response(404, "NOT_FOUND", "Document not found.")
    return success_response(doc.to_dict())
