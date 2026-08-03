import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  action654oCanonicalGates,
  action654oGateBudgets,
  runAction654oCanonicalReadinessGate,
} from "../../lib/action-654o-hook-free-canonical-readiness-gate";
import { runAction654hPrivateReadinessComposition } from "../../lib/action-654h-private-readiness-provenance";
import golden from "../../docs/action-654o-hook-free-canonical-readiness-gate-golden-report.json";
import {
  action654oGoldenCases,
  action654oMalformedGateCases,
  action654oPlainFixture,
  runAction654oPlainFixture,
} from "../fixtures/action-654o-hook-free-canonical-readiness-gate-fixtures";

const root = resolve(__dirname, "../..");

function downstreamEffectsAreZero(
  result: ReturnType<typeof runAction654oCanonicalReadinessGate>,
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

test("654N-M1 reproduces against 654H through caller-owned gate reads", () => {
  let getterHooks = 0;
  const gate = Object.defineProperty({}, "enabled", {
    enumerable: true,
    get() {
      getterHooks += 1;
      return false;
    },
  }) as { enabled: boolean; kill_switch_active: boolean };
  runAction654hPrivateReadinessComposition(
    gate,
    action654oPlainFixture("action_654h_654o_historical_getter"),
  );
  expect(getterHooks).toBe(1);
});

test("objects, accessors, proxies, boxed strings, and functions are hook-free rejected", () => {
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
  const values: unknown[] = [
    {},
    accessor,
    proxy,
    new String(action654oCanonicalGates.enabled),
    () => action654oCanonicalGates.enabled,
  ];
  for (const value of values) {
    const result = runAction654oCanonicalReadinessGate(
      value,
      action654oPlainFixture("action_654h_654o_hook_reject"),
    );
    expect(result.boundary_status).toBe("rejected");
    expect(result.failure_reason).toBe("gate_input_not_primitive_string");
    expect(result.effects).toMatchObject({
      primitive_captures: 1,
      caller_property_reads: 0,
      reflection_operations_on_caller_input: 0,
      parser_invocations: 0,
      gate_failure_digest_operations: 0,
    });
    downstreamEffectsAreZero(result);
  }
  expect(getterHooks).toBe(0);
  expect(proxyHooks).toBe(0);
});

test("canonical schema accepts only exact ordered primitive JSON bytes", () => {
  for (const [name, canonical] of Object.entries(action654oCanonicalGates)) {
    const result = runAction654oCanonicalReadinessGate(
      canonical,
      action654oPlainFixture(`action_654h_654o_gate_${name}`),
    );
    expect(result.boundary_status).toBe("accepted");
    expect(result.gate_snapshot).toEqual(JSON.parse(canonical));
    expect(Object.isFrozen(result.gate_snapshot)).toBe(true);
    expect(result.effects).toMatchObject({
      primitive_captures: 1,
      caller_property_reads: 0,
      reflection_operations_on_caller_input: 0,
      parser_invocations: 1,
      gate_snapshot_constructions: 1,
    });
  }
});

test("malformed, duplicate, reordered, extra, missing, and non-boolean gates fail distinctly", () => {
  const results = Object.entries(action654oMalformedGateCases).map(
    ([name, input]) => ({
      name,
      result: runAction654oCanonicalReadinessGate(
        input,
        action654oPlainFixture(`action_654h_654o_malformed_${name}`),
      ),
    }),
  );
  for (const { result } of results) {
    expect(result.boundary_status).toBe("rejected");
    expect(result.predecessor_result).toBeNull();
    expect(result.observed_string_digest).toMatch(/^action_654o_observed_gate_string_[a-f0-9]{64}$/);
    expect(result.failure_identity).toMatch(/^action_654o_gate_failure_[a-f0-9]{64}$/);
    expect(result.effects.gate_failure_digest_operations).toBe(2);
    downstreamEffectsAreZero(result);
  }
  expect(new Set(results.map(({ result }) => result.failure_identity)).size).toBe(
    results.length,
  );
});

test("character, UTF-8 byte, and parser budgets fail closed with sanitized reasons", () => {
  const characterOversized = "x".repeat(action654oGateBudgets.maximum_characters + 1);
  const utf8Oversized = `"${"😀".repeat(60)}"`;
  const rows = [
    [characterOversized, "gate_character_budget_exceeded", 0],
    [utf8Oversized, "gate_utf8_budget_exceeded", 0],
    ["{", "gate_json_parse_failed", 1],
    ["null", "gate_schema_rejected", 1],
  ] as const;
  for (const [input, reason, parserInvocations] of rows) {
    const result = runAction654oCanonicalReadinessGate(
      input,
      action654oPlainFixture("action_654h_654o_budget_reject"),
    );
    expect(result.failure_reason).toBe(reason);
    expect(result.effects.parser_invocations).toBe(parserInvocations);
    expect(result.failure_identity).not.toContain(input);
    downstreamEffectsAreZero(result);
  }
});

test("disabled and kill-switch canonical inputs perform zero downstream work", () => {
  let inputHooks = 0;
  const hostileInput = new Proxy({}, {
    get() { inputHooks += 1; throw new Error("must not read"); },
    getPrototypeOf() { inputHooks += 1; throw new Error("must not inspect"); },
    ownKeys() { inputHooks += 1; throw new Error("must not enumerate"); },
  });
  for (const canonical of [
    action654oCanonicalGates.disabled,
    action654oCanonicalGates.kill_switch_active,
  ]) {
    const result = runAction654oCanonicalReadinessGate(canonical, hostileInput);
    expect(result.boundary_status).toBe("accepted");
    expect(result.predecessor_result?.readiness_status).toBe("not_eligible");
    expect(result.predecessor_result?.effects.digest_operations).toBe(0);
    downstreamEffectsAreZero(result);
  }
  expect(inputHooks).toBe(0);
});

test("invalid input consumes nothing while valid composition establishes exactly once", () => {
  const invalid = runAction654oCanonicalReadinessGate(
    action654oCanonicalGates.enabled,
    { ...action654oPlainFixture("action_654h_654o_invalid"), extra: true },
  );
  expect(invalid.predecessor_result?.readiness_status).not.toBe("ready");
  downstreamEffectsAreZero(invalid);

  const valid = runAction654oPlainFixture("action_654h_654o_valid_single");
  expect(valid.predecessor_result?.readiness_status).toBe("ready");
  expect(valid.effects).toMatchObject({
    v5_invocations: 1,
    v5_establishments: 1,
    capsule_mints: 1,
    readiness_classifications: 1,
    confirmation_consumptions: 1,
  });
});

test("exact duplicate remains idempotent and conflicting reuse fails closed", () => {
  const input = action654oPlainFixture("action_654h_654o_idempotency");
  const first = runAction654oCanonicalReadinessGate(action654oCanonicalGates.enabled, input);
  const duplicate = runAction654oCanonicalReadinessGate(
    action654oCanonicalGates.enabled,
    structuredClone(input),
  );
  expect(first.predecessor_result?.terminal_reason).toBe("readiness_ready");
  expect(duplicate.predecessor_result).toMatchObject({
    terminal_reason: "exact_duplicate_idempotent",
    idempotent_replay: true,
  });
  downstreamEffectsAreZero(duplicate);

  const conflict = runAction654oCanonicalReadinessGate(
    action654oCanonicalGates.enabled,
    { ...input, evaluated_at: "2026-07-29T10:05:00.000000001Z" },
  );
  expect(conflict.predecessor_result).toMatchObject({
    readiness_status: "conflicting",
    terminal_reason: "conflicting_readiness_reuse",
  });
  expect(conflict.effects.confirmation_consumptions).toBe(0);
});

test("strict expiry remains accepted at minus one and rejected at boundary and plus one", () => {
  const accepted = runAction654oPlainFixture("action_654h_654o_expiry_minus", {
    evaluated_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(accepted.predecessor_result?.readiness_status).toBe("ready");
  for (const [name, evaluatedAt] of [
    ["boundary", "2026-07-29T10:10:00.000000000Z"],
    ["plus", "2026-07-29T10:10:00.000000001Z"],
  ] as const) {
    const result = runAction654oPlainFixture(`action_654h_654o_expiry_${name}`, {
      evaluated_at: evaluatedAt,
    });
    expect(result.predecessor_result?.readiness_status).toBe("not_eligible");
    downstreamEffectsAreZero(result);
  }
});

test("only snapshot bytes continue downstream and all transport fields remain immutable false", () => {
  const result = runAction654oPlainFixture("action_654h_654o_snapshot_only");
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.gate_snapshot)).toBe(true);
  expect(result.safety).toMatchObject(golden.safety);
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

test("source and runtime exports preserve private provenance and exclude live capabilities", async () => {
  const implementation = readFileSync(
    resolve(root, "lib/action-654o-hook-free-canonical-readiness-gate.ts"),
    "utf8",
  );
  expect(implementation).not.toMatch(/rebuildAndVerifyV5|runAction653s|fetch\s*\(|WebSocket|supabase|child_process/);
  expect(implementation).not.toMatch(/gate\s*\.\s*(enabled|kill_switch_active)/);
  expect(implementation).toContain("runAction654hPrivateReadinessComposition");
  const runtime = await import("../../lib/action-654o-hook-free-canonical-readiness-gate");
  const publicExports = Object.keys(runtime).filter(
    (key) => !["__esModule", "default", "module.exports"].includes(key),
  );
  expect(publicExports).toEqual([
    "action654oCanonicalGates",
    "action654oGateBudgets",
    "runAction654oCanonicalReadinessGate",
  ]);
});

test("isolated Action 654O deterministic process probe", () => {
  const clock = process.env.ACTION654O_PROCESS_CLOCK as
    | "utc_a"
    | "utc_b"
    | "stockholm"
    | "new_york"
    | undefined;
  test.skip(!clock, "probe-only test");
  const result = runAction654oPlainFixture("action_654h_654o_process_golden", {
    clock,
    reverse_input_order: process.env.ACTION654O_REVERSE === "true",
  });
  console.log(`ACTION654O_PROCESS:${JSON.stringify({
    boundary_status: result.boundary_status,
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
  const rows = action654oGoldenCases.map((item) => {
    const output = execFileSync(
      process.env.ACTION654O_PLAYWRIGHT_BIN ??
        resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-654o-hook-free-canonical-readiness-gate.spec.ts",
        "--grep",
        "isolated Action 654O deterministic process probe",
        "--reporter=line",
        "--workers=1",
        "--output",
        `/private/tmp/action-654o-process-${item.name}`,
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
          ACTION654O_PROCESS_CLOCK: item.clock,
          ACTION654O_REVERSE: String(item.reverse_input_order),
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
        },
        encoding: "utf8",
      },
    );
    const line = output.split("\n").find((value) => value.includes("ACTION654O_PROCESS:"));
    if (!line) throw new Error("determinism marker missing");
    return {
      name: item.name,
      ...JSON.parse(line.replace(/^.*ACTION654O_PROCESS:/, "").trim()),
    };
  });
  expect(rows).toEqual(golden.cases);
  expect(
    new Set(
      rows.map((row) =>
        JSON.stringify({
          boundary_status: row.boundary_status,
          readiness_status: row.readiness_status,
          terminal_reason: row.terminal_reason,
          observed_input_digest: row.observed_input_digest,
          readiness_identity: row.readiness_identity,
          readiness_digest: row.readiness_digest,
          instruction_identity: row.instruction_identity,
          synthetic_replay_identity: row.synthetic_replay_identity,
        }),
      ),
    ).size,
  ).toBe(1);
});
