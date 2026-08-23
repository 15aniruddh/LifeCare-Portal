from __future__ import annotations

from sqlalchemy import func, select, update

from app.models.request import Request
from app.repositories.base import BaseRepository, rowcount

#: The JPQL query filtered on the exact lowercase literal 'pending'; matching
#: case-insensitively here catches rows written with other casings too.
PENDING_STATUS = "pending"


class RequestRepository(BaseRepository[Request]):
    model = Request

    async def find_by_hospital_id(self, hospital_id: int) -> list[Request]:
        stmt = (
            select(Request)
            .where(Request.hospital_id == hospital_id)
            .order_by(Request.reqid)
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def find_by_user_id(self, user_id: int) -> list[Request]:
        stmt = select(Request).where(Request.user_id == user_id).order_by(Request.reqid)
        return list((await self.session.execute(stmt)).scalars().all())

    async def find_pending_by_hospital_id(self, hospital_id: int) -> list[Request]:
        stmt = (
            select(Request)
            .where(
                Request.hospital_id == hospital_id,
                func.lower(Request.status) == PENDING_STATUS,
            )
            .order_by(Request.reqid)
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def set_status(self, reqid: int, status: str) -> int:
        result = await self.session.execute(
            update(Request).where(Request.reqid == reqid).values(status=status)
        )
        await self.session.flush()
        return rowcount(result)
