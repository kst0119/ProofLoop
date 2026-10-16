import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import {
  StarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  ShieldIcon,
  SendIcon,
  RefreshCwIcon,
} from '../components/common/Icons';
import type { FeedbackEntry } from '../types';

export const FeedbackPage = () => {
  const { feedbackList, addFeedback } = useAssessment();

  // Form State
  const [role, setRole] = useState<FeedbackEntry['authorRole']>('reviewer');
  const [ratingRealism, setRatingRealism] = useState<number>(5);
  const [ratingAIUtility, setRatingAIUtility] = useState<number>(5);
  const [ratingClarity, setRatingClarity] = useState<number>(5);
  const [ratingOverall, setRatingOverall] = useState<number>(5);
  const [comments, setComments] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  // UI state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [submittedSuccessfully, setSubmittedSuccessfully] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Validation
  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!comments.trim()) {
      newErrors.comments = 'Please enter constructive feedback or evaluation observations.';
    } else if (comments.trim().length < 15) {
      newErrors.comments = 'Feedback must be at least 15 characters long.';
    }

    if (email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Please provide a valid email format or leave blank.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 600));

    addFeedback({
      authorRole: role,
      ratingRealism,
      ratingAIUtility,
      ratingClarity,
      ratingOverall,
      comments: comments.trim(),
      email: email.trim() || undefined,
    });

    setIsSubmitting(false);
    setSubmittedSuccessfully(true);
    // Reset form
    setComments('');
    setEmail('');
    setTimeout(() => setSubmittedSuccessfully(false), 4000);
  };

  const handleReset = () => {
    setRatingRealism(5);
    setRatingAIUtility(5);
    setRatingClarity(5);
    setRatingOverall(5);
    setComments('');
    setEmail('');
    setErrors({});
  };

  const StarRatingInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (val: number) => void;
  }) => (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-xl border border-[#1b273d] bg-[#090f1a] p-3 text-xs">
      <span className="font-medium text-slate-200">{label}</span>
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => onChange(star)}
            className="p-1 hover:scale-110 transition-transform"
            aria-label={`${star} star rating for ${label}`}
          >
            <StarIcon size={18} filled={star <= value} />
          </button>
        ))}
        <span className="ml-2 font-mono text-xs font-bold text-amber-400">{value} / 5</span>
      </div>
    </div>
  );

  return (
    <div className="flex-1 bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
      {/* Page Header */}
      <div className="border-b border-[#182338] pb-6">
        <div className="flex items-center gap-2">
          <span className="rounded bg-[#0d1f33] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#00f2fe] border border-[#143e63]">
            ASSESSMENT FEEDBACK
          </span>
          <span className="font-mono text-xs text-slate-400">
            Local Demo Persistence Active
          </span>
        </div>
        <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
          Platform Evaluation & Experience Feedback
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
          Provide feedback on scenario realism, AI copilot helpfulness, and assessment transparency. Submissions are saved to local client storage.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Feedback Form (7 cols) */}
        <div className="lg:col-span-7 rounded-2xl border border-[#1e2f4a] bg-[#0c1424] p-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-[#182338] pb-4 mb-4">
            <h2 className="text-base font-bold text-white">Submit Platform Feedback</h2>
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-200"
            >
              <RefreshCwIcon size={12} />
              Reset Form
            </button>
          </div>

          {submittedSuccessfully && (
            <div className="mb-5 rounded-xl border border-emerald-800/60 bg-emerald-950/40 p-4 text-xs text-emerald-300 flex items-start gap-2.5 animate-fade-in">
              <CheckCircleIcon size={18} className="text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="block text-emerald-200 font-semibold">
                  Feedback Successfully Recorded!
                </strong>
                Thank you for evaluating ProofLoop. Your entry has been appended to the client session ledger below.
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Role Selector */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1.5">
                Your Assessment Role:
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { id: 'candidate', label: 'Candidate' },
                  { id: 'reviewer', label: 'Reviewer / HM' },
                  { id: 'recruiter', label: 'Recruiter' },
                  { id: 'interviewer', label: 'Staff Engineer' },
                ].map((r) => (
                  <button
                    type="button"
                    key={r.id}
                    onClick={() => setRole(r.id as FeedbackEntry['authorRole'])}
                    className={`rounded-lg border py-2 px-2 text-xs font-semibold capitalize transition-all ${
                      role === r.id
                        ? 'border-[#00f2fe] bg-[#122238] text-[#00f2fe] shadow-sm'
                        : 'border-[#1b273d] bg-[#070c16] text-slate-400 hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Star Ratings */}
            <div className="space-y-2.5 pt-2">
              <StarRatingInput
                label="Scenario Realism & Depth"
                value={ratingRealism}
                onChange={setRatingRealism}
              />
              <StarRatingInput
                label="AI Copilot Utility & Guidance"
                value={ratingAIUtility}
                onChange={setRatingAIUtility}
              />
              <StarRatingInput
                label="Specification & Criteria Clarity"
                value={ratingClarity}
                onChange={setRatingClarity}
              />
              <StarRatingInput
                label="Overall Platform Experience"
                value={ratingOverall}
                onChange={setRatingOverall}
              />
            </div>

            {/* Email (Optional) */}
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-slate-300 block mb-1">
                Contact Email <span className="text-slate-500 font-normal">(Optional for follow-up)</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                className="w-full rounded-lg border border-[#1e2e46] bg-[#070c16] px-3 py-2 text-xs text-white placeholder-slate-500 focus:border-[#00f2fe] focus:outline-none"
              />
              {errors.email && (
                <span className="text-[11px] text-rose-400 mt-1 block">{errors.email}</span>
              )}
            </div>

            {/* Detailed Comments */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Detailed Feedback & Observations <span className="text-[#00f2fe]">*</span>
                </label>
                <span className="text-[11px] font-mono text-slate-500">
                  {comments.length} chars
                </span>
              </div>
              <textarea
                rows={4}
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder="Share your thoughts on the Verification Loop, evidence inspectability, or assessment workflow..."
                className={`w-full rounded-lg border bg-[#070c16] p-3 text-xs text-white placeholder-slate-500 focus:outline-none ${
                  errors.comments ? 'border-rose-500' : 'border-[#1e2e46] focus:border-[#00f2fe]'
                }`}
              />
              {errors.comments && (
                <span className="text-[11px] text-rose-400 mt-1 block flex items-center gap-1">
                  <AlertCircleIcon size={12} /> {errors.comments}
                </span>
              )}
            </div>

            {/* Submit Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#182338]">
              <span className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                <ShieldIcon size={12} className="text-[#00f2fe]" /> Saved to localStorage
              </span>

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#10b981] px-5 py-2.5 text-xs font-bold text-black shadow-md hover:opacity-95 disabled:opacity-50 transition-all"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCwIcon size={13} className="animate-spin text-black" />
                    <span>Recording...</span>
                  </>
                ) : (
                  <>
                    <SendIcon size={13} />
                    <span>Submit Platform Feedback</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Recent Submissions Feed (5 cols) */}
        <div className="lg:col-span-5 flex flex-col space-y-4">
          <div className="rounded-2xl border border-[#1b283d] bg-[#090f1a] p-5">
            <h3 className="text-sm font-bold uppercase tracking-wider text-white mb-1">
              Local Submissions History ({feedbackList.length})
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Stored in client browser storage for persistent demo review.
            </p>

            <div className="space-y-3 max-h-[520px] overflow-y-auto pr-1">
              {feedbackList.map((entry: FeedbackEntry) => (
                <div
                  key={entry.id}
                  className="rounded-xl border border-[#1a263a] bg-[#0c1422] p-3.5 text-xs space-y-2 hover:border-[#273a56] transition-colors"
                >
                  <div className="flex items-center justify-between text-[11px] border-b border-[#162234] pb-2">
                    <span className="rounded bg-[#122238] px-2 py-0.5 font-mono text-[10px] font-semibold text-[#38bdf8] border border-[#1b3c5e] uppercase">
                      {entry.authorRole}
                    </span>
                    <span className="font-mono text-slate-400">{entry.timestamp}</span>
                  </div>

                  {/* Stars summary */}
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-400">Overall Rating:</span>
                    <div className="flex items-center gap-1 text-amber-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <StarIcon key={s} size={12} filled={s <= entry.ratingOverall} />
                      ))}
                    </div>
                  </div>

                  <p className="text-slate-300 leading-relaxed font-sans text-xs">
                    "{entry.comments}"
                  </p>

                  {entry.email && (
                    <span className="text-[10px] font-mono text-slate-500 block truncate">
                      {entry.email}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
