-- CreateEnum
CREATE TYPE "SessionStatus" AS ENUM ('ACTIVE', 'SUBMITTED', 'EXPIRED', 'CLOSED');

-- CreateEnum
CREATE TYPE "EvidenceActor" AS ENUM ('candidate', 'ai_assistant', 'test_runner', 'system');

-- CreateEnum
CREATE TYPE "EvidenceSource" AS ENUM ('system_generated', 'candidate_submitted');

-- CreateTable
CREATE TABLE "assessment_sessions" (
    "id" UUID NOT NULL,
    "status" "SessionStatus" NOT NULL DEFAULT 'ACTIVE',
    "task_version" TEXT NOT NULL DEFAULT 'shopping-cart-v1.0',
    "rubric_version" TEXT NOT NULL DEFAULT 'rubric-v1.0',
    "challenge_version" TEXT,
    "time_limit_minutes" INTEGER NOT NULL DEFAULT 60,
    "started_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "closed_at" TIMESTAMPTZ(6),

    CONSTRAINT "assessment_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "evidence_events" (
    "event_id" UUID NOT NULL,
    "session_id" UUID NOT NULL,
    "sequence" INTEGER NOT NULL,
    "event_type" TEXT NOT NULL,
    "actor" "EvidenceActor" NOT NULL,
    "client_timestamp" TIMESTAMPTZ(6),
    "server_timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "task_version" TEXT NOT NULL,
    "rubric_version" TEXT NOT NULL,
    "challenge_version" TEXT,
    "payload" JSONB NOT NULL,
    "source" "EvidenceSource" NOT NULL,
    "supersedes" UUID,

    CONSTRAINT "evidence_events_pkey" PRIMARY KEY ("event_id")
);

-- CreateIndex
CREATE INDEX "evidence_events_session_id_server_timestamp_idx" ON "evidence_events"("session_id", "server_timestamp");

-- CreateIndex
CREATE UNIQUE INDEX "evidence_events_session_id_sequence_key" ON "evidence_events"("session_id", "sequence");

-- AddForeignKey
ALTER TABLE "evidence_events" ADD CONSTRAINT "evidence_events_session_id_fkey" FOREIGN KEY ("session_id") REFERENCES "assessment_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "evidence_events" ADD CONSTRAINT "evidence_events_supersedes_fkey" FOREIGN KEY ("supersedes") REFERENCES "evidence_events"("event_id") ON DELETE RESTRICT ON UPDATE CASCADE;
