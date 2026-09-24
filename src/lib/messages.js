import { getSupabase } from './supabaseClient';

// Direct-Supabase (RLS-scoped) access to the `messages` table — same
// no-dedicated-endpoint model as umkm_profiles/projects in AppContext.jsx:
// there's no business logic here to guard behind a service-role backend
// endpoint, just "read/write your own thread".

// Every message in a single umkm<->talent thread, oldest first.
export async function fetchThread(umkmId, talentId) {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('*')
    .eq('umkm_id', umkmId)
    .eq('talent_id', talentId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function sendMessage({ umkmId, talentId, umkmName, talentName, senderRole, text }) {
  const { error } = await getSupabase().from('messages').insert({
    umkm_id: umkmId,
    talent_id: talentId,
    umkm_name: umkmName,
    talent_name: talentName,
    sender_role: senderRole,
    text,
  });
  if (error) throw error;
}

// One row per distinct thread the current talent is in, most recent first
// — powers TalentInboxPage. `myId` is the signed-in talent's own id, used
// only to pick the right column set (RLS already restricts to their rows).
export async function fetchTalentConversations(talentId) {
  const { data, error } = await getSupabase()
    .from('messages')
    .select('umkm_id, umkm_name, text, sender_role, created_at')
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
    .select('talent_id, talent_name, text, sender_role, created_at')
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
    out.push({ partnerId: row[idKey], partnerName: row[nameKey], lastText: row.text, lastSenderRole: row.sender_role, lastAt: row.created_at });
  }
  return out;
}
