from __future__ import annotations

from typing import TYPE_CHECKING

from sqlalchemy import ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db.base import Base

if TYPE_CHECKING:
    from app.models.hospital import Hospital
    from app.models.user import User


class Request(Base):
    __tablename__ = "requests"

    reqid: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bedtype: Mapped[str | None] = mapped_column(String(64))
    symptoms: Mapped[str | None] = mapped_column(String(1000))
    timetoarrive: Mapped[int] = mapped_column(
        Integer, nullable=False, default=0, server_default="0"
    )
    # Free-form in the original schema: "pending" / "Accepted" / "Rejected".
    status: Mapped[str | None] = mapped_column(String(32), index=True)

    hospital_id: Mapped[int | None] = mapped_column(
        ForeignKey("hospitals.hospid", ondelete="CASCADE"), index=True
    )
    user_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.userid", ondelete="CASCADE"), index=True
    )

    hospital: Mapped[Hospital | None] = relationship(back_populates="requests", lazy="raise")
    user: Mapped[User | None] = relationship(back_populates="requests", lazy="raise")
