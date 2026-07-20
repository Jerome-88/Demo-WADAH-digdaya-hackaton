import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getTalentBySlug, NEGO_SCRIPT, NEXT_TALENT, formatRupiah } from '../../data/jasaData';

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
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => navigate(`/jasa/kontrak/${talentSlug}`)}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
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
            <summary className="text-white/60 text-xs font-inter cursor-pointer select-none">Lihat Draft Kontrak ▾</summary>
            <div className="mt-2">
              <ContractCard compact talent={talent} activeProject={activeProject} dealState={dealState} highlight={highlight} budget={budget} />
            </div>
          </details>
          <div className="hidden md:block sticky top-20">
            <ContractCard talent={talent} activeProject={activeProject} dealState={dealState} highlight={highlight} budget={budget} />
          </div>
        </div>

        {/* Right: chat */}
        <div className="flex-1 bg-[#1A1A2E] border border-white/10 rounded-2xl flex flex-col overflow-hidden" style={{ minHeight: 480 }}>
          <div className="px-5 py-4 border-b border-white/10 flex items-center gap-3">
            {talent.avatarImg ? (
              <img src={talent.avatarImg} alt={talent.name} className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" />
            ) : (
              <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-sora font-bold text-xs shrink-0" style={{ background: talent.avatarBg }}>
                {talent.initials}
              </div>
            )}
            <div>
              <div className="text-white text-sm font-bold font-sora">{talent.name}</div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                <span className="text-white/40 text-[11px] font-inter">Online</span>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm font-inter leading-relaxed whitespace-pre-line ${
                  msg.role === 'user' ? 'bg-purple text-white rounded-tr-sm' : 'bg-white/[0.04] text-white/80 border border-white/5 rounded-tl-sm'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            <AnimatePresence>
              {dealState === 'reject-loading' && (
                <div className="flex flex-col items-center gap-2 py-6">
                  <div className="w-6 h-6 border-2 border-white/20 border-t-white/60 rounded-full animate-spin-fast"></div>
                  <p className="text-white/40 text-xs font-inter">Mencari talent lain yang cocok...</p>
                </div>
              )}
              {dealState === 'reject-next' && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-2.5 pt-2">
                  {nextTalent ? (
                    <>
                      <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
                        <p className="text-white/60 text-sm font-inter">{nextTalent.name} tersedia untuk proyekmu</p>
                      </div>
                      <button onClick={() => navigate(`/portfolio/${nextSlug}`)} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3 rounded-xl transition-all text-sm cursor-pointer border-0">
                        Lihat Profil {nextTalent.name.split(' ')[0]}
                      </button>
                    </>
                  ) : (
                    <div className="bg-white/[0.03] border border-white/10 rounded-xl p-3.5">
                      <p className="text-white/60 text-sm font-inter">Belum ada talent lain yang cocok saat ini.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Action zone */}
          <div className="border-t border-white/10 p-4">
            {dealState === 'pending' && messages.length > 0 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={handleSetuju} className="text-xs font-bold font-inter px-3.5 py-2 rounded-lg bg-green-500/15 text-green-400 border border-green-500/30 cursor-pointer hover:bg-green-500/25 transition-colors">
                  ✓ Setuju {formatRupiah(script.agreedBudget)}/{script.agreedDurasi}
                </button>
                <button onClick={() => setDealState('counter-input')} className="text-xs font-bold font-inter px-3.5 py-2 rounded-lg bg-purple/15 text-purple border border-purple/30 cursor-pointer hover:bg-purple/25 transition-colors">
                  ↔ Ajukan Counter
                </button>
                <button onClick={handleTolak} className="text-xs font-bold font-inter px-3.5 py-2 rounded-lg bg-rose-500/10 text-rose-400 border border-rose-500/25 cursor-pointer hover:bg-rose-500/20 transition-colors">
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
                  className="flex-1 bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder:text-white/25 font-inter focus:outline-none focus:border-purple/50"
                />
                <button onClick={handleCounterSubmit} disabled={!counterInput.trim()} className="w-10 h-10 rounded-lg bg-purple flex items-center justify-center text-white disabled:opacity-40 cursor-pointer border-0 shrink-0">
                  <i className="fa-solid fa-paper-plane text-xs"></i>
                </button>
              </div>
            )}

            {dealState === 'confirm-reject' && (
              <div className="flex flex-col gap-2.5">
                <p className="text-white/70 text-sm font-inter">Yakin tolak negosiasi ini?</p>
                <div className="flex gap-2">
                  <button onClick={confirmReject} className="flex-1 text-xs font-bold font-inter px-3.5 py-2.5 rounded-lg bg-rose-500/15 text-rose-400 border border-rose-500/30 cursor-pointer">
                    Ya, tolak
                  </button>
                  <button onClick={() => setDealState('pending')} className="flex-1 text-xs font-bold font-inter px-3.5 py-2.5 rounded-lg border border-white/15 text-white/60 bg-transparent cursor-pointer">
                    Batal
                  </button>
                </div>
              </div>
            )}

            {dealState === 'agreed' && (
              <button
                onClick={() => navigate(`/jasa/kontrak-final/${talentSlug}`)}
                className="w-full bg-purple hover:brightness-110 text-white font-bold py-3 rounded-xl transition-all text-sm cursor-pointer border-0"
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
    <div className={`bg-[#1A1A2E] border border-white/10 rounded-2xl ${compact ? 'p-4' : 'p-6'}`}>
      <div className="flex items-center justify-between mb-4">
        <span className="text-[11px] font-bold text-white/40 font-inter uppercase tracking-wide">Draft Kontrak</span>
        <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2 py-0.5 rounded-full font-inter">
          {dealState === 'agreed' ? 'DIPERBARUI — menunggu konfirmasi final' : 'Dalam Negosiasi'}
        </span>
      </div>
      <div className="space-y-2.5 text-sm font-inter">
        <div className="flex justify-between"><span className="text-white/40">Talent</span><span className="text-white font-semibold">{talent.name}</span></div>
        <div className="flex justify-between"><span className="text-white/40">UMKM</span><span className="text-white font-semibold">{activeProject.umkm}</span></div>
        <div className="flex justify-between"><span className="text-white/40">Skill</span><span className="text-white font-semibold">{activeProject.skill}</span></div>
        <div className={`flex justify-between rounded-lg transition-colors duration-700 ${highlight ? 'bg-green-500/15 -mx-2 px-2 py-1' : ''}`}>
          <span className="text-white/40">Budget</span>
          <span className={`font-semibold ${highlight ? 'text-green-400' : 'text-white'}`}>{formatRupiah(budget)}/bulan</span>
        </div>
        <div className={`flex justify-between rounded-lg transition-colors duration-700 ${highlight ? 'bg-green-500/15 -mx-2 px-2 py-1' : ''}`}>
          <span className="text-white/40">Durasi</span>
          <span className={`font-semibold ${highlight ? 'text-green-400' : 'text-white'}`}>{activeProject.durasi}</span>
        </div>
      </div>
    </div>
  );
}
