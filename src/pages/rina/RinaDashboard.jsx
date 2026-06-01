import { useNavigate } from 'react-router-dom';
import { Bell, ArrowRight, Clock, Star, Lock, Zap } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import ScoreBar from '../../components/ScoreBar';
import { useApp, XP_PER_LEVEL } from '../../context/AppContext';

const ACHIEVEMENTS = [
  { label: 'Tugas Pertama', emoji: '🎯', done: true,  desc: 'Selesaikan tugas pertama' },
  { label: 'Level Up!',     emoji: '⬆️', done: true,  desc: 'Naik ke Level 3' },
  { label: 'Smart Match',   emoji: '💡', done: false, desc: 'Dapatkan 1 match proyek' },
];

export default function RinaDashboard() {
  const navigate = useNavigate();
  const { level, levelName, xpInLevel, xpToNextLevel, exp } = useApp();

  const xpProgressPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar activePage="dashboard" />

      <main className="ml-60 flex-1 p-6 max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-sora font-bold text-deep text-2xl">Selamat datang kembali, Rina! 👋</h1>
          </div>
          <button
            onClick={() => navigate('/rina/match')}
            className="relative flex items-center gap-2 bg-white border border-gray-200 text-gray-700 text-sm px-4 py-2.5 rounded-xl hover:shadow-md transition-all font-inter"
          >
            <Bell size={17} />
            Notifikasi
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-green rounded-full text-white text-xs font-bold flex items-center justify-center font-inter">1</span>
          </button>
        </div>

        {/* XP Level Banner */}
        <div className="bg-gradient-to-r from-indigo/10 to-purple/10 border border-indigo/20 rounded-2xl p-5 mb-6">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-full bg-indigo flex items-center justify-center shadow">
                <span className="text-white font-sora font-bold text-sm">{level}</span>
              </div>
              <div>
                <div className="font-sora font-bold text-deep text-base">Level {level} - {levelName}</div>
                <div className="text-xs text-gray-500 font-inter">{exp} XP total terkumpul</div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-sora font-bold text-indigo text-sm">+{xpToNextLevel} XP</div>
              <div className="text-xs text-gray-400 font-inter">ke Level {level + 1}</div>
            </div>
          </div>
          <div className="w-full bg-white rounded-full h-3 overflow-hidden border border-indigo/10">
            <div
              className="h-full bg-gradient-to-r from-indigo to-purple rounded-full transition-all duration-700"
              style={{ width: `${xpProgressPct}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-400 font-inter mt-1.5">
            <span>{xpInLevel} / {XP_PER_LEVEL} XP</span>
            <span>Level {level + 1} dalam {xpToNextLevel} XP lagi</span>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-4 mb-7">
          <div className="bg-white rounded-xl border border-green/20 p-4">
            <div className="font-sora font-bold text-xl text-green mt-2.5 mb-2.5 flex justify-center">79%</div>
            <div className="text-xs text-gray-500 font-inter mt-0.5 text-center">Skor Rata-rata</div>
            <div className="text-xs text-gray-400 font-inter mt-0.5 text-center">↑ +4% bulan ini</div>
          </div>
          <div className="bg-white rounded-xl border border-amber/20 p-4">
            <div className="font-sora font-bold text-xl text-amber mt-2.5 mb-2.5 flex justify-center">2</div>
            <div className="text-xs text-gray-500 font-inter mt-0.5 text-center">Karya Terverifikasi</div>
            <div className="text-xs text-gray-400 font-inter mt-0.5 text-center">1 dalam proses</div>
          </div>
          <div className="bg-white rounded-xl border border-purple/20 p-4">
            <div className="font-sora font-bold text-xl text-purple mt-2.5 mb-2.5 flex justify-center">1.5 jam</div>
            <div className="text-xs text-gray-500 font-inter mt-0.5">Waktu Respons</div>
            <div className="text-xs text-gray-400 font-inter mt-0.5">Lebih cepat 60%</div>
          </div>
        </div>

        {/* Active task */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
              <span className="font-sora font-bold text-deep">Tugas Aktif</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1 text-xs text-indigo font-semibold font-inter bg-indigo/10 px-2.5 py-1 rounded-full">
                <Zap size={11} />
                +100 XP
              </span>
              <span className="flex items-center gap-1 text-xs text-amber font-semibold font-inter bg-amber/10 px-2.5 py-1 rounded-full">
                <Clock size={11} />
                1 hari tersisa
              </span>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-2xl flex-shrink-0">
              🍛
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-sora font-bold text-deep">Konten Instagram Pak Budi</div>
              <div className="text-sm text-gray-500 font-inter mt-0.5">Warung Makan Pak Budi - Desain Grafis</div>

              <div className="mt-3">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-400 font-inter">Progress</span>
                  <span className="font-semibold text-indigo font-inter">65%</span>
                </div>
                <ScoreBar score={65} color="indigo" animated />
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate('/rina/task')}
            className="mt-4 w-full flex items-center justify-center gap-2 bg-indigo text-white font-bold py-3 rounded-xl hover:bg-indigo-dark transition-all active:scale-95 font-inter text-sm"
          >
            Lanjutkan Tugas
          </button>
        </div>

        {/* Achievements */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
          <h3 className="font-sora font-bold text-deep mb-4">Pencapaian</h3>
          <div className="grid grid-cols-3 gap-4">
            {ACHIEVEMENTS.map(a => (
              <div key={a.label} className={`text-center p-4 rounded-xl transition-all ${a.done ? 'bg-green/5 border border-green/20' : 'bg-gray-50 border border-gray-100'}`}>
                <div className={`text-3xl mb-2 ${!a.done && 'grayscale opacity-40'}`}>{a.emoji}</div>
                <div className={`text-xs font-semibold font-inter ${a.done ? 'text-green' : 'text-gray-400'}`}>{a.label}</div>
                <div className="text-xs text-gray-400 font-inter mt-0.5">{a.desc}</div>
                {!a.done && <div className="mt-2"><Lock size={12} className="text-gray-300 mx-auto" /></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Smart Match Banner */}
        <div
          onClick={() => navigate('/rina/match')}
          className="bg-gradient-to-r from-indigo to-purple rounded-2xl p-5 cursor-pointer hover:opacity-95 transition-all hover:shadow-lg group"
        >
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-white font-sora font-bold">Smart Match Tersedia!</span>
              </div>
              <p className="text-white/80 text-sm font-inter">Ada 1 proyek yang sangat cocok untukmu - Toko Batik Nusantara</p>
              <div className="flex items-center gap-1 mt-2">
                <Star size={13} className="text-yellow-300 fill-yellow-300" />
                <span className="text-yellow-300 text-sm font-semibold font-inter">87% match score</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all font-inter font-semibold text-sm">
              Lihat <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
