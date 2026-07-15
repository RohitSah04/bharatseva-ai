"""utils/response.py — Standard JSON response envelope helper.

Every endpoint uses success_response() or error_response().
Envelope shape per API_CONTRACT.md:
  {
    "success": true | false,
    "data":    ...,
    "error":   null | {"code": "...", "message": "..."},
    "meta":    {"request_id": "...", "api_version": "v1", "degraded": false}
  }
"""
from __future__ import annotations

from flask import g, jsonify, make_response


def _meta(degraded: bool = False) -> dict:
    return {
        "request_id": getattr(g, "request_id", ""),
        "api_version": "v1",
        "degraded": degraded,
    }


def success_response(data: object, status: int = 200, degraded: bool = False):
    body = {
        "success": True,
        "data": data,
        "error": None,
        "meta": _meta(degraded),
    }
    resp = make_response(jsonify(body), status)
    if degraded:
        resp.headers["X-Degraded"] = "true"
    return resp


def error_response(status: int, code: str, message: str):
    body = {
        "success": False,
        "data": None,
        "error": {"code": code, "message": message},
        "meta": _meta(),
    }
    return make_response(jsonify(body), status)
