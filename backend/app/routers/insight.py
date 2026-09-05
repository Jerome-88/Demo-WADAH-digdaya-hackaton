from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.db import get_supabase
from app.dependencies import get_current_user
from app.models.insight import ConceptScore, InsightAnalyzeResponse, InsightSkillResponse, ResourceSuggestion
from app.services import content_service, insight_service
from app.services.gamification_service import WIB, today_wib

router = APIRouter(tags=["insight"])

# Mirrors backend/scripts/sync_units_from_frontend.mjs's PREFIX map and
# src/data/skillMaps.js's BACKEND_SKILL_PREFIX — both sides must agree on
# unit_id shape.
SKILL_PREFIX = {"social": "sm", "video": "ve", "desain": "dg", "ecommerce": "ec", "marketing": "mk", "ugc": "ugc"}


@router.get("/insight/skill", response_model=InsightSkillResponse)
def get_skill_insight(user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    prefix = SKILL_PREFIX.get(user["skill"])

    rows = []
    if prefix:
        result = (
            supabase.table("progress")
            .select("unit_id, quiz_attempts")
            .eq("user_id", user["id"])
            .like("unit_id", f"{prefix}-%")
            .execute()
        )
        rows = result.data or []

    concept_scores = insight_service.aggregate_concept_scores(rows)
    strengths, weaknesses = insight_service.classify(concept_scores)
    resources = insight_service.build_resources(weaknesses)

    return InsightSkillResponse(
        strengths=[ConceptScore(**s) for s in strengths],
        weaknesses=[ConceptScore(**w) for w in weaknesses],
        resources=[ResourceSuggestion(**r) for r in resources],
        is_premium=user["is_premium"],
        has_data=bool(concept_scores),
    )


@router.post("/insight/analyze", response_model=InsightAnalyzeResponse)
def analyze_skill_insight(user: dict = Depends(get_current_user)):
    if not user["is_premium"]:
        raise HTTPException(status_code=403, detail="Fitur ini khusus Premium")

    supabase = get_supabase()

    # Rate limit: 1x per day (WIB) — the analysis "tidak berubah drastis
    # dalam sehari" per the PRD, so a same-day repeat just returns the cache
    # instead of burning another Gemini call.
    cached = supabase.table("insight_analysis").select("*").eq("user_id", user["id"]).maybe_single().execute()
    if cached and cached.data:
        generated_at = datetime.fromisoformat(cached.data["generated_at"])
        if generated_at.astimezone(WIB).date() == today_wib():
            return InsightAnalyzeResponse(analysis=cached.data["analysis"], generated_at=cached.data["generated_at"])

    prefix = SKILL_PREFIX.get(user["skill"])
    rows = []
    if prefix:
        result = (
            supabase.table("progress")
            .select("unit_id, quiz_attempts, status")
            .eq("user_id", user["id"])
            .like("unit_id", f"{prefix}-%")
            .execute()
        )
        rows = result.data or []

    concept_scores = insight_service.aggregate_concept_scores(rows)
    completed_units = [
        (content_service.get_unit(r["unit_id"]) or {}).get("title", r["unit_id"])
        for r in rows
        if r.get("status") == "completed"
    ]

    system_prompt = insight_service.build_analysis_prompt(user, concept_scores, completed_units)
    analysis_text = insight_service.generate_analysis(system_prompt)
    generated_at = datetime.now(timezone.utc).isoformat()

    supabase.table("insight_analysis").upsert({
        "user_id": user["id"],
        "analysis": analysis_text,
        "generated_at": generated_at,
    }).execute()

    return InsightAnalyzeResponse(analysis=analysis_text, generated_at=generated_at)
