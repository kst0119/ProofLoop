import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useAssessment } from '../context/AssessmentContext';
import { TimelineEventCard } from '../components/timeline/TimelineEventCard';
import type { TimelineEvent } from '../types';
import {
  SearchIcon,
  FilterIcon,
  PlayIcon,
  ArrowRightIcon,
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
          return prev + 1;
        });
      }, 2500);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isPlaying, timelineEvents.length]);

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

  const eventTypes: { label: string; value: string }[] = [
    { label: 'All Types', value: 'ALL' },
    { label: 'Prompts', value: 'PROMPT' },
    { label: 'AI Suggestions', value: 'AI_SUGGESTION' },
    { label: 'Code Edits', value: 'CODE_EDIT' },
    { label: 'Test Runs', value: 'TEST_RUN' },
    { label: 'Debugging Actions', value: 'DEBUG_ACTION' },
    { label: 'Verifications', value: 'VERIFICATION' },
  ];

  return (
    <div className="flex-1 bg-[#070a10] text-slate-100 py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#182338] pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded bg-[#0d1f33] px-2.5 py-0.5 text-xs font-mono font-semibold text-[#00f2fe] border border-[#143e63]">
              VERIFICATION LOOP
            </span>
            <span className="font-mono text-xs text-slate-400">
              Candidate Session: {session.sessionId || 'not started'}
            </span>
          </div>
          <h1 className="mt-2 text-2xl sm:text-3xl font-extrabold text-white">
            Server-recorded session timeline
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-300 max-w-2xl">
            Review events recorded by the backend for this assessment. Candidate prompts and code are not exposed in this timeline.
          </p>
        </div>

        {/* Action button */}
        <div className="flex items-center gap-3">
          <Link
            to="/evidence"
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#00f2fe] to-[#10b981] px-4 py-2 text-xs font-bold text-black shadow-md hover:opacity-95 transition-all"
          >
            <span>Proceed to Evidence Ledger</span>
            <ArrowRightIcon size={13} />
          </Link>
        </div>
      </div>

      {/* Interactive Step-Through Player Bar */}
      <div className="mt-6 rounded-2xl border border-[#1e2f4a] bg-[#0c1424] p-4 flex flex-wrap items-center justify-between gap-4 shadow-lg">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition-all ${
              isPlaying
                ? 'bg-amber-400 text-black hover:bg-amber-300'
                : 'bg-[#00f2fe] text-black hover:bg-[#38bdf8]'
            }`}
          >
            <PlayIcon size={12} />
            <span>{isPlaying ? 'Pause Playback' : 'Auto-Play Sequence'}</span>
          </button>

          <button
            onClick={() => setActiveStepIndex((prev) => Math.max(0, prev - 1))}
            disabled={activeStepIndex === 0}
            className="rounded-lg border border-[#20314c] bg-[#070d18] px-2.5 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-40"
          >
            Previous Event
          </button>

          <button
            onClick={() =>
              setActiveStepIndex((prev) => Math.min(timelineEvents.length - 1, prev + 1))
            }
            disabled={activeStepIndex >= timelineEvents.length - 1}
            className="rounded-lg border border-[#20314c] bg-[#070d18] px-2.5 py-1.5 text-xs text-slate-300 hover:text-white disabled:opacity-40"
          >
            Next Event
          </button>
        </div>

        <div className="flex items-center gap-3 text-xs font-mono">
          <span className="text-slate-400">Step:</span>
          <span className="font-bold text-[#00f2fe]">
            {activeStepIndex + 1} of {timelineEvents.length}
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">
            {timelineEvents[activeStepIndex]?.title}
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#19273c] bg-[#080d17] p-3 text-xs">
        <div className="flex items-center gap-2 flex-1 min-w-[240px]">
          <SearchIcon size={14} className="text-slate-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search events by keyword, ID, diff file, or error message..."
            className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="text-slate-500 hover:text-slate-300 text-xs"
            >
              Clear
            </button>
          )}
        </div>

        {/* Type & Status Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1.5 bg-[#0e1726] border border-[#1d2b42] px-2.5 py-1 rounded-lg">
            <FilterIcon size={12} className="text-[#00f2fe]" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none border-none p-0 cursor-pointer"
            >
              {eventTypes.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#0f1726]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#0e1726] border border-[#1d2b42] px-2.5 py-1 rounded-lg">
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-200 focus:outline-none border-none p-0 cursor-pointer"
            >
              <option value="ALL" className="bg-[#0f1726]">All Outcomes</option>
              <option value="success" className="bg-[#0f1726]">Success</option>
              <option value="failure" className="bg-[#0f1726]">Failures</option>
              <option value="neutral" className="bg-[#0f1726]">Neutral / Edits</option>
              <option value="info" className="bg-[#0f1726]">Information / Prompts</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Timeline Stream */}
      <div className="mt-8 space-y-4">
        {filteredEvents.length === 0 ? (
          <div className="rounded-2xl border border-[#1b273d] bg-[#090f1b] p-12 text-center text-slate-400">
            <p className="text-sm">No events match your current filter criteria.</p>
            <button
              onClick={() => {
                setSelectedType('ALL');
                setSelectedStatus('ALL');
                setSearchQuery('');
              }}
              className="mt-3 text-xs text-[#00f2fe] underline"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          filteredEvents.map((event: TimelineEvent, index: number) => {
            const isCurrentlySelected =
              event.id === selectedTimelineEventId || index === activeStepIndex;
            return (
              <TimelineEventCard
                key={event.id}
                event={event}
                isSelected={isCurrentlySelected}
                onSelect={() => {
                  setSelectedTimelineEventId(event.id);
                  setActiveStepIndex(index);
                }}
              />
            );
          })
        )}
      </div>
    </div>
  );
};
