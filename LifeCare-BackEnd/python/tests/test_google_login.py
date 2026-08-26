"""Sign in with Google.

The exchange with Google is stubbed out - what is under test is everything on
our side of it: the switch that hides the routes, the CSRF state, how a profile
maps onto the three account tables, and that failures come back as a redirect
the React app can read rather than an error page.
"""

from __future__ import annotations

import pytest
from httpx import AsyncClient

from app.api.routers import login as login_router
from app.core.config import settings
from app.core.errors import AuthenticationError
from app.services import google_oauth
from app.services.google_oauth import GoogleProfile

CALLBACK = "/login/google/callback"


def _in_an_hour() -> int:
    """Google's id_tokens are short-lived; ours need an exp to be accepted."""
    from datetime import UTC, datetime, timedelta

    return int((datetime.now(UTC) + timedelta(hours=1)).timestamp())


@pytest.fixture
def google_enabled(monkeypatch):
    """Turn the feature on with throwaway credentials."""
    monkeypatch.setattr(settings, "GOOGLE_OAUTH_ENABLED", True)
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_ID", "test-client-id.apps.googleusercontent.com")
    monkeypatch.setattr(settings, "GOOGLE_CLIENT_SECRET", "test-client-secret")
    monkeypatch.setattr(settings, "GOOGLE_AUTO_CREATE_USERS", True)
    return settings


@pytest.fixture
def exchanges_as(monkeypatch):
    """Make the code-for-identity exchange return whoever the test wants."""

    def _install(email: str, name: str = "Google Person") -> None:
        async def _fake(code: str) -> GoogleProfile:
            assert code == "test-auth-code"
            return GoogleProfile(subject="123", email=email, name=name, email_verified=True)

        monkeypatch.setattr(login_router.google_oauth, "exchange_code", _fake)

    return _install


async def _start(client: AsyncClient) -> str:
    """Run the first hop and return the state cookie it set."""
    resp = await client.get("/login/google")
    assert resp.status_code == 307
    assert resp.headers["location"].startswith(google_oauth.AUTHORIZATION_ENDPOINT)
    state = client.cookies.get(login_router._STATE_COOKIE)
    assert state
    return state


def _fragment(location: str) -> dict[str, str]:
    from urllib.parse import parse_qsl, urlsplit

    return dict(parse_qsl(urlsplit(location).fragment))


# -- the switch --------------------------------------------------------
async def test_providers_reports_google_off_by_default(client):
    body = (await client.get("/login/providers")).json()
    assert body == {"google": False}


async def test_providers_reports_google_on_when_configured(client, google_enabled):
    assert (await client.get("/login/providers")).json()["google"] is True


async def test_routes_are_absent_until_configured(client):
    assert (await client.get("/login/google")).status_code == 404
    assert (await client.get(f"{CALLBACK}?code=x&state=y")).status_code == 404


async def test_start_sends_the_client_id_and_scopes(client, google_enabled):
    resp = await client.get("/login/google")
    location = resp.headers["location"]
    assert settings.GOOGLE_CLIENT_ID in location
    assert "scope=openid+email+profile" in location
    assert "response_type=code" in location
    # The secret must never leave the server.
    assert settings.GOOGLE_CLIENT_SECRET not in location


# -- CSRF state --------------------------------------------------------
async def test_callback_rejects_a_mismatched_state(client, google_enabled):
    await _start(client)
    resp = await client.get(f"{CALLBACK}?code=test-auth-code&state=not-the-one")
    assert resp.status_code == 303
    assert "expired" in _fragment(resp.headers["location"])["error"]


async def test_callback_rejects_a_missing_cookie(client, google_enabled):
    resp = await client.get(f"{CALLBACK}?code=test-auth-code&state=anything")
    assert resp.status_code == 303
    assert "error" in _fragment(resp.headers["location"])


async def test_cancelling_at_google_comes_back_as_an_error(client, google_enabled):
    await _start(client)
    resp = await client.get(f"{CALLBACK}?error=access_denied")
    assert resp.status_code == 303
    assert "cancelled" in _fragment(resp.headers["location"])["error"]


# -- who gets signed in ------------------------------------------------
async def test_known_user_keeps_its_own_id_and_role(client, google_enabled, exchanges_as, user):
    exchanges_as(user.email)
    state = await _start(client)

    resp = await client.get(f"{CALLBACK}?code=test-auth-code&state={state}")
    assert resp.status_code == 303

    params = _fragment(resp.headers["location"])
    assert params["role"] == "user"
    assert params["id"] == str(user.userid)
    assert params["access_token"]
    assert resp.headers["location"].startswith(settings.FRONTEND_BASE_URL)


async def test_a_hospital_address_signs_in_as_that_hospital(
    client, google_enabled, exchanges_as, hospital
):
    exchanges_as(hospital.email)
    state = await _start(client)

    params = _fragment(
        (await client.get(f"{CALLBACK}?code=test-auth-code&state={state}")).headers["location"]
    )
    assert params["role"] == "hospital"
    assert params["id"] == str(hospital.hospid)


async def test_an_admin_address_signs_in_as_admin(client, google_enabled, exchanges_as, admin):
    exchanges_as(admin.email)
    state = await _start(client)

    params = _fragment(
        (await client.get(f"{CALLBACK}?code=test-auth-code&state={state}")).headers["location"]
    )
    assert params["role"] == "admin"
    assert params["id"] == str(admin.id)


async def test_an_unknown_address_registers_a_patient(client, google_enabled, exchanges_as):
    exchanges_as("brand.new@example.com", name="Brand New")
    state = await _start(client)

    params = _fragment(
        (await client.get(f"{CALLBACK}?code=test-auth-code&state={state}")).headers["location"]
    )
    assert params["role"] == "user"
    assert params["name"] == "Brand New"

    # The account is real: its token opens its own record.
    headers = {"Authorization": f"Bearer {params['access_token']}"}
    created = await client.get(f"/user/{params['id']}", headers=headers)
    assert created.status_code == 200
    assert created.json()["email"] == "brand.new@example.com"


async def test_the_created_account_has_no_usable_password(
    client, google_enabled, exchanges_as, monkeypatch
):
    exchanges_as("nopassword@example.com")
    state = await _start(client)
    await client.get(f"{CALLBACK}?code=test-auth-code&state={state}")

    for attempt in ("", " ", "password", "google"):
        resp = await client.post(
            "/login/userlogin", json={"email": "nopassword@example.com", "password": attempt or "x"}
        )
        assert resp.status_code == 401


async def test_auto_create_can_be_turned_off(client, google_enabled, exchanges_as, monkeypatch):
    monkeypatch.setattr(settings, "GOOGLE_AUTO_CREATE_USERS", False)
    exchanges_as("stranger@example.com")
    state = await _start(client)

    params = _fragment(
        (await client.get(f"{CALLBACK}?code=test-auth-code&state={state}")).headers["location"]
    )
    assert "error" in params
    assert "Sign up first" in params["error"]


async def test_a_failed_exchange_redirects_instead_of_500(
    client, google_enabled, monkeypatch
):
    async def _boom(code: str) -> GoogleProfile:
        raise AuthenticationError("Google did not accept this sign-in attempt.")

    monkeypatch.setattr(login_router.google_oauth, "exchange_code", _boom)
    state = await _start(client)

    resp = await client.get(f"{CALLBACK}?code=test-auth-code&state={state}")
    assert resp.status_code == 303
    assert "did not accept" in _fragment(resp.headers["location"])["error"]


# -- id_token handling -------------------------------------------------
def test_an_unverified_google_address_is_refused(google_enabled):
    import jwt

    token = jwt.encode(
        {
            "sub": "1",
            "exp": _in_an_hour(),
            "aud": settings.GOOGLE_CLIENT_ID,
            "iss": "https://accounts.google.com",
            "email": "unverified@example.com",
            "email_verified": False,
        },
        "irrelevant",
        algorithm="HS256",
    )
    with pytest.raises(AuthenticationError, match="Verify your email"):
        google_oauth._profile_from_id_token(token)


def test_a_token_for_another_client_is_refused(google_enabled):
    import jwt

    token = jwt.encode(
        {
            "sub": "1",
            "exp": _in_an_hour(),
            "aud": "someone-elses-client-id",
            "iss": "https://accounts.google.com",
            "email": "someone@example.com",
            "email_verified": True,
        },
        "irrelevant",
        algorithm="HS256",
    )
    with pytest.raises(AuthenticationError):
        google_oauth._profile_from_id_token(token)


def test_a_missing_name_falls_back_to_the_local_part(google_enabled):
    import jwt

    token = jwt.encode(
        {
            "sub": "1",
            "exp": _in_an_hour(),
            "aud": settings.GOOGLE_CLIENT_ID,
            "iss": "https://accounts.google.com",
            "email": "asha.rao@example.com",
            "email_verified": True,
        },
        "irrelevant",
        algorithm="HS256",
    )
    assert google_oauth._profile_from_id_token(token).name == "asha.rao"
