// Port of backend/app/routers/submission.py.
import { Hono } from "npm:hono@4";
import { getSupabase } from "../lib/db.ts";
import { getCurrentUser, HttpError } from "../lib/auth.ts";
import { isCheckpoint } from "../lib/content.ts";
import { freezeStreakForCheckpoint } from "../lib/gamification.ts";
import { getSignedUrl, uploadSubmissionFile } from "../lib/storage.ts";

const app = new Hono();
const MAX_REVISIONS = 2;

// Swaps the stored private-bucket path for a signed URL right before the
// row leaves the API — the raw path is meaningless to a client that only
// ever holds the anon key.
// deno-lint-ignore no-explicit-any
async function toResponse(supabase: any, row: Record<string, any>) {
  if (row.content_url) {
    return { ...row, content_url: await getSignedUrl(supabase, row.content_url) };
  }
  return row;
}

app.post("/submission", async (c) => {
  const user = await getCurrentUser(c);
  const supabase = getSupabase();
  const userId = user.id as string;

  const form = await c.req.parseBody();
  const unitId = form["unit_id"] as string;
  const contentText = (form["content_text"] as string) || "";
  const file = form["file"];

  if (!isCheckpoint(unitId)) {
    throw new HttpError(400, "Endpoint ini khusus unit checkpoint");
  }

  const { data: rows } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", userId)
    .eq("unit_id", unitId)
    .order("submitted_at", { ascending: false })
    .limit(1);
  const previous = rows?.[0] ?? null;

  if (previous?.status === "pending") throw new HttpError(400, "Submission sebelumnya masih dalam review");
  if (previous?.status === "approved") throw new HttpError(400, "Unit ini sudah disetujui");
  if (previous?.status === "revision_requested" && previous.revision_count >= MAX_REVISIONS) {
    // Reflect the terminal state in the DB — otherwise this submission sits
    // at 'revision_requested' forever, indistinguishable from one that's
    // still resubmittable (PRD 4.4: "Setelah 2 revisi gagal → status failed").
    await supabase.from("submissions").update({ status: "failed" }).eq("id", previous.id);
    throw new HttpError(400, "Maksimal revisi tercapai — ulangi unit dari awal");
  }

  const revisionCount = previous ? previous.revision_count + 1 : 0;

  let contentUrl: string | null = null;
  if (file instanceof File) {
    const bytes = await file.arrayBuffer();
    contentUrl = await uploadSubmissionFile(
      supabase,
      userId,
      unitId,
      file.name,
      bytes,
      file.type || "application/octet-stream",
    );
  }

  const { data: inserted, error } = await supabase
    .from("submissions")
    .insert({
      user_id: userId,
      unit_id: unitId,
      content_url: contentUrl,
      content_text: contentText || null,
      status: "pending",
      revision_count: revisionCount,
      submitted_at: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) throw error;

  // Freeze streak decay while the reviewer is (manually) working through
  // this — approval itself, and the XP/portfolio it triggers, happens via
  // a DB trigger once a human flips the status in Supabase Studio.
  await freezeStreakForCheckpoint(supabase, userId);

  return c.json(await toResponse(supabase, inserted));
});

app.get("/submission/my", async (c) => {
  const user = await getCurrentUser(c);
  const supabase = getSupabase();
  const { data } = await supabase
    .from("submissions")
    .select("*")
    .eq("user_id", user.id as string)
    .order("submitted_at", { ascending: false });
  const results = await Promise.all((data ?? []).map((row) => toResponse(supabase, row)));
  return c.json(results);
});

export default app;
