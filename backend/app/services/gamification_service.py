from datetime import date, datetime, timedelta, timezone

from supabase import Client

# Lives reset at 00:00 WIB (PRD 4.1), so all "today" boundaries here use
# this offset rather than server-local/UTC time.
WIB = timezone(timedelta(hours=7))

FREE_LIVES = 5
PREMIUM_LIVES = 15

XP_PER_UNIT = 30
XP_PER_LEVEL = 200
MAX_LEVEL = 10

# PRD 4.3 — XP by revision count on checkpoint approval.
XP_BY_REVISION_COUNT = {0: 150, 1: 120}
XP_AFTER_MAX_REVISIONS = 100


def today_wib() -> date:
    return datetime.now(WIB).date()


def compute_level(xp: int) -> int:
    return min(xp // XP_PER_LEVEL + 1, MAX_LEVEL)


def xp_for_revision_count(revision_count: int) -> int:
    return XP_BY_REVISION_COUNT.get(revision_count, XP_AFTER_MAX_REVISIONS)


def get_or_create_gamification(supabase: Client, user_id: str, is_premium: bool) -> dict:
    result = supabase.table("gamification").select("*").eq("user_id", user_id).maybe_single().execute()
    # .maybe_single().execute() returns None outright (not a response with
    # data=None) when zero rows match — the common case here, since this is
    # exactly what runs on a brand new real user's very first action.
    if result and result.data:
        return _apply_daily_resets(supabase, result.data, is_premium)

    inserted = supabase.table("gamification").insert({
        "user_id": user_id,
        "xp": 0,
        "lives": PREMIUM_LIVES if is_premium else FREE_LIVES,
        "lives_reset_at": today_wib().isoformat(),
        "streak": 0,
    }).execute()
    return inserted.data[0]


def _apply_daily_resets(supabase: Client, gam: dict, is_premium: bool) -> dict:
    """Lazily applies both daily resets on read, instead of relying on a
    scheduled job that isn't part of this MVP's infra:
    - lives: reset to the tier's max once `lives_reset_at` is stale (4.1)
    - streak: zeroed once more than a day has passed with no activity,
      unless still inside `streak_freeze_until` from an in-review checkpoint (4.2)
    """
    today = today_wib()
    updates = {}

    reset_at = date.fromisoformat(gam["lives_reset_at"]) if gam.get("lives_reset_at") else None
    if reset_at != today:
        updates["lives"] = PREMIUM_LIVES if is_premium else FREE_LIVES
        updates["lives_reset_at"] = today.isoformat()

    last_active = date.fromisoformat(gam["last_active_date"]) if gam.get("last_active_date") else None
    freeze_until = date.fromisoformat(gam["streak_freeze_until"]) if gam.get("streak_freeze_until") else None
    inactive_gap = last_active is not None and last_active < today - timedelta(days=1)
    frozen = freeze_until is not None and freeze_until >= today
    if inactive_gap and not frozen and gam["streak"] != 0:
        updates["streak"] = 0

    if not updates:
        return gam

    updated = supabase.table("gamification").update(updates).eq("user_id", gam["user_id"]).execute()
    return updated.data[0]


def deduct_life_for_unit_open(supabase: Client, user_id: str, gam: dict) -> dict:
    """Costs 1 life the first time a unit is opened; reopening an
    already-opened unit is free (checked by the caller before this runs).
    """
    if gam["lives"] <= 0:
        raise ValueError("Tidak ada lives tersisa — tunggu reset esok hari atau upgrade Premium")

    updated = supabase.table("gamification").update({"lives": gam["lives"] - 1}).eq("user_id", user_id).execute()
    return updated.data[0]


def award_unit_xp(supabase: Client, user_id: str, gam: dict) -> dict:
    updated = supabase.table("gamification").update({"xp": gam["xp"] + XP_PER_UNIT}).eq("user_id", user_id).execute()
    return updated.data[0]


def update_streak_on_activity(supabase: Client, user_id: str, gam: dict) -> dict:
    """+1 if the user was also active yesterday (or is resuming inside an
    active `streak_freeze_until` window from an in-review checkpoint —
    without this, a multi-day freeze meant to protect the streak would
    still get wiped to 1 the moment they complete a regular unit), reset
    to 1 after a genuine gap, unchanged if this is a second completion on
    the same day.
    """
    today = today_wib()
    last_active = date.fromisoformat(gam["last_active_date"]) if gam.get("last_active_date") else None
    freeze_until = date.fromisoformat(gam["streak_freeze_until"]) if gam.get("streak_freeze_until") else None
    frozen = freeze_until is not None and freeze_until >= today

    if last_active == today:
        new_streak = gam["streak"]
    elif last_active == today - timedelta(days=1) or frozen:
        new_streak = gam["streak"] + 1
    else:
        new_streak = 1

    updated = supabase.table("gamification").update({
        "streak": new_streak,
        "last_active_date": today.isoformat(),
    }).eq("user_id", user_id).execute()
    return updated.data[0]


def freeze_streak_for_checkpoint(supabase: Client, user_id: str) -> None:
    """PRD 3.5 / 4.2 — entering a checkpoint task freezes streak decay for
    up to 7 days while the submission is in review.
    """
    freeze_until = today_wib() + timedelta(days=7)
    supabase.table("gamification").update({
        "streak_freeze_until": freeze_until.isoformat(),
    }).eq("user_id", user_id).execute()
