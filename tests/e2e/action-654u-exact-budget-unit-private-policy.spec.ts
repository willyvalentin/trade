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
import {
  action654uCanonicalGates,
  action654uExactUnitProof,
  action654uGoldenCases,
  action654uMalformedInputs,
  action654uPlainFixture,
  action654uReachableRuntimeCostProof,
  runAction654uPlainFixture,
} from "../fixtures/action-654u-exact-budget-unit-private-policy-fixtures";

const root = resolve(__dirname, "../..");

function expectWorkZero(
  value: ReturnType<typeof runAction654uExactBudgetUnitPrivatePolicy>,
) {
  expect(Object.values(value.work).every((counter) => counter === 0)).toBe(true);
}

type TestOnlyPolicy = Readonly<{
  unit: "code_units" | "observation_bytes" | "total_bytes";
  configured_limit: number;
}>;

function testOnlyExactIntegerCostProof(policy: TestOnlyPolicy) {
  const observed = [
    policy.configured_limit - 1,
    policy.configured_limit,
    policy.configured_limit + 1,
  ];
  return observed.map((observed_integer_cost) => ({
    configured_limit: policy.configured_limit,
    observed_integer_cost,
    delta: observed_integer_cost - policy.configured_limit,
    status:
      observed_integer_cost > policy.configured_limit
        ? "budget_rejected"
        : "within_budget",
  }));
}

test("654T-M1 and M2 reproduce exactly against frozen 654S", async () => {
  const matrix = readAction654sPrivateBoundaryMatrixForReview();
  expect(
    matrix.observation_bytes.map(
      ({ code_unit_count }) => 128 + code_unit_count * 2,
    ),
  ).toEqual([142, 144, 146]);
  expect(
    matrix.total_bytes.map(
      ({ code_unit_count }) => 960 + code_unit_count * 8,
    ),
  ).toEqual([1_016, 1_024, 1_032]);
  const historicalRuntime = await import(
    "../../lib/action-654s-fail-fast-separated-string-budget"
  );
  expect(Object.keys(historicalRuntime)).toContain(
    "readAction654sPrivateBoundaryMatrixForReview",
  );
});

test("test-only exact integer proof covers minus one, exact, and plus one for every unit", () => {
  for (const [unit, fixture] of Object.entries(action654uExactUnitProof)) {
    const rows = testOnlyExactIntegerCostProof({
      unit: unit as TestOnlyPolicy["unit"],
      configured_limit: fixture.configured_limit,
    });
    expect(rows.map(({ observed_integer_cost }) => observed_integer_cost)).toEqual(
      fixture.observed_integer_costs,
    );
    expect(rows.map(({ delta }) => delta)).toEqual([-1, 0, 1]);
    expect(rows.map(({ status }) => status)).toEqual([
      "within_budget",
      "within_budget",
      "budget_rejected",
    ]);
  }
});

test("runtime proof reports nearest actually reachable observation and total costs", () => {
  const results = action654uReachableRuntimeCostProof.code_unit_counts.map(
    (count) =>
      runAction654uExactBudgetUnitPrivatePolicy(
        "x".repeat(count),
        action654uPlainFixture(`action_654u_runtime_cost_${count}`),
      ),
  );
  expect(
    action654uReachableRuntimeCostProof.code_unit_counts.map(
      (count) => 128 + count * 2,
    ),
  ).toEqual(action654uReachableRuntimeCostProof.observation_byte_costs);
  expect(
    action654uReachableRuntimeCostProof.code_unit_counts.map(
      (count) => 960 + count * 8,
    ),
  ).toEqual(action654uReachableRuntimeCostProof.total_byte_costs);
  expect(results.slice(0, 2).map((result) => ({
    observation: result.observed_string_observation_byte_count,
    total: result.observed_string_total_upper_bound_bytes,
  }))).toEqual([
    { observation: 382, total: 1_976 },
    { observation: 384, total: 1_984 },
  ]);
  expect(results[2]).toMatchObject({
    boundary_status: "budget_rejected",
    budget_rejection: {
      reason: "maximum_code_units_exceeded",
      observed_bounded_length: 129,
      relevant_maximum: 128,
    },
  });
  expectWorkZero(results[2]);
});

test("654T-M2 closes with one production runtime export and no policy review surface", async () => {
  const runtime = await import(
    "../../lib/action-654u-exact-budget-unit-private-policy"
  );
  expect(
    Object.keys(runtime)
      .filter((key) => !["__esModule", "default", "module.exports"].includes(key))
      .sort(),
  ).toEqual(["runAction654uExactBudgetUnitPrivatePolicy"]);
  const source = readFileSync(
    resolve(root, "lib/action-654u-exact-budget-unit-private-policy.ts"),
    "utf8",
  );
  expect(source).not.toMatch(
    /readAction654sPrivateBoundaryMatrixForReview|BoundaryMatrix|testPolicy|policyFactory|reviewProjection|privilegedCounter/,
  );
  expect(source.match(/^export function /gm)).toEqual([
    "export function ",
  ]);
  expect(source).not.toMatch(/export\s+(?:const|class|enum)\s+/);
});

test("production policy is private, frozen, and caller policy minting is inert", () => {
  let hooks = 0;
  const forged = new Proxy(
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
  const result = operation(
    action654uCanonicalGates.enabled,
    action654uPlainFixture("action_654u_policy_forge"),
    forged,
  );
  expect(result.failure_reason).toBe("budget_policy_override_rejected");
  expect(hooks).toBe(0);
  expectWorkZero(result);

  const source = readFileSync(
    resolve(root, "lib/action-654u-exact-budget-unit-private-policy.ts"),
    "utf8",
  );
  expect(source).toContain("const productionBudgetPolicy");
  expect(source).toContain("Object.freeze({");
  expect(source).not.toMatch(/export\s+.*productionBudgetPolicy/);
});

test("validation order and unsafe arithmetic remain fail closed", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654u-exact-budget-unit-private-policy.ts"),
    "utf8",
  );
  const start = source.indexOf(
    "export function runAction654uExactBudgetUnitPrivatePolicy",
  );
  const body = source.slice(start);
  const lengthRead = body.indexOf("const codeUnitCount = captured.length");
  const budgetEvaluation = body.indexOf(
    "const budget = evaluateProductionBudget(codeUnitCount)",
  );
  const observation = body.indexOf("const observation = observeLosslessly");
  const parser = body.indexOf("JSON.parse(captured)");
  expect(lengthRead).toBeGreaterThan(-1);
  expect(lengthRead).toBeLessThan(budgetEvaluation);
  expect(budgetEvaluation).toBeLessThan(observation);
  expect(observation).toBeLessThan(parser);
  expect(body.match(/captured\.length/g)).toHaveLength(1);
  expect(source).toContain("safeMultiply");
  expect(source).toContain("safeAdd");
  expect(source).toContain('reason: "unsafe_budget_arithmetic"');
});

test("oversized input performs zero digest, parse, capsule, readiness, V5, and consumption work", () => {
  for (const length of [129, 1_024, 65_536]) {
    const result = runAction654uExactBudgetUnitPrivatePolicy(
      "x".repeat(length),
      action654uPlainFixture(`action_654u_oversized_${length}`),
    );
    expect(result.boundary_status).toBe("budget_rejected");
    expect(result.budget_rejection).toMatchObject({
      reason: "maximum_code_units_exceeded",
      cryptographic_input_binding_claimed: false,
    });
    expect(result.failure_identity).toBeNull();
    expect(result.terminal_digest).toBeNull();
    expectWorkZero(result);
  }
});

test("primitive gate boundary rejects objects, boxed strings, functions, accessors, and proxies hook-free", () => {
  let getterHooks = 0;
  const accessor = Object.defineProperty({}, "enabled", {
    get() {
      getterHooks += 1;
      throw new Error("must not read");
    },
  });
  let proxyHooks = 0;
  const proxy = new Proxy({}, {
    get() {
      proxyHooks += 1;
      throw new Error("must not read");
    },
    ownKeys() {
      proxyHooks += 1;
      throw new Error("must not enumerate");
    },
    getPrototypeOf() {
      proxyHooks += 1;
      throw new Error("must not reflect");
    },
  });
  let callbacks = 0;
  const callback = () => {
    callbacks += 1;
    return action654uCanonicalGates.enabled;
  };
  for (const value of [
    {},
    accessor,
    proxy,
    new String(action654uCanonicalGates.enabled),
    callback,
  ]) {
    const result = runAction654uExactBudgetUnitPrivatePolicy(
      value,
      action654uPlainFixture("action_654u_hook_free"),
    );
    expect(result.failure_reason).toBe("gate_input_not_primitive_string");
    expectWorkZero(result);
  }
  expect({ getterHooks, proxyHooks, callbacks }).toEqual({
    getterHooks: 0,
    proxyHooks: 0,
    callbacks: 0,
  });
});

test("lossless UTF-16 surrogate and normalization identities remain collision free", () => {
  const inputs = Object.values(action654uMalformedInputs);
  const results = inputs.map((input, index) =>
    runAction654uExactBudgetUnitPrivatePolicy(
      input,
      action654uPlainFixture(`action_654u_utf16_${index}`),
    ),
  );
  expect(new Set(results.map((result) => result.observed_string_digest)).size).toBe(
    results.length,
  );
  expect(new Set(results.map((result) => result.failure_identity)).size).toBe(
    results.length,
  );
  expect(new Set(results.map((result) => result.terminal_digest)).size).toBe(
    results.length,
  );
});

test("canonical gate, private readiness provenance, and consumption matrix remain intact", () => {
  const disabled = runAction654uExactBudgetUnitPrivatePolicy(
    action654uCanonicalGates.disabled,
    action654uPlainFixture("action_654u_disabled"),
  );
  const killed = runAction654uExactBudgetUnitPrivatePolicy(
    action654uCanonicalGates.kill_switch_active,
    action654uPlainFixture("action_654u_killed"),
  );
  const valid = runAction654uPlainFixture("action_654u_valid");
  expect(disabled.predecessor_result?.effects.confirmation_consumptions).toBe(0);
  expect(killed.predecessor_result?.effects.confirmation_consumptions).toBe(0);
  expect(valid.boundary_status).toBe("accepted");
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

test("isolated deterministic process probe", () => {
  const clock = process.env.ACTION654U_PROCESS_CLOCK as
    | "utc_a"
    | "utc_b"
    | "stockholm"
    | "new_york"
    | undefined;
  test.skip(!clock, "probe-only test");
  const result = runAction654uPlainFixture("action_654u_process_golden", {
    clock,
    reverse_input_order: process.env.ACTION654U_REVERSE === "true",
  });
  console.log(`ACTION654U_PROCESS:${JSON.stringify({
    boundary_status: result.boundary_status,
    observed_string_digest: result.observed_string_digest,
    terminal_digest: result.terminal_digest,
    readiness_status: result.predecessor_result?.readiness_status,
    terminal_reason: result.predecessor_result?.terminal_reason,
    observed_input_digest: result.predecessor_result?.observed_input_digest,
    readiness_identity:
      result.predecessor_result?.readiness_envelope?.readiness_identity,
    readiness_digest:
      result.predecessor_result?.readiness_envelope?.readiness_digest,
    instruction_identity:
      result.predecessor_result?.readiness_envelope?.instruction_identity,
    synthetic_replay_identity:
      result.predecessor_result?.readiness_envelope?.synthetic_replay_identity,
  })}`);
});

test("three timezones and reverse order match the golden report", () => {
  test.setTimeout(150_000);
  const rows = action654uGoldenCases.map((entry) => {
    const output = execFileSync(
      resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-654u-exact-budget-unit-private-policy.spec.ts",
        "--grep",
        "isolated deterministic process probe",
        "--reporter=line",
        "--workers=1",
        "--output",
        `/private/tmp/action-654u-process-${entry.name}`,
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          TZ:
            entry.clock === "stockholm"
              ? "Europe/Stockholm"
              : entry.clock === "new_york"
                ? "America/New_York"
                : "UTC",
          ACTION654U_PROCESS_CLOCK: entry.clock,
          ACTION654U_REVERSE: String(entry.reverse_input_order),
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
        },
        encoding: "utf8",
      },
    );
    const marker = output
      .split("\n")
      .find((value) => value.includes("ACTION654U_PROCESS:"));
    if (!marker) throw new Error("determinism marker missing");
    return {
      name: entry.name,
      ...JSON.parse(marker.replace(/^.*ACTION654U_PROCESS:/, "").trim()),
    };
  });
  expect(rows).toEqual(golden.cases);
  expect(
    new Set(rows.map((row) => JSON.stringify({ ...row, name: undefined }))).size,
  ).toBe(1);
});

test("golden separates exact integer proof from reachable runtime costs", () => {
  expect(golden.exact_unit_proof).toEqual(action654uExactUnitProof);
  expect(golden.reachable_runtime_cost_proof).toEqual(
    action654uReachableRuntimeCostProof,
  );
  expect(golden.historical_findings).toEqual([
    { identity: "654T-M1", reproduced: true, closed: true },
    { identity: "654T-M2", reproduced: true, closed: true },
  ]);
});

test("source graph has no transport, broker, credential, provider, database, or write capability", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654u-exact-budget-unit-private-policy.ts"),
    "utf8",
  );
  expect(source).not.toMatch(
    /fetch\s*\(|WebSocket|XMLHttpRequest|child_process|supabase|BankID|Avanza|process\.env|databaseClient|transportAdapter|orderRoute/,
  );
  expect(source).toContain("transport_attached: false");
  expect(source).toContain("dispatch_permitted: false");
  expect(source).toContain("broker_submission_allowed: false");
});

test("654S and 654T preservation bytes remain exact", () => {
  expect(
    execFileSync(
      "git",
      ["rev-parse", "refs/codex-preservation/action-654s-fail-fast-separated-string-budget"],
      { cwd: root },
    ).toString().trim(),
  ).toBe("5656fc8bd37bb042bac58ed65bbd117b5cf07db4");
  expect(
    execFileSync(
      "git",
      ["rev-parse", "refs/codex-preservation/action-654t-fail-fast-string-budget-freeze-review"],
      { cwd: root },
    ).toString().trim(),
  ).toBe("de319405869af7df8d9fe3fae459f7e12c95dae6");
});

test("historical 654S remains historical and is not used by the successor", () => {
  const historical = runAction654sFailFastSeparatedStringBudget(
    action654uCanonicalGates.enabled,
    action654uPlainFixture("action_654u_historical_only"),
  );
  const successorSource = readFileSync(
    resolve(root, "lib/action-654u-exact-budget-unit-private-policy.ts"),
    "utf8",
  );
  expect(historical.contract_version).toBe(
    "action_654s_fail_fast_separated_string_budget_v1",
  );
  expect(successorSource).not.toContain(
    "action-654s-fail-fast-separated-string-budget",
  );
});
