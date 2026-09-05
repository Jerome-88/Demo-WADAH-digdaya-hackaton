// Port of backend/app/services/mentor_service.py.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";
import { GoogleGenAI } from "npm:@google/genai@1";
import { getUnit } from "./content.ts";

const geminiClient = new GoogleGenAI({ apiKey: Deno.env.get("GEMINI_API_KEY")! });

export const FREE_DAILY_LIMIT = 10;
export const FREE_CONTEXT_MESSAGES = 2;
export const PREMIUM_CONTEXT_MESSAGES = 10;

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

const SYSTEM_PROMPT_TEMPLATE = (
  name: string,
  skill: string,
  xp: number,
  streak: number,
  unitTitle: string,
  unitStage: string,
  unitContent: string,
) => `Kamu adalah Wady, AI Mentor di platform WADAH. Bersikap friendly, casual, dan suportif.

KONTEKS USER:
- Nama: ${name}
- Skill: ${skill}
- XP: ${xp} | Streak: ${streak} hari
- Sedang belajar: ${unitTitle}
- Stage saat ini: ${unitStage}

MATERI UNIT YANG SEDANG DIPELAJARI:
${unitContent}

ATURAN PERILAKU:
- Stage 'materi': Jawab pertanyaan tentang konsep secara lengkap
- Stage 'quiz': JANGAN berikan jawaban langsung. Berikan hint atau ajukan pertanyaan balik
- Stage 'checkpoint': Jadilah sparring partner. JANGAN kerjakan task untuk user. Bantu user berpikir mandiri
- Kalau pertanyaan di luar konteks unit: redirect pelan-pelan ke materi yang sedang dipelajari
- Gunakan bahasa Indonesia yang casual dan encouraging
`;

// deno-lint-ignore no-explicit-any
export function buildSystemPrompt(user: Record<string, any>, unit: Record<string, any> | null, unitStage: string): string {
  return SYSTEM_PROMPT_TEMPLATE(
    user.name,
    user.skill,
    user.xp ?? 0,
    user.streak ?? 0,
    unit ? unit.title : "Materi umum",
    unitStage,
    unit ? unit.content : "(konten unit belum tersedia)",
  );
}

function todayStartWibIso(): string {
  const nowMs = Date.now();
  const wibMs = nowMs + WIB_OFFSET_MS;
  const wibDate = new Date(wibMs);
  const midnightWibMs = Date.UTC(wibDate.getUTCFullYear(), wibDate.getUTCMonth(), wibDate.getUTCDate()) - WIB_OFFSET_MS;
  return new Date(midnightWibMs).toISOString();
}

export async function messagesUsedToday(supabase: SupabaseClient, userId: string): Promise<number> {
  const { count } = await supabase
    .from("mentor_context")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId)
    .eq("role", "user")
    .gte("created_at", todayStartWibIso());
  return count ?? 0;
}

// deno-lint-ignore no-explicit-any
export async function getRollingContext(supabase: SupabaseClient, userId: string, limit: number): Promise<any[]> {
  const { data } = await supabase
    .from("mentor_context")
    .select("role, content")
    .eq("user_id", userId)
    .order("created_at", { ascending: false })
    .limit(limit);
  return (data ?? []).slice().reverse();
}

export async function saveMessage(
  supabase: SupabaseClient,
  userId: string,
  role: "user" | "assistant",
  content: string,
  unitId: string,
): Promise<void> {
  await supabase.from("mentor_context").insert({ user_id: userId, role, content, unit_id: unitId });
}

// Bounds free-tier storage by dropping everything before today (not a flat
// "keep newest 2" — deleting today's own rows would corrupt
// messagesUsedToday's count). The rolling context sent to Gemini is already
// independently capped by getRollingContext's own .limit().
export async function trimContextForFreeTier(supabase: SupabaseClient, userId: string): Promise<void> {
  await supabase.from("mentor_context").delete().eq("user_id", userId).lt("created_at", todayStartWibIso());
}

// deno-lint-ignore no-explicit-any
export async function askGemini(systemPrompt: string, rollingContext: any[], message: string, isPremium: boolean): Promise<string> {
  const modelName = isPremium ? Deno.env.get("GEMINI_MODEL_PREMIUM")! : Deno.env.get("GEMINI_MODEL_FREE")!;

  const history = rollingContext.map((m) => ({
    role: m.role === "user" ? "user" : "model",
    parts: [{ text: m.content }],
  }));

  const chat = geminiClient.chats.create({
    model: modelName,
    config: { systemInstruction: systemPrompt },
    history,
  });
  const response = await chat.sendMessage({ message });
  return response.text ?? "";
}

export { getUnit };
