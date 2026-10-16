import { Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { CompetencyBars } from '../components/report/CompetencyBars';
import { ReviewerNotesSection } from '../components/report/ReviewerNotesSection';
import {
  PrinterIcon,
  CheckCircleIcon,
  ShieldIcon,
  ArrowRightIcon,
} from '../components/common/Icons';

export const ReviewerReportPage = () => {
  const { reportData, reviewerNotes } = useAssessment();
  const { session, executiveSummary, competencies, strengths, improvementAreas, limitationsNotice, testOutcomes } = reportData;

  const handlePrint = () => {
    window.print();
  };

  const recommendationColorMap: Record<string, string> = {
    STRONG_HIRE: 'text-[#126646] bg-[#EDF7F2] border-[#A3DBC4]',
    HIRE: 'text-[#144A3F] bg-[#EAF4F1] border-[#9DCFC4]',
    LEAN_HIRE: 'text-[#1B506B] bg-[#EEF5F9] border-[#B2DAEB]',
    NEEDS_FOLLOW_UP: 'text-[#A1520C] bg-[#FEF6EC] border-[#F6CE9F]',
    NO_HIRE: 'text-[#A82424] bg-[#FDF1F1] border-[#F7B5B5]',
  };

  return (
    <div className="flex-1 bg-[#F8F6F0] text-[#191715] py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full print-page">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DFD9CE] pb-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#EAF4F1] px-2.5 py-0.5 text-xs font-mono font-bold text-[#0F3D34] border border-[#9DCFC4]">
              REVIEWER REPORT
            </span>
            <span className="font-mono text-xs text-[#736E64]">
              Evaluation Dossier: {session.sessionId}
            </span>
          </div>
          <h1 className="mt-1 font-serif text-2xl font-bold text-[#191715]">
            Engineering Assessment Dossier
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="btn-secondary text-xs print-include"
            title="Export clean PDF or print this dossier"
          >
            <PrinterIcon size={14} className="text-[#144A3F]" />
            <span>Print / Export PDF</span>
          </button>

          <Link
            to="/feedback"
            className="btn-primary text-xs"
          >
            <span>Feedback Form</span>
            <ArrowRightIcon size={12} />
          </Link>
        </div>
      </div>

      {/* Printable Report Sheet */}
      <div className="mt-6 rounded-xl border border-[#DFD9CE] bg-white p-6 sm:p-8 shadow-sm print-card">
        {/* Document Header */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#DFD9CE] pb-6">
          <div>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#144A3F] block mb-1">
              PROOFLOOP VERIFIED ASSESSMENT DOSSIER
            </span>
            <h2 className="font-serif text-3xl font-bold text-[#191715]">{session.candidateName}</h2>
            <p className="text-xs text-[#57524A] font-medium mt-0.5">{session.candidateTitle}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-mono text-[#736E64]">
              <span>Applied Role: <strong className="text-[#191715]">{session.roleApplied}</strong></span>
              <span>•</span>
              <span>Session: <strong className="text-[#144A3F]">{session.sessionId}</strong></span>
              <span>•</span>
              <span>Duration: <strong className="text-[#191715]">{session.durationMinutes} Minutes</strong></span>
            </div>
          </div>

          {/* Hiring Verdict Badge */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono uppercase text-[#736E64] mb-1">
              Current Evaluator Verdict
            </span>
            <span
              className={`rounded-md border px-3 py-1.5 text-xs font-bold uppercase tracking-wider ${
                recommendationColorMap[reviewerNotes.recommendation] ||
                'text-[#126646] bg-[#EDF7F2] border-[#A3DBC4]'
              }`}
            >
              {reviewerNotes.recommendation.replace('_', ' ')}
            </span>
            <span className="text-[11px] font-mono text-[#736E64] mt-1">
              Status: {reviewerNotes.status}
            </span>
          </div>
        </div>

        {/* Executive Summary */}
        <div className="py-6 border-b border-[#DFD9CE]">
          <h3 className="font-serif text-base font-bold text-[#191715] mb-2">
            Executive Summary
          </h3>
          <p className="text-xs sm:text-sm text-[#4A463F] leading-relaxed font-normal">
            {executiveSummary}
          </p>
        </div>

        {/* Invariant Test Results Summary */}
        <div className="py-6 border-b border-[#DFD9CE]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-serif text-base font-bold text-[#191715]">
              Automated Invariant Test Suite Execution
            </h3>
            <span className="font-mono text-xs font-bold text-[#126646]">
              {testOutcomes.passed} / {testOutcomes.total} Passed ({testOutcomes.coveragePct}% Coverage)
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3 text-center">
              <span className="font-mono text-xl font-bold text-[#191715]">{testOutcomes.total}</span>
              <p className="text-[11px] text-[#736E64] mt-0.5">Total Invariants</p>
            </div>
            <div className="rounded-lg border border-[#A3DBC4] bg-[#EDF7F2] p-3 text-center">
              <span className="font-mono text-xl font-bold text-[#126646]">{testOutcomes.passed}</span>
              <p className="text-[11px] text-[#126646] mt-0.5 font-semibold">Passed Assertions</p>
            </div>
            <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3 text-center">
              <span className="font-mono text-xl font-bold text-[#A82424]">{testOutcomes.failed}</span>
              <p className="text-[11px] text-[#736E64] mt-0.5">Regressions</p>
            </div>
            <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3 text-center">
              <span className="font-mono text-xl font-bold text-[#144A3F]">{testOutcomes.coveragePct}%</span>
              <p className="text-[11px] text-[#736E64] mt-0.5">Boundary Coverage</p>
            </div>
          </div>
        </div>

        {/* Competency Evaluations */}
        <div className="py-6 border-b border-[#DFD9CE]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-[#191715]">
              Competency-Wise Findings & Scorecards
            </h3>
            <span className="text-xs text-[#736E64]">Scored on a 5.0 evidence-calibrated scale</span>
          </div>

          <CompetencyBars competencies={competencies} />
        </div>

        {/* Strengths & Improvement Areas */}
        <div className="py-6 border-b border-[#DFD9CE] grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Strengths */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#126646] flex items-center gap-1.5 mb-3">
              <CheckCircleIcon size={14} />
              <span>Evidence-Backed Strengths</span>
            </h4>
            <div className="space-y-2.5">
              {strengths.map((s, idx) => (
                <div key={idx} className="rounded-lg border border-[#A3DBC4] bg-[#EDF7F2] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#126646]">{s.title}</span>
                    <Link
                      to={`/evidence?id=${s.evidenceId}`}
                      className="font-mono text-[10px] text-[#126646] hover:underline"
                    >
                      {s.evidenceId} →
                    </Link>
                  </div>
                  <p className="mt-1 text-[11px] text-[#191715] leading-relaxed">
                    {s.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Improvement Areas */}
          <div>
            <h4 className="font-serif text-sm font-bold text-[#A1520C] flex items-center gap-1.5 mb-3">
              <ShieldIcon size={14} />
              <span>Growth & Follow-up Areas</span>
            </h4>
            <div className="space-y-2.5">
              {improvementAreas.map((area, idx) => (
                <div key={idx} className="rounded-lg border border-[#F6CE9F] bg-[#FEF6EC] p-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-xs text-[#A1520C]">{area.title}</span>
                    <Link
                      to={`/evidence?id=${area.evidenceId}`}
                      className="font-mono text-[10px] text-[#A1520C] hover:underline"
                    >
                      {area.evidenceId} →
                    </Link>
                  </div>
                  <p className="mt-1 text-[11px] text-[#7F3F08] leading-relaxed">
                    {area.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Limitations Notice */}
        <div className="py-6 border-b border-[#DFD9CE]">
          <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-4 text-xs text-[#57524A] leading-relaxed">
            <h4 className="font-bold text-[#191715] mb-1 font-mono uppercase text-[10px]">
              EVALUATION LIMITATIONS & METHODOLOGY DISCLOSURE
            </h4>
            <p>
              {limitationsNotice}
            </p>
          </div>
        </div>

        {/* Reviewer Notes & Decision Sign-Off */}
        <div className="pt-6">
          <ReviewerNotesSection />
        </div>
      </div>
    </div>
  );
};
