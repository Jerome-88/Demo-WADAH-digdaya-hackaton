from fastapi import APIRouter

from app.db import get_supabase
from app.models.talents import TalentsResponse

router = APIRouter(tags=["talents"])


# Public, no auth — this is the real (not curated-demo) talent pool an
# UMKM's "Find Talent" dashboard browses: only users who actually finished
# the whole journey (POST /user/certify, after passing the skill's
# certification exam) show up here, newest-certified first.
@router.get("/talents", response_model=TalentsResponse)
def list_talents(skill: str | None = None):
    supabase = get_supabase()
    query = supabase.table("users").select("id, name, skill, avatar_url, certified_at").not_.is_("certified_at", "null")
    if skill:
        query = query.eq("skill", skill)
    result = query.order("certified_at", desc=True).execute()
    return TalentsResponse(talents=result.data or [])
