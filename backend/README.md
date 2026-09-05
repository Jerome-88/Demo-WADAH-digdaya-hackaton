# WADAH Backend

FastAPI implementation of `WADAH_Backend_PRD.md` — Supabase for auth/DB/storage,
Gemini for the AI Mentor, deployed as a container on GCP Cloud Run.

**Status: scaffold, verified against real Postgres — not yet deployed.**
Nothing runs on Supabase/GCP yet, and the frontend (`../src`) does not call
this API — it still runs entirely on session-only React state. Wiring the
frontend to this API is a separate, follow-up piece of work.

"Verified against real Postgres" is a specific claim, not a vibe: `sql/schema.sql`
has actually been applied to a throwaway Postgres 16 container (all 30
statements, zero errors), the approval trigger was exercised end-to-end
with real inserts (XP, `progress.status`, and the `portfolio` row all came
out correct), and the RLS policies were tested by attempting a direct
self-XP-grant as a non-superuser role — it was silently blocked
(`UPDATE 0`) while reads still worked. The FastAPI layer has been
import-checked, route-registration-checked, and dispatch-tested via
`TestClient` for every endpoint. What's *not* verified: an actual
Supabase project (Auth, Storage, RLS as Supabase configures it
specifically) and a live Gemini API key — those need your own credentials.

## Project layout

```
backend/
  app/
    main.py            FastAPI app, CORS, router registration, /health
    config.py           Env-var settings (pydantic-settings)
    db.py                Cached Supabase client (service-role key)
    dependencies.py       get_current_user — verifies the Supabase JWT
    models/               Pydantic request/response schemas, one file per resource
    routers/               One file per PRD section 3.x endpoint group
    services/
      gamification_service.py   Lives / streak / XP logic (PRD section 4)
      mentor_service.py          System prompt, rolling context, Gemini call
      content_service.py          Loads content/units.json
      storage_service.py           Supabase Storage upload + signed URLs
    content/units.json     Static unit content (PRD section 5) — all 90
                             units (6 skills x 15 nodes), ported from the
                             frontend's src/data/skillMaps.js.
  scripts/
    sync_units_from_frontend.mjs   Regenerates content/units.json from
                                     skillMaps.js — re-run this after
                                     editing curriculum content on the
                                     frontend rather than hand-editing the
                                     JSON.
    try_mentor_locally.py           Standalone AI Mentor smoke test, no
                                      Supabase needed (just GEMINI_API_KEY).
  sql/schema.sql          All 6 tables + RLS policies + the approval trigger
  requirements.txt
  Dockerfile
  .env.example
```

## Local development

```bash
cd backend
python -m venv .venv
source .venv/bin/activate        # Windows: .venv\Scripts\activate
pip install -r requirements.txt

cp .env.example .env             # fill in SUPABASE_URL / SUPABASE_SERVICE_KEY / GEMINI_API_KEY
uvicorn app.main:app --reload
```

API docs: `http://localhost:8000/docs`

## Supabase setup

1. Create a project at [supabase.com](https://supabase.com).
2. **SQL Editor → New query** → paste and run `sql/schema.sql`. This creates
   all 6 tables, turns on RLS, and installs the submission-approval trigger.
3. **Storage** → create a bucket named `submissions`, set it **private**
   (signed-URL access only, per PRD section 6 — `storage_service.py`
   already expects this exact bucket name).
4. **Authentication → Providers** → enable **Email** with OTP (magic
   link/OTP, no password) per PRD section 1.2. SMS OTP is explicitly out of
   MVP scope (PRD section 9).
5. **Settings → API** → copy the Project URL and the `service_role` key
   (not `anon`) into `backend/.env` as `SUPABASE_URL` / `SUPABASE_SERVICE_KEY`.

### Onboarding flow (no dedicated endpoint)

PRD section 3.1 is explicit: auth has no custom endpoints, the frontend
talks to Supabase Auth directly. The same applies to creating a talent's
first `users` row — after Supabase Auth sign-up, the frontend should
insert it directly with the Supabase JS client, using the user's own
session (that's what the `"Users insert own row"` RLS policy in
`schema.sql` is for). Every other write goes through this API using the
service-role key.

## Reviewing a submission (manual, by design)

PRD section 9 puts a reviewer dashboard out of MVP scope. In practice: open
the `submissions` table in Supabase Studio's Table Editor and edit a row's
`status` (and `reviewer_notes`) directly.

- Set `status = 'approved'` → the `on_submission_approved` trigger fires
  automatically: it computes `xp_earned` from `revision_count` (150 / 120 /
  100, PRD 4.3), credits `gamification.xp`, and inserts a `portfolio` row.
- Set `status = 'revision_requested'` and fill in `reviewer_notes` → no
  trigger fires; the talent sees the feedback and resubmits via
  `POST /submission`, which is what actually enforces the 2-revision cap
  (PRD 4.4) — a 3rd attempt is rejected with a 400 telling them to redo the
  unit.

## AI Mentor model names

`GEMINI_MODEL_FREE` / `GEMINI_MODEL_PREMIUM` in `.env` default to
`gemini-2.0-flash-lite` / `gemini-2.0-flash`. Google's model catalog moves
fast — check [ai.google.dev/gemini-api/docs/models](https://ai.google.dev/gemini-api/docs/models)
before deploying and update `.env` rather than the code if names have
changed. Uses the current `google-genai` SDK — the older
`google-generativeai` package is fully deprecated (confirmed via its own
end-of-life warning), don't reintroduce it.

## Deploy to Cloud Run

```bash
gcloud builds submit --tag gcr.io/[PROJECT_ID]/wadah-api
gcloud run deploy wadah-api \
  --image gcr.io/[PROJECT_ID]/wadah-api \
  --platform managed \
  --region asia-southeast1 \
  --allow-unauthenticated \
  --set-env-vars SUPABASE_URL=...,FRONTEND_ORIGIN=https://your-vercel-app.vercel.app \
  --set-secrets SUPABASE_SERVICE_KEY=supabase-service-key:latest,GEMINI_API_KEY=gemini-key:latest
```

Put `SUPABASE_SERVICE_KEY` and `GEMINI_API_KEY` in GCP Secret Manager first
(PRD section 6 — never as a plain env var) and reference them with
`--set-secrets` as above.

Then point the frontend at it (`../.env` on Vercel):

```
VITE_API_URL=https://wadah-api-xxx.a.run.app
```

## What's deliberately not here

Straight from PRD section 9 — SMS OTP, real matching algorithm, escrow/payment,
a reviewer dashboard UI, premium payment flow (flag it manually in
`users.is_premium` for now), push/email notifications, and a content CMS.
