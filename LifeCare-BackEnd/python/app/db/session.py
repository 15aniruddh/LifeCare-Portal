"""Async engine, session factory and the FastAPI session dependency."""

from __future__ import annotations

from collections.abc import AsyncGenerator
from typing import Any, cast

from sqlalchemy import CursorResult, Result
from sqlalchemy.ext.asyncio import (
    AsyncEngine,
    AsyncSession,
    async_sessionmaker,
    create_async_engine,
)

from app.core.config import settings

engine: AsyncEngine = create_async_engine(
    settings.sqlalchemy_url,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
)

SessionFactory: async_sessionmaker[AsyncSession] = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False,
)


async def get_session() -> AsyncGenerator[AsyncSession, None]:
    """One transaction per request.

    Mirrors Spring's ``@Transactional`` service boundary: the handler either
    completes and commits, or raises and rolls back.
    """
    async with SessionFactory() as session:
        try:
            yield session
            await session.commit()
        except Exception:
            await session.rollback()
            raise


async def dispose_engine() -> None:
    await engine.dispose()


def rowcount(result: Result[Any]) -> int:
    """Rows touched by an UPDATE/DELETE.

    ``Result`` only exposes ``rowcount`` on the cursor-backed subclass, which is
    always what a DML statement returns.
    """
    return int(cast(CursorResult[Any], result).rowcount or 0)
