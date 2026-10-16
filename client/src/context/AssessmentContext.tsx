import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import type {
  AIMessage,
  CandidateSession,
  CodeFile,
  CompetencyMetric,
  EvidenceItem,
  FeedbackEntry,
  ReviewerNotes,
  ReviewerReportData,
  TaskRequirement,
  TestCase,
  TimelineEvent,
} from '../types';
import {
  defaultReviewerNotes,
  initialFeedbackList,
  mockCompetencies,
  mockEvidenceItems,
  mockRequirements,
  mockReviewerReport,
  mockSession,
  mockTestCases,
  mockTimelineEvents,
  starterCodeFiles,
} from '../data/mockData';

interface AssessmentContextType {
  // Session
  session: CandidateSession;
  currentRole: 'candidate' | 'reviewer';
  setCurrentRole: (role: 'candidate' | 'reviewer') => void;

  // Code Workspace
  codeFiles: CodeFile[];
  activeFileId: string;
  setActiveFileId: (id: string) => void;
  updateCode: (fileId: string, content: string) => void;
  resetCode: () => void;
  requirements: TaskRequirement[];
  toggleRequirement: (id: string) => void;

  // Test Runner
  testCases: TestCase[];
  isRunningTests: boolean;
  runAllTests: () => Promise<void>;
  runSingleTest: (testId: string) => Promise<void>;
  testSummary: { total: number; passed: number; failed: number };

  // AI Assistant
  aiMessages: AIMessage[];
  isAiTyping: boolean;
  sendAiQuery: (query: string) => Promise<void>;

  // Timeline / Verification Loop
  timelineEvents: TimelineEvent[];
  selectedTimelineEventId: string | null;
  setSelectedTimelineEventId: (id: string | null) => void;

  // Evidence Ledger
  evidenceItems: EvidenceItem[];
  selectedEvidenceId: string | null;
  setSelectedEvidenceId: (id: string | null) => void;
  competencies: CompetencyMetric[];

  // Reviewer Report
  reportData: ReviewerReportData;
  reviewerNotes: ReviewerNotes;
  updateReviewerNotes: (notes: Partial<ReviewerNotes>) => void;

  // Feedback
  feedbackList: FeedbackEntry[];
  addFeedback: (entry: Omit<FeedbackEntry, 'id' | 'timestamp'>) => void;
  resetAllDemoData: () => void;
}

const AssessmentContext = createContext<AssessmentContextType | undefined>(undefined);

const LOCAL_STORAGE_KEY_CODE = 'proofloop_code_files_v1';
const LOCAL_STORAGE_KEY_NOTES = 'proofloop_reviewer_notes_v1';
const LOCAL_STORAGE_KEY_FEEDBACK = 'proofloop_feedback_entries_v1';
const LOCAL_STORAGE_KEY_TESTS = 'proofloop_test_cases_v1';

export const AssessmentProvider = ({ children }: { children: ReactNode }) => {
  const [session] = useState<CandidateSession>(mockSession);
  const [currentRole, setCurrentRole] = useState<'candidate' | 'reviewer'>('candidate');

  // Load code from localStorage or default
  const [codeFiles, setCodeFiles] = useState<CodeFile[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_CODE);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return starterCodeFiles;
  });

  const [activeFileId, setActiveFileId] = useState<string>('file-1');
  const [requirements, setRequirements] = useState<TaskRequirement[]>(mockRequirements);

  // Tests state
  const [testCases, setTestCases] = useState<TestCase[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_TESTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return mockTestCases;
  });
  const [isRunningTests, setIsRunningTests] = useState<boolean>(false);

  // AI Chat state
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([
    {
      id: 'msg-init-1',
      role: 'assistant',
      text: "Hello Alex. I am your ProofLoop Assessment Copilot. You can ask for architectural guidance, query TypeScript edge cases (e.g. distinguishing explicit boolean `false` from `undefined`), or request invariant test vectors. All interactions are logged to your session's inspectable evidence ledger.",
      timestamp: '14:00',
    },
  ]);
  const [isAiTyping, setIsAiTyping] = useState<boolean>(false);

  // Timeline events state
  const [timelineEvents, setTimelineEvents] = useState<TimelineEvent[]>(mockTimelineEvents);
  const [selectedTimelineEventId, setSelectedTimelineEventId] = useState<string | null>(null);

  // Evidence Items
  const [evidenceItems] = useState<EvidenceItem[]>(mockEvidenceItems);
  const [selectedEvidenceId, setSelectedEvidenceId] = useState<string | null>(null);
  const [competencies] = useState<CompetencyMetric[]>(mockCompetencies);

  // Reviewer notes
  const [reviewerNotes, setReviewerNotes] = useState<ReviewerNotes>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_NOTES);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return defaultReviewerNotes;
  });

  // Feedback submissions
  const [feedbackList, setFeedbackList] = useState<FeedbackEntry[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_KEY_FEEDBACK);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return initialFeedbackList;
  });

  // Save changes to localStorage safely
  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_CODE, JSON.stringify(codeFiles));
    } catch {
      // ignore
    }
  }, [codeFiles]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_NOTES, JSON.stringify(reviewerNotes));
    } catch {
      // ignore
    }
  }, [reviewerNotes]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_FEEDBACK, JSON.stringify(feedbackList));
    } catch {
      // ignore
    }
  }, [feedbackList]);

  useEffect(() => {
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY_TESTS, JSON.stringify(testCases));
    } catch {
      // ignore
    }
  }, [testCases]);

  const updateCode = useCallback((fileId: string, content: string) => {
    setCodeFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content, isModified: true } : f))
    );
  }, []);

  const resetCode = useCallback(() => {
    setCodeFiles(starterCodeFiles);
    localStorage.removeItem(LOCAL_STORAGE_KEY_CODE);
  }, []);

  const toggleRequirement = (id: string) => {
    setRequirements((prev) =>
      prev.map((r) => (r.id === id ? { ...r, completed: !r.completed } : r))
    );
  };

  const runAllTests = async () => {
    setIsRunningTests(true);
    // Mark tests as running
    setTestCases((prev) => prev.map((t) => ({ ...t, status: 'running' })));

    // Simulate realistic asynchronous execution of test runner
    await new Promise((resolve) => setTimeout(resolve, 900));

    // Analyze current code for subtle explicit false check
    const currentCode = codeFiles.find((f) => f.id === 'file-1')?.content || '';
    const hasUndefinedCheck = currentCode.includes('val !== undefined') || currentCode.includes('typeof val !== "undefined"');
    const hasProtoGuard = currentCode.includes('__proto__') || currentCode.includes('DISALLOWED_KEYS');

    setTestCases((prev) =>
      prev.map((test) => {
        if (test.id === 'TC-02' && !hasUndefinedCheck) {
          return {
            ...test,
            status: 'failed',
            error: 'AssertionError: expected twoFactorEnabled to be false, got true (falsy coercion detected)',
          };
        }
        if (test.id === 'TC-04' && !hasProtoGuard) {
          return {
            ...test,
            status: 'failed',
            error: 'SecurityError: Object.prototype was polluted with { polluted: true }',
          };
        }
        return {
          ...test,
          status: 'passed',
          error: undefined,
        };
      })
    );

    setIsRunningTests(false);

    // Append a live timeline event for this run
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    const newSeq = timelineEvents.length + 1;
    const allPassed = hasUndefinedCheck && hasProtoGuard;

    const newEvent: TimelineEvent = {
      id: `EVT-${Date.now().toString().slice(-4)}`,
      seq: newSeq,
      timestamp: `2026-10-15 ${timeStr}`,
      relativeTime: `T+${String(Math.floor((Date.now() % 3600000) / 60000)).padStart(2, '0')}:45`,
      type: 'TEST_RUN',
      title: `Candidate executed full test suite (${allPassed ? '6/6 Passed' : 'Failures detected'})`,
      summary: allPassed
        ? 'All test assertions succeeded. Invariants verified: explicit boolean preservation, deep patch recursion, and prototype security.'
        : 'Test assertions failed on edge case criteria. Inspect test log details.',
      status: allPassed ? 'success' : 'failure',
      author: 'system',
      testRunData: {
        total: 6,
        passed: allPassed ? 6 : 4,
        failed: allPassed ? 0 : 2,
        failingTests: allPassed ? [] : ['TC-02: Explicit boolean false', 'TC-04: Prototype pollution rejection'],
      },
      details: allPassed
        ? 'Simulated Node.js test runner executed in 78ms with 100% boundary assertion pass rate.'
        : 'Regression detected: verify Boolean undefined discrimination in patchUserPreferences recursiveMerge loop.',
    };

    setTimelineEvents((prev) => [...prev, newEvent]);
  };

  const runSingleTest = async (testId: string) => {
    setTestCases((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, status: 'running' } : t))
    );
    await new Promise((resolve) => setTimeout(resolve, 500));
    setTestCases((prev) =>
      prev.map((t) => (t.id === testId ? { ...t, status: 'passed', error: undefined } : t))
    );
  };

  const testSummary = {
    total: testCases.length,
    passed: testCases.filter((t) => t.status === 'passed').length,
    failed: testCases.filter((t) => t.status === 'failed').length,
  };

  const sendAiQuery = async (queryText: string) => {
    if (!queryText.trim()) return;

    const userMsg: AIMessage = {
      id: `user-${Date.now()}`,
      role: 'user',
      text: queryText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setAiMessages((prev) => [...prev, userMsg]);
    setIsAiTyping(true);

    // Contextual responses based on engineering query
    await new Promise((resolve) => setTimeout(resolve, 1100));

    let reply = "I've analyzed your patch logic. Remember to guard against prototype poisoning by skipping `__proto__`, `constructor`, and `prototype` keys.";
    let snippet = undefined;

    const lower = queryText.toLowerCase();
    if (lower.includes('false') || lower.includes('boolean')) {
      reply = "To preserve explicit boolean `false`, never use truthy fallback operators such as `patch[key] || current[key]`. Instead, verify `val !== undefined`. This allows `false`, `null`, `0`, and empty strings to pass through without being overwritten by the previous value.";
      snippet = `// Safe check:\nif (val !== undefined) {\n  target[key] = val;\n}`;
    } else if (lower.includes('deep') || lower.includes('recursion') || lower.includes('nested')) {
      reply = "When implementing recursive merging, ensure both the source and target values are non-null objects and NOT arrays before calling recursiveMerge. If the source is a primitive (e.g., boolean false), it must overwrite the target directly.";
      snippet = `if (typeof val === 'object' && val !== null && !Array.isArray(val) && typeof target[key] === 'object') {\n  recursiveMerge(target[key], val, currentPath);\n} else {\n  target[key] = val;\n}`;
    } else if (lower.includes('proto') || lower.includes('security') || lower.includes('poison')) {
      reply = "An attacker can pass JSON with keys like `\"__proto__\": {\"isAdmin\": true}`. To protect your application, maintain a Set of disallowed keys and continue if `DISALLOWED_KEYS.has(key)`.";
      snippet = `const DISALLOWED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);\nif (DISALLOWED_KEYS.has(key)) continue;`;
    } else if (lower.includes('test') || lower.includes('vector')) {
      reply = "Here is a test case pattern to verify that nested fields are not wiped when only a sibling is updated:";
      snippet = `test('preserves sibling fields in nested objects', () => {\n  const result = patchUserPreferences(current, { notifications: { push: false } });\n  expect(result.updated.notifications.email).toBe(true);\n  expect(result.updated.notifications.push).toBe(false);\n});`;
    }

    const aiMsg: AIMessage = {
      id: `ai-${Date.now()}`,
      role: 'assistant',
      text: reply,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      codeSnippet: snippet,
      telemetry: {
        tokens: Math.floor(Math.random() * 80) + 110,
        confidence: '98.5%',
        executionTimeMs: 780,
      },
    };

    setAiMessages((prev) => [...prev, aiMsg]);
    setIsAiTyping(false);
  };

  const updateReviewerNotes = (updates: Partial<ReviewerNotes>) => {
    setReviewerNotes((prev) => ({
      ...prev,
      ...updates,
      lastSaved: new Date().toLocaleString(),
    }));
  };

  const addFeedback = (entry: Omit<FeedbackEntry, 'id' | 'timestamp'>) => {
    const newEntry: FeedbackEntry = {
      ...entry,
      id: `FB-${String(feedbackList.length + 1).padStart(2, '0')}`,
      timestamp: new Date().toLocaleString(),
    };
    setFeedbackList((prev) => [newEntry, ...prev]);
  };

  const resetAllDemoData = () => {
    localStorage.removeItem(LOCAL_STORAGE_KEY_CODE);
    localStorage.removeItem(LOCAL_STORAGE_KEY_NOTES);
    localStorage.removeItem(LOCAL_STORAGE_KEY_FEEDBACK);
    localStorage.removeItem(LOCAL_STORAGE_KEY_TESTS);
    setCodeFiles(starterCodeFiles);
    setTestCases(mockTestCases);
    setReviewerNotes(defaultReviewerNotes);
    setFeedbackList(initialFeedbackList);
    setTimelineEvents(mockTimelineEvents);
  };

  return (
    <AssessmentContext.Provider
      value={{
        session,
        currentRole,
        setCurrentRole,
        codeFiles,
        activeFileId,
        setActiveFileId,
        updateCode,
        resetCode,
        requirements,
        toggleRequirement,
        testCases,
        isRunningTests,
        runAllTests,
        runSingleTest,
        testSummary,
        aiMessages,
        isAiTyping,
        sendAiQuery,
        timelineEvents,
        selectedTimelineEventId,
        setSelectedTimelineEventId,
        evidenceItems,
        selectedEvidenceId,
        setSelectedEvidenceId,
        competencies,
        reportData: mockReviewerReport,
        reviewerNotes,
        updateReviewerNotes,
        feedbackList,
        addFeedback,
        resetAllDemoData,
      }}
    >
      {children}
    </AssessmentContext.Provider>
  );
};

export const useAssessment = (): AssessmentContextType => {
  const context = useContext(AssessmentContext);
  if (!context) {
    throw new Error('useAssessment must be used within an AssessmentProvider');
  }
  return context;
};
