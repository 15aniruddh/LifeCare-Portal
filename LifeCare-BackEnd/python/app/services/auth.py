"""Login - the Spring ``LoginServiceImpl``.

Same three-table lookup (admin, then hospital, then user) and the same
``{id, name, role}`` result, with three fixes:

* the admin password is bcrypt-verified instead of compared in plaintext;
* a failed login returns 401, not a 500 from an escaping RuntimeException;
* the response says only "invalid credentials", so it cannot be used to
  enumerate which email addresses exist.
"""

from __future__ import annotations

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AuthenticationError
from app.core.security import create_access_token, verify_password
from app.repositories import AdminRepository, HospitalRepository, UserRepository
from app.schemas.auth import LoginResponse

logger = logging.getLogger(__name__)

_INVALID = "Invalid email or password."


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.admins = AdminRepository(session)
        self.hospitals = HospitalRepository(session)
        self.users = UserRepository(session)

    async def authenticate(self, email: str, password: str) -> LoginResponse:
        resolved = await self._resolve(email, password)
        if resolved is None:
            logger.info("Failed login attempt for %s", email)
            raise AuthenticationError(_INVALID)

        subject, name, role = resolved
        token = create_access_token(subject=subject, role=role, name=name)
        logger.info("Login succeeded for %s as %s (id=%s)", email, role, subject)
        return LoginResponse(
            id=subject,
            name=name,
            role=role,
            access_token=token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def _resolve(self, email: str, password: str) -> tuple[int, str, str] | None:
        admin = await self.admins.find_by_email(email)
        if admin and verify_password(password, admin.password):
            return admin.id, admin.name or "admin", "admin"

        hospital = await self.hospitals.find_by_email(email)
        if hospital and verify_password(password, hospital.password):
            return hospital.hospid, hospital.hospitalname, "hospital"

        user = await self.users.find_by_email(email)
        if user and verify_password(password, user.password):
            return user.userid, user.name, "user"

        return None
