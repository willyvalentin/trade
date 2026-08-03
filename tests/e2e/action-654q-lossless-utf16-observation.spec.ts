import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  runAction654oCanonicalReadinessGate,
} from "../../lib/action-654o-hook-free-canonical-readiness-gate";
import {
  action654qCanonicalGates,
  action654qStringBudgets,
  runAction654qLosslessUtf16ReadinessGate,
} from "../../lib/action-654q-lossless-utf16-observation";
import { runAction654hPrivateReadinessComposition } from "../../lib/action-654h-private-readiness-provenance";
import golden from "../../docs/action-654q-lossless-utf16-observation-golden-report.json";
import {
  action654qGoldenCases,
  action654qMalformedGateCases,
  action654qPlainFixture,
  action654qSurrogateMatrix,
  action654qUnicodeDistinctMatrix,
  runAction654qPlainFixture,
} from "../fixtures/action-654q-lossless-utf16-observation-fixtures";

const root = resolve(__dirname, "../..");

function downstreamEffectsAreZero(
  result: ReturnType<typeof runAction654qLosslessUtf16ReadinessGate>,
) {
  expect(result.effects).toMatchObject({
    v5_invocations: 0,
    v5_establishments: 0,
    capsule_mints: 0,
    readiness_classifications: 0,
    confirmation_consumptions: 0,
    getter_executions: 0,
    proxy_hooks_executed: 0,
    callback_executions: 0,
    transport_requests: 0,
    broker_submissions: 0,
    database_writes: 0,
    trade_mutations: 0,
  });
}

test("654P-M1 reproduces against 654O through lone-surrogate replacement", () => {
  const first = runAction654oCanonicalReadinessGate(
    "{\ud800",
    action654qPlainFixture("action_654q_historical_p_m1_a"),
  );
  const second = runAction654oCanonicalReadinessGate(
    "{\ud801",
    action654qPlainFixture("action_654q_historical_p_m1_b"),
  );
  expect(first.observed_string_digest).toBe(second.observed_string_digest);
  expect(first.failure_identity).toBe(second.failure_identity);
});

test("U+D800 and U+D801 have distinct observation, failure, and terminal digests", () => {
  const first = runAction654qLosslessUtf16ReadinessGate(
    "{\ud800",
    action654qPlainFixture("action_654q_p_m1_a"),
  );
  const second = runAction654qLosslessUtf16ReadinessGate(
    "{\ud801",
    action654qPlainFixture("action_654q_p_m1_b"),
  );
  expect(first.failure_reason).toBe("gate_json_parse_failed");
  expect(second.failure_reason).toBe("gate_json_parse_failed");
  expect(first.observed_string_digest).not.toBe(second.observed_string_digest);
  expect(first.failure_identity).not.toBe(second.failure_identity);
  expect(first.terminal_digest).not.toBe(second.terminal_digest);
});

test("full lone-surrogate and pair matrix is collision free", () => {
  const results = Object.entries(action654qSurrogateMatrix).map(
    ([name, input]) => ({
      name,
      result: runAction654qLosslessUtf16ReadinessGate(
        input,
        action654qPlainFixture(`action_654q_surrogate_${name}`),
      ),
    }),
  );
  for (const { result } of results) {
    expect(result.failure_reason).toBe("gate_json_parse_failed");
    expect(result.observed_string_encoding).toBe("uint16_big_endian_hex");
    expect(result.observed_string_digest).toMatch(
      /^action_654q_observed_gate_utf16_[a-f0-9]{64}$/,
    );
    downstreamEffectsAreZero(result);
  }
  expect(new Set(results.map(({ result }) => result.observed_string_digest)).size)
    .toBe(results.length);
  expect(new Set(results.map(({ result }) => result.failure_identity)).size)
    .toBe(results.length);
  expect(new Set(results.map(({ result }) => result.terminal_digest)).size)
    .toBe(results.length);
});

test("isolated Action 654Q surrogate golden probe", () => {
  test.skip(process.env.ACTION654Q_SURROGATE_PROBE !== "true", "probe-only test");
  const rows = Object.entries(action654qSurrogateMatrix).map(([name, input]) => {
    const result = runAction654qLosslessUtf16ReadinessGate(
      input,
      action654qPlainFixture(`action_654q_surrogate_probe_${name}`),
    );
    return {
      name,
      code_unit_count: result.observed_string_code_unit_count,
      code_unit_byte_count: result.observed_string_code_unit_byte_count,
      observed_string_digest: result.observed_string_digest,
      failure_identity: result.failure_identity,
      terminal_digest: result.terminal_digest,
    };
  });
  console.log(`ACTION654Q_SURROGATES:${JSON.stringify(rows)}`);
});

test("normalization and case folding are absent from observed identity", () => {
  const results = Object.entries(action654qUnicodeDistinctMatrix).map(
    ([name, input]) =>
      runAction654qLosslessUtf16ReadinessGate(
        input,
        action654qPlainFixture(`action_654q_unicode_${name}`),
      ),
  );
  expect(new Set(results.map((result) => result.observed_string_digest)).size)
    .toBe(results.length);
  expect(new Set(results.map((result) => result.failure_identity)).size)
    .toBe(results.length);
});

test("objects, accessors, proxies, boxed strings, and functions reject with zero hooks", () => {
  let getterHooks = 0;
  const accessor = Object.defineProperty({}, "enabled", {
    get() {
      getterHooks += 1;
      throw new Error("must not execute");
    },
  });
  let proxyHooks = 0;
  const proxy = new Proxy({}, {
    get() { proxyHooks += 1; throw new Error("must not read"); },
    getPrototypeOf() { proxyHooks += 1; throw new Error("must not reflect"); },
    getOwnPropertyDescriptor() { proxyHooks += 1; throw new Error("must not inspect"); },
    ownKeys() { proxyHooks += 1; throw new Error("must not enumerate"); },
  });
  let callbackHooks = 0;
  const callback = () => {
    callbackHooks += 1;
    return action654qCanonicalGates.enabled;
  };
  for (const value of [
    {},
    accessor,
    proxy,
    new String(action654qCanonicalGates.enabled),
    callback,
  ]) {
    const result = runAction654qLosslessUtf16ReadinessGate(
      value,
      action654qPlainFixture("action_654q_hook_reject"),
    );
    expect(result.failure_reason).toBe("gate_input_not_primitive_string");
    expect(result.effects).toMatchObject({
      primitive_captures: 1,
      caller_property_reads: 0,
      reflection_operations_on_caller_input: 0,
      budget_checks: 0,
      observed_code_unit_reads: 0,
      parser_invocations: 0,
    });
    downstreamEffectsAreZero(result);
  }
  expect(getterHooks).toBe(0);
  expect(proxyHooks).toBe(0);
  expect(callbackHooks).toBe(0);
});

test("code-unit and byte budgets reject before observation digest and parsing", () => {
  const rows = [
    [
      "x".repeat(action654qStringBudgets.maximum_code_units + 1),
      "gate_code_unit_budget_exceeded",
    ],
    [
      "x".repeat(action654qStringBudgets.maximum_code_unit_bytes / 2 + 1),
      "gate_code_unit_byte_budget_exceeded",
    ],
  ] as const;
  for (const [input, reason] of rows) {
    const result = runAction654qLosslessUtf16ReadinessGate(
      input,
      action654qPlainFixture(`action_654q_budget_${reason}`),
    );
    expect(result.failure_reason).toBe(reason);
    expect(result.observed_string_digest).toBeNull();
    expect(result.effects).toMatchObject({
      budget_checks: 2,
      observed_code_unit_reads: 0,
      observation_digest_operations: 0,
      parser_invocations: 0,
    });
    expect(result.failure_identity).not.toContain(input);
    downstreamEffectsAreZero(result);
  }
});

test("canonical gate schema preserves exact 654O semantics", () => {
  for (const [name, canonical] of Object.entries(action654qCanonicalGates)) {
    const result = runAction654qLosslessUtf16ReadinessGate(
      canonical,
      action654qPlainFixture(`action_654q_gate_${name}`),
    );
    expect(result.boundary_status).toBe("accepted");
    expect(result.gate_snapshot).toEqual(JSON.parse(canonical));
    expect(Object.isFrozen(result.gate_snapshot)).toBe(true);
    expect(result.effects).toMatchObject({
      primitive_captures: 1,
      budget_checks: 2,
      observed_code_unit_reads: canonical.length,
      observation_digest_operations: 1,
      parser_invocations: 1,
      gate_snapshot_constructions: 1,
    });
  }
});

test("malformed and noncanonical strings have distinct sanitized identities", () => {
  const inputs = [
    ...Object.values(action654qMalformedGateCases),
    ...Object.values(action654qSurrogateMatrix),
    ...Object.values(action654qUnicodeDistinctMatrix),
  ];
  const results = inputs.map((input, index) =>
    runAction654qLosslessUtf16ReadinessGate(
      input,
      action654qPlainFixture(`action_654q_malformed_${index}`),
    ),
  );
  expect(new Set(results.map((result) => result.failure_identity)).size)
    .toBe(results.length);
  expect(new Set(results.map((result) => result.terminal_digest)).size)
    .toBe(results.length);
  for (const [index, result] of results.entries()) {
    expect(result.boundary_status).toBe("rejected");
    expect(result.observed_string_digest).not.toContain(inputs[index]);
    expect(result.failure_identity).not.toContain(inputs[index]);
    expect(result.terminal_digest).not.toContain(inputs[index]);
    downstreamEffectsAreZero(result);
  }
});

test("single captured primitive produces frozen engine-owned snapshot only", () => {
  const result = runAction654qPlainFixture("action_654q_snapshot_only");
  expect(result.effects.primitive_captures).toBe(1);
  expect(result.effects.caller_property_reads).toBe(0);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.gate_snapshot)).toBe(true);
  expect(result.observed_string_code_unit_count).toBe(
    action654qCanonicalGates.enabled.length,
  );
  expect(result.observed_string_code_unit_byte_count).toBe(
    action654qCanonicalGates.enabled.length * 2,
  );
});

test("654N-M1 remains closed at the hook-free boundary", () => {
  let getterHooks = 0;
  const historicalGate = Object.defineProperty({}, "enabled", {
    get() {
      getterHooks += 1;
      return false;
    },
  }) as { enabled: boolean; kill_switch_active: boolean };
  runAction654hPrivateReadinessComposition(
    historicalGate,
    action654qPlainFixture("action_654q_historical_n_m1"),
  );
  expect(getterHooks).toBe(1);

  getterHooks = 0;
  const rejected = runAction654qLosslessUtf16ReadinessGate(
    historicalGate,
    action654qPlainFixture("action_654q_closed_n_m1"),
  );
  expect(rejected.failure_reason).toBe("gate_input_not_primitive_string");
  expect(getterHooks).toBe(0);
  downstreamEffectsAreZero(rejected);
});

test("invalid attempts consume zero while valid composition establishes once", () => {
  const invalid = runAction654qLosslessUtf16ReadinessGate(
    action654qCanonicalGates.enabled,
    { ...action654qPlainFixture("action_654q_invalid"), extra: true },
  );
  expect(invalid.predecessor_result?.readiness_status).not.toBe("ready");
  downstreamEffectsAreZero(invalid);

  const valid = runAction654qPlainFixture("action_654q_valid_single");
  expect(valid.predecessor_result?.readiness_status).toBe("ready");
  expect(valid.effects).toMatchObject({
    v5_invocations: 1,
    v5_establishments: 1,
    capsule_mints: 1,
    readiness_classifications: 1,
    confirmation_consumptions: 1,
  });
});

test("idempotency, conflict, and strict temporal behavior are preserved", () => {
  const input = action654qPlainFixture("action_654q_idempotency");
  const first = runAction654qLosslessUtf16ReadinessGate(
    action654qCanonicalGates.enabled,
    input,
  );
  const duplicate = runAction654qLosslessUtf16ReadinessGate(
    action654qCanonicalGates.enabled,
    structuredClone(input),
  );
  expect(first.predecessor_result?.terminal_reason).toBe("readiness_ready");
  expect(duplicate.predecessor_result).toMatchObject({
    terminal_reason: "exact_duplicate_idempotent",
    idempotent_replay: true,
  });
  expect(duplicate.effects.confirmation_consumptions).toBe(0);

  const conflict = runAction654qLosslessUtf16ReadinessGate(
    action654qCanonicalGates.enabled,
    { ...input, evaluated_at: "2026-07-29T10:05:00.000000001Z" },
  );
  expect(conflict.predecessor_result).toMatchObject({
    readiness_status: "conflicting",
    terminal_reason: "conflicting_readiness_reuse",
  });
  expect(conflict.effects.confirmation_consumptions).toBe(0);

  const before = runAction654qPlainFixture("action_654q_expiry_before", {
    evaluated_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(before.predecessor_result?.readiness_status).toBe("ready");
  for (const [name, evaluatedAt] of [
    ["boundary", "2026-07-29T10:10:00.000000000Z"],
    ["after", "2026-07-29T10:10:00.000000001Z"],
  ] as const) {
    const result = runAction654qPlainFixture(`action_654q_expiry_${name}`, {
      evaluated_at: evaluatedAt,
    });
    expect(result.predecessor_result?.readiness_status).toBe("not_eligible");
    downstreamEffectsAreZero(result);
  }
});

test("source exports and runtime remain normalization-free and transport-inert", async () => {
  const implementation = readFileSync(
    resolve(root, "lib/action-654q-lossless-utf16-observation.ts"),
    "utf8",
  );
  expect(implementation).not.toMatch(
    /TextEncoder|normalize\s*\(|toLocale|rebuildAndVerifyV5|runAction653s|fetch\s*\(|WebSocket|supabase|child_process/,
  );
  expect(implementation).toContain('code_unit_encoding: observationEncoding');
  expect(implementation).toContain('code_unit_endianness: "big"');
  expect(implementation).toContain("runAction654hPrivateReadinessComposition");
  const runtime = await import("../../lib/action-654q-lossless-utf16-observation");
  const publicExports = Object.keys(runtime)
    .filter((key) => !["__esModule", "default", "module.exports"].includes(key))
    .sort();
  expect(publicExports).toEqual([
    "action654qCanonicalGates",
    "action654qStringBudgets",
    "runAction654qLosslessUtf16ReadinessGate",
  ]);

  const result = runAction654qPlainFixture("action_654q_transport_inert");
  expect(result.safety).toEqual(golden.safety);
  expect(result.predecessor_result?.readiness_envelope).toMatchObject({
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
  });
  expect(result.effects).toMatchObject({
    transport_requests: 0,
    broker_submissions: 0,
    database_writes: 0,
    trade_mutations: 0,
  });
});

test("isolated Action 654Q deterministic process probe", () => {
  const clock = process.env.ACTION654Q_PROCESS_CLOCK as
    | "utc_a"
    | "utc_b"
    | "stockholm"
    | "new_york"
    | undefined;
  test.skip(!clock, "probe-only test");
  const result = runAction654qPlainFixture("action_654q_process_golden", {
    clock,
    reverse_input_order: process.env.ACTION654Q_REVERSE === "true",
  });
  console.log(`ACTION654Q_PROCESS:${JSON.stringify({
    boundary_status: result.boundary_status,
    observed_string_digest: result.observed_string_digest,
    terminal_digest: result.terminal_digest,
    readiness_status: result.predecessor_result?.readiness_status,
    terminal_reason: result.predecessor_result?.terminal_reason,
    observed_input_digest: result.predecessor_result?.observed_input_digest,
    readiness_identity: result.predecessor_result?.readiness_envelope?.readiness_identity,
    readiness_digest: result.predecessor_result?.readiness_envelope?.readiness_digest,
    instruction_identity: result.predecessor_result?.readiness_envelope?.instruction_identity,
    synthetic_replay_identity: result.predecessor_result?.readiness_envelope?.synthetic_replay_identity,
  })}`);
});

test("golden matrix is deterministic across processes, timezones, and input order", () => {
  test.setTimeout(150_000);
  const rows = action654qGoldenCases.map((item) => {
    const output = execFileSync(
      process.env.ACTION654Q_PLAYWRIGHT_BIN ??
        resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-654q-lossless-utf16-observation.spec.ts",
        "--grep",
        "isolated Action 654Q deterministic process probe",
        "--reporter=line",
        "--workers=1",
        "--output",
        `/private/tmp/action-654q-process-${item.name}`,
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          TZ:
            item.clock === "stockholm"
              ? "Europe/Stockholm"
              : item.clock === "new_york"
                ? "America/New_York"
                : "UTC",
          ACTION654Q_PROCESS_CLOCK: item.clock,
          ACTION654Q_REVERSE: String(item.reverse_input_order),
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
        },
        encoding: "utf8",
      },
    );
    const line = output.split("\n").find((value) => value.includes("ACTION654Q_PROCESS:"));
    if (!line) throw new Error("determinism marker missing");
    return {
      name: item.name,
      ...JSON.parse(line.replace(/^.*ACTION654Q_PROCESS:/, "").trim()),
    };
  });
  expect(rows).toEqual(golden.cases);
  expect(new Set(rows.map((row) => JSON.stringify({ ...row, name: undefined }))).size)
    .toBe(1);
});
