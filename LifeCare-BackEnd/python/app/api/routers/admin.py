"""``AdminController`` - /admin/*. Admin token required."""

from __future__ import annotations

from fastapi import APIRouter, status
from fastapi.responses import PlainTextResponse

from app.api.deps import AdminOnly, HospitalServiceDep, UserServiceDep
from app.schemas.hospital import HospitalCreate, HospitalRead
from app.schemas.user import UserRead

router = APIRouter(prefix="/admin", tags=["admin"], dependencies=[AdminOnly])


@router.post(
    "/addhospital",
    status_code=status.HTTP_201_CREATED,
    response_class=PlainTextResponse,
    summary="Register a hospital",
)
async def save_hospital(payload: HospitalCreate, service: HospitalServiceDep) -> str:
    await service.create(payload)
    return "Successfully Added"


@router.get("/allhospitals", response_model=list[HospitalRead], summary="List all hospitals")
async def get_all_hospitals(service: HospitalServiceDep):
    return await service.list_all()


@router.get("/allusers", response_model=list[UserRead], summary="List all users")
async def get_all_users(service: UserServiceDep):
    return await service.list_all()
