import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  action654qStringBudgets,
  runAction654qLosslessUtf16ReadinessGate,
} from "../../lib/action-654q-lossless-utf16-observation";
import {
  action654sCanonicalGates,
  readAction654sPrivateBoundaryMatrixForReview,
  runAction654sFailFastSeparatedStringBudget,
} from "../../lib/action-654s-fail-fast-separated-string-budget";
import {
  action654sMalformedInputs,
  action654sPlainFixture,
  runAction654sPlainFixture,
} from "../fixtures/action-654s-fail-fast-separated-string-budget-fixtures";

const root = resolve(__dirname, "../..");
const normativeRef =
  "refs/codex-preservation/action-654s-fail-fast-separated-string-budget";
const normativeObject = "5656fc8bd37bb042bac58ed65bbd117b5cf07db4";
const normativeTree = "d607d5ab8983501329b51be5d96d5824ce3115e6";
const normativeParent = "649a373609dcb718398e0b3a556811ba7dbf9395";
const normativeDigest =
  "ce662b25e7f3cda25a1f9a6011b06fc5a82cab76921241e9f17e4b433704cb0e";
const normativePaths = [
  "docs/action-654s-fail-fast-separated-string-budget-contract.md",
  "docs/action-654s-fail-fast-separated-string-budget-golden-report.json",
  "lib/action-654s-fail-fast-separated-string-budget.ts",
  "tests/e2e/action-654s-fail-fast-separated-string-budget.spec.ts",
  "tests/fixtures/action-654s-fail-fast-separated-string-budget-fixtures.ts",
] as const;

function git(...args: string[]) {
  return execFileSync("git", args, { cwd: root });
}

function sha256(value: Buffer | string) {
  return createHash("sha256").update(value).digest("hex");
}

function rebuildNormativeDigest() {
  const hash = createHash("sha256");
  for (const path of normativePaths) {
    hash.update(path);
    hash.update("\0");
    hash.update(git("show", `${normativeRef}:${path}`));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function expectAllWorkZero(
  result: ReturnType<typeof runAction654sFailFastSeparatedStringBudget>,
) {
  expect(Object.values(result.work).every((counter) => counter === 0)).toBe(
    true,
  );
}

test("rebuilds the exact frozen five-path authority and worktree parity", () => {
  expect(git("rev-parse", normativeRef).toString().trim()).toBe(
    normativeObject,
  );
  expect(git("rev-parse", `${normativeRef}^{tree}`).toString().trim()).toBe(
    normativeTree,
  );
  expect(git("rev-parse", `${normativeRef}^`).toString().trim()).toBe(
    normativeParent,
  );
  expect(
    git("diff-tree", "--no-commit-id", "--name-only", "-r", normativeRef)
      .toString()
      .trim()
      .split("\n"),
  ).toEqual(normativePaths);
  expect(rebuildNormativeDigest()).toBe(normativeDigest);
  for (const path of normativePaths) {
    expect(sha256(readFileSync(resolve(root, path)))).toBe(
      sha256(git("show", `${normativeRef}:${path}`)),
    );
  }
});

test("private production policy contains and uses exactly three frozen limits", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654s-fail-fast-separated-string-budget.ts"),
    "utf8",
  );
  const policyBody = source.match(
    /const productionBudgetPolicy:[\s\S]*?Object\.freeze\(\{([\s\S]*?)\}\);/,
  )?.[1];
  expect(policyBody).toBeTruthy();
  expect(policyBody?.match(/maximum_[a-z_]+/g)).toEqual([
    "maximum_code_units",
    "maximum_observation_bytes",
    "maximum_total_bytes",
  ]);
  expect(source).not.toMatch(/export\s+const\s+productionBudgetPolicy/);
  expect(source).toContain(
    "if (codeUnitCount > policy.maximum_code_units)",
  );
  expect(source).toContain(
    "if (observationBytes > policy.maximum_observation_bytes)",
  );
  expect(source).toContain(
    "if (totalUpperBound > policy.maximum_total_bytes)",
  );
});

test("validation order is code units then observation bytes then total before observation work", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654s-fail-fast-separated-string-budget.ts"),
    "utf8",
  );
  const runStart = source.indexOf("function runWithPolicy(");
  const runEnd = source.indexOf("/**\n * Production entry point", runStart);
  const body = source.slice(runStart, runEnd);
  const lengthRead = body.indexOf("const codeUnitCount = captured.length");
  const budgetEvaluation = body.indexOf(
    "const budget = evaluateBudget(codeUnitCount, policy)",
  );
  const budgetReturn = body.indexOf("if (!budget.ok) return budgetRejected");
  const observation = body.indexOf("const observation = losslessObserve");
  const parser = body.indexOf("JSON.parse(captured)");
  expect(lengthRead).toBeGreaterThan(-1);
  expect(lengthRead).toBeLessThan(budgetEvaluation);
  expect(budgetEvaluation).toBeLessThan(budgetReturn);
  expect(budgetReturn).toBeLessThan(observation);
  expect(observation).toBeLessThan(parser);
  expect(body.match(/captured\.length/g)).toHaveLength(1);

  const evaluator = source.slice(
    source.indexOf("function evaluateBudget("),
    source.indexOf("function inertResult("),
  );
  expect(evaluator.indexOf("maximum_code_units")).toBeLessThan(
    evaluator.indexOf("maximum_observation_bytes"),
  );
  expect(evaluator.indexOf("maximum_observation_bytes")).toBeLessThan(
    evaluator.indexOf("maximum_total_bytes"),
  );
  expect(source).toContain("safeMultiply");
  expect(source).toContain("safeAdd");
});

test("654T-M1: observation and total matrices do not exercise budget-unit minus one and plus one", () => {
  const matrix = readAction654sPrivateBoundaryMatrixForReview();
  const observationValues = matrix.observation_bytes.map(
    ({ code_unit_count }) => 128 + code_unit_count * 2,
  );
  const totalValues = matrix.total_bytes.map(
    ({ code_unit_count }) => 960 + code_unit_count * 8,
  );
  expect(observationValues).toEqual([142, 144, 146]);
  expect(observationValues).not.toEqual([143, 144, 145]);
  expect(totalValues).toEqual([1_016, 1_024, 1_032]);
  expect(totalValues).not.toEqual([1_023, 1_024, 1_025]);
  expect(matrix.observation_bytes[2]).toMatchObject({
    reason: "maximum_observation_bytes_exceeded",
    budget_rejection_work_is_zero: true,
  });
  expect(matrix.total_bytes[2]).toMatchObject({
    reason: "maximum_total_bytes_exceeded",
    budget_rejection_work_is_zero: true,
  });
});

test("654T-M2: private test-policy execution is reachable through a production runtime export", async () => {
  const runtime = await import(
    "../../lib/action-654s-fail-fast-separated-string-budget"
  );
  const exports = Object.keys(runtime)
    .filter((key) => !["__esModule", "default", "module.exports"].includes(key))
    .sort();
  expect(exports).toEqual([
    "action654sCanonicalGates",
    "readAction654sPrivateBoundaryMatrixForReview",
    "runAction654sFailFastSeparatedStringBudget",
  ]);
  const source = readFileSync(
    resolve(root, "lib/action-654s-fail-fast-separated-string-budget.ts"),
    "utf8",
  );
  const exportedProbe = source.slice(
    source.indexOf("export function readAction654sPrivateBoundaryMatrixForReview"),
  );
  expect(exportedProbe).toContain("const codeUnitPolicy");
  expect(exportedProbe).toContain("const observationPolicy");
  expect(exportedProbe).toContain("const totalPolicy");
  expect(exportedProbe).toContain("fixedBoundaryRows(codeUnitPolicy");
  expect(exportedProbe).toContain("fixedBoundaryRows(observationPolicy");
  expect(exportedProbe).toContain("fixedBoundaryRows(totalPolicy");
});

test("all three budget rejection reasons are reachable and zero-work", () => {
  const matrix = readAction654sPrivateBoundaryMatrixForReview();
  expect(matrix.code_units[2]).toMatchObject({
    status: "budget_rejected",
    reason: "maximum_code_units_exceeded",
    budget_rejection_work_is_zero: true,
  });
  expect(matrix.observation_bytes[2]).toMatchObject({
    status: "budget_rejected",
    reason: "maximum_observation_bytes_exceeded",
    budget_rejection_work_is_zero: true,
  });
  expect(matrix.total_bytes[2]).toMatchObject({
    status: "budget_rejected",
    reason: "maximum_total_bytes_exceeded",
    budget_rejection_work_is_zero: true,
  });
  expect(matrix.unsafe_arithmetic).toEqual({
    status: "budget_rejected",
    reason: "unsafe_budget_arithmetic",
  });
});

test("oversized production rejection performs zero downstream work and makes no digest claim", () => {
  for (const length of [129, 1_024, 65_536]) {
    const result = runAction654sFailFastSeparatedStringBudget(
      "x".repeat(length),
      action654sPlainFixture(`action_654t_oversized_${length}`),
    );
    expect(result.boundary_status).toBe("budget_rejected");
    expect(result.budget_rejection).toMatchObject({
      policy_version: "action_654s_separated_string_budget_policy_v1",
      reason: "maximum_code_units_exceeded",
      relevant_maximum: 128,
      cryptographic_input_binding_claimed: false,
    });
    expect(result.observed_string_digest).toBeNull();
    expect(result.failure_identity).toBeNull();
    expect(result.terminal_digest).toBeNull();
    expectAllWorkZero(result);
  }
});

test("policy substitution and hook-bearing boundary objects are rejected without inspection", () => {
  let hooks = 0;
  const forgedPolicy = new Proxy({}, {
    get() { hooks += 1; throw new Error("must not read"); },
    ownKeys() { hooks += 1; throw new Error("must not enumerate"); },
  });
  const operation = runAction654sFailFastSeparatedStringBudget as unknown as (
    gate: unknown,
    input: unknown,
    policy: unknown,
  ) => ReturnType<typeof runAction654sFailFastSeparatedStringBudget>;
  const result = operation(
    action654sCanonicalGates.enabled,
    action654sPlainFixture("action_654t_policy_substitution"),
    forgedPolicy,
  );
  expect(result.failure_reason).toBe("budget_policy_override_rejected");
  expect(hooks).toBe(0);
  expectAllWorkZero(result);
});

test("654R-M1 reproduces against 654Q and is closed by 654S", () => {
  expect(action654qStringBudgets).toEqual({
    maximum_code_units: 128,
    maximum_code_unit_bytes: 224,
  });
  const historical = runAction654qLosslessUtf16ReadinessGate(
    "x".repeat(129),
    action654sPlainFixture("action_654t_historical_r_m1"),
  );
  expect(historical.effects.failure_digest_operations).toBe(1);
  expect(historical.effects.terminal_digest_operations).toBe(1);

  const successor = runAction654sFailFastSeparatedStringBudget(
    "x".repeat(129),
    action654sPlainFixture("action_654t_closed_r_m1"),
  );
  expect(successor.boundary_status).toBe("budget_rejected");
  expectAllWorkZero(successor);
});

test("lossless UTF-16, P-M1 closure, and malformed failure uniqueness remain intact", () => {
  const inputs = Object.values(action654sMalformedInputs);
  const results = inputs.map((input, index) =>
    runAction654sFailFastSeparatedStringBudget(
      input,
      action654sPlainFixture(`action_654t_utf16_${index}`),
    ),
  );
  expect(new Set(results.map((result) => result.observed_string_digest)).size)
    .toBe(results.length);
  expect(new Set(results.map((result) => result.failure_identity)).size).toBe(
    results.length,
  );
  expect(new Set(results.map((result) => result.terminal_digest)).size).toBe(
    results.length,
  );
  expect(results[1].observed_string_digest).not.toBe(
    results[2].observed_string_digest,
  );
});

test("private readiness provenance and consumption matrix remain synthetic-only", () => {
  const disabled = runAction654sFailFastSeparatedStringBudget(
    action654sCanonicalGates.disabled,
    action654sPlainFixture("action_654t_disabled"),
  );
  const killed = runAction654sFailFastSeparatedStringBudget(
    action654sCanonicalGates.kill_switch_active,
    action654sPlainFixture("action_654t_killed"),
  );
  const valid = runAction654sPlainFixture("action_654t_valid");
  expect(disabled.predecessor_result?.effects.confirmation_consumptions).toBe(
    0,
  );
  expect(killed.predecessor_result?.effects.confirmation_consumptions).toBe(0);
  expect(valid.predecessor_result?.effects).toMatchObject({
    v5_invocations: 1,
    v5_establishments: 1,
    capsule_mints: 1,
    readiness_classifications: 1,
    confirmation_consumptions: 1,
  });
  expect(valid.safety).toMatchObject({
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
});

test("source graph excludes transport, credential, provider, database, and write capabilities", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654s-fail-fast-separated-string-budget.ts"),
    "utf8",
  );
  expect(source).not.toMatch(
    /fetch\s*\(|WebSocket|XMLHttpRequest|child_process|supabase|BankID|Avanza|process\.env|databaseClient|transportAdapter/,
  );
  expect(source).toContain("transport_attached: false");
  expect(source).toContain("dispatch_permitted: false");
  expect(source).toContain("broker_submission_allowed: false");
});
