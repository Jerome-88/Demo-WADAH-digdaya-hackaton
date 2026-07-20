import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getTalentBySlug, TALENT_RESPONSE, NEXT_TALENT, DURASI_OPTIONS, formatRupiah } from '../../data/jasaData';

const PROTECTIONS = [
  'Semua komunikasi via platform',
  'Dana escrow terlindungi',
  'Dispute resolution tersedia',
  'Tidak ada transaksi di luar app',
];

export default function DraftKontrakPage() {
  const navigate = useNavigate();
  const { talentSlug } = useParams();
  const { activeProject, setActiveProject } = useApp();
  const talent = getTalentBySlug(talentSlug);

  const [editingField, setEditingField] = useState(null); // null | 'budget' | 'durasi'
  const [phase, setPhase] = useState('review'); // review | sending | accept | reject-loading | reject-next | nego

  useEffect(() => {
    if (!talent) navigate('/jasa', { replace: true });
  }, [talent, navigate]);

  if (!talent) return null;

  const budget = activeProject.budgetNegotiated ?? activeProject.budget;

  function handleSend() {
    setPhase('sending');
    setTimeout(() => {
      const outcome = TALENT_RESPONSE[talentSlug] || 'accept';
      if (outcome === 'reject') {
        setPhase('reject-loading');
        setTimeout(() => setPhase('reject-next'), 1500);
      } else {
        setPhase(outcome);
      }
    }, 1200);
  }

  const nextSlug = NEXT_TALENT[talentSlug];
  const nextTalent = nextSlug ? getTalentBySlug(nextSlug) : null;

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5">
        <button
          onClick={() => navigate(`/portfolio/${talentSlug}`)}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Portfolio</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Draft Kontrak
        </h1>
      </header>

      <main className="max-w-[680px] mx-auto px-4 py-10 pb-16">
        <div className="flex items-center justify-between mb-6">
          <span className="text-[11px] font-bold text-white/40 font-inter uppercase tracking-wide">Draft Kontrak</span>
          {phase === 'review' || phase === 'sending' ? (
            <span className="text-[11px] font-bold text-amber-400 bg-amber-500/10 border border-amber-500/25 px-2.5 py-1 rounded-full font-inter">
              Menunggu konfirmasi talent
            </span>
          ) : null}
        </div>

        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6 mb-5">
          <h2 className="text-white font-sora font-bold text-sm mb-4">Ringkasan Proyek</h2>
          <div className="space-y-3">
            <Row label="Talent" value={talent.name} />
            <Row label="UMKM" value={activeProject.umkm} />
            <Row label="Skill" value={activeProject.skill} />
            <Row label="Scope" value={activeProject.desc} multiline />

            {/* Budget — editable */}
            <div className="flex items-start justify-between gap-4 py-1">
              <span className="text-white/40 text-sm font-inter shrink-0">Budget</span>
              {editingField === 'budget' ? (
                <input
                  autoFocus
                  type="number"
                  value={budget}
                  onChange={e => setActiveProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingField(null)}
                  className="bg-white/[0.05] border border-purple/40 rounded-lg px-2 py-1 text-sm text-white text-right font-inter w-40 focus:outline-none"
                />
              ) : (
                <button onClick={() => setEditingField('budget')} className="text-white text-sm font-semibold font-inter text-right bg-transparent border-0 cursor-pointer hover:text-purple transition-colors">
                  {formatRupiah(budget)}/bulan <span className="text-purple text-xs">[edit]</span>
                </button>
              )}
            </div>

            {/* Durasi — editable */}
            <div className="flex items-start justify-between gap-4 py-1">
              <span className="text-white/40 text-sm font-inter shrink-0">Durasi</span>
              {editingField === 'durasi' ? (
                <select
                  autoFocus
                  value={activeProject.durasi}
                  onChange={e => { setActiveProject(prev => ({ ...prev, durasi: e.target.value })); setEditingField(null); }}
                  onBlur={() => setEditingField(null)}
                  className="bg-white/[0.05] border border-purple/40 rounded-lg px-2 py-1 text-sm text-white font-inter focus:outline-none"
                >
                  {DURASI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <button onClick={() => setEditingField('durasi')} className="text-white text-sm font-semibold font-inter text-right bg-transparent border-0 cursor-pointer hover:text-purple transition-colors">
                  {activeProject.durasi} <span className="text-purple text-xs">[edit]</span>
                </button>
              )}
            </div>
          </div>

          <div className="mt-5 pt-5 border-t border-white/10">
            <h3 className="text-white/70 text-xs font-bold font-inter uppercase tracking-wide mb-3">Perlindungan WADAH</h3>
            <div className="space-y-2">
              {PROTECTIONS.map(p => (
                <div key={p} className="flex items-center gap-2 text-sm text-white/60 font-inter">
                  <i className="fa-solid fa-circle-check text-green-400 text-xs"></i>
                  {p}
                </div>
              ))}
            </div>
          </div>
        </div>

        {phase === 'review' && (
          <>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-5">
              <p className="text-white/50 text-xs font-inter leading-relaxed">
                📨 Draft kontrak ini akan dikirim ke {talent.name}. Talent dapat menerima, menolak, atau mengajukan negosiasi harga melalui chat.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button onClick={handleSend} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
                Kirim ke Talent
              </button>
              <button onClick={() => navigate(`/portfolio/${talentSlug}`)} className="w-full border border-white/15 text-white/60 hover:bg-white/5 font-semibold py-3 rounded-xl transition-all text-sm cursor-pointer bg-transparent">
                ← Kembali ke Portfolio
              </button>
            </div>
          </>
        )}

        {phase === 'sending' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-8 h-8 border-2 border-purple border-t-transparent rounded-full animate-spin-fast"></div>
            <p className="text-white/40 text-sm font-inter">Mengirim draft kontrak...</p>
          </div>
        )}

        <AnimatePresence>
          {phase === 'accept' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p className="text-green-300 text-sm font-inter leading-relaxed">
                  ✓ {talent.name} menerima proyekmu! Dana escrow akan dikunci saat proyek dimulai.
                </p>
              </div>
              <button onClick={() => navigate(`/jasa/kontrak-final/${talentSlug}`)} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
                Mulai Proyek
              </button>
            </motion.div>
          )}

          {phase === 'nego' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p className="text-amber-300 text-sm font-inter leading-relaxed">
                  💬 {talent.name} mengajukan diskusi harga
                </p>
              </div>
              <button onClick={() => navigate(`/jasa/nego/${talentSlug}`)} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
                Buka Chat
              </button>
            </motion.div>
          )}

          {phase === 'reject-loading' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-8 h-8 border-2 border-white/20 border-t-white/60 rounded-full animate-spin-fast"></div>
              <p className="text-white/40 text-sm font-inter">Mencari talent lain yang cocok...</p>
            </div>
          )}

          {phase === 'reject-next' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              {nextTalent ? (
                <>
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                    <p className="text-white/60 text-sm font-inter leading-relaxed">{nextTalent.name} tersedia untuk proyekmu</p>
                  </div>
                  <button onClick={() => navigate(`/portfolio/${nextSlug}`)} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
                    Lihat Profil {nextTalent.name.split(' ')[0]}
                  </button>
                </>
              ) : (
                <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
                  <p className="text-white/60 text-sm font-inter leading-relaxed">Belum ada talent lain yang cocok saat ini. Coba ubah kriteria pencarian.</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

function Row({ label, value, multiline }) {
  return (
    <div className={`flex ${multiline ? 'flex-col gap-1' : 'items-center justify-between gap-4'} py-1`}>
      <span className="text-white/40 text-sm font-inter shrink-0">{label}</span>
      <span className={`text-white text-sm font-semibold font-inter ${multiline ? '' : 'text-right'}`}>{value}</span>
    </div>
  );
}
