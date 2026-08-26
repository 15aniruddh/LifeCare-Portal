"""User logic - the Spring ``UserServiceImpl``."""

from __future__ import annotations

import logging

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ConflictError, NotFoundError
from app.core.security import hash_password, resolve_password_update
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate

logger = logging.getLogger(__name__)

#: Eager-loads what UserRead serialises, avoiding N+1 on list endpoints.
READ_OPTIONS = (selectinload(User.requests),)


async def find_by_email(session: AsyncSession, email: str) -> User | None:
    """Case-insensitive address lookup, shared with :mod:`app.services.auth`."""
    stmt = select(User).where(func.lower(User.email) == email.lower())
    return (await session.execute(stmt)).scalars().first()


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, userid: int) -> User:
        stmt = select(User).where(User.userid == userid).options(*READ_OPTIONS)
        user = (await self.session.execute(stmt)).scalars().unique().first()
        if user is None:
            raise NotFoundError(f"User with id '{userid}' was not found.")
        return user

    async def list_all(self) -> list[User]:
        stmt = select(User).order_by(User.userid).options(*READ_OPTIONS)
        return list((await self.session.execute(stmt)).scalars().unique().all())

    async def create(self, payload: UserCreate) -> User:
        if await find_by_email(self.session, payload.email):
            raise ConflictError(f"A user with email '{payload.email}' already exists.")

        data = payload.model_dump()
        data["password"] = hash_password(data["password"])
        user = User(**data)
        self.session.add(user)
        await self.session.flush()
        logger.info("Registered user %s (id=%s)", user.email, user.userid)
        return await self.get_by_id(user.userid)

    async def update(self, userid: int, payload: UserUpdate) -> User:
        user = await self.get_by_id(userid)
        changes = payload.model_dump(exclude_unset=True)

        submitted_password = changes.pop("password", None)
        new_hash = resolve_password_update(submitted_password, user.password)
        if new_hash is not None:
            user.password = new_hash

        new_email = changes.get("email")
        if new_email and new_email.lower() != user.email.lower():
            existing = await find_by_email(self.session, new_email)
            if existing and existing.userid != userid:
                raise ConflictError(f"A user with email '{new_email}' already exists.")

        for field, value in changes.items():
            setattr(user, field, value)

        await self.session.flush()
        logger.info("Updated user id=%s", userid)
        return await self.get_by_id(userid)

    async def delete(self, userid: int) -> str:
        user = await self.get_by_id(userid)
        await self.session.delete(user)
        await self.session.flush()
        logger.info("Deleted user id=%s", userid)
        # Message text preserved from the Spring implementation.
        return f"User Details with Id '{userid}' Deleted Successfully !!!"
