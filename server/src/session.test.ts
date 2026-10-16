import { test, before, after } from "node:test";
import { equal, ok } from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { app, createApp } from "./app";
import { prisma } from "./db";
import { UUID_REGEX } from "./session";

let server: Server;
let baseUrl: string;
const createdSessionIds: string[] = [];

before(async () => {
  await new Promise<void>((resolve) => {
    server = app.listen(0, () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  // Clean up only the sessions created during these tests
  for (const id of createdSessionIds) {
    try {
      await prisma.assessmentSession.delete({ where: { id } });
    } catch {
      // Ignore cleanup error if already deleted
    }
  }

  await prisma.$disconnect();

  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test("POST /api/sessions creates session with 201, valid UUID, and ACTIVE status", async () => {
  const res = await fetch(`${baseUrl}/api/sessions`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  equal(res.status, 201);
  const data = await res.json();

  // 1 & 2. Returned session UUID validity
  ok(typeof data.sessionId === "string");
  ok(UUID_REGEX.test(data.sessionId), `Invalid UUID: ${data.sessionId}`);
  createdSessionIds.push(data.sessionId);

  // 4. Default ACTIVE status and defaults
  equal(data.status, "ACTIVE");
  equal(data.timeLimitMinutes, 60);
  ok(!isNaN(Date.parse(data.startedAt)));

  // 5. Task response contains visible tests only
  ok(data.task);
  equal(data.task.id, "shopping-cart-total");
  equal(data.task.version, "shopping-cart-v1.0");
  equal(data.task.language, "javascript");
  equal(Array.isArray(data.task.visibleTests), true);
  equal(data.task.visibleTests.length, 3);

  for (const t of data.task.visibleTests) {
    ok(t.id.startsWith("V-"));
    equal("set" in t, false);
    ok(Array.isArray(t.input));
    equal(typeof t.expected, "number");
  }

  // 6. Hidden tests, challenge internals, and reference solutions are not exposed
  equal("hiddenTests" in data.task, false);
  equal("flawedSuggestion" in data.task, false);
  equal("triggerTestId" in data.task, false);
  equal("referenceCalculateCartTotal" in data, false);
  equal("rubricVersion" in data, false);
  equal("challengeVersion" in data, false);

  // 3. Session persistence in PostgreSQL
  const dbRecord = await prisma.assessmentSession.findUnique({
    where: { id: data.sessionId },
  });
  ok(dbRecord, "Session record must be persisted in PostgreSQL");
  equal(dbRecord.id, data.sessionId);
  equal(dbRecord.status, "ACTIVE");
  equal(dbRecord.timeLimitMinutes, 60);
});

test("GET /api/sessions/:id retrieves an existing session with HTTP 200", async () => {
  // First create a session
  const createRes = await fetch(`${baseUrl}/api/sessions`, { method: "POST" });
  equal(createRes.status, 201);
  const created = await createRes.json();
  createdSessionIds.push(created.sessionId);

  // 7. Fetching an existing session
  const getRes = await fetch(`${baseUrl}/api/sessions/${created.sessionId}`);
  equal(getRes.status, 200);
  const fetched = await getRes.json();

  equal(fetched.sessionId, created.sessionId);
  equal(fetched.status, "ACTIVE");
  equal(fetched.timeLimitMinutes, 60);
  equal(fetched.startedAt, created.startedAt);
  equal(fetched.closedAt, null);

  // Candidate-safe task data
  equal(fetched.task.id, "shopping-cart-total");
  equal(fetched.task.visibleTests.length, 3);
  equal("hiddenTests" in fetched.task, false);
  equal("evidenceEvents" in fetched, false);
  equal("challengeVersion" in fetched, false);
});

test("GET /api/sessions/:id returns 400 for malformed session ID", async () => {
  // 8. Invalid session ID returns 400
  const malformedIds = ["123", "not-a-uuid", "xyz-123-abc", "12345678-1234-1234-1234"];

  for (const id of malformedIds) {
    const res = await fetch(`${baseUrl}/api/sessions/${id}`);
    equal(res.status, 400, `Expected 400 for malformed ID: ${id}`);
    const data = await res.json();
    ok(data.error && data.error.includes("Invalid session ID"));
  }
});

test("GET /api/sessions/:id returns 404 for unknown valid UUID", async () => {
  // 9. Unknown valid UUID returns 404
  const unknownUuid = "00000000-0000-4000-8000-000000000000";
  const res = await fetch(`${baseUrl}/api/sessions/${unknownUuid}`);
  equal(res.status, 404);
  const data = await res.json();
  equal(data.error, "Session not found");
});

test("POST /api/sessions produces safe 500 error on database failure without leaking secrets", async () => {
  // 10. Database failure handling on POST
  const secretString = "supersecretpassword123";
  const mockFailingDb = {
    assessmentSession: {
      create: async () => {
        throw new Error(`Database connection failed: postgresql://admin:${secretString}@localhost:5432/db`);
      },
      findUnique: async () => null,
    },
  } as unknown as typeof prisma;

  const mockApp = createApp(mockFailingDb);
  const mockServer = mockApp.listen(0);
  const port = (mockServer.address() as AddressInfo).port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/sessions`, {
      method: "POST",
    });

    equal(res.status, 500);
    const data = await res.json();
    equal(data.error, "Failed to create assessment session");
    const jsonString = JSON.stringify(data);
    equal(jsonString.includes(secretString), false);
    equal(jsonString.includes("postgresql://"), false);
  } finally {
    await new Promise<void>((resolve, reject) => {
      mockServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test("GET /api/sessions/:id produces safe 500 error on database failure without leaking secrets", async () => {
  // 10. Database failure handling on GET
  const secretString = "confidential_db_error_detail";
  const mockFailingDb = {
    assessmentSession: {
      create: async () => {
        throw new Error("unreachable");
      },
      findUnique: async () => {
        throw new Error(`Internal DB failure with ${secretString}`);
      },
    },
  } as unknown as typeof prisma;

  const mockApp = createApp(mockFailingDb);
  const mockServer = mockApp.listen(0);
  const port = (mockServer.address() as AddressInfo).port;

  try {
    const validUuid = "11111111-1111-4111-8111-111111111111";
    const res = await fetch(`http://127.0.0.1:${port}/api/sessions/${validUuid}`);

    equal(res.status, 500);
    const data = await res.json();
    equal(data.error, "Failed to retrieve assessment session");
    const jsonString = JSON.stringify(data);
    equal(jsonString.includes(secretString), false);
  } finally {
    await new Promise<void>((resolve, reject) => {
      mockServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
});
