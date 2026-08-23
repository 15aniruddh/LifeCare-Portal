from __future__ import annotations

from sqlalchemy import func, select

from app.models.admin import Admin
from app.repositories.base import BaseRepository


class AdminRepository(BaseRepository[Admin]):
    model = Admin

    async def find_by_email(self, email: str) -> Admin | None:
        stmt = select(Admin).where(func.lower(Admin.email) == email.lower())
        return (await self.session.execute(stmt)).scalars().first()
