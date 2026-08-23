from __future__ import annotations

from app.core.security import (
    hash_password,
    is_bcrypt_hash,
    resolve_password_update,
    verify_password,
)


async def test_admin_can_log_in(client, admin):
    resp = await client.post(
        "/login/userlogin", json={"email": admin.email, "password": "adminpass123"}
    )
    assert resp.status_code == 200
    body = resp.json()
    assert body["id"] == admin.id
    assert body["name"] == "Root Admin"
    assert body["role"] == "admin"
    assert body["access_token"]


async def test_hospital_and_user_roles_resolve(client, hospital, user):
    hosp = await client.post(
        "/login/userlogin", json={"email": hospital.email, "password": "hosppass123"}
    )
    assert hosp.json()["role"] == "hospital"
    assert hosp.json()["id"] == hospital.hospid

    usr = await client.post(
        "/login/userlogin", json={"email": user.email, "password": "userpass123"}
    )
    assert usr.json()["role"] == "user"
    assert usr.json()["id"] == user.userid


async def test_wrong_password_is_401_not_500(client, user):
    resp = await client.post(
        "/login/userlogin", json={"email": user.email, "password": "nope-not-it"}
    )
    assert resp.status_code == 401
    # Must not reveal whether the address exists.
    assert "Invalid email or password" in resp.json()["message"]


async def test_unknown_email_is_401(client):
    resp = await client.post(
        "/login/userlogin", json={"email": "ghost@lifecare-portal.com", "password": "whatever"}
    )
    assert resp.status_code == 401


async def test_protected_endpoint_requires_token(client):
    assert (await client.get("/admin/allusers")).status_code == 401


async def test_role_is_enforced(client, user_headers):
    resp = await client.get("/admin/allusers", headers=user_headers)
    assert resp.status_code == 403


def test_bcrypt_roundtrip():
    hashed = hash_password("correct horse battery staple")
    assert is_bcrypt_hash(hashed)
    assert verify_password("correct horse battery staple", hashed)
    assert not verify_password("wrong", hashed)
    assert not verify_password("anything", None)


def test_spring_generated_hash_still_verifies():
    # bcrypt cost 10, $2a$ prefix - exactly what BCryptPasswordEncoder(10) emits.
    spring_hash = "$2a$10$s6FQoN7jHhBuafqqtjhRROhZrNA50Q9svte.zSWp.7LShMNsqWkxG"
    assert verify_password("spring-boot-password", spring_hash)


def test_password_update_rules():
    current = hash_password("original-password")
    # Blank / omitted -> unchanged
    assert resolve_password_update(None, current) is None
    assert resolve_password_update("   ", current) is None
    # An existing hash echoed back by a form -> unchanged
    assert resolve_password_update(current, current) is None
    # A genuinely new password -> hashed
    updated = resolve_password_update("brand-new-password", current)
    assert updated is not None
    assert verify_password("brand-new-password", updated)
