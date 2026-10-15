import React from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import {
  CheckCircleIcon,
  ClockIcon,
  ShieldIcon,
  CodeIcon,
  InfoIcon,
} from '../common/Icons';

export const TaskPanel: React.FC = () => {
  const { session, requirements, toggleRequirement, testSummary } = useAssessment();

  // Format time remaining
  const minutes = Math.floor(session.timeRemainingSeconds / 60);
  const seconds = session.timeRemainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const completedCount = requirements.filter((r) => r.completed).length;
  const progressPct = Math.round((completedCount / requirements.length) * 100);

  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-[#1a2539] bg-[#090e18] p-4 text-slate-200">
      {/* Assessment Header & Meta */}
      <div className="pb-3 border-b border-[#182338]">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[#00f2fe]">{session.sessionId}</span>
          <div className="flex items-center gap-1.5 rounded bg-[#101b2d] px-2 py-0.5 text-slate-300 border border-[#1e2e48]">
            <ClockIcon size={12} className="text-amber-400" />
            <span className="font-mono font-medium">{timeFormatted}</span>
          </div>
        </div>
        <h2 className="mt-2 text-sm font-bold text-white leading-snug">
          {session.assessmentTitle}
        </h2>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-[#0f2438] px-2 py-0.5 text-[11px] font-medium text-[#38bdf8] border border-[#1b3a58]">
            TypeScript / Node.js
          </span>
          <span className="rounded bg-[#1a1730] px-2 py-0.5 text-[11px] font-medium text-[#c084fc] border border-[#2b2250]">
            Staff Engineer Level
          </span>
          <span className="rounded bg-[#11241f] px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-[#1d3d34]">
            {testSummary.passed}/{testSummary.total} Tests Passing
          </span>
        </div>
      </div>

      {/* Engineering Scenario Description */}
      <div className="py-3 border-b border-[#182338]">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <InfoIcon size={14} className="text-[#00f2fe]" />
          <span>Scenario Overview</span>
        </div>
        <p className="mt-2 text-xs text-slate-300 leading-relaxed">
          You are refactoring the core preferences update route:{' '}
          <code className="text-[#00f2fe] bg-[#0c1626] px-1 py-0.5 rounded font-mono">
            PATCH /api/v2/users/:id/preferences
          </code>.
        </p>
        <div className="mt-2.5 rounded-lg border border-[#283750] bg-[#0d1627] p-2.5 text-[11px] text-slate-300 leading-relaxed">
          <strong className="text-amber-300 block mb-1">Critical Engineering Invariant:</strong>
          In previous releases, setting <code className="text-[#38bdf8] font-mono">twoFactorEnabled: false</code> was erroneously dropped because of a naive truthy check (<code className="text-slate-400 font-mono">val || existing</code>). Furthermore, updating nested privacy toggles (<code className="text-slate-400 font-mono">notifications.push</code>) inadvertently wiped out sibling keys (<code className="text-slate-400 font-mono">notifications.email</code>).
        </div>
      </div>

      {/* Requirements Checklist */}
      <div className="py-3 border-b border-[#182338]">
        <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-400">
          <span>Acceptance Criteria</span>
          <span className="font-mono text-[#00f2fe]">{progressPct}%</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#121c2d]">
          <div
            className="h-full bg-gradient-to-r from-[#00f2fe] to-[#10b981] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <ul className="mt-3 space-y-2">
          {requirements.map((req) => (
            <li
              key={req.id}
              onClick={() => toggleRequirement(req.id)}
              className="group flex cursor-pointer items-start gap-2.5 rounded-md p-1.5 hover:bg-[#101929] transition-colors"
            >
              <button
                type="button"
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  req.completed
                    ? 'border-emerald-500 bg-emerald-500/20 text-emerald-400'
                    : 'border-slate-600 bg-slate-900 group-hover:border-slate-500'
                }`}
                aria-label={`Toggle requirement ${req.id}`}
              >
                {req.completed && <CheckCircleIcon size={12} />}
              </button>
              <div className="flex-1 text-xs">
                <span className={req.completed ? 'text-slate-200' : 'text-slate-400'}>
                  {req.text}
                </span>
                {req.category === 'edge-case' && (
                  <span className="ml-1.5 inline-block rounded bg-amber-950/60 px-1.5 py-0.2 text-[9px] font-semibold text-amber-400 border border-amber-800/50">
                    Security
                  </span>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* API Payload Contract Snapshot */}
      <div className="mt-3 flex-1">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400">
          <CodeIcon size={14} className="text-[#38bdf8]" />
          <span>Expected Payload Contract</span>
        </div>
        <pre className="mt-2 rounded-lg border border-[#1b283d] bg-[#060910] p-2.5 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`// Example Input Patch
{
  "twoFactorEnabled": false,
  "notifications": {
    "push": false
  }
}

// Result Guarantee:
// - notifications.email remains true
// - twoFactorEnabled becomes false
// - auditTrail records mutated paths`}
        </pre>
      </div>

      {/* Telemetry Notice */}
      <div className="mt-4 rounded-lg border border-[#1b2b42] bg-[#0a1220] p-2.5 text-[10px] text-slate-400">
        <div className="flex items-center gap-1 text-slate-300 font-semibold mb-0.5">
          <ShieldIcon size={12} className="text-[#00f2fe]" />
          <span>ProofLoop Telemetry Active</span>
        </div>
        All code edits, test iterations, and AI prompt inquiries are timestamped and compiled into your candidate evidence ledger.
      </div>
    </div>
  );
};
