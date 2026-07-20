import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, CheckCircle, Star, Upload, Link as LinkIcon, Eye, EyeOff } from 'lucide-react';
import { useApp, XP_PER_LEVEL } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta } from '../../data/skillMaps';

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
  } = useApp();

  const [visibility, setVisibility] = useState('public');
  const [cvUploaded, setCvUploaded] = useState(false);
  const [links, setLinks] = useState({ behance: '', linkedin: '' });

  const skillId = selectedSkill || DEFAULT_SKILL;
  const skillMeta = getSkillMeta(skillId);
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const completedCount = completedNodeIds.filter(id => id.startsWith(`${skillId}:`)).length;
  const totalNodes = skillMap.nodes.length;
  const xpProgressPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      {/* Header */}
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5">
        <button
          onClick={() => navigate('/rina/task')}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={16} />
          Kembali ke Peta Misi
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-10 space-y-6">
        {/* Identity + XP */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6">
          <div className="flex items-start gap-4">
            <img src="/rina.jpg" className="w-16 h-16 rounded-full object-cover border-2 border-purple/40" alt="Rina" />
            <div className="flex-1 min-w-0">
              <h1 className="text-white font-sora font-bold text-xl">Rina Kusumawati</h1>
              <div className="inline-flex items-center gap-1.5 bg-purple/15 border border-purple/30 rounded-full px-2.5 py-1 text-xs text-purple font-semibold font-inter mt-1.5">
                Level {level} · {levelName}
              </div>
            </div>
          </div>

          <div className="mt-5">
            <div className="flex justify-between text-xs font-inter mb-1.5">
              <span className="text-white/40">{exp} XP total terkumpul</span>
              <span className="text-white/40">{xpInLevel} / {XP_PER_LEVEL} XP</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-2.5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple to-indigo rounded-full transition-all duration-700"
                style={{ width: `${xpProgressPct}%` }}
              />
            </div>
            <div className="text-white/30 text-[11px] font-inter mt-1.5">{xpToNextLevel} XP lagi ke Level {level + 1}</div>
          </div>
        </div>

        {/* Active skill progress */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <span className="text-2xl">{skillMeta.emoji}</span>
              <div>
                <div className="text-white font-sora font-bold text-sm">{skillMeta.label}</div>
                <div className="text-white/40 text-xs font-inter">{skillMap.mapTitle}</div>
              </div>
            </div>
            <span className="text-xs text-purple font-bold font-inter">{completedCount}/{totalNodes} node</span>
          </div>
          <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple to-indigo rounded-full transition-all duration-700"
              style={{ width: `${(completedCount / totalNodes) * 100}%` }}
            />
          </div>
        </div>

        {/* Visibility toggle */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-white text-sm font-semibold font-inter">Visibilitas Profil</div>
            <div className="text-white/40 text-xs font-inter mt-0.5">
              {visibility === 'public' ? 'Profil bisa ditemukan UMKM lewat Smart Matching' : 'Profil disembunyikan dari pool matching — kamu tetap bisa belajar'}
            </div>
          </div>
          <div className="flex bg-white/5 rounded-xl p-1 border border-white/10 shrink-0">
            <button
              onClick={() => setVisibility('public')}
              className={`flex items-center gap-1.5 text-xs font-bold font-inter px-3 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                visibility === 'public' ? 'bg-purple text-white' : 'bg-transparent text-white/40'
              }`}
            >
              <Eye size={13} /> Public
            </button>
            <button
              onClick={() => setVisibility('private')}
              className={`flex items-center gap-1.5 text-xs font-bold font-inter px-3 py-1.5 rounded-lg transition-all cursor-pointer border-0 ${
                visibility === 'private' ? 'bg-purple text-white' : 'bg-transparent text-white/40'
              }`}
            >
              <EyeOff size={13} /> Private
            </button>
          </div>
        </div>

        {/* Verified Portfolio — only after first checkpoint approved */}
        {verificationSubmitted && (
          <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-sora font-bold text-sm mb-4">Verified Portfolio</h2>
            <div className="space-y-3">
              {PORTFOLIO_WORKS.map(work => (
                <div key={work.title} className="flex items-center gap-3 bg-white/[0.03] border border-white/5 rounded-xl p-3">
                  <div className="w-11 h-11 rounded-lg bg-white/5 flex items-center justify-center text-xl shrink-0">{work.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="text-white text-xs font-semibold font-inter truncate">{work.title}</div>
                    <div className="text-white/40 text-[11px] font-inter">{work.client} · {work.date}</div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-green-400 font-bold text-xs font-inter">{work.score}%</div>
                    <div className="flex items-center gap-1 text-[9px] text-white/40 font-inter mt-0.5">
                      <CheckCircle size={9} className="text-green-400" /> Human Reviewed
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Track Record — only after first real project accepted */}
        {projectAccepted && (
          <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
            <h2 className="text-white font-sora font-bold text-sm mb-4">Track Record</h2>
            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="text-white text-xs font-semibold font-inter">{activeProject.umkm}</div>
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={12} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
              </div>
              <p className="text-white/50 text-xs font-inter leading-relaxed italic">
                "Hasil kerjanya rapi dan sesuai brief, komunikasinya juga responsif. Pasti order lagi ke depannya!"
              </p>
            </div>
          </div>
        )}

        {/* Optional: CV + external links */}
        <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5 space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-white font-sora font-bold text-sm">CV / Resume</h2>
              <span className="text-[10px] text-white/30 font-inter">Melengkapi profil, bukan syarat kerja</span>
            </div>
            {!cvUploaded ? (
              <button
                onClick={() => setCvUploaded(true)}
                className="w-full border-2 border-dashed border-white/10 hover:border-purple/40 rounded-xl p-4 flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-xs font-inter transition-all bg-transparent cursor-pointer"
              >
                <Upload size={14} /> Upload CV/Resume (opsional)
              </button>
            ) : (
              <div className="flex items-center gap-2 bg-white/[0.03] border border-white/10 rounded-xl p-3 text-xs text-white/70 font-inter">
                <CheckCircle size={14} className="text-green-400" /> CV_Rina_Kusumawati.pdf
              </div>
            )}
          </div>

          <div>
            <h2 className="text-white font-sora font-bold text-sm mb-2 flex items-center gap-1.5"><LinkIcon size={14} /> Link Eksternal</h2>
            <div className="space-y-2">
              <input
                value={links.behance}
                onChange={e => setLinks(prev => ({ ...prev, behance: e.target.value }))}
                placeholder="Link Behance (opsional)"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 font-inter focus:outline-none focus:border-purple/50"
              />
              <input
                value={links.linkedin}
                onChange={e => setLinks(prev => ({ ...prev, linkedin: e.target.value }))}
                placeholder="Link LinkedIn (opsional)"
                className="w-full bg-white/[0.03] border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder:text-white/25 font-inter focus:outline-none focus:border-purple/50"
              />
            </div>
          </div>
        </div>

        <button
          onClick={() => navigate('/rina/task')}
          className="w-full flex items-center justify-center gap-2 bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 font-inter text-sm cursor-pointer border-0"
        >
          <ArrowLeft size={16} />
          Kembali ke Peta Misi
        </button>
      </main>
    </div>
  );
}
