"""
ai/ocr_service.py — Document text extraction pipeline.

Extraction strategy (in priority order):
  1. PyMuPDF (fitz)  — fast, zero-dependency native PDF text extraction.
     Works for text-layer PDFs (most government documents).
  2. pypdf           — pure-Python fallback for text-layer PDFs.
  3. pdf2image + pytesseract — converts PDF pages to images then runs OCR.
     Used when text-layer extraction yields < 50 chars (scanned PDFs).
  4. Pillow + pytesseract — direct OCR on uploaded images (JPEG, PNG, TIFF).
  5. Base64 → IBM Granite Vision — if available; used as best-quality path
     for image uploads when the Granite model supports vision.

All extraction methods are wrapped in try/except. The pipeline always
returns something — worst case an empty string that triggers the
keyword-based fallback in ai_service.explain_document().
"""
from __future__ import annotations

import base64
import io
import logging
import os
import re
import tempfile
from pathlib import Path

logger = logging.getLogger(__name__)

# ── PDF text extraction ──────────────────────────────────────────────────────

def _extract_pdf_text_pymupdf(file_bytes: bytes) -> str:
    """Fast native text extraction using PyMuPDF (fitz)."""
    import fitz  # type: ignore
    text_parts = []
    with fitz.open(stream=file_bytes, filetype="pdf") as doc:
        for page in doc:
            text_parts.append(page.get_text())
    return "\n".join(text_parts).strip()


def _extract_pdf_text_pypdf(file_bytes: bytes) -> str:
    """Pure-Python text extraction using pypdf."""
    from pypdf import PdfReader  # type: ignore
    reader = PdfReader(io.BytesIO(file_bytes))
    parts = []
    for page in reader.pages:
        txt = page.extract_text()
        if txt:
            parts.append(txt)
    return "\n".join(parts).strip()


def _extract_pdf_ocr(file_bytes: bytes) -> str:
    """
    PDF → images → Tesseract OCR.
    Used for scanned PDFs (no text layer).
    """
    try:
        from pdf2image import convert_from_bytes  # type: ignore
        import pytesseract  # type: ignore
        images = convert_from_bytes(file_bytes, dpi=200, first_page=1, last_page=3)
        parts = []
        for img in images:
            parts.append(pytesseract.image_to_string(img, lang="eng+hin"))
        return "\n".join(parts).strip()
    except Exception as exc:
        logger.warning("PDF OCR failed: %s", exc)
        return ""


def extract_pdf(file_bytes: bytes) -> str:
    """
    Top-level PDF text extractor.
    Tries PyMuPDF → pypdf → pdf2image+OCR in order.
    Returns the best non-empty result.
    """
    # 1. PyMuPDF — fastest, handles complex layouts
    try:
        text = _extract_pdf_text_pymupdf(file_bytes)
        if len(text) > 50:
            logger.debug("PDF text extracted via PyMuPDF (%d chars)", len(text))
            return text
    except Exception as exc:
        logger.debug("PyMuPDF failed: %s", exc)

    # 2. pypdf — pure Python fallback
    try:
        text = _extract_pdf_text_pypdf(file_bytes)
        if len(text) > 50:
            logger.debug("PDF text extracted via pypdf (%d chars)", len(text))
            return text
    except Exception as exc:
        logger.debug("pypdf failed: %s", exc)

    # 3. OCR fallback for scanned PDFs
    logger.debug("PDF appears scanned — attempting OCR")
    return _extract_pdf_ocr(file_bytes)


# ── Image text extraction ────────────────────────────────────────────────────

def _extract_image_tesseract(file_bytes: bytes) -> str:
    """Tesseract OCR on image bytes."""
    try:
        import pytesseract  # type: ignore
        from PIL import Image  # type: ignore
        img = Image.open(io.BytesIO(file_bytes))
        # Convert to RGB if necessary (handles RGBA, P, etc.)
        if img.mode not in ("RGB", "L"):
            img = img.convert("RGB")
        text = pytesseract.image_to_string(img, lang="eng+hin")
        return text.strip()
    except Exception as exc:
        logger.warning("Tesseract OCR failed: %s", exc)
        return ""


def extract_image(file_bytes: bytes) -> str:
    """
    Extract text from an image file.
    Returns Tesseract OCR output (with Hindi+English language pack).
    """
    text = _extract_image_tesseract(file_bytes)
    logger.debug("Image OCR extracted %d chars", len(text))
    return text


# ── IBM Granite Vision (optional — image → description) ─────────────────────

def _encode_image_base64(file_bytes: bytes) -> str:
    return base64.b64encode(file_bytes).decode("utf-8")


def extract_via_granite_vision(file_bytes: bytes, mime_type: str) -> str:
    """
    Send image to IBM Granite vision model for text extraction.
    Falls back to empty string if the model doesn't support vision
    or if the call fails.

    Note: ibm-watsonx-ai 1.6.x supports image inputs via the
    messages API when using a vision-capable model (e.g. granite-vision).
    This is attempted opportunistically — failure is silent.
    """
    try:
        from ai.watsonx_client import get_watsonx_client
        from ibm_watsonx_ai.foundation_models import ModelInference  # type: ignore

        handle = get_watsonx_client()
        if handle is None:
            return ""

        # Use the chat model — Granite 4 supports vision inputs
        b64 = _encode_image_base64(file_bytes)
        messages = [
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": (
                            "Extract ALL visible text from this document image. "
                            "Include every word, number, date, name, and address. "
                            "Output only the extracted text, nothing else."
                        ),
                    },
                    {
                        "type": "image_url",
                        "image_url": {"url": f"data:{mime_type};base64,{b64}"},
                    },
                ],
            }
        ]

        model_obj = ModelInference(
            model_id=handle.chat_model,
            credentials=handle.credentials,
            project_id=handle.project_id,
            validate=False,
        )
        response = model_obj.chat(
            messages=messages,
            params={"max_tokens": 1200, "temperature": 0.0},
        )
        text = (
            response.get("choices", [{}])[0]
            .get("message", {})
            .get("content", "")
            .strip()
        )
        if text:
            logger.info("Granite vision extraction: %d chars", len(text))
        return text

    except Exception as exc:
        logger.debug("Granite vision extraction skipped: %s", exc)
        return ""


# ── Top-level dispatcher ─────────────────────────────────────────────────────

def extract_text_from_file(
    file_bytes: bytes,
    mime_type: str,
    filename: str = "",
) -> tuple[str, str]:
    """
    Main entry point called by document_service.

    Returns
    -------
    (extracted_text, method_used)
        extracted_text : str  — raw text (may be empty if all methods fail)
        method_used    : str  — human-readable label for logging/audit
    """
    is_pdf = mime_type == "application/pdf" or filename.lower().endswith(".pdf")
    is_image = mime_type.startswith("image/") or any(
        filename.lower().endswith(ext) for ext in (".jpg", ".jpeg", ".png", ".tiff", ".tif", ".bmp", ".webp")
    )

    if is_pdf:
        text = extract_pdf(file_bytes)
        method = "pymupdf/pypdf/ocr"
        return text, method

    if is_image:
        # Try Granite vision first (higher quality for structured documents)
        granite_text = extract_via_granite_vision(file_bytes, mime_type)
        if len(granite_text) > 30:
            return granite_text, "granite_vision"

        # Fallback to Tesseract
        text = extract_image(file_bytes)
        return text, "tesseract"

    # Unknown type — attempt pypdf as last resort
    try:
        text = _extract_pdf_text_pymupdf(file_bytes)
        if text:
            return text, "pymupdf_fallback"
    except Exception:
        pass

    return "", "none"
