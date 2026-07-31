import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { hashAction650sCanonicalValue } from "../../lib/action-650s-execution-identity";
import {
  runAction651cExecutionQualityAuditV2,
  verifyAction651cDiagnosticAuditResult,
} from "../../lib/action-651c-execution-quality-audit-v2";
import * as action653lRuntime from "../../lib/action-653l-handle-opaque-authority-transaction";
import * as action653sRuntime from "../../lib/action-653s-non-exportable-authority-transaction";
import {
  runAction653sNonExportableAuthorityInstruction,
} from "../../lib/action-653s-non-exportable-authority-transaction";
import golden from "../../docs/action-653s-non-exportable-authority-transaction-golden-report.json";
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";
import {
  action653sGoldenCases,
  action653sPlainFixture,
  runAction653sPlainFixture,
} from "../fixtures/action-653s-non-exportable-authority-transaction-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function unsignedDigest(prefix: string, value: Record<string, unknown>) {
  return `${prefix}_${hashAction650sCanonicalValue(value)}`;
}

function assertPlainFrozenTree(value: unknown) {
  const stack = [value];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    expect(Object.isFrozen(current)).toBe(true);
    expect(Object.getOwnPropertySymbols(current)).toEqual([]);
    expect([Object.prototype, null]).toContain(Object.getPrototypeOf(current));
    for (const descriptor of Object.values(
      Object.getOwnPropertyDescriptors(current),
    )) {
      expect(descriptor.get).toBeUndefined();
      expect(descriptor.set).toBeUndefined();
      expect(typeof descriptor.value).not.toBe("function");
      stack.push(descriptor.value);
    }
  }
}

test("default-off and kill-switch perform zero request or authority work", () => {
  let getterReads = 0;
  const hostile = Object.defineProperty({}, "request_version", {
    enumerable: true,
    get() {
      getterReads += 1;
      throw new Error("must remain unread");
    },
  });
  for (const gate of [
    { enabled: false, kill_switch_active: false },
    { enabled: true, kill_switch_active: true },
  ]) {
    const result = runAction653sNonExportableAuthorityInstruction(gate, hostile);
    expect(result.effects).toMatchObject({
      request_descriptor_reads: 0,
      private_composition_transactions: 0,
      private_confirmation_consumptions: 0,
      caller_handles_received: 0,
      caller_authority_selections: 0,
    });
  }
  expect(getterReads).toBe(0);
});

test("reproduces 653R-M1 in V4 and removes the factory from V5 exports", () => {
  const v4Source = source("lib/action-653l-handle-opaque-authority-transaction.ts");
  expect(v4Source).toContain(
    "export function issueAction653lPrivateAuthorityTicket",
  );
  expect(Object.keys(action653lRuntime)).toContain(
    "issueAction653lPrivateAuthorityTicket",
  );
  expect(Object.keys(action653sRuntime).sort()).toEqual([
    "runAction653sNonExportableAuthorityInstruction",
  ]);
  const v5Source = source("lib/action-653s-non-exportable-authority-transaction.ts");
  const runtimeExports = [...v5Source.matchAll(/^export (?:async )?function\s+(\w+)/gm)]
    .map((match) => match[1]);
  expect(runtimeExports).toEqual([
    "runAction653sNonExportableAuthorityInstruction",
  ]);
  expect(v5Source).not.toMatch(
    /^export (?:const|class|function)\s+(?:issue|mint|create|make|build|register|bootstrap|construct|factory)\w*/gim,
  );
  expect(v5Source).not.toContain("issueAction653lPrivateAuthorityTicket");
});

test("fixtures import only the V5 public operation and plain types", () => {
  const fixture = source(
    "tests/fixtures/action-653s-non-exportable-authority-transaction-fixtures.ts",
  );
  const imports = [...fixture.matchAll(/from\s+["']([^"']+)["']/g)].map(
    (match) => match[1],
  );
  expect(imports).toEqual([
    "../../lib/action-653s-non-exportable-authority-transaction",
  ]);
  expect(fixture).not.toMatch(
    /ticket|grant|issuer|mint|factory|constructor|register|bootstrap|preparation_authority|risk_authority|confirmation_capability/i,
  );
});

test("public input is plain-only and rejects authority selection surfaces", () => {
  for (const injected of [
    { session_identity: "caller-session" },
    { execution_identity: "caller-execution" },
    { destination_identity: "caller-destination" },
    { authority_ticket: { ticket_digest: "self-minted" } },
    { issuer: () => ({}) },
    { callback: () => ({}) },
  ]) {
    const result = runAction653sNonExportableAuthorityInstruction(enabled, {
      ...action653sPlainFixture("action_653s_plain_surface"),
      ...injected,
    });
    expect(["conflicting", "unmappable"]).toContain(result.instruction_status);
    expect(result.effects.private_confirmation_consumptions).toBe(0);
    expect(result.effects.caller_authority_selections).toBe(0);
  }
});

test("proxies, nested accessors, cycles and non-plain objects fail closed", () => {
  let proxyHooks = 0;
  const proxy = new Proxy({}, {
    ownKeys() {
      proxyHooks += 1;
      throw new Error("proxy trap");
    },
    getOwnPropertyDescriptor() {
      proxyHooks += 1;
      throw new Error("descriptor trap");
    },
    get() {
      proxyHooks += 1;
      throw new Error("get trap");
    },
  });
  expect(
    runAction653sNonExportableAuthorityInstruction(enabled, proxy).terminal_reason,
  ).toBe("input_snapshot_rejected");
  expect(proxyHooks).toBe(0);

  let getterReads = 0;
  const nested = Object.defineProperty({}, "value", {
    enumerable: true,
    get() {
      getterReads += 1;
      throw new Error("getter must not execute");
    },
  });
  const accessorResult = runAction653sNonExportableAuthorityInstruction(enabled, {
    ...action653sPlainFixture("action_653s_accessor"),
    nested,
  });
  expect(accessorResult.terminal_reason).toBe("input_snapshot_rejected");
  expect(accessorResult.effects.private_confirmation_consumptions).toBe(0);
  expect(getterReads).toBe(0);

  const cycle: Record<string, unknown> = {
    ...action653sPlainFixture("action_653s_cycle"),
  };
  cycle.cycle = cycle;
  expect(
    runAction653sNonExportableAuthorityInstruction(enabled, cycle).terminal_reason,
  ).toBe("input_snapshot_rejected");
  expect(
    runAction653sNonExportableAuthorityInstruction(enabled, {
      ...action653sPlainFixture("action_653s_cross_module"),
      foreign: new Date(),
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");

  const excessiveDepth: Record<string, unknown> = {
    ...action653sPlainFixture("action_653s_depth_budget"),
  };
  let cursor = excessiveDepth;
  for (let depth = 0; depth < 26; depth += 1) {
    const child: Record<string, unknown> = {};
    cursor.child = child;
    cursor = child;
  }
  const bounded = runAction653sNonExportableAuthorityInstruction(
    enabled,
    excessiveDepth,
  );
  expect(bounded.terminal_reason).toBe("input_snapshot_rejected");
  expect(bounded.effects.private_confirmation_consumptions).toBe(0);
});

test("invalid attempt consumes zero and a following valid attempt consumes once", () => {
  const key = "action_653s_invalid_then_valid";
  const invalid = runAction653sNonExportableAuthorityInstruction(enabled, {
    ...action653sPlainFixture(key),
    session_identity: "caller-substitution",
  });
  expect(invalid.effects.private_confirmation_consumptions).toBe(0);
  expect(invalid.effects.private_composition_transactions).toBe(0);

  const valid = runAction653sNonExportableAuthorityInstruction(
    enabled,
    action653sPlainFixture(key),
  );
  expect(valid.instruction_status).toBe("prepared");
  expect(valid.effects.private_confirmation_consumptions).toBe(1);
  expect(valid.effects.total_confirmation_consumptions).toBe(1);
});

test("valid operation returns only frozen plain receipt and evidence", () => {
  const result = runAction653sPlainFixture("action_653s_plain_receipt");
  expect(result.instruction_status).toBe("prepared");
  expect(result.receipt?.consumption_count).toBe(1);
  expect(result.instruction?.destination_identity).toBe(
    "action_653s_module_owned_synthetic_replay_only",
  );
  expect(result.instruction?.execution_identity).toBe("action-651a-execution");
  expect(result.instruction?.session_identity).toBe(
    "action-651a-confirmation-session",
  );
  assertPlainFrozenTree(result);
  expect(JSON.stringify(result)).not.toMatch(
    /authority_ticket|preparation_authority|risk_authority|confirmation_boundary_authority|confirmation_capability_authority/,
  );
  const descriptors = Object.getOwnPropertyDescriptors(result);
  expect(Object.values(descriptors).every((value) => !value.get && !value.set)).toBe(true);
});

test("receipt, instruction, replay and audit handoff digests rebuild independently", () => {
  const result = runAction653sPlainFixture("action_653s_digest_rebuild");
  const receipt = result.receipt!;
  const { receipt_digest: receiptDigest, ...receiptUnsigned } = receipt;
  expect(receiptDigest).toBe(
    unsignedDigest("action_653s_plain_consumption_receipt", receiptUnsigned),
  );
  const instruction = result.instruction!;
  const { instruction_digest: instructionDigest, ...instructionUnsigned } = instruction;
  expect(instructionDigest).toBe(
    unsignedDigest("action_653s_broker_neutral_instruction", instructionUnsigned),
  );
  const replay = result.synthetic_replay!;
  const { evidence_digest: evidenceDigest, ...replayUnsigned } = replay;
  expect(evidenceDigest).toBe(
    unsignedDigest("action_653s_synthetic_replay_evidence", replayUnsigned),
  );
  const audit = result.diagnostic_audit_handoff!;
  const { handoff_digest: handoffDigest, ...auditUnsigned } = audit;
  expect(handoffDigest).toBe(
    unsignedDigest("action_653s_diagnostic_audit_handoff", auditUnsigned),
  );
});

test("exact duplicate is idempotent and conflicting duplicate is rejected", () => {
  const key = "action_653s_duplicate_matrix";
  const request = action653sPlainFixture(key);
  const first = runAction653sNonExportableAuthorityInstruction(enabled, request);
  const duplicate = runAction653sNonExportableAuthorityInstruction(enabled, {
    observed_at: request.observed_at,
    idempotency_key: request.idempotency_key,
    operation: request.operation,
    request_version: request.request_version,
  });
  expect(first.terminal_reason).toBe("instruction_prepared");
  expect(duplicate.terminal_reason).toBe("exact_duplicate_idempotent");
  expect(duplicate.idempotent_replay).toBe(true);
  expect(duplicate.effects.private_confirmation_consumptions).toBe(0);
  expect(duplicate.effects.total_confirmation_consumptions).toBe(1);
  expect(duplicate.receipt?.receipt_digest).toBe(first.receipt?.receipt_digest);

  const conflict = runAction653sNonExportableAuthorityInstruction(enabled, {
    ...request,
    observed_at: "2026-07-29T10:00:02.000000001Z",
  });
  expect(conflict.terminal_reason).toBe("conflicting_instruction_reuse");
  expect(conflict.effects.private_confirmation_consumptions).toBe(0);
});

test("expiry is strict at minus one, boundary and plus one nanosecond", () => {
  const accepted = runAction653sPlainFixture("action_653s_expiry_minus_one", {
    observed_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(accepted.instruction_status).toBe("prepared");
  expect(accepted.effects.private_confirmation_consumptions).toBe(1);
  for (const [name, observedAt] of [
    ["boundary", "2026-07-29T10:10:00.000000000Z"],
    ["plus_one", "2026-07-29T10:10:00.000000001Z"],
  ] as const) {
    const rejected = runAction653sPlainFixture(`action_653s_expiry_${name}`, {
      observed_at: observedAt,
    });
    expect(rejected.instruction_status).toBe("expired");
    expect(rejected.terminal_reason).toBe("instruction_expired");
    expect(rejected.effects.private_confirmation_consumptions).toBe(0);
  }
});

test("synthetic replay and Action 651C diagnostic audit interoperate safely", () => {
  const result = runAction653sPlainFixture("action_653s_audit_interop");
  expect(result.synthetic_replay).toMatchObject({
    accepted: true,
    synthetic_only: true,
  });
  expect(result.diagnostic_audit_handoff).toMatchObject({
    diagnostic_only: true,
    real_broker_evidence: false,
    performance_eligible: false,
    automatic_execution_allowed: false,
  });
  const auditScenario = buildAction651cFixtureScenario();
  const audit = runAction651cExecutionQualityAuditV2(auditScenario.input);
  expect(audit.audit_status).toBe("audited");
  expect(verifyAction651cDiagnosticAuditResult(audit)).toBe(true);
  expect(audit.safety.real_broker_evidence).toBe(false);
  expect(audit.safety.performance_eligible).toBe(false);
});

test("golden cases are deterministic across timezone spelling and input order", () => {
  const rows = action653sGoldenCases.map((item, index) => {
    const result = runAction653sPlainFixture(`action_653s_golden_${index}`, {
      clock: item.clock,
      reverse_input_order: item.reverse_input_order,
    });
    return {
      name: item.name,
      instruction_status: result.instruction_status,
      terminal_reason: result.terminal_reason,
      instruction_digest: result.instruction?.instruction_digest ?? null,
      receipt_digest: result.receipt?.receipt_digest ?? null,
      replay_digest: result.synthetic_replay?.evidence_digest ?? null,
      audit_handoff_digest:
        result.diagnostic_audit_handoff?.handoff_digest ?? null,
    };
  });
  expect(rows).toEqual(golden.cases);
});

test("isolated V5 process probe", () => {
  const result = runAction653sPlainFixture("action_653s_cross_process_probe", {
    observed_at: "2026-07-29T12:00:02+02:00",
  });
  console.log(`ACTION653S_PROBE:${JSON.stringify({
    status: result.instruction_status,
    instruction: result.instruction?.instruction_digest,
    receipt: result.receipt?.receipt_digest,
    replay: result.synthetic_replay?.evidence_digest,
    audit: result.diagnostic_audit_handoff?.handoff_digest,
  })}`);
});

test("cross-process result is deterministic and implementation has no live capability", () => {
  test.setTimeout(90_000);
  const outputs = ["UTC", "Europe/Stockholm", "America/New_York"].map((tz) =>
    execFileSync(
      resolve(root, "node_modules/.bin/playwright"),
      [
        "test",
        "tests/e2e/action-653s-non-exportable-authority-transaction.spec.ts",
        "--grep",
        "isolated V5 process probe",
        "--reporter=line",
        "--output",
        `/private/tmp/action-653s-probe-${tz.replace(/[^a-z0-9]/gi, "-")}`,
      ],
      {
        cwd: root,
        env: {
          ...process.env,
          TZ: tz,
          PLAYWRIGHT_SKIP_WEB_SERVER: "true",
        },
        encoding: "utf8",
      },
    )
      .split("\n")
      .find((line) => line.includes("ACTION653S_PROBE:"))!
      .replace(/^.*ACTION653S_PROBE:/, "")
      .trim(),
  );
  expect(new Set(outputs).size).toBe(1);

  const implementation = source(
    "lib/action-653s-non-exportable-authority-transaction.ts",
  );
  const imports = [...implementation.matchAll(
    /^import[\s\S]*?from\s+["']([^"']+)["'];/gm,
  )].map((match) => match[1]);
  expect(imports).toEqual([
    "node:util",
    "@/lib/action-650s-execution-identity",
    "@/lib/action-650s-execution-preparation",
    "@/lib/action-650u-manual-confirmation",
    "@/lib/action-650u-temporal-confirmation-policy",
    "@/lib/action-652c-non-forgeable-risk-authority",
  ]);
  expect(implementation).not.toMatch(
    /\bfetch\s*\(|WebSocket|node:(?:child_process|net|tls|http|https)|createClient|supabase|puppeteer|playwright|bankid/i,
  );
  const result = runAction653sPlainFixture("action_653s_safety");
  expect(result.safety).toEqual(golden.safety);
  expect(result.effects).toMatchObject({
    broker_requests: 0,
    provider_calls: 0,
    credential_reads: 0,
    browser_or_cdp_operations: 0,
    database_reads: 0,
    database_writes: 0,
    process_spawns: 0,
    trade_mutations: 0,
  });
});
