/**
 * Evidence Ledger — Milestone 5 Tests
 *
 * Covers:
 * - Unit tests for pure helper functions (validatePayload, parseClientTimestamp)
 * - appendEvent: happy path, validation, session state guards, duplicate sequence safety
 * - getSessionEvents: ordering, session-not-found guard
 * - HTTP API routes: POST /api/sessions/:id/events and GET /api/sessions/:id/events
 * - Security: payload size limit, candidate event-type restriction, supersedes logic
 */

import { describe, it, before, after, afterEach } from "node:test";
import assert from "node:assert/strict";
import {
  validatePayload,
  parseClientTimestamp,
  appendEvent,
  getSessionEvents,
  MAX_PAYLOAD_BYTES,
  MAX_EVENTS_PER_SESSION,
  EvidenceValidationError,
  EvidenceSessionNotFoundError,
  EvidenceSessionNotActiveError,
  EvidenceLimitError,
  CANDIDATE_ALLOWED_EVENT_TYPES,
} from "./evidence.js";
import { createApp } from "./app.js";
import type { Express } from "express";
import { randomUUID } from "node:crypto";

// ── Minimal in-memory mock DB ──────────────────────────────────────────────────

/**
 * We build a tiny in-memory Prisma-shaped mock so tests don't need a real PG instance.
 * The mock replicates the subset of Prisma behaviour that evidence.ts uses.
 */

interface MockSession {
  id: string;
  status: string;
  taskVersion: string;
  rubricVersion: string;
  challengeVersion: string | null;
}

interface MockEvent {
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
}

function buildMockDb(
  sessions: MockSession[],
  initialEvents: MockEvent[] = [],
): {
  assessmentSession: {
    findUnique: (args: { where: { id: string } }) => Promise<MockSession | null>;
  };
  evidenceEvent: {
    count: (args: { where: { sessionId: string } }) => Promise<number>;
    findFirst: (args: {
      where: { sessionId?: string; eventId?: string; supersedes?: string };
      orderBy?: { sequence: "asc" | "desc" };
      select?: { sequence?: boolean; eventId?: boolean; supersedes?: boolean };
    }) => Promise<MockEvent | null>;
    findMany: (args: {
      where: { sessionId: string };
      orderBy: { sequence: "asc" | "desc" };
    }) => Promise<MockEvent[]>;
    create: (args: { data: Omit<MockEvent, "serverTimestamp" | "eventId"> & { eventId?: string } }) => Promise<MockEvent>;
  };
  $transaction: <T>(fn: (tx: typeof txProxy) => Promise<T>) => Promise<T>;
} {
  const eventStore: MockEvent[] = [...initialEvents];

  type MockDb = ReturnType<typeof buildMockDb>;

  const txProxy = {
    assessmentSession: {
      async findUnique({ where }: { where: { id: string } }) {
        return sessions.find((s) => s.id === where.id) ?? null;
      },
    },
    evidenceEvent: {
      async count({ where }: { where: { sessionId: string } }) {
        return eventStore.filter((e) => e.sessionId === where.sessionId).length;
      },
      async findFirst(args: {
        where: { sessionId?: string; eventId?: string; supersedes?: string };
        orderBy?: { sequence: "asc" | "desc" };
        select?: { sequence?: boolean; eventId?: boolean; supersedes?: boolean };
      }) {
        let filtered = eventStore.filter((e) => {
          if (args.where.sessionId && e.sessionId !== args.where.sessionId) return false;
          if (args.where.eventId && e.eventId !== args.where.eventId) return false;
          if (args.where.supersedes && e.supersedes !== args.where.supersedes) return false;
          return true;
        });
        if (args.orderBy?.sequence === "desc") {
          filtered = filtered.slice().sort((a, b) => b.sequence - a.sequence);
        } else {
          filtered = filtered.slice().sort((a, b) => a.sequence - b.sequence);
        }
        return filtered[0] ?? null;
      },
      async findMany(args: {
        where: { sessionId: string };
        orderBy: { sequence: "asc" | "desc" };
      }) {
        return eventStore
          .filter((e) => e.sessionId === args.where.sessionId)
          .slice()
          .sort((a, b) =>
            args.orderBy.sequence === "asc"
              ? a.sequence - b.sequence
              : b.sequence - a.sequence,
          );
      },
      async create(args: {
        data: {
          sessionId: string;
          sequence: number;
          eventType: string;
          actor: string;
          clientTimestamp: Date | null;
          taskVersion: string;
          rubricVersion: string;
          challengeVersion: string | null;
          payload: unknown;
          source: string;
          supersedes: string | null;
        };
      }) {
        const ev: MockEvent = {
          eventId: randomUUID(),
          serverTimestamp: new Date(),
          ...args.data,
        };
        eventStore.push(ev);
        return ev;
      },
    },
    get $transaction() {
      return (fn: (tx: typeof txProxy) => Promise<unknown>) => fn(txProxy);
    },
  };

  return txProxy as unknown as ReturnType<typeof buildMockDb>;
}

// ── Unit tests: validatePayload ─────────────────────────────────────────────────

describe("validatePayload", () => {
  it("accepts a plain object", () => {
    assert.doesNotThrow(() => validatePayload({ action: "test", line: 42 }));
  });

  it("rejects null", () => {
    assert.throws(() => validatePayload(null), EvidenceValidationError);
  });

  it("rejects an array", () => {
    assert.throws(() => validatePayload([1, 2, 3]), EvidenceValidationError);
  });

  it("rejects a string primitive", () => {
    assert.throws(() => validatePayload("hello"), EvidenceValidationError);
  });

  it("rejects a number primitive", () => {
    assert.throws(() => validatePayload(42), EvidenceValidationError);
  });

  it("rejects a payload exceeding MAX_PAYLOAD_BYTES", () => {
    // Build a payload whose JSON is just over the limit
    const big = { data: "x".repeat(MAX_PAYLOAD_BYTES + 100) };
    assert.throws(() => validatePayload(big), EvidenceValidationError);
  });

  it("accepts a payload at exactly one byte under the limit", () => {
    // Build a payload close to the limit but within bounds
    const key = "data";
    // JSON overhead: {"data":"..."} = 10 chars
    const overhead = `{"${key}":""}`.length;
    const value = "x".repeat(MAX_PAYLOAD_BYTES - overhead);
    assert.doesNotThrow(() => validatePayload({ [key]: value }));
  });
});

// ── Unit tests: parseClientTimestamp ──────────────────────────────────────────

describe("parseClientTimestamp", () => {
  it("parses a valid ISO-8601 string", () => {
    const result = parseClientTimestamp("2026-10-15T12:00:00Z");
    assert.ok(result instanceof Date);
    assert.equal(result.getFullYear(), 2026);
  });

  it("returns null for null", () => {
    assert.equal(parseClientTimestamp(null), null);
  });

  it("returns null for undefined", () => {
    assert.equal(parseClientTimestamp(undefined), null);
  });

  it("returns null for an empty string", () => {
    assert.equal(parseClientTimestamp(""), null);
  });

  it("returns null for a non-date string", () => {
    assert.equal(parseClientTimestamp("not-a-date"), null);
  });
});

// ── Unit tests: CANDIDATE_ALLOWED_EVENT_TYPES ─────────────────────────────────

describe("CANDIDATE_ALLOWED_EVENT_TYPES", () => {
  it("contains the expected types", () => {
    assert.ok(CANDIDATE_ALLOWED_EVENT_TYPES.includes("code_edit"));
    assert.ok(CANDIDATE_ALLOWED_EVENT_TYPES.includes("test_run_requested"));
    assert.ok(CANDIDATE_ALLOWED_EVENT_TYPES.includes("ai_query"));
    assert.ok(CANDIDATE_ALLOWED_EVENT_TYPES.includes("session_note"));
  });

  it("does not include internal system types", () => {
    assert.ok(!(CANDIDATE_ALLOWED_EVENT_TYPES as readonly string[]).includes("run_result"));
    assert.ok(!(CANDIDATE_ALLOWED_EVENT_TYPES as readonly string[]).includes("ai_turn"));
  });
});

// ── appendEvent — service layer tests ─────────────────────────────────────────

describe("appendEvent", () => {
  const SESSION_ID = randomUUID();
  const CLOSED_SESSION_ID = randomUUID();

  const sessions: MockSession[] = [
    {
      id: SESSION_ID,
      status: "ACTIVE",
      taskVersion: "shopping-cart-v1.0",
      rubricVersion: "rubric-v1.0",
      challengeVersion: null,
    },
    {
      id: CLOSED_SESSION_ID,
      status: "SUBMITTED",
      taskVersion: "shopping-cart-v1.0",
      rubricVersion: "rubric-v1.0",
      challengeVersion: null,
    },
  ];

  it("appends a valid event and returns the view", async () => {
    const db = buildMockDb([...sessions]);
    const result = await appendEvent(
      {
        sessionId: SESSION_ID,
        eventType: "code_edit",
        actor: "candidate",
        payload: { code: "function f(){}" },
      },
      db as never,
    );

    assert.equal(result.sessionId, SESSION_ID);
    assert.equal(result.sequence, 1);
    assert.equal(result.eventType, "code_edit");
    assert.equal(result.actor, "candidate");
    assert.equal(result.source, "candidate_submitted");
    assert.ok(typeof result.eventId === "string");
    assert.ok(typeof result.serverTimestamp === "string");
  });

  it("increments sequence for subsequent events", async () => {
    const db = buildMockDb([...sessions]);
    const first = await appendEvent(
      { sessionId: SESSION_ID, eventType: "code_edit", actor: "candidate", payload: { v: 1 } },
      db as never,
    );
    const second = await appendEvent(
      { sessionId: SESSION_ID, eventType: "code_edit", actor: "candidate", payload: { v: 2 } },
      db as never,
    );
    assert.equal(first.sequence, 1);
    assert.equal(second.sequence, 2);
  });

  it("preserves a valid clientTimestamp", async () => {
    const db = buildMockDb([...sessions]);
    const ts = "2026-10-15T09:00:00.000Z";
    const result = await appendEvent(
      {
        sessionId: SESSION_ID,
        eventType: "code_edit",
        actor: "candidate",
        payload: {},
        clientTimestamp: ts,
      },
      db as never,
    );
    assert.ok(result.clientTimestamp !== null);
  });

  it("stores null for an invalid clientTimestamp", async () => {
    const db = buildMockDb([...sessions]);
    const result = await appendEvent(
      {
        sessionId: SESSION_ID,
        eventType: "code_edit",
        actor: "candidate",
        payload: {},
        clientTimestamp: "not-a-date",
      },
      db as never,
    );
    assert.equal(result.clientTimestamp, null);
  });

  it("throws EvidenceSessionNotFoundError for an unknown session", async () => {
    const db = buildMockDb([...sessions]);
    await assert.rejects(
      () =>
        appendEvent(
          { sessionId: randomUUID(), eventType: "code_edit", actor: "candidate", payload: {} },
          db as never,
        ),
      EvidenceSessionNotFoundError,
    );
  });

  it("throws EvidenceSessionNotActiveError for a non-ACTIVE session", async () => {
    const db = buildMockDb([...sessions]);
    await assert.rejects(
      () =>
        appendEvent(
          {
            sessionId: CLOSED_SESSION_ID,
            eventType: "code_edit",
            actor: "candidate",
            payload: {},
          },
          db as never,
        ),
      EvidenceSessionNotActiveError,
    );
  });

  it("throws EvidenceValidationError for an invalid payload", async () => {
    const db = buildMockDb([...sessions]);
    await assert.rejects(
      () =>
        appendEvent(
          { sessionId: SESSION_ID, eventType: "code_edit", actor: "candidate", payload: null },
          db as never,
        ),
      EvidenceValidationError,
    );
  });

  it("throws EvidenceLimitError when session has too many events", async () => {
    // Pre-populate MAX_EVENTS_PER_SESSION mock events
    const preEvents: MockEvent[] = Array.from({ length: MAX_EVENTS_PER_SESSION }, (_, i) => ({
      eventId: randomUUID(),
      sessionId: SESSION_ID,
      sequence: i + 1,
      eventType: "code_edit",
      actor: "candidate",
      clientTimestamp: null,
      serverTimestamp: new Date(),
      taskVersion: "shopping-cart-v1.0",
      rubricVersion: "rubric-v1.0",
      challengeVersion: null,
      payload: {},
      source: "candidate_submitted",
      supersedes: null,
    }));
    const db = buildMockDb([...sessions], preEvents);
    await assert.rejects(
      () =>
        appendEvent(
          { sessionId: SESSION_ID, eventType: "code_edit", actor: "candidate", payload: {} },
          db as never,
        ),
      EvidenceLimitError,
    );
  });

  it("records supersedes when valid", async () => {
    const db = buildMockDb([...sessions]);
    const first = await appendEvent(
      { sessionId: SESSION_ID, eventType: "code_edit", actor: "candidate", payload: { v: 1 } },
      db as never,
    );
    const second = await appendEvent(
      {
        sessionId: SESSION_ID,
        eventType: "code_edit",
        actor: "candidate",
        payload: { v: 2 },
        supersedes: first.eventId,
      },
      db as never,
    );
    assert.equal(second.supersedes, first.eventId);
  });

  it("throws EvidenceValidationError when supersedes event does not belong to session", async () => {
    const db = buildMockDb([...sessions]);
    await assert.rejects(
      () =>
        appendEvent(
          {
            sessionId: SESSION_ID,
            eventType: "code_edit",
            actor: "candidate",
            payload: {},
            supersedes: randomUUID(), // unknown UUID
          },
          db as never,
        ),
      EvidenceValidationError,
    );
  });

  it("throws EvidenceValidationError when supersedes event is already superseded", async () => {
    const db = buildMockDb([...sessions]);
    const e1 = await appendEvent(
      { sessionId: SESSION_ID, eventType: "code_edit", actor: "candidate", payload: { v: 1 } },
      db as never,
    );
    // Supersede e1 once
    await appendEvent(
      {
        sessionId: SESSION_ID,
        eventType: "code_edit",
        actor: "candidate",
        payload: { v: 2 },
        supersedes: e1.eventId,
      },
      db as never,
    );
    // Attempt to supersede e1 again — should fail
    await assert.rejects(
      () =>
        appendEvent(
          {
            sessionId: SESSION_ID,
            eventType: "code_edit",
            actor: "candidate",
            payload: { v: 3 },
            supersedes: e1.eventId,
          },
          db as never,
        ),
      EvidenceValidationError,
    );
  });
});

// ── getSessionEvents — service layer tests ────────────────────────────────────

describe("getSessionEvents", () => {
  const SESSION_ID = randomUUID();

  const sessions: MockSession[] = [
    {
      id: SESSION_ID,
      status: "ACTIVE",
      taskVersion: "shopping-cart-v1.0",
      rubricVersion: "rubric-v1.0",
      challengeVersion: null,
    },
  ];

  it("returns events in ascending sequence order", async () => {
    const db = buildMockDb([...sessions]);
    await appendEvent(
      { sessionId: SESSION_ID, eventType: "code_edit", actor: "candidate", payload: { v: 1 } },
      db as never,
    );
    await appendEvent(
      { sessionId: SESSION_ID, eventType: "ai_query", actor: "candidate", payload: { v: 2 } },
      db as never,
    );
    await appendEvent(
      { sessionId: SESSION_ID, eventType: "session_note", actor: "candidate", payload: { v: 3 } },
      db as never,
    );

    const events = await getSessionEvents(SESSION_ID, db as never);
    assert.equal(events.length, 3);
    assert.equal(events[0].sequence, 1);
    assert.equal(events[1].sequence, 2);
    assert.equal(events[2].sequence, 3);
  });

  it("returns empty array for a session with no events", async () => {
    const db = buildMockDb([...sessions]);
    const events = await getSessionEvents(SESSION_ID, db as never);
    assert.deepEqual(events, []);
  });

  it("throws EvidenceSessionNotFoundError for an unknown session", async () => {
    const db = buildMockDb([...sessions]);
    await assert.rejects(
      () => getSessionEvents(randomUUID(), db as never),
      EvidenceSessionNotFoundError,
    );
  });
});

// ── HTTP API integration tests ─────────────────────────────────────────────────

async function httpRequest(
  app: Express,
  method: string,
  path: string,
  body?: unknown,
): Promise<{ status: number; body: unknown }> {
  const { createServer } = await import("node:http");
  return new Promise((resolve, reject) => {
    const server = createServer(app);
    server.listen(0, () => {
      const address = server.address() as { port: number };
      const port = address.port;
      const url = `http://localhost:${port}${path}`;
      const payload = body !== undefined ? JSON.stringify(body) : undefined;
      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };
      const req = (method === "GET" ? global.fetch : global.fetch)(url, {
        method,
        headers,
        body: payload,
      });
      req
        .then(async (res) => {
          const json = await res.json();
          server.close();
          resolve({ status: res.status, body: json });
        })
        .catch((err) => {
          server.close();
          reject(err);
        });
    });
  });
}

describe("POST /api/sessions/:id/events", () => {
  const SESSION_ID = randomUUID();
  const INACTIVE_SESSION_ID = randomUUID();

  function makeApp() {
    const sessions: MockSession[] = [
      {
        id: SESSION_ID,
        status: "ACTIVE",
        taskVersion: "shopping-cart-v1.0",
        rubricVersion: "rubric-v1.0",
        challengeVersion: null,
      },
      {
        id: INACTIVE_SESSION_ID,
        status: "SUBMITTED",
        taskVersion: "shopping-cart-v1.0",
        rubricVersion: "rubric-v1.0",
        challengeVersion: null,
      },
    ];
    const db = buildMockDb([...sessions]);
    // createApp accepts the db client and ai mode override
    return createApp(db as never, undefined, undefined, "mock");
  }

  it("returns 201 with event details on success", async () => {
    const app = makeApp();
    const { status, body } = await httpRequest(app, "POST", `/api/sessions/${SESSION_ID}/events`, {
      eventType: "code_edit",
      actor: "candidate",
      payload: { line: 5, change: "added reduce" },
    });
    assert.equal(status, 201);
    const b = body as Record<string, unknown>;
    assert.equal(b.sessionId, SESSION_ID);
    assert.equal(b.sequence, 1);
    assert.equal(b.eventType, "code_edit");
    assert.ok(typeof b.eventId === "string");
    assert.ok(typeof b.serverTimestamp === "string");
  });

  it("returns 400 for malformed session UUID", async () => {
    const app = makeApp();
    const { status, body } = await httpRequest(
      app,
      "POST",
      "/api/sessions/not-a-uuid/events",
      { eventType: "code_edit", actor: "candidate", payload: {} },
    );
    assert.equal(status, 400);
    assert.match((body as { error: string }).error, /Invalid session ID/);
  });

  it("returns 400 when eventType is missing", async () => {
    const app = makeApp();
    const { status } = await httpRequest(app, "POST", `/api/sessions/${SESSION_ID}/events`, {
      actor: "candidate",
      payload: {},
    });
    assert.equal(status, 400);
  });

  it("returns 400 when actor is missing", async () => {
    const app = makeApp();
    const { status } = await httpRequest(app, "POST", `/api/sessions/${SESSION_ID}/events`, {
      eventType: "code_edit",
      payload: {},
    });
    assert.equal(status, 400);
  });

  it("returns 400 when payload is not an object", async () => {
    const app = makeApp();
    const { status } = await httpRequest(app, "POST", `/api/sessions/${SESSION_ID}/events`, {
      eventType: "code_edit",
      actor: "candidate",
      payload: "not-an-object",
    });
    assert.equal(status, 400);
  });

  it("returns 400 when payload is an array", async () => {
    const app = makeApp();
    const { status } = await httpRequest(app, "POST", `/api/sessions/${SESSION_ID}/events`, {
      eventType: "code_edit",
      actor: "candidate",
      payload: [1, 2, 3],
    });
    assert.equal(status, 400);
  });

  it("returns 400 for an internal-only event type from candidate", async () => {
    const app = makeApp();
    const { status, body } = await httpRequest(
      app,
      "POST",
      `/api/sessions/${SESSION_ID}/events`,
      { eventType: "run_result", actor: "candidate", payload: {} },
    );
    assert.equal(status, 400);
    assert.match((body as { error: string }).error, /event type/i);
  });

  it("returns 400 for an invalid actor", async () => {
    const app = makeApp();
    const { status } = await httpRequest(app, "POST", `/api/sessions/${SESSION_ID}/events`, {
      eventType: "code_edit",
      actor: "hacker",
      payload: {},
    });
    assert.equal(status, 400);
  });

  it("returns 404 for an unknown session", async () => {
    const app = makeApp();
    const { status } = await httpRequest(
      app,
      "POST",
      `/api/sessions/${randomUUID()}/events`,
      { eventType: "code_edit", actor: "candidate", payload: {} },
    );
    assert.equal(status, 404);
  });

  it("returns 409 when session is not ACTIVE", async () => {
    const app = makeApp();
    const { status } = await httpRequest(
      app,
      "POST",
      `/api/sessions/${INACTIVE_SESSION_ID}/events`,
      { eventType: "code_edit", actor: "candidate", payload: {} },
    );
    assert.equal(status, 409);
  });
});

describe("GET /api/sessions/:id/events", () => {
  const SESSION_ID = randomUUID();

  function makeApp(preEvents: MockEvent[] = []) {
    const sessions: MockSession[] = [
      {
        id: SESSION_ID,
        status: "ACTIVE",
        taskVersion: "shopping-cart-v1.0",
        rubricVersion: "rubric-v1.0",
        challengeVersion: null,
      },
    ];
    const db = buildMockDb([...sessions], preEvents);
    return createApp(db as never, undefined, undefined, "mock");
  }

  it("returns 200 with empty array when no events", async () => {
    const app = makeApp();
    const { status, body } = await httpRequest(
      app,
      "GET",
      `/api/sessions/${SESSION_ID}/events`,
    );
    assert.equal(status, 200);
    const b = body as { sessionId: string; events: unknown[] };
    assert.equal(b.sessionId, SESSION_ID);
    assert.deepEqual(b.events, []);
  });

  it("returns 200 with events in sequence order", async () => {
    // Pre-populate events in reverse order; expect asc in response
    const preEvents: MockEvent[] = [
      {
        eventId: randomUUID(),
        sessionId: SESSION_ID,
        sequence: 2,
        eventType: "ai_query",
        actor: "candidate",
        clientTimestamp: null,
        serverTimestamp: new Date(),
        taskVersion: "shopping-cart-v1.0",
        rubricVersion: "rubric-v1.0",
        challengeVersion: null,
        payload: { q: "help" },
        source: "candidate_submitted",
        supersedes: null,
      },
      {
        eventId: randomUUID(),
        sessionId: SESSION_ID,
        sequence: 1,
        eventType: "code_edit",
        actor: "candidate",
        clientTimestamp: null,
        serverTimestamp: new Date(),
        taskVersion: "shopping-cart-v1.0",
        rubricVersion: "rubric-v1.0",
        challengeVersion: null,
        payload: { v: 1 },
        source: "candidate_submitted",
        supersedes: null,
      },
    ];
    const app = makeApp(preEvents);
    const { status, body } = await httpRequest(
      app,
      "GET",
      `/api/sessions/${SESSION_ID}/events`,
    );
    assert.equal(status, 200);
    const b = body as { events: Array<{ sequence: number }> };
    assert.equal(b.events.length, 2);
    assert.equal(b.events[0].sequence, 1);
    assert.equal(b.events[1].sequence, 2);
  });

  it("returns 400 for malformed session UUID", async () => {
    const app = makeApp();
    const { status } = await httpRequest(app, "GET", "/api/sessions/bad-uuid/events");
    assert.equal(status, 400);
  });

  it("returns 404 for unknown session UUID", async () => {
    const app = makeApp();
    const { status } = await httpRequest(app, "GET", `/api/sessions/${randomUUID()}/events`);
    assert.equal(status, 404);
  });
});

describe("Evidence Ledger security: internal fields not leaked", () => {
  const SESSION_ID = randomUUID();

  it("response never includes hidden test data or system prompt", async () => {
    const sessions: MockSession[] = [
      {
        id: SESSION_ID,
        status: "ACTIVE",
        taskVersion: "shopping-cart-v1.0",
        rubricVersion: "rubric-v1.0",
        challengeVersion: null,
      },
    ];
    const db = buildMockDb([...sessions]);
    const app = createApp(db as never, undefined, undefined, "mock");
    const { body } = await httpRequest(app, "POST", `/api/sessions/${SESSION_ID}/events`, {
      eventType: "code_edit",
      actor: "candidate",
      payload: { attempt: 1 },
    });
    const raw = JSON.stringify(body);
    // Must not contain hidden fixture IDs or reference solution marker
    assert.ok(!raw.includes("H-01"), "H-01 must not be exposed");
    assert.ok(!raw.includes("H-02"), "H-02 must not be exposed");
    assert.ok(!raw.includes("H-03"), "H-03 must not be exposed");
    assert.ok(!raw.includes("referenceCalculateCartTotal"), "Reference fn must not be exposed");
  });
});
