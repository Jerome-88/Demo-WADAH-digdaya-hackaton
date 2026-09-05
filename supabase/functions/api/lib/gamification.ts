// Port of backend/app/services/gamification_service.py.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

// Lives reset at 00:00 WIB (PRD 4.1), so all "today" boundaries here use
// this offset rather than server-local/UTC time.
const WIB_OFFSET_MS = 7 * 60 * 60 * 1000;

export const FREE_LIVES = 5;
export const PREMIUM_LIVES = 15;

export const XP_PER_UNIT = 30;
export const XP_PER_LEVEL = 200;
export const MAX_LEVEL = 10;

// PRD 4.3 — XP by revision count on checkpoint approval.
const XP_BY_REVISION_COUNT: Record<number, number> = { 0: 150, 1: 120 };
const XP_AFTER_MAX_REVISIONS = 100;

function todayWib(): string {
  const wibMs = Date.now() + WIB_OFFSET_MS;
  return new Date(wibMs).toISOString().slice(0, 10); // YYYY-MM-DD
}

function daysBetween(a: string, b: string): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((Date.parse(a) - Date.parse(b)) / msPerDay);
}

export function computeLevel(xp: number): number {
  return Math.min(Math.floor(xp / XP_PER_LEVEL) + 1, MAX_LEVEL);
}

export function xpForRevisionCount(revisionCount: number): number {
  return XP_BY_REVISION_COUNT[revisionCount] ?? XP_AFTER_MAX_REVISIONS;
}

// deno-lint-ignore no-explicit-any
type Gam = Record<string, any>;

export async function getOrCreateGamification(
  supabase: SupabaseClient,
  userId: string,
  isPremium: boolean,
): Promise<Gam> {
  const { data: existing } = await supabase.from("gamification").select("*").eq("user_id", userId).maybeSingle();
  if (existing) return applyDailyResets(supabase, existing, isPremium);

  const { data: inserted, error } = await supabase
    .from("gamification")
    .insert({
      user_id: userId,
      xp: 0,
      lives: isPremium ? PREMIUM_LIVES : FREE_LIVES,
      lives_reset_at: todayWib(),
      streak: 0,
    })
    .select()
    .single();
  if (error) throw error;
  return inserted;
}

// Lazily applies both daily resets on read, instead of relying on a
// scheduled job that isn't part of this MVP's infra:
// - lives: reset to the tier's max once lives_reset_at is stale (4.1)
// - streak: zeroed once more than a day has passed with no activity,
//   unless still inside streak_freeze_until from an in-review checkpoint (4.2)
async function applyDailyResets(supabase: SupabaseClient, gam: Gam, isPremium: boolean): Promise<Gam> {
  const today = todayWib();
  // deno-lint-ignore no-explicit-any
  const updates: Record<string, any> = {};

  if (gam.lives_reset_at !== today) {
    updates.lives = isPremium ? PREMIUM_LIVES : FREE_LIVES;
    updates.lives_reset_at = today;
  }

  const lastActive: string | null = gam.last_active_date ?? null;
  const freezeUntil: string | null = gam.streak_freeze_until ?? null;
  const inactiveGap = lastActive !== null && daysBetween(today, lastActive) > 1;
  const frozen = freezeUntil !== null && daysBetween(freezeUntil, today) >= 0;
  if (inactiveGap && !frozen && gam.streak !== 0) {
    updates.streak = 0;
  }

  if (Object.keys(updates).length === 0) return gam;

  const { data: updated, error } = await supabase
    .from("gamification")
    .update(updates)
    .eq("user_id", gam.user_id)
    .select()
    .single();
  if (error) throw error;
  return updated;
}

// Costs 1 life the first time a unit is opened; reopening an already-opened
// unit is free (checked by the caller before this runs).
export async function deductLifeForUnitOpen(supabase: SupabaseClient, userId: string, gam: Gam): Promise<Gam> {
  if (gam.lives <= 0) {
    throw new Error("Tidak ada lives tersisa — tunggu reset esok hari atau upgrade Premium");
  }
  const { data: updated, error } = await supabase
    .from("gamification")
    .update({ lives: gam.lives - 1 })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return updated;
}

export async function awardUnitXp(supabase: SupabaseClient, userId: string, gam: Gam): Promise<Gam> {
  const { data: updated, error } = await supabase
    .from("gamification")
    .update({ xp: gam.xp + XP_PER_UNIT })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return updated;
}

// +1 if the user was also active yesterday (or is resuming inside an active
// streak_freeze_until window from an in-review checkpoint), reset to 1
// after a genuine gap, unchanged if this is a second completion same day.
export async function updateStreakOnActivity(supabase: SupabaseClient, userId: string, gam: Gam): Promise<Gam> {
  const today = todayWib();
  const lastActive: string | null = gam.last_active_date ?? null;
  const freezeUntil: string | null = gam.streak_freeze_until ?? null;
  const frozen = freezeUntil !== null && daysBetween(freezeUntil, today) >= 0;

  let newStreak: number;
  if (lastActive === today) {
    newStreak = gam.streak;
  } else if ((lastActive !== null && daysBetween(today, lastActive) === 1) || frozen) {
    newStreak = gam.streak + 1;
  } else {
    newStreak = 1;
  }

  const { data: updated, error } = await supabase
    .from("gamification")
    .update({ streak: newStreak, last_active_date: today })
    .eq("user_id", userId)
    .select()
    .single();
  if (error) throw error;
  return updated;
}

// PRD 3.5 / 4.2 — entering a checkpoint task freezes streak decay for up to
// 7 days while the submission is in review.
export async function freezeStreakForCheckpoint(supabase: SupabaseClient, userId: string): Promise<void> {
  const freezeUntilMs = Date.now() + WIB_OFFSET_MS + 7 * 24 * 60 * 60 * 1000;
  const freezeUntil = new Date(freezeUntilMs).toISOString().slice(0, 10);
  await supabase.from("gamification").update({ streak_freeze_until: freezeUntil }).eq("user_id", userId);
}
