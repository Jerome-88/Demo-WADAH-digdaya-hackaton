import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { showToast } from '../utils/toast';

// Small count-up so XP gains feel like they landed, not just snapped to a new number.
function useCountUp(value, duration = 600) {
  const [display, setDisplay] = useState(value);
  const fromRef = useRef(value);

  useEffect(() => {
    const from = fromRef.current;
    const to = value;
    if (from === to) return;
    const start = performance.now();
    let raf;
    const tick = (now) => {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(from + (to - from) * eased));
      if (t < 1) raf = requestAnimationFrame(tick);
      else fromRef.current = to;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);

  return display;
}

export default function TopBar({ mapTitle, streak, hearts, light = false }) {
  const navigate = useNavigate();
  const { level, exp, mode, realUserName, selectedSkill, activeProject, projectAccepted } = useApp();
  const displayExp = useCountUp(exp);
  const isReal = mode === 'real';
  const displayName = isReal ? realUserName || 'Talent' : 'Rina Kusumawati';
  // Unseen match badge — same condition RinaTask's own inline banner uses
  // for "Ada proyek yang cocok untukmu!". Once accepted, projectAccepted
  // flips true and the dot goes away even though activeProject.status stays
  // 'open' (there's no separate "matched" project-list to clear it from).
  const hasUnseenMatch = activeProject?.status === 'open' && activeProject.skillId === selectedSkill && !projectAccepted;
  // Locked until a project actually exists (RinaTask's own effect flips
  // status to 'open' a few seconds after landing on the Skill Map) — stays
  // unlocked from then on even if it's a skill mismatch, so SmartMatchPage's
  // own diagnostic message is still reachable.
  const matchLocked = activeProject?.status !== 'open';

  function handleMatchClick() {
    if (matchLocked) {
      showToast('Dashboard Proyek masih terkunci — nunggu ada proyek yang cocok dulu', 'fa-lock');
      return;
    }
    navigate('/rina/match');
  }

  return (
    <header
      className={`sticky top-0 z-40 h-14 flex items-center justify-between gap-3 px-4 md:px-6 backdrop-blur flex-shrink-0 ${
        light ? 'bg-[#2b6fff]' : 'bg-[#1A1A2E]/95 border-b border-white/5'
      }`}
    >
      {/* Left: home + avatar/name/level -> /rina/profile */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate('/')}
          title="Kembali ke Beranda"
          className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-transparent border-0 cursor-pointer ${
            light ? 'text-white/70 hover:text-white hover:bg-white/15' : 'text-white/50 hover:text-white hover:bg-white/10'
          }`}
        >
          <i className="fa-solid fa-house text-sm"></i>
        </button>
        <button
          onClick={handleMatchClick}
          title={matchLocked ? 'Dashboard Proyek (terkunci)' : 'Dashboard Proyek'}
          className={`relative w-8 h-8 rounded-full flex items-center justify-center transition-colors bg-transparent border-0 cursor-pointer ${
            matchLocked
              ? (light ? 'text-white/40 hover:text-white/60' : 'text-white/25 hover:text-white/40')
              : (light ? 'text-white/70 hover:text-white hover:bg-white/15' : 'text-white/50 hover:text-white hover:bg-white/10')
          }`}
        >
          <i className={`fa-solid ${matchLocked ? 'fa-lock text-xs' : 'fa-briefcase text-sm'}`}></i>
          {hasUnseenMatch && (
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 animate-pulse-dot" />
          )}
        </button>
        <button
          onClick={() => navigate('/rina/profile')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
        >
          {isReal ? (
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-sora shrink-0 border ${light ? 'border-white/40' : 'border-white/10'}`}
              style={{ background: '#f37219', color: '#fff' }}
            >
              {displayName.charAt(0).toUpperCase()}
            </div>
          ) : (
            <img src="/rina.jpg" className={`w-8 h-8 rounded-full object-cover border ${light ? 'border-white/40' : 'border-white/10'}`} alt="Rina" />
          )}
          <div className="text-left hidden sm:block leading-none">
            <div className="text-white text-xs font-semibold font-inter">{displayName}</div>
            <div className={`text-[10px] font-inter mt-1 ${light ? 'text-white/70' : 'text-white/50'}`}>Level {level}</div>
          </div>
        </button>
      </div>

      {/* Center: skill map title */}
      <h1 className="text-white text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 hidden md:block max-w-[40%] text-center">
        {mapTitle}
      </h1>

      {/* Right: streak / xp / lives pills */}
      <div className="flex items-center gap-2 text-[11px] font-inter shrink-0">
        <motion.div
          key={`streak-${streak}`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 0.4 }}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full font-bold ${
            light ? 'bg-white text-[#f37219] border border-[#f37219]' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
          }`}
        >
          <motion.i
            animate={{ scale: [1, 1.18, 0.92, 1.1, 1], rotate: [0, -4, 3, -2, 0] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
            className={`fa-solid fa-fire ${light ? 'text-[#f37219]' : 'text-amber-500'}`}
          ></motion.i>
          <span>{streak} Hari</span>
        </motion.div>

        <motion.div
          key={`xp-${exp}`}
          initial={{ scale: 1 }}
          animate={{ scale: [1, 1.25, 1] }}
          transition={{ duration: 0.4 }}
          className={`flex items-center gap-1.5 py-1 px-2.5 rounded-full font-bold ${
            light ? 'bg-white text-[#00c897] border border-[#00c897]' : 'bg-purple/10 text-purple border border-purple/20'
          }`}
        >
          <motion.i
            animate={{ opacity: [1, 0.5, 1], scale: [1, 1.2, 1] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
            className={`fa-solid fa-bolt ${light ? 'text-[#00c897]' : 'text-purple'}`}
          ></motion.i>
          <span>Lv.{level} · {displayExp} XP</span>
        </motion.div>

        <div className={`flex items-center gap-0.5 py-1.5 px-2.5 rounded-full ${
          light ? 'bg-white border border-rose-400' : 'bg-rose-500/10 border border-rose-500/20'
        }`}>
          {[...Array(5)].map((_, i) => {
            const active = i < hearts;
            const justLost = i === hearts;
            return (
              <motion.i
                key={`${i}-${hearts}`}
                initial={justLost ? { x: 0 } : false}
                animate={
                  justLost ? { x: [0, -3, 3, -3, 0] }
                    : active ? { scale: [1, 1.18, 1] }
                    : {}
                }
                transition={
                  justLost ? { duration: 0.35 }
                    : active ? { duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: i * 0.12 }
                    : {}
                }
                className={`fa-solid fa-heart text-[10px] ${active ? 'text-rose-500' : light ? 'text-gray-200' : 'text-white/15'}`}
              ></motion.i>
            );
          })}
        </div>
      </div>
    </header>
  );
}
