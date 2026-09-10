from typing import Any

from fastapi import HTTPException
from fastapi.requests import Request
from fastapi.responses import JSONResponse


class AppError(HTTPException):
    def __init__(self, status_code: int, message: str, error_code: str):
        super().__init__(status_code=status_code, detail=message)
        self.message = message
        self.error_code = error_code


async def app_error_handler(request: Request, exc: AppError) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.message, "error_code": exc.error_code},
    )


async def http_exception_handler(request: Request, exc: HTTPException) -> JSONResponse:
    return JSONResponse(
        status_code=exc.status_code,
        content={"success": False, "message": exc.detail, "error_code": "HTTP_ERROR"},
    )


async def validation_exception_handler(request: Request, exc: Any) -> JSONResponse:
    return JSONResponse(
        status_code=422,
        content={"success": False, "message": "Validation error", "error_code": "VALIDATION_ERROR", "errors": exc.errors()},
    )


def success_response(data: Any = None, message: str = "Success") -> dict:
    return {"success": True, "message": message, "data": data}
