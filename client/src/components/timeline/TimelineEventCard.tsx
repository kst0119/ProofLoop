import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import type { TimelineEvent } from '../../types';
import {
  CodeIcon,
  BotIcon,
  TerminalIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ExternalLinkIcon,
  UserIcon,
} from '../common/Icons';

interface TimelineEventCardProps {
  event: TimelineEvent;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const TimelineEventCard: React.FC<TimelineEventCardProps> = ({
  event,
  isSelected = false,
  onSelect,
}) => {
  const [expanded, setExpanded] = useState(isSelected);

  const getBadgeStyle = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'PROMPT':
        return 'bg-purple-950/60 text-purple-300 border-purple-800/40';
      case 'AI_SUGGESTION':
        return 'bg-cyan-950/60 text-cyan-300 border-cyan-800/40';
      case 'CODE_EDIT':
        return 'bg-blue-950/60 text-blue-300 border-blue-800/40';
      case 'TEST_RUN':
        return event.status === 'success'
          ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800/40'
          : 'bg-rose-950/60 text-rose-300 border-rose-800/40';
      case 'DEBUG_ACTION':
        return 'bg-amber-950/60 text-amber-300 border-amber-800/40';
      case 'VERIFICATION':
        return 'bg-teal-950/60 text-teal-300 border-teal-800/40';
      default:
        return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  const getStatusIcon = () => {
    switch (event.status) {
      case 'success':
        return <CheckCircleIcon size={14} className="text-emerald-400" />;
      case 'failure':
        return <XCircleIcon size={14} className="text-rose-400" />;
      case 'warning':
        return <AlertCircleIcon size={14} className="text-amber-400" />;
      default:
        return <CheckCircleIcon size={14} className="text-[#00f2fe]" />;
    }
  };

  const getAuthorIcon = () => {
    switch (event.author) {
      case 'candidate':
        return <UserIcon size={12} className="text-slate-300" />;
      case 'ai':
        return <BotIcon size={12} className="text-[#00f2fe]" />;
      case 'system':
        return <TerminalIcon size={12} className="text-amber-400" />;
    }
  };

  return (
    <div
      className={`rounded-xl border transition-all ${
        isSelected
          ? 'border-[#00f2fe]/60 bg-[#0e1728] shadow-lg shadow-cyan-950/20'
          : 'border-[#1b273d] bg-[#0a101d] hover:border-[#273854]'
      }`}
    >
      {/* Event Header Card */}
      <div
        onClick={() => {
          setExpanded(!expanded);
          if (onSelect) onSelect();
        }}
        className="flex cursor-pointer items-start justify-between p-4 gap-3"
      >
        <div className="flex items-start gap-3 flex-1">
          {/* Sequence badge & status */}
          <div className="flex flex-col items-center">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#142034] text-xs font-mono font-bold text-white border border-[#233552]">
              #{event.seq}
            </span>
            <div className="mt-1">{getStatusIcon()}</div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={`rounded px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider border ${getBadgeStyle(
                  event.type
                )}`}
              >
                {event.type.replace('_', ' ')}
              </span>

              <span className="flex items-center gap-1 rounded bg-[#101b2c] px-2 py-0.5 text-[11px] font-mono text-slate-300 border border-[#1b2d49]">
                {getAuthorIcon()}
                <span className="capitalize">{event.author}</span>
              </span>

              <span className="font-mono text-xs text-slate-400">{event.relativeTime}</span>

              {event.relatedEvidenceId && (
                <Link
                  to={`/evidence?id=${event.relatedEvidenceId}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center gap-1 rounded bg-[#092233] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#00f2fe] border border-[#104364] hover:bg-[#0c2f47]"
                  title="View associated Evidence Item in Evidence Ledger"
                >
                  <span>{event.relatedEvidenceId}</span>
                  <ExternalLinkIcon size={10} />
                </Link>
              )}
            </div>

            <h3 className="mt-1.5 text-sm font-semibold text-white leading-snug">
              {event.title}
            </h3>

            <p className="mt-1 text-xs text-slate-300 leading-relaxed">
              {event.summary}
            </p>
          </div>
        </div>

        <button
          type="button"
          className="text-slate-400 hover:text-white p-1 rounded hover:bg-[#142034] transition-colors"
          aria-label={expanded ? 'Collapse event' : 'Expand event'}
        >
          {expanded ? <ChevronDownIcon size={16} /> : <ChevronRightIcon size={16} />}
        </button>
      </div>

      {/* Expandable Details Container */}
      {expanded && (
        <div className="border-t border-[#182338] bg-[#070c16] p-4 text-xs space-y-3 rounded-b-xl">
          {event.details && (
            <div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Detailed Telemetry Notes:
              </span>
              <p className="mt-1 text-slate-300 leading-relaxed bg-[#0b121f] p-2.5 rounded-lg border border-[#18263c]">
                {event.details}
              </p>
            </div>
          )}

          {/* Prompt / AI Interaction Details */}
          {event.promptData && (
            <div className="space-y-2">
              <div className="rounded-lg border border-[#24354f] bg-[#0c1628] p-3">
                <span className="text-[10px] font-mono uppercase tracking-wider text-purple-300 block mb-1">
                  Candidate Query:
                </span>
                <p className="font-mono text-[11px] text-slate-200">
                  "{event.promptData.prompt}"
                </p>
              </div>

              <div className="rounded-lg border border-[#1a3848] bg-[#081e28] p-3">
                <div className="flex items-center justify-between text-[10px] font-mono text-cyan-300 mb-1">
                  <span>AI Response Telemetry:</span>
                  <span>Tokens: {event.promptData.tokenCount} | Latency: {event.promptData.latencyMs}ms</span>
                </div>
                <p className="text-[11px] text-slate-200 leading-relaxed">
                  {event.promptData.response}
                </p>
              </div>
            </div>
          )}

          {/* Code Diff Block */}
          {event.diff && (
            <div>
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1.5">
                <span className="flex items-center gap-1.5">
                  <CodeIcon size={12} className="text-[#00f2fe]" />
                  <span>{event.diff.file}</span>
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">+{event.diff.additions}</span>
                  <span className="text-rose-400">-{event.diff.deletions}</span>
                </div>
              </div>

              <div className="rounded-lg border border-[#1c293e] bg-[#05080e] p-3 font-mono text-[11px] overflow-x-auto space-y-1">
                <div className="text-rose-400/80 bg-rose-950/20 px-2 py-1 rounded border-l-2 border-rose-500 whitespace-pre">
                  {event.diff.before}
                </div>
                <div className="text-emerald-300 bg-emerald-950/20 px-2 py-1 rounded border-l-2 border-emerald-500 whitespace-pre">
                  {event.diff.after}
                </div>
              </div>
            </div>
          )}

          {/* Test Run Breakdown */}
          {event.testRunData && (
            <div className="rounded-lg border border-[#1a283e] bg-[#0a1220] p-3">
              <div className="flex items-center justify-between text-xs font-mono mb-2">
                <span className="font-semibold text-white">Test Execution Summary</span>
                <div className="flex items-center gap-2">
                  <span className="text-emerald-400">{event.testRunData.passed} Passed</span>
                  <span className="text-slate-500">/</span>
                  <span className={event.testRunData.failed > 0 ? 'text-rose-400' : 'text-slate-400'}>
                    {event.testRunData.failed} Failed
                  </span>
                </div>
              </div>

              {event.testRunData.failingTests && event.testRunData.failingTests.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-semibold text-rose-400">
                    Failed Assertions:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-[11px] text-rose-300/90 font-mono">
                    {event.testRunData.failingTests.map((ft, i) => (
                      <li key={i}>{ft}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Cross link to Evidence */}
          {event.relatedEvidenceId && (
            <div className="flex justify-end pt-1">
              <Link
                to={`/evidence?id=${event.relatedEvidenceId}`}
                className="flex items-center gap-1.5 text-xs text-[#00f2fe] hover:underline font-medium"
              >
                <span>Inspect full evaluation in Evidence Ledger ({event.relatedEvidenceId})</span>
                <ExternalLinkIcon size={12} />
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
