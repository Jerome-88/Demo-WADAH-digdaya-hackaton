import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SKILLS, getSkillMeta } from '../../data/skillMaps';
import { SCOPE_TEMPLATES, CURATED_TALENTS_DISPLAY } from '../../data/jasaData';

const BLUE = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f37219';

const MATCH_LINES = [
  '⚡ Membaca deskripsi proyekmu...',
  '🎯 Mencocokkan dengan 867 talent terverifikasi...',
  '✓ Menemukan 3 talent terbaik untukmu!',
];

const NAV_LINKS = ['For Business', 'For Talent', 'Cara Kerja', 'About'];

export default function JasaFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveProject } = useApp();

  const [step, setStep] = useState(location.state?.resumeStep ?? 0);

  // ── Step 1 state ──
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [umkmName, setUmkmName] = useState('');
  const [description, setDescription] = useState('');
  const [, setScopeStatus] = useState('idle'); // idle | loading | done
  const [scopeItems, setScopeItems] = useState([]);
  const [budgetValue, setBudgetValue] = useState('');

  // ── Step 2 state (matching animation) ──
  const [animLines, setAnimLines] = useState(0); // how many MATCH_LINES revealed

  const firstSkillId = [...selectedSkills][0] || null;

  function toggleSkill(id) {
    setSelectedSkills(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  // AI "scope analysis" — a breakdown of likely deliverables, not a price
  // estimate. Triggered once the UMKM blurs the description textarea (or
  // instantly via the demo quick-fill).
  function analyzeScope(skillId, desc) {
    if (!skillId || !desc.trim()) { setScopeStatus('idle'); setScopeItems([]); return; }
    setScopeStatus('loading');
    setTimeout(() => {
      setScopeItems(SCOPE_TEMPLATES[skillId] || []);
      setScopeStatus('done');
    }, 1000);
  }

  function handleDescriptionBlur() {
    analyzeScope(firstSkillId, description);
  }

  function fillDemo() {
    const skillId = 'desain';
    const desc = 'Saya punya toko sepatu kecil di Pasar Baru, Bandung. Mau bikin desain poster untuk promosi sneakers edisi spesial Lebaran. Talentnya bisa dari mana saja, asalkan hasil kerjanya rapi dan sesuai dengan gaya anak muda zaman sekarang.';
    setSelectedSkills(new Set([skillId]));
    setUmkmName('SepatuKu');
    setDescription(desc);
    setBudgetValue('500000');
    analyzeScope(skillId, desc);
  }

  const step1Valid = selectedSkills.size > 0 && description.trim() && umkmName.trim() && budgetValue.trim();

  function goToStep2() {
    setStep(1);
    setAnimLines(0);
  }

  function goToStep3() {
    const skillMeta = getSkillMeta(firstSkillId);
    setActiveProject({
      id: `${firstSkillId}-${umkmName.toLowerCase().replace(/\s+/g, '-')}`,
      umkm: umkmName,
      location: 'Indonesia',
      skillId: firstSkillId,
      skill: skillMeta.label,
      budget: Number(budgetValue) || 0,
      budgetNegotiated: null,
      durasi: 'Fleksibel', // negotiated later in chat, not chosen in Step 1
      desc: description,
      scope: scopeItems,
      status: 'open',
    });
    setStep(2);
  }

  // Reveal MATCH_LINES one by one, then auto-advance to the results step —
  // this animation stands in for the old AI clarification chat.
  useEffect(() => {
    if (step !== 1) return;
    const timers = MATCH_LINES.map((_, i) => setTimeout(() => setAnimLines(i + 1), 700 + i * 900));
    const done = setTimeout(goToStep3, 700 + MATCH_LINES.length * 900 + 700);
    return () => { timers.forEach(clearTimeout); clearTimeout(done); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between gap-4">
          <button onClick={() => navigate('/')} className="flex items-center gap-2.5 flex-shrink-0">
            <img src="/logo.png" alt="WADAH" className="w-9 h-9 object-contain" />
            <div className="leading-tight text-left hidden sm:block">
              <div className="font-sora font-extrabold text-[#1a1a1a] text-sm">WADAH</div>
              <div className="text-[9px] text-gray-400 font-inter leading-tight">Work-Simulation AI Driven<br />Augmented Hiring</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map(label => (
              <button
                key={label}
                onClick={() => navigate(label === 'For Talent' ? '/talenta' : '/jasa')}
                className="flex flex-col items-center gap-1 font-inter font-bold text-[#1a1a1a] text-sm hover:opacity-70 transition-opacity"
              >
                {label}
                <span className="w-5 h-0.5 rounded-full" style={{ background: ORANGE }} />
              </button>
            ))}
          </nav>

          <button
            onClick={() => navigate('/')}
            className="text-white font-bold px-5 py-2 rounded-full text-sm font-inter flex-shrink-0"
            style={{ background: ORANGE }}
          >
            Login
          </button>
        </div>
      </header>

      <main className="flex-1 w-full max-w-[720px] mx-auto px-4 py-8">
        <h1 className="font-sora font-extrabold text-3xl sm:text-4xl text-center mb-2" style={{ color: BLUE }}>Search Talent</h1>
        <p className="text-sm font-inter font-semibold text-center mb-8" style={{ color: BLUE }}>
          Apa yang kamu butuhkan? Ceritakan proyekmu — tidak perlu formal, pakai bahasa sehari-hari
        </p>

        {/* Step circles */}
        <div className="flex items-start justify-center gap-1 sm:gap-3 mb-8">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-start">
              <div
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-sora font-bold text-base sm:text-lg flex-shrink-0"
                style={i <= step ? { background: GREEN, color: '#fff' } : { background: '#c9f0e1', color: 'rgba(0,0,0,0.35)' }}
              >
                {i < step ? <i className="fa-solid fa-check text-sm"></i> : i + 1}
              </div>
              {i < 2 && (
                <div className="h-0.5 w-10 sm:w-16 mt-5" style={{ background: i < step ? GREEN : '#c9f0e1' }} />
              )}
            </div>
          ))}
        </div>

        <div className="rounded-3xl p-5 sm:p-8" style={{ background: '#f5f8fb' }}>
          {/* ── STEP 1 ── */}
          {step === 0 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
              <div>
                <h3 className="font-sora font-bold text-lg mb-3" style={{ color: BLUE }}>Pilih Skill Utamamu</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                  {SKILLS.map(cat => {
                    const active = selectedSkills.has(cat.id);
                    return (
                      <button
                        key={cat.id}
                        onClick={() => toggleSkill(cat.id)}
                        className="p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer"
                        style={active ? { borderColor: BLUE, background: '#eef2fe' } : { borderColor: BLUE, background: '#fff' }}
                      >
                        <div className="text-xl mb-1.5">{cat.emoji}</div>
                        <div className="font-semibold text-xs font-inter" style={{ color: BLUE }}>{cat.label}</div>
                        <div className="text-[10px] font-inter mt-0.5" style={{ color: BLUE, opacity: 0.7 }}>{cat.tagline}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <h3 className="font-sora font-bold text-lg mb-2" style={{ color: BLUE }}>Nama Bisnis/UMKM</h3>
                <input
                  value={umkmName}
                  onChange={e => setUmkmName(e.target.value)}
                  placeholder="Contoh : Warung Kopi Abadi"
                  className="w-full rounded-2xl px-5 py-3.5 text-sm text-[#1a1a1a] placeholder:text-gray-400 font-inter border-2 bg-white focus:outline-none"
                  style={{ borderColor: BLUE }}
                />
              </div>

              <div>
                <h3 className="font-sora font-bold text-lg mb-2" style={{ color: BLUE }}>Deskripsikan Proyek</h3>
                <textarea
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  onBlur={handleDescriptionBlur}
                  placeholder="Contoh : Gw punya warung kopi di Bandung, butuh yang bisa kelola Instagram dan bikin konten promosi mingguan. Nada bicaranya mau yang hangat dan lokal banget..."
                  className="w-full rounded-2xl p-4 text-sm text-[#1a1a1a] placeholder:text-gray-400 font-inter resize-none border-2 bg-white focus:outline-none"
                  style={{ borderColor: BLUE, minHeight: 120 }}
                />
              </div>

              {/* Budget Proyek */}
              <div>
                <h3 className="font-sora font-bold text-lg mb-2" style={{ color: BLUE }}>Budget Proyek</h3>
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-2xl px-4 py-3.5 text-sm font-bold font-inter border-2 bg-white"
                    style={{ borderColor: BLUE, color: '#797d85' }}
                  >
                    Rp
                  </span>
                  <input
                    type="number"
                    value={budgetValue}
                    onChange={e => setBudgetValue(e.target.value)}
                    placeholder="Contoh : 800000"
                    className="flex-1 rounded-2xl px-5 py-3.5 text-sm text-[#1a1a1a] placeholder:text-gray-400 font-inter border-2 bg-white focus:outline-none"
                    style={{ borderColor: BLUE }}
                  />
                </div>
                <p className="text-xs font-inter leading-relaxed mt-2" style={{ color: ORANGE }}>
                  💡 Tidak perlu pasti — ini hanya gambaran awal untuk membantu kami mencarikan talent yang sesuai. Harga final disepakati saat negosiasi dengan talent.
                </p>
              </div>

              <button onClick={fillDemo} className="self-start text-sm font-inter underline bg-transparent border-0 cursor-pointer" style={{ color: ORANGE }}>
                ⚡ Isi contoh cepat (demo)
              </button>

              <div className="flex items-center justify-between pt-2">
                <button onClick={() => navigate('/')} className="flex items-center gap-2 font-inter font-semibold text-sm bg-transparent border-0 cursor-pointer" style={{ color: BLUE }}>
                  <i className="fa-solid fa-arrow-left"></i> Back
                </button>
                <button
                  onClick={goToStep2}
                  disabled={!step1Valid}
                  className="text-white font-bold py-3 px-10 rounded-full transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed hover:brightness-110"
                  style={{ background: BLUE }}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}

          {/* ── STEP 2 (matching animation) ── */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-6 py-24">
              {animLines < MATCH_LINES.length && (
                <div className="flex gap-1.5">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-2.5 h-2.5 rounded-full animate-bounce" style={{ background: BLUE, animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
              <div className="flex flex-col gap-3 items-center">
                <AnimatePresence>
                  {MATCH_LINES.slice(0, animLines).map((line, i) => (
                    <motion.p
                      key={line}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-sm font-inter text-center font-semibold"
                      style={{ color: i === MATCH_LINES.length - 1 ? GREEN : BLUE }}
                    >
                      {line}
                    </motion.p>
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* ── STEP 3 ── */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-5">
              <div className="text-center">
                <h2 className="font-sora font-bold text-xl mb-1" style={{ color: BLUE }}>3 Talent Paling Cocok Untukmu</h2>
                <p className="text-sm font-inter font-medium" style={{ color: BLUE }}>Dipilih berdasarkan kecocokan proyekmu — bukan skor tertinggi semata</p>
              </div>

              <div className="flex flex-col gap-4">
                {CURATED_TALENTS_DISPLAY.map((talent, i) => (
                  <motion.div
                    key={talent.slug}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.15, duration: 0.35 }}
                    onClick={() => navigate(`/portfolio/${talent.slug}`)}
                    className="relative bg-white border-2 rounded-2xl p-5 cursor-pointer transition-all hover:shadow-md"
                    style={{ borderColor: BLUE }}
                  >
                    <span
                      className="absolute top-4 right-4 text-[10px] font-bold px-2 py-1 rounded-full font-inter border"
                      style={{ color: GREEN, borderColor: GREEN, background: '#e3faf0' }}
                    >
                      ✓ AI Verified
                    </span>

                    <div className="rounded-xl p-4 mb-4 border-2" style={{ background: '#eef2fe', borderColor: BLUE }}>
                      <div className="text-[10px] font-bold font-inter uppercase tracking-wide mb-1.5" style={{ color: BLUE }}>Cocok Karena</div>
                      <p className="text-sm font-inter leading-relaxed" style={{ color: '#1a1a1a' }}>{talent.matchReason}</p>
                    </div>

                    <div className="flex items-center gap-3 mb-2">
                      {talent.avatarImg ? (
                        <img src={talent.avatarImg} alt={talent.name} className="w-10 h-10 rounded-full object-cover shrink-0" />
                      ) : (
                        <div
                          className="w-10 h-10 rounded-full flex items-center justify-center text-white font-sora font-bold text-xs shrink-0"
                          style={{ background: talent.avatarBg }}
                        >
                          {talent.initials}
                        </div>
                      )}
                      <div>
                        <div className="font-sora font-bold text-sm" style={{ color: '#1a1a1a' }}>{talent.name}</div>
                        <div className="text-xs font-inter text-gray-500">{talent.role}</div>
                      </div>
                    </div>

                    <div className="text-xs font-inter mb-4" style={{ color: ORANGE }}>
                      Skor: {talent.score}/10 · {talent.matchPct}% cocok
                    </div>

                    <button
                      onClick={e => { e.stopPropagation(); navigate(`/portfolio/${talent.slug}`); }}
                      className="w-full text-sm font-semibold py-2.5 rounded-full transition-colors font-inter bg-transparent cursor-pointer border-2"
                      style={{ borderColor: BLUE, color: BLUE }}
                    >
                      Lihat Portfolio Lengkap
                    </button>
                  </motion.div>
                ))}
              </div>

              <div className="rounded-xl p-4" style={{ background: '#eef2fe' }}>
                <p className="text-xs font-inter leading-relaxed" style={{ color: BLUE }}>
                  💡 Tidak ada sistem bidding, tidak ada perang harga. WADAH memilihkan 3 talent yang paling cocok dengan proyekmu — kamu tinggal hubungi yang paling sesuai.
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </main>
    </div>
  );
}
