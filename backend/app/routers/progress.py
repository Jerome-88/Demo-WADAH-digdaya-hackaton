from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from postgrest.exceptions import APIError

from app.db import get_supabase
from app.dependencies import get_current_user
from app.models.progress import (
    ProgressItem,
    UnitCompleteRequest,
    UnitCompleteResponse,
    UnitOpenRequest,
    UnitOpenResponse,
)
from app.services import content_service
from app.services import gamification_service as gam_service

router = APIRouter(tags=["progress"])


@router.get("/progress", response_model=list[ProgressItem])
def list_progress(user: dict = Depends(get_current_user)):
    """Full progress history for the current user — lets the frontend
    reconstruct completed/opened unit state after a page reload, since
    /unit/open and /unit/complete only ever touch one row at a time."""
    supabase = get_supabase()
    result = (
        supabase.table("progress")
        .select("unit_id,status,score,opened_at,completed_at")
        .eq("user_id", user["id"])
        .execute()
    )
    return result.data or []


@router.post("/unit/open", response_model=UnitOpenResponse)
def open_unit(body: UnitOpenRequest, user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    user_id = user["id"]

    existing = (
        supabase.table("progress")
        .select("*")
        .eq("user_id", user_id)
        .eq("unit_id", body.unit_id)
        .maybe_single()
        .execute()
    )
    gam = gam_service.get_or_create_gamification(supabase, user_id, user["is_premium"])

    # Already opened before — free to reopen, no life cost (PRD 4.1).
    # .maybe_single().execute() returns None outright (not a response with
    # data=None) when zero rows match — guard against that, not just
    # against `.data` itself being falsy.
    if existing and existing.data:
        return UnitOpenResponse(lives_deducted=False, lives_remaining=gam["lives"], already_opened=True)

    # Checkpoints don't cost lives either (PRD 4.1: "Task simulasi
    # checkpoint = tidak kena lives") — only regular units do.
    lives_deducted = False
    if not content_service.is_checkpoint(body.unit_id):
        try:
            gam = gam_service.deduct_life_for_unit_open(supabase, user_id, gam)
        except ValueError as exc:
            raise HTTPException(status_code=400, detail=str(exc)) from exc
        lives_deducted = True

    try:
        supabase.table("progress").insert({
            "user_id": user_id,
            "unit_id": body.unit_id,
            "status": "opened",
            "opened_at": datetime.now(timezone.utc).isoformat(),
        }).execute()
    except APIError as exc:
        if exc.code == "23505":  # unique_violation — a concurrent request opened it first
            return UnitOpenResponse(lives_deducted=lives_deducted, lives_remaining=gam["lives"], already_opened=True)
        raise

    return UnitOpenResponse(lives_deducted=lives_deducted, lives_remaining=gam["lives"], already_opened=False)


@router.post("/unit/complete", response_model=UnitCompleteResponse)
def complete_unit(body: UnitCompleteRequest, user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    user_id = user["id"]

    if content_service.is_checkpoint(body.unit_id):
        raise HTTPException(
            status_code=400,
            detail="Unit checkpoint diselesaikan lewat POST /submission, bukan endpoint ini",
        )

    existing = (
        supabase.table("progress")
        .select("status")
        .eq("user_id", user_id)
        .eq("unit_id", body.unit_id)
        .maybe_single()
        .execute()
    )
    if not existing or not existing.data:
        raise HTTPException(status_code=404, detail="Unit belum pernah dibuka — panggil /unit/open dulu")
    # Without this guard, repeating the same request (double-click, retry)
    # re-awards +30 XP indefinitely.
    if existing.data["status"] == "completed":
        raise HTTPException(status_code=400, detail="Unit ini sudah diselesaikan sebelumnya")

    updated = (
        supabase.table("progress")
        .update({
            "status": "completed",
            "completed_at": datetime.now(timezone.utc).isoformat(),
            "score": body.quiz_score,
            "quiz_attempts": [a.model_dump() for a in body.quiz_attempts] if body.quiz_attempts else None,
        })
        .eq("user_id", user_id)
        .eq("unit_id", body.unit_id)
        .execute()
    )
    assert updated.data, "row existence already verified above"

    gam = gam_service.get_or_create_gamification(supabase, user_id, user["is_premium"])
    gam = gam_service.award_unit_xp(supabase, user_id, gam)
    gam = gam_service.update_streak_on_activity(supabase, user_id, gam)

    unit = content_service.get_unit(body.unit_id)
    next_unit_id = unit.get("next_unit_id") if unit else None

    return UnitCompleteResponse(
        status="completed",
        xp_earned=gam_service.XP_PER_UNIT,
        xp_total=gam["xp"],
        streak=gam["streak"],
        next_unit_id=next_unit_id,
    )
