import { useLocation, useNavigate } from 'react-router-dom';
import { Home } from 'lucide-react';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

  // The Skill Map, Profile, Unit, Submit, Certificate, Talenta onboarding,
  // and Jasa (UMKM matching/contract) pages own their own full-screen dark
  // header — this light navbar would show up as a jarring light strip above
  // them. /verifikasi is deliberately excluded: it's a public-facing page
  // and uses the light theme on purpose. "/" also owns its header now (see
  // LandingPage.jsx) since it needs marketing nav links this shared bar
  // doesn't have.
  const hasOwnHeader = location.pathname === '/' || location.pathname === '/rina/task' || location.pathname === '/rina/profile'
    || location.pathname.startsWith('/rina/submit') || location.pathname.startsWith('/unit/')
    || location.pathname.startsWith('/rina/sertifikat/')
    || location.pathname === '/jasa' || location.pathname.startsWith('/portfolio/')
    || location.pathname.startsWith('/jasa/') || location.pathname === '/talenta';
  if (hasOwnHeader) return null;

  return (
    <nav className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
      <div className="px-4 sm:px-6 flex items-center h-16 justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 group"
        >
          <div className="w-9 h-9 rounded-xl overflow-hidden flex items-center justify-center shadow">
            <img
              src="/logo.png"
              alt="Logo WADAH"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="leading-tight">
            <div className="font-sora font-extrabold text-deep text-lg leading-none">WADAH</div>
            <div className="text-[10px] text-gray-400 font-inter leading-none">Work-Simulation AI Driven Augmented Hiring</div>
          </div>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-deep transition-colors font-inter"
          >
            <Home size={15} />
            <span className="hidden sm:inline">Beranda</span>
          </button>
        </div>
      </div>
    </nav>
  );
}
