import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LogoIcon,
  MenuIcon,
  XIcon,
  RefreshCwIcon,
  SunIcon,
  MoonIcon,
} from './Icons';
import { useAssessment } from '../../context/AssessmentContext';
import { useTheme } from '../../context/ThemeContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { session, resetAllDemoData } = useAssessment();
  const { theme, toggleTheme } = useTheme();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const isLandingPage = location.pathname === '/';

  // Application navigation links
  const appNavLinks = [
    { path: '/workspace', label: 'Workspace' },
    { path: '/verification', label: 'Verification Loop' },
    { path: '/evidence', label: 'Evidence Ledger' },
    { path: '/report', label: 'Reviewer Report' },
    { path: '/feedback', label: 'Feedback' },
  ];

  const isActive = (path: string) => {
    if (path === '/workspace' && location.pathname === '/assessment') return true;
    if (path === '/verification' && location.pathname === '/timeline') return true;
    return location.pathname === path;
  };

  const handleReset = () => {
    resetAllDemoData();
    setResetConfirmOpen(false);
  };

  const scrollToSection = (id: string) => {
    if (!isLandingPage) {
      navigate('/#' + id);
      return;
    }
    const elem = document.getElementById(id);
    if (elem) {
      elem.scrollIntoView({ behavior: 'smooth' });
    }
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-default bg-surface backdrop-blur-md transition-colors duration-150">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* ==========================================================================
            PUBLIC LANDING PAGE HEADER
            Clean, intentional, public-facing
            ========================================================================== */}
        {isLandingPage ? (
          <>
            {/* Left: Brand */}
            <div className="flex items-center gap-8">
              <Link
                to="/"
                className="group flex items-center gap-2.5 transition-opacity hover:opacity-95"
                title="ProofLoop — Assess the engineering, not just the output"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
                  <LogoIcon size={32} />
                </div>
                <div className="flex items-center gap-1">
                  <span className="font-serif text-xl font-bold tracking-tight text-primary">Proof</span>
                  <span className="font-serif text-xl font-bold tracking-tight text-forest">Loop</span>
                </div>
              </Link>
            </div>

            {/* Center/Right: Landing Navigation Anchors */}
            <nav className="hidden md:flex items-center gap-6 text-xs font-semibold">
              <button
                type="button"
                onClick={() => scrollToSection('how-it-works')}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                How It Works
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('why-evidence')}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                Why Evidence Matters
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('audiences')}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                Built for Two Audiences
              </button>
              <button
                type="button"
                onClick={() => scrollToSection('preview')}
                className="text-secondary hover:text-primary transition-colors cursor-pointer"
              >
                Interactive Preview
              </button>
            </nav>

            {/* Far Right: Theme Toggle & Single Primary CTA */}
            <div className="flex items-center gap-3">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-default bg-surface text-secondary hover:text-primary hover:border-medium transition-colors shadow-2xs"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              </button>

              {/* One Clear Primary Action on Landing Page */}
              <Link
                to="/workspace"
                className="btn-primary text-xs font-semibold px-4 shadow-sm"
              >
                <span>Start Demo Assessment</span>
              </Link>

              {/* Mobile Menu Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-default bg-surface text-secondary hover:text-primary md:hidden"
                aria-label="Toggle Navigation Menu"
              >
                {mobileMenuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
              </button>
            </div>
          </>
        ) : (
          /* ==========================================================================
             APPLICATION WORKSPACE HEADER
             Focused, structured, task-oriented
             ========================================================================== */
          <>
            {/* Left: Brand + Quick Back Link */}
            <div className="flex items-center gap-7">
              <Link
                to="/"
                className="group flex items-center gap-2.5 transition-opacity hover:opacity-95"
                title="Return to Public Overview"
              >
                <div className="relative flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
                  <LogoIcon size={30} />
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center gap-1">
                    <span className="font-serif text-base font-bold tracking-tight text-primary">Proof</span>
                    <span className="font-serif text-base font-bold tracking-tight text-forest">Loop</span>
                  </div>
                  <span className="text-[9px] font-mono font-bold tracking-tight text-muted hidden sm:block uppercase">
                    Evaluation Console
                  </span>
                </div>
              </Link>

              {/* Center: Primary Application Navigation */}
              <nav className="hidden lg:flex items-center gap-1">
                {appNavLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      className={`relative px-3 py-1.5 rounded-md text-xs font-semibold tracking-tight transition-all ${
                        active
                          ? 'bg-surface text-forest shadow-xs border border-default'
                          : 'text-secondary hover:text-primary hover:bg-surface-elevated'
                      }`}
                    >
                      {link.label}
                      {active && (
                        <span className="absolute -bottom-px left-2 right-2 h-0.5 bg-forest rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Right: Session Info, Reset Trigger, Theme Toggle */}
            <div className="flex items-center gap-2.5">
              {/* Contextual Session ID Indicator */}
              <div className="hidden sm:flex items-center gap-2 rounded-md border border-default bg-surface px-2.5 py-1 text-xs text-secondary shadow-2xs">
                <span className="relative flex h-2 w-2">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#126646] opacity-60"></span>
                  <span className="relative inline-flex h-2 w-2 rounded-full bg-[#126646]"></span>
                </span>
                <span className="font-mono text-[11px] text-muted">Session:</span>
                <span className="font-mono text-[11px] font-semibold text-primary">{session.sessionId}</span>
              </div>

              {/* Reset Demo Trigger */}
              <button
                onClick={() => setResetConfirmOpen(true)}
                className="hidden sm:flex items-center gap-1 rounded-md border border-default bg-surface px-2.5 py-1 text-xs font-medium text-muted hover:border-medium hover:text-primary shadow-2xs transition-colors"
                title="Reset simulated assessment state to baseline"
              >
                <RefreshCwIcon size={12} />
                <span>Reset</span>
              </button>

              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-default bg-surface text-secondary hover:text-primary hover:border-medium transition-colors shadow-2xs"
                aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} theme`}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? <MoonIcon size={16} /> : <SunIcon size={16} />}
              </button>

              {/* Mobile Drawer Trigger */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="flex h-9 w-9 items-center justify-center rounded-md border border-default bg-surface text-secondary hover:text-primary lg:hidden"
                aria-label="Toggle Application Menu"
              >
                {mobileMenuOpen ? <XIcon size={18} /> : <MenuIcon size={18} />}
              </button>
            </div>
          </>
        )}
      </div>

      {/* ==========================================================================
          MOBILE NAVIGATION DRAWER
          Responsive layout adapted for small screens
          ========================================================================== */}
      {mobileMenuOpen && (
        <div className="border-b border-default bg-base px-4 py-4 md:hidden animate-fade-in shadow-md">
          {isLandingPage ? (
            <div className="flex flex-col gap-2">
              <button
                onClick={() => scrollToSection('how-it-works')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-secondary hover:bg-surface"
              >
                How It Works
              </button>
              <button
                onClick={() => scrollToSection('why-evidence')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-secondary hover:bg-surface"
              >
                Why Evidence Matters
              </button>
              <button
                onClick={() => scrollToSection('audiences')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-secondary hover:bg-surface"
              >
                Built for Two Audiences
              </button>
              <button
                onClick={() => scrollToSection('preview')}
                className="text-left px-3 py-2 rounded-md text-sm font-medium text-secondary hover:bg-surface"
              >
                Interactive Preview
              </button>
              <div className="pt-2 border-t border-default">
                <Link
                  to="/workspace"
                  onClick={() => setMobileMenuOpen(false)}
                  className="btn-primary text-xs w-full justify-center"
                >
                  Start Demo Assessment
                </Link>
              </div>
            </div>
          ) : (
            <div>
              <div className="mb-3 flex items-center justify-between pb-3 border-b border-default">
                <div className="flex items-center gap-2 text-xs font-mono text-secondary">
                  <span className="h-2 w-2 rounded-full bg-[#126646]" />
                  <span>Session: {session.sessionId}</span>
                </div>
                <button
                  onClick={() => {
                    handleReset();
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center gap-1 text-xs text-muted hover:text-primary"
                >
                  <RefreshCwIcon size={12} />
                  Reset Demo
                </button>
              </div>
              <div className="flex flex-col gap-1">
                {appNavLinks.map((link) => {
                  const active = isActive(link.path);
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        active
                          ? 'bg-surface text-forest font-semibold border border-default shadow-2xs'
                          : 'text-secondary hover:bg-surface'
                      }`}
                    >
                      <span>{link.label}</span>
                      {active && <span className="h-1.5 w-1.5 rounded-full bg-forest" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-default bg-surface p-5 shadow-2xl animate-fade-in">
            <h3 className="font-serif text-base font-bold text-primary">Reset Assessment Demo?</h3>
            <p className="mt-2 text-xs text-secondary leading-relaxed">
              This will restore candidate code, test assertion outputs, reviewer recommendations, and feedback records back to clean baseline data.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="btn-secondary text-xs"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="btn-primary text-xs"
              >
                Reset Baseline
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
