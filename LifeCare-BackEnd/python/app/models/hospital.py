from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.doctorinfo import Doctorinfo
    from app.models.request import Request


class Hospital(Base):
    __tablename__ = "hospitals"

    hospid: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    hospitalname: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    address: Mapped[str | None] = mapped_column(String(500))
    email: Mapped[str] = mapped_column(String(255), nullable=False, unique=True, index=True)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    contact: Mapped[str | None] = mapped_column(String(32))
    ambulancecontact: Mapped[str | None] = mapped_column(String(32))

    # Bed inventory
    ventilator: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    oxygen: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    normal: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    # Blood inventory
    a_pos: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    a_neg: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    b_pos: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    b_neg: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    ab_pos: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    ab_neg: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    o_pos: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")
    o_neg: Mapped[int] = mapped_column(Integer, nullable=False, default=0, server_default="0")

    oxygenavailable: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )

    doctorinfos: Mapped[list[Doctorinfo]] = relationship(
        back_populates="hospital",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )
    requests: Mapped[list[Request]] = relationship(
        back_populates="hospital",
        cascade="all, delete-orphan",
        passive_deletes=True,
        lazy="selectin",
    )
