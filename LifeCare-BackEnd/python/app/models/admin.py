from __future__ import annotations

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base


class Admin(Base):
    __tablename__ = "admins"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    name: Mapped[str | None] = mapped_column(String(255))
    # bcrypt hash. The Spring version compared this column in plaintext; the
    # seed script and scripts/migrate_mysql_to_postgres.py hash it on the way in.
    password: Mapped[str] = mapped_column(String(255), nullable=False)
