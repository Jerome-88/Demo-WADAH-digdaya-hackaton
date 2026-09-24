import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { fetchTalentConversations } from '../../lib/messages';

const BLUE = '#2b6fff';

function initialsOf(name) {
  return (name || '?').split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// Talent-side counterpart of UmkmInboxPage — real chat threads from real
// UMKM accounts, started on the UMKM's side via a real talent's public
// profile (RealTalentProfilePage). Independent of the curated-demo
// negotiate/contract pipeline, which stays exactly as it was.
export default function TalentInboxPage() {
  const navigate = useNavigate();
  const { mode, authUser, realUserName } = useApp();
  const [conversations, setConversations] = useState(null); // null = loading

  const isRealTalent = mode === 'real' && !!authUser;

  useEffect(() => {
    if (!isRealTalent) return;
    let cancelled = false;
    fetchTalentConversations(authUser.id).then(rows => {
      if (!cancelled) setConversations(rows);
    }).catch(() => {
      if (!cancelled) setConversations([]);
    });
    return () => { cancelled = true; };
  }, [isRealTalent, authUser]);

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/rina/task')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Peta Misi</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Pesan
        </h1>
      </header>

      <main className="max-w-[720px] mx-auto px-4 py-8">
        {!isRealTalent && (
          <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: '#c9d3e0' }}>
            <p className="font-sora font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>Login sebagai talent asli dulu</p>
            <p className="text-sm font-inter text-gray-500 mb-5">Pesan cuma tersedia buat akun talent asli, bukan mode demo.</p>
            <button
              onClick={() => navigate('/talenta')}
              className="text-white font-bold py-3 px-8 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
              style={{ background: BLUE }}
            >
              Daftar / Masuk sebagai Talent
            </button>
          </div>
        )}

        {isRealTalent && conversations?.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: '#c9d3e0' }}>
            <p className="text-sm font-inter text-gray-500">Belum ada percakapan. Begitu ada UMKM yang chat dari profilmu, obrolannya muncul di sini.</p>
          </div>
        )}

        {isRealTalent && conversations && conversations.length > 0 && (
          <div className="flex flex-col gap-3">
            {conversations.map(c => (
              <button
                key={c.partnerId}
                onClick={() => navigate(`/rina/pesan/${c.partnerId}`, { state: { umkmName: c.partnerName } })}
                className="w-full text-left bg-white border-2 rounded-2xl p-4 flex items-center gap-3 cursor-pointer transition-all hover:shadow-md"
                style={{ borderColor: '#e5e9f0' }}
              >
                <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-sora font-bold text-sm shrink-0" style={{ background: BLUE }}>
                  {initialsOf(c.partnerName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-sora font-bold text-sm truncate" style={{ color: '#1a1a1a' }}>{c.partnerName}</div>
                  <div className="text-xs font-inter text-gray-500 truncate">{c.lastSenderRole === 'talent' ? `${realUserName || 'Kamu'}: ` : ''}{c.lastText}</div>
                </div>
              </button>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
