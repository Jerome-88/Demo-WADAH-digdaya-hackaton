import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowLeft, MapPin, Briefcase } from 'lucide-react';
import ScoreBar from '../../components/ScoreBar';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta } from '../../data/skillMaps';

const PARAMS = [
  { label: 'Skor Performa',   value: 82,  weight: '40%', color: 'indigo' },
  { label: 'Relevansi Skill', value: 95,  weight: '35%', color: 'green' },
  { label: 'Kecepatan',       value: 88,  weight: '25%', color: 'amber' },
];

export default function SmartMatchPage() {
  const navigate = useNavigate();
  const { activeProject, setProjectAccepted } = useApp();
  const [accepted, setAccepted] = useState(false);

  const skillId = activeProject?.skillId || DEFAULT_SKILL;
  const skillMeta = getSkillMeta(skillId);
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const umkmName = activeProject?.umkm || 'Toko Batik Nusantara';
  const description = activeProject?.desc || 'Butuh talenta terverifikasi untuk kebutuhan konten UMKM kami.';

  const matchReasons = [
    `Skill ${skillMeta.label} sesuai dengan kebutuhan ${umkmName}: "${description}"`,
    'Skor performa 82% melampaui threshold minimum 75%',
    'Checkpoint skill map terverifikasi menunjukkan track record relevan',
  ];

  const projectDetails = [
    ['Klien',     umkmName],
    ['Kategori',  `UMKM ${skillMeta.label}`],
    ['Output',    skillMap.nodes.find(n => n.type === 'checkpoint')?.title || 'Deliverable sesuai brief'],
    ['Budget',    'Rp 500.000'],
    ['Deadline',  '2 minggu'],
    ['Reward',    'Dibayar setelah verifikasi WADAH'],
  ];

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 py-10">
      {!accepted ? (
        <>
          {/* Header */}
          <button
            onClick={() => navigate('/rina/profile')}
            className="flex items-center gap-2 text-gray-500 hover:text-gray-700 font-inter text-sm mb-6"
          >
            <ArrowLeft size={16} />
            Kembali ke Profil
          </button>

          {/* Dark header card */}
          <div
            className="rounded-2xl p-6 mb-6 text-center"
            style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 100%)' }}
          >
            <div className="inline-flex items-center gap-2 bg-green/20 border border-green/40 rounded-full px-3 py-1.5 mb-4">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
              <span className="text-green text-xs font-semibold font-inter">Smart Match Tersedia</span>
            </div>

            <h1 className="font-sora font-bold text-white text-xl mb-1">Ada proyek yang cocok untukmu! 🎯</h1>
            <p className="text-white/70 font-inter text-sm">Berdasarkan profil, skor, dan track record kamu</p>

            {/* Match score ring */}
            <div className="flex items-center justify-center mt-5">
              <div className="relative w-28 h-28">
                <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="40" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="10" />
                  <circle
                    cx="50" cy="50" r="40"
                    fill="none"
                    stroke="#059669"
                    strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={`${87 * 2.51} ${100 * 2.51}`}
                    style={{ transition: 'stroke-dasharray 1.5s ease' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-sora font-extrabold text-white text-2xl leading-none">87%</span>
                  <span className="text-white/60 text-xs font-inter">match</span>
                </div>
              </div>
            </div>
          </div>

          {/* Match card */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber/30 to-orange-400/30 flex items-center justify-center text-2xl flex-shrink-0">
                {skillMeta.emoji}
              </div>
              <div className="flex-1">
                <div className="font-sora font-bold text-deep text-base">{umkmName}</div>
                <div className="flex items-center gap-3 text-xs text-gray-500 font-inter mt-1">
                  <span className="flex items-center gap-1"><Briefcase size={11} />UMKM {skillMeta.label}</span>
                  <span className="flex items-center gap-1"><MapPin size={11} />Indonesia</span>
                </div>
              </div>
            </div>

            {/* Match reasons */}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs font-semibold text-green font-inter uppercase tracking-wide mb-2">ALASAN MATCHING</div>
              <div className="bg-green/5 border border-green/20 rounded-xl p-4 space-y-2">
                {matchReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm text-gray-700 font-inter">
                    <CheckCircle size={14} className="text-green mt-0.5 flex-shrink-0" />
                    {r}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Parameters */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-4">PARAMETER MATCHING</div>
            <div className="space-y-4">
              {PARAMS.map(p => (
                <div key={p.label}>
                  <div className="flex justify-between text-sm mb-1.5">
                    <span className="text-gray-700 font-inter">{p.label}</span>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-gray-800 font-inter">{p.value}%</span>
                      <span className="text-xs text-gray-400 font-inter">bobot {p.weight}</span>
                    </div>
                  </div>
                  <ScoreBar score={p.value} color={p.color} animated />
                </div>
              ))}
            </div>
          </div>

          {/* Project details */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 mb-5">
            <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-3">DETAIL PROYEK</div>
            <div className="space-y-2">
              {projectDetails.map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm font-inter">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-800 text-right">{v}</span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-2">KETENTUAN</div>
              <ul className="space-y-1.5">
                {skillMap.checklist.map(r => (
                  <li key={r} className="flex items-start gap-2 text-sm text-gray-600 font-inter">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo mt-2 flex-shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/rina/profile')}
              className="flex-1 border-2 border-gray-200 text-gray-600 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors font-inter"
            >
              Lewati
            </button>
            <button
              onClick={() => { setAccepted(true); setProjectAccepted(true); }}
              className="flex-1 bg-green text-white font-bold py-3.5 rounded-xl hover:bg-green-600 transition-all active:scale-95 font-inter text-sm"
            >
              🎉 Terima Proyek!
            </button>
          </div>
        </>
      ) : (
        /* ── ACCEPT SUCCESS ── */
        <div className="animate-pop text-center py-8 space-y-6">
          <div className="text-6xl mb-4">🎉</div>
          <div>
            <h1 className="font-sora font-extrabold text-deep text-3xl mb-2">Selamat!</h1>
            <h2 className="font-sora font-bold text-deep text-xl mb-1">Proyek Pertamamu Berhasil!</h2>
            <p className="text-gray-500 font-inter">Klien akan dihubungi oleh sistem WADAH dalam 30 menit</p>
          </div>

          {/* Confetti effect (CSS-based) */}
          <div className="flex justify-center gap-1 text-2xl">
            {['🎊','✨','🥳','⭐','🎊','✨','🥳'].map((e, i) => (
              <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>{e}</span>
            ))}
          </div>

          {/* Summary table */}
          <div className="bg-white rounded-2xl border border-gray-200 p-5 text-left">
            <div className="text-xs font-semibold text-gray-400 font-inter uppercase tracking-wide mb-3">Ringkasan Proyek</div>
            <div className="space-y-2.5">
              {[
                ['Klien',   umkmName],
                ['Proyek',  skillMap.nodes.find(n => n.type === 'checkpoint')?.title || 'Deliverable sesuai brief'],
                ['Budget',  'Rp 500.000'],
                ['Deadline','2 minggu'],
                ['Match',   '87% compatibility'],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between text-sm font-inter">
                  <span className="text-gray-500">{k}</span>
                  <span className="font-semibold text-gray-800">{v}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 flex items-center gap-2 justify-center bg-green/10 border border-green/30 rounded-xl p-3">
              <CheckCircle size={16} className="text-green" />
              <span className="text-green font-semibold font-inter text-sm">Proyek resmi diterima! Selamat bekerja 🚀</span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              className="flex-1 bg-indigo text-white font-bold py-3.5 rounded-xl hover:bg-indigo-dark transition-all active:scale-95 font-inter"
            >
              Buka Pesan Klien 💬
            </button>
            <button
              onClick={() => navigate('/rina/profile')}
              className="flex-1 border-2 border-gray-200 text-gray-700 font-semibold py-3.5 rounded-xl hover:bg-gray-50 transition-colors font-inter"
            >
              ← Profil Saya
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
