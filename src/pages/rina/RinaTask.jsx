import { useState, useRef, useMemo, useEffect, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import TopBar from '../../components/TopBar';
import AIMentorWidget from '../../components/AIMentorWidget';
import useGameAudio from '../../hooks/useGameAudio';
import { showToast } from '../../utils/toast';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta, nodeIdToSlug, getNodeUnit, getTotalUnits, getUnitNote } from '../../data/skillMaps';
import { formatRupiah } from '../../data/jasaData';

const UNIT_TABS = [1, 2, 3];

const WADY_QUOTES = [
  'Semangat! Satu langkah lagi kamu makin jago! 💪',
  'Kamu udah lebih baik dari kemarin, terus ya! 🌟',
  'Konsisten itu kunci! Aku percaya kamu bisa! 🔥',
  'Jangan nyerah, portofoliomu makin keren nih! 🚀',
  'Yuk lanjut! Klien impianmu nunggu di ujung jalan! 🎯',
];

export default function RinaTask() {
  const navigate = useNavigate();
  const { streak, hearts, selectedSkill, completedNodeIds, setCompletedNodeIds, activeProject, setActiveProject, certificateEarnedAt } = useApp();
  const { playFail, playClick } = useGameAudio();

  // Wady's speech bubble rotates through motivational quotes; stays visible
  // until the user dismisses it.
  const [wadyQuoteIndex, setWadyQuoteIndex] = useState(0);
  const [wadyBubbleClosed, setWadyBubbleClosed] = useState(false);
  useEffect(() => {
    const id = setInterval(() => {
      setWadyQuoteIndex(i => (i + 1) % WADY_QUOTES.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  const skillId = selectedSkill || DEFAULT_SKILL;
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const skillMeta = getSkillMeta(skillId);
  const totalUnits = getTotalUnits(skillMap);

  // Namespace completed-node ids by skill so identical node ids ("1.1", etc.)
  // across different skill maps never collide.
  const nsKey = (nodeId) => `${skillId}:${nodeId}`;
  const isCompleted = (nodeId) => completedNodeIds.includes(nsKey(nodeId));

  // Resume on whichever unit is currently in progress (first one whose
  // checkpoint isn't done yet) instead of always resetting to Unit 1 — this
  // page remounts fresh every time a node finishes and navigates back here.
  const [activeUnit, setActiveUnit] = useState(() => {
    for (let u = 1; u <= totalUnits; u++) {
      if (!isCompleted(`checkpoint-${u}`)) return u;
    }
    return totalUnits;
  });

  const isUnlocked = (index) => {
    if (index === 0) return true;
    return isCompleted(skillMap.nodes[index - 1].id);
  };

  // The paid certification exam only shows up as a menu once the skill map's
  // final checkpoint is actually done — not before, and not baked into that
  // checkpoint's own submission flow.
  const finalCheckpoint = skillMap.nodes.find(n => n.type === 'checkpoint' && n.isFinalProject);
  const finalCheckpointDone = finalCheckpoint && isCompleted(finalCheckpoint.id);
  const isCertified = !!certificateEarnedAt[skillId];

  // Auto-fires a "match notification" once the final checkpoint is actually
  // done — mirrors the "Smart Matching Terbuka" unlock below (prove
  // yourself through the whole skill map first), instead of requiring a
  // presenter to separately walk through /jasa and line up its skillId with
  // whatever skill this talent happens to have (that cross-flow dependency,
  // two independent skill pickers sharing one session, was too easy to get
  // out of sync). Guarded on activeProject.status === null so it only ever
  // fires once, and never overwrites a project a presenter deliberately
  // posted for real via /jasa.
  useEffect(() => {
    if (!selectedSkill || !finalCheckpointDone || activeProject?.status !== null) return;
    const t = setTimeout(() => {
      setActiveProject({
        id: `${selectedSkill}-toko-sepatu-aneka`,
        umkm: 'Toko Sepatu Aneka',
        location: 'Bandung',
        skillId: selectedSkill,
        skill: skillMeta.label,
        budget: 500000,
        budgetNegotiated: null,
        durasi: '2 Minggu',
        desc: `Butuh talenta ${skillMeta.label} buat bantu ${skillMeta.tagline.toLowerCase()} di toko kami.`,
        status: 'open',
      });
      showToast('✨ Ada proyek yang cocok masuk!', 'fa-briefcase');
    }, 2000);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedSkill, finalCheckpointDone]);

  // A unit tab unlocks once the previous unit's checkpoint is approved.
  // Units beyond what's been authored for this skill (totalUnits) stay
  // permanently locked as "segera hadir".
  const isUnitUnlocked = (unitNumber) => {
    if (unitNumber === 1) return true;
    if (unitNumber > totalUnits) return false;
    return isCompleted(`checkpoint-${unitNumber - 1}`);
  };

  const handleUnitTab = (unitNumber) => {
    if (unitNumber === activeUnit) return;
    if (!isUnitUnlocked(unitNumber)) {
      playFail();
      const reason = unitNumber > totalUnits
        ? 'Segera hadir!'
        : `Selesaikan Checkpoint Unit ${unitNumber - 1} terlebih dahulu.`;
      showToast(`Unit ${unitNumber} Terkunci! ${reason}`, 'fa-lock');
      return;
    }
    playClick();
    setActiveUnit(unitNumber);
  };

  const handleOpenNode = (node, index) => {
    if (!isUnlocked(index)) {
      playFail();
      showToast('Selesaikan node sebelumnya dulu', 'fa-lock');
      return;
    }
    playClick();
    navigate(`/unit/${skillId}-${nodeIdToSlug(node.id)}`);
  };

  // Demo shortcut: skip straight to the last checkpoint (everything else —
  // all regular nodes plus every earlier checkpoint — marked done), leaving
  // the final checkpoint itself for a manual walkthrough instead of also
  // auto-completing it and jumping straight to the certification gate. Stays
  // on the map (activeUnit's own init logic already lands on Unit 3, the
  // first with an incomplete checkpoint).
  const handleSkipToCertification = () => {
    const allIds = skillMap.nodes
      .filter(n => n.id !== finalCheckpoint?.id)
      .map(n => nsKey(n.id));
    setCompletedNodeIds(prev => Array.from(new Set([...prev, ...allIds])));
    // activeUnit only computes its initial value once on mount — nudge it to
    // the final checkpoint's unit now, since completedNodeIds changing alone
    // won't re-trigger that lazy initializer.
    if (finalCheckpoint) setActiveUnit(getNodeUnit(finalCheckpoint.id));
  };

  // Pair each node with its position in the full flat array (unlock logic
  // needs the global index) before filtering down to the active unit only.
  const visibleNodes = useMemo(
    () => skillMap.nodes
      .map((node, globalIndex) => ({ node, globalIndex }))
      .filter(({ node }) => getNodeUnit(node.id) === activeUnit),
    [skillMap, activeUnit]
  );

  // Measure each node's rendered center so the connector line can be drawn
  // as an SVG polyline that follows the zig-zag exactly, instead of guessing
  // pixel offsets that would drift across screen sizes.
  const mapColumnRef = useRef(null);
  const nodeRefs = useRef({});
  const [pathPoints, setPathPoints] = useState([]);
  const [svgSize, setSvgSize] = useState({ width: 0, height: 0 });

  useLayoutEffect(() => {
    const measure = () => {
      const container = mapColumnRef.current;
      if (!container) return;
      const containerRect = container.getBoundingClientRect();
      const points = visibleNodes
        .map(({ node }) => nodeRefs.current[node.id])
        .filter(Boolean)
        .map(el => {
          const r = el.getBoundingClientRect();
          return { x: r.left + r.width / 2 - containerRect.left, y: r.top + r.height / 2 - containerRect.top };
        });
      setPathPoints(points);
      setSvgSize({ width: containerRect.width, height: containerRect.height });
    };
    measure();
    const settleTimer = setTimeout(measure, 150);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(settleTimer);
      window.removeEventListener('resize', measure);
    };
  }, [visibleNodes]);

  return (
    <div className="min-h-screen bg-white">
      <TopBar mapTitle={skillMap.mapTitle} streak={streak} hearts={hearts} light />

      {/* ── FULL SCREEN MAP ── */}
      <main className="w-[85vw] max-w-[900px] mx-auto px-2 sm:px-3 py-10 md:py-14">
        <div className="text-center mb-8">
          <p className="text-sm font-inter font-medium" style={{ color: '#00c897' }}>{getUnitNote(skillMap, activeUnit)}</p>
        </div>

        {/* Cross-side match banner — same activeProject the UMKM posted via /jasa */}
        {activeProject && activeProject.status === 'open' && activeProject.skillId === skillId && (
          <button
            onClick={() => navigate('/rina/match')}
            className="w-full text-left mb-8 rounded-2xl p-4 flex items-center gap-3 cursor-pointer border-0 transition-all hover:brightness-105"
            style={{ background: 'rgba(0,200,151,0.08)', border: '1px solid #00c897' }}
          >
            <span className="text-xl shrink-0">✨</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold font-inter" style={{ color: '#00c897' }}>Ada proyek yang cocok untukmu!</div>
              <div className="text-[#1a1a1a] text-sm font-semibold font-inter mt-0.5">{activeProject.umkm} · {activeProject.location}</div>
              <div className="text-gray-500 text-xs font-inter mt-0.5">
                membutuhkan {skillMeta.label} · Budget: {formatRupiah(activeProject.budget)} {activeProject.durasi ? `· Durasi: ${activeProject.durasi}` : ''}
              </div>
            </div>
            <span className="text-xs font-bold font-inter shrink-0" style={{ color: '#00c897' }}>Lihat Detail Proyek</span>
          </button>
        )}

        {/* Unit tabs */}
        <div className="grid grid-cols-3 gap-2 p-1.5 rounded-xl text-[11px] font-bold mb-12 max-w-sm mx-auto" style={{ background: '#e1e8f2' }}>
          {UNIT_TABS.map(unitNumber => {
            const unlocked = isUnitUnlocked(unitNumber);
            const active = unitNumber === activeUnit;
            const unitDone = unlocked && unitNumber < totalUnits && isCompleted(`checkpoint-${unitNumber}`);
            return (
              <button
                key={unitNumber}
                onClick={() => handleUnitTab(unitNumber)}
                className={`py-2 px-1 rounded-lg text-center flex items-center justify-center gap-1 border-0 ${
                  active ? 'text-white cursor-default'
                    : unlocked ? 'text-gray-500 hover:text-[#1a1a1a] bg-transparent cursor-pointer'
                    : 'text-gray-300 cursor-not-allowed bg-transparent'
                }`}
                style={active ? { background: '#f37219' } : undefined}
              >
                {unitDone && <i className="fa-solid fa-check text-[9px]" style={{ color: '#00c897' }}></i>}
                Unit {unitNumber}
                {!unlocked && <i className="fa-solid fa-lock text-[8px]"></i>}
              </button>
            );
          })}
        </div>

        {/* Map card */}
        <div className="relative rounded-3xl p-4 sm:p-6 overflow-hidden" style={{ background: '#f5f8fb' }}>
          {/* Zig-zag node column */}
          <div ref={mapColumnRef} className="relative flex flex-col gap-14">
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${svgSize.width} ${svgSize.height}`}
              preserveAspectRatio="none"
            >
              {pathPoints.length > 1 && (
                <polyline
                  points={pathPoints.map(p => `${p.x},${p.y}`).join(' ')}
                  fill="none"
                  stroke="#c7d2e0"
                  strokeWidth="4"
                  strokeDasharray="10 8"
                  strokeLinecap="round"
                />
              )}
            </svg>

            {visibleNodes.map(({ node, globalIndex }, localIndex) => {
              const done = isCompleted(node.id);
              const unlocked = isUnlocked(globalIndex);
              const isCheckpoint = node.type === 'checkpoint';
              // The checkpoint is always last in a unit — pin it to the right so it
              // never lands on top of the decorative mascot parked bottom-left.
              const alignRight = isCheckpoint ? true : localIndex % 2 === 1;

              let circleStyle = { background: '#e1e8f2', color: '#a8b3c4' };
              if (done) {
                circleStyle = isCheckpoint
                  ? { background: '#00c897', color: '#fff', boxShadow: '0 0 0 5px rgba(255,183,3,0.35)' }
                  : { background: '#00c897', color: '#fff', boxShadow: '0 0 0 4px rgba(0,200,151,0.2)' };
              } else if (unlocked) {
                circleStyle = isCheckpoint
                  ? { background: 'linear-gradient(135deg, #2b6fff, #00c897)', color: '#fff', boxShadow: '0 0 0 5px rgba(255,183,3,0.25)' }
                  : { background: '#f37219', color: '#fff' };
              }

              return (
                <motion.div
                  key={node.id}
                  ref={el => { nodeRefs.current[node.id] = el; }}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: localIndex * 0.1, duration: 0.4, ease: 'easeOut' }}
                  className={`group relative z-10 flex flex-col items-center gap-2 w-32 ${alignRight ? 'self-end mr-0 sm:mr-2' : 'self-start ml-0 sm:ml-2'}`}
                >
                  {isCheckpoint && (
                    <span
                      className="text-[10px] font-extrabold tracking-wider px-2.5 py-1 rounded-full mb-1"
                      style={{ background: '#f37219', color: '#fff' }}
                    >
                      CHECKPOINT
                    </span>
                  )}
                  {isCheckpoint && node.isFinalProject && (
                    <span className="absolute -top-3 text-xl">👑</span>
                  )}
                  <motion.button
                    onClick={() => handleOpenNode(node, globalIndex)}
                    whileHover={unlocked ? { scale: 1.06 } : {}}
                    whileTap={unlocked ? { scale: 0.95 } : {}}
                    animate={unlocked && !done ? { boxShadow: ['0 0 0 0 rgba(243,114,25,0.45)', '0 0 16px 10px rgba(243,114,25,0)'] } : {}}
                    transition={unlocked && !done ? { duration: 2.6, repeat: Infinity, ease: 'easeInOut' } : {}}
                    className={`rounded-full flex items-center justify-center border-0 cursor-pointer shadow-lg ${isCheckpoint ? 'w-24 h-24 text-3xl' : 'w-16 h-16 text-xl'}`}
                    style={circleStyle}
                  >
                    {done ? <i className="fa-solid fa-check"></i> : !unlocked ? <i className="fa-solid fa-lock text-base"></i> : <i className={`fa-solid ${node.icon}`}></i>}
                  </motion.button>

                  {!unlocked && (
                    <div
                      className="absolute -top-9 left-1/2 -translate-x-1/2 whitespace-nowrap px-3 py-1.5 rounded-lg text-[11px] font-inter font-semibold text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-20"
                      style={{ background: '#1a1a2e' }}
                    >
                      Selesaikan unit sebelumnya
                      <span className="absolute top-full left-1/2 -translate-x-1/2 w-2 h-2 -mt-1 rotate-45" style={{ background: '#1a1a2e' }} />
                    </div>
                  )}

                  <span className="text-[11px] font-inter text-center max-w-[120px] leading-tight font-semibold" style={{
                    color: done ? '#00c897' : unlocked ? '#1a1a1a' : '#a8b3c4',
                  }}>
                    {isCheckpoint ? (node.isFinalProject ? 'GERBANG AKHIR 🎓' : `KASTIL CHECKPOINT ${activeUnit}`) : node.title}
                  </span>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ── DEMO SHORTCUT — skip to right before the final checkpoint, leaving
             it for a manual walkthrough instead of also auto-completing it ── */}
        {!finalCheckpointDone && (
          <div className="mt-8 rounded-xl p-4 border-2 flex flex-col sm:flex-row items-center justify-between gap-3" style={{ background: '#fff', borderColor: '#e5e9f0' }}>
            <div className="text-center sm:text-left">
              <div className="text-gray-400 text-[11px] font-inter font-bold uppercase tracking-wide mb-1">Demo Mode</div>
              <p className="text-gray-500 text-xs font-inter">Selesaikan semua unit sampai sebelum checkpoint terakhir, biar kamu bisa coba checkpoint terakhirnya sendiri.</p>
            </div>
            <button
              onClick={handleSkipToCertification}
              className="shrink-0 text-white font-bold py-2.5 px-5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
              style={{ background: '#f37219' }}
            >
              Selesaikan Sampai Checkpoint Terakhir
            </button>
          </div>
        )}

        {/* ── SMART MATCHING UNLOCK — persistent entry point once the final checkpoint is done ── */}
        {finalCheckpointDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl p-5 sm:p-6 border-2 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: '#00c897', background: 'rgba(0,200,151,0.06)' }}
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white text-xl">🎯</div>
              <div>
                <div className="font-sora font-bold text-sm" style={{ color: '#00c897' }}>Smart Matching Terbuka</div>
                <div className="text-gray-500 text-xs font-inter">
                  Profil {skillMeta.label}-mu sekarang bisa di-match otomatis dengan proyek UMKM yang cocok.
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate('/rina/match')}
              className="shrink-0 text-white font-bold py-2.5 px-6 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
              style={{ background: '#00c897' }}
            >
              Lihat Smart Matching
            </button>
          </motion.div>
        )}

        {/* ── SERTIFIKASI MENU — only shows up once the final checkpoint is done ── */}
        {finalCheckpointDone && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-8 rounded-2xl p-5 sm:p-6 border-2 flex flex-col sm:flex-row items-center justify-between gap-4"
            style={{ borderColor: '#2b6fff', background: '#eef2fe' }}
          >
            <div className="flex items-center gap-3 text-center sm:text-left">
              <div className="w-12 h-12 rounded-full flex items-center justify-center shrink-0 bg-white">
                <i className="fa-solid fa-graduation-cap text-xl" style={{ color: '#2b6fff' }}></i>
              </div>
              <div>
                <div className="font-sora font-bold text-sm" style={{ color: '#2b6fff' }}>
                  {isCertified ? 'Kamu Sudah Certified!' : 'Ujian Sertifikasi Tersedia'}
                </div>
                <div className="text-gray-500 text-xs font-inter">
                  {isCertified
                    ? `Sertifikat Kompetensi ${skillMeta.label} sudah kamu miliki.`
                    : 'Kamu sudah menyelesaikan semua unit — saatnya ambil sertifikasi resmi.'}
                </div>
              </div>
            </div>
            <button
              onClick={() => navigate(isCertified ? `/rina/sertifikat/${skillId}` : `/rina/sertifikasi/${skillId}`)}
              className="shrink-0 text-white font-bold py-2.5 px-6 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
              style={{ background: '#2b6fff' }}
            >
              {isCertified ? 'Lihat Sertifikat' : 'Ambil Ujian Sertifikasi'}
            </button>
          </motion.div>
        )}
      </main>

      {/* ── WADY SPEECH BUBBLE (sits above the AI Mentor trigger, bottom-right) ── */}
      <AnimatePresence>
        {!wadyBubbleClosed && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1, y: [0, -8, 0] }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              opacity: { duration: 0.3, ease: 'easeOut' },
              scale: { duration: 0.3, ease: 'easeOut' },
              y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
            }}
            className="hidden sm:block fixed bottom-36 right-4 z-40 w-64 bg-white rounded-2xl px-4 py-3 pr-7 shadow-lg border-2 text-center"
            style={{ borderColor: '#2b6fff' }}
          >
            <button
              onClick={() => setWadyBubbleClosed(true)}
              className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full flex items-center justify-center text-gray-400 hover:text-white hover:bg-[#2b6fff] transition-colors border-0 bg-transparent cursor-pointer"
              title="Tutup"
            >
              <i className="fa-solid fa-xmark text-[10px]"></i>
            </button>
            <div className="min-h-[2.5em] flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.p
                  key={wadyQuoteIndex}
                  className="font-inter font-semibold text-sm text-[#1a1a1a]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {WADY_QUOTES[wadyQuoteIndex]}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-b-2 border-r-2 rotate-45" style={{ borderColor: '#2b6fff' }} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── AI MENTOR FLOATING WIDGET (trigger shows Wady, bottom-right) ── */}
      <AIMentorWidget node={null} stage={null} skillLabel={skillMeta.label} light />
    </div>
  );
}
