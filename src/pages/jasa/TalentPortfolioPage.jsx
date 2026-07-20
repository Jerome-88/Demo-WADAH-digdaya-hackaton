import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTalentBySlug } from '../../data/jasaData';

export default function TalentPortfolioPage() {
  const navigate = useNavigate();
  const { talentSlug } = useParams();
  const talent = getTalentBySlug(talentSlug);

  useEffect(() => {
    if (!talent) navigate('/jasa', { replace: true });
  }, [talent, navigate]);

  if (!talent) return null;

  return (
    <div className="min-h-screen bg-[#0F0F1A]">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6 bg-[#1A1A2E]/95 backdrop-blur border-b border-white/5">
        <button
          onClick={() => navigate('/jasa', { state: { resumeStep: 2 } })}
          className="flex items-center gap-2 text-white/60 hover:text-white text-sm font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Hasil Matching</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Verified Portfolio
        </h1>
      </header>

      {/* Hero */}
      <div className="px-4 py-12 text-center" style={{ background: 'linear-gradient(180deg, #0F0F1A 0%, #1A1A2E 100%)' }}>
        {talent.avatarImg ? (
          <img src={talent.avatarImg} alt={talent.name} className="w-20 h-20 rounded-full object-cover border-2 border-purple/40 mx-auto mb-4" />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-sora font-bold text-2xl mx-auto mb-4"
            style={{ background: talent.avatarBg }}
          >
            {talent.initials}
          </div>
        )}
        <div className="inline-flex items-center gap-1.5 bg-green-500/10 border border-green-500/30 rounded-full px-3 py-1.5 mb-3">
          <i className="fa-solid fa-circle-check text-green-400 text-xs"></i>
          <span className="text-green-400 text-xs font-bold font-inter">AI Verified — WADAH Career Sandbox</span>
        </div>
        <h2 className="text-white font-sora font-extrabold text-2xl mb-1">{talent.name}</h2>
        <p className="text-white/50 font-inter text-sm mb-6">{talent.role}</p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { value: talent.score, label: 'Skor keseluruhan' },
            { value: talent.riwayat.length, label: 'Simulasi selesai' },
            { value: `${talent.matchPct}%`, label: 'Match proyekmu' },
          ].map(stat => (
            <div key={stat.label} className="bg-white/[0.03] border border-white/10 rounded-xl px-5 py-3 min-w-[110px]">
              <div className="text-white font-sora font-extrabold text-xl">{stat.value}</div>
              <div className="text-white/40 text-[11px] font-inter mt-0.5">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-4 py-10 space-y-8">
        {/* Breakdown skor */}
        <section>
          <h3 className="text-white font-sora font-bold text-sm mb-4">📊 Breakdown Skor Kompetensi</h3>
          <div className="bg-[#1A1A2E] border border-white/10 rounded-2xl p-5 space-y-4">
            {talent.competencies.map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-xs font-inter mb-1.5">
                  <span className="text-white/70">{c.label}</span>
                  <span className="text-white font-bold">{c.score}</span>
                </div>
                <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-green-500 to-green-400"
                    initial={{ width: '0%' }}
                    whileInView={{ width: `${c.score * 10}%` }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.9, ease: 'easeOut' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Riwayat simulasi */}
        <section>
          <h3 className="text-white font-sora font-bold text-sm mb-4">🏆 Riwayat Simulasi</h3>
          <div className="space-y-2.5">
            {talent.riwayat.map(r => (
              <div key={r.task + r.umkm} className="flex items-center gap-3 bg-[#1A1A2E] border border-white/10 rounded-xl p-3.5">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg shrink-0">{r.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-white text-sm font-semibold font-inter truncate">{r.task} — {r.umkm}</div>
                </div>
                <div className="text-green-400 font-bold text-sm font-inter shrink-0">{r.score}/10</div>
              </div>
            ))}
          </div>
        </section>

        {/* Skill terverifikasi */}
        <section>
          <h3 className="text-white font-sora font-bold text-sm mb-4">⚡ Skill Terverifikasi</h3>
          <div className="flex flex-wrap gap-2">
            {talent.skills.map(s => (
              <span key={s} className="text-xs bg-purple/10 text-purple border border-purple/25 px-3 py-1.5 rounded-full font-inter">{s}</span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => navigate(`/jasa/kontrak/${talent.slug}`)}
            className="w-full bg-purple hover:brightness-110 text-white font-bold py-3.5 rounded-xl transition-all text-sm cursor-pointer border-0"
          >
            Hubungi {talent.name.split(' ')[0]}
          </button>
          <button
            onClick={() => navigate('/jasa', { state: { resumeStep: 2 } })}
            className="w-full border border-white/15 text-white/60 hover:bg-white/5 font-semibold py-3 rounded-xl transition-all text-sm cursor-pointer bg-transparent"
          >
          Kembali ke Hasil Matching
          </button>
        </section>
      </main>
    </div>
  );
}
