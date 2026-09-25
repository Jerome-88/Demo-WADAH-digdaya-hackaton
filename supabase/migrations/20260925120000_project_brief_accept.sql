-- Picking a real talent now only *sends the brief* (projects.talent_id set,
-- status still 'open'); the talent has to accept it before the project is
-- 'matched' and the two can chat. See backend/sql/schema.sql for the full
-- commented version.

-- Both sides go through security-definer functions instead of UPDATE
-- policies — RLS can't limit which columns get touched, so a plain UMKM
-- update policy would let a UMKM flip its own project to 'matched' and skip
-- the talent's confirmation entirely.
drop policy if exists "UMKM update own projects" on projects;
drop policy if exists "UMKM insert own projects" on projects;
create policy "UMKM insert own projects" on projects for insert
  with check (auth.uid() = umkm_id and status = 'open' and talent_id is null);

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

-- Chat only opens once the talent accepted a brief from this UMKM.
drop policy if exists "Thread participants insert own messages" on messages;
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
