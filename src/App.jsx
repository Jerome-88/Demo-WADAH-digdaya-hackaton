import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';

import LandingPage         from './pages/LandingPage';
import VerificationPage    from './pages/VerificationPage';
import JasaFlow            from './pages/jasa/JasaFlow';
import TalentPortfolioPage from './pages/jasa/TalentPortfolioPage';
import DraftKontrakPage    from './pages/jasa/DraftKontrakPage';
import NegoChatPage        from './pages/jasa/NegoChatPage';
import KontrakFinalPage    from './pages/jasa/KontrakFinalPage';
import TalentaFlow      from './pages/talenta/TalentaFlow';
import RinaTask         from './pages/rina/RinaTask';
import UnitPage         from './pages/rina/UnitPage';
import RinaSubmit       from './pages/rina/RinaSubmit';
import ProfilePage      from './pages/rina/ProfilePage';
import SmartMatchPage   from './pages/rina/SmartMatchPage';
import CertificatePage  from './pages/rina/CertificatePage';
import RinaCertification from './pages/rina/RinaCertification';

function AppShell() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Routes>
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/verifikasi/:certId" element={<VerificationPage />} />
        <Route path="/jasa"              element={<JasaFlow />} />
        <Route path="/portfolio/:talentSlug" element={<TalentPortfolioPage />} />
        <Route path="/jasa/kontrak/:talentSlug" element={<DraftKontrakPage />} />
        <Route path="/jasa/nego/:talentSlug" element={<NegoChatPage />} />
        <Route path="/jasa/kontrak-final/:talentSlug" element={<KontrakFinalPage />} />
        <Route path="/talenta"           element={<TalentaFlow />} />
        <Route path="/rina/task"         element={<RinaTask />} />
        <Route path="/unit/:unitParam"   element={<UnitPage />} />
        <Route path="/rina/submit/:checkpointId" element={<RinaSubmit />} />
        <Route path="/rina/profile"      element={<ProfilePage />} />
        <Route path="/rina/match"        element={<SmartMatchPage />} />
        <Route path="/rina/sertifikat/:skillId" element={<CertificatePage />} />
        <Route path="/rina/sertifikasi/:skillId" element={<RinaCertification />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppShell />
    </AppProvider>
  );
}
