import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon, ShieldIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-[#172236] bg-[#06080e] text-slate-400">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1e2f4a] bg-[#0c1424]">
                <LogoIcon size={20} />
              </div>
              <div className="flex items-center gap-1">
                <span className="text-base font-bold text-white">Proof</span>
                <span className="text-base font-bold text-[#00f2fe]">Loop</span>
              </div>
            </Link>
            <p className="mt-3 text-sm text-slate-300 font-medium">
              Assess the engineering, not just the output.
            </p>
            <p className="mt-1.5 text-xs text-slate-400 leading-relaxed max-w-sm">
              Evidence-driven AI engineering assessment. Evaluate how developers reason with AI, validate invariants, isolate regressions, and harden production systems.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
              <span>All telemetry engines operational (Frontend-only demo)</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Platform</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/assessment" className="hover:text-[#00f2fe] transition-colors">
                  Assessment Workspace
                </Link>
              </li>
              <li>
                <Link to="/timeline" className="hover:text-[#00f2fe] transition-colors">
                  Verification Loop
                </Link>
              </li>
              <li>
                <Link to="/evidence" className="hover:text-[#00f2fe] transition-colors">
                  Evidence Ledger
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-[#00f2fe] transition-colors">
                  Reviewer Report
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-[#00f2fe] transition-colors">
                  Candidate & Reviewer Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Evidence Methodology */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-300">Methodology</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <span className="text-slate-400">Deterministic Invariant Testing</span>
              </li>
              <li>
                <span className="text-slate-400">AI Prompt & Output Telemetry</span>
              </li>
              <li>
                <span className="text-slate-400">Mean-Time-To-Root-Cause (MTTR)</span>
              </li>
              <li>
                <span className="text-slate-400">Resistance to AI Hallucinations</span>
              </li>
              <li>
                <span className="text-slate-400">Corroborated Fact Verification</span>
              </li>
            </ul>
          </div>

          {/* Responsible Assessment & Privacy */}
          <div className="rounded-lg border border-[#1c293e] bg-[#090f1a] p-3.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <ShieldIcon size={14} className="text-[#00f2fe]" />
              <span>Responsible Assessment</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-slate-400">
              ProofLoop operates on transparent evidence rather than black-box AI scores. Candidates inspect their own session logs, and reviewers evaluate verifiable actions rather than opaque probabilistic ratings.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 border-t border-[#141d2d] pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-400 gap-4">
          <p>© 2026 ProofLoop Systems Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 text-[11px] text-slate-400 font-mono">
            <span>Client State: localStorage Active</span>
            <span>•</span>
            <span>Version: 2.4.0-preview</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
