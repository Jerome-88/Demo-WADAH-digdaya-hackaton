import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { CURATED_TALENTS, getTalentBySlug, formatRupiah } from '../../data/jasaData';
import { getSkillMeta } from '../../data/skillMaps';
import { api } from '../../lib/api';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

function initialsOf(name) {
  return name.split(' ').filter(Boolean).slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

export default function JasaDashboard() {
  const navigate = useNavigate();
  const { activeProject, mode, umkmProfile, signOutReal } = useApp();
  const [filterSkill, setFilterSkill] = useState('all');
  // Real talents who actually finished the whole journey (passed the
  // skill's certification exam — POST /user/certify) — separate from
  // CURATED_TALENTS, which stays 100% static demo data. Best-effort: if the
  // backend isn't reachable (e.g. demo-only laptop with no VITE_API_URL),
  // the grid just falls back to curated talents alone.
  const [realTalents, setRealTalents] = useState([]);
  // Name of the real talent chosen for activeProject (chooseRealTalent only
  // stores the id) — fetched lazily, only once a real pick actually exists.
  const [realMatchedName, setRealMatchedName] = useState(null);

  useEffect(() => {
    let cancelled = false;
    api.getTalents().then(({ talents }) => {
      if (!cancelled) setRealTalents(talents);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    // No reset-to-null branch when realTalentId is absent — harmless, since
    // realMatchedName is only ever rendered behind an activeProject.realTalentId check.
    if (!activeProject?.realTalentId) return;
    let cancelled = false;
    api.getPortfolio(activeProject.realTalentId).then(res => {
      if (!cancelled) setRealMatchedName(res.user.name);
    }).catch(() => {});
    return () => { cancelled = true; };
  }, [activeProject?.realTalentId]);

  const matchedTalent = activeProject?.talentSlug ? getTalentBySlug(activeProject.talentSlug) : null;
  // A signed-in real UMKM browses the real talent pool only — the curated
  // demo personas (Rina, Siti, ...) stay for demo mode / anonymous browsing,
  // but a real account shouldn't be offered a "talent" that can't actually
  // chat back for real.
  const isRealUmkm = mode === 'real' && !!umkmProfile;
  const visibleCurated = isRealUmkm ? [] : CURATED_TALENTS.filter(t => filterSkill === 'all' || t.skillId === filterSkill);
  const visibleRealTalents = realTalents.filter(t => filterSkill === 'all' || t.skill === filterSkill);
  const browseCategories = ['all', ...new Set([
    ...(isRealUmkm ? [] : CURATED_TALENTS.map(t => t.skillId)),
    ...realTalents.map(t => t.skill),
  ])];

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Beranda</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Find Talent
        </h1>
        {mode === 'real' && umkmProfile && (
          <div className="ml-auto flex items-center gap-3">
            <button
              onClick={() => navigate('/jasa/pesan')}
              title="Pesan"
              className="text-white/80 hover:text-white bg-transparent border-0 cursor-pointer"
            >
              <i className="fa-solid fa-comment-dots"></i>
            </button>
            <button
              onClick={() => {
                if (window.confirm('Keluar dari akun? Proyek yang sudah diposting tetap tersimpan — tinggal login lagi pakai email yang sama.')) signOutReal();
              }}
              className="text-white/80 hover:text-white text-xs font-inter bg-transparent border-0 cursor-pointer"
            >
              Keluar
            </button>
          </div>
        )}
      </header>

      <main className="max-w-[880px] mx-auto px-4 py-8 pb-16 flex flex-col gap-8">
        {mode === 'real' && umkmProfile && (
          <p className="text-sm font-inter text-gray-500 -mb-4">
            Masuk sebagai <span className="font-semibold" style={{ color: '#1a1a1a' }}>{umkmProfile.businessName}</span> ({umkmProfile.picName})
          </p>
        )}

        {/* ── Proyek Kamu ── */}
        <section>
          <h2 className="font-sora font-bold text-sm uppercase tracking-wide mb-3" style={{ color: BLUE }}>Proyek Kamu</h2>

          {(!activeProject || activeProject.status === null) && (
            <div className="rounded-2xl border-2 border-dashed p-8 text-center" style={{ borderColor: '#c9d3e0' }}>
              <p className="font-sora font-bold text-base mb-1" style={{ color: '#1a1a1a' }}>Belum ada proyek aktif</p>
              <p className="text-sm font-inter text-gray-500 mb-5">Ceritain kebutuhan bisnismu, AI kami carikan talent yang paling cocok.</p>
              <button
                onClick={() => navigate('/jasa/cari')}
                className="text-white font-bold py-3 px-8 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: BLUE }}
              >
                Mulai Cari Talent
              </button>
            </div>
          )}

          {activeProject?.status === 'open' && (
            <div className="rounded-2xl border-2 p-6" style={{ borderColor: ORANGE, background: '#fff7ee' }}>
              {activeProject.realTalentId ? (
                <>
                  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full font-inter border-2 mb-3" style={{ color: ORANGE, borderColor: ORANGE, background: '#fff' }}>
                    Dipilih oleh {realMatchedName ?? 'Talent'}
                  </span>
                  <div className="font-sora font-bold text-lg mb-1" style={{ color: '#1a1a1a' }}>{activeProject.umkm}</div>
                  <div className="text-sm font-inter text-gray-600 mb-4">{activeProject.skill} · {formatRupiah(activeProject.budgetNegotiated ?? activeProject.budget)}/bulan</div>
                  <button
                    onClick={() => navigate(`/jasa/chat/${activeProject.realTalentId}`, { state: { talentName: realMatchedName } })}
                    className="text-white font-bold py-2.5 px-7 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                    style={{ background: GREEN }}
                  >
                    Buka Chat
                  </button>
                </>
              ) : activeProject.talentSlug ? (
                <>
                  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full font-inter border-2 mb-3" style={{ color: ORANGE, borderColor: ORANGE, background: '#fff' }}>
                    Dalam Proses dengan {matchedTalent?.name ?? 'Talent'}
                  </span>
                  <div className="font-sora font-bold text-lg mb-1" style={{ color: '#1a1a1a' }}>{activeProject.umkm}</div>
                  <div className="text-sm font-inter text-gray-600 mb-4">{activeProject.skill} · {formatRupiah(activeProject.budgetNegotiated ?? activeProject.budget)}/bulan</div>
                  <button
                    onClick={() => navigate(`/portfolio/${activeProject.talentSlug}`, { state: { from: 'dashboard' } })}
                    className="text-white font-bold py-2.5 px-7 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                    style={{ background: GREEN }}
                  >
                    Lanjutkan
                  </button>
                </>
              ) : (
                <>
                  <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full font-inter border-2 mb-3" style={{ color: ORANGE, borderColor: ORANGE, background: '#fff' }}>
                    Sedang Dicocokkan
                  </span>
                  <div className="font-sora font-bold text-lg mb-1" style={{ color: '#1a1a1a' }}>{activeProject.umkm}</div>
                  <div className="text-sm font-inter text-gray-600 mb-1">{activeProject.skill} · {formatRupiah(activeProject.budget)}/bulan</div>
                  <p className="text-sm font-inter text-gray-500 mb-4 line-clamp-2">{activeProject.desc}</p>
                  <button
                    onClick={() => navigate('/jasa/cari', { state: { resumeStep: 3 } })}
                    className="text-white font-bold py-2.5 px-7 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                    style={{ background: GREEN }}
                  >
                    Lihat Talent yang Cocok
                  </button>
                </>
              )}
            </div>
          )}

          {activeProject?.status === 'matched' && (
            <div className="rounded-2xl border-2 p-6" style={{ borderColor: GREEN, background: '#e3faf0' }}>
              <span className="inline-block text-[11px] font-bold px-2.5 py-1 rounded-full font-inter border-2 mb-3" style={{ color: GREEN, borderColor: GREEN, background: '#fff' }}>
                ✓ Kontrak Aktif
              </span>
              <div className="font-sora font-bold text-lg mb-1" style={{ color: '#1a1a1a' }}>
                {activeProject.umkm}{matchedTalent ? ` × ${matchedTalent.name}` : ''}
              </div>
              <div className="text-sm font-inter text-gray-600 mb-4">
                {formatRupiah(activeProject.budgetNegotiated ?? activeProject.budget)}/bulan · {activeProject.durasi}
              </div>
              <button
                onClick={() => navigate(`/jasa/proyek/${activeProject.talentSlug}`)}
                className="text-white font-bold py-2.5 px-7 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: GREEN }}
              >
                Buka Chat & Kelola Proyek
              </button>
            </div>
          )}
        </section>

        {/* ── Browse Talent ── */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-sora font-bold text-sm uppercase tracking-wide" style={{ color: BLUE }}>Browse Talent</h2>
            <button
              onClick={() => navigate('/jasa/cari')}
              className="text-xs font-bold font-inter bg-transparent border-0 cursor-pointer hover:underline"
              style={{ color: BLUE }}
            >
              + Post Proyek Baru
            </button>
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 mb-4">
            {browseCategories.map(catId => {
              const meta = catId === 'all' ? null : getSkillMeta(catId);
              const active = filterSkill === catId;
              return (
                <button
                  key={catId}
                  onClick={() => setFilterSkill(catId)}
                  className="shrink-0 flex items-center gap-1.5 text-xs font-bold font-inter px-3.5 py-2 rounded-full cursor-pointer transition-colors border-2"
                  style={active ? { background: BLUE, color: '#fff', borderColor: BLUE } : { background: '#fff', color: '#6b7280', borderColor: '#e5e9f0' }}
                >
                  {catId === 'all' ? 'Semua' : `${meta.emoji} ${meta.label}`}
                </button>
              );
            })}
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            {visibleCurated.map((talent, i) => (
              <motion.div
                key={talent.slug}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06, duration: 0.3 }}
                onClick={() => navigate(`/portfolio/${talent.slug}`, { state: { from: 'dashboard' } })}
                className="bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md"
                style={{ borderColor: '#e5e9f0' }}
              >
                <div className="flex items-center gap-3 mb-3">
                  {talent.avatarImg ? (
                    <img src={talent.avatarImg} alt={talent.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-sora font-bold text-sm shrink-0" style={{ background: talent.avatarBg }}>
                      {talent.initials}
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="font-sora font-bold text-sm truncate" style={{ color: '#1a1a1a' }}>{talent.name}</div>
                    <div className="text-xs font-inter text-gray-500 truncate">{talent.role} · {talent.location}</div>
                  </div>
                  <span className="shrink-0 text-[11px] font-bold px-2 py-1 rounded-full font-inter border" style={{ color: GREEN, borderColor: GREEN, background: '#e3faf0' }}>
                    {talent.score}/10
                  </span>
                </div>

                <div className="flex flex-wrap gap-1.5 mb-3">
                  {talent.skills.slice(0, 3).map(s => (
                    <span key={s} className="text-[10px] px-2 py-1 rounded-full font-inter border" style={{ color: BLUE, borderColor: '#c7d5fb', background: '#eef2fe' }}>{s}</span>
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs font-inter">
                  <span className="text-gray-400">Respon {talent.responseTime}</span>
                  <span className="font-semibold" style={{ color: BLUE }}>Lihat Profil →</span>
                </div>
              </motion.div>
            ))}

            {/* Real talents who actually finished the journey (certified via
                backend, not a curated demo persona) — simpler card since
                there's no fabricated score/skills/response-time for them. */}
            {visibleRealTalents.map((talent, i) => {
              const meta = getSkillMeta(talent.skill);
              return (
                <motion.div
                  key={talent.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: (visibleCurated.length + i) * 0.06, duration: 0.3 }}
                  onClick={() => navigate(`/talent/${talent.id}`)}
                  className="bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md"
                  style={{ borderColor: '#e5e9f0' }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    {talent.avatar_url ? (
                      <img src={talent.avatar_url} alt={talent.name} className="w-11 h-11 rounded-full object-cover shrink-0" />
                    ) : (
                      <div className="w-11 h-11 rounded-full flex items-center justify-center text-white font-sora font-bold text-sm shrink-0" style={{ background: BLUE }}>
                        {initialsOf(talent.name)}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <div className="font-sora font-bold text-sm truncate" style={{ color: '#1a1a1a' }}>{talent.name}</div>
                      <div className="text-xs font-inter text-gray-500 truncate">{meta.emoji} {meta.label}</div>
                    </div>
                    <span className="shrink-0 inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full font-inter border" style={{ color: ORANGE, borderColor: ORANGE, background: '#fff7ee' }}>
                      <i className="fa-solid fa-graduation-cap"></i> Certified
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs font-inter">
                    <span className="text-gray-400">Talent WADAH terverifikasi</span>
                    <span className="font-semibold" style={{ color: BLUE }}>Lihat Profil →</span>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="rounded-xl p-4 mt-4" style={{ background: '#eef2fe' }}>
            <p className="text-xs font-inter leading-relaxed" style={{ color: BLUE }}>
              Semua talent di WADAH sudah lewat simulasi kerja & diverifikasi human reviewer — bukan sekadar klaim di CV.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
