import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useApp } from '../../context/AppContext';
import { getTalentBySlug, formatRupiah } from '../../data/jasaData';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

// The ongoing-project workspace — reached from the Find Talent dashboard's
// "Kontrak Aktif" card, not from the sign-and-pay flow itself (that ends at
// KontrakFinalPage's confirmation screen). Escrow status and chat are local
// state, same tradeoff as the rest of this demo: reset on remount, good
// enough to walk through live, not meant to survive a real reload.
export default function ProjectChatPage() {
  const navigate = useNavigate();
  const { talentSlug } = useParams();
  const { activeProject } = useApp();
  const talent = getTalentBySlug(talentSlug);

  const [escrowStatus, setEscrowStatus] = useState('held'); // held | submitted | released
  const [releaseInfo, setReleaseInfo] = useState(null); // { txId, timestamp }
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');

  const isActiveProject = activeProject?.status === 'matched' && activeProject?.talentSlug === talentSlug;

  useEffect(() => {
    if (!talent || !isActiveProject) navigate('/jasa', { replace: true });
  }, [talent, isActiveProject, navigate]);

  useEffect(() => {
    const t = setTimeout(() => {
      setChatMessages([{ role: 'talent', text: 'Halo! Makasih udah setuju kerja sama. Aku mulai kerjain proyeknya sekarang ya.' }]);
    }, 500);
    return () => clearTimeout(t);
  }, []);

  if (!talent || !isActiveProject) return null;

  const budget = activeProject.budgetNegotiated ?? activeProject.budget;

  function handleSendChat() {
    if (!chatInput.trim()) return;
    const text = chatInput.trim();
    setChatInput('');
    setChatMessages(prev => [...prev, { role: 'user', text }]);
  }

  // Demo-only trigger standing in for the talent's own submission action
  // (no separate talent-side view is wired into this flow) — what matters
  // for the escrow mechanism is that *some* event flips held → submitted
  // before the UMKM can approve.
  function handleTalentSubmitWork() {
    setChatMessages(prev => [...prev, { role: 'talent', text: 'Hasil kerja bulan ini udah aku kirim — cek file terlampir ya!', file: true }]);
    setEscrowStatus('submitted');
  }

  // The one step in this whole flow that must stay an explicit UMKM click —
  // dana never auto-releases just because work was submitted.
  function handleApproveWork() {
    const txId = `ESC-${Date.now().toString(36).toUpperCase()}`;
    const timestamp = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    setReleaseInfo({ txId, timestamp });
    setEscrowStatus('released');
    setChatMessages(prev => [...prev, { role: 'user', text: '✓ Hasil kerja diterima — dana escrow udah aku lepas ke kamu. Makasih ya!' }]);
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 flex-shrink-0" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/jasa')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Dashboard</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          {activeProject.umkm} × {talent.name}
        </h1>
      </header>

      <main className="flex-1 max-w-[980px] w-full mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-5">
        {/* Left: contract + escrow status */}
        <div className="md:w-[38%] shrink-0 flex flex-col gap-4">
          <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: GREEN, background: '#e3faf0' }}>
            <div className="font-sora font-extrabold text-sm mb-2" style={{ color: GREEN }}>KONTRAK AKTIF ✓</div>
            <div className="font-sora font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>{talent.name}</div>
            <div className="text-xs font-inter text-gray-600">{formatRupiah(budget)}/bulan · {activeProject.durasi}</div>
          </div>

          <div className="rounded-2xl p-5 border-2" style={{ borderColor: escrowStatus === 'released' ? GREEN : ORANGE, background: escrowStatus === 'released' ? '#e3faf0' : '#fff7ee' }}>
            <div className="flex items-center gap-2 mb-2">
              <i className={`fa-solid ${escrowStatus === 'held' ? 'fa-lock' : escrowStatus === 'submitted' ? 'fa-box-open' : 'fa-circle-check'} text-sm`} style={{ color: escrowStatus === 'released' ? GREEN : ORANGE }}></i>
              <span className="text-[11px] font-bold font-inter uppercase tracking-wide" style={{ color: escrowStatus === 'released' ? GREEN : ORANGE }}>
                {escrowStatus === 'held' && 'Dana Ditahan Platform'}
                {escrowStatus === 'submitted' && 'Menunggu Persetujuan'}
                {escrowStatus === 'released' && 'Dana Dilepas ke Talent'}
              </span>
            </div>

            <div className="font-sora font-extrabold text-xl mb-2" style={{ color: '#1a1a1a' }}>{formatRupiah(budget)}</div>

            {escrowStatus === 'held' && (
              <p className="text-sm font-inter text-gray-600">Ditahan WADAH — akan dilepas ke {talent.name.split(' ')[0]} setelah kamu terima hasil kerja bulan ini.</p>
            )}

            {escrowStatus === 'submitted' && (
              <>
                <p className="text-sm font-inter text-gray-600 mb-4">{talent.name.split(' ')[0]} udah kirim hasil kerja lewat chat. Cek hasilnya, baru setujui biar dananya dilepas.</p>
                <button onClick={handleApproveWork} className="w-full text-white font-bold py-2.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                  ✓ Terima Hasil Kerja &amp; Lepas Dana
                </button>
              </>
            )}

            {escrowStatus === 'released' && releaseInfo && (
              <div className="text-sm font-inter text-gray-600">
                <p className="mb-2">Dana udah cair ke {talent.name.split(' ')[0]}.</p>
                <div className="rounded-xl p-3" style={{ background: '#fff' }}>
                  <div className="flex justify-between text-xs"><span className="text-gray-400">ID Transaksi</span><span className="font-mono font-semibold" style={{ color: '#1a1a1a' }}>{releaseInfo.txId}</span></div>
                  <div className="flex justify-between text-xs mt-1"><span className="text-gray-400">Waktu</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{releaseInfo.timestamp}</span></div>
                </div>
              </div>
            )}

            {escrowStatus === 'held' && (
              <button onClick={handleTalentSubmitWork} className="mt-3 text-xs font-inter text-gray-400 hover:text-gray-600 bg-transparent border-0 cursor-pointer underline text-left">
                Demo: simulasikan {talent.name.split(' ')[0]} kirim hasil kerja
              </button>
            )}
          </div>
        </div>

        {/* Right: chat */}
        <div className="flex-1 bg-white border-2 rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: 480, borderColor: BLUE }}>
          <div className="px-5 py-4 border-b flex items-center gap-3" style={{ borderColor: '#e5e9f0' }}>
            {talent.avatarImg ? (
              <img src={talent.avatarImg} alt={talent.name} className="w-9 h-9 rounded-full object-cover shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-sora font-bold text-xs shrink-0" style={{ background: talent.avatarBg }}>
                {talent.initials}
              </div>
            )}
            <div>
              <div className="text-sm font-bold font-sora" style={{ color: '#1a1a1a' }}>{talent.name}</div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: GREEN }}></span>
                <span className="text-[11px] font-inter text-gray-400">Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3" style={{ background: '#f5f8fb' }}>
            {chatMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm font-inter leading-relaxed"
                  style={msg.role === 'user'
                    ? { background: BLUE, color: '#fff', borderTopRightRadius: 4 }
                    : { background: '#fff', color: '#1a1a1a', borderTopLeftRadius: 4, border: '1px solid #e5e9f0' }}
                >
                  {msg.file ? (
                    <span className="flex items-center gap-2"><i className="fa-solid fa-file-arrow-down"></i>{msg.text}</span>
                  ) : msg.text}
                </div>
              </div>
            ))}
          </div>

          <div className="border-t p-3" style={{ borderColor: '#e5e9f0' }}>
            <div className="flex gap-2">
              <input
                value={chatInput}
                onChange={e => setChatInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                placeholder={`Kirim pesan ke ${talent.name.split(' ')[0]}...`}
                className="flex-1 rounded-full px-4 py-2 text-sm font-inter focus:outline-none border-2"
                style={{ background: '#f5f8fb', borderColor: '#e5e9f0', color: '#1a1a1a' }}
              />
              <button onClick={handleSendChat} disabled={!chatInput.trim()} className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 cursor-pointer border-0 shrink-0" style={{ background: BLUE }}>
                <i className="fa-solid fa-paper-plane text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
