"""
AVENUE — Authentication Routes

POST /api/auth/signup
POST /api/auth/login
GET /api/auth/me
"""

from __future__ import annotations

from typing import Any, Dict, Optional
from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, EmailStr, Field

from app.services.auth_service import auth_service

router = APIRouter(prefix="/api/auth", tags=["auth"])


class SignupRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., min_length=6, description="Password (min 6 chars)")
    name: str = Field(..., description="Full name")
    role: str = Field(default="CUSTOMER", description="Role: MANAGER or CUSTOMER")
    branch_id: Optional[str] = Field(default=None, description="Optional branch assignment")


class LoginRequest(BaseModel):
    email: str = Field(..., description="User email address")
    password: str = Field(..., description="Password")


def get_current_user_from_header(authorization: Optional[str] = Header(None)) -> Dict[str, Any]:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing or invalid authentication token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    token = authorization.split(" ")[1]
    user = auth_service.get_current_user(token)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Session expired or invalid token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


@router.post("/signup", summary="Register a new user account")
async def signup(payload: SignupRequest) -> Dict[str, Any]:
    try:
        return auth_service.signup(
            email=payload.email,
            password=payload.password,
            name=payload.name,
            role=payload.role,
            branch_id=payload.branch_id
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/login", summary="Authenticate with email and password")
async def login(payload: LoginRequest) -> Dict[str, Any]:
    try:
        return auth_service.login(email=payload.email, password=payload.password)
    except ValueError as e:
        raise HTTPException(status_code=401, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/me", summary="Get currently authenticated user details")
async def get_me(user: Dict[str, Any] = Depends(get_current_user_from_header)) -> Dict[str, Any]:
    return {"user": user}
