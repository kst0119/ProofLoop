import { executeCandidateCode } from "./judge";
import { SHOPPING_CART_TESTS } from "./task";

async function runLiveSmokeTest() {
  console.log("=== ProofLoop: Live Judge0 Smoke Test ===");
  const visibleTests = SHOPPING_CART_TESTS.filter((t) => t.set === "visible");

  // 1. Test correct solution
  console.log("\n[Test 1] Running correct shopping-cart solution on live Judge0...");
  const correctCode = `
function calculateCartTotal(items) {
  const sum = items.reduce((acc, item) => acc + item.price * item.quantity, 0);
  return Math.round((sum + Number.EPSILON) * 100) / 100;
}
`;

  const outcome1 = await executeCandidateCode({
    code: correctCode,
    tests: visibleTests,
  });

  console.log("Outcome 1:", {
    passed: outcome1.passed,
    total: outcome1.total,
    results: outcome1.results,
  });

  if (outcome1.passed !== 3) {
    throw new Error(`Smoke Test 1 Failed: Expected 3/3 passed, got ${outcome1.passed}`);
  }
  console.log("✅ Smoke Test 1 Passed: Correct solution passed 3/3 visible tests!");

  // 2. Test incorrect solution
  console.log("\n[Test 2] Running incorrect solution (always returns 0) on live Judge0...");
  const incorrectCode = `
function calculateCartTotal(items) {
  return 0;
}
`;

  const outcome2 = await executeCandidateCode({
    code: incorrectCode,
    tests: visibleTests,
  });

  console.log("Outcome 2:", {
    passed: outcome2.passed,
    total: outcome2.total,
    results: outcome2.results,
  });

  if (outcome2.passed !== 0) {
    throw new Error(`Smoke Test 2 Failed: Expected 0/3 passed, got ${outcome2.passed}`);
  }
  console.log("✅ Smoke Test 2 Passed: Incorrect solution correctly failed all tests!");

  console.log("\n🎉 Live Judge0 smoke tests completed successfully!");
}

runLiveSmokeTest().catch((err) => {
  console.error("Live Smoke Test Error:", err);
  process.exit(1);
});
