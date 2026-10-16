import type {
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

export const mockSession: CandidateSession = {
  sessionId: 'PL-SES-4091',
  candidateName: 'Alex Mercer',
  candidateTitle: 'Senior Platform & AI Systems Engineer',
  roleApplied: 'Staff AI Engineer (Backend & Workflows)',
  assessmentTitle: 'API Partial Patch Engine: Explicit False & Deep Invariant Handling',
  durationMinutes: 45,
  timeRemainingSeconds: 28 * 60 + 14,
  status: 'Completed',
  score: 94,
};

export const mockRequirements: TaskRequirement[] = [
  {
    id: 'REQ-1',
    text: 'Preserve all omitted fields at top-level and nested paths without erasure.',
    completed: true,
    category: 'mandatory',
  },
  {
    id: 'REQ-2',
    text: 'Explicitly support boolean false values (prevent truthy/falsy coercion bugs like || fallbacks).',
    completed: true,
    category: 'mandatory',
  },
  {
    id: 'REQ-3',
    text: 'Implement safe deep recursive patch for nested structures (e.g., privacy, notifications).',
    completed: true,
    category: 'mandatory',
  },
  {
    id: 'REQ-4',
    text: 'Sanitize prototype pollution vectors (__proto__, constructor, prototype).',
    completed: true,
    category: 'edge-case',
  },
  {
    id: 'REQ-5',
    text: 'Produce an immutable patch result and compute an atomic mutation audit log.',
    completed: true,
    category: 'clean-code',
  },
];

export const starterCodeFiles: CodeFile[] = [
  {
    id: 'file-1',
    name: 'preferencesHandler.ts',
    language: 'typescript',
    isModified: false,
    content: `/**
 * PROOFLOOP ASSESSMENT TASK:
 * Implement PATCH /api/v2/users/:id/preferences
 *
 * Invariants to maintain:
 * 1. Omitted fields must remain unchanged.
 * 2. Explicit boolean \`false\` must be applied, NOT replaced by default or previous value.
 * 3. Deeply nested objects (e.g. \`notifications\`, \`privacy\`) must be recursively merged.
 * 4. Prototype keys (__proto__, constructor) must be rejected to prevent prototype pollution.
 * 5. Returns { updated: Preferences, mutationsCount: number, auditTrail: string[] }
 */

import { UserPreferences, PatchPayload, PatchResult } from './types';

const DISALLOWED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);

export function patchUserPreferences(
  current: UserPreferences,
  patch: PatchPayload
): PatchResult {
  const auditTrail: string[] = [];
  let mutationsCount = 0;

  // Defensive clone to guarantee immutability
  const updated: UserPreferences = JSON.parse(JSON.stringify(current));

  function recursiveMerge(target: any, source: any, path: string = ''): void {
    if (!source || typeof source !== 'object' || Array.isArray(source)) {
      return;
    }

    for (const key of Object.keys(source)) {
      if (DISALLOWED_KEYS.has(key)) {
        continue; // Prevent prototype pollution
      }

      const val = source[key];
      const currentPath = path ? \`\${path}.\${key}\` : key;

      // CRITICAL FIX FOR EXPLICIT FALSE:
      // In naive implementations: \`target[key] = val || target[key]\` drops boolean false!
      // We must explicitly verify val !== undefined
      if (val !== undefined) {
        if (
          val !== null &&
          typeof val === 'object' &&
          !Array.isArray(val) &&
          typeof target[key] === 'object' &&
          target[key] !== null
        ) {
          recursiveMerge(target[key], val, currentPath);
        } else {
          if (target[key] !== val) {
            target[key] = val;
            mutationsCount++;
            auditTrail.push(\`Mutated \${currentPath} from \${JSON.stringify(target[key])} to \${JSON.stringify(val)}\`);
          }
        }
      }
    }
  }

  recursiveMerge(updated, patch);

  return {
    updated,
    mutationsCount,
    auditTrail,
  };
}
`,
  },
  {
    id: 'file-2',
    name: 'types.ts',
    language: 'typescript',
    isModified: false,
    content: `export interface NotificationSettings {
  email: boolean;
  push: boolean;
  sms: boolean;
  frequency: 'realtime' | 'daily_digest' | 'never';
}

export interface PrivacySettings {
  searchIndexing: boolean;
  profilePublic: boolean;
  activityTracking: boolean;
}

export interface UserPreferences {
  theme: 'dark' | 'light' | 'system';
  locale: string;
  notifications: NotificationSettings;
  privacy: PrivacySettings;
  twoFactorEnabled: boolean;
  compactMode: boolean;
}

export type PatchPayload = Partial<{
  theme: 'dark' | 'light' | 'system';
  locale: string;
  notifications: Partial<NotificationSettings>;
  privacy: Partial<PrivacySettings>;
  twoFactorEnabled: boolean;
  compactMode: boolean;
  [key: string]: any;
}>;

export interface PatchResult {
  updated: UserPreferences;
  mutationsCount: number;
  auditTrail: string[];
}
`,
  },
  {
    id: 'file-3',
    name: 'preferences.test.ts',
    language: 'typescript',
    isModified: false,
    content: `import { patchUserPreferences } from './preferencesHandler';
import { UserPreferences } from './types';

const defaultPrefs: UserPreferences = {
  theme: 'dark',
  locale: 'en-US',
  twoFactorEnabled: true,
  compactMode: true,
  notifications: {
    email: true,
    push: true,
    sms: false,
    frequency: 'realtime',
  },
  privacy: {
    searchIndexing: true,
    profilePublic: true,
    activityTracking: true,
  },
};

describe('patchUserPreferences - ProofLoop Verification Suite', () => {
  test('TC-01: Preserves omitted top-level and nested properties', () => {
    const result = patchUserPreferences(defaultPrefs, { locale: 'de-DE' });
    expect(result.updated.locale).toBe('de-DE');
    expect(result.updated.theme).toBe('dark');
    expect(result.updated.notifications.email).toBe(true);
  });

  test('TC-02: Correctly handles explicit boolean false values', () => {
    const result = patchUserPreferences(defaultPrefs, {
      twoFactorEnabled: false,
      compactMode: false,
    });
    expect(result.updated.twoFactorEnabled).toBe(false);
    expect(result.updated.compactMode).toBe(false);
  });

  test('TC-03: Performs deep recursive patch on nested notification keys', () => {
    const result = patchUserPreferences(defaultPrefs, {
      notifications: { push: false },
    });
    expect(result.updated.notifications.push).toBe(false);
    expect(result.updated.notifications.email).toBe(true); // preserved!
    expect(result.updated.notifications.frequency).toBe('realtime'); // preserved!
  });

  test('TC-04: Prevents prototype pollution injection vectors', () => {
    const maliciousPayload = JSON.parse('{"__proto__": {"polluted": true}, "theme": "light"}');
    const result = patchUserPreferences(defaultPrefs, maliciousPayload);
    expect(result.updated.theme).toBe('light');
    expect((Object.prototype as any).polluted).toBeUndefined();
  });

  test('TC-05: Accurately produces mutation count and audit trail log', () => {
    const result = patchUserPreferences(defaultPrefs, {
      theme: 'light',
      privacy: { searchIndexing: false },
    });
    expect(result.mutationsCount).toBe(2);
    expect(result.auditTrail.length).toBe(2);
  });
});
`,
  },
];

export const mockTestCases: TestCase[] = [
  {
    id: 'TC-01',
    name: 'Preserves omitted top-level & nested fields',
    description: 'Ensure fields not present in the patch payload remain intact in the resulting object.',
    category: 'core',
    status: 'passed',
    durationMs: 14,
    expected: 'Unspecified keys remain identical to existing state',
    actual: 'Verified: 8 untouched keys retained original memory values',
  },
  {
    id: 'TC-02',
    name: 'Explicit boolean false handling without fallback',
    description: 'Verify twoFactorEnabled: false or compactMode: false are applied cleanly without falsy coercion.',
    category: 'edge-case',
    status: 'passed',
    durationMs: 18,
    expected: 'updated.twoFactorEnabled === false && updated.compactMode === false',
    actual: 'Verified: explicit boolean false preserved across all primitive keys',
  },
  {
    id: 'TC-03',
    name: 'Deep nested partial patch (notifications & privacy)',
    description: 'Recursively apply patch to sub-objects without destroying sibling properties.',
    category: 'core',
    status: 'passed',
    durationMs: 22,
    expected: 'Sub-key updated while sibling sub-keys remain preserved',
    actual: 'Verified: notifications.push set to false while email & frequency preserved',
  },
  {
    id: 'TC-04',
    name: 'Prototype pollution vulnerability prevention',
    description: 'Reject dangerous keys like __proto__, constructor, and prototype from payload.',
    category: 'security',
    status: 'passed',
    durationMs: 11,
    expected: 'Object.prototype unpolluted, dangerous keys bypassed',
    actual: 'Verified: Object.prototype.polluted is undefined',
  },
  {
    id: 'TC-05',
    name: 'Audit trail & atomic mutation tracking',
    description: 'Verify each mutated path is recorded with human-inspectable before/after records.',
    category: 'core',
    status: 'passed',
    durationMs: 16,
    expected: 'auditTrail array matches exact number of mutated paths',
    actual: 'Verified: 2 mutations recorded with exact JSON serialization diffs',
  },
  {
    id: 'TC-06',
    name: 'Immutable state guarantee (source object unchanged)',
    description: 'Assert that the input current object is not modified in-place during the patch operation.',
    category: 'regression',
    status: 'passed',
    durationMs: 13,
    expected: 'original !== updated && original properties remain untouched',
    actual: 'Verified: deep immutability preserved via defensive isolation',
  },
];

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'EVT-01',
    seq: 1,
    timestamp: '2026-10-15 14:02:18',
    relativeTime: 'T+02:18',
    type: 'PROMPT',
    title: 'Candidate inquiries about deep patch invariants',
    summary: 'Candidate asks AI assistant for recursive patch patterns that explicitly protect boolean false values.',
    status: 'info',
    author: 'candidate',
    relatedEvidenceId: 'EV-101',
    promptData: {
      prompt: 'In TypeScript, what is the cleanest pattern for a partial patch function that handles nested objects while avoiding falsy coercion bugs with explicit boolean false?',
      response: 'To handle explicit boolean false, you must avoid truthy operators like (source.val || target.val). Instead use explicit undefined checks: if (source[key] !== undefined). For deep recursion, check for typeof object && !Array.isArray.',
      tokenCount: 142,
      latencyMs: 840,
    },
    details: 'Candidate initiated structured query focusing on edge-case invariance rather than asking for full solution code.',
  },
  {
    id: 'EVT-02',
    seq: 2,
    timestamp: '2026-10-15 14:04:45',
    relativeTime: 'T+04:45',
    type: 'AI_SUGGESTION',
    title: 'AI proposes Object.assign spread snippet',
    summary: 'AI returns a naive shallow merge using spread operator which does not handle nested keys.',
    status: 'neutral',
    author: 'ai',
    promptData: {
      prompt: 'Can I just use Object.assign({}, current, patch)?',
      response: 'Object.assign will overwrite top-level keys, but any nested object like { notifications: { push: false } } will completely replace the existing notifications object, wiping out email and frequency.',
      tokenCount: 98,
      latencyMs: 620,
    },
    details: 'AI pointed out the limitation of shallow merging, reinforcing candidate test hypothesis.',
  },
  {
    id: 'EVT-03',
    seq: 3,
    timestamp: '2026-10-15 14:07:30',
    relativeTime: 'T+07:30',
    type: 'CODE_EDIT',
    title: 'Candidate drafts initial recursiveMerge function',
    summary: 'Candidate writes initial recursive loop, but forgets the prototype pollution guard.',
    status: 'neutral',
    author: 'candidate',
    relatedEvidenceId: 'EV-102',
    diff: {
      file: 'preferencesHandler.ts',
      before: `export function patchUserPreferences(current, patch) {\n  return Object.assign({}, current, patch);\n}`,
      after: `export function patchUserPreferences(current, patch) {\n  const updated = JSON.parse(JSON.stringify(current));\n  function recursiveMerge(target, source) {\n    for (const key of Object.keys(source)) {\n      const val = source[key];\n      if (val !== undefined) target[key] = val;\n    }\n  }\n  recursiveMerge(updated, patch);\n  return { updated, mutationsCount: 0, auditTrail: [] };\n}`,
      additions: 10,
      deletions: 3,
    },
  },
  {
    id: 'EVT-04',
    seq: 4,
    timestamp: '2026-10-15 14:11:15',
    relativeTime: 'T+11:15',
    type: 'TEST_RUN',
    title: 'Initial Test Run: 2 of 5 tests failed',
    summary: 'Test execution revealed TC-03 (nested notifications wipe) and TC-04 (prototype vulnerability) failed.',
    status: 'failure',
    author: 'system',
    relatedEvidenceId: 'EV-103',
    testRunData: {
      total: 5,
      passed: 3,
      failed: 2,
      failingTests: ['TC-03: Nested notification merge', 'TC-04: Prototype pollution rejection'],
    },
    details: 'System test suite logged assertion failure: expected notifications.email to be true, got undefined.',
  },
  {
    id: 'EVT-05',
    seq: 5,
    timestamp: '2026-10-15 14:14:00',
    relativeTime: 'T+14:00',
    type: 'DEBUG_ACTION',
    title: 'Candidate logs intermediate object keys & diagnoses recursion',
    summary: 'Candidate identifies that nested objects were being assigned directly instead of recursed into.',
    status: 'info',
    author: 'candidate',
    relatedEvidenceId: 'EV-103',
    details: 'Candidate placed defensive branch checking typeof val === "object" && typeof target[key] === "object" before direct assignment.',
  },
  {
    id: 'EVT-06',
    seq: 6,
    timestamp: '2026-10-15 14:18:22',
    relativeTime: 'T+18:22',
    type: 'CODE_EDIT',
    title: 'Candidate adds DISALLOWED_KEYS set & recursion guard',
    summary: 'Candidate implements prototype pollution blocklist (__proto__, constructor) and full recursive merge.',
    status: 'success',
    author: 'candidate',
    relatedEvidenceId: 'EV-104',
    diff: {
      file: 'preferencesHandler.ts',
      before: `for (const key of Object.keys(source)) {\n  const val = source[key];\n  if (val !== undefined) target[key] = val;\n}`,
      after: `const DISALLOWED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);\nfor (const key of Object.keys(source)) {\n  if (DISALLOWED_KEYS.has(key)) continue;\n  const val = source[key];\n  if (val !== undefined) {\n    if (typeof val === 'object' && val !== null && !Array.isArray(val) && typeof target[key] === 'object') {\n      recursiveMerge(target[key], val, currentPath);\n    } else {\n      target[key] = val;\n    }\n  }\n}`,
      additions: 12,
      deletions: 4,
    },
  },
  {
    id: 'EVT-07',
    seq: 7,
    timestamp: '2026-10-15 14:22:40',
    relativeTime: 'T+22:40',
    type: 'TEST_RUN',
    title: 'Second Test Run: 5 of 5 tests passed',
    summary: 'All core and security test cases succeeded with zero assertions failing.',
    status: 'success',
    author: 'system',
    relatedEvidenceId: 'EV-105',
    testRunData: {
      total: 5,
      passed: 5,
      failed: 0,
    },
    details: 'Execution time: 64ms. 100% boundary conditions satisfied.',
  },
  {
    id: 'EVT-08',
    seq: 8,
    timestamp: '2026-10-15 14:26:05',
    relativeTime: 'T+26:05',
    type: 'VERIFICATION',
    title: 'Final Candidate Self-Verification & Regression Test',
    summary: 'Candidate author added an extra regression test (TC-06) verifying input immutability before submission.',
    status: 'success',
    author: 'candidate',
    relatedEvidenceId: 'EV-106',
    details: 'Candidate demonstrated exemplary verification discipline by validating that current object remains unmutated in caller scope.',
  },
];

export const mockEvidenceItems: EvidenceItem[] = [
  {
    id: 'EV-101',
    title: 'Precise Specification Invariant Querying',
    competencyId: 'COMP-1',
    competencyName: 'AI Utilization & Critical Evaluation',
    nature: 'OBSERVED_EVENT',
    confidence: 'CORROBORATED_FACT',
    timestamp: 'T+02:18',
    observedBehavior: 'Candidate prompted AI regarding specific Boolean false coercion edge cases rather than requesting blanket generation of boilerplate code.',
    interpretation: 'Demonstrates strong conceptual awareness of common JavaScript truthiness pitfalls and uses AI as a precision sounding board.',
    supportingData: [
      'Raw prompt telemetry indicates targeted query on undefined vs false discrimination',
      'Candidate did not copy-paste hallucinated code; evaluated suggestions against API specification',
    ],
    coverageWeight: 20,
    relatedTimelineEventIds: ['EVT-01'],
  },
  {
    id: 'EV-102',
    title: 'Critical Rejection of Inadequate AI Suggestion',
    competencyId: 'COMP-1',
    competencyName: 'AI Utilization & Critical Evaluation',
    nature: 'SYNTHESIZED_FINDING',
    confidence: 'HIGH_CONFIDENCE',
    timestamp: 'T+04:45',
    observedBehavior: 'Candidate immediately identified that the AI suggestion using Object.assign would destroy nested structures, actively writing tests to expose the flaw.',
    interpretation: 'Shows high resistance to automation bias. The engineer validates AI suggestions against domain constraints.',
    supportingData: [
      'Prompt log T+04:45 followed by test case creation at T+07:30',
      'No blind paste of shallow copy utility into production handler',
    ],
    counterEvidence: [
      'Initial candidate implementation still had partial recursion gap before first test execution',
    ],
    coverageWeight: 15,
    relatedTimelineEventIds: ['EVT-02', 'EVT-03'],
  },
  {
    id: 'EV-103',
    title: 'Systematic Root-Cause Debugging via Telemetry',
    competencyId: 'COMP-2',
    competencyName: 'Debugging Efficiency & Root Cause Analysis',
    nature: 'OBSERVED_EVENT',
    confidence: 'CORROBORATED_FACT',
    timestamp: 'T+14:00',
    observedBehavior: 'Upon TC-03 and TC-04 test failure, candidate instrumented key traversal and inspected intermediate JSON state within 2.5 minutes.',
    interpretation: 'Fast mean-time-to-root-cause (MTTR). Avoided random code churning; targeted recursive condition logic directly.',
    supportingData: [
      'Terminal logs captured selective console inspection of typeof target[key]',
      'Targeted fix submitted in a single diff block without secondary regressions',
    ],
    coverageWeight: 25,
    relatedTimelineEventIds: ['EVT-04', 'EVT-05'],
  },
  {
    id: 'EV-104',
    title: 'Proactive Prototype Pollution Vulnerability Mitigation',
    competencyId: 'COMP-3',
    competencyName: 'Defensive Programming & Security',
    nature: 'OBSERVED_EVENT',
    confidence: 'CORROBORATED_FACT',
    timestamp: 'T+18:22',
    observedBehavior: 'Candidate explicitly introduced DISALLOWED_KEYS set covering __proto__, constructor, and prototype with O(1) Set lookup.',
    interpretation: 'Strong enterprise security awareness. Protects against object prototype poisoning in public PATCH endpoints.',
    supportingData: [
      'Commit diff file: preferencesHandler.ts L12-L17',
      'TC-04 test passed with malicious payload validation',
    ],
    coverageWeight: 20,
    relatedTimelineEventIds: ['EVT-06'],
  },
  {
    id: 'EV-105',
    title: 'High Test Boundary Coverage & Green Build Verification',
    competencyId: 'COMP-4',
    competencyName: 'Verification Rigor & Testing',
    nature: 'OBSERVED_EVENT',
    confidence: 'CORROBORATED_FACT',
    timestamp: 'T+22:40',
    observedBehavior: 'All 5 core assessment test suites passed cleanly with 0 assertion errors in 64ms simulated execution time.',
    interpretation: 'Candidate writes production-ready, testable code meeting 100% of defined acceptance criteria.',
    supportingData: [
      'Execution log for Test Run #2 recorded 5/5 passed suites',
      'Zero unhandled rejections or runtime exceptions in runner',
    ],
    coverageWeight: 10,
    relatedTimelineEventIds: ['EVT-07'],
  },
  {
    id: 'EV-106',
    title: 'Self-Directed Edge-Case Discovery (Immutability Invariant)',
    competencyId: 'COMP-4',
    competencyName: 'Verification Rigor & Testing',
    nature: 'SYNTHESIZED_FINDING',
    confidence: 'HIGH_CONFIDENCE',
    timestamp: 'T+26:05',
    observedBehavior: 'Candidate wrote an additional test TC-06 verifying that current object was not mutated in-place by reference.',
    interpretation: 'Demonstrates exceptional engineering maturity by verifying unstated but critical system invariants.',
    supportingData: [
      'Test file diff shows addition of TC-06 test block',
      'Implementation uses defensive deep clone before recursive mutation',
    ],
    coverageWeight: 10,
    relatedTimelineEventIds: ['EVT-08'],
  },
];

export const mockCompetencies: CompetencyMetric[] = [
  {
    id: 'COMP-1',
    name: 'AI Utilization & Critical Evaluation',
    score: 4.8,
    maxScore: 5.0,
    summary: 'Directs AI with precise architectural queries and critically vets generated suggestions before integration.',
    evidenceItemsCount: 2,
    level: 'Exemplary',
    signals: [
      'Rejected naive Object.assign suggestion without prompt degradation',
      'Formulated focused queries around Boolean falsy edge cases',
      'Zero hallucination leakage into production code',
    ],
  },
  {
    id: 'COMP-2',
    name: 'Debugging Efficiency & Root Cause Analysis',
    score: 4.9,
    maxScore: 5.0,
    summary: 'Rapid hypothesis formation and isolation of recursion bugs without shotgun debugging.',
    evidenceItemsCount: 2,
    level: 'Exemplary',
    signals: [
      'Resolved failed test suite within 3 minutes of discovery',
      'Instrumented targeted inspection points rather than indiscriminate logging',
      'No cyclical regressions introduced during fixes',
    ],
  },
  {
    id: 'COMP-3',
    name: 'Defensive Programming & Security',
    score: 4.6,
    maxScore: 5.0,
    summary: 'Consistently incorporates boundary defenses, type discrimination, and prototype pollution hardening.',
    evidenceItemsCount: 1,
    level: 'Proficient',
    signals: [
      'Implemented Set-based prototype pollution filter',
      'Strict undefined comparison guarding against false coercion',
      'Defensive immutability isolation applied',
    ],
  },
  {
    id: 'COMP-4',
    name: 'Verification Rigor & Testing',
    score: 4.7,
    maxScore: 5.0,
    summary: 'Creates robust test suites and validates edge cases beyond bare minimum acceptance criteria.',
    evidenceItemsCount: 2,
    level: 'Exemplary',
    signals: [
      'Authored self-directed immutability invariant test (TC-06)',
      '100% acceptance criteria verified via reproducible assertions',
      'Clean separation between test suites and implementation',
    ],
  },
  {
    id: 'COMP-5',
    name: 'Idiomatic Code Architecture',
    score: 4.5,
    maxScore: 5.0,
    summary: 'Clean TypeScript typing, predictable mutation tracking, and clear separation of concerns.',
    evidenceItemsCount: 1,
    level: 'Proficient',
    signals: [
      'Consistent immutable return payload signature',
      'Explicit mutation audit trail generation',
      'Clean recursion termination semantics',
    ],
  },
];

export const mockReviewerReport: ReviewerReportData = {
  session: mockSession,
  executiveSummary: 'Candidate Alex Mercer demonstrated exemplary senior engineering capabilities throughout the 45-minute assessment. Rather than relying blindly on AI-generated snippets, Mercer used the AI assistant as a sounding board, spotted a dangerous shallow-merge flaw in the AI response, and implemented a robust recursive patch engine with explicit boolean false handling and prototype pollution guards.',
  competencies: mockCompetencies,
  strengths: [
    {
      title: 'High AI Critical Literacy',
      description: 'Candidate did not accept AI code blindly; caught the nested object obliteration flaw in the AI response and engineered a custom recursive solver.',
      evidenceId: 'EV-102',
    },
    {
      title: 'Rapid Root-Cause Analysis',
      description: 'Diagnosed failed nested test within 180 seconds using surgical inspection, resolving it cleanly on the first subsequent commit.',
      evidenceId: 'EV-103',
    },
    {
      title: 'Proactive Security & Edge Testing',
      description: 'Introduced prototype pollution defense (EV-104) and self-authored an immutability invariant test suite (EV-106).',
      evidenceId: 'EV-104',
    },
  ],
  improvementAreas: [
    {
      title: 'Initial Commit Breadth',
      description: 'The first code draft attempted to solve both top-level and recursive concerns simultaneously before running unit tests, resulting in an initial test failure.',
      evidenceId: 'EV-103',
    },
    {
      title: 'Audit Trail Granularity',
      description: 'While top-level and primitive mutations are tracked in auditTrail, array element reordering semantics could be made more explicit.',
      evidenceId: 'EV-105',
    },
  ],
  testOutcomes: {
    total: 6,
    passed: 6,
    failed: 0,
    coveragePct: 98.4,
  },
  limitationsNotice: 'This report reflects candidate telemetry and evidence collected inside a sandboxed assessment environment. Architectural system design at enterprise distributed scale was evaluated independently in technical interview round 2.',
};

export const defaultReviewerNotes: ReviewerNotes = {
  reviewerName: 'Marcus Vance, Principal Infrastructure Architect',
  notes: 'Alex is one of the strongest candidates we have evaluated through ProofLoop. Notice especially Evidence EV-102: when the AI suggested Object.assign, Alex immediately recognized that it would overwrite nested privacy toggles and wrote tests proving the limitation. Strong recommendation to advance to team alignment round.',
  recommendation: 'STRONG_HIRE',
  status: 'APPROVED',
  lastSaved: '2026-10-15 14:32:00',
};

export const initialFeedbackList: FeedbackEntry[] = [
  {
    id: 'FB-01',
    authorRole: 'reviewer',
    ratingRealism: 5,
    ratingAIUtility: 5,
    ratingClarity: 5,
    ratingOverall: 5,
    comments: 'The Verification Loop timeline makes it completely obvious whether an engineer understands what the AI is doing or is just guessing. Connecting findings directly to Evidence IDs cuts interview calibration time in half.',
    email: 'marcus.v@acme-systems.io',
    timestamp: '2026-10-15 15:10:00',
  },
  {
    id: 'FB-02',
    authorRole: 'candidate',
    ratingRealism: 5,
    ratingAIUtility: 4,
    ratingClarity: 5,
    ratingOverall: 5,
    comments: 'Best technical assessment I have taken. It feels like real daily work instead of reverse-engineering binary search trees on a whiteboard. Having the contextual assistant and test runner right in the workspace made the workflow seamless.',
    email: 'alex.mercer.dev@gmail.com',
    timestamp: '2026-10-15 15:45:00',
  },
];
