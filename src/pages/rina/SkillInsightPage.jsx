import { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, MessageCircle, CheckCircle, AlertTriangle, BookOpen, Lock, Sparkles, BarChart3, Search } from 'lucide-react';
import AIMentorWidget from '../../components/AIMentorWidget';
import useSkillInsight, { labelFor } from '../../hooks/useSkillInsight';
import { useApp } from '../../context/AppContext';
import { DEFAULT_SKILL, getSkillMeta } from '../../data/skillMaps';

const BLUE = '#2b6fff';
const ORANGE = '#f37219';
const GREEN = '#00c897';
const RED = '#e5484d';

export default function SkillInsightPage() {
  const navigate = useNavigate();
  const { selectedSkill } = useApp();
  const skillId = selectedSkill || DEFAULT_SKILL;
  const skillMeta = getSkillMeta(skillId);
  const mentorRef = useRef(null);

  const {
    loading, error,
    strengths, weaknesses, resources,
    isPremium, hasData, shownAnalysis, isAnalyzing, isPaying,
    handleUpgrade, handleAnalyze,
  } = useSkillInsight();

  // "Konsul" reuses the same AI Mentor widget every unit page already talks
  // to — no dedicated chat surface to build. It isn't a real content unit
  // (content_service.get_unit returns None for this id), which the mentor
  // system prompt already handles gracefully, and stage="materi" tells it to
  // answer fully rather than withhold answers like the quiz/checkpoint
  // stages do. The suggested chips are the user's own weak concepts so
  // "Konsul" starts from something concrete instead of a blank input.
  const insightNode = {
    id: 'insight-review',
    title: 'Analisis Skill & Rekomendasi',
    suggests: weaknesses.map(w => ({
      id: `insight-${w.concept}`,
      text: `Kenapa aku masih lemah di ${labelFor(w.concept)}, dan gimana cara ningkatinnya?`,
    })),
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-16 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/rina/profile')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={18} />
          Kembali ke Profil
        </button>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8 md:py-10 space-y-6">
        <div>
          <h1 className="font-sora font-extrabold text-2xl md:text-3xl" style={{ color: BLUE }}>Analisis Skill Kamu</h1>
          <p className="text-gray-500 font-inter text-sm mt-1.5">
            Berdasarkan quiz & unit yang sudah kamu kerjakan di {skillMeta.label} — kelihatan di mana kamu sudah kuat, dan di mana masih perlu digenjot.
          </p>
        </div>

        {loading ? (
          <div className="bg-white border-2 rounded-2xl p-8 text-center" style={{ borderColor: BLUE }}>
            <div className="text-sm font-inter text-gray-400">Memuat insight skill...</div>
          </div>
        ) : !hasData ? (
          <div className="bg-white border-2 rounded-2xl p-8 text-center" style={{ borderColor: BLUE }}>
            <BarChart3 size={28} className="mx-auto mb-2" style={{ color: BLUE }} />
            <p className="text-sm font-inter text-gray-500">Selesaikan minimal 1 unit di Peta Misi untuk mulai lihat analisis skill kamu di sini.</p>
          </div>
        ) : (
          <>
            {strengths.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border-2 rounded-2xl p-6"
                style={{ borderColor: GREEN }}
              >
                <h2 className="font-sora font-bold text-base mb-4 flex items-center gap-2" style={{ color: GREEN }}><CheckCircle size={17} /> Kekuatan Kamu</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {strengths.map(s => (
                    <div key={s.concept} className="rounded-xl p-4" style={{ background: 'rgba(0,200,151,0.08)' }}>
                      <div className="font-semibold font-inter text-sm" style={{ color: '#1a1a1a' }}>{labelFor(s.concept)}</div>
                      <div className="font-sora font-extrabold text-xl mt-1" style={{ color: GREEN }}>{s.score}%</div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {weaknesses.length > 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-white border-2 rounded-2xl p-6"
                style={{ borderColor: ORANGE }}
              >
                <h2 className="font-sora font-bold text-base mb-4 flex items-center gap-2" style={{ color: ORANGE }}><AlertTriangle size={17} /> Perlu Ditingkatkan</h2>
                <div className="grid sm:grid-cols-2 gap-3">
                  {weaknesses.map(w => (
                    <motion.div
                      key={w.concept}
                      animate={{ scale: [1, 1.02, 1] }}
                      transition={{ duration: 2.2, repeat: Infinity }}
                      className="rounded-xl p-4"
                      style={{ background: 'rgba(243,114,25,0.08)' }}
                    >
                      <div className="font-semibold font-inter text-sm" style={{ color: '#1a1a1a' }}>{labelFor(w.concept)}</div>
                      <div className="font-sora font-extrabold text-xl mt-1" style={{ color: ORANGE }}>{w.score}%</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="bg-white border-2 rounded-2xl p-6 text-center" style={{ borderColor: GREEN }}>
                <p className="text-sm font-inter text-gray-500">Semua konsep di atas 70% — belum ada kelemahan menonjol yang terdeteksi.</p>
              </div>
            )}

            {resources.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-white border-2 rounded-2xl p-6"
                style={{ borderColor: BLUE }}
              >
                <h2 className="font-sora font-bold text-base mb-4 flex items-center gap-2" style={{ color: BLUE }}><BookOpen size={17} /> Rekomendasi Belajar</h2>
                <div className="space-y-2">
                  {resources.map(r => (
                    <div key={r.weakness} className="rounded-xl p-3.5 text-sm font-inter text-gray-600 flex items-center gap-2" style={{ background: '#f5f8fb' }}>
                      <Search size={14} className="shrink-0" style={{ color: BLUE }} />
                      <span>Coba cari: <span className="font-semibold" style={{ color: BLUE }}>"{r.search_query}"</span></span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Analisis Mendalam — Premium */}
            {!isPremium ? (
              <div className="rounded-2xl p-6 border-2 flex flex-col items-center text-center gap-2.5" style={{ borderColor: BLUE, background: '#eef2fe' }}>
                <Lock size={24} style={{ color: BLUE }} />
                <div className="font-sora font-bold text-base" style={{ color: BLUE }}>Analisis Mendalam — Premium</div>
                <p className="text-sm font-inter text-gray-500 max-w-sm">Wady bisa jelasin lebih detail kenapa kamu struggle di area tertentu, dan kasih rekomendasi belajar yang personal.</p>
                <button
                  onClick={handleUpgrade}
                  disabled={isPaying}
                  className="text-white font-bold text-sm px-6 py-3 rounded-full mt-1 cursor-pointer border-0 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                  style={{ background: ORANGE }}
                >
                  {isPaying ? 'Memproses...' : 'Upgrade ke Premium'}
                </button>
              </div>
            ) : (
              <div className="rounded-2xl p-6 border-2" style={{ borderColor: BLUE, background: '#eef2fe' }}>
                <div className="font-sora font-bold text-base mb-3 flex items-center gap-2" style={{ color: BLUE }}><Sparkles size={17} /> Analisis Mendalam Wady</div>
                {shownAnalysis ? (
                  <p className="text-sm font-inter text-gray-600 leading-relaxed whitespace-pre-line">{shownAnalysis}</p>
                ) : (
                  <button
                    onClick={handleAnalyze}
                    disabled={isAnalyzing}
                    className="w-full text-white font-bold text-sm py-3 rounded-full cursor-pointer border-0 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                    style={{ background: BLUE }}
                  >
                    {isAnalyzing ? 'Menganalisis...' : 'Analisis Mendalam Wady'}
                  </button>
                )}
              </div>
            )}

            {/* Konsul */}
            <div className="rounded-2xl p-6 border-2 flex flex-col sm:flex-row items-center gap-4 justify-between" style={{ borderColor: GREEN, background: 'rgba(0,200,151,0.06)' }}>
              <div>
                <div className="font-sora font-bold text-base" style={{ color: '#1a1a1a' }}>Masih bingung harus mulai dari mana?</div>
                <p className="text-sm font-inter text-gray-500 mt-1">Konsul langsung ke Wady soal kelemahan kamu di atas.</p>
              </div>
              <button
                onClick={() => mentorRef.current?.open()}
                className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-full cursor-pointer border-0 hover:brightness-110 shrink-0 font-inter text-sm"
                style={{ background: GREEN }}
              >
                <MessageCircle size={16} /> Konsul ke Wady
              </button>
            </div>
          </>
        )}

        {error && <div className="text-sm font-inter text-center" style={{ color: RED }}>{error}</div>}
      </main>

      <AIMentorWidget ref={mentorRef} node={insightNode} stage="materi" skillLabel={skillMeta.label} skillId={skillId} light />
    </div>
  );
}
