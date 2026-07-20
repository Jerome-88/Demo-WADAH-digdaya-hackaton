import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import TopBar from '../../components/TopBar';
import AIMentorWidget from '../../components/AIMentorWidget';
import useGameAudio from '../../hooks/useGameAudio';
import { showToast } from '../../utils/toast';
import { useApp } from '../../context/AppContext';
import { SKILL_MAPS, DEFAULT_SKILL, getSkillMeta, nodeIdToSlug } from '../../data/skillMaps';
import { formatRupiah } from '../../data/jasaData';

const ZIGZAG = ['-translate-x-10', 'translate-x-10', '-translate-x-6', 'translate-x-6', 'translate-x-0'];

export default function RinaTask() {
  const navigate = useNavigate();
  const { streak, hearts, selectedSkill, completedNodeIds, activeProject } = useApp();
  const { playFail, playClick } = useGameAudio();

  const skillId = selectedSkill || DEFAULT_SKILL;
  const skillMap = SKILL_MAPS[skillId] || SKILL_MAPS[DEFAULT_SKILL];
  const skillMeta = getSkillMeta(skillId);

  // Namespace completed-node ids by skill so identical node ids ("1.1", etc.)
  // across different skill maps never collide.
  const nsKey = (nodeId) => `${skillId}:${nodeId}`;
  const isCompleted = (nodeId) => completedNodeIds.includes(nsKey(nodeId));

  const isUnlocked = (index) => {
    if (index === 0) return true;
    return isCompleted(skillMap.nodes[index - 1].id);
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

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <TopBar mapTitle={skillMap.mapTitle} streak={streak} hearts={hearts} />

      {/* ── FULL SCREEN MAP ── */}
      <main className="max-w-2xl mx-auto px-4 py-10 md:py-14">
        <div className="text-center mb-8">
          <p className="text-white/40 text-xs font-inter">{skillMap.unitNote}</p>
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
          <button className="py-2 px-1 rounded-lg text-center bg-purple text-white border-0 cursor-default">Unit 1</button>
          <button
            onClick={() => showToast('Unit 2 Terkunci! Selesaikan Checkpoint Unit 1 terlebih dahulu.', 'fa-lock')}
            className="py-2 px-1 rounded-lg text-center text-white/30 cursor-not-allowed flex items-center justify-center gap-1 border-0 bg-transparent"
          >
            Unit 2 <i className="fa-solid fa-lock text-[8px]"></i>
          </button>
          <button
            onClick={() => showToast('Unit 3 Terkunci! Selesaikan Checkpoint Unit 2 terlebih dahulu.', 'fa-lock')}
            className="py-2 px-1 rounded-lg text-center text-white/30 cursor-not-allowed flex items-center justify-center gap-1 border-0 bg-transparent"
          >
            Unit 3 <i className="fa-solid fa-lock text-[8px]"></i>
          </button>
        </div>

        {/* Zig-zag node column */}
        <div className="relative flex flex-col items-center gap-14">
          <div className="absolute top-2 bottom-2 left-1/2 -translate-x-1/2 w-0 border-l-4 border-dashed border-white/10 -z-0"></div>

          {skillMap.nodes.map((node, index) => {
            const done = isCompleted(node.id);
            const unlocked = isUnlocked(index);
            const isCheckpoint = node.type === 'checkpoint';

            let circleClass = 'bg-[#2D2D3D] text-white/40 opacity-60';
            if (done) circleClass = 'bg-[#059669] text-white shadow-[0_0_0_4px_rgba(5,150,105,0.25)]';
            else if (unlocked) circleClass = isCheckpoint
              ? 'bg-gradient-to-tr from-purple to-indigo text-white shadow-lg'
              : 'bg-purple text-white shadow-lg';

            return (
              <div key={node.id} className={`relative z-10 flex flex-col items-center gap-2 ${ZIGZAG[index] || ''}`}>
                <motion.button
                  onClick={() => handleOpenNode(node, index)}
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
                  {isCheckpoint ? `KASTIL CHECKPOINT 1` : node.title}
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
