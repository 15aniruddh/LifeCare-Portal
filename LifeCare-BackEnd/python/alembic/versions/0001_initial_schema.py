"""Initial LifeCare schema.

Ported from the Hibernate ddl-auto schema of the Spring service. Table names are
pluralised for Postgres ("user" is a reserved word); column names are unchanged.

Revision ID: 0001
Revises:
Create Date: 2026-08-23
"""

from collections.abc import Sequence

import sqlalchemy as sa
from alembic import op

revision: str = "0001"
down_revision: str | None = None
branch_labels: str | Sequence[str] | None = None
depends_on: str | Sequence[str] | None = None


def _count(name: str) -> sa.Column:
    return sa.Column(name, sa.Integer(), nullable=False, server_default="0")


def upgrade() -> None:
    op.create_table(
        "admins",
        sa.Column("id", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("name", sa.String(length=255), nullable=True),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.PrimaryKeyConstraint("id", name="pk_admins"),
        sa.UniqueConstraint("email", name="uq_admins_email"),
    )
    op.create_index("ix_admins_email", "admins", ["email"])

    op.create_table(
        "hospitals",
        sa.Column("hospid", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("hospitalname", sa.String(length=255), nullable=False),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.Column("contact", sa.String(length=32), nullable=True),
        sa.Column("ambulancecontact", sa.String(length=32), nullable=True),
        _count("ventilator"),
        _count("oxygen"),
        _count("normal"),
        _count("a_pos"),
        _count("a_neg"),
        _count("b_pos"),
        _count("b_neg"),
        _count("ab_pos"),
        _count("ab_neg"),
        _count("o_pos"),
        _count("o_neg"),
        _count("oxygenavailable"),
        sa.PrimaryKeyConstraint("hospid", name="pk_hospitals"),
        sa.UniqueConstraint("email", name="uq_hospitals_email"),
    )
    op.create_index("ix_hospitals_email", "hospitals", ["email"])
    op.create_index("ix_hospitals_hospitalname", "hospitals", ["hospitalname"])

    op.create_table(
        "users",
        sa.Column("userid", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=False),
        sa.Column("password", sa.String(length=255), nullable=False),
        sa.Column("contact", sa.String(length=32), nullable=True),
        sa.Column("address", sa.String(length=500), nullable=True),
        sa.Column("gender", sa.String(length=32), nullable=True),
        _count("age"),
        sa.PrimaryKeyConstraint("userid", name="pk_users"),
        sa.UniqueConstraint("email", name="uq_users_email"),
    )
    op.create_index("ix_users_email", "users", ["email"])

    op.create_table(
        "doctor_info",
        sa.Column("doctorid", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("name", sa.String(length=255), nullable=False),
        sa.Column("email", sa.String(length=255), nullable=True),
        sa.Column("qualification", sa.String(length=255), nullable=True),
        sa.Column("specialization", sa.String(length=255), nullable=True),
        sa.Column("hospital_id", sa.Integer(), nullable=False),
        sa.ForeignKeyConstraint(
            ["hospital_id"],
            ["hospitals.hospid"],
            name="fk_doctor_info_hospital_id_hospitals",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("doctorid", name="pk_doctor_info"),
    )
    op.create_index("ix_doctor_info_hospital_id", "doctor_info", ["hospital_id"])

    op.create_table(
        "requests",
        sa.Column("reqid", sa.Integer(), autoincrement=True, nullable=False),
        sa.Column("bedtype", sa.String(length=64), nullable=True),
        sa.Column("symptoms", sa.String(length=1000), nullable=True),
        _count("timetoarrive"),
        sa.Column("status", sa.String(length=32), nullable=True),
        sa.Column("hospital_id", sa.Integer(), nullable=True),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.ForeignKeyConstraint(
            ["hospital_id"],
            ["hospitals.hospid"],
            name="fk_requests_hospital_id_hospitals",
            ondelete="CASCADE",
        ),
        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.userid"],
            name="fk_requests_user_id_users",
            ondelete="CASCADE",
        ),
        sa.PrimaryKeyConstraint("reqid", name="pk_requests"),
    )
    op.create_index("ix_requests_hospital_id", "requests", ["hospital_id"])
    op.create_index("ix_requests_user_id", "requests", ["user_id"])
    op.create_index("ix_requests_status", "requests", ["status"])


def downgrade() -> None:
    op.drop_table("requests")
    op.drop_table("doctor_info")
    op.drop_table("users")
    op.drop_table("hospitals")
    op.drop_table("admins")
