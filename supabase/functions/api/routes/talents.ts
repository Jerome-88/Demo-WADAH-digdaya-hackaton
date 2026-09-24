// Port of backend/app/routers/talents.py.
import { Hono } from "npm:hono@4";
import { getSupabase } from "../lib/db.ts";

const app = new Hono();

// Public, no auth — this is the real (not curated-demo) talent pool an
// UMKM's "Find Talent" dashboard browses: only users who actually finished
// the whole journey (POST /user/certify, after passing the skill's
// certification exam) show up here, newest-certified first.
app.get("/talents", async (c) => {
  const skill = c.req.query("skill");
  const supabase = getSupabase();

  let query = supabase
    .from("users")
    .select("id, name, skill, avatar_url, certified_at")
    .not("certified_at", "is", null);
  if (skill) query = query.eq("skill", skill);

  const { data } = await query.order("certified_at", { ascending: false });
  return c.json({ talents: data ?? [] });
});

export default app;
