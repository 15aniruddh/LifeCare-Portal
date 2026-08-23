from app.schemas.auth import CurrentPrincipal, LoginRequest, LoginResponse
from app.schemas.common import HealthStatus, Message, ORMModel
from app.schemas.doctorinfo import DoctorinfoCreate, DoctorinfoRead
from app.schemas.hospital import (
    BedUpdate,
    BloodUpdate,
    HospitalCreate,
    HospitalRead,
    HospitalUpdate,
    OxygenUpdate,
)
from app.schemas.request import RequestCreate, RequestRead
from app.schemas.user import UserCreate, UserRead, UserUpdate

__all__ = [
    "BedUpdate",
    "BloodUpdate",
    "CurrentPrincipal",
    "DoctorinfoCreate",
    "DoctorinfoRead",
    "HealthStatus",
    "HospitalCreate",
    "HospitalRead",
    "HospitalUpdate",
    "LoginRequest",
    "LoginResponse",
    "Message",
    "ORMModel",
    "OxygenUpdate",
    "RequestCreate",
    "RequestRead",
    "UserCreate",
    "UserRead",
    "UserUpdate",
]
