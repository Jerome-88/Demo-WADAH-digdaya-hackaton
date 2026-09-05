import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext';
import { api } from '../lib/api';

const CONCEPT_LABELS = {
  canvas_dimensions: 'Canvas & Safe Zones',
  typography: 'Tipografi',
  color_psychology: 'Color Psychology',
  brief_interpretation: 'Interpretasi Brief',
  layout_composition: 'Komposisi',
  visual_hierarchy: 'Hierarki Visual',
  brand_consistency: 'Konsistensi Brand',
  visual_research: 'Riset Visual',
  client_presentation: 'Presentasi Klien',
};
export const labelFor = (concept) => CONCEPT_LABELS[concept] || concept;

// Demo mode is 100% local and scripted, matching every other feature in
// this app (RinaSubmit's reviewer verdicts, RinaCertification's exam
// outcome) — these numbers mirror the PRD's own mockup verbatim.
const DEMO_DATA = {
  strengths: [
    { concept: 'typography', score: 88 },
    { concept: 'canvas_dimensions', score: 90 },
  ],
  weaknesses: [
    { concept: 'color_psychology', score: 62 },
    { concept: 'layout_composition', score: 69 },
  ],
  resources: [
    { weakness: 'color_psychology', search_query: 'color theory desain umkm' },
    { weakness: 'layout_composition', search_query: 'komposisi layout poster' },
  ],
};
const DEMO_ANALYSIS = `Dari data belajar kamu, gw lihat kamu struggle di color psychology. Di quiz kamu sering salah pilih warna untuk konteks UMKM lokal — biasanya karena pakai prinsip barat yang kurang cocok.

Coba search ini di YouTube:
🔍 psikologi warna brand lokal Indonesia
🔍 color theory Canva bahasa Indonesia UMKM

Dan coba buka ulang Unit 3 — ada bagian konteks lokal yang mungkin terlewat.`;

// Shared between the Profile teaser card and the full Skill Insight page —
// both need the same strengths/weaknesses/resources/premium-gate state, just
// rendered at different sizes.
export default function useSkillInsight() {
  const { mode } = useApp();
  const isReal = mode === 'real';

  // Demo mode's own local premium gate — deliberately not global context
  // state, so a presenter can click through locked -> fake-pay -> unlocked
  // without it meaning anything for a real Supabase account.
  const [demoUnlocked, setDemoUnlocked] = useState(false);
  const [demoPaying, setDemoPaying] = useState(false);
  const [demoAnalyzing, setDemoAnalyzing] = useState(false);
  const [demoAnalysisShown, setDemoAnalysisShown] = useState(false);

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(isReal);
  const [error, setError] = useState(null);
  const [upgrading, setUpgrading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    if (!isReal) return;
    let cancelled = false;
    (async () => {
      try {
        const res = await api.getInsight();
        if (!cancelled) setData(res);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [isReal]);

  async function handleUpgrade() {
    setError(null);
    if (!isReal) {
      setDemoPaying(true);
      setTimeout(() => { setDemoPaying(false); setDemoUnlocked(true); }, 1200);
      return;
    }
    setUpgrading(true);
    try {
      await api.upgradePremium();
      setData(await api.getInsight());
    } catch (err) {
      setError(err.message);
    } finally {
      setUpgrading(false);
    }
  }

  async function handleAnalyze() {
    if (!isReal) {
      setDemoAnalyzing(true);
      setTimeout(() => { setDemoAnalyzing(false); setDemoAnalysisShown(true); }, 1400);
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const res = await api.analyzeInsight();
      setAnalysis(res.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  }

  const strengths = isReal ? data?.strengths || [] : DEMO_DATA.strengths;
  const weaknesses = isReal ? data?.weaknesses || [] : DEMO_DATA.weaknesses;
  const resources = isReal ? data?.resources || [] : DEMO_DATA.resources;
  const isPremium = isReal ? !!data?.is_premium : demoUnlocked;
  const hasData = isReal ? !!data?.has_data : true;
  const shownAnalysis = isReal ? analysis : (demoAnalysisShown ? DEMO_ANALYSIS : null);
  const isAnalyzing = isReal ? analyzing : demoAnalyzing;
  const isPaying = isReal ? upgrading : demoPaying;

  return {
    loading: isReal && loading,
    error,
    strengths, weaknesses, resources,
    isPremium, hasData, shownAnalysis, isAnalyzing, isPaying,
    handleUpgrade, handleAnalyze,
  };
}
