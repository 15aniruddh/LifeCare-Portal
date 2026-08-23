"""Bed-request logic - the Spring ``RequestServiceImpl``."""

from __future__ import annotations

import logging

from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.models.request import Request
from app.repositories import HospitalRepository, RequestRepository, UserRepository
from app.schemas.request import RequestCreate

logger = logging.getLogger(__name__)

STATUS_PENDING = "pending"
STATUS_ACCEPTED = "Accepted"
STATUS_REJECTED = "Rejected"

#: bedtype value -> hospital inventory column, matched case-insensitively as in Java.
BEDTYPE_COLUMNS = {"ventilator": "ventilator", "oxygen": "oxygen", "normal": "normal"}


class RequestService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session
        self.requests = RequestRepository(session)
        self.hospitals = HospitalRepository(session)
        self.users = UserRepository(session)

    # -- reads ---------------------------------------------------------
    async def list_all(self) -> list[Request]:
        return await self.requests.list_all()

    async def list_pending_for_hospital(self, hospid: int) -> list[Request]:
        await self._ensure_hospital(hospid)
        return await self.requests.find_pending_by_hospital_id(hospid)

    async def list_for_hospital(self, hospid: int) -> list[Request]:
        await self._ensure_hospital(hospid)
        return await self.requests.find_by_hospital_id(hospid)

    async def list_for_user(self, userid: int) -> list[Request]:
        if await self.users.get(userid) is None:
            raise NotFoundError(f"User with id '{userid}' was not found.")
        return await self.requests.find_by_user_id(userid)

    async def get_by_id(self, reqid: int) -> Request:
        request = await self.requests.get(reqid)
        if request is None:
            raise NotFoundError(f"Request with id '{reqid}' was not found.")
        return request

    # -- writes --------------------------------------------------------
    async def create(self, userid: int, hospid: int, payload: RequestCreate) -> Request:
        await self._ensure_hospital(hospid)
        if await self.users.get(userid) is None:
            raise NotFoundError(f"User with id '{userid}' was not found.")

        request = Request(
            bedtype=payload.bedtype,
            symptoms=payload.symptoms,
            timetoarrive=payload.timetoarrive,
            status=payload.status or STATUS_PENDING,
            hospital_id=hospid,
            user_id=userid,
        )
        created = await self.requests.add(request)
        logger.info(
            "Created request id=%s (user=%s hospital=%s bedtype=%s)",
            created.reqid,
            userid,
            hospid,
            created.bedtype,
        )
        return created

    async def set_status(self, reqid: int, status: str) -> Request:
        """Accept or reject a pending request.

        Accepting also takes one bed of the requested type out of the hospital's
        stock, exactly as the Spring version did - but the decrement is a single
        guarded UPDATE, so two simultaneous approvals cannot hand out the same
        last bed or push the count below zero.
        """
        normalised = status.strip().lower()
        if normalised not in ("accepted", "rejected"):
            raise ValidationError(
                f"Unsupported status '{status}'. Use 'accepted' or 'rejected'."
            )

        request = await self.get_by_id(reqid)

        if normalised == "rejected":
            await self.requests.set_status(reqid, STATUS_REJECTED)
            logger.info("Rejected request id=%s", reqid)
            return await self.get_by_id(reqid)

        if (request.status or "").lower() == STATUS_ACCEPTED.lower():
            raise ConflictError(f"Request '{reqid}' has already been accepted.")

        column = BEDTYPE_COLUMNS.get((request.bedtype or "").strip().lower())
        if column is not None and request.hospital_id is not None:
            taken = await self.hospitals.decrement_bed(request.hospital_id, column)
            if taken == 0:
                raise ConflictError(
                    f"No '{request.bedtype}' bed is currently available at this hospital."
                )
        else:
            # Unknown bed types were silently ignored by the Java code; keep that
            # behaviour but make it visible in the logs.
            logger.warning(
                "Request id=%s has bedtype %r with no matching inventory column",
                reqid,
                request.bedtype,
            )

        await self.requests.set_status(reqid, STATUS_ACCEPTED)
        logger.info("Accepted request id=%s", reqid)
        return await self.get_by_id(reqid)

    async def delete(self, reqid: int) -> None:
        request = await self.get_by_id(reqid)
        await self.requests.delete(request)

    async def _ensure_hospital(self, hospid: int) -> None:
        if await self.hospitals.get(hospid) is None:
            raise NotFoundError(f"Hospital with id '{hospid}' was not found.")
