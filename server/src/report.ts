/**
 * Engineering Evidence Report — Milestone 6
 *
 * Generates a structured, deterministic assessment report from PostgreSQL
 * EvidenceEvent records and session metadata.
 *
 * Design principles:
 * - All metrics are calculated from trusted `system_generated` events only.
 * - Candidate-submitted events are listed in the timeline but never used to
 *   compute correctness scores (those come from `submission_evaluated`).
 * - Hidden test inputs, expected values, reference solutions, and AI system
 *   prompts are NEVER included in the report output.
 * - Observations are conservative and evidence-backed; "Insufficient evidence"
 *   is used when records are missing rather than assuming negative behavior.
 * - Mock/simulated AI responses are clearly labeled; never presented as genuine.
 *
 * SECURITY NOTE:
 * The report endpoint is currently unprotected beyond knowing the session UUID.
 * Before any public or production deployment:
 * - Add authentication (e.g. JWT) to verify the caller's identity.
 * - Add authorization so only the session owner or authorized recruiters can read.
 * - Consider redacting code snapshots from candidate-facing reports.
 * - Consider rate-limiting report generation.
 */

import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "./db";
import { EvidenceSessionNotFoundError } from "./evidence";

// ── Types ──────────────────────────────────────────────────────────────────────

export interface ReportTimelineEntry {
  sequence: number;
  eventType: string;
  serverTimestamp: string;
  actor: string;
  source: string;
  summary: string;
}

export interface ReportCorrectness {
  totalTests: number;
  passed: number;
  failed: number;
  passPercentage: number;
  visible: { passed: number; total: number };
  hidden: { passed: number; total: number };
}

export interface ReportAiCollaboration {
  aiRequestCount: number;
  aiResponseDeliveredCount: number;
  providerBreakdown: {
    mock: number;
    real: number;
    controlledChallenge: number;
    unknown: number;
  };
  controlledChallengeDelivered: boolean;
}

export interface ReportVerificationBehavior {
  codeRunCount: number;
  successfulRuns: number;
  failedRuns: number;
  codeCheckpoints: number;
  observations: string[];
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
  correctness: ReportCorrectness | null;
  aiCollaboration: ReportAiCollaboration;
  verificationBehavior: ReportVerificationBehavior;
  timeline: ReportTimelineEntry[];
  interpretation: string[];
  /**
   * Security disclaimer included in every report response to remind integrators
   * that this endpoint requires authentication before public deployment.
   */
  _securityNotice: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/** Produces a concise, redacted summary for the report timeline. */
function summariseEvent(eventType: string, payload: unknown, source: string): string {
  const p = (payload ?? {}) as Record<string, unknown>;

  switch (eventType) {
    case "session_created":
      return "Assessment session started.";

    case "run_requested":
      return "Candidate requested a test run (visible tests only).";

    case "run_completed": {
      const passed = p.passed ?? "?";
      const total = p.total ?? "?";
      return `Test run completed: ${passed}/${total} tests passed.`;
    }

    case "run_failed":
      return `Test run failed: ${String(p.reason ?? "infrastructure error").slice(0, 80)}.`;

    case "ai_requested":
      return "Candidate sent an AI Coach query.";

    case "ai_response_delivered": {
      const provider = p.provider as string | undefined;
      if (provider === "mock") return "AI Coach response delivered (simulated/mock response).";
      if (provider === "controlled-challenge")
        return "Controlled AI challenge suggestion delivered (server-initiated).";
      if (provider === "openai") return "AI Coach response delivered (real OpenAI response).";
      return "AI Coach response delivered.";
    }

    case "ai_challenge_delivered":
      return "Controlled AI challenge suggestion delivered.";

    case "submission_received":
      return "Final submission received by server.";

    case "submission_evaluated": {
      const tp = p.totalPassed ?? "?";
      const tt = p.totalTests ?? "?";
      return `Final evaluation complete: ${tp}/${tt} tests passed (visible + hidden).`;
    }

    // Candidate-submitted events
    case "code_edit":
      return source === "candidate_submitted" ? "Candidate edited their code." : "Code edit recorded.";

    case "test_run_requested":
      return "Candidate requested a test run.";

    case "ai_query":
      return "Candidate submitted an AI Coach query.";

    case "session_note":
      return "Candidate recorded a session note.";

    default:
      return `Event: ${eventType}.`;
  }
}

// ── Main report function ───────────────────────────────────────────────────────

/**
 * Generates the full engineering evidence report for a session.
 *
 * @throws EvidenceSessionNotFoundError — if the session does not exist
 */
export async function generateReport(
  sessionId: string,
  db?: PrismaClient,
): Promise<AssessmentReport> {
  const dbClient = db || defaultPrisma;

  // Fetch session
  const session = await dbClient.assessmentSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new EvidenceSessionNotFoundError(sessionId);
  }

  // Fetch all events in sequence order
  const events = await dbClient.evidenceEvent.findMany({
    where: { sessionId },
    orderBy: { sequence: "asc" },
  });

  // ── A. Assessment Metadata ─────────────────────────────────────────────────
  const submittedAtStr = session.closedAt ? session.closedAt.toISOString() : null;
  const durationSeconds = session.closedAt
    ? Math.round((session.closedAt.getTime() - session.startedAt.getTime()) / 1000)
    : null;

  // ── B. Correctness ─────────────────────────────────────────────────────────
  // Derived exclusively from the trusted `submission_evaluated` system event.
  // Never derived from candidate-submitted events.
  const evalEvent = events
    .filter((e) => e.eventType === "submission_evaluated" && e.source === "SYSTEM_GENERATED")
    .slice(-1)[0]; // Use the last one if somehow multiple exist

  let correctness: ReportCorrectness | null = null;
  if (evalEvent) {
    const p = (evalEvent.payload ?? {}) as Record<string, unknown>;
    const totalTests = Number(p.totalTests ?? 0);
    const passed = Number(p.totalPassed ?? 0);
    const visiblePassed = Number(p.visiblePassed ?? 0);
    const visibleTotal = Number(p.visibleTotal ?? 0);
    const hiddenPassed = Number(p.hiddenPassed ?? 0);
    const hiddenTotal = Number(p.hiddenTotal ?? 0);
    correctness = {
      totalTests,
      passed,
      failed: totalTests - passed,
      passPercentage: totalTests > 0 ? Math.round((passed / totalTests) * 100) : 0,
      visible: { passed: visiblePassed, total: visibleTotal },
      hidden: { passed: hiddenPassed, total: hiddenTotal },
    };
  }

  // ── C. AI Collaboration ────────────────────────────────────────────────────
  const aiRequestEvents = events.filter(
    (e) => e.eventType === "ai_requested" && e.source === "SYSTEM_GENERATED",
  );
  const aiResponseEvents = events.filter(
    (e) =>
      (e.eventType === "ai_response_delivered" || e.eventType === "ai_challenge_delivered") &&
      e.source === "SYSTEM_GENERATED",
  );

  const providerBreakdown = { mock: 0, real: 0, controlledChallenge: 0, unknown: 0 };
  for (const ev of aiResponseEvents) {
    const p = (ev.payload ?? {}) as Record<string, unknown>;
    const provider = String(p.provider ?? "unknown");
    if (provider === "mock") providerBreakdown.mock++;
    else if (provider === "openai") providerBreakdown.real++;
    else if (provider === "controlled-challenge") providerBreakdown.controlledChallenge++;
    else providerBreakdown.unknown++;
  }

  const controlledChallengeDelivered = aiResponseEvents.some((e) => {
    const p = (e.payload ?? {}) as Record<string, unknown>;
    return p.isControlledChallenge === true || p.provider === "controlled-challenge";
  });

  const aiCollaboration: ReportAiCollaboration = {
    aiRequestCount: aiRequestEvents.length,
    aiResponseDeliveredCount: aiResponseEvents.length,
    providerBreakdown,
    controlledChallengeDelivered,
  };

  // ── D. Verification Behavior ───────────────────────────────────────────────
  const runCompletedEvents = events.filter(
    (e) => e.eventType === "run_completed" && e.source === "SYSTEM_GENERATED",
  );
  const runFailedEvents = events.filter(
    (e) => e.eventType === "run_failed" && e.source === "SYSTEM_GENERATED",
  );
  const runRequestedEvents = events.filter(
    (e) => e.eventType === "run_requested" && e.source === "SYSTEM_GENERATED",
  );
  const codeEditEvents = events.filter(
    (e) => e.eventType === "code_edit" && e.source === "CANDIDATE_SUBMITTED",
  );

  const totalRunCount = runRequestedEvents.length;
  const observations: string[] = [];

  // Evidence-backed observations only
  if (runCompletedEvents.length === 0) {
    observations.push("Insufficient evidence: no observed test runs before submission.");
  } else {
    const passCounts = runCompletedEvents
      .map((e) => {
        const p = (e.payload ?? {}) as Record<string, unknown>;
        return Number(p.passed ?? 0);
      })
      .filter((n) => !isNaN(n));

    if (passCounts.length >= 2) {
      const first = passCounts[0];
      const last = passCounts[passCounts.length - 1];
      const total = ((runCompletedEvents[0].payload ?? {}) as Record<string, unknown>).total ?? "?";
      if (last > first) {
        observations.push(
          `Candidate improved from ${first}/${total} to ${last}/${total} visible tests passing across ${runCompletedEvents.length} observed runs.`,
        );
      } else if (last === first) {
        observations.push(
          `Candidate maintained ${last}/${total} passing visible tests across ${runCompletedEvents.length} runs.`,
        );
      }
    }

    if (runCompletedEvents.length >= 3) {
      observations.push(
        `Observed ${runCompletedEvents.length} test runs, indicating active iterative testing behavior.`,
      );
    }
  }

  if (controlledChallengeDelivered && evalEvent) {
    const p = (evalEvent.payload ?? {}) as Record<string, unknown>;
    const hiddenPassed = Number(p.hiddenPassed ?? 0);
    const hiddenTotal = Number(p.hiddenTotal ?? 0);
    if (hiddenPassed === hiddenTotal && hiddenTotal > 0) {
      observations.push(
        "A controlled AI challenge suggestion was delivered. Candidate's final submission passed all hidden tests. " +
        "Note: passing hidden tests alone does not confirm the candidate explicitly recognized or rejected the flawed suggestion.",
      );
    } else {
      observations.push(
        "A controlled AI challenge suggestion was delivered. Candidate's final submission did not pass all hidden tests.",
      );
    }
  }

  if (codeEditEvents.length > 0) {
    observations.push(`${codeEditEvents.length} candidate-submitted code checkpoint(s) recorded.`);
  }

  if (runFailedEvents.length > 0) {
    observations.push(
      `${runFailedEvents.length} test run(s) failed due to infrastructure issues (Judge0 unavailability or timeout).`,
    );
  }

  const verificationBehavior: ReportVerificationBehavior = {
    codeRunCount: totalRunCount,
    successfulRuns: runCompletedEvents.length,
    failedRuns: runFailedEvents.length,
    codeCheckpoints: codeEditEvents.length,
    observations,
  };

  // ── E. Evidence Timeline ───────────────────────────────────────────────────
  // Summarize each event; redact sensitive content (no raw code, no prompts).
  const timeline: ReportTimelineEntry[] = events.map((e) => ({
    sequence: e.sequence,
    eventType: e.eventType,
    serverTimestamp: e.serverTimestamp.toISOString(),
    actor: e.actor,
    source: e.source,
    summary: summariseEvent(e.eventType, e.payload, e.source),
  }));

  // ── F. Interpretation ─────────────────────────────────────────────────────
  const interpretation: string[] = [];

  if (!evalEvent) {
    interpretation.push(
      "No submission evaluation found. The session may not have been submitted yet, or evaluation evidence is missing.",
    );
  } else if (correctness) {
    if (correctness.passed === correctness.totalTests) {
      interpretation.push("All tests passed. Correctness requirement fully met.");
    } else if (correctness.passPercentage >= 50) {
      interpretation.push(
        `Partial correctness: ${correctness.passed}/${correctness.totalTests} tests passed (${correctness.passPercentage}%).`,
      );
    } else {
      interpretation.push(
        `Low correctness: ${correctness.passed}/${correctness.totalTests} tests passed (${correctness.passPercentage}%).`,
      );
    }
  }

  if (aiCollaboration.aiRequestCount === 0) {
    interpretation.push("No AI Coach interactions observed during the session.");
  } else {
    interpretation.push(
      `Candidate made ${aiCollaboration.aiRequestCount} AI Coach request(s); ${aiCollaboration.aiResponseDeliveredCount} response(s) delivered.`,
    );
    if (aiCollaboration.providerBreakdown.mock > 0) {
      interpretation.push(
        `Note: ${aiCollaboration.providerBreakdown.mock} response(s) were mock/simulated (not from a real AI provider).`,
      );
    }
  }

  return {
    sessionId,
    taskVersion: session.taskVersion,
    rubricVersion: session.rubricVersion,
    challengeVersion: session.challengeVersion,
    startedAt: session.startedAt.toISOString(),
    submittedAt: submittedAtStr,
    durationSeconds,
    finalStatus: session.status,
    correctness,
    aiCollaboration,
    verificationBehavior,
    timeline,
    interpretation,
    _securityNotice:
      "SECURITY: This report endpoint is unprotected for the MVP. " +
      "Authentication and authorization are required before public deployment. " +
      "Code snapshots and AI interactions may contain sensitive candidate data.",
  };
}
