from fastapi import APIRouter

from app.db import get_supabase
from app.models.matching import MatchedTalent, MatchingResponse

router = APIRouter(tags=["matching"])


# Public + hardcoded per PRD section 3.7 — real matching/escrow is out of
# MVP scope; the UMKM-client side of the marketplace is dummy for now.
@router.get("/matching", response_model=MatchingResponse)
def get_matching(skill: str, budget: int | None = None):
    supabase = get_supabase()

    # No `.limit()` here — sort first, *then* take the top 3, otherwise
    # Postgres could hand back 3 rows that don't include Rina at all once
    # more than 3 users share a skill, breaking the demo guarantee below.
    result = supabase.table("users").select("name, skill").eq("skill", skill).execute()
    rows = result.data or []
    # "Rina selalu jadi kartu #1 untuk keperluan demo" (PRD 3.7).
    rows.sort(key=lambda r: 0 if r["name"] == "Rina Kusumawati" else 1)

    talents = [
        MatchedTalent(name=row["name"], skill=row["skill"], score=None, verified_portfolio=True)
        for row in rows[:3]
    ]
    return MatchingResponse(talents=talents)
