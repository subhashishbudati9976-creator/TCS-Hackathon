"""
Database engine and session factory.

Currently uses SQLite for speed during development.
To switch to PostgreSQL, change DATABASE_URL in .env to a postgres:// URI —
SQLAlchemy handles the rest without code changes.
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import settings

engine = create_engine(
    settings.database_url,
    # SQLite-specific: allow multi-threaded access (needed for FastAPI)
    connect_args={"check_same_thread": False}
    if settings.database_url.startswith("sqlite")
    else {},
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    """Base class for all ORM models."""

    pass


def get_db():
    """FastAPI dependency — yields a DB session and ensures it is closed."""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db() -> None:
    """Create all tables. Called on application startup."""
    # Import all model modules here so Base knows about them before create_all
    from app.models import branch  # noqa: F401

    Base.metadata.create_all(bind=engine)
