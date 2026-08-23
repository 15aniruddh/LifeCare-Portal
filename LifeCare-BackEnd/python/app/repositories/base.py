"""Generic async repository - the equivalent of Spring Data's JpaRepository."""

from __future__ import annotations

from typing import Any, Generic, TypeVar, cast

from sqlalchemy import CursorResult, Result, func, select
from sqlalchemy import delete as sa_delete
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm.strategy_options import _AbstractLoad

from app.db.base import Base

ModelT = TypeVar("ModelT", bound=Base)


def rowcount(result: Result[Any]) -> int:
    """Rows touched by an UPDATE/DELETE.

    ``Result`` only exposes ``rowcount`` on the cursor-backed subclass, which is
    always what a DML statement returns.
    """
    return int(cast(CursorResult[Any], result).rowcount or 0)


class BaseRepository(Generic[ModelT]):
    model: type[ModelT]

    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # -- reads ---------------------------------------------------------
    @property
    def _pk_column(self) -> Any:
        return self.model.__mapper__.primary_key[0]

    async def get(self, pk: int, *options: _AbstractLoad) -> ModelT | None:
        stmt = select(self.model).where(self._pk_column == pk)
        if options:
            stmt = stmt.options(*options)
        return (await self.session.execute(stmt)).scalars().unique().first()

    async def list_all(self, *options: _AbstractLoad) -> list[ModelT]:
        stmt = select(self.model).order_by(self._pk_column)
        if options:
            stmt = stmt.options(*options)
        return list((await self.session.execute(stmt)).scalars().unique().all())

    async def count(self) -> int:
        stmt = select(func.count()).select_from(self.model)
        return int((await self.session.execute(stmt)).scalar_one())

    # -- writes --------------------------------------------------------
    async def add(self, instance: ModelT) -> ModelT:
        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)
        return instance

    async def flush(self) -> None:
        await self.session.flush()

    async def delete(self, instance: ModelT) -> None:
        await self.session.delete(instance)
        await self.session.flush()

    async def delete_by_id(self, pk: int) -> int:
        result = await self.session.execute(sa_delete(self.model).where(self._pk_column == pk))
        await self.session.flush()
        return rowcount(result)
