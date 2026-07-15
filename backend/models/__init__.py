"""models/__init__.py — Import all models so SQLAlchemy discovers them."""
from .user import User, RefreshToken, PasswordResetToken
from .citizen_profile import CitizenProfile
from .scheme import Scheme
from .saved_scheme import SavedScheme
from .agent_log import AgentLog           # imported before tables that FK to it
from .eligibility_check import EligibilityCheck
from .citizen_goal import CitizenGoal
from .application import Application
from .document import Document
from .chat_history import ChatHistory
from .notification import Notification
from .feature_flag import FeatureFlag
from .kb_source import KbSource

__all__ = [
    "User", "RefreshToken", "PasswordResetToken",
    "CitizenProfile",
    "Scheme",
    "SavedScheme",
    "AgentLog",
    "EligibilityCheck",
    "CitizenGoal",
    "Application",
    "Document",
    "ChatHistory",
    "Notification",
    "FeatureFlag",
    "KbSource",
]
