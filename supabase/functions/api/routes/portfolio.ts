// Port of backend/app/routers/portfolio.py.
import { Hono } from "npm:hono@4";
import { getSupabase } from "../lib/db.ts";
import { HttpError } from "../lib/auth.ts";

const app = new Hono();

// Public per PRD section 3.6 — deliberately no auth: this is what an
// (unauthenticated, in this MVP) UMKM client sees when checking a talent's
// verified work out.
app.get("/portfolio/:userId", async (c) => {
  const userId = c.req.param("userId");
  const supabase = getSupabase();

  const { data: userRow } = await supabase.from("users").select("name, skill").eq("id", userId).maybeSingle();
  if (!userRow) throw new HttpError(404, "User tidak ditemukan");

  const { data: items } = await supabase
    .from("portfolio")
    .select("title, skill, verified, created_at")
    .eq("user_id", userId)
    .eq("verified", true)
    .order("created_at", { ascending: false });

  return c.json({ user: userRow, portfolio: items ?? [] });
});

export default app;
