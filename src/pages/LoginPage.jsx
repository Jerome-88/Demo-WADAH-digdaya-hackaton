import { useState, useEffect, useRef } from 'react';
import { useNavigate, Navigate, Link } from 'react-router-dom';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { getSupabase } from '../lib/supabaseClient';
import { motion, AnimatePresence } from 'framer-motion';

const BLUE = '#4085ee';
const BLUE_STRONG = '#2b6fff';
const GREEN = '#00c897';
const ORANGE = '#f27418';

// Matches TalentaFlow's OTP length and this Supabase project's Auth setting
// (Authentication → Providers → Email → OTP length).
const OTP_LENGTH = 6;

export default function LoginPage() {
  const navigate = useNavigate();
  const { setMode, hydrateFromBackend, onboardingComplete, mode, authUser } = useApp();

  const [step, setStep] = useState(0); // 0 = email, 1 = OTP
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [sendError, setSendError] = useState(null);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const otpRefs = useRef([]);

  async function handleSendOtp(e) {
    e.preventDefault();
    if (!email.trim()) return;
    setSendingOtp(true);
    setSendError(null);
    try {
      // shouldCreateUser: false — this is a login form, not signup, so an
      // unregistered email fails fast here instead of silently creating one.
      const { error } = await getSupabase().auth.signInWithOtp({ email, options: { shouldCreateUser: false } });
      if (error) throw error;
      setOtp(Array(OTP_LENGTH).fill(''));
      setOtpError(null);
      setResendCooldown(30);
      setStep(1);
    } catch (err) {
      setSendError(err.message?.includes('Signups not allowed')
        ? 'Email ini belum terdaftar. Daftar dulu lewat "Register as Talent".'
        : err.message || 'Gagal mengirim kode OTP');
    } finally {
      setSendingOtp(false);
    }
  }

  async function handleVerifyOtp(e) {
    e.preventDefault();
    setVerifying(true);
    setOtpError(null);
    try {
      const { error } = await getSupabase().auth.verifyOtp({ email, token: otp.join(''), type: 'email' });
      if (error) throw error;

      setMode('real');
      try {
        await hydrateFromBackend();
        navigate('/rina/task');
      } catch {
        // Session exists but no `users` row yet — onboarding was started but
        // never finished. Send them to finish it instead of dead-ending here.
        navigate('/talenta');
      }
    } catch (err) {
      setOtpError(err.message || 'Kode OTP salah atau kedaluwarsa');
    } finally {
      setVerifying(false);
    }
  }

  async function handleResendOtp() {
    if (resendCooldown > 0) return;
    setResendCooldown(30);
    await getSupabase().auth.signInWithOtp({ email, options: { shouldCreateUser: false } }).catch(() => {});
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

  const otpComplete = otp.every(d => d !== '');

  useEffect(() => {
    if (step !== 1 || resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendCooldown]);

  // Already signed in this session — skip straight past the login form.
  if (mode === 'real' && authUser && onboardingComplete) return <Navigate to="/rina/task" replace />;

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

      <main className="flex-1 w-full max-w-md mx-auto px-4 py-16 flex flex-col justify-center">
        <h1 className="text-center font-sora font-extrabold text-3xl sm:text-4xl mb-8" style={{ color: '#2b6fff' }}>
          Masuk ke WADAH
        </h1>



        <div className="rounded-3xl p-6 sm:p-8" style={{ background: '#f5f8fb' }}>
          {step === 0 && (
            <form onSubmit={handleSendOtp} className="animate-fade-in flex flex-col gap-6">
              <div>
                <h3 className="font-inter font-bold text-sm uppercase tracking-wide mb-2" style={{ color: '#0052ff' }}>Email</h3>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="kamu@email.com"
                  autoFocus
                  className="w-full rounded-2xl px-5 py-4 text-base text-[#1a1a1a] placeholder:text-[#797d85] font-inter border-[3px] border-dashed focus:outline-none"
                  style={{ background: '#cfddfb', borderColor: '#0052ff' }}
                />
                <p className="text-xs font-inter mt-1.5" style={{ color: '#797d85' }}>Kode OTP dikirim ke email ini.</p>
              </div>

              {sendError && (
                <div className="rounded-xl p-3 text-sm font-inter font-semibold text-center" style={{ background: '#fdecec', color: '#e5484d' }}>
                  {sendError}
                </div>
              )}

              <button
                type="submit"
                disabled={!email.trim() || sendingOtp}
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

              <p className="text-center text-sm font-inter" style={{ color: '#797d85' }}>
                Belum punya akun?{' '}
                <Link to="/talenta" className="font-bold hover:underline" style={{ color: '#f27418' }}>Daftar sebagai Talent</Link>
              </p>
            </form>
          )}

          {step === 1 && (
            <form onSubmit={handleVerifyOtp} className="animate-fade-in flex flex-col items-center gap-6 text-center">
              <div>
                <h2 className="font-sora font-bold text-2xl mb-2" style={{ color: '#0052ff' }}>Verifikasi Email</h2>
                <p className="font-inter text-sm" style={{ color: '#0052ff' }}>
                  Kode {OTP_LENGTH} digit sudah dikirim ke{' '}
                  <span className="font-bold" style={{ color: '#f27418' }}>{email}</span>
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
                  <button type="button" onClick={handleResendOtp} className="font-semibold hover:underline bg-transparent border-0 cursor-pointer" style={{ color: '#f27418' }}>Kirim ulang</button>
                )}
              </div>

              <div className="flex justify-between w-full pt-2">
                <button type="button" onClick={() => setStep(0)} className="flex items-center gap-2 font-inter text-sm bg-transparent border-0 cursor-pointer" style={{ color: '#0052ff' }}>
                  <ArrowLeft size={16} /> Kembali
                </button>
                <button
                  type="submit"
                  disabled={!otpComplete || verifying}
                  className="flex items-center gap-2 text-white font-bold px-6 py-3 rounded-full transition-all text-sm cursor-pointer border-0 disabled:opacity-40 disabled:cursor-not-allowed font-inter hover:brightness-110"
                  style={{ background: '#2b6fff' }}
                >
                  {verifying ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                      Memverifikasi...
                    </>
                  ) : (
                    <>Masuk <ArrowRight size={16} /></>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </main>
    </div>
  );
}
