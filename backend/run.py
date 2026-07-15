"""run.py — Development entry point. Production uses gunicorn directly.

IMPORTANT: load_dotenv() MUST be called before any application import.
Python evaluates Config class-body os.environ.get() calls at *import time*,
so the .env file must be loaded before `from app import create_app` triggers
the config module parse. Calling load_dotenv() here, at the very top before
any local import, is the only reliable way to ensure .env values are present
when Config class attributes are frozen.
"""
import os
from pathlib import Path

# ── Load .env using an absolute path anchored to this file's location ────────
# Path(__file__).resolve().parent is always /…/backend regardless of cwd.
# Passing the explicit path means load_dotenv() finds the file even when the
# process is started from the project root or any other directory.
_HERE = Path(__file__).resolve().parent  # /…/backend

from dotenv import load_dotenv
load_dotenv(_HERE / ".env", override=False)  # load before ANY local import

# Do NOT os.chdir() here — the Flask debug reloader re-execs run.py and
# would resolve the script path relative to the new cwd, causing "can't open
# file" on macOS/Linux. The SQLite path is made absolute inside create_app()
# in app/__init__.py using _BACKEND_DIR, so no cwd change is needed.

from app import create_app  # noqa: E402 — must be after load_dotenv

app = create_app()

if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    debug = os.environ.get("FLASK_DEBUG", "1") == "1"
    app.run(host="0.0.0.0", port=port, debug=debug)
