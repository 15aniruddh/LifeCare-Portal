from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel


class DoctorinfoCreate(BaseModel):
    name: str = Field(min_length=1, max_length=255)
    email: EmailStr | None = None
    qualification: str | None = Field(default=None, max_length=255)
    specialization: str | None = Field(default=None, max_length=255)


class DoctorinfoRead(ORMModel):
    """Matches the Spring payload: the parent hospital was @JsonIgnore'd."""

    doctorid: int
    name: str
    email: str | None = None
    qualification: str | None = None
    specialization: str | None = None
