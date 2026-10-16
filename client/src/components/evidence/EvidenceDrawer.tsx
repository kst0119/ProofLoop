import React from 'react';
import { Link } from 'react-router-dom';
import type { EvidenceItem } from '../../types';
import {
  XIcon,
  ShieldIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
  CodeIcon,
} from '../common/Icons';

interface EvidenceDrawerProps {
  item: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-2xl border border-[#233550] bg-[#0b121e] shadow-2xl overflow-hidden animate-fade-in">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#1a283d] bg-[#070b13] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-sm font-bold text-[#00f2fe] bg-[#0c1e30] px-2.5 py-1 rounded border border-[#164166]">
              {item.id}
            </span>
            <div>
              <h2 className="text-base font-bold text-white">{item.title}</h2>
              <span className="text-xs text-slate-400 font-mono">
                Competency: {item.competencyName} • Timestamp: {item.timestamp}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-[#162338] hover:text-white transition-colors"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Nature & Confidence */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-[#1b2b42] bg-[#09101c] p-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Evidence Nature
              </span>
              <span className="text-sm font-semibold text-white">
                {item.nature.replace('_', ' ')}
              </span>
            </div>
            <div className="rounded-xl border border-[#1b2b42] bg-[#09101c] p-3">
              <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">
                Confidence Level
              </span>
              <span className="text-sm font-semibold text-[#00f2fe]">
                {item.confidence.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Observed vs Interpretation */}
          <div className="space-y-3">
            <div className="rounded-xl border border-[#1f3048] bg-[#080e18] p-4">
              <h4 className="text-xs font-bold text-[#38bdf8] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <CheckCircleIcon size={14} /> Directly Observed Telemetry
              </h4>
              <p className="text-xs text-slate-200 leading-relaxed font-mono bg-[#05080f] p-3 rounded-lg border border-[#172437]">
                {item.observedBehavior}
              </p>
            </div>

            <div className="rounded-xl border border-[#2b254a] bg-[#0f0c1f] p-4">
              <h4 className="text-xs font-bold text-[#c084fc] uppercase tracking-wider flex items-center gap-1.5 mb-2">
                <ShieldIcon size={14} /> Evaluator Synthesis & Competency Invariant
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                {item.interpretation}
              </p>
            </div>
          </div>

          {/* Supporting & Counter data */}
          <div className="rounded-xl border border-[#1b283d] bg-[#090f1a] p-4 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
              Corroborating Telemetry Records:
            </span>
            <ul className="space-y-1.5">
              {item.supportingData.map((pt, i) => (
                <li key={i} className="flex items-start gap-2 text-slate-200">
                  <span className="text-emerald-400 font-bold shrink-0">✓</span>
                  <span>{pt}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Associated Timeline Events */}
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-2">
              Associated Session Timeline Events:
            </span>
            <div className="flex flex-wrap gap-2">
              {item.relatedTimelineEventIds.map((evtId) => (
                <Link
                  key={evtId}
                  to={`/timeline?event=${evtId}`}
                  onClick={onClose}
                  className="flex items-center gap-1.5 rounded-lg border border-[#20324d] bg-[#0e1726] px-3 py-1.5 text-xs font-mono text-[#00f2fe] hover:bg-[#15243c]"
                >
                  <CodeIcon size={12} />
                  <span>Timeline Event {evtId}</span>
                  <ExternalLinkIcon size={10} />
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#1a283d] bg-[#070b13] px-6 py-3.5">
          <span className="text-[11px] text-slate-400 font-mono">
            Weight Contribution: {item.coverageWeight}% to competency rubric
          </span>
          <button
            onClick={onClose}
            className="rounded-lg bg-teal-500 px-4 py-1.5 text-xs font-bold text-black hover:bg-teal-400"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
