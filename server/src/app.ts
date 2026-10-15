import express, { Express } from "express";
import cors from "cors";
import { getCandidateTask, SHOPPING_CART_TESTS } from "./task";
import { createSession, getSessionById, isValidUuid } from "./session";
import {
  executeCandidateCode,
  Judge0UnavailableError,
  Judge0TimeoutError,
  MAX_CODE_SIZE_BYTES,
} from "./judge";
import type { PrismaClient } from "@prisma/client";

function sanitizeLogMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
      .replace(/:\/\/([^:@]+):([^@]+)@/g, "://$1:***@")
      .replace(/(password|secret|pwd)=[^&\s]+/gi, "$1=***");
  }
  return "Unknown error";
}

export function createApp(
  db?: Pick<PrismaClient, "assessmentSession">,
  fetchFn?: typeof fetch,
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

  return app;
}

export const app = createApp();
