"""Liveness and readiness probes (no equivalent in the Spring app)."""

from __future__ import annotations

import logging

from fastapi import APIRouter, Response, status
from sqlalchemy import text

from app.api.deps import SessionDep
from app.core.config import settings
from app.schemas.common import HealthStatus

logger = logging.getLogger(__name__)

router = APIRouter(tags=["health"])


@router.get("/health", response_model=HealthStatus, summary="Liveness probe")
async def health() -> HealthStatus:
    return HealthStatus(
        status="ok", version=settings.APP_VERSION, environment=settings.ENV
    )


@router.get("/health/ready", response_model=HealthStatus, summary="Readiness probe")
async def readiness(session: SessionDep, response: Response) -> HealthStatus:
    try:
        await session.execute(text("SELECT 1"))
        database = "ok"
    except Exception:
        logger.exception("Readiness check failed")
        database = "unavailable"
        response.status_code = status.HTTP_503_SERVICE_UNAVAILABLE

    return HealthStatus(
        status="ok" if database == "ok" else "degraded",
        version=settings.APP_VERSION,
        environment=settings.ENV,
        database=database,
    )
