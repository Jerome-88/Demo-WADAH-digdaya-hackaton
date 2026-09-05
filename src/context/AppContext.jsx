import { createContext, useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getSupabase } from '../lib/supabaseClient';
import { api } from '../lib/api';
import { toBackendUnitId, fromBackendUnitId } from '../data/skillMaps';

export const XP_PER_LEVEL = 200;
export const LEVEL_NAMES = ['', 'Explorer', 'Beginner', 'Verified Beginner', 'Intermediate', 'Advanced'];

// Regular-node XP, used both for the quiz-done screen's XP preview and for
// demo mode's actual award — real mode's award instead comes straight from
// the backend's response (a flat +30 regardless of quiz score; see
// gamification_service.award_unit_xp — the perfect-score bonus below is
// cosmetic-only in real mode, a known, accepted gap).
export const NODE_XP = 40;
export const PERFECT_BONUS_XP = 10;

export function getExpLevel(exp) {
  return Math.min(Math.floor(exp / XP_PER_LEVEL) + 1, 10);
}

// Placeholder project so pages that read activeProject's fields (Skill Map
// banner, SmartMatch) don't crash if visited before a match exists yet.
// status starts null (no project posted yet) — RinaTask's own effect flips
// it to 'open' (matching whatever skill the talent actually picked) once
// the skill map's final checkpoint is approved, simulating an incoming
// match notification right as "Smart Matching Terbuka" unlocks, without
// depending on a presenter separately walking through /jasa with the same
// skill selected (that cross-flow dependency was too easy to get out of
// sync during a live demo). Posting a real project via /jasa still works
// and takes priority — the effect only fires while status is still null.
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
  // Which content variant (AI-generated client/colors/typography, or the
  // original) is showing for a given checkpoint attempt — keyed by
  // `${skillId}:${checkpointId}`. Picked once when a checkpoint's task
  // starts (UnitPage) and read again by RinaSubmit/RinaCertification so the
  // brief and the reviewer feedback stay about the same fictional client.
  const [checkpointVariantIndex, setCheckpointVariantIndex] = useState({});

  // ── Real-backend mode (additive — every field/function above stays
  // exactly as-is and keeps working unchanged for demo mode, since
  // RinaCertification/SmartMatchPage/jasa/* have no backend counterpart to
  // wire to and must never branch on mode) ──
  const [mode, setMode] = useState('demo'); // 'demo' | 'real'
  const [authUser, setAuthUser] = useState(null);
  // The real signed-in user's own name — demo mode stays "Rina Kusumawati"
  // everywhere (TopBar, ProfilePage) regardless of what's typed into Data
  // Diri; real mode shows this instead, so each real account has its own
  // identity rather than borrowing the demo persona's.
  const [realUserName, setRealUserName] = useState(null);
  const [submissions, setSubmissions] = useState([]); // mirrors GET /submission/my
  const [hydrating, setHydrating] = useState(true); // true until session-restore settles

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
  // In real mode this does NOT delete the Supabase account — it just remounts
  // and re-hydrates from whatever's actually saved (there's no delete-account
  // flow, matching the PRD's non-goals).
  function resetDemo() {
    window.location.href = '/';
  }

  async function hydrateFromBackend() {
    const me = await api.getMe();
    setExp(me.xp);
    setHearts(me.lives);
    setStreak(me.streak);
    setSelectedSkill(me.skill);
    setRealUserName(me.name);
    setOnboardingComplete(true);

    const rows = await api.getProgress();
    const completed = [];
    const opened = [];
    rows.forEach(row => {
      const parsed = fromBackendUnitId(row.unit_id);
      if (!parsed) return;
      const key = `${parsed.skillId}:${parsed.nodeId}`;
      if (row.status === 'completed') completed.push(key);
      if (row.status === 'opened' || row.status === 'completed') opened.push(key);
    });
    setCompletedNodeIds(completed);
    setOpenedNodeIds(opened);

    setSubmissions(await api.getMySubmissions());
  }

  // ── Real-mode session bootstrap — restores a persisted Supabase session
  // (the JS client already persists it to localStorage) and hydrates
  // xp/hearts/streak/progress/submissions from the backend. Guarded so a
  // laptop with no VITE_SUPABASE_* env vars configured never breaks demo
  // mode's own page load. ──
  useEffect(() => {
    let unsubscribe = () => {};

    (async () => {
      let supabase;
      try {
        supabase = getSupabase();
      } catch {
        setHydrating(false);
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setMode('real');
        setAuthUser(session.user);
        try {
          await hydrateFromBackend();
        } catch {
          // No `users` row yet — expected mid-onboarding (magic link clicked
          // before the profile was created). Not an error: mode/authUser are
          // already set above, TalentaFlow picks up from there.
        } finally {
          setHydrating(false);
        }
      } else {
        setHydrating(false);
      }

      // Also covers the magic-link case: clicking the emailed link opens a
      // separate tab/window, which signs in there — Supabase syncs that
      // session back to this tab via localStorage, firing SIGNED_IN here
      // without a reload, which is what lets TalentaFlow auto-advance.
      const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
        if (event === 'SIGNED_OUT') {
          setMode('demo');
          setAuthUser(null);
          setRealUserName(null);
        } else if (event === 'SIGNED_IN' && session) {
          setMode('real');
          setAuthUser(session.user);
        }
      });
      unsubscribe = () => sub.subscription.unsubscribe();
    })();

    return () => unsubscribe();
  }, []);

  async function refreshUser() {
    const me = await api.getMe();
    setExp(me.xp);
    setHearts(me.lives);
    setStreak(me.streak);
    return me;
  }

  async function refreshSubmissions() {
    const rows = await api.getMySubmissions();
    setSubmissions(rows);
    return rows;
  }

  // Called by TalentaFlow right after skill is picked (Step 2→3) — the
  // `users` row needs `skill`, which isn't known until then. Per
  // backend/README.md: there's no dedicated "create profile" endpoint by
  // design, the frontend inserts it directly using the user's own session
  // (RLS's "Users insert own row" policy is exactly for this).
  async function createRealUserRow({ name, phone, skill }) {
    const supabase = getSupabase();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Sesi login habis — ulangi dari langkah Verifikasi OTP');
    const { error } = await supabase.from('users').insert({
      id: user.id,
      email: user.email,
      name,
      phone: phone || null,
      skill,
    });
    // 23505 = row already exists (re-running onboarding on an existing
    // account) — treat as success rather than a hard failure.
    if (error && error.code !== '23505') throw error;
    setAuthUser(user);
    setRealUserName(name);
  }

  // Full reload (like resetDemo) rather than manually resetting every piece
  // of state this session hydrated (exp/hearts/streak/completedNodeIds/
  // submissions/onboardingComplete/...) — guarantees nothing stale survives
  // into the next session, and a fresh mount's bootstrap effect correctly
  // finds no session and starts in clean demo mode.
  async function signOutReal() {
    const supabase = getSupabase();
    await supabase.auth.signOut();
    window.location.href = '/';
  }

  // ── Mode-transparent unit actions — UnitPage/RinaTask call these without
  // knowing which mode is active. ──
  function openUnitDemo(skillId, nodeId) {
    const key = `${skillId}:${nodeId}`;
    if (openedNodeIds.includes(key)) return { alreadyOpened: true, livesDeducted: false };
    setHearts(h => Math.max(0, h - 1));
    setOpenedNodeIds(prev => [...prev, key]);
    return { alreadyOpened: false, livesDeducted: true };
  }

  async function openUnitReal(skillId, nodeId) {
    const key = `${skillId}:${nodeId}`;
    const unitId = toBackendUnitId(skillId, nodeId);
    const res = await api.openUnit(unitId);
    setHearts(res.lives_remaining);
    if (!res.already_opened) setOpenedNodeIds(prev => [...prev, key]);
    return { alreadyOpened: res.already_opened, livesDeducted: res.lives_deducted };
  }

  function openUnit(skillId, nodeId) {
    return mode === 'real' ? openUnitReal(skillId, nodeId) : Promise.resolve(openUnitDemo(skillId, nodeId));
  }

  function completeUnitDemo(skillId, nodeId, { quizPerfect } = {}) {
    const key = `${skillId}:${nodeId}`;
    if (completedNodeIds.includes(key)) return { alreadyCompleted: true, xpEarned: 0, leveledUp: false };
    const xpEarned = NODE_XP + (quizPerfect ? PERFECT_BONUS_XP : 0);
    const leveledUp = getExpLevel(exp + xpEarned) > getExpLevel(exp);
    addExp(xpEarned);
    setCompletedNodeIds(prev => [...prev, key]);
    return { alreadyCompleted: false, xpEarned, leveledUp };
  }

  async function completeUnitReal(skillId, nodeId, { quizScore, quizAttempts } = {}) {
    const key = `${skillId}:${nodeId}`;
    if (completedNodeIds.includes(key)) return { alreadyCompleted: true, xpEarned: 0, leveledUp: false };
    const unitId = toBackendUnitId(skillId, nodeId);
    const res = await api.completeUnit(unitId, quizScore, quizAttempts);
    const leveledUp = getExpLevel(res.xp_total) > getExpLevel(exp);
    setExp(res.xp_total);
    setStreak(res.streak);
    setCompletedNodeIds(prev => [...prev, key]);
    return { alreadyCompleted: false, xpEarned: res.xp_earned, leveledUp };
  }

  function completeUnit(skillId, nodeId, opts) {
    return mode === 'real' ? completeUnitReal(skillId, nodeId, opts) : Promise.resolve(completeUnitDemo(skillId, nodeId, opts));
  }

  // Real mode only — demo mode's checkpoint submission stays 100% local
  // (RinaSubmit's own fake-review state machine, untouched by this).
  async function submitCheckpoint(skillId, nodeId, contentText, file) {
    const unitId = toBackendUnitId(skillId, nodeId);
    const res = await api.submitCheckpoint(unitId, contentText, file);
    await refreshSubmissions();
    return res;
  }

  return (
    <AppContext.Provider value={{
      selectedSkill, setSelectedSkill, demoSkip,
      exp, setExp, level, xpInLevel, xpToNextLevel, levelName, addExp,
      verificationSubmitted, setVerificationSubmitted,
      activeProject, setActiveProject,
      completedNodeIds, setCompletedNodeIds,
      projectAccepted, setProjectAccepted,
      streak, setStreak,
      hearts, setHearts,
      openedNodeIds, setOpenedNodeIds,
      onboardingComplete, setOnboardingComplete,
      certificateEarnedAt, issueCertificate,
      checkpointVariantIndex, setCheckpointVariantIndex,
      resetDemo,
      // real-backend additions
      mode, setMode,
      authUser, realUserName, hydrating,
      submissions,
      openUnit, completeUnit, submitCheckpoint,
      createRealUserRow, refreshUser, refreshSubmissions, signOutReal, hydrateFromBackend,
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
