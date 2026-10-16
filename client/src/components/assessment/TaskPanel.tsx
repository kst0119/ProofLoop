import React from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import {
  CheckCircleIcon,
  ClockIcon,
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
    <div className="flex h-full flex-col overflow-y-auto border-r border-[#DFD9CE] bg-[#FAF8F5] p-4 text-[#191715]">
      {/* Assessment Header & Meta */}
      <div className="pb-3 border-b border-[#DFD9CE]">
        <div className="flex items-center justify-between text-xs text-[#736E64]">
          <span className="font-mono font-bold text-[#144A3F]">{session.sessionId}</span>
          <div className="flex items-center gap-1.5 rounded-md bg-white px-2 py-0.5 text-[#57524A] border border-[#DFD9CE] shadow-2xs">
            <ClockIcon size={12} className="text-[#B94A2D]" />
            <span className="font-mono font-semibold">{timeFormatted}</span>
          </div>
        </div>
        <h2 className="mt-2 font-serif text-sm font-bold text-[#191715] leading-snug">
          {session.assessmentTitle}
        </h2>
        <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-white px-2 py-0.5 text-[10px] font-mono font-semibold text-[#144A3F] border border-[#DFD9CE]">
            TypeScript / Node.js
          </span>
          <span className="rounded bg-white px-2 py-0.5 text-[10px] font-mono font-semibold text-[#57524A] border border-[#DFD9CE]">
            Staff Engineer Level
          </span>
          <span className="rounded bg-[#EDF7F2] px-2 py-0.5 text-[10px] font-mono font-bold text-[#126646] border border-[#A3DBC4]">
            {testSummary.passed}/{testSummary.total} Tests Passing
          </span>
        </div>
      </div>

      {/* Engineering Scenario Description */}
      <div className="py-3 border-b border-[#DFD9CE]">
        <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#736E64]">
          <InfoIcon size={13} className="text-[#144A3F]" />
          <span>Engineering Scenario</span>
        </div>
        <p className="mt-2 text-xs text-[#4A463F] leading-relaxed">
          Refactor the production preferences endpoint:{' '}
          <code className="text-[#144A3F] bg-white border border-[#DFD9CE] px-1 py-0.5 rounded font-mono font-semibold">
            PATCH /api/v2/users/:id/preferences
          </code>.
        </p>
        <div className="mt-2.5 rounded-lg border border-[#F6CE9F] bg-[#FEF6EC] p-3 text-xs text-[#7F3F08] leading-relaxed shadow-2xs">
          <strong className="block mb-1 font-bold">Critical Engineering Invariant:</strong>
          In previous releases, setting <code className="font-mono font-semibold">twoFactorEnabled: false</code> was erroneously dropped because of a naive truthy check (<code className="font-mono">val || existing</code>). Furthermore, updating nested toggles (<code className="font-mono">notifications.push</code>) inadvertently wiped out sibling keys (<code className="font-mono">notifications.email</code>).
        </div>
      </div>

      {/* Acceptance Criteria Checklist */}
      <div className="py-3 border-b border-[#DFD9CE]">
        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-[#736E64]">
          <span>Acceptance Criteria</span>
          <span className="font-mono font-bold text-[#144A3F]">{progressPct}%</span>
        </div>

        {/* Progress Bar */}
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[#DFD9CE]">
          <div
            className="h-full bg-[#144A3F] transition-all duration-300"
            style={{ width: `${progressPct}%` }}
          />
        </div>

        <ul className="mt-3 space-y-2">
          {requirements.map((req) => (
            <li
              key={req.id}
              onClick={() => toggleRequirement(req.id)}
              className="group flex cursor-pointer items-start gap-2.5 rounded-md p-1.5 hover:bg-white transition-colors"
            >
              <button
                type="button"
                className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                  req.completed
                    ? 'border-[#126646] bg-[#126646] text-white'
                    : 'border-[#CAC2B3] bg-white group-hover:border-[#144A3F]'
                }`}
                aria-label={`Toggle requirement ${req.id}`}
              >
                {req.completed && <CheckCircleIcon size={12} />}
              </button>
              <div className="flex-1 text-xs">
                <span
                  className={
                    req.completed
                      ? 'text-[#736E64] line-through'
                      : 'text-[#191715] font-medium'
                  }
                >
                  {req.text}
                </span>
                <span className="ml-1.5 rounded bg-white px-1 py-0.2 text-[9px] font-mono font-semibold uppercase text-[#736E64] border border-[#DFD9CE]">
                  {req.category}
                </span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Candidate Guidance Notes */}
      <div className="pt-3">
        <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#736E64] block mb-1">
          ASSESSMENT TELEMETRY NOTICE
        </span>
        <p className="text-[11px] text-[#736E64] leading-relaxed">
          Your code edits, invariant test runs, and copilot prompts are logged to your session's inspectable evidence ledger. Strive for defensive correctness, zero regressions, and clean recursion.
        </p>
      </div>
    </div>
  );
};
