from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.hospital import Hospital


class Doctorinfo(Base):
    __tablename__ = "doctor_info"

    doctorid: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str | None] = mapped_column(String(255))
    qualification: Mapped[str | None] = mapped_column(String(255))
    specialization: Mapped[str | None] = mapped_column(String(255))

    hospital_id: Mapped[int] = mapped_column(
        ForeignKey("hospitals.hospid", ondelete="CASCADE"), nullable=False, index=True
    )
    hospital: Mapped[Hospital] = relationship(back_populates="doctorinfos", lazy="raise")
