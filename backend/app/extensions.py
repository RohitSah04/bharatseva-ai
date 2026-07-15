"""
extensions.py — Shared extension instances.
Import these into route modules and services to avoid circular imports.
All are initialised (bound to the app) in create_app().
"""
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from flask_caching import Cache
from flask_cors import CORS

db = SQLAlchemy()
jwt = JWTManager()
limiter = Limiter(key_func=get_remote_address)
cache = Cache()
cors = CORS()
