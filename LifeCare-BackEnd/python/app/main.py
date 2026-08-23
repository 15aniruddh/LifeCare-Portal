"""Application factory - the equivalent of ``LifeCarePortalApplication``."""

from __future__ import annotations

import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from app.api.routers import admin, health, hospital, login, request, user
from app.core.config import settings
from app.core.errors import register_exception_handlers
from app.core.logging import configure_logging
from app.core.middleware import register_middleware
from app.db.session import SessionFactory, dispose_engine

logger = logging.getLogger(__name__)

DESCRIPTION = """
LifeCare Portal backend.

A migration of the original Spring Boot service to FastAPI + PostgreSQL. Every
route, path and JSON field name matches the Spring API, so the existing React
frontend needs no changes beyond sending the JWT returned by
`POST /login/userlogin` as an `Authorization: Bearer <token>` header.
""".strip()


@asynccontextmanager
async def lifespan(app: FastAPI):
    configure_logging()
    settings.validate_for_runtime()
    logger.info(
        "Starting %s v%s (env=%s, auth_enabled=%s)",
        settings.APP_NAME,
        settings.APP_VERSION,
        settings.ENV,
        settings.AUTH_ENABLED,
    )
    if not settings.AUTH_ENABLED:
        logger.warning(
            "AUTH_ENABLED is false - every endpoint is open. Do not run this way in production."
        )

    try:
        async with SessionFactory() as session:
            await session.execute(text("SELECT 1"))
        logger.info("Database connection verified")
    except Exception:
        # Log and continue: the readiness probe reports the real state, and the
        # container should not crash-loop while Postgres is still coming up.
        logger.exception("Could not reach the database at startup")

    yield

    await dispose_engine()
    logger.info("Shutdown complete")


def create_app() -> FastAPI:
    app = FastAPI(
        title=settings.APP_NAME,
        version=settings.APP_VERSION,
        description=DESCRIPTION,
        lifespan=lifespan,
        docs_url=None if settings.is_production else "/docs",
        redoc_url=None if settings.is_production else "/redoc",
        openapi_url=None if settings.is_production else "/openapi.json",
    )

    register_middleware(app)
    register_exception_handlers(app)

    app.include_router(health.router)
    app.include_router(login.router)
    app.include_router(admin.router)
    app.include_router(hospital.router)
    app.include_router(user.router)
    app.include_router(request.router)

    return app


app = create_app()


if __name__ == "__main__":  # pragma: no cover
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",  # noqa: S104 - containers bind all interfaces
        port=settings.PORT,
        reload=settings.ENV == "local",
    )
