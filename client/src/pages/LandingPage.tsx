import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlayIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  UserIcon,
  EyeIcon,
} from '../components/common/Icons';

export const LandingPage: React.FC = () => {
  const [activeInteractiveScenario, setActiveInteractiveScenario] = useState<number>(0);

  const interactiveScenarios = [
    {
      id: 'bool-invariant',
      title: 'Explicit Boolean `false` Preservation',
      badge: 'Edge Case Guard',
      action: `// Refactored from naive 'val || existing' to strict check\nif (val !== undefined) {\n  target[key] = val; // Preserves twoFactorEnabled: false\n}`,
      verification: 'PASS: TC-02 (Boundary assertion confirmed explicit false preservation)',
      evidence: 'EVD-101: Corroborated Fact (95% weight) — Falsy coercion vulnerability remediated',
      finding: 'AI Critical Literacy: Exemplary — Candidate rejected loose fallback logic',
    },
    {
      id: 'proto-security',
      title: 'Prototype Pollution Sanitization',
      badge: 'Defensive Security',
      action: `const DISALLOWED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);\nif (DISALLOWED_KEYS.has(key)) continue;`,
      verification: 'PASS: TC-04 (Security check confirmed Object.prototype remains unpolluted)',
      evidence: 'EVD-103: Corroborated Fact (90% weight) — Injection attack vectors stripped',
      finding: 'Defensive Engineering: Exemplary — Proactively hardened recursive merge loop',
    },
    {
      id: 'deep-merge',
      title: 'Deep Nested Sibling Preservation',
      badge: 'Data Integrity',
      action: `if (typeof val === 'object' && val !== null && !Array.isArray(val)) {\n  recursiveMerge(target[key], val); // Preserves sibling keys\n}`,
      verification: 'PASS: TC-03 (Nested notifications.email intact while notifications.push updated)',
      evidence: 'EVD-102: Corroborated Fact (92% weight) — Atomic mutation audit log verified',
      finding: 'System Architecture: Proficient — Correct recursion tree traversal',
    },
  ];

  const currentScenario = interactiveScenarios[activeInteractiveScenario];

  return (
    <div className="flex flex-col bg-base text-primary">
      {/* ==========================================================================
          HERO SECTION (Spacious, Intentional, High-Contrast)
          ========================================================================== */}
      <section className="relative px-4 pt-16 pb-16 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full text-center">
        {/* Eyebrow */}
        <div className="inline-flex items-center gap-2 rounded-full border border-default bg-surface px-3.5 py-1 text-xs text-secondary shadow-2xs mb-6">
          <span className="flex h-2 w-2 rounded-full bg-forest" />
          <span className="font-mono text-[11px] text-forest font-bold tracking-tight">
            ENGINEERING ASSESSMENT, BACKED BY EVIDENCE
          </span>
        </div>

        {/* Headline */}
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-primary leading-[1.12] max-w-4xl mx-auto">
          Assess the engineering, <br className="hidden sm:inline" />
          <span className="text-forest italic">not just the output.</span>
        </h1>

        {/* Supporting Copy */}
        <p className="mt-6 text-base sm:text-lg text-secondary leading-relaxed font-normal max-w-2xl mx-auto">
          ProofLoop evaluates how engineers reason, validate assumptions, handle edge cases, and debug failures—turning assessment activity into transparent, reviewable evidence.
        </p>

        {/* Action CTAs */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3.5">
          <Link
            to="/workspace"
            className="btn-primary text-sm px-5 py-2.5 shadow-md"
          >
            <PlayIcon size={14} />
            <span>Start a Demo Assessment</span>
          </Link>

          <a
            href="#how-it-works"
            className="btn-secondary text-sm px-4 py-2.5"
          >
            <span>Explore How It Works</span>
            <ArrowRightIcon size={13} className="text-forest" />
          </a>
        </div>

        {/* Compact, Refined Visual Preview: The 4-Stage Trace Pipeline */}
        <div className="mt-14 max-w-4xl mx-auto rounded-xl border border-default bg-surface p-5 sm:p-6 shadow-sm text-left">
          <div className="flex items-center justify-between border-b border-default pb-3 mb-4">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[#126646]" />
              <span className="font-mono text-xs font-bold text-primary">
                The ProofLoop Trace Chain
              </span>
            </div>
            <span className="text-[11px] font-mono text-muted">
              Deterministic Verification Architecture
            </span>
          </div>

          {/* 4 Pipeline Steps in a clean row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {/* Step 1 */}
            <div className="rounded-lg border border-default bg-surface-elevated p-3.5">
              <span className="text-[10px] font-mono font-bold uppercase text-forest block mb-1">
                1. Candidate Action
              </span>
              <h4 className="text-xs font-bold text-primary mb-1">Code & AI Activity</h4>
              <p className="text-[11px] text-secondary leading-relaxed">
                The candidate writes code, edits functions, or asks the sandboxed AI copilot for invariant suggestions.
              </p>
            </div>

            {/* Step 2 */}
            <div className="rounded-lg border border-default bg-surface-elevated p-3.5">
              <span className="text-[10px] font-mono font-bold uppercase text-forest block mb-1">
                2. Verification Event
              </span>
              <h4 className="text-xs font-bold text-primary mb-1">Automated Test Runs</h4>
              <p className="text-[11px] text-secondary leading-relaxed">
                The platform executes deterministic tests to verify boundary conditions, safety invariants, and edge cases.
              </p>
            </div>

            {/* Step 3 */}
            <div className="rounded-lg border border-default bg-surface-elevated p-3.5">
              <span className="text-[10px] font-mono font-bold uppercase text-terracotta block mb-1">
                3. Evidence Record
              </span>
              <h4 className="text-xs font-bold text-primary mb-1">Audit-Ready Ledger</h4>
              <p className="text-[11px] text-secondary leading-relaxed">
                Every test pass, failure trace, and code revision is permanently indexed as verified proof in the evidence ledger.
              </p>
            </div>

            {/* Step 4 */}
            <div className="rounded-lg border border-default bg-surface-elevated p-3.5">
              <span className="text-[10px] font-mono font-bold uppercase text-forest block mb-1">
                4. Reviewer Finding
              </span>
              <h4 className="text-xs font-bold text-primary mb-1">Transparent Evaluation</h4>
              <p className="text-[11px] text-secondary leading-relaxed">
                Interviewers assess how the candidate actually reasons and debugs, backed by verifiable evidence instead of black-box guesses.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 1: HOW PROOFLOOP WORKS (4 Deliberate Steps)
          ========================================================================== */}
      <section id="how-it-works" className="border-t border-default bg-surface py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-forest">
              ASSESSMENT WORKFLOW
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-2">
              How ProofLoop Evaluates Engineering Craft
            </h2>
            <p className="mt-2 text-sm text-secondary">
              A transparent, deterministic evaluation cycle designed for engineering realism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="rounded-xl border border-default bg-base p-5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xl font-bold text-forest">01</span>
                <h3 className="font-serif text-base font-bold text-primary mt-2">
                  Real Production Task
                </h3>
                <p className="mt-2 text-xs text-secondary leading-relaxed">
                  Candidates work on realistic system components—such as a partial patch engine—with subtle invariants, security boundaries, and edge cases.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-mono text-muted">TypeScript & Node.js</span>
            </div>

            <div className="rounded-xl border border-default bg-base p-5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xl font-bold text-forest">02</span>
                <h3 className="font-serif text-base font-bold text-primary mt-2">
                  Telemetry Capture
                </h3>
                <p className="mt-2 text-xs text-secondary leading-relaxed">
                  As candidates reason, test hypotheses, edit code, and query AI copilot, ProofLoop logs every meaningful action into a chronological timeline.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-mono text-muted">Zero invasive surveillance</span>
            </div>

            <div className="rounded-xl border border-default bg-base p-5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xl font-bold text-terracotta">03</span>
                <h3 className="font-serif text-base font-bold text-primary mt-2">
                  Evidence Indexing
                </h3>
                <p className="mt-2 text-xs text-secondary leading-relaxed">
                  Telemetry events are categorized into an inspectable Evidence Ledger, separating direct automated observations from rubric evaluations.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-mono text-muted">Corroborated proof points</span>
            </div>

            <div className="rounded-xl border border-default bg-base p-5 flex flex-col justify-between">
              <div>
                <span className="font-mono text-xl font-bold text-forest">04</span>
                <h3 className="font-serif text-base font-bold text-primary mt-2">
                  Reviewer Dossier
                </h3>
                <p className="mt-2 text-xs text-secondary leading-relaxed">
                  Hiring committees review an editorial report with criteria-level findings, evidence links, and verifiable test coverage.
                </p>
              </div>
              <span className="mt-4 text-[11px] font-mono text-muted">Print & PDF ready</span>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 2: WHY EVIDENCE MATTERS (Concise Comparison)
          ========================================================================== */}
      <section id="why-evidence" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-forest">
            THE PARADIGM SHIFT
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-primary mt-2">
            Output-Only Testing vs. Evidence-Driven Assessment
          </h2>
          <p className="mt-2 text-sm text-secondary">
            In an era where AI generates code in seconds, assessing only the final output is obsolete.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Legacy Coding Tests */}
          <div className="rounded-xl border border-default bg-surface p-6 shadow-xs">
            <span className="font-mono text-xs font-bold text-muted uppercase">Traditional Output Tests</span>
            <h3 className="font-serif text-lg font-bold text-primary mt-1">Binary Pass / Fail Puzzles</h3>
            <ul className="mt-4 space-y-3 text-xs text-secondary">
              <li className="flex items-start gap-2">
                <span className="text-[#A82424] font-bold">✕</span>
                <span>Focuses strictly on final output; ignores problem-solving reasoning.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A82424] font-bold">✕</span>
                <span>Vulnerable to memorization, LeetCode puzzle cramming, and unchecked LLM copy-paste.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#A82424] font-bold">✕</span>
                <span>Produces subjective reviewer impressions without auditable proof.</span>
              </li>
            </ul>
          </div>

          {/* ProofLoop Evidence Engine */}
          <div className="rounded-xl border border-forest bg-surface p-6 shadow-sm ring-1 ring-forest/20">
            <span className="font-mono text-xs font-bold text-forest uppercase">ProofLoop Evidence Platform</span>
            <h3 className="font-serif text-lg font-bold text-primary mt-1">Verifiable Engineering Telemetry</h3>
            <ul className="mt-4 space-y-3 text-xs text-primary font-medium">
              <li className="flex items-start gap-2">
                <CheckCircleIcon size={14} className="text-forest mt-0.5 shrink-0" />
                <span>Captures how candidates isolate regressions, validate assumptions, and debug.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon size={14} className="text-forest mt-0.5 shrink-0" />
                <span>Encourages AI copilot usage while measuring prompt literacy and hallucination resistance.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircleIcon size={14} className="text-forest mt-0.5 shrink-0" />
                <span>Compiles an immutable audit trail connecting findings directly to code diffs and test logs.</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 3: BUILT FOR TWO AUDIENCES (Candidates vs Reviewers)
          ========================================================================== */}
      <section id="audiences" className="border-t border-default bg-surface py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="font-mono text-xs font-bold uppercase tracking-wider text-forest">
              DUAL PERSPECTIVE
            </span>
            <h2 className="font-serif text-3xl font-bold text-primary mt-2">
              Designed for Both Sides of Technical Hiring
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {/* Candidates */}
            <div className="rounded-xl border border-default bg-base p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#EAF4F1] text-forest">
                  <UserIcon size={14} />
                </div>
                <h3 className="font-serif text-lg font-bold text-primary">For Candidates</h3>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Demonstrate genuine engineering capability in a realistic workbench with real acceptance criteria, sandboxed AI assistance, and instant test execution.
              </p>
              <div className="mt-4 pt-3 border-t border-default">
                <Link to="/workspace" className="btn-secondary text-xs w-full justify-center">
                  Try Candidate Workspace
                </Link>
              </div>
            </div>

            {/* Reviewers */}
            <div className="rounded-xl border border-default bg-base p-6">
              <div className="flex items-center gap-2 mb-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-[#FDF1ED] text-terracotta">
                  <EyeIcon size={14} />
                </div>
                <h3 className="font-serif text-lg font-bold text-primary">For Reviewers & Hiring Committees</h3>
              </div>
              <p className="text-xs text-secondary leading-relaxed">
                Review substantiated engineering dossiers with criteria-level findings, chronological event playback, and evidence records that hold up to scrutiny.
              </p>
              <div className="mt-4 pt-3 border-t border-default">
                <Link to="/report" className="btn-secondary text-xs w-full justify-center">
                  Inspect Reviewer Dossier
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 4: INTERACTIVE PRODUCT PREVIEW (Hands-on Verification Demonstration)
          ========================================================================== */}
      <section id="preview" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="font-mono text-xs font-bold uppercase tracking-wider text-forest">
            INTERACTIVE DEMO
          </span>
          <h2 className="font-serif text-3xl font-bold text-primary mt-2">
            See How Candidate Actions Become Evidence
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-secondary">
            Select an engineering invariant scenario to inspect the resulting verification trail:
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-xl border border-default bg-surface p-6 shadow-sm">
          {/* Scenario Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-default pb-4 mb-4">
            {interactiveScenarios.map((sc, idx) => (
              <button
                key={sc.id}
                onClick={() => setActiveInteractiveScenario(idx)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  activeInteractiveScenario === idx
                    ? 'bg-forest text-white shadow-2xs'
                    : 'bg-surface-elevated text-secondary hover:text-primary'
                }`}
              >
                {sc.title}
              </button>
            ))}
          </div>

          {/* Active Scenario Preview Card */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-primary">{currentScenario.title}</h4>
              <span className="rounded bg-[#EAF4F1] px-2 py-0.5 text-[10px] font-mono font-bold text-forest border border-[#9DCFC4]">
                {currentScenario.badge}
              </span>
            </div>

            {/* Code Mutation Box */}
            <div className="rounded border border-default bg-[#14171A] text-[#E2E8F0] p-3 font-mono text-[11px] overflow-x-auto">
              <span className="text-[#9E988C] text-[10px] block mb-1 font-bold">1. Candidate Code Refactor:</span>
              <pre className="text-[#81C784]">{currentScenario.action}</pre>
            </div>

            {/* Verification & Evidence Result */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="rounded border border-default bg-surface-elevated p-3">
                <span className="text-[10px] font-mono font-bold text-forest uppercase block mb-1">
                  2. Automated Verification Log:
                </span>
                <p className="font-mono text-[11px] text-[#126646] font-semibold">{currentScenario.verification}</p>
              </div>
              <div className="rounded border border-default bg-surface-elevated p-3">
                <span className="text-[10px] font-mono font-bold text-terracotta uppercase block mb-1">
                  3. Ledger Fact Generated:
                </span>
                <p className="text-[11px] text-secondary leading-snug">{currentScenario.evidence}</p>
              </div>
            </div>

            <div className="rounded border border-default bg-base p-3 text-xs flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-primary uppercase block">
                  4. Reviewer Finding:
                </span>
                <p className="text-[11px] text-secondary">{currentScenario.finding}</p>
              </div>
              <Link to="/workspace" className="btn-primary text-xs shrink-0 py-1.5 px-3 min-h-0">
                Launch Assessment
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 5: FINAL CTA
          ========================================================================== */}
      <section className="border-t border-default bg-surface-elevated py-14 px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-2xl mx-auto">
          <h2 className="font-serif text-3xl font-bold text-primary">
            Ready to Evaluate Engineering with Confidence?
          </h2>
          <p className="mt-2 text-xs sm:text-sm text-secondary leading-relaxed">
            Start a live demonstration session. Explore the workspace, run simulated invariant tests, and inspect the resulting evidence dossier.
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link to="/workspace" className="btn-primary text-xs px-5 py-2.5">
              <PlayIcon size={13} />
              <span>Start a Demo Assessment</span>
            </Link>
            <Link to="/report" className="btn-secondary text-xs px-4 py-2.5">
              <span>Inspect Reviewer Dossier</span>
            </Link>
          </div>
        </div>
      </section>

      {/* ==========================================================================
          SECTION 6: MINIMAL FOOTER
          ========================================================================== */}
      <footer className="border-t border-default bg-surface py-8 px-4 sm:px-6 lg:px-8 text-xs text-muted">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-serif text-sm font-bold text-primary">ProofLoop</span>
            <span>—</span>
            <span>Assess the engineering, not just the output.</span>
          </div>

          <div className="flex items-center gap-4 text-secondary">
            <Link to="/workspace" className="hover:text-primary transition-colors">Workspace</Link>
            <Link to="/verification" className="hover:text-primary transition-colors">Verification Loop</Link>
            <Link to="/evidence" className="hover:text-primary transition-colors">Evidence Ledger</Link>
            <Link to="/report" className="hover:text-primary transition-colors">Report</Link>
            <Link to="/feedback" className="hover:text-primary transition-colors">Feedback</Link>
          </div>

          <p>© 2026 ProofLoop Systems Inc.</p>
        </div>
      </footer>
    </div>
  );
};
