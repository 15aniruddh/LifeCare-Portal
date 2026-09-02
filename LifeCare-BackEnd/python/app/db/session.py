"""Async engine, session factory and the FastAPI session dependency."""

from __future__ import annotations

import os
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

# One Lambda container serves one request at a time, so a pool of one is all it
# can use - and anything larger multiplies straight into the RDS connection
# limit once concurrency climbs. The connection is reused across invocations
# (Mangum keeps a single event loop), recycled before the idle timeouts that
# bite frozen containers, and pre-pinged in case it went stale anyway.
# ponytail: pool of 1 per container; put RDS Proxy in front if concurrency
# still exhausts connections.
_LAMBDA_POOL = {"pool_size": 1, "max_overflow": 0, "pool_recycle": 300}
ON_LAMBDA = bool(os.getenv("AWS_LAMBDA_FUNCTION_NAME"))

engine: AsyncEngine = create_async_engine(
    settings.sqlalchemy_url,
    echo=settings.DB_ECHO,
    pool_pre_ping=True,
    **(_LAMBDA_POOL if ON_LAMBDA else {}),
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
