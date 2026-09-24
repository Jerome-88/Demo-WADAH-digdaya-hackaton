import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import { getSkillMeta } from '../../data/skillMaps';
import { useApp } from '../../context/AppContext';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

function initialsOf(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

// Real (not curated-demo) talent profile — reached from JasaDashboard's
// Browse Talent grid for a talent who actually finished the whole journey.
// Deliberately lighter than TalentPortfolioPage: there's no fabricated
// bio/competency-scores/riwayat for a real account, only whatever GET
// /portfolio/:userId genuinely has (verified checkpoint submissions).
export default function RealTalentProfilePage() {
  const navigate = useNavigate();
  const { userId } = useParams();
  const { mode, umkmProfile, activeProject, chooseRealTalent } = useApp();
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [choosing, setChoosing] = useState(false);
  const [chooseError, setChooseError] = useState(null);
  const [chosen, setChosen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    api.getPortfolio(userId).then(res => {
      if (!cancelled) setData(res);
    }).catch(err => {
      if (!cancelled) setError(err.message || 'Talent tidak ditemukan');
    });
    return () => { cancelled = true; };
  }, [userId]);

  useEffect(() => {
    if (error) navigate('/jasa', { replace: true });
  }, [error, navigate]);

  if (!data) return null;

  const { user, portfolio } = data;
  const meta = getSkillMeta(user.skill);

  const canChoose = mode === 'real' && umkmProfile && activeProject?.status === 'open' && !activeProject.realTalentId;
  const alreadyChosen = activeProject?.realTalentId === userId || chosen;

  async function handleChoose() {
    setChoosing(true);
    setChooseError(null);
    try {
      await chooseRealTalent(userId);
      setChosen(true);
    } catch (err) {
      setChooseError(err.message || 'Gagal memilih talent ini');
    } finally {
      setChoosing(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/jasa')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Dashboard</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Verified Portfolio
        </h1>
      </header>

      {/* Hero */}
      <div className="px-4 py-12 text-center" style={{ background: '#f5f8fb' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center text-white font-sora font-bold text-2xl mx-auto mb-4" style={{ background: BLUE }}>
          {initialsOf(user.name)}
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border-2" style={{ background: '#fff7ec', borderColor: ORANGE }}>
            <i className="fa-solid fa-graduation-cap text-xs" style={{ color: ORANGE }}></i>
            <span className="text-xs font-bold font-inter" style={{ color: ORANGE }}>Certified — {meta.label}</span>
          </div>
        </div>
        <h2 className="font-sora font-extrabold text-2xl mb-1" style={{ color: BLUE }}>{user.name}</h2>
        <p className="text-sm mb-6 text-gray-500 font-inter">{meta.emoji} {meta.label}</p>

        <div className="flex flex-wrap items-center justify-center gap-2.5">
          <button
            onClick={() => navigate(`/jasa/chat/${userId}`, { state: { talentName: user.name } })}
            className="text-white font-bold py-3 px-8 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110 inline-flex items-center gap-2"
            style={{ background: GREEN }}
          >
            <i className="fa-solid fa-comment-dots"></i> Chat dengan Talent Ini
          </button>

          {alreadyChosen && (
            <span className="text-white font-bold py-3 px-8 rounded-full text-sm inline-flex items-center gap-2" style={{ background: BLUE }}>
              <i className="fa-solid fa-circle-check"></i> Talent Terpilih
            </span>
          )}

          {!alreadyChosen && canChoose && (
            <button
              onClick={handleChoose}
              disabled={choosing}
              className="text-white font-bold py-3 px-8 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
              style={{ background: BLUE }}
            >
              {choosing ? 'Memilih...' : (<><i className="fa-solid fa-handshake"></i> Pilih Talent Ini untuk Proyek</>)}
            </button>
          )}
        </div>

        {chooseError && (
          <p className="text-sm font-inter font-semibold mt-3" style={{ color: '#e5484d' }}>{chooseError}</p>
        )}
      </div>

      {/* Verified portfolio */}
      <div className="max-w-[720px] mx-auto px-4 py-8">
        <h3 className="font-sora font-bold text-sm uppercase tracking-wide mb-3" style={{ color: BLUE }}>Rekam Kerja Terverifikasi</h3>

        {portfolio.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: '#c9d3e0' }}>
            <p className="text-sm font-inter text-gray-500">Belum ada proyek terverifikasi yang tampil di sini.</p>
          </div>
        )}

        <div className="flex flex-col gap-3">
          {portfolio.map((item, i) => (
            <motion.div
              key={`${item.title}-${item.created_at}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06, duration: 0.3 }}
              className="rounded-2xl p-5 border-2 flex items-center gap-3"
              style={{ borderColor: '#e5e9f0' }}
            >
              <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0" style={{ background: '#e3faf0' }}>
                <i className="fa-solid fa-circle-check" style={{ color: GREEN }}></i>
              </div>
              <div className="min-w-0 flex-1">
                <div className="font-sora font-bold text-sm truncate" style={{ color: '#1a1a1a' }}>{item.title}</div>
                <div className="text-xs font-inter text-gray-500">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
