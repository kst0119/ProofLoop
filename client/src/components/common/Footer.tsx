import React from 'react';
import { Link } from 'react-router-dom';
import { LogoIcon, ShieldIcon } from './Icons';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-auto border-t border-default bg-base text-secondary">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4 lg:grid-cols-5">
          {/* Brand Col */}
          <div className="md:col-span-2">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg shadow-sm">
                <LogoIcon size={30} />
              </div>
              <div className="flex items-center gap-1">
                <span className="font-serif text-base font-bold text-primary">Proof</span>
                <span className="font-serif text-base font-bold text-brand">Loop</span>
              </div>
            </Link>
            <p className="mt-3 font-serif text-sm font-semibold text-primary">
              Assess the engineering, not just the output.
            </p>
            <p className="mt-1.5 text-xs text-secondary leading-relaxed max-w-sm">
              Evidence-driven AI engineering assessment platform. Understand how developers reason with AI, validate invariants, isolate regressions, and harden production systems.
            </p>
            <div className="mt-4 flex items-center gap-2 text-xs text-muted">
              <span className="h-2 w-2 rounded-full bg-[#126646] dark:bg-[#52D3A2]"></span>
              <span>Evidence Ledger & Telemetry Verification Engine Active</span>
            </div>
          </div>

          {/* Navigation Links */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Platform</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link to="/workspace" className="hover:text-brand transition-colors">
                  Assessment Workspace
                </Link>
              </li>
              <li>
                <Link to="/verification" className="hover:text-brand transition-colors">
                  Verification Loop
                </Link>
              </li>
              <li>
                <Link to="/evidence" className="hover:text-brand transition-colors">
                  Evidence Ledger
                </Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-brand transition-colors">
                  Reviewer Report
                </Link>
              </li>
              <li>
                <Link to="/feedback" className="hover:text-brand transition-colors">
                  Reviewer Feedback
                </Link>
              </li>
            </ul>
          </div>

          {/* Evidence Methodology */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary">Methodology</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <span className="text-secondary">Deterministic Invariant Testing</span>
              </li>
              <li>
                <span className="text-secondary">AI Prompt & Output Telemetry</span>
              </li>
              <li>
                <span className="text-secondary">Mean Time to Root-Cause (MTTR)</span>
              </li>
              <li>
                <span className="text-secondary">Resistance to AI Hallucinations</span>
              </li>
              <li>
                <span className="text-secondary">Corroborated Fact Verification</span>
              </li>
            </ul>
          </div>

          {/* Responsible Assessment & Ethics */}
          <div className="rounded-xl border border-default bg-surface p-4 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <ShieldIcon size={14} className="text-brand" />
              <span>Transparent Assessment</span>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-secondary">
              ProofLoop operates on inspectable evidence rather than black-box AI scores. Candidates inspect their session telemetry, and evaluators verify actual evidence instead of opaque probabilistic ratings.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 border-t border-default pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-muted gap-4">
          <p>© 2026 ProofLoop Systems. Evidence-Driven Engineering Assessment.</p>
          <div className="flex items-center gap-3 text-[11px] font-mono text-muted">
            <span>Local State: Persistent</span>
            <span>•</span>
            <span>Edition: Jury-Ready Release</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
