import { Routes, Route } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import Navbar from './components/Navbar';

import LandingPage      from './pages/LandingPage';
import JasaFlow         from './pages/jasa/JasaFlow';
import TalentaFlow      from './pages/talenta/TalentaFlow';
import RinaLevelResult  from './pages/rina/RinaLevelResult';
import RinaDashboard    from './pages/rina/RinaDashboard';
import RinaTask         from './pages/rina/RinaTask';
import RinaSubmit       from './pages/rina/RinaSubmit';
import EvaluationPage   from './pages/rina/EvaluationPage';
import VerificationPage from './pages/rina/VerificationPage';
import PortfolioPage    from './pages/rina/PortfolioPage';
import SmartMatchPage   from './pages/rina/SmartMatchPage';

function AppShell() {
  return (
    <div className="min-h-screen bg-bg">
      <Navbar />
      <Routes>
        <Route path="/"                  element={<LandingPage />} />
        <Route path="/jasa"              element={<JasaFlow />} />
        <Route path="/talenta"           element={<TalentaFlow />} />
        <Route path="/rina/level"        element={<RinaLevelResult />} />
        <Route path="/rina/dashboard"    element={<RinaDashboard />} />
        <Route path="/rina/task"         element={<RinaTask />} />
        <Route path="/rina/submit"       element={<RinaSubmit />} />
        <Route path="/rina/evaluation"   element={<EvaluationPage />} />
        <Route path="/rina/verification" element={<VerificationPage />} />
        <Route path="/rina/portfolio"    element={<PortfolioPage />} />
        <Route path="/rina/match"        element={<SmartMatchPage />} />
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
