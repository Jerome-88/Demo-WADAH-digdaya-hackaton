// Port of backend/app/services/storage_service.py.
import type { SupabaseClient } from "npm:@supabase/supabase-js@2";

// Private bucket per PRD section 6 — create this in Supabase Storage (see
// backend/README.md) before submissions can upload.
const BUCKET = "submissions";

export async function uploadSubmissionFile(
  supabase: SupabaseClient,
  userId: string,
  unitId: string,
  filename: string,
  fileBytes: ArrayBuffer,
  contentType: string,
): Promise<string> {
  const ext = filename.includes(".") ? filename.split(".").pop() : "bin";
  const path = `${userId}/${unitId}/${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, fileBytes, { contentType });
  if (error) throw error;
  return path;
}

// content_url is stored as the raw private-bucket path (e.g.
// "user_id/unit_id/uuid.png"), never a public URL — PRD section 6:
// "Supabase Storage: private bucket, akses via signed URL".
export async function getSignedUrl(supabase: SupabaseClient, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}
