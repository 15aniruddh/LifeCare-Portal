"""SQLAlchemy models.

Table names are the Postgres equivalents of the original MySQL/Hibernate ones:

    MySQL (Hibernate)   ->  Postgres
    admin               ->  admins
    user                ->  users        ("user" is reserved in Postgres)
    hospital            ->  hospitals
    doctorinfo          ->  doctor_info
    request             ->  requests

Column names are unchanged, so JSON field names stay identical to the Spring API.
"""

from app.db.base import Base
from app.models.admin import Admin
from app.models.doctorinfo import Doctorinfo
from app.models.hospital import Hospital
from app.models.request import Request
from app.models.user import User

__all__ = ["Base", "Admin", "Doctorinfo", "Hospital", "Request", "User"]
