import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { TaskPanel } from '../components/assessment/TaskPanel';
import { CodeEditorPanel } from '../components/assessment/CodeEditorPanel';
import { AIAssistantPanel } from '../components/assessment/AIAssistantPanel';
import { TestRunnerPanel } from '../components/assessment/TestRunnerPanel';
import {
  PlayIcon,
  RefreshCwIcon,
  ArrowRightIcon,
  TerminalIcon,
  BotIcon,
} from '../components/common/Icons';

export const AssessmentWorkspacePage = () => {
  const navigate = useNavigate();
  const { session, runAllTests, isRunningTests, testSummary, startAssessment, activity, error, submitAssessment } = useAssessment();
  const [mobileActiveTab, setMobileActiveTab] = useState<'task' | 'code' | 'ai' | 'tests'>('code');
  const [rightPanelTab, setRightPanelTab] = useState<'tests' | 'ai'>('tests');
  const attemptedStart = useRef(false);

  useEffect(() => {
    if (!session.sessionId && activity === 'idle' && !attemptedStart.current) {
      attemptedStart.current = true;
      void startAssessment().catch(() => undefined);
    }
  }, [activity, session.sessionId, startAssessment]);

  return (
    <div className="workspace-container bg-[#070a10] text-slate-100 min-h-0">
      {/* Workspace Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#182338] bg-[#080d16] px-4 py-2 gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-mono text-xs font-semibold text-white">
              {session.assessmentTitle}
            </span>
          </div>
          <span className="hidden sm:inline text-xs text-slate-500">•</span>
          <span className="hidden sm:inline font-mono text-xs text-[#00f2fe]">
            Session: {session.sessionId}
          </span>
        </div>

        {/* Global Toolbar Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => runAllTests()}
            disabled={!session.sessionId || isRunningTests || activity === 'submitting' || activity === 'submitted'}
            className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-[#00f2fe] to-[#10b981] px-3.5 py-1.5 text-xs font-bold text-black shadow-md hover:opacity-95 disabled:opacity-50 transition-all"
          >
            {isRunningTests ? (
              <>
                <RefreshCwIcon size={13} className="animate-spin text-black" />
                <span>Running Tests...</span>
              </>
            ) : (
              <>
                <PlayIcon size={12} />
                <span>Run Tests ({testSummary.passed}/{testSummary.total})</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              if (window.confirm('Submit your final solution? You will not be able to run or edit it afterward.')) void submitAssessment();
            }}
            disabled={!session.sessionId || activity === 'submitting' || activity === 'submitted' || activity === 'starting'}
            className="rounded-lg border border-[#1e5a50] bg-[#0d2926] px-3 py-1.5 text-xs font-bold text-emerald-300 disabled:opacity-50"
          >
            {activity === 'submitting' ? 'Submitting…' : activity === 'submitted' ? 'Submitted' : 'Submit Assessment'}
          </button>

          <button
            onClick={() => navigate('/timeline')}
            className="flex items-center gap-1.5 rounded-lg border border-[#223552] bg-[#0f192b] px-3 py-1.5 text-xs font-semibold text-slate-200 hover:border-[#00f2fe] hover:text-white transition-colors"
          >
            <span>Verification Loop</span>
            <ArrowRightIcon size={13} className="text-[#00f2fe]" />
          </button>
        </div>
      </div>
      {error && <div role="alert" className="border-b border-rose-900/60 bg-rose-950/40 px-4 py-2 text-xs text-rose-200">{error}</div>}

      {/* Mobile Tab Switcher */}
      <div className="flex md:hidden border-b border-[#182338] bg-[#070c14] text-xs font-medium shrink-0">
        <button
          onClick={() => setMobileActiveTab('task')}
          className={`flex-1 py-2 text-center border-b-2 ${
            mobileActiveTab === 'task'
              ? 'border-[#00f2fe] text-white font-bold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Task Spec
        </button>
        <button
          onClick={() => setMobileActiveTab('code')}
          className={`flex-1 py-2 text-center border-b-2 ${
            mobileActiveTab === 'code'
              ? 'border-[#00f2fe] text-white font-bold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Code Editor
        </button>
        <button
          onClick={() => setMobileActiveTab('tests')}
          className={`flex-1 py-2 text-center border-b-2 ${
            mobileActiveTab === 'tests'
              ? 'border-[#00f2fe] text-white font-bold'
              : 'border-transparent text-slate-400'
          }`}
        >
          Tests ({testSummary.passed}/{testSummary.total})
        </button>
        <button
          onClick={() => setMobileActiveTab('ai')}
          className={`flex-1 py-2 text-center border-b-2 ${
            mobileActiveTab === 'ai'
              ? 'border-[#00f2fe] text-white font-bold'
              : 'border-transparent text-slate-400'
          }`}
        >
          AI Copilot
        </button>
      </div>

      {/* Desktop Multi-Panel Layout */}
      <div className="hidden md:grid workspace-grid">
        {/* Left Panel: Task Spec (approx 28%) */}
        <div className="min-w-0 h-full overflow-hidden">
          <TaskPanel />
        </div>

        {/* Center Panel: Code Editor (approx 44%) */}
        <div className="min-w-0 h-full overflow-hidden flex flex-col">
          <CodeEditorPanel />
        </div>

        {/* Right Panel: Split between Tests & AI Copilot (approx 28%) */}
        <div className="min-w-0 h-full flex flex-col border-l border-[#1a2539] bg-[#080d16] overflow-hidden">
          {/* Right Panel Tabs */}
          <div className="flex h-10 border-b border-[#182338] bg-[#070b13] px-2 text-xs font-semibold shrink-0">
            <button
              onClick={() => setRightPanelTab('tests')}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors ${
                rightPanelTab === 'tests'
                  ? 'border-[#00f2fe] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <TerminalIcon size={14} className={rightPanelTab === 'tests' ? 'text-[#00f2fe]' : ''} />
              <span>Test Runner ({testSummary.passed}/{testSummary.total})</span>
            </button>
            <button
              onClick={() => setRightPanelTab('ai')}
              className={`flex items-center gap-1.5 px-3 py-1.5 border-b-2 transition-colors ${
                rightPanelTab === 'ai'
                  ? 'border-[#00f2fe] text-white'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <BotIcon size={14} className={rightPanelTab === 'ai' ? 'text-[#00f2fe]' : ''} />
              <span>AI Copilot</span>
            </button>
          </div>

          <div className="flex-1 overflow-hidden min-h-0 min-w-0">
            {rightPanelTab === 'tests' ? <TestRunnerPanel /> : <AIAssistantPanel />}
          </div>
        </div>
      </div>

      {/* Mobile Single Panel Layout */}
      <div className="flex md:hidden flex-1 overflow-hidden">
        {mobileActiveTab === 'task' && <TaskPanel />}
        {mobileActiveTab === 'code' && <CodeEditorPanel />}
        {mobileActiveTab === 'tests' && <TestRunnerPanel />}
        {mobileActiveTab === 'ai' && <AIAssistantPanel />}
      </div>
    </div>
  );
};
