from __future__ import annotations

from sqlalchemy import func, select, update
from sqlalchemy.orm import selectinload

from app.models.hospital import Hospital
from app.repositories.base import BaseRepository, rowcount


class HospitalRepository(BaseRepository[Hospital]):
    model = Hospital

    READ_OPTIONS = (selectinload(Hospital.doctorinfos), selectinload(Hospital.requests))

    async def find_by_email(self, email: str) -> Hospital | None:
        stmt = select(Hospital).where(func.lower(Hospital.email) == email.lower())
        return (await self.session.execute(stmt)).scalars().first()

    async def find_by_hospitalname(self, hospitalname: str) -> Hospital | None:
        """Name lookup used by the public availability screens.

        Hibernate's derived query was case-sensitive; this one is not, which
        only ever turns a "not found" into a hit.
        """
        stmt = (
            select(Hospital)
            .where(func.lower(Hospital.hospitalname) == hospitalname.lower())
            .options(*self.READ_OPTIONS)
            .order_by(Hospital.hospid)
        )
        return (await self.session.execute(stmt)).scalars().unique().first()

    async def get_for_read(self, hospid: int) -> Hospital | None:
        return await self.get(hospid, *self.READ_OPTIONS)

    async def list_for_read(self) -> list[Hospital]:
        return await self.list_all(*self.READ_OPTIONS)

    # -- bulk column updates (the @Modifying @Query methods) ------------
    async def update_beds(self, hospid: int, ventilator: int, oxygen: int, normal: int) -> int:
        result = await self.session.execute(
            update(Hospital)
            .where(Hospital.hospid == hospid)
            .values(ventilator=ventilator, oxygen=oxygen, normal=normal)
        )
        await self.session.flush()
        return rowcount(result)

    async def update_blood(self, hospid: int, **counts: int) -> int:
        allowed = {"a_pos", "a_neg", "b_pos", "b_neg", "ab_pos", "ab_neg", "o_pos", "o_neg"}
        values = {k: v for k, v in counts.items() if k in allowed}
        result = await self.session.execute(
            update(Hospital).where(Hospital.hospid == hospid).values(**values)
        )
        await self.session.flush()
        return rowcount(result)

    async def update_oxygen(self, hospid: int, oxygenavailable: int) -> int:
        result = await self.session.execute(
            update(Hospital)
            .where(Hospital.hospid == hospid)
            .values(oxygenavailable=oxygenavailable)
        )
        await self.session.flush()
        return rowcount(result)

    async def decrement_bed(self, hospid: int, column: str) -> int:
        """Atomically take one bed of ``column`` out of stock.

        Guarded by ``> 0`` so concurrent approvals cannot drive the count
        negative - the Spring version read, decremented and wrote back, which
        could over-allocate under load. Returns rows affected (0 == none left).
        """
        if column not in {"ventilator", "oxygen", "normal"}:
            raise ValueError(f"Unknown bed column: {column}")
        col = getattr(Hospital, column)
        result = await self.session.execute(
            update(Hospital)
            .where(Hospital.hospid == hospid, col > 0)
            .values({col: col - 1})
        )
        await self.session.flush()
        return rowcount(result)
