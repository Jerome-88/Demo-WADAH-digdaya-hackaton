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
  created_at  timestamptz default now()
);

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


-- ═══════════════════════════════════════════════════════════════════════
-- Row Level Security (PRD section 6: "user hanya bisa baca data milik
-- sendiri"). The FastAPI backend uses the service-role key and bypasses
-- all of this by design — these policies are what protect the tables if
-- anything (e.g. the frontend during onboarding) ever queries Supabase
-- directly with a user's own anon-key session.
-- ═══════════════════════════════════════════════════════════════════════

alter table users enable row level security;
alter table progress enable row level security;
alter table gamification enable row level security;
alter table submissions enable row level security;
alter table portfolio enable row level security;
alter table mentor_context enable row level security;
alter table insight_analysis enable row level security;

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
