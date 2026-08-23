from __future__ import annotations


async def test_liveness_is_public(client):
    resp = await client.get("/health")
    assert resp.status_code == 200
    assert resp.json()["status"] == "ok"


async def test_readiness_reports_the_database(client):
    resp = await client.get("/health/ready")
    assert resp.status_code == 200
    assert resp.json()["database"] == "ok"


async def test_request_id_header_is_echoed(client):
    resp = await client.get("/health", headers={"X-Request-ID": "abc-123"})
    assert resp.headers["X-Request-ID"] == "abc-123"


async def test_security_headers_present(client):
    resp = await client.get("/health")
    assert resp.headers["X-Content-Type-Options"] == "nosniff"
    assert resp.headers["X-Frame-Options"] == "DENY"
