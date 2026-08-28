import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { getTalentBySlug, TALENT_RESPONSE, NEXT_TALENT, DURASI_OPTIONS, formatRupiah } from '../../data/jasaData';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

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
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        <button
          onClick={() => navigate(`/portfolio/${talentSlug}`)}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
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
          <span className="text-[11px] font-bold font-inter uppercase tracking-wide" style={{ color: BLUE }}>Draft Kontrak</span>
          {phase === 'review' || phase === 'sending' ? (
            <span className="text-[11px] font-bold px-2.5 py-1 rounded-full font-inter border-2" style={{ color: ORANGE, borderColor: ORANGE, background: '#fff7ee' }}>
              Menunggu konfirmasi talent
            </span>
          ) : null}
        </div>

        <div className="bg-white border-2 rounded-2xl p-6 mb-5" style={{ borderColor: BLUE }}>
          <h2 className="font-sora font-bold text-sm mb-4" style={{ color: BLUE }}>Ringkasan Proyek</h2>
          <div className="space-y-3">
            <Row label="Talent" value={talent.name} />
            <Row label="UMKM" value={activeProject.umkm} />
            <Row label="Skill" value={activeProject.skill} />
            <Row label="Scope" value={activeProject.desc} multiline />

            {/* Budget — editable */}
            <div className="flex items-start justify-between gap-4 py-1">
              <span className="text-sm font-inter shrink-0 text-gray-400">Budget</span>
              {editingField === 'budget' ? (
                <input
                  autoFocus
                  type="number"
                  value={budget}
                  onChange={e => setActiveProject(prev => ({ ...prev, budget: Number(e.target.value) }))}
                  onBlur={() => setEditingField(null)}
                  onKeyDown={e => e.key === 'Enter' && setEditingField(null)}
                  className="rounded-lg px-2 py-1 text-sm text-right font-inter w-40 focus:outline-none border-2"
                  style={{ background: '#eef2fe', borderColor: BLUE, color: '#1a1a1a' }}
                />
              ) : (
                <button onClick={() => setEditingField('budget')} className="text-sm font-semibold font-inter text-right bg-transparent border-0 cursor-pointer transition-colors" style={{ color: '#1a1a1a' }}>
                  {formatRupiah(budget)}/bulan <span className="text-xs" style={{ color: BLUE }}>[edit]</span>
                </button>
              )}
            </div>

            {/* Durasi — editable */}
            <div className="flex items-start justify-between gap-4 py-1">
              <span className="text-sm font-inter shrink-0 text-gray-400">Durasi</span>
              {editingField === 'durasi' ? (
                <select
                  autoFocus
                  value={activeProject.durasi}
                  onChange={e => { setActiveProject(prev => ({ ...prev, durasi: e.target.value })); setEditingField(null); }}
                  onBlur={() => setEditingField(null)}
                  className="rounded-lg px-2 py-1 text-sm font-inter focus:outline-none border-2"
                  style={{ background: '#eef2fe', borderColor: BLUE, color: '#1a1a1a' }}
                >
                  {DURASI_OPTIONS.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              ) : (
                <button onClick={() => setEditingField('durasi')} className="text-sm font-semibold font-inter text-right bg-transparent border-0 cursor-pointer transition-colors" style={{ color: '#1a1a1a' }}>
                  {activeProject.durasi} <span className="text-xs" style={{ color: BLUE }}>[edit]</span>
                </button>
              )}
            </div>
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
          <>
            <div className="rounded-xl p-4 mb-5" style={{ background: '#f5f8fb' }}>
              <p className="text-xs font-inter leading-relaxed text-gray-500">
                📨 Draft kontrak ini akan dikirim ke {talent.name}. Talent dapat menerima, menolak, atau mengajukan negosiasi harga melalui chat.
              </p>
            </div>
            <div className="flex flex-col gap-2.5">
              <button onClick={handleSend} className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                Kirim ke Talent
              </button>
              <button onClick={() => navigate(`/portfolio/${talentSlug}`)} className="w-full font-semibold py-3 rounded-full transition-all text-sm cursor-pointer bg-transparent border-2" style={{ color: BLUE, borderColor: BLUE }}>
                ← Kembali ke Portfolio
              </button>
            </div>
          </>
        )}

        {phase === 'sending' && (
          <div className="flex flex-col items-center gap-3 py-8">
            <div className="w-8 h-8 border-2 rounded-full animate-spin-fast" style={{ borderColor: BLUE, borderTopColor: 'transparent' }}></div>
            <p className="text-sm font-inter text-gray-400">Mengirim draft kontrak...</p>
          </div>
        )}

        <AnimatePresence>
          {phase === 'accept' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              <div className="rounded-xl p-4 border-2" style={{ background: '#e3faf0', borderColor: GREEN }}>
                <p className="text-sm font-inter leading-relaxed" style={{ color: GREEN }}>
                  ✓ {talent.name} menerima proyekmu! Dana escrow akan dikunci saat proyek dimulai.
                </p>
              </div>
              <button onClick={() => navigate(`/jasa/kontrak-final/${talentSlug}`)} className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                Mulai Proyek
              </button>
            </motion.div>
          )}

          {phase === 'nego' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              <div className="rounded-xl p-4 border-2" style={{ background: '#fff7ee', borderColor: ORANGE }}>
                <p className="text-sm font-inter leading-relaxed" style={{ color: ORANGE }}>
                  💬 {talent.name} mengajukan diskusi harga
                </p>
              </div>
              <button onClick={() => navigate(`/jasa/nego/${talentSlug}`)} className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                Buka Chat
              </button>
            </motion.div>
          )}

          {phase === 'reject-loading' && (
            <div className="flex flex-col items-center gap-3 py-8">
              <div className="w-8 h-8 border-2 rounded-full animate-spin-fast" style={{ borderColor: '#d1d5db', borderTopColor: BLUE }}></div>
              <p className="text-sm font-inter text-gray-400">Mencari talent lain yang cocok...</p>
            </div>
          )}

          {phase === 'reject-next' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-3">
              {nextTalent ? (
                <>
                  <div className="rounded-xl p-4" style={{ background: '#f5f8fb' }}>
                    <p className="text-sm font-inter leading-relaxed text-gray-600">{nextTalent.name} tersedia untuk proyekmu</p>
                  </div>
                  <button onClick={() => navigate(`/portfolio/${nextSlug}`)} className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110" style={{ background: GREEN }}>
                    Lihat Profil {nextTalent.name.split(' ')[0]}
                  </button>
                </>
              ) : (
                <div className="rounded-xl p-4" style={{ background: '#f5f8fb' }}>
                  <p className="text-sm font-inter leading-relaxed text-gray-600">Belum ada talent lain yang cocok saat ini. Coba ubah kriteria pencarian.</p>
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
      <span className="text-sm font-inter shrink-0 text-gray-400">{label}</span>
      <span className={`text-sm font-semibold font-inter ${multiline ? '' : 'text-right'}`} style={{ color: '#1a1a1a' }}>{value}</span>
    </div>
  );
}
