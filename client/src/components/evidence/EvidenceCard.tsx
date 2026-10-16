import React from 'react';
import { Link } from 'react-router-dom';
import type { EvidenceItem } from '../../types';
import {
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldIcon,
  ArrowRightIcon,
  LayersIcon,
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
          style: 'bg-emerald-950/70 text-emerald-300 border-emerald-800/50',
          desc: 'Backed by direct automated assertion or system log telemetry',
        };
      case 'HIGH_CONFIDENCE':
        return {
          label: 'High Confidence',
          style: 'bg-teal-950/70 text-teal-300 border-teal-800/50',
          desc: 'Observed repeatedly across sequence events',
        };
      case 'MEDIUM_CONFIDENCE':
        return {
          label: 'Medium Confidence',
          style: 'bg-amber-950/70 text-amber-300 border-amber-800/50',
          desc: 'Inferred from single action pattern',
        };
      case 'INFERRED_INTERPRETATION':
        return {
          label: 'Inferred Interpretation',
          style: 'bg-purple-950/70 text-purple-300 border-purple-800/50',
          desc: 'Evaluator assessment synthesis',
        };
    }
  };

  const getNatureBadge = (nature: EvidenceItem['nature']) => {
    switch (nature) {
      case 'OBSERVED_EVENT':
        return { label: 'Observed Telemetry', style: 'text-cyan-400 bg-cyan-950/40 border-cyan-800/40' };
      case 'SYNTHESIZED_FINDING':
        return { label: 'Synthesized Finding', style: 'text-purple-400 bg-purple-950/40 border-purple-800/40' };
      case 'COUNTER_EVIDENCE':
        return { label: 'Counter Evidence', style: 'text-rose-400 bg-rose-950/40 border-rose-800/40' };
    }
  };

  const confInfo = getConfidenceBadge(item.confidence);
  const natureInfo = getNatureBadge(item.nature);

  return (
    <div
      onClick={onSelect}
      className={`rounded-xl border p-5 cursor-pointer transition-all ${
        isSelected
          ? 'border-[#00f2fe] bg-[#0e172a] shadow-xl shadow-cyan-950/30'
          : 'border-[#1b273d] bg-[#0a101d] hover:border-[#283b5c] hover:bg-[#0c1424]'
      }`}
    >
      {/* Top Meta Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#182338] pb-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-[#00f2fe] bg-[#0c1d2e] px-2 py-0.5 rounded border border-[#143d5f]">
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

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <span>{item.timestamp}</span>
          <span>•</span>
          <span className="text-[#38bdf8]">Weight: {item.coverageWeight}%</span>
        </div>
      </div>

      {/* Title & Competency */}
      <div className="mt-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
          <LayersIcon size={12} className="text-[#00f2fe]" />
          <span>Competency: {item.competencyName}</span>
        </div>
        <h3 className="mt-1 text-base font-bold text-white">{item.title}</h3>
      </div>

      {/* Observed Behavior vs Inferred Conclusion */}
      <div className="mt-3.5 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="rounded-lg border border-[#1d2a40] bg-[#070c16] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#38bdf8] flex items-center gap-1">
            <CheckCircleIcon size={11} /> 1. Directly Observed Behavior
          </span>
          <p className="mt-1.5 text-slate-200 leading-relaxed font-sans">
            {item.observedBehavior}
          </p>
        </div>

        <div className="rounded-lg border border-[#232f48] bg-[#09101e] p-3">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c084fc] flex items-center gap-1">
            <ShieldIcon size={11} /> 2. Assessment Interpretation
          </span>
          <p className="mt-1.5 text-slate-300 leading-relaxed font-sans">
            {item.interpretation}
          </p>
        </div>
      </div>

      {/* Supporting Data Points */}
      <div className="mt-3 space-y-1.5">
        <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
          Supporting Telemetry:
        </span>
        <ul className="space-y-1 text-xs">
          {item.supportingData.map((data, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-slate-300">
              <span className="text-emerald-400 font-bold shrink-0">✓</span>
              <span>{data}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Counter Evidence if present */}
      {item.counterEvidence && item.counterEvidence.length > 0 && (
        <div className="mt-3 rounded-lg border border-amber-900/40 bg-amber-950/20 p-2.5 text-xs text-amber-200">
          <div className="flex items-center gap-1 font-semibold text-[11px] text-amber-300 mb-1">
            <AlertCircleIcon size={12} /> Counter-Evidence / Observed Nuance:
          </div>
          <ul className="list-disc list-inside space-y-0.5 text-[11px] text-amber-200/90">
            {item.counterEvidence.map((ce, i) => (
              <li key={i}>{ce}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Bottom Bar: Related Timeline Events Link */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-[#182338] pt-3 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] text-slate-400">Corroborating Events:</span>
          {item.relatedTimelineEventIds.map((evtId) => (
            <Link
              key={evtId}
              to={`/timeline?event=${evtId}`}
              onClick={(e) => e.stopPropagation()}
              className="rounded bg-[#121c2d] px-1.5 py-0.5 font-mono text-[10px] text-slate-300 border border-[#20304a] hover:border-[#00f2fe] hover:text-[#00f2fe]"
            >
              {evtId}
            </Link>
          ))}
        </div>

        <button
          onClick={onSelect}
          className="flex items-center gap-1 text-xs font-semibold text-[#00f2fe] hover:underline"
        >
          <span>Inspect Full Telemetry Record</span>
          <ArrowRightIcon size={12} />
        </button>
      </div>
    </div>
  );
};
