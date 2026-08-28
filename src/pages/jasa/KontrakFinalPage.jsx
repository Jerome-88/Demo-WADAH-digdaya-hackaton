import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getTalentBySlug, formatRupiah } from '../../data/jasaData';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        {phase === 'review' && (
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
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
              <span className="text-[11px] font-bold font-inter uppercase tracking-wide" style={{ color: BLUE }}>Kontrak Final</span>
              <span className="text-[11px] font-bold px-2.5 py-1 rounded-full font-inter border-2" style={{ color: BLUE, borderColor: BLUE, background: '#eef2fe' }}>
                Menunggu Tanda Tangan
              </span>
            </div>

            <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: BLUE }}>
              <div className="space-y-3 text-sm font-inter">
                <div className="flex justify-between"><span className="text-gray-400">Talent</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{talent.name}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">UMKM</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeProject.umkm}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Skill</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeProject.skill}</span></div>
                <div className="flex flex-col gap-1"><span className="text-gray-400">Scope</span><span className="font-semibold" style={{ color: '#1a1a1a' }}>{activeProject.desc}</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Budget</span><span className="font-bold" style={{ color: GREEN }}>{formatRupiah(budget)} / bulan</span></div>
                <div className="flex justify-between"><span className="text-gray-400">Durasi</span><span className="font-bold" style={{ color: GREEN }}>{activeProject.durasi}</span></div>
                <div className="flex justify-between pt-3 border-t" style={{ borderColor: '#e5e9f0' }}><span className="font-semibold text-gray-500">Total</span><span className="font-sora font-extrabold text-lg" style={{ color: BLUE }}>{formatRupiah(total)}</span></div>
              </div>

              <div className="mt-5 pt-5 border-t" style={{ borderColor: '#e5e9f0' }}>
                <h3 className="text-xs font-bold font-inter uppercase tracking-wide mb-3" style={{ color: ORANGE }}>Perlindungan WADAH</h3>
                <div className="space-y-2">
                  {PROTECTIONS.map(p => (
                    <div key={p} className="flex items-center gap-2 text-sm font-inter text-gray-600">
                      <i className="fa-solid fa-circle-check text-xs" style={{ color: GREEN }}></i>
                      {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {phase === 'review' && (
              <button onClick={handleSign} className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                ✓ Setujui & Tanda Tangani
              </button>
            )}

            {phase === 'signing' && (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex flex-col items-center gap-2 py-4">
                <div className="text-3xl">✍️</div>
                <p className="text-sm font-inter text-gray-400">Menandatangani kontrak...</p>
              </motion.div>
            )}
          </motion.div>
        )}

        {phase === 'active' && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
            <div className="rounded-2xl p-6 border-2" style={{ background: '#e3faf0', borderColor: GREEN }}>
              <div className="font-sora font-extrabold text-base mb-2" style={{ color: GREEN }}>KONTRAK AKTIF ✓</div>
              <div className="font-sora font-bold text-lg mb-1" style={{ color: '#1a1a1a' }}>{activeProject.umkm} × {talent.name}</div>
              <div className="text-sm font-inter text-gray-600">Budget: {formatRupiah(budget)}/bulan · Durasi: {activeProject.durasi}</div>
              <div className="text-sm font-inter mt-1 text-gray-600">Dana escrow bulan pertama terkunci: {formatRupiah(budget)}</div>
            </div>

            <div className="rounded-xl p-4" style={{ background: '#f5f8fb' }}>
              <p className="text-xs font-inter text-gray-500">Komunikasi dengan {talent.name.split(' ')[0]} ada di tab Chat</p>
            </div>

            <button onClick={() => navigate('/')} className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
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
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-[70] flex items-center justify-center overflow-hidden"
          >
            {['🎉', '✨', '🎊', '⭐', '💚', '🎉', '✨', '🎊'].map((emoji, i) => (
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
              <h2 className="font-sora font-extrabold text-4xl" style={{ color: GREEN }}>Kontrak Aktif!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
