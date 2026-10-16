import React from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { ClockIcon, ShieldIcon, InfoIcon } from '../common/Icons';

export const TaskPanel: React.FC = () => {
  const { session, task, testSummary, activity } = useAssessment();
  const minutes = Math.floor(session.timeRemainingSeconds / 60);
  const seconds = session.timeRemainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  return (
    <div className="flex h-full flex-col overflow-y-auto border-r border-[#1a2539] bg-[#090e18] p-4 text-slate-200">
      <div className="pb-3 border-b border-[#182338]">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[#00f2fe] break-all">{session.sessionId || 'Starting session…'}</span>
          <div className="flex items-center gap-1.5 rounded bg-[#101b2d] px-2 py-0.5 text-slate-300 border border-[#1e2e48]">
            <ClockIcon size={12} className="text-amber-400" /><span className="font-mono font-medium">{timeFormatted}</span>
          </div>
        </div>
        <h2 className="mt-2 text-sm font-bold text-white leading-snug">{task?.title || 'Loading assessment task'}</h2>
        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-[#0f2438] px-2 py-0.5 text-[11px] font-medium text-[#38bdf8] border border-[#1b3a58]">{task?.language || 'JavaScript'}</span>
          <span className="rounded bg-[#11241f] px-2 py-0.5 text-[11px] font-medium text-emerald-400 border border-[#1d3d34]">{testSummary.passed}/{testSummary.total} visible tests passing</span>
          {activity === 'submitted' && <span className="rounded bg-[#11241f] px-2 py-0.5 text-[11px] font-medium text-emerald-300">Submitted</span>}
        </div>
      </div>

      <div className="py-3 border-b border-[#182338]">
        <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-400"><InfoIcon size={14} className="text-[#00f2fe]" /><span>Task Instructions</span></div>
        <p className="mt-2 whitespace-pre-wrap text-xs text-slate-300 leading-relaxed">{task?.instructions || 'Connecting to the ProofLoop API…'}</p>
      </div>

      <div className="py-3 border-b border-[#182338]">
        <div className="text-xs font-semibold uppercase tracking-wider text-slate-400">Visible Tests</div>
        <ul className="mt-2 space-y-2">
          {(task?.visibleTests || []).map((test) => (
            <li key={test.id} className="rounded-md border border-[#1b283d] bg-[#060910] p-2 text-[11px]">
              <span className="font-mono text-[#00f2fe]">{test.id}</span>
              <pre className="mt-1 whitespace-pre-wrap text-slate-300">{JSON.stringify(test.input)}</pre>
              <span className="text-slate-400">Expected: {test.expected}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-auto pt-4 rounded-lg border border-[#1b2b42] bg-[#0a1220] p-2.5 text-[10px] text-slate-400">
        <div className="flex items-center gap-1 text-slate-300 font-semibold mb-0.5"><ShieldIcon size={12} className="text-[#00f2fe]" /><span>Server-backed assessment</span></div>
        Timer is based on the server start time. The backend does not currently enforce expiry.
      </div>
    </div>
  );
};
