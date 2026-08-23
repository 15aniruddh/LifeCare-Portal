#!/usr/bin/env python
"""Create or update an administrator.

The Spring API had no endpoint for creating admins - rows were inserted into the
``admin`` table by hand. This is the supported replacement.

    python scripts/seed_admin.py --email admin@lifecare.local --name "Site Admin"

The password is read from the ADMIN_PASSWORD environment variable, or prompted
for interactively so it never lands in your shell history.
"""

from __future__ import annotations

import argparse
import asyncio
import getpass
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.core.security import hash_password  # noqa: E402
from app.db.session import SessionFactory, dispose_engine  # noqa: E402
from app.models.admin import Admin  # noqa: E402
from app.repositories.admin import AdminRepository  # noqa: E402

MIN_PASSWORD_LENGTH = 12


async def seed(email: str, name: str, password: str) -> None:
    async with SessionFactory() as session:
        repo = AdminRepository(session)
        existing = await repo.find_by_email(email)
        if existing:
            existing.name = name
            existing.password = hash_password(password)
            await session.commit()
            print(f"Updated existing admin '{email}' (id={existing.id}).")
            return

        admin = Admin(email=email, name=name, password=hash_password(password))
        session.add(admin)
        await session.commit()
        await session.refresh(admin)
        print(f"Created admin '{email}' (id={admin.id}).")


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--email", required=True)
    parser.add_argument("--name", default="Administrator")
    args = parser.parse_args()

    password = os.getenv("ADMIN_PASSWORD") or getpass.getpass("Admin password: ")
    if len(password) < MIN_PASSWORD_LENGTH:
        print(f"Password must be at least {MIN_PASSWORD_LENGTH} characters.", file=sys.stderr)
        return 1

    try:
        asyncio.run(_run(args.email.strip().lower(), args.name, password))
    except Exception as exc:
        print(f"Failed: {exc}", file=sys.stderr)
        return 1
    return 0


async def _run(email: str, name: str, password: str) -> None:
    try:
        await seed(email, name, password)
    finally:
        await dispose_engine()


if __name__ == "__main__":
    raise SystemExit(main())
