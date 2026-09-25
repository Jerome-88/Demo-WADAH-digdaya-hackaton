-- WADAH Backend — Supabase schema
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- right after creating the project. See backend/README.md for the full
-- setup checklist (storage bucket, auth settings, etc).

create extension if not exists "pgcrypto";

-- ── users ──────────────────────────────────────────────────────────────
-- `id` intentionally mirrors auth.users.id (not a fresh random uuid) so
-- `auth.uid() = id` works directly in the RLS policies below, and so a
-- profile row can be created right after Supabase Auth sign-up completes.
create table users (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text unique not null,
  name        text not null,
  phone       text,
  skill       text not null,
  avatar_url  text,
  is_premium  boolean default false,
  certified_at timestamptz, -- set once by POST /user/certify, after passing the skill's certification exam (RinaCertification) — the real, backend-persisted trigger for a talent to show up in GET /talents.
  created_at  timestamptz default now()
);

-- ── umkm_profiles ──────────────────────────────────────────────────────
-- The UMKM-client side's equivalent of `users` — same id-mirrors-auth.users
-- pattern, same "frontend inserts its own row after OTP" onboarding model
-- (UmkmRegisterFlow.jsx), kept as its own table rather than a `role` column
-- on `users` because the two sides share nothing else (no skill, no
-- gamification) and `users.skill` is not-null for the talent side.
create table umkm_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique not null,
  business_name text not null,
  pic_name      text not null,
  phone         text,
  created_at    timestamptz default now()
);

-- ── projects ───────────────────────────────────────────────────────────
-- A real UMKM's posted project (JasaFlow) — only the "posted" moment is
-- persisted here so it survives a reload/re-login; the downstream
-- match/negotiate/contract simulation (NegoChatPage, DraftKontrakPage,
-- KontrakFinalPage) still runs entirely on curated-demo talent data and
-- local React state, same as before this table existed.
--
-- talent_id: set once a real UMKM sends this project's brief to a real
-- (certified) talent (send_project_brief below). This is the real
-- replacement for RinaTask's old always-on fake "Ada proyek yang cocok"
-- simulation — a real talent only ever sees a match once an actual UMKM
-- chose them here (see AppContext.hydrateFromBackend, which loads it back
-- on the talent's side).
--
-- Lifecycle: open + talent_id null (posted) → open + talent_id set (brief
-- sent, waiting on the talent) → matched (talent accepted, chat unlocked).
-- A declined brief goes back to open + talent_id null.
create table projects (
  id                uuid primary key default gen_random_uuid(),
  umkm_id           uuid references umkm_profiles(id) on delete cascade,
  umkm_name         text not null,
  skill             text not null,
  description       text,
  scope             jsonb,
  budget            int,
  status            text default 'open' check (status in ('open', 'matched')),
  talent_id         uuid references users(id),
  created_at        timestamptz default now()
);
create index projects_umkm_id_idx on projects(umkm_id);

-- ── messages ───────────────────────────────────────────────────────────
-- Real 1:1 chat between a real UMKM account and a real (certified) talent
-- account — independent of the curated-demo negotiate/contract pipeline
-- (NegoChatPage/DraftKontrakPage/KontrakFinalPage/ProjectChatPage), which
-- stays exactly as-is. A UMKM starts a thread from a real talent's public
-- profile (RealTalentProfilePage); the talent replies from their own inbox
-- (TalentInboxPage/TalentChatPage). umkm_name/talent_name are denormalized
-- (same reasoning as projects.umkm_name) so each side's inbox listing can
-- render without joining umkm_profiles/users per row.
create table messages (
  id          uuid primary key default gen_random_uuid(),
  umkm_id     uuid references umkm_profiles(id) on delete cascade,
  talent_id   uuid references users(id) on delete cascade,
  umkm_name   text not null,
  talent_name text not null,
  sender_role text not null check (sender_role in ('umkm', 'talent')),
  text        text,
  -- Optional file/image (ChatThread's 📎) — a path in the private
  -- `chat-media` bucket, always under this thread's own
  -- <umkm_id>/<talent_id>/ folder; served via signed URL.
  attachment_path text,
  attachment_name text,
  attachment_type text,
  attachment_size int,
  created_at  timestamptz default now(),
  constraint messages_text_or_attachment check (text is not null or attachment_path is not null),
  constraint messages_attachment_in_thread
    check (attachment_path is null or attachment_path like umkm_id::text || '/' || talent_id::text || '/%')
);
create index messages_umkm_idx on messages(umkm_id, created_at);
create index messages_talent_idx on messages(talent_id, created_at);

-- ── progress ───────────────────────────────────────────────────────────
create table progress (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  unit_id       text not null,
  status        text default 'locked' check (status in ('locked', 'opened', 'completed')),
  score         int,
  quiz_attempts jsonb, -- [{"concept_tag": "color_psychology", "correct": false}, ...] — Insight Skill feature
  opened_at     timestamptz,
  completed_at  timestamptz,
  unique (user_id, unit_id)
);
create index progress_user_id_idx on progress(user_id);

-- ── gamification ───────────────────────────────────────────────────────
create table gamification (
  id                  uuid primary key default gen_random_uuid(),
  user_id             uuid references users(id) on delete cascade unique,
  xp                  int default 0,
  lives               int default 5,
  lives_reset_at      date default current_date,
  streak              int default 0,
  last_active_date    date,
  streak_freeze_until date
);

-- ── submissions ────────────────────────────────────────────────────────
create table submissions (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid references users(id) on delete cascade,
  unit_id        text not null,
  content_url    text,
  content_text   text,
  status         text default 'pending' check (status in ('pending', 'approved', 'revision_requested', 'failed')),
  reviewer_notes text,
  revision_count int default 0,
  xp_earned      int,
  submitted_at   timestamptz default now(),
  reviewed_at    timestamptz
);
create index submissions_user_id_idx on submissions(user_id);
create index submissions_user_unit_idx on submissions(user_id, unit_id);

-- ── portfolio ──────────────────────────────────────────────────────────
create table portfolio (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid references users(id) on delete cascade,
  submission_id uuid references submissions(id),
  title         text not null,
  description   text,
  skill         text not null,
  verified      boolean default true,
  created_at    timestamptz default now()
);
create index portfolio_user_id_idx on portfolio(user_id);

-- ── mentor_context ─────────────────────────────────────────────────────
create table mentor_context (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid references users(id) on delete cascade,
  role       text not null check (role in ('user', 'assistant')),
  content    text not null,
  unit_id    text,
  created_at timestamptz default now()
);
create index mentor_context_user_id_idx on mentor_context(user_id, created_at desc);

-- ── insight_analysis ───────────────────────────────────────────────────
-- One cached Gemini-generated Insight Skill analysis per user (premium
-- feature) — rate-limited to 1x/day by checking generated_at before
-- regenerating (see insight_service.py), so this is upserted, not appended.
create table insight_analysis (
  user_id      uuid primary key references users(id) on delete cascade,
  analysis     text not null,
  generated_at timestamptz not null default now()
);

-- ── demo_mentor_rate_limit ────────────────────────────────────────────
-- Per-IP daily rate limit for POST /mentor/chat-demo — the one public,
-- auth-free, Gemini-calling endpoint. See the Edge Function port
-- (supabase/functions/api/routes/mentor.ts) for why this has to be a table
-- and not in-memory state: Supabase's Edge Runtime gives each invocation
-- its own isolate, so module-level counters don't survive between requests.
create table demo_mentor_rate_limit (
  ip           text primary key,
  count        int not null default 1,
  window_start timestamptz not null default now()
);


-- ═══════════════════════════════════════════════════════════════════════
-- Row Level Security (PRD section 6: "user hanya bisa baca data milik
-- sendiri"). The FastAPI backend uses the service-role key and bypasses
-- all of this by design — these policies are what protect the tables if
-- anything (e.g. the frontend during onboarding) ever queries Supabase
-- directly with a user's own anon-key session.
-- ═══════════════════════════════════════════════════════════════════════

alter table users enable row level security;
alter table umkm_profiles enable row level security;
alter table projects enable row level security;
alter table messages enable row level security;
alter table progress enable row level security;
alter table gamification enable row level security;
alter table submissions enable row level security;
alter table portfolio enable row level security;
alter table mentor_context enable row level security;
alter table insight_analysis enable row level security;
-- No policies at all (not even read) — only the service-role key touches
-- this, and it has no per-user meaning to expose to a client session anyway.
alter table demo_mentor_rate_limit enable row level security;

-- Deliberately read-only (or insert-only) for direct client access. Every
-- write that carries business logic (XP, lives, streak, submission review)
-- MUST go through the FastAPI backend's service-role key — a "for all"
-- policy here would let a user's own session update these columns
-- directly (e.g. self-granting XP/lives, flipping their own submission to
-- 'approved', or setting is_premium = true), completely bypassing that
-- logic. Found and fixed after an audit flagged this.
create policy "Users read own row" on users for select using (auth.uid() = id);
-- Lets the frontend create its own profile row right after Supabase Auth
-- sign-up — there's no dedicated backend endpoint for this (PRD 3.1).
create policy "Users insert own row" on users for insert with check (auth.uid() = id);

-- Same insert-own-row-via-RLS model as `users` above — UmkmRegisterFlow.jsx
-- inserts its own row directly, no dedicated backend endpoint. There is no
-- business logic on this table (no XP/lives/streak equivalent) to protect
-- behind a service-role endpoint, so read+insert-own-row is the whole policy.
create policy "UMKM read own row" on umkm_profiles for select using (auth.uid() = id);
create policy "UMKM insert own row" on umkm_profiles for insert with check (auth.uid() = id);

-- Posting a project (JasaFlow) is likewise a plain "insert your own row" —
-- there's no matching/escrow business logic here to guard server-side (the
-- match/negotiate/contract steps downstream stay simulated, per PRD 3.7).
create policy "UMKM read own projects" on projects for select using (auth.uid() = umkm_id);
-- New projects always start un-briefed — talent_id/status only ever change
-- through the two functions below.
create policy "UMKM insert own projects" on projects for insert
  with check (auth.uid() = umkm_id and status = 'open' and talent_id is null);
-- JasaDashboard's "Hapus Proyek" — a project that fell through. Any status:
-- chat threads are keyed on the umkm/talent pair, not the project, so
-- nothing else references the row.
create policy "UMKM delete own projects" on projects for delete using (auth.uid() = umkm_id);
-- A talent needs to see a project once they're the one picked for it — this
-- is the real match signal AppContext.hydrateFromBackend loads on login.
create policy "Talent read matched projects" on projects for select using (auth.uid() = talent_id);

-- No UPDATE policy on projects at all: RLS can't limit which columns get
-- touched, so a UMKM update policy would let a UMKM flip its own project to
-- 'matched' and skip the talent's confirmation. Both sides go through these
-- security-definer functions instead.
--
-- UMKM sends the brief (JasaFlow Step 3 / RealTalentProfilePage).
create or replace function send_project_brief(p_project_id uuid, p_talent_id uuid)
returns void as $$
begin
  update projects set talent_id = p_talent_id
  where id = p_project_id and umkm_id = auth.uid() and status = 'open' and talent_id is null;
  if not found then
    raise exception 'Proyek ini sudah punya talent yang dikirimi brief';
  end if;
end;
$$ language plpgsql security definer set search_path = public;

-- Talent accepts (→ matched, chat unlocked) or declines (→ back to open,
-- talent_id cleared so the UMKM can brief someone else) — SmartMatchPage.
create or replace function respond_to_project(p_project_id uuid, p_accept boolean)
returns void as $$
begin
  if p_accept then
    update projects set status = 'matched'
    where id = p_project_id and talent_id = auth.uid() and status = 'open';
  else
    update projects set talent_id = null
    where id = p_project_id and talent_id = auth.uid() and status = 'open';
  end if;
  if not found then
    raise exception 'Brief ini sudah tidak menunggu konfirmasimu';
  end if;
end;
$$ language plpgsql security definer set search_path = public;

revoke execute on function send_project_brief(uuid, uuid) from public, anon;
revoke execute on function respond_to_project(uuid, boolean) from public, anon;
grant execute on function send_project_brief(uuid, uuid) to authenticated;
grant execute on function respond_to_project(uuid, boolean) to authenticated;

-- Either side of a thread can read it; a sender can only insert a row that
-- (a) names themselves as umkm_id/talent_id matching their own auth uid,
-- (b) tags it with their own actual role — a talent session can't spoof
-- a message as if the UMKM sent it, and vice versa — and (c) belongs to a
-- pair where the talent actually accepted a brief from that UMKM.
create policy "Thread participants read messages" on messages for select
  using (auth.uid() = umkm_id or auth.uid() = talent_id);
create policy "Thread participants insert own messages" on messages for insert
  with check (
    ((sender_role = 'umkm' and auth.uid() = umkm_id) or
     (sender_role = 'talent' and auth.uid() = talent_id))
    and exists (
      select 1 from projects p
      where p.umkm_id = messages.umkm_id
        and p.talent_id = messages.talent_id
        and p.status = 'matched'
    )
  );

-- ── chat-media bucket ──────────────────────────────────────────────────
-- Private, 10 MB per file. Object path: <umkm_id>/<talent_id>/<ts>-<name>.
-- Same access model as `messages`: either side of the thread can read,
-- and uploading needs an accepted (matched) brief between the two.
insert into storage.buckets (id, name, public, file_size_limit)
values ('chat-media', 'chat-media', false, 10485760)
on conflict (id) do nothing;

create policy "Chat participants read media" on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-media' and (
      auth.uid()::text = (storage.foldername(name))[1] or
      auth.uid()::text = (storage.foldername(name))[2]
    )
  );
create policy "Chat participants upload media" on storage.objects for insert to authenticated
  with check (
    bucket_id = 'chat-media' and (
      auth.uid()::text = (storage.foldername(name))[1] or
      auth.uid()::text = (storage.foldername(name))[2]
    ) and exists (
      select 1 from public.projects p
      where p.umkm_id::text = (storage.foldername(name))[1]
        and p.talent_id::text = (storage.foldername(name))[2]
        and p.status = 'matched'
    )
  );

create policy "Users read own progress" on progress for select using (auth.uid() = user_id);

create policy "Users read own gamification" on gamification for select using (auth.uid() = user_id);

create policy "Users read own submissions" on submissions for select using (auth.uid() = user_id);

create policy "Users read own portfolio" on portfolio for select using (auth.uid() = user_id);
-- Portfolio is also the one publicly-readable table (PRD 3.6: "Endpoint
-- ini public — bisa diakses klien UMKM").
create policy "Anyone can read verified portfolio" on portfolio for select using (verified = true);

create policy "Users read own mentor context" on mentor_context for select using (auth.uid() = user_id);

create policy "Users read own insight analysis" on insight_analysis for select using (auth.uid() = user_id);


-- ═══════════════════════════════════════════════════════════════════════
-- Automatic XP + portfolio entry on submission approval.
--
-- There is no reviewer API endpoint by design — PRD section 9 puts the
-- "Human reviewer dashboard" out of MVP scope, meaning a reviewer approves
-- or requests revisions by editing the `submissions` row directly in
-- Supabase Studio. This trigger is what makes "Reviewer approve → masuk
-- portfolio otomatis" (PRD 4.4) actually happen when that edit lands.
-- ═══════════════════════════════════════════════════════════════════════

create or replace function handle_submission_approval()
returns trigger as $$
declare
  earned_xp int;
  talent_skill text;
begin
  if new.status = 'approved' and old.status is distinct from 'approved' then
    -- PRD 4.3: 150 / 120 / 100 XP depending on how many revisions it took.
    earned_xp := case
      when new.revision_count = 0 then 150
      when new.revision_count = 1 then 120
      else 100
    end;

    new.xp_earned := earned_xp;
    new.reviewed_at := now();

    update gamification set xp = xp + earned_xp where user_id = new.user_id;

    -- The checkpoint's own progress row also needs to flip to 'completed' —
    -- otherwise anything reading `progress` (e.g. a future "next unit
    -- unlocked" check) would see this checkpoint as permanently unfinished.
    insert into progress (user_id, unit_id, status, completed_at)
    values (new.user_id, new.unit_id, 'completed', now())
    on conflict (user_id, unit_id) do update set status = 'completed', completed_at = now();

    select skill into talent_skill from users where id = new.user_id;

    -- Title is a reasonable default, not the polished copy a reviewer
    -- might want — edit the row afterward in Studio if it needs one.
    insert into portfolio (user_id, submission_id, title, skill, verified)
    values (new.user_id, new.id, 'Proyek Checkpoint — ' || new.unit_id, talent_skill, true);
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_submission_approved
before update on submissions
for each row
execute function handle_submission_approval();
