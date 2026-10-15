import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { LandingPage } from './pages/LandingPage';
import { AssessmentWorkspacePage } from './pages/AssessmentWorkspacePage';
import { VerificationLoopPage } from './pages/VerificationLoopPage';
import { EvidenceLedgerPage } from './pages/EvidenceLedgerPage';
import { ReviewerReportPage } from './pages/ReviewerReportPage';
import { FeedbackPage } from './pages/FeedbackPage';

const AppLayout: React.FC = () => {
  const location = useLocation();
  const isWorkspace = location.pathname.startsWith('/assessment');

  return (
    <div className="flex min-h-screen flex-col bg-[#070a10] text-slate-100 font-sans selection:bg-[#00f2fe]/30 selection:text-white">
      <Navbar />
      <main className="flex-1 flex flex-col">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/assessment" element={<AssessmentWorkspacePage />} />
          <Route path="/timeline" element={<VerificationLoopPage />} />
          <Route path="/evidence" element={<EvidenceLedgerPage />} />
          <Route path="/report" element={<ReviewerReportPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isWorkspace && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <AssessmentProvider>
      <BrowserRouter>
        <AppLayout />
      </BrowserRouter>
    </AssessmentProvider>
  );
}

export default App;
