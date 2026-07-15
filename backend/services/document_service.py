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
    upload_dir = current_app.config.get("UPLOAD_FOLDER", "./data/uploads")
    os.makedirs(upload_dir, exist_ok=True)

    safe_name = f"{uuid.uuid4()}_{filename.replace('/', '_')}"
    file_path = os.path.join(upload_dir, safe_name)
    file_storage.seek(0)
    file_storage.save(file_path)
    file_size = os.path.getsize(file_path)

    # Attempt basic text extraction (real OCR via Granite in Prompt 4)
    extracted_text = ""
    if mime_type == "application/pdf":
        extracted_text = "[PDF content — text extraction requires Granite OCR in Phase 2]"
    else:
        extracted_text = "[Image content — OCR requires Granite vision in Phase 2]"

    # Call AI explanation (MOCK for now)
    ai_result = ai_svc.explain_document(extracted_text)

    request_id = getattr(g, "request_id", "")
    log = AgentLog(
        request_id=request_id,
        agent_name=ai_result["agent_name"],
        input_json=json.dumps({"user_id": user_id, "filename": filename, "category": category}),
        output_json=json.dumps(ai_result, default=str),
        confidence=ai_result["confidence"],
        latency_ms=ai_result["latency_ms"],
        fallback_used=0,
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
        category=category or ai_result.get("document_type"),
        extracted_text=extracted_text,
        ai_explanation=ai_result["ai_explanation"],
        verified_against_requirement=ai_result["verified_against_requirement"],
        agent_log_id=log.id,
    )
    db.session.add(doc)
    db.session.commit()
    return doc.to_dict()


def get_documents(user_id: str, category: str | None = None, scheme_id: str | None = None) -> list[dict]:
    q = Document.query.filter_by(user_id=user_id)
    if category:
        q = q.filter(Document.category == category)
    if scheme_id:
        q = q.filter(Document.scheme_id == scheme_id)
    return [d.to_dict() for d in q.order_by(Document.uploaded_at.desc()).all()]


def get_document(user_id: str, doc_id: str) -> Document | None:
    return Document.query.filter_by(id=doc_id, user_id=user_id).first()
