import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const XP_PER_LEVEL = 200;
export const LEVEL_NAMES = ['', 'Explorer', 'Beginner', 'Verified Beginner', 'Intermediate', 'Advanced'];

export function getExpLevel(exp) {
  return Math.min(Math.floor(exp / XP_PER_LEVEL) + 1, 10);
}

// Placeholder project so pages that read activeProject's fields (Skill Map
// banner, SmartMatch) don't crash if visited before /jasa ever posts one.
// status starts null (no project posted yet) — the Skill Map banner and the
// "proyek cocok" checkpoint toast only appear once JasaFlow actually sends
// one (status becomes 'open'), never from a fresh app load. skillId matches
// onboarding's default skill ('desain') so once a project IS posted for that
// skill, the banner lines up without presenter gymnastics.
const DEFAULT_PROJECT = {
  id: 'toko-batik-nusantara',
  umkm: 'Toko Batik Nusantara',
  location: 'Yogyakarta',
  skillId: 'desain',
  skill: 'Desain Grafis',
  budget: 600000,
  budgetNegotiated: null,
  durasi: '1 Bulan',
  desc: 'Butuh 5 konten Instagram Feed yang menonjolkan motif batik tradisional dengan gaya modern untuk menjangkau pembeli muda.',
  status: null, // null (belum ada proyek) | 'open' | 'matched'
};

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedSkill, setSelectedSkill] = useState(null);
  const [exp, setExp] = useState(0); // fresh talent starts at Level 1
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  const [activeProject, setActiveProject] = useState(DEFAULT_PROJECT);
  const [completedNodeIds, setCompletedNodeIds] = useState([]);
  const [projectAccepted, setProjectAccepted] = useState(false);
  const [streak, setStreak] = useState(1);
  const [hearts, setHearts] = useState(5);
  const [openedNodeIds, setOpenedNodeIds] = useState([]);
  const [onboardingComplete, setOnboardingComplete] = useState(false);
  // Which skillIds have an earned certificate this session, and when — the
  // certificate's actual content lives in data/certificates.js (canonical,
  // session-independent) so the public verification page works the same
  // regardless of who's viewing it.
  const [certificateEarnedAt, setCertificateEarnedAt] = useState({});
  const navigate = useNavigate();

  const level = getExpLevel(exp);
  const xpInLevel = exp - (level - 1) * XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpInLevel;
  const levelName = LEVEL_NAMES[level] ?? `Level ${level}`;

  function addExp(amount) {
    setExp(prev => prev + amount);
  }

  function demoSkip(path) {
    setSelectedSkill('desain');
    navigate(path);
  }

  // Idempotent — re-approving an already-certified skill (shouldn't happen,
  // but StrictMode double-invokes effects) won't overwrite the earned date.
  function issueCertificate(skillId) {
    setCertificateEarnedAt(prev => (prev[skillId] ? prev : { ...prev, [skillId]: new Date().toISOString() }));
  }

  // Full reload remounts AppProvider from scratch — lets a presenter restart
  // the demo cleanly for the next audience instead of being stuck mid-journey.
  function resetDemo() {
    window.location.href = '/';
  }

  return (
    <AppContext.Provider value={{
      selectedSkill, setSelectedSkill, demoSkip,
      exp, level, xpInLevel, xpToNextLevel, levelName, addExp,
      verificationSubmitted, setVerificationSubmitted,
      activeProject, setActiveProject,
      completedNodeIds, setCompletedNodeIds,
      projectAccepted, setProjectAccepted,
      streak, setStreak,
      hearts, setHearts,
      openedNodeIds, setOpenedNodeIds,
      onboardingComplete, setOnboardingComplete,
      certificateEarnedAt, issueCertificate,
      resetDemo,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
