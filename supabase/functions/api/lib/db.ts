// One shared admin (service-role) client per function instance — mirrors
// backend/app/db.py's get_supabase(). This function always talks to
// Supabase as an admin and enforces access rules itself (see lib/auth.ts),
// rather than relying on the caller's own RLS-scoped session.
import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

let client: SupabaseClient | null = null;

export function getSupabase(): SupabaseClient {
  if (!client) {
    const url = Deno.env.get("SUPABASE_URL");
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    if (!url || !serviceKey) {
      throw new Error("SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY not set");
    }
    client = createClient(url, serviceKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
  }
  return client;
}
