"""
SQLAlchemy ORM models for Branch entities.

This is a placeholder — columns and relationships will be extended
as the data model is finalized in later steps.
"""

from sqlalchemy import Float, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.db import Base


class Branch(Base):
    """Represents a bank branch."""

    __tablename__ = "branches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    branch_code: Mapped[str] = mapped_column(String(20), unique=True, index=True)
    name: Mapped[str] = mapped_column(String(100))
    location: Mapped[str] = mapped_column(String(200))
    total_counters: Mapped[int] = mapped_column(Integer, default=5)
    latitude: Mapped[float] = mapped_column(Float, nullable=True)
    longitude: Mapped[float] = mapped_column(Float, nullable=True)
