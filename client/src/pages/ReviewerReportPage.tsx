import { Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { CompetencyBars } from '../components/report/CompetencyBars';
import { ReviewerNotesSection } from '../components/report/ReviewerNotesSection';
import type { TestCase } from '../types';
import {
  PrinterIcon,
  CheckCircleIcon,
  ShieldIcon,
  FileTextIcon,
  ArrowRightIcon,
  ExternalLinkIcon,
} from '../components/common/Icons';

export const ReviewerReportPage = () => {
  const { reportData, testCases, reviewerNotes } = useAssessment();
  const { session, executiveSummary, competencies, strengths, improvementAreas, limitationsNotice } = reportData;

  const handlePrint = () => {
    window.print();
  };

  const recommendationColorMap: Record<string, string> = {
    STRONG_HIRE: 'text-emerald-400 bg-emerald-950/70 border-emerald-700/60',
    HIRE: 'text-teal-400 bg-teal-950/70 border-teal-700/60',
    LEAN_HIRE: 'text-blue-400 bg-blue-950/70 border-blue-700/60',
    NEEDS_FOLLOW_UP: 'text-amber-400 bg-amber-950/70 border-amber-700/60',
    NO_HIRE: 'text-rose-400 bg-rose-950/70 border-rose-700/60',
  };

  return (
    <div className="flex-1 bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full print-page">
      {/* Top Action Bar (hidden when printing) */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#182338] pb-5 no-print">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#0d1f33] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#00f2fe] border border-[#143e63]">
              REVIEWER REPORT
            </span>
            <span className="font-mono text-xs text-slate-400">
              Evaluation Dossier: {session.sessionId}
            </span>
          </div>
          <h1 className="mt-1 text-2xl font-extrabold text-white">
            Engineering Assessment Dossier
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 rounded-xl border border-[#223552] bg-[#0e1728] px-4 py-2 text-xs font-semibold text-slate-200 hover:border-[#00f2fe] hover:text-white transition-all shadow-sm"
          >
            <PrinterIcon size={14} className="text-[#00f2fe]" />
            <span>Print / Export PDF</span>
          </button>

          <Link
            to="/feedback"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#10b981] px-4 py-2 text-xs font-bold text-black shadow-md hover:opacity-95 transition-all"
          >
            <span>Feedback Form</span>
            <ArrowRightIcon size={13} />
          </Link>
        </div>
      </div>

      {/* Printable Report Header */}
      <div className="mt-6 rounded-2xl border border-[#1e2f4a] bg-[#0c1424] p-6 shadow-xl print-card">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-[#182338] pb-5">
          <div>
            <span className="text-[10px] font-mono uppercase tracking-wider text-[#38bdf8] block mb-1">
              PROOFLOOP VERIFIED ASSESSMENT DOSSIER
            </span>
            <h2 className="text-2xl font-bold text-white">{session.candidateName}</h2>
            <p className="text-xs text-slate-300 font-medium mt-0.5">{session.candidateTitle}</p>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-xs font-mono text-slate-400">
              <span>Target Role: <strong className="text-slate-200">{session.roleApplied}</strong></span>
              <span>•</span>
              <span>Session: <strong className="text-[#00f2fe]">{session.sessionId}</strong></span>
              <span>•</span>
              <span>Duration: <strong className="text-slate-200">45 Minutes</strong></span>
            </div>
          </div>

          {/* Overall Verdict Badge */}
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono uppercase text-slate-400 mb-1">
              Current Verdict
            </span>
            <span
              className={`rounded-xl border px-3.5 py-1.5 text-xs font-bold uppercase tracking-wider ${
                recommendationColorMap[reviewerNotes.recommendation] ||
                'text-emerald-400 bg-emerald-950/70 border-emerald-700/60'
              }`}
            >
              {reviewerNotes.recommendation.replace('_', ' ')}
            </span>
            <span className="text-[11px] font-mono text-slate-400 mt-1">
              Status: {reviewerNotes.status}
            </span>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-4 rounded-lg bg-[#080d17] border border-[#19273c] p-2.5 text-[11px] text-slate-400 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <ShieldIcon size={12} className="text-[#00f2fe]" />
            <span>Interactive Demo Dossier: Telemetry is generated deterministically in local client state.</span>
          </span>
          <span className="font-mono text-slate-300">Composite Score: 94/100</span>
        </div>
      </div>

      {/* Executive Summary */}
      <div className="mt-6 rounded-2xl border border-[#1b283d] bg-[#090f1a] p-6 shadow-lg print-card">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#38bdf8] flex items-center gap-2 mb-3">
          <FileTextIcon size={15} /> Executive Evaluator Summary
        </h3>
        <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-sans">
          {executiveSummary}
        </p>
      </div>

      {/* Competency Findings Breakdown */}
      <div className="mt-6 rounded-2xl border border-[#1b283d] bg-[#090f1a] p-6 shadow-lg print-card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#00f2fe]">
            Competency-Wise Findings & Score Distribution
          </h3>
          <span className="text-xs font-mono text-slate-400">Rubric: 1.0 - 5.0 Standard</span>
        </div>
        <CompetencyBars competencies={competencies} />
      </div>

      {/* Strengths & Improvement Areas Grid */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="rounded-2xl border border-[#1b283d] bg-[#090f1a] p-6 shadow-lg print-card">
          <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-4">
            <CheckCircleIcon size={16} /> Key Verified Strengths
          </h3>
          <div className="space-y-3.5">
            {strengths.map((st: { title: string; description: string; evidenceId: string }, i: number) => (
              <div key={i} className="rounded-xl border border-[#1a2d24] bg-[#091512] p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white">{st.title}</h4>
                  <Link
                    to={`/evidence?id=${st.evidenceId}`}
                    className="flex items-center gap-1 font-mono text-[10px] text-[#00f2fe] hover:underline"
                    title="View Evidence details"
                  >
                    <span>{st.evidenceId}</span>
                    <ExternalLinkIcon size={10} />
                  </Link>
                </div>
                <p className="text-slate-300 leading-relaxed">{st.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Improvement Areas */}
        <div className="rounded-2xl border border-[#1b283d] bg-[#090f1a] p-6 shadow-lg print-card">
          <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-4">
            <ShieldIcon size={16} /> Growth & Nuance Areas
          </h3>
          <div className="space-y-3.5">
            {improvementAreas.map((ia: { title: string; description: string; evidenceId: string }, i: number) => (
              <div key={i} className="rounded-xl border border-[#2d261a] bg-[#161209] p-3 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="font-bold text-white">{ia.title}</h4>
                  <Link
                    to={`/evidence?id=${ia.evidenceId}`}
                    className="flex items-center gap-1 font-mono text-[10px] text-amber-400 hover:underline"
                    title="View Evidence details"
                  >
                    <span>{ia.evidenceId}</span>
                    <ExternalLinkIcon size={10} />
                  </Link>
                </div>
                <p className="text-slate-300 leading-relaxed">{ia.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Simulated Test Outcomes Table */}
      <div className="mt-6 rounded-2xl border border-[#1b283d] bg-[#090f1a] p-6 shadow-lg print-card">
        <div className="flex items-center justify-between mb-4 border-b border-[#182338] pb-3">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-white">
              Deterministic Test Assertions & Boundary Coverage
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Automated execution results for invariant test cases.
            </p>
          </div>
          <span className="rounded bg-emerald-950/80 px-2.5 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-800">
            6 / 6 Suites Passing (98.4% Coverage)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#182338] text-[11px] font-mono uppercase text-slate-400">
              <tr>
                <th className="py-2 px-3">Test Case ID</th>
                <th className="py-2 px-3">Name & Description</th>
                <th className="py-2 px-3">Category</th>
                <th className="py-2 px-3">Duration</th>
                <th className="py-2 px-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#151f30]">
              {testCases.map((test: TestCase) => (
                <tr key={test.id} className="hover:bg-[#0c1424] transition-colors">
                  <td className="py-2.5 px-3 font-mono font-semibold text-[#00f2fe]">{test.id}</td>
                  <td className="py-2.5 px-3">
                    <span className="font-semibold text-white block">{test.name}</span>
                    <span className="text-[11px] text-slate-400">{test.description}</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono capitalize text-slate-300">{test.category}</td>
                  <td className="py-2.5 px-3 font-mono text-slate-400">{test.durationMs || 15}ms</td>
                  <td className="py-2.5 px-3">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-950/60 px-2 py-0.5 font-mono text-[11px] font-semibold text-emerald-400 border border-emerald-800/40">
                      <CheckCircleIcon size={12} /> PASSED
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Evidence Coverage & Limitations Notice */}
      <div className="mt-6 rounded-2xl border border-[#1b283d] bg-[#090f1a] p-5 text-xs text-slate-400 print-card">
        <h4 className="font-semibold text-slate-300 uppercase tracking-wider text-[11px] mb-1">
          Evidence Scope & Limitations Notice
        </h4>
        <p className="leading-relaxed">
          {limitationsNotice}
        </p>
      </div>

      {/* Reviewer Notes & Decision (Interactive and saveable to localStorage) */}
      <div className="mt-6 no-print">
        <ReviewerNotesSection />
      </div>
    </div>
  );
};
