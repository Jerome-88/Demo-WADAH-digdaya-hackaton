from fastapi import APIRouter, Depends, HTTPException

from app.db import get_supabase
from app.dependencies import get_current_user
from app.models.mentor import MentorChatDemoRequest, MentorChatDemoResponse, MentorChatRequest, MentorChatResponse
from app.services import content_service, mentor_service

router = APIRouter(tags=["mentor"])

# Same fictional talent used across the frontend demo (RinaSubmit, the
# certificate, TalentPortfolioPage) — see /mentor/chat-demo below.
_DEMO_USER = {"id": "demo", "name": "Rina Kusumawati", "skill": "Desain Grafis", "xp": 60, "streak": 3, "is_premium": False}


@router.post("/mentor/chat", response_model=MentorChatResponse)
def chat(body: MentorChatRequest, user: dict = Depends(get_current_user)):
    supabase = get_supabase()
    user_id = user["id"]
    is_premium = user["is_premium"]

    used_today = mentor_service.messages_used_today(supabase, user_id)
    if not is_premium and used_today >= mentor_service.FREE_DAILY_LIMIT:
        raise HTTPException(status_code=429, detail="Limit chat harian tercapai — upgrade Premium untuk unlimited")

    unit = content_service.get_unit(body.unit_id)
    system_prompt = mentor_service.build_system_prompt(user, unit, body.unit_stage)

    context_limit = mentor_service.PREMIUM_CONTEXT_MESSAGES if is_premium else mentor_service.FREE_CONTEXT_MESSAGES
    rolling_context = mentor_service.get_rolling_context(supabase, user_id, context_limit)

    reply = mentor_service.ask_gemini(system_prompt, rolling_context, body.message, is_premium)

    mentor_service.save_message(supabase, user_id, "user", body.message, body.unit_id)
    mentor_service.save_message(supabase, user_id, "assistant", reply, body.unit_id)

    if not is_premium:
        mentor_service.trim_context_for_free_tier(supabase, user_id)

    return MentorChatResponse(
        response=reply,
        messages_used_today=used_today + 1,
        messages_limit=None if is_premium else mentor_service.FREE_DAILY_LIMIT,
    )


@router.post("/mentor/chat-demo", response_model=MentorChatDemoResponse)
def chat_demo(body: MentorChatDemoRequest):
    """Auth-free, Supabase-free twin of /mentor/chat for trying the real
    Gemini-backed mentor from the frontend before a real Supabase project
    exists. No rate limiting, no persisted rolling context (the caller
    resends its own short history instead) — NOT the PRD-compliant
    endpoint, just a way to prove the frontend<->backend<->Gemini path
    actually works end to end. Swap the frontend over to /mentor/chat once
    real auth + Supabase are wired up.
    """
    unit = content_service.get_unit(body.unit_id)
    system_prompt = mentor_service.build_system_prompt(_DEMO_USER, unit, body.unit_stage)
    history = [m.model_dump() for m in body.history]
    reply = mentor_service.ask_gemini(system_prompt, history, body.message, is_premium=False)
    return MentorChatDemoResponse(response=reply)
