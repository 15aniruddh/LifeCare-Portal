"""Google "Sign in with Google" - the authorisation-code half of the flow.

The browser is sent to Google, comes back to ``/login/google/callback`` with a
one-time ``code``, and this module trades that code for the user's identity.
The exchange is a direct server-to-server call to Google, authenticated with
the client secret, so the ``id_token`` that comes back does not need its
signature checked - Google's own guidance for this flow. ``aud``/``iss`` are
still checked, because those cost nothing and catch a misconfigured client.

Nothing here touches the database; ``AuthService.authenticate_google`` turns the
profile into a LifeCare session.
"""

from __future__ import annotations

import logging
import secrets
from dataclasses import dataclass
from urllib.parse import urlencode

import httpx
import jwt

from app.core.config import settings
from app.core.errors import AuthenticationError

logger = logging.getLogger(__name__)

AUTHORIZATION_ENDPOINT = "https://accounts.google.com/o/oauth2/v2/auth"
TOKEN_ENDPOINT = "https://oauth2.googleapis.com/token"

# Google mints tokens under either spelling of the issuer.
_VALID_ISSUERS = ("https://accounts.google.com", "accounts.google.com")

# openid gets us the id_token; the other two carry the name and address we
# store on the account. No Gmail, Drive or contacts access is requested.
_SCOPES = "openid email profile"

_TIMEOUT = httpx.Timeout(10.0)


@dataclass(frozen=True)
class GoogleProfile:
    """The parts of a verified Google identity that LifeCare uses."""

    subject: str
    email: str
    name: str
    email_verified: bool


def new_state() -> str:
    """Opaque CSRF token, echoed by Google and matched against our cookie."""
    return secrets.token_urlsafe(32)


def authorization_url(state: str) -> str:
    """Where to send the browser to start the flow."""
    params = {
        "client_id": settings.GOOGLE_CLIENT_ID,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "response_type": "code",
        "scope": _SCOPES,
        "state": state,
        # Ask for the account chooser every time; without it a shared browser
        # silently signs whoever Google remembers back in.
        "prompt": "select_account",
    }
    return f"{AUTHORIZATION_ENDPOINT}?{urlencode(params)}"


async def exchange_code(code: str) -> GoogleProfile:
    """Trade the one-time code for the signed-in Google identity."""
    payload = {
        "code": code,
        "client_id": settings.GOOGLE_CLIENT_ID,
        "client_secret": settings.GOOGLE_CLIENT_SECRET,
        "redirect_uri": settings.GOOGLE_REDIRECT_URI,
        "grant_type": "authorization_code",
    }

    try:
        async with httpx.AsyncClient(timeout=_TIMEOUT) as client:
            response = await client.post(TOKEN_ENDPOINT, data=payload)
    except httpx.HTTPError as exc:
        logger.warning("Google token exchange failed to complete: %s", exc)
        raise AuthenticationError("Could not reach Google to complete sign-in.") from exc

    if response.status_code != 200:
        # Google puts the reason in the body; it is safe to log but never to
        # show, since it can name the client id.
        logger.warning(
            "Google rejected the token exchange (%s): %s", response.status_code, response.text
        )
        raise AuthenticationError("Google did not accept this sign-in attempt.")

    id_token = response.json().get("id_token")
    if not id_token:
        logger.warning("Google token response carried no id_token")
        raise AuthenticationError("Google did not return an identity token.")

    return _profile_from_id_token(id_token)


def _profile_from_id_token(id_token: str) -> GoogleProfile:
    try:
        claims = jwt.decode(
            id_token,
            # Received over TLS straight from Google's token endpoint, so the
            # signature adds nothing here. The rest still has to be checked:
            # switching verify_signature off turns every other verify_* off
            # too unless it is named, which would wave through a token minted
            # for a different client.
            options={
                "verify_signature": False,
                "verify_aud": True,
                "verify_iss": True,
                "verify_exp": True,
                "require": ["sub", "aud", "iss", "exp"],
            },
            audience=settings.GOOGLE_CLIENT_ID,
            issuer=list(_VALID_ISSUERS),
        )
    except jwt.PyJWTError as exc:
        logger.warning("Google id_token failed validation: %s", exc)
        raise AuthenticationError("Google returned an identity token we could not read.") from exc

    email = (claims.get("email") or "").strip()
    if not email:
        raise AuthenticationError("This Google account has no email address to sign in with.")

    if not claims.get("email_verified", False):
        # An unverified address would let someone claim a LifeCare account by
        # registering the same address with Google.
        raise AuthenticationError("Verify your email address with Google, then try again.")

    return GoogleProfile(
        subject=str(claims["sub"]),
        email=email,
        # Fall back to the local part so the account always has a display name.
        name=(claims.get("name") or "").strip() or email.split("@")[0],
        email_verified=True,
    )
