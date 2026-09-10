// Port of backend/app/routers/mentor.py.
import { Hono } from "npm:hono@4";
import { getSupabase } from "../lib/db.ts";
import { getCurrentUser, HttpError } from "../lib/auth.ts";
import { getUnit } from "../lib/content.ts";
import {
  FREE_CONTEXT_MESSAGES,
  FREE_DAILY_LIMIT,
  PREMIUM_CONTEXT_MESSAGES,
  askGemini,
  buildSystemPrompt,
  getRollingContext,
  messagesUsedToday,
  saveMessage,
  trimContextForFreeTier,
} from "../lib/mentor.ts";

const app = new Hono();

// Same fictional talent used across the frontend demo (RinaSubmit, the
// certificate, TalentPortfolioPage) — see /mentor/chat-demo below.
const DEMO_USER = { id: "demo", name: "Rina Kusumawati", skill: "Desain Grafis", xp: 60, streak: 3, is_premium: false };

// /mentor/chat-demo has no auth (see its own comment below), so it can't be
// rate-limited per-user like /mentor/chat is — this limits per client IP
// instead, persisted in the `demo_mentor_rate_limit` table (migration
// 20260910145342). An in-memory Map was tried first and measured to give
// zero actual protection: Supabase's Edge Runtime hands each invocation its
// own isolate (confirmed via a distinct x-deno-execution-id on every single
// request, including back-to-back sequential ones), so module-level state
// doesn't survive between requests at all — this must live in the DB.
//
// Read-then-write, not atomic — a burst of truly concurrent requests from
// the same IP could slip a few extra through. Acceptable here: the goal is
// a real ceiling on a public, unauthenticated, Gemini-calling endpoint,
// not exact precision under adversarial concurrency.
const DEMO_DAILY_LIMIT = 20;
const DAY_MS = 24 * 60 * 60 * 1000;

function getClientIp(c: import("npm:hono@4").Context): string {
  return (
    c.req.header("cf-connecting-ip") ||
    c.req.header("x-forwarded-for")?.split(",")[0].trim() ||
    "unknown"
  );
}

// deno-lint-ignore no-explicit-any
async function checkDemoRateLimit(supabase: any, ip: string): Promise<boolean> {
  const nowIso = new Date().toISOString();
  const { data: existing } = await supabase
    .from("demo_mentor_rate_limit")
    .select("count, window_start")
    .eq("ip", ip)
    .maybeSingle();

  if (!existing) {
    await supabase.from("demo_mentor_rate_limit").insert({ ip, count: 1, window_start: nowIso });
    return true;
  }

  const windowAgeMs = Date.now() - Date.parse(existing.window_start);
  if (windowAgeMs >= DAY_MS) {
    await supabase.from("demo_mentor_rate_limit").update({ count: 1, window_start: nowIso }).eq("ip", ip);
    return true;
  }

  if (existing.count >= DEMO_DAILY_LIMIT) return false;
  await supabase.from("demo_mentor_rate_limit").update({ count: existing.count + 1 }).eq("ip", ip);
  return true;
}

app.post("/mentor/chat", async (c) => {
  const user = await getCurrentUser(c);
  const body = await c.req.json();
  const supabase = getSupabase();
  const userId = user.id as string;
  const isPremium = user.is_premium as boolean;

  const usedToday = await messagesUsedToday(supabase, userId);
  if (!isPremium && usedToday >= FREE_DAILY_LIMIT) {
    throw new HttpError(429, "Limit chat harian tercapai — upgrade Premium untuk unlimited");
  }

  const unit = getUnit(body.unit_id);
  const systemPrompt = buildSystemPrompt(user, unit, body.unit_stage);

  const contextLimit = isPremium ? PREMIUM_CONTEXT_MESSAGES : FREE_CONTEXT_MESSAGES;
  const rollingContext = await getRollingContext(supabase, userId, contextLimit);

  const reply = await askGemini(systemPrompt, rollingContext, body.message, isPremium);

  await saveMessage(supabase, userId, "user", body.message, body.unit_id);
  await saveMessage(supabase, userId, "assistant", reply, body.unit_id);

  if (!isPremium) await trimContextForFreeTier(supabase, userId);

  return c.json({
    response: reply,
    messages_used_today: usedToday + 1,
    messages_limit: isPremium ? null : FREE_DAILY_LIMIT,
  });
});

// Auth-free, Supabase-free twin of /mentor/chat for trying the real
// Gemini-backed mentor before real auth is wired up on a given deploy.
// Rate-limited per IP (see checkDemoRateLimit above) since there's no user
// to key a per-account limit on; no persisted rolling context (the caller
// resends its own short history instead).
app.post("/mentor/chat-demo", async (c) => {
  const allowed = await checkDemoRateLimit(getSupabase(), getClientIp(c));
  if (!allowed) {
    throw new HttpError(429, "Limit chat demo harian tercapai — coba lagi besok, atau login buat chat tanpa batas ini.");
  }
  const body = await c.req.json();
  const unit = getUnit(body.unit_id);
  const systemPrompt = buildSystemPrompt(DEMO_USER, unit, body.unit_stage);
  // deno-lint-ignore no-explicit-any
  const history = (body.history ?? []).map((m: any) => ({ role: m.role, content: m.content }));
  const reply = await askGemini(systemPrompt, history, body.message, false);
  return c.json({ response: reply });
});

export default app;
