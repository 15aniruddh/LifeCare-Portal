from __future__ import annotations


async def test_admin_creates_hospital_and_password_is_hashed(client, admin_headers):
    payload = {
        "hospitalname": "Sunrise Hospital",
        "email": "sunrise@lifecare-portal.com",
        "password": "sunrise-secret-1",
        "address": "9 Hill Road",
        "contact": "7770001111",
        "ambulancecontact": "7770002222",
        "ventilator": 3,
        "oxygen": 4,
        "normal": 10,
    }
    resp = await client.post("/admin/addhospital", json=payload, headers=admin_headers)
    assert resp.status_code == 201
    assert resp.text == "Successfully Added"

    listing = await client.get("/admin/allhospitals", headers=admin_headers)
    created = next(h for h in listing.json() if h["email"] == "sunrise@lifecare-portal.com")
    # The hash is never serialised.
    assert "password" not in created
    assert created["ventilator"] == 3

    # The new hospital can log in, so the password was stored as a usable hash.
    login = await client.post(
        "/login/userlogin",
        json={"email": "sunrise@lifecare-portal.com", "password": "sunrise-secret-1"},
    )
    assert login.status_code == 200
    assert login.json()["role"] == "hospital"


async def test_duplicate_hospital_email_conflicts(client, admin_headers, hospital):
    resp = await client.post(
        "/admin/addhospital",
        json={
            "hospitalname": "Copycat",
            "email": hospital.email,
            "password": "another-secret-1",
        },
        headers=admin_headers,
    )
    assert resp.status_code == 409


async def test_bed_blood_and_oxygen_updates(client, hospital, hospital_headers):
    hospid = hospital.hospid

    beds = await client.put(
        f"/hospital/addbed/{hospid}",
        json={"ventilator": 7, "oxygen": 8, "normal": 9},
        headers=hospital_headers,
    )
    assert beds.status_code == 200
    assert beds.text == "Bed Details Added"

    blood = await client.put(
        f"/hospital/addblood/{hospid}",
        json={
            "a_pos": 1, "a_neg": 2, "b_pos": 3, "b_neg": 4,
            "ab_pos": 5, "ab_neg": 6, "o_pos": 7, "o_neg": 8,
        },
        headers=hospital_headers,
    )
    assert blood.text == "Blood Detials Added"

    oxygen = await client.put(
        f"/hospital/addoxygen/{hospid}", json={"oxygenavailable": 42}, headers=hospital_headers
    )
    assert oxygen.text == "Oxygen Details Added"

    fetched = (await client.get(f"/hospital/{hospid}", headers=hospital_headers)).json()
    assert (fetched["ventilator"], fetched["oxygen"], fetched["normal"]) == (7, 8, 9)
    assert fetched["ab_neg"] == 6
    assert fetched["oxygenavailable"] == 42


async def test_view_by_name_returns_hospital(client, hospital, user_headers):
    resp = await client.get(f"/hospital/viewblood/{hospital.hospitalname}", headers=user_headers)
    assert resp.status_code == 200
    assert resp.json()["hospid"] == hospital.hospid
    assert resp.json()["a_pos"] == 3


async def test_unknown_hospital_name_is_404(client, user_headers):
    resp = await client.get("/hospital/viewbed/Nowhere%20General", headers=user_headers)
    assert resp.status_code == 404


async def test_doctor_can_be_added_and_listed(client, hospital, hospital_headers, user_headers):
    hospid = hospital.hospid
    created = await client.post(
        f"/hospital/adddoctorinfo/{hospid}",
        json={
            "name": "Dr Neha Iyer",
            "email": "neha@lifecare-portal.com",
            "qualification": "MBBS, MD",
            "specialization": "Pulmonology",
        },
        headers=hospital_headers,
    )
    assert created.status_code == 201
    assert created.text == "Doctor info added"

    by_id = await client.get(f"/hospital/doctorinfo/{hospid}", headers=hospital_headers)
    assert [d["name"] for d in by_id.json()] == ["Dr Neha Iyer"]

    by_name = await client.get(
        f"/user/doctorinfo/{hospital.hospitalname}", headers=user_headers
    )
    assert by_name.json()[0]["specialization"] == "Pulmonology"
    # The parent hospital was @JsonIgnore'd in Spring; keep it out.
    assert "hospital" not in by_name.json()[0]


async def test_hospital_cannot_touch_another_hospital(client, hospital, hospital_headers):
    other = hospital.hospid + 999
    resp = await client.put(
        f"/hospital/addbed/{other}",
        json={"ventilator": 1, "oxygen": 1, "normal": 1},
        headers=hospital_headers,
    )
    assert resp.status_code == 403


async def test_partial_update_preserves_untouched_fields(client, hospital, admin_headers):
    hospid = hospital.hospid
    resp = await client.put(
        f"/hospital/updatehospital/{hospid}",
        json={"address": "New Address 55"},
        headers=admin_headers,
    )
    assert resp.status_code == 201
    body = resp.json()
    assert body["address"] == "New Address 55"
    # Everything omitted from the body survives.
    assert body["hospitalname"] == "City Care"
    assert body["ambulancecontact"] == "9990002222"

    # And the password still works.
    login = await client.post(
        "/login/userlogin", json={"email": hospital.email, "password": "hosppass123"}
    )
    assert login.status_code == 200


async def test_delete_hospital(client, hospital, admin_headers):
    hospid = hospital.hospid
    resp = await client.delete(f"/hospital/deletehospital/{hospid}", headers=admin_headers)
    assert resp.status_code == 200
    assert resp.text == f"User Details with Id '{hospid}' deleted successfully!!!"
    assert (await client.get(f"/hospital/{hospid}", headers=admin_headers)).status_code == 404
