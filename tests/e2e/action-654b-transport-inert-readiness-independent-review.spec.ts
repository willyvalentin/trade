import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { hashAction650sCanonicalValue } from "../../lib/action-650s-execution-identity";
import * as action654aRuntime from "../../lib/action-654a-transport-inert-dispatch-readiness";
import {
  runAction654aTransportInertDispatchReadiness,
  type Action654aReadinessInput,
} from "../../lib/action-654a-transport-inert-dispatch-readiness";
import freezeManifest from "../../docs/action-654b-transport-inert-readiness-freeze-manifest.json";
import {
  action654aReadinessFixture,
  runAction654aReadinessFixture,
} from "../fixtures/action-654a-transport-inert-dispatch-readiness-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function mutableRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("plain record expected");
  }
  return value as Record<string, unknown>;
}

function cloneInput(input: Action654aReadinessInput): Record<string, unknown> {
  return structuredClone(input) as Record<string, unknown>;
}

function v5Record(input: Record<string, unknown>) {
  return mutableRecord(input.v5_instruction_result);
}

function instructionRecord(input: Record<string, unknown>) {
  return mutableRecord(v5Record(input).instruction);
}

function prefixedDigest(prefix: string, value: unknown) {
  return `${prefix}_${hashAction650sCanonicalValue(value)}`;
}

function countPlainObjects(value: unknown) {
  let count = 0;
  const stack: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    count += 1;
    for (const descriptor of Object.values(Object.getOwnPropertyDescriptors(current))) {
      if ("value" in descriptor && descriptor.value && typeof descriptor.value === "object") {
        stack.push(descriptor.value);
      }
    }
  }
  return count;
}

function collectPlainKeys(value: unknown) {
  const keys = new Set<string>();
  const stack: unknown[] = [value];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    for (const [key, descriptor] of Object.entries(Object.getOwnPropertyDescriptors(current))) {
      keys.add(key);
      if ("value" in descriptor && descriptor.value && typeof descriptor.value === "object") {
        stack.push(descriptor.value);
      }
    }
  }
  return keys;
}

function normativeDigest() {
  const hash = createHash("sha256");
  for (const entry of [...freezeManifest.normative_scope.paths].sort((a, b) =>
    a.path.localeCompare(b.path))) {
    const bytes = readFileSync(resolve(root, entry.path));
    expect(createHash("sha256").update(bytes).digest("hex")).toBe(entry.sha256);
    hash.update(Buffer.from(entry.path));
    hash.update(Buffer.from([0]));
    hash.update(bytes);
    hash.update(Buffer.from([0]));
  }
  return hash.digest("hex");
}

test("independently rebuilds the exact frozen five-path authority", () => {
  expect(normativeDigest()).toBe(freezeManifest.normative_scope.combined_sha256);
  expect(freezeManifest.normative_scope.combined_sha256).toBe(
    "78e9ee01e4552e98196d15f996501fe8be4c7c1a04f417e6e9d6161d8da864a5",
  );
  expect(execFileSync("git", ["rev-parse", freezeManifest.authority.preservation_ref], {
    cwd: root,
    encoding: "utf8",
  }).trim()).toBe(freezeManifest.authority.preservation_object);
  expect(execFileSync("git", ["show", "-s", "--format=%T", freezeManifest.authority.preservation_ref], {
    cwd: root,
    encoding: "utf8",
  }).trim()).toBe(freezeManifest.authority.preservation_tree);
  expect(execFileSync("git", ["show", "-s", "--format=%P", freezeManifest.authority.preservation_ref], {
    cwd: root,
    encoding: "utf8",
  }).trim()).toBe(freezeManifest.authority.preservation_parent);
});

test("only an eligible Action 653 V5 result reaches authority readback", () => {
  const predecessors = [
    "action_653a_broker_neutral_execution_instruction_v1",
    "action_653h_safe_instruction_successor_v2",
    "action_653j_internal_verification_capsule_v3",
    "action_653l_handle_opaque_instruction_v4",
    "foreign_authority_v99",
  ];
  for (const [index, contractVersion] of predecessors.entries()) {
    const input = cloneInput(action654aReadinessFixture(`action_653s_654b_predecessor_${index}`));
    v5Record(input).contract_version = contractVersion;
    const result = runAction654aTransportInertDispatchReadiness(enabled, input);
    expect(result.readiness_status).toBe("not_eligible");
    expect(result.envelope).toBeNull();
    expect(result.effects).toMatchObject({
      downstream_digest_operations: 0,
      v5_authority_readbacks: 0,
      envelope_constructions: 0,
    });
  }
});

test("every non-eligible instruction state performs zero construction and digest work", () => {
  for (const [index, status] of ["blocked", "expired", "conflicting", "unmappable"].entries()) {
    const input = cloneInput(action654aReadinessFixture(`action_653s_654b_status_${index}`));
    v5Record(input).instruction_status = status;
    const result = runAction654aTransportInertDispatchReadiness(enabled, input);
    expect(result.terminal_reason).toBe("v5_instruction_not_eligible");
    expect(result.terminal_digest).toBeNull();
    expect(result.effects.downstream_digest_operations).toBe(0);
    expect(result.effects.envelope_constructions).toBe(0);
  }
});

test("all execution, instruction, risk, confirmation, audit, idempotency, session and replay bindings fail closed", () => {
  const mutations: Array<(input: Record<string, unknown>) => void> = [
    (input) => { instructionRecord(input).execution_identity = "foreign-execution"; },
    (input) => { instructionRecord(input).instruction_digest = "foreign-instruction"; },
    (input) => { instructionRecord(input).risk_admission_identity = "foreign-risk"; },
    (input) => { instructionRecord(input).confirmation_capability_digest = "foreign-confirmation"; },
    (input) => {
      mutableRecord(v5Record(input).diagnostic_audit_handoff).handoff_digest = "foreign-audit";
    },
    (input) => { instructionRecord(input).idempotency_identity = "action_653s_foreign_identity"; },
    (input) => { instructionRecord(input).session_identity = "foreign-session"; },
    (input) => {
      mutableRecord(v5Record(input).synthetic_replay).evidence_digest = "foreign-replay";
    },
  ];
  for (const [index, mutate] of mutations.entries()) {
    const input = cloneInput(action654aReadinessFixture(`action_653s_654b_lineage_${index}`));
    mutate(input);
    const result = runAction654aTransportInertDispatchReadiness(enabled, input);
    expect(result.readiness_status).toBe("conflicting");
    expect(result.terminal_reason).toBe("v5_authority_unverified");
    expect(result.envelope).toBeNull();
  }
});

test("descriptor traversal reads each plain input object once and uses frozen snapshot bytes downstream", () => {
  const callerInput = cloneInput(action654aReadinessFixture("action_653s_654b_single_read"));
  const expectedDescriptorReads = countPlainObjects(callerInput);
  const result = runAction654aTransportInertDispatchReadiness(enabled, callerInput);
  const before = JSON.stringify(result);
  instructionRecord(callerInput).execution_identity = "post-verification-mutation";
  mutableRecord(callerInput).evaluated_at = "2026-07-29T10:09:59.999999999Z";
  expect(result.effects.input_descriptor_reads).toBe(expectedDescriptorReads);
  expect(JSON.stringify(result)).toBe(before);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.envelope)).toBe(true);
});

test("getter, proxy, callback, iterator, cycle and budget attacks execute zero hooks", () => {
  let hooks = 0;
  const accessor = cloneInput(action654aReadinessFixture("action_653s_654b_accessor"));
  Object.defineProperty(instructionRecord(accessor), "execution_identity", {
    enumerable: true,
    get() { hooks += 1; return "forged"; },
  });
  expect(runAction654aTransportInertDispatchReadiness(enabled, accessor).terminal_reason)
    .toBe("input_snapshot_rejected");

  const revocable = Proxy.revocable(action654aReadinessFixture("action_653s_654b_proxy"), {
    get() { hooks += 1; throw new Error("proxy get must not execute"); },
    ownKeys() { hooks += 1; throw new Error("proxy keys must not execute"); },
    getOwnPropertyDescriptor() { hooks += 1; throw new Error("proxy descriptor must not execute"); },
  });
  expect(runAction654aTransportInertDispatchReadiness(enabled, revocable.proxy).terminal_reason)
    .toBe("input_snapshot_rejected");

  const callback = cloneInput(action654aReadinessFixture("action_653s_654b_callback"));
  callback.callback = () => { hooks += 1; };
  expect(runAction654aTransportInertDispatchReadiness(enabled, callback).terminal_reason)
    .toBe("input_snapshot_rejected");

  const iterator = cloneInput(action654aReadinessFixture("action_653s_654b_iterator"));
  Object.defineProperty(iterator, Symbol.iterator, {
    enumerable: false,
    value: () => { hooks += 1; return [][Symbol.iterator](); },
  });
  expect(runAction654aTransportInertDispatchReadiness(enabled, iterator).terminal_reason)
    .toBe("input_snapshot_rejected");

  const cycle = cloneInput(action654aReadinessFixture("action_653s_654b_cycle"));
  cycle.self = cycle;
  expect(runAction654aTransportInertDispatchReadiness(enabled, cycle).terminal_reason)
    .toBe("input_snapshot_rejected");

  const huge = cloneInput(action654aReadinessFixture("action_653s_654b_budget"));
  for (let index = 0; index < 8_300; index += 1) huge[`excess_${index}`] = index;
  expect(runAction654aTransportInertDispatchReadiness(enabled, huge).terminal_reason)
    .toBe("input_snapshot_rejected");
  expect(hooks).toBe(0);
});

test("readiness identity, session-expiry identity, envelope digest and terminal digest rebuild independently", () => {
  const result = runAction654aReadinessFixture("action_653s_654b_digest_rebuild");
  const envelope = result.envelope!;
  expect(envelope.session_expiry_identity).toBe(prefixedDigest(
    "action_654a_session_expiry_identity",
    {
      session_identity: envelope.session_identity,
      instruction_expires_at: envelope.instruction_expires_at,
    },
  ));
  expect(envelope.readiness_identity).toBe(prefixedDigest("action_654a_readiness_identity", {
    execution_identity: envelope.execution_identity,
    instruction_identity: envelope.instruction_identity,
    risk_admission_identity: envelope.risk_admission_identity,
    manual_confirmation_identity: envelope.manual_confirmation_identity,
    diagnostic_audit_identity: envelope.diagnostic_audit_identity,
    idempotency_identity: envelope.idempotency_identity,
    session_expiry_identity: envelope.session_expiry_identity,
    synthetic_replay_identity: envelope.synthetic_replay_identity,
  }));
  const { readiness_digest: readinessDigest, ...envelopeUnsigned } = envelope;
  expect(readinessDigest).toBe(prefixedDigest(
    "action_654a_dispatch_readiness_envelope",
    envelopeUnsigned,
  ));
  const { terminal_digest: terminalDigest, ...terminalUnsigned } = result;
  expect(terminalDigest).toBe(prefixedDigest("action_654a_readiness_terminal", terminalUnsigned));
});

test("self-consistent true transport flags cannot replace authoritative immutable evidence", () => {
  const input = action654aReadinessFixture("action_653s_654b_transport_tamper");
  const original = runAction654aTransportInertDispatchReadiness(enabled, input);
  for (const field of [
    "transport_attached",
    "dispatch_permitted",
    "broker_submission_allowed",
  ] as const) {
    const tampered = mutableRecord(structuredClone(original));
    const envelope = mutableRecord(tampered.envelope);
    const safety = mutableRecord(tampered.safety);
    envelope[field] = true;
    safety[field] = true;
    const envelopeUnsigned = { ...envelope };
    delete envelopeUnsigned.readiness_digest;
    envelope.readiness_digest = prefixedDigest(
      "action_654a_dispatch_readiness_envelope",
      envelopeUnsigned,
    );
    const terminalUnsigned = { ...tampered };
    delete terminalUnsigned.terminal_digest;
    tampered.terminal_digest = prefixedDigest("action_654a_readiness_terminal", terminalUnsigned);

    const authoritative = runAction654aTransportInertDispatchReadiness(enabled, input);
    expect(authoritative.envelope?.[field]).toBe(false);
    expect(authoritative.safety[field]).toBe(false);
    expect(envelope.readiness_digest).not.toBe(authoritative.envelope?.readiness_digest);
    expect(tampered.terminal_digest).not.toBe(authoritative.terminal_digest);
  }
  expect(Object.isFrozen(original.envelope)).toBe(true);
  expect(Object.isFrozen(original.safety)).toBe(true);
});

test("exact duplicate is idempotent while execution, instruction and session conflicts fail closed", () => {
  const input = action654aReadinessFixture("action_653s_654b_idempotency");
  const first = runAction654aTransportInertDispatchReadiness(enabled, input);
  const duplicate = runAction654aTransportInertDispatchReadiness(enabled, structuredClone(input));
  expect(duplicate.terminal_reason).toBe("exact_duplicate_idempotent");
  expect(duplicate.envelope?.readiness_digest).toBe(first.envelope?.readiness_digest);

  const timeConflict = cloneInput(input);
  timeConflict.evaluated_at = "2026-07-29T10:05:00.000000001Z";
  expect(runAction654aTransportInertDispatchReadiness(enabled, timeConflict).terminal_reason)
    .toBe("conflicting_readiness_reuse");

  for (const [field, value] of [
    ["execution_identity", "cross-execution"],
    ["instruction_digest", "cross-instruction"],
    ["session_identity", "cross-session"],
  ] as const) {
    const conflicting = cloneInput(action654aReadinessFixture(`action_653s_654b_conflict_${field}`));
    instructionRecord(conflicting)[field] = value;
    expect(runAction654aTransportInertDispatchReadiness(enabled, conflicting).readiness_status)
      .toBe("conflicting");
  }
});

test("expiry accepts minus one and rejects boundary and plus one nanosecond with zero digest work", () => {
  const rows = [
    ["minus_one", "2026-07-29T10:09:59.999999999Z", "ready"],
    ["boundary", "2026-07-29T10:10:00.000000000Z", "expired"],
    ["plus_one", "2026-07-29T10:10:00.000000001Z", "expired"],
  ] as const;
  for (const [name, evaluatedAt, expected] of rows) {
    const result = runAction654aReadinessFixture(`action_653s_654b_expiry_${name}`, {
      evaluated_at: evaluatedAt,
    });
    expect(result.readiness_status).toBe(expected);
    if (expected === "expired") {
      expect(result.effects.downstream_digest_operations).toBe(0);
      expect(result.effects.envelope_constructions).toBe(0);
    }
  }
});

test("default-off and kill switch execute zero caller hooks and zero work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("get forbidden"); },
    ownKeys() { hooks += 1; throw new Error("keys forbidden"); },
  });
  for (const gate of [
    { enabled: false, kill_switch_active: false },
    { enabled: true, kill_switch_active: true },
  ]) {
    const result = runAction654aTransportInertDispatchReadiness(gate, hostile);
    expect(result.effects).toMatchObject({
      input_descriptor_reads: 0,
      downstream_digest_operations: 0,
      v5_authority_readbacks: 0,
      envelope_constructions: 0,
    });
  }
  expect(hooks).toBe(0);
});

test("synthetic replay and diagnostic audit identities bind without endpoint or authority escape", () => {
  const input = action654aReadinessFixture("action_653s_654b_interop");
  const result = runAction654aTransportInertDispatchReadiness(enabled, input);
  expect(result.envelope).toMatchObject({
    instruction_identity: input.v5_instruction_result.instruction?.instruction_digest,
    risk_admission_identity: input.v5_instruction_result.instruction?.risk_admission_identity,
    manual_confirmation_identity:
      input.v5_instruction_result.instruction?.confirmation_capability_digest,
    diagnostic_audit_identity:
      input.v5_instruction_result.diagnostic_audit_handoff?.handoff_digest,
    synthetic_replay_identity:
      input.v5_instruction_result.synthetic_replay?.evidence_digest,
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
  });
  const keys = collectPlainKeys(result);
  for (const forbiddenKey of [
    "endpoint",
    "broker_account",
    "account_id",
    "broker_session",
    "session_cookie",
    "credential",
    "order_route",
    "transport_adapter",
    "bankid",
  ]) {
    expect(keys.has(forbiddenKey)).toBe(false);
  }
  expect(JSON.stringify(result)).not.toMatch(/https?:\/\/|wss?:\/\//i);
});

test("runtime and source export inventories make transport and dispatch unreachable", () => {
  expect(Object.keys(action654aRuntime)).toEqual([
    "runAction654aTransportInertDispatchReadiness",
  ]);
  const implementation = source("lib/action-654a-transport-inert-dispatch-readiness.ts");
  const imports = [...implementation.matchAll(
    /^import[\s\S]*?from\s+["']([^"']+)["'];/gm,
  )].map((match) => match[1]);
  expect(imports).toEqual([
    "node:util",
    "@/lib/action-650s-execution-identity",
    "@/lib/action-650u-temporal-confirmation-policy",
    "@/lib/action-653s-non-exportable-authority-transaction",
  ]);
  expect(implementation).not.toMatch(
    /\bfetch\s*\(|WebSocket|XMLHttpRequest|node:(?:child_process|net|tls|http|https|dgram)|createClient|supabase|puppeteer|playwright|bankid|broker_url|account_id|session_cookie/i,
  );
  expect([...implementation.matchAll(/^export (?:async )?function\s+(\w+)/gm)].map((match) => match[1]))
    .toEqual(["runAction654aTransportInertDispatchReadiness"]);
});

test("cross-process and cross-timezone readiness output is deterministic", () => {
  test.setTimeout(90_000);
  const outputs = ["UTC", "Europe/Stockholm", "America/New_York"].map((tz) =>
    execFileSync(
      resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-654a-transport-inert-dispatch-readiness.spec.ts",
        "--grep",
        "isolated Action 654A process probe",
        "--reporter=line",
        "--output",
        `/private/tmp/action-654b-probe-${tz.replace(/[^a-z0-9]/gi, "-")}`,
      ],
      {
        cwd: root,
        env: { ...process.env, TZ: tz, PLAYWRIGHT_SKIP_WEB_SERVER: "true" },
        encoding: "utf8",
      },
    )
      .split("\n")
      .find((line) => line.includes("ACTION654A_PROBE:"))!
      .replace(/^.*ACTION654A_PROBE:/, "")
      .trim(),
  );
  expect(new Set(outputs).size).toBe(1);
});

test("baseline evidence and additive scope preserve live and write exclusion", () => {
  const predecessor = JSON.parse(
    source("docs/action-653t-non-exportable-authority-successor-freeze-manifest.json"),
  ) as { validation: Record<string, string | boolean> };
  expect(predecessor.validation).toMatchObject({
    broad_base: "3451 passed / 13 failed",
    broad_successor: "3451 passed / 13 failed",
    broad_failure_identity_order_and_messages: "identical",
    restricted_base: "22 passed / 5 failed",
    restricted_successor: "22 passed / 5 failed",
    restricted_failure_identity_order_and_messages: "identical",
    full_execution_regression_passed: false,
  });
  const delta = execFileSync("git", [
    "diff",
    "--name-only",
    freezeManifest.authority.preservation_parent,
    freezeManifest.authority.preservation_ref,
  ], { cwd: root, encoding: "utf8" }).trim().split("\n").filter(Boolean).sort();
  expect(delta).toEqual(freezeManifest.normative_scope.paths.map((entry) => entry.path).sort());
  const result = runAction654aReadinessFixture("action_653s_654b_safety");
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
});
