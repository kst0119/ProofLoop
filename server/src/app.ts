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

  return app;
}

export const app = createApp();
