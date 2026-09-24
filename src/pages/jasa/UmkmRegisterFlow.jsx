import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getSupabase } from '../../lib/supabaseClient';

// UMKM-side counterpart of TalentaFlow.jsx — same Demo/Daftar Asli toggle
// and email+OTP mechanics, trimmed down: no skill picker (that's a
// per-project choice made later in JasaFlow, not part of identity) and no
// activation animation, since there's no skill map to "prepare" here.
const OTP_LENGTH = 6;
const STEP_LABELS = ['Data Diri', 'Verifikasi OTP'];

export default function UmkmRegisterFlow() {
  const navigate = useNavigate();
  const { mode, setMode, createRealUmkmProfile, hydrateUmkmFromBackend } = useApp();
  const isReal = mode === 'real';

  const [step, setStep] = useState(0);
  const [businessName, setBusinessName] = useState('');
  const [picName, setPicName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [resendCooldown, setResendCooldown] = useState(0);
  const [otpError, setOtpError] = useState(null);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const otpRefs = useRef([]);

  function useDemoProfile() {
    setBusinessName('Toko Batik Nusantara');
    setPicName('Siti Rahayu');
    setPhone('812-9988-7766');
  }

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

  // One flow for both register and login, same reasoning as TalentaFlow:
  // branching here on "does a umkm_profiles row already exist" avoids
  // re-asking a returning UMKM for details they already gave once.
  async function handleVerifyOtp() {
    if (!isReal) { navigate('/jasa'); return; }
    setVerifyingOtp(true);
    setOtpError(null);
    try {
      const { error } = await getSupabase().auth.verifyOtp({ email, token: otp.join(''), type: 'email' });
      if (error) throw error;

      try {
        await hydrateUmkmFromBackend(); // succeeds only if a umkm_profiles row already exists
        navigate('/jasa');
        return;
      } catch {
        // No profile yet — genuinely new, create it below.
      }
      await createRealUmkmProfile({ businessName, picName, phone });
      navigate('/jasa');
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

  useEffect(() => {
    if (step !== 1 || resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    return () => clearTimeout(t);
  }, [step, resendCooldown]);

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

      <h1
        className="text-center font-sora font-extrabold text-3xl sm:text-4xl md:text-5xl px-4 pt-8 pb-1"
        style={{ color: '#2b6fff' }}
      >
        Cari Talent Terbaikmu
      </h1>

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

      <div className="flex items-start justify-center gap-1 sm:gap-3 py-6 px-4 flex-shrink-0">
        {STEP_LABELS.map((label, i) => (
          <div key={label} className="flex items-start">
            <div className="flex flex-col items-center gap-2 w-20 sm:w-24">
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

      <main className="flex-1 w-full max-w-[680px] mx-auto px-4 pb-16">
        {/* ── STEP 0: Data Diri ── */}
        {step === 0 && (
          <div className="animate-fade-in flex flex-col gap-6">
            <div className="rounded-3xl p-6 sm:p-8 flex flex-col gap-6" style={{ background: '#f5f8fb' }}>
              <h2 className="font-sora font-bold text-2xl" style={{ color: '#0052ff' }}>Data Diri</h2>

              <div className="flex flex-col gap-5">
                <div>
                  <h3 className="font-inter font-bold text-sm uppercase tracking-wide mb-2" style={{ color: '#0052ff' }}>Nama Bisnis/UMKM</h3>
                  <input
                    value={businessName}
                    onChange={e => setBusinessName(e.target.value)}
                    placeholder="Contoh: Toko Batik Nusantara"
                    className="w-full rounded-2xl px-5 py-4 text-base text-[#1a1a1a] placeholder:text-[#797d85] font-inter border-[3px] border-dashed focus:outline-none"
                    style={{ background: '#cfddfb', borderColor: '#0052ff' }}
                  />
                </div>

                <div>
                  <h3 className="font-inter font-bold text-sm uppercase tracking-wide mb-2" style={{ color: '#0052ff' }}>Nama Pemilik/PIC</h3>
                  <input
                    value={picName}
                    onChange={e => setPicName(e.target.value)}
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
              disabled={!businessName.trim() || !picName.trim() || !phone.trim() || sendingOtp || (isReal && !email.trim())}
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
                    {isReal ? email : `+62 ${phone || '812-9988-7766'}`}
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
      </main>
    </div>
  );
}
