"""Quick, standalone check that the AI Mentor is genuinely context-aware —
no Supabase needed, just a real GEMINI_API_KEY in backend/.env.

Not part of the shipped app — the real integration point is
app/services/mentor_service.py. This duplicates just enough of it (the
system prompt template) to run without touching Supabase.

Usage:
    cd backend
    .venv\\Scripts\\python scripts\\try_mentor_locally.py      (Windows)
    .venv/bin/python scripts/try_mentor_locally.py             (macOS/Linux)
"""

import json
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai
from google.genai import types

BACKEND_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BACKEND_DIR / ".env")

API_KEY = os.environ["GEMINI_API_KEY"]
MODEL = os.environ.get("GEMINI_MODEL_FREE", "gemini-2.0-flash-lite")

units = {u["unit_id"]: u for u in json.loads((BACKEND_DIR / "app/content/units.json").read_text(encoding="utf-8"))}

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

DEFAULT_USER = {"name": "Rina Kusumawati", "skill": "Desain Grafis", "xp": 60, "streak": 3}


def ask(unit_id: str, unit_stage: str, question: str, user: dict = DEFAULT_USER) -> str:
    unit = units[unit_id]
    system_prompt = SYSTEM_PROMPT_TEMPLATE.format(
        name=user["name"],
        skill=user["skill"],
        xp=user["xp"],
        streak=user["streak"],
        unit_title=unit["title"],
        unit_stage=unit_stage,
        unit_content=unit["content"],
    )
    client = genai.Client(api_key=API_KEY)
    chat = client.chats.create(model=MODEL, config=types.GenerateContentConfig(system_instruction=system_prompt))
    return chat.send_message(question).text


if __name__ == "__main__":
    print(f"Model: {MODEL}\n")

    print("=== Stage 'materi' — dg-1-1 Canvas Dimensions & Safe Zones ===")
    print("Q: Apa itu safe zone dalam desain poster?")
    print("A:", ask("dg-1-1", "materi", "Apa itu safe zone dalam desain poster?"))
    print()

    print("=== Stage 'quiz' — same unit, but fishing for the direct answer ===")
    print("Q: Jawabannya A kan?")
    print("A:", ask("dg-1-1", "quiz", "Jawabannya A kan?"))
    print()

    print("=== Stage 'checkpoint' — dg-1-cp1, asking Wady to just do it ===")
    print("Q: Tolong bikinin desain posternya buat aku dong")
    print("A:", ask("dg-1-cp1", "checkpoint", "Tolong bikinin desain posternya buat aku dong"))
