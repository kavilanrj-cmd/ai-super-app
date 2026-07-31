from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from sqlalchemy.exc import SQLAlchemyError
from app.core.config import settings
import logging

logger = logging.getLogger(__name__)


def _json_safe(obj):
    if isinstance(obj, bytes):
        return obj.decode("utf-8", errors="replace")
    if isinstance(obj, dict):
        return {k: _json_safe(v) for k, v in obj.items()}
    if isinstance(obj, (list, tuple)):
        return [_json_safe(v) for v in obj]
    return obj

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail, "status_code": exc.status_code},
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = exc.errors()
    messages = [f"{'.'.join(str(l) for l in e.get('loc', []))}: {e.get('msg', '')}" for e in errors]
    detail = "; ".join(messages) if messages else "Validation error"
    logger.warning(f"Validation error on {request.url.path}: {detail}")
    return JSONResponse(
        status_code=422,
        content={
            "detail": detail,
            "errors": _json_safe(errors),
            "status_code": 422,
        },
    )

async def sqlalchemy_exception_handler(request: Request, exc: SQLAlchemyError):
    logger.error(f"Database error: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal database error", "status_code": 500},
    )

async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url.path}: {exc}", exc_info=True)
    detail = str(exc) if settings.DEBUG and str(exc) else "Internal server error"
    return JSONResponse(
        status_code=500,
        content={"detail": detail, "status_code": 500},
    )
