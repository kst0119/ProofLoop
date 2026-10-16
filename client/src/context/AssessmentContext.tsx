import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { AIMessage, CandidateSession, CodeFile, FeedbackEntry, ReviewerNotes, TestCase, TimelineEvent } from '../types';
import { api, ApiError, type AssessmentReport, type CandidateTask, type EvidenceEvent, type SessionResponse } from '../api';
import { defaultReviewerNotes } from '../data/mockData';

type ActivityState = 'idle' | 'starting' | 'active' | 'running' | 'ai' | 'submitting' | 'submitted' | 'error';
interface SubmissionResult { passed: number; total: number; visible: { passed: number; total: number }; hidden: { passed: number; total: number }; submittedAt: string }
interface ContextValue {
  session: CandidateSession; task: CandidateTask | null; activity: ActivityState; error: string | null;
  startAssessment: () => Promise<void>; submitAssessment: () => Promise<void>; submission: SubmissionResult | null;
  codeFiles: CodeFile[]; activeFileId: string; setActiveFileId: (id: string) => void; updateCode: (id: string, content: string) => void; resetCode: () => void;
  testCases: TestCase[]; isRunningTests: boolean; runAllTests: () => Promise<void>; runSingleTest: (id: string) => Promise<void>; testSummary: { total: number; passed: number; failed: number };
  aiMessages: AIMessage[]; isAiTyping: boolean; sendAiQuery: (query: string) => Promise<void>;
  timelineEvents: TimelineEvent[]; selectedTimelineEventId: string | null; setSelectedTimelineEventId: (id: string | null) => void;
  evidenceEvents: EvidenceEvent[]; report: AssessmentReport | null; refreshArtifacts: () => Promise<void>;
  currentRole: 'candidate' | 'reviewer'; setCurrentRole: (role: 'candidate' | 'reviewer') => void;
  reviewerNotes: ReviewerNotes; updateReviewerNotes: (notes: Partial<ReviewerNotes>) => void;
  feedbackList: FeedbackEntry[]; addFeedback: (entry: Omit<FeedbackEntry, 'id' | 'timestamp'>) => void; resetAllDemoData: () => void;
}

const AssessmentContext = createContext<ContextValue | undefined>(undefined);
const SESSION_KEY = 'proofloop_session_id_v1';
const CODE_KEY = 'proofloop_code_v1';
const NOTES_KEY = 'proofloop_reviewer_notes_v1';
const FEEDBACK_KEY = 'proofloop_feedback_entries_v1';
const emptySession: CandidateSession = { sessionId: '', candidateName: 'Candidate', candidateTitle: 'ProofLoop candidate', roleApplied: 'Coding assessment', assessmentTitle: 'Assessment not started', durationMinutes: 0, timeRemainingSeconds: 0, status: 'In Progress', score: 0 };
const timeNow = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

function mapSession(data: SessionResponse, secondsRemaining: number): CandidateSession {
  return { ...emptySession, sessionId: data.sessionId, assessmentTitle: data.task.title, durationMinutes: data.timeLimitMinutes, timeRemainingSeconds: secondsRemaining, status: data.status === 'SUBMITTED' ? 'Completed' : 'In Progress' };
}

function mapEvent(event: EvidenceEvent): TimelineEvent {
  const title = event.eventType.replaceAll('_', ' ');
  const payload = event.payload && typeof event.payload === 'object' ? event.payload as Record<string, unknown> : {};
  const isRun = event.eventType === 'run_completed';
  const failed = event.eventType === 'run_failed';
  const isAi = event.eventType.startsWith('ai_');
  const passed = typeof payload.passed === 'number' ? payload.passed : 0;
  const total = typeof payload.total === 'number' ? payload.total : 0;
  return {
    id: event.eventId, seq: event.sequence, timestamp: event.serverTimestamp, relativeTime: new Date(event.serverTimestamp).toLocaleString(),
    type: isRun || failed ? 'TEST_RUN' : isAi ? 'AI_SUGGESTION' : event.eventType === 'session_created' || event.eventType.startsWith('submission_') ? 'VERIFICATION' : 'CODE_EDIT',
    title: title.charAt(0).toUpperCase() + title.slice(1), summary: `Recorded by ${event.source.toLowerCase()} (${event.actor}).`,
    status: failed ? 'failure' : isRun ? (total > 0 && passed === total ? 'success' : 'warning') : 'info',
    author: event.actor === 'candidate' ? 'candidate' : event.actor === 'ai_assistant' ? 'ai' : 'system',
    ...(isRun ? { testRunData: { total, passed, failed: total - passed } } : {}), details: `Server time: ${event.serverTimestamp}`,
  };
}

export function AssessmentProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<CandidateSession>(emptySession);
  const [serverSession, setServerSession] = useState<SessionResponse | null>(null);
  const [task, setTask] = useState<CandidateTask | null>(null);
  const [activity, setActivity] = useState<ActivityState>(() => localStorage.getItem(SESSION_KEY) ? 'starting' : 'idle');
  const [error, setError] = useState<string | null>(null);
  const [submission, setSubmission] = useState<SubmissionResult | null>(null);
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>([{ id: 'main', name: 'solution.js', language: 'javascript', content: '', isModified: false }]);
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const [evidenceEvents, setEvidenceEvents] = useState<EvidenceEvent[]>([]);
  const [report, setReport] = useState<AssessmentReport | null>(null);
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState<string | null>(null);
  const [currentRole, setCurrentRole] = useState<'candidate' | 'reviewer'>('candidate');
  const [activeFileId, setActiveFileId] = useState('main');
  const [reviewerNotes, setReviewerNotes] = useState<ReviewerNotes>(() => {
    try { return JSON.parse(localStorage.getItem(NOTES_KEY) || 'null') || defaultReviewerNotes; } catch { return defaultReviewerNotes; }
  });
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(() => {
    try { return JSON.parse(localStorage.getItem(FEEDBACK_KEY) || 'null') || []; } catch { return []; }
  });

  const applySession = useCallback((data: SessionResponse) => {
    setServerSession(data); setTask(data.task);
    const remaining = Math.max(0, Math.floor((new Date(data.startedAt).getTime() + data.timeLimitMinutes * 60_000 - Date.now()) / 1000));
    setSession(mapSession(data, remaining));
    setActivity(data.status === 'SUBMITTED' ? 'submitted' : 'active');
    localStorage.setItem(SESSION_KEY, data.sessionId);
    let saved: string | null = null;
    try { saved = localStorage.getItem(`${CODE_KEY}:${data.sessionId}`); } catch { /* storage unavailable */ }
    const code = saved ?? data.task.starterCode;
    setCodeFiles([{ id: 'main', name: 'solution.js', language: data.task.language || 'javascript', content: code, isModified: Boolean(saved) }]);
    setTestCases(data.task.visibleTests.map((test) => ({ id: test.id, name: `Visible test ${test.id}`, description: `Input: ${JSON.stringify(test.input)}`, category: 'core', status: 'idle', expected: String(test.expected) })));
  }, []);

  const activeSessionId = serverSession?.sessionId;
  const refreshArtifacts = useCallback(async () => {
    if (!activeSessionId) return;
    const id = activeSessionId;
    const [eventsResult, reportResult] = await Promise.allSettled([api.events(id), api.report(id)]);
    if (eventsResult.status === 'fulfilled') setEvidenceEvents(eventsResult.value.events);
    if (reportResult.status === 'fulfilled') setReport(reportResult.value);
  }, [activeSessionId]);

  useEffect(() => {
    let cancelled = false;
    const id = localStorage.getItem(SESSION_KEY);
    if (!id) return;
    api.getSession(id).then((data) => { if (!cancelled) applySession(data); }).catch((reason: unknown) => {
      if (!cancelled) { localStorage.removeItem(SESSION_KEY); setError(reason instanceof Error ? reason.message : 'Could not restore assessment session.'); setActivity('error'); }
    });
    return () => { cancelled = true; };
  }, [applySession]);

  useEffect(() => {
    if (!serverSession || serverSession.status !== 'ACTIVE') return;
    const tick = () => {
      const remaining = Math.max(0, Math.floor((new Date(serverSession.startedAt).getTime() + serverSession.timeLimitMinutes * 60_000 - Date.now()) / 1000));
      setSession((current) => ({ ...current, timeRemainingSeconds: remaining }));
    };
    tick(); const timer = window.setInterval(tick, 1000); return () => window.clearInterval(timer);
  }, [serverSession]);

  useEffect(() => { void refreshArtifacts(); }, [refreshArtifacts]);
  useEffect(() => { try { localStorage.setItem(NOTES_KEY, JSON.stringify(reviewerNotes)); } catch { /* storage unavailable */ } }, [reviewerNotes]);
  useEffect(() => { try { localStorage.setItem(FEEDBACK_KEY, JSON.stringify(feedbackList)); } catch { /* storage unavailable */ } }, [feedbackList]);
  useEffect(() => { if (session.sessionId && codeFiles[0]) { try { localStorage.setItem(`${CODE_KEY}:${session.sessionId}`, codeFiles[0].content); } catch { /* storage unavailable */ } } }, [session.sessionId, codeFiles]);

  const startAssessment = useCallback(async () => {
    if (activity === 'starting') return;
    if (session.sessionId && serverSession) return;
    setActivity('starting'); setError(null);
    try { applySession(await api.startSession()); }
    catch (reason) { const message = reason instanceof Error ? reason.message : 'Could not start assessment.'; setError(message); setActivity('error'); throw new ApiError(message); }
  }, [activity, applySession, serverSession, session.sessionId]);

  const updateCode = (id: string, content: string) => { if (serverSession?.status !== 'SUBMITTED') setCodeFiles((files) => files.map((file) => file.id === id ? { ...file, content, isModified: true } : file)); };
  const resetCode = () => { if (task) setCodeFiles([{ id: 'main', name: 'solution.js', language: task.language, content: task.starterCode, isModified: false }]); };
  const runAllTests = async () => {
    if (!serverSession || activity === 'running' || activity === 'submitting' || activity === 'submitted') return;
    const code = codeFiles[0]?.content ?? '';
    setActivity('running'); setError(null); setTestCases((tests) => tests.map((test) => ({ ...test, status: 'running' })));
    try {
      const result = await api.run(serverSession.sessionId, code);
      setTestCases((tests) => tests.map((test) => {
        const item = result.results.find((candidate) => candidate.testId === test.id);
        return item ? { ...test, status: item.passed ? 'passed' : 'failed', actual: item.actual === null ? item.error || 'No numeric result returned' : String(item.actual), error: item.error } : test;
      }));
      await refreshArtifacts(); setActivity(serverSession.status === 'SUBMITTED' ? 'submitted' : 'active');
    } catch (reason) {
      const message = reason instanceof Error ? reason.message : 'Code execution failed.';
      setError(message); setTestCases((tests) => tests.map((test) => ({ ...test, status: 'idle', error: undefined, actual: `Not executed: ${message}` })));
      await refreshArtifacts(); setActivity('active');
    }
  };
  const runSingleTest = async (_id: string) => runAllTests();
  const sendAiQuery = async (query: string) => {
    if (!serverSession || !query.trim() || isAiTyping || serverSession.status !== 'ACTIVE') return;
    const message = query.trim();
    setAiMessages((items) => [...items, { id: `user-${Date.now()}`, role: 'user', text: message, timestamp: timeNow() }]);
    setIsAiTyping(true); setActivity('ai'); setError(null);
    try {
      const result = await api.askAi(serverSession.sessionId, message, codeFiles[0]?.content ?? '');
      setAiMessages((items) => [...items, { id: `ai-${Date.now()}`, role: 'assistant', text: result.reply, timestamp: timeNow() }]);
      await refreshArtifacts(); setActivity('active');
    } catch (reason) {
      const messageText = reason instanceof Error ? reason.message : 'AI Coach request failed.';
      setError(messageText); setAiMessages((items) => [...items, { id: `ai-error-${Date.now()}`, role: 'system', text: messageText, timestamp: timeNow() }]);
      await refreshArtifacts(); setActivity('active');
    } finally { setIsAiTyping(false); }
  };
  const submitAssessment = async () => {
    if (!serverSession || activity === 'submitting' || serverSession.status !== 'ACTIVE') return;
    setActivity('submitting'); setError(null);
    try {
      const code = codeFiles[0]?.content ?? '';
      if (!code.trim()) { setError('Enter a solution before submitting.'); setActivity('active'); return; }
      const result = await api.submit(serverSession.sessionId, code);
      setSubmission(result); setServerSession((old) => old ? { ...old, status: result.status, closedAt: result.submittedAt } : old);
      setSession((old) => ({ ...old, status: 'Completed' })); setActivity('submitted');
      await refreshArtifacts();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Submission failed.'); setActivity('active');
    }
  };
  const updateReviewerNotes = (updates: Partial<ReviewerNotes>) => setReviewerNotes((previous) => ({ ...previous, ...updates, lastSaved: new Date().toLocaleString() }));
  const addFeedback = (entry: Omit<FeedbackEntry, 'id' | 'timestamp'>) => setFeedbackList((items) => [{ ...entry, id: `FB-${Date.now()}`, timestamp: new Date().toLocaleString() }, ...items]);
  const resetAllDemoData = () => { localStorage.removeItem(CODE_KEY + ':' + session.sessionId); setCodeFiles(task ? [{ id: 'main', name: 'solution.js', language: task.language, content: task.starterCode, isModified: false }] : []); setTestCases((items) => items.map((item) => ({ ...item, status: 'idle', actual: undefined, error: undefined }))); };
  const testSummary = useMemo(() => ({ total: testCases.length, passed: testCases.filter((item) => item.status === 'passed').length, failed: testCases.filter((item) => item.status === 'failed').length }), [testCases]);
  const timelineEvents = useMemo(() => evidenceEvents.map(mapEvent), [evidenceEvents]);

  const value: ContextValue = {
    session, task, activity, error, startAssessment, submitAssessment, submission,
    codeFiles, activeFileId, setActiveFileId, updateCode, resetCode,
    testCases, isRunningTests: activity === 'running', runAllTests, runSingleTest, testSummary,
    aiMessages, isAiTyping, sendAiQuery, timelineEvents, selectedTimelineEventId, setSelectedTimelineEventId,
    evidenceEvents, report, refreshArtifacts, currentRole, setCurrentRole, reviewerNotes, updateReviewerNotes,
    feedbackList, addFeedback, resetAllDemoData,
  };
  return <AssessmentContext.Provider value={value}>{children}</AssessmentContext.Provider>;
}

export const useAssessment = (): ContextValue => {
  const context = useContext(AssessmentContext);
  if (!context) throw new Error('useAssessment must be used within an AssessmentProvider');
  return context;
}
