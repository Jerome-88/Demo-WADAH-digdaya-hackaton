// Port of backend/app/routers/user.py.
import { Hono } from "npm:hono@4";
import { getSupabase } from "../lib/db.ts";
import { getCurrentUser } from "../lib/auth.ts";
import { computeLevel, getOrCreateGamification } from "../lib/gamification.ts";

const app = new Hono();

// deno-lint-ignore no-explicit-any
function toResponse(user: Record<string, any>, gam: Record<string, any>) {
  return {
    id: user.id,
    name: user.name,
    skill: user.skill,
    avatar_url: user.avatar_url ?? null,
    is_premium: user.is_premium,
    xp: gam.xp,
    lives: gam.lives,
    streak: gam.streak,
    level: computeLevel(gam.xp),
  };
}

app.get("/user/me", async (c) => {
  const user = await getCurrentUser(c);
  const gam = await getOrCreateGamification(getSupabase(), user.id as string, user.is_premium as boolean);
  return c.json(toResponse(user, gam));
});

// Dedicated endpoint rather than exposing is_premium on PATCH /user/me —
// there's no real payment gateway in this MVP, but this action still
// deserves a single-purpose endpoint rather than a generic field any
// client could set to anything.
app.post("/user/upgrade-premium", async (c) => {
  const user = await getCurrentUser(c);
  const supabase = getSupabase();
  await supabase.from("users").update({ is_premium: true }).eq("id", user.id as string);
  const updatedUser = { ...user, is_premium: true };
  const gam = await getOrCreateGamification(supabase, user.id as string, true);
  return c.json(toResponse(updatedUser, gam));
});

app.patch("/user/me", async (c) => {
  const user = await getCurrentUser(c);
  const body = await c.req.json();
  // deno-lint-ignore no-explicit-any
  const updates: Record<string, any> = {};
  for (const key of ["name", "phone", "avatar_url"]) {
    if (body[key] !== undefined && body[key] !== null) updates[key] = body[key];
  }

  let updatedUser = user;
  if (Object.keys(updates).length > 0) {
    await getSupabase().from("users").update(updates).eq("id", user.id as string);
    updatedUser = { ...user, ...updates };
  }

  const gam = await getOrCreateGamification(getSupabase(), user.id as string, user.is_premium as boolean);
  return c.json(toResponse(updatedUser, gam));
});

export default app;
