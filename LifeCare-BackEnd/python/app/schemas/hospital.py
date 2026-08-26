from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field

from app.schemas.common import ORMModel
from app.schemas.doctorinfo import DoctorinfoRead
from app.schemas.request import RequestRead

_COUNT = Field(default=0, ge=0)


class BedUpdate(BaseModel):
    ventilator: int = _COUNT
    oxygen: int = _COUNT
    normal: int = _COUNT


class BloodUpdate(BaseModel):
    a_pos: int = _COUNT
    a_neg: int = _COUNT
    b_pos: int = _COUNT
    b_neg: int = _COUNT
    ab_pos: int = _COUNT
    ab_neg: int = _COUNT
    o_pos: int = _COUNT
    o_neg: int = _COUNT


class OxygenUpdate(BaseModel):
    oxygenavailable: int = _COUNT


class HospitalCreate(BedUpdate, BloodUpdate, OxygenUpdate):
    """A new hospital: its identity, plus the same 12 counts the three
    inventory endpoints write."""

    hospitalname: str = Field(min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)
    address: str | None = Field(default=None, max_length=500)
    contact: str | None = Field(default=None, max_length=32)
    ambulancecontact: str | None = Field(default=None, max_length=32)


class HospitalUpdate(BaseModel):
    """Partial update: only the keys present in the body are written.

    The Spring version passed the deserialised entity straight to ``save()``,
    which blanked every field the client omitted. The admin screen always posts
    the full object, so behaviour is identical there - but a partial body no
    longer destroys data.
    """

    hospitalname: str | None = Field(default=None, min_length=1, max_length=255)
    email: EmailStr | None = None
    # Blank or an existing bcrypt hash means "leave the password alone".
    password: str | None = Field(default=None, max_length=128)
    address: str | None = Field(default=None, max_length=500)
    contact: str | None = Field(default=None, max_length=32)
    ambulancecontact: str | None = Field(default=None, max_length=32)

    ventilator: int | None = Field(default=None, ge=0)
    oxygen: int | None = Field(default=None, ge=0)
    normal: int | None = Field(default=None, ge=0)
    a_pos: int | None = Field(default=None, ge=0)
    a_neg: int | None = Field(default=None, ge=0)
    b_pos: int | None = Field(default=None, ge=0)
    b_neg: int | None = Field(default=None, ge=0)
    ab_pos: int | None = Field(default=None, ge=0)
    ab_neg: int | None = Field(default=None, ge=0)
    o_pos: int | None = Field(default=None, ge=0)
    o_neg: int | None = Field(default=None, ge=0)
    oxygenavailable: int | None = Field(default=None, ge=0)


class HospitalPublic(ORMModel):
    """What the public hospital directory may show.

    Anyone can browse availability without signing in, so this deliberately
    omits the hospital's login ``email`` and the patient ``requests`` that
    :class:`HospitalRead` carries.
    """

    hospid: int
    hospitalname: str
    address: str | None = None
    contact: str | None = None
    ambulancecontact: str | None = None

    ventilator: int = 0
    oxygen: int = 0
    normal: int = 0
    a_pos: int = 0
    a_neg: int = 0
    b_pos: int = 0
    b_neg: int = 0
    ab_pos: int = 0
    ab_neg: int = 0
    o_pos: int = 0
    o_neg: int = 0
    oxygenavailable: int = 0


class HospitalRead(HospitalPublic):
    """Everything :class:`HospitalPublic` shows, plus what only the hospital
    itself and an admin may see.

    The old Spring API serialised the bcrypt hash to every caller. It is
    dropped here; see the README for the one frontend screen that
    round-tripped it.
    """

    email: str

    doctorinfos: list[DoctorinfoRead] = Field(default_factory=list)
    requests: list[RequestRead] = Field(default_factory=list)
