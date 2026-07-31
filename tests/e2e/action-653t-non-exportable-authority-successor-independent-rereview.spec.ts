import { execFileSync } from "node:child_process";
import { createHash } from "node:crypto";
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
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";
import { buildAction653lFixtureScenario } from "../fixtures/action-653l-handle-opaque-authority-transaction-fixtures";
import {
  action653sPlainFixture,
  runAction653sPlainFixture,
} from "../fixtures/action-653s-non-exportable-authority-transaction-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;
const normativePaths = [
  "docs/action-653s-non-exportable-authority-transaction-contract.md",
  "docs/action-653s-non-exportable-authority-transaction-golden-report.json",
  "lib/action-653s-non-exportable-authority-transaction.ts",
  "tests/e2e/action-653s-non-exportable-authority-transaction.spec.ts",
  "tests/fixtures/action-653s-non-exportable-authority-transaction-fixtures.ts",
] as const;

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function normativeDigest() {
  const hash = createHash("sha256");
  for (const path of [...normativePaths].sort()) {
    hash.update(path);
    hash.update("\0");
    hash.update(readFileSync(resolve(root, path)));
    hash.update("\0");
  }
  return hash.digest("hex");
}

function rebuild(prefix: string, value: Record<string, unknown>) {
  return `${prefix}_${hashAction650sCanonicalValue(value)}`;
}

function expectFrozenPlainTree(value: unknown) {
  const stack = [value];
  const seen = new WeakSet<object>();
  while (stack.length > 0) {
    const current = stack.pop();
    if (!current || typeof current !== "object" || seen.has(current)) continue;
    seen.add(current);
    expect(Object.isFrozen(current)).toBe(true);
    expect(Object.getPrototypeOf(current)).toBe(Object.prototype);
    expect(Object.getOwnPropertySymbols(current)).toEqual([]);
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

test("independently rebuilds the frozen five-path authority", () => {
  expect(normativeDigest()).toBe(
    "92b071e3a30b58b66a7db923bdc8e6ccff39fe70e20027fe80ff75839093b880",
  );
  expect(
    execFileSync("git", ["rev-parse", "HEAD^"], {
      cwd: root,
      encoding: "utf8",
    }).trim(),
  ).toBe("f6bf570cc4925245e872005cab7d03ee68d208a9");
});

test("reproduces 653R-M1 only against V4 and closes every V5 privileged export", () => {
  expect(typeof action653lRuntime.issueAction653lPrivateAuthorityTicket).toBe(
    "function",
  );

  expect(Object.keys(action653sRuntime)).toEqual([
    "runAction653sNonExportableAuthorityInstruction",
  ]);
  const implementation = source(
    "lib/action-653s-non-exportable-authority-transaction.ts",
  );
  const runtimeExports = [
    ...implementation.matchAll(/^export (?:async )?function\s+(\w+)/gm),
  ].map((match) => match[1]);
  expect(runtimeExports).toEqual([
    "runAction653sNonExportableAuthorityInstruction",
  ]);
  expect(implementation).not.toMatch(
    /^export\s+(?:const|class|function)\s+.*(?:ticket|grant|issuer|mint|factory|constructor|registration|register|bootstrap)/gim,
  );
  expect(implementation).not.toContain(
    "issueAction653lPrivateAuthorityTicket",
  );
});

test("fixture imports no privileged or test-only authority helper", () => {
  const fixture = source(
    "tests/fixtures/action-653s-non-exportable-authority-transaction-fixtures.ts",
  );
  expect(
    [...fixture.matchAll(/from\s+["']([^"']+)["']/g)].map(
      (match) => match[1],
    ),
  ).toEqual(["../../lib/action-653s-non-exportable-authority-transaction"]);
  expect(fixture).not.toMatch(/\b(?:ticket|grant|issuer|mint|factory|constructor|register|bootstrap|handle|callback)\b/i);
  expect(fixture).not.toMatch(/(?:preparation|risk|confirmation)_authority/i);
});

test("public input is a closed canonical plain-data projection", () => {
  expect(Object.keys(action653sPlainFixture("action_653s_t_plain")).sort()).toEqual([
    "idempotency_key",
    "observed_at",
    "operation",
    "request_version",
  ]);
  for (const injected of [
    { execution_identity: "caller-execution" },
    { session_identity: "caller-session" },
    { destination_identity: "caller-destination" },
    { predecessor_handle: {} },
    { authority_identity: "caller-authority" },
    { ticket: {} },
    { issuer: () => null },
  ]) {
    const result = runAction653sNonExportableAuthorityInstruction(enabled, {
      ...action653sPlainFixture("action_653s_t_closed_input"),
      ...injected,
    });
    expect(result.instruction_status).not.toBe("prepared");
    expect(result.effects.private_composition_transactions).toBe(0);
    expect(result.effects.private_confirmation_consumptions).toBe(0);
  }
});

test("private composition cannot escape through values, errors, symbols, descriptors, or closures", () => {
  const valid = runAction653sPlainFixture("action_653s_t_escape_valid");
  expectFrozenPlainTree(valid);
  expect(JSON.stringify(valid)).not.toMatch(
    /authority_ticket|privateTicket|preparation_authority|risk_authority|confirmation_boundary_authority|confirmation_capability_authority/,
  );

  const invalid = runAction653sNonExportableAuthorityInstruction(enabled, {
    ...action653sPlainFixture("action_653s_t_escape_invalid"),
    authority: { ticket: "self-minted" },
  });
  expectFrozenPlainTree(invalid);
  expect(invalid.instruction_status).not.toBe("prepared");
  expect(invalid.effects.private_confirmation_consumptions).toBe(0);
});

test("self-minted, cloned, substituted, cross-module, accessor, and proxy inputs execute zero hooks", () => {
  let proxyHooks = 0;
  const revocable = Proxy.revocable({}, {
    get() {
      proxyHooks += 1;
      throw new Error("get trap");
    },
    ownKeys() {
      proxyHooks += 1;
      throw new Error("ownKeys trap");
    },
    getOwnPropertyDescriptor() {
      proxyHooks += 1;
      throw new Error("descriptor trap");
    },
  });
  expect(
    runAction653sNonExportableAuthorityInstruction(enabled, revocable.proxy)
      .terminal_reason,
  ).toBe("input_snapshot_rejected");
  expect(proxyHooks).toBe(0);

  let getterHooks = 0;
  const accessor = Object.defineProperty({}, "ticket", {
    enumerable: true,
    get() {
      getterHooks += 1;
      throw new Error("getter trap");
    },
  });
  const nested = runAction653sNonExportableAuthorityInstruction(enabled, {
    ...action653sPlainFixture("action_653s_t_nested_accessor"),
    authority: accessor,
  });
  expect(nested.terminal_reason).toBe("input_snapshot_rejected");
  expect(getterHooks).toBe(0);

  for (const foreign of [
    new Date(),
    new Map(),
    Object.freeze({ ticket_digest: "self-minted" }),
    Object.assign(Object.create({ inherited: true }), { cloned: true }),
  ]) {
    const result = runAction653sNonExportableAuthorityInstruction(enabled, {
      ...action653sPlainFixture("action_653s_t_cross_module"),
      foreign,
    });
    expect(result.instruction_status).not.toBe("prepared");
    expect(result.effects.private_confirmation_consumptions).toBe(0);
  }
});

test("all public validation precedes the private transaction and consumption", () => {
  const implementation = source(
    "lib/action-653s-non-exportable-authority-transaction.ts",
  );
  const publicFlow = implementation.slice(
    implementation.indexOf(
      "export function runAction653sNonExportableAuthorityInstruction",
    ),
  );
  const snapshot = publicFlow.indexOf("snapshotPlain(request)");
  const validation = publicFlow.indexOf("validateRequest(");
  const lowerTime = publicFlow.indexOf("compareAction650uInstants(observed, confirmed)");
  const upperTime = publicFlow.indexOf("compareAction650uInstants(observed, expires)");
  const transaction = publicFlow.indexOf("executePrivateAtomicTransaction(validated)");
  expect(snapshot).toBeGreaterThan(0);
  expect(validation).toBeGreaterThan(snapshot);
  expect(lowerTime).toBeGreaterThan(validation);
  expect(upperTime).toBeGreaterThan(lowerTime);
  expect(transaction).toBeGreaterThan(upperTime);

  const privateFlow = implementation.slice(
    implementation.indexOf("function executePrivateAtomicTransaction"),
    implementation.indexOf("export function runAction653sNonExportableAuthorityInstruction"),
  );
  expect(privateFlow.indexOf("verifyAction650uManualConfirmationCapability")).toBeLessThan(
    privateFlow.indexOf("consumeAction650uManualConfirmation({"),
  );
  expect(privateFlow.indexOf("consumeAction650uManualConfirmation({")).toBeLessThan(
    privateFlow.indexOf("const unsignedReceipt ="),
  );
});

test("invalid consumption is zero, valid consumption is one, and receipt rebuild is independent", () => {
  const key = "action_653s_t_invalid_then_valid";
  const invalid = runAction653sNonExportableAuthorityInstruction(enabled, {
    ...action653sPlainFixture(key),
    execution_identity: "substituted",
  });
  expect(invalid.effects.private_confirmation_consumptions).toBe(0);
  const valid = runAction653sPlainFixture(key);
  expect(valid.effects.private_confirmation_consumptions).toBe(1);
  expect(valid.receipt?.consumption_count).toBe(1);
  const { receipt_digest: claimed, ...unsigned } = valid.receipt!;
  expect(claimed).toBe(
    rebuild("action_653s_plain_consumption_receipt", unsigned),
  );
});

test("idempotency, strict expiry, and cross-session/execution rejection remain closed", () => {
  const key = "action_653s_t_idempotency";
  const request = action653sPlainFixture(key);
  const first = runAction653sNonExportableAuthorityInstruction(enabled, request);
  const duplicate = runAction653sNonExportableAuthorityInstruction(enabled, {
    observed_at: request.observed_at,
    operation: request.operation,
    request_version: request.request_version,
    idempotency_key: request.idempotency_key,
  });
  expect(first.instruction_status).toBe("prepared");
  expect(duplicate.terminal_reason).toBe("exact_duplicate_idempotent");
  expect(duplicate.effects.private_confirmation_consumptions).toBe(0);
  expect(
    runAction653sNonExportableAuthorityInstruction(enabled, {
      ...request,
      observed_at: "2026-07-29T10:00:02.000000001Z",
    }).terminal_reason,
  ).toBe("conflicting_instruction_reuse");

  expect(
    runAction653sPlainFixture("action_653s_t_expiry_minus_one", {
      observed_at: "2026-07-29T10:09:59.999999999Z",
    }).instruction_status,
  ).toBe("prepared");
  for (const instant of [
    "2026-07-29T10:10:00.000000000Z",
    "2026-07-29T10:10:00.000000001Z",
  ]) {
    const result = runAction653sPlainFixture(
      `action_653s_t_expiry_${instant.endsWith("000Z") ? "boundary" : "plus_one"}`,
      { observed_at: instant },
    );
    expect(result.instruction_status).toBe("expired");
    expect(result.effects.private_confirmation_consumptions).toBe(0);
  }

  for (const injected of [
    { session_identity: "cross-session" },
    { execution_identity: "cross-execution" },
  ]) {
    const result = runAction653sNonExportableAuthorityInstruction(enabled, {
      ...action653sPlainFixture("action_653s_t_cross_identity"),
      ...injected,
    });
    expect(result.instruction_status).not.toBe("prepared");
    expect(result.effects.private_confirmation_consumptions).toBe(0);
  }
});

test("synthetic replay and 651C audit interoperability remain diagnostic only", () => {
  const result = runAction653sPlainFixture("action_653s_t_audit");
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
  const audit = runAction651cExecutionQualityAuditV2(
    buildAction651cFixtureScenario().input,
  );
  expect(audit.audit_status).toBe("audited");
  expect(verifyAction651cDiagnosticAuditResult(audit)).toBe(true);
});

test("cross-process and cross-timezone output is deterministic", () => {
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
        `/private/tmp/action-653t-cross-process-${tz.replace(/[^a-z0-9]/gi, "-")}`,
      ],
      {
        cwd: root,
        env: { ...process.env, TZ: tz, PLAYWRIGHT_SKIP_WEB_SERVER: "true" },
        encoding: "utf8",
      },
    )
      .split("\n")
      .find((line) => line.includes("ACTION653S_PROBE:"))!
      .replace(/^.*ACTION653S_PROBE:/, "")
      .trim(),
  );
  expect(new Set(outputs).size).toBe(1);
});

test("live capability exclusion and content-addressed baseline equivalence remain closed", () => {
  const implementation = source(
    "lib/action-653s-non-exportable-authority-transaction.ts",
  );
  expect(implementation).not.toMatch(
    /\bfetch\s*\(|WebSocket|node:(?:child_process|net|tls|http|https)|createClient|supabase|puppeteer|playwright|bankid/i,
  );
  const baseline = JSON.parse(
    source("docs/action-653m-handle-opaque-authority-transaction-freeze-manifest.json"),
  ).validation;
  expect(baseline).toMatchObject({
    broad_base: "3451 passed / 13 failed",
    broad_successor: "3451 passed / 13 failed",
    broad_selected_tracked_blob_drift: "0/577",
    broad_failure_identity_order_and_messages: "identical",
    restricted_base: "22 passed / 5 failed",
    restricted_successor: "22 passed / 5 failed",
    restricted_failure_identity_order_and_messages: "identical",
    full_execution_regression_passed: false,
  });
  const result = runAction653sPlainFixture("action_653s_t_safety");
  expect(result.safety).toMatchObject({
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
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

test("V4-first issuance cannot substitute V5 private composition in a fresh runtime", () => {
  if (process.env.ACTION653T_V4_FIRST_PROBE === "true") {
    const v4Scenario = buildAction653lFixtureScenario();
    expect(v4Scenario.grant.authority_ticket).toBeTruthy();
    const result = runAction653sPlainFixture("action_653s_t_v4_first_collision");
    console.log(`ACTION653T_V4_FIRST:${JSON.stringify({
      status: result.instruction_status,
      reason: result.terminal_reason,
      transactions: result.effects.private_composition_transactions,
      consumptions: result.effects.private_confirmation_consumptions,
    })}`);
    expect(result.terminal_reason).toBe("instruction_prepared");
    expect(result.effects.private_confirmation_consumptions).toBe(1);
    return;
  }

  const output = execFileSync(
    resolve(root, "node_modules/.bin/playwright"),
    [
      "test",
      "tests/e2e/action-653t-non-exportable-authority-successor-independent-rereview.spec.ts",
      "--grep",
      "V4-first issuance cannot substitute",
      "--reporter=line",
      "--output",
      "/private/tmp/action-653t-v4-first-probe",
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        ACTION653T_V4_FIRST_PROBE: "true",
        PLAYWRIGHT_SKIP_WEB_SERVER: "true",
      },
      encoding: "utf8",
    },
  );
  const marker = output
    .split("\n")
    .find((line) => line.includes("ACTION653T_V4_FIRST:"));
  expect(marker).toBeTruthy();
  expect(JSON.parse(marker!.replace(/^.*ACTION653T_V4_FIRST:/, ""))).toEqual({
    status: "prepared",
    reason: "instruction_prepared",
    transactions: 1,
    consumptions: 1,
  });
});
