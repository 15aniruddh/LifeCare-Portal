from __future__ import annotations

from sqlalchemy import select

from app.models.doctorinfo import Doctorinfo
from app.repositories.base import BaseRepository


class DoctorinfoRepository(BaseRepository[Doctorinfo]):
    model = Doctorinfo

    async def find_by_hospital_id(self, hospital_id: int) -> list[Doctorinfo]:
        stmt = (
            select(Doctorinfo)
            .where(Doctorinfo.hospital_id == hospital_id)
            .order_by(Doctorinfo.doctorid)
        )
        return list((await self.session.execute(stmt)).scalars().all())
