// Port of backend/app/dependencies.py's get_current_user — verifies the
// Supabase session JWT and returns the matching `users` row. Every route
// calls this except the public portfolio and matching reads (PRD section 6:
// "Semua endpoint wajib verifikasi JWT dari Supabase").
import type { Context } from "npm:hono@4";
import { getSupabase } from "./db.ts";

export class HttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export async function getCurrentUser(c: Context): Promise<Record<string, unknown>> {
  const authorization = c.req.header("authorization") ?? c.req.header("Authorization");
  if (!authorization || !authorization.startsWith("Bearer ")) {
    throw new HttpError(401, "Missing bearer token");
  }
  const token = authorization.slice("Bearer ".length).trim();

  const supabase = getSupabase();
  const { data: authData, error: authError } = await supabase.auth.getUser(token);
  if (authError || !authData?.user) {
    throw new HttpError(401, "Invalid or expired token");
  }

  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", authData.user.id)
    .maybeSingle();

  if (error || !user) {
    // Onboarding is a frontend + Supabase-direct concern in this PRD (no
    // dedicated "create profile" endpoint) — see backend/README.md.
    throw new HttpError(404, "User profile not found — complete onboarding first");
  }

  return user;
}
