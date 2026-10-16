import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { TimelineEventCard } from '../components/timeline/TimelineEventCard';
import type { TimelineEvent } from '../types';
import {
  SearchIcon,
  PlayIcon,
  ArrowRightIcon,
  ClockIcon,
  LayersIcon,
} from '../components/common/Icons';

export const VerificationLoopPage = () => {
  const [searchParams] = useSearchParams();
  const highlightedEventId = searchParams.get('event');

  const {
    session,
    timelineEvents,
    selectedTimelineEventId,
    setSelectedTimelineEventId,
  } = useAssessment();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [activeStepIndex, setActiveStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  useEffect(() => {
    if (highlightedEventId) {
      setSelectedTimelineEventId(highlightedEventId);
      const idx = timelineEvents.findIndex((e: TimelineEvent) => e.id === highlightedEventId);
      if (idx !== -1) setActiveStepIndex(idx);
    }
  }, [highlightedEventId, timelineEvents, setSelectedTimelineEventId]);

  // Step through sequence player
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | undefined;
    if (isPlaying) {
      interval = setInterval(() => {
        setActiveStepIndex((prev) => {
          if (prev >= timelineEvents.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          const next = prev + 1;
          setSelectedTimelineEventId(timelineEvents[next]?.id || null);
          return next;
        });
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timelineEvents, setSelectedTimelineEventId]);

  const filteredEvents = timelineEvents.filter((evt: TimelineEvent) => {
    if (selectedType !== 'ALL' && evt.type !== selectedType) return false;
    if (selectedStatus !== 'ALL' && evt.status !== selectedStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = evt.title.toLowerCase().includes(q);
      const matchSummary = evt.summary.toLowerCase().includes(q);
      const matchDetails = evt.details?.toLowerCase().includes(q);
      const matchId = evt.id.toLowerCase().includes(q);
      if (!matchTitle && !matchSummary && !matchDetails && !matchId) return false;
    }
    return true;
  });

  // Selected event (defaults to first or highlighted)
  const currentEvent =
    timelineEvents.find((e) => e.id === selectedTimelineEventId) ||
    timelineEvents[activeStepIndex] ||
    timelineEvents[0];

  const eventTypes: { label: string; value: string }[] = [
    { label: 'All Event Types', value: 'ALL' },
    { label: 'Prompts', value: 'PROMPT' },
    { label: 'AI Suggestions', value: 'AI_SUGGESTION' },
    { label: 'Code Edits', value: 'CODE_EDIT' },
    { label: 'Test Runs', value: 'TEST_RUN' },
    { label: 'Debugging Actions', value: 'DEBUG_ACTION' },
    { label: 'Verifications', value: 'VERIFICATION' },
  ];

  return (
    <div className="flex-1 bg-[#F8F6F0] text-[#191715] py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Editorial Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#DFD9CE] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#EAF4F1] px-2.5 py-0.5 text-xs font-mono font-bold text-[#0F3D34] border border-[#9DCFC4]">
              VERIFICATION LOOP
            </span>
            <span className="font-mono text-xs text-[#736E64]">
              Session: {session.sessionId} ({session.candidateName})
            </span>
          </div>
          <h1 className="mt-2 font-serif text-2xl sm:text-3xl font-bold text-[#191715]">
            Chronological Problem-Solving Timeline
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-[#57524A] max-w-2xl leading-relaxed">
            Trace how candidate hypotheses evolved from initial AI prompt formulation through failed invariant tests, root cause debugging, and final deterministic verification.
          </p>
        </div>

        {/* Action Link to Evidence Ledger */}
        <div className="flex items-center gap-2.5">
          <Link
            to="/evidence"
            className="btn-secondary text-xs"
          >
            <LayersIcon size={13} className="text-[#144A3F]" />
            <span>Open Evidence Ledger</span>
          </Link>
          <Link
            to="/report"
            className="btn-primary text-xs"
          >
            <span>Reviewer Report</span>
            <ArrowRightIcon size={12} />
          </Link>
        </div>
      </div>

      {/* Sequence Step Player & Controls */}
      <div className="mt-6 rounded-xl border border-[#DFD9CE] bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                isPlaying
                  ? 'bg-[#B94A2D] text-white shadow-xs'
                  : 'bg-[#144A3F] text-white shadow-xs hover:bg-[#0E382F]'
              }`}
            >
              <PlayIcon size={12} />
              <span>{isPlaying ? 'Pause Sequence' : 'Step-Through Player'}</span>
            </button>

            <div className="flex items-center gap-1.5 text-xs font-mono text-[#57524A]">
              <span>Event:</span>
              <strong className="text-[#191715] font-bold">#{activeStepIndex + 1}</strong>
              <span>of</span>
              <span>{timelineEvents.length}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs font-mono text-[#736E64]">
            <ClockIcon size={12} />
            <span>Total Duration: 45 Minutes</span>
            <span>•</span>
            <span className="text-[#126646] font-bold">100% Deterministic Trail</span>
          </div>
        </div>

        {/* Sequence Progress Bar */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#DFD9CE]">
          <div
            className="h-full bg-[#144A3F] transition-all duration-300"
            style={{ width: `${((activeStepIndex + 1) / timelineEvents.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1 min-w-[280px]">
          {/* Search box */}
          <div className="relative flex-1 min-w-[220px]">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#736E64]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search timeline events, test runs, code diffs..."
              className="w-full rounded-md border border-[#DFD9CE] bg-white pl-9 pr-3 py-1.5 text-xs text-[#191715] placeholder-[#736E64] focus:border-[#144A3F] focus:outline-none"
            />
          </div>

          {/* Type filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="rounded-md border border-[#DFD9CE] bg-white px-3 py-1.5 text-xs text-[#191715] focus:border-[#144A3F] focus:outline-none"
          >
            {eventTypes.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>

          {/* Status filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="rounded-md border border-[#DFD9CE] bg-white px-3 py-1.5 text-xs text-[#191715] focus:border-[#144A3F] focus:outline-none"
          >
            <option value="ALL">All Outcomes</option>
            <option value="success">Success / Verified</option>
            <option value="failure">Failure / Regression</option>
            <option value="warning">Warning / Edge Case</option>
          </select>
        </div>

        <span className="text-xs font-mono text-[#736E64]">
          Showing {filteredEvents.length} of {timelineEvents.length} Events
        </span>
      </div>

      {/* Main Two-Column Layout: Connected Timeline + Detail Inspector */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Chronological Event Rows with Connected Spine */}
        <div className="lg:col-span-7 space-y-3">
          {filteredEvents.map((evt: TimelineEvent, idx: number) => {
            const isSelected = evt.id === currentEvent?.id;
            return (
              <div key={evt.id} className="relative">
                {/* Connecting Line between cards */}
                {idx < filteredEvents.length - 1 && (
                  <span className="absolute left-[1.375rem] top-12 bottom-0 w-0.5 bg-[#DFD9CE] -z-0" />
                )}
                <TimelineEventCard
                  event={evt}
                  isSelected={isSelected}
                  onSelect={() => {
                    setSelectedTimelineEventId(evt.id);
                    const realIdx = timelineEvents.findIndex((e) => e.id === evt.id);
                    if (realIdx !== -1) setActiveStepIndex(realIdx);
                  }}
                />
              </div>
            );
          })}

          {filteredEvents.length === 0 && (
            <div className="rounded-lg border border-[#DFD9CE] bg-white p-8 text-center text-xs text-[#736E64]">
              No verification events match the current filter criteria.
            </div>
          )}
        </div>

        {/* Right Column: Sticky Detail Telemetry Inspector */}
        <div className="lg:col-span-5">
          <div className="sticky top-20 rounded-xl border border-[#DFD9CE] bg-white p-5 shadow-sm">
            {currentEvent ? (
              <div className="space-y-4">
                {/* Inspector Header */}
                <div className="flex items-start justify-between pb-3 border-b border-[#DFD9CE]">
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono text-xs font-bold text-[#144A3F]">
                        #{String(currentEvent.seq).padStart(2, '0')} // {currentEvent.id}
                      </span>
                      <span className="rounded bg-[#F2EFE9] px-1.5 py-0.2 text-[9px] font-mono font-bold uppercase text-[#57524A] border border-[#DFD9CE]">
                        {currentEvent.type}
                      </span>
                    </div>
                    <h3 className="font-serif text-base font-bold text-[#191715] mt-1 leading-snug">
                      {currentEvent.title}
                    </h3>
                  </div>

                  {currentEvent.relatedEvidenceId && (
                    <Link
                      to={`/evidence?id=${currentEvent.relatedEvidenceId}`}
                      className="rounded bg-[#FDF1ED] px-2 py-0.5 text-[10px] font-mono font-bold text-[#B94A2D] border border-[#F5BFAF] hover:bg-[#F9DDD3] transition-colors"
                      title="Inspect related evidence ledger record"
                    >
                      {currentEvent.relatedEvidenceId} →
                    </Link>
                  )}
                </div>

                {/* Event Summary */}
                <div>
                  <span className="font-mono text-[10px] font-bold uppercase text-[#736E64] block mb-1">
                    TELEMETRY OBSERVATION
                  </span>
                  <p className="text-xs text-[#4A463F] leading-relaxed">
                    {currentEvent.summary}
                  </p>
                </div>

                {/* Extended Details */}
                {currentEvent.details && (
                  <div className="rounded-lg border border-[#DFD9CE] bg-[#FAF8F5] p-3 text-xs text-[#57524A] leading-relaxed">
                    <strong className="text-[#191715] block mb-1">Evaluator Notes:</strong>
                    {currentEvent.details}
                  </div>
                )}

                {/* Code Diff Box */}
                {currentEvent.diff && (
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#736E64] block mb-1">
                      MUTATION CODE DIFF ({currentEvent.diff.file})
                    </span>
                    <div className="rounded border border-[#DFD9CE] bg-[#14171A] p-3 font-mono text-[11px] text-[#E2E8F0] overflow-x-auto leading-relaxed">
                      <div className="text-[#E57373] bg-[#E57373]/10 px-1 py-0.5 rounded mb-1">
                        - {currentEvent.diff.before}
                      </div>
                      <div className="text-[#81C784] bg-[#81C784]/10 px-1 py-0.5 rounded">
                        + {currentEvent.diff.after}
                      </div>
                    </div>
                  </div>
                )}

                {/* Prompt Data Telemetry */}
                {currentEvent.promptData && (
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#736E64] block mb-1">
                      AI INTERACTION TELEMETRY
                    </span>
                    <div className="rounded border border-[#DFD9CE] bg-[#FAF8F5] p-3 space-y-2 text-xs">
                      <div>
                        <strong className="text-[#144A3F] block font-mono text-[11px]">Prompt:</strong>
                        <p className="text-[#4A463F] italic">"{currentEvent.promptData.prompt}"</p>
                      </div>
                      <div className="pt-2 border-t border-[#EAE6DD]">
                        <strong className="text-[#57524A] block font-mono text-[11px]">Response:</strong>
                        <p className="text-[#4A463F]">{currentEvent.promptData.response}</p>
                      </div>
                      <div className="flex items-center gap-3 pt-1 border-t border-[#EAE6DD] text-[10px] font-mono text-[#736E64]">
                        <span>Tokens: {currentEvent.promptData.tokenCount}</span>
                        <span>Latency: {currentEvent.promptData.latencyMs}ms</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Test Run Outcomes */}
                {currentEvent.testRunData && (
                  <div>
                    <span className="font-mono text-[10px] font-bold uppercase text-[#736E64] block mb-1">
                      TEST SUITE ASSERTION OUTCOMES
                    </span>
                    <div className="rounded border border-[#DFD9CE] bg-white p-3 space-y-2 text-xs font-mono">
                      <div className="flex items-center justify-between">
                        <span>Total Executed:</span>
                        <strong className="text-[#191715]">{currentEvent.testRunData.total}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[#126646]">
                        <span>Assertions Passed:</span>
                        <strong>{currentEvent.testRunData.passed}</strong>
                      </div>
                      <div className="flex items-center justify-between text-[#A82424]">
                        <span>Assertions Failed:</span>
                        <strong>{currentEvent.testRunData.failed}</strong>
                      </div>
                      {currentEvent.testRunData.failingTests && currentEvent.testRunData.failingTests.length > 0 && (
                        <div className="pt-2 border-t border-[#EAE6DD] text-[#871919]">
                          <span className="font-bold block mb-1">Regressions Identified:</span>
                          <ul className="list-disc list-inside text-[11px] space-y-0.5">
                            {currentEvent.testRunData.failingTests.map((t, i) => (
                              <li key={i}>{t}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Evidence Link Footer */}
                <div className="pt-3 border-t border-[#DFD9CE] flex items-center justify-between text-xs">
                  <span className="font-mono text-[11px] text-[#736E64]">
                    Timestamp: {currentEvent.timestamp}
                  </span>
                  {currentEvent.relatedEvidenceId && (
                    <Link
                      to={`/evidence?id=${currentEvent.relatedEvidenceId}`}
                      className="btn-secondary text-xs"
                    >
                      <LayersIcon size={12} className="text-[#B94A2D]" />
                      <span>Inspect in Evidence Ledger</span>
                    </Link>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-center py-12 text-[#736E64] text-xs">
                Select a timeline event to inspect telemetry details.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
