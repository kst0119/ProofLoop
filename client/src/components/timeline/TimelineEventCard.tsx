import React from 'react';
import type { TimelineEvent } from '../../types';
import {
  BotIcon,
  TerminalIcon,
  CheckCircleIcon,
  XCircleIcon,
  AlertCircleIcon,
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
  const getTypeBadgeStyle = (type: TimelineEvent['type']) => {
    switch (type) {
      case 'PROMPT':
        return 'bg-[#F2EFE9] text-[#57524A] border-[#DFD9CE]';
      case 'AI_SUGGESTION':
        return 'bg-[#EAF4F1] text-[#144A3F] border-[#9DCFC4]';
      case 'CODE_EDIT':
        return 'bg-[#EEF5F9] text-[#1B506B] border-[#B2DAEB]';
      case 'TEST_RUN':
        return event.status === 'success'
          ? 'bg-[#EDF7F2] text-[#126646] border-[#A3DBC4]'
          : 'bg-[#FDF1F1] text-[#A82424] border-[#F7B5B5]';
      case 'DEBUG_ACTION':
        return 'bg-[#FEF6EC] text-[#A1520C] border-[#F6CE9F]';
      case 'VERIFICATION':
        return 'bg-[#FDF1ED] text-[#B94A2D] border-[#F5BFAF]';
      default:
        return 'bg-white text-[#57524A] border-[#DFD9CE]';
    }
  };

  const getStatusIcon = () => {
    switch (event.status) {
      case 'success':
        return <CheckCircleIcon size={14} className="text-[#126646]" />;
      case 'failure':
        return <XCircleIcon size={14} className="text-[#A82424]" />;
      case 'warning':
        return <AlertCircleIcon size={14} className="text-[#A1520C]" />;
      default:
        return <CheckCircleIcon size={14} className="text-[#144A3F]" />;
    }
  };

  const getAuthorBadge = () => {
    switch (event.author) {
      case 'candidate':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#57524A]">
            <UserIcon size={11} /> Candidate
          </span>
        );
      case 'ai':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#144A3F]">
            <BotIcon size={11} /> AI Copilot
          </span>
        );
      case 'system':
        return (
          <span className="flex items-center gap-1 text-[10px] font-mono text-[#736E64]">
            <TerminalIcon size={11} /> System Test
          </span>
        );
    }
  };

  return (
    <div
      onClick={onSelect}
      className={`group relative flex items-start gap-3 rounded-lg border p-3.5 cursor-pointer transition-all ${
        isSelected
          ? 'border-[#144A3F] bg-white shadow-md ring-1 ring-[#144A3F]/20'
          : 'border-[#DFD9CE] bg-white hover:border-[#CAC2B3] hover:shadow-2xs'
      }`}
    >
      {/* Sequence Badge & Status */}
      <div className="flex flex-col items-center shrink-0">
        <span
          className={`flex h-7 w-7 items-center justify-center rounded font-mono text-xs font-bold border transition-colors ${
            isSelected
              ? 'bg-[#144A3F] text-white border-[#144A3F]'
              : 'bg-[#F4F1EA] text-[#191715] border-[#DFD9CE] group-hover:border-[#144A3F]'
          }`}
        >
          #{String(event.seq).padStart(2, '0')}
        </span>
        <div className="mt-1.5">{getStatusIcon()}</div>
      </div>

      {/* Main Info */}
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ${getTypeBadgeStyle(event.type)}`}>
              {event.type.replace('_', ' ')}
            </span>
            <span className="font-mono text-[10px] text-[#736E64]">
              {event.relativeTime || event.timestamp.split(' ')[1]}
            </span>
            <span className="text-[#DFD9CE]">•</span>
            {getAuthorBadge()}
          </div>

          {event.relatedEvidenceId && (
            <span className="rounded bg-[#FDF1ED] px-1.5 py-0.2 text-[9px] font-mono font-bold text-[#B94A2D] border border-[#F5BFAF]">
              {event.relatedEvidenceId}
            </span>
          )}
        </div>

        <h4 className="mt-1 text-xs font-bold text-[#191715] leading-snug truncate">
          {event.title}
        </h4>

        <p className="mt-0.5 text-[11px] text-[#57524A] leading-relaxed line-clamp-2">
          {event.summary}
        </p>

        {/* Quick telemetry peek */}
        {event.testRunData && (
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono">
            <span className="text-[#126646] font-bold">
              ✓ {event.testRunData.passed}/{event.testRunData.total} passed
            </span>
            {event.testRunData.failed > 0 && (
              <span className="text-[#A82424] font-bold">
                ✕ {event.testRunData.failed} failed
              </span>
            )}
          </div>
        )}

        {event.diff && (
          <div className="mt-2 flex items-center gap-2 text-[10px] font-mono text-[#736E64]">
            <span className="text-[#126646]">+{event.diff.additions}</span>
            <span className="text-[#A82424]">-{event.diff.deletions}</span>
            <span>{event.diff.file}</span>
          </div>
        )}
      </div>
    </div>
  );
};
