from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel
from app.schemas.request import RequestRead


class UserCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    contact: str | None = Field(default=None, max_length=32)
    address: str | None = Field(default=None, max_length=500)
    gender: str | None = Field(default=None, max_length=32)
    age: int = Field(default=0, ge=0, le=150)


class UserUpdate(BaseModel):
    """Partial update - see the note on :class:`HospitalUpdate`."""

    name: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    password: str | None = Field(default=None, max_length=128)
    contact: str | None = Field(default=None, max_length=32)
    address: str | None = Field(default=None, max_length=500)
    gender: str | None = Field(default=None, max_length=32)
    age: int | None = Field(default=None, ge=0, le=150)


class UserRead(ORMModel):
    """Same field names as the Spring API, minus the password hash."""

    userid: int
    name: str
    email: str
    contact: str | None = None
    address: str | None = None
    gender: str | None = None
    age: int = 0

    requests: list[RequestRead] = Field(default_factory=list)
