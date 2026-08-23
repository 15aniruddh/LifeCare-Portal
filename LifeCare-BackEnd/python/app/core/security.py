"""Password hashing and JWT issuing/validation.

Password hashes are bcrypt at cost 10, byte-for-byte compatible with the hashes
produced by Spring's ``BCryptPasswordEncoder(10)``, so rows copied over from the
MySQL database keep working without a password reset.
"""

from __future__ import annotations

import uuid
from datetime import UTC, datetime, timedelta
from typing import Any

import bcrypt
import jwt

from app.core.config import settings

# bcrypt silently ignores anything past 72 bytes; be explicit about it.
_BCRYPT_MAX_BYTES = 72
_BCRYPT_PREFIXES = ("$2a$", "$2b$", "$2x$", "$2y$")


def _to_bcrypt_bytes(password: str) -> bytes:
    return password.encode("utf-8")[:_BCRYPT_MAX_BYTES]


def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        _to_bcrypt_bytes(password), bcrypt.gensalt(rounds=settings.BCRYPT_ROUNDS)
    ).decode("utf-8")


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    """Constant-time-ish verification that never raises on malformed input."""
    if not hashed_password:
        return False
    try:
        return bcrypt.checkpw(_to_bcrypt_bytes(plain_password), hashed_password.encode("utf-8"))
    except (ValueError, TypeError):
        return False


def is_bcrypt_hash(value: str | None) -> bool:
    """True when a string already looks like a bcrypt hash.

    Update endpoints accept whatever the client sends back. The old admin
    screens round-trip the value they were given, so re-hashing blindly would
    destroy the credential. See ``resolve_password_update``.
    """
    if not value:
        return False
    return value.startswith(_BCRYPT_PREFIXES) and len(value) == 60


def resolve_password_update(submitted: str | None, current_hash: str | None) -> str | None:
    """Decide what to store when an update payload carries a password field.

    * omitted or blank -> keep the existing hash (returns ``None``)
    * already a bcrypt hash -> keep it as-is (returns ``None``)
    * anything else -> treat as a new plaintext password and hash it
    """
    if submitted is None or submitted.strip() == "":
        return None
    if is_bcrypt_hash(submitted):
        return None
    if current_hash and submitted == current_hash:
        return None
    return hash_password(submitted)


def create_access_token(
    *,
    subject: int,
    role: str,
    name: str | None = None,
    expires_delta: timedelta | None = None,
) -> str:
    now = datetime.now(UTC)
    expire = now + (expires_delta or timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES))
    payload: dict[str, Any] = {
        "sub": str(subject),
        "role": role,
        "name": name,
        "iat": int(now.timestamp()),
        "exp": int(expire.timestamp()),
        "jti": uuid.uuid4().hex,
        "iss": settings.APP_NAME,
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.JWT_ALGORITHM)


def decode_access_token(token: str) -> dict[str, Any]:
    """Raises ``jwt.PyJWTError`` subclasses on any problem."""
    return jwt.decode(
        token,
        settings.SECRET_KEY,
        algorithms=[settings.JWT_ALGORITHM],
        issuer=settings.APP_NAME,
        options={"require": ["exp", "sub", "iat"]},
    )
