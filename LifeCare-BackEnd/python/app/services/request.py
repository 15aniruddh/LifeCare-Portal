"""Bed-request logic - the Spring ``RequestServiceImpl``."""

from __future__ import annotations

import logging

from sqlalchemy import func, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.errors import ConflictError, NotFoundError, ValidationError
from app.db.session import rowcount
from app.models.hospital import Hospital
from app.models.request import Request
from app.models.user import User
from app.schemas.request import RequestCreate

logger = logging.getLogger(__name__)

STATUS_PENDING = "pending"
STATUS_ACCEPTED = "Accepted"
STATUS_REJECTED = "Rejected"

#: bedtype values that name a hospital inventory column of the same name,
#: matched case-insensitively as in Java.
BED_COLUMNS = {"ventilator", "oxygen", "normal"}


class RequestService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    # -- reads ---------------------------------------------------------
    async def list_all(self) -> list[Request]:
        return await self._list()

    async def list_pending_for_hospital(self, hospid: int) -> list[Request]:
        await self._ensure_hospital(hospid)
        # The JPQL query filtered on the exact lowercase literal 'pending';
        # matching case-insensitively here catches other casings too.
        return await self._list(
            Request.hospital_id == hospid, func.lower(Request.status) == STATUS_PENDING
        )

    async def list_for_hospital(self, hospid: int) -> list[Request]:
        await self._ensure_hospital(hospid)
        return await self._list(Request.hospital_id == hospid)

    async def list_for_user(self, userid: int) -> list[Request]:
        await self._ensure_user(userid)
        return await self._list(Request.user_id == userid)

    async def get_by_id(self, reqid: int) -> Request:
        stmt = select(Request).where(Request.reqid == reqid)
        request = (await self.session.execute(stmt)).scalars().first()
        if request is None:
            raise NotFoundError(f"Request with id '{reqid}' was not found.")
        return request

    async def _list(self, *where) -> list[Request]:
        stmt = select(Request).where(*where).order_by(Request.reqid)
        return list((await self.session.execute(stmt)).scalars().all())

    # -- writes --------------------------------------------------------
    async def create(self, userid: int, hospid: int, payload: RequestCreate) -> Request:
        await self._ensure_hospital(hospid)
        await self._ensure_user(userid)

        request = Request(
            bedtype=payload.bedtype,
            symptoms=payload.symptoms,
            timetoarrive=payload.timetoarrive,
            status=payload.status or STATUS_PENDING,
            hospital_id=hospid,
            user_id=userid,
        )
        self.session.add(request)
        await self.session.flush()
        logger.info(
            "Created request id=%s (user=%s hospital=%s bedtype=%s)",
            request.reqid,
            userid,
            hospid,
            request.bedtype,
        )
        return request

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
            await self._write_status(reqid, STATUS_REJECTED)
            logger.info("Rejected request id=%s", reqid)
            return await self.get_by_id(reqid)

        if (request.status or "").lower() == STATUS_ACCEPTED.lower():
            raise ConflictError(f"Request '{reqid}' has already been accepted.")

        column = (request.bedtype or "").strip().lower()
        if column in BED_COLUMNS and request.hospital_id is not None:
            if not await self._take_bed(request.hospital_id, column):
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

        await self._write_status(reqid, STATUS_ACCEPTED)
        logger.info("Accepted request id=%s", reqid)
        return await self.get_by_id(reqid)

    async def _write_status(self, reqid: int, status: str) -> None:
        await self.session.execute(
            update(Request).where(Request.reqid == reqid).values(status=status)
        )
        await self.session.flush()

    async def _take_bed(self, hospid: int, column: str) -> bool:
        """Atomically take one bed of ``column`` out of stock.

        Guarded by ``> 0`` so concurrent approvals cannot drive the count
        negative - the Spring version read, decremented and wrote back, which
        could over-allocate under load. False means none were left.
        """
        col = getattr(Hospital, column)
        result = await self.session.execute(
            update(Hospital).where(Hospital.hospid == hospid, col > 0).values({col: col - 1})
        )
        await self.session.flush()
        return bool(rowcount(result))

    # -- existence checks ----------------------------------------------
    async def _ensure_hospital(self, hospid: int) -> None:
        stmt = select(Hospital.hospid).where(Hospital.hospid == hospid)
        if (await self.session.execute(stmt)).scalar_one_or_none() is None:
            raise NotFoundError(f"Hospital with id '{hospid}' was not found.")

    async def _ensure_user(self, userid: int) -> None:
        stmt = select(User.userid).where(User.userid == userid)
        if (await self.session.execute(stmt)).scalar_one_or_none() is None:
            raise NotFoundError(f"User with id '{userid}' was not found.")
