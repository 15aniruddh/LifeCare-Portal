"""``UserController`` - /user/*."""

from __future__ import annotations

from fastapi import APIRouter, BackgroundTasks, Path, status
from fastapi.responses import PlainTextResponse

from app.api.deps import (
    AnyAuthenticated,
    HospitalServiceDep,
    UserSelfOrAdmin,
    UserServiceDep,
)
from app.schemas.doctorinfo import DoctorinfoRead
from app.schemas.user import UserCreate, UserRead, UserUpdate
from app.services.email import email_service

router = APIRouter(prefix="/user", tags=["user"])


@router.post(
    "/adduser",
    status_code=status.HTTP_201_CREATED,
    response_class=PlainTextResponse,
    summary="Register a user (public)",
)
async def save_user(
    payload: UserCreate, service: UserServiceDep, background: BackgroundTasks
) -> str:
    user = await service.create(payload)
    # Sent after the response, so a slow or broken SMTP server never delays
    # (or fails) the registration the way it did in the Spring version.
    background.add_task(email_service.send_registration_email, user.email, user.name)
    return "Successfully Added"


@router.get(
    "/doctorinfo/{hosname}",
    response_model=list[DoctorinfoRead],
    dependencies=[AnyAuthenticated],
    summary="List a hospital's doctors by hospital name",
)
async def get_all_doctorinfo(hosname: str, service: HospitalServiceDep):
    return await service.list_doctors_by_hospital_name(hosname)


@router.get(
    "/{userId}",
    response_model=UserRead,
    dependencies=[UserSelfOrAdmin],
    summary="Fetch a user",
)
async def get_user_details(service: UserServiceDep, userId: int = Path(ge=1)):  # noqa: N803
    return await service.get_by_id(userId)


@router.put(
    "/updateuser/{userId}",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[UserSelfOrAdmin],
    summary="Update a user",
)
async def update_user_details(
    payload: UserUpdate, service: UserServiceDep, userId: int = Path(ge=1)  # noqa: N803
):
    return await service.update(userId, payload)


@router.delete(
    "/deleteuser/{userId}",
    response_class=PlainTextResponse,
    dependencies=[UserSelfOrAdmin],
    summary="Delete a user",
)
async def delete_user_details(service: UserServiceDep, userId: int = Path(ge=1)) -> str:  # noqa: N803
    return await service.delete(userId)
