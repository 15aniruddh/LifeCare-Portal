"""``LoginController`` - POST /login/userlogin."""

from __future__ import annotations

from fastapi import APIRouter, Request, status

from app.api.deps import AuthServiceDep
from app.core.config import settings
from app.core.errors import RateLimitError
from app.core.rate_limit import SlidingWindowRateLimiter
from app.schemas.auth import LoginRequest, LoginResponse

router = APIRouter(prefix="/login", tags=["login"])

_limiter = SlidingWindowRateLimiter(
    settings.LOGIN_RATE_LIMIT_ATTEMPTS, settings.LOGIN_RATE_LIMIT_WINDOW_SECONDS
)


def _client_key(request: Request) -> str:
    forwarded = request.headers.get("x-forwarded-for")
    if forwarded:
        return forwarded.split(",")[0].strip()
    return request.client.host if request.client else "unknown"


@router.post(
    "/userlogin",
    response_model=LoginResponse,
    status_code=status.HTTP_200_OK,
    summary="Authenticate an admin, hospital or user",
)
async def authenticate_user(
    payload: LoginRequest, request: Request, service: AuthServiceDep
) -> LoginResponse:
    key = _client_key(request)
    if not _limiter.allow(key):
        raise RateLimitError("Too many login attempts. Please try again shortly.")

    result = await service.authenticate(payload.email, payload.password)
    _limiter.reset(key)
    return result
