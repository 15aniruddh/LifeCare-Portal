"""Registration email - the Spring ``EmailService``.

Two deliberate changes from the Java version:

* credentials come from the environment instead of application.properties;
* a delivery failure is logged, not raised. The original let an SMTP error
  bubble out of ``saveUser`` and turn a successful signup into a 500.
"""

from __future__ import annotations

import logging
from email.message import EmailMessage

import aiosmtplib

from app.core.config import settings

logger = logging.getLogger(__name__)

WELCOME_SUBJECT = "Successfully Registered to LifeCare Portal"
WELCOME_BODY = (
    "Welcome to LifeCare Portal\n"
    "We wish You and your Family a Great Health and Long Life"
)


async def send_registration_email(recipient: str, name: str | None = None) -> bool:
    if not settings.MAIL_ENABLED:
        logger.info("MAIL_ENABLED is false; skipping welcome email to %s", recipient)
        return False

    message = EmailMessage()
    message["From"] = settings.MAIL_FROM
    message["To"] = recipient
    message["Subject"] = WELCOME_SUBJECT
    greeting = f"Hello {name},\n\n" if name else ""
    message.set_content(greeting + WELCOME_BODY)

    try:
        await aiosmtplib.send(
            message,
            hostname=settings.MAIL_HOST,
            port=settings.MAIL_PORT,
            start_tls=settings.MAIL_STARTTLS,
            username=settings.MAIL_USERNAME or None,
            password=settings.MAIL_PASSWORD or None,
            timeout=settings.MAIL_TIMEOUT_SECONDS,
        )
    except Exception:
        # Never fail a registration because the mail server is unhappy.
        logger.exception("Failed to send welcome email to %s", recipient)
        return False

    logger.info("Welcome email sent to %s", recipient)
    return True
