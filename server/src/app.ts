import express from "express";
import cors from "cors";
import { getCandidateTask } from "./task";

export const app = express();

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
