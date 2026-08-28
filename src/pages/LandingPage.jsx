import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, Users, Briefcase, CheckCircle, User, ShoppingBag, Settings, Mail, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';

function LinkedinIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" {...props}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.114 20.452H3.558V9h3.556v11.452z" />
    </svg>
  );
}

const contactLinks = [
  { icon: Mail, label: 'jeromebudianto@gmail.com', href: 'mailto:jeromebudianto@gmail.com' },
  { icon: LinkedinIcon, label: 'LinkedIn', href: 'https://www.linkedin.com/in/jerome-maxcellino-budianto/?locale=in' },
  { icon: Award, label: 'Showcase Inovasi', href: 'https://innovation.pidi.id/inovasi/wadah' },
];

const BLUE = '#4085ee';
const BLUE_STRONG = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f27418';

const navLinks = [
  { label: 'Home', target: '#home' },
  { label: 'Solution', target: '#solution' },
  { label: 'How It Works', target: '#cara-kerja' },
  { label: 'Contact', target: '#contact' },
];

const stats = [
  { icon: User, value: '', label: 'Talenta terverifikasi' },
  { icon: ShoppingBag, value: '', label: 'UMKM mitra' },
  { icon: Settings, value: '', label: 'Parameter Penilaian AI' },
];

const umkmSteps = [
  { step: '01', title: 'Describe Kebutuhan', desc: 'Ceritakan proyek Anda, AI akan mengklarifikasi detail secara otomatis' },
  { step: '02', title: 'Terima Matching AI', desc: 'Sistem mencocokkan talenta berdasarkan skill, skor, dan track record' },
  { step: '03', title: 'Pilih & Hubungi', desc: 'Lihat portofolio terverifikasi, pilih yang paling cocok, langsung kolaborasi' },
];

const talentaSteps = [
  { step: '01', title: 'Daftar & Upload CV', desc: 'Daftarkan skill, upload CV/portofolio, AI menentukan level awalmu' },
  { step: '02', title: 'Kerjakan Simulasi', desc: 'Terima tugas simulasi berdasarkan tugas nyata, kerjakan dengan bantuan AI Tutor' },
  { step: '03', title: 'Bangun Track Record', desc: 'Hasil direview human reviewer, masuk portofolio publik terverifikasi' },
];

const heroContainerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.18, delayChildren: 0.1 } },
};

const heroItemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
};

const WADY_MESSAGES = [
  'Halo! Aku Wady, siap membantumu! 👋',
  'Buktiin skillmu ke klien nyata! 🎯',
  'Mulai belajar, dapat proyek pertamamu! 🚀',
];

const strengths = [
  { icon: '/icon-strength-1.png', title: 'AI-Powered Matching', desc: 'Pencocokan cerdas berdasarkan 40+ parameter kinerja', color: GREEN },
  { icon: '/icon-strength-2.png', title: 'Human Verification', desc: 'Setiap karya diverifikasi profesional industri', color: '#0779db' },
  { icon: '/icon-strength-3.png', title: 'System Level', desc: 'Progres transparan dari Beginner hingga Expert', color: '#0779db' },
  { icon: '/icon-strength-4.png', title: 'Zero Bias', desc: 'Dinilai dari karya nyata, bukan latar belakang kampus', color: GREEN },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const { resetDemo } = useApp();
  const [wadyMsgIndex, setWadyMsgIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setWadyMsgIndex(i => (i + 1) % WADY_MESSAGES.length);
    }, 8000);
    return () => clearInterval(id);
  }, []);

  function handleResetDemo() {
    if (window.confirm('Reset progres demo (level, XP, sertifikat, dll) dan mulai dari awal?')) {
      resetDemo();
    }
  }

  function goToNavLink(target) {
    if (target.startsWith('#')) {
      document.getElementById(target.slice(1))?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(target);
    }
  }

  return (
    <div className="animate-fade-in">
      {/* ── Navbar ────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between gap-6">
          <button onClick={() => navigate('/')} className="flex items-center gap-3 flex-shrink-0">
            <img src="/logo.png" alt="WADAH" className="w-10 h-10 object-contain" />
            <div className="leading-tight text-left">
              <div className="font-sora font-extrabold text-[#1a1a1a] text-lg">WADAH</div>
              <div className="text-[10px] text-gray-400 font-inter leading-tight">Work-Simulation AI Driven<br />Augmented Hiring</div>
            </div>
          </button>

          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map(({ label, target }) => (
              <button
                key={label}
                onClick={() => goToNavLink(target)}
                className="group flex flex-col items-center gap-1.5 font-inter font-bold text-[#1a1a1a] text-sm"
              >
                {label}
                <span className="w-6 h-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity" style={{ background: ORANGE }} />
              </button>
            ))}
          </nav>

          <button
            onClick={() => navigate('/')}
            className="text-white font-bold px-6 py-2 rounded-full text-sm font-inter flex-shrink-0"
            style={{ background: ORANGE }}
          >
            Login
          </button>
        </div>
      </header>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section id="home" className="relative overflow-hidden bg-white pt-14 pb-24 scroll-mt-20">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" style={{ background: `${GREEN}1a` }} />
        <div className="absolute bottom-0 left-0 w-72 h-72 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" style={{ background: `${BLUE}1a` }} />

        {/* Decorative illustrations */}
        <div className="hidden lg:block absolute left-4 bottom-40 w-48 xl:w-56 z-10">
          <div className="relative">
            <motion.img
              src="/mascot-hero.png"
              alt=""
              className="w-full pointer-events-none select-none"
              animate={{ y: [0, -14, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
            <div className="absolute top-0 left-[40%] -translate-y-[60%] w-[220px]">
              <motion.div
                className="relative bg-white rounded-2xl px-4 py-3 shadow-lg border-2 text-center"
                style={{ borderColor: BLUE_STRONG }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1, y: [0, -14, 0] }}
                transition={{
                  opacity: { delay: 0.5, duration: 0.4, ease: 'easeOut' },
                  scale: { delay: 0.5, duration: 0.4, ease: 'easeOut' },
                  y: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
                }}
              >
                <div className="min-h-[2.5em] flex items-center justify-center">
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={wadyMsgIndex}
                      className="font-inter font-semibold text-sm text-[#1a1a1a]"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      {WADY_MESSAGES[wadyMsgIndex]}
                    </motion.p>
                  </AnimatePresence>
                </div>
                <div
                  className="absolute -bottom-2 left-6 w-4 h-4 bg-white border-b-2 border-l-2 rotate-45"
                  style={{ borderColor: BLUE_STRONG }}
                />
              </motion.div>
            </div>
          </div>
        </div>
        <motion.img
          src="/rocket.png"
          alt=""
          className="hidden lg:block absolute right-40 top-60 w-[180px] -rotate-11 pointer-events-none select-none"
          animate={{ y: [0, -18, 0], rotate: [-11, -7, -11] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.6 }}
        />

        <motion.div variants={heroContainerVariants} initial="hidden" animate="visible">
          {/* Wordmark + tagline */}
          <motion.div variants={heroItemVariants} className="relative max-w-3xl mx-auto px-6 text-center mb-10">
            <h1 className="font-sora font-extrabold text-5xl sm:text-6xl mb-3" style={{ color: BLUE_STRONG }}>WADAH</h1>
            <p className="font-sora font-extrabold text-2xl sm:text-3xl" style={{ color: ORANGE }}>
              Tumbuhkan Potensi, Jawab Kebutuhan Industri!
            </p>
          </motion.div>

          {/* Outer box */}
          <motion.div variants={heroItemVariants} className="relative max-w-4xl mx-auto px-6">
            <div className="rounded-3xl px-6 sm:px-10 py-10 text-center" style={{ background: '#eef1f8' }}>
              <p className="font-inter font-bold text-base sm:text-lg mb-7 max-w-2xl mx-auto" style={{ color: BLUE }}>
                Platform karir digital tempat dimana talenta muda dapat berlatih melalui simulasi kerja, membangun portofolio yang terverifikasi dan terhubung langsung dengan pelaku usaha yang membutuhkan
              </p>

              <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 mb-7" style={{ background: '#1a1a2e' }}>
                <span className="text-white/90 text-xs font-semibold font-inter tracking-wide">Hackathon Demo Digdaya X Bank Indonesia 2026</span>
              </div>

              <h2 className="font-sora font-extrabold text-4xl sm:text-5xl mb-8" style={{ color: GREEN }}>
                Learn - Prove - Earn
              </h2>

              {/* Inner gradient box */}
              <div className="rounded-2xl px-6 sm:px-10 py-8" style={{ background: 'linear-gradient(135deg, #b9f3dd 0%, #cfe0fb 100%)' }}>
                <div className="flex flex-wrap justify-center gap-x-12 gap-y-5 mb-7">
                  {stats.map(({ icon: Icon, value, label }) => (
                    <div key={label} className="flex flex-col items-center gap-1.5">
                      <Icon size={20} className="text-black" />
                      <div className="font-sora font-bold text-[#1a1a1a] text-xl">{value}</div>
                      <div className="text-[#1a1a1a] text-xs font-inter">{label}</div>
                    </div>
                  ))}
                </div>

                <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                  <button
                    onClick={() => navigate('/jasa')}
                    className="flex items-center gap-2 bg-white text-[#1a1a1a] font-bold px-7 py-3.5 rounded-full hover:shadow-md transition-all active:scale-95 font-inter text-base"
                  >
                    <Briefcase size={18} />
                    Find Talent
                  </button>
                  <button
                    onClick={() => navigate('/talenta')}
                    className="flex items-center gap-2 text-white font-bold px-7 py-3.5 rounded-full transition-all shadow-lg hover:shadow-xl active:scale-95 font-inter text-base"
                    style={{ background: ORANGE }}
                  >
                    <Users size={18} />
                    Register as Talent
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </section>


      {/* ── Path Cards ────────────────────────────────────────── */}
      <section id="solution" className="max-w-6xl mx-auto px-6 py-16 scroll-mt-20">
        <h2 className="font-sora font-bold text-3xl text-center mb-2" style={{ color: ORANGE }}>Our Solution</h2>
        <p className="font-inter font-bold text-[#1a1a1a] text-center mb-10">Dua jalur, satu tujuan untuk mempertemukan kebutuhan dan kemampuan</p>

        <div className="grid gap-6 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          {/* Penyedia Jasa (UMKM) */}
          <div
            onClick={() => navigate('/jasa')}
            className="group cursor-pointer bg-white rounded-2xl border-2 p-8 hover:shadow-xl transition-all duration-300"
            style={{ borderColor: BLUE }}
          >
            <img src="/icon-pengguna-jasa.png" alt="" className="w-16 h-16 object-contain mb-4" />
            <h3 className="font-sora font-bold text-2xl mb-3" style={{ color: BLUE }}>Penyedia Jasa</h3>
            <p className="font-inter font-semibold mb-5 leading-relaxed" style={{ color: BLUE }}>
              UMKM dan bisnis yang membutuhkan talenta kreatif, terverifikasi, matching berbasis AI dengan track record nyata
            </p>
            <ul className="space-y-2 mb-6">
              {['Requirement Clarification via AI', 'AI Automatic Evaluation', 'Verified Portofolio'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm font-inter" style={{ color: BLUE }}>
                  <CheckCircle size={15} className="flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 font-semibold font-inter group-hover:gap-3 transition-all" style={{ color: BLUE }}>
              Mulai Cari Talenta <ArrowRight size={16} />
            </div>
          </div>

          {/* Mascot */}
          <div className="hidden lg:flex items-center justify-center rounded-2xl border-0 px-10">
            <motion.img
              src="/mascot-solution.png"
              alt=""
              className="w-[200px] pointer-events-none select-none"
              animate={{ y: [0, -12, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
            />
          </div>

          {/* Pengguna Jasa (Talenta) */}
          <div
            onClick={() => navigate('/talenta')}
            className="group cursor-pointer bg-white rounded-2xl border-2 p-8 hover:shadow-xl transition-all duration-300"
            style={{ borderColor: GREEN }}
          >
            <img src="/icon-penyedia-jasa.png" alt="" className="w-16 h-16 object-contain mb-4" />
            <h3 className="font-sora font-bold text-2xl mb-3" style={{ color: GREEN }}>Pengguna Jasa</h3>
            <p className="font-inter font-semibold mb-5 leading-relaxed" style={{ color: GREEN }}>
              Talenta muda yang ingin membangun karier, buktikan kemampuan lewat simulasi kerja nyata, bangun portofolio terverifikasi
            </p>
            <ul className="space-y-2 mb-6">
              {['Requirement Clarification via AI', 'Talent Automatic Matching', 'Verified Portofolio'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm font-inter" style={{ color: GREEN }}>
                  <CheckCircle size={15} className="flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 font-semibold font-inter group-hover:gap-3 transition-all" style={{ color: GREEN }}>
              Bangun Perjalanan Karir <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Cara Kerja ────────────────────────────────────────── */}
      <section id="cara-kerja" className="relative overflow-hidden py-16 scroll-mt-20" style={{ background: `linear-gradient(135deg, ${BLUE_STRONG} 0%, ${GREEN} 100%)` }}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-white/5 rounded-full blur-3xl translate-y-1/3 -translate-x-1/3" />

        <div className="relative max-w-5xl mx-auto px-6">
          <h2 className="font-sora font-bold text-white text-3xl text-center mb-2">How Does WADAH Work?</h2>
          <p className="text-white/80 text-center font-inter mb-12">Proses transparan, adil, dan berbasis bukti nyata</p>

          <div className="grid md:grid-cols-2 gap-8">
            {/* UMKM Side */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 px-6 py-5" style={{ background: `linear-gradient(90deg, ${BLUE_STRONG}, #1a4399)` }}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Briefcase size={15} className="text-white" />
                </div>
                <h3 className="font-sora font-bold text-white text-lg">Untuk UMKM & Bisnis</h3>
              </div>
              <div className="bg-white p-6 space-y-4">
                {umkmSteps.map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${BLUE}1a` }}>
                      <span className="font-sora font-bold text-sm" style={{ color: BLUE }}>{step}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 font-inter">{title}</div>
                      <div className="text-gray-500 text-sm font-inter mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Talenta Side */}
            <div className="rounded-3xl overflow-hidden border border-white/10 shadow-xl">
              <div className="flex items-center gap-3 px-6 py-5" style={{ background: `linear-gradient(90deg, #0052ff, ${GREEN})` }}>
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <Users size={15} className="text-white" />
                </div>
                <h3 className="font-sora font-bold text-white text-lg">Untuk Talenta Muda</h3>
              </div>
              <div className="bg-white p-6 space-y-4">
                {talentaSteps.map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: `${GREEN}1a` }}>
                      <span className="font-sora font-bold text-sm" style={{ color: GREEN }}>{step}</span>
                    </div>
                    <div>
                      <div className="font-semibold text-gray-800 font-inter">{title}</div>
                      <div className="text-gray-500 text-sm font-inter mt-0.5">{desc}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ──────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-sora font-bold text-3xl text-center mb-10" style={{ color: ORANGE }}>Our Strength</h2>
        <div className="grid sm:grid-cols-2 gap-5">
          {strengths.map(({ icon, title, desc, color }) => (
            <div key={title} className="bg-white rounded-2xl p-6 border-2 hover:shadow-md transition-shadow" style={{ borderColor: color }}>
              <img src={icon} alt="" className="w-12 h-12 object-contain mb-3" />
              <h4 className="font-sora font-bold text-base mb-1" style={{ color }}>{title}</h4>
              <p className="text-gray-500 text-sm font-inter leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ── Contact ───────────────────────────────────────────── */}
      <section id="contact" className="scroll-mt-20" style={{ background: '#eef1f8' }}>
        <div className="max-w-2xl mx-auto px-6 py-16 text-center">
          <h2 className="font-sora font-bold text-3xl mb-2" style={{ color: ORANGE }}>Contact</h2>
          <p className="text-gray-500 font-inter mb-10">Tertarik kolaborasi atau mau tau lebih lanjut soal WADAH?</p>

          <div className="bg-white rounded-2xl border-2 p-8" style={{ borderColor: BLUE }}>
            <div className="font-sora font-bold text-xl text-[#1a1a1a] mb-1">Jerome Maxcellino Budianto</div>
            <div className="text-sm text-gray-500 font-inter mb-6">Ketua Tim WADAH</div>

            <div className="flex flex-wrap justify-center gap-3">
              {contactLinks.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('http') ? '_blank' : undefined}
                  rel={href.startsWith('http') ? 'noopener noreferrer' : undefined}
                  className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-inter font-semibold border-2 hover:shadow-md transition-all"
                  style={{ borderColor: BLUE, color: BLUE }}
                >
                  <Icon size={16} />
                  {label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-8 text-center" style={{ background: BLUE_STRONG }}>
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white to-white flex items-center justify-center">
            <img src="/logo.png" className='w-7 h-7 rounded-lg' />
          </div>
          <span className="text-white font-sora font-bold">WADAH</span>
        </div>
        <p className="text-white/70 text-xs font-inter">
          Work-simulation AI Driven Augmented Hiring · Hackathon Digdaya x Bank Indonesia 2026
        </p>
        <p className="text-white/60 text-xs font-inter mt-1">
          Semua data adalah simulasi untuk keperluan demo
        </p>
        <button
          onClick={handleResetDemo}
          className="text-white/50 hover:text-white/80 text-[11px] font-inter underline bg-transparent border-0 cursor-pointer mt-3 transition-colors"
        >
          🔄 Reset progres demo
        </button>
      </footer>
    </div>
  );
}
