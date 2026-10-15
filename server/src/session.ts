import { prisma } from "./db";
import { getCandidateTask, CandidateTaskResponse } from "./task";
import type { PrismaClient } from "@prisma/client";

export const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUuid(id: string): boolean {
  return typeof id === "string" && UUID_REGEX.test(id);
}

export interface CandidateSessionView {
  sessionId: string;
  status: string;
  task: CandidateTaskResponse;
  timeLimitMinutes: number;
  startedAt: string;
  closedAt?: string | null;
}

/**
 * Creates a new assessment session in PostgreSQL with default settings.
 * Returns only candidate-safe metadata and task information.
 */
export async function createSession(
  db: Pick<PrismaClient, "assessmentSession"> = prisma,
): Promise<CandidateSessionView> {
  const session = await db.assessmentSession.create({
    data: {},
  });

  return {
    sessionId: session.id,
    status: session.status,
    task: getCandidateTask(),
    timeLimitMinutes: session.timeLimitMinutes,
    startedAt: session.startedAt.toISOString(),
  };
}

/**
 * Retrieves an existing assessment session by ID.
 * Returns null if the session does not exist.
 * Returns only candidate-safe metadata, strictly excluding private evidence
 * events, challenge internals, and reference solutions.
 */
export async function getSessionById(
  id: string,
  db: Pick<PrismaClient, "assessmentSession"> = prisma,
): Promise<CandidateSessionView | null> {
  const session = await db.assessmentSession.findUnique({
    where: { id },
  });

  if (!session) {
    return null;
  }

  return {
    sessionId: session.id,
    status: session.status,
    task: getCandidateTask(),
    timeLimitMinutes: session.timeLimitMinutes,
    startedAt: session.startedAt.toISOString(),
    closedAt: session.closedAt ? session.closedAt.toISOString() : null,
  };
}
