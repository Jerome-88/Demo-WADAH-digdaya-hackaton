import { getSupabase } from './supabaseClient';

export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

async function authedFetch(path, { method = 'GET', body, isForm = false } = {}) {
  const { data: { session } } = await getSupabase().auth.getSession();
  if (!session) throw new Error('Belum login — sesi Supabase tidak ditemukan');

  const headers = { Authorization: `Bearer ${session.access_token}` };
  // Multipart bodies must NOT get an explicit Content-Type — the browser
  // needs to set its own boundary, or the backend can't parse the form.
  if (!isForm) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: isForm ? body : body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.detail || `HTTP ${res.status}`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const api = {
  getMe: () => authedFetch('/user/me'),
  updateMe: (body) => authedFetch('/user/me', { method: 'PATCH', body }),

  getProgress: () => authedFetch('/progress'),
  openUnit: (unit_id) => authedFetch('/unit/open', { method: 'POST', body: { unit_id } }),
  completeUnit: (unit_id, quiz_score, quiz_attempts) =>
    authedFetch('/unit/complete', { method: 'POST', body: { unit_id, quiz_score, quiz_attempts } }),

  submitCheckpoint: (unit_id, content_text, file) => {
    const form = new FormData();
    form.append('unit_id', unit_id);
    form.append('content_text', content_text || '');
    if (file) form.append('file', file);
    return authedFetch('/submission', { method: 'POST', body: form, isForm: true });
  },
  getMySubmissions: () => authedFetch('/submission/my'),

  mentorChat: (message, unit_id, unit_stage) =>
    authedFetch('/mentor/chat', { method: 'POST', body: { message, unit_id, unit_stage } }),

  getInsight: () => authedFetch('/insight/skill'),
  analyzeInsight: () => authedFetch('/insight/analyze', { method: 'POST' }),
  upgradePremium: () => authedFetch('/user/upgrade-premium', { method: 'POST' }),
};
