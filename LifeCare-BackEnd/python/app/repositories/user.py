from __future__ import annotations

from sqlalchemy import func, select
from sqlalchemy.orm import selectinload

from app.models.user import User
from app.repositories.base import BaseRepository


class UserRepository(BaseRepository[User]):
    model = User

    #: Eager-loads what UserRead serialises, avoiding N+1 on list endpoints.
    READ_OPTIONS = (selectinload(User.requests),)

    async def find_by_email(self, email: str) -> User | None:
        stmt = select(User).where(func.lower(User.email) == email.lower())
        return (await self.session.execute(stmt)).scalars().first()

    async def get_for_read(self, userid: int) -> User | None:
        return await self.get(userid, *self.READ_OPTIONS)

    async def list_for_read(self) -> list[User]:
        return await self.list_all(*self.READ_OPTIONS)
