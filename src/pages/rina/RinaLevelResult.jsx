import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, ArrowRight, Zap } from 'lucide-react';
import { useApp, XP_PER_LEVEL } from '../../context/AppContext';

const CHECKS = [
  { text: 'Canva & Photoshop skill terdeteksi dari CV', ok: true },
  { text: 'Tugas kampus: poster Bazaar Kampus (nilai B+)', ok: true },
  { text: '2 portofolio desain ditemukan', ok: true },
  { text: 'Pengalaman klien berbayar: belum ada', ok: false },
  { text: 'Rekomendasi: mulai dengan tugas Beginner–Intermediate', ok: null },
];

export default function RinaLevelResult() {
  const navigate = useNavigate();
  const { level, levelName, xpInLevel, xpToNextLevel, exp } = useApp();

  const xpProgressPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-indigo/10 border border-indigo/20 rounded-full px-4 py-1.5 mb-4">
          <Zap size={14} className="text-indigo" />
          <span className="text-indigo text-xs font-semibold font-inter">Hasil Penilaian Level Awal</span>
        </div>
        <h1 className="font-sora font-extrabold text-deep text-4xl mb-2">Level {level}</h1>
        <p className="text-gray-500 font-inter">{levelName} — Siap untuk tantangan pertama</p>
      </div>

      {/* XP Level card */}
      <div className="bg-white rounded-2xl border-2 border-indigo/20 p-7 mb-6 shadow-sm">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-full bg-indigo flex items-center justify-center shadow">
            <span className="text-white font-sora font-bold text-lg">{level}</span>
          </div>
          <div>
            <div className="font-sora font-bold text-deep">Level {level} — {levelName}</div>
            <div className="text-sm text-gray-500 font-inter">{exp} XP terkumpul</div>
          </div>
          <div className="ml-auto text-right">
            <div className="font-sora font-bold text-indigo text-sm">+{xpToNextLevel} XP</div>
            <div className="text-xs text-gray-400 font-inter">ke Level {level + 1}</div>
          </div>
        </div>

        {/* XP Progress bar */}
        <div className="mb-2">
          <div className="flex justify-between text-xs text-gray-400 font-inter mb-1.5">
            <span>Progress ke Level {level + 1}</span>
            <span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
          </div>
          <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-indigo to-purple rounded-full transition-all duration-700"
              style={{ width: `${xpProgressPct}%` }}
            />
          </div>
        </div>

        {/* Level badges */}
        <div className="flex gap-2 mt-5 flex-wrap">
          {['Level 1 ✓', 'Level 2 ✓', 'Level 3 🔒', 'Level 4 🔒'].map((l, i) => (
            <span
              key={l}
              className={`text-xs px-3 py-1.5 rounded-full font-inter font-semibold ${
                i < 2 ? 'bg-indigo text-white' : 'bg-gray-100 text-gray-400'
              }`}
            >
              {l}
            </span>
          ))}
        </div>

        {/* XP info */}
        <div className="mt-4 bg-indigo/5 rounded-xl p-3 flex items-center gap-2">
          <Zap size={14} className="text-indigo flex-shrink-0" />
          <p className="text-xs text-indigo font-inter">
            Selesaikan tugas untuk mendapat XP dan naik level. Kamu butuh <strong>{xpToNextLevel} XP lagi</strong> untuk Level {level + 1}!
          </p>
        </div>
      </div>

      {/* AI Analysis */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-indigo/10 flex items-center justify-center">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <div className="font-sora font-bold text-deep text-sm">Analisis AI WADAH</div>
            <div className="text-xs text-gray-400 font-inter">Berdasarkan CV & portofolio yang diupload</div>
          </div>
        </div>

        <div className="space-y-3">
          {CHECKS.map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              {item.ok === true && <CheckCircle size={16} className="text-green mt-0.5 flex-shrink-0" />}
              {item.ok === false && <AlertCircle size={16} className="text-amber mt-0.5 flex-shrink-0" />}
              {item.ok === null && <div className="w-4 h-4 rounded-full border-2 border-indigo flex-shrink-0 mt-0.5" />}
              <span className={`text-sm font-inter ${item.ok === false ? 'text-amber' : item.ok === null ? 'text-indigo font-medium' : 'text-gray-600'}`}>
                {item.text}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Recommended task */}
      <div className="bg-green/5 border border-green/30 rounded-2xl p-5 mb-8">
        <div className="text-xs font-semibold text-green font-inter uppercase tracking-wide mb-2">📋 Tugas yang Direkomendasikan</div>
        <div className="font-sora font-bold text-deep">Konten Instagram Warung Makan Pak Budi</div>
        <div className="text-sm text-gray-500 font-inter mt-1">Desain Grafis · Beginner · Deadline 2 hari</div>
        <div className="flex items-center gap-1.5 mt-2">
          <Zap size={13} className="text-indigo" />
          <span className="text-sm font-bold text-indigo font-inter">Reward: 100 XP</span>
        </div>
        <div className="flex gap-3 mt-3 text-xs font-inter text-gray-500">
          <span>✓ Sesuai level</span>
          <span>✓ Sesuai skill</span>
          <span>✓ Peluang lulus tinggi</span>
        </div>
      </div>

      <button
        onClick={() => navigate('/rina/dashboard')}
        className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo to-purple text-white font-bold py-4 rounded-xl hover:opacity-90 transition-opacity active:scale-95 font-inter text-base shadow-lg"
      >
        Masuk Dashboard Karier 🚀
        <ArrowRight size={18} />
      </button>
    </div>
  );
}
