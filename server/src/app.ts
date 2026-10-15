import express, { Express } from "express";
import cors from "cors";
import { getCandidateTask } from "./task";
import { createSession, getSessionById, isValidUuid } from "./session";
import type { PrismaClient } from "@prisma/client";

function sanitizeLogMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message
      .replace(/:\/\/([^:@]+):([^@]+)@/g, "://$1:***@")
      .replace(/(password|secret|pwd)=[^&\s]+/gi, "$1=***");
  }
  return "Unknown error";
}

export function createApp(db?: Pick<PrismaClient, "assessmentSession">): Express {
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

  return app;
}

export const app = createApp();
