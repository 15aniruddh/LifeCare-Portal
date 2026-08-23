"""Cross-cutting HTTP middleware: request ids, access logs, security headers.

These are plain ASGI middleware rather than ``BaseHTTPMiddleware`` subclasses.
BaseHTTPMiddleware runs the rest of the app inside an anyio task group, so any
exception that escapes it is re-raised wrapped in an ``ExceptionGroup`` - which
stops the registered per-type exception handlers from matching, and turns a
"database unreachable" into a generic 500 instead of a 503.
"""

from __future__ import annotations

import logging
import time
import uuid

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.datastructures import MutableHeaders
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.core.config import settings
from app.core.logging import request_id_ctx

logger = logging.getLogger("app.access")

REQUEST_ID_HEADER = "X-Request-ID"


class RequestContextMiddleware:
    """Attaches a request id, logs the call, and reports its duration."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        request_id = _header(scope, b"x-request-id") or uuid.uuid4().hex

        # Readable by handlers as request.state.request_id.
        scope.setdefault("state", {})["request_id"] = request_id
        token = request_id_ctx.set(request_id)
        started = time.perf_counter()
        status_code = 500

        async def send_wrapper(message: Message) -> None:
            nonlocal status_code
            if message["type"] == "http.response.start":
                status_code = message["status"]
                headers = MutableHeaders(scope=message)
                headers[REQUEST_ID_HEADER] = request_id
                headers["X-Response-Time-ms"] = f"{(time.perf_counter() - started) * 1000:.1f}"
            await send(message)

        method = scope.get("method", "-")
        path = scope.get("path", "-")
        try:
            await self.app(scope, receive, send_wrapper)
        except Exception:
            logger.exception(
                "%s %s failed after %.1fms",
                method,
                path,
                (time.perf_counter() - started) * 1000,
            )
            raise
        else:
            logger.info(
                "%s %s -> %s (%.1fms)",
                method,
                path,
                status_code,
                (time.perf_counter() - started) * 1000,
            )
        finally:
            request_id_ctx.reset(token)


class SecurityHeadersMiddleware:
    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http":
            await self.app(scope, receive, send)
            return

        async def send_wrapper(message: Message) -> None:
            if message["type"] == "http.response.start":
                headers = MutableHeaders(scope=message)
                headers.setdefault("X-Content-Type-Options", "nosniff")
                headers.setdefault("X-Frame-Options", "DENY")
                headers.setdefault("Referrer-Policy", "no-referrer")
                headers.setdefault("Cache-Control", "no-store")
                if settings.is_production:
                    headers.setdefault(
                        "Strict-Transport-Security", "max-age=31536000; includeSubDomains"
                    )
            await send(message)

        await self.app(scope, receive, send_wrapper)


def _header(scope: Scope, name: bytes) -> str | None:
    for key, value in scope.get("headers") or []:
        if key == name:
            return value.decode("latin-1")
    return None


def register_middleware(app: FastAPI) -> None:
    # Added last == outermost, so register CORS after the others.
    app.add_middleware(SecurityHeadersMiddleware)
    app.add_middleware(RequestContextMiddleware)

    allow_all = "*" in settings.CORS_ORIGINS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.CORS_ORIGINS,
        # Credentials cannot be combined with a wildcard origin.
        allow_credentials=not allow_all,
        allow_methods=["HEAD", "GET", "PUT", "POST", "DELETE", "PATCH", "OPTIONS"],
        allow_headers=["*"],
        expose_headers=[REQUEST_ID_HEADER],
        max_age=600,
    )
