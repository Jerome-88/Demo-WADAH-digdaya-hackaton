import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, Clock, Circle, ArrowRight, Zap } from 'lucide-react';
import { useApp } from '../../context/AppContext';

const STEPS_CONFIG = [
  { label: 'Karya dikumpulkan',      sub: '30 Mei 2026, 14:23' },
  { label: 'Evaluasi AI',            sub: 'Skor 79% — Lulus'   },
  { label: 'Verifikasi Human',       sub: 'Sedang diproses…'   },
  { label: 'Portofolio diperbarui',  sub: 'Menunggu verifikasi' },
];

const BONUS_XP = 20;

export default function VerificationPage() {
  const navigate = useNavigate();
  const { exp, addExp, setVerificationSubmitted } = useApp();
  const [verified, setVerified] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const bonusAwarded = useRef(false);

  useEffect(() => {
    setVerificationSubmitted(true);
  }, []);

  function simulateVerification() {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setVerified(true);
      if (!bonusAwarded.current) {
        bonusAwarded.current = true;
        addExp(BONUS_XP);
      }
    }, 2000);
  }

  function getStepState(index) {
    if (verified) return 'done';
    if (index < 2) return 'done';
    if (index === 2) return 'active';
    return 'pending';
  }

  return (
    <div className="animate-fade-in max-w-2xl mx-auto px-4 py-12">
      <div className="text-center mb-10">
        <h1 className="font-sora font-bold text-deep text-2xl mb-2">Status Verifikasi Karya</h1>
        <p className="text-gray-500 font-inter text-sm">Karyamu sedang melewati proses verifikasi berlapis</p>
      </div>

      {/* Step tracker */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">
        <div className="space-y-0">
          {STEPS_CONFIG.map((step, i) => {
            const state = getStepState(i);
            const isLast = i === STEPS_CONFIG.length - 1;
            return (
              <div key={i} className="relative">
                <div className="flex items-start gap-4 py-4">
                  <div className="relative z-10 flex-shrink-0">
                    {state === 'done' && (
                      <div className="w-10 h-10 rounded-full bg-green flex items-center justify-center">
                        <CheckCircle size={18} className="text-white" />
                      </div>
                    )}
                    {state === 'active' && (
                      <div className="w-10 h-10 rounded-full bg-amber/20 border-2 border-amber flex items-center justify-center">
                        <Clock size={16} className="text-amber animate-pulse-dot" />
                      </div>
                    )}
                    {state === 'pending' && (
                      <div className="w-10 h-10 rounded-full bg-gray-100 border-2 border-gray-200 flex items-center justify-center">
                        <Circle size={14} className="text-gray-300" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold font-inter text-sm ${
                      state === 'done' ? 'text-green' : state === 'active' ? 'text-amber' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </div>
                    <div className="text-xs text-gray-400 font-inter mt-0.5">{step.sub}</div>
                    {state === 'active' && !verified && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <div className="w-1.5 h-1.5 rounded-full bg-amber animate-pulse-dot" />
                        <span className="text-xs text-amber font-inter font-medium">Sedang diverifikasi oleh tim kurator…</span>
                      </div>
                    )}
                  </div>

                  {state === 'done' && i === 1 && (
                    <span className="text-xs bg-green/10 text-green font-semibold px-2.5 py-1 rounded-full font-inter flex-shrink-0">79% ✓</span>
                  )}
                </div>

                {!isLast && (
                  <div className={`absolute left-5 top-14 bottom-0 w-0.5 ${
                    state === 'done' ? 'bg-green' : 'bg-gray-200'
                  }`} style={{ height: '16px' }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Pending state */}
      {!verified && (
        <div className="space-y-4 animate-fade-in">
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="font-semibold text-blue-700 font-inter text-sm mb-1">ℹ️ Tentang Verifikasi Human</div>
            <p className="text-blue-600 text-xs font-inter leading-relaxed">
              Tim kurator WADAH akan memverifikasi karyamu dalam 1–2 hari kerja. Mereka memastikan karya orisinal, tidak dibantu AI generatif berlebihan, dan sesuai standar kualitas platform.
            </p>
          </div>

          <div className="bg-amber/10 border border-amber/30 rounded-xl p-5">
            <div className="font-sora font-bold text-amber text-sm mb-2">⚡ Demo Mode — Percepat Simulasi</div>
            <p className="text-gray-600 text-sm font-inter mb-4">
              Dalam demo ini, kita bisa langsung simulasikan proses verifikasi selesai tanpa menunggu.
            </p>
            <button
              onClick={simulateVerification}
              disabled={simulating}
              className="w-full flex items-center justify-center gap-2 bg-amber text-white font-bold py-3 rounded-xl hover:bg-amber-600 transition-all disabled:opacity-60 active:scale-95 font-inter"
            >
              {simulating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin-fast" />
                  Mensimulasikan…
                </>
              ) : (
                'Simulasikan Verifikasi Selesai'
              )}
            </button>
          </div>
        </div>
      )}

      {/* Verified success state */}
      {verified && (
        <div className="space-y-5 animate-pop">
          {/* Celebration */}
          <div className="bg-gradient-to-r from-green to-teal rounded-2xl p-6 text-center">
            <div className="text-4xl mb-3">🎉</div>
            <h2 className="font-sora font-bold text-white text-xl mb-1">Karya Terverifikasi!</h2>
            <p className="text-white/80 font-inter text-sm">Karyamu sudah masuk ke portofolio publik WADAH</p>
          </div>

          {/* Bonus XP */}
          <div className="bg-indigo/10 border border-indigo/20 rounded-2xl p-4 flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo rounded-full flex items-center justify-center flex-shrink-0 shadow">
              <Zap size={22} className="text-white" />
            </div>
            <div>
              <div className="font-sora font-bold text-indigo text-base">+{BONUS_XP} XP Bonus Verifikasi!</div>
              <div className="text-gray-600 text-sm font-inter">Total XP kamu sekarang: <span className="font-bold text-indigo">{exp}</span></div>
            </div>
          </div>

          {/* Verifier note */}
          <div className="bg-white rounded-2xl border border-green/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo to-purple flex items-center justify-center">
                <span className="text-white font-sora font-bold text-xs">JD</span>
              </div>
              <div>
                <div className="font-semibold text-gray-800 font-inter text-sm">Joko Darmawan</div>
                <div className="text-xs text-gray-400 font-inter">Senior Designer · Tim Kurator WADAH</div>
              </div>
              <span className="ml-auto text-xs bg-green/10 text-green font-semibold px-2.5 py-1 rounded-full font-inter">Terverifikasi ✓</span>
            </div>
            <p className="text-gray-600 text-sm font-inter leading-relaxed italic">
              "Karya orisinal, bukan AI-generated. Hierarki visual baik, warna brand konsisten. Catatan kecil: ukuran font CTA bisa sedikit lebih besar untuk aksesibilitas. Overall layak untuk portofolio Level 3."
            </p>
          </div>

          <button
            onClick={() => navigate('/rina/portfolio')}
            className="w-full flex items-center justify-center gap-2 bg-green text-white font-bold py-4 rounded-xl hover:bg-green-600 transition-all active:scale-95 font-inter text-base shadow-md"
          >
            Lihat Portofolio
            <ArrowRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
}
