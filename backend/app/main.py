import logging

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from google.genai.errors import APIError

from app.config import settings
from app.routers import insight, mentor, matching, portfolio, progress, submission, user

logger = logging.getLogger("uvicorn.error")

app = FastAPI(title="WADAH API", version="1.0.0")

# In development, Vite auto-bumps to the next free port (5174, 5175, ...)
# whenever 5173 is already taken by another running dev server — an exact
# FRONTEND_ORIGIN match would silently CORS-block the frontend the moment
# that happens. Allow any localhost port in dev; pin to the real origin in
# production.
if settings.ENVIRONMENT == "development":
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=r"http://localhost:\d+",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.FRONTEND_ORIGIN],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# An exception that reaches Starlette's outermost ServerErrorMiddleware
# (i.e. anything not caught by FastAPI's built-in HTTPException/validation
# handlers) skips CORSMiddleware on the way out — that middleware sits
# *inside* ServerErrorMiddleware, so it never gets a chance to add
# Access-Control-Allow-Origin to the 500 response. The browser then reports
# a CORS failure, masking the real error (this is how a Gemini overload on
# /insight/analyze or /mentor/chat showed up as a CORS block instead of a
# 500). Registering handlers here routes the error through
# ExceptionMiddleware instead, which *is* inside CORSMiddleware.
@app.exception_handler(APIError)
async def gemini_error_handler(request: Request, exc: APIError):
    logger.error("Gemini API error: %s", exc)
    status_code = 503 if exc.code and 500 <= exc.code < 600 else 502
    return JSONResponse(status_code=status_code, content={"detail": "Layanan AI sedang sibuk, coba lagi sebentar lagi."})


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    logger.exception("Unhandled error on %s %s", request.method, request.url.path)
    return JSONResponse(status_code=500, content={"detail": "Terjadi kesalahan pada server."})


app.include_router(user.router)
app.include_router(progress.router)
app.include_router(mentor.router)
app.include_router(submission.router)
app.include_router(portfolio.router)
app.include_router(matching.router)
app.include_router(insight.router)


@app.get("/health")
def health():
    return {"status": "ok", "environment": settings.ENVIRONMENT}
