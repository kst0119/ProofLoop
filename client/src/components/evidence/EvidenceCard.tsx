import React from 'react';
import { Link } from 'react-router-dom';
import type { EvidenceItem } from '../../types';
import {
  CheckCircleIcon,
  ShieldIcon,
} from '../common/Icons';

interface EvidenceCardProps {
  item: EvidenceItem;
  isSelected?: boolean;
  onSelect?: () => void;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({
  item,
  isSelected = false,
  onSelect,
}) => {
  const getConfidenceBadge = (confidence: EvidenceItem['confidence']) => {
    switch (confidence) {
      case 'CORROBORATED_FACT':
        return {
          label: 'Corroborated Fact',
          style: 'bg-[#EDF7F2] text-[#126646] border-[#A3DBC4]',
          desc: 'Backed by direct automated assertion or system log telemetry',
        };
      case 'HIGH_CONFIDENCE':
        return {
          label: 'High Confidence',
          style: 'bg-[#EAF4F1] text-[#144A3F] border-[#9DCFC4]',
          desc: 'Observed repeatedly across sequence events',
        };
      case 'MEDIUM_CONFIDENCE':
        return {
          label: 'Medium Confidence',
          style: 'bg-[#FEF6EC] text-[#A1520C] border-[#F6CE9F]',
          desc: 'Inferred from single action pattern',
        };
      case 'INFERRED_INTERPRETATION':
        return {
          label: 'Inferred Interpretation',
          style: 'bg-[#F4F1EA] text-[#57524A] border-[#DFD9CE]',
          desc: 'Evaluator assessment synthesis',
        };
    }
  };

  const getNatureBadge = (nature: EvidenceItem['nature']) => {
    switch (nature) {
      case 'OBSERVED_EVENT':
        return { label: 'Observed Telemetry', style: 'text-[#144A3F] bg-[#EAF4F1] border-[#9DCFC4]' };
      case 'SYNTHESIZED_FINDING':
        return { label: 'Synthesized Finding', style: 'text-[#57524A] bg-[#F2EFE9] border-[#DFD9CE]' };
      case 'COUNTER_EVIDENCE':
        return { label: 'Counter Evidence', style: 'text-[#A82424] bg-[#FDF1F1] border-[#F7B5B5]' };
    }
  };

  const confInfo = getConfidenceBadge(item.confidence);
  const natureInfo = getNatureBadge(item.nature);

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-4 sm:p-5 cursor-pointer transition-all ${
        isSelected
          ? 'border-[#144A3F] bg-white shadow-md ring-1 ring-[#144A3F]/20'
          : 'border-[#DFD9CE] bg-white hover:border-[#CAC2B3] hover:shadow-2xs'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#EAE6DD] pb-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-mono text-xs font-bold text-[#144A3F] bg-[#EAF4F1] px-2 py-0.5 rounded border border-[#9DCFC4]">
            {item.id}
          </span>
          <span className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${natureInfo.style}`}>
            {natureInfo.label}
          </span>
          <span
            className={`rounded px-2 py-0.5 text-[10px] font-semibold border ${confInfo.style}`}
            title={confInfo.desc}
          >
            {confInfo.label}
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-[#736E64]">
          <span>{item.timestamp}</span>
          <span>•</span>
          <span className="text-[#144A3F] font-bold">Weight: {item.coverageWeight}%</span>
        </div>
      </div>

      {/* Title & Competency */}
      <div className="mt-3">
        <span className="text-[10px] font-mono uppercase tracking-wider text-[#736E64] block">
          Rubric: {item.competencyName}
        </span>
        <h3 className="font-serif text-base font-bold text-[#191715] mt-0.5 leading-snug">
          {item.title}
        </h3>
      </div>

      {/* Distinction: Observed Behavior vs Interpretation */}
      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-[#144A3F] mb-1">
            <CheckCircleIcon size={12} />
            <span>Observed Candidate Action (Hard Telemetry)</span>
          </div>
          <p className="text-[#4A463F] leading-relaxed">
            {item.observedBehavior}
          </p>
        </div>

        <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3">
          <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold uppercase text-[#736E64] mb-1">
            <ShieldIcon size={12} />
            <span>Evaluator Interpretation</span>
          </div>
          <p className="text-[#4A463F] leading-relaxed">
            {item.interpretation}
          </p>
        </div>
      </div>

      {/* Supporting Data & Verification Links */}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EAE6DD] text-xs">
        <div className="flex items-center gap-2 text-[11px] font-mono text-[#736E64]">
          <span>Supporting Proofs: <strong>{item.supportingData.length}</strong></span>
          {item.counterEvidence && item.counterEvidence.length > 0 && (
            <>
              <span>•</span>
              <span className="text-[#A82424]">Counter-evidence: <strong>{item.counterEvidence.length}</strong></span>
            </>
          )}
        </div>

        <div className="flex items-center gap-2">
          {item.relatedTimelineEventIds.slice(0, 2).map((evtId) => (
            <Link
              key={evtId}
              to={`/verification?event=${evtId}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded bg-base px-2 py-0.5 text-[10px] font-mono font-bold text-brand hover:bg-elevated transition-colors"
            >
              Loop {evtId} →
            </Link>
          ))}
          <button
            type="button"
            className="btn-secondary text-xs py-1 px-2.5 min-h-0 text-[11px]"
          >
            Inspect Record
          </button>
        </div>
      </div>
    </div>
  );
};
