import { useNavigate } from 'react-router-dom';
import { CheckCircle, Star, ArrowRight, Zap } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import ScoreBar from '../../components/ScoreBar';
import { useApp } from '../../context/AppContext';

const PORTFOLIO_WORKS = [
  {
    emoji: '🏮',
    title: 'Banner Promosi Toko Mode',
    client: 'Toko Busana Ibu Sari',
    score: 76.5,
    category: 'Desain Grafis',
    date: 'April 2026',
    verified: true,
    new: false,
    highlight: false,
  },
  {
    emoji: '🍜',
    title: 'Infografis Menu Restoran',
    client: 'Resto Padang Minang',
    score: 78.5,
    category: 'Desain Grafis',
    date: 'Mei 2026',
    verified: true,
    new: false,
    highlight: false,
  },
  {
    emoji: '🍛',
    title: 'Konten Instagram Pak Budi',
    client: 'Warung Makan Pak Budi',
    score: 79,
    category: 'Social Media Content',
    date: '30 Mei 2026',
    verified: true,
    new: true,
    highlight: true,
  },
];

const SKILLS = ['Desain Grafis', 'Canva', 'Adobe Photoshop', 'Color Theory', 'Typography', 'Instagram Content'];

export default function PortfolioPage() {
  const navigate = useNavigate();
  const { verificationSubmitted } = useApp();

  const visibleWorks = PORTFOLIO_WORKS.filter(w => !w.highlight || verificationSubmitted);

  return (
    <div className="flex min-h-screen bg-bg">
      <Sidebar activePage="portfolio" />

      <main className="ml-60 flex-1">
        {/* Hero section */}
        <div
          className="px-8 py-10"
          style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 60%, #4F46E9 100%)' }}
        >
          {/* Verified badge */}
          <div className="inline-flex items-center gap-2 bg-green/20 border border-green/40 rounded-full px-3 py-1.5 mb-5">
            <CheckCircle size={13} className="text-green" />
            <span className="text-green text-xs font-semibold font-inter">WADAH Verified Talent</span>
          </div>

          <div className="flex items-start gap-5">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo to-purple flex items-center justify-center flex-shrink-0 shadow-xl border-4 border-white/20">
              <img src="/rina.jpg" className="w-20 h-20 rounded-full"></img>
            </div>

            <div>
              <h1 className="font-sora font-bold text-white text-3xl leading-tight">Rina Kusumawati</h1>
              <p className="text-white/70 font-inter mt-1">Desain Grafis &amp; Konten Media Sosial</p>

              <div className="flex items-center gap-2 mt-2">
                <span className="inline-flex items-center gap-1.5 bg-white/15 border border-white/25 rounded-full px-3 py-1 text-xs text-white font-semibold font-inter">
                  Level 3 · Verified Beginner
                </span>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-5 mt-4">
                <div className="text-center">
                  <div className="font-sora font-bold text-white text-xl">79%</div>
                  <div className="text-white/50 text-xs font-inter">Skor avg</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="font-sora font-bold text-white text-xl">3</div>
                  <div className="text-white/50 text-xs font-inter">Karya</div>
                </div>
                <div className="w-px h-8 bg-white/20" />
                <div className="text-center">
                  <div className="font-sora font-bold text-white text-xl">1.5jam</div>
                  <div className="text-white/50 text-xs font-inter">Lebih cepat</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-8 py-6 max-w-4xl">
          {/* Status bar */}
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="flex items-center gap-2 bg-green/10 border border-green/30 rounded-xl px-4 py-2.5">
              <span className="w-2 h-2 rounded-full bg-green animate-pulse-dot" />
              <span className="text-green font-semibold text-sm font-inter">Tersedia untuk proyek baru</span>
            </div>
            <button
              onClick={() => navigate('/rina/match')}
              className="flex items-center gap-2 bg-indigo text-white text-sm font-bold px-4 py-2.5 rounded-xl hover:bg-indigo-dark transition-all active:scale-95 font-inter"
            >
              1 Smart Match Baru!
            </button>
          </div>

          {/* Portfolio grid */}
          <h2 className="font-sora font-bold text-deep text-lg mb-4">Portofolio Terverifikasi</h2>
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 mb-7">
            {visibleWorks.map(work => (
              <div
                key={work.title}
                className={`bg-white rounded-2xl border-2 overflow-hidden hover:shadow-md transition-all ${
                  work.highlight ? 'border-green/40 shadow-green/10 shadow-sm' : 'border-gray-200'
                }`}
              >
                {/* Preview */}
                <div className={`h-36 flex items-center justify-center text-5xl ${
                  work.highlight
                    ? 'bg-gradient-to-br from-red-900 to-yellow-800'
                    : 'bg-gradient-to-br from-gray-100 to-gray-200'
                }`}>
                  {work.emoji}
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-sora font-bold text-deep text-sm leading-tight">{work.title}</div>
                      <div className="text-xs text-gray-400 font-inter mt-0.5">{work.client}</div>
                    </div>
                    {work.new && (
                      <span className="text-xs bg-green/10 text-green font-bold px-2 py-0.5 rounded-full font-inter flex-shrink-0">Baru</span>
                    )}
                  </div>

                  <div className="mt-3">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-gray-400 font-inter">Skor AI</span>
                      <span className="font-bold text-indigo font-inter">{work.score}%</span>
                    </div>
                    <ScoreBar score={work.score} color={work.score >= 79 ? 'green' : 'indigo'} animated />
                  </div>

                  <div className="flex items-center justify-between mt-3">
                    <span className="text-xs text-gray-400 font-inter">{work.date}</span>
                    {work.verified && (
                      <span className="flex items-center gap-1 text-xs text-green font-semibold font-inter">
                        <CheckCircle size={11} />
                        {work.highlight ? '✨ Baru Terverifikasi' : 'Verified'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Skills */}
          <div className="mb-7">
            <h2 className="font-sora font-bold text-deep text-lg mb-3">Skills Terverifikasi</h2>
            <div className="flex flex-wrap gap-2">
              {SKILLS.map(skill => (
                <span key={skill} className="flex items-center gap-1.5 bg-white border border-indigo/20 text-indigo text-sm px-3 py-1.5 rounded-full font-inter">
                  <CheckCircle size={11} className="text-green" />
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Smart Match CTA */}
          <div
            onClick={() => navigate('/rina/match')}
            className="bg-gradient-to-r from-green to-teal rounded-2xl p-5 cursor-pointer hover:opacity-95 transition-all hover:shadow-lg group"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-white font-sora font-bold">Smart Match Aktif!</span>
                </div>
                <p className="text-white/80 text-sm font-inter">
                  Ada proyek dari <strong className="text-white">Toko Batik Nusantara</strong> yang 87% cocok dengan profilmu
                </p>
              </div>
              <div className="flex items-center gap-2 text-white group-hover:gap-3 transition-all font-inter font-semibold text-sm">
                Lihat <ArrowRight size={16} />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
