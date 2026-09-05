from datetime import datetime

from google import genai
from google.genai import types
from supabase import Client

from app.config import settings
from app.services.gamification_service import WIB

_client = genai.Client(api_key=settings.GEMINI_API_KEY)

FREE_DAILY_LIMIT = 10
FREE_CONTEXT_MESSAGES = 2
PREMIUM_CONTEXT_MESSAGES = 10

SYSTEM_PROMPT_TEMPLATE = """Kamu adalah Wady, AI Mentor di platform WADAH. Bersikap friendly, casual, dan suportif.

KONTEKS USER:
- Nama: {name}
- Skill: {skill}
- XP: {xp} | Streak: {streak} hari
- Sedang belajar: {unit_title}
- Stage saat ini: {unit_stage}

MATERI UNIT YANG SEDANG DIPELAJARI:
{unit_content}

ATURAN PERILAKU:
- Stage 'materi': Jawab pertanyaan tentang konsep secara lengkap
- Stage 'quiz': JANGAN berikan jawaban langsung. Berikan hint atau ajukan pertanyaan balik
- Stage 'checkpoint': Jadilah sparring partner. JANGAN kerjakan task untuk user. Bantu user berpikir mandiri
- Kalau pertanyaan di luar konteks unit: redirect pelan-pelan ke materi yang sedang dipelajari
- Gunakan bahasa Indonesia yang casual dan encouraging
"""


def build_system_prompt(user: dict, unit: dict | None, unit_stage: str) -> str:
    return SYSTEM_PROMPT_TEMPLATE.format(
        name=user["name"],
        skill=user["skill"],
        xp=user.get("xp", 0),
        streak=user.get("streak", 0),
        unit_title=unit["title"] if unit else "Materi umum",
        unit_stage=unit_stage,
        unit_content=unit["content"] if unit else "(konten unit belum tersedia)",
    )


def _today_start_wib_iso() -> str:
    """Today's 00:00 WIB as an offset-aware ISO string — Postgres compares
    it correctly regardless of the DB column's own timezone.
    """
    now_wib = datetime.now(WIB)
    midnight_wib = now_wib.replace(hour=0, minute=0, second=0, microsecond=0)
    return midnight_wib.isoformat()


def messages_used_today(supabase: Client, user_id: str) -> int:
    result = (
        supabase.table("mentor_context")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("role", "user")
        .gte("created_at", _today_start_wib_iso())
        .execute()
    )
    return result.count or 0


def get_rolling_context(supabase: Client, user_id: str, limit: int) -> list[dict]:
    result = (
        supabase.table("mentor_context")
        .select("role, content")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .limit(limit)
        .execute()
    )
    return list(reversed(result.data or []))


def save_message(supabase: Client, user_id: str, role: str, content: str, unit_id: str) -> None:
    supabase.table("mentor_context").insert({
        "user_id": user_id,
        "role": role,
        "content": content,
        "unit_id": unit_id,
    }).execute()


def trim_context_for_free_tier(supabase: Client, user_id: str) -> None:
    """Bounds free-tier storage by dropping everything before today.

    This intentionally only deletes rows from *previous* days, not a flat
    "keep newest 2" — deleting today's own rows would corrupt
    `messages_used_today`'s count (it was doing exactly that: after the
    2nd message of the day it silently capped the count at 1 forever,
    defeating the 10/day limit for every message after the 2nd). The
    rolling context sent to Gemini is already independently capped by
    `get_rolling_context`'s own `.limit()`, so trimming doesn't need to
    enforce that too.
    """
    supabase.table("mentor_context").delete().eq("user_id", user_id).lt(
        "created_at", _today_start_wib_iso()
    ).execute()


def ask_gemini(system_prompt: str, rolling_context: list[dict], message: str, is_premium: bool) -> str:
    model_name = settings.GEMINI_MODEL_PREMIUM if is_premium else settings.GEMINI_MODEL_FREE

    history = [
        types.Content(
            role="user" if m["role"] == "user" else "model",
            parts=[types.Part(text=m["content"])],
        )
        for m in rolling_context
    ]
    chat = _client.chats.create(
        model=model_name,
        config=types.GenerateContentConfig(system_instruction=system_prompt),
        history=history,
    )
    response = chat.send_message(message)
    return response.text
