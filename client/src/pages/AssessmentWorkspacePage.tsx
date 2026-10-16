import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { CodeEditorPanel } from '../components/assessment/CodeEditorPanel';
import { AIAssistantPanel } from '../components/assessment/AIAssistantPanel';
import { TestRunnerPanel } from '../components/assessment/TestRunnerPanel';
import {
  PlayIcon,
  RefreshCwIcon,
  ArrowRightIcon,
  TerminalIcon,
  BotIcon,
  CheckCircleIcon,
  InfoIcon,
  ClockIcon,
  ShieldIcon,
} from '../components/common/Icons';

export const AssessmentWorkspacePage = () => {
  const navigate = useNavigate();
  const {
    session,
    runAllTests,
    isRunningTests,
    testSummary,
    timelineEvents,
    requirements,
    toggleRequirement,
  } = useAssessment();

  const [mobileActiveTab, setMobileActiveTab] = useState<'task' | 'code' | 'tests' | 'ai'>('code');
  const [rightPanelTab, setRightPanelTab] = useState<'tests' | 'criteria' | 'ai'>('tests');
  const [taskDetailsExpanded, setTaskDetailsExpanded] = useState<boolean>(false);

  // Format remaining time
  const minutes = Math.floor(session.timeRemainingSeconds / 60);
  const seconds = session.timeRemainingSeconds % 60;
  const timeFormatted = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const completedCount = requirements.filter((r) => r.completed).length;
  const progressPct = Math.round((completedCount / requirements.length) * 100);

  return (
    <div className="workspace-container bg-base text-primary">
      {/* ==========================================================================
          COMPACT TOP BAR (Single Dominant Primary Action)
          ========================================================================== */}
      <div className="flex items-center justify-between border-b border-default bg-surface px-4 py-2 shrink-0 shadow-2xs gap-3">
        {/* Left: Breadcrumb & Title */}
        <div className="flex items-center gap-3 min-w-0">
          <Link
            to="/"
            className="flex items-center gap-1 text-xs text-muted hover:text-primary transition-colors font-medium shrink-0"
            title="Return to Public Landing Page"
          >
            <span>← Overview</span>
          </Link>
          <span className="text-muted shrink-0">|</span>
          <div className="flex items-center gap-2 min-w-0">
            <span className="h-2 w-2 rounded-full bg-[#126646] animate-pulse shrink-0" />
            <h1 className="font-serif text-xs sm:text-sm font-bold text-primary truncate">
              {session.assessmentTitle}
            </h1>
          </div>
          <span className="hidden lg:inline text-muted shrink-0">|</span>
          <span className="hidden lg:inline font-mono text-[11px] text-muted truncate">
            Candidate: <strong className="text-primary">{session.candidateName}</strong> ({session.sessionId})
          </span>
        </div>

        {/* Right: Timer & ONE Dominant Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Time Remaining */}
          <div className="flex items-center gap-1.5 rounded-md border border-default bg-surface-elevated px-2.5 py-1 text-xs text-secondary font-mono shrink-0">
            <ClockIcon size={12} className="text-terracotta" />
            <span className="font-semibold">{timeFormatted}</span>
            <span className="text-[10px] text-muted hidden sm:inline">rem</span>
          </div>

          {/* ONE Clear Primary Action: Run Tests */}
          <button
            onClick={() => runAllTests()}
            disabled={isRunningTests}
            className="btn-primary text-xs shadow-xs shrink-0"
            title="Run automated boundary assertions on current code"
          >
            {isRunningTests ? (
              <>
                <RefreshCwIcon size={12} className="animate-spin text-white" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <PlayIcon size={11} />
                <span>Run Invariant Tests ({testSummary.passed}/{testSummary.total})</span>
              </>
            )}
          </button>

          {/* Secondary Action: Jump to Verification Timeline */}
          <button
            onClick={() => navigate('/verification')}
            className="btn-secondary text-xs hidden sm:flex shrink-0"
            title="Inspect chronological verification timeline"
          >
            <span>Verification Loop</span>
            <span className="rounded bg-surface-elevated px-1.5 py-0.2 text-[10px] font-mono font-bold text-forest">
              {timelineEvents.length}
            </span>
            <ArrowRightIcon size={12} className="text-forest" />
          </button>
        </div>
      </div>

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-b border-default bg-surface text-xs font-medium shrink-0">
        <button
          onClick={() => setMobileActiveTab('task')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            mobileActiveTab === 'task'
              ? 'border-forest text-forest font-bold bg-base'
              : 'border-transparent text-muted'
          }`}
        >
          Task Spec
        </button>
        <button
          onClick={() => setMobileActiveTab('code')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            mobileActiveTab === 'code'
              ? 'border-forest text-forest font-bold bg-base'
              : 'border-transparent text-muted'
          }`}
        >
          Code Editor
        </button>
        <button
          onClick={() => setMobileActiveTab('tests')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            mobileActiveTab === 'tests'
              ? 'border-forest text-forest font-bold bg-base'
              : 'border-transparent text-muted'
          }`}
        >
          Tests ({testSummary.passed}/{testSummary.total})
        </button>
        <button
          onClick={() => setMobileActiveTab('ai')}
          className={`flex-1 py-2 text-center border-b-2 transition-colors ${
            mobileActiveTab === 'ai'
              ? 'border-forest text-forest font-bold bg-base'
              : 'border-transparent text-muted'
          }`}
        >
          Copilot
        </button>
      </div>

      {/* ==========================================================================
          TWO-COLUMN WORKBENCH (Task + Code on Left, Tests/Criteria/AI on Right)
          ========================================================================== */}
      <div className="flex flex-1 overflow-hidden min-h-0">
        {/* Main Column: Task Context Strip + Full Code Editor */}
        <div className={`workspace-main ${
          mobileActiveTab === 'code' || mobileActiveTab === 'task' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Task Scenario Banner (collapsible to maximize editor canvas) */}
          <div className="border-b border-default bg-surface p-3 shrink-0">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <InfoIcon size={14} className="text-forest shrink-0" />
                <span className="font-bold text-xs text-primary">
                  Engineering Context: <code className="font-mono text-xs text-forest bg-surface-elevated px-1.5 py-0.5 rounded border border-default">PATCH /api/v2/users/:id/preferences</code>
                </span>
              </div>
              <button
                type="button"
                onClick={() => setTaskDetailsExpanded(!taskDetailsExpanded)}
                className="text-[11px] text-muted hover:text-primary transition-colors cursor-pointer"
              >
                {taskDetailsExpanded ? 'Hide Details ▲' : 'Show Invariants ▼'}
              </button>
            </div>

            {taskDetailsExpanded && (
              <div className="mt-2 space-y-2 text-xs text-secondary animate-fade-in">
                <div className="rounded-md border border-[#F6CE9F] dark:border-[#6E450A] bg-[#FEF6EC] dark:bg-[#332005] p-2.5 text-[#7F3F08] dark:text-[#FDE68A] leading-relaxed shadow-2xs">
                  <strong className="block font-bold mb-0.5">Critical Invariants to Maintain:</strong>
                  1. Omitted fields must remain untouched. &nbsp;•&nbsp; 
                  2. Explicit boolean <code className="font-mono font-bold">false</code> must NOT be coerced to previous or default values via truthy fallbacks. &nbsp;•&nbsp; 
                  3. Deep nested structures (privacy, notifications) must merge recursively without wiping sibling keys. &nbsp;•&nbsp; 
                  4. Prototype pollution keys (<code className="font-mono">__proto__</code>, <code className="font-mono">constructor</code>) must be rejected.
                </div>
              </div>
            )}
          </div>

          {/* Monaco Code Editor (Fills remaining height) */}
          <div className="flex-1 min-h-0 overflow-hidden">
            <CodeEditorPanel />
          </div>
        </div>

        {/* Secondary Column: Invariant Tests, Criteria & AI Assistant */}
        <div className={`workspace-sidebar ${
          mobileActiveTab === 'tests' || mobileActiveTab === 'ai' ? 'flex' : 'hidden md:flex'
        }`}>
          {/* Right Panel Tab Bar */}
          <div className="flex h-10 items-center border-b border-default bg-surface-elevated px-2 gap-1 shrink-0">
            <button
              onClick={() => setRightPanelTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                rightPanelTab === 'tests'
                  ? 'bg-surface text-forest shadow-2xs border border-default'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <TerminalIcon size={12} />
              <span>Tests ({testSummary.passed}/{testSummary.total})</span>
            </button>

            <button
              onClick={() => setRightPanelTab('criteria')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                rightPanelTab === 'criteria'
                  ? 'bg-surface text-forest shadow-2xs border border-default'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <CheckCircleIcon size={12} />
              <span>Criteria ({progressPct}%)</span>
            </button>

            <button
              onClick={() => setRightPanelTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                rightPanelTab === 'ai'
                  ? 'bg-surface text-forest shadow-2xs border border-default'
                  : 'text-secondary hover:text-primary'
              }`}
            >
              <BotIcon size={12} />
              <span>Copilot</span>
            </button>
          </div>

          {/* Right Panel Tab Content */}
          <div className="flex-1 overflow-hidden">
            {rightPanelTab === 'tests' && <TestRunnerPanel />}

            {rightPanelTab === 'criteria' && (
              <div className="h-full overflow-y-auto p-4 space-y-4 bg-base">
                <div>
                  <div className="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-muted font-mono">
                    <span>Acceptance Criteria</span>
                    <span className="text-forest">{progressPct}% Complete</span>
                  </div>
                  {/* Progress bar */}
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-default">
                    <div
                      className="h-full bg-forest transition-all duration-300"
                      style={{ width: `${progressPct}%` }}
                    />
                  </div>
                </div>

                <ul className="space-y-2.5">
                  {requirements.map((req) => (
                    <li
                      key={req.id}
                      onClick={() => toggleRequirement(req.id)}
                      className="group flex cursor-pointer items-start gap-2.5 rounded-lg border border-default bg-surface p-3 hover:border-medium transition-colors shadow-2xs"
                    >
                      <button
                        type="button"
                        className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-colors ${
                          req.completed
                            ? 'border-[#126646] bg-[#126646] text-white'
                            : 'border-medium bg-surface group-hover:border-forest'
                        }`}
                        aria-label={`Toggle requirement ${req.id}`}
                      >
                        {req.completed && <CheckCircleIcon size={12} />}
                      </button>
                      <div className="flex-1 text-xs">
                        <div className="flex items-center justify-between gap-1 mb-1">
                          <span className="font-mono text-[10px] font-bold text-muted">{req.id}</span>
                          <span
                            className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ${
                              req.category === 'mandatory'
                                ? 'bg-[#EDF7F2] text-[#126646] border-[#A3DBC4]'
                                : req.category === 'edge-case'
                                ? 'bg-[#FEF6EC] text-[#A1520C] border-[#F6CE9F]'
                                : 'bg-surface-elevated text-secondary border-default'
                            }`}
                          >
                            {req.category}
                          </span>
                        </div>
                        <p className={req.completed ? 'text-muted line-through' : 'text-primary font-medium'}>
                          {req.text}
                        </p>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="rounded-lg border border-default bg-surface p-3 text-xs text-secondary leading-relaxed">
                  <div className="flex items-center gap-1.5 font-bold text-primary mb-1">
                    <ShieldIcon size={12} className="text-forest" />
                    <span>Evidence-Driven Logging</span>
                  </div>
                  <p className="text-[11px] text-muted">
                    Checking or unchecking requirements guides your workflow. Invariant boundary tests in the Tests tab determine deterministic verification in the Evidence Ledger.
                  </p>
                </div>
              </div>
            )}

            {rightPanelTab === 'ai' && <AIAssistantPanel />}
          </div>
        </div>
      </div>
    </div>
  );
};
