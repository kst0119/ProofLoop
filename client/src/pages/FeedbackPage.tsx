import React, { useState } from 'react';
import { useAssessment } from '../context/AssessmentContext';
import {
  StarIcon,
  CheckCircleIcon,
  AlertCircleIcon,
  SendIcon,
  RefreshCwIcon,
} from '../components/common/Icons';
import type { FeedbackEntry } from '../types';

interface StarRatingInputProps {
  label: string;
  value: number;
  onChange: (val: number) => void;
}

const StarRatingInput: React.FC<StarRatingInputProps> = ({
  label,
  value,
  onChange,
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 rounded-lg border border-default bg-base p-3 text-xs">
    <span className="font-semibold text-primary">{label}</span>
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          type="button"
          key={star}
          onClick={() => onChange(star)}
          className="p-1 hover:scale-110 transition-transform focus:outline-none cursor-pointer"
          aria-label={`${star} star rating for ${label}`}
        >
          <StarIcon size={16} filled={star <= value} />
        </button>
      ))}
      <span className="ml-2 font-mono text-xs font-bold text-brand w-4">
        {value}
      </span>
    </div>
  </div>
);

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
    setTimeout(() => setSubmittedSuccessfully(false), 5000);
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


  return (
    <div className="flex-1 bg-[#F8F6F0] text-[#191715] py-8 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full">
      {/* Editorial Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DFD9CE] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#EAF4F1] px-2.5 py-0.5 text-xs font-mono font-bold text-[#0F3D34] border border-[#9DCFC4]">
              FEEDBACK & BENCHMARKING
            </span>
            <span className="font-mono text-xs text-[#736E64]">
              Local State Persistent Storage
            </span>
          </div>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#191715]">
            Platform Feedback & Experience Benchmarks
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#57524A] max-w-2xl leading-relaxed">
            Help calibrate our evidence-driven assessment rubrics. Share your perspective on engineering realism, invariant task clarity, and AI copilot utility.
          </p>
        </div>
      </div>

      {/* Main Grid: Form on Left, Community/Reviewer Feed on Right */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-7">
          <div className="rounded-xl border border-[#DFD9CE] bg-white p-6 sm:p-7 shadow-sm">
            <h2 className="font-serif text-lg font-bold text-[#191715] mb-1">
              Submit Experience Feedback
            </h2>
            <p className="text-xs text-[#57524A] mb-5">
              Submissions are stored in local client state for demo persistence.
            </p>

            {submittedSuccessfully && (
              <div className="mb-6 rounded-lg border border-[#A3DBC4] bg-[#EDF7F2] p-4 text-[#126646] animate-fade-in text-xs flex items-center gap-2">
                <CheckCircleIcon size={16} />
                <span>Thank you! Your feedback has been recorded in the local session registry.</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#191715] block mb-2 font-mono">
                  I am evaluating ProofLoop as:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {(['reviewer', 'candidate', 'recruiter', 'interviewer'] as const).map((r) => {
                    const isSelected = role === r;
                    return (
                      <button
                        type="button"
                        key={r}
                        onClick={() => setRole(r)}
                        className={`rounded-md border py-2 px-3 text-xs font-bold capitalize transition-all ${
                          isSelected
                            ? 'border-[#144A3F] bg-[#144A3F] text-white shadow-xs'
                            : 'border-[#DFD9CE] bg-[#FAF8F5] text-[#57524A] hover:text-[#191715] hover:border-[#CAC2B3]'
                        }`}
                      >
                        {r}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Star Rating Inputs */}
              <div className="space-y-2.5 pt-2">
                <StarRatingInput
                  label="Engineering Scenario Realism"
                  value={ratingRealism}
                  onChange={setRatingRealism}
                />
                <StarRatingInput
                  label="AI Copilot & Telemetry Utility"
                  value={ratingAIUtility}
                  onChange={setRatingAIUtility}
                />
                <StarRatingInput
                  label="Invariant Task Clarity & Rubrics"
                  value={ratingClarity}
                  onChange={setRatingClarity}
                />
                <StarRatingInput
                  label="Overall Experience & Credibility"
                  value={ratingOverall}
                  onChange={setRatingOverall}
                />
              </div>

              {/* Comments Textarea */}
              <div className="pt-2">
                <label className="text-xs font-bold uppercase tracking-wider text-[#191715] block mb-1 font-mono">
                  Constructive Observations & Notes:
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => {
                    setComments(e.target.value);
                    if (errors.comments) setErrors((prev) => ({ ...prev, comments: '' }));
                  }}
                  rows={4}
                  placeholder="What worked well during the session? Did the evidence ledger accurately reflect the candidate's engineering reasoning? (Minimum 15 characters)"
                  className={`w-full rounded-md border p-3 text-xs text-[#191715] placeholder-[#736E64] focus:outline-none transition-colors ${
                    errors.comments
                      ? 'border-[#F7B5B5] bg-[#FDF1F1]'
                      : 'border-[#DFD9CE] bg-[#FAF8F5] focus:border-[#144A3F] focus:bg-white'
                  }`}
                />
                {errors.comments && (
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-[#A82424]">
                    <AlertCircleIcon size={12} /> {errors.comments}
                  </span>
                )}
              </div>

              {/* Optional Email */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-[#191715] block mb-1 font-mono">
                  Email Address (Optional for verification):
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }));
                  }}
                  placeholder="e.g. reviewer@engineering.org"
                  className={`w-full rounded-md border px-3 py-2 text-xs text-[#191715] placeholder-[#736E64] focus:outline-none transition-colors ${
                    errors.email
                      ? 'border-[#F7B5B5] bg-[#FDF1F1]'
                      : 'border-[#DFD9CE] bg-[#FAF8F5] focus:border-[#144A3F] focus:bg-white'
                  }`}
                />
                {errors.email && (
                  <span className="mt-1 flex items-center gap-1 text-[11px] text-[#A82424]">
                    <AlertCircleIcon size={12} /> {errors.email}
                  </span>
                )}
              </div>

              {/* Form Action Buttons at End of Form */}
              <div className="pt-3 border-t border-[#DFD9CE] flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="btn-secondary text-xs"
                >
                  Clear Form
                </button>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="btn-primary text-xs"
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCwIcon size={12} className="animate-spin text-white" />
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <SendIcon size={12} />
                      <span>Submit Assessment Feedback</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Community / Evaluator Feed Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="rounded-xl border border-[#DFD9CE] bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between border-b border-[#DFD9CE] pb-3 mb-4">
              <div>
                <h3 className="font-serif text-base font-bold text-[#191715]">
                  Recorded Evaluator Submissions
                </h3>
                <span className="text-xs text-[#736E64] font-mono">
                  {feedbackList.length} Entries in Local Registry
                </span>
              </div>
              <span className="rounded bg-[#EAF4F1] px-2 py-0.5 text-[10px] font-mono font-bold text-[#144A3F] border border-[#9DCFC4]">
                PERSISTENT
              </span>
            </div>

            <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
              {feedbackList.map((entry) => (
                <div
                  key={entry.id}
                  className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3.5 text-xs text-[#191715]"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="font-mono text-[10px] font-bold text-[#144A3F] uppercase">
                      {entry.authorRole}
                    </span>
                    <span className="text-[10px] font-mono text-[#736E64]">
                      {entry.timestamp}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 mb-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon
                        key={star}
                        size={12}
                        filled={star <= entry.ratingOverall}
                      />
                    ))}
                    <span className="text-[11px] font-mono font-semibold text-[#57524A] ml-1">
                      {entry.ratingOverall}.0 / 5.0
                    </span>
                  </div>

                  <p className="text-[#4A463F] leading-relaxed text-[11px]">
                    "{entry.comments}"
                  </p>

                  <div className="mt-2.5 pt-2 border-t border-[#DFD9CE] flex items-center justify-between text-[10px] text-[#736E64] font-mono">
                    <span>Realism: {entry.ratingRealism}/5</span>
                    <span>AI Utility: {entry.ratingAIUtility}/5</span>
                    <span>Clarity: {entry.ratingClarity}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
