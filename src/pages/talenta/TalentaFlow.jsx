import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { SKILLS } from '../../data/skillMaps';

const ACTIVATION_CHECKS = [
  'Menyusun kurikulum skill map',
  'Menyiapkan AI Mentor',
  'Mengaktifkan checkpoint pertama',
];
const ACTIVATION_DURATION = 2800;
const OTP_LENGTH = 6;
const STEP_LABELS = ['Data Diri', 'Verifikasi OTP', 'Pilih Skill'];

export default function TalentaFlow() {
  const navigate = useNavigate();
  const { setSelectedSkill, onboardingComplete, setOnboardingComplete } = useApp();

  // step: 0=Data Diri, 1=Verifikasi OTP, 2=Pilih Skill, 3=Aktivasi (internal
  // only — not shown as a stepper label, plays automatically once a skill
  // is picked in step 2).
  const [step, setStep] = useState(0);
  const [localSkill, setLocalSkill] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [barFilled, setBarFilled] = useState(false);
  const otpRefs = useRef([]);

  function useDemoProfile() {
    setName('Rina Kusumawati');
    setPhone('812-3456-7890');
  }

  function simUploadPhoto() {
    setPhotoUploading(true);
    setTimeout(() => {
      setPhotoUploading(false);
      setPhotoUploaded(true);
    }, 1000);
  }

  function handleSendOtp() {
    setSendingOtp(true);
    setTimeout(() => {
      setSendingOtp(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      setResendCooldown(30);
      setStep(1);
    }, 900);
  }

  function handleOtpChange(i, value) {
    const digit = value.replace(/\D/g, '').slice(-1);
    setOtp(prev => {
      const next = [...prev];
      next[i] = digit;
      return next;
    });
    if (digit && i < OTP_LENGTH - 1) otpRefs.current[i + 1]?.focus();
  }

  function handleOtpKeyDown(i, e) {
    if (e.key === 'Backspace' && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  }

  function fillDemoOtp() {
    setOtp(['1', '2', '3', '4', '5', '6']);
  }

  function handleResendOtp() {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
  }

  const otpComplete = otp.every(d => d !== '');

  // Resend cooldown ticker
  useEffect(() => {
    if (step !== 1 || resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendCooldown]);

  const skillMeta = SKILLS.find(s => s.id === localSkill);

  // Picking a skill IS the final action — it commits the skill and drops
  // straight into the (non-interactive) activation animation below.
  function handleStartActivation() {
    setSelectedSkill(localSkill);
    setStep(3);
  }

  // Non-interactive "aktivasi akun" screen — plays for a beat, then drops
  // straight into the skill map (the game itself), no click required.
  useEffect(() => {
    if (step !== 3) return;
    const raf = requestAnimationFrame(() => setBarFilled(true));
    const t = setTimeout(() => {
      setOnboardingComplete(true);
      navigate('/rina/task');
    }, ACTIVATION_DURATION);
    return () => { cancelAnimationFrame(raf); clearTimeout(t); };
  }, [step, navigate, setOnboardingComplete]);

  // Already onboarded this session (e.g. presenter went Beranda -> Penyedia
  // Jasa again) — skip straight to the map instead of replaying the wizard.
  if (onboardingComplete) return <Navigate to="/rina/task" replace />;

  return (
    <div className="min-h-screen bg-[#0F0F1A] flex flex-col">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Beranda</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Mulai Perjalanan Kariermu
        </h1>
      </header>

      {/* Step chips */}
      {step < 3 && (
        <div className="flex items-center justify-center gap-2 py-4 px-4 flex-shrink-0">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-center gap-2">
              <span className={`flex items-center gap-1.5 text-[11px] font-bold font-inter px-2.5 py-1 rounded-full border ${
                i < step ? 'bg-green-500/10 text-green-400 border-green-500/20'
                  : i === step ? 'bg-purple/15 text-purple border-purple/30'
                    : 'bg-white/[0.02] text-white/30 border-white/10'
              }`}>
                {i < step ? '✓' : i === step ? '●' : '○'} {label}
              </span>
              {i < STEP_LABELS.length - 1 && <span className="text-white/15 text-xs">—</span>}
            </div>
          ))}
        </div>
      )}

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 pb-16">
        {/* ── STEP 0: Data Diri ── */}
        {step === 0 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <h2 className="text-white font-sora font-bold text-xl">Data Diri</h2>

            <div className="flex flex-col gap-4">
              <div>
                <h3 className="text-white/70 font-sora font-bold text-xs uppercase tracking-wide mb-2">Nama Lengkap</h3>
                <input
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Nama lengkapmu"
                  className="w-full bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 font-inter focus:outline-none focus:border-purple/50"
                />
              </div>

              <div>
                <h3 className="text-white/70 font-sora font-bold text-xs uppercase tracking-wide mb-2">Nomor HP</h3>
                <div className="flex items-center gap-2">
                  <span className="bg-[#1A1A2E] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white/50 font-inter">+62</span>
                  <input
                    value={phone}
                    onChange={e => setPhone(e.target.value.replace(/[^\d-]/g, ''))}
                    placeholder="812-3456-7890"
                    className="flex-1 bg-[#1A1A2E] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder:text-white/25 font-inter focus:outline-none focus:border-purple/50"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-white/70 font-sora font-bold text-xs uppercase tracking-wide mb-2">
                  Foto Profil <span className="text-white/30 normal-case font-normal">(opsional, bisa skip)</span>
                </h3>

                {!photoUploading && !photoUploaded && (
                  <button
                    onClick={simUploadPhoto}
                    className="flex items-center gap-3 w-full border border-dashed border-white/15 rounded-xl p-3 hover:border-purple/40 transition-all text-left bg-transparent cursor-pointer"
                  >
                    <div className="w-11 h-11 rounded-full bg-purple/10 flex items-center justify-center flex-shrink-0">
                      <Upload size={16} className="text-purple" />
                    </div>
                    <span className="text-sm text-white/50 font-inter">Upload foto profil</span>
                  </button>
                )}

                {photoUploading && (
                  <div className="flex items-center gap-3 border border-purple/30 rounded-xl p-3 bg-purple/5">
                    <div className="w-11 h-11 rounded-full border-2 border-purple border-t-transparent animate-spin-fast flex-shrink-0" />
                    <span className="text-sm text-purple font-inter">Mengupload...</span>
                  </div>
                )}

                {photoUploaded && (
                  <div className="flex items-center gap-3">
                    <img src="/rina.jpg" alt="Foto profil" className="w-11 h-11 rounded-full object-cover border border-purple/40" />
                    <span className="text-sm text-green-400 font-semibold font-inter flex items-center gap-1.5">
                      <CheckCircle size={14} /> Foto berhasil diupload
                    </span>
                  </div>
                )}
              </div>
            </div>

            <button onClick={useDemoProfile} className="self-start text-xs text-purple font-inter underline bg-transparent border-0 cursor-pointer">
              ⚡ Isi contoh cepat (demo)
            </button>

            <button
              onClick={handleSendOtp}
              disabled={!name.trim() || !phone.trim() || sendingOtp}
              className="w-full flex items-center justify-center gap-2 bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed font-inter"
            >
              {sendingOtp ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                  Mengirim OTP...
                </>
              ) : (
                <>Kirim OTP <ArrowRight size={16} /></>
              )}
            </button>
          </div>
        )}

        {/* ── STEP 1: Verifikasi OTP ── */}
        {step === 1 && (
          <div className="animate-fade-in flex flex-col gap-6 items-center text-center">
            <div>
              <h2 className="text-white font-sora font-bold text-xl mb-2">Verifikasi Nomor HP</h2>
              <p className="text-white/50 font-inter text-sm">
                Kode 6 digit sudah dikirim ke <span className="font-semibold text-white/80">+62 {phone || '812-3456-7890'}</span>
              </p>
            </div>

            <div className="flex justify-center gap-2">
              {otp.map((digit, i) => (
                <input
                  key={i}
                  ref={el => (otpRefs.current[i] = el)}
                  value={digit}
                  onChange={e => handleOtpChange(i, e.target.value)}
                  onKeyDown={e => handleOtpKeyDown(i, e)}
                  inputMode="numeric"
                  maxLength={1}
                  className="w-11 h-14 text-center text-xl font-sora font-bold bg-[#1A1A2E] border border-white/10 rounded-xl text-white focus:outline-none focus:border-purple/50"
                />
              ))}
            </div>

            <button onClick={fillDemoOtp} className="text-xs text-purple font-inter underline bg-transparent border-0 cursor-pointer">
              ⚡ Isi contoh cepat (demo)
            </button>

            <div className="text-sm text-white/40 font-inter">
              Tidak menerima kode?{' '}
              {resendCooldown > 0 ? (
                <span className="text-white/30">Kirim ulang ({resendCooldown}s)</span>
              ) : (
                <button onClick={handleResendOtp} className="text-purple font-semibold hover:underline bg-transparent border-0 cursor-pointer">Kirim ulang</button>
              )}
            </div>

            <div className="flex justify-between w-full pt-2">
              <button onClick={() => setStep(0)} className="flex items-center gap-2 text-white/50 hover:text-white font-inter text-sm bg-transparent border-0 cursor-pointer">
                <ArrowLeft size={16} /> Kembali
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!otpComplete}
                className="flex items-center gap-2 bg-purple hover:brightness-110 text-white font-bold px-6 py-3 rounded-xl transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed font-inter"
              >
                Verifikasi <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Pilih Skill (satu skill utama) — picking triggers activation directly ── */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <h2 className="text-white font-sora font-bold text-xl">Pilih Skill Utamamu</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {SKILLS.map(skill => {
                const sel = localSkill === skill.id;
                return (
                  <button
                    key={skill.id}
                    onClick={() => setLocalSkill(skill.id)}
                    className={`relative p-3.5 rounded-xl border text-left transition-all cursor-pointer ${
                      sel ? 'border-purple bg-purple/10' : 'border-white/10 bg-[#1A1A2E] hover:border-purple/40'
                    }`}
                  >
                    {sel && (
                      <div className="absolute top-2 right-2 w-5 h-5 bg-purple rounded-full flex items-center justify-center">
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    )}
                    <div className="text-xl mb-1.5">{skill.emoji}</div>
                    <div className="font-semibold text-white text-xs font-inter">{skill.label}</div>
                    <div className="text-white/40 text-[10px] font-inter mt-0.5">{skill.tagline}</div>
                  </button>
                );
              })}
            </div>

            {skillMeta && (
              <div className="bg-[#1E1A3A] border border-purple/40 rounded-xl p-4">
                <div className="text-sm text-white/80 font-inter leading-relaxed">{skillMeta.desc}</div>
                <div className="text-xs text-purple font-inter mt-2">Tools: {skillMeta.tools}</div>
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 text-white/50 hover:text-white font-inter text-sm bg-transparent border-0 cursor-pointer">
                <ArrowLeft size={16} /> Kembali
              </button>
              <button
                onClick={handleStartActivation}
                disabled={!localSkill}
                className="flex items-center gap-2 bg-purple hover:brightness-110 text-white font-bold px-7 py-3 rounded-xl transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed font-inter"
              >
                Mulai Journey <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Aktivasi Akun (non-interactive, auto-advances, no stepper label) ── */}
        {step === 3 && (
          <div className="animate-fade-in pt-6">
            <div
              className="rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[420px] overflow-hidden"
              style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4F46E9 100%)' }}
            >
              <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-2xl mb-6 animate-pop">
                <img src="/logo.png" alt="WADAH" className="w-full h-full object-cover" />
              </div>

              <h2 className="font-sora font-extrabold text-white text-2xl mb-2">
                Menyiapkan Journey {skillMeta?.label} Kamu...
              </h2>
              <p className="text-white/60 font-inter text-sm mb-8">Skill Map sedang disusun berdasarkan pilihanmu</p>

              <div className="w-full max-w-xs space-y-2.5 text-left mb-8">
                {ACTIVATION_CHECKS.map((label, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 text-white/70 text-xs font-inter animate-fade-in"
                    style={{ animationDelay: `${i * 0.5}s`, animationFillMode: 'both' }}
                  >
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin-fast flex-shrink-0" />
                    {label}
                  </div>
                ))}
              </div>

              <div className="w-full max-w-xs bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-purple to-indigo rounded-full"
                  style={{ width: barFilled ? '100%' : '0%', transition: `width ${ACTIVATION_DURATION - 200}ms linear` }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
