import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, ArrowRight, ArrowLeft, Zap } from 'lucide-react';
import ScoreBar from '../../components/ScoreBar';
import { RINA_EVAL_SCORES } from '../../data/mockData';
import { useApp, getExpLevel, XP_PER_LEVEL } from '../../context/AppContext';

const TASK_XP = 100;

const SCORE_ITEMS = [
  { key: 'brief',       label: 'Kesesuaian Brief',           bobot: '30%', score: RINA_EVAL_SCORES.brief,       pass: true },
  { key: 'readability', label: 'Keterbacaan Teks & Kontras', bobot: '25%', score: RINA_EVAL_SCORES.readability,  pass: true },
  { key: 'visual',      label: 'Konsistensi Visual',         bobot: '25%', score: RINA_EVAL_SCORES.visual,       pass: true },
  { key: 'relevance',   label: 'Relevansi Target Audiens',   bobot: '20%', score: RINA_EVAL_SCORES.relevance,    pass: true },
];

const AI_FEEDBACK = `Karya kamu menunjukkan pemahaman yang baik tentang brief klien. Penggunaan warna merah bata dan kuning emas konsisten dengan identitas brand Warung Pak Budi.

**Area kuat:** Kesesuaian brief dan relevansi audiens sudah sangat baik. Hierarki visual jelas dan tagline terbaca dengan baik.

**Area peningkatan:** Konsistensi visual bisa ditingkatkan — pastikan semua elemen menggunakan grid yang konsisten. Ukuran teks CTA bisa sedikit diperbesar untuk keterbacaan optimal di layar kecil.

**Kesimpulan:** Karya ini sudah layak untuk dipresentasikan ke klien. Selamat! 🎉`;

export default function EvaluationPage() {
  const navigate = useNavigate();
  const { exp, addExp } = useApp();
  const [phase, setPhase] = useState('loading');
  const [didLevelUp, setDidLevelUp] = useState(false);
  const [newLevel, setNewLevel] = useState(null);
  const [xpAfter, setXpAfter] = useState(null);
  const xpAwarded = useRef(false);

  useEffect(() => {
    const t = setTimeout(() => setPhase('result'), 2200);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (phase === 'result' && !xpAwarded.current) {
      xpAwarded.current = true;
      const target = exp + TASK_XP;
      const prevLevel = getExpLevel(exp);
      const nextLevel = getExpLevel(target);
      setXpAfter(target);
      if (nextLevel > prevLevel) {
        setDidLevelUp(true);
        setNewLevel(nextLevel);
      }
      addExp(TASK_XP);
    }
  }, [phase]);

  const displayXP = xpAfter ?? exp + TASK_XP;
  const newLevelNum = getExpLevel(displayXP);
  const xpInNewLevel = displayXP - (newLevelNum - 1) * XP_PER_LEVEL;
  const newLevelPct = Math.round((xpInNewLevel / XP_PER_LEVEL) * 100);

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 py-12">
      {phase === 'loading' && (
        <div className="text-center py-20 animate-fade-in">
          <div className="w-20 h-20 border-4 border-indigo/30 border-t-indigo rounded-full animate-spin-fast mx-auto mb-6" />
          <h2 className="font-sora font-bold text-deep text-xl mb-2">AI Mengevaluasi Karyamu…</h2>
          <p className="text-gray-500 font-inter">Menganalisis: kesesuaian brief, keterbacaan, visual, relevansi</p>
          <div className="mt-8 space-y-2 text-left max-w-sm mx-auto">
            {['Membaca konten file…', 'Menganalisis kontras warna…', 'Mencocokkan dengan brief…', 'Menghitung skor final…'].map((t) => (
              <div key={t} className="flex items-center gap-2 text-sm text-gray-400 font-inter">
                <div className="w-4 h-4 border-2 border-indigo/30 border-t-indigo rounded-full animate-spin-fast flex-shrink-0" />
                {t}
              </div>
            ))}
          </div>
        </div>
      )}

      {phase === 'result' && (
        <div className="animate-pop space-y-6">
          {/* Success header */}
          <div className="text-center">
            <div className="w-16 h-16 bg-green/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={36} className="text-green" />
            </div>
            <h1 className="font-sora font-extrabold text-deep text-3xl mb-1">Evaluasi Selesai!</h1>
            <p className="text-gray-500 font-inter">Karyamu sudah dianalisis oleh AI WADAH</p>
          </div>

          {/* XP Reward */}
          <div className={`rounded-2xl p-5 ${didLevelUp ? 'bg-gradient-to-r from-indigo to-purple' : 'bg-indigo/10 border border-indigo/20'}`}>
            {didLevelUp ? (
              <div className="text-center">
                <div className="text-4xl mb-2">🎉</div>
                <div className="font-sora font-extrabold text-white text-2xl mb-1">Level Up!</div>
                <div className="text-white/80 font-inter text-sm mb-3">
                  Level {newLevel - 1} → <span className="font-bold text-yellow-300">Level {newLevel}</span>
                </div>
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 mb-4">
                  <Zap size={16} className="text-yellow-300" />
                  <span className="text-white font-sora font-bold">+{TASK_XP} XP diperoleh!</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="h-full bg-yellow-300 rounded-full transition-all duration-1000"
                    style={{ width: `${newLevelPct}%` }}
                  />
                </div>
                <div className="text-white/70 text-xs font-inter mt-1.5">{xpInNewLevel} / {XP_PER_LEVEL} XP — ke Level {newLevelNum + 1}</div>
              </div>
            ) : (
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo/20 rounded-full flex items-center justify-center flex-shrink-0">
                  <Zap size={22} className="text-indigo" />
                </div>
                <div>
                  <div className="font-sora font-bold text-indigo text-lg">+{TASK_XP} XP diperoleh!</div>
                  <div className="text-gray-600 text-sm font-inter">Total XP: {displayXP} — Level {newLevelNum}</div>
                </div>
              </div>
            )}
          </div>

          {/* Score breakdown */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h2 className="font-sora font-bold text-deep mb-5">Breakdown Skor</h2>
            <div className="space-y-5">
              {SCORE_ITEMS.map(item => (
                <div key={item.key}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-gray-700 font-inter">{item.label}</span>
                      <span className="text-xs text-gray-400 font-inter ml-2">bobot {item.bobot}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-sora font-bold text-indigo">{item.score}%</span>
                      {item.pass && (
                        <span className="text-xs text-green font-semibold font-inter flex items-center gap-1">
                          <CheckCircle size={11} /> Lulus
                        </span>
                      )}
                    </div>
                  </div>
                  <ScoreBar score={item.score} color="indigo" animated />
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="mt-6 pt-5 border-t border-gray-100">
              <div className="flex items-center justify-between mb-2">
                <span className="font-sora font-bold text-deep text-lg">Total Skor</span>
                <div className="flex items-center gap-3">
                  <span className="font-sora font-extrabold text-indigo text-2xl">{RINA_EVAL_SCORES.total}%</span>
                  <span className="bg-green text-white text-xs font-bold px-3 py-1.5 rounded-full font-inter">✓ LULUS</span>
                </div>
              </div>
              <ScoreBar score={RINA_EVAL_SCORES.total} color="indigo" animated height="h-5" />
              <p className="text-xs text-gray-400 font-inter mt-2">Minimum kelulusan: 70%</p>
            </div>
          </div>

          {/* AI Feedback */}
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <div className="flex items-center gap-2 mb-3">
              <img src="/bot.png" alt="rina" className="w-8 h-8" />
              <div className="font-sora font-bold text-deep text-sm">Umpan Balik AI</div>
            </div>
            <div
              className="text-sm text-gray-600 font-inter leading-relaxed"
              dangerouslySetInnerHTML={{
                __html: AI_FEEDBACK
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n\n/g, '</p><p class="mt-2">')
                  .replace(/\n/g, '<br/>'),
              }}
            />
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={() => navigate('/rina/task')}
              className="flex items-center gap-2 border border-gray-200 text-gray-600 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors font-inter flex-1 justify-center"
            >
              <ArrowLeft size={16} />
              Kembali ke Task
            </button>
            <button
              onClick={() => navigate('/rina/verification')}
              className="flex items-center gap-2 bg-green text-white font-bold px-5 py-3 rounded-xl hover:bg-green-600 transition-all active:scale-95 font-inter flex-1 justify-center"
            >
              Kirim ke Verifikasi Human
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
