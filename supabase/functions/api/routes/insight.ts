// Port of backend/app/routers/insight.py.
import { Hono } from "npm:hono@4";
import { getSupabase } from "../lib/db.ts";
import { getCurrentUser, HttpError } from "../lib/auth.ts";
import { getUnit } from "../lib/content.ts";
import {
  aggregateConceptScores,
  buildAnalysisPrompt,
  buildResources,
  classify,
  generateAnalysis,
} from "../lib/insight.ts";

const app = new Hono();

// Mirrors backend/scripts/sync_units_from_frontend.mjs's PREFIX map and
// src/data/skillMaps.js's BACKEND_SKILL_PREFIX — both sides must agree on
// unit_id shape.
const SKILL_PREFIX: Record<string, string> = { social: "sm", video: "ve", desain: "dg", ecommerce: "ec", marketing: "mk", ugc: "ugc" };

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;
function wibDateOf(isoString: string): string {
  return new Date(Date.parse(isoString) + WIB_OFFSET_MS).toISOString().slice(0, 10);
}

app.get("/insight/skill", async (c) => {
  const user = await getCurrentUser(c);
  const supabase = getSupabase();
  const prefix = SKILL_PREFIX[user.skill as string];

  // deno-lint-ignore no-explicit-any
  let rows: any[] = [];
  if (prefix) {
    const { data } = await supabase
      .from("progress")
      .select("unit_id, quiz_attempts")
      .eq("user_id", user.id as string)
      .like("unit_id", `${prefix}-%`);
    rows = data ?? [];
  }

  const conceptScores = aggregateConceptScores(rows);
  const [strengths, weaknesses] = classify(conceptScores);
  const resources = buildResources(weaknesses);

  return c.json({
    strengths,
    weaknesses,
    resources,
    is_premium: user.is_premium,
    has_data: Object.keys(conceptScores).length > 0,
  });
});

app.post("/insight/analyze", async (c) => {
  const user = await getCurrentUser(c);
  if (!user.is_premium) throw new HttpError(403, "Fitur ini khusus Premium");

  const supabase = getSupabase();

  // Rate limit: 1x per day (WIB) — a same-day repeat just returns the
  // cache instead of burning another Gemini call.
  const { data: cached } = await supabase.from("insight_analysis").select("*").eq("user_id", user.id as string).maybeSingle();
  if (cached && wibDateOf(cached.generated_at) === wibDateOf(new Date().toISOString())) {
    return c.json({ analysis: cached.analysis, generated_at: cached.generated_at });
  }

  const prefix = SKILL_PREFIX[user.skill as string];
  // deno-lint-ignore no-explicit-any
  let rows: any[] = [];
  if (prefix) {
    const { data } = await supabase
      .from("progress")
      .select("unit_id, quiz_attempts, status")
      .eq("user_id", user.id as string)
      .like("unit_id", `${prefix}-%`);
    rows = data ?? [];
  }

  const conceptScores = aggregateConceptScores(rows);
  const completedUnits = rows
    .filter((r) => r.status === "completed")
    .map((r) => getUnit(r.unit_id)?.title ?? r.unit_id);

  const systemPrompt = buildAnalysisPrompt(user, conceptScores, completedUnits);
  const analysisText = await generateAnalysis(systemPrompt);
  const generatedAt = new Date().toISOString();

  await supabase.from("insight_analysis").upsert({ user_id: user.id as string, analysis: analysisText, generated_at: generatedAt });

  return c.json({ analysis: analysisText, generated_at: generatedAt });
});

export default app;
