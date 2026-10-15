export type TimelineEventType = 
  | 'PROMPT' 
  | 'AI_SUGGESTION' 
  | 'CODE_EDIT' 
  | 'TEST_RUN' 
  | 'DEBUG_ACTION' 
  | 'VERIFICATION';

export type EventStatus = 'success' | 'failure' | 'neutral' | 'warning' | 'info';

export interface CodeDiff {
  file: string;
  before: string;
  after: string;
  additions: number;
  deletions: number;
}

export interface TimelineEvent {
  id: string;
  seq: number;
  timestamp: string;
  relativeTime: string;
  type: TimelineEventType;
  title: string;
  summary: string;
  status: EventStatus;
  author: 'candidate' | 'ai' | 'system';
  relatedEvidenceId?: string;
  diff?: CodeDiff;
  details?: string;
  promptData?: {
    prompt: string;
    response: string;
    tokenCount: number;
    latencyMs: number;
  };
  testRunData?: {
    total: number;
    passed: number;
    failed: number;
    failingTests?: string[];
  };
}

export type EvidenceNature = 'OBSERVED_EVENT' | 'SYNTHESIZED_FINDING' | 'COUNTER_EVIDENCE';

export type ConfidenceGrade = 
  | 'CORROBORATED_FACT' 
  | 'HIGH_CONFIDENCE' 
  | 'MEDIUM_CONFIDENCE' 
  | 'INFERRED_INTERPRETATION';

export interface EvidenceItem {
  id: string;
  title: string;
  competencyId: string;
  competencyName: string;
  nature: EvidenceNature;
  confidence: ConfidenceGrade;
  timestamp: string;
  observedBehavior: string;
  interpretation: string;
  supportingData: string[];
  counterEvidence?: string[];
  coverageWeight: number;
  relatedTimelineEventIds: string[];
}

export interface CompetencyMetric {
  id: string;
  name: string;
  score: number;
  maxScore: number;
  summary: string;
  evidenceItemsCount: number;
  level: 'Exemplary' | 'Proficient' | 'Developing' | 'Needs Improvement';
  signals: string[];
}

export interface TestCase {
  id: string;
  name: string;
  description: string;
  category: 'core' | 'edge-case' | 'security' | 'regression';
  status: 'idle' | 'running' | 'passed' | 'failed';
  durationMs?: number;
  error?: string;
  expected: string;
  actual?: string;
}

export interface CodeFile {
  id: string;
  name: string;
  language: string;
  content: string;
  isModified: boolean;
  isReadOnly?: boolean;
}

export interface TaskRequirement {
  id: string;
  text: string;
  completed: boolean;
  category: 'mandatory' | 'edge-case' | 'clean-code';
}

export interface AIMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  text: string;
  timestamp: string;
  codeSnippet?: string;
  telemetry?: {
    tokens: number;
    confidence: string;
    executionTimeMs: number;
  };
}

export interface CandidateSession {
  sessionId: string;
  candidateName: string;
  candidateTitle: string;
  roleApplied: string;
  assessmentTitle: string;
  durationMinutes: number;
  timeRemainingSeconds: number;
  status: 'In Progress' | 'Completed' | 'Verified';
  score: number;
}

export interface ReviewerReportData {
  session: CandidateSession;
  executiveSummary: string;
  competencies: CompetencyMetric[];
  strengths: { title: string; description: string; evidenceId: string }[];
  improvementAreas: { title: string; description: string; evidenceId: string }[];
  testOutcomes: {
    total: number;
    passed: number;
    failed: number;
    coveragePct: number;
  };
  limitationsNotice: string;
}

export interface ReviewerNotes {
  reviewerName: string;
  notes: string;
  recommendation: 'STRONG_HIRE' | 'HIRE' | 'LEAN_HIRE' | 'NEEDS_FOLLOW_UP' | 'NO_HIRE';
  status: 'DRAFT' | 'IN_REVIEW' | 'APPROVED' | 'ARCHIVED';
  lastSaved: string;
}

export interface FeedbackEntry {
  id: string;
  authorRole: 'candidate' | 'reviewer' | 'recruiter' | 'interviewer';
  ratingRealism: number;
  ratingAIUtility: number;
  ratingClarity: number;
  ratingOverall: number;
  comments: string;
  email?: string;
  timestamp: string;
}
