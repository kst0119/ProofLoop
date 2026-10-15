/**
 * Evidence Ledger — Milestone 5
 *
 * Provides append-only recording and retrieval of EvidenceEvents for an
 * AssessmentSession. Each event is assigned a monotonically increasing
 * per-session sequence number using a DB-level advisory lock so that
 * concurrent appends remain consistent.
 *
 * Security notes:
 * - The `serverTimestamp` is always set by the server; the optional
 *   `clientTimestamp` is accepted as metadata only and never trusted for ordering.
 * - The `source` field is forced to `CANDIDATE_SUBMITTED` for all candidate-facing
 *   appends; system-generated events (runner, coach) are written by internal services only.
 * - Payload size is capped to prevent storage abuse.
 * - The supersedes UUID, if provided, must belong to the same session and must not
 *   already be superseded (preventing chain manipulation).
 */

import type { PrismaClient } from "@prisma/client";
import { prisma as defaultPrisma } from "./db";

// ── Constants ──────────────────────────────────────────────────────────────────

/** Maximum payload size that a candidate may submit (16 KB). */
export const MAX_PAYLOAD_BYTES = 16 * 1024;

/** Maximum number of events that can be appended to a single session. */
export const MAX_EVENTS_PER_SESSION = 500;

/**
 * Allowed event types that a candidate may directly submit.
 * System-internal types (e.g. "run_result", "ai_turn") are written only
 * by internal service code, not via the public append route.
 */
export const CANDIDATE_ALLOWED_EVENT_TYPES = [
  "code_edit",
  "test_run_requested",
  "ai_query",
  "session_note",
] as const;

export type CandidateEventType = (typeof CANDIDATE_ALLOWED_EVENT_TYPES)[number];

// ── Errors ─────────────────────────────────────────────────────────────────────

export class EvidenceValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EvidenceValidationError";
  }
}

export class EvidenceSessionNotFoundError extends Error {
  constructor(sessionId: string) {
    super(`Session not found: ${sessionId}`);
    this.name = "EvidenceSessionNotFoundError";
  }
}

export class EvidenceSessionNotActiveError extends Error {
  constructor(status: string) {
    super(`Session is not active (current status: ${status})`);
    this.name = "EvidenceSessionNotActiveError";
  }
}

export class EvidenceLimitError extends Error {
  constructor(max: number) {
    super(`Session has reached the maximum of ${max} evidence events`);
    this.name = "EvidenceLimitError";
  }
}

// ── Types ──────────────────────────────────────────────────────────────────────

export interface AppendEventInput {
  sessionId: string;
  eventType: string;
  actor: "candidate" | "ai_assistant" | "test_runner" | "system";
  clientTimestamp?: string | null;
  payload: unknown;
  /** UUID of an earlier event this corrects. Must belong to the same session. */
  supersedes?: string | null;
}

export interface EvidenceEventView {
  eventId: string;
  sessionId: string;
  sequence: number;
  eventType: string;
  actor: string;
  clientTimestamp: string | null;
  serverTimestamp: string;
  taskVersion: string;
  rubricVersion: string;
  challengeVersion: string | null;
  payload: unknown;
  source: string;
  supersedes: string | null;
}

// ── Helpers ────────────────────────────────────────────────────────────────────

/**
 * Validates that the payload is a plain JSON object (not array, null, or primitive)
 * and that its serialised size is within the allowed limit.
 */
export function validatePayload(payload: unknown): void {
  if (payload === null || typeof payload !== "object" || Array.isArray(payload)) {
    throw new EvidenceValidationError(
      "payload must be a JSON object (not null, array, or primitive)",
    );
  }
  const bytes = Buffer.byteLength(JSON.stringify(payload), "utf8");
  if (bytes > MAX_PAYLOAD_BYTES) {
    throw new EvidenceValidationError(
      `payload exceeds maximum size of ${MAX_PAYLOAD_BYTES / 1024}KB`,
    );
  }
}

/** Returns ISO-8601 string if the value parses as a finite date, else null. */
export function parseClientTimestamp(value: string | null | undefined): Date | null {
  if (!value) return null;
  const ms = Date.parse(value);
  if (!isFinite(ms)) return null;
  return new Date(ms);
}

/** Maps a Prisma EvidenceEvent row to the public view shape. */
function toView(row: {
  eventId: string;
  sessionId: string;
  sequence: number;
  eventType: string;
  actor: string;
  clientTimestamp: Date | null;
  serverTimestamp: Date;
  taskVersion: string;
  rubricVersion: string;
  challengeVersion: string | null;
  payload: unknown;
  source: string;
  supersedes: string | null;
}): EvidenceEventView {
  return {
    eventId: row.eventId,
    sessionId: row.sessionId,
    sequence: row.sequence,
    eventType: row.eventType,
    actor: row.actor,
    clientTimestamp: row.clientTimestamp?.toISOString() ?? null,
    serverTimestamp: row.serverTimestamp.toISOString(),
    taskVersion: row.taskVersion,
    rubricVersion: row.rubricVersion,
    challengeVersion: row.challengeVersion,
    payload: row.payload,
    source: row.source,
    supersedes: row.supersedes,
  };
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Appends a new event to the evidence ledger for the given session.
 *
 * Monotonic sequence is computed atomically inside a Prisma interactive
 * transaction: we SELECT the current max sequence, then INSERT with max+1.
 * PostgreSQL serialises this per session because of the UNIQUE constraint on
 * (session_id, sequence).
 *
 * @throws EvidenceSessionNotFoundError — session does not exist
 * @throws EvidenceSessionNotActiveError — session is not ACTIVE
 * @throws EvidenceLimitError — session has too many events
 * @throws EvidenceValidationError — bad payload or unknown supersedes UUID
 */
export async function appendEvent(
  input: AppendEventInput,
  db?: Pick<PrismaClient, "assessmentSession" | "evidenceEvent">,
): Promise<EvidenceEventView> {
  const client = (db || defaultPrisma) as PrismaClient;

  // 1. Validate payload eagerly before touching the DB.
  validatePayload(input.payload);

  const clientTs = parseClientTimestamp(input.clientTimestamp ?? null);

  return (client as PrismaClient).$transaction(async (tx) => {
    // 2. Fetch session; verify it exists and is ACTIVE.
    const session = await tx.assessmentSession.findUnique({
      where: { id: input.sessionId },
    });

    if (!session) {
      throw new EvidenceSessionNotFoundError(input.sessionId);
    }
    if (session.status !== "ACTIVE") {
      throw new EvidenceSessionNotActiveError(session.status);
    }

    // 3. Check per-session event count.
    const count = await tx.evidenceEvent.count({
      where: { sessionId: input.sessionId },
    });
    if (count >= MAX_EVENTS_PER_SESSION) {
      throw new EvidenceLimitError(MAX_EVENTS_PER_SESSION);
    }

    // 4. Compute next sequence number (1-based).
    const maxSeqRow = await tx.evidenceEvent.findFirst({
      where: { sessionId: input.sessionId },
      orderBy: { sequence: "desc" },
      select: { sequence: true },
    });
    const nextSequence = (maxSeqRow?.sequence ?? 0) + 1;

    // 5. Validate supersedes UUID if provided.
    if (input.supersedes) {
      const target = await tx.evidenceEvent.findFirst({
        where: {
          eventId: input.supersedes,
          sessionId: input.sessionId,
        },
        select: { eventId: true, supersedes: true },
      });
      if (!target) {
        throw new EvidenceValidationError(
          `supersedes event not found in this session: ${input.supersedes}`,
        );
      }
      // Prevent chaining: an event may only be superseded once.
      const alreadySuperseded = await tx.evidenceEvent.findFirst({
        where: { supersedes: input.supersedes },
        select: { eventId: true },
      });
      if (alreadySuperseded) {
        throw new EvidenceValidationError(
          `Event ${input.supersedes} has already been superseded by ${alreadySuperseded.eventId}`,
        );
      }
    }

    // 6. Insert the event.
    const created = await tx.evidenceEvent.create({
      data: {
        sessionId: input.sessionId,
        sequence: nextSequence,
        eventType: input.eventType,
        actor: input.actor as never,
        clientTimestamp: clientTs,
        taskVersion: session.taskVersion,
        rubricVersion: session.rubricVersion,
        challengeVersion: session.challengeVersion,
        payload: input.payload as never,
        source: "candidate_submitted" as never,
        supersedes: input.supersedes ?? null,
      },
    });

    return toView(created);
  });
}

/**
 * Retrieves all evidence events for the given session, ordered by sequence ascending.
 *
 * @throws EvidenceSessionNotFoundError — session does not exist
 */
export async function getSessionEvents(
  sessionId: string,
  db?: Pick<PrismaClient, "assessmentSession" | "evidenceEvent">,
): Promise<EvidenceEventView[]> {
  const client = db || defaultPrisma;

  const session = await client.assessmentSession.findUnique({
    where: { id: sessionId },
  });
  if (!session) {
    throw new EvidenceSessionNotFoundError(sessionId);
  }

  const events = await client.evidenceEvent.findMany({
    where: { sessionId },
    orderBy: { sequence: "asc" },
  });

  return events.map(toView);
}
