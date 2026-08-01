import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  readAction654sPrivateBoundaryMatrixForReview,
  runAction654sFailFastSeparatedStringBudget,
} from "../../lib/action-654s-fail-fast-separated-string-budget";
import { runAction654uExactBudgetUnitPrivatePolicy } from "../../lib/action-654u-exact-budget-unit-private-policy";
import golden from "../../docs/action-654u-exact-budget-unit-private-policy-golden-report.json";
import type { Action654hPrivateReadinessInput } from "../../lib/action-654h-private-readiness-provenance";

const root = resolve(__dirname, "../..");
const authorityRef =
  "refs/codex-preservation/action-654u-exact-budget-unit-private-policy";
const authorityObject = "e44ae65667ea24a8b1797c15b0c510408cded929";
const authorityTree = "c30f8752138a2f99238c47b091f9134e1845c8da";
const authorityParent = "de319405869af7df8d9fe3fae459f7e12c95dae6";
const authorityDigest =
  "9948ffb3a94f1744bfc9ca74dfbabd0a8c8edbd38cdc13531b2e2940399af351";
const authorityPaths = [
  "docs/action-654u-exact-budget-unit-private-policy-contract.md",
  "docs/action-654u-exact-budget-unit-private-policy-golden-report.json",
  "lib/action-654u-exact-budget-unit-private-policy.ts",
  "tests/e2e/action-654u-exact-budget-unit-private-policy.spec.ts",
  "tests/fixtures/action-654u-exact-budget-unit-private-policy-fixtures.ts",
] as const;

const enabledGate =
  '{"version":"action_654o_canonical_gate_v1","enabled":true,"kill_switch_active":false}';
const disabledGate =
  '{"version":"action_654o_canonical_gate_v1","enabled":false,"kill_switch_active":false}';

function git(...args: string[]) {
  return execFileSync("git", args, { cwd: root });
}

function rebuildAuthorityDigest() {
  const hash = createHash("sha256");
  for (const path of authorityPaths) {
    hash.update(path);
    hash.update("\0");
    hash.update(git("show", `${authorityRef}:${path}`));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function reviewInput(suffix: string): Action654hPrivateReadinessInput {
  return {
    request_version: "action_654h_private_readiness_request_v1",
    operation: "action_654h_establish_v5_and_readiness",
    idempotency_key: `action_654h_v_${suffix}`,
    observed_at: "2026-07-29T10:00:02.000000000Z",
    evaluated_at: "2026-07-29T10:05:00.000000000Z",
  };
}

function expectWorkZero(
  result: ReturnType<typeof runAction654uExactBudgetUnitPrivatePolicy>,
) {
  expect(Object.values(result.work).every((counter) => counter === 0)).toBe(
    true,
  );
}

test("rebuilds exact frozen five-path authority, parent, tree, and digest", () => {
  expect(git("rev-parse", authorityRef).toString().trim()).toBe(authorityObject);
  expect(git("rev-parse", `${authorityRef}^{tree}`).toString().trim()).toBe(
    authorityTree,
  );
  expect(git("rev-parse", `${authorityRef}^`).toString().trim()).toBe(
    authorityParent,
  );
  expect(
    git("diff-tree", "--no-commit-id", "--name-only", "-r", authorityRef)
      .toString()
      .trim()
      .split("\n"),
  ).toEqual(authorityPaths);
  expect(rebuildAuthorityDigest()).toBe(authorityDigest);
  for (const path of authorityPaths) {
    expect(createHash("sha256").update(readFileSync(resolve(root, path))).digest("hex"))
      .toBe(createHash("sha256").update(git("show", `${authorityRef}:${path}`)).digest("hex"));
  }
});

test("independently verifies exact integer max-minus-one, max, and max-plus-one matrices", () => {
  const expected = {
    code_units: { configured_limit: 128, costs: [127, 128, 129] },
    observation_bytes: { configured_limit: 384, costs: [383, 384, 385] },
    total_bytes: { configured_limit: 1_984, costs: [1_983, 1_984, 1_985] },
  } as const;
  for (const [domain, proof] of Object.entries(expected)) {
    const actual = golden.exact_unit_proof[
      domain as keyof typeof golden.exact_unit_proof
    ];
    expect(actual.configured_limit).toBe(proof.configured_limit);
    expect(actual.observed_integer_costs).toEqual(proof.costs);
    expect(
      actual.observed_integer_costs.map(
        (cost) => cost - actual.configured_limit,
      ),
    ).toEqual([-1, 0, 1]);
    expect(
      actual.observed_integer_costs.map((cost) =>
        cost > actual.configured_limit ? "budget_rejected" : "within_budget",
      ),
    ).toEqual(["within_budget", "within_budget", "budget_rejected"]);
  }
});

test("runtime reachable costs are separate, exact, and never relabelled as unit boundaries", () => {
  const counts = [127, 128, 129];
  const observationCosts = counts.map((count) => 128 + count * 2);
  const totalCosts = counts.map((count) => 960 + count * 8);
  expect(observationCosts).toEqual([382, 384, 386]);
  expect(totalCosts).toEqual([1_976, 1_984, 1_992]);
  expect(golden.reachable_runtime_cost_proof).toEqual({
    code_unit_counts: counts,
    observation_byte_costs: observationCosts,
    total_byte_costs: totalCosts,
  });
  expect(observationCosts).not.toEqual([383, 384, 385]);
  expect(totalCosts).not.toEqual([1_983, 1_984, 1_985]);

  const runtime = counts.map((count) =>
    runAction654uExactBudgetUnitPrivatePolicy(
      "x".repeat(count),
      reviewInput(`reachable_${count}`),
    ),
  );
  expect(runtime.slice(0, 2).map((result) => [
    result.observed_string_observation_byte_count,
    result.observed_string_total_upper_bound_bytes,
  ])).toEqual([
    [382, 1_976],
    [384, 1_984],
  ]);
  expect(runtime[2].budget_rejection).toMatchObject({
    reason: "maximum_code_units_exceeded",
    observed_bounded_length: 129,
    relevant_maximum: 128,
  });
  expect(runtime[2].observed_string_observation_byte_count).toBeNull();
  expect(runtime[2].observed_string_total_upper_bound_bytes).toBeNull();
  expectWorkZero(runtime[2]);
});

test("654T-M1 and 654T-M2 reproduce against 654S and close in 654U", async () => {
  const historicalMatrix = readAction654sPrivateBoundaryMatrixForReview();
  expect(
    historicalMatrix.observation_bytes.map(
      ({ code_unit_count }) => 128 + code_unit_count * 2,
    ),
  ).toEqual([142, 144, 146]);
  expect(
    historicalMatrix.total_bytes.map(
      ({ code_unit_count }) => 960 + code_unit_count * 8,
    ),
  ).toEqual([1_016, 1_024, 1_032]);
  const historicalRuntime = await import(
    "../../lib/action-654s-fail-fast-separated-string-budget"
  );
  expect(Object.keys(historicalRuntime)).toContain(
    "readAction654sPrivateBoundaryMatrixForReview",
  );

  const currentRuntime = await import(
    "../../lib/action-654u-exact-budget-unit-private-policy"
  );
  expect(
    Object.keys(currentRuntime)
      .filter((key) => !["__esModule", "default", "module.exports"].includes(key))
      .sort(),
  ).toEqual(["runAction654uExactBudgetUnitPrivatePolicy"]);
});

test("production source exports no policy, factory, matrix, evaluator, or counter", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654u-exact-budget-unit-private-policy.ts"),
    "utf8",
  );
  expect(source.match(/^export function /gm)).toEqual(["export function "]);
  expect(source).not.toMatch(/export\s+(?:const|class|enum)\s+/);
  expect(source).not.toMatch(
    /readAction654sPrivateBoundaryMatrixForReview|BoundaryMatrix|testPolicy|policyFactory|reviewProjection|privilegedCounter/,
  );
  expect(source).not.toMatch(/from\s+["'][^"']*(?:tests|fixtures)/);
  expect(source).toContain("const productionBudgetPolicy");
  expect(source).not.toMatch(/export\s+.*productionBudgetPolicy/);
});

test("caller policy mint, clone, substitution, and proxy attempts perform zero work", () => {
  let hooks = 0;
  const policy = new Proxy(
    {
      maximum_code_units: Number.MAX_SAFE_INTEGER,
      maximum_observation_bytes: Number.MAX_SAFE_INTEGER,
      maximum_total_bytes: Number.MAX_SAFE_INTEGER,
    },
    {
      get() {
        hooks += 1;
        throw new Error("must not read");
      },
      ownKeys() {
        hooks += 1;
        throw new Error("must not enumerate");
      },
      getOwnPropertyDescriptor() {
        hooks += 1;
        throw new Error("must not inspect");
      },
    },
  );
  const operation = runAction654uExactBudgetUnitPrivatePolicy as unknown as (
    gate: unknown,
    input: unknown,
    policy: unknown,
  ) => ReturnType<typeof runAction654uExactBudgetUnitPrivatePolicy>;
  const result = operation(enabledGate, reviewInput("policy_attack"), policy);
  expect(result.failure_reason).toBe("budget_policy_override_rejected");
  expect(hooks).toBe(0);
  expectWorkZero(result);
});

test("validation order is fail-fast and safe integer arithmetic precedes observation", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654u-exact-budget-unit-private-policy.ts"),
    "utf8",
  );
  const start = source.indexOf(
    "export function runAction654uExactBudgetUnitPrivatePolicy",
  );
  const body = source.slice(start);
  const capture = body.indexOf("const captured = canonicalGateInput");
  const typeCheck = body.indexOf('typeof captured !== "string"');
  const lengthRead = body.indexOf("const codeUnitCount = captured.length");
  const budget = body.indexOf("evaluateProductionBudget(codeUnitCount)");
  const observation = body.indexOf("observeLosslessly(captured");
  const parser = body.indexOf("JSON.parse(captured)");
  expect([capture, typeCheck, lengthRead, budget, observation, parser]).toEqual(
    [...[capture, typeCheck, lengthRead, budget, observation, parser]].sort(
      (left, right) => left - right,
    ),
  );
  expect(body.match(/captured\.length/g)).toHaveLength(1);
  expect(source).toContain("Number.isSafeInteger");
  expect(source).toContain("Number.MAX_SAFE_INTEGER");
  expect(source).toContain("safeMultiply");
  expect(source).toContain("safeAdd");
});

test("oversized rejection is bounded non-identity plain data with all work zero", () => {
  for (const count of [129, 1_024, 65_536]) {
    const result = runAction654uExactBudgetUnitPrivatePolicy(
      "x".repeat(count),
      reviewInput(`oversized_${count}`),
    );
    expect(result.boundary_status).toBe("budget_rejected");
    expect(result.budget_rejection).toMatchObject({
      policy_version: "action_654u_private_string_budget_policy_v1",
      reason: "maximum_code_units_exceeded",
      observed_bounded_length: count,
      observed_length_unit: "utf16_code_units",
      relevant_maximum: 128,
      cryptographic_input_binding_claimed: false,
    });
    expect(result.failure_identity).toBeNull();
    expect(result.terminal_digest).toBeNull();
    expectWorkZero(result);
  }
});

test("hook-free UTF-16 observation remains collision free without normalization", () => {
  let hooks = 0;
  const proxy = new Proxy({}, {
    get() { hooks += 1; throw new Error("must not read"); },
    ownKeys() { hooks += 1; throw new Error("must not enumerate"); },
  });
  const rejected = runAction654uExactBudgetUnitPrivatePolicy(
    proxy,
    reviewInput("proxy"),
  );
  expect(rejected.failure_reason).toBe("gate_input_not_primitive_string");
  expect(hooks).toBe(0);
  expectWorkZero(rejected);

  const malformed = ["{\ud800", "{\ud801", "{\udc00", "{\udc01", "{\ud83d\ude00", "{\ud83d-\ude00", '"é"', '"e\u0301"'];
  const results = malformed.map((value, index) =>
    runAction654uExactBudgetUnitPrivatePolicy(
      value,
      reviewInput(`utf16_${index}`),
    ),
  );
  expect(new Set(results.map((result) => result.observed_string_digest)).size)
    .toBe(results.length);
  expect(new Set(results.map((result) => result.failure_identity)).size).toBe(
    results.length,
  );
});

test("private readiness provenance keeps invalid consumption zero and valid establishment single", () => {
  const disabled = runAction654uExactBudgetUnitPrivatePolicy(
    disabledGate,
    reviewInput("disabled"),
  );
  const valid = runAction654uExactBudgetUnitPrivatePolicy(
    enabledGate,
    reviewInput("valid"),
  );
  expect(disabled.predecessor_result?.effects.confirmation_consumptions).toBe(0);
  expect(valid.predecessor_result?.effects).toMatchObject({
    v5_invocations: 1,
    v5_establishments: 1,
    capsule_mints: 1,
    readiness_classifications: 1,
    confirmation_consumptions: 1,
  });
  expect(Object.isFrozen(valid)).toBe(true);
  expect(Object.isFrozen(valid.gate_snapshot)).toBe(true);
});

test("transport, broker, credential, provider, database, and write capabilities are absent", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654u-exact-budget-unit-private-policy.ts"),
    "utf8",
  );
  expect(source).not.toMatch(
    /fetch\s*\(|WebSocket|XMLHttpRequest|child_process|supabase|BankID|Avanza|process\.env|databaseClient|transportAdapter|orderRoute/,
  );
  const result = runAction654uExactBudgetUnitPrivatePolicy(
    enabledGate,
    reviewInput("safety"),
  );
  expect(result.safety).toMatchObject({
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
  expect(result.work).toMatchObject({
    transport_requests: 0,
    broker_submissions: 0,
    database_writes: 0,
    trade_mutations: 0,
  });
});

test("predecessor preservation objects and published PR head remain unchanged", () => {
  expect(git("rev-parse", "refs/codex-preservation/action-654s-fail-fast-separated-string-budget").toString().trim())
    .toBe("5656fc8bd37bb042bac58ed65bbd117b5cf07db4");
  expect(git("rev-parse", "refs/codex-preservation/action-654t-fail-fast-string-budget-freeze-review").toString().trim())
    .toBe("de319405869af7df8d9fe3fae459f7e12c95dae6");
  expect(git("rev-parse", "refs/remotes/origin/codex/action-654a-transport-inert-dispatch-readiness").toString().trim())
    .toBe("3330df9a368f7f9979ed0d4a10b2ecd44a6e2672");
  expect(runAction654sFailFastSeparatedStringBudget).toBeDefined();
});
