"""Login - the Spring ``LoginServiceImpl``.

Same three-table lookup (admin, then hospital, then user) and the same
``{id, name, role}`` result, with three fixes:

* the admin password is bcrypt-verified instead of compared in plaintext;
* a failed login returns 401, not a 500 from an escaping RuntimeException;
* the response says only "invalid credentials", so it cannot be used to
  enumerate which email addresses exist.

``authenticate_google`` is the second way in: same three tables, matched on a
Google-verified address instead of a password.
"""

from __future__ import annotations

import logging
import secrets

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AuthenticationError
from app.core.security import create_access_token, hash_password, verify_password
from app.models.user import User
from app.repositories import AdminRepository, HospitalRepository, UserRepository
from app.schemas.auth import LoginResponse
from app.services.google_oauth import GoogleProfile

logger = logging.getLogger(__name__)

_INVALID = "Invalid email or password."


class AuthService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.admins = AdminRepository(session)
        self.hospitals = HospitalRepository(session)
        self.users = UserRepository(session)

    async def authenticate(self, email: str, password: str) -> LoginResponse:
        resolved = await self._resolve(email, password)
        if resolved is None:
            logger.info("Failed login attempt for %s", email)
            raise AuthenticationError(_INVALID)

        subject, name, role = resolved
        logger.info("Login succeeded for %s as %s (id=%s)", email, role, subject)
        return self._issue(subject, name, role)

    async def authenticate_google(self, profile: GoogleProfile) -> LoginResponse:
        """Sign in whoever owns a Google-verified address.

        The address is the link between the two systems: an admin, hospital or
        user already holding it signs in under that existing role, keeping its
        id and its data. An address nobody holds registers a patient account,
        which is what a first-time Google sign-in is.
        """
        existing = await self._resolve_by_email(profile.email)
        if existing is not None:
            subject, name, role = existing
            logger.info(
                "Google login for %s matched an existing %s (id=%s)", profile.email, role, subject
            )
            return self._issue(subject, name, role)

        if not settings.GOOGLE_AUTO_CREATE_USERS:
            logger.info("Google login refused for unregistered address %s", profile.email)
            raise AuthenticationError(
                "No LifeCare account uses this Google address. Sign up first."
            )

        user = await self.users.add(
            User(
                name=profile.name,
                email=profile.email,
                # Google is the only way into this account. Store an unguessable
                # hash rather than a blank, so the password form can never match.
                password=hash_password(secrets.token_urlsafe(32)),
                age=0,
            )
        )
        logger.info("Google login registered a new user %s (id=%s)", user.email, user.userid)
        return self._issue(user.userid, user.name, "user")

    def _issue(self, subject: int, name: str, role: str) -> LoginResponse:
        token = create_access_token(subject=subject, role=role, name=name)
        return LoginResponse(
            id=subject,
            name=name,
            role=role,
            access_token=token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
        )

    async def _resolve_by_email(self, email: str) -> tuple[int, str, str] | None:
        """The same three-table lookup, without a password to check."""
        admin = await self.admins.find_by_email(email)
        if admin:
            return admin.id, admin.name or "admin", "admin"

        hospital = await self.hospitals.find_by_email(email)
        if hospital:
            return hospital.hospid, hospital.hospitalname, "hospital"

        user = await self.users.find_by_email(email)
        if user:
            return user.userid, user.name, "user"

        return None

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
