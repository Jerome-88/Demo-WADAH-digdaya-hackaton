// Port of backend/app/services/insight_service.py.
import { GoogleGenAI } from "npm:@google/genai@1";

const geminiClient = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY")! });

export const STRENGTH_THRESHOLD = 80;
export const WEAKNESS_THRESHOLD = 70;

// Hardcoded per PRD 4.1 ("bukan AI") — covers the concept tags currently
// authored for Desain Grafis (see src/data/skillMaps.js). Untagged skills'
// weaknesses fall through to GENERIC_QUERY.
const RESOURCE_MAP: Record<string, string> = {
  canvas_dimensions: "ukuran kanvas desain feed instagram umkm",
  typography: "tipografi poster promosi umkm indonesia",
  color_psychology: "psikologi warna brand lokal indonesia",
  brief_interpretation: "cara membaca brief klien desainer freelance",
  layout_composition: "komposisi layout poster produk lokal",
  visual_hierarchy: "hierarki visual desain grafis pemula",
  brand_consistency: "brand guideline sederhana untuk umkm",
  visual_research: "membuat moodboard desain sebelum eksekusi",
  client_presentation: "cara presentasi hasil desain ke klien",
};
const GENERIC_QUERY = "dasar desain grafis untuk umkm indonesia";

const SYSTEM_PROMPT_TEMPLATE = (name: string, skill: string, scoresText: string, unitsText: string) =>
  `Kamu adalah Wady, AI Mentor di WADAH. Bersikap friendly, casual, dan spesifik.

DATA PERFORMA USER:
Nama: ${name}
Skill: ${skill}

Quiz scores per konsep:
${scoresText}

Materi yang sudah dipelajari:
${unitsText}

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
`;

interface ConceptScoreRow {
  concept: string;
  score: number;
}

// Flattens every row's quiz_attempts, groups by concept_tag, and averages
// correctness into a 0-100 score per concept. Attempts with a null
// concept_tag (untagged skills) are dropped, not just uncounted.
// deno-lint-ignore no-explicit-any
export function aggregateConceptScores(progressRows: Record<string, any>[]): Record<string, number> {
  const tallies: Record<string, boolean[]> = {};
  for (const row of progressRows) {
    for (const attempt of row.quiz_attempts ?? []) {
      const tag = attempt.concept_tag;
      if (!tag) continue;
      (tallies[tag] ??= []).push(Boolean(attempt.correct));
    }
  }
  const scores: Record<string, number> = {};
  for (const [tag, results] of Object.entries(tallies)) {
    scores[tag] = Math.round((100 * results.filter(Boolean).length) / results.length);
  }
  return scores;
}

export function classify(conceptScores: Record<string, number>): [ConceptScoreRow[], ConceptScoreRow[]] {
  const strengths = Object.entries(conceptScores)
    .filter(([, s]) => s >= STRENGTH_THRESHOLD)
    .map(([concept, score]) => ({ concept, score }))
    .sort((a, b) => b.score - a.score);
  const weaknesses = Object.entries(conceptScores)
    .filter(([, s]) => s < WEAKNESS_THRESHOLD)
    .map(([concept, score]) => ({ concept, score }))
    .sort((a, b) => a.score - b.score);
  return [strengths, weaknesses];
}

export function buildResources(weaknesses: ConceptScoreRow[]): { weakness: string; search_query: string }[] {
  return weaknesses.map((w) => ({
    weakness: w.concept,
    search_query: RESOURCE_MAP[w.concept] ?? GENERIC_QUERY,
  }));
}

export function buildAnalysisPrompt(
  // deno-lint-ignore no-explicit-any
  user: Record<string, any>,
  conceptScores: Record<string, number>,
  completedUnits: string[],
): string {
  const scoresText = Object.entries(conceptScores)
    .map(([tag, score]) => `- ${tag}: ${score}%`)
    .join("\n") || "(belum ada data quiz)";
  const unitsText = completedUnits.length > 0 ? completedUnits.join(", ") : "(belum ada unit selesai)";
  return SYSTEM_PROMPT_TEMPLATE(user.name, user.skill, scoresText, unitsText);
}

// One-shot, no rolling history needed — reuses the mentor's exact
// chat-based call shape for consistency (already proven working there).
export async function generateAnalysis(systemPrompt: string): Promise<string> {
  const chat = geminiClient.chats.create({
    model: Deno.env.get("GEMINI_MODEL_PREMIUM")!,
    config: { systemInstruction: systemPrompt },
    history: [],
  });
  const response = await chat.sendMessage({ message: "Analisis performa belajar saya berdasarkan data di atas." });
  return response.text ?? "";
}
