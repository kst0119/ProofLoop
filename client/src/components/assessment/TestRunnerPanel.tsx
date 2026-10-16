import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAssessment } from '../../context/AssessmentContext';
import {
  PlayIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowRightIcon,
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
    <div className="flex h-full flex-col bg-surface text-primary">
      {/* Test Suite Controls Bar */}
      <div className="flex flex-wrap items-center justify-between border-b border-default bg-base px-3.5 py-2.5 gap-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => runAllTests()}
            disabled={isRunningTests}
            className="btn-primary text-xs"
            title="Execute test suite against current code"
          >
            {isRunningTests ? (
              <>
                <RefreshCwIcon size={12} className="animate-spin text-white" />
                <span>Running Suite...</span>
              </>
            ) : (
              <>
                <PlayIcon size={11} />
                <span>Run Invariant Suite</span>
              </>
            )}
          </button>

          {/* Test Status Badges */}
          <div className="flex items-center gap-1.5 text-xs font-mono">
            <span className="flex items-center gap-1 rounded bg-[#EDF7F2] dark:bg-[#133026] px-2 py-0.5 text-[#126646] dark:text-[#52D3A2] border border-[#A3DBC4] dark:border-[#225542] font-semibold">
              <CheckCircleIcon size={11} />
              {testSummary.passed} Passed
            </span>
            {testSummary.failed > 0 && (
              <span className="flex items-center gap-1 rounded bg-[#FDF1F1] dark:bg-[#3D1414] px-2 py-0.5 text-[#A82424] dark:text-[#F87171] border border-[#F7B5B5] dark:border-[#5E2424] font-semibold">
                <XCircleIcon size={11} />
                {testSummary.failed} Failed
              </span>
            )}
          </div>
        </div>

        {/* View Reviewer Evidence button */}
        <button
          onClick={() => navigate('/verification')}
          className="flex items-center gap-1 text-xs text-brand hover:underline font-semibold"
        >
          <span>View In Verification Loop</span>
          <ArrowRightIcon size={11} />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex border-b border-default bg-surface px-3 text-xs">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'all'
              ? 'border-brand text-brand'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          All ({testCases.length})
        </button>
        <button
          onClick={() => setActiveTab('passed')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'passed'
              ? 'border-brand text-brand'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Passed ({testSummary.passed})
        </button>
        <button
          onClick={() => setActiveTab('failed')}
          className={`px-3 py-2 font-semibold border-b-2 transition-colors ${
            activeTab === 'failed'
              ? 'border-brand text-brand'
              : 'border-transparent text-secondary hover:text-primary'
          }`}
        >
          Failed ({testSummary.failed})
        </button>
      </div>

      {/* Spacious Two-Pane Layout: Test List on Top, Inspector on Bottom */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Test Cases List (Top Pane) */}
        <div className="h-[46%] border-b border-default overflow-y-auto divide-y divide-default bg-surface">
          {filteredTests.map((test) => {
            const isSelected = test.id === selectedTest?.id;
            const isPassed = test.status === 'passed';
            const isFailed = test.status === 'failed';
            return (
              <div
                key={test.id}
                onClick={() => setSelectedTestCaseId(test.id)}
                className={`p-3 cursor-pointer transition-colors ${
                  isSelected
                    ? 'bg-elevated border-l-3 border-brand'
                    : 'hover:bg-base'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand">
                      {test.id}
                    </span>
                    <span className="text-[10px] text-muted font-mono">
                      {test.category}
                    </span>
                  </div>
                  <span
                    className={`rounded px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase border ${
                      isPassed
                        ? 'bg-[#EDF7F2] dark:bg-[#133026] text-[#126646] dark:text-[#52D3A2] border-[#A3DBC4] dark:border-[#225542]'
                        : isFailed
                        ? 'bg-[#FDF1F1] dark:bg-[#3D1414] text-[#A82424] dark:text-[#F87171] border-[#F7B5B5] dark:border-[#5E2424]'
                        : 'bg-base text-secondary border-default'
                    }`}
                  >
                    {test.status}
                  </span>
                </div>
                <h4 className="mt-1 text-xs font-bold text-primary leading-snug">
                  {test.name}
                </h4>
                <p className="mt-0.5 text-[11px] text-secondary line-clamp-1">
                  {test.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Selected Test Detail View (Bottom Pane) */}
        <div className="flex-1 overflow-y-auto p-4 bg-base text-xs">
          {selectedTest ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-default">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-brand">
                      {selectedTest.id}
                    </span>
                    <span className="text-[10px] font-mono uppercase text-muted">
                      Assertion Spec
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-primary mt-0.5">
                    {selectedTest.name}
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={() => runSingleTest(selectedTest.id)}
                  className="rounded border border-default bg-surface px-2.5 py-1 text-[11px] font-semibold text-primary hover:border-brand shadow-2xs cursor-pointer transition-colors"
                >
                  Run This Test
                </button>
              </div>

              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-muted block mb-1">
                  ASSERTION SPECIFICATION
                </span>
                <p className="text-xs text-secondary leading-relaxed bg-surface p-2.5 rounded border border-default">
                  {selectedTest.description}
                </p>
              </div>

              {selectedTest.error && (
                <div className="rounded-lg border border-[#F7B5B5] dark:border-[#5E2424] bg-[#FDF1F1] dark:bg-[#3D1414] p-3 text-xs text-[#871919] dark:text-[#FCA5A5]">
                  <strong className="block font-bold mb-1">Assertion Failure Detected:</strong>
                  <pre className="font-mono text-[11px] whitespace-pre-wrap">{selectedTest.error}</pre>
                </div>
              )}

              <div>
                <span className="font-mono text-[10px] font-bold uppercase text-muted block mb-1">
                  EXPECTED OUTCOME
                </span>
                <pre className="rounded border border-default bg-surface p-2.5 font-mono text-[11px] text-primary overflow-x-auto">
                  {selectedTest.expected}
                </pre>
              </div>

              <div className="pt-2 border-t border-default text-[11px] text-muted font-mono flex items-center justify-between">
                <span>Category: {selectedTest.category}</span>
                <span>Telemetry: Event Logged</span>
              </div>
            </div>
          ) : (
            <div className="text-center text-muted py-8">Select a test from the list above to inspect results</div>
          )}
        </div>
      </div>
    </div>
  );
};
