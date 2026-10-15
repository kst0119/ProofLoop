import express, { Express } from "express";
import cors from "cors";
import { getCandidateTask, SHOPPING_CART_TESTS, CONTROLLED_AI_CHALLENGE } from "./task";
import { createSession, getSessionById, isValidUuid } from "./session";
import { prisma } from "./db";
import {
  executeCandidateCode,
  Judge0UnavailableError,
  Judge0TimeoutError,
  MAX_CODE_SIZE_BYTES,
} from "./judge";
import {
  generateAiCoachReply,
  checkSessionRateLimit,
  AiProviderError,
  AiRateLimitError,
  MAX_MESSAGE_LENGTH,
  MAX_CODE_LENGTH_BYTES,
} from "./aiCoach";
import {
  appendEvent,
  getSessionEvents,
  CANDIDATE_ALLOWED_EVENT_TYPES,
  EvidenceValidationError,
  EvidenceSessionNotFoundError,
  EvidenceSessionNotActiveError,
  EvidenceLimitError,
} from "./evidence";
import type { PrismaClient } from "@prisma/client";
import type { OpenAI } from "openai";

function sanitizeLogMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
      .replace(/:\/\/([^:@]+):([^@]+)@/g, "://$1:***@")
      .replace(/(password|secret|pwd|api[_-]?key)=[^&\s]+/gi, "$1=***");
  }
  return "Unknown error";
}

export function createApp(
  db?: Pick<PrismaClient, "assessmentSession">,
  fetchFn?: typeof fetch,
  openAiClient?: OpenAI,
  aiModeOverride?: "real" | "mock",
): Express {
  const app = express();

  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({
      status: "ok",
      service: "ProofLoop API",
    });
  });

  app.get("/", (_req, res) => {
    res.json({
      message: "Welcome to ProofLoop!",
      description: "AI-Powered Coding Assessment Platform",
      status: "Backend Running",
      version: "1.0.0",
    });
  });

  app.get("/api/tasks/current", (_req, res) => {
    res.json(getCandidateTask());
  });

  app.post("/api/sessions", async (_req, res) => {
    try {
      const session = await createSession(db);
      res.status(201).json(session);
    } catch (error) {
      console.error("[Session Error] Failed to create session:", sanitizeLogMessage(error));
      res.status(500).json({ error: "Failed to create assessment session" });
    }
  });

  app.get("/api/sessions/:id", async (req, res) => {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      res.status(400).json({ error: "Invalid session ID format. Must be a valid UUID." });
      return;
    }

    try {
      const session = await getSessionById(id, db);
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      res.status(200).json(session);
    } catch (error) {
      console.error("[Session Error] Failed to retrieve session:", sanitizeLogMessage(error));
      res.status(500).json({ error: "Failed to retrieve assessment session" });
    }
  });

  app.post("/api/sessions/:id/run", async (req, res) => {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      res.status(400).json({ error: "Invalid session ID format. Must be a valid UUID." });
      return;
    }

    const { code } = req.body || {};

    if (typeof code !== "string" || code.trim().length === 0) {
      res.status(400).json({ error: "Candidate code is required" });
      return;
    }

    if (Buffer.byteLength(code, "utf8") > MAX_CODE_SIZE_BYTES) {
      res.status(400).json({
        error: `Submitted code exceeds maximum size limit of ${MAX_CODE_SIZE_BYTES / 1024}KB`,
      });
      return;
    }

    try {
      const session = await getSessionById(id, db);
      if (!session) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      if (session.status !== "ACTIVE") {
        res.status(409).json({
          error: `Session is not active (current status: ${session.status})`,
        });
        return;
      }

      const visibleTests = SHOPPING_CART_TESTS.filter((t) => t.set === "visible");

      const outcome = await executeCandidateCode({
        code,
        tests: visibleTests,
        fetchFn,
      });

      res.status(200).json({
        sessionId: session.sessionId,
        passed: outcome.passed,
        total: outcome.total,
        results: outcome.results,
      });
    } catch (error) {
      if (error instanceof Judge0UnavailableError || error instanceof Judge0TimeoutError) {
        console.error("[Judge0 Service Error]:", sanitizeLogMessage(error));
        res.status(503).json({
          error: "Code execution service is temporarily unavailable. Please try again later.",
        });
        return;
      }

      console.error("[Execution Error]:", sanitizeLogMessage(error));
      res.status(500).json({ error: "Failed to execute code" });
    }
  });

  app.post("/api/sessions/:id/ai", async (req, res) => {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      res.status(400).json({ error: "Invalid session ID format. Must be a valid UUID." });
      return;
    }

    // Security check: Candidate-supplied trigger fields are strictly rejected
    if (req.body && req.body.triggerChallenge !== undefined) {
      res.status(400).json({
        error: "Invalid request: candidate-supplied challenge triggers are not permitted",
      });
      return;
    }

    const { message, code } = req.body || {};

    if (typeof message !== "string" || message.trim().length === 0) {
      res.status(400).json({ error: "Message is required" });
      return;
    }

    if (message.length > MAX_MESSAGE_LENGTH) {
      res.status(400).json({
        error: `Message exceeds maximum allowed length of ${MAX_MESSAGE_LENGTH} characters`,
      });
      return;
    }

    if (code !== undefined && code !== null) {
      if (typeof code !== "string") {
        res.status(400).json({ error: "Code must be a string if provided" });
        return;
      }
      if (Buffer.byteLength(code, "utf8") > MAX_CODE_LENGTH_BYTES) {
        res.status(400).json({
          error: `Submitted code exceeds maximum size limit of ${MAX_CODE_LENGTH_BYTES / 1024}KB`,
        });
        return;
      }
    }

    try {
      const dbClient = db || prisma;
      const internalSession = await dbClient.assessmentSession.findUnique({
        where: { id },
      });

      if (!internalSession) {
        res.status(404).json({ error: "Session not found" });
        return;
      }

      if (internalSession.status !== "ACTIVE") {
        res.status(409).json({
          error: `Session is not active (current status: ${internalSession.status})`,
        });
        return;
      }

      // Check session rate limiting
      try {
        checkSessionRateLimit(id);
      } catch (rateErr) {
        if (rateErr instanceof AiRateLimitError) {
          res.status(429).json({ error: rateErr.message });
          return;
        }
        throw rateErr;
      }

      // Controlled challenge is governed strictly by server-side session policy in DB
      const serverControlledChallenge =
        internalSession.challengeVersion === CONTROLLED_AI_CHALLENGE.version
          ? CONTROLLED_AI_CHALLENGE.id
          : undefined;

      const outcome = await generateAiCoachReply({
        request: {
          sessionId: id,
          message: message.trim(),
          code: typeof code === "string" ? code : "",
          serverControlledChallenge,
        },
        openAiClient,
        modeOverride: aiModeOverride,
      });

      res.status(200).json({
        sessionId: outcome.sessionId,
        reply: outcome.reply,
        allowed: outcome.allowed,
      });
    } catch (error) {
      if (error instanceof AiProviderError) {
        console.error("[AI Coach Provider Error]:", sanitizeLogMessage(error));
        res.status(error.statusCode).json({ error: error.message });
        return;
      }

      console.error("[AI Coach Error]:", sanitizeLogMessage(error));
      res.status(500).json({ error: "Failed to generate AI Coach response" });
    }
  });

  // ── Evidence Ledger ───────────────────────────────────────────────────────────

  /**
   * POST /api/sessions/:id/events
   * Append a candidate evidence event to the ledger.
   *
   * Body: { eventType, actor, payload, clientTimestamp?, supersedes? }
   *
   * Security:
   * - Only allow-listed event types may be submitted via this public route.
   * - The `source` field is always forced to `candidate_submitted` server-side.
   * - Payload size is capped; payload must be a plain JSON object.
   */
  app.post("/api/sessions/:id/events", async (req, res) => {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      res.status(400).json({ error: "Invalid session ID format. Must be a valid UUID." });
      return;
    }

    const { eventType, actor, payload, clientTimestamp, supersedes } = req.body || {};

    // Validate required string fields
    if (typeof eventType !== "string" || eventType.trim().length === 0) {
      res.status(400).json({ error: "eventType is required and must be a non-empty string" });
      return;
    }

    // Enforce candidate event type allowlist to prevent spoofing of internal event types
    if (!(CANDIDATE_ALLOWED_EVENT_TYPES as readonly string[]).includes(eventType)) {
      res.status(400).json({
        error: `Invalid event type '${eventType}'. Allowed candidate event types: ${CANDIDATE_ALLOWED_EVENT_TYPES.join(", ")}.`,
      });
      return;
    }

    // Validate actor
    const ALLOWED_ACTORS = ["candidate", "ai_assistant", "test_runner", "system"] as const;
    if (typeof actor !== "string" || !(ALLOWED_ACTORS as readonly string[]).includes(actor)) {
      res.status(400).json({
        error: `Invalid actor '${actor}'. Must be one of: ${ALLOWED_ACTORS.join(", ")}.`,
      });
      return;
    }

    // Validate payload is a plain object (not null, array, or primitive)
    if (payload === null || payload === undefined || typeof payload !== "object" || Array.isArray(payload)) {
      res.status(400).json({ error: "payload must be a plain JSON object" });
      return;
    }

    // Optional: validate supersedes is a UUID string if provided
    if (supersedes !== undefined && supersedes !== null && !isValidUuid(supersedes)) {
      res.status(400).json({ error: "supersedes must be a valid UUID if provided" });
      return;
    }

    try {
      const event = await appendEvent(
        {
          sessionId: id,
          eventType,
          actor: actor as "candidate" | "ai_assistant" | "test_runner" | "system",
          payload,
          clientTimestamp: typeof clientTimestamp === "string" ? clientTimestamp : null,
          supersedes: typeof supersedes === "string" ? supersedes : null,
        },
        db as never,
      );
      res.status(201).json(event);
    } catch (error) {
      if (error instanceof EvidenceSessionNotFoundError) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      if (error instanceof EvidenceSessionNotActiveError) {
        res.status(409).json({ error: error.message });
        return;
      }
      if (error instanceof EvidenceLimitError) {
        res.status(429).json({ error: error.message });
        return;
      }
      if (error instanceof EvidenceValidationError) {
        res.status(400).json({ error: error.message });
        return;
      }
      console.error("[Evidence Error] Failed to append event:", sanitizeLogMessage(error));
      res.status(500).json({ error: "Failed to record evidence event" });
    }
  });

  /**
   * GET /api/sessions/:id/events
   * Retrieve all evidence events for the session in ascending sequence order.
   * Hidden test data, reference solutions, and internal config are never included.
   */
  app.get("/api/sessions/:id/events", async (req, res) => {
    const { id } = req.params;

    if (!isValidUuid(id)) {
      res.status(400).json({ error: "Invalid session ID format. Must be a valid UUID." });
      return;
    }

    try {
      const events = await getSessionEvents(id, db as never);
      res.status(200).json({ sessionId: id, events });
    } catch (error) {
      if (error instanceof EvidenceSessionNotFoundError) {
        res.status(404).json({ error: "Session not found" });
        return;
      }
      console.error("[Evidence Error] Failed to retrieve events:", sanitizeLogMessage(error));
      res.status(500).json({ error: "Failed to retrieve evidence events" });
    }
  });

  return app;
}

export const app = createApp();
