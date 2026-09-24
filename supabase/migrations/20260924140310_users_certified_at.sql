-- Talent pool needs a real, backend-persisted "this talent actually
-- finished the whole journey" signal instead of RinaCertification.jsx's
-- purely client-side certificateEarnedAt state (lost on reload, invisible
-- to anyone else). Null = not certified yet; set once by POST /user/certify
-- after the skill's certification exam is passed. See backend/sql/schema.sql
-- for the canonical column comment.
alter table users add column if not exists certified_at timestamptz;
