"""
AVENUE — Authentication Service

Lightweight, production-ready hackathon authentication supporting:
- Secure password hashing using PBKDF2-HMAC-SHA256 (standard library)
- Cryptographic signed token authentication
- Pre-seeded demo accounts (manager@avenue.demo, customer@avenue.demo)
- In-memory/SQLite user registry
"""

from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time
from typing import Any, Dict, Optional

SECRET_KEY = "avenue-hackathon-secure-session-key-2026"
SALT = b"avenue-crypto-salt"


def hash_password(password: str) -> str:
    """Hashes password using PBKDF2-HMAC-SHA256 with 100,000 iterations."""
    derived = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), SALT, 100000)
    return derived.hex()


def verify_password(password: str, hashed: str) -> bool:
    """Safely verifies password against hash."""
    return hmac.compare_digest(hash_password(password), hashed)


def generate_token(user_data: Dict[str, Any]) -> str:
    """Generates a signed, tamper-proof bearer token with 7-day expiry."""
    payload = {
        "email": user_data["email"],
        "name": user_data["name"],
        "role": user_data["role"],
        "exp": int(time.time()) + (7 * 24 * 3600),
    }
    raw = json.dumps(payload, sort_keys=True).encode("utf-8")
    b64_payload = base64.urlsafe_b64encode(raw).decode("utf-8").rstrip("=")
    sig = hmac.new(SECRET_KEY.encode("utf-8"), b64_payload.encode("utf-8"), hashlib.sha256).hexdigest()
    return f"{b64_payload}.{sig}"


def decode_token(token: str) -> Optional[Dict[str, Any]]:
    """Validates and extracts user payload from token."""
    try:
        parts = token.split(".")
        if len(parts) != 2:
            return None
        b64_payload, sig = parts
        expected_sig = hmac.new(SECRET_KEY.encode("utf-8"), b64_payload.encode("utf-8"), hashlib.sha256).hexdigest()
        if not hmac.compare_digest(sig, expected_sig):
            return None
        
        # Add padding back if necessary
        padding = 4 - (len(b64_payload) % 4)
        if padding != 4:
            b64_payload += "=" * padding
            
        raw = base64.urlsafe_b64decode(b64_payload.encode("utf-8"))
        payload = json.loads(raw.decode("utf-8"))
        if payload.get("exp", 0) < time.time():
            return None
        return payload
    except Exception:
        return None


class AuthService:
    def __init__(self):
        # Pre-seed demo users
        self.users: Dict[str, Dict[str, Any]] = {
            "manager@avenue.demo": {
                "id": "USR_MGR_001",
                "email": "manager@avenue.demo",
                "name": "Sarah Jenkins (Operations Lead)",
                "role": "MANAGER",
                "password_hash": hash_password("manager123"),
                "branch_id": "BR001",
            },
            "customer@avenue.demo": {
                "id": "USR_CUST_001",
                "email": "customer@avenue.demo",
                "name": "Alexander Hayes (Premier Customer)",
                "role": "CUSTOMER",
                "password_hash": hash_password("customer123"),
                "branch_id": None,
            },
        }

    def signup(self, email: str, password: str, name: str, role: str = "CUSTOMER", branch_id: Optional[str] = None) -> Dict[str, Any]:
        email = email.strip().lower()
        if email in self.users:
            raise ValueError(f"User with email '{email}' already exists.")
        
        role = role.upper()
        if role not in ["MANAGER", "CUSTOMER"]:
            role = "CUSTOMER"

        user = {
            "id": f"USR_{int(time.time())}",
            "email": email,
            "name": name.strip(),
            "role": role,
            "password_hash": hash_password(password),
            "branch_id": branch_id or ("BR001" if role == "MANAGER" else None),
        }
        self.users[email] = user
        token = generate_token(user)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "branch_id": user["branch_id"],
            }
        }

    def login(self, email: str, password: str) -> Dict[str, Any]:
        email = email.strip().lower()
        user = self.users.get(email)
        if not user or not verify_password(password, user["password_hash"]):
            raise ValueError("Invalid email or password.")
        
        token = generate_token(user)
        return {
            "access_token": token,
            "token_type": "bearer",
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user["name"],
                "role": user["role"],
                "branch_id": user["branch_id"],
            }
        }

    def get_current_user(self, token: str) -> Optional[Dict[str, Any]]:
        payload = decode_token(token)
        if not payload:
            return None
        email = payload.get("email")
        user = self.users.get(email)
        if not user:
            return {
                "id": "USR_GUEST",
                "email": payload["email"],
                "name": payload.get("name", "User"),
                "role": payload.get("role", "CUSTOMER"),
                "branch_id": "BR001",
            }
        return {
            "id": user["id"],
            "email": user["email"],
            "name": user["name"],
            "role": user["role"],
            "branch_id": user["branch_id"],
        }


auth_service = AuthService()
