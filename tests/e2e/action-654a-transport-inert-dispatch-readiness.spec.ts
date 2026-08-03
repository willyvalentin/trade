import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { hashAction650sCanonicalValue } from "../../lib/action-650s-execution-identity";
import * as action654aRuntime from "../../lib/action-654a-transport-inert-dispatch-readiness";
import {
  runAction654aTransportInertDispatchReadiness,
  type Action654aReadinessInput,
} from "../../lib/action-654a-transport-inert-dispatch-readiness";
import golden from "../../docs/action-654a-transport-inert-dispatch-readiness-golden-report.json";
import {
  action654aApprovedV5Result,
  action654aGoldenCases,
  action654aReadinessFixture,
  runAction654aReadinessFixture,
} from "../fixtures/action-654a-transport-inert-dispatch-readiness-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;

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

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

test("default-off and kill switch return before any caller input work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("input must not be read"); },
    getOwnPropertyDescriptor() { hooks += 1; throw new Error("descriptor must not be read"); },
    ownKeys() { hooks += 1; throw new Error("keys must not be read"); },
  });
  for (const gate of [
    { enabled: false, kill_switch_active: false },
    { enabled: true, kill_switch_active: true },
  ]) {
    const result = runAction654aTransportInertDispatchReadiness(gate, hostile);
    expect(result.envelope).toBeNull();
    expect(result.terminal_digest).toBeNull();
    expect(result.effects).toMatchObject({
      input_descriptor_reads: 0,
      downstream_digest_operations: 0,
      v5_authority_readbacks: 0,
      envelope_constructions: 0,
    });
  }
  expect(hooks).toBe(0);
});

test("approved V5 result produces one frozen transport-inert readiness envelope", () => {
  const input = action654aReadinessFixture("action_653s_654a_valid");
  const result = runAction654aTransportInertDispatchReadiness(enabled, input);
  expect(result.readiness_status).toBe("ready");
  expect(result.terminal_reason).toBe("readiness_ready");
  expect(result.envelope).not.toBeNull();
  expect(result.envelope).toMatchObject({
    execution_identity: input.v5_instruction_result.instruction?.execution_identity,
    instruction_identity: input.v5_instruction_result.instruction?.instruction_digest,
    risk_admission_identity: input.v5_instruction_result.instruction?.risk_admission_identity,
    risk_admission_digest: input.v5_instruction_result.instruction?.risk_admission_digest,
    manual_confirmation_identity:
      input.v5_instruction_result.instruction?.confirmation_capability_digest,
    manual_confirmation_consumption_identity:
      input.v5_instruction_result.instruction?.confirmation_consumption_digest,
    diagnostic_audit_identity:
      input.v5_instruction_result.diagnostic_audit_handoff?.handoff_digest,
    synthetic_replay_identity:
      input.v5_instruction_result.synthetic_replay?.evidence_digest,
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.envelope)).toBe(true);
  expect(result.effects).toMatchObject({
    v5_authority_readbacks: 1,
    envelope_constructions: 1,
    transport_adapters: 0,
    transport_requests: 0,
    broker_submissions: 0,
    database_writes: 0,
    process_spawns: 0,
  });
});

test("every non-eligible V5 instruction status stops with zero downstream work", () => {
  for (const [index, status] of ["blocked", "expired", "conflicting", "unmappable"].entries()) {
    const input = cloneInput(action654aReadinessFixture(`action_653s_654a_status_${index}`));
    v5Record(input).instruction_status = status;
    v5Record(input).instruction = null;
    const result = runAction654aTransportInertDispatchReadiness(enabled, input);
    expect(result.readiness_status).toBe("not_eligible");
    expect(result.envelope).toBeNull();
    expect(result.terminal_digest).toBeNull();
    expect(result.effects).toMatchObject({
      downstream_digest_operations: 0,
      v5_authority_readbacks: 0,
      envelope_constructions: 0,
    });
  }
});

test("V1 through V4 contract substitution is rejected before digest work", () => {
  const versions = [
    "action_653a_broker_neutral_execution_instruction_v1",
    "action_653h_safe_instruction_successor_v2",
    "action_653j_internal_verification_capsule_v3",
    "action_653l_handle_opaque_instruction_v4",
  ];
  for (const [index, version] of versions.entries()) {
    const input = cloneInput(action654aReadinessFixture(`action_653s_654a_v${index + 1}`));
    v5Record(input).contract_version = version;
    const result = runAction654aTransportInertDispatchReadiness(enabled, input);
    expect(result.readiness_status).toBe("not_eligible");
    expect(result.effects.downstream_digest_operations).toBe(0);
    expect(result.effects.v5_authority_readbacks).toBe(0);
  }
});

test("risk, confirmation, audit, execution, and session substitutions fail closed", () => {
  const attacks: Array<(input: Record<string, unknown>) => void> = [
    (input) => {
      const instruction = instructionRecord(input);
      instruction.risk_admission_digest = `${instruction.risk_admission_digest}_forged`;
    },
    (input) => {
      const instruction = instructionRecord(input);
      instruction.confirmation_capability_digest = `${instruction.confirmation_capability_digest}_forged`;
    },
    (input) => {
      const audit = mutableRecord(v5Record(input).diagnostic_audit_handoff);
      audit.handoff_digest = `${audit.handoff_digest}_forged`;
    },
    (input) => { instructionRecord(input).execution_identity = "cross-execution"; },
    (input) => {
      const instruction = instructionRecord(input);
      instruction.instruction_digest = `${instruction.instruction_digest}_forged`;
    },
    (input) => { instructionRecord(input).session_identity = "cross-session"; },
  ];
  for (const [index, mutate] of attacks.entries()) {
    const input = cloneInput(action654aReadinessFixture(`action_653s_654a_sub_${index}`));
    mutate(input);
    const result = runAction654aTransportInertDispatchReadiness(enabled, input);
    expect(result.readiness_status).toBe("conflicting");
    expect(result.terminal_reason).toBe("v5_authority_unverified");
    expect(result.envelope).toBeNull();
    expect(result.effects.v5_authority_readbacks).toBe(1);
  }
});

test("exact duplicate is idempotent and conflicting duplicate fails closed", () => {
  const input = action654aReadinessFixture("action_653s_654a_idempotency");
  const first = runAction654aTransportInertDispatchReadiness(enabled, input);
  const duplicate = runAction654aTransportInertDispatchReadiness(enabled, structuredClone(input));
  expect(first.readiness_status).toBe("ready");
  expect(duplicate.readiness_status).toBe("ready");
  expect(duplicate.terminal_reason).toBe("exact_duplicate_idempotent");
  expect(duplicate.idempotent_replay).toBe(true);
  expect(duplicate.envelope?.readiness_digest).toBe(first.envelope?.readiness_digest);
  expect(duplicate.effects.envelope_constructions).toBe(0);

  const conflict = cloneInput(input);
  conflict.evaluated_at = "2026-07-29T10:05:00.000000001Z";
  const rejected = runAction654aTransportInertDispatchReadiness(enabled, conflict);
  expect(rejected.readiness_status).toBe("conflicting");
  expect(rejected.terminal_reason).toBe("conflicting_readiness_reuse");
  expect(rejected.envelope).toBeNull();
});

test("instruction expiry is strict at minus one, boundary, and plus one nanosecond", () => {
  const rows = [
    ["minus_one", "2026-07-29T10:09:59.999999999Z", "ready"],
    ["boundary", "2026-07-29T10:10:00.000000000Z", "expired"],
    ["plus_one", "2026-07-29T10:10:00.000000001Z", "expired"],
  ] as const;
  for (const [name, evaluatedAt, expected] of rows) {
    const result = runAction654aReadinessFixture(`action_653s_654a_expiry_${name}`, {
      evaluated_at: evaluatedAt,
    });
    expect(result.readiness_status).toBe(expected);
    if (expected === "expired") {
      expect(result.effects.downstream_digest_operations).toBe(0);
      expect(result.effects.v5_authority_readbacks).toBe(0);
    }
  }
});

test("descriptor snapshot rejects getter, proxy, cycle, and budget attacks", () => {
  let getterExecutions = 0;
  const getterInput = cloneInput(action654aReadinessFixture("action_653s_654a_getter"));
  Object.defineProperty(instructionRecord(getterInput), "execution_identity", {
    enumerable: true,
    get() { getterExecutions += 1; return "forged"; },
  });
  expect(runAction654aTransportInertDispatchReadiness(enabled, getterInput).terminal_reason)
    .toBe("input_snapshot_rejected");
  expect(getterExecutions).toBe(0);

  let proxyHooks = 0;
  const proxy = new Proxy(action654aReadinessFixture("action_653s_654a_proxy"), {
    ownKeys() { proxyHooks += 1; throw new Error("must not run"); },
    getOwnPropertyDescriptor() { proxyHooks += 1; throw new Error("must not run"); },
    getPrototypeOf() { proxyHooks += 1; throw new Error("must not run"); },
  });
  expect(runAction654aTransportInertDispatchReadiness(enabled, proxy).terminal_reason)
    .toBe("input_snapshot_rejected");
  expect(proxyHooks).toBe(0);

  const cycle = cloneInput(action654aReadinessFixture("action_653s_654a_cycle"));
  cycle.self = cycle;
  expect(runAction654aTransportInertDispatchReadiness(enabled, cycle).terminal_reason)
    .toBe("input_snapshot_rejected");

  const huge = cloneInput(action654aReadinessFixture("action_653s_654a_budget"));
  for (let index = 0; index < 8_300; index += 1) huge[`extra_${index}`] = index;
  expect(runAction654aTransportInertDispatchReadiness(enabled, huge).terminal_reason)
    .toBe("input_snapshot_rejected");
});

test("readiness digest and receipt-bound lineage rebuild independently", () => {
  const input = action654aReadinessFixture("action_653s_654a_rebuild");
  const result = runAction654aTransportInertDispatchReadiness(enabled, input);
  const envelope = result.envelope!;
  const { readiness_digest: readinessDigest, ...unsigned } = envelope;
  expect(readinessDigest).toBe(
    `action_654a_dispatch_readiness_envelope_${hashAction650sCanonicalValue(unsigned)}`,
  );
  expect(envelope.instruction_identity).toBe(
    input.v5_instruction_result.instruction?.instruction_digest,
  );
  expect(envelope.manual_confirmation_consumption_identity).toBe(
    input.v5_instruction_result.receipt?.predecessor_consumption_receipt_digest,
  );
  expect(envelope.diagnostic_audit_identity).toBe(
    input.v5_instruction_result.diagnostic_audit_handoff?.handoff_digest,
  );
  expect(envelope.synthetic_replay_identity).toBe(
    input.v5_instruction_result.synthetic_replay?.evidence_digest,
  );
});

test("golden matrix is deterministic across timezone spelling and input order", () => {
  const rows = action654aGoldenCases.map((item, index) => {
    const result = runAction654aReadinessFixture(`action_653s_654a_golden_${index}`, {
      clock: item.clock,
      reverse_input_order: item.reverse_input_order,
    });
    return {
      name: item.name,
      readiness_status: result.readiness_status,
      terminal_reason: result.terminal_reason,
      readiness_identity: result.envelope?.readiness_identity ?? null,
      readiness_digest: result.envelope?.readiness_digest ?? null,
      instruction_identity: result.envelope?.instruction_identity ?? null,
      synthetic_replay_identity: result.envelope?.synthetic_replay_identity ?? null,
    };
  });
  expect(rows).toEqual(golden.cases);
});

test("isolated Action 654A process probe", () => {
  const result = runAction654aReadinessFixture("action_653s_654a_cross_process", {
    clock: "stockholm",
  });
  console.log(`ACTION654A_PROBE:${JSON.stringify({
    status: result.readiness_status,
    identity: result.envelope?.readiness_identity,
    digest: result.envelope?.readiness_digest,
    instruction: result.envelope?.instruction_identity,
  })}`);
});

test("cross-process result is timezone deterministic and transport is unreachable", () => {
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
        `/private/tmp/action-654a-probe-${tz.replace(/[^a-z0-9]/gi, "-")}`,
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
});

test("safety flags and effects remain fully inert", () => {
  const result = runAction654aReadinessFixture("action_653s_654a_safety");
  expect(result.safety).toEqual(golden.safety);
  expect(result.effects).toMatchObject({
    getter_executions: 0,
    proxy_hooks_executed: 0,
    callback_executions: 0,
    iterator_executions: 0,
    caller_handles_received: 0,
    transport_adapters: 0,
    transport_requests: 0,
    broker_submissions: 0,
    provider_calls: 0,
    credential_reads: 0,
    browser_or_cdp_operations: 0,
    database_reads: 0,
    database_writes: 0,
    process_spawns: 0,
    trade_mutations: 0,
  });
});

test("fixture imports only public V5 and readiness operations", () => {
  const fixture = source("tests/fixtures/action-654a-transport-inert-dispatch-readiness-fixtures.ts");
  const imports = [...fixture.matchAll(/from\s+["']([^"']+)["']/g)].map((match) => match[1]);
  expect(imports).toEqual([
    "../../lib/action-653s-non-exportable-authority-transaction",
    "../../lib/action-654a-transport-inert-dispatch-readiness",
  ]);
  expect(fixture).not.toMatch(/ticket|grant|issuer|mint|factory|bootstrap|credential|broker|transport_adapter/i);
  const valid = action654aApprovedV5Result("action_653s_654a_fixture_surface");
  expect(valid.contract_version).toBe("action_653s_non_exportable_authority_transaction_v5");
});
