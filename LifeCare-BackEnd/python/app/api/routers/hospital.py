"""``HospitalController`` - /hospital/*."""

from __future__ import annotations

from fastapi import APIRouter, Path, status
from fastapi.responses import PlainTextResponse

from app.api.deps import HospitalSelfOrAdmin, HospitalServiceDep
from app.schemas.doctorinfo import DoctorinfoCreate, DoctorinfoRead
from app.schemas.hospital import (
    BedUpdate,
    BloodUpdate,
    HospitalPublic,
    HospitalRead,
    HospitalUpdate,
    OxygenUpdate,
)

router = APIRouter(prefix="/hospital", tags=["hospital"])


# -- inventory updates -------------------------------------------------
@router.put(
    "/addbed/{hospid}",
    response_class=PlainTextResponse,
    dependencies=[HospitalSelfOrAdmin],
    summary="Set bed availability",
)
async def save_bed(
    payload: BedUpdate, service: HospitalServiceDep, hospid: int = Path(ge=1)
) -> str:
    await service.update_beds(hospid, payload)
    return "Bed Details Added"


@router.put(
    "/addblood/{hospid}",
    response_class=PlainTextResponse,
    dependencies=[HospitalSelfOrAdmin],
    summary="Set blood availability",
)
async def save_blood(
    payload: BloodUpdate, service: HospitalServiceDep, hospid: int = Path(ge=1)
) -> str:
    await service.update_blood(hospid, payload)
    # Spelling kept from the Spring response so nothing string-matching breaks.
    return "Blood Detials Added"


@router.put(
    "/addoxygen/{hospid}",
    response_class=PlainTextResponse,
    dependencies=[HospitalSelfOrAdmin],
    summary="Set oxygen availability",
)
async def save_oxygen(
    payload: OxygenUpdate, service: HospitalServiceDep, hospid: int = Path(ge=1)
) -> str:
    await service.update_oxygen(hospid, payload)
    return "Oxygen Details Added"


@router.post(
    "/adddoctorinfo/{hospid}",
    status_code=status.HTTP_201_CREATED,
    response_class=PlainTextResponse,
    dependencies=[HospitalSelfOrAdmin],
    summary="Add a doctor to a hospital",
)
async def save_doctorinfo(
    payload: DoctorinfoCreate, service: HospitalServiceDep, hospid: int = Path(ge=1)
) -> str:
    await service.add_doctor(hospid, payload)
    return "Doctor info added"


# -- directory ---------------------------------------------------------
# The React availability screens list every hospital first and then drill into
# one, so any signed-in caller needs to be able to enumerate them.
@router.get(
    "/all",
    response_model=list[HospitalPublic],
    summary="List all hospitals",
)
async def get_all_hospitals(service: HospitalServiceDep):
    return await service.list_all()


# -- lookup by hospital name -------------------------------------------
# Bed, blood and oxygen availability all live on the same row, so one route
# serves every availability screen.
@router.get(
    "/byname/{hosname}",
    response_model=HospitalPublic,
    summary="Availability by hospital name",
)
async def get_by_name(hosname: str, service: HospitalServiceDep):
    return await service.get_by_name(hosname)


# -- by id -------------------------------------------------------------
@router.get(
    "/hospitalid/{hospid}",
    response_model=HospitalRead,
    dependencies=[HospitalSelfOrAdmin],
    summary="Fetch a hospital",
)
async def get_hospital(service: HospitalServiceDep, hospid: int = Path(ge=1)):
    return await service.get_by_id(hospid)


@router.get(
    "/doctorinfo/{hospid}",
    response_model=list[DoctorinfoRead],
    summary="List a hospital's doctors by id",
)
async def get_all_doctorinfo(service: HospitalServiceDep, hospid: int = Path(ge=1)):
    return await service.list_doctors_by_hospital_id(hospid)


@router.put(
    "/updatehospital/{hospid}",
    response_model=HospitalRead,
    status_code=status.HTTP_201_CREATED,
    dependencies=[HospitalSelfOrAdmin],
    summary="Update a hospital",
)
async def update_hospital_details(
    payload: HospitalUpdate, service: HospitalServiceDep, hospid: int = Path(ge=1)
):
    return await service.update(hospid, payload)


@router.delete(
    "/deletehospital/{hospid}",
    response_class=PlainTextResponse,
    dependencies=[HospitalSelfOrAdmin],
    summary="Delete a hospital",
)
async def delete_hospital_details(service: HospitalServiceDep, hospid: int = Path(ge=1)) -> str:
    return await service.delete(hospid)

