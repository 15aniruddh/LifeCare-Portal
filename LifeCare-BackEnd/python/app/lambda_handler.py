"""AWS Lambda entry point.

The whole FastAPI app runs behind a single Lambda function; Mangum translates
the Lambda event (Function URL, API Gateway HTTP/REST, or ALB) into an ASGI
request. Every route uvicorn serves is served here too, so nothing in
``app.main`` changes shape.

``lifespan="off"`` is deliberate: Mangum enters and exits the ASGI lifespan on
*every* invocation, which would run the startup DB ping and then dispose the
connection pool on each request. The startup work that still matters is done
once, at module import, below - which is exactly the cold-start boundary.
"""

from __future__ import annotations

import logging

from mangum import Mangum

from app.core.config import settings
from app.core.logging import configure_logging
from app.main import app

configure_logging()
settings.validate_for_runtime()
logging.getLogger(__name__).info(
    "Cold start: %s v%s (env=%s)", settings.APP_NAME, settings.APP_VERSION, settings.ENV
)

handler = Mangum(app, lifespan="off")
