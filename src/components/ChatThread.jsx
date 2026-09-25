import { useEffect, useRef, useState } from 'react';
import { fetchThread, sendMessage, MAX_ATTACHMENT_BYTES } from '../lib/messages';

const BLUE = '#2b6fff';
const GREEN = '#00c897';

const POLL_INTERVAL_MS = 3000;

function formatBytes(n) {
  if (!n) return '';
  if (n < 1024 * 1024) return `${Math.max(1, Math.round(n / 1024))} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

// Image attachments render inline; anything else is a download card.
function Attachment({ msg, mine }) {
  const isImage = msg.attachment_type?.startsWith('image/');
  if (!msg.attachment_url) {
    return (
      <div className="text-xs italic opacity-80">
        <i className="fa-solid fa-paperclip mr-1.5"></i>{msg.attachment_name}{msg.uploading ? ' — mengunggah...' : ''}
      </div>
    );
  }
  if (isImage) {
    return (
      <a href={msg.attachment_url} target="_blank" rel="noreferrer">
        <img src={msg.attachment_url} alt={msg.attachment_name} className="rounded-xl max-h-64 max-w-full object-contain" />
      </a>
    );
  }
  return (
    <a
      href={msg.attachment_url}
      target="_blank"
      rel="noreferrer"
      download={msg.attachment_name}
      className="flex items-center gap-3 rounded-xl px-3 py-2 no-underline"
      style={{ background: mine ? 'rgba(255,255,255,0.15)' : '#f5f8fb', color: 'inherit' }}
    >
      <i className="fa-solid fa-file-arrow-down text-lg"></i>
      <span className="min-w-0">
        <span className="block font-semibold truncate">{msg.attachment_name}</span>
        <span className="block text-[11px] opacity-70">{formatBytes(msg.attachment_size)}</span>
      </span>
    </a>
  );
}

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
  const [file, setFile] = useState(null);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  function handlePickFile(e) {
    const picked = e.target.files?.[0];
    e.target.value = ''; // so picking the same file again still fires onChange
    if (!picked) return;
    if (picked.size > MAX_ATTACHMENT_BYTES) {
      setError('Ukuran file maksimal 10 MB');
      return;
    }
    setError(null);
    setFile(picked);
  }

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
    const pending = file;
    if ((!trimmed && !pending) || sending) return;
    setSending(true);
    setError(null);
    // Optimistic append — the next poll reconciles with the real row.
    const optimistic = {
      id: `local-${Date.now()}`, sender_role: role, text: trimmed || null, created_at: new Date().toISOString(),
      ...(pending && { attachment_path: 'pending', attachment_name: pending.name, attachment_type: pending.type, uploading: true }),
    };
    setMessages(prev => [...prev, optimistic]);
    setText('');
    setFile(null);
    try {
      await sendMessage({ umkmId, talentId, umkmName: role === 'umkm' ? myName : partnerName, talentName: role === 'talent' ? myName : partnerName, senderRole: role, text: trimmed, file: pending });
    } catch (err) {
      // 42501 = messages/storage RLS: no brief between these two has been accepted yet.
      setError(err.code === '42501' ? 'Chat kebuka setelah talent menerima brief proyekmu' : (err.message || 'Pesan gagal dikirim'));
      setMessages(prev => prev.filter(m => m.id !== optimistic.id));
      setText(trimmed);
      setFile(pending);
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
                {msg.attachment_path && <Attachment msg={msg} mine={mine} />}
                {msg.text && <div className={msg.attachment_path ? 'mt-2' : ''}>{msg.text}</div>}
              </div>
            </div>
          );
        })}
      </div>

      {error && (
        <div className="px-4 pt-2 text-xs font-inter font-semibold text-center" style={{ color: '#e5484d' }}>{error}</div>
      )}

      <div className="border-t p-3" style={{ borderColor: '#e5e9f0' }}>
        {file && (
          <div className="flex items-center gap-2 mb-2 rounded-xl px-3 py-2 text-xs font-inter" style={{ background: '#f5f8fb', color: '#1a1a1a' }}>
            <i className="fa-solid fa-paperclip" style={{ color: BLUE }}></i>
            <span className="flex-1 min-w-0 truncate font-semibold">{file.name}</span>
            <span className="text-gray-400 shrink-0">{formatBytes(file.size)}</span>
            <button onClick={() => setFile(null)} title="Batal lampirkan" className="bg-transparent border-0 cursor-pointer text-gray-400 hover:text-gray-600 shrink-0">
              <i className="fa-solid fa-xmark"></i>
            </button>
          </div>
        )}
        <div className="flex gap-2">
          <input ref={fileInputRef} type="file" onChange={handlePickFile} className="hidden" />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={sending}
            title="Lampirkan file"
            className="w-10 h-10 rounded-full flex items-center justify-center disabled:opacity-40 cursor-pointer border-2 shrink-0 bg-white"
            style={{ borderColor: '#e5e9f0', color: BLUE }}
          >
            <i className="fa-solid fa-paperclip text-sm"></i>
          </button>
          <input
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSend()}
            placeholder={`Kirim pesan ke ${partnerName.split(' ')[0]}...`}
            className="flex-1 rounded-full px-4 py-2 text-sm font-inter focus:outline-none border-2"
            style={{ background: '#f5f8fb', borderColor: '#e5e9f0', color: '#1a1a1a' }}
          />
          <button onClick={handleSend} disabled={(!text.trim() && !file) || sending} className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 cursor-pointer border-0 shrink-0" style={{ background: GREEN }}>
            <i className="fa-solid fa-paper-plane text-xs"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
