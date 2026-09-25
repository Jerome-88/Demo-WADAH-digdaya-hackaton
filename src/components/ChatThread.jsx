import { useEffect, useRef, useState } from 'react';
import { fetchThread, sendMessage } from '../lib/messages';

const BLUE = '#2b6fff';
const GREEN = '#00c897';

const POLL_INTERVAL_MS = 3000;

function initialsOf(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// Shared message-list + input UI for both sides of a real umkm<->talent
// thread. "Real-time" here is short-interval polling, not a Supabase
// Realtime subscription — simpler and needs no extra project config, at
// the cost of up to ~3s of lag, which is fine for this feature's scope.
export default function ChatThread({ role, myId, myName, partnerId, partnerName }) {
  const umkmId = role === 'umkm' ? myId : partnerId;
  const talentId = role === 'talent' ? myId : partnerId;

  const [messages, setMessages] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const rows = await fetchThread(umkmId, talentId);
        if (!cancelled) { setMessages(rows); setLoaded(true); }
      } catch {
        // Transient poll failure — keep showing whatever's already loaded.
      }
    }

    load();
    const interval = setInterval(load, POLL_INTERVAL_MS);
    return () => { cancelled = true; clearInterval(interval); };
  }, [umkmId, talentId]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [messages]);

  async function handleSend() {
    const trimmed = text.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    // Optimistic append — the next poll reconciles with the real row.
    const optimistic = { id: `local-${Date.now()}`, sender_role: role, text: trimmed, created_at: new Date().toISOString() };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    try {
      await sendMessage({ umkmId, talentId, umkmName: role === 'umkm' ? myName : partnerName, talentName: role === 'talent' ? myName : partnerName, senderRole: role, text: trimmed });
    } catch (err) {
      // 42501 = messages RLS: no brief between these two has been accepted yet.
      setError(err.code === '42501' ? 'Chat kebuka setelah talent menerima brief proyekmu' : (err.message || 'Pesan gagal dikirim'));
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setText(trimmed);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex-1 bg-white border-2 rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: 480, borderColor: BLUE }}>
      <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: '#e5e9f0' }}>
        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-sora font-bold text-xs shrink-0" style={{ background: BLUE }}>
          {initialsOf(partnerName)}
        </div>
        <div>
          <div className="text-sm font-bold font-sora" style={{ color: '#1a1a1a' }}>{partnerName}</div>
          <div className="text-[11px] font-inter text-gray-400">{role === 'umkm' ? 'Talent WADAH' : 'UMKM'}</div>
        </div>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f5f8fb' }}>
        {loaded && messages.length === 0 && (
          <p className="text-sm font-inter text-gray-400 text-center mt-6">Belum ada pesan — mulai obrolan di bawah.</p>
        )}
        {messages.map((msg, i) => {
          const mine = msg.sender_role === role;
          return (
            <div key={msg.id ?? i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div
                className="max-w-[85%] rounded-2xl px-4 py-3 text-sm font-inter leading-relaxed"
                style={mine
                  ? { background: BLUE, color: '#fff', borderTopRightRadius: 4 }
                  : { background: '#fff', color: '#1a1a1a', borderTopLeftRadius: 4, border: '1px solid #e5e9f0' }}
              >
                {msg.text}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="px-4 pt-2 text-xs font-inter font-semibold text-center" style={{ color: '#e5484d' }}>{error}</div>
      )}

      <div className="border-t p-3" style={{ borderColor: '#e5e9f0' }}>
        <div className="flex gap-2">
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Kirim pesan ke ${partnerName.split(' ')[0]}...`}
            className="flex-1 rounded-full px-4 py-2 text-sm font-inter focus:outline-none border-2"
            style={{ background: '#f5f8fb', borderColor: '#e5e9f0', color: '#1a1a1a' }}
          />
          <button onClick={handleSend} disabled={!text.trim() || sending} className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 cursor-pointer border-0 shrink-0" style={{ background: GREEN }}>
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
