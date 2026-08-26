from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field


class LoginRequest(BaseModel):
    """The Spring ``Loginreq`` DTO."""

    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class LoginResponse(BaseModel):
    """The Spring ``Loginres`` DTO, plus the JWT.

    ``id``, ``name`` and ``role`` are unchanged, so the existing React app keeps
    working; ``access_token`` is additive.
    """

    id: int
    name: str
    role: str
    access_token: str
    token_type: str = "bearer"
    expires_in: int


class LoginProviders(BaseModel):
    """What ``GET /login/providers`` reports, so the login page can adapt.

    Password login is always available; Google appears only once the server has
    both halves of its OAuth client configured.
    """

    password: bool = True
    google: bool = False


class CurrentPrincipal(BaseModel):
    """Decoded token, attached to the request by the auth dependency."""

    id: int
    role: str
    name: str | None = None

    @property
    def is_admin(self) -> bool:
        return self.role == "admin"
