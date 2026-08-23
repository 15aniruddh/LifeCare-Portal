# ---- build stage -----------------------------------------------------
FROM python:3.12-slim AS builder

ENV PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /build

RUN apt-get update \
 && apt-get install -y --no-install-recommends build-essential \
 && rm -rf /var/lib/apt/lists/*

COPY pyproject.toml README.md ./
COPY app ./app

RUN python -m venv /opt/venv \
 && /opt/venv/bin/pip install --upgrade pip \
 && /opt/venv/bin/pip install .

# ---- runtime stage ---------------------------------------------------
FROM python:3.12-slim AS runtime

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH"

RUN apt-get update \
 && apt-get install -y --no-install-recommends curl \
 && rm -rf /var/lib/apt/lists/* \
 && useradd --create-home --uid 10001 lifecare

COPY --from=builder /opt/venv /opt/venv

WORKDIR /srv/app
COPY --chown=lifecare:lifecare app ./app
COPY --chown=lifecare:lifecare alembic ./alembic
COPY --chown=lifecare:lifecare scripts ./scripts
COPY --chown=lifecare:lifecare alembic.ini pyproject.toml ./

USER lifecare

EXPOSE 9091

HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:9091/health || exit 1

# --workers is tuned per deployment; 4 suits a 2 vCPU container.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "9091", "--workers", "4", \
     "--proxy-headers", "--forwarded-allow-ips", "*"]
