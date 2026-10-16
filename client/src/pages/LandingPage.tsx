import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import {
  PlayIcon,
  CheckCircleIcon,
  CodeIcon,
  ShieldIcon,
  TerminalIcon,
  FileTextIcon,
  ArrowRightIcon,
  SparklesIcon,
  LayersIcon,
} from '../components/common/Icons';

export const LandingPage: React.FC = () => {
  const [activePreviewTab, setActivePreviewTab] = useState<'workspace' | 'loop' | 'report'>('workspace');
  const navigate = useNavigate();
  const { startAssessment, activity, error } = useAssessment();
  const launchAssessment = async () => {
    try { await startAssessment(); navigate('/assessment'); } catch { /* error is shown below */ }
  };

  return (
    <div className="flex flex-col bg-[#070a10] text-slate-100 overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-20 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        {/* Subtle background glow */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 h-96 w-[700px] rounded-full bg-gradient-to-tr from-cyan-500/10 via-teal-500/10 to-transparent blur-3xl pointer-events-none" />

        <div className="text-center max-w-3xl mx-auto relative z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-[#1e324c] bg-[#0c1524] px-3.5 py-1 text-xs text-slate-300 shadow-inner mb-6">
            <span className="flex h-2 w-2 rounded-full bg-[#00f2fe]" />
            <span className="font-mono text-[11px] text-[#38bdf8] font-semibold">
              NEXT-GEN AI ENGINEERING EVALUATION
            </span>
            <span className="text-slate-500">•</span>
            <span>ProofLoop Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Assess the engineering, <br />
            <span className="bg-gradient-to-r from-[#00f2fe] via-[#2dd4bf] to-[#38bdf8] bg-clip-text text-transparent">
              not just the output.
            </span>
          </h1>

          {/* Description */}
          <p className="mt-6 text-base sm:text-lg text-slate-300 leading-relaxed font-normal max-w-2xl mx-auto">
            Evaluate how engineers reason, use AI, test assumptions, debug failures, and validate their work. ProofLoop organizes assessment activity into inspectable evidence to help reviewers make more informed decisions.
          </p>

          {/* CTAs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
            <button
              type="button"
              onClick={launchAssessment}
              disabled={activity === 'starting'}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#10b981] px-5 py-3 text-sm font-bold text-black shadow-lg shadow-teal-950/40 hover:opacity-95 transition-all hover:scale-[1.02]"
            >
              <PlayIcon size={14} />
              <span>{activity === 'starting' ? 'Starting Assessment…' : 'Launch Assessment Workspace'}</span>
            </button>

            <Link
              to="/report"
              className="flex items-center gap-2 rounded-xl border border-[#223552] bg-[#0e1728] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-[#00f2fe]/50 hover:bg-[#121d33] transition-all"
            >
              <FileTextIcon size={15} className="text-[#00f2fe]" />
              <span>View Reviewer Report</span>
            </Link>

            <Link
              to="/timeline"
              className="flex items-center gap-2 rounded-xl border border-[#223552] bg-[#0e1728] px-5 py-3 text-sm font-semibold text-slate-200 hover:border-[#00f2fe]/50 hover:bg-[#121d33] transition-all"
            >
              <span>Explore Verification Loop</span>
              <ArrowRightIcon size={14} className="text-[#38bdf8]" />
            </Link>
          </div>
          {error && <p role="alert" className="mt-3 text-sm text-rose-300">{error}</p>}

          {/* Quick Metrics Bar */}
          <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#162236] pt-8 text-left">
            <div className="rounded-xl border border-[#18263d] bg-[#09101d] p-3.5">
              <span className="font-mono text-lg font-bold text-white">Server-backed</span>
              <p className="mt-1 text-xs text-slate-400">Assessment sessions</p>
            </div>
            <div className="rounded-xl border border-[#18263d] bg-[#09101d] p-3.5">
              <span className="font-mono text-lg font-bold text-[#00f2fe]">Visible tests</span>
              <p className="mt-1 text-xs text-slate-400">Results from the execution API</p>
            </div>
            <div className="rounded-xl border border-[#18263d] bg-[#09101d] p-3.5">
              <span className="font-mono text-lg font-bold text-emerald-400">AI Coach</span>
              <p className="mt-1 text-xs text-slate-400">Provider mode is reported from evidence</p>
            </div>
            <div className="rounded-xl border border-[#18263d] bg-[#09101d] p-3.5">
              <span className="font-mono text-lg font-bold text-[#c084fc]">Evidence report</span>
              <p className="mt-1 text-xs text-slate-400">Built from server-recorded events</p>
            </div>
          </div>
        </div>

        {/* Interactive Product Preview */}
        <div className="mt-14 rounded-2xl border border-[#21324d] bg-[#090f1b] shadow-2xl overflow-hidden">
          {/* Mock Browser/Workspace Bar */}
          <div className="flex flex-wrap items-center justify-between border-b border-[#1a293f] bg-[#060a12] px-4 py-2.5 gap-2">
            <div className="flex items-center gap-2">
              <div className="flex gap-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="ml-2 font-mono text-xs text-slate-400">
                Illustrative preview · live data appears after starting an assessment
              </span>
            </div>

            {/* Segmented Interactive Preview Switcher */}
            <div className="flex items-center rounded-lg border border-[#1c2c44] bg-[#0c1422] p-0.5 text-xs font-medium">
              <button
                onClick={() => setActivePreviewTab('workspace')}
                className={`rounded-md px-3 py-1 transition-colors ${
                  activePreviewTab === 'workspace'
                    ? 'bg-[#18283e] text-[#00f2fe] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                1. Candidate Workspace
              </button>
              <button
                onClick={() => setActivePreviewTab('loop')}
                className={`rounded-md px-3 py-1 transition-colors ${
                  activePreviewTab === 'loop'
                    ? 'bg-[#18283e] text-[#00f2fe] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                2. Verification Loop
              </button>
              <button
                onClick={() => setActivePreviewTab('report')}
                className={`rounded-md px-3 py-1 transition-colors ${
                  activePreviewTab === 'report'
                    ? 'bg-[#18283e] text-[#00f2fe] font-semibold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                3. Reviewer Synthesis
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="p-4 sm:p-6 bg-[#090f1b]">
            {activePreviewTab === 'workspace' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs">
                {/* Panel 1 */}
                <div className="rounded-xl border border-[#1a293f] bg-[#070c16] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-[#00f2fe] font-semibold">TASK SPECIFICATION</span>
                      <span className="text-amber-400">28:14</span>
                    </div>
                    <h3 className="font-sans font-bold text-sm text-white mb-2">
                      PATCH /preferences with Explicit False
                    </h3>
                    <p className="font-sans text-xs text-slate-300 leading-relaxed">
                      Preserve omitted fields, guard against boolean false coercion bugs, and implement prototype pollution filters.
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#162236] text-[11px] text-emerald-400 flex items-center gap-1.5">
                    <CheckCircleIcon size={13} />
                    <span>5 / 5 Criteria Verified</span>
                  </div>
                </div>

                {/* Panel 2 */}
                <div className="rounded-xl border border-[#1a293f] bg-[#070c16] p-4">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <span className="text-purple-400 font-semibold">preferencesHandler.ts</span>
                    <span>TypeScript</span>
                  </div>
                  <pre className="text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`function patchUserPreferences(current, patch) {
  // CRITICAL FIX FOR EXPLICIT FALSE:
  if (val !== undefined) {
    if (typeof val === 'object' && !Array.isArray(val)) {
      recursiveMerge(target[key], val);
    } else {
      target[key] = val; // preserved false!
    }
  }
}`}
                  </pre>
                </div>

                {/* Panel 3 */}
                <div className="rounded-xl border border-[#1a293f] bg-[#070c16] p-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between text-slate-400 mb-2">
                      <span className="text-teal-400 font-semibold">AI COPILOT TELEMETRY</span>
                      <span>Latency: 780ms</span>
                    </div>
                    <div className="rounded bg-[#0c1626] p-2 text-slate-300 mb-2 text-[11px]">
                      "Candidate prompted AI regarding Boolean false edge cases. Caught shallow merge bug in AI suggestion."
                    </div>
                  </div>
                  <Link
                    to="/assessment"
                    className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-[#122238] py-2 text-xs font-semibold text-[#00f2fe] border border-[#1a385c] hover:bg-[#183152]"
                  >
                    <span>Open Live Assessment</span>
                    <ArrowRightIcon size={12} />
                  </Link>
                </div>
              </div>
            )}

            {activePreviewTab === 'loop' && (
              <div className="rounded-xl border border-[#1a293f] bg-[#070c16] p-5 space-y-3 font-sans">
                <div className="flex items-center justify-between pb-3 border-b border-[#182338]">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Candidate Problem-Solving Timeline (8 Events)</span>
                    <span className="rounded bg-teal-950 px-2 py-0.5 text-[10px] font-mono text-teal-300 border border-teal-800">
                      Chronological Trace
                    </span>
                  </h3>
                  <Link to="/timeline" className="text-xs text-[#00f2fe] hover:underline flex items-center gap-1">
                    <span>Full Loop Inspector</span>
                    <ArrowRightIcon size={12} />
                  </Link>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-[#1f304b] bg-[#0a1220] p-3">
                    <span className="font-mono text-[10px] text-purple-400">T+04:45 • AI_SUGGESTION</span>
                    <h4 className="font-bold text-white mt-1">AI returns naive spread</h4>
                    <p className="mt-1 text-[11px] text-slate-300">
                      AI suggests shallow copy; candidate identifies that nested keys will be obliterated.
                    </p>
                  </div>
                  <div className="rounded-lg border border-rose-900/40 bg-rose-950/20 p-3">
                    <span className="font-mono text-[10px] text-rose-400">T+11:15 • TEST_FAIL</span>
                    <h4 className="font-bold text-white mt-1">Test Run #1: 2 Failures</h4>
                    <p className="mt-1 text-[11px] text-slate-300">
                      System caught missing recursion and absence of prototype pollution guard.
                    </p>
                  </div>
                  <div className="rounded-lg border border-emerald-900/40 bg-emerald-950/20 p-3">
                    <span className="font-mono text-[10px] text-emerald-400">T+18:22 • VERIFIED</span>
                    <h4 className="font-bold text-white mt-1">Surgical Fix & Green Tests</h4>
                    <p className="mt-1 text-[11px] text-slate-300">
                      Candidate implemented DISALLOWED_KEYS set and strict undefined check in 180 seconds.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'report' && (
              <div className="rounded-xl border border-[#1a293f] bg-[#070c16] p-5 space-y-4 font-sans">
                <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#182338]">
                  <div>
                    <span className="font-mono text-xs text-[#00f2fe]">CANDIDATE: ALEX MERCER</span>
                    <h3 className="text-base font-bold text-white">Staff AI Systems Engineer</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-emerald-950 px-3 py-1 text-xs font-bold text-emerald-300 border border-emerald-800">
                      Recommendation: Strong Hire
                    </span>
                    <Link to="/report" className="text-xs text-[#00f2fe] hover:underline flex items-center gap-1">
                      <span>View Full Report</span>
                      <ArrowRightIcon size={12} />
                    </Link>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="rounded-lg border border-[#1c2b42] bg-[#09111e] p-3">
                    <span className="text-[10px] uppercase font-bold text-[#38bdf8]">AI Critical Literacy</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">4.8 / 5.0</div>
                    <p className="text-[11px] text-slate-400 mt-1">Zero blind copies; tested AI suggestions against boundary cases.</p>
                  </div>
                  <div className="rounded-lg border border-[#1c2b42] bg-[#09111e] p-3">
                    <span className="text-[10px] uppercase font-bold text-[#10b981]">Debugging Efficiency</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">4.9 / 5.0</div>
                    <p className="text-[11px] text-slate-400 mt-1">Targeted root cause isolated within 3 minutes of test failure.</p>
                  </div>
                  <div className="rounded-lg border border-[#1c2b42] bg-[#09111e] p-3">
                    <span className="text-[10px] uppercase font-bold text-[#c084fc]">Defensive Engineering</span>
                    <div className="text-xl font-bold font-mono text-white mt-1">4.6 / 5.0</div>
                    <p className="text-[11px] text-slate-400 mt-1">Added prototype pollution protection & immutability checks.</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 4-Step Verification Workflow Overview */}
      <section className="border-t border-[#152033] bg-[#060910] px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="rounded-full bg-[#0d1c2e] px-3 py-1 font-mono text-[11px] font-semibold text-[#00f2fe] border border-[#163b5c]">
              THE PROOFLOOP VERIFICATION METHOD
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              From Sandbox Activity to Corroborated Evidence
            </h2>
            <p className="mt-3 text-sm text-slate-400 leading-relaxed">
              Traditional code tests only check the final commit string. ProofLoop captures every hypothesis, test failure, and AI interaction into an explainable audit trail.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="relative rounded-2xl border border-[#1c2b42] bg-[#0a1220] p-6 flex flex-col justify-between hover:border-[#00f2fe]/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-[#00f2fe] border border-teal-500/30 font-mono font-bold text-sm mb-4">
                  01
                </div>
                <h3 className="text-base font-bold text-white mb-2">Real Engineering Scenarios</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Candidates work on production-like tasks—such as partial patch APIs with explicit false preservation, deep recursion, and security invariants.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#162338] text-[11px] font-mono text-slate-400">
                <span>Domain: Distributed APIs & Systems</span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="relative rounded-2xl border border-[#1c2b42] bg-[#0a1220] p-6 flex flex-col justify-between hover:border-[#00f2fe]/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 font-mono font-bold text-sm mb-4">
                  02
                </div>
                <h3 className="text-base font-bold text-white mb-2">AI Copilot Telemetry</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Evaluate how developers prompt AI: Do they ask surgical edge-case questions, or do they blindly copy-paste hallucinated code into production files?
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#162338] text-[11px] font-mono text-slate-400">
                <span>Metric: AI Critical Literacy</span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="relative rounded-2xl border border-[#1c2b42] bg-[#0a1220] p-6 flex flex-col justify-between hover:border-[#00f2fe]/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 font-mono font-bold text-sm mb-4">
                  03
                </div>
                <h3 className="text-base font-bold text-white mb-2">Verification Loop</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Watch code evolution over time. When a test fails, see whether the engineer forms systematic hypotheses or relies on random shotgun changes.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#162338] text-[11px] font-mono text-slate-400">
                <span>Metric: MTTR & Root Cause Depth</span>
              </div>
            </div>

            {/* Step 4 */}
            <div className="relative rounded-2xl border border-[#1c2b42] bg-[#0a1220] p-6 flex flex-col justify-between hover:border-[#00f2fe]/40 transition-colors">
              <div>
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono font-bold text-sm mb-4">
                  04
                </div>
                <h3 className="text-base font-bold text-white mb-2">Evidence Ledger & Report</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Every hiring recommendation is cross-referenced with exact Evidence IDs (e.g. EV-102), distinguishing corroborated facts from evaluator impressions.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#162338] text-[11px] font-mono text-slate-400">
                <span>Output: Explainable PDF Report</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Cards Grid */}
      <section className="px-4 py-20 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="rounded-full bg-[#112338] px-3 py-1 font-mono text-[11px] font-semibold text-[#38bdf8] border border-[#1a3d61]">
            ENTERPRISE-GRADE CAPABILITIES
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Designed for Staff Engineers & Hiring Committees
          </h2>
          <p className="mt-3 text-sm text-slate-400 leading-relaxed">
            Eliminate hours of inconclusive interview debates with factual telemetry and reproducible engineering artifacts.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <Link
            to="/assessment"
            className="group rounded-2xl border border-[#1b283d] bg-[#090f1b] p-6 hover:border-[#00f2fe]/50 hover:bg-[#0c1424] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-500/10 text-[#00f2fe] border border-teal-500/30 mb-4">
                <CodeIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-[#00f2fe] transition-colors">
                Candidate Assessment Workspace
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Monaco code editor with realistic file structure, invariant checklist, local test runner, and context-aware simulated copilot.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-[#00f2fe]">
              <span>Explore Workspace</span>
              <ArrowRightIcon size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 2 */}
          <Link
            to="/timeline"
            className="group rounded-2xl border border-[#1b283d] bg-[#090f1b] p-6 hover:border-[#00f2fe]/50 hover:bg-[#0c1424] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/30 mb-4">
                <TerminalIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-purple-400 transition-colors">
                Verification Loop Timeline
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Step-by-step playback of prompt queries, AI suggestions, code diffs, failing test assertions, and corrective debugging actions.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-purple-400">
              <span>Inspect Timeline</span>
              <ArrowRightIcon size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 3 */}
          <Link
            to="/evidence"
            className="group rounded-2xl border border-[#1b283d] bg-[#090f1b] p-6 hover:border-[#00f2fe]/50 hover:bg-[#0c1424] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 mb-4">
                <LayersIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-cyan-400 transition-colors">
                Evidence Ledger
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Structured ledger connecting observations to competency rubrics, with explicit confidence grades and counter-evidence tracking.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-cyan-400">
              <span>View Evidence Ledger</span>
              <ArrowRightIcon size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 4 */}
          <Link
            to="/report"
            className="group rounded-2xl border border-[#1b283d] bg-[#090f1b] p-6 hover:border-[#00f2fe]/50 hover:bg-[#0c1424] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 mb-4">
                <FileTextIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">
                Reviewer Evaluation Report
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Executive summary, competency scores, evidence-backed strengths and weaknesses, interactive reviewer decisions, and print-ready PDF export.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
              <span>Open Reviewer Report</span>
              <ArrowRightIcon size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 5 */}
          <Link
            to="/feedback"
            className="group rounded-2xl border border-[#1b283d] bg-[#090f1b] p-6 hover:border-[#00f2fe]/50 hover:bg-[#0c1424] transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 mb-4">
                <SparklesIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Candidate & Reviewer Feedback
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Structured feedback forms evaluating assessment realism, copilot utility, and process clarity with localStorage persistence.
              </p>
            </div>
            <div className="mt-6 flex items-center gap-1.5 text-xs font-semibold text-amber-400">
              <span>Submit Feedback</span>
              <ArrowRightIcon size={13} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          {/* Card 6 */}
          <div className="rounded-2xl border border-[#1c293e] bg-[#0b1322] p-6 flex flex-col justify-between">
            <div>
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30 mb-4">
                <ShieldIcon size={20} />
              </div>
              <h3 className="text-lg font-bold text-white">
                Responsible AI & Privacy
              </h3>
              <p className="mt-2 text-xs text-slate-300 leading-relaxed">
                Sandboxed candidate environment with zero surveillance trackers. Objective fact-backed assessments remove unconscious interviewer bias.
              </p>
            </div>
            <div className="mt-6 text-xs text-slate-400 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400" />
              <span>Zero Black-Box Scoring</span>
            </div>
          </div>
        </div>
      </section>

      {/* Responsible Assessment & Transparency Banner */}
      <section className="border-t border-[#152033] bg-[#080d17] px-4 py-16 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto rounded-2xl border border-[#1e2f4a] bg-[#0c1526] p-8 shadow-xl">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500/10 text-[#00f2fe] border border-teal-500/30">
              <ShieldIcon size={24} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">
                Our Guarantee: Transparent, Evidence-Based Assessment
              </h3>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 leading-relaxed">
                ProofLoop never rates candidates based on proprietary black-box algorithms or secret keystroke trackers. Instead, we structure concrete actions—the exact test failures, AI query formulation, and code diffs—so human engineers can make calibrated, unbiased hiring decisions based on demonstrated engineering skill.
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-xs font-mono text-[#00f2fe]">
                <span>• No black-box AI scores</span>
                <span>• Inspectable candidate telemetry</span>
                <span>• Deterministic invariant verification</span>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
