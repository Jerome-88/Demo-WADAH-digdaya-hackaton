import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIMentorWidget from '../../components/AIMentorWidget';
import useGameAudio from '../../hooks/useGameAudio';
import { showToast } from '../../utils/toast';
import { useApp, getExpLevel } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta, parseUnitParam } from '../../data/skillMaps';

const NODE_XP = 40;
const PERFECT_BONUS_XP = 10;

export default function UnitPage() {
  const navigate = useNavigate();
  const { unitParam } = useParams();
  const {
    exp, addExp, completedNodeIds, setCompletedNodeIds,
    setStreak, hearts, setHearts, openedNodeIds, setOpenedNodeIds,
    activeProject,
  } = useApp();
  const { playSuccess, playFail, playClick } = useGameAudio();

  const parsed = parseUnitParam(unitParam || '');
  const skillId = parsed?.skillId || DEFAULT_SKILL;
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const skillMeta = getSkillMeta(skillId);
  const nodeIndex = parsed ? skillMap.nodes.findIndex(n => n.id === parsed.nodeId) : -1;
  const node = nodeIndex >= 0 ? skillMap.nodes[nodeIndex] : null;

  const nsKey = (nodeId) => `${skillId}:${nodeId}`;
  const isCompleted = (nodeId) => completedNodeIds.includes(nsKey(nodeId));
  const unlocked = nodeIndex === 0 || (nodeIndex > 0 && isCompleted(skillMap.nodes[nodeIndex - 1].id));

  const [stage, setStage] = useState('materi'); // 'materi' | 'quiz' | 'tantangan'
  const [quizIndex, setQuizIndex] = useState(0);
  const [quizSelected, setQuizSelected] = useState(null);
  const [quizCorrectCount, setQuizCorrectCount] = useState(0);
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);

  const isCheckpoint = node?.type === 'checkpoint';

  // Checkpoint's quiz stage is a composed review pulling one question from
  // each of the unit's regular nodes — tests cumulative mastery without
  // needing separate checkpoint-only quiz content authored.
  const quizQuestions = useMemo(() => {
    if (!node) return [];
    if (!isCheckpoint) return node.questions;
    return skillMap.nodes
      .filter(n => n.type === 'quiz')
      .map(n => ({ ...n.questions[0], question: `[Review ${n.id}] ${n.questions[0].question}` }));
  }, [node, isCheckpoint, skillMap]);

  const quizDone = quizIndex >= quizQuestions.length;

  // Redirect away from invalid / locked units — covers direct URL entry.
  useEffect(() => {
    if (!node || !unlocked) navigate('/rina/task', { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [unitParam]);

  // Lives only ever charge once — the first time a node's Materi stage is
  // opened. A ref guard keeps this from double-firing under React StrictMode.
  const openGuardRef = useRef(null);
  useEffect(() => {
    if (!node) return;
    const key = nsKey(node.id);
    if (openGuardRef.current === key) return;
    openGuardRef.current = key;
    if (!openedNodeIds.includes(key)) {
      setHearts(h => Math.max(0, h - 1));
      setOpenedNodeIds(prev => [...prev, key]);
      showToast('−1 Life untuk membuka unit ini ❤', 'fa-heart-crack');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);

  if (!node || !unlocked) return null;

  const goToQuiz = () => { playClick(); setStage('quiz'); };

  const answerQuiz = (optionIndex) => {
    if (quizSelected !== null) return;
    setQuizSelected(optionIndex);
    const correct = optionIndex === quizQuestions[quizIndex].correctIndex;
    if (correct) { playSuccess(); setQuizCorrectCount(c => c + 1); } else { playFail(); }
  };

  const nextQuestion = () => {
    playClick();
    setQuizSelected(null);
    setQuizIndex(i => i + 1);
  };

  const handleFinishNode = () => {
    playClick();
    if (isCompleted(node.id)) { navigate('/rina/task'); return; }
    const bonus = quizCorrectCount === quizQuestions.length ? PERFECT_BONUS_XP : 0;
    const xpAmount = NODE_XP + bonus;
    const leveledUp = getExpLevel(exp + xpAmount) > getExpLevel(exp);
    addExp(xpAmount);
    setCompletedNodeIds(prev => [...prev, nsKey(node.id)]);
    setShowConfetti(true);
    showToast(bonus ? `Node selesai! +${xpAmount} XP (skor sempurna 🎯)` : `Node selesai! +${xpAmount} XP`, 'fa-check');
    if (leveledUp) {
      setLevelUpVisible(true);
      setTimeout(() => setLevelUpVisible(false), 2000);
    }
    setTimeout(() => navigate('/rina/task'), leveledUp ? 2300 : 1300);
  };

  const goToTantangan = () => {
    playClick();
    setStage('tantangan');
    showToast('🧊 Streak Freeze aktif otomatis (maks 7 hari) — streak-mu aman selama tantangan ini.', 'fa-snowflake');
  };

  const handleStartTantangan = () => {
    playSuccess();
    // Checkpoint only counts as DONE once a human reviewer approves the
    // submission — that happens on /rina/submit's revision-cycle flow, not here.
    setStreak(s => s + 1);

    if (activeProject && activeProject.status === 'open' && activeProject.skillId === skillId) {
      showToast(`🎉 Ada proyek yang cocok untukmu: ${activeProject.umkm} membutuhkan ${skillMeta.label}!`, 'fa-briefcase');
      setTimeout(() => navigate('/rina/submit'), 1400);
    } else {
      setTimeout(() => navigate('/rina/submit'), 600);
    }
  };

  // Step chips shown under the top bar.
  const steps = [];
  if (nodeIndex > 0) steps.push({ key: 'prev', label: `Node ${skillMap.nodes[nodeIndex - 1].id}`, state: 'done' });
  steps.push({ key: 'materi', label: 'Materi', state: stage === 'materi' ? 'active' : 'done' });
  steps.push({ key: 'quiz', label: 'Quiz', state: stage === 'quiz' ? 'active' : stage === 'tantangan' ? 'done' : 'upcoming' });
  if (isCheckpoint) steps.push({ key: 'tantangan', label: 'Tantangan', state: stage === 'tantangan' ? 'active' : 'upcoming' });

  const heartRow = [...Array(5)].map((_, i) => (
    <i key={i} className={`fa-solid fa-heart text-xs ${i < hearts ? 'text-rose-500' : 'text-white/15'}`}></i>
  ));

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col">
      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between gap-3 px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => navigate('/rina/task')}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span className="hidden sm:inline">Peta Misi</span>
        </button>

        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          {skillMeta.label} · {isCheckpoint ? `Checkpoint — ${node.title}` : `Node ${node.id} — ${node.title}`}
        </h1>

        <div className="flex items-center gap-0.5 bg-rose-500/10 border border-rose-500/20 py-1.5 px-2.5 rounded-full shrink-0">
          {heartRow}
        </div>
      </header>

      {/* Step indicator */}
      <div className="flex items-center justify-center gap-2 py-4 px-4 flex-shrink-0">
        {steps.map((s, i) => (
          <div key={s.key} className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-[11px] font-bold font-inter px-2.5 py-1 rounded-full border ${
              s.state === 'done' ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : s.state === 'active' ? 'bg-purple/15 text-purple border-purple/30'
                : 'bg-white/[0.02] text-white/30 border-white/10'
            }`}>
              {s.state === 'done' ? '✓' : s.state === 'active' ? '●' : '○'} {s.label}
            </span>
            {i < steps.length - 1 && <span className="text-white/15 text-xs">—</span>}
          </div>
        ))}
      </div>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 pb-16">
        {stage === 'materi' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
          >
            <h2 className="text-white font-sora font-bold text-xl">{node.title}</h2>
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-white/70 font-sora mb-1.5">{node.briefLabel}</h4>
              <p className="text-xs text-white/50 leading-relaxed font-inter italic">{node.briefBody}</p>
            </div>
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-6">
              <p className="text-sm text-white/80 font-inter leading-relaxed mb-4">{node.materi.intro}</p>
              <ul className="space-y-2.5">
                {node.materi.points.map((pt, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-white/60 font-inter leading-relaxed">
                    <i className="fa-solid fa-circle text-purple text-[5px] mt-2 flex-shrink-0"></i>
                    {pt}
                  </li>
                ))}
              </ul>
            </div>
            <button onClick={goToQuiz} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
              Lanjut ke Quiz
            </button>
          </motion.div>
        )}

        {stage === 'quiz' && !quizDone && (
          <motion.div
            key={quizIndex}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
          >
            <div>
              <div className="text-purple text-xs font-inter font-semibold mb-2">Soal {quizIndex + 1} dari {quizQuestions.length}</div>
              <div className="h-1 bg-white/5 rounded-full overflow-hidden mb-5">
                <div
                  className="h-full bg-gradient-to-r from-purple to-indigo transition-all duration-500"
                  style={{ width: `${(quizIndex / quizQuestions.length) * 100}%` }}
                ></div>
              </div>
              <p className="text-white font-semibold font-inter text-base leading-relaxed">{quizQuestions[quizIndex].question}</p>
            </div>
            <div className="flex flex-col gap-3">
              {quizQuestions[quizIndex].options.map((opt, i) => {
                const isCorrect = i === quizQuestions[quizIndex].correctIndex;
                const isSelected = i === quizSelected;
                let cls = 'border-white/10 bg-[#1A1A2E] hover:border-purple/40';
                if (quizSelected !== null) {
                  if (isCorrect) cls = 'border-green-500/60 bg-green-500/10';
                  else if (isSelected) cls = 'border-rose-500/60 bg-rose-500/10';
                  else cls = 'border-white/5 bg-white/[0.01] opacity-50';
                }
                return (
                  <button
                    key={i}
                    onClick={() => answerQuiz(i)}
                    disabled={quizSelected !== null}
                    className={`text-left text-sm text-white/80 font-inter p-4 rounded-xl border transition-all cursor-pointer disabled:cursor-default flex items-center justify-between gap-2 ${cls}`}
                  >
                    <span>{opt}</span>
                    {quizSelected !== null && isCorrect && <i className="fa-solid fa-circle-check text-green-400"></i>}
                    {quizSelected !== null && isSelected && !isCorrect && <i className="fa-solid fa-circle-xmark text-rose-400"></i>}
                  </button>
                );
              })}
            </div>
            {quizSelected !== null && quizSelected !== quizQuestions[quizIndex].correctIndex && (
              <div className="bg-rose-500/5 border border-rose-500/20 rounded-xl p-4 text-sm text-rose-200 font-inter leading-relaxed">
                {quizQuestions[quizIndex].explanation}
              </div>
            )}
            {quizSelected !== null && (
              <button onClick={nextQuestion} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
                {quizIndex + 1 < quizQuestions.length ? 'Soal Berikutnya' : 'Lihat Hasil'}
              </button>
            )}
          </motion.div>
        )}

        {stage === 'quiz' && quizDone && (
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ type: 'spring', bounce: 0.4 }}
            className="flex flex-col items-center text-center gap-3 py-14"
          >
            <div className="w-16 h-16 rounded-full bg-purple/15 border border-purple/30 flex items-center justify-center text-2xl text-purple">
              <i className="fa-solid fa-trophy"></i>
            </div>
            <h3 className="text-white font-sora font-bold text-xl">
              {quizCorrectCount === quizQuestions.length ? `${quizCorrectCount} dari ${quizQuestions.length} benar! 🎉` : 'Quiz Selesai!'}
            </h3>
            {quizCorrectCount !== quizQuestions.length && (
              <p className="text-white/50 text-sm font-inter">Skor kamu: <span className="text-white font-bold">{quizCorrectCount}/{quizQuestions.length}</span> benar</p>
            )}
            <p className="text-purple text-sm font-bold font-inter mt-2">
              +{NODE_XP + (quizCorrectCount === quizQuestions.length ? PERFECT_BONUS_XP : 0)} XP
            </p>
            <button
              onClick={isCheckpoint ? goToTantangan : handleFinishNode}
              className="w-full max-w-xs bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0 mt-4"
            >
              {isCheckpoint ? 'Lanjut ke Tantangan' : 'Selesai & Kembali ke Peta'}
            </button>
          </motion.div>
        )}

        {stage === 'tantangan' && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="flex flex-col gap-5"
          >
            <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5">
              <h4 className="text-xs font-bold text-white/70 font-sora mb-2">{node.briefLabel}</h4>
              <ul className="text-sm text-white/50 space-y-2 list-disc pl-4 leading-relaxed font-inter">
                {node.briefBullets.map((b, i) => (
                  <li key={i}><strong className="text-white/70">{b.strong}</strong>{b.rest}</li>
                ))}
              </ul>
            </div>
            <p className="text-sm text-white/60 font-inter leading-relaxed">{node.instruction}</p>
            <div className="flex items-center gap-2 text-sm text-amber-400 font-inter">
              <i className="fa-solid fa-clock"></i>
              <span>{node.deadlineText} untuk menyelesaikan</span>
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <button onClick={handleStartTantangan} className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0">
                Mulai Tantangan
              </button>
              <p className="text-center text-xs text-white/30 font-inter">Tidak kena lives limit · Dinilai human reviewer</p>
            </div>
          </motion.div>
        )}
      </main>

      {/* ── AI MENTOR FLOATING WIDGET ── */}
      <AIMentorWidget node={node} stage={stage} skillLabel={skillMeta.label} />

      {/* ── LEVEL UP OVERLAY ── */}
      <AnimatePresence>
        {levelUpVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0F0F1A]/95 backdrop-blur-md z-[70] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="text-white font-sora font-extrabold text-4xl">LEVEL UP!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONFETTI BURST ── */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[65] flex items-center justify-center">
            {['🎉', '✨', '🎊', '⭐', '💜', '🎉', '✨'].map((emoji, i) => (
              <motion.span
                key={i}
                initial={{ x: 0, y: 0, opacity: 1, scale: 0.6 }}
                animate={{
                  x: Math.cos((i / 7) * Math.PI * 2) * 140,
                  y: Math.sin((i / 7) * Math.PI * 2) * 140 - 40,
                  opacity: 0,
                  scale: 1.1,
                }}
                transition={{ duration: 1.4, ease: 'easeOut' }}
                className="absolute text-2xl"
              >
                {emoji}
              </motion.span>
            ))}
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
