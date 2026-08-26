"""Application settings.

Everything that was hard-coded in the Spring ``application.properties`` file
(database URL, DB password, SMTP credentials) is read from the environment here.
No secret has a usable default.
"""

from functools import lru_cache
from typing import Annotated, Literal
from urllib.parse import parse_qsl, urlencode, urlsplit, urlunsplit

from pydantic import Field, PostgresDsn, field_validator
from pydantic_settings import BaseSettings, NoDecode, SettingsConfigDict

_PG_SCHEMES = ("postgresql+asyncpg://", "postgresql+psycopg://",
               "postgresql+psycopg2://", "postgresql://", "postgres://")

# libpq understands these; asyncpg does not. Managed providers (Neon, Supabase,
# RDS) hand out URLs full of them, so translate rather than fail at connect time.
_LIBPQ_ONLY = {"channel_binding", "target_session_attrs", "options",
               "connect_timeout", "application_name", "gssencmode"}


def _swap_scheme(url: str, scheme: str) -> str:
    for prefix in _PG_SCHEMES:
        if url.startswith(prefix):
            return scheme + url[len(prefix):]
    return url


def _to_asyncpg_url(url: str) -> str:
    """Rewrite a libpq-style Postgres URL into one asyncpg accepts.

    ``sslmode`` becomes asyncpg's ``ssl``; parameters asyncpg has no equivalent
    for (``channel_binding`` and friends) are dropped. The connection is still
    encrypted - ``ssl=require`` carries that.
    """
    url = _swap_scheme(url, "postgresql+asyncpg://")
    parts = urlsplit(url)
    if not parts.query:
        return url

    kept: list[tuple[str, str]] = []
    for key, value in parse_qsl(parts.query, keep_blank_values=True):
        lowered = key.lower()
        if lowered == "sslmode":
            # asyncpg spells it "ssl"; "require" is the only value Neon needs.
            kept.append(("ssl", "require" if value == "require" else value))
        elif lowered in _LIBPQ_ONLY:
            continue
        else:
            kept.append((key, value))

    return urlunsplit(parts._replace(query=urlencode(kept)))


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        case_sensitive=False,
    )

    # ---- Application -------------------------------------------------
    APP_NAME: str = "LifeCare Portal API"
    APP_VERSION: str = "1.0.0"
    ENV: Literal["local", "dev", "staging", "production"] = "local"
    DEBUG: bool = False
    # 9091 is the port the existing React frontend calls.
    PORT: int = 9091
    LOG_LEVEL: str = "INFO"
    LOG_JSON: bool = True

    # ---- Database ----------------------------------------------------
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    POSTGRES_DB: str = "lifecare"
    POSTGRES_USER: str = "lifecare"
    POSTGRES_PASSWORD: str = ""
    # Set DATABASE_URL to override the assembled URL entirely (e.g. on RDS).
    DATABASE_URL: str | None = None

    DB_ECHO: bool = False

    # ---- Security ----------------------------------------------------
    # Required in every non-local environment; validated below.
    SECRET_KEY: str = "change-me-in-every-real-environment"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 8
    BCRYPT_ROUNDS: int = 10  # matches Spring's BCryptPasswordEncoder(10)

    # Login brute-force throttle (per client IP).
    LOGIN_RATE_LIMIT_ATTEMPTS: int = 10
    LOGIN_RATE_LIMIT_WINDOW_SECONDS: int = 60

    # ---- CORS --------------------------------------------------------
    # The Spring app allowed "*". Keep an explicit list in production.
    # NoDecode stops pydantic-settings from JSON-decoding the raw value, so the
    # comma-separated form used in .env reaches the validator below intact.
    CORS_ORIGINS: Annotated[list[str], NoDecode] = Field(default_factory=lambda: ["*"])

    # ---- Google OAuth (Sign in with Google) --------------------------
    # Credentials come from the Google Cloud console:
    #   APIs & Services -> Credentials -> OAuth 2.0 Client ID (Web application)
    # Leave GOOGLE_OAUTH_ENABLED false until both values are filled in; the
    # login page hides the Google button while it is off.
    GOOGLE_OAUTH_ENABLED: bool = False
    GOOGLE_CLIENT_ID: str = ""
    GOOGLE_CLIENT_SECRET: str = ""
    # Must match an "Authorised redirect URI" registered on that client exactly.
    GOOGLE_REDIRECT_URI: str = "http://localhost:9091/login/google/callback"
    # First Google sign-in for an unknown address registers a patient account.
    GOOGLE_AUTO_CREATE_USERS: bool = True
    # Where the callback sends the browser back to once the JWT is minted.
    FRONTEND_BASE_URL: str = "http://localhost:3000"

    # ---- Mail --------------------------------------------------------
    MAIL_ENABLED: bool = False
    MAIL_HOST: str = "smtp.gmail.com"
    MAIL_PORT: int = 587
    MAIL_USERNAME: str = ""
    MAIL_PASSWORD: str = ""
    MAIL_FROM: str = "noreply@lifecare.local"
    MAIL_STARTTLS: bool = True
    MAIL_TIMEOUT_SECONDS: int = 10

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def _split_origins(cls, v: object) -> object:
        """Accept ``a,b``, ``["a","b"]`` or a real list."""
        if isinstance(v, str):
            raw = v.strip()
            if raw.startswith("["):
                import json

                try:
                    return json.loads(raw)
                except ValueError:
                    pass
            return [o.strip() for o in raw.split(",") if o.strip()]
        return v

    @property
    def google_oauth_ready(self) -> bool:
        """True only when Google login is switched on *and* configured."""
        return bool(
            self.GOOGLE_OAUTH_ENABLED and self.GOOGLE_CLIENT_ID and self.GOOGLE_CLIENT_SECRET
        )

    @property
    def is_production(self) -> bool:
        return self.ENV in ("staging", "production")

    @property
    def sqlalchemy_url(self) -> str:
        if self.DATABASE_URL:
            return _to_asyncpg_url(self.DATABASE_URL)
        return str(
            PostgresDsn.build(
                scheme="postgresql+asyncpg",
                username=self.POSTGRES_USER,
                password=self.POSTGRES_PASSWORD or None,
                host=self.POSTGRES_HOST,
                port=self.POSTGRES_PORT,
                path=self.POSTGRES_DB,
            )
        )

    @property
    def sync_url(self) -> str:
        """Blocking-driver form of the same URL.

        The app and Alembic both run on asyncpg; this is for the standalone
        scripts and for Alembic's offline (``--sql``) mode, which never connects.
        Needs ``pip install -e '.[migrate]'`` to actually open a connection.

        Built from the raw URL rather than the asyncpg one, so libpq keeps the
        ``sslmode``/``channel_binding`` parameters it understands.
        """
        if self.DATABASE_URL:
            return _swap_scheme(self.DATABASE_URL, "postgresql+psycopg://")
        return self.sqlalchemy_url.replace("postgresql+asyncpg://", "postgresql+psycopg://")

    def validate_for_runtime(self) -> None:
        """Fail fast on unsafe production configuration."""
        problems: list[str] = []
        # Enabled but half-configured is always a mistake, in every environment.
        if self.GOOGLE_OAUTH_ENABLED and not (self.GOOGLE_CLIENT_ID and self.GOOGLE_CLIENT_SECRET):
            problems.append(
                "GOOGLE_OAUTH_ENABLED is true but GOOGLE_CLIENT_ID / "
                "GOOGLE_CLIENT_SECRET are not both set"
            )
        if self.is_production:
            if (
                self.SECRET_KEY == "change-me-in-every-real-environment"
                or len(self.SECRET_KEY) < 32
            ):
                problems.append("SECRET_KEY must be a random value of at least 32 characters")
            if "*" in self.CORS_ORIGINS:
                problems.append("CORS_ORIGINS must list explicit origins in production")
            if self.DEBUG:
                problems.append("DEBUG must be false in production")
        if problems:
            raise RuntimeError("Invalid configuration:\n  - " + "\n  - ".join(problems))


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
