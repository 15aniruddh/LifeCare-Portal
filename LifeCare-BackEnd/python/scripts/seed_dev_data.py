#!/usr/bin/env python
"""Populate the database with realistic dummy data for local testing.

    python scripts/seed_dev_data.py            # insert (refuses if data exists)
    python scripts/seed_dev_data.py --reset    # wipe the tables first, then insert

DEVELOPMENT ONLY. It refuses to run when ENV is staging or production, and every
account it creates uses a well-known password printed at the end.
"""

from __future__ import annotations

import argparse
import asyncio
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import delete, func, select  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.security import hash_password  # noqa: E402
from app.db.session import SessionFactory, dispose_engine  # noqa: E402
from app.models import Admin, Doctorinfo, Hospital, Request, User  # noqa: E402

# One password for everything, so any account is easy to log in as.
DEMO_PASSWORD = "Password@123"

ADMINS = [
    {"email": "admin@lifecare-portal.com", "name": "Site Administrator"},
]

HOSPITALS = [
    {
        "hospitalname": "Apollo City Hospital",
        "email": "apollo@lifecare-portal.com",
        "address": "21 Marine Drive, Mumbai 400002",
        "contact": "02261234500",
        "ambulancecontact": "02261234599",
        "ventilator": 6, "oxygen": 14, "normal": 40,
        "a_pos": 12, "a_neg": 3, "b_pos": 9, "b_neg": 2,
        "ab_pos": 4, "ab_neg": 1, "o_pos": 18, "o_neg": 5,
        "oxygenavailable": 120,
        "doctors": [
            ("Dr. Neha Iyer", "neha.iyer@lifecare-portal.com", "MBBS, MD", "Pulmonology"),
            ("Dr. Rakesh Menon", "rakesh.menon@lifecare-portal.com", "MBBS, MS", "Cardiology"),
            ("Dr. Farah Sheikh", "farah.sheikh@lifecare-portal.com", "MBBS, DNB", "Critical Care"),
        ],
    },
    {
        "hospitalname": "Sunrise Multispeciality",
        "email": "sunrise@lifecare-portal.com",
        "address": "8 Ring Road, Pune 411038",
        "contact": "02027781200",
        "ambulancecontact": "02027781299",
        "ventilator": 2, "oxygen": 5, "normal": 18,
        "a_pos": 6, "a_neg": 1, "b_pos": 4, "b_neg": 0,
        "ab_pos": 2, "ab_neg": 1, "o_pos": 10, "o_neg": 2,
        "oxygenavailable": 45,
        "doctors": [
            (
                "Dr. Vikram Joshi", "vikram.joshi@lifecare-portal.com",
                "MBBS, MD", "General Medicine",
            ),
            ("Dr. Ananya Bose", "ananya.bose@lifecare-portal.com", "MBBS, MD", "Anaesthesiology"),
        ],
    },
    {
        "hospitalname": "Grace Community Care",
        "email": "grace@lifecare-portal.com",
        "address": "45 Church Street, Bengaluru 560001",
        "contact": "08041005500",
        "ambulancecontact": "08041005599",
        "ventilator": 0, "oxygen": 1, "normal": 7,
        "a_pos": 2, "a_neg": 0, "b_pos": 1, "b_neg": 0,
        "ab_pos": 0, "ab_neg": 0, "o_pos": 3, "o_neg": 1,
        "oxygenavailable": 8,
        "doctors": [
            ("Dr. Samuel Thomas", "samuel.thomas@lifecare-portal.com", "MBBS", "Family Medicine"),
        ],
    },
]

USERS = [
    {
        "name": "Asha Rao", "email": "asha.rao@lifecare-portal.com",
        "contact": "9820011221", "address": "4 Park Road, Mumbai",
        "gender": "female", "age": 32,
    },
    {
        "name": "Ravi Kumar", "email": "ravi.kumar@lifecare-portal.com",
        "contact": "9822033445", "address": "77 Lake View, Pune",
        "gender": "male", "age": 41,
    },
    {
        "name": "Meera Nair", "email": "meera.nair@lifecare-portal.com",
        "contact": "9845066778", "address": "12 Hill Lane, Bengaluru",
        "gender": "female", "age": 27,
    },
    {
        "name": "Imran Qureshi", "email": "imran.qureshi@lifecare-portal.com",
        "contact": "9811099001", "address": "3 Station Road, Mumbai",
        "gender": "male", "age": 55,
    },
    {
        "name": "Divya Pillai", "email": "divya.pillai@lifecare-portal.com",
        "contact": "9867012345", "address": "60 Garden Estate, Pune",
        "gender": "female", "age": 36,
    },
]

# (user index, hospital index, bedtype, symptoms, minutes to arrive, status)
REQUESTS = [
    (0, 0, "ventilator", "Severe breathlessness, SpO2 88%", 20, "pending"),
    (1, 0, "oxygen", "Persistent cough and low oxygen saturation", 45, "pending"),
    (2, 0, "normal", "High fever for four days", 30, "Accepted"),
    (3, 1, "oxygen", "Chest tightness, history of asthma", 15, "pending"),
    (4, 1, "normal", "Dehydration and weakness", 60, "Rejected"),
    (0, 2, "normal", "Follow-up after discharge", 90, "pending"),
    (3, 2, "oxygen", "Shortness of breath on exertion", 25, "Accepted"),
]

TABLES_IN_DELETE_ORDER = (Request, Doctorinfo, User, Hospital, Admin)


async def is_empty(session) -> bool:
    for model in TABLES_IN_DELETE_ORDER:
        count = await session.scalar(select(func.count()).select_from(model))
        if count:
            print(f"  {model.__tablename__} already holds {count} row(s)")
            return False
    return True


async def reset(session) -> None:
    for model in TABLES_IN_DELETE_ORDER:
        await session.execute(delete(model))
    await session.flush()
    print("Existing rows deleted.")


async def seed(args: argparse.Namespace) -> int:
    if settings.is_production:
        print(f"Refusing to seed dummy data with ENV={settings.ENV}.", file=sys.stderr)
        return 1

    password_hash = hash_password(DEMO_PASSWORD)

    async with SessionFactory() as session:
        if args.reset:
            await reset(session)
        elif not await is_empty(session):
            print("\nDatabase is not empty. Re-run with --reset to replace its contents.")
            return 1

        for row in ADMINS:
            session.add(Admin(password=password_hash, **row))

        hospitals: list[Hospital] = []
        for spec in HOSPITALS:
            doctors = spec.pop("doctors")
            hospital = Hospital(password=password_hash, **spec)
            hospital.doctorinfos = [
                Doctorinfo(name=n, email=e, qualification=q, specialization=s)
                for n, e, q, s in doctors
            ]
            session.add(hospital)
            hospitals.append(hospital)

        users = [User(password=password_hash, **row) for row in USERS]
        session.add_all(users)

        # Flush so the generated ids are available for the request rows.
        await session.flush()

        for user_idx, hosp_idx, bedtype, symptoms, minutes, status in REQUESTS:
            session.add(
                Request(
                    bedtype=bedtype,
                    symptoms=symptoms,
                    timetoarrive=minutes,
                    status=status,
                    hospital_id=hospitals[hosp_idx].hospid,
                    user_id=users[user_idx].userid,
                )
            )

        await session.commit()

        counts = {
            m.__tablename__: await session.scalar(select(func.count()).select_from(m))
            for m in TABLES_IN_DELETE_ORDER
        }

    print("\nSeeded:")
    for table, count in counts.items():
        print(f"  {table:<12} {count}")
    print(f"\nEvery account uses the password: {DEMO_PASSWORD}")
    print(f"  admin     {ADMINS[0]['email']}")
    print(f"  hospital  {HOSPITALS[0]['email']}")
    print(f"  user      {USERS[0]['email']}")
    return 0


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--reset", action="store_true", help="Delete existing rows before inserting"
    )
    args = parser.parse_args()
    try:
        return asyncio.run(_run(args))
    except Exception as exc:
        print(f"Failed: {exc}", file=sys.stderr)
        return 1


async def _run(args: argparse.Namespace) -> int:
    try:
        return await seed(args)
    finally:
        await dispose_engine()


if __name__ == "__main__":
    raise SystemExit(main())
