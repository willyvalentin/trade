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
import golden from "../../docs/action-654s-fail-fast-separated-string-budget-golden-report.json";
import {
  action654sGoldenCases,
  action654sMalformedInputs,
  action654sPlainFixture,
  runAction654sPlainFixture,
} from "../fixtures/action-654s-fail-fast-separated-string-budget-fixtures";

const root = resolve(__dirname, "../..");

function expectWorkZero(value: ReturnType<typeof runAction654sFailFastSeparatedStringBudget>) {
  expect(Object.values(value.work).every((counter) => counter === 0)).toBe(true);
}

test("654R-M1 reproduces against 654Q and 654S closes all post-budget work", () => {
  expect(action654qStringBudgets).toEqual({
    maximum_code_units: 128,
    maximum_code_unit_bytes: 224,
  });
  const historical = runAction654qLosslessUtf16ReadinessGate(
    "x".repeat(129),
    action654sPlainFixture("action_654s_historical_r_m1"),
  );
  expect(historical.effects).toMatchObject({
    failure_digest_operations: 1,
    terminal_digest_operations: 1,
  });

  const successor = runAction654sFailFastSeparatedStringBudget(
    "x".repeat(129),
    action654sPlainFixture("action_654s_r_m1_closed"),
  );
  expect(successor.boundary_status).toBe("budget_rejected");
  expect(successor.budget_rejection).toMatchObject({
    reason: "maximum_code_units_exceeded",
    cryptographic_input_binding_claimed: false,
  });
  expect(successor.failure_identity).toBeNull();
  expect(successor.terminal_digest).toBeNull();
  expectWorkZero(successor);
});

test("three private policies independently expose minus one, exact, and plus one", () => {
  const matrix = readAction654sPrivateBoundaryMatrixForReview();
  expect(matrix.code_units).toEqual([
    { offset: -1, code_unit_count: 7, status: "within_budget", reason: null, budget_rejection_work_is_zero: null },
    { offset: 0, code_unit_count: 8, status: "within_budget", reason: null, budget_rejection_work_is_zero: null },
    { offset: 1, code_unit_count: 9, status: "budget_rejected", reason: "maximum_code_units_exceeded", budget_rejection_work_is_zero: true },
  ]);
  expect(matrix.observation_bytes.map(({ status, reason, budget_rejection_work_is_zero }) => ({ status, reason, budget_rejection_work_is_zero }))).toEqual([
    { status: "within_budget", reason: null, budget_rejection_work_is_zero: null },
    { status: "within_budget", reason: null, budget_rejection_work_is_zero: null },
    { status: "budget_rejected", reason: "maximum_observation_bytes_exceeded", budget_rejection_work_is_zero: true },
  ]);
  expect(matrix.total_bytes.map(({ status, reason, budget_rejection_work_is_zero }) => ({ status, reason, budget_rejection_work_is_zero }))).toEqual([
    { status: "within_budget", reason: null, budget_rejection_work_is_zero: null },
    { status: "within_budget", reason: null, budget_rejection_work_is_zero: null },
    { status: "budget_rejected", reason: "maximum_total_bytes_exceeded", budget_rejection_work_is_zero: true },
  ]);
  expect(matrix.unsafe_arithmetic).toEqual({
    status: "budget_rejected",
    reason: "unsafe_budget_arithmetic",
  });
  expect(Object.isFrozen(matrix)).toBe(true);
});

test("oversized rejection has zero framing, iteration, digest, parse, capsule, readiness, V5, and consumption", () => {
  for (const length of [129, 1_024, 16_384]) {
    const result = runAction654sFailFastSeparatedStringBudget(
      "x".repeat(length),
      action654sPlainFixture(`action_654s_oversized_${length}`),
    );
    expect(result.boundary_status).toBe("budget_rejected");
    expect(result.capture).toEqual({
      primitive_captures: 1,
      primitive_length_reads: 1,
    });
    expect(result.observed_string_digest).toBeNull();
    expect(result.failure_identity).toBeNull();
    expect(result.terminal_digest).toBeNull();
    expectWorkZero(result);
  }
});

test("policy override, clone, proxy, and self-mint attempts reject without inspection", () => {
  let hooks = 0;
  const forged = new Proxy({
    maximum_code_units: Number.MAX_SAFE_INTEGER,
    maximum_observation_bytes: Number.MAX_SAFE_INTEGER,
    maximum_total_bytes: Number.MAX_SAFE_INTEGER,
  }, {
    get() { hooks += 1; throw new Error("must not read"); },
    ownKeys() { hooks += 1; throw new Error("must not enumerate"); },
    getOwnPropertyDescriptor() { hooks += 1; throw new Error("must not inspect"); },
  });
  const operation = runAction654sFailFastSeparatedStringBudget as unknown as (
    gate: unknown,
    input: unknown,
    policy: unknown,
  ) => ReturnType<typeof runAction654sFailFastSeparatedStringBudget>;
  const result = operation(
    action654sCanonicalGates.enabled,
    action654sPlainFixture("action_654s_policy_forge"),
    forged,
  );
  expect(result.failure_reason).toBe("budget_policy_override_rejected");
  expect(hooks).toBe(0);
  expectWorkZero(result);
});

test("primitive boundary rejects objects, accessors, proxies, boxed strings, and callbacks hook-free", () => {
  let getterHooks = 0;
  const accessor = Object.defineProperty({}, "length", {
    get() { getterHooks += 1; throw new Error("must not read"); },
  });
  let proxyHooks = 0;
  const proxy = new Proxy({}, {
    get() { proxyHooks += 1; throw new Error("must not read"); },
    getPrototypeOf() { proxyHooks += 1; throw new Error("must not reflect"); },
    ownKeys() { proxyHooks += 1; throw new Error("must not enumerate"); },
  });
  let callbacks = 0;
  const callback = () => { callbacks += 1; return action654sCanonicalGates.enabled; };
  for (const value of [{}, accessor, proxy, new String(action654sCanonicalGates.enabled), callback]) {
    const result = runAction654sFailFastSeparatedStringBudget(
      value,
      action654sPlainFixture("action_654s_hook_free"),
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

test("in-budget UTF-16 surrogate and normalization identities remain collision free", () => {
  const inputs = Object.values(action654sMalformedInputs);
  const results = inputs.map((input, index) =>
    runAction654sFailFastSeparatedStringBudget(
      input,
      action654sPlainFixture(`action_654s_malformed_${index}`),
    ),
  );
  expect(new Set(results.map(({ observed_string_digest }) => observed_string_digest)).size)
    .toBe(results.length);
  expect(new Set(results.map(({ failure_identity }) => failure_identity)).size)
    .toBe(results.length);
  expect(new Set(results.map(({ terminal_digest }) => terminal_digest)).size)
    .toBe(results.length);
  for (const [index, result] of results.entries()) {
    expect(result.boundary_status).toBe("rejected");
    expect(result.failure_identity).not.toContain(inputs[index]);
    expect(result.terminal_digest).not.toContain(inputs[index]);
  }
});

test("canonical schema and private readiness consumption semantics are preserved", () => {
  const disabled = runAction654sFailFastSeparatedStringBudget(
    action654sCanonicalGates.disabled,
    action654sPlainFixture("action_654s_disabled"),
  );
  const killed = runAction654sFailFastSeparatedStringBudget(
    action654sCanonicalGates.kill_switch_active,
    action654sPlainFixture("action_654s_killed"),
  );
  const valid = runAction654sPlainFixture("action_654s_valid");
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
  const clock = process.env.ACTION654S_PROCESS_CLOCK as
    | "utc_a"
    | "utc_b"
    | "stockholm"
    | "new_york"
    | undefined;
  test.skip(!clock, "probe-only test");
  const result = runAction654sPlainFixture("action_654s_process_golden", {
    clock,
    reverse_input_order: process.env.ACTION654S_REVERSE === "true",
  });
  console.log(`ACTION654S_PROCESS:${JSON.stringify({
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

test("cross-timezone and reverse-order golden outputs are deterministic", () => {
  test.setTimeout(150_000);
  const rows = action654sGoldenCases.map((entry) => {
    const output = execFileSync(
      resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-654s-fail-fast-separated-string-budget.spec.ts",
        "--grep",
        "isolated deterministic process probe",
        "--reporter=line",
        "--workers=1",
        "--output",
        `/private/tmp/action-654s-process-${entry.name}`,
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
          ACTION654S_PROCESS_CLOCK: entry.clock,
          ACTION654S_REVERSE: String(entry.reverse_input_order),
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
        },
        encoding: "utf8",
      },
    );
    const marker = output
      .split("\n")
      .find((value) => value.includes("ACTION654S_PROCESS:"));
    if (!marker) throw new Error("determinism marker missing");
    return {
      name: entry.name,
      ...JSON.parse(marker.replace(/^.*ACTION654S_PROCESS:/, "").trim()),
    };
  });
  expect(rows).toEqual(golden.cases);
  expect(new Set(rows.map((row) => JSON.stringify({ ...row, name: undefined }))).size)
    .toBe(1);
});

test("source scan keeps production policy private and transport capabilities absent", () => {
  const source = readFileSync(
    resolve(root, "lib/action-654s-fail-fast-separated-string-budget.ts"),
    "utf8",
  );
  expect(source).toContain("const productionBudgetPolicy");
  expect(source).not.toMatch(/export\s+const\s+productionBudgetPolicy/);
  expect(source).not.toMatch(/fetch\s*\(|WebSocket|child_process|supabase|BankID|Avanza/);
  expect(source).toContain("transport_attached: false");
  expect(source).toContain("dispatch_permitted: false");
  expect(source).toContain("broker_submission_allowed: false");
});

test("predecessor bytes and published PR head remain unchanged", () => {
  expect(execFileSync("git", ["rev-parse", "refs/codex-preservation/action-654q-lossless-utf16-observation"], { cwd: root }).toString().trim())
    .toBe("5eb06cb7f1b6c476665ee8a127097600a2130a95");
  expect(execFileSync("git", ["rev-parse", "refs/codex-preservation/action-654r-lossless-utf16-successor-freeze-review"], { cwd: root }).toString().trim())
    .toBe("649a373609dcb718398e0b3a556811ba7dbf9395");
  expect(execFileSync("git", ["rev-parse", "origin/codex/action-654a-transport-inert-dispatch-readiness"], { cwd: root }).toString().trim())
    .toBe("3330df9a368f7f9979ed0d4a10b2ecd44a6e2672");
});

test("golden safety and policy disclosure remain exact", () => {
  expect(golden.budget_policy).toEqual({
    policy_version: "action_654s_separated_string_budget_policy_v1",
    maximum_code_units: 128,
    maximum_observation_bytes: 384,
    maximum_total_bytes: 1984,
  });
  expect(golden.safety).toMatchObject({
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
    real_broker_submission: false,
    production_write: false,
  });
});
