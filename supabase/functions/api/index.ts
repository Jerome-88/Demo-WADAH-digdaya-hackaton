// Port of backend/app/main.py — WADAH API, running as a Supabase Edge
// Function instead of a standalone FastAPI/uvicorn process. Deploy with
// `supabase functions deploy api --no-verify-jwt` (see supabase/README.md)
// so the platform's own gateway doesn't gate every request behind a
// Supabase-issued JWT — auth is enforced per-route by lib/auth.ts instead,
// exactly like the FastAPI version (public routes stay public).
import { Hono } from "npm:hono@4";
import { cors } from "npm:hono@4/cors";
import { HttpError } from "./lib/auth.ts";

import userRoutes from "./routes/user.ts";
import progressRoutes from "./routes/progress.ts";
import mentorRoutes from "./routes/mentor.ts";
import submissionRoutes from "./routes/submission.ts";
import portfolioRoutes from "./routes/portfolio.ts";
import matchingRoutes from "./routes/matching.ts";
import insightRoutes from "./routes/insight.ts";

// Requests arrive at /functions/v1/api/<path>, full path included — this
// basePath must match the function's own directory/deploy name ("api").
const app = new Hono().basePath("/api");

// FRONTEND_ORIGIN supports a comma-separated list (e.g. local dev + the
// deployed Vercel domain at once). Falls back to allow-all if unset, same
// spirit as the FastAPI version's development-mode regex.
const allowedOrigins = (Deno.env.get("FRONTEND_ORIGIN") ?? "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

app.use(
  "*",
  cors({
    origin: allowedOrigins.length > 0 ? allowedOrigins : "*",
    allowHeaders: ["Authorization", "Content-Type"],
    allowMethods: ["GET", "POST", "PATCH", "OPTIONS"],
  }),
);

app.get("/health", (c) => c.json({ status: "ok" }));

app.route("/", userRoutes);
app.route("/", progressRoutes);
app.route("/", mentorRoutes);
app.route("/", submissionRoutes);
app.route("/", portfolioRoutes);
app.route("/", matchingRoutes);
app.route("/", insightRoutes);

// Central error handler — this is what backend/app/main.py's two
// exception_handlers exist for (routing a Gemini/unhandled error through
// this instead of letting it crash unhandled). Hono's CORS middleware wraps
// every response including ones from here, so — unlike the Starlette gotcha
// that bit /insight/analyze in the FastAPI version — an error here never
// shows up client-side as a bare CORS failure.
app.onError((err, c) => {
  if (err instanceof HttpError) {
    return c.json({ detail: err.message }, err.status as 400 | 401 | 403 | 404 | 429);
  }
  console.error(err);
  // deno-lint-ignore no-explicit-any
  const status = (err as any)?.status ?? (err as any)?.code;
  if (typeof status === "number" && status >= 500 && status < 600) {
    return c.json({ detail: "Layanan AI sedang sibuk, coba lagi sebentar lagi." }, 503);
  }
  return c.json({ detail: "Terjadi kesalahan pada server." }, 500);
});

Deno.serve(app.fetch);
