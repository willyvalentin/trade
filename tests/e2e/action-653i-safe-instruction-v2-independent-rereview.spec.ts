import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  createAction650sRuntimeIdentityContext,
} from "../../lib/action-650s-execution-identity";
import {
  prepareAction650sExecution,
  type Action650sExecutionCandidate,
} from "../../lib/action-650s-execution-preparation";
import {
  getAction650uManualConfirmationConsumptionState,
} from "../../lib/action-650u-manual-confirmation";
import {
  runAction651cExecutionQualityAuditV2,
  verifyAction651cDiagnosticAuditResult,
} from "../../lib/action-651c-execution-quality-audit-v2";
import {
  runAction652cExecutionIntentAdmission,
} from "../../lib/action-652c-non-forgeable-risk-authority";
import {
  runAction653aBrokerNeutralExecutionInstruction,
} from "../../lib/action-653a-broker-neutral-execution-instruction";
import {
  action653hSnapshotBudget,
  canAction653hProceedToSyntheticReplay,
  replayAction653hPreparedInstruction,
  runAction653hSafeInstructionSuccessor,
} from "../../lib/action-653h-safe-instruction-successor";
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";
import { buildAction653hFixtureScenario } from "../fixtures/action-653h-safe-instruction-successor-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;
const normativePaths = [
  "docs/action-653h-safe-instruction-successor-golden-report.json",
  "docs/action-653h-safe-instruction-successor.md",
  "lib/action-653h-safe-instruction-successor.ts",
  "tests/e2e/action-653h-safe-instruction-successor.spec.ts",
  "tests/fixtures/action-653h-safe-instruction-successor-fixtures.ts",
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

function buildSubstitutedRisk() {
  const primary = buildAction653hFixtureScenario();
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity:
      primary.request.prepared.runtime_identity_context.execution_identity,
    runtime_instance_identity: "action-653i-substitute-runtime",
    runtime_session_identity: "action-653i-substitute-session",
    created_at: "2026-07-29T09:55:00.000000000Z",
  });
  if (!runtime) throw new Error("substitute runtime failed");
  const candidate: Action650sExecutionCandidate = {
    candidate_identity: "action-651a-candidate",
    trigger: "stop_loss_reached",
    ticker: "AAPL",
    side: "SELL",
    quantity: 5,
    order_type: "STOP_LIMIT",
    limit_price: 179,
    stop_price: 180,
    created_at: "2026-07-29T09:50:00.000000000Z",
    expires_at: null,
  };
  const substitutePrepared = prepareAction650sExecution({
    runtime,
    candidates: [candidate],
    observed_at: "2026-07-29T10:00:00.000000000Z",
  });
  if (substitutePrepared.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("substitute preparation failed");
  }
  const primaryIntent =
    primary.predecessor.predecessor.request.intent;
  const risk = runAction652cExecutionIntentAdmission(
    enabled,
    {
      prepared: substitutePrepared,
      intent: {
        ...primaryIntent,
        execution_identity:
          substitutePrepared.runtime_identity_context.execution_identity,
        preparation_trace_identity: substitutePrepared.trace_identity,
        handoff_identity:
          substitutePrepared.handoff.identity.handoff_identity,
      },
      admission_at:
        primary.predecessor.predecessor.request.admission_at,
    },
  );
  if (risk.admission_status !== "admitted") {
    throw new Error(`substitute risk failed: ${risk.admission_reason}`);
  }
  return { primary, risk };
}

test("rebuilds the exact five-path frozen normative digest", () => {
  expect(normativeDigest()).toBe(
    "851bd4f9e091759410fb70ca986ecde991a0ac72be922e2c5e255297e6264cac",
  );
});

test("reproduces V1 nested getter execution and proves V2 reads it zero times", () => {
  const legacy = buildAction653hFixtureScenario();
  let legacyReads = 0;
  const legacyCapability = {
    ...legacy.request.confirmation_capability,
  } as Record<string, unknown>;
  Object.defineProperty(legacyCapability, "capability_digest", {
    enumerable: true,
    get() {
      legacyReads += 1;
      return legacy.request.confirmation_capability.capability_digest;
    },
  });
  runAction653aBrokerNeutralExecutionInstruction(enabled, {
    ...legacy.request,
    confirmation_capability: legacyCapability,
  });
  expect(legacyReads).toBeGreaterThan(0);

  const successor = buildAction653hFixtureScenario();
  let successorReads = 0;
  const successorCapability = {
    ...successor.request.confirmation_capability,
  } as Record<string, unknown>;
  Object.defineProperty(successorCapability, "capability_digest", {
    enumerable: true,
    get() {
      successorReads += 1;
      return successor.request.confirmation_capability.capability_digest;
    },
  });
  const result = runAction653hSafeInstructionSuccessor(enabled, {
    ...successor.request,
    confirmation_capability: successorCapability,
  });
  expect(successorReads).toBe(0);
  expect(result.terminal_reason).toBe("input_snapshot_rejected");
});

test("reproduces V1 pre-lineage consumption and proves V2 retry safety", () => {
  const legacy = buildSubstitutedRisk();
  expect(
    runAction653aBrokerNeutralExecutionInstruction(enabled, {
      ...legacy.primary.request,
      risk_admission: legacy.risk,
    }).terminal_reason,
  ).toBe("execution_lineage_mismatch");
  expect(
    getAction650uManualConfirmationConsumptionState(
      legacy.primary.request.confirmation_capability,
    ),
  ).toBe("consumed");

  const successor = buildSubstitutedRisk();
  const invalid = runAction653hSafeInstructionSuccessor(enabled, {
    ...successor.primary.request,
    risk_admission: successor.risk,
  });
  expect(invalid.terminal_reason).toBe("execution_lineage_mismatch");
  expect(invalid.effects.manual_confirmation_consumptions).toBe(0);
  expect(
    getAction650uManualConfirmationConsumptionState(
      successor.primary.request.confirmation_capability,
    ),
  ).toBe("unconsumed");
  const valid = runAction653hSafeInstructionSuccessor(
    enabled,
    successor.primary.request,
  );
  expect(valid.instruction_status).toBe("prepared");
  expect(valid.effects.manual_confirmation_consumptions).toBe(1);
});

test("uses an iterative bounded descriptor snapshot and rejects hostile graphs", () => {
  const source = readFileSync(
    resolve(root, "lib/action-653h-safe-instruction-successor.ts"),
    "utf8",
  );
  const snapshotBody = source.slice(
    source.indexOf("function clonePlainIteratively"),
    source.indexOf("function boundaryProjection"),
  );
  expect(snapshotBody).toContain("while (stack.length > 0)");
  expect(snapshotBody).not.toContain("deepFreezeAction650s");
  expect(action653hSnapshotBudget).toEqual({
    maximum_depth: 48,
    maximum_nodes: 6_144,
    maximum_properties: 32_768,
    maximum_string_bytes: 1_048_576,
  });

  const proxyScenario = buildAction653hFixtureScenario();
  expect(
    runAction653hSafeInstructionSuccessor(enabled, {
      ...proxyScenario.request,
      risk_admission: new Proxy(proxyScenario.request.risk_admission, {}),
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");
  const cycleScenario = buildAction653hFixtureScenario();
  const cyclic = {
    ...cycleScenario.request.confirmation_capability,
  } as Record<string, unknown>;
  cyclic.self = cyclic;
  expect(
    runAction653hSafeInstructionSuccessor(enabled, {
      ...cycleScenario.request,
      confirmation_capability: cyclic,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");
});

test("performs no caller-owned data reads after the snapshot boundary", () => {
  const source = readFileSync(
    resolve(root, "lib/action-653h-safe-instruction-successor.ts"),
    "utf8",
  );
  const downstream = source.slice(
    source.indexOf("const snapshot = captured.snapshot;"),
    source.indexOf("const consumed = consumeAction650uManualConfirmation"),
  );
  const callerOwnedDataReaders = [
    "canAction652cProceedToManualConfirmation(handles.risk_admission)",
    "verifyAction650uManualConfirmationCapability(",
  ].filter((needle) => downstream.includes(needle));
  expect(callerOwnedDataReaders).toEqual([]);
});

test("orders all fallible successor validation and construction before consumption", () => {
  const source = readFileSync(
    resolve(root, "lib/action-653h-safe-instruction-successor.ts"),
    "utf8",
  );
  const consume = source.indexOf(
    "const consumed = consumeAction650uManualConfirmation",
  );
  for (const marker of [
    "if (!lineageMatches(prepared, risk, capability))",
    "const parity = payloadParity(prepared, risk);",
    "const expiresAt = instructionExpiresAt(",
    "const preparedResult = finish(\"enabled\"",
  ]) {
    expect(source.indexOf(marker)).toBeGreaterThan(0);
    expect(source.indexOf(marker)).toBeLessThan(consume);
  }
  const afterSuccess = source.slice(
    source.indexOf("if (!consumed.ok)"),
    source.indexOf("export function canAction653hProceedToSyntheticReplay"),
  );
  expect(afterSuccess).not.toMatch(
    /lineageMatches|payloadParity|instructionExpiresAt|hashAction650sCanonicalValue/,
  );
});

test("enforces strict expiry and zero consumption for invalid temporal attempts", () => {
  for (const value of [
    "2026-07-29T10:10:00.000000000Z",
    "2026-07-29T10:10:00.000000001Z",
  ]) {
    const scenario = buildAction653hFixtureScenario("utc_a", {
      consumed_at: value,
      observed_at: value,
    });
    const result = runAction653hSafeInstructionSuccessor(
      enabled,
      scenario.request,
    );
    expect(result.terminal_reason).toBe("confirmation_expired");
    expect(result.effects.manual_confirmation_consumptions).toBe(0);
  }
  const before = buildAction653hFixtureScenario("utc_a", {
    consumed_at: "2026-07-29T10:09:59.999999999Z",
    observed_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(
    runAction653hSafeInstructionSuccessor(enabled, before.request)
      .instruction_status,
  ).toBe("prepared");
});

test("preserves exact duplicate idempotency and rejects conflict/cross-execution", () => {
  const scenario = buildAction653hFixtureScenario();
  const first = runAction653hSafeInstructionSuccessor(
    enabled,
    scenario.request,
  );
  expect(
    runAction653hSafeInstructionSuccessor(enabled, {
      ...scenario.request,
    }),
  ).toBe(first);
  const conflict = runAction653hSafeInstructionSuccessor(enabled, {
    ...scenario.request,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(conflict.terminal_reason).toBe("conflicting_instruction_reuse");
  expect(conflict.effects.manual_confirmation_consumptions).toBe(0);

  const cross = buildAction653hFixtureScenario();
  runAction653hSafeInstructionSuccessor(enabled, cross.request);
  const clonedPrepared = JSON.parse(
    JSON.stringify(cross.request.prepared),
  ) as Record<string, unknown>;
  (
    clonedPrepared.runtime_identity_context as Record<string, unknown>
  ).execution_identity = "action-653i-cross-execution";
  const crossResult = runAction653hSafeInstructionSuccessor(enabled, {
    ...cross.request,
    prepared: clonedPrepared,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(crossResult.terminal_reason).toBe(
    "cross_execution_reuse_rejected",
  );
  expect(crossResult.effects.manual_confirmation_consumptions).toBe(0);
});

test("preserves provenance-only synthetic replay and 651C audit interoperability", () => {
  const scenario = buildAction653hFixtureScenario();
  const result = runAction653hSafeInstructionSuccessor(
    enabled,
    scenario.request,
  );
  const replay = replayAction653hPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  expect(canAction653hProceedToSyntheticReplay(result)).toBe(true);
  expect(replay?.accepted).toBe(true);
  expect(
    replayAction653hPreparedInstruction(
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

test("keeps live, transport, credential, process, persistence, and write edges absent", () => {
  const source = readFileSync(
    resolve(root, "lib/action-653h-safe-instruction-successor.ts"),
    "utf8",
  );
  const imports = [...source.matchAll(/^import[\s\S]*?from\s+["']([^"']+)["'];/gm)]
    .map((match) => match[1]);
  expect(imports).toEqual(
    expect.arrayContaining([
      "node:util",
      "@/lib/action-650s-execution-identity",
      "@/lib/action-650s-execution-preparation",
      "@/lib/action-650u-manual-confirmation",
      "@/lib/action-650u-temporal-confirmation-policy",
      "@/lib/action-652c-non-forgeable-risk-authority",
    ]),
  );
  expect(source).not.toMatch(
    /\bfetch\s*\(|WebSocket|node:(?:child_process|net|tls|http|https)|createClient|supabase|puppeteer|playwright|bankid/i,
  );
  const scenario = buildAction653hFixtureScenario();
  const result = runAction653hSafeInstructionSuccessor(
    enabled,
    scenario.request,
  );
  expect(result.safety).toMatchObject({
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
});
