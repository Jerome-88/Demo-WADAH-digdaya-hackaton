import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../../context/AppContext';
import { SKILLS, getSkillMeta } from '../../data/skillMaps';
import { SCOPE_TEMPLATES, CURATED_TALENTS_DISPLAY } from '../../data/jasaData';

const STEP_LABELS = ['Step 1', 'Step 2', 'Step 3'];

const MATCH_LINES = [
  '⚡ Membaca deskripsi proyekmu...',
  '🎯 Mencocokkan dengan 867 talent terverifikasi...',
  '✓ Menemukan 3 talent terbaik untukmu!',
];

export default function JasaFlow() {
  const navigate = useNavigate();
  const location = useLocation();
  const { setActiveProject } = useApp();

  const [step, setStep] = useState(location.state?.resumeStep ?? 0);

  // ── Step 1 state ──
  const [selectedSkills, setSelectedSkills] = useState(new Set());
  const [umkmName, setUmkmName] = useState('');
  const [description, setDescription] = useState('');
  const [scopeStatus, setScopeStatus] = useState('idle'); // idle | loading | done
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
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Beranda</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Cari Talenta untuk Proyekmu
        </h1>
      </header>

      {/* Step chips */}
      <div className="flex items-center justify-center gap-2 py-4 px-4 flex-shrink-0">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-center gap-2">
            <span className={`flex items-center gap-1.5 text-[11px] font-bold font-inter px-2.5 py-1 rounded-full border ${i < step ? 'bg-green-500/10 text-green-400 border-green-500/20'
                : i === step ? 'bg-purple/15 text-purple border-purple/30'
                  : 'bg-white/[0.02] text-white/30 border-white/10'
              }`}>
              {i < step ? '✓' : i === step ? '●' : '○'} {label}
            </span>
            {i < STEP_LABELS.length - 1 && <span className="text-white/15 text-xs">—</span>}
          </div>
        ))}
      </div>

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 pb-16">
        {/* ── STEP 1 ── */}
        {step === 0 && (
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
            <div>
              <h2 className="text-white font-sora font-bold text-xl mb-1">Apa yang kamu butuhkan?</h2>
              <p className="text-white/50 text-sm font-inter">Ceritakan proyekmu — tidak perlu formal, pakai bahasa sehari-hari</p>
            </div>

            <div>
              <h3 className="text-white/70 font-sora font-bold text-xs uppercase tracking-wide mb-3">Pilih Kategori Skill</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
                {SKILLS.map(cat => {
                  const active = selectedSkills.has(cat.id);
                  return (
                    <button
                      key={cat.id}
                      onClick={() => toggleSkill(cat.id)}
                      className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer ${active ? 'border-purple bg-purple/10' : 'border-white/10 bg-[#1A1A2E] hover:border-purple/40'
                        }`}
                    >
                      <div className="text-xl mb-1.5">{cat.emoji}</div>
                      <div className="font-semibold text-white text-xs font-inter">{cat.label}</div>
                      <div className="text-white/40 text-[10px] font-inter mt-0.5">{cat.tagline}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div>
              <h3 className="text-white/70 font-sora font-bold text-xs uppercase tracking-wide mb-2">Nama Bisnis/UMKM</h3>
              <input
                value={umkmName}
                onChange={e => setUmkmName(e.target.value)}
                placeholder="Contoh: Warung Kopi Abadi"
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 font-inter focus:outline-none focus:border-purple/50"
              />
            </div>

            <div>
              <h3 className="text-white/70 font-sora font-bold text-xs uppercase tracking-wide mb-2">Deskripsi Proyek</h3>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                onBlur={handleDescriptionBlur}
                placeholder="Contoh: Gw punya warung kopi di Bandung, butuh yang bisa kelola Instagram dan bikin konten promosi mingguan. Nada bicaranya mau yang hangat dan lokal banget..."
                className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl p-4 text-sm text-white placeholder:text-white/25 font-inter resize-none focus:outline-none focus:border-purple/50"
                style={{ minHeight: 120 }}
              />
            </div>

            {/* Budget Proyek */}
            <div>
              <h3 className="text-white/70 font-sora font-bold text-xs uppercase tracking-wide mb-2">Budget Proyek</h3>
              <div className="flex items-center gap-2">
                <span className="bg-[#1A1A2E] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/50 font-inter">Rp</span>
                <input
                  type="number"
                  value={budgetValue}
                  onChange={e => setBudgetValue(e.target.value)}
                  placeholder="Contoh: 800000"
                  className="flex-1 bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 font-inter focus:outline-none focus:border-purple/50"
                />
              </div>
              <p className="text-white/40 text-xs font-inter leading-relaxed mt-2">
                💡 Tidak perlu pasti — ini hanya gambaran awal untuk membantu kami mencarikan talent yang sesuai. Harga final disepakati saat negosiasi dengan talent.
              </p>
            </div>

            <button onClick={fillDemo} className="self-start text-xs text-purple font-inter underline bg-transparent border-0 cursor-pointer">
              ⚡ Isi contoh cepat (demo)
            </button>

            <button
              onClick={goToStep2}
              disabled={!step1Valid}
              className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Lanjut
            </button>
          </motion.div>
        )}

        {/* ── STEP 2 (matching animation) ── */}
        {step === 1 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center gap-6 py-24">
            {animLines < MATCH_LINES.length && (
              <div className="flex gap-1.5">
                {[0, 1, 2].map(i => (
                  <div key={i} className="w-2.5 h-2.5 rounded-full bg-purple animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
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
                    className={`text-sm font-inter text-center ${
                      i === MATCH_LINES.length - 1 ? 'text-green-400 font-semibold' : 'text-white/60'
                    }`}
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
              <h2 className="text-white font-sora font-bold text-xl mb-1">3 Talent Paling Cocok Untukmu</h2>
              <p className="text-white/50 text-sm font-inter">Dipilih berdasarkan kecocokan proyekmu — bukan skor tertinggi semata</p>
            </div>

            <div className="flex flex-col gap-4">
              {CURATED_TALENTS_DISPLAY.map((talent, i) => (
                <motion.div
                  key={talent.slug}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.15, duration: 0.35 }}
                  onClick={() => navigate(`/portfolio/${talent.slug}`)}
                  className="relative bg-[#1A1A2E] border border-white/10 rounded-2xl p-5 cursor-pointer hover:border-purple/40 transition-all"
                >
                  <span className="absolute top-4 right-4 text-[10px] font-bold text-green-400 bg-green-500/10 border border-green-500/25 px-2 py-1 rounded-full font-inter">
                    ✓ AI Verified
                  </span>

                  <div className="bg-[#1E1A3A] border border-purple/40 rounded-xl p-4 mb-4">
                    <div className="text-purple text-[10px] font-bold font-inter uppercase tracking-wide mb-1.5">Cocok Karena</div>
                    <p className="text-white/80 text-sm font-inter leading-relaxed">{talent.matchReason}</p>
                  </div>

                  <div className="flex items-center gap-3 mb-2">
                    {talent.avatarImg ? (
                      <img src={talent.avatarImg} alt={talent.name} className="w-10 h-10 rounded-full object-cover border border-white/10 shrink-0" />
                    ) : (
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-white font-sora font-bold text-xs shrink-0"
                        style={{ background: talent.avatarBg }}
                      >
                        {talent.initials}
                      </div>
                    )}
                    <div>
                      <div className="text-white font-sora font-bold text-sm">{talent.name}</div>
                      <div className="text-white/50 text-xs font-inter">{talent.role}</div>
                    </div>
                  </div>

                  <div className="text-white/30 text-xs font-inter mb-4">
                    Skor: {talent.score}/10 · {talent.matchPct}% cocok
                  </div>

                  <button
                    onClick={e => { e.stopPropagation(); navigate(`/portfolio/${talent.slug}`); }}
                    className="w-full border border-purple/40 text-purple text-sm font-semibold py-2.5 rounded-xl hover:bg-purple/10 transition-colors font-inter bg-transparent cursor-pointer"
                  >
                    Lihat Portfolio Lengkap
                  </button>
                </motion.div>
              ))}
            </div>

            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4">
              <p className="text-white/50 text-xs font-inter leading-relaxed">
                💡 Tidak ada sistem bidding, tidak ada perang harga. WADAH memilihkan 3 talent yang paling cocok dengan proyekmu — kamu tinggal hubungi yang paling sesuai.
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
