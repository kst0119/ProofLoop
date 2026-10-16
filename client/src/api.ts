const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001').replace(/\/$/, '');

export interface VisibleTest {
  id: string;
  input: { price: number; quantity: number }[];
  expected: number;
}

export interface CandidateTask {
  id: string;
  version: string;
  title: string;
  language: string;
  instructions: string;
  starterCode: string;
  visibleTests: VisibleTest[];
}

export interface SessionResponse {
  sessionId: string;
  status: 'ACTIVE' | 'SUBMITTED' | string;
  task: CandidateTask;
  timeLimitMinutes: number;
  startedAt: string;
  closedAt?: string | null;
}

export interface RunResult {
  testId: string;
  passed: boolean;
  expected: number;
  actual: number | null;
  error?: string;
}

export interface RunResponse {
  sessionId: string;
  passed: number;
  total: number;
  results: RunResult[];
}

export interface EvidenceEvent {
  eventId: string;
  sequence: number;
  eventType: string;
  actor: string;
  serverTimestamp: string;
  payload: unknown;
  source: string;
}

export interface AssessmentReport {
  sessionId: string;
  taskVersion: string;
  rubricVersion: string;
  challengeVersion: string | null;
  startedAt: string;
  submittedAt: string | null;
  durationSeconds: number | null;
  finalStatus: string;
  correctness: null | {
    totalTests: number; passed: number; failed: number; passPercentage: number;
    visible: { passed: number; total: number }; hidden: { passed: number; total: number };
  };
  aiCollaboration: {
    aiRequestCount: number; aiResponseDeliveredCount: number;
    providerBreakdown: { mock: number; real: number; controlledChallenge: number; unknown: number };
    controlledChallengeDelivered: boolean;
  };
  verificationBehavior: {
    codeRunCount: number; successfulRuns: number; failedRuns: number;
    codeCheckpoints: number; observations: string[];
  };
  timeline: { sequence: number; eventType: string; serverTimestamp: string; actor: string; source: string; summary: string }[];
  interpretation: string[];
  _securityNotice: string;
}

export class ApiError extends Error {
  readonly status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 30_000);
  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: controller.signal,
      headers: { 'Content-Type': 'application/json', ...init?.headers },
    });
    const body: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const message = body && typeof body === 'object' && 'error' in body && typeof body.error === 'string'
        ? body.error
        : `Request failed (${response.status})`;
      throw new ApiError(message, response.status);
    }
    return body as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof DOMException && error.name === 'AbortError') {
      throw new ApiError('The server took too long to respond. Please try again.');
    }
    throw new ApiError('Could not reach the ProofLoop API. Check that the backend is running and try again.');
  } finally {
    window.clearTimeout(timeout);
  }
}

const json = (value: unknown): RequestInit => ({ method: 'POST', body: JSON.stringify(value) });

export const api = {
  startSession: () => request<SessionResponse>('/api/sessions', json({})),
  getSession: (id: string) => request<SessionResponse>(`/api/sessions/${encodeURIComponent(id)}`),
  run: (id: string, code: string) => request<RunResponse>(`/api/sessions/${encodeURIComponent(id)}/run`, json({ code })),
  askAi: (id: string, message: string, code: string) => request<{ sessionId: string; reply: string; allowed: boolean }>(`/api/sessions/${encodeURIComponent(id)}/ai`, json({ message, code })),
  submit: (id: string, code: string) => request<{ sessionId: string; status: string; passed: number; total: number; visible: { passed: number; total: number; results: RunResult[] }; hidden: { passed: number; total: number }; submittedAt: string }>(`/api/sessions/${encodeURIComponent(id)}/submit`, json({ code })),
  events: (id: string) => request<{ sessionId: string; events: EvidenceEvent[] }>(`/api/sessions/${encodeURIComponent(id)}/events`),
  report: (id: string) => request<AssessmentReport>(`/api/sessions/${encodeURIComponent(id)}/report`),
};
