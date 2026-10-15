import { test, before, after } from "node:test";
import { equal, ok, deepEqual } from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import {
  buildTestHarness,
  parseJudge0Result,
  executeCandidateCode,
  Judge0UnavailableError,
  Judge0TimeoutError,
  Judge0ResultResponse,
} from "./judge";
import { createApp } from "./app";
import { prisma } from "./db";
import { SHOPPING_CART_TESTS } from "./task";

const visibleTests = SHOPPING_CART_TESTS.filter((t) => t.set === "visible");

test("buildTestHarness generates sandboxed wrapper with input cloning and sentinel output", () => {
  const sentinel = "__TEST_SENTINEL__";
  const candidateCode = "function calculateCartTotal(items) { return 42; }";
  const harness = buildTestHarness(candidateCode, visibleTests, sentinel);

  ok(harness.includes(candidateCode));
  ok(harness.includes(sentinel));
  ok(harness.includes("process.stdout.write = () => true"));
  ok(harness.includes("__JSON_parse(__JSON_stringify"));
  ok(harness.includes("calculateCartTotal"));
});

test("parseJudge0Result parses successful sentinel output correctly", () => {
  const sentinel = "__SENTINEL_ABC__";
  const mockPayload = [
    { testId: "V-01", passed: true, expected: 25, actual: 25 },
    { testId: "V-02", passed: true, expected: 15, actual: 15 },
    { testId: "V-03", passed: false, expected: 0.3, actual: 0.5 },
  ];

  const rawJudgeResult: Judge0ResultResponse = {
    stdout: `some random text\n${sentinel}${JSON.stringify(mockPayload)}${sentinel}\nextra text`,
    stderr: null,
    compile_output: null,
    message: null,
    time: "0.1",
    memory: 1000,
    status: { id: 3, description: "Accepted" },
    token: "mock-token",
  };

  const outcome = parseJudge0Result(rawJudgeResult, visibleTests, sentinel);
  equal(outcome.passed, 2);
  equal(outcome.total, 3);
  equal(outcome.results.length, 3);
  equal(outcome.results[0].passed, true);
  equal(outcome.results[1].passed, true);
  equal(outcome.results[2].passed, false);
});

test("parseJudge0Result handles compilation and syntax errors (status 6)", () => {
  const sentinel = "__SENTINEL_SYNTAX__";
  const rawJudgeResult: Judge0ResultResponse = {
    stdout: "",
    stderr: "SyntaxError: Unexpected identifier 'invalid'",
    compile_output: "SyntaxError: Unexpected identifier 'invalid'",
    message: null,
    time: null,
    memory: null,
    status: { id: 6, description: "Compilation Error" },
    token: "mock-token",
  };

  const outcome = parseJudge0Result(rawJudgeResult, visibleTests, sentinel);
  equal(outcome.passed, 0);
  equal(outcome.total, 3);
  ok(outcome.error && outcome.error.includes("Syntax error"));
  for (const r of outcome.results) {
    equal(r.passed, false);
    ok(r.error && r.error.includes("Syntax error"));
  }
});

test("parseJudge0Result handles timeout (status 5)", () => {
  const sentinel = "__SENTINEL_TIMEOUT__";
  const rawJudgeResult: Judge0ResultResponse = {
    stdout: "",
    stderr: null,
    compile_output: null,
    message: "Time Limit Exceeded",
    time: "5.0",
    memory: 2000,
    status: { id: 5, description: "Time Limit Exceeded" },
    token: "mock-token",
  };

  const outcome = parseJudge0Result(rawJudgeResult, visibleTests, sentinel);
  equal(outcome.passed, 0);
  equal(outcome.total, 3);
  equal(outcome.error, "Time limit exceeded");
  for (const r of outcome.results) {
    equal(r.passed, false);
    equal(r.error, "Time limit exceeded");
  }
});

test("executeCandidateCode executes successfully through mocked async Judge0 polling", async () => {
  let pollCount = 0;
  let capturedSentinel = "";

  const mockFetch: typeof fetch = async (url, init) => {
    const urlStr = String(url);

    // POST /submissions
    if (urlStr.includes("/submissions?") && init?.method === "POST") {
      const reqBody = JSON.parse(String(init?.body || "{}"));
      const match = /(__PROOF_LOOP_[a-f0-9]+__)/.exec(reqBody.source_code || "");
      if (match) capturedSentinel = match[1];

      return new Response(JSON.stringify({ token: "test-token-123" }), {
        status: 201,
        headers: { "Content-Type": "application/json" },
      });
    }

    // GET /submissions/:token
    if (urlStr.includes("/submissions/test-token-123")) {
      pollCount++;
      if (pollCount === 1) {
        return new Response(
          JSON.stringify({
            status: { id: 2, description: "Processing" },
            token: "test-token-123",
          }),
          { status: 200, headers: { "Content-Type": "application/json" } },
        );
      }

      const mockPayload = [
        { testId: "V-01", passed: true, expected: 25, actual: 25 },
        { testId: "V-02", passed: true, expected: 15, actual: 15 },
        { testId: "V-03", passed: true, expected: 0.3, actual: 0.3 },
      ];

      return new Response(
        JSON.stringify({
          stdout: `${capturedSentinel}${JSON.stringify(mockPayload)}${capturedSentinel}`,
          stderr: null,
          compile_output: null,
          message: null,
          status: { id: 3, description: "Accepted" },
          token: "test-token-123",
        }),
        { status: 200, headers: { "Content-Type": "application/json" } },
      );
    }

    throw new Error(`Unhandled mock URL: ${urlStr}`);
  };

  const outcome = await executeCandidateCode({
    code: "function calculateCartTotal(items) { return 0; }",
    tests: visibleTests,
    pollIntervalMs: 5,
    maxPollAttempts: 5,
    fetchFn: mockFetch,
  });

  equal(outcome.passed, 3);
  equal(outcome.total, 3);
  equal(pollCount, 2);
});

test("executeCandidateCode throws Judge0TimeoutError when polling attempts exceed limit", async () => {
  const mockAlwaysProcessingFetch: typeof fetch = async (url, init) => {
    if (init?.method === "POST") {
      return new Response(JSON.stringify({ token: "token-timeout" }), { status: 201 });
    }
    return new Response(
      JSON.stringify({ status: { id: 2, description: "Processing" }, token: "token-timeout" }),
      { status: 200 },
    );
  };

  let threw = false;
  try {
    await executeCandidateCode({
      code: "function calculateCartTotal() {}",
      tests: visibleTests,
      pollIntervalMs: 5,
      maxPollAttempts: 3,
      fetchFn: mockAlwaysProcessingFetch,
    });
  } catch (err) {
    threw = true;
    ok(err instanceof Judge0TimeoutError);
  }
  ok(threw, "Expected Judge0TimeoutError");
});

test("executeCandidateCode throws Judge0UnavailableError on network failure", async () => {
  const mockNetworkFailFetch: typeof fetch = async () => {
    throw new Error("connect ECONNREFUSED 127.0.0.1:2358");
  };

  let threw = false;
  try {
    await executeCandidateCode({
      code: "function calculateCartTotal() {}",
      tests: visibleTests,
      fetchFn: mockNetworkFailFetch,
    });
  } catch (err) {
    threw = true;
    ok(err instanceof Judge0UnavailableError);
  }
  ok(threw, "Expected Judge0UnavailableError");
});

// ==================== HTTP Route Integration Tests ====================

let server: Server;
let baseUrl: string;
let activeSessionId: string;
let closedSessionId: string;

let routeCapturedSentinel = "";

const mockSuccessFetch: typeof fetch = async (url, init) => {
  const urlStr = String(url);
  if (init?.method === "POST") {
    const reqBody = JSON.parse(String(init?.body || "{}"));
    const match = /(__PROOF_LOOP_[a-f0-9]+__)/.exec(reqBody.source_code || "");
    if (match) routeCapturedSentinel = match[1];

    return new Response(JSON.stringify({ token: "route-token" }), { status: 201 });
  }
  if (urlStr.includes("/submissions/route-token")) {
    const payload = [
      { testId: "V-01", passed: true, expected: 25, actual: 25 },
      { testId: "V-02", passed: true, expected: 15, actual: 15 },
      { testId: "V-03", passed: false, expected: 0.3, actual: 0.0 },
    ];
    return new Response(
      JSON.stringify({
        stdout: `${routeCapturedSentinel}${JSON.stringify(payload)}${routeCapturedSentinel}`,
        status: { id: 3, description: "Accepted" },
        token: "route-token",
      }),
      { status: 200 },
    );
  }
  throw new Error(`Unhandled route mock: ${urlStr}`);
};

before(async () => {
  // Create an active session in DB
  const activeSession = await prisma.assessmentSession.create({
    data: { status: "ACTIVE" },
  });
  activeSessionId = activeSession.id;

  // Create a closed session in DB
  const closedSession = await prisma.assessmentSession.create({
    data: { status: "SUBMITTED" },
  });
  closedSessionId = closedSession.id;

  const testApp = createApp(prisma, mockSuccessFetch);
  await new Promise<void>((resolve) => {
    server = testApp.listen(0, () => {
      const address = server.address() as AddressInfo;
      baseUrl = `http://127.0.0.1:${address.port}`;
      resolve();
    });
  });
});

after(async () => {
  try {
    await prisma.assessmentSession.deleteMany({
      where: { id: { in: [activeSessionId, closedSessionId] } },
    });
  } catch {
    // cleanup
  }
  await prisma.$disconnect();
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test("POST /api/sessions/:id/run executes visible tests and returns 200 with structured results", async () => {
  const res = await fetch(`${baseUrl}/api/sessions/${activeSessionId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      code: "function calculateCartTotal(items) { return 0; }",
    }),
  });

  equal(res.status, 200);
  const data = await res.json();

  equal(data.sessionId, activeSessionId);
  equal(data.total, 3);
  equal(data.passed, 2);
  equal(Array.isArray(data.results), true);
  equal(data.results.length, 3);

  // Verify only visible tests returned
  for (const r of data.results) {
    ok(r.testId.startsWith("V-"));
    ok(!r.testId.startsWith("H-"));
  }
});

test("POST /api/sessions/:id/run returns 400 when code is empty or missing", async () => {
  const res1 = await fetch(`${baseUrl}/api/sessions/${activeSessionId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "   " }),
  });
  equal(res1.status, 400);

  const res2 = await fetch(`${baseUrl}/api/sessions/${activeSessionId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  equal(res2.status, 400);
});

test("POST /api/sessions/:id/run returns 400 for malformed session UUID", async () => {
  const res = await fetch(`${baseUrl}/api/sessions/not-a-valid-uuid/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "function calculateCartTotal() {}" }),
  });
  equal(res.status, 400);
  const data = await res.json();
  ok(data.error.includes("Invalid session ID"));
});

test("POST /api/sessions/:id/run returns 404 for unknown valid UUID", async () => {
  const unknownUuid = "00000000-0000-4000-8000-000000000000";
  const res = await fetch(`${baseUrl}/api/sessions/${unknownUuid}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "function calculateCartTotal() {}" }),
  });
  equal(res.status, 404);
  const data = await res.json();
  equal(data.error, "Session not found");
});

test("POST /api/sessions/:id/run returns 409 when session is not ACTIVE", async () => {
  const res = await fetch(`${baseUrl}/api/sessions/${closedSessionId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "function calculateCartTotal() {}" }),
  });
  equal(res.status, 409);
  const data = await res.json();
  ok(data.error.includes("Session is not active"));
});

test("POST /api/sessions/:id/run returns 503 when Judge0 service is unavailable", async () => {
  const failingApp = createApp(prisma, async () => {
    throw new Error("Judge0 connection refused");
  });
  const failingServer = failingApp.listen(0);
  const port = (failingServer.address() as AddressInfo).port;

  try {
    const res = await fetch(`http://127.0.0.1:${port}/api/sessions/${activeSessionId}/run`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: "function calculateCartTotal() {}" }),
    });

    equal(res.status, 503);
    const data = await res.json();
    equal(
      data.error,
      "Code execution service is temporarily unavailable. Please try again later.",
    );
  } finally {
    await new Promise<void>((resolve, reject) => {
      failingServer.close((err) => (err ? reject(err) : resolve()));
    });
  }
});

test("buildTestHarness protects execution when candidate attempts built-in tampering", () => {
  const sentinel = "__SENTINEL_TAMPER__";
  const tamperingCode = `
    JSON.stringify = function() { return "hacked"; };
    Math.round = function() { return 999; };
    process.exit(0);
    function calculateCartTotal(items) { return 25; }
  `;
  const harness = buildTestHarness(tamperingCode, visibleTests, sentinel);

  ok(harness.includes("__JSON_stringify"));
  ok(harness.includes("__Math_round"));
  ok(harness.includes("process.exit = function()"));
});

test("POST /api/sessions/:id/run strictly excludes hidden test cases and challenge data", async () => {
  const res = await fetch(`${baseUrl}/api/sessions/${activeSessionId}/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ code: "function calculateCartTotal(items) { return 0; }" }),
  });

  equal(res.status, 200);
  const data = await res.json();
  const jsonStr = JSON.stringify(data);

  // Hidden test fixtures must never be leaked
  ok(!jsonStr.includes("H-01"));
  ok(!jsonStr.includes("H-02"));
  ok(!jsonStr.includes("H-03"));

  // Controlled challenge and reference code must never be leaked
  equal("flawedSuggestion" in data, false);
  equal("triggerTestId" in data, false);
  equal("referenceCalculateCartTotal" in data, false);
});

