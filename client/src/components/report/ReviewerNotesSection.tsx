import React, { useState } from 'react';
import { useAssessment } from '../../context/AssessmentContext';
import { CheckIcon, ClockIcon, ShieldIcon } from '../common/Icons';
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
    { value: 'STRONG_HIRE', label: 'Strong Hire', style: 'border-emerald-500 bg-emerald-950/60 text-emerald-300' },
    { value: 'HIRE', label: 'Hire', style: 'border-teal-500 bg-teal-950/60 text-teal-300' },
    { value: 'LEAN_HIRE', label: 'Lean Hire', style: 'border-blue-500 bg-blue-950/60 text-blue-300' },
    { value: 'NEEDS_FOLLOW_UP', label: 'Needs Follow-up', style: 'border-amber-500 bg-amber-950/60 text-amber-300' },
    { value: 'NO_HIRE', label: 'No Hire', style: 'border-rose-500 bg-rose-950/60 text-rose-300' },
  ];

  return (
    <div className="rounded-xl border border-[#1b283d] bg-[#090f1a] p-5 shadow-lg">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#182338] pb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <span>Reviewer Evaluation & Hiring Decision</span>
            <span className="rounded bg-[#122336] px-2 py-0.5 text-[10px] font-mono text-[#00f2fe] border border-[#1d3d59]">
              Interactive Form
            </span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Decisions are recorded locally in browser state and reflected in the exported report.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
          <ClockIcon size={12} />
          <span>Last Saved: {reviewerNotes.lastSaved}</span>
        </div>
      </div>

      <form onSubmit={handleSave} className="mt-4 space-y-4">
        {/* Recommendation selector */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-2">
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
                  className={`flex items-center justify-center gap-1.5 rounded-lg border py-2 px-2 text-xs font-semibold transition-all ${
                    isSelected
                      ? `${opt.style} shadow-md ring-1 ring-white/20`
                      : 'border-[#1b273d] bg-[#070c16] text-slate-400 hover:text-white hover:border-slate-600'
                  }`}
                >
                  {isSelected && <CheckIcon size={13} />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Reviewer Details */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
              Reviewer Name & Title:
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full rounded-lg border border-[#1e2e46] bg-[#070c16] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00f2fe] focus:outline-none"
              placeholder="e.g. Sarah Connor, VP of Engineering"
            />
          </div>

          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
              Evaluation Status:
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as ReviewerNotes['status'])}
              className="w-full rounded-lg border border-[#1e2e46] bg-[#070c16] px-3 py-2 text-xs text-white focus:border-[#00f2fe] focus:outline-none"
            >
              <option value="DRAFT">DRAFT — Pending Calibration</option>
              <option value="IN_REVIEW">IN_REVIEW — Committee Evaluating</option>
              <option value="APPROVED">APPROVED — Formal Verdict Recorded</option>
              <option value="ARCHIVED">ARCHIVED — Session Concluded</option>
            </select>
          </div>
        </div>

        {/* Reviewer Notes Textarea */}
        <div>
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
            Qualitative Assessment Notes:
          </label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-lg border border-[#1e2e46] bg-[#070c16] p-3 text-xs text-white leading-relaxed placeholder-slate-500 focus:border-[#00f2fe] focus:outline-none"
            placeholder="Record specific rationale, reference Evidence IDs, and provide recommendations for hiring manager calibration..."
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <ShieldIcon size={12} className="text-[#00f2fe]" />
            <span>Changes persist to browser localStorage</span>
          </div>

          <div className="flex items-center gap-2">
            {savedNotification && (
              <span className="flex items-center gap-1 text-xs font-medium text-emerald-400 animate-fade-in">
                <CheckIcon size={13} /> Saved successfully!
              </span>
            )}
            <button
              type="submit"
              className="rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#10b981] px-4 py-2 text-xs font-bold text-black shadow-md hover:opacity-95 transition-all"
            >
              Save Reviewer Decision
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
