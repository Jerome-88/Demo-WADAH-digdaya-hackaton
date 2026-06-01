import { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const XP_PER_LEVEL = 200;
export const LEVEL_NAMES = ['', 'Explorer', 'Beginner', 'Verified Beginner', 'Intermediate', 'Advanced'];

export function getExpLevel(exp) {
  return Math.min(Math.floor(exp / XP_PER_LEVEL) + 1, 10);
}

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [exp, setExp] = useState(320);
  const [verificationSubmitted, setVerificationSubmitted] = useState(false);
  const navigate = useNavigate();

  const level = getExpLevel(exp);
  const xpInLevel = exp - (level - 1) * XP_PER_LEVEL;
  const xpToNextLevel = XP_PER_LEVEL - xpInLevel;
  const levelName = LEVEL_NAMES[level] ?? `Level ${level}`;

  function addExp(amount) {
    setExp(prev => prev + amount);
  }

  function demoSkip(path) {
    setSelectedSkills(['Desain Grafis']);
    navigate(path);
  }

  return (
    <AppContext.Provider value={{
      selectedSkills, setSelectedSkills, demoSkip,
      exp, level, xpInLevel, xpToNextLevel, levelName, addExp,
      verificationSubmitted, setVerificationSubmitted,
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
