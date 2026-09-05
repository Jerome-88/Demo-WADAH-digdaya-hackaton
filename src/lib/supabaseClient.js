import { createClient } from '@supabase/supabase-js';

// Lazy singleton — never touched by demo mode, so a laptop with no
// VITE_SUPABASE_* env vars set can still run the demo flow with zero errors.
// Only real-mode code paths (auth, real-mode AppContext actions) call this.
let client = null;

export function getSupabase() {
  if (!client) {
    const url = import.meta.env.VITE_SUPABASE_URL;
    const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!url || !anonKey) {
      throw new Error('VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY belum di-set di .env.local');
    }
    client = createClient(url, anonKey);
  }
  return client;
}
