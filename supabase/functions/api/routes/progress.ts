// Port of backend/app/routers/progress.py.
import { Hono } from "npm:hono@4";
import { getSupabase } from "../lib/db.ts";
import { getCurrentUser, HttpError } from "../lib/auth.ts";
import { getUnit, isCheckpoint } from "../lib/content.ts";
import {
  XP_PER_UNIT,
  awardUnitXp,
  deductLifeForUnitOpen,
  getOrCreateGamification,
  updateStreakOnActivity,
} from "../lib/gamification.ts";

const app = new Hono();

// Full progress history for the current user — lets the frontend
// reconstruct completed/opened unit state after a page reload, since
// /unit/open and /unit/complete only ever touch one row at a time.
app.get("/progress", async (c) => {
  const user = await getCurrentUser(c);
  const { data, error } = await getSupabase()
    .from("progress")
    .select("unit_id,status,score,opened_at,completed_at")
    .eq("user_id", user.id as string);
  if (error) throw error;
  return c.json(data ?? []);
});

app.post("/unit/open", async (c) => {
  const user = await getCurrentUser(c);
  const body = await c.req.json();
  const unitId = body.unit_id as string;
  const supabase = getSupabase();
  const userId = user.id as string;

  const { data: existing } = await supabase
    .from("progress")
    .select("*")
    .eq("user_id", userId)
    .eq("unit_id", unitId)
    .maybeSingle();
  let gam = await getOrCreateGamification(supabase, userId, user.is_premium as boolean);

  // Already opened before — free to reopen, no life cost (PRD 4.1).
  if (existing) {
    return c.json({ lives_deducted: false, lives_remaining: gam.lives, already_opened: true });
  }

  // Checkpoints don't cost lives either (PRD 4.1) — only regular units do.
  let livesDeducted = false;
  if (!isCheckpoint(unitId)) {
    try {
      gam = await deductLifeForUnitOpen(supabase, userId, gam);
    } catch (err) {
      throw new HttpError(400, (err as Error).message);
    }
    livesDeducted = true;
  }

  const { error: insertError } = await supabase.from("progress").insert({
    user_id: userId,
    unit_id: unitId,
    status: "opened",
    opened_at: new Date().toISOString(),
  });
  if (insertError) {
    if (insertError.code === "23505") { // unique_violation — a concurrent request opened it first
      return c.json({ lives_deducted: livesDeducted, lives_remaining: gam.lives, already_opened: true });
    }
    throw insertError;
  }

  return c.json({ lives_deducted: livesDeducted, lives_remaining: gam.lives, already_opened: false });
});

app.post("/unit/complete", async (c) => {
  const user = await getCurrentUser(c);
  const body = await c.req.json();
  const unitId = body.unit_id as string;
  const supabase = getSupabase();
  const userId = user.id as string;

  if (isCheckpoint(unitId)) {
    throw new HttpError(400, "Unit checkpoint diselesaikan lewat POST /submission, bukan endpoint ini");
  }

  const { data: existing } = await supabase
    .from("progress")
    .select("status")
    .eq("user_id", userId)
    .eq("unit_id", unitId)
    .maybeSingle();
  if (!existing) {
    throw new HttpError(404, "Unit belum pernah dibuka — panggil /unit/open dulu");
  }
  // Without this guard, repeating the same request (double-click, retry)
  // re-awards XP indefinitely.
  if (existing.status === "completed") {
    throw new HttpError(400, "Unit ini sudah diselesaikan sebelumnya");
  }

  const { data: updatedRows, error: updateError } = await supabase
    .from("progress")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
      score: body.quiz_score ?? null,
      quiz_attempts: body.quiz_attempts ?? null,
    })
    .eq("user_id", userId)
    .eq("unit_id", unitId)
    .select();
  if (updateError) throw updateError;
  if (!updatedRows?.length) throw new Error("row existence already verified above");

  let gam = await getOrCreateGamification(supabase, userId, user.is_premium as boolean);
  gam = await awardUnitXp(supabase, userId, gam);
  gam = await updateStreakOnActivity(supabase, userId, gam);

  const unit = getUnit(unitId);
  const nextUnitId = unit?.next_unit_id ?? null;

  return c.json({
    status: "completed",
    xp_earned: XP_PER_UNIT,
    xp_total: gam.xp,
    streak: gam.streak,
    next_unit_id: nextUnitId,
  });
});

export default app;
