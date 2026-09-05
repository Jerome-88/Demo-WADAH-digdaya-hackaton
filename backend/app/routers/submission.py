from datetime import datetime, timezone

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile

from app.db import get_supabase
from app.dependencies import get_current_user
from app.models.submission import SubmissionResponse
from app.services import content_service, storage_service
from app.services import gamification_service as gam_service

router = APIRouter(tags=["submission"])

MAX_REVISIONS = 2


@router.post("/submission", response_model=SubmissionResponse)
async def create_submission(
    unit_id: str = Form(...),
    content_text: str = Form(""),
    file: UploadFile | None = File(None),
    user: dict = Depends(get_current_user),
):
    supabase = get_supabase()
    user_id = user["id"]

    if not content_service.is_checkpoint(unit_id):
        raise HTTPException(status_code=400, detail="Endpoint ini khusus unit checkpoint")

    latest = (
        supabase.table("submissions")
        .select("*")
        .eq("user_id", user_id)
        .eq("unit_id", unit_id)
        .order("submitted_at", desc=True)
        .limit(1)
        .execute()
    )
    previous = latest.data[0] if latest.data else None

    if previous and previous["status"] == "pending":
        raise HTTPException(status_code=400, detail="Submission sebelumnya masih dalam review")
    if previous and previous["status"] == "approved":
        raise HTTPException(status_code=400, detail="Unit ini sudah disetujui")
    if previous and previous["status"] == "revision_requested" and previous["revision_count"] >= MAX_REVISIONS:
        # Reflect the terminal state in the DB — otherwise this submission
        # sits at 'revision_requested' forever, indistinguishable from one
        # that's still resubmittable (PRD 4.4: "Setelah 2 revisi gagal →
        # status failed").
        supabase.table("submissions").update({"status": "failed"}).eq("id", previous["id"]).execute()
        raise HTTPException(status_code=400, detail="Maksimal revisi tercapai — ulangi unit dari awal")

    revision_count = (previous["revision_count"] + 1) if previous else 0

    content_url = None
    if file is not None:
        file_bytes = await file.read()
        content_url = storage_service.upload_submission_file(
            supabase,
            user_id,
            unit_id,
            file.filename,
            file_bytes,
            file.content_type or "application/octet-stream",
        )

    # `content_url` is stored as the raw private-bucket path (e.g.
    # "user_id/unit_id/uuid.png"), never a public URL — PRD section 6:
    # "Supabase Storage: private bucket, akses via signed URL". Callers
    # only ever see a signed, time-limited URL (see _to_response below).
    inserted = supabase.table("submissions").insert({
        "user_id": user_id,
        "unit_id": unit_id,
        "content_url": content_url,
        "content_text": content_text or None,
        "status": "pending",
        "revision_count": revision_count,
        "submitted_at": datetime.now(timezone.utc).isoformat(),
    }).execute()

    # Freeze streak decay while the reviewer is (manually) working through
    # this — PRD 3.5 / 4.2. Approval itself, and the XP/portfolio it
    # triggers, happens via a DB trigger once a human flips the status in
    # Supabase Studio (see sql/schema.sql) — there is no reviewer endpoint
    # by design (PRD section 9).
    gam_service.freeze_streak_for_checkpoint(supabase, user_id)

    return _to_response(supabase, inserted.data[0])


@router.get("/submission/my", response_model=list[SubmissionResponse])
def my_submissions(user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    result = (
        supabase.table("submissions")
        .select("*")
        .eq("user_id", user["id"])
        .order("submitted_at", desc=True)
        .execute()
    )
    return [_to_response(supabase, row) for row in (result.data or [])]


def _to_response(supabase, row: dict) -> dict:
    """Swaps the stored private-bucket path for a signed URL right before
    the row leaves the API — the raw path is meaningless to a client that
    only ever holds the anon key.
    """
    if row.get("content_url"):
        row = {**row, "content_url": storage_service.get_signed_url(supabase, row["content_url"])}
    return row
