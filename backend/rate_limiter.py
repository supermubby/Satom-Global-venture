"""
Rate limiting configuration for the Satom Global Venture API.

Uses slowapi with in-memory storage by default (suitable for single-worker
deployments such as Render's free/standard web services).  For multi-worker
or multi-instance deployments, set the ``RATELIMIT_STORAGE_URI`` environment
variable to a Redis connection string, e.g.::

    RATELIMIT_STORAGE_URI=redis://:password@redis-host:6379/0

The admin login endpoint is limited to 5 attempts per minute per client IP
to protect against brute-force attacks.
"""
import os

from fastapi import Request
from fastapi.responses import JSONResponse
from slowapi import Limiter
from slowapi.errors import RateLimitExceeded


def get_client_ip(request: Request) -> str:
    """
    Extract the real client IP address.

    Handles the ``X-Forwarded-For`` header that is set by reverse proxies
    (e.g. Render, Cloudflare).  When multiple IPs are present in the header
    (comma-separated), the first one is the original client.
    """
    forwarded_for = request.headers.get("x-forwarded-for")
    if forwarded_for:
        return forwarded_for.split(",")[0].strip()
    if request.client:
        return request.client.host
    return "unknown"


# ── Limiter instance ───────────────────────────────────────────────────────────
# Storage defaults to in-memory.  Override with RATELIMIT_STORAGE_URI for Redis.
_storage_uri = os.getenv("RATELIMIT_STORAGE_URI", "memory://")

limiter = Limiter(
    key_func=get_client_ip,
    default_limits=[],  # No global default; limits are applied per-route.
    storage_uri=_storage_uri,
)


# ── Exception handler ───────────────────────────────────────────────────────────
async def rate_limit_exceeded_handler(request: Request, exc: RateLimitExceeded):
    """
    Return a clear JSON error when a rate limit is exceeded.

    HTTP 429 with a descriptive message so the client knows what happened.
    """
    retry_after = getattr(exc, "retry_after", None)
    headers: dict[str, str] = {}
    if retry_after is not None:
        headers["Retry-After"] = str(retry_after)

    return JSONResponse(
        status_code=429,
        headers=headers,
        content={
            "detail": "Too many login attempts. Please try again later.",
        },
    )
