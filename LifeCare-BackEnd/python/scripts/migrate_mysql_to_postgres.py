#!/usr/bin/env python
"""Copy the LifeCare data out of the old MySQL database into Postgres.

Usage
-----
    pip install -e '.[migrate]'
    alembic upgrade head            # create the Postgres schema first
    python scripts/migrate_mysql_to_postgres.py --dry-run
    python scripts/migrate_mysql_to_postgres.py

Source connection comes from MYSQL_* environment variables (or --mysql-url),
the destination from the usual POSTGRES_*/DATABASE_URL settings.

What it does
------------
* copies admins, hospitals, users, doctorinfo and requests, preserving primary
  keys and the foreign keys between them;
* bcrypt-hashes admin passwords, which the Spring app stored in plaintext
  (hospital and user passwords are already bcrypt and are copied verbatim);
* resets each Postgres identity sequence past the highest copied id;
* refuses to run against a non-empty target unless --truncate is given.

It is idempotent in the sense that re-running with --truncate reproduces the
same result; without it, a second run aborts rather than duplicating rows.
"""

from __future__ import annotations

import argparse
import logging
import os
import sys
from typing import Any

# Run from the repo root without installing the package.
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy import create_engine, text  # noqa: E402
from sqlalchemy.engine import Engine  # noqa: E402

from app.core.config import settings  # noqa: E402
from app.core.security import hash_password, is_bcrypt_hash  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(levelname)-7s %(message)s")
logger = logging.getLogger("migrate")

#: MySQL table -> Postgres table. Column names are identical on both sides.
TABLES: list[tuple[str, str, list[str], str]] = [
    (
        "admin",
        "admins",
        ["id", "email", "name", "password"],
        "id",
    ),
    (
        "hospital",
        "hospitals",
        [
            "hospid", "hospitalname", "address", "email", "password", "contact",
            "ambulancecontact", "ventilator", "oxygen", "normal", "a_pos", "a_neg",
            "b_pos", "b_neg", "ab_pos", "ab_neg", "o_pos", "o_neg", "oxygenavailable",
        ],
        "hospid",
    ),
    (
        "user",
        "users",
        ["userid", "name", "email", "password", "contact", "address", "gender", "age"],
        "userid",
    ),
    (
        "doctorinfo",
        "doctor_info",
        ["doctorid", "name", "email", "qualification", "specialization", "hospital_id"],
        "doctorid",
    ),
    (
        "request",
        "requests",
        ["reqid", "bedtype", "symptoms", "timetoarrive", "status", "hospital_id", "user_id"],
        "reqid",
    ),
]

#: Columns that must never be NULL in Postgres but might be in the old data.
NOT_NULL_DEFAULTS: dict[str, dict[str, Any]] = {
    "hospitals": {
        "hospitalname": "", "email": "", "password": "",
        **dict.fromkeys(
            (
                "ventilator", "oxygen", "normal", "a_pos", "a_neg", "b_pos",
                "b_neg", "ab_pos", "ab_neg", "o_pos", "o_neg", "oxygenavailable",
            ),
            0,
        ),
    },
    "users": {"name": "", "email": "", "password": "", "age": 0},
    "admins": {"email": "", "password": ""},
    "doctor_info": {"name": ""},
    "requests": {"timetoarrive": 0},
}


def mysql_url(args: argparse.Namespace) -> str:
    if args.mysql_url:
        return args.mysql_url
    user = os.getenv("MYSQL_USER", "root")
    password = os.getenv("MYSQL_PASSWORD", "")
    host = os.getenv("MYSQL_HOST", "localhost")
    port = os.getenv("MYSQL_PORT", "3306")
    database = os.getenv("MYSQL_DATABASE", "lifecare")
    auth = f"{user}:{password}@" if password else f"{user}@"
    return f"mysql+pymysql://{auth}{host}:{port}/{database}?charset=utf8mb4"


def fetch_rows(engine: Engine, table: str, columns: list[str]) -> list[dict[str, Any]]:
    quoted = ", ".join(f"`{c}`" for c in columns)
    with engine.connect() as conn:
        result = conn.execute(text(f"SELECT {quoted} FROM `{table}`"))
        return [dict(row) for row in result.mappings()]


def normalise(target: str, row: dict[str, Any]) -> dict[str, Any]:
    for column, default in NOT_NULL_DEFAULTS.get(target, {}).items():
        if row.get(column) is None:
            row[column] = default

    if target == "admins":
        # The Spring login compared this column literally; store a real hash.
        current = row.get("password") or ""
        if not is_bcrypt_hash(current):
            row["password"] = hash_password(current) if current else hash_password("!disabled!")
            row["_password_rehashed"] = True

    return row


def target_is_empty(engine: Engine, tables: list[str]) -> bool:
    with engine.connect() as conn:
        for table in tables:
            count = conn.execute(text(f'SELECT COUNT(*) FROM "{table}"')).scalar_one()
            if count:
                logger.error("Target table %s already holds %s row(s)", table, count)
                return False
    return True


def truncate(engine: Engine, tables: list[str]) -> None:
    joined = ", ".join(f'"{t}"' for t in tables)
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {joined} RESTART IDENTITY CASCADE"))
    logger.warning("Truncated: %s", joined)


def insert_rows(engine: Engine, table: str, columns: list[str], rows: list[dict]) -> int:
    if not rows:
        return 0
    cols = ", ".join(f'"{c}"' for c in columns)
    params = ", ".join(f":{c}" for c in columns)
    stmt = text(f'INSERT INTO "{table}" ({cols}) VALUES ({params})')
    with engine.begin() as conn:
        conn.execute(stmt, [{c: r.get(c) for c in columns} for r in rows])
    return len(rows)


def reset_sequence(engine: Engine, table: str, pk: str) -> None:
    with engine.begin() as conn:
        conn.execute(
            text(
                "SELECT setval("
                "  pg_get_serial_sequence(:table, :pk),"
                f'  COALESCE((SELECT MAX("{pk}") FROM "{table}"), 0) + 1,'
                "  false)"
            ),
            {"table": table, "pk": pk},
        )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--mysql-url", help="Full SQLAlchemy URL for the source MySQL database")
    parser.add_argument(
        "--postgres-url", help="Override the destination URL (defaults to app settings)"
    )
    parser.add_argument("--dry-run", action="store_true", help="Read and report, write nothing")
    parser.add_argument(
        "--truncate",
        action="store_true",
        help="Empty the destination tables first (destructive)",
    )
    args = parser.parse_args()

    source_url = mysql_url(args)
    dest_url = args.postgres_url or settings.sync_url
    logger.info("Source: %s", source_url.split("@")[-1])
    logger.info("Target: %s", dest_url.split("@")[-1])

    source = create_engine(source_url, pool_pre_ping=True)
    dest = create_engine(dest_url, pool_pre_ping=True)

    targets = [t for _, t, _, _ in TABLES]

    if not args.dry_run:
        if args.truncate:
            truncate(dest, list(reversed(targets)))
        elif not target_is_empty(dest, targets):
            logger.error("Refusing to write into a non-empty database. Re-run with --truncate.")
            return 1

    total = 0
    rehashed = 0
    # Parents before children so the foreign keys always resolve.
    for src_table, dst_table, columns, pk in TABLES:
        try:
            rows = fetch_rows(source, src_table, columns)
        except Exception as exc:
            logger.error("Could not read `%s` from MySQL: %s", src_table, exc)
            return 1

        rows = [normalise(dst_table, r) for r in rows]
        rehashed += sum(1 for r in rows if r.pop("_password_rehashed", False))

        if args.dry_run:
            logger.info("[dry-run] %s -> %s: %s row(s)", src_table, dst_table, len(rows))
            continue

        written = insert_rows(dest, dst_table, columns, rows)
        reset_sequence(dest, dst_table, pk)
        total += written
        logger.info("%s -> %s: %s row(s) copied", src_table, dst_table, written)

    if rehashed:
        logger.warning(
            "%s admin password(s) were plaintext in MySQL and have been bcrypt-hashed. "
            "The original passwords still work; rotate them anyway.",
            rehashed,
        )

    if args.dry_run:
        logger.info("Dry run complete - nothing was written.")
    else:
        logger.info("Migration complete: %s row(s) copied.", total)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
