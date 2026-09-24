-- Real 1:1 chat between a real UMKM account and a real certified talent —
-- separate from the curated-demo negotiate/contract pipeline. See
-- backend/sql/schema.sql for the canonical, fully-commented version.

create table if not exists messages (
  id          uuid primary key default gen_random_uuid(),
  umkm_id     uuid references umkm_profiles(id) on delete cascade,
  talent_id   uuid references users(id) on delete cascade,
  umkm_name   text not null,
  talent_name text not null,
  sender_role text not null check (sender_role in ('umkm', 'talent')),
  text        text not null,
  created_at  timestamptz default now()
);
create index if not exists messages_umkm_idx on messages(umkm_id, created_at);
create index if not exists messages_talent_idx on messages(talent_id, created_at);

alter table messages enable row level security;

create policy "Thread participants read messages" on messages for select
  using (auth.uid() = umkm_id or auth.uid() = talent_id);
create policy "Thread participants insert own messages" on messages for insert
  with check (
    (sender_role = 'umkm' and auth.uid() = umkm_id) or
    (sender_role = 'talent' and auth.uid() = talent_id)
  );
