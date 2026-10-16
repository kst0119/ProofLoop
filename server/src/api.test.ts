import { test, before, after } from "node:test";
import { equal, ok } from "node:assert/strict";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import { app } from "./app";

let server: Server;
let baseUrl: string;

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
  await new Promise<void>((resolve, reject) => {
    server.close((err) => (err ? reject(err) : resolve()));
  });
});

test("GET / returns welcome message and status 200", async () => {
  const res = await fetch(`${baseUrl}/`);
  equal(res.status, 200);

  const data = await res.json();
  equal(data.status, "Backend Running");
  equal(data.version, "1.0.0");
  equal(data.message, "Welcome to ProofLoop!");
  equal(data.description, "AI-Powered Coding Assessment Platform");
});

test("GET /api/health returns status ok and service name", async () => {
  const res = await fetch(`${baseUrl}/api/health`);
  equal(res.status, 200);

  const data = await res.json();
  equal(data.status, "ok");
  equal(data.service, "ProofLoop API");
});

test("GET /api/tasks/current returns candidate-safe task data with visible tests only", async () => {
  const res = await fetch(`${baseUrl}/api/tasks/current`);
  equal(res.status, 200);

  const data = await res.json();

  equal(data.id, "shopping-cart-total");
  equal(data.version, "shopping-cart-v1.0");
  equal(data.title, "Calculate Shopping Cart Total");
  equal(data.language, "javascript");
  ok(typeof data.instructions === "string" && data.instructions.length > 0);
  ok(typeof data.starterCode === "string" && data.starterCode.includes("calculateCartTotal"));

  // Check visible tests
  equal(Array.isArray(data.visibleTests), true);
  equal(data.visibleTests.length, 3);
  for (const testCase of data.visibleTests) {
    ok(testCase.id.startsWith("V-"));
    equal("set" in testCase, false);
    ok(Array.isArray(testCase.input));
    equal(typeof testCase.expected, "number");
  }

  // Ensure security: no hidden tests or controlled challenge leaked
  equal("hiddenTests" in data, false);
  equal("flawedSuggestion" in data, false);
  equal("triggerTestId" in data, false);
  equal("referenceCalculateCartTotal" in data, false);
});
