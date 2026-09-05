from fastapi import Header, HTTPException

from app.db import get_supabase


def get_current_user(authorization: str | None = Header(default=None)) -> dict:
    """Verifies the Supabase session JWT and returns the matching `users`
    row. Every endpoint depends on this except the public portfolio and
    matching reads — PRD section 6: "Semua endpoint FastAPI wajib
    verifikasi JWT dari Supabase".
    """
    # `authorization` is optional at the FastAPI layer specifically so a
    # missing header reaches this 401 instead of being rejected upstream
    # as a generic 422 validation error.
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing bearer token")
    token = authorization.removeprefix("Bearer ").strip()

    supabase = get_supabase()
    try:
        auth_response = supabase.auth.get_user(token)
    except Exception as exc:
        raise HTTPException(status_code=401, detail="Invalid or expired token") from exc

    if not auth_response or not auth_response.user:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    result = (
        supabase.table("users")
        .select("*")
        .eq("id", auth_response.user.id)
        .maybe_single()
        .execute()
    )
    # This version of postgrest-py's .maybe_single().execute() returns None
    # outright (not a response object with data=None) when zero rows match —
    # a real, previously-latent crash: any authenticated request from a user
    # who's signed in but hasn't finished onboarding yet (no `users` row)
    # hit this exact gap and 500'd instead of cleanly 404ing.
    if not result or not result.data:
        # Onboarding is a frontend + Supabase-direct concern in this PRD
        # (no dedicated "create profile" endpoint) — see backend/README.md.
        raise HTTPException(status_code=404, detail="User profile not found — complete onboarding first")

    return result.data
