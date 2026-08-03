"""Middleware: Request/Response Logging"""
import time
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from loguru import logger


class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.time()
        response = await call_next(request)
        elapsed = round((time.time() - start) * 1000, 2)
        logger.info(
            f"{request.method} {request.url.path} "
            f"→ {response.status_code} ({elapsed}ms)"
        )
        return response
