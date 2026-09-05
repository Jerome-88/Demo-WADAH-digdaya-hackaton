from fastapi import APIRouter, HTTPException

from app.db import get_supabase
from app.models.portfolio import PortfolioResponse

router = APIRouter(tags=["portfolio"])


# Public per PRD section 3.6 — deliberately no auth dependency: this is
# what an (unauthenticated, in this MVP) UMKM client sees when checking a
# talent's verified work out.
@router.get("/portfolio/{user_id}", response_model=PortfolioResponse)
def get_portfolio(user_id: str):
    supabase = get_supabase()

    user_result = supabase.table("users").select("name, skill").eq("id", user_id).maybe_single().execute()
    if not user_result or not user_result.data:
        raise HTTPException(status_code=404, detail="User tidak ditemukan")

    items = (
        supabase.table("portfolio")
        .select("title, skill, verified, created_at")
        .eq("user_id", user_id)
        .eq("verified", True)
        .order("created_at", desc=True)
        .execute()
    )

    return PortfolioResponse(user=user_result.data, portfolio=items.data or [])
