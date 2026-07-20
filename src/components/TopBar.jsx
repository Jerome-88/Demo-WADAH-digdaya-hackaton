import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useApp } from '../context/AppContext';

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

export default function TopBar({ mapTitle, streak, hearts }) {
  const navigate = useNavigate();
  const { level, exp } = useApp();
  const displayExp = useCountUp(exp);

  return (
    <header className="sticky top-0 z-40 h-14 flex items-center justify-between gap-3 px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5 flex-shrink-0">
      {/* Left: home + avatar/name/level -> /rina/profile */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => navigate('/')}
          title="Kembali ke Beranda"
          className="w-8 h-8 rounded-full flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-house text-sm"></i>
        </button>
        <button
          onClick={() => navigate('/rina/profile')}
          className="flex items-center gap-2.5 hover:opacity-80 transition-opacity bg-transparent border-0 cursor-pointer"
        >
          <img src="/rina.jpg" className="w-8 h-8 rounded-full object-cover border border-white/10" alt="Rina" />
          <div className="text-left hidden sm:block leading-none">
            <div className="text-white text-xs font-semibold font-inter">Rina Kusumawati</div>
            <div className="text-white/50 text-[10px] font-inter mt-1">Level {level}</div>
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
          className="flex items-center gap-1.5 bg-amber-500/10 text-amber-400 border border-amber-500/20 py-1 px-2.5 rounded-full font-bold"
        >
          <i className="fa-solid fa-fire text-amber-500"></i>
          <span>{streak} Hari</span>
        </motion.div>

        <div className="flex items-center gap-1.5 bg-purple/10 text-purple border border-purple/20 py-1 px-2.5 rounded-full font-bold">
          <i className="fa-solid fa-bolt text-purple"></i>
          <span>Lv.{level} · {displayExp} XP</span>
        </div>

        <div className="flex items-center gap-0.5 bg-rose-500/10 border border-rose-500/20 py-1.5 px-2.5 rounded-full">
          {[...Array(5)].map((_, i) => {
            const active = i < hearts;
            const justLost = i === hearts;
            return (
              <motion.i
                key={`${i}-${hearts}`}
                initial={justLost ? { x: 0 } : false}
                animate={justLost ? { x: [0, -3, 3, -3, 0] } : {}}
                transition={{ duration: 0.35 }}
                className={`fa-solid fa-heart text-[10px] ${active ? 'text-rose-500' : 'text-white/15'}`}
              ></motion.i>
            );
          })}
        </div>
      </div>
    </header>
  );
}
