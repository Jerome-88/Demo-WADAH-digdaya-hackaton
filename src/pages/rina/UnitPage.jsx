import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import AIMentorWidget from '../../components/AIMentorWidget';
import useGameAudio from '../../hooks/useGameAudio';
import { showToast } from '../../utils/toast';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta, parseUnitParam, getNodeUnit } from '../../data/skillMaps';
import { pickVariantIndex, resolveCheckpointBrief } from '../../utils/checkpointVariant';

const NODE_XP = 40;
const PERFECT_BONUS_XP = 10;

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';
const RED = '#e5484d';

function stepPillStyle(state) {
  if (state === 'done') return { color: GREEN, borderColor: GREEN };
  if (state === 'active') return { color: ORANGE, borderColor: ORANGE };
  return { color: '#9ca3af', borderColor: '#d1d5db' };
}

export default function UnitPage() {
  const navigate = useNavigate();
  const { unitParam } = useParams();
  const {
    completedNodeIds,
    setStreak, hearts,
    activeProject, checkpointVariantIndex, setCheckpointVariantIndex,
    openUnit, completeUnit, mode,
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
  // Real mode only — feeds Insight Skill's per-concept aggregation. Untagged
  // skills' questions have no concept_tag; the backend just drops those.
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [levelUpVisible, setLevelUpVisible] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [finishingNode, setFinishingNode] = useState(false);

  const isCheckpoint = node?.type === 'checkpoint';

  // Checkpoint's quiz stage is a composed review pulling one question from
  // each of THIS UNIT's regular nodes only — tests cumulative mastery of
  // the unit just finished, not the whole skill map.
  const quizQuestions = useMemo(() => {
    if (!node) return [];
    if (!isCheckpoint) return node.questions;
    const unitNumber = getNodeUnit(node.id);
    return skillMap.nodes
      .filter(n => n.type === 'quiz' && getNodeUnit(n.id) === unitNumber)
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
  // openUnit() itself knows whether this node was already opened before
  // (demo: openedNodeIds; real: the backend's progress row) and only
  // reports livesDeducted=true the first time.
  const openGuardRef = useRef(null);
  useEffect(() => {
    if (!node) return;
    const key = nsKey(node.id);
    if (openGuardRef.current === key) return;
    openGuardRef.current = key;
    (async () => {
      try {
        const { livesDeducted } = await openUnit(skillId, node.id);
        if (livesDeducted) showToast('−1 Life untuk membuka unit ini ❤', 'fa-heart-crack');
      } catch (err) {
        showToast(`Gagal membuka unit: ${err.message}`, 'fa-triangle-exclamation');
        navigate('/rina/task', { replace: true });
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [node?.id]);

  if (!node || !unlocked) return null;

  const goToQuiz = () => { playClick(); setStage('quiz'); };

  const answerQuiz = (optionIndex) => {
    if (quizSelected !== null) return;
    setQuizSelected(optionIndex);
    const correct = optionIndex === quizQuestions[quizIndex].correctIndex;
    setQuizAttempts(prev => [...prev, { concept_tag: quizQuestions[quizIndex].concept_tag ?? null, correct }]);
    if (correct) { playSuccess(); setQuizCorrectCount(c => c + 1); } else { playFail(); }
  };

  const nextQuestion = () => {
    playClick();
    setQuizSelected(null);
    setQuizIndex(i => i + 1);
  };

  const handleFinishNode = async () => {
    // Without this guard, a fast double-click fires two /unit/complete
    // requests before completedNodeIds re-renders — the backend correctly
    // rejects the second with 400, but the user just sees a scary error
    // toast for what was actually a successful completion.
    if (finishingNode) return;
    playClick();
    if (isCompleted(node.id)) { navigate('/rina/task'); return; }
    setFinishingNode(true);
    const quizPerfect = quizCorrectCount === quizQuestions.length;
    try {
      const { xpEarned, leveledUp, alreadyCompleted } = await completeUnit(skillId, node.id, { quizPerfect, quizScore: quizCorrectCount, quizAttempts });
      if (alreadyCompleted) { navigate('/rina/task'); return; }
      setShowConfetti(true);
      showToast(quizPerfect ? `Node selesai! +${xpEarned} XP (skor sempurna 🎯)` : `Node selesai! +${xpEarned} XP`, 'fa-check');
      if (leveledUp) {
        setLevelUpVisible(true);
        setTimeout(() => setLevelUpVisible(false), 2000);
      }
      setTimeout(() => navigate('/rina/task'), leveledUp ? 2300 : 1300);
    } catch (err) {
      showToast(`Gagal menyelesaikan unit: ${err.message}`, 'fa-triangle-exclamation');
      setFinishingNode(false);
    }
  };

  const goToTantangan = () => {
    playClick();
    // Pick this attempt's content variant once, on entry — reused as-is if
    // this checkpoint was already started before (e.g. StrictMode re-run).
    const key = nsKey(node.id);
    if (isCheckpoint && checkpointVariantIndex[key] === undefined) {
      setCheckpointVariantIndex(prev => ({ ...prev, [key]: pickVariantIndex(skillId, node.id) }));
    }
    setStage('tantangan');
    showToast('🧊 Streak Freeze aktif otomatis (maks 7 hari) — streak-mu aman selama tantangan ini.', 'fa-snowflake');
  };

  const handleStartTantangan = () => {
    playSuccess();
    // Checkpoint only counts as DONE once a human reviewer approves the
    // submission — that happens on /rina/submit's revision-cycle flow, not here.
    // Real mode: skip the optimistic bump — neither /unit/open nor the
    // approval trigger touch `streak` for checkpoints, so faking it here
    // would just get silently overwritten on the next server refresh.
    if (mode !== 'real') setStreak(s => s + 1);

    if (activeProject && activeProject.status === 'open' && activeProject.skillId === skillId) {
      showToast(`🎉 Ada proyek yang cocok untukmu: ${activeProject.umkm} membutuhkan ${skillMeta.label}!`, 'fa-briefcase');
      setTimeout(() => navigate(`/rina/submit/${node.id}`), 1400);
    } else {
      setTimeout(() => navigate(`/rina/submit/${node.id}`), 600);
    }
  };

  const brief = isCheckpoint
    ? resolveCheckpointBrief(skillId, node.id, checkpointVariantIndex[nsKey(node.id)] ?? 0, {
        info: node.info, instruction: node.instruction, briefBullets: node.briefBullets, checklist: node.checklist,
      })
    : null;

  // Step chips shown under the top bar.
  const steps = [];
  if (nodeIndex > 0) steps.push({ key: 'prev', label: `Node ${skillMap.nodes[nodeIndex - 1].id}`, state: 'done' });
  steps.push({ key: 'materi', label: 'Materi', state: stage === 'materi' ? 'active' : 'done' });
  steps.push({ key: 'quiz', label: 'Quiz', state: stage === 'quiz' ? 'active' : stage === 'tantangan' ? 'done' : 'upcoming' });
  if (isCheckpoint) steps.push({ key: 'tantangan', label: 'Tantangan', state: stage === 'tantangan' ? 'active' : 'upcoming' });

  const heartRow = [...Array(5)].map((_, i) => (
    <i key={i} className="fa-solid fa-heart text-xs" style={{ color: i < hearts ? '#f43f5e' : '#e5e7eb' }}></i>
  ));

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── TOP BAR ── */}
      <header className="sticky top-0 z-30 h-14 flex items-center justify-between gap-3 px-4 md:px-6 flex-shrink-0" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/rina/task')}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer shrink-0"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span className="hidden sm:inline">Peta Misi</span>
        </button>

        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          {skillMeta.label} - {isCheckpoint ? `Checkpoint - ${node.title}` : `Node ${node.id} - ${node.title}`}
        </h1>

        <div className="flex items-center gap-0.5 bg-white border border-rose-300 py-1.5 px-2.5 rounded-full shrink-0">
          {heartRow}
        </div>
      </header>

      {/* ── MAIN CONTENT ── */}
      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-8">
        <div className="rounded-3xl p-5 sm:p-8" style={{ background: '#f5f8fb' }}>
          {/* Step indicator */}
          <div className="flex items-center justify-center gap-2 flex-wrap mb-6">
            {steps.map(s => (
              <span
                key={s.key}
                className="flex items-center gap-1.5 text-[11px] font-bold font-inter px-3 py-1 rounded-full border-2 bg-white"
                style={stepPillStyle(s.state)}
              >
                • {s.label}
              </span>
            ))}
          </div>

          {stage === 'materi' && (
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col gap-5"
            >
              <h2 className="font-sora font-bold text-xl" style={{ color: BLUE }}>{node.title}</h2>
              <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: BLUE }}>
                <h4 className="text-xs font-bold font-sora mb-1.5" style={{ color: BLUE }}>{node.briefLabel}</h4>
                <p className="text-xs text-gray-500 leading-relaxed font-inter italic">{node.briefBody}</p>
              </div>
              <div className="bg-white border-2 rounded-2xl p-6" style={{ borderColor: BLUE }}>
                <p className="text-sm text-[#1a1a1a] font-inter leading-relaxed mb-4">{node.materi.intro}</p>
                <ul className="space-y-2.5">
                  {node.materi.points.map((pt, i) => (
                    <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600 font-inter leading-relaxed">
                      <i className="fa-solid fa-circle text-[5px] mt-2 flex-shrink-0" style={{ color: ORANGE }}></i>
                      {pt}
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={goToQuiz}
                className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                style={{ background: GREEN }}
              >
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
                <div className="text-xs font-inter font-bold mb-2" style={{ color: ORANGE }}>Soal {quizIndex + 1} dari {quizQuestions.length}</div>
                <div className="h-2 rounded-full overflow-hidden mb-5" style={{ background: '#e1e8f2' }}>
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${(quizIndex / quizQuestions.length) * 100}%`, background: `linear-gradient(90deg, ${GREEN} 0%, ${BLUE} 50%, ${ORANGE} 100%)` }}
                  ></div>
                </div>
                <p className="font-bold font-inter text-base leading-relaxed" style={{ color: BLUE }}>{quizQuestions[quizIndex].question}</p>
              </div>
              <div className="flex flex-col gap-3">
                {quizQuestions[quizIndex].options.map((opt, i) => {
                  const isCorrect = i === quizQuestions[quizIndex].correctIndex;
                  const isSelected = i === quizSelected;
                  let style = { borderColor: BLUE, background: '#fff', color: BLUE };
                  if (quizSelected !== null) {
                    if (isCorrect) style = { borderColor: GREEN, background: '#e3faf0', color: GREEN };
                    else if (isSelected) style = { borderColor: RED, background: '#fdecec', color: RED };
                  }
                  return (
                    <button
                      key={i}
                      onClick={() => answerQuiz(i)}
                      disabled={quizSelected !== null}
                      className="text-left text-sm font-inter font-semibold p-4 rounded-full border-2 transition-all cursor-pointer disabled:cursor-default flex items-center justify-between gap-2"
                      style={style}
                    >
                      <span>{opt}</span>
                      {quizSelected !== null && isCorrect && <i className="fa-solid fa-circle-check" style={{ color: GREEN }}></i>}
                      {quizSelected !== null && isSelected && !isCorrect && <i className="fa-solid fa-circle-xmark" style={{ color: RED }}></i>}
                    </button>
                  );
                })}
              </div>
              {quizSelected !== null && quizSelected !== quizQuestions[quizIndex].correctIndex && (
                <div className="rounded-2xl p-4 text-sm text-white font-inter leading-relaxed" style={{ background: '#6b7280' }}>
                  {quizQuestions[quizIndex].explanation}
                </div>
              )}
              {quizSelected !== null && (
                <button
                  onClick={nextQuestion}
                  className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                  style={{ background: GREEN }}
                >
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
              <div className="w-16 h-16 rounded-full flex items-center justify-center text-2xl" style={{ background: '#e1e8f2', color: ORANGE }}>
                <i className="fa-solid fa-trophy"></i>
              </div>
              <h3 className="font-sora font-bold text-xl" style={{ color: BLUE }}>
                {quizCorrectCount === quizQuestions.length ? `${quizCorrectCount} dari ${quizQuestions.length} benar! 🎉` : 'Quiz Selesai!'}
              </h3>
              {quizCorrectCount !== quizQuestions.length && (
                <p className="text-gray-500 text-sm font-inter">Skor kamu: <span className="font-bold" style={{ color: BLUE }}>{quizCorrectCount}/{quizQuestions.length}</span> benar</p>
              )}
              <p className="text-sm font-bold font-inter mt-2" style={{ color: ORANGE }}>
                +{NODE_XP + (quizCorrectCount === quizQuestions.length ? PERFECT_BONUS_XP : 0)} XP
              </p>
              <button
                onClick={isCheckpoint ? goToTantangan : handleFinishNode}
                disabled={!isCheckpoint && finishingNode}
                className="w-full max-w-xs text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 mt-4 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                style={{ background: GREEN }}
              >
                {isCheckpoint ? 'Lanjut ke Tantangan' : finishingNode ? 'Menyimpan...' : 'Selesai & Kembali ke Peta'}
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
              <div className="bg-white border-2 rounded-2xl p-5" style={{ borderColor: BLUE }}>
                <h4 className="text-xs font-bold font-sora mb-2" style={{ color: BLUE }}>{node.briefLabel}</h4>
                <ul className="text-sm text-gray-500 space-y-2 list-disc pl-4 leading-relaxed font-inter">
                  {brief.briefBullets.map((b, i) => (
                    <li key={i}><strong style={{ color: BLUE }}>{b.strong}</strong>{b.rest}</li>
                  ))}
                </ul>
              </div>
              <p className="text-sm text-gray-600 font-inter leading-relaxed">{brief.instruction}</p>
              <div className="flex items-center gap-2 text-sm font-inter font-semibold" style={{ color: ORANGE }}>
                <i className="fa-solid fa-clock"></i>
                <span>{node.deadlineText} untuk menyelesaikan</span>
              </div>
              <div className="flex flex-col gap-2 mt-2">
                <button
                  onClick={handleStartTantangan}
                  className="mx-auto text-white font-bold py-3.5 px-10 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
                  style={{ background: GREEN }}
                >
                  Mulai Tantangan
                </button>
                <p className="text-center text-xs text-gray-400 font-inter">Tidak kena lives limit · Dinilai human reviewer</p>
              </div>
            </motion.div>
          )}
        </div>
      </main>

      {/* ── AI MENTOR FLOATING WIDGET ── */}
      <AIMentorWidget node={node} stage={stage} skillLabel={skillMeta.label} skillId={skillId} light />

      {/* ── LEVEL UP OVERLAY ── */}
      <AnimatePresence>
        {levelUpVisible && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-white/95 backdrop-blur-md z-[70] flex items-center justify-center"
          >
            <motion.div
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', bounce: 0.5 }}
              className="text-center"
            >
              <div className="text-6xl mb-4">🎉</div>
              <h2 className="font-sora font-extrabold text-4xl" style={{ color: BLUE }}>LEVEL UP!</h2>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── CONFETTI BURST ── */}
      <AnimatePresence>
        {showConfetti && (
          <div className="fixed inset-0 pointer-events-none z-[65] flex items-center justify-center">
            {['🎉', '✨', '🎊', '⭐', '💚', '🎉', '✨'].map((emoji, i) => (
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
