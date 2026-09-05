"""services/document_service.py — Document Vault upload and retrieval."""
from __future__ import annotations

import json
import os
import uuid
from datetime import datetime, timezone
from flask import current_app, g

from app.extensions import db
from models.document import Document
from models.agent_log import AgentLog
import ai.ai_service as ai_svc
from ai.ocr_service import extract_text_from_file
from middleware.logging_middleware import get_logger


def _now() -> str:
    return datetime.now(timezone.utc).isoformat()


def save_document(
    user_id: str,
    file_storage,       # werkzeug FileStorage
    filename: str,
    mime_type: str,
    category: str | None = None,
    scheme_id: str | None = None,
) -> dict:
    logger = get_logger()

    upload_dir = current_app.config.get("UPLOAD_FOLDER", "./data/uploads")
    os.makedirs(upload_dir, exist_ok=True)

    safe_name = f"{uuid.uuid4()}_{filename.replace('/', '_')}"
    file_path = os.path.join(upload_dir, safe_name)
    file_storage.seek(0)
    file_storage.save(file_path)
    file_size = os.path.getsize(file_path)

    # ── Real text extraction via OCR pipeline ──────────────────────────────
    file_storage.seek(0)
    file_bytes = file_storage.read()

    extracted_text, method_used = extract_text_from_file(
        file_bytes=file_bytes,
        mime_type=mime_type,
        filename=filename,
    )

    logger.info(
        "Document text extraction complete",
        extra={
            "event": "document_ocr",
            "doc_filename": filename,        # 'filename' is reserved by Python logging
            "mime_type": mime_type,
            "method": method_used,
            "chars_extracted": len(extracted_text),
        },
    )

    # ── AI Verification Agent ──────────────────────────────────────────────
    ai_result = ai_svc.explain_document(
        extracted_text=extracted_text,
        filename=filename,
        mime_type=mime_type,
    )

    request_id = getattr(g, "request_id", "")
    log = AgentLog(
        request_id=request_id,
        agent_name=ai_result["agent_name"],
        input_json=json.dumps({
            "user_id": user_id,
            "filename": filename,
            "category": category,
            "ocr_method": method_used,
            "extracted_chars": len(extracted_text),
        }),
        output_json=json.dumps(ai_result, default=str),
        confidence=ai_result["confidence"],
        latency_ms=ai_result["latency_ms"],
        fallback_used=int(ai_result.get("fallback_used", False)),
        user_id=user_id,
    )
    db.session.add(log)
    db.session.flush()

    doc = Document(
        user_id=user_id,
        scheme_id=scheme_id,
        filename=filename,
        file_path=file_path,
        mime_type=mime_type,
        file_size_bytes=file_size,
        # Prefer explicit category, then AI-detected type
        category=category or ai_result.get("document_type"),
        extracted_text=extracted_text[:8000] if extracted_text else "",
        ai_explanation=ai_result["ai_explanation"],
        verified_against_requirement=ai_result["verified_against_requirement"],
        agent_log_id=log.id,
    )
    db.session.add(doc)
    db.session.commit()

    result = doc.to_dict()
    # Attach AI metadata to the response (frontend already handles these fields)
    result["document_type"]   = ai_result.get("document_type")
    result["confidence"]      = ai_result.get("confidence")
    result["reasoning"]       = ai_result.get("reasoning")
    result["missing_info"]    = ai_result.get("missing_info", [])
    result["fallback_used"]   = ai_result.get("fallback_used", False)
    result["ocr_method"]      = method_used
    return result


def get_documents(user_id: str, category: str | None = None, scheme_id: str | None = None) -> list[dict]:
    q = Document.query.filter_by(user_id=user_id)
    if category:
        q = q.filter(Document.category == category)
    if scheme_id:
        q = q.filter(Document.scheme_id == scheme_id)
    return [d.to_dict() for d in q.order_by(Document.uploaded_at.desc()).all()]


def get_document(user_id: str, doc_id: str) -> Document | None:
    return Document.query.filter_by(id=doc_id, user_id=user_id).first()
