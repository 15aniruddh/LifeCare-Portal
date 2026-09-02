"""The Lambda entry point is wiring, so this checks the wiring end to end:
a real Function URL event in, a real HTTP response out.
"""

from __future__ import annotations

import json


def _event(path: str) -> dict:
    return {
        "version": "2.0",
        "rawPath": path,
        "rawQueryString": "",
        "headers": {"host": "example.lambda-url.eu-west-1.on.aws"},
        "requestContext": {
            "http": {"method": "GET", "path": path, "sourceIp": "127.0.0.1"},
            "stage": "$default",
        },
        "isBase64Encoded": False,
    }


def test_handler_serves_a_route():
    from app.lambda_handler import handler

    response = handler(_event("/health"), None)

    assert response["statusCode"] == 200
    assert json.loads(response["body"])["status"] == "ok"


def test_handler_serves_a_route_twice():
    """lifespan="off" means no per-invocation startup/shutdown; if that ever
    flips back on, the second call hits a disposed engine and this fails."""
    from app.lambda_handler import handler

    assert handler(_event("/health"), None)["statusCode"] == 200
    assert handler(_event("/health"), None)["statusCode"] == 200
