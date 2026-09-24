import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import ChatThread from '../../components/ChatThread';

const BLUE = '#2b6fff';

export default function TalentChatPage() {
  const navigate = useNavigate();
  const { umkmId } = useParams();
  const location = useLocation();
  const { mode, authUser, realUserName } = useApp();
  const umkmName = location.state?.umkmName || 'UMKM';

  const isRealTalent = mode === 'real' && !!authUser;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 flex-shrink-0" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/rina/pesan')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Pesan</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Chat dengan {umkmName}
        </h1>
      </header>

      <main className="flex-1 max-w-[720px] w-full mx-auto px-4 py-6 md:py-8 flex flex-col">
        {!isRealTalent && (
          <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: '#c9d3e0' }}>
            <p className="text-sm font-inter text-gray-500">Login sebagai talent asli dulu buat buka pesan ini.</p>
          </div>
        )}

        {isRealTalent && (
          <ChatThread
            role="talent"
            myId={authUser.id}
            myName={realUserName || 'Talent'}
            partnerId={umkmId}
            partnerName={umkmName}
          />
        )}
      </main>
    </div>
  );
}
