// Port of backend/app/routers/matching.py.
import { Hono } from "npm:hono@4";
import { getSupabase } from "../lib/db.ts";

const app = new Hono();

// Public + hardcoded per PRD section 3.7 — real matching/escrow is out of
// MVP scope; the UMKM-client side of the marketplace is dummy for now.
app.get("/matching", async (c) => {
  const skill = c.req.query("skill") ?? "";
  const supabase = getSupabase();

  const { data } = await supabase.from("users").select("name, skill").eq("skill", skill);
  const rows = (data ?? []).slice();
  // "Rina selalu jadi kartu #1 untuk keperluan demo" (PRD 3.7).
  rows.sort((a, b) => {
    const aIsRina = a.name === "Rina Kusumawati" ? 0 : 1;
    const bIsRina = b.name === "Rina Kusumawati" ? 0 : 1;
    return aIsRina - bIsRina;
  });

  const talents = rows.slice(0, 3).map((row) => ({
    name: row.name,
    skill: row.skill,
    score: null,
    verified_portfolio: true,
  }));

  return c.json({ talents });
});

export default app;
