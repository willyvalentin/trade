import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  getAction650uManualConfirmationConsumptionState,
} from "../../lib/action-650u-manual-confirmation";
import {
  runAction651cExecutionQualityAuditV2,
  verifyAction651cDiagnosticAuditResult,
} from "../../lib/action-651c-execution-quality-audit-v2";
import {
  canAction653lProceedToSyntheticReplay,
  rebuildAction653lEnvelopeDigest,
  rebuildAction653lProjectionDigest,
  replayAction653lPreparedInstruction,
  runAction653lHandleOpaqueInstruction,
  type Action653lAuthorityProjection,
} from "../../lib/action-653l-handle-opaque-authority-transaction";
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";
import { buildAction653lFixtureScenario } from "../fixtures/action-653l-handle-opaque-authority-transaction-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;
const normativePaths = [
  "docs/action-653l-handle-opaque-authority-transaction-contract.md",
  "lib/action-653l-handle-opaque-authority-transaction.ts",
  "tests/e2e/action-653l-handle-opaque-authority-transaction.spec.ts",
  "tests/fixtures/action-653l-handle-opaque-authority-transaction-fixtures.ts",
  "tests/fixtures/action-653l-handle-opaque-authority-transaction.golden.json",
] as const;

function normativeDigest() {
  const combined = createHash("sha256");
  for (const path of normativePaths) {
    const bytes = readFileSync(resolve(root, path));
    combined.update(path);
    combined.update("\0");
    combined.update(bytes);
    combined.update("\0");
  }
  return combined.digest("hex");
}

function source(path: string) {
  return readFileSync(resolve(root, path), "utf8");
}

function mutableProjection(
  projection: Action653lAuthorityProjection,
): Record<string, unknown> {
  return JSON.parse(JSON.stringify(projection)) as Record<string, unknown>;
}

function sealProjection(projection: Record<string, unknown>) {
  projection.projection_digest = rebuildAction653lProjectionDigest(
    projection as Action653lAuthorityProjection,
  );
  return projection as Action653lAuthorityProjection;
}

test("independently rebuilds the exact frozen five-path digest", () => {
  expect(normativeDigest()).toBe(
    "e52b05f8e352676819ab64df8a93dec780dcb1062e0e8fc059de5cc7f90b961a",
  );
  const golden = JSON.parse(
    source(
      "tests/fixtures/action-653l-handle-opaque-authority-transaction.golden.json",
    ),
  );
  expect(golden.contract_version).toBe(
    "action_653l_handle_opaque_instruction_v4",
  );
  expect(golden.safety.handle_opaque).toBe(true);
});

test("reproduces historical V2 and V3 findings without treating them as V4 failures", () => {
  const v2 = source("lib/action-653h-safe-instruction-successor.ts");
  const v2Downstream = v2.slice(
    v2.indexOf("const snapshot = captured.snapshot;"),
    v2.indexOf("preparedResultProvenance.add(preparedResult);"),
  );
  expect(v2Downstream).toContain(
    "canAction652cProceedToManualConfirmation(handles.risk_admission)",
  );
  expect(v2Downstream).toContain(
    "verifyAction650uManualConfirmationCapability(",
  );

  const v3 = source("lib/action-653j-internal-verification-capsule.ts");
  const v3Downstream = v3.slice(
    v3.indexOf("const { handles, snapshot } = captured;"),
    v3.indexOf("capsuleRuntimeStates.set(artifacts.capsule"),
  );
  expect(v3Downstream).toContain(
    "hasAction650sPreparedExecutionProvenance(handles.prepared)",
  );
  expect(v3Downstream).toContain(
    "consumeAction650uManualConfirmation({",
  );

  const v4 = source(
    "lib/action-653l-handle-opaque-authority-transaction.ts",
  );
  const publicFlow = v4.slice(
    v4.indexOf("PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_BEGIN"),
    v4.indexOf("PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_END"),
  );
  expect(publicFlow).not.toMatch(
    /handles\.|consumeAction650uManualConfirmation|verifyAction650uManualConfirmationCapability/,
  );
});

test("public V4 input and every post-transaction path are structurally handle-opaque", () => {
  const v4 = source(
    "lib/action-653l-handle-opaque-authority-transaction.ts",
  );
  const publicType = v4.slice(
    v4.indexOf("export type Action653lInstructionRequest"),
    v4.indexOf("export type Action653lConsumptionReceipt"),
  );
  expect(publicType).toContain("authority_ticket:");
  expect(publicType).toContain("projection:");
  expect(publicType).toContain("consumed_at:");
  expect(publicType).toContain("observed_at:");
  for (const forbidden of [
    "prepared:",
    "risk_admission:",
    "confirmation_boundary:",
    "confirmation_capability:",
  ]) {
    expect(publicType).not.toContain(forbidden);
  }

  const privateModule = v4.slice(
    v4.indexOf("PRIVATE_AUTHORITY_MODULE_BEGIN"),
    v4.indexOf("PRIVATE_AUTHORITY_MODULE_END"),
  );
  expect(privateModule).toContain("privateTicketStates.get(");
  expect(privateModule).toContain("consumeAction650uManualConfirmation({");
  const downstream = v4.slice(
    v4.indexOf("PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_END"),
  );
  expect(downstream).not.toMatch(
    /preparation_authority|risk_authority|confirmation_boundary_authority|confirmation_capability_authority/,
  );
});

test("all plain validation precedes private lookup and consumption", () => {
  const v4 = source(
    "lib/action-653l-handle-opaque-authority-transaction.ts",
  );
  const publicFlow = v4.slice(
    v4.indexOf("PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_BEGIN"),
    v4.indexOf("PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_END"),
  );
  const capture = publicFlow.indexOf("capturePublicRequest(request)");
  const validation = publicFlow.indexOf("validatePublicSnapshot(captured)");
  const transaction = publicFlow.indexOf(
    "executePrivateAtomicAuthorityTransaction(",
  );
  expect(capture).toBeGreaterThan(0);
  expect(validation).toBeGreaterThan(capture);
  expect(transaction).toBeGreaterThan(validation);

  const privateTransaction = v4.slice(
    v4.indexOf("function executePrivateAtomicAuthorityTransaction"),
    v4.indexOf("PRIVATE_AUTHORITY_MODULE_END"),
  );
  const lookup = privateTransaction.indexOf("privateTicketStates.get(");
  const provenance = privateTransaction.indexOf(
    "!hasAction650sPreparedExecutionProvenance",
  );
  const consumption = privateTransaction.indexOf(
    "consumeAction650uManualConfirmation({",
  );
  const receipt = privateTransaction.indexOf("const unsignedReceipt =");
  expect(lookup).toBeGreaterThan(0);
  expect(provenance).toBeGreaterThan(lookup);
  expect(consumption).toBeGreaterThan(provenance);
  expect(receipt).toBeGreaterThan(consumption);
});

test("private lookup returns one frozen provenance receipt and rejects self-minting", () => {
  const selfMintScenario = buildAction653lFixtureScenario();
  const selfMinted = Object.freeze({
    ticket_version: "action_653l_private_authority_ticket_v1",
    ticket_digest: selfMintScenario.grant.authority_ticket.ticket_digest,
  });
  const rejected = runAction653lHandleOpaqueInstruction(enabled, {
    ...selfMintScenario.request,
    authority_ticket: selfMinted,
  });
  expect(rejected.terminal_reason).toBe("authority_ticket_unproven");
  expect(rejected.effects.private_confirmation_consumptions).toBe(0);

  const cloneScenario = buildAction653lFixtureScenario();
  const cloneRejected = runAction653lHandleOpaqueInstruction(enabled, {
    ...cloneScenario.request,
    authority_ticket: { ...cloneScenario.grant.authority_ticket },
  });
  expect(cloneRejected.terminal_reason).toBe("authority_ticket_unproven");
  expect(cloneRejected.effects.private_confirmation_consumptions).toBe(0);

  const valid = runAction653lHandleOpaqueInstruction(
    enabled,
    cloneScenario.request,
  );
  expect(valid.instruction_status).toBe("prepared");
  expect(Object.isFrozen(valid.authority_receipt)).toBe(true);
  expect(valid.authority_receipt?.consumption_count).toBe(1);
  expect(valid.effects.private_confirmation_consumptions).toBe(1);
  const { envelope_digest: claimed, ...unsigned } = valid;
  expect(claimed).toBe(rebuildAction653lEnvelopeDigest(unsigned));
});

test("invalid and cross-lineage attempts consume zero before a valid retry", () => {
  for (const mutate of [
    (projection: Record<string, unknown>) => {
      projection.session_identity = "action_653m_cross_session";
    },
    (projection: Record<string, unknown>) => {
      projection.execution_identity = "action_653m_cross_execution";
    },
    (projection: Record<string, unknown>) => {
      projection.handoff_digest = "action_653m_cross_handoff";
    },
  ]) {
    const scenario = buildAction653lFixtureScenario();
    const projection = mutableProjection(scenario.request.projection);
    mutate(projection);
    const invalid = runAction653lHandleOpaqueInstruction(enabled, {
      ...scenario.request,
      projection: sealProjection(projection),
    });
    expect(invalid.instruction_status).not.toBe("prepared");
    expect(invalid.effects.private_confirmation_consumptions).toBe(0);
    expect(
      getAction650uManualConfirmationConsumptionState(
        scenario.predecessor.request.confirmation_capability,
      ),
    ).toBe("unconsumed");
    const valid = runAction653lHandleOpaqueInstruction(
      enabled,
      scenario.request,
    );
    expect(valid.instruction_status).toBe("prepared");
    expect(valid.effects.private_confirmation_consumptions).toBe(1);
  }
});

test("revocable caller objects execute zero hooks and never reach private handles", () => {
  const ticketScenario = buildAction653lFixtureScenario();
  let ticketHooks = 0;
  const revocableTicket = Proxy.revocable({}, {
    get() {
      ticketHooks += 1;
      throw new Error("ticket get");
    },
    ownKeys() {
      ticketHooks += 1;
      throw new Error("ticket keys");
    },
    getOwnPropertyDescriptor() {
      ticketHooks += 1;
      throw new Error("ticket descriptor");
    },
  });
  const ticketResult = runAction653lHandleOpaqueInstruction(enabled, {
    ...ticketScenario.request,
    authority_ticket: revocableTicket.proxy,
  });
  expect(ticketResult.terminal_reason).toBe("authority_ticket_unproven");
  expect(ticketResult.effects.private_confirmation_consumptions).toBe(0);
  expect(ticketHooks).toBe(0);

  const projectionScenario = buildAction653lFixtureScenario();
  let projectionHooks = 0;
  const projection = new Proxy(projectionScenario.request.projection, {
    get() {
      projectionHooks += 1;
      throw new Error("projection get");
    },
  });
  const projectionResult = runAction653lHandleOpaqueInstruction(enabled, {
    ...projectionScenario.request,
    projection,
  });
  expect(projectionResult.terminal_reason).toBe("input_snapshot_rejected");
  expect(projectionResult.effects.private_confirmation_consumptions).toBe(0);
  expect(projectionHooks).toBe(0);
});

test("expiry, exact duplicate, and conflicting reuse preserve closed semantics", () => {
  const before = buildAction653lFixtureScenario("utc_a", {
    consumed_at: "2026-07-29T10:09:59.999999999Z",
    observed_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(
    runAction653lHandleOpaqueInstruction(enabled, before.request)
      .instruction_status,
  ).toBe("prepared");
  for (const instant of [
    "2026-07-29T10:10:00.000000000Z",
    "2026-07-29T10:10:00.000000001Z",
  ]) {
    const scenario = buildAction653lFixtureScenario("utc_a", {
      consumed_at: instant,
      observed_at: instant,
    });
    const result = runAction653lHandleOpaqueInstruction(
      enabled,
      scenario.request,
    );
    expect(result.instruction_status).not.toBe("prepared");
    expect(result.effects.private_confirmation_consumptions).toBe(0);
  }

  const duplicateScenario = buildAction653lFixtureScenario();
  const first = runAction653lHandleOpaqueInstruction(
    enabled,
    duplicateScenario.request,
  );
  expect(
    runAction653lHandleOpaqueInstruction(enabled, {
      ...duplicateScenario.request,
    }),
  ).toBe(first);
  const conflict = runAction653lHandleOpaqueInstruction(enabled, {
    ...duplicateScenario.request,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(conflict.terminal_reason).toBe("conflicting_instruction_reuse");
  expect(conflict.effects.private_confirmation_consumptions).toBe(0);
});

test("synthetic replay and 651C audit remain provenance-only", () => {
  const scenario = buildAction653lFixtureScenario();
  const result = runAction653lHandleOpaqueInstruction(
    enabled,
    scenario.request,
  );
  const replay = replayAction653lPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  expect(canAction653lProceedToSyntheticReplay(result)).toBe(true);
  expect(replay?.accepted).toBe(true);
  expect(
    replayAction653lPreparedInstruction(
      Object.freeze({ ...result }),
      "2026-07-29T10:00:03.000000000Z",
    ),
  ).toBeNull();

  const auditScenario = buildAction651cFixtureScenario();
  const audit = runAction651cExecutionQualityAuditV2(auditScenario.input);
  expect(audit.audit_status).toBe("audited");
  expect(verifyAction651cDiagnosticAuditResult(audit)).toBe(true);
  expect(audit.safety.real_broker_evidence).toBe(false);
  expect(audit.safety.performance_eligible).toBe(false);
});

test("live capability exclusion and content-addressed baseline equivalence remain closed", () => {
  const implementation = source(
    "lib/action-653l-handle-opaque-authority-transaction.ts",
  );
  const imports = [
    ...implementation.matchAll(
      /^import[\s\S]*?from\s+["']([^"']+)["'];/gm,
    ),
  ].map((match) => match[1]);
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

  const baseline = JSON.parse(
    source(
      "docs/action-653k-internal-verification-capsule-freeze-manifest.json",
    ),
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

  const result = runAction653lHandleOpaqueInstruction(
    enabled,
    buildAction653lFixtureScenario().request,
  );
  expect(result.safety).toMatchObject({
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
  expect(result.effects).toMatchObject({
    transport_requests: 0,
    credential_reads: 0,
    database_reads: 0,
    database_writes: 0,
    process_spawns: 0,
    trade_mutations: 0,
  });
});
