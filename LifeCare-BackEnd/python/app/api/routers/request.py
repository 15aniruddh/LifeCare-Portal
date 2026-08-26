"""``RequestController`` - /request/*."""

from __future__ import annotations

from fastapi import APIRouter, Path, status
from fastapi.responses import PlainTextResponse

from app.api.deps import (
    AdminOnly,
    HospitalSelfOrAdmin,
    PrincipalDep,
    RequestServiceDep,
    UserSelfOrAdmin,
)
from app.core.errors import AuthorizationError
from app.schemas.request import RequestCreate, RequestRead

router = APIRouter(prefix="/request", tags=["request"])


@router.post(
    "/addrequest/{userId}/{hospid}",
    status_code=status.HTTP_201_CREATED,
    response_class=PlainTextResponse,
    dependencies=[UserSelfOrAdmin],
    summary="Raise a bed request",
)
async def save_request(
    payload: RequestCreate,
    service: RequestServiceDep,
    userId: int = Path(ge=1),  # noqa: N803
    hospid: int = Path(ge=1),
) -> str:
    await service.create(userId, hospid, payload)
    return "Successfully Added"


@router.get(
    "/allrequest",
    response_model=list[RequestRead],
    dependencies=[AdminOnly],
    summary="List every request",
)
async def get_all_request(service: RequestServiceDep):
    return await service.list_all()


@router.get(
    "/pendingrequest/{hospid}",
    response_model=list[RequestRead],
    dependencies=[HospitalSelfOrAdmin],
    summary="List a hospital's pending requests",
)
async def get_all_pending_request(service: RequestServiceDep, hospid: int = Path(ge=1)):
    return await service.list_pending_for_hospital(hospid)


@router.get(
    "/requestforhosp/{hospid}",
    response_model=list[RequestRead],
    dependencies=[HospitalSelfOrAdmin],
    summary="List all of a hospital's requests",
)
async def get_request_for_hospital(service: RequestServiceDep, hospid: int = Path(ge=1)):
    return await service.list_for_hospital(hospid)


@router.get(
    "/requestbyuser/{userId}",
    response_model=list[RequestRead],
    dependencies=[UserSelfOrAdmin],
    summary="List a user's requests",
)
async def get_request_by_user(service: RequestServiceDep, userId: int = Path(ge=1)):  # noqa: N803
    return await service.list_for_user(userId)


@router.put(
    "/acceptrequest/{status}/{reqid}",
    response_class=PlainTextResponse,
    summary="Accept or reject a request",
)
async def update_request_status(
    service: RequestServiceDep,
    principal: PrincipalDep,
    status: str = Path(pattern="^(?i)(accepted|rejected)$"),  # noqa: A002
    reqid: int = Path(ge=1),
) -> str:
    # Ownership is on the request row, not the path, so it is checked here:
    # only the hospital the request was raised against (or an admin) may decide.
    existing = await service.get_by_id(reqid)
    if not principal.is_admin and not (
        principal.role == "hospital" and principal.id == existing.hospital_id
    ):
        raise AuthorizationError("You may only act on requests raised against your hospital.")

    await service.set_status(reqid, status)
    return "Request Status Updated"
