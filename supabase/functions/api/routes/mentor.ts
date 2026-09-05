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
// Gemini-backed mentor before real auth is wired up on a given deploy. No
// rate limiting, no persisted rolling context (the caller resends its own
// short history instead).
app.post("/mentor/chat-demo", async (c) => {
  const body = await c.req.json();
  const unit = getUnit(body.unit_id);
  const systemPrompt = buildSystemPrompt(DEMO_USER, unit, body.unit_stage);
  // deno-lint-ignore no-explicit-any
  const history = (body.history ?? []).map((m: any) => ({ role: m.role, content: m.content }));
  const reply = await askGemini(systemPrompt, history, body.message, false);
  return c.json({ response: reply });
});

export default app;
