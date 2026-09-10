-- Per-IP daily rate limit for POST /mentor/chat-demo — the one public,
-- auth-free, Gemini-calling endpoint (no user to key a per-account limit on
-- like /mentor/chat's mentor_context-based check). Must live in the
-- database, not in-memory in the Edge Function: each invocation on
-- Supabase's Edge Runtime gets its own isolate (confirmed via distinct
-- x-deno-execution-id per request even for sequential calls), so any
-- in-memory counter resets on effectively every request and enforces
-- nothing.
create table demo_mentor_rate_limit (
  ip          text primary key,
  count       int not null default 1,
  window_start timestamptz not null default now()
);

alter table demo_mentor_rate_limit enable row level security;
-- No client-facing policies — only the Edge Function's service-role key
-- (which bypasses RLS) ever touches this table.
