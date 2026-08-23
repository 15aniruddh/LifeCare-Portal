"""FastAPI dependencies: DB session, service wiring, and JWT authorisation.

The Spring app disabled CSRF and left every endpoint open. Here each route
declares who may call it:

* ``require_roles(...)``   - any principal holding one of the listed roles
* ``require_hospital_self`` - the hospital named in the path, or an admin
* ``require_user_self``     - the user named in the path, or an admin

Setting ``AUTH_ENABLED=false`` bypasses all of it and reproduces the original
open behaviour, for use only while the frontend is being migrated.
"""

from __future__ import annotations

import logging
from collections.abc import Awaitable, Callable
from typing import Annotated

import jwt
from fastapi import Depends, Path, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.errors import AuthenticationError, AuthorizationError
from app.db.session import get_session
from app.schemas.auth import CurrentPrincipal
from app.services.auth import AuthService
from app.services.hospital import HospitalService
from app.services.request import RequestService
from app.services.user import UserService

logger = logging.getLogger(__name__)

ROLE_ADMIN = "admin"
ROLE_HOSPITAL = "hospital"
ROLE_USER = "user"

# auto_error=False so a missing header becomes our own 401 payload.
bearer_scheme = HTTPBearer(auto_error=False, description="JWT issued by POST /login/userlogin")

SessionDep = Annotated[AsyncSession, Depends(get_session)]

#: Stand-in principal used when AUTH_ENABLED is false.
_ANONYMOUS_ADMIN = CurrentPrincipal(id=0, role=ROLE_ADMIN, name="auth-disabled")


# -- service providers -------------------------------------------------
def get_auth_service(session: SessionDep) -> AuthService:
    return AuthService(session)


def get_hospital_service(session: SessionDep) -> HospitalService:
    return HospitalService(session)


def get_user_service(session: SessionDep) -> UserService:
    return UserService(session)


def get_request_service(session: SessionDep) -> RequestService:
    return RequestService(session)


AuthServiceDep = Annotated[AuthService, Depends(get_auth_service)]
HospitalServiceDep = Annotated[HospitalService, Depends(get_hospital_service)]
UserServiceDep = Annotated[UserService, Depends(get_user_service)]
RequestServiceDep = Annotated[RequestService, Depends(get_request_service)]


# -- authentication ----------------------------------------------------
async def get_current_principal(
    request: Request,
    credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(bearer_scheme)],
) -> CurrentPrincipal:
    if not settings.AUTH_ENABLED:
        return _ANONYMOUS_ADMIN

    if credentials is None or not credentials.credentials:
        raise AuthenticationError("Missing bearer token.")

    try:
        claims = decode_or_raise(credentials.credentials)
    except AuthenticationError:
        raise
    principal = CurrentPrincipal(
        id=int(claims["sub"]), role=str(claims.get("role", "")), name=claims.get("name")
    )
    request.state.principal = principal
    return principal


def decode_or_raise(token: str) -> dict:
    from app.core.security import decode_access_token

    try:
        return decode_access_token(token)
    except jwt.ExpiredSignatureError as exc:
        raise AuthenticationError("Token has expired.") from exc
    except jwt.PyJWTError as exc:
        logger.info("Rejected token: %s", exc)
        raise AuthenticationError("Invalid authentication token.") from exc


PrincipalDep = Annotated[CurrentPrincipal, Depends(get_current_principal)]


# -- authorisation -----------------------------------------------------
def require_roles(*roles: str) -> Callable[[CurrentPrincipal], Awaitable[CurrentPrincipal]]:
    allowed = set(roles)

    async def _dependency(principal: PrincipalDep) -> CurrentPrincipal:
        if not settings.AUTH_ENABLED:
            return principal
        if principal.role not in allowed:
            raise AuthorizationError(
                f"This endpoint requires one of: {', '.join(sorted(allowed))}."
            )
        return principal

    return _dependency


async def require_hospital_self(
    principal: PrincipalDep,
    hospid: Annotated[int, Path(ge=1)],
) -> CurrentPrincipal:
    """Admins may act on any hospital; a hospital only on itself."""
    if not settings.AUTH_ENABLED or principal.is_admin:
        return principal
    if principal.role == ROLE_HOSPITAL and principal.id == hospid:
        return principal
    raise AuthorizationError("You may only manage your own hospital.")


async def require_user_self(
    principal: PrincipalDep,
    userId: Annotated[int, Path(ge=1)],  # noqa: N803 - path name kept from the Spring API
) -> CurrentPrincipal:
    """Admins may act on any user; a user only on themselves."""
    if not settings.AUTH_ENABLED or principal.is_admin:
        return principal
    if principal.role == ROLE_USER and principal.id == userId:
        return principal
    raise AuthorizationError("You may only manage your own account.")


async def require_user_self_lower(
    principal: PrincipalDep,
    userid: Annotated[int, Path(ge=1)],
) -> CurrentPrincipal:
    """Same as :func:`require_user_self` for routes spelling the path ``userid``."""
    if not settings.AUTH_ENABLED or principal.is_admin:
        return principal
    if principal.role == ROLE_USER and principal.id == userid:
        return principal
    raise AuthorizationError("You may only manage your own account.")


AdminOnly = Depends(require_roles(ROLE_ADMIN))
AnyAuthenticated = Depends(require_roles(ROLE_ADMIN, ROLE_HOSPITAL, ROLE_USER))
HospitalOrAdmin = Depends(require_roles(ROLE_ADMIN, ROLE_HOSPITAL))
HospitalSelfOrAdmin = Depends(require_hospital_self)
UserSelfOrAdmin = Depends(require_user_self)
UserSelfOrAdminLower = Depends(require_user_self_lower)
