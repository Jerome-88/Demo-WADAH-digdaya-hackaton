-- File/image attachments in real umkm<->talent chat. See
-- backend/sql/schema.sql for the full commented version.

-- ── messages: optional attachment, text becomes optional ──────────────
alter table messages alter column text drop not null;
alter table messages add column if not exists attachment_path text;
alter table messages add column if not exists attachment_name text;
alter table messages add column if not exists attachment_type text;
alter table messages add column if not exists attachment_size int;
alter table messages add constraint messages_text_or_attachment
  check (text is not null or attachment_path is not null);
-- An attachment must live in this thread's own folder — no pointing a
-- message at some other thread's file.
alter table messages add constraint messages_attachment_in_thread
  check (attachment_path is null or attachment_path like umkm_id::text || '/' || talent_id::text || '/%');

-- ── chat-media bucket: private, 10 MB per file ─────────────────────────
-- Object path: <umkm_id>/<talent_id>/<timestamp>-<filename>
insert into storage.buckets (id, name, public, file_size_limit)
values ('chat-media', 'chat-media', false, 10485760)
on conflict (id) do nothing;

-- Either side of the thread can read its files (via signed URLs).
create policy "Chat participants read media" on storage.objects for select to authenticated
  using (
    bucket_id = 'chat-media' and (
      auth.uid()::text = (storage.foldername(name))[1] or
      auth.uid()::text = (storage.foldername(name))[2]
    )
  );

-- Upload only into your own thread, and only once the brief was accepted —
-- same gate as the messages insert policy.
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
