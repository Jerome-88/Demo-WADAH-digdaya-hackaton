import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { getTalentBySlug } from '../../data/jasaData';

const BLUE = '#2b6fff';
const GREEN = '#00c897';

export default function TalentPortfolioPage() {
  const navigate = useNavigate();
  const { talentSlug } = useParams();
  const talent = getTalentBySlug(talentSlug);

  useEffect(() => {
    if (!talent) navigate('/jasa', { replace: true });
  }, [talent, navigate]);

  if (!talent) return null;

  return (
    <div className="min-h-screen bg-white">
      <header className="sticky top-0 z-30 h-14 flex items-center px-4 md:px-6" style={{ background: BLUE }}>
        <button
          onClick={() => navigate('/jasa', { state: { resumeStep: 3 } })}
          className="flex items-center gap-2 text-white hover:text-white/80 text-sm font-bold font-inter transition-colors bg-transparent border-0 cursor-pointer"
        >
          <i className="fa-solid fa-arrow-left"></i>
          <span>Hasil Matching</span>
        </button>
        <h1 className="text-white text-xs sm:text-sm font-bold font-sora truncate absolute left-1/2 -translate-x-1/2 max-w-[55%] text-center">
          Verified Portfolio
        </h1>
      </header>

      {/* Hero */}
      <div className="px-4 py-12 text-center" style={{ background: '#f5f8fb' }}>
        {talent.avatarImg ? (
          <img src={talent.avatarImg} alt={talent.name} className="w-20 h-20 rounded-full object-cover border-2 mx-auto mb-4" style={{ borderColor: BLUE }} />
        ) : (
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center text-white font-sora font-bold text-2xl mx-auto mb-4"
            style={{ background: talent.avatarBg }}
          >
            {talent.initials}
          </div>
        )}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border-2" style={{ background: '#e3faf0', borderColor: GREEN }}>
            <i className="fa-solid fa-circle-check text-xs" style={{ color: GREEN }}></i>
            <span className="text-xs font-bold font-inter" style={{ color: GREEN }}>AI Verified — WADAH Career Sandbox</span>
          </div>
          {talent.certifications?.map(cert => (
            <div key={cert} className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 border-2" style={{ background: '#fff7ec', borderColor: '#f27418' }}>
              <i className="fa-solid fa-graduation-cap text-xs" style={{ color: '#f27418' }}></i>
              <span className="text-xs font-bold font-inter" style={{ color: '#f27418' }}>Certified — {cert}</span>
            </div>
          ))}
        </div>
        <h2 className="font-sora font-extrabold text-2xl mb-1" style={{ color: BLUE }}>{talent.name}</h2>
        <p className="text-sm mb-6 text-gray-500 font-inter">{talent.role}</p>

        <div className="flex items-center justify-center gap-3 flex-wrap">
          {[
            { value: talent.score, label: 'Skor keseluruhan' },
            { value: talent.riwayat.length, label: 'Simulasi selesai' },
            { value: `${talent.matchPct}%`, label: 'Match proyekmu' },
          ].map(stat => (
            <div key={stat.label} className="bg-white border-2 rounded-xl px-5 py-3 min-w-[110px]" style={{ borderColor: BLUE }}>
              <div className="font-sora font-extrabold text-xl" style={{ color: BLUE }}>{stat.value}</div>
              <div className="text-[11px] font-inter mt-0.5 text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      <main className="max-w-[800px] mx-auto px-4 py-10 space-y-8">
        {/* Breakdown skor */}
        <section>
          <h3 className="font-sora font-bold text-sm mb-4" style={{ color: BLUE }}>Breakdown Skor Kompetensi</h3>
          <div className="bg-white border-2 rounded-2xl p-5 space-y-4" style={{ borderColor: BLUE }}>
            {talent.competencies.map(c => (
              <div key={c.label}>
                <div className="flex justify-between text-xs font-inter mb-1.5">
                  <span className="text-gray-500">{c.label}</span>
                  <span className="font-bold" style={{ color: BLUE }}>{c.score}</span>
                </div>
                <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: '#e1e8f2' }}>
                  <motion.div
                    className="h-full rounded-full"
                    style={{ background: GREEN }}
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
          <h3 className="font-sora font-bold text-sm mb-4" style={{ color: BLUE }}>Riwayat Simulasi</h3>
          <div className="space-y-2.5">
            {talent.riwayat.map(r => (
              <div key={r.task + r.umkm} className="flex items-center gap-3 bg-white border-2 rounded-xl p-3.5" style={{ borderColor: BLUE }}>
                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg shrink-0" style={{ background: '#e1e8f2' }}>{r.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold font-inter truncate" style={{ color: '#1a1a1a' }}>{r.task} — {r.umkm}</div>
                </div>
                <div className="font-bold text-sm font-inter shrink-0" style={{ color: GREEN }}>{r.score}/10</div>
              </div>
            ))}
          </div>
        </section>

        {/* Skill terverifikasi */}
        <section>
          <h3 className="font-sora font-bold text-sm mb-4" style={{ color: BLUE }}>Skill Terverifikasi</h3>
          <div className="flex flex-wrap gap-2">
            {talent.skills.map(s => (
              <span key={s} className="text-xs px-3 py-1.5 rounded-full font-inter border-2" style={{ color: BLUE, borderColor: BLUE, background: '#eef2fe' }}>{s}</span>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="flex flex-col gap-3 pt-2">
          <button
            onClick={() => navigate(`/jasa/kontrak/${talent.slug}`)}
            className="w-full text-white font-bold py-3.5 rounded-full transition-all text-sm cursor-pointer border-0 hover:brightness-110"
            style={{ background: '#f27418' }}
          >
            Hubungi {talent.name.split(' ')[0]}
          </button>
          <button
            onClick={() => navigate('/jasa', { state: { resumeStep: 3 } })}
            className="w-full font-semibold py-3 rounded-full transition-all text-sm cursor-pointer bg-transparent border-2"
            style={{ color: 'white', background: GREEN }}
          >
            Kembali ke Hasil Matching
          </button>
        </section>
      </main>
    </div>
  );
}
