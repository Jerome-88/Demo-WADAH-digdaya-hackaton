-- Real UMKM registration + persisted project posting, mirroring the talent
-- side's `users` table pattern. See backend/sql/schema.sql for the
-- canonical, fully-commented version of these tables/policies.

create table if not exists umkm_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text unique not null,
  business_name text not null,
  pic_name      text not null,
  phone         text,
  created_at    timestamptz default now()
);

create table if not exists projects (
  id          uuid primary key default gen_random_uuid(),
  umkm_id     uuid references umkm_profiles(id) on delete cascade,
  umkm_name   text not null,
  skill       text not null,
  description text,
  scope       jsonb,
  budget      int,
  status      text default 'open' check (status in ('open', 'matched')),
  created_at  timestamptz default now()
);
create index if not exists projects_umkm_id_idx on projects(umkm_id);

alter table umkm_profiles enable row level security;
alter table projects enable row level security;

create policy "UMKM read own row" on umkm_profiles for select using (auth.uid() = id);
create policy "UMKM insert own row" on umkm_profiles for insert with check (auth.uid() = id);

create policy "UMKM read own projects" on projects for select using (auth.uid() = umkm_id);
create policy "UMKM insert own projects" on projects for insert with check (auth.uid() = umkm_id);
