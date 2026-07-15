# /backend/app

Application factory module. Contains `create_app()` which initialises Flask, registers all blueprints, wires up extensions (SQLAlchemy, Flask-Limiter, Flask-CORS), and attaches middleware in the correct order.

## Files (to be created in Phase 2)

- `__init__.py` — `create_app()` factory
- `extensions.py` — SQLAlchemy, Limiter, CORS instances (avoids circular imports)
- `errors.py` — Global error handler registration (400, 401, 403, 404, 422, 429, 500)
