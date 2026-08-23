from __future__ import annotations

from pydantic import BaseModel, ConfigDict


class ORMModel(BaseModel):
    """Base for response models read straight off SQLAlchemy instances."""

    model_config = ConfigDict(from_attributes=True)


class Message(BaseModel):
    message: str


class HealthStatus(BaseModel):
    status: str
    version: str
    environment: str
    database: str | None = None
