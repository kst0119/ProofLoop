import { test } from "node:test";
import { deepEqual, equal, ok } from "node:assert/strict";

import {
  CONTROLLED_AI_CHALLENGE,
  SHOPPING_CART_TASK,
  SHOPPING_CART_TESTS,
  referenceCalculateCartTotal,
} from "./task";

test("task defines its name, version and language", () => {
  equal(SHOPPING_CART_TASK.id, "shopping-cart-total");
  equal(SHOPPING_CART_TASK.version, "shopping-cart-v1.0");
  equal(SHOPPING_CART_TASK.language, "javascript");
});

test("visible and hidden test IDs are unique", () => {
  const ids = SHOPPING_CART_TESTS.map(testCase => testCase.id);

  equal(new Set(ids).size, ids.length);
  ok(SHOPPING_CART_TESTS.some(testCase => testCase.set === "visible"));
  ok(SHOPPING_CART_TESTS.some(testCase => testCase.set === "hidden"));
});

test("reference implementation matches every test fixture", () => {
  for (const testCase of SHOPPING_CART_TESTS) {
    equal(
      referenceCalculateCartTotal(testCase.input),
      testCase.expected,
      `Fixture failed: ${testCase.id}`,
    );
  }
});

test("controlled challenge targets the empty-cart edge case", () => {
  equal(CONTROLLED_AI_CHALLENGE.triggerTestId, "H-01");

  const challengeTest = SHOPPING_CART_TESTS.find(
    testCase => testCase.id === CONTROLLED_AI_CHALLENGE.triggerTestId,
  );

  ok(challengeTest);
  deepEqual(challengeTest.input, []);
  equal(challengeTest.expected, 0);

  ok(CONTROLLED_AI_CHALLENGE.flawedSuggestion.includes(".reduce("));
});
