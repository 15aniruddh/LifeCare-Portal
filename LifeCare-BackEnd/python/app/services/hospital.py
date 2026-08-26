"""Hospital and doctor-info logic - the Spring ``HospitalServiceImpl``."""

from __future__ import annotations

import logging
from typing import Any

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.core.errors import ConflictError, NotFoundError
from app.core.security import hash_password, resolve_password_update
from app.db.session import rowcount
from app.models.doctorinfo import Doctorinfo
from app.models.hospital import Hospital
from app.schemas.doctorinfo import DoctorinfoCreate
from app.schemas.hospital import (
    BedUpdate,
    BloodUpdate,
    HospitalCreate,
    HospitalUpdate,
    OxygenUpdate,
)

logger = logging.getLogger(__name__)

#: Eager-loads what HospitalRead serialises, avoiding N+1 on list endpoints.
READ_OPTIONS = (selectinload(Hospital.doctorinfos), selectinload(Hospital.requests))


async def find_by_email(session: AsyncSession, email: str) -> Hospital | None:
    """Case-insensitive address lookup, shared with :mod:`app.services.auth`."""
    stmt = select(Hospital).where(func.lower(Hospital.email) == email.lower())
    return (await session.execute(stmt)).scalars().first()


class HospitalService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # -- reads ---------------------------------------------------------
    async def get_by_id(self, hospid: int) -> Hospital:
        stmt = select(Hospital).where(Hospital.hospid == hospid).options(*READ_OPTIONS)
        hospital = (await self.session.execute(stmt)).scalars().unique().first()
        if hospital is None:
            raise NotFoundError(f"Hospital with id '{hospid}' was not found.")
        return hospital

    async def get_by_name(self, hospitalname: str) -> Hospital:
        """Name lookup used by the public availability screens.

        Hibernate's derived query was case-sensitive; this one is not, which
        only ever turns a "not found" into a hit.
        """
        stmt = (
            select(Hospital)
            .where(func.lower(Hospital.hospitalname) == hospitalname.lower())
            .options(*READ_OPTIONS)
            .order_by(Hospital.hospid)
        )
        hospital = (await self.session.execute(stmt)).scalars().unique().first()
        if hospital is None:
            raise NotFoundError(f"Hospital '{hospitalname}' was not found.")
        return hospital

    async def list_all(self) -> list[Hospital]:
        stmt = select(Hospital).order_by(Hospital.hospid).options(*READ_OPTIONS)
        return list((await self.session.execute(stmt)).scalars().unique().all())

    # -- writes --------------------------------------------------------
    async def create(self, payload: HospitalCreate) -> Hospital:
        if await find_by_email(self.session, payload.email):
            raise ConflictError(f"A hospital with email '{payload.email}' already exists.")

        data = payload.model_dump()
        data["password"] = hash_password(data["password"])
        hospital = Hospital(**data)
        self.session.add(hospital)
        await self.session.flush()
        logger.info("Created hospital %s (id=%s)", hospital.hospitalname, hospital.hospid)
        return await self.get_by_id(hospital.hospid)

    async def update(self, hospid: int, payload: HospitalUpdate) -> Hospital:
        hospital = await self.get_by_id(hospid)
        changes = payload.model_dump(exclude_unset=True)

        submitted_password = changes.pop("password", None)
        new_hash = resolve_password_update(submitted_password, hospital.password)
        if new_hash is not None:
            hospital.password = new_hash

        new_email = changes.get("email")
        if new_email and new_email.lower() != hospital.email.lower():
            existing = await find_by_email(self.session, new_email)
            if existing and existing.hospid != hospid:
                raise ConflictError(f"A hospital with email '{new_email}' already exists.")

        for field, value in changes.items():
            setattr(hospital, field, value)

        await self.session.flush()
        logger.info("Updated hospital id=%s (%s)", hospid, ", ".join(changes) or "password only")
        return await self.get_by_id(hospid)

    async def delete(self, hospid: int) -> str:
        hospital = await self.get_by_id(hospid)
        await self.session.delete(hospital)
        await self.session.flush()
        logger.info("Deleted hospital id=%s", hospid)
        # Message text preserved from the Spring implementation.
        return f"User Details with Id '{hospid}' deleted successfully!!!"

    # -- inventory (the @Modifying @Query methods) ---------------------
    async def _set_columns(self, hospid: int, values: dict[str, Any]) -> None:
        """Write availability counts straight to the row.

        The UPDATE's own rowcount reports a missing hospital, so this needs no
        SELECT to check first.
        """
        result = await self.session.execute(
            update(Hospital).where(Hospital.hospid == hospid).values(**values)
        )
        await self.session.flush()
        if not rowcount(result):
            raise NotFoundError(f"Hospital with id '{hospid}' was not found.")

    async def update_beds(self, hospid: int, payload: BedUpdate) -> None:
        await self._set_columns(hospid, payload.model_dump())

    async def update_blood(self, hospid: int, payload: BloodUpdate) -> None:
        await self._set_columns(hospid, payload.model_dump())

    async def update_oxygen(self, hospid: int, payload: OxygenUpdate) -> None:
        await self._set_columns(hospid, payload.model_dump())

    # -- doctor info ---------------------------------------------------
    async def add_doctor(self, hospid: int, payload: DoctorinfoCreate) -> Doctorinfo:
        await self._ensure_exists(hospid)
        doctor = Doctorinfo(
            name=payload.name,
            email=payload.email,
            qualification=payload.qualification,
            specialization=payload.specialization,
            hospital_id=hospid,
        )
        self.session.add(doctor)
        await self.session.flush()
        logger.info("Added doctor %s to hospital id=%s", doctor.name, hospid)
        return doctor

    async def list_doctors_by_hospital_id(self, hospid: int) -> list[Doctorinfo]:
        await self._ensure_exists(hospid)
        return await self._doctors_of(hospid)

    async def list_doctors_by_hospital_name(self, hospitalname: str) -> list[Doctorinfo]:
        hospital = await self.get_by_name(hospitalname)
        return await self._doctors_of(hospital.hospid)

    async def _doctors_of(self, hospid: int) -> list[Doctorinfo]:
        stmt = (
            select(Doctorinfo)
            .where(Doctorinfo.hospital_id == hospid)
            .order_by(Doctorinfo.doctorid)
        )
        return list((await self.session.execute(stmt)).scalars().all())

    async def _ensure_exists(self, hospid: int) -> None:
        stmt = select(Hospital.hospid).where(Hospital.hospid == hospid)
        if (await self.session.execute(stmt)).scalar_one_or_none() is None:
            raise NotFoundError(f"Hospital with id '{hospid}' was not found.")
