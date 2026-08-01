import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { hashAction650sCanonicalValue } from "../../lib/action-650s-execution-identity";
import { runAction654hPrivateReadinessComposition } from "../../lib/action-654h-private-readiness-provenance";
import { runAction654oCanonicalReadinessGate } from "../../lib/action-654o-hook-free-canonical-readiness-gate";
import {
  action654qCanonicalGates,
  action654qStringBudgets,
  runAction654qLosslessUtf16ReadinessGate,
} from "../../lib/action-654q-lossless-utf16-observation";
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
const normativeRef =
  "refs/codex-preservation/action-654q-lossless-utf16-observation";
const normativeObject = "5eb06cb7f1b6c476665ee8a127097600a2130a95";
const normativeTree = "30f4511952a555fb8e91179a602b1dcd8121ff91";
const normativeParent = "56b76fe478cb64ff51aa065391623ca51e5a716f";
const normativeDigest =
  "4e39e092355845c23bcc67b58e63c1e466c2a8a3c4e84779536c2d12924b85fd";
const normativePaths = [
  "docs/action-654q-lossless-utf16-observation-contract.md",
  "docs/action-654q-lossless-utf16-observation-golden-report.json",
  "lib/action-654q-lossless-utf16-observation.ts",
  "tests/e2e/action-654q-lossless-utf16-observation.spec.ts",
  "tests/fixtures/action-654q-lossless-utf16-observation-fixtures.ts",
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

function independentObservationDigest(value: string) {
  const codeUnits: string[] = [];
  for (let index = 0; index < value.length; index += 1) {
    codeUnits.push(value.charCodeAt(index).toString(16).padStart(4, "0"));
  }
  return `action_654q_observed_gate_utf16_${hashAction650sCanonicalValue({
    frame_version: "action_654q_utf16_observation_frame_v1",
    input_domain: "action_654q_canonical_readiness_gate_input",
    policy_version: "action_654q_lossless_utf16_policy_v1",
    code_unit_encoding: "uint16_big_endian_hex",
    code_unit_endianness: "big",
    code_unit_count: value.length,
    code_unit_byte_count: value.length * 2,
    code_units_big_endian_hex: codeUnits.join(""),
  })}`;
}

function expectDownstreamZero(
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

test("rebuilds exact frozen five-path authority and worktree parity", () => {
  expect(git("rev-parse", normativeRef).toString().trim()).toBe(normativeObject);
  expect(git("rev-parse", `${normativeRef}^{tree}`).toString().trim()).toBe(
    normativeTree,
  );
  expect(git("rev-parse", `${normativeRef}^`).toString().trim()).toBe(
    normativeParent,
  );
  const paths = git(
    "diff-tree",
    "--no-commit-id",
    "--name-only",
    "-r",
    normativeRef,
  ).toString().trim().split("\n");
  expect(paths).toEqual(normativePaths);
  expect(rebuildNormativeDigest()).toBe(normativeDigest);
  for (const path of normativePaths) {
    expect(sha256(readFileSync(resolve(root, path)))).toBe(
      sha256(git("show", `${normativeRef}:${path}`)),
    );
  }
});

test("independently rebuilds exact big-endian UTF-16 code-unit observations", () => {
  const values = [
    ...Object.values(action654qSurrogateMatrix),
    ...Object.values(action654qUnicodeDistinctMatrix),
  ];
  const results = values.map((value, index) =>
    runAction654qLosslessUtf16ReadinessGate(
      value,
      action654qPlainFixture(`action_654q_r_rebuild_${index}`),
    ),
  );
  for (const [index, result] of results.entries()) {
    expect(result.observed_string_digest).toBe(
      independentObservationDigest(values[index]),
    );
    expect(result.observed_string_code_unit_count).toBe(values[index].length);
    expect(result.observed_string_code_unit_byte_count).toBe(
      values[index].length * 2,
    );
  }
  expect(new Set(results.map((result) => result.observed_string_digest)).size)
    .toBe(results.length);
});

test("654P-M1 reproduces against 654O and is closed by 654Q", () => {
  const inputs = ["{\ud800", "{\ud801"] as const;
  const historical = inputs.map((input, index) =>
    runAction654oCanonicalReadinessGate(
      input,
      action654qPlainFixture(`action_654q_r_historical_${index}`),
    ),
  );
  expect(historical[0].observed_string_digest).toBe(
    historical[1].observed_string_digest,
  );
  expect(historical[0].failure_identity).toBe(historical[1].failure_identity);

  const successor = inputs.map((input, index) =>
    runAction654qLosslessUtf16ReadinessGate(
      input,
      action654qPlainFixture(`action_654q_r_successor_${index}`),
    ),
  );
  expect(successor[0].observed_string_digest).not.toBe(
    successor[1].observed_string_digest,
  );
  expect(successor[0].failure_identity).not.toBe(successor[1].failure_identity);
  expect(successor[0].terminal_digest).not.toBe(successor[1].terminal_digest);
});

test("surrogate, separated-pair, normalization, and case matrices are collision free", () => {
  const inputs = [
    ...Object.values(action654qSurrogateMatrix),
    ...Object.values(action654qUnicodeDistinctMatrix),
  ];
  const results = inputs.map((input, index) =>
    runAction654qLosslessUtf16ReadinessGate(
      input,
      action654qPlainFixture(`action_654q_r_matrix_${index}`),
    ),
  );
  expect(new Set(results.map((result) => result.observed_string_digest)).size)
    .toBe(results.length);
  expect(new Set(results.map((result) => result.failure_identity)).size)
    .toBe(results.length);
  expect(new Set(results.map((result) => result.terminal_digest)).size)
    .toBe(results.length);
});

test("654R-M1 reproduces incomplete budget model and post-rejection digest work", () => {
  expect(action654qStringBudgets).toEqual({
    maximum_code_units: 128,
    maximum_code_unit_bytes: 224,
  });
  expect("maximum_total_bytes" in action654qStringBudgets).toBe(false);

  const encodedMinusOne = runAction654qLosslessUtf16ReadinessGate(
    "x".repeat(111),
    action654qPlainFixture("action_654q_r_encoded_minus_one"),
  );
  const encodedBoundary = runAction654qLosslessUtf16ReadinessGate(
    "x".repeat(112),
    action654qPlainFixture("action_654q_r_encoded_boundary"),
  );
  const encodedPlusOne = runAction654qLosslessUtf16ReadinessGate(
    "x".repeat(113),
    action654qPlainFixture("action_654q_r_encoded_plus_one"),
  );
  expect(encodedMinusOne.observed_string_digest).not.toBeNull();
  expect(encodedBoundary.observed_string_digest).not.toBeNull();
  expect(encodedPlusOne.failure_reason).toBe(
    "gate_code_unit_byte_budget_exceeded",
  );
  expect(encodedPlusOne.observed_string_digest).toBeNull();
  expect(encodedPlusOne.effects).toMatchObject({
    observation_digest_operations: 0,
    parser_invocations: 0,
    failure_digest_operations: 1,
    terminal_digest_operations: 1,
  });

  const codeUnitMinusOne = runAction654qLosslessUtf16ReadinessGate(
    "x".repeat(127),
    action654qPlainFixture("action_654q_r_units_minus_one"),
  );
  const codeUnitBoundary = runAction654qLosslessUtf16ReadinessGate(
    "x".repeat(128),
    action654qPlainFixture("action_654q_r_units_boundary"),
  );
  const codeUnitPlusOne = runAction654qLosslessUtf16ReadinessGate(
    "x".repeat(129),
    action654qPlainFixture("action_654q_r_units_plus_one"),
  );
  expect(codeUnitMinusOne.failure_reason).toBe(
    "gate_code_unit_byte_budget_exceeded",
  );
  expect(codeUnitBoundary.failure_reason).toBe(
    "gate_code_unit_byte_budget_exceeded",
  );
  expect(codeUnitPlusOne.failure_reason).toBe("gate_code_unit_budget_exceeded");
  expect(codeUnitPlusOne.effects.failure_digest_operations).toBe(1);
  expect(codeUnitPlusOne.effects.terminal_digest_operations).toBe(1);
});

test("ordinary malformed inputs bind distinct sanitized failure and terminal identities", () => {
  const inputs = [
    ...Object.values(action654qMalformedGateCases),
    ...Object.values(action654qSurrogateMatrix),
  ];
  const results = inputs.map((input, index) =>
    runAction654qLosslessUtf16ReadinessGate(
      input,
      action654qPlainFixture(`action_654q_r_malformed_${index}`),
    ),
  );
  expect(new Set(results.map((result) => result.failure_identity)).size)
    .toBe(results.length);
  for (const [index, result] of results.entries()) {
    expect(result.observed_string_digest).not.toContain(inputs[index]);
    expect(result.failure_identity).not.toContain(inputs[index]);
    expect(result.terminal_digest).not.toContain(inputs[index]);
  }
});

test("primitive-only boundary rejects objects, proxies, boxed strings, and functions hook-free", () => {
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
  for (const input of [
    {},
    accessor,
    proxy,
    new String(action654qCanonicalGates.enabled),
    callback,
  ]) {
    const result = runAction654qLosslessUtf16ReadinessGate(
      input,
      action654qPlainFixture("action_654q_r_hook_reject"),
    );
    expect(result.failure_reason).toBe("gate_input_not_primitive_string");
    expect(result.effects).toMatchObject({
      caller_property_reads: 0,
      reflection_operations_on_caller_input: 0,
      observed_code_unit_reads: 0,
      parser_invocations: 0,
    });
    expectDownstreamZero(result);
  }
  expect(getterHooks).toBe(0);
  expect(proxyHooks).toBe(0);
  expect(callbackHooks).toBe(0);
});

test("single capture produces frozen engine-owned snapshot used downstream", () => {
  const result = runAction654qPlainFixture("action_654q_r_snapshot");
  expect(result.effects.primitive_captures).toBe(1);
  expect(result.effects.caller_property_reads).toBe(0);
  expect(result.gate_snapshot).toEqual({
    version: "action_654o_canonical_gate_v1",
    enabled: true,
    kill_switch_active: false,
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.gate_snapshot)).toBe(true);
  expect(result.predecessor_result?.readiness_status).toBe("ready");
});

test("654N-M1 stays closed and consumption matrix remains private and one-shot", () => {
  let getterHooks = 0;
  const historicalGate = Object.defineProperty({}, "enabled", {
    get() {
      getterHooks += 1;
      return false;
    },
  }) as { enabled: boolean; kill_switch_active: boolean };
  runAction654hPrivateReadinessComposition(
    historicalGate,
    action654qPlainFixture("action_654q_r_historical_n_m1"),
  );
  expect(getterHooks).toBe(1);
  getterHooks = 0;
  const rejected = runAction654qLosslessUtf16ReadinessGate(
    historicalGate,
    action654qPlainFixture("action_654q_r_closed_n_m1"),
  );
  expect(getterHooks).toBe(0);
  expectDownstreamZero(rejected);

  const invalid = runAction654qLosslessUtf16ReadinessGate(
    action654qCanonicalGates.enabled,
    { ...action654qPlainFixture("action_654q_r_invalid"), extra: true },
  );
  expectDownstreamZero(invalid);
  const valid = runAction654qPlainFixture("action_654q_r_valid");
  expect(valid.effects).toMatchObject({
    v5_invocations: 1,
    v5_establishments: 1,
    capsule_mints: 1,
    readiness_classifications: 1,
    confirmation_consumptions: 1,
  });
});

test("runtime/source exports exclude normalization, transport, credentials, DB, and writes", async () => {
  const implementation = readFileSync(
    resolve(root, "lib/action-654q-lossless-utf16-observation.ts"),
    "utf8",
  );
  expect(implementation).not.toMatch(
    /TextEncoder|codePointAt|normalize\s*\(|toLocale|fetch\s*\(|WebSocket|XMLHttpRequest|supabase|child_process|provider_calls/,
  );
  expect(implementation).toContain('code_unit_endianness: "big"');
  expect(implementation).toContain("runAction654hPrivateReadinessComposition");
  const runtime = await import("../../lib/action-654q-lossless-utf16-observation");
  expect(
    Object.keys(runtime)
      .filter((key) => !["__esModule", "default", "module.exports"].includes(key))
      .sort(),
  ).toEqual([
    "action654qCanonicalGates",
    "action654qStringBudgets",
    "runAction654qLosslessUtf16ReadinessGate",
  ]);
  const result = runAction654qPlainFixture("action_654q_r_safety");
  expect(result.safety).toEqual(golden.safety);
  expect(result.predecessor_result?.readiness_envelope).toMatchObject({
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
  });
});

test("independent UTC, Stockholm, New York, and reverse-order probes are identical", () => {
  test.setTimeout(150_000);
  const rows = action654qGoldenCases.map((item) => {
    const output = execFileSync(
      resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-654q-lossless-utf16-observation.spec.ts",
        "--grep",
        "isolated Action 654Q deterministic process probe",
        "--reporter=line",
        "--workers=1",
        "--output",
        `/private/tmp/action-654r-process-${item.name}`,
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
    const marker = output
      .split("\n")
      .find((line) => line.includes("ACTION654Q_PROCESS:"));
    if (!marker) throw new Error("determinism marker missing");
    return JSON.parse(marker.replace(/^.*ACTION654Q_PROCESS:/, "").trim());
  });
  expect(new Set(rows.map((row) => JSON.stringify(row))).size).toBe(1);
});
