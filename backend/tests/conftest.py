"""tests/conftest.py — Shared pytest fixtures."""
from __future__ import annotations

import pytest
from app import create_app
from app.extensions import db as _db


@pytest.fixture(scope="session")
def app():
    """Session-scoped Flask test app with in-memory SQLite."""
    application = create_app({
        "TESTING": True,
        "SQLALCHEMY_DATABASE_URI": "sqlite:///:memory:",
        "JWT_SECRET_KEY": "test-secret-key-for-pytest-only-32chars",
        "SECRET_KEY": "test-flask-secret",
        "BCRYPT_COST": 4,  # Low cost for speed in tests
        "RATELIMIT_ENABLED": False,
        "CACHE_TYPE": "SimpleCache",
        "WTF_CSRF_ENABLED": False,
        "UPLOAD_FOLDER": "/tmp/bharatseva_test_uploads",
    })
    return application


@pytest.fixture(scope="session")
def db(app):
    """Session-scoped DB, created once and torn down after all tests."""
    with app.app_context():
        _db.create_all()
        # Run seed with test app context
        from seed_data import run
        run()
        yield _db
        _db.drop_all()


@pytest.fixture
def client(app, db):
    """Per-test HTTP test client."""
    with app.test_client() as c:
        yield c


@pytest.fixture
def citizen_token(client):
    """JWT access token for demo citizen user."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "ramesh@demo.ai", "password": "Citizen@123"},
    )
    assert resp.status_code == 200, f"Login failed: {resp.get_json()}"
    return resp.get_json()["data"]["access_token"]


@pytest.fixture
def admin_token(client):
    """JWT access token for demo admin user."""
    resp = client.post(
        "/api/v1/auth/login",
        json={"email": "admin@bharatseva.ai", "password": "Admin@12345"},
    )
    assert resp.status_code == 200, f"Admin login failed: {resp.get_json()}"
    return resp.get_json()["data"]["access_token"]


@pytest.fixture
def auth_headers(citizen_token):
    return {"Authorization": f"Bearer {citizen_token}"}


@pytest.fixture
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


@pytest.fixture
def first_scheme_id(client, auth_headers):
    """Returns the ID of the first seeded scheme."""
    resp = client.get("/api/v1/schemes", headers=auth_headers)
    schemes = resp.get_json()["data"]["schemes"]
    assert schemes, "No schemes seeded"
    return schemes[0]["id"]
