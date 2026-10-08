import hashlib

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import Response


class ETagMiddleware(BaseHTTPMiddleware):
    """Adds an ETag to GET /api/v1/... JSON responses and answers matching
    If-None-Match requests with 304, so the browser reuses its cached copy
    instead of the app re-downloading and re-rendering data that hasn't
    changed since the last request (e.g. flipping between pages/tabs).
    """

    async def dispatch(self, request: Request, call_next):
        response = await call_next(request)

        if request.method != "GET" or response.status_code != 200:
            return response
        if not request.url.path.startswith("/api/v1/"):
            return response
        if "application/json" not in response.headers.get("content-type", ""):
            return response

        body = b""
        async for chunk in response.body_iterator:
            body += chunk

        etag = hashlib.md5(body).hexdigest()
        headers = dict(response.headers)
        headers["etag"] = etag
        headers["cache-control"] = "no-cache"
        # Scope the browser's cached copy to the token that fetched it, so one
        # user's cached response is never reused for a different logged-in user.
        headers["vary"] = "Authorization"

        if request.headers.get("if-none-match") == etag:
            headers.pop("content-length", None)
            return Response(status_code=304, headers=headers)

        return Response(content=body, status_code=response.status_code, headers=headers, media_type=response.media_type)
