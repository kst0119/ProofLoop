export interface CartItem {
  price: number;
  quantity: number;
}

export type TestSet = "visible" | "hidden";

export interface TaskTestCase {
  id: string;
  set: TestSet;
  input: CartItem[];
  expected: number;
}

export const SHOPPING_CART_TASK = {
  id: "shopping-cart-total",
  version: "shopping-cart-v1.0",
  title: "Calculate Shopping Cart Total",
  language: "javascript",

  description: `
Implement calculateCartTotal(items).

Each item contains:
- price: a non-negative number
- quantity: a non-negative integer

Return the sum of price * quantity for every item,
rounded to two decimal places.

An empty cart must return 0.
You may assume all inputs follow the specified contract.
`,

  starterCode: `function calculateCartTotal(items) {
  // TODO: calculate and return the cart total.
}
`,
} as const;

/*
 * Server-side challenge data.
 * Do not send this object to the candidate frontend.
 */
export const CONTROLLED_AI_CHALLENGE = {
  id: "CH-EDGE-01",
  version: "challenge-v1.0",
  triggerTestId: "H-01",

  flawedSuggestion: `function calculateCartTotal(items) {
  const lineTotals = items.map(
    item => item.price * item.quantity
  );

  return lineTotals.reduce(
    (total, amount) => total + amount
  );
}
`,
} as const;

/*
 * Hidden test inputs and expected outputs must remain server-side.
 */
export const SHOPPING_CART_TESTS: TaskTestCase[] = [
  {
    id: "V-01",
    set: "visible",
    input: [{ price: 12.5, quantity: 2 }],
    expected: 25,
  },
  {
    id: "V-02",
    set: "visible",
    input: [
      { price: 10, quantity: 1 },
      { price: 2.5, quantity: 2 },
    ],
    expected: 15,
  },
  {
    id: "V-03",
    set: "visible",
    input: [
      { price: 0.1, quantity: 1 },
      { price: 0.2, quantity: 1 },
    ],
    expected: 0.3,
  },
  {
    id: "H-01",
    set: "hidden",
    input: [],
    expected: 0,
  },
  {
    id: "H-02",
    set: "hidden",
    input: [
      { price: 15, quantity: 0 },
      { price: 0, quantity: 4 },
    ],
    expected: 0,
  },
  {
    id: "H-03",
    set: "hidden",
    input: [
      { price: 7.25, quantity: 3 },
      { price: 0.1, quantity: 5 },
    ],
    expected: 22.25,
  },
];

/*
 * Reference implementation for validating our test fixtures.
 * This is not the candidate's submitted solution.
 */
export function referenceCalculateCartTotal(
  items: CartItem[],
): number {
  const total = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  return Math.round((total + Number.EPSILON) * 100) / 100;
}

export interface CandidateVisibleTest {
  id: string;
  input: CartItem[];
  expected: number;
}

export interface CandidateTaskResponse {
  id: string;
  version: string;
  title: string;
  language: string;
  instructions: string;
  starterCode: string;
  visibleTests: CandidateVisibleTest[];
}

/**
 * Returns candidate-safe task information.
 * Hidden test cases, reference implementation, and controlled AI challenge
 * fixtures are strictly kept server-side and excluded from this response.
 */
export function getCandidateTask(): CandidateTaskResponse {
  const visibleTests: CandidateVisibleTest[] = SHOPPING_CART_TESTS
    .filter(testCase => testCase.set === "visible")
    .map(({ id, input, expected }) => ({ id, input, expected }));

  return {
    id: SHOPPING_CART_TASK.id,
    version: SHOPPING_CART_TASK.version,
    title: SHOPPING_CART_TASK.title,
    language: SHOPPING_CART_TASK.language,
    instructions: SHOPPING_CART_TASK.description.trim(),
    starterCode: SHOPPING_CART_TASK.starterCode,
    visibleTests,
  };
}
