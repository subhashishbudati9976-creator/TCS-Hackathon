"""
Branch service — business logic for branch operations.

Business logic lives here, NOT in route handlers.
Routes call service functions; service functions call ML modules or ORM.
"""

from __future__ import annotations

from sqlalchemy.orm import Session

from app.models.branch import Branch as BranchModel
from app.schemas.schemas import BranchCreate, BranchRead


def get_all_branches(db: Session) -> list[BranchModel]:
    return db.query(BranchModel).all()


def get_branch_by_id(db: Session, branch_id: int) -> BranchModel | None:
    return db.query(BranchModel).filter(BranchModel.id == branch_id).first()


def create_branch(db: Session, data: BranchCreate) -> BranchModel:
    branch = BranchModel(**data.model_dump())
    db.add(branch)
    db.commit()
    db.refresh(branch)
    return branch
