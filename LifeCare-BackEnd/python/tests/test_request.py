from __future__ import annotations

import pytest


async def _raise_request(client, user, hospital, headers, bedtype="ventilator"):
    return await client.post(
        f"/request/addrequest/{user.userid}/{hospital.hospid}",
        json={
            "bedtype": bedtype,
            "symptoms": "breathlessness",
            "timetoarrive": 30,
            "status": "pending",
        },
        headers=headers,
    )


async def test_user_raises_a_request(client, user, hospital, user_headers):
    resp = await _raise_request(client, user, hospital, user_headers)
    assert resp.status_code == 201
    assert resp.text == "Successfully Added"

    mine = await client.get(f"/request/requestbyuser/{user.userid}", headers=user_headers)
    body = mine.json()
    assert len(body) == 1
    assert body[0]["bedtype"] == "ventilator"
    assert body[0]["status"] == "pending"
    # Spring omitted both relations from the payload; so do we.
    assert "hospital" not in body[0]
    assert "user" not in body[0]


async def test_status_defaults_to_pending(client, user, hospital, user_headers):
    resp = await client.post(
        f"/request/addrequest/{user.userid}/{hospital.hospid}",
        json={"bedtype": "normal", "symptoms": "fever", "timetoarrive": 10},
        headers=user_headers,
    )
    assert resp.status_code == 201
    mine = await client.get(f"/request/requestbyuser/{user.userid}", headers=user_headers)
    assert mine.json()[0]["status"] == "pending"


async def test_user_cannot_raise_a_request_for_someone_else(client, user, hospital, user_headers):
    resp = await client.post(
        f"/request/addrequest/{user.userid + 999}/{hospital.hospid}",
        json={"bedtype": "normal"},
        headers=user_headers,
    )
    assert resp.status_code == 403


async def test_hospital_sees_pending_and_accepts_it(
    client, user, hospital, user_headers, hospital_headers
):
    await _raise_request(client, user, hospital, user_headers)

    pending = await client.get(
        f"/request/pendingrequest/{hospital.hospid}", headers=hospital_headers
    )
    assert len(pending.json()) == 1
    reqid = pending.json()[0]["reqid"]

    before = (
        await client.get(f"/hospital/hospitalid/{hospital.hospid}", headers=hospital_headers)
    ).json()
    assert before["ventilator"] == 2

    accepted = await client.put(
        f"/request/acceptrequest/accepted/{reqid}", headers=hospital_headers
    )
    assert accepted.status_code == 200
    assert accepted.text == "Request Status Updated"

    after = (
        await client.get(f"/hospital/hospitalid/{hospital.hospid}", headers=hospital_headers)
    ).json()
    # Accepting takes one bed of the requested type out of stock.
    assert after["ventilator"] == 1

    still_pending = await client.get(
        f"/request/pendingrequest/{hospital.hospid}", headers=hospital_headers
    )
    assert still_pending.json() == []

    all_for_hosp = await client.get(
        f"/request/requestforhosp/{hospital.hospid}", headers=hospital_headers
    )
    assert all_for_hosp.json()[0]["status"] == "Accepted"


async def test_rejecting_does_not_touch_inventory(
    client, user, hospital, user_headers, hospital_headers
):
    await _raise_request(client, user, hospital, user_headers, bedtype="normal")
    reqid = (
        await client.get(f"/request/pendingrequest/{hospital.hospid}", headers=hospital_headers)
    ).json()[0]["reqid"]

    await client.put(f"/request/acceptrequest/rejected/{reqid}", headers=hospital_headers)

    hosp = (
        await client.get(f"/hospital/hospitalid/{hospital.hospid}", headers=hospital_headers)
    ).json()
    assert hosp["normal"] == 5
    all_for_hosp = await client.get(
        f"/request/requestforhosp/{hospital.hospid}", headers=hospital_headers
    )
    assert all_for_hosp.json()[0]["status"] == "Rejected"


async def test_accepting_the_last_bed_twice_is_rejected(
    client, user, hospital, user_headers, hospital_headers
):
    # Only one oxygen bed exists in the fixture.
    for _ in range(2):
        await _raise_request(client, user, hospital, user_headers, bedtype="oxygen")

    pending = (
        await client.get(f"/request/pendingrequest/{hospital.hospid}", headers=hospital_headers)
    ).json()
    first, second = pending[0]["reqid"], pending[1]["reqid"]

    assert (
        await client.put(f"/request/acceptrequest/accepted/{first}", headers=hospital_headers)
    ).status_code == 200
    # The stock is now zero, so the second approval must not push it negative.
    conflict = await client.put(
        f"/request/acceptrequest/accepted/{second}", headers=hospital_headers
    )
    assert conflict.status_code == 409

    hosp = (
        await client.get(f"/hospital/hospitalid/{hospital.hospid}", headers=hospital_headers)
    ).json()
    assert hosp["oxygen"] == 0


@pytest.mark.parametrize("bad_status", ["approved", "maybe", "deleted"])
async def test_unsupported_status_is_rejected(
    client, user, hospital, user_headers, hospital_headers, bad_status
):
    await _raise_request(client, user, hospital, user_headers)
    reqid = (
        await client.get(f"/request/pendingrequest/{hospital.hospid}", headers=hospital_headers)
    ).json()[0]["reqid"]

    resp = await client.put(
        f"/request/acceptrequest/{bad_status}/{reqid}", headers=hospital_headers
    )
    assert resp.status_code == 422


async def test_another_hospital_cannot_decide_the_request(
    client, user, hospital, user_headers, session_factory
):
    from tests.conftest import auth_header

    await _raise_request(client, user, hospital, user_headers)
    reqid = (
        await client.get(f"/request/requestbyuser/{user.userid}", headers=user_headers)
    ).json()[0]["reqid"]

    intruder = auth_header(hospital.hospid + 500, "hospital", "Rival Hospital")
    resp = await client.put(f"/request/acceptrequest/accepted/{reqid}", headers=intruder)
    assert resp.status_code == 403


async def test_admin_lists_every_request(client, user, hospital, user_headers, admin_headers):
    await _raise_request(client, user, hospital, user_headers)
    resp = await client.get("/request/allrequest", headers=admin_headers)
    assert resp.status_code == 200
    assert len(resp.json()) == 1


async def test_request_against_unknown_hospital_is_404(client, user, hospital, user_headers):
    resp = await client.post(
        f"/request/addrequest/{user.userid}/{hospital.hospid + 999}",
        json={"bedtype": "normal"},
        headers=user_headers,
    )
    assert resp.status_code == 404
