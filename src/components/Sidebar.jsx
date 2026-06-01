import { useNavigate } from 'react-router-dom';
import { LayoutDashboard, ClipboardList, FolderOpen, LogOut, Zap } from 'lucide-react';
import { useApp, XP_PER_LEVEL } from '../context/AppContext';

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, path: '/rina/dashboard' },
  { key: 'task',      label: 'Tugas Aktif', icon: ClipboardList,  path: '/rina/task' },
  { key: 'portfolio', label: 'Portofolio',  icon: FolderOpen,     path: '/rina/portfolio' },
];

export default function Sidebar({ activePage }) {
  const navigate = useNavigate();
  const { level, levelName, xpInLevel, xpToNextLevel } = useApp();

  const xpProgressPct = Math.round((xpInLevel / XP_PER_LEVEL) * 100);

  return (
    <aside
      className="fixed top-16 left-0 h-screen w-60 flex flex-col z-30"
      style={{ background: '#1E1B4B' }}
    >
      {/* Avatar + Level */}
      <div className="px-5 py-5 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-full bg-gradient-to-br from-indigo to-purple flex items-center justify-center shadow-lg overflow-hidden">
            <img src="/rina.jpg" className="w-11 h-11 rounded-full object-cover" />
          </div>
          <div>
            <div className="text-white font-semibold text-sm font-inter">Rina Kusumawati</div>
            <div className="text-white/50 text-xs font-inter mt-0.5">Level {level} · {levelName}</div>
          </div>
        </div>

        {/* XP Bar */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <div className="flex items-center gap-1 text-white/60 font-inter">
              <Zap size={11} className="text-indigo-light" />
              <span>Level {level}</span>
            </div>
            <span className="text-white/80 font-semibold font-inter">{xpInLevel} / {XP_PER_LEVEL} XP</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-light to-purple transition-all duration-700"
              style={{ width: `${xpProgressPct}%` }}
            />
          </div>
          <div className="text-white/40 text-[10px] font-inter mt-1">{xpToNextLevel} XP lagi ke Level {level + 1}</div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ key, label, icon: Icon, path }) => {
          const active = activePage === key;
          return (
            <button
              key={key}
              onClick={() => navigate(path)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium font-inter transition-all ${
                active
                  ? 'bg-white/15 text-white'
                  : 'text-white/60 hover:bg-white/8 hover:text-white/90'
              }`}
            >
              <Icon size={17} className={active ? 'text-indigo-light' : ''} />
              {label}
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-light" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Back to home */}
      <div className="px-3 pb-6">
        <button
          onClick={() => navigate('/')}
          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-lg text-white/50 hover:text-white/80 hover:bg-white/8 text-sm font-inter transition-all"
        >
          <LogOut size={15} />
          Kembali ke Beranda
        </button>
      </div>
    </aside>
  );
}
