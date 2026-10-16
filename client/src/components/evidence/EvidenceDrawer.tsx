import React from 'react';
import { Link } from 'react-router-dom';
import type { EvidenceItem } from '../../types';
import {
  XIcon,
  ShieldIcon,
  CheckCircleIcon,
  ExternalLinkIcon,
} from '../common/Icons';

interface EvidenceDrawerProps {
  item: EvidenceItem | null;
  onClose: () => void;
}

export const EvidenceDrawer: React.FC<EvidenceDrawerProps> = ({ item, onClose }) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col rounded-xl border border-[#DFD9CE] bg-white shadow-2xl overflow-hidden animate-fade-in text-[#191715]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#DFD9CE] bg-[#FAF8F5] px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs font-bold text-[#144A3F] bg-[#EAF4F1] px-2.5 py-1 rounded border border-[#9DCFC4]">
              {item.id}
            </span>
            <div>
              <h2 className="font-serif text-base font-bold text-[#191715]">{item.title}</h2>
              <span className="text-xs text-[#736E64] font-mono">
                Competency: {item.competencyName} • Timestamp: {item.timestamp}
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-md p-1.5 text-[#736E64] hover:bg-[#F2EFE9] hover:text-[#191715] transition-colors"
            aria-label="Close evidence detail modal"
          >
            <XIcon size={18} />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
          {/* Nature & Confidence */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3">
              <span className="text-[10px] font-mono uppercase text-[#736E64] block mb-1">
                Evidence Nature
              </span>
              <span className="text-sm font-bold text-[#191715]">
                {item.nature.replace('_', ' ')}
              </span>
            </div>
            <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3">
              <span className="text-[10px] font-mono uppercase text-[#736E64] block mb-1">
                Confidence Classification
              </span>
              <span className="text-sm font-bold text-[#144A3F]">
                {item.confidence.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Observed Behavior vs Interpretation */}
          <div className="space-y-3">
            <div className="rounded-lg border border-[#A3DBC4] bg-[#EDF7F2] p-4 text-[#0E5238]">
              <div className="flex items-center gap-1.5 font-bold mb-1.5 text-xs">
                <CheckCircleIcon size={14} />
                <span>Observed Candidate Action (Hard Telemetry)</span>
              </div>
              <p className="leading-relaxed text-xs text-[#191715]">
                {item.observedBehavior}
              </p>
            </div>

            <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-4 text-[#4A463F]">
              <div className="flex items-center gap-1.5 font-bold mb-1.5 text-xs text-[#191715]">
                <ShieldIcon size={14} className="text-[#144A3F]" />
                <span>Evaluator Rubric Interpretation</span>
              </div>
              <p className="leading-relaxed text-xs">
                {item.interpretation}
              </p>
            </div>
          </div>

          {/* Supporting Evidence Records */}
          <div>
            <h4 className="font-bold text-xs text-[#191715] uppercase tracking-wider mb-2 font-mono">
              Supporting Proof Points ({item.supportingData.length})
            </h4>
            <div className="rounded-lg border border-[#DFD9CE] bg-white divide-y divide-[#EAE6DD]">
              {item.supportingData.map((data, idx) => (
                <div key={idx} className="flex items-start gap-2.5 p-3 text-xs text-[#4A463F]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#144A3F] mt-1.5 shrink-0" />
                  <span className="leading-relaxed">{data}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Counter Evidence if any */}
          {item.counterEvidence && item.counterEvidence.length > 0 && (
            <div>
              <h4 className="font-bold text-xs text-[#A82424] uppercase tracking-wider mb-2 font-mono">
                Counter Evidence Disclosures ({item.counterEvidence.length})
              </h4>
              <div className="rounded-lg border border-[#F7B5B5] bg-[#FDF1F1] divide-y divide-[#F7B5B5]/40">
                {item.counterEvidence.map((data, idx) => (
                  <div key={idx} className="flex items-start gap-2.5 p-3 text-xs text-[#871919]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#A82424] mt-1.5 shrink-0" />
                    <span className="leading-relaxed">{data}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Timeline Link Trace */}
          <div>
            <h4 className="font-bold text-xs text-[#191715] uppercase tracking-wider mb-2 font-mono">
              Connected Chronological Events
            </h4>
            <div className="flex flex-wrap gap-2">
              {item.relatedTimelineEventIds.map((evtId) => (
                <Link
                  key={evtId}
                  to={`/verification?event=${evtId}`}
                  onClick={onClose}
                  className="btn-secondary text-xs"
                >
                  <ExternalLinkIcon size={12} className="text-brand" />
                  <span>View Verification Event {evtId}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between border-t border-[#DFD9CE] bg-[#FAF8F5] px-6 py-3 text-xs">
          <span className="font-mono text-[#736E64]">Coverage Weight: {item.coverageWeight}%</span>
          <button
            onClick={onClose}
            className="btn-primary text-xs"
          >
            Close Inspector
          </button>
        </div>
      </div>
    </div>
  );
};
