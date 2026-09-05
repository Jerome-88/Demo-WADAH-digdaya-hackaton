from google import genai
from google.genai import types

from app.config import settings

_client = genai.Client(api_key=settings.GEMINI_API_KEY)

STRENGTH_THRESHOLD = 80
WEAKNESS_THRESHOLD = 70

# Hardcoded per PRD 4.1 ("bukan AI") — covers the concept tags currently
# authored for Desain Grafis (see src/data/skillMaps.js). Untagged skills'
# weaknesses fall through to GENERIC_QUERY.
RESOURCE_MAP = {
    "canvas_dimensions": "ukuran kanvas desain feed instagram umkm",
    "typography": "tipografi poster promosi umkm indonesia",
    "color_psychology": "psikologi warna brand lokal indonesia",
    "brief_interpretation": "cara membaca brief klien desainer freelance",
    "layout_composition": "komposisi layout poster produk lokal",
    "visual_hierarchy": "hierarki visual desain grafis pemula",
    "brand_consistency": "brand guideline sederhana untuk umkm",
    "visual_research": "membuat moodboard desain sebelum eksekusi",
    "client_presentation": "cara presentasi hasil desain ke klien",
}
GENERIC_QUERY = "dasar desain grafis untuk umkm indonesia"

SYSTEM_PROMPT_TEMPLATE = """Kamu adalah Wady, AI Mentor di WADAH. Bersikap friendly, casual, dan spesifik.

DATA PERFORMA USER:
Nama: {name}
Skill: {skill}

Quiz scores per konsep:
{concept_scores}

Materi yang sudah dipelajari:
{completed_units}

TUGASMU:
1. Identifikasi 1-2 kelemahan paling signifikan
2. Jelaskan kenapa mereka mungkin struggle di area itu (spesifik, bukan generik)
3. Rekomendasikan 2-3 topik pencarian YouTube yang actionable
4. Sarankan unit mana yang worth dibuka ulang kalau ada

ATURAN:
- Maksimal 150 kata
- Bahasa Indonesia casual
- Spesifik ke konteks UMKM lokal Indonesia
- Jangan generik ("belajar lebih banyak") — kasih arah yang konkret
- JANGAN rekomendasikan link langsung, cukup topik pencarian
"""


def aggregate_concept_scores(progress_rows: list[dict]) -> dict[str, int]:
    """Flattens every row's quiz_attempts, groups by concept_tag, and
    averages correctness into a 0-100 score per concept. Attempts with a
    null concept_tag (untagged skills) are dropped, not just uncounted —
    they'd otherwise silently skew nothing, but explicit is safer.
    """
    tallies: dict[str, list[bool]] = {}
    for row in progress_rows:
        for attempt in row.get("quiz_attempts") or []:
            tag = attempt.get("concept_tag")
            if not tag:
                continue
            tallies.setdefault(tag, []).append(bool(attempt.get("correct")))

    return {
        tag: round(100 * sum(results) / len(results))
        for tag, results in tallies.items()
    }


def classify(concept_scores: dict[str, int]) -> tuple[list[dict], list[dict]]:
    strengths = [{"concept": c, "score": s} for c, s in concept_scores.items() if s >= STRENGTH_THRESHOLD]
    weaknesses = [{"concept": c, "score": s} for c, s in concept_scores.items() if s < WEAKNESS_THRESHOLD]
    strengths.sort(key=lambda x: -x["score"])
    weaknesses.sort(key=lambda x: x["score"])
    return strengths, weaknesses


def build_resources(weaknesses: list[dict]) -> list[dict]:
    return [
        {"weakness": w["concept"], "search_query": RESOURCE_MAP.get(w["concept"], GENERIC_QUERY)}
        for w in weaknesses
    ]


def build_analysis_prompt(user: dict, concept_scores: dict[str, int], completed_units: list[str]) -> str:
    scores_text = "\n".join(f"- {tag}: {score}%" for tag, score in concept_scores.items()) or "(belum ada data quiz)"
    units_text = ", ".join(completed_units) if completed_units else "(belum ada unit selesai)"
    return SYSTEM_PROMPT_TEMPLATE.format(
        name=user["name"],
        skill=user["skill"],
        concept_scores=scores_text,
        completed_units=units_text,
    )


def generate_analysis(system_prompt: str) -> str:
    # One-shot, no rolling history needed — reuses mentor_service.ask_gemini's
    # exact chat-based call shape for consistency (already proven working).
    chat = _client.chats.create(
        model=settings.GEMINI_MODEL_PREMIUM,
        config=types.GenerateContentConfig(system_instruction=system_prompt),
        history=[],
    )
    response = chat.send_message("Analisis performa belajar saya berdasarkan data di atas.")
    return response.text
