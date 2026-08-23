"""Hospital and doctor-info logic - the Spring ``HospitalServiceImpl``."""

from __future__ import annotations

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError
from app.core.security import hash_password, resolve_password_update
from app.models.doctorinfo import Doctorinfo
from app.models.hospital import Hospital
from app.repositories import DoctorinfoRepository, HospitalRepository
from app.schemas.doctorinfo import DoctorinfoCreate
from app.schemas.hospital import (
    BedUpdate,
    BloodUpdate,
    HospitalCreate,
    HospitalUpdate,
    OxygenUpdate,
)

logger = logging.getLogger(__name__)


class HospitalService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.hospitals = HospitalRepository(session)
        self.doctors = DoctorinfoRepository(session)

    # -- reads ---------------------------------------------------------
    async def get_by_id(self, hospid: int) -> Hospital:
        hospital = await self.hospitals.get_for_read(hospid)
        if hospital is None:
            raise NotFoundError(f"Hospital with id '{hospid}' was not found.")
        return hospital

    async def get_by_name(self, hospitalname: str) -> Hospital:
        hospital = await self.hospitals.find_by_hospitalname(hospitalname)
        if hospital is None:
            raise NotFoundError(f"Hospital '{hospitalname}' was not found.")
        return hospital

    async def list_all(self) -> list[Hospital]:
        return await self.hospitals.list_for_read()

    # -- writes --------------------------------------------------------
    async def create(self, payload: HospitalCreate) -> Hospital:
        if await self.hospitals.find_by_email(payload.email):
            raise ConflictError(f"A hospital with email '{payload.email}' already exists.")

        data = payload.model_dump()
        data["password"] = hash_password(data["password"])
        hospital = await self.hospitals.add(Hospital(**data))
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
            existing = await self.hospitals.find_by_email(new_email)
            if existing and existing.hospid != hospid:
                raise ConflictError(f"A hospital with email '{new_email}' already exists.")

        for field, value in changes.items():
            setattr(hospital, field, value)

        await self.hospitals.flush()
        logger.info("Updated hospital id=%s (%s)", hospid, ", ".join(changes) or "password only")
        return await self.get_by_id(hospid)

    async def delete(self, hospid: int) -> str:
        hospital = await self.get_by_id(hospid)
        await self.hospitals.delete(hospital)
        logger.info("Deleted hospital id=%s", hospid)
        # Message text preserved from the Spring implementation.
        return f"User Details with Id '{hospid}' deleted successfully!!!"

    async def update_beds(self, hospid: int, payload: BedUpdate) -> None:
        await self._ensure_exists(hospid)
        await self.hospitals.update_beds(
            hospid, payload.ventilator, payload.oxygen, payload.normal
        )

    async def update_blood(self, hospid: int, payload: BloodUpdate) -> None:
        await self._ensure_exists(hospid)
        await self.hospitals.update_blood(hospid, **payload.model_dump())

    async def update_oxygen(self, hospid: int, payload: OxygenUpdate) -> None:
        await self._ensure_exists(hospid)
        await self.hospitals.update_oxygen(hospid, payload.oxygenavailable)

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
        created = await self.doctors.add(doctor)
        logger.info("Added doctor %s to hospital id=%s", created.name, hospid)
        return created

    async def list_doctors_by_hospital_id(self, hospid: int) -> list[Doctorinfo]:
        await self._ensure_exists(hospid)
        return await self.doctors.find_by_hospital_id(hospid)

    async def list_doctors_by_hospital_name(self, hospitalname: str) -> list[Doctorinfo]:
        hospital = await self.get_by_name(hospitalname)
        return await self.doctors.find_by_hospital_id(hospital.hospid)

    async def _ensure_exists(self, hospid: int) -> None:
        if await self.hospitals.get(hospid) is None:
            raise NotFoundError(f"Hospital with id '{hospid}' was not found.")
