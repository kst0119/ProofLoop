import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  TerminalIcon,
  ArrowRightIcon,
  ShieldIcon,
  RefreshCwIcon,
} from '../common/Icons';

export const TestRunnerPanel: React.FC = () => {
  const navigate = useNavigate();
  const {
    testCases,
    isRunningTests,
    runAllTests,
    runSingleTest,
    testSummary,
  } = useAssessment();

  const [activeTab, setActiveTab] = useState<'all' | 'failed' | 'passed'>('all');
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string | null>(testCases[0]?.id || null);

  const filteredTests = testCases.filter((t) => {
    if (activeTab === 'failed') return t.status === 'failed';
    if (activeTab === 'passed') return t.status === 'passed';
    return true;
  });

  const selectedTest = testCases.find((t) => t.id === selectedTestCaseId) || testCases[0];

  return (
    <div className="flex h-full flex-col bg-[#080d16] text-slate-200">
      {/* Test Suite Controls Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-[#182338] bg-[#070b13] px-3 py-2 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => runAllTests()}
            disabled={isRunningTests}
            className="flex items-center gap-1.5 rounded-md bg-gradient-to-r from-[#00f2fe] to-[#10b981] px-3 py-1.5 text-xs font-bold text-black shadow-md hover:opacity-95 disabled:opacity-50 transition-all"
            title="Execute test suite against current code"
          >
            {isRunningTests ? (
              <>
                <RefreshCwIcon size={13} className="animate-spin text-black" />
                <span>Running Test Suite...</span>
              </>
            ) : (
              <>
                <PlayIcon size={12} />
                <span>Run All Tests (6)</span>
              </>
            )}
          </button>

          {/* Test Status Counts */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="flex items-center gap-1 rounded bg-emerald-950/60 px-2 py-0.5 text-emerald-400 border border-emerald-800/40">
              <CheckCircleIcon size={12} />
              {testSummary.passed} Passed
            </span>
            {testSummary.failed > 0 && (
              <span className="flex items-center gap-1 rounded bg-rose-950/60 px-2 py-0.5 text-rose-400 border border-rose-800/40">
                <XCircleIcon size={12} />
                {testSummary.failed} Failed
              </span>
            )}
          </div>
        </div>

        {/* View Reviewer Evidence button */}
        <button
          onClick={() => navigate('/timeline')}
          className="flex items-center gap-1 text-xs text-[#00f2fe] hover:underline font-medium"
        >
          <span>Inspect Session Timeline</span>
          <ArrowRightIcon size={12} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-[#182338] bg-[#0a0f1b] px-3 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-[#00f2fe] text-white'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          All Tests ({testCases.length})
        </button>
        <button
          onClick={() => setActiveTab('passed')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
            activeTab === 'passed'
              ? 'border-emerald-400 text-emerald-300'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          Passed ({testSummary.passed})
        </button>
        {testSummary.failed > 0 && (
          <button
            onClick={() => setActiveTab('failed')}
            className={`px-3 py-1.5 font-medium border-b-2 transition-colors ${
              activeTab === 'failed'
                ? 'border-rose-400 text-rose-300'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Failed ({testSummary.failed})
          </button>
        )}
      </div>

      {/* Main Two-column test view */}
      <div className="flex flex-1 overflow-hidden">
        {/* Test List Column */}
        <div className="w-1/2 border-r border-[#182338] overflow-y-auto p-2 space-y-1.5">
          {filteredTests.map((test) => {
            const isSelected = test.id === selectedTestCaseId;
            return (
              <div
                key={test.id}
                onClick={() => setSelectedTestCaseId(test.id)}
                className={`flex cursor-pointer items-start justify-between rounded-md p-2 text-xs transition-colors ${
                  isSelected
                    ? 'border border-[#263750] bg-[#101b2d] shadow-sm'
                    : 'border border-transparent hover:bg-[#0e1626]'
                }`}
              >
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <div className="mt-0.5 shrink-0">
                    {test.status === 'running' ? (
                      <RefreshCwIcon size={14} className="animate-spin text-amber-400" />
                    ) : test.status === 'passed' ? (
                      <CheckCircleIcon size={14} className="text-emerald-400" />
                    ) : (
                      <XCircleIcon size={14} className="text-rose-400" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-[10px] text-slate-400">{test.id}</span>
                      <span className="truncate font-medium text-slate-200">{test.name}</span>
                    </div>
                    <p className="mt-0.5 line-clamp-1 text-[11px] text-slate-400">
                      {test.description}
                    </p>
                  </div>
                </div>

                <div className="ml-2 flex flex-col items-end shrink-0 text-[10px] font-mono text-slate-400">
                  <span>{test.durationMs ? `${test.durationMs}ms` : '—'}</span>
                  <span className="capitalize text-slate-400">{test.category}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Selected Test Detail Column */}
        <div className="w-1/2 overflow-y-auto p-3 text-xs flex flex-col">
          {selectedTest ? (
            <div className="space-y-3 flex-1 flex flex-col">
              <div className="flex items-center justify-between pb-2 border-b border-[#182338]">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#00f2fe]">{selectedTest.id}</span>
                    <h4 className="font-semibold text-white">{selectedTest.name}</h4>
                  </div>
                  <p className="mt-1 text-slate-300 text-[11px]">{selectedTest.description}</p>
                </div>
                <button
                  onClick={() => runSingleTest(selectedTest.id)}
                  disabled={isRunningTests}
                  className="rounded border border-[#1e2e48] bg-[#0d1627] px-2 py-1 text-[11px] text-slate-300 hover:text-white hover:border-slate-500"
                >
                  Re-test
                </button>
              </div>

              {/* Status and timing */}
              <div className="flex items-center gap-3 text-[11px] font-mono">
                <span className="text-slate-400">Status:</span>
                <span
                  className={`font-semibold uppercase ${
                    selectedTest.status === 'passed' ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {selectedTest.status}
                </span>
                <span className="text-slate-400">|</span>
                <span className="flex items-center gap-1 text-slate-400">
                  <ClockIcon size={11} /> {selectedTest.durationMs || 15}ms
                </span>
              </div>

              {/* Expected Output */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Expected Invariant Assertion:
                </label>
                <div className="mt-1 rounded border border-[#1a293f] bg-[#060910] p-2 font-mono text-[11px] text-slate-300">
                  {selectedTest.expected}
                </div>
              </div>

              {/* Actual Outcome */}
              <div>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  Actual Runtime Output:
                </label>
                <div
                  className={`mt-1 rounded border p-2 font-mono text-[11px] ${
                    selectedTest.status === 'passed'
                      ? 'border-emerald-900/40 bg-emerald-950/20 text-emerald-300'
                      : 'border-rose-900/40 bg-rose-950/20 text-rose-300'
                  }`}
                >
                  {selectedTest.actual || selectedTest.error || 'Assertion passed successfully.'}
                </div>
              </div>

              {/* Error Stack Trace if failed */}
              {selectedTest.error && (
                <div>
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-rose-400 flex items-center gap-1">
                    <TerminalIcon size={11} /> Assertion Error Details:
                  </label>
                  <pre className="mt-1 rounded border border-rose-900/50 bg-[#160a0f] p-2 font-mono text-[10px] text-rose-300 overflow-x-auto">
                    {selectedTest.error}
                    {'\n'}  at Object.test (tests/preferences.test.ts:42:15)
                    {'\n'}  at runTestHierarchy (jest-runner/build/runTest.js:188:24)
                  </pre>
                </div>
              )}

              {/* Telemetry info */}
              <div className="mt-auto pt-3 border-t border-[#182338] text-[10px] text-slate-400 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldIcon size={10} className="text-[#00f2fe]" /> Deterministic Assertion Runner
                </span>
                <span>Category: {selectedTest.category}</span>
              </div>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center text-xs text-slate-500">
              Select a test case to view assertion telemetry
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
