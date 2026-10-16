import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LogoIcon,
  MenuIcon,
  XIcon,
  RefreshCwIcon,
  EyeIcon,
  UserIcon,
} from './Icons';
import { useAssessment } from '../../context/AssessmentContext';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const { session, currentRole, setCurrentRole, resetAllDemoData } = useAssessment();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);

  const navLinks = [
    { path: '/', label: 'Overview' },
    { path: '/assessment', label: 'Assessment Workspace' },
    { path: '/timeline', label: 'Verification Loop' },
    { path: '/evidence', label: 'Evidence Ledger' },
    { path: '/report', label: 'Reviewer Report' },
    { path: '/feedback', label: 'Feedback' },
  ];

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  const handleReset = () => {
    resetAllDemoData();
    setResetConfirmOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-[#1b263b] bg-[#070a10]/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand & Wordmark */}
        <div className="flex items-center gap-8">
          <Link
            to="/"
            className="group flex items-center gap-2.5 transition-opacity hover:opacity-90"
            title="ProofLoop — Assess the engineering, not just the output"
          >
            <div className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f2f4a] bg-[#0e1626] shadow-sm transition-colors group-hover:border-[#00f2fe]/40">
              <LogoIcon size={22} />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold tracking-tight text-white">Proof</span>
                <span className="text-lg font-bold tracking-tight text-[#00f2fe]">Loop</span>
                <span className="rounded bg-[#0e2238] px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#38bdf8] border border-[#183a5a]">
                  DEMO
                </span>
              </div>
              <span className="text-[10px] text-slate-400 font-mono tracking-tight hidden sm:block">
                EVIDENCE-DRIVEN ASSESSMENT
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`relative px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    active
                      ? 'bg-[#121c2e] text-[#00f2fe] shadow-sm border border-[#233552]'
                      : 'text-slate-300 hover:text-white hover:bg-[#0d1522]'
                  }`}
                >
                  {link.label}
                  {active && (
                    <span className="absolute -bottom-px left-2 right-2 h-0.5 bg-gradient-to-r from-[#00f2fe] to-[#10b981]" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: Session status, Role toggle & Demo controls */}
        <div className="hidden sm:flex items-center gap-3">
          {/* Active Session Badge */}
          <div className="flex items-center gap-2 rounded-full border border-[#1b2b42] bg-[#0d1624] px-3 py-1 text-xs text-slate-300">
            <span className={`relative inline-flex h-2 w-2 rounded-full ${session.sessionId ? 'bg-emerald-500' : 'bg-slate-600'}`}></span>
            <span className="font-mono text-slate-400">ID:</span>
            <span className="font-mono font-medium text-slate-200">{session.sessionId || 'No active session'}</span>
          </div>

          {/* Role Switcher */}
          <button
            onClick={() => setCurrentRole(currentRole === 'candidate' ? 'reviewer' : 'candidate')}
            className={`flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-medium transition-all ${
              currentRole === 'reviewer'
                ? 'border-purple-500/40 bg-purple-950/40 text-purple-200 hover:bg-purple-900/40'
                : 'border-teal-500/40 bg-teal-950/40 text-teal-200 hover:bg-teal-900/40'
            }`}
            title={`Switch view mode. Current: ${currentRole}`}
          >
            {currentRole === 'reviewer' ? <EyeIcon size={14} /> : <UserIcon size={14} />}
            <span className="capitalize">{currentRole} View</span>
          </button>

          {/* Reset Demo State Trigger */}
          <button
            onClick={() => setResetConfirmOpen(true)}
            className="flex items-center gap-1 rounded-md border border-[#233047] bg-[#0d1420] px-2.5 py-1 text-xs text-slate-400 hover:border-slate-600 hover:text-slate-200"
            title="Reset simulated assessment state"
          >
            <RefreshCwIcon size={13} />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>

        {/* Mobile menu button */}
        <div className="flex items-center gap-2 lg:hidden">
          <button
            onClick={() => setCurrentRole(currentRole === 'candidate' ? 'reviewer' : 'candidate')}
            className="rounded border border-[#1e2e46] bg-[#0d1624] px-2 py-1 text-xs text-slate-300 sm:hidden"
          >
            {currentRole === 'reviewer' ? 'Reviewer' : 'Candidate'}
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#1f2f4a] bg-[#0e1626] text-slate-300 hover:text-white"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <XIcon size={20} /> : <MenuIcon size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="border-b border-[#1b263b] bg-[#090d16] px-4 py-4 lg:hidden">
          <div className="mb-3 flex items-center justify-between pb-3 border-b border-[#1b263b]">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              <span>Session: {session.sessionId || 'No active session'}</span>
            </div>
            <button
              onClick={() => {
                handleReset();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              <RefreshCwIcon size={12} />
              Reset Demo
            </button>
          </div>
          <div className="flex flex-col gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center justify-between px-3 py-2 rounded-md text-sm font-medium ${
                    active
                      ? 'bg-[#121c2e] text-[#00f2fe] border border-[#233552]'
                      : 'text-slate-300 hover:bg-[#0e1726]'
                  }`}
                >
                  <span>{link.label}</span>
                  {active && <span className="h-1.5 w-1.5 rounded-full bg-[#00f2fe]" />}
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Reset Confirmation Modal */}
      {resetConfirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-xl border border-[#24354f] bg-[#0f1726] p-5 shadow-2xl">
            <h3 className="text-base font-semibold text-white">Reset Assessment Demo?</h3>
            <p className="mt-2 text-xs text-slate-300 leading-relaxed">
              This resets the local code draft and visible test results. It does not delete the server assessment or its evidence.
            </p>
            <div className="mt-5 flex justify-end gap-2.5">
              <button
                onClick={() => setResetConfirmOpen(false)}
                className="rounded-lg border border-[#22334d] px-3.5 py-1.5 text-xs font-medium text-slate-300 hover:bg-[#142034]"
              >
                Cancel
              </button>
              <button
                onClick={handleReset}
                className="rounded-lg bg-teal-500 px-3.5 py-1.5 text-xs font-semibold text-black hover:bg-teal-400"
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
