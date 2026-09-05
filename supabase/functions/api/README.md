# WADAH API — Supabase Edge Function

Port of `backend/` (FastAPI/Python) to a single Supabase Edge Function
(Deno + [Hono](https://hono.dev)), so the backend runs inside the same
Supabase project as Auth/DB/Storage — no separate host, no card required
anywhere.

The Python backend in `backend/` is untouched and still works if you'd
rather run it separately (Docker/Cloud Run/etc.) — this is an alternative,
not a replacement forced on you.

## What's ported

Every route from `backend/app/routers/*.py`, 1:1:

- `GET /user/me`, `PATCH /user/me`, `POST /user/upgrade-premium`
- `GET /progress`, `POST /unit/open`, `POST /unit/complete`
- `POST /mentor/chat`, `POST /mentor/chat-demo`
- `POST /submission`, `GET /submission/my`
- `GET /portfolio/:userId`
- `GET /matching`
- `GET /insight/skill`, `POST /insight/analyze`

Same business logic (XP/lives/streak math, checkpoint revision caps, the
"human reviewer flips a row in Studio" model, Gemini-backed mentor/insight)
— see each file's header comment for which Python file it mirrors.

**Not ported / not needed here:** the DB schema and trigger
(`backend/sql/schema.sql`) — run that in the same Supabase project
regardless of which backend you use, it doesn't change.

## One-time setup

1. Install the Supabase CLI (no card needed — this is separate from any
   cloud billing account):
   ```
   npm install -g supabase
   ```
2. Log in and link this repo to your existing Supabase project (the same
   one already used for Auth — find the project ref in your dashboard URL,
   `https://supabase.com/dashboard/project/<ref>`):
   ```
   supabase login
   supabase link --project-ref <your-project-ref>
   ```
3. Set the secrets this function needs (`SUPABASE_URL` and
   `SUPABASE_SERVICE_ROLE_KEY` are auto-injected by the platform — don't set
   those yourself):
   ```
   supabase secrets set GEMINI_API_KEY=your-key-here
   supabase secrets set GEMINI_MODEL_FREE=gemini-2.0-flash-lite
   supabase secrets set GEMINI_MODEL_PREMIUM=gemini-2.0-flash
   supabase secrets set FRONTEND_ORIGIN=http://localhost:5173,https://your-app.vercel.app
   ```
   Double-check the Gemini model names against
   [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
   before deploying — same caveat as the Python backend's README.
4. Deploy:
   ```
   supabase functions deploy api
   ```
   (`--no-verify-jwt` is no longer needed as a flag — `supabase/config.toml`
   already sets `verify_jwt = false` for this function, which is required:
   auth is enforced per-route in `lib/auth.ts`, same as the old FastAPI
   version, so the public routes — `/portfolio`, `/matching` — must stay
   reachable without a user session.)

## Point the frontend at it

Your function's base URL is:

```
https://<your-project-ref>.supabase.co/functions/v1/api
```

Set that as `VITE_API_URL` (in `.env.local` for dev, or the Vercel project's
env vars for production) — **no frontend code changes needed**, `src/lib/api.js`
and `AIMentorWidget.jsx` already build request URLs as `${API_URL}${path}`,
so this is a pure env var swap.

## Local testing

```
supabase functions serve api --env-file supabase/functions/api/.env.local
```

(`.env.local` there needs `GEMINI_API_KEY`, `GEMINI_MODEL_FREE`,
`GEMINI_MODEL_PREMIUM`, `FRONTEND_ORIGIN` — the CLI auto-injects
`SUPABASE_URL`/`SUPABASE_SERVICE_ROLE_KEY` for local serving too, pointing
at your linked project.)

## Known gaps to verify before relying on this

- **Gemini JS SDK shape** — ported from the Python `google-genai` SDK's
  `chats.create()` / `chat.send_message()` calls to `@google/genai`'s
  `chats.create()` / `chat.sendMessage()`. These SDKs are officially mirrored
  across languages, but verify against
  [current npm docs](https://www.npmjs.com/package/@google/genai) if the
  mentor/insight calls error — SDK shapes shift over time.
- **`units.json` import** — `lib/content.ts` imports it with a JSON import
  attribute (`with { type: "json" }`), which needs a reasonably current Deno
  runtime. If deploy fails on that line, swap it for
  `JSON.parse(await Deno.readTextFile(new URL("../content/units.json", import.meta.url)))`.
- This hasn't been run against a live Supabase project yet (no Supabase CLI
  in the environment this was written in) — test each route once after
  deploying, same as you'd test any new deploy.
