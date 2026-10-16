import { randomBytes } from "node:crypto";
import type { TaskTestCase } from "./task";

export const DEFAULT_JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";
export const DEFAULT_LANGUAGE_ID = Number(process.env.JUDGE0_LANGUAGE_ID) || 102; // Node.js 22
export const MAX_CODE_SIZE_BYTES = 64 * 1024; // 64 KB
export const DEFAULT_POLL_INTERVAL_MS = 500;
export const DEFAULT_MAX_POLL_ATTEMPTS = 20;

export class Judge0UnavailableError extends Error {
  constructor(message = "Judge0 execution service is unavailable") {
    super(message);
    this.name = "Judge0UnavailableError";
  }
}

export class Judge0TimeoutError extends Error {
  constructor(message = "Judge0 execution timed out") {
    super(message);
    this.name = "Judge0TimeoutError";
  }
}

export interface SingleTestResult {
  testId: string;
  passed: boolean;
  expected: number;
  actual: number | null;
  error?: string;
}

export interface ExecutionOutcome {
  passed: number;
  total: number;
  results: SingleTestResult[];
  error?: string;
  stdout?: string | null;
  stderr?: string | null;
}

export interface Judge0SubmissionResponse {
  token: string;
}

export interface Judge0Status {
  id: number;
  description: string;
}

export interface Judge0ResultResponse {
  stdout: string | null;
  stderr: string | null;
  compile_output: string | null;
  message: string | null;
  time: string | null;
  memory: number | null;
  status: Judge0Status;
  token: string;
}

/**
 * Builds a server-controlled test harness that executes candidate code
 * against the provided test cases.
 *
 * Security & Isolation measures:
 * - Redirects console.log, console.warn, console.error to avoid polluting stdout.
 * - Suppresses candidate calls to process.stdout.write.
 * - Uses a unique cryptographically random sentinel delimiter to output
 *   structured test results, preventing candidate stdout spoofing.
 * - Clones inputs before passing them into the candidate function to prevent
 *   fixture mutation attacks.
 * - Enforces number rounding to 2 decimal places using Number.EPSILON.
 */
export function buildTestHarness(
  candidateCode: string,
  tests: Pick<TaskTestCase, "id" | "input" | "expected">[],
  sentinel: string,
): string {
  // Pre-serialize test fixtures with native JSON.stringify
  const safeTestsJson = JSON.stringify(
    tests.map((t) => ({ id: t.id, input: t.input, expected: t.expected })),
  );

  return `
(function() {
  // 1. Cache critical built-ins before evaluating candidate code
  const __realStdoutWrite = process.stdout.write.bind(process.stdout);
  const __JSON_stringify = JSON.stringify;
  const __JSON_parse = JSON.parse;
  const __Math_round = Math.round;
  const __Math_abs = Math.abs;
  const __Number_EPSILON = Number.EPSILON;
  const __isNaN = Number.isNaN;

  // 2. Prevent early termination via process.exit
  process.exit = function() {
    throw new Error("process.exit() is not permitted in assessment execution");
  };

  // 3. Suppress console methods and stdout/stderr writing from untrusted code
  process.stdout.write = () => true;
  process.stderr.write = () => true;
  console.log = () => {};
  console.info = () => {};
  console.warn = () => {};
  console.error = () => {};

  let __hasSyntaxOrEvalError = false;
  let __evalErrorMessage = "";

  try {
    ${candidateCode}
  } catch (err) {
    __hasSyntaxOrEvalError = true;
    __evalErrorMessage = err && err.message ? String(err.message) : "Error loading candidate code";
  }

  const __tests = ${safeTestsJson};

  if (__hasSyntaxOrEvalError) {
    const errorResults = __tests.map(t => ({
      testId: t.id,
      passed: false,
      expected: t.expected,
      actual: null,
      error: __evalErrorMessage
    }));
    __realStdoutWrite("${sentinel}" + __JSON_stringify(errorResults) + "${sentinel}");
    return;
  }

  if (typeof calculateCartTotal !== "function") {
    const missingResults = __tests.map(t => ({
      testId: t.id,
      passed: false,
      expected: t.expected,
      actual: null,
      error: "calculateCartTotal is not defined or is not a function"
    }));
    __realStdoutWrite("${sentinel}" + __JSON_stringify(missingResults) + "${sentinel}");
    return;
  }

  const __results = new Array(__tests.length);

  for (let __i = 0; __i < __tests.length; __i++) {
    const __t = __tests[__i];
    try {
      // Use cached JSON functions to clone input, defending against input tampering
      const __inputClone = __JSON_parse(__JSON_stringify(__t.input));
      const __rawActual = calculateCartTotal(__inputClone);
      const __isNum = typeof __rawActual === "number" && !__isNaN(__rawActual);
      let __actualRounded = null;
      let __passed = false;

      if (__isNum) {
        __actualRounded = __Math_round((__rawActual + __Number_EPSILON) * 100) / 100;
        __passed = __Math_abs(__actualRounded - __t.expected) < 0.001;
      }

      __results[__i] = {
        testId: __t.id,
        passed: __passed,
        expected: __t.expected,
        actual: __actualRounded
      };
    } catch (testErr) {
      __results[__i] = {
        testId: __t.id,
        passed: false,
        expected: __t.expected,
        actual: null,
        error: testErr && testErr.message ? String(testErr.message) : "Runtime error"
      };
    }
  }

  __realStdoutWrite("${sentinel}" + __JSON_stringify(__results) + "${sentinel}");
})();
`;
}

export interface ExecuteOptions {
  code: string;
  tests: Pick<TaskTestCase, "id" | "input" | "expected">[];
  judge0Url?: string;
  languageId?: number;
  pollIntervalMs?: number;
  maxPollAttempts?: number;
  fetchFn?: typeof fetch;
}

/**
 * Submits candidate code wrapped in the trusted harness to Judge0,
 * polls asynchronously until execution finishes, and parses the structured result.
 */
export async function executeCandidateCode(
  options: ExecuteOptions,
): Promise<ExecutionOutcome> {
  const {
    code,
    tests,
    judge0Url = DEFAULT_JUDGE0_URL,
    languageId = DEFAULT_LANGUAGE_ID,
    pollIntervalMs = DEFAULT_POLL_INTERVAL_MS,
    maxPollAttempts = DEFAULT_MAX_POLL_ATTEMPTS,
    fetchFn = fetch,
  } = options;

  const sentinel = `__PROOF_LOOP_${randomBytes(12).toString("hex")}__`;
  const harness = buildTestHarness(code, tests, sentinel);

  // 1. Submit code to Judge0
  let submissionRes: Response;
  try {
    submissionRes = await fetchFn(
      `${judge0Url}/submissions?base64_encoded=false&wait=false`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          source_code: harness,
          language_id: languageId,
          cpu_time_limit: 3,
          wall_time_limit: 5,
          memory_limit: 128000,
        }),
      },
    );
  } catch (netErr) {
    throw new Judge0UnavailableError(
      `Failed to connect to Judge0 at ${judge0Url}: ${netErr instanceof Error ? netErr.message : "Network error"}`,
    );
  }

  if (!submissionRes.ok) {
    const errorText = await submissionRes.text().catch(() => "");
    throw new Judge0UnavailableError(
      `Judge0 submission failed with HTTP ${submissionRes.status}: ${errorText.slice(0, 100)}`,
    );
  }

  const submissionData = (await submissionRes.json()) as Judge0SubmissionResponse;
  const token = submissionData?.token;

  if (!token || typeof token !== "string") {
    throw new Judge0UnavailableError("Judge0 did not return a valid submission token");
  }

  // 2. Poll for results asynchronously
  let attempts = 0;
  let finalResult: Judge0ResultResponse | null = null;

  while (attempts < maxPollAttempts) {
    attempts++;
    await new Promise((resolve) => setTimeout(resolve, pollIntervalMs));

    let pollRes: Response;
    try {
      pollRes = await fetchFn(
        `${judge0Url}/submissions/${token}?base64_encoded=false`,
        {
          headers: { Accept: "application/json" },
        },
      );
    } catch (pollNetErr) {
      throw new Judge0UnavailableError(
        `Failed to poll Judge0: ${pollNetErr instanceof Error ? pollNetErr.message : "Network error"}`,
      );
    }

    if (!pollRes.ok) {
      throw new Judge0UnavailableError(`Judge0 poll returned HTTP ${pollRes.status}`);
    }

    const resultData = (await pollRes.json()) as Judge0ResultResponse;

    if (!resultData || !resultData.status) {
      throw new Judge0UnavailableError("Malformed response received from Judge0");
    }

    // Status: 1 = In Queue, 2 = Processing
    if (resultData.status.id > 2) {
      finalResult = resultData;
      break;
    }
  }

  if (!finalResult) {
    throw new Judge0TimeoutError(
      `Judge0 execution polling exceeded limit of ${maxPollAttempts * pollIntervalMs}ms`,
    );
  }

  // 3. Process execution result
  return parseJudge0Result(finalResult, tests, sentinel);
}

/**
 * Parses the raw Judge0 response into a structured test result.
 */
export function parseJudge0Result(
  result: Judge0ResultResponse,
  tests: Pick<TaskTestCase, "id" | "input" | "expected">[],
  sentinel: string,
): ExecutionOutcome {
  const statusId = result.status?.id;
  const stdout = result.stdout || "";
  const stderr = result.stderr || "";
  const compileOutput = result.compile_output || "";

  // Check if our trusted sentinel was printed in stdout
  const firstIdx = stdout.indexOf(sentinel);
  const lastIdx = stdout.lastIndexOf(sentinel);

  if (firstIdx !== -1 && lastIdx !== -1 && firstIdx !== lastIdx) {
    try {
      const payloadString = stdout.substring(firstIdx + sentinel.length, lastIdx);
      const parsedResults = JSON.parse(payloadString) as SingleTestResult[];

      if (Array.isArray(parsedResults) && parsedResults.length === tests.length) {
        const passedCount = parsedResults.filter((r) => r.passed).length;
        return {
          passed: passedCount,
          total: tests.length,
          results: parsedResults,
          stdout: null,
          stderr: null,
        };
      }
    } catch {
      // Sentinel parsing failed; fall through to fallback parsing
    }
  }

  // Handle Judge0 non-Accepted statuses or unhandled runtime crashes
  let errorMessage = "Execution failed";

  if (statusId === 5) {
    errorMessage = "Time limit exceeded";
  } else if (statusId === 6) {
    // Compilation / Syntax error
    const firstLine = (compileOutput || stderr).split("\n")[0]?.trim();
    errorMessage = firstLine ? `Syntax error: ${firstLine.slice(0, 100)}` : "Syntax error in code";
  } else if (statusId >= 7 && statusId <= 12) {
    // Runtime errors
    const firstLine = (stderr || result.status?.description || "").split("\n")[0]?.trim();
    errorMessage = firstLine ? `Runtime error: ${firstLine.slice(0, 100)}` : "Runtime error during execution";
  } else if (statusId === 13) {
    throw new Judge0UnavailableError("Judge0 encountered an internal error");
  } else if (stderr) {
    const firstLine = stderr.split("\n")[0]?.trim();
    errorMessage = firstLine ? firstLine.slice(0, 100) : "Execution failed";
  }

  const failedResults: SingleTestResult[] = tests.map((t) => ({
    testId: t.id,
    passed: false,
    expected: t.expected,
    actual: null,
    error: errorMessage,
  }));

  return {
    passed: 0,
    total: tests.length,
    results: failedResults,
    error: errorMessage,
    stderr: stderr ? stderr.slice(0, 200) : null,
  };
}
