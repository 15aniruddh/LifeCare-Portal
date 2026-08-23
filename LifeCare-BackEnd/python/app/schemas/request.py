from __future__ import annotations

from pydantic import BaseModel, Field

from app.schemas.common import ORMModel


class RequestCreate(BaseModel):
    bedtype: str | None = Field(default=None, max_length=64)
    symptoms: str | None = Field(default=None, max_length=1000)
    timetoarrive: int = Field(default=0, ge=0)
    # The frontend posts "pending"; the service defaults to it when absent.
    status: str | None = Field(default=None, max_length=32)


class RequestRead(ORMModel):
    """Matches the Spring payload.

    ``hospital`` carried @JsonBackReference and ``user`` carried @JsonIgnore, so
    neither was ever serialised. Kept identical so the React app is unaffected.
    """

    reqid: int
    bedtype: str | None = None
    symptoms: str | None = None
    timetoarrive: int = 0
    status: str | None = None
