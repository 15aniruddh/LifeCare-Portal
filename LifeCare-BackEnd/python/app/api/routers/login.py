"""``LoginController`` - POST /login/userlogin, plus Sign in with Google.

The Google routes are a browser redirect flow, not an API call:

    GET /login/google           -> 307 to Google's consent screen
    GET /login/google/callback  -> 307 back to the React app carrying the JWT

Both ends therefore answer with redirects, never JSON - a failure sends the
browser back to the app with an ``error`` instead of rendering an error page
the user cannot get out of.
"""

from __future__ import annotations

import logging
import secrets
from urllib.parse import urlencode

from fastapi import APIRouter, Request, Response, status
from fastapi.responses import RedirectResponse

from app.api.deps import AuthServiceDep
from app.core.config import settings
from app.core.errors import AppError, NotFoundError, RateLimitError
from app.core.rate_limit import SlidingWindowRateLimiter
from app.schemas.auth import LoginProviders, LoginRequest, LoginResponse
from app.services import google_oauth

logger = logging.getLogger(__name__)

#: Holds the CSRF ``state`` between the two Google hops. Short-lived, HttpOnly,
#: and Lax so it survives Google's cross-site redirect back to us.
_STATE_COOKIE = "lc_google_state"
_STATE_TTL_SECONDS = 600

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


def _frontend_redirect(**params: str) -> RedirectResponse:
    """Hand the browser back to the React callback route.

    The payload rides in the URL *fragment*: unlike a query string it is never
    sent to a server, so the token stays out of access logs, proxies and the
    Referer header of whatever the app loads next.
    """
    base = settings.FRONTEND_BASE_URL.rstrip("/")
    return RedirectResponse(
        f"{base}/login/google/callback#{urlencode(params)}",
        status_code=status.HTTP_303_SEE_OTHER,
    )


def _require_google_enabled() -> None:
    if not settings.google_oauth_ready:
        # 404 rather than 503: with no credentials configured the route is not
        # part of this deployment's surface at all.
        raise NotFoundError("Google sign-in is not configured on this server.")


@router.get(
    "/providers",
    response_model=LoginProviders,
    summary="Which sign-in methods this deployment offers",
)
async def list_providers() -> LoginProviders:
    """Lets the login page show the Google button only once it would work."""
    return LoginProviders(google=settings.google_oauth_ready)


@router.get(
    "/google",
    status_code=status.HTTP_307_TEMPORARY_REDIRECT,
    summary="Start Sign in with Google",
)
async def google_start() -> Response:
    _require_google_enabled()

    state = google_oauth.new_state()
    response = RedirectResponse(
        google_oauth.authorization_url(state), status_code=status.HTTP_307_TEMPORARY_REDIRECT
    )
    response.set_cookie(
        _STATE_COOKIE,
        state,
        max_age=_STATE_TTL_SECONDS,
        httponly=True,
        samesite="lax",
        # Google returns over https in any real deployment; over plain http on
        # localhost a Secure cookie would simply be dropped.
        secure=settings.ENV != "local",
        path="/login",
    )
    return response


@router.get(
    "/google/callback",
    status_code=status.HTTP_303_SEE_OTHER,
    summary="Where Google returns the browser after consent",
)
async def google_callback(
    request: Request,
    service: AuthServiceDep,
    code: str | None = None,
    state: str | None = None,
    error: str | None = None,
) -> Response:
    _require_google_enabled()

    def _fail(message: str) -> Response:
        response = _frontend_redirect(error=message)
        response.delete_cookie(_STATE_COOKIE, path="/login")
        return response

    if error:
        # The usual one is access_denied - they pressed Cancel on Google.
        logger.info("Google returned an error at the callback: %s", error)
        return _fail("Google sign-in was cancelled.")

    expected = request.cookies.get(_STATE_COOKIE)
    if not expected or not state or not secrets.compare_digest(state, expected):
        # Either a forged callback or a stale tab; both mean start over.
        logger.warning("Google callback arrived with a state that did not match")
        return _fail("That sign-in link has expired. Please try again.")

    if not code:
        return _fail("Google did not return a sign-in code.")

    try:
        profile = await google_oauth.exchange_code(code)
        result = await service.authenticate_google(profile)
    except AppError as exc:
        logger.info("Google sign-in failed: %s", exc.message)
        return _fail(exc.message)

    response = _frontend_redirect(
        access_token=result.access_token,
        token_type=result.token_type,
        expires_in=str(result.expires_in),
        id=str(result.id),
        name=result.name,
        role=result.role,
    )
    response.delete_cookie(_STATE_COOKIE, path="/login")
    return response
