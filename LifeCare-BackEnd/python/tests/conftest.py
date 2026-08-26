"""Test harness.

Tests run against an in-memory SQLite database created from the model metadata,
so no Postgres is required. The schema is portable enough that this exercises
the real mappings; the Alembic migration is verified separately against
Postgres in CI.
"""

from __future__ import annotations

import os
from collections.abc import AsyncGenerator

os.environ.setdefault("SECRET_KEY", "test-secret-key-that-is-long-enough-000000")
os.environ.setdefault("ENV", "local")
os.environ.setdefault("MAIL_ENABLED", "false")
os.environ.setdefault("LOG_JSON", "false")
# Environment variables win over the .env file, so these pin the test run to a
# known configuration instead of inheriting whatever the developer has enabled
# locally. Tests that need Google sign-in switch it on themselves.
os.environ.setdefault("GOOGLE_OAUTH_ENABLED", "false")
os.environ.setdefault("GOOGLE_CLIENT_ID", "")
os.environ.setdefault("GOOGLE_CLIENT_SECRET", "")
os.environ.setdefault("FRONTEND_BASE_URL", "http://localhost:3000")

import pytest  # noqa: E402
from httpx import ASGITransport, AsyncClient  # noqa: E402
from sqlalchemy.ext.asyncio import (  # noqa: E402
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.security import create_access_token, hash_password  # noqa: E402
from app.db.session import get_session  # noqa: E402
from app.main import create_app  # noqa: E402
from app.models import Admin, Base, Hospital, User  # noqa: E402

TEST_DB_URL = "sqlite+aiosqlite:///:memory:"


@pytest.fixture
async def engine():
    eng = create_async_engine(TEST_DB_URL, future=True)
    async with eng.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield eng
    await eng.dispose()


@pytest.fixture
async def session_factory(engine) -> async_sessionmaker[AsyncSession]:
    return async_sessionmaker(bind=engine, class_=AsyncSession, expire_on_commit=False)


@pytest.fixture
async def client(session_factory) -> AsyncGenerator[AsyncClient, None]:
    app = create_app()

    async def _override() -> AsyncGenerator[AsyncSession, None]:
        async with session_factory() as session:
            try:
                yield session
                await session.commit()
            except Exception:
                await session.rollback()
                raise

    app.dependency_overrides[get_session] = _override

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac

    app.dependency_overrides.clear()


# -- fixtures for seeded rows -----------------------------------------
@pytest.fixture
async def admin(session_factory) -> Admin:
    async with session_factory() as session:
        row = Admin(
            email="admin@lifecare-portal.com",
            name="Root Admin",
            password=hash_password("adminpass123"),
        )
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return row


@pytest.fixture
async def hospital(session_factory) -> Hospital:
    async with session_factory() as session:
        row = Hospital(
            hospitalname="City Care",
            email="city@lifecare-portal.com",
            password=hash_password("hosppass123"),
            address="12 Main Street",
            contact="9990001111",
            ambulancecontact="9990002222",
            ventilator=2,
            oxygen=1,
            normal=5,
            a_pos=3,
            oxygenavailable=10,
        )
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return row


@pytest.fixture
async def user(session_factory) -> User:
    async with session_factory() as session:
        row = User(
            name="Asha Rao",
            email="asha@lifecare-portal.com",
            password=hash_password("userpass123"),
            contact="8880001111",
            address="4 Park Road",
            gender="female",
            age=32,
        )
        session.add(row)
        await session.commit()
        await session.refresh(row)
        return row


def auth_header(subject: int, role: str, name: str = "test") -> dict[str, str]:
    token = create_access_token(subject=subject, role=role, name=name)
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def admin_headers(admin) -> dict[str, str]:
    return auth_header(admin.id, "admin", admin.name)


@pytest.fixture
def hospital_headers(hospital) -> dict[str, str]:
    return auth_header(hospital.hospid, "hospital", hospital.hospitalname)


@pytest.fixture
def user_headers(user) -> dict[str, str]:
    return auth_header(user.userid, "user", user.name)
