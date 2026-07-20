import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getTalentBySlug, formatRupiah } from '../../data/jasaData';

const PROTECTIONS = [
  'Semua komunikasi via platform WADAH',
  'Dana escrow dikunci per bulan',
  'Dispute resolution tersedia 24/7',
  'Tidak ada transaksi di luar app',
];

function parseBulanCount(durasi) {
  const match = /^(\d+)\s*Bulan$/.exec(durasi || '');
  return match ? Number(match[1]) : 1;
}

export default function KontrakFinalPage() {
  const navigate = useNavigate();
  const { talentSlug } = useParams();
  const { activeProject, setActiveProject } = useApp();
  const talent = getTalentBySlug(talentSlug);

  const [phase, setPhase] = useState('review'); // review | signing | celebrating | active

  useEffect(() => {
    if (!talent) navigate('/jasa', { replace: true });
  }, [talent, navigate]);

  if (!talent) return null;

  const budget = activeProject.budgetNegotiated ?? activeProject.budget;
  const bulanCount = parseBulanCount(activeProject.durasi);
  const total = budget * bulanCount;

  function handleSign() {
    setPhase('signing');
    setTimeout(() => {
      setPhase('celebrating');
      setTimeout(() => {
        setActiveProject(prev => ({ ...prev, status: 'matched' }));
        setPhase('active');
      }, 2000);
    }, 1200);
  }

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5">
        {phase === 'review' && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
          >
            <i className="fa-solid fa-arrow-left"></i>
            <span>Kembali</span>
          </button>
        )}
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Kontrak Final
        </h1>
      </header>

      <main className="max-w-[680px] mx-auto px-4 py-10 pb-16">
        {(phase === 'review' || phase === 'signing') && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-5">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-white/40 font-inter uppercase tracking-wide">Kontrak Final</span>
              <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/25 px-2.5 py-1 rounded-full font-inter">
                Menunggu Tanda Tangan
              </span>
            </div>

            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6">
              <div className="space-y-3 text-sm font-inter">
                <div className="flex justify-between"><span className="text-white/40">Talent</span><span className="text-white font-semibold">{talent.name}</span></div>
                <div className="flex justify-between"><span className="text-white/40">UMKM</span><span className="text-white font-semibold">{activeProject.umkm}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Skill</span><span className="text-white font-semibold">{activeProject.skill}</span></div>
                <div className="flex flex-col gap-1"><span className="text-white/40">Scope</span><span className="text-white font-semibold">{activeProject.desc}</span></div>
                <div className="flex justify-between"><span className="text-white/40">Budget</span><span className="text-green-400 font-bold">{formatRupiah(budget)} / bulan</span></div>
                <div className="flex justify-between"><span className="text-white/40">Durasi</span><span className="text-green-400 font-bold">{activeProject.durasi}</span></div>
                <div className="flex justify-between pt-3 border-t border-white/10"><span className="text-white/60 font-semibold">Total</span><span className="text-white font-sora font-extrabold text-lg">{formatRupiah(total)}</span></div>
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
              <button onClick={handleSign} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
                ✓ Setujui & Tanda Tangani
              </button>
            )}

            {phase === 'signing' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 py-4">
                <div className="text-3xl">✍️</div>
                <p className="text-white/50 text-sm font-inter">Menandatangani kontrak...</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'active' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-6">
              <div className="text-green-400 font-sora font-extrabold text-base mb-2">KONTRAK AKTIF ✓</div>
              <div className="text-white font-sora font-bold text-lg mb-1">{activeProject.umkm} × {talent.name}</div>
              <div className="text-white/60 text-sm font-inter">Budget: {formatRupiah(budget)}/bulan · Durasi: {activeProject.durasi}</div>
              <div className="text-white/60 text-sm font-inter mt-1">Dana escrow bulan pertama terkunci: {formatRupiah(budget)}</div>
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-xs font-inter">Komunikasi dengan {talent.name.split(' ')[0]} ada di tab Chat</p>
            </div>

            <button onClick={() => navigate('/')} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
              Kembali ke Beranda
            </button>
          </motion.div>
        )}
      </main>

      {/* ── CELEBRATION OVERLAY ── */}
      <AnimatePresence>
        {phase === 'celebrating' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F0F1A]/95 backdrop-blur-md z-[70] flex items-center justify-center overflow-hidden"
          >
            {['🎉', '✨', '🎊', '⭐', '💜', '🎉', '✨', '🎊'].map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{
                  x: Math.cos((i / 8) * Math.PI * 2) * 180,
                  y: Math.sin((i / 8) * Math.PI * 2) * 180 - 40,
                  opacity: 0,
                  scale: 1.2,
                }}
                transition={{ duration: 1.6, ease: 'easeOut' }}
                className="absolute text-3xl"
              >
                {emoji}
              </motion.span>
            ))}
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-white font-sora font-extrabold text-4xl">Kontrak Aktif!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
