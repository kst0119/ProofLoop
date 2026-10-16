import React, { useState } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { CheckIcon, ClockIcon } from '../common/Icons';
import type { ReviewerNotes } from '../../types';

export const ReviewerNotesSection: React.FC = () => {
  const { reviewerNotes, updateReviewerNotes } = useAssessment();
  const [name, setName] = useState(reviewerNotes.reviewerName);
  const [notes, setNotes] = useState(reviewerNotes.notes);
  const [recommendation, setRecommendation] = useState(reviewerNotes.recommendation);
  const [status, setStatus] = useState(reviewerNotes.status);
  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateReviewerNotes({
      reviewerName: name,
      notes,
      recommendation,
      status,
    });
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 2500);
  };

  const recommendationOptions: {
    value: ReviewerNotes['recommendation'];
    label: string;
    style: string;
  }[] = [
    { value: 'STRONG_HIRE', label: 'Strong Hire', style: 'border-[#A3DBC4] bg-[#EDF7F2] text-[#126646]' },
    { value: 'HIRE', label: 'Hire', style: 'border-[#9DCFC4] bg-[#EAF4F1] text-[#144A3F]' },
    { value: 'LEAN_HIRE', label: 'Lean Hire', style: 'border-[#B2DAEB] bg-[#EEF5F9] text-[#1B506B]' },
    { value: 'NEEDS_FOLLOW_UP', label: 'Needs Follow-up', style: 'border-[#F6CE9F] bg-[#FEF6EC] text-[#A1520C]' },
    { value: 'NO_HIRE', label: 'No Hire', style: 'border-[#F7B5B5] bg-[#FDF1F1] text-[#A82424]' },
  ];

  return (
    <div className="rounded-xl border border-[#DFD9CE] bg-white p-6 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#DFD9CE] pb-4">
        <div>
          <h3 className="font-serif text-base font-bold text-[#191715] flex items-center gap-2">
            <span>Reviewer Evaluation & Decision Sign-Off</span>
            <span className="rounded bg-[#EAF4F1] px-2 py-0.5 text-[9px] font-mono font-bold text-[#0F3D34] border border-[#9DCFC4]">
              LOCAL PERSISTENCE ACTIVE
            </span>
          </h3>
          <p className="text-xs text-[#57524A] mt-0.5">
            Decisions are recorded locally in browser state and reflected in the exported dossier.
          </p>
        </div>

        <div className="flex items-center gap-1.5 text-xs font-mono text-[#736E64]">
          <ClockIcon size={12} />
          <span>Last Saved: {reviewerNotes.lastSaved}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-4 space-y-4">
        {/* Recommendation selector */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#191715] block mb-2 font-mono">
            Hiring Recommendation:
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {recommendationOptions.map((opt) => {
              const isSelected = recommendation === opt.value;
              return (
                <button
                  type="button"
                  key={opt.value}
                  onClick={() => setRecommendation(opt.value)}
                  className={`flex items-center justify-center gap-1.5 rounded-md border py-2 px-2 text-xs font-bold transition-all ${
                    isSelected
                      ? `${opt.style} shadow-xs ring-1 ring-[#144A3F]/20`
                      : 'border-[#DFD9CE] bg-[#FAF8F5] text-[#736E64] hover:text-[#191715] hover:border-[#CAC2B3]'
                  }`}
                >
                  {isSelected && <CheckIcon size={12} />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reviewer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#191715] block mb-1 font-mono">
              Reviewer Name & Title:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-md border border-[#DFD9CE] bg-[#FAF8F5] px-3 py-2 text-xs text-[#191715] placeholder-[#736E64] focus:border-[#144A3F] focus:bg-white focus:outline-none"
              placeholder="e.g. Sarah Connor, VP of Engineering"
            />
          </div>

          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#191715] block mb-1 font-mono">
              Report Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReviewerNotes['status'])}
              className="w-full rounded-md border border-[#DFD9CE] bg-[#FAF8F5] px-3 py-2 text-xs text-[#191715] focus:border-[#144A3F] focus:bg-white focus:outline-none"
            >
              <option value="DRAFT">DRAFT (Review in Progress)</option>
              <option value="IN_REVIEW">IN_REVIEW (Hiring Committee Active)</option>
              <option value="APPROVED">APPROVED (Verified Evaluation)</option>
              <option value="ARCHIVED">ARCHIVED (Historical Record)</option>
            </select>
          </div>
        </div>

        {/* Reviewer Notes Textarea */}
        <div>
          <label className="text-xs font-bold uppercase tracking-wider text-[#191715] block mb-1 font-mono">
            Hiring Committee Synthesis & Qualitative Observations:
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full rounded-md border border-[#DFD9CE] bg-[#FAF8F5] p-3 text-xs text-[#191715] placeholder-[#736E64] focus:border-[#144A3F] focus:bg-white focus:outline-none leading-relaxed"
            placeholder="Record specific rationale linking candidate telemetry to your decision..."
          />
        </div>

        {/* Save Bar */}
        <div className="flex items-center justify-between pt-2">
          {savedNotification ? (
            <span className="flex items-center gap-1.5 text-xs text-[#126646] font-bold">
              <CheckIcon size={13} /> Saved to local session state
            </span>
          ) : (
            <span className="text-[11px] text-[#736E64]">Changes update the printable dossier immediately.</span>
          )}

          <button
            type="submit"
            className="btn-primary text-xs"
          >
            Save Reviewer Decision
          </button>
        </div>
      </form>
    </div>
  );
};
