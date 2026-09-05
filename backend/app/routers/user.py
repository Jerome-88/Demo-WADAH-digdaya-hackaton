from fastapi import APIRouter, Depends

from app.db import get_supabase
from app.dependencies import get_current_user
from app.models.user import UserMeResponse, UserUpdateRequest
from app.services.gamification_service import compute_level, get_or_create_gamification

router = APIRouter(tags=["user"])


def _to_response(user: dict, gam: dict) -> UserMeResponse:
    return UserMeResponse(
        id=user["id"],
        name=user["name"],
        skill=user["skill"],
        avatar_url=user.get("avatar_url"),
        is_premium=user["is_premium"],
        xp=gam["xp"],
        lives=gam["lives"],
        streak=gam["streak"],
        level=compute_level(gam["xp"]),
    )


@router.get("/user/me", response_model=UserMeResponse)
def get_me(user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    gam = get_or_create_gamification(supabase, user["id"], user["is_premium"])
    return _to_response(user, gam)


# Dedicated endpoint rather than exposing is_premium on PATCH /user/me —
# there's no real payment gateway in this MVP (fake-payment UI matching
# RinaCertification.jsx's exam-fee pattern), but this action still deserves
# a single-purpose, clearly-named endpoint rather than a generic field any
# client could set to anything.
@router.post("/user/upgrade-premium", response_model=UserMeResponse)
def upgrade_premium(user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    supabase.table("users").update({"is_premium": True}).eq("id", user["id"]).execute()
    user = {**user, "is_premium": True}
    gam = get_or_create_gamification(supabase, user["id"], user["is_premium"])
    return _to_response(user, gam)


@router.patch("/user/me", response_model=UserMeResponse)
def update_me(body: UserUpdateRequest, user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    updates = {k: v for k, v in body.model_dump(exclude_unset=True).items() if v is not None}
    if updates:
        supabase.table("users").update(updates).eq("id", user["id"]).execute()
        user = {**user, **updates}

    gam = get_or_create_gamification(supabase, user["id"], user["is_premium"])
    return _to_response(user, gam)
