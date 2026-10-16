import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AssessmentProvider } from './context/AssessmentContext';
import { ThemeProvider } from './context/ThemeContext';
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
  const isLandingPage = location.pathname === '/';
  const isWorkspace =
    location.pathname.startsWith('/workspace') ||
    location.pathname.startsWith('/assessment');

  return (
    <div className="flex min-h-screen flex-col bg-base text-primary font-sans transition-colors duration-150">
      <Navbar />
      <main className={`flex-1 flex flex-col ${isWorkspace ? 'min-h-0 min-w-0 overflow-hidden' : ''}`}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/workspace" element={<AssessmentWorkspacePage />} />
          <Route path="/assessment" element={<Navigate to="/workspace" replace />} />
          <Route path="/verification" element={<VerificationLoopPage />} />
          <Route path="/timeline" element={<Navigate to="/verification" replace />} />
          <Route path="/evidence" element={<EvidenceLedgerPage />} />
          <Route path="/report" element={<ReviewerReportPage />} />
          <Route path="/feedback" element={<FeedbackPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isWorkspace && !isLandingPage && <Footer />}
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <AssessmentProvider>
        <BrowserRouter>
          <AppLayout />
        </BrowserRouter>
      </AssessmentProvider>
    </ThemeProvider>
  );
}

export default App;
