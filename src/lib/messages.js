import { getSupabase } from './supabaseClient';

// Direct-Supabase (RLS-scoped) access to the `messages` table — same
// no-dedicated-endpoint model as umkm_profiles/projects in AppContext.jsx:
// there's no business logic here to guard behind a service-role backend
// endpoint, just "read/write your own thread".

const MEDIA_BUCKET = 'chat-media';
export const MAX_ATTACHMENT_BYTES = 10 * 1024 * 1024; // matches the bucket's file_size_limit
const SIGNED_URL_TTL_S = 60 * 60;

// ChatThread polls every few seconds — re-signing every attachment on every
// poll would hand back a new URL each time and make images reload/flicker,
// so signed URLs are reused until shortly before they expire.
const signedUrlCache = new Map(); // path -> { url, expiresAt }

async function signAttachments(rows) {
  const now = Date.now();
  const missing = [...new Set(rows.map(r => r.attachment_path).filter(Boolean))]
    .filter(path => !(signedUrlCache.get(path)?.expiresAt > now + 60_000));
  if (missing.length) {
    const { data } = await getSupabase().storage.from(MEDIA_BUCKET).createSignedUrls(missing, SIGNED_URL_TTL_S);
    for (const item of data ?? []) {
      if (item.signedUrl) signedUrlCache.set(item.path, { url: item.signedUrl, expiresAt: now + SIGNED_URL_TTL_S * 1000 });
    }
  }
  return rows.map(r => (r.attachment_path ? { ...r, attachment_url: signedUrlCache.get(r.attachment_path)?.url ?? null } : r));
}

// Every message in a single umkm<->talent thread, oldest first, with a
// signed `attachment_url` added to any row that carries a file.
export async function fetchThread(umkmId, talentId) {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .eq('umkm_id', umkmId)
    .eq('talent_id', talentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return signAttachments(data ?? []);
}

// `file` is optional — uploaded to this thread's own folder in the private
// chat-media bucket first, then referenced from the message row. Storage's
// own policy rejects the upload (42501-equivalent) if the brief between
// these two hasn't been accepted yet, same as the messages insert policy.
export async function sendMessage({ umkmId, talentId, umkmName, talentName, senderRole, text, file }) {
  const supabase = getSupabase();
  let attachment = {};
  if (file) {
    if (file.size > MAX_ATTACHMENT_BYTES) throw new Error('Ukuran file maksimal 10 MB');
    const safeName = file.name.replace(/[^\w.-]+/g, '_');
    const path = `${umkmId}/${talentId}/${Date.now()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from(MEDIA_BUCKET).upload(path, file, {
      contentType: file.type || 'application/octet-stream',
    });
    if (uploadError) {
      // storage-js reports an RLS rejection as a 403 / "row-level security"
      // message rather than a Postgres code — normalize it so ChatThread's
      // "brief belum diterima" message covers both.
      if (uploadError.statusCode === '403' || /row-level security/i.test(uploadError.message)) {
        throw Object.assign(new Error(uploadError.message), { code: '42501' });
      }
      throw uploadError;
    }
    attachment = {
      attachment_path: path,
      attachment_name: file.name,
      attachment_type: file.type || null,
      attachment_size: file.size,
    };
  }
  const { error } = await supabase.from('messages').insert({
    umkm_id: umkmId,
    talent_id: talentId,
    umkm_name: umkmName,
    talent_name: talentName,
    sender_role: senderRole,
    text: text || null,
    ...attachment,
  });
  if (error) throw error;
}

// One row per distinct thread the current talent is in, most recent first
// — powers TalentInboxPage. `myId` is the signed-in talent's own id, used
// only to pick the right column set (RLS already restricts to their rows).
export async function fetchTalentConversations(talentId) {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('umkm_id, umkm_name, text, attachment_name, sender_role, created_at')
    .eq('talent_id', talentId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return dedupeByPartner(data ?? [], 'umkm_id', 'umkm_name');
}

// UMKM-side counterpart — one row per distinct talent thread, most recent
// message first, powers a UMKM's own conversation list.
export async function fetchUmkmConversations(umkmId) {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('talent_id, talent_name, text, attachment_name, sender_role, created_at')
    .eq('umkm_id', umkmId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return dedupeByPartner(data ?? [], 'talent_id', 'talent_name');
}

// Rows already come back newest-first, so the first occurrence of each
// partner id is that thread's latest message.
function dedupeByPartner(rows, idKey, nameKey) {
  const seen = new Set();
  const out = [];
  for (const row of rows) {
    if (seen.has(row[idKey])) continue;
    seen.add(row[idKey]);
    out.push({ partnerId: row[idKey], partnerName: row[nameKey], lastText: row.text || (row.attachment_name ? `📎 ${row.attachment_name}` : ''), lastSenderRole: row.sender_role, lastAt: row.created_at });
  }
  return out;
}
