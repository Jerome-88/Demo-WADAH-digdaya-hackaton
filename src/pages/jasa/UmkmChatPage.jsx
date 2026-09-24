import { useState, useEffect } from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { api } from '../../lib/api';
import ChatThread from '../../components/ChatThread';

const BLUE = '#2b6fff';

// Real chat with a real (certified) talent — reached from that talent's
// RealTalentProfilePage. Independent of the curated-demo negotiate/contract
// pipeline (NegoChatPage etc.), which stays exactly as it was.
export default function UmkmChatPage() {
  const navigate = useNavigate();
  const { talentId } = useParams();
  const location = useLocation();
  const { mode, umkmProfile } = useApp();
  const [talentName, setTalentName] = useState(location.state?.talentName || null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (talentName) return;
    let cancelled = false;
    api.getPortfolio(talentId).then(res => {
      if (!cancelled) setTalentName(res.user.name);
    }).catch(() => {
      if (!cancelled) setError('Talent tidak ditemukan');
    });
    return () => { cancelled = true; };
  }, [talentId, talentName]);

  useEffect(() => {
    if (error) navigate('/jasa', { replace: true });
  }, [error, navigate]);

  const isUmkm = mode === 'real' && !!umkmProfile;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 flex-shrink-0" style={{ background: BLUE }}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Kembali</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          {talentName ? `Chat dengan ${talentName}` : 'Chat'}
        </h1>
      </header>

      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 py-6 md:py-8 flex flex-col">
        {!isUmkm && (
          <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: '#c9d3e0' }}>
            <p className="font-sora font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>Login sebagai UMKM dulu</p>
            <p className="text-sm font-inter text-gray-500 mb-5">Chat langsung ke talent butuh akun UMKM asli, bukan mode demo.</p>
            <button
              onClick={() => navigate('/jasa/daftar')}
              className="text-white font-bold py-3 px-8 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
              style={{ background: BLUE }}
            >
              Daftar / Masuk sebagai UMKM
            </button>
          </div>
        )}

        {isUmkm && talentName && (
          <ChatThread
            role="umkm"
            myId={umkmProfile.id}
            myName={umkmProfile.businessName}
            partnerId={talentId}
            partnerName={talentName}
          />
        )}
      </main>
    </div>
  );
}
