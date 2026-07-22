import { useNavigate } from 'react-router-dom';
import { ArrowRight, Users, Briefcase, CheckCircle, Star, Zap, Shield, TrendingUp, ArrowBigLeft, ArrowRightIcon } from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { resetDemo } = useApp();

  function handleResetDemo() {
    if (window.confirm('Reset progres demo (level, XP, sertifikat, dll) dan mulai dari awal?')) {
      resetDemo();
    }
  }

  return (
    <div className="animate-fade-in">
      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4F46E9 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-indigo/30 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

        <div className="relative max-w-5xl mx-auto px-6 py-20 text-center">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6 backdrop-blur-sm">
            <span className="text-white/90 text-xs font-semibold font-inter tracking-wide">Hackathon Demo Digdaya x Bank Indonesia 2026</span>
          </div>

          <h1 className="font-sora font-extrabold text-white text-5xl sm:text-6xl leading-tight mb-5">
            Learn - <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-amber">Prove</span> - <span className="text-transparent bg-clip-text bg-gradient-to-r from-green to-teal">Earn</span>
          </h1>


          {/* Problem statement */}
          <div className="inline-block bg-white/10 border border-white/20 rounded-xl px-6 py-4 mb-10 backdrop-blur-sm max-w-2xl">
            <p className="text-white/90 text-base font-inter text-justify">
              Punya kemampuan tapi tidak punya pengalaman, butuh talenta namun kesulitan untuk memverifikasinya. WADAH adalah platform karir digital di mana talenta muda berlatih melalui simulasi kerja bergamifikasi, membangun portofolio terverifikasi, dan terhubung langsung dengan pelaku usaha yang membutuhkan
            </p>
          </div>

          {/* CTA buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <button
              onClick={() => navigate('/jasa')}
              className="flex items-center gap-2 bg-white text-deep font-bold px-7 py-3.5 rounded-xl hover:bg-gray-50 transition-all shadow-lg hover:shadow-xl active:scale-95 font-inter text-base"
            >
              <Briefcase size={18} />
              Cari Talenta
            </button>
            <button
              onClick={() => navigate('/talenta')}
              className="flex items-center gap-2 bg-green text-white font-bold px-7 py-3.5 rounded-xl hover:bg-green-600 transition-all shadow-lg hover:shadow-xl active:scale-95 font-inter text-base border border-green/50"
            >
              <Users size={18} />
              Daftar sebagai Talenta
            </button>
          </div>
        </div>
      </section>


      {/* ── Path Cards ────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-6 py-16">
        <h2 className="font-sora font-bold text-deep text-3xl text-center mb-2">Solusi Kami</h2>
        <p className="text-gray-500 text-center font-inter mb-10">Dua jalur, satu tujuan untuk mempertemukan kebutuhan dan kemampuan</p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Pengguna Jasa */}
          <div
            onClick={() => navigate('/jasa')}
            className="group cursor-pointer bg-white rounded-2xl border-2 border-gray-100 p-8 hover:border-indigo/40 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-indigo/10 flex items-center justify-center mb-5 group-hover:bg-indigo/20 transition-colors">
              <Briefcase size={28} className="text-indigo" />
            </div>
            <h3 className="font-sora font-bold text-deep text-2xl mb-3">Pengguna Jasa</h3>
            <p className="text-gray-500 font-inter mb-5 leading-relaxed">
              UMKM & bisnis yang membutuhkan talenta kreatif terverifikasi. Dapatkan matching berbasis AI dengan track record nyata.
            </p>
            <ul className="space-y-2 mb-6">
              {['Klarifikasi kebutuhan via AI', 'Matching talenta otomatis', 'Portofolio terverifikasi'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600 font-inter">
                  <CheckCircle size={15} className="text-green flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-indigo font-semibold font-inter group-hover:gap-3 transition-all">
              Mulai Cari Talenta <ArrowRight size={16} />
            </div>
          </div>

          {/* Penyedia Jasa */}
          <div
            onClick={() => navigate('/talenta')}
            className="group cursor-pointer bg-white rounded-2xl border-2 border-gray-100 p-8 hover:border-green/40 hover:shadow-xl transition-all duration-300"
          >
            <div className="w-14 h-14 rounded-2xl bg-green/10 flex items-center justify-center mb-5 group-hover:bg-green/20 transition-colors">
              <Users size={28} className="text-green" />
            </div>
            <h3 className="font-sora font-bold text-deep text-2xl mb-3">Penyedia Jasa</h3>
            <p className="text-gray-500 font-inter mb-5 leading-relaxed">
              Talenta muda yang ingin membangun karier. Buktikan kemampuan lewat simulasi kerja nyata, bangun portofolio terverifikasi.
            </p>
            <ul className="space-y-2 mb-6">
              {['Simulasi kerja nyata UMKM', 'Direview human reviewer', 'Verified Portfolio'].map(item => (
                <li key={item} className="flex items-center gap-2 text-sm text-gray-600 font-inter">
                  <CheckCircle size={15} className="text-green flex-shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
            <div className="flex items-center gap-2 text-green font-semibold font-inter group-hover:gap-3 transition-all">
              Mulai Perjalanan Karier <ArrowRight size={16} />
            </div>
          </div>
        </div>
      </section>

      {/* ── Cara Kerja ────────────────────────────────────────── */}
      <section className="bg-white py-16">
        <div className="max-w-5xl mx-auto px-6">
          <h2 className="font-sora font-bold text-deep text-3xl text-center mb-2">Cara Kerja WADAH</h2>
          <p className="text-gray-500 text-center font-inter mb-12">Proses transparan, adil, dan berbasis bukti nyata</p>

          <div className="grid md:grid-cols-2 gap-10">
            {/* UMKM Side */}
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-indigo flex items-center justify-center">
                  <Briefcase size={15} className="text-white" />
                </div>
                <h3 className="font-sora font-bold text-deep text-lg">Untuk UMKM & Bisnis</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Describe Kebutuhan', desc: 'Ceritakan proyek Anda, AI akan mengklarifikasi detail secara otomatis' },
                  { step: '02', title: 'Terima Matching AI', desc: 'Sistem mencocokkan talenta berdasarkan skill, skor, dan track record' },
                  { step: '03', title: 'Pilih & Hubungi', desc: 'Lihat portofolio terverifikasi, pilih yang paling cocok, langsung kolaborasi' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-indigo/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-sora font-bold text-indigo text-sm">{step}</span>
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
            <div>
              <div className="flex items-center gap-2 mb-5">
                <div className="w-8 h-8 rounded-lg bg-green flex items-center justify-center">
                  <Users size={15} className="text-white" />
                </div>
                <h3 className="font-sora font-bold text-deep text-lg">Untuk Talenta Muda</h3>
              </div>
              <div className="space-y-4">
                {[
                  { step: '01', title: 'Daftar & Upload CV', desc: 'Daftarkan skill, upload CV/portofolio, AI menentukan level awalmu' },
                  { step: '02', title: 'Kerjakan Simulasi', desc: 'Terima tugas simulasi berdasarkan tugas nyata, kerjakan dengan bantuan AI Tutor' },
                  { step: '03', title: 'Bangun Track Record', desc: 'Hasil direview human reviewer, masuk portofolio publik terverifikasi' },
                ].map(({ step, title, desc }) => (
                  <div key={step} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-green/10 flex items-center justify-center flex-shrink-0">
                      <span className="font-sora font-bold text-green text-sm">{step}</span>
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
        <h2 className="font-sora font-bold text-deep text-3xl text-center mb-10">Keunggulan WADAH</h2>
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-5">
          {[
            { icon: Zap, title: 'AI-Powered Matching', desc: 'Pencocokan cerdas berdasarkan 40+ parameter kinerja', color: 'text-indigo', bg: 'bg-indigo/10' },
            { icon: Shield, title: 'Verifikasi Human', desc: 'Setiap karya diverifikasi profesional industri', color: 'text-green', bg: 'bg-green/10' },
            { icon: Star, title: 'Level System', desc: 'Progres transparan dari Beginner hingga Expert', color: 'text-amber', bg: 'bg-amber/10' },
            { icon: TrendingUp, title: 'Zero Bias', desc: 'Dinilai dari karya nyata, bukan latar belakang kampus', color: 'text-purple', bg: 'bg-purple/10' },
          ].map(({ icon: Icon, title, desc, color, bg }) => (
            <div key={title} className="bg-white rounded-xl p-5 border border-gray-100 hover:shadow-md transition-shadow">
              <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center mb-3`}>
                <Icon size={20} className={color} />
              </div>
              <h4 className="font-sora font-bold text-deep text-sm mb-1">{title}</h4>
              <p className="text-gray-500 text-xs font-inter leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>


      {/* ── Footer ────────────────────────────────────────────── */}
      <footer className="bg-deep border-t border-white/5 py-8 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-white to-white flex items-center justify-center">
            <img src="/logo.png" className='w-7 h-7 rounded-lg' />
          </div>
          <span className="text-white font-sora font-bold">WADAH</span>
        </div>
        <p className="text-white/40 text-xs font-inter">
          Work-simulation AI Driven Augmented Hiring · Hackathon Digdaya x Bank Indonesia 2026
        </p>
        <p className="text-white/30 text-xs font-inter mt-1">
          Semua data adalah simulasi untuk keperluan demo
        </p>
        <button
          onClick={handleResetDemo}
          className="text-white/20 hover:text-white/50 text-[11px] font-inter underline bg-transparent border-0 cursor-pointer mt-3 transition-colors"
        >
          🔄 Reset progres demo
        </button>
      </footer>
    </div>
  );
}
