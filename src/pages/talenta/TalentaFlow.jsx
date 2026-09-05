import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle, Upload } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupabase } from '../../lib/supabaseClient';
import { SKILLS } from '../../data/skillMaps';

const ACTIVATION_CHECKS = [
  'Menyusun kurikulum skill map',
  'Menyiapkan AI Mentor',
  'Mengaktifkan checkpoint pertama',
];
const ACTIVATION_DURATION = 2800;
// Demo mode's fake OTP and this Supabase project's real Email OTP (Auth →
// Providers → Email → OTP Length) are both set to the 6-digit convention.
const OTP_LENGTH = 6;
const STEP_LABELS = ['Data Diri', 'Verifikasi OTP', 'Pilih Skill'];

export default function TalentaFlow() {
  const navigate = useNavigate();
  const { setSelectedSkill, onboardingComplete, setOnboardingComplete, mode, setMode, createRealUserRow, hydrateFromBackend } = useApp();
  const isReal = mode === 'real';

  // step: 0=Data Diri, 1=Verifikasi OTP, 2=Pilih Skill, 3=Aktivasi (internal
  // only — not shown as a stepper label, plays automatically once a skill
  // is picked in step 2).
  const [step, setStep] = useState(0);
  const [localSkill, setLocalSkill] = useState(null);
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoUploaded, setPhotoUploaded] = useState(false);
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [barFilled, setBarFilled] = useState(false);
  const [otpError, setOtpError] = useState(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const [activating, setActivating] = useState(false);
  const [activationError, setActivationError] = useState(null);
  const otpRefs = useRef([]);

  function useDemoProfile() {
    setName('Rina Kusumawati');
    setPhone('812-3456-7890');
    setPhotoUploaded(true);
  }

  function simUploadPhoto() {
    setPhotoUploading(true);
    setTimeout(() => {
      setPhotoUploading(false);
      setPhotoUploaded(true);
    }, 1000);
  }

  // Real mode: requires the Supabase project's "Confirm signup" / "Magic
  // Link" email templates to include {{ .Token }} — Supabase's own default
  // templates only have a clickable link, no numeric code, so verifyOtp
  // below will get "Token has expired or is invalid" until that's added on
  // the dashboard side (Authentication → Email Templates).
  async function handleSendOtp() {
    setSendingOtp(true);
    setOtpError(null);
    if (isReal) {
      try {
        const { error } = await getSupabase().auth.signInWithOtp({ email, options: { shouldCreateUser: true } });
        if (error) throw error;
      } catch (err) {
        setSendingOtp(false);
        setOtpError(err.message || 'Gagal mengirim OTP');
        return;
      }
      setSendingOtp(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      setResendCooldown(30);
      setStep(1);
      return;
    }
    setTimeout(() => {
      setSendingOtp(false);
      setOtp(Array(OTP_LENGTH).fill(''));
      setResendCooldown(30);
      setStep(1);
    }, 900);
  }

  // One flow for both register and login — the email+OTP step is identical
  // either way, so branching on "does a profile already exist" right here
  // (rather than asking the user upfront which one they want) avoids
  // re-asking a returning user for name/phone/skill they already gave once.
  async function handleVerifyOtp() {
    if (!isReal) { setStep(2); return; }
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      const { error } = await getSupabase().auth.verifyOtp({ email, token: otp.join(''), type: 'email' });
      if (error) throw error;

      try {
        await hydrateFromBackend(); // succeeds only if a `users` row already exists
        navigate('/rina/task'); // returning user — skip Pilih Skill/Aktivasi entirely
        return;
      } catch {
        // No profile yet — genuinely new, continue registration below.
      }
      setStep(2);
    } catch (err) {
      setOtpError(err.message || 'Kode OTP salah atau kedaluwarsa');
    } finally {
      setVerifyingOtp(false);
    }
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

  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    if (isReal) {
      await getSupabase().auth.signInWithOtp({ email, options: { shouldCreateUser: true } }).catch(() => { });
    }
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
  // straight into the (non-interactive) activation animation below. In real
  // mode this is also where the `users` row gets created — it needs `skill`,
  // which isn't known until now (see backend/README.md's onboarding note:
  // there's no dedicated "create profile" endpoint, the frontend inserts it
  // directly with the user's own session).
  async function handleStartActivation() {
    setSelectedSkill(localSkill);
    if (!isReal) { setStep(3); return; }
    setActivating(true);
    setActivationError(null);
    try {
      await createRealUserRow({ name, phone, skill: localSkill });
      setStep(3);
    } catch (err) {
      setActivationError(err.message || 'Gagal membuat akun. Coba lagi.');
    } finally {
      setActivating(false);
    }
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
    <div className="min-h-screen bg-bg flex flex-col">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-white/95 backdrop-blur border-b border-gray-100 flex-shrink-0">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-gray-500 hover:text-[#1a1a1a] text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <ArrowLeft size={15} />
          <span>Beranda</span>
        </button>
      </header>

      {step < 3 && (
        <h1
          className="text-center font-sora font-extrabold text-3xl sm:text-4xl md:text-5xl px-4 pt-8 pb-1"
          style={{ color: '#2b6fff' }}
        >
          Mulai Perjalanan Kariermu
        </h1>
      )}

      {/* Demo vs Real mode toggle — locked once past Data Diri so switching
          mid-flow (e.g. after a real OTP was already sent) can't happen. */}
      {step === 0 && (
        <div className="flex justify-center px-4">
          <div className="inline-flex rounded-full p-1 gap-1" style={{ background: '#e1e8f2' }}>
            <button
              onClick={() => setMode('demo')}
              className="px-4 py-1.5 rounded-full text-xs font-bold font-inter transition-all cursor-pointer border-0"
              style={!isReal ? { background: '#f37219', color: '#fff' } : { color: '#797d85', background: 'transparent' }}
            >
              Demo Cepat
            </button>
            <button
              onClick={() => setMode('real')}
              className="px-4 py-1.5 rounded-full text-xs font-bold font-inter transition-all cursor-pointer border-0"
              style={isReal ? { background: '#2b6fff', color: '#fff' } : { color: '#797d85', background: 'transparent' }}
            >
              Daftar Asli
            </button>
          </div>
        </div>
      )}

      {/* Step circles */}
      {step < 3 && (
        <div className="flex items-start justify-center gap-1 sm:gap-3 py-6 px-4 flex-shrink-0">
          {STEP_LABELS.map((label, i) => (
            <div key={label} className="flex items-start">
              <div className="flex flex-col items-center gap-2 w-16 sm:w-20">
                <div
                  className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-sora font-bold text-base sm:text-lg flex-shrink-0"
                  style={i <= step ? { background: '#00c897', color: '#fff' } : { background: '#c9f0e1', color: 'rgba(0,0,0,0.35)' }}
                >
                  {i < step ? <CheckCircle size={18} /> : i + 1}
                </div>
                <span className="text-[10px] sm:text-xs font-bold font-inter text-center leading-tight" style={{ color: '#1a1a1a' }}>{label}</span>
              </div>
              {i < STEP_LABELS.length - 1 && (
                <div className="h-0.5 w-6 sm:w-12 mt-5" style={{ background: i < step ? '#00c897' : '#c9f0e1' }} />
              )}
            </div>
          ))}
        </div>
      )}

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 pb-16">
        {/* ── STEP 0: Data Diri ── */}
        {step === 0 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div className="rounded-3xl p-6 sm:p-8 flex flex-col gap-6" style={{ background: '#f5f8fb' }}>
              <h2 className="font-sora font-bold text-2xl" style={{ color: '#0052ff' }}>Data Diri</h2>

              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-inter font-bold text-sm uppercase tracking-wide mb-2" style={{ color: '#0052ff' }}>Nama Lengkap</h3>
                  <input
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Nama lengkapmu"
                    className="w-full rounded-2xl px-5 py-4 text-base text-[#1a1a1a] placeholder:text-[#797d85] font-inter border-[3px] border-dashed focus:outline-none"
                    style={{ background: '#cfddfb', borderColor: '#0052ff' }}
                  />
                </div>

                {isReal && (
                  <div>
                    <h3 className="font-inter font-bold text-sm uppercase tracking-wide mb-2" style={{ color: '#0052ff' }}>Email</h3>
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="kamu@email.com"
                      className="w-full rounded-2xl px-5 py-4 text-base text-[#1a1a1a] placeholder:text-[#797d85] font-inter border-[3px] border-dashed focus:outline-none"
                      style={{ background: '#cfddfb', borderColor: '#0052ff' }}
                    />
                    <p className="text-xs font-inter mt-1.5" style={{ color: '#797d85' }}>Kode OTP asli dikirim ke email ini.</p>
                  </div>
                )}

                <div>
                  <h3 className="font-inter font-bold text-sm uppercase tracking-wide mb-2" style={{ color: '#0052ff' }}>Nomor HP</h3>
                  <div className="flex items-center gap-2">
                    <span
                      className="rounded-2xl px-4 py-4 text-base font-bold font-inter border-[3px] border-dashed"
                      style={{ background: '#cfddfb', borderColor: '#0052ff', color: '#797d85' }}
                    >
                      +62
                    </span>
                    <input
                      value={phone}
                      onChange={e => setPhone(e.target.value.replace(/[^\d-]/g, ''))}
                      placeholder="812-3456-7890"
                      className="flex-1 rounded-2xl px-5 py-4 text-base font-bold placeholder:font-normal text-[#1a1a1a] placeholder:text-[#797d85] font-inter border-[3px] border-dashed focus:outline-none"
                      style={{ background: '#cfddfb', borderColor: '#0052ff' }}
                    />
                  </div>
                </div>

                <div>
                  <h3 className="font-inter font-bold text-sm uppercase tracking-wide mb-2" style={{ color: '#0052ff' }}>
                    Foto Profil
                  </h3>

                  {!photoUploading && !photoUploaded && (
                    <button
                      onClick={simUploadPhoto}
                      className="flex items-center gap-3 w-full rounded-2xl p-4 border-[3px] border-dashed hover:brightness-95 transition-all text-left cursor-pointer"
                      style={{ background: '#cfddfb', borderColor: '#0052ff' }}
                    >
                      <Upload size={20} style={{ color: '#0052ff' }} />
                      <span className="text-base font-inter" style={{ color: '#797d85' }}>Upload Foto Profil</span>
                    </button>
                  )}

                  {photoUploading && (
                    <div className="flex items-center gap-3 rounded-2xl p-4 border-[3px] border-dashed" style={{ background: '#cfddfb', borderColor: '#0052ff' }}>
                      <div className="w-6 h-6 rounded-full border-2 animate-spin-fast flex-shrink-0" style={{ borderColor: '#0052ff', borderTopColor: 'transparent' }} />
                      <span className="text-base font-inter" style={{ color: '#0052ff' }}>Mengupload...</span>
                    </div>
                  )}

                  {photoUploaded && (
                    <div className="flex items-center gap-3 rounded-2xl p-4 border-[3px] border-dashed" style={{ background: '#cfddfb', borderColor: '#0052ff' }}>
                      <img src="/rina.jpg" alt="Foto profil" className="w-11 h-11 rounded-full object-cover border-2 border-white" />
                      <span className="text-sm font-semibold font-inter flex items-center gap-1.5" style={{ color: '#00c897' }}>
                        <CheckCircle size={16} /> Foto berhasil diupload
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {!isReal && (
                <button onClick={useDemoProfile} className="self-start text-sm font-inter underline bg-transparent border-0 cursor-pointer" style={{ color: '#f27418' }}>
                  Isi contoh cepat (demo)
                </button>
              )}
            </div>

            {otpError && (
              <div className="rounded-xl p-3 text-sm font-inter font-semibold text-center" style={{ background: '#fdecec', color: '#e5484d' }}>
                {otpError}
              </div>
            )}

            <button
              onClick={handleSendOtp}
              disabled={!name.trim() || !phone.trim() || sendingOtp || (isReal && !email.trim())}
              className="w-full flex items-center justify-center gap-2 text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed font-inter hover:brightness-110"
              style={{ background: '#2b6fff' }}
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
          <div className="animate-fade-in flex flex-col gap-6">
            <div className="rounded-3xl p-6 sm:p-8 flex flex-col items-center gap-6 text-center" style={{ background: '#f5f8fb' }}>
              <div>
                <h2 className="font-sora font-bold text-2xl sm:text-3xl mb-2" style={{ color: '#0052ff' }}>Verifikasi {isReal ? 'Email' : 'Nomor HP'}</h2>
                <p className="font-inter text-base" style={{ color: '#0052ff' }}>
                  Kode {OTP_LENGTH} digit sudah dikirim ke{' '}
                  <span className="font-bold" style={{ color: '#f27418' }}>
                    {isReal ? email : `+62 ${phone || '812-3456-7890'}`}
                  </span>
                </p>
              </div>

              <div className="flex justify-center gap-2 sm:gap-3">
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={el => (otpRefs.current[i] = el)}
                    value={digit}
                    onChange={e => handleOtpChange(i, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(i, e)}
                    inputMode="numeric"
                    maxLength={1}
                    className="w-12 h-16 sm:w-[72px] sm:h-[84px] text-center text-2xl sm:text-3xl font-sora font-bold rounded-2xl border-[3px] border-dashed focus:outline-none"
                    style={{ background: '#cfddfb', borderColor: '#0052ff', color: '#1a1a1a' }}
                  />
                ))}
              </div>

              {!isReal && (
                <button onClick={fillDemoOtp} className="text-sm font-inter underline bg-transparent border-0 cursor-pointer" style={{ color: '#f27418' }}>
                  Isi contoh cepat (demo)
                </button>
              )}

              {otpError && (
                <div className="w-full rounded-xl p-3 text-sm font-inter font-semibold text-center" style={{ background: '#fdecec', color: '#e5484d' }}>
                  {otpError}
                </div>
              )}

              <div className="text-sm font-inter" style={{ color: '#f27418' }}>
                <span className="font-bold">Tidak menerima kode?</span>{' '}
                {resendCooldown > 0 ? (
                  <span>Kirim ulang ({resendCooldown}s)</span>
                ) : (
                  <button onClick={handleResendOtp} className="font-semibold hover:underline bg-transparent border-0 cursor-pointer" style={{ color: '#f27418' }}>Kirim ulang</button>
                )}
              </div>
            </div>

            <div className="flex justify-between w-full pt-2">
              <button onClick={() => setStep(0)} className="flex items-center gap-2 font-inter text-sm bg-transparent border-0 cursor-pointer" style={{ color: '#0052ff' }}>
                <ArrowLeft size={16} /> Kembali
              </button>
              <button
                onClick={handleVerifyOtp}
                disabled={!otpComplete || verifyingOtp}
                className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-full transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed font-inter hover:brightness-110"
                style={{ background: '#2b6fff' }}
              >
                {verifyingOtp ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                    Memverifikasi...
                  </>
                ) : (
                  <>Verifikasi <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 2: Pilih Skill (satu skill utama) — picking triggers activation directly ── */}
        {step === 2 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <h2 className="font-sora font-bold text-2xl" style={{ color: '#1a1a1a' }}>Pilih Skill Utamamu</h2>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5">
              {SKILLS.map(skill => {
                const sel = localSkill === skill.id;
                return (
                  <button
                    key={skill.id}
                    onClick={() => setLocalSkill(skill.id)}
                    className="relative p-3.5 rounded-2xl border-2 text-left transition-all cursor-pointer"
                    style={sel ? { borderColor: '#2b6fff', background: '#eef2fe' } : { borderColor: '#e5e9f0', background: '#fff' }}
                  >
                    {sel && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full flex items-center justify-center" style={{ background: '#2b6fff' }}>
                        <CheckCircle size={12} className="text-white" />
                      </div>
                    )}
                    <div className="text-xl mb-1.5">{skill.emoji}</div>
                    <div className="font-semibold text-xs font-inter" style={{ color: '#1a1a1a' }}>{skill.label}</div>
                    <div className="text-[10px] font-inter mt-0.5" style={{ color: '#797d85' }}>{skill.tagline}</div>
                  </button>
                );
              })}
            </div>

            {skillMeta && (
              <div className="rounded-2xl p-4 border-2" style={{ background: '#eef2fe', borderColor: '#2b6fff' }}>
                <div className="text-sm font-inter leading-relaxed" style={{ color: '#1a1a1a' }}>{skillMeta.desc}</div>
                <div className="text-xs font-inter mt-2" style={{ color: '#0052ff' }}>Tools: {skillMeta.tools}</div>
              </div>
            )}

            {activationError && (
              <div className="rounded-xl p-3 text-sm font-inter font-semibold text-center" style={{ background: '#fdecec', color: '#e5484d' }}>
                {activationError}
                {activationError.includes('Sesi login habis') && (
                  <button onClick={() => setStep(1)} className="block mx-auto mt-2 underline font-bold bg-transparent border-0 cursor-pointer" style={{ color: '#e5484d' }}>
                    Kembali ke Verifikasi OTP
                  </button>
                )}
              </div>
            )}

            <div className="flex justify-between">
              <button onClick={() => setStep(1)} className="flex items-center gap-2 font-inter text-sm bg-transparent border-0 cursor-pointer" style={{ color: '#0052ff' }}>
                <ArrowLeft size={16} /> Kembali
              </button>
              <button
                onClick={handleStartActivation}
                disabled={!localSkill || activating}
                className="flex items-center gap-2 text-white font-bold px-7 py-3 rounded-full transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed font-inter hover:brightness-110"
                style={{ background: '#2b6fff' }}
              >
                {activating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                    Membuat akun...
                  </>
                ) : (
                  <>Mulai Journey <ArrowRight size={16} /></>
                )}
              </button>
            </div>
          </div>
        )}

        {/* ── STEP 3: Aktivasi Akun (non-interactive, auto-advances, no stepper label) ── */}
        {step === 3 && (
          <div className="animate-fade-in pt-6">
            <div
              className="rounded-3xl p-8 sm:p-10 flex flex-col items-center justify-center text-center min-h-[420px] overflow-hidden"
              style={{ background: '#f5f8fb' }}
            >
              <img src="/map-journey.png" alt="" className="w-full max-w-xs mb-4 pointer-events-none select-none" />

              <h2 className="font-sora font-bold text-xl sm:text-2xl mb-2" style={{ color: '#0052ff' }}>
                Menyiapkan Journey {skillMeta?.label} Kamu...
              </h2>
              <p className="font-inter text-sm mb-8" style={{ color: '#0052ff' }}>Skill Map sedang disusun berdasarkan pilihanmu</p>

              <div className="w-full max-w-xs rounded-2xl p-4 space-y-3 text-left mb-8 bg-white border" style={{ borderColor: 'rgba(0,82,255,0.15)' }}>
                {ACTIVATION_CHECKS.map((label, i) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 text-sm font-inter font-medium animate-fade-in"
                    style={{ animationDelay: `${i * 0.5}s`, animationFillMode: 'both', color: '#f37219' }}
                  >
                    <div className="w-3.5 h-3.5 border-2 rounded-full animate-spin-fast flex-shrink-0" style={{ borderColor: 'rgba(0,82,255,0.2)', borderTopColor: '#0052ff' }} />
                    {label}
                  </div>
                ))}
              </div>

              <div className="w-full max-w-xs rounded-full h-2.5 overflow-hidden" style={{ background: '#d9d9d9' }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: barFilled ? '100%' : '0%',
                    transition: `width ${ACTIVATION_DURATION - 200}ms linear`,
                    background: 'linear-gradient(90deg, #00c897 0%, #2b6fff 50%, #f37219 100%)',
                  }}
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
