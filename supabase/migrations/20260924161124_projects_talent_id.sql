-- Real talent matching: a UMKM picks a real certified talent for their
-- posted project, and that talent's own session picks it up as a genuine
-- match — replacing RinaTask's old always-on fake match simulation for
-- real accounts. See backend/sql/schema.sql for the full commented version.

alter table projects add column if not exists talent_id uuid references users(id);

create policy "UMKM update own projects" on projects for update using (auth.uid() = umkm_id) with check (auth.uid() = umkm_id);
create policy "Talent read matched projects" on projects for select using (auth.uid() = talent_id);
