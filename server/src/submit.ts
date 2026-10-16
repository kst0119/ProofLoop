/**
 * Final Submission — Milestone 6
 *
 * Handles the end-to-end submission flow:
 * 1. Validates the session and code.
 * 2. Runs all tests (visible + hidden) through Judge0.
 * 3. Atomically transitions session ACTIVE → SUBMITTED.
 * 4. Records trusted evidence events for the submission.
 *
 * Concurrency safety:
 * - Uses a conditional UPDATE (WHERE status = 'ACTIVE') so that only one
 *   concurrent submission wins the race. The loser gets a 409.
 * - The DB transaction for status + closedAt update is separate from the
 *   Judge0 network call (never holds a TX open during remote I/O).
 *
 * Reliability:
 * - Judge0 failure → 503, session stays ACTIVE, no false results stored.
 * - Evidence write failure after successful Judge0 run → throws with detail;
 *   the submission response is NOT sent until evidence is persisted.
 * - Duplicate request (already SUBMITTED) → 409 immediately, no re-execution.
 *
 * Security:
 * - Hidden tests (H-01, H-02, H-03) are executed server-side only.
 * - Hidden inputs, expected values, and the reference solution are NEVER
 *   returned in the candidate-facing response.
 * - Candidate-supplied pass/fail values are never trusted.
 * - Code snapshot stored in evidence is truncated to 4KB to limit storage;
 *   full code is NOT echoed in the public response.
 */

import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "./db";
import {
  executeCandidateCode,
  Judge0UnavailableError,
  Judge0TimeoutError,
  MAX_CODE_SIZE_BYTES,
} from "./judge";
import { SHOPPING_CART_TESTS, SHOPPING_CART_TASK } from "./task";
import { appendSystemEvent } from "./evidence";

// ── Constants ──────────────────────────────────────────────────────────────────

export { MAX_CODE_SIZE_BYTES };

/** Maximum code snapshot stored in evidence payload (4KB). */
const CODE_SNAPSHOT_MAX_CHARS = 4000;

// ── Error classes ──────────────────────────────────────────────────────────────

export class SubmissionSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = "SubmissionSessionNotFoundError";
  }
}

export class SubmissionAlreadyFinalizedError extends Error {
  constructor(status: string) {
    super(`Session cannot be submitted (current status: ${status})`);
    this.name = "SubmissionAlreadyFinalizedError";
  }
}

export class SubmissionInfrastructureError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SubmissionInfrastructureError";
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface SubmissionResult {
  sessionId: string;
  status: "SUBMITTED";
  passed: number;
  total: number;
  visible: {
    passed: number;
    total: number;
    results: Array<{
      testId: string;
      passed: boolean;
      actual: number | null;
    }>;
  };
  hidden: {
    passed: number;
    total: number;
    /** Hidden inputs and expected values are NEVER included here. */
  };
  submittedAt: string;
}

export interface SubmitOptions {
  sessionId: string;
  code: string;
  fetchFn?: typeof fetch;
  db?: PrismaClient;
}

// ── Implementation ─────────────────────────────────────────────────────────────

/**
 * Processes a final assessment submission.
 *
 * Call order (nothing is held in a DB transaction during Judge0 I/O):
 * 1. Fetch and validate session (must exist and be ACTIVE).
 * 2. Record `submission_received` evidence.
 * 3. Execute ALL tests through Judge0 (outside any DB transaction).
 * 4. Atomic conditional UPDATE: session → SUBMITTED only if still ACTIVE.
 *    If another concurrent request already submitted → 409.
 * 5. Record `submission_evaluated` evidence (skipStatusCheck = true).
 */
export async function submitAssessment(options: SubmitOptions): Promise<SubmissionResult> {
  const { sessionId, code, fetchFn, db } = options;
  const dbClient = db || defaultPrisma;

  // ── 1. Validate session ────────────────────────────────────────────────────
  const session = await dbClient.assessmentSession.findUnique({
    where: { id: sessionId },
  });

  if (!session) {
    throw new SubmissionSessionNotFoundError(sessionId);
  }

  if (session.status !== "ACTIVE") {
    throw new SubmissionAlreadyFinalizedError(session.status);
  }

  // ── 2. Record submission_received evidence ─────────────────────────────────
  await appendSystemEvent(
    {
      sessionId,
      eventType: "submission_received",
      actor: "system",
      payload: {
        codeLength: Buffer.byteLength(code, "utf8"),
        taskVersion: session.taskVersion,
      },
    },
    dbClient,
  );

  // ── 3. Execute all tests through Judge0 (outside DB transaction) ───────────
  const allTests = SHOPPING_CART_TESTS; // visible + hidden
  let outcome;
  try {
    outcome = await executeCandidateCode({
      code,
      tests: allTests,
      fetchFn,
    });
  } catch (err) {
    // Judge0 failure: session stays ACTIVE; candidate can retry
    if (err instanceof Judge0UnavailableError || err instanceof Judge0TimeoutError) {
      throw new SubmissionInfrastructureError(
        err instanceof Judge0TimeoutError
          ? "Code execution timed out. Please try again."
          : "Code execution service is unavailable. Please try again later.",
      );
    }
    throw err;
  }

  // ── 4. Atomic conditional status transition ────────────────────────────────
  const submittedAt = new Date();

  // Use updateMany with a WHERE status = ACTIVE condition so concurrent
  // duplicates cannot both finalize. count = 0 means someone else won.
  const updateResult = await dbClient.assessmentSession.updateMany({
    where: { id: sessionId, status: "ACTIVE" },
    data: { status: "SUBMITTED", closedAt: submittedAt },
  });

  if (updateResult.count === 0) {
    // Another concurrent submission already finalized the session.
    throw new SubmissionAlreadyFinalizedError("SUBMITTED");
  }

  // ── 5. Record submission_evaluated evidence ────────────────────────────────
  const visibleResults = outcome.results.filter((r) =>
    SHOPPING_CART_TESTS.some((t) => t.id === r.testId && t.set === "visible"),
  );
  const hiddenResults = outcome.results.filter((r) =>
    SHOPPING_CART_TESTS.some((t) => t.id === r.testId && t.set === "hidden"),
  );

  const visiblePassed = visibleResults.filter((r) => r.passed).length;
  const hiddenPassed = hiddenResults.filter((r) => r.passed).length;
  const totalPassed = outcome.passed;

  // Store a bounded code snapshot (never echo raw code to candidate response)
  const codeSnapshot =
    code.length > CODE_SNAPSHOT_MAX_CHARS
      ? code.slice(0, CODE_SNAPSHOT_MAX_CHARS) + "…[truncated]"
      : code;

  // Evidence write must succeed; if it throws, the caller gets an error.
  // The session is already SUBMITTED at this point. This is a known limitation:
  // the session is finalized but the evidence record may be missing.
  // In production, use a durable message queue or saga pattern to retry.
  await appendSystemEvent(
    {
      sessionId,
      eventType: "submission_evaluated",
      actor: "test_runner",
      skipStatusCheck: true, // session is now SUBMITTED
      payload: {
        totalPassed,
        totalTests: outcome.total,
        visiblePassed,
        visibleTotal: visibleResults.length,
        hiddenPassed,
        hiddenTotal: hiddenResults.length,
        taskVersion: session.taskVersion,
        submittedAt: submittedAt.toISOString(),
        codeSnapshot,
        // Hidden test IDs, inputs, expected values are NOT stored in this payload.
        // Only aggregate counts are stored to limit exposure.
      },
    },
    dbClient,
  );

  // ── 6. Build candidate-safe response ──────────────────────────────────────
  // Visible test details are included (candidate already knew these tests).
  // Hidden test IDs, inputs, expected values, and per-result details are excluded.
  return {
    sessionId,
    status: "SUBMITTED",
    passed: totalPassed,
    total: outcome.total,
    visible: {
      passed: visiblePassed,
      total: visibleResults.length,
      results: visibleResults.map((r) => ({
        testId: r.testId,
        passed: r.passed,
        actual: r.actual,
      })),
    },
    hidden: {
      passed: hiddenPassed,
      total: hiddenResults.length,
      // No per-test detail, no inputs, no expected values
    },
    submittedAt: submittedAt.toISOString(),
  };
}
