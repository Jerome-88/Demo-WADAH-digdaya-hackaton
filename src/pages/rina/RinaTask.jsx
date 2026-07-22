import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '../../components/TopBar';
import AIMentorWidget from '../../components/AIMentorWidget';
import useGameAudio from '../../hooks/useGameAudio';
import { showToast } from '../../utils/toast';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta, nodeIdToSlug, getNodeUnit, getTotalUnits, getUnitNote } from '../../data/skillMaps';
import { formatRupiah } from '../../data/jasaData';

const ZIGZAG = ['-translate-x-10', 'translate-x-10', '-translate-x-6', 'translate-x-6', 'translate-x-0'];
const UNIT_TABS = [1, 2, 3];

export default function RinaTask() {
  const navigate = useNavigate();
  const { streak, hearts, selectedSkill, completedNodeIds, activeProject } = useApp();
  const { playFail, playClick } = useGameAudio();

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

  // Pair each node with its position in the full flat array (unlock logic
  // needs the global index) before filtering down to the active unit only.
  const visibleNodes = skillMap.nodes
    .map((node, globalIndex) => ({ node, globalIndex }))
    .filter(({ node }) => getNodeUnit(node.id) === activeUnit);

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <TopBar mapTitle={skillMap.mapTitle} streak={streak} hearts={hearts} />

      {/* ── FULL SCREEN MAP ── */}
      <main className="max-w-2xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <p className="text-white/40 text-xs font-inter">{getUnitNote(skillMap, activeUnit)}</p>
        </div>

        {/* Cross-side match banner — same activeProject the UMKM posted via /jasa */}
        {activeProject && activeProject.status === 'open' && activeProject.skillId === skillId && (
          <button
            onClick={() => navigate('/rina/match')}
            className="w-full text-left mb-8 rounded-2xl p-4 flex items-center gap-3 cursor-pointer border-0 transition-all hover:brightness-110"
            style={{ background: 'rgba(5, 150, 105, 0.1)', border: '1px solid #059669' }}
          >
            <span className="text-xl shrink-0">✨</span>
            <div className="flex-1 min-w-0">
              <div className="text-green-400 text-xs font-bold font-inter">Ada proyek yang cocok untukmu!</div>
              <div className="text-white text-sm font-semibold font-inter mt-0.5">{activeProject.umkm} · {activeProject.location}</div>
              <div className="text-white/60 text-xs font-inter mt-0.5">
                membutuhkan {skillMeta.label} · Budget: {formatRupiah(activeProject.budget)} {activeProject.durasi ? `· Durasi: ${activeProject.durasi}` : ''}
              </div>
            </div>
            <span className="text-green-400 text-xs font-bold font-inter shrink-0">Lihat Detail Proyek</span>
          </button>
        )}

        {/* Unit tabs */}
        <div className="grid grid-cols-3 gap-2 bg-white/[0.03] p-1.5 rounded-xl border border-white/5 text-[11px] font-bold mb-12 max-w-sm mx-auto">
          {UNIT_TABS.map(unitNumber => {
            const unlocked = isUnitUnlocked(unitNumber);
            const active = unitNumber === activeUnit;
            const unitDone = unlocked && unitNumber < totalUnits && isCompleted(`checkpoint-${unitNumber}`);
            return (
              <button
                key={unitNumber}
                onClick={() => handleUnitTab(unitNumber)}
                className={`py-2 px-1 rounded-lg text-center flex items-center justify-center gap-1 border-0 ${
                  active ? 'bg-purple text-white cursor-default'
                    : unlocked ? 'text-white/60 hover:text-white bg-transparent cursor-pointer'
                    : 'text-white/30 cursor-not-allowed bg-transparent'
                }`}
              >
                {unitDone && <i className="fa-solid fa-check text-[9px] text-green-400"></i>}
                Unit {unitNumber}
                {!unlocked && <i className="fa-solid fa-lock text-[8px]"></i>}
              </button>
            );
          })}
        </div>

        {/* Zig-zag node column */}
        <div className="relative flex flex-col items-center gap-14">
          <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-0 border-l-4 border-dashed border-white/10 -z-0"></div>

          {visibleNodes.map(({ node, globalIndex }, localIndex) => {
            const done = isCompleted(node.id);
            const unlocked = isUnlocked(globalIndex);
            const isCheckpoint = node.type === 'checkpoint';

            let circleClass = 'bg-[#2D2D3D] text-white/40 opacity-60';
            if (done) circleClass = 'bg-[#059669] text-white shadow-[0_0_0_4px_rgba(5,150,105,0.25)]';
            else if (unlocked) circleClass = isCheckpoint
              ? 'bg-gradient-to-tr from-purple to-indigo text-white shadow-lg'
              : 'bg-purple text-white shadow-lg';

            return (
              <div key={node.id} className={`relative z-10 flex flex-col items-center gap-2 ${ZIGZAG[localIndex] || ''}`}>
                <motion.button
                  onClick={() => handleOpenNode(node, globalIndex)}
                  whileHover={unlocked ? { scale: 1.06 } : {}}
                  whileTap={unlocked ? { scale: 0.95 } : {}}
                  animate={unlocked && !done ? { boxShadow: ['0 0 0 0 rgba(124,58,237,0.4)', '0 0 0 10px rgba(124,58,237,0)'] } : {}}
                  transition={unlocked && !done ? { duration: 1.8, repeat: Infinity } : {}}
                  className={`rounded-full flex items-center justify-center border-0 cursor-pointer ${circleClass} ${isCheckpoint ? 'w-20 h-20 text-2xl' : 'w-16 h-16 text-xl'}`}
                >
                  {done ? <i className="fa-solid fa-check"></i> : !unlocked ? <i className="fa-solid fa-lock text-base"></i> : <i className={`fa-solid ${node.icon}`}></i>}
                </motion.button>
                <span className={`text-[11px] font-inter text-center max-w-[120px] leading-tight ${
                  done ? 'text-green-400 font-bold' : unlocked ? 'text-white font-semibold' : 'text-white/30'
                }`}>
                  {isCheckpoint ? (node.isFinalProject ? 'GERBANG AKHIR 🎓' : `KASTIL CHECKPOINT ${activeUnit}`) : node.title}
                </span>
              </div>
            );
          })}
        </div>
      </main>

      {/* ── AI MENTOR FLOATING WIDGET ── */}
      <AIMentorWidget node={null} stage={null} skillLabel={skillMeta.label} />
    </div>
  );
}
