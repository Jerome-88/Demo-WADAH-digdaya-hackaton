import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Star, Upload, Link as LinkIcon, Eye, EyeOff, GraduationCap, LogOut, Lightbulb } from 'lucide-react';
import { useApp, XP_PER_LEVEL } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta } from '../../data/skillMaps';
import { getCertificateBySkill } from '../../data/certificates';
import useSkillInsight from '../../hooks/useSkillInsight';

const BLUE = '#2b6fff';
const ORANGE = '#f37219';
const GREEN = '#00c897';

const PORTFOLIO_WORKS = [
  { emoji: '🏮', title: 'Banner Promosi Toko Mode', client: 'Toko Busana Ibu Sari', score: 76.5, date: 'April 2026' },
  { emoji: '🍜', title: 'Infografis Menu Restoran', client: 'Resto Padang Minang', score: 78.5, date: 'Mei 2026' },
  { emoji: '🍛', title: 'Konten Instagram Pak Budi', client: 'Warung Makan Pak Budi', score: 82, date: '30 Mei 2026' },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  const {
    level, levelName, xpInLevel, xpToNextLevel, exp,
    selectedSkill, completedNodeIds, verificationSubmitted, projectAccepted, activeProject,
    certificateEarnedAt, mode, realUserName, signOutReal,
  } = useApp();
  const isReal = mode === 'real';
  const displayName = isReal ? realUserName || 'Talent' : 'Rina Kusumawati';
  const { loading: insightLoading, hasData: insightHasData, weaknesses } = useSkillInsight();

  const [visibility, setVisibility] = useState('public');
  const [cvUploaded, setCvUploaded] = useState(false);
  const [links, setLinks] = useState({ behance: '', linkedin: '' });

  function handleSignOut() {
    if (window.confirm('Keluar dari akun? Progress kamu tetap tersimpan — tinggal login lagi pakai email yang sama.')) {
      signOutReal();
    }
  }

  const skillId = selectedSkill || DEFAULT_SKILL;
  const skillMeta = getSkillMeta(skillId);
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const completedCount = completedNodeIds.filter(id => id.startsWith(`${skillId}:`)).length;
  const totalNodes = skillMap.nodes.length;
  const xpProgressPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);
  const certificate = certificateEarnedAt[skillId] ? getCertificateBySkill(skillId) : null;

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-30 h-16 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/rina/task')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Kembali ke Peta Misi
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-10 space-y-6">
        {/* Identity + XP */}
        <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: BLUE }}>
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-4 min-w-0">
              {isReal ? (
                <div
                  className="w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold font-sora border-2 shrink-0"
                  style={{ borderColor: BLUE, background: '#f37219', color: '#fff' }}
                >
                  {displayName.charAt(0).toUpperCase()}
                </div>
              ) : (
                <img src="/rina.jpg" className="w-16 h-16 rounded-full object-cover border-2 shrink-0" style={{ borderColor: BLUE }} alt="Rina" />
              )}
              <div className="min-w-0">
                <h1 className="font-sora font-bold text-xl" style={{ color: BLUE }}>{displayName}</h1>
                <div className="italic font-semibold font-inter text-sm mt-1" style={{ color: BLUE }}>Level {level} - {levelName}</div>
                <div className="text-gray-400 text-xs font-inter mt-1">{exp} XP Total Terkumpul</div>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-sora font-extrabold text-xl" style={{ color: BLUE }}>+{xpToNextLevel} XP</div>
              <div className="text-gray-400 text-xs font-inter mt-0.5">Ke Level {level + 1}</div>
            </div>
          </div>

          <div className="mt-5">
            <div className="w-full rounded-full h-2.5 overflow-hidden" style={{ background: '#e1e8f2' }}>
              <div className="h-full rounded-full transition-all duration-700" style={{ width: `${xpProgressPct}%`, background: ORANGE }} />
            </div>
            <div className="flex justify-between text-xs font-inter font-semibold mt-1.5" style={{ color: ORANGE }}>
              <span>{xpInLevel}/{XP_PER_LEVEL} XP</span>
              <span>Level {level + 1} Dalam {xpToNextLevel} XP Lagi !!</span>
            </div>
          </div>
        </div>

        {/* Active skill progress */}
        <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: BLUE }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0" style={{ background: '#e1e8f2' }}>
              {skillMeta.emoji}
            </div>
            <div className="min-w-0">
              <div className="font-sora font-bold text-sm" style={{ color: BLUE }}>{skillMeta.label}</div>
              <div className="italic text-xs font-inter font-semibold" style={{ color: BLUE }}>{skillMap.mapTitle}</div>
            </div>
          </div>
          <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: '#e1e8f2' }}>
            <div className="h-full rounded-full transition-all duration-700" style={{ width: `${(completedCount / totalNodes) * 100}%`, background: ORANGE }} />
          </div>
          <div className="text-xs font-bold font-inter mt-1.5" style={{ color: ORANGE }}>{completedCount}/{totalNodes} Node</div>
        </div>

        {/* Insight & Analisis Skill — teaser only, full breakdown + AI
            consult lives on its own page so it reads as a destination
            worth visiting, not just another card buried in the profile. */}
        <button
          onClick={() => navigate('/rina/insight')}
          className="w-full text-left bg-white border-2 rounded-2xl p-5 flex items-center gap-4 transition-all hover:shadow-md cursor-pointer"
          style={{ borderColor: BLUE }}
        >
          <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#eef2fe' }}>
            <Lightbulb size={20} style={{ color: BLUE }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-sora font-bold text-sm" style={{ color: BLUE }}>Insight & Analisis Skill</div>
            <div className="text-gray-500 text-xs font-inter mt-0.5">
              {insightLoading
                ? 'Memuat...'
                : !insightHasData
                  ? 'Selesaikan minimal 1 unit untuk mulai lihat analisis kamu'
                  : weaknesses.length > 0
                    ? `${weaknesses.length} area perlu ditingkatkan — lihat rekomendasi & konsul ke Wady`
                    : 'Semua konsep di atas 70% — lihat detail & konsul ke Wady'}
            </div>
          </div>
          <span className="text-xs font-bold font-inter shrink-0" style={{ color: BLUE }}>Lihat →</span>
        </button>

        {/* Visibility toggle */}
        <div className="bg-white border-2 rounded-2xl p-5 flex items-center justify-between gap-4" style={{ borderColor: BLUE }}>
          <div className="min-w-0">
            <div className="font-sora font-bold text-sm" style={{ color: BLUE }}>Visibilitas Profil</div>
            <div className="italic text-xs font-inter font-semibold mt-0.5" style={{ color: BLUE }}>
              {visibility === 'public' ? 'Profil bisa ditemukan UMKM lewat Smart Matching' : 'Profil disembunyikan dari pool matching — kamu tetap bisa belajar'}
            </div>
          </div>
          <div className="flex rounded-full p-1 shrink-0" style={{ background: '#e1e8f2' }}>
            <button
              onClick={() => setVisibility('public')}
              className="flex items-center gap-1.5 text-xs font-bold font-inter px-3.5 py-1.5 rounded-full transition-all cursor-pointer border-0"
              style={visibility === 'public' ? { background: ORANGE, color: '#fff' } : { color: '#9ca3af' }}
            >
              <Eye size={13} /> Public
            </button>
            <button
              onClick={() => setVisibility('private')}
              className="flex items-center gap-1.5 text-xs font-bold font-inter px-3.5 py-1.5 rounded-full transition-all cursor-pointer border-0"
              style={visibility === 'private' ? { background: ORANGE, color: '#fff' } : { color: '#9ca3af' }}
            >
              <EyeOff size={13} /> Private
            </button>
          </div>
        </div>

        {/* Sertifikat Kompetensi — only after the skill's final project is approved */}
        {certificate && (
          <div className="bg-white border-2 rounded-2xl p-5 flex items-center gap-4" style={{ borderColor: BLUE }}>
            <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: '#e1e8f2' }}>
              <GraduationCap size={20} style={{ color: BLUE }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-sora font-bold text-sm" style={{ color: BLUE }}>Sertifikat Kompetensi {certificate.skillLabel}</div>
              <div className="text-gray-400 text-[11px] font-inter mt-0.5 font-mono">{certificate.certId}</div>
            </div>
            <button
              onClick={() => navigate(`/rina/sertifikat/${skillId}`)}
              className="text-xs font-bold font-inter px-3.5 py-2 rounded-full text-white cursor-pointer transition-colors shrink-0 hover:brightness-110"
              style={{ background: ORANGE }}
            >
              Lihat
            </button>
          </div>
        )}

        {/* Verified Portfolio — only after first checkpoint approved */}
        {verificationSubmitted && (
          <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: BLUE }}>
            <h2 className="font-sora font-bold text-sm mb-4" style={{ color: BLUE }}>Verified Portfolio</h2>
            <div className="space-y-3">
              {PORTFOLIO_WORKS.map(work => (
                <div key={work.title} className="flex items-center gap-3 rounded-xl p-3" style={{ background: '#f5f8fb' }}>
                  <div className="w-11 h-11 rounded-lg flex items-center justify-center text-xl shrink-0" style={{ background: '#e1e8f2' }}>{work.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[#1a1a1a] text-xs font-semibold font-inter truncate">{work.title}</div>
                    <div className="text-gray-400 text-[11px] font-inter">{work.client} · {work.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-bold text-xs font-inter" style={{ color: GREEN }}>{work.score}%</div>
                    <div className="flex items-center gap-1 text-[9px] text-gray-400 font-inter mt-0.5">
                      <CheckCircle size={9} style={{ color: GREEN }} /> Human Reviewed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Track Record — only after first real project accepted */}
        {projectAccepted && (
          <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: BLUE }}>
            <h2 className="font-sora font-bold text-sm mb-4" style={{ color: BLUE }}>Track Record</h2>
            <div className="rounded-xl p-4" style={{ background: '#f5f8fb' }}>
              <div className="flex items-center justify-between mb-2">
                <div className="text-[#1a1a1a] text-xs font-semibold font-inter">{activeProject.umkm}</div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="fill-current" style={{ color: ORANGE }} />
                  ))}
                </div>
              </div>
              <p className="text-gray-500 text-xs font-inter leading-relaxed italic">
                "Hasil kerjanya rapi dan sesuai brief, komunikasinya juga responsif. Pasti order lagi ke depannya!"
              </p>
            </div>
          </div>
        )}

        {/* Optional: CV + external links */}
        <div className="bg-white border-2 rounded-2xl p-5 space-y-4" style={{ borderColor: BLUE }}>
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <h2 className="font-sora font-bold text-sm" style={{ color: BLUE }}>CV/Resume</h2>
              <span className="text-[10px] font-inter font-semibold shrink-0" style={{ color: ORANGE }}>Melengkapi profil, bukan syarat kerja</span>
            </div>
            {!cvUploaded ? (
              <button
                onClick={() => setCvUploaded(true)}
                className="w-full rounded-2xl p-4 flex items-center justify-center gap-2 text-xs font-inter font-semibold transition-all cursor-pointer border-[3px] border-dashed"
                style={{ background: '#cfddfb', borderColor: '#0052ff', color: '#0052ff' }}
              >
                <Upload size={14} /> Upload CV/Resume (opsional)
              </button>
            ) : (
              <div
                className="flex items-center justify-center gap-2 rounded-2xl p-4 text-xs font-inter font-semibold border-[3px] border-dashed"
                style={{ background: '#cfddfb', borderColor: '#0052ff', color: GREEN }}
              >
                <CheckCircle size={14} /> CV_Rina_Kusumawati.pdf
              </div>
            )}
          </div>

          <div>
            <h2 className="font-sora font-bold text-sm mb-2 flex items-center gap-1.5" style={{ color: BLUE }}><LinkIcon size={14} /> Link Eksternal</h2>
            <div className="space-y-2">
              <input
                value={links.behance}
                onChange={e => setLinks(prev => ({ ...prev, behance: e.target.value }))}
                placeholder="Link Behance (Opsional)"
                className="w-full rounded-full px-4 py-2.5 text-xs font-inter text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none"
                style={{ background: '#cfddfb' }}
              />
              <input
                value={links.linkedin}
                onChange={e => setLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="Link LinkedIn (Opsional)"
                className="w-full rounded-full px-4 py-2.5 text-xs font-inter text-[#1a1a1a] placeholder:text-gray-400 focus:outline-none"
                style={{ background: '#cfddfb' }}
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/rina/task')}
          className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-full transition-all active:scale-95 font-inter text-sm cursor-pointer border-0 hover:brightness-110"
          style={{ background: GREEN }}
        >
          <ArrowLeft size={16} />
          Kembali ke Peta Misi
        </button>

        {isReal && (
          <button
            onClick={handleSignOut}
            className="w-full flex items-center justify-center gap-2 font-semibold py-3 rounded-full transition-all active:scale-95 font-inter text-sm cursor-pointer bg-transparent border-2"
            style={{ color: '#e5484d', borderColor: '#e5484d' }}
          >
            <LogOut size={16} />
            Keluar dari Akun
          </button>
        )}
      </main>
    </div>
  );
}
