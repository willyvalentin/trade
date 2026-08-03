import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
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
  action654oMalformedGateCases,
  action654oPlainFixture,
  runAction654oPlainFixture,
} from "../fixtures/action-654o-hook-free-canonical-readiness-gate-fixtures";

const root = resolve(__dirname, "../..");
const authorityRef =
  "refs/codex-preservation/action-654o-hook-free-canonical-readiness-gate";
const authorityObject = "07ac1549a7e0518cc1742b09ff4ff2b9372034ad";
const authorityTree = "b3027723a46fc933a8ddfbab529446ef0d648f80";
const authorityParent = "3330df9a368f7f9979ed0d4a10b2ecd44a6e2672";
const normativeDigest =
  "8826c7f6d650bb98416611f8cc07ebf454cad70f7e755a36523c6636016c9ab2";
const normativePaths = [
  "docs/action-654o-hook-free-canonical-readiness-gate-contract.md",
  "docs/action-654o-hook-free-canonical-readiness-gate-golden-report.json",
  "lib/action-654o-hook-free-canonical-readiness-gate.ts",
  "tests/e2e/action-654o-hook-free-canonical-readiness-gate.spec.ts",
  "tests/fixtures/action-654o-hook-free-canonical-readiness-gate-fixtures.ts",
] as const;

function git(...args: string[]) {
  return execFileSync("git", args, { cwd: root, encoding: "utf8" }).trim();
}

function rebuildNormativeDigest() {
  const digest = createHash("sha256");
  for (const path of [...normativePaths].sort()) {
    digest.update(path);
    digest.update(Buffer.from([0]));
    digest.update(execFileSync("git", ["show", `${authorityRef}:${path}`], { cwd: root }));
    digest.update(Buffer.from([0]));
  }
  return digest.digest("hex");
}

function downstreamZero(result: ReturnType<typeof runAction654oCanonicalReadinessGate>) {
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

test("rebuilds the exact five-path frozen authority and worktree parity", () => {
  expect(git("rev-parse", `${authorityRef}^{commit}`)).toBe(authorityObject);
  expect(git("rev-parse", `${authorityRef}^{tree}`)).toBe(authorityTree);
  expect(git("rev-parse", `${authorityRef}^`)).toBe(authorityParent);
  expect(
    git("diff-tree", "--no-commit-id", "--name-only", "-r", authorityRef)
      .split("\n")
      .sort(),
  ).toEqual([...normativePaths].sort());
  expect(rebuildNormativeDigest()).toBe(normativeDigest);
  for (const path of normativePaths) {
    expect(readFileSync(resolve(root, path))).toEqual(
      execFileSync("git", ["show", `${authorityRef}:${path}`], { cwd: root }),
    );
  }
});

test("public boundary rejects caller objects and executes zero hooks", () => {
  let getterHooks = 0;
  const accessor = Object.defineProperty({}, "enabled", {
    get() { getterHooks += 1; throw new Error("getter must not execute"); },
  });
  let proxyHooks = 0;
  const proxy = new Proxy({}, {
    get() { proxyHooks += 1; throw new Error("get must not execute"); },
    ownKeys() { proxyHooks += 1; throw new Error("ownKeys must not execute"); },
    getPrototypeOf() { proxyHooks += 1; throw new Error("prototype must not execute"); },
    getOwnPropertyDescriptor() { proxyHooks += 1; throw new Error("descriptor must not execute"); },
  });
  for (const candidate of [
    {},
    accessor,
    proxy,
    new String(action654oCanonicalGates.enabled),
    () => action654oCanonicalGates.enabled,
  ]) {
    const result = runAction654oCanonicalReadinessGate(
      candidate,
      action654oPlainFixture("action_654h_654p_hook_free"),
    );
    expect(result).toMatchObject({
      boundary_status: "rejected",
      failure_reason: "gate_input_not_primitive_string",
      observed_string_digest: null,
      failure_identity: null,
      effects: {
        primitive_captures: 1,
        caller_property_reads: 0,
        reflection_operations_on_caller_input: 0,
        parser_invocations: 0,
        gate_failure_digest_operations: 0,
      },
    });
    downstreamZero(result);
  }
  expect(getterHooks).toBe(0);
  expect(proxyHooks).toBe(0);
});

test("canonical schema, order, booleans, and explicit budgets are closed", () => {
  expect(action654oGateBudgets).toEqual({
    maximum_characters: 128,
    maximum_utf8_bytes: 192,
  });
  for (const canonical of Object.values(action654oCanonicalGates)) {
    const result = runAction654oCanonicalReadinessGate(
      canonical,
      action654oPlainFixture(`action_654h_654p_${canonical.length}`),
    );
    expect(result.boundary_status).toBe("accepted");
    expect(result.gate_snapshot).toEqual(JSON.parse(canonical));
    expect(Object.isFrozen(result.gate_snapshot)).toBe(true);
  }
  for (const malformed of Object.values(action654oMalformedGateCases)) {
    expect(
      runAction654oCanonicalReadinessGate(
        malformed,
        action654oPlainFixture("action_654h_654p_schema_reject"),
      ).boundary_status,
    ).toBe("rejected");
  }
});

test("ordinary malformed inputs receive sanitized and distinct failure identities", () => {
  const results = Object.values(action654oMalformedGateCases).map((input) =>
    runAction654oCanonicalReadinessGate(
      input,
      action654oPlainFixture("action_654h_654p_failure_identity"),
    ),
  );
  expect(new Set(results.map((result) => result.failure_identity)).size).toBe(
    results.length,
  );
  for (const result of results) {
    expect(result.failure_identity).toMatch(/^action_654o_gate_failure_[a-f0-9]{64}$/);
    expect(result.observed_string_digest).toMatch(
      /^action_654o_observed_gate_string_[a-f0-9]{64}$/,
    );
    expect(result.failure_identity).not.toContain("action_654o_canonical_gate_v1");
  }
});

test("654P-M1: distinct malformed lone-surrogate strings collide after UTF-8 replacement", () => {
  const first = runAction654oCanonicalReadinessGate(
    "\ud800",
    action654oPlainFixture("action_654h_654p_surrogate_a"),
  );
  const second = runAction654oCanonicalReadinessGate(
    "\ud801",
    action654oPlainFixture("action_654h_654p_surrogate_b"),
  );
  expect(first.boundary_status).toBe("rejected");
  expect(second.boundary_status).toBe("rejected");
  expect(first.failure_reason).toBe("gate_json_parse_failed");
  expect(second.failure_reason).toBe("gate_json_parse_failed");
  expect(first.observed_string_digest).toBe(second.observed_string_digest);
  expect(first.failure_identity).toBe(second.failure_identity);
  downstreamZero(first);
  downstreamZero(second);
});

test("snapshot is engine-owned, frozen, and caller input is not reread", () => {
  const input = action654oPlainFixture("action_654h_654p_snapshot");
  const result = runAction654oCanonicalReadinessGate(
    action654oCanonicalGates.enabled,
    input,
  );
  expect(result.boundary_status).toBe("accepted");
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.gate_snapshot)).toBe(true);
  expect(result.gate_snapshot).not.toBe(JSON.parse(action654oCanonicalGates.enabled));
  expect(result.effects).toMatchObject({
    primitive_captures: 1,
    caller_property_reads: 0,
    reflection_operations_on_caller_input: 0,
    gate_snapshot_constructions: 1,
  });
});

test("reproduces 654N-M1 against 654H and closes it at the 654O boundary", () => {
  let historicalHooks = 0;
  const historicalGate = Object.defineProperty({}, "enabled", {
    get() { historicalHooks += 1; return false; },
  }) as { enabled: boolean; kill_switch_active: boolean };
  runAction654hPrivateReadinessComposition(
    historicalGate,
    action654oPlainFixture("action_654h_654p_historical"),
  );
  expect(historicalHooks).toBe(1);

  let successorHooks = 0;
  const successorGate = new Proxy({}, {
    get() { successorHooks += 1; throw new Error("must not read"); },
    ownKeys() { successorHooks += 1; throw new Error("must not enumerate"); },
  });
  const successor = runAction654oCanonicalReadinessGate(
    successorGate,
    action654oPlainFixture("action_654h_654p_successor"),
  );
  expect(successor.boundary_status).toBe("rejected");
  expect(successorHooks).toBe(0);
});

test("disabled, kill switch, malformed request, and plain V5 substitution consume nothing", () => {
  for (const [gate, input] of [
    [action654oCanonicalGates.disabled, action654oPlainFixture("action_654h_654p_disabled")],
    [action654oCanonicalGates.kill_switch_active, action654oPlainFixture("action_654h_654p_killed")],
    [action654oCanonicalGates.enabled, { invalid: true }],
    [action654oCanonicalGates.enabled, { contract_version: "action_653s_non_exportable_authority_transaction_v5" }],
  ] as const) {
    const result = runAction654oCanonicalReadinessGate(gate, input);
    expect(result.predecessor_result?.readiness_status).not.toBe("ready");
    downstreamZero(result);
  }
});

test("valid composition establishes once; duplicate and conflict remain closed", () => {
  const input = action654oPlainFixture("action_654h_654p_consumption");
  const first = runAction654oCanonicalReadinessGate(action654oCanonicalGates.enabled, input);
  expect(first.predecessor_result?.readiness_status).toBe("ready");
  expect(first.effects).toMatchObject({
    v5_invocations: 1,
    v5_establishments: 1,
    capsule_mints: 1,
    readiness_classifications: 1,
    confirmation_consumptions: 1,
  });
  const duplicate = runAction654oCanonicalReadinessGate(
    action654oCanonicalGates.enabled,
    structuredClone(input),
  );
  expect(duplicate.predecessor_result).toMatchObject({
    terminal_reason: "exact_duplicate_idempotent",
    idempotent_replay: true,
  });
  downstreamZero(duplicate);
  const conflict = runAction654oCanonicalReadinessGate(
    action654oCanonicalGates.enabled,
    { ...input, evaluated_at: "2026-07-29T10:05:00.000000001Z" },
  );
  expect(conflict.predecessor_result?.readiness_status).toBe("conflicting");
  expect(conflict.effects.confirmation_consumptions).toBe(0);
});

test("source/runtime exports preserve private provenance and exclude live capabilities", async () => {
  const source = readFileSync(
    resolve(root, "lib/action-654o-hook-free-canonical-readiness-gate.ts"),
    "utf8",
  );
  expect(source).not.toMatch(/rebuildAndVerifyV5|runAction653s|fetch\s*\(|WebSocket|child_process|supabase/);
  expect(source).not.toMatch(/gate\s*\.\s*(enabled|kill_switch_active)/);
  expect(source).toContain("runAction654hPrivateReadinessComposition");
  const runtime = await import("../../lib/action-654o-hook-free-canonical-readiness-gate");
  expect(
    Object.keys(runtime).filter(
      (key) => !["__esModule", "default", "module.exports"].includes(key),
    ),
  ).toEqual([
    "action654oCanonicalGates",
    "action654oGateBudgets",
    "runAction654oCanonicalReadinessGate",
  ]);
});

test("transport fields, synthetic replay, and diagnostic audit remain inert", () => {
  const result = runAction654oPlainFixture("action_654h_654p_transport");
  expect(result.safety).toEqual(golden.safety);
  expect(result.predecessor_result?.readiness_envelope).toMatchObject({
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
  });
  expect(result.predecessor_result?.v5_instruction_result?.synthetic_replay).toMatchObject({
    accepted: true,
    synthetic_only: true,
  });
  expect(result.predecessor_result?.v5_instruction_result?.diagnostic_audit_handoff).toMatchObject({
    diagnostic_only: true,
    real_broker_evidence: false,
    performance_eligible: false,
    automatic_execution_allowed: false,
  });
});
