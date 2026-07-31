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
  action653lSnapshotBudget,
  canAction653lProceedToSyntheticReplay,
  rebuildAction653lEnvelopeDigest,
  rebuildAction653lProjectionDigest,
  replayAction653lPreparedInstruction,
  runAction653lHandleOpaqueInstruction,
  type Action653lAuthorityProjection,
} from "../../lib/action-653l-handle-opaque-authority-transaction";
import {
  action653lGoldenMatrixCases,
  buildAction653lFixtureScenario,
} from "../fixtures/action-653l-handle-opaque-authority-transaction-fixtures";
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";

const enabled = { enabled: true, kill_switch_active: false } as const;
const root = resolve(__dirname, "../..");

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(resolve(root, path))).digest(
    "hex",
  );
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

test("default-off and kill-switch perform zero descriptor or authority work", () => {
  let getterReads = 0;
  const request = Object.defineProperty({}, "authority_ticket", {
    enumerable: true,
    get() {
      getterReads += 1;
      throw new Error("must not execute");
    },
  });
  for (const gate of [
    { enabled: false, kill_switch_active: false },
    { enabled: true, kill_switch_active: true },
  ]) {
    const result = runAction653lHandleOpaqueInstruction(gate, request);
    expect(result.effects).toMatchObject({
      request_descriptor_reads: 0,
      caller_predecessor_handles_received: 0,
      caller_predecessor_handles_stored: 0,
      caller_predecessor_handles_forwarded: 0,
      private_authority_lookups: 0,
      private_confirmation_consumptions: 0,
      post_transaction_caller_reads: 0,
    });
  }
  expect(getterReads).toBe(0);
});

test("V3 M1 is reproducible while V4 public and downstream surfaces are handle-opaque", () => {
  const v3 = readFileSync(
    resolve(root, "lib/action-653j-internal-verification-capsule.ts"),
    "utf8",
  );
  const v3Boundary = v3.slice(
    v3.indexOf("export function issueAction653jInternalVerificationCapsule"),
    v3.indexOf("export function materializeAction653jVerifiedInstruction"),
  );
  expect(v3Boundary).toContain("handles");
  expect(v3Boundary).toContain("consumeAction650uManualConfirmation(");

  const v4 = readFileSync(
    resolve(
      root,
      "lib/action-653l-handle-opaque-authority-transaction.ts",
    ),
    "utf8",
  );
  const publicType = v4.slice(
    v4.indexOf("export type Action653lInstructionRequest"),
    v4.indexOf("export type Action653lConsumptionReceipt"),
  );
  const publicFlow = v4.slice(
    v4.indexOf("PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_BEGIN"),
    v4.indexOf("PUBLIC_HANDLE_OPAQUE_INSTRUCTION_SUCCESSOR_END"),
  );
  for (const forbidden of [
    "prepared:",
    "risk_admission:",
    "confirmation_boundary:",
    "confirmation_capability:",
  ]) {
    expect(publicType).not.toContain(forbidden);
    expect(publicFlow).not.toContain(forbidden);
  }
  expect(publicFlow).not.toContain("consumeAction650uManualConfirmation(");
  expect(publicFlow).not.toContain("verifyAction650uManualConfirmationCapability(");
});

test("revocable caller proxies and throwing tickets execute zero hooks", () => {
  const scenario = buildAction653lFixtureScenario();
  let ticketHooks = 0;
  const throwingTicket = Proxy.revocable({}, {
    get() {
      ticketHooks += 1;
      throw new Error("ticket get");
    },
    getOwnPropertyDescriptor() {
      ticketHooks += 1;
      throw new Error("ticket descriptor");
    },
    ownKeys() {
      ticketHooks += 1;
      throw new Error("ticket keys");
    },
  });
  const rejected = runAction653lHandleOpaqueInstruction(enabled, {
    ...scenario.request,
    authority_ticket: throwingTicket.proxy,
  });
  expect(rejected.terminal_reason).toBe("authority_ticket_unproven");
  expect(ticketHooks).toBe(0);
  expect(rejected.effects.private_confirmation_consumptions).toBe(0);

  const proxyScenario = buildAction653lFixtureScenario();
  let projectionHooks = 0;
  const projectionProxy = new Proxy(proxyScenario.request.projection, {
    get() {
      projectionHooks += 1;
      throw new Error("projection get");
    },
  });
  const proxyRejected = runAction653lHandleOpaqueInstruction(enabled, {
    ...proxyScenario.request,
    projection: projectionProxy,
  });
  expect(proxyRejected.terminal_reason).toBe("input_snapshot_rejected");
  expect(projectionHooks).toBe(0);
  expect(proxyRejected.effects.private_confirmation_consumptions).toBe(0);
});

test("self-minted and cloned tickets are rejected without consumption", () => {
  for (const createTicket of [
    () => ({
      ticket_version: "action_653l_private_authority_ticket_v1",
      ticket_digest: "action_653l_self_minted",
    }),
    () => {
      const scenario = buildAction653lFixtureScenario();
      return { ...scenario.grant.authority_ticket };
    },
  ]) {
    const scenario = buildAction653lFixtureScenario();
    const result = runAction653lHandleOpaqueInstruction(enabled, {
      ...scenario.request,
      authority_ticket: createTicket(),
    });
    expect(result.terminal_reason).toBe("authority_ticket_unproven");
    expect(result.effects.private_confirmation_consumptions).toBe(0);
    expect(
      getAction650uManualConfirmationConsumptionState(
        scenario.predecessor.request.confirmation_capability,
      ),
    ).toBe("unconsumed");
  }
});

test("a private atomic transaction returns one frozen provenance receipt", () => {
  const scenario = buildAction653lFixtureScenario();
  const result = runAction653lHandleOpaqueInstruction(
    enabled,
    scenario.request,
  );
  expect(result.instruction_status).toBe("prepared");
  expect(result.authority_receipt).not.toBeNull();
  expect(Object.isFrozen(result.authority_receipt)).toBe(true);
  expect(result.authority_receipt?.consumption_count).toBe(1);
  expect(result.effects).toMatchObject({
    caller_predecessor_handles_received: 0,
    caller_predecessor_handles_stored: 0,
    caller_predecessor_handles_forwarded: 0,
    private_authority_lookups: 1,
    private_confirmation_consumptions: 1,
    post_transaction_caller_reads: 0,
  });
  const { envelope_digest: claimed, ...unsigned } = result;
  expect(claimed).toBe(rebuildAction653lEnvelopeDigest(unsigned));
  expect(
    getAction650uManualConfirmationConsumptionState(
      scenario.predecessor.request.confirmation_capability,
    ),
  ).toBe("consumed");
});

test("invalid substituted projection consumes zero then valid input consumes once", () => {
  const scenario = buildAction653lFixtureScenario();
  const projection = mutableProjection(scenario.request.projection);
  projection.handoff_digest = "action_653l_substituted_handoff";
  const invalid = runAction653lHandleOpaqueInstruction(enabled, {
    ...scenario.request,
    projection: sealProjection(projection),
  });
  expect(invalid.terminal_reason).toBe("authority_projection_mismatch");
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
});

test("cross-session and cross-execution projection substitution are rejected", () => {
  for (const mutate of [
    (projection: Record<string, unknown>) => {
      projection.session_identity = "action_653l_cross_session";
    },
    (projection: Record<string, unknown>) => {
      projection.execution_identity = "action_653l_cross_execution";
    },
  ]) {
    const scenario = buildAction653lFixtureScenario();
    const projection = mutableProjection(scenario.request.projection);
    mutate(projection);
    const result = runAction653lHandleOpaqueInstruction(enabled, {
      ...scenario.request,
      projection: sealProjection(projection),
    });
    expect(result.instruction_status).not.toBe("prepared");
    expect(result.effects.private_confirmation_consumptions).toBe(0);
    expect(
      getAction650uManualConfirmationConsumptionState(
        scenario.predecessor.request.confirmation_capability,
      ),
    ).toBe("unconsumed");
  }
});

test("accessors, cycles, depth, parity, and scale failures are fail-closed", () => {
  const accessorScenario = buildAction653lFixtureScenario();
  let getterReads = 0;
  const accessorProjection = mutableProjection(
    accessorScenario.request.projection,
  );
  Object.defineProperty(accessorProjection, "notional", {
    enumerable: true,
    get() {
      getterReads += 1;
      return accessorScenario.request.projection.notional;
    },
  });
  expect(
    runAction653lHandleOpaqueInstruction(enabled, {
      ...accessorScenario.request,
      projection: accessorProjection,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");
  expect(getterReads).toBe(0);

  const cycleScenario = buildAction653lFixtureScenario();
  const cyclic = mutableProjection(cycleScenario.request.projection);
  cyclic.cycle = cyclic;
  expect(
    runAction653lHandleOpaqueInstruction(enabled, {
      ...cycleScenario.request,
      projection: cyclic,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");

  const depthScenario = buildAction653lFixtureScenario();
  const deep = mutableProjection(depthScenario.request.projection);
  let cursor: Record<string, unknown> = deep;
  for (
    let index = 0;
    index <= action653lSnapshotBudget.maximum_depth;
    index += 1
  ) {
    const next: Record<string, unknown> = {};
    cursor.extra = next;
    cursor = next;
  }
  expect(
    runAction653lHandleOpaqueInstruction(enabled, {
      ...depthScenario.request,
      projection: deep,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");

  for (const mutate of [
    (projection: Record<string, unknown>) => {
      projection.notional = {
        value: "1",
        scale: 6,
        unit: "SEK_micros",
        currency: "SEK",
      };
    },
    (projection: Record<string, unknown>) => {
      projection.quantity = { value: "5", scale: 1, unit: "units" };
    },
  ]) {
    const scenario = buildAction653lFixtureScenario();
    const projection = mutableProjection(scenario.request.projection);
    mutate(projection);
    const result = runAction653lHandleOpaqueInstruction(enabled, {
      ...scenario.request,
      projection: sealProjection(projection),
    });
    expect(result.instruction_status).not.toBe("prepared");
    expect(result.effects.private_confirmation_consumptions).toBe(0);
  }
});

test("strict session expiry accepts minus one and rejects boundary plus one", () => {
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
});

test("exact duplicate is idempotent while conflict consumes zero additional times", () => {
  const scenario = buildAction653lFixtureScenario();
  const first = runAction653lHandleOpaqueInstruction(
    enabled,
    scenario.request,
  );
  const duplicate = runAction653lHandleOpaqueInstruction(enabled, {
    ...scenario.request,
  });
  expect(first.instruction_status).toBe("prepared");
  expect(duplicate).toBe(first);

  const conflict = runAction653lHandleOpaqueInstruction(enabled, {
    ...scenario.request,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(conflict.terminal_reason).toBe("conflicting_instruction_reuse");
  expect(conflict.effects.private_confirmation_consumptions).toBe(0);
});

test("post-transaction callers are unreachable and synthetic audit interop remains", () => {
  const scenario = buildAction653lFixtureScenario();
  const request = { ...scenario.request };
  const result = runAction653lHandleOpaqueInstruction(enabled, request);
  expect(result.instruction_status).toBe("prepared");

  let hooks = 0;
  const revoked = Proxy.revocable({}, {
    get() {
      hooks += 1;
      throw new Error("post-transaction get");
    },
  });
  revoked.revoke();
  request.authority_ticket = revoked.proxy as never;
  request.projection = revoked.proxy as never;
  const replay = replayAction653lPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  expect(hooks).toBe(0);
  expect(canAction653lProceedToSyntheticReplay(result)).toBe(true);
  expect(replay?.accepted).toBe(true);

  const auditScenario = buildAction651cFixtureScenario();
  const audit = runAction651cExecutionQualityAuditV2(auditScenario.input);
  expect(audit.audit_status).toBe("audited");
  expect(verifyAction651cDiagnosticAuditResult(audit)).toBe(true);
  expect(audit.safety.real_broker_evidence).toBe(false);
  expect(audit.safety.performance_eligible).toBe(false);
});

test("golden matrix is deterministic across timezone and input order", () => {
  const results = action653lGoldenMatrixCases.map((entry) =>
    runAction653lHandleOpaqueInstruction(
      enabled,
      buildAction653lFixtureScenario(entry.clock, {
        reverse_input_order: entry.reverse_input_order,
      }).request,
    ),
  );
  expect(results.map((result) => result.instruction_status)).toEqual(
    results.map(() => "prepared"),
  );
  expect(new Set(results.map((result) => result.envelope_digest)).size).toBe(1);
  expect(new Set(results.map((result) => result.snapshot_digest)).size).toBe(1);
  expect(
    new Set(results.map((result) => result.instruction?.instruction_digest))
      .size,
  ).toBe(1);
});

test("golden evidence, predecessor bytes, and capability exclusions are closed", () => {
  const scenario = buildAction653lFixtureScenario();
  const result = runAction653lHandleOpaqueInstruction(
    enabled,
    scenario.request,
  );
  const replay = replayAction653lPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  const golden = JSON.parse(
    readFileSync(
      resolve(
        root,
        "tests/fixtures/action-653l-handle-opaque-authority-transaction.golden.json",
      ),
      "utf8",
    ),
  );
  expect(golden.contract_version).toBe(result.contract_version);
  expect(golden.matrix.common_envelope_digest).toBe(result.envelope_digest);
  expect(golden.matrix.common_snapshot_digest).toBe(result.snapshot_digest);
  expect(golden.matrix.common_instruction_digest).toBe(
    result.instruction?.instruction_digest,
  );
  expect(golden.matrix.common_receipt_digest).toBe(
    result.authority_receipt?.receipt_digest,
  );
  expect(golden.matrix.common_replay_evidence_digest).toBe(
    replay?.evidence_digest,
  );

  const predecessorHashes = {
    "docs/action-653j-internal-verification-capsule-golden-report.json":
      "13662d4d9dcd91244b07752e7bff8d9d9a209491186216ef8ce046b75d4d09c2",
    "docs/action-653j-internal-verification-capsule.md":
      "697dfc9f43920517cf158ec7ed519cdca7476a2706931437653a750357cc78ff",
    "lib/action-653j-internal-verification-capsule.ts":
      "9cb16cd625ea2d6c3fa9b31ba6edd002af2162438ca9d07f2b71d172813e386b",
    "tests/e2e/action-653j-internal-verification-capsule.spec.ts":
      "8436a5da3046e0ca946260a4b99d509aedba197326994d98a6baefb70015826a",
    "tests/fixtures/action-653j-internal-verification-capsule-fixtures.ts":
      "cbef520e80fb96e11eaa37cf2b19b9b1ab44f7e294b33d70b515a015d3969cd4",
  };
  for (const [path, expected] of Object.entries(predecessorHashes)) {
    expect(sha256(path)).toBe(expected);
  }

  const source = readFileSync(
    resolve(
      root,
      "lib/action-653l-handle-opaque-authority-transaction.ts",
    ),
    "utf8",
  );
  const imports = source
    .split("\n")
    .filter((line) => /^import .* from /.test(line))
    .join("\n");
  expect(imports).not.toMatch(
    /(?:avanza|broker|browser|playwright|puppeteer|supabase|database|fetch|socket|child_process)/i,
  );
  expect(JSON.stringify(result.instruction)).not.toMatch(
    /(?:https?:|credential|cookie|bankid|account|browser|cdp|socket|fetch)/i,
  );
  expect(result.safety).toMatchObject(golden.safety);
  expect(result.effects).toMatchObject({
    transport_requests: 0,
    credential_reads: 0,
    database_reads: 0,
    database_writes: 0,
    process_spawns: 0,
    trade_mutations: 0,
  });
});
