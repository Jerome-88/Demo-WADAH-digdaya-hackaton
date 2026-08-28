import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getTalentBySlug, NEGO_SCRIPT, NEXT_TALENT, formatRupiah } from '../../data/jasaData';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';
const RED = '#e5484d';

export default function NegoChatPage() {
  const navigate = useNavigate();
  const { talentSlug } = useParams();
  const { activeProject, setActiveProject } = useApp();
  const talent = getTalentBySlug(talentSlug);
  const script = NEGO_SCRIPT[talentSlug];

  const [messages, setMessages] = useState([]);
  const [dealState, setDealState] = useState('pending'); // pending | counter-input | agreed | confirm-reject | reject-loading | reject-next
  const [counterInput, setCounterInput] = useState('');
  const [highlight, setHighlight] = useState(false);

  useEffect(() => {
    if (!talent || !script) navigate('/jasa', { replace: true });
  }, [talent, script, navigate]);

  useEffect(() => {
    if (script) {
      const t = setTimeout(() => setMessages([{ role: 'talent', text: script.openingMessage }]), 500);
      return () => clearTimeout(t);
    }
  }, [script]);

  if (!talent || !script) return null;

  function sealDeal(userLine, talentLine) {
    setMessages(prev => [...prev, { role: 'user', text: userLine }]);
    setTimeout(() => {
      setMessages(prev => [...prev, { role: 'talent', text: talentLine }]);
      setActiveProject(prev => ({ ...prev, budgetNegotiated: script.agreedBudget, durasi: script.agreedDurasi }));
      setHighlight(true);
      setDealState('agreed');
      setTimeout(() => setHighlight(false), 2000);
    }, 900);
  }

  function handleSetuju() {
    sealDeal(script.confirmUser, script.confirmTalent);
  }

  function handleCounterSubmit() {
    if (!counterInput.trim()) return;
    const text = counterInput.trim();
    setCounterInput('');
    sealDeal(text, script.counterAck);
  }

  function handleTolak() {
    setDealState('confirm-reject');
  }

  function confirmReject() {
    setDealState('reject-loading');
    setTimeout(() => setDealState('reject-next'), 1500);
  }

  const nextSlug = NEXT_TALENT[talentSlug];
  const nextTalent = nextSlug ? getTalentBySlug(nextSlug) : null;
  const budget = activeProject.budgetNegotiated ?? activeProject.budget;

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 flex-shrink-0" style={{ background: BLUE }}>
        <button
          onClick={() => navigate(`/jasa/kontrak/${talentSlug}`)}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Draft Kontrak</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Chat & Nego
        </h1>
      </header>

      <main className="flex-1 max-w-[980px] w-full mx-auto px-4 py-6 md:py-8 flex flex-col md:flex-row gap-5">
        {/* Left: live contract (desktop always visible, mobile collapsible) */}
        <div className="md:w-[38%] shrink-0">
          <details className="md:hidden mb-3" open={false}>
            <summary className="text-xs font-inter cursor-pointer select-none text-gray-500">Lihat Draft Kontrak ▾</summary>
            <div className="mt-2">
              <ContractCard compact talent={talent} activeProject={activeProject} dealState={dealState} highlight={highlight} budget={budget} />
            </div>
          </details>
          <div className="hidden md:block sticky top-20">
            <ContractCard talent={talent} activeProject={activeProject} dealState={dealState} highlight={highlight} budget={budget} />
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
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div
                  className="max-w-[85%] rounded-2xl px-4 py-3 text-sm font-inter leading-relaxed whitespace-pre-line"
                  style={msg.role === 'user'
                    ? { background: BLUE, color: '#fff', borderTopRightRadius: 4 }
                    : { background: '#fff', color: '#1a1a1a', borderTopLeftRadius: 4, border: '1px solid #e5e9f0' }}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            <AnimatePresence>
              {dealState === 'reject-loading' && (
                <div className="flex flex-col items-center gap-2 py-6">
                  <div className="w-6 h-6 border-2 rounded-full animate-spin-fast" style={{ borderColor: '#d1d5db', borderTopColor: BLUE }}></div>
                  <p className="text-xs font-inter text-gray-400">Mencari talent lain yang cocok...</p>
                </div>
              )}
              {dealState === 'reject-next' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2.5 pt-2">
                  {nextTalent ? (
                    <>
                      <div className="bg-white border rounded-xl p-3.5" style={{ borderColor: '#e5e9f0' }}>
                        <p className="text-sm font-inter text-gray-600">{nextTalent.name} tersedia untuk proyekmu</p>
                      </div>
                      <button onClick={() => navigate(`/portfolio/${nextSlug}`)} className="w-full text-white font-bold py-3 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                        Lihat Profil {nextTalent.name.split(' ')[0]}
                      </button>
                    </>
                  ) : (
                    <div className="bg-white border rounded-xl p-3.5" style={{ borderColor: '#e5e9f0' }}>
                      <p className="text-sm font-inter text-gray-600">Belum ada talent lain yang cocok saat ini.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action zone */}
          <div className="border-t p-4" style={{ borderColor: '#e5e9f0' }}>
            {dealState === 'pending' && messages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={handleSetuju} className="text-xs font-bold font-inter px-3.5 py-2 rounded-full cursor-pointer transition-colors border-2" style={{ background: '#e3faf0', color: GREEN, borderColor: GREEN }}>
                  ✓ Setuju {formatRupiah(script.agreedBudget)}/{script.agreedDurasi}
                </button>
                <button onClick={() => setDealState('counter-input')} className="text-xs font-bold font-inter px-3.5 py-2 rounded-full cursor-pointer transition-colors border-2" style={{ background: '#eef2fe', color: BLUE, borderColor: BLUE }}>
                  ↔ Ajukan Counter
                </button>
                <button onClick={handleTolak} className="text-xs font-bold font-inter px-3.5 py-2 rounded-full cursor-pointer transition-colors border-2" style={{ background: '#fdecec', color: RED, borderColor: RED }}>
                  ✗ Tolak
                </button>
              </div>
            )}

            {dealState === 'counter-input' && (
              <div className="flex gap-2">
                <input
                  autoFocus
                  value={counterInput}
                  onChange={e => setCounterInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleCounterSubmit()}
                  placeholder="Ketik counter offer kamu..."
                  className="flex-1 rounded-full px-4 py-2 text-sm font-inter focus:outline-none border-2"
                  style={{ background: '#f5f8fb', borderColor: '#e5e9f0', color: '#1a1a1a' }}
                />
                <button onClick={handleCounterSubmit} disabled={!counterInput.trim()} className="w-10 h-10 rounded-full flex items-center justify-center text-white disabled:opacity-40 cursor-pointer border-0 shrink-0" style={{ background: BLUE }}>
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            )}

            {dealState === 'confirm-reject' && (
              <div className="flex flex-col gap-2.5">
                <p className="text-sm font-inter" style={{ color: '#1a1a1a' }}>Yakin tolak negosiasi ini?</p>
                <div className="flex gap-2">
                  <button onClick={confirmReject} className="flex-1 text-xs font-bold font-inter px-3.5 py-2.5 rounded-full cursor-pointer border-2" style={{ background: '#fdecec', color: RED, borderColor: RED }}>
                    Ya, tolak
                  </button>
                  <button onClick={() => setDealState('pending')} className="flex-1 text-xs font-bold font-inter px-3.5 py-2.5 rounded-full border-2 bg-transparent cursor-pointer" style={{ color: BLUE, borderColor: BLUE }}>
                    Batal
                  </button>
                </div>
              </div>
            )}

            {dealState === 'agreed' && (
              <button
                onClick={() => navigate(`/jasa/kontrak-final/${talentSlug}`)}
                className="w-full text-white font-bold py-3 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: GREEN }}
              >
                Review & Tanda Tangani Kontrak
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

function ContractCard({ compact, talent, activeProject, dealState, highlight, budget }) {
  return (
    <div className={`bg-white border-2 rounded-2xl ${compact ? 'p-4' : 'p-6'}`} style={{ borderColor: BLUE }}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold font-inter uppercase tracking-wide" style={{ color: BLUE }}>Draft Kontrak</span>
        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full font-inter border" style={{ color: ORANGE, borderColor: ORANGE, background: '#fff7ee' }}>
          {dealState === 'agreed' ? 'DIPERBARUI — menunggu konfirmasi final' : 'Dalam Negosiasi'}
        </span>
      </div>
      <div className="space-y-2.5 text-sm font-inter">
        <div className="flex justify-between"><span className="text-gray-400">Talent</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{talent.name}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">UMKM</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeProject.umkm}</span></div>
        <div className="flex justify-between"><span className="text-gray-400">Skill</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeProject.skill}</span></div>
        <div className="flex justify-between rounded-lg transition-colors duration-700" style={highlight ? { background: '#e3faf0', margin: '0 -8px', padding: '4px 8px' } : undefined}>
          <span className="text-gray-400">Budget</span>
          <span className="font-semibold" style={{ color: highlight ? GREEN : '#1a1a1a' }}>{formatRupiah(budget)}/bulan</span>
        </div>
        <div className="flex justify-between rounded-lg transition-colors duration-700" style={highlight ? { background: '#e3faf0', margin: '0 -8px', padding: '4px 8px' } : undefined}>
          <span className="text-gray-400">Durasi</span>
          <span className="font-semibold" style={{ color: highlight ? GREEN : '#1a1a1a' }}>{activeProject.durasi}</span>
        </div>
      </div>
    </div>
  );
}
