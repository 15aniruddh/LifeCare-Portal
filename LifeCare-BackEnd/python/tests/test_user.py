from __future__ import annotations


async def test_registration_is_public_and_hashes_the_password(client):
    resp = await client.post(
        "/user/adduser",
        json={
            "name": "Ravi Kumar",
            "email": "ravi@lifecare-portal.com",
            "password": "ravi-secret-99",
            "contact": "9001112222",
            "address": "77 Lake View",
            "gender": "male",
            "age": 41,
        },
    )
    assert resp.status_code == 201
    assert resp.text == "Successfully Added"

    login = await client.post(
        "/login/userlogin", json={"email": "ravi@lifecare-portal.com", "password": "ravi-secret-99"}
    )
    assert login.status_code == 200
    assert login.json()["role"] == "user"


async def test_duplicate_registration_conflicts(client, user):
    resp = await client.post(
        "/user/adduser",
        json={"name": "Impostor", "email": user.email, "password": "another-secret-1"},
    )
    assert resp.status_code == 409


async def test_weak_password_is_rejected(client):
    resp = await client.post(
        "/user/adduser",
        json={"name": "Tiny", "email": "tiny@lifecare-portal.com", "password": "123"},
    )
    assert resp.status_code == 422


async def test_user_reads_own_profile_without_password(client, user, user_headers):
    resp = await client.get(f"/user/{user.userid}", headers=user_headers)
    assert resp.status_code == 200
    body = resp.json()
    assert body["email"] == user.email
    assert body["age"] == 32
    assert "password" not in body
    assert body["requests"] == []


async def test_user_cannot_read_another_profile(client, user, user_headers):
    resp = await client.get(f"/user/{user.userid + 999}", headers=user_headers)
    assert resp.status_code == 403


async def test_admin_lists_and_updates_users(client, user, admin_headers):
    listing = await client.get("/admin/allusers", headers=admin_headers)
    assert any(u["userid"] == user.userid for u in listing.json())

    updated = await client.put(
        f"/user/updateuser/{user.userid}",
        json={"address": "88 New Lane", "age": 33},
        headers=admin_headers,
    )
    assert updated.status_code == 201
    assert updated.json()["address"] == "88 New Lane"
    assert updated.json()["name"] == "Asha Rao"


async def test_blank_password_on_update_keeps_the_old_one(client, user, admin_headers):
    resp = await client.put(
        f"/user/updateuser/{user.userid}",
        json={"name": "Asha R.", "password": ""},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    login = await client.post(
        "/login/userlogin", json={"email": user.email, "password": "userpass123"}
    )
    assert login.status_code == 200


async def test_delete_user(client, user, admin_headers):
    userid = user.userid
    resp = await client.delete(f"/user/deleteuser/{userid}", headers=admin_headers)
    assert resp.text == f"User Details with Id '{userid}' Deleted Successfully !!!"
    assert (await client.get(f"/user/{userid}", headers=admin_headers)).status_code == 404
