import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { hashAction650sCanonicalValue } from "../../lib/action-650s-execution-identity";
import {
  runAction653sNonExportableAuthorityInstruction,
  type Action653sInstructionResult,
} from "../../lib/action-653s-non-exportable-authority-transaction";
import { runAction654aTransportInertDispatchReadiness } from "../../lib/action-654a-transport-inert-dispatch-readiness";
import * as action654hRuntime from "../../lib/action-654h-private-readiness-provenance";
import {
  runAction654hPrivateReadinessComposition,
} from "../../lib/action-654h-private-readiness-provenance";
import golden from "../../docs/action-654h-private-readiness-provenance-golden-report.json";
import {
  action654hGoldenCases,
  action654hPlainFixture,
  runAction654hPlainFixture,
} from "../fixtures/action-654h-private-readiness-provenance-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function runV5(idempotencyKey: string) {
  return runAction653sNonExportableAuthorityInstruction(enabled, {
    request_version: "action_653s_plain_instruction_request_v1",
    operation: "action_653s_prepare_synthetic_instruction",
    idempotency_key: idempotencyKey,
    observed_at: "2026-07-29T10:00:02.000000000Z",
  });
}

function effectsAreZero(result: ReturnType<typeof runAction654hPrivateReadinessComposition>) {
  expect(result.effects).toMatchObject({
    digest_operations: 0,
    v5_invocations: 0,
    v5_establishments: 0,
    v5_readbacks: 0,
    v5_reconstitutions: 0,
    capsule_mints: 0,
    capsule_reads: 0,
    readiness_classifications: 0,
    confirmation_consumptions: 0,
  });
}

function isolatedCopiedV5(idempotencyKey: string): Action653sInstructionResult {
  const output = execFileSync(
    resolve(root, "node_modules/.bin/playwright"),
    [
      "test",
      "tests/e2e/action-654h-private-readiness-provenance.spec.ts",
      "--grep",
      "isolated V5 plain-result producer",
      "--reporter=line",
      "--workers=1",
      "--output",
      `/private/tmp/action-654h-v5-copy-${idempotencyKey}`,
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        ACTION654H_COPIED_V5_KEY: idempotencyKey,
        PLAYWRIGHT_SKIP_WEB_SERVER: "true",
      },
      encoding: "utf8",
    },
  );
  const line = output
    .split("\n")
    .find((item) => item.includes("ACTION654H_COPIED_V5:"));
  if (!line) throw new Error("isolated V5 result marker missing");
  return JSON.parse(
    Buffer.from(line.replace(/^.*ACTION654H_COPIED_V5:/, "").trim(), "base64").toString("utf8"),
  ) as Action653sInstructionResult;
}

test("default-off and kill switch return before descriptor, digest, V5, or capsule work", () => {
  let hooks = 0;
  const hostile = new Proxy({}, {
    get() { hooks += 1; throw new Error("must not read"); },
    getPrototypeOf() { hooks += 1; throw new Error("must not inspect"); },
    ownKeys() { hooks += 1; throw new Error("must not enumerate"); },
  });
  for (const gate of [
    { enabled: false, kill_switch_active: false },
    { enabled: true, kill_switch_active: true },
  ]) {
    const result = runAction654hPrivateReadinessComposition(gate, hostile);
    expect(result.effects.input_descriptor_reads).toBe(0);
    effectsAreZero(result);
  }
  expect(hooks).toBe(0);
});

test("654G-M1 reproduces against 654A by reconstituting a copied V5 result", () => {
  test.setTimeout(90_000);
  const key = "action_653s_654g_m1_reproduction";
  const copied = isolatedCopiedV5(key);
  const oldResult = runAction654aTransportInertDispatchReadiness(enabled, {
    v5_instruction_result: copied,
    evaluated_at: "2026-07-29T10:05:00.000000000Z",
  });
  expect(oldResult.readiness_status).toBe("ready");
  expect(oldResult.effects.v5_authority_readbacks).toBe(1);
  expect(runV5(key).idempotent_replay).toBe(true);
});

test("copied, serialized, and self-consistent V5 results are rejected without store reconstitution", () => {
  test.setTimeout(90_000);
  const key = "action_653s_654h_copy_closure";
  const copied = isolatedCopiedV5(key);
  for (const input of [
    copied,
    JSON.parse(JSON.stringify(copied)),
    { ...action654hPlainFixture("action_654h_copy_rejected"), v5_instruction_result: copied },
  ]) {
    const rejected = runAction654hPrivateReadinessComposition(enabled, input);
    expect(rejected.readiness_status).not.toBe("ready");
    effectsAreZero(rejected);
  }
  const genuine = runV5(key);
  expect(genuine.instruction_status).toBe("prepared");
  expect(genuine.idempotent_replay).toBe(false);
  expect(genuine.effects.private_composition_transactions).toBe(1);
  expect(genuine.effects.private_confirmation_consumptions).toBe(1);
});

test("valid private composition establishes V5 and readiness exactly once", () => {
  const result = runAction654hPlainFixture("action_654h_valid_atomic");
  expect(result.readiness_status).toBe("ready");
  expect(result.terminal_reason).toBe("readiness_ready");
  expect(result.v5_instruction_result).toMatchObject({
    contract_version: "action_653s_non_exportable_authority_transaction_v5",
    instruction_status: "prepared",
    idempotent_replay: false,
  });
  expect(result.effects).toMatchObject({
    v5_invocations: 1,
    v5_establishments: 1,
    v5_readbacks: 0,
    v5_reconstitutions: 0,
    capsule_mints: 1,
    capsule_reads: 1,
    readiness_classifications: 1,
    confirmation_consumptions: 1,
  });
  expect(result.readiness_envelope).toMatchObject({
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.readiness_envelope)).toBe(true);
});

test("all invalid and non-eligible inputs consume no confirmation or execution authority", () => {
  const rows: unknown[] = [
    null,
    {},
    { ...action654hPlainFixture("action_654h_expired_exact"), evaluated_at: "2026-07-29T10:10:00.000000000Z" },
    { ...action654hPlainFixture("action_654h_expired_plus"), evaluated_at: "2026-07-29T10:10:00.000000001Z" },
    { ...action654hPlainFixture("action_654h_before_confirm"), observed_at: "2026-07-29T10:00:00.999999999Z" },
    { ...action654hPlainFixture("action_654h_callback"), callback: () => undefined },
    { ...action654hPlainFixture("action_654h_ticket"), authority_ticket: { forged: true } },
  ];
  for (const input of rows) {
    const result = runAction654hPrivateReadinessComposition(enabled, input);
    expect(result.readiness_status).not.toBe("ready");
    effectsAreZero(result);
  }
});

test("expiry is strict at minus one, boundary, and plus one nanosecond", () => {
  const accepted = runAction654hPlainFixture("action_654h_expiry_minus", {
    evaluated_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(accepted.readiness_status).toBe("ready");
  for (const [name, evaluatedAt] of [
    ["boundary", "2026-07-29T10:10:00.000000000Z"],
    ["plus", "2026-07-29T10:10:00.000000001Z"],
  ] as const) {
    const rejected = runAction654hPlainFixture(`action_654h_expiry_${name}_b`, {
      evaluated_at: evaluatedAt,
    });
    expect(rejected.readiness_status).toBe("not_eligible");
    effectsAreZero(rejected);
  }
});

test("descriptor snapshot rejects getter, proxy, cycle, callback, and budget attacks with zero hooks", () => {
  let getterHooks = 0;
  const getterInput = action654hPlainFixture("action_654h_getter_attack") as unknown as Record<string, unknown>;
  Object.defineProperty(getterInput, "observed_at", {
    enumerable: true,
    get() { getterHooks += 1; return "2026-07-29T10:00:02Z"; },
  });
  effectsAreZero(runAction654hPrivateReadinessComposition(enabled, getterInput));
  expect(getterHooks).toBe(0);

  let proxyHooks = 0;
  const proxy = new Proxy(action654hPlainFixture("action_654h_proxy_attack"), {
    get() { proxyHooks += 1; throw new Error("must not run"); },
    getOwnPropertyDescriptor() { proxyHooks += 1; throw new Error("must not run"); },
    ownKeys() { proxyHooks += 1; throw new Error("must not run"); },
  });
  effectsAreZero(runAction654hPrivateReadinessComposition(enabled, proxy));
  expect(proxyHooks).toBe(0);

  const cycle = action654hPlainFixture("action_654h_cycle_attack") as unknown as Record<string, unknown>;
  cycle.self = cycle;
  effectsAreZero(runAction654hPrivateReadinessComposition(enabled, cycle));

  const budget = action654hPlainFixture("action_654h_budget_attack") as unknown as Record<string, unknown>;
  for (let index = 0; index < 300; index += 1) budget[`extra_${index}`] = index;
  effectsAreZero(runAction654hPrivateReadinessComposition(enabled, budget));
});

test("caller mutation after snapshot cannot alter private readiness bytes", () => {
  const input = action654hPlainFixture("action_654h_mutation_isolated") as unknown as Record<string, unknown>;
  const result = runAction654hPrivateReadinessComposition(enabled, input);
  input.evaluated_at = "2026-07-29T10:09:59.999999999Z";
  input.idempotency_key = "action_654h_mutated_after";
  expect(result.readiness_status).toBe("ready");
  expect(result.readiness_envelope?.evaluated_at).toBe("2026-07-29T10:05:00.000000000Z");
  expect(result.v5_instruction_result?.idempotent_replay).toBe(false);
});

test("exact duplicate is idempotent while conflict and cross-session substitution fail closed", () => {
  const input = action654hPlainFixture("action_654h_idempotency");
  const first = runAction654hPrivateReadinessComposition(enabled, input);
  const duplicate = runAction654hPrivateReadinessComposition(enabled, structuredClone(input));
  expect(first.readiness_status).toBe("ready");
  expect(duplicate.readiness_status).toBe("ready");
  expect(duplicate.terminal_reason).toBe("exact_duplicate_idempotent");
  expect(duplicate.idempotent_replay).toBe(true);
  expect(duplicate.readiness_envelope?.readiness_digest).toBe(first.readiness_envelope?.readiness_digest);
  expect(duplicate.effects).toMatchObject({
    v5_invocations: 0,
    v5_establishments: 0,
    capsule_mints: 0,
    readiness_classifications: 0,
    confirmation_consumptions: 0,
  });

  const conflict = { ...input, evaluated_at: "2026-07-29T10:05:00.000000001Z" };
  const rejected = runAction654hPrivateReadinessComposition(enabled, conflict);
  expect(rejected.readiness_status).toBe("conflicting");
  expect(rejected.terminal_reason).toBe("conflicting_readiness_reuse");
  expect(rejected.effects.v5_invocations).toBe(0);
  expect(rejected.effects.confirmation_consumptions).toBe(0);

  const crossSession = { ...input, session_identity: "caller-selected-session" };
  effectsAreZero(runAction654hPrivateReadinessComposition(enabled, crossSession));
});

test("readiness identity, envelope, and terminal digests independently rebuild", () => {
  const result = runAction654hPlainFixture("action_654h_digest_rebuild");
  const envelope = result.readiness_envelope!;
  const expectedIdentity = `action_654h_private_readiness_identity_${hashAction650sCanonicalValue({
    execution_identity: envelope.execution_identity,
    instruction_identity: envelope.instruction_identity,
    session_identity: envelope.session_identity,
    idempotency_identity: envelope.idempotency_identity,
    evaluated_at: envelope.evaluated_at,
  })}`;
  expect(envelope.readiness_identity).toBe(expectedIdentity);
  const { readiness_digest: readinessDigest, ...unsignedEnvelope } = envelope;
  expect(readinessDigest).toBe(
    `action_654h_private_readiness_envelope_${hashAction650sCanonicalValue(unsignedEnvelope)}`,
  );
  const { terminal_digest: terminalDigest, ...unsignedResult } = result;
  expect(terminalDigest).toBe(
    `action_654h_private_readiness_terminal_${hashAction650sCanonicalValue(unsignedResult)}`,
  );
});

test("runtime/source inventories expose no reconstitution, capsule, mint, or transport surface", () => {
  expect(Object.keys(action654hRuntime)).toEqual([
    "runAction654hPrivateReadinessComposition",
  ]);
  const implementation = source("lib/action-654h-private-readiness-provenance.ts");
  expect(implementation).not.toMatch(/rebuildAndVerifyV5/);
  expect(implementation.match(/runAction653sNonExportableAuthorityInstruction\s*\(/g)).toHaveLength(1);
  expect(implementation).not.toMatch(
    /export\s+(?:function|const|class)\s+[^\n]*(?:capsule|mint|factory|registrar|issuer|ticket|grant)/i,
  );
  expect(implementation).not.toMatch(
    /\bfetch\s*\(|WebSocket|XMLHttpRequest|node:(?:child_process|net|tls|http|https|dgram)|createClient|supabase|puppeteer|playwright|bankid|broker_url|account_id|session_cookie/i,
  );
  const fixture = source("tests/fixtures/action-654h-private-readiness-provenance-fixtures.ts");
  expect(fixture).not.toMatch(/action-653s|ticket|grant|issuer|mint|factory|bootstrap/i);
});

test("transport fields and all live/write effects remain literal false or zero", () => {
  const result = runAction654hPlainFixture("action_654h_transport_inert");
  expect(result.safety).toEqual(golden.safety);
  expect(result.readiness_envelope).toMatchObject({
    transport_attached: false,
    dispatch_permitted: false,
    broker_submission_allowed: false,
  });
  expect(result.effects).toMatchObject({
    v5_readbacks: 0,
    v5_reconstitutions: 0,
    getter_executions: 0,
    proxy_hooks_executed: 0,
    callback_executions: 0,
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

test("synthetic replay and diagnostic audit lineage remain bound without real-fill claims", () => {
  const result = runAction654hPlainFixture("action_654h_interop");
  const v5 = result.v5_instruction_result!;
  const envelope = result.readiness_envelope!;
  expect(v5.synthetic_replay).toMatchObject({ accepted: true, synthetic_only: true });
  expect(v5.diagnostic_audit_handoff).toMatchObject({
    diagnostic_only: true,
    real_broker_evidence: false,
    performance_eligible: false,
    automatic_execution_allowed: false,
  });
  expect(envelope.synthetic_replay_identity).toBe(v5.synthetic_replay?.evidence_digest);
  expect(envelope.diagnostic_audit_identity).toBe(v5.diagnostic_audit_handoff?.handoff_digest);
});

test("isolated V5 plain-result producer", () => {
  const key = process.env.ACTION654H_COPIED_V5_KEY;
  test.skip(!key, "probe-only test");
  const result = runV5(key!);
  console.log(`ACTION654H_COPIED_V5:${Buffer.from(JSON.stringify(result)).toString("base64")}`);
});

test("isolated Action 654H deterministic process probe", () => {
  const clock = process.env.ACTION654H_PROCESS_CLOCK as
    | "utc_a"
    | "utc_b"
    | "stockholm"
    | "new_york"
    | undefined;
  test.skip(!clock, "probe-only test");
  const result = runAction654hPlainFixture("action_654h_process_golden", {
    clock,
    reverse_input_order: process.env.ACTION654H_REVERSE === "true",
  });
  console.log(`ACTION654H_PROCESS:${JSON.stringify({
    readiness_status: result.readiness_status,
    terminal_reason: result.terminal_reason,
    observed_input_digest: result.observed_input_digest,
    readiness_identity: result.readiness_envelope?.readiness_identity,
    readiness_digest: result.readiness_envelope?.readiness_digest,
    instruction_identity: result.readiness_envelope?.instruction_identity,
    synthetic_replay_identity: result.readiness_envelope?.synthetic_replay_identity,
  })}`);
});

test("golden matrix is deterministic across process, timezone spelling, and input order", () => {
  test.setTimeout(150_000);
  const rows = action654hGoldenCases.map((item) => {
    const output = execFileSync(
      resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-654h-private-readiness-provenance.spec.ts",
        "--grep",
        "isolated Action 654H deterministic process probe",
        "--reporter=line",
        "--workers=1",
        "--output",
        `/private/tmp/action-654h-process-${item.name}`,
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          TZ: item.clock === "stockholm" ? "Europe/Stockholm" : item.clock === "new_york" ? "America/New_York" : "UTC",
          ACTION654H_PROCESS_CLOCK: item.clock,
          ACTION654H_REVERSE: String(item.reverse_input_order),
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
        },
        encoding: "utf8",
      },
    );
    const line = output.split("\n").find((value) => value.includes("ACTION654H_PROCESS:"));
    if (!line) throw new Error("determinism marker missing");
    return {
      name: item.name,
      ...JSON.parse(line.replace(/^.*ACTION654H_PROCESS:/, "").trim()),
    };
  });
  expect(rows).toEqual(golden.cases);
  const canonical = rows.map((row) => JSON.stringify({
    readiness_status: row.readiness_status,
    terminal_reason: row.terminal_reason,
    observed_input_digest: row.observed_input_digest,
    readiness_identity: row.readiness_identity,
    readiness_digest: row.readiness_digest,
    instruction_identity: row.instruction_identity,
    synthetic_replay_identity: row.synthetic_replay_identity,
  }));
  expect(new Set(canonical).size).toBe(1);
});
