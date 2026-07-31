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
  action653jSnapshotBudget,
  canAction653jProceedToSyntheticReplay,
  issueAction653jInternalVerificationCapsule,
  materializeAction653jVerifiedInstruction,
  replayAction653jPreparedInstruction,
  runAction653jInternalVerificationCapsule,
} from "../../lib/action-653j-internal-verification-capsule";
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";
import { buildAction653jFixtureScenario } from "../fixtures/action-653j-internal-verification-capsule-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;
const normativePaths = [
  "docs/action-653j-internal-verification-capsule-golden-report.json",
  "docs/action-653j-internal-verification-capsule.md",
  "lib/action-653j-internal-verification-capsule.ts",
  "tests/e2e/action-653j-internal-verification-capsule.spec.ts",
  "tests/fixtures/action-653j-internal-verification-capsule-fixtures.ts",
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
  const primary = buildAction653jFixtureScenario();
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity:
      primary.request.prepared.runtime_identity_context.execution_identity,
    runtime_instance_identity: "action-653k-substitute-runtime",
    runtime_session_identity: "action-653k-substitute-session",
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
    primary.predecessor.predecessor.predecessor.request.intent;
  const risk = runAction652cExecutionIntentAdmission(enabled, {
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
      primary.predecessor.predecessor.predecessor.request.admission_at,
  });
  if (risk.admission_status !== "admitted") {
    throw new Error(`substitute risk failed: ${risk.admission_reason}`);
  }
  return { primary, risk };
}

test("rebuilds the exact five-path Action 653J normative digest", () => {
  expect(normativeDigest()).toBe(
    "64187d25340f2ada9194209d7a59446a6d35c04f6bfd98d7d80af439184282a9",
  );
  expect(
    createHash("sha256")
      .update(
        readFileSync(
          resolve(root, "lib/action-653h-safe-instruction-successor.ts"),
        ),
      )
      .digest("hex"),
  ).toBe("eb33f199bf1767410d6600e6d5a05444cfdcbe120fa7d9878d9abd7ce1180046");
});

test("reproduces 653I-M1 in V2 and requires V3 to remove every post-snapshot caller-handle reader", () => {
  const v2 = readFileSync(
    resolve(root, "lib/action-653h-safe-instruction-successor.ts"),
    "utf8",
  );
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

  const v3 = readFileSync(
    resolve(root, "lib/action-653j-internal-verification-capsule.ts"),
    "utf8",
  );
  const v3Downstream = v3.slice(
    v3.indexOf("const { handles, snapshot } = captured;"),
    v3.indexOf("capsuleRuntimeStates.set(artifacts.capsule"),
  );
  const postSnapshotHandleOperations = [
    "consumptionRecords.get(capabilityHandle)",
    "hasAction650sPreparedExecutionProvenance(handles.prepared)",
    "canAction652cProceedToManualConfirmation(handles.risk_admission)",
    "getAction650uManualConfirmationConsumptionState(capabilityHandle)",
    "verifyAction650uManualConfirmationCapability(",
    "handles.confirmation_boundary",
    "consumeAction650uManualConfirmation({",
  ].filter((needle) => v3Downstream.includes(needle));
  expect(postSnapshotHandleOperations).toEqual([]);
});

test("revoked replacement handles trigger zero hooks after the exported boundary returns", () => {
  const scenario = buildAction653jFixtureScenario();
  const request = { ...scenario.request };
  const issued = issueAction653jInternalVerificationCapsule(enabled, request);
  expect(issued.status).toBe("capsule_ready");
  if (issued.status !== "capsule_ready") return;

  let hooks = 0;
  for (const key of [
    "prepared",
    "risk_admission",
    "confirmation_boundary",
    "confirmation_capability",
  ] as const) {
    const revocable = Proxy.revocable({}, {
      get() {
        hooks += 1;
        throw new Error(`post-boundary get:${key}`);
      },
      ownKeys() {
        hooks += 1;
        throw new Error(`post-boundary ownKeys:${key}`);
      },
      getOwnPropertyDescriptor() {
        hooks += 1;
        throw new Error(`post-boundary descriptor:${key}`);
      },
    });
    Object.defineProperty(request, key, {
      configurable: true,
      enumerable: true,
      value: revocable.proxy,
      writable: true,
    });
    revocable.revoke();
  }
  const result = materializeAction653jVerifiedInstruction(issued.capsule);
  const replay = replayAction653jPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  expect(result?.instruction_status).toBe("prepared");
  expect(replay?.accepted).toBe(true);
  expect(hooks).toBe(0);
});

test("keeps the descriptor snapshot iterative, bounded, and getter-free", () => {
  const source = readFileSync(
    resolve(root, "lib/action-653j-internal-verification-capsule.ts"),
    "utf8",
  );
  const snapshotBody = source.slice(
    source.indexOf("function clonePlainIteratively"),
    source.indexOf("function projectBoundary"),
  );
  expect(snapshotBody).toContain("while (stack.length > 0)");
  expect(snapshotBody).not.toContain("deepFreezeAction650s");
  expect(action653jSnapshotBudget).toEqual({
    maximum_depth: 48,
    maximum_nodes: 6_144,
    maximum_properties: 32_768,
    maximum_string_bytes: 1_048_576,
  });

  const scenario = buildAction653jFixtureScenario();
  let getterReads = 0;
  const capability = {
    ...scenario.request.confirmation_capability,
  } as Record<string, unknown>;
  Object.defineProperty(capability, "capability_digest", {
    enumerable: true,
    get() {
      getterReads += 1;
      return scenario.request.confirmation_capability.capability_digest;
    },
  });
  expect(
    runAction653jInternalVerificationCapsule(enabled, {
      ...scenario.request,
      confirmation_capability: capability,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");
  expect(getterReads).toBe(0);
});

test("rejects self-minted, cloned, and substituted capsules by private provenance", () => {
  const scenario = buildAction653jFixtureScenario();
  const issued = issueAction653jInternalVerificationCapsule(
    enabled,
    scenario.request,
  );
  expect(issued.status).toBe("capsule_ready");
  if (issued.status !== "capsule_ready") return;

  const clone = Object.freeze({ ...issued.capsule });
  const substituted = Object.freeze({
    ...issued.capsule,
    identity_binding_digest: "action_653k_substituted_identity",
  });
  const selfMinted = Object.freeze(
    JSON.parse(JSON.stringify(issued.capsule)),
  );
  expect(materializeAction653jVerifiedInstruction(clone)).toBeNull();
  expect(materializeAction653jVerifiedInstruction(substituted)).toBeNull();
  expect(materializeAction653jVerifiedInstruction(selfMinted)).toBeNull();
  expect(
    materializeAction653jVerifiedInstruction(issued.capsule)
      ?.instruction_status,
  ).toBe("prepared");
  expect(Object.isFrozen(issued.capsule)).toBe(true);
});

test("validates substituted lineage before consumption and preserves retry", () => {
  const scenario = buildSubstitutedRisk();
  const capability = scenario.primary.request.confirmation_capability;
  const invalid = runAction653jInternalVerificationCapsule(enabled, {
    ...scenario.primary.request,
    risk_admission: scenario.risk,
  });
  expect(invalid.terminal_reason).toBe("execution_lineage_mismatch");
  expect(invalid.effects.manual_confirmation_consumptions).toBe(0);
  expect(getAction650uManualConfirmationConsumptionState(capability)).toBe(
    "unconsumed",
  );

  const valid = runAction653jInternalVerificationCapsule(
    enabled,
    scenario.primary.request,
  );
  expect(valid.instruction_status).toBe("prepared");
  expect(valid.effects.manual_confirmation_consumptions).toBe(1);
  expect(getAction650uManualConfirmationConsumptionState(capability)).toBe(
    "consumed",
  );
});

test("orders lineage, parity, expiry, capsule, and result construction before consumption", () => {
  const source = readFileSync(
    resolve(root, "lib/action-653j-internal-verification-capsule.ts"),
    "utf8",
  );
  const consume = source.indexOf(
    "const consumed = consumeAction650uManualConfirmation",
  );
  for (const marker of [
    "const validated = validateSnapshot(snapshot);",
    "const artifacts = preparedArtifacts(",
    "const instruction = freezePlainTree({",
    "const result = finish(\"enabled\"",
  ]) {
    expect(source.indexOf(marker)).toBeGreaterThan(0);
    expect(source.indexOf(marker)).toBeLessThan(consume);
  }
  const afterSuccess = source.slice(
    source.indexOf("if (!consumed.ok)"),
    source.indexOf(
      "export function materializeAction653jVerifiedInstruction",
    ),
  );
  expect(afterSuccess).not.toMatch(
    /validateSnapshot|preparedArtifacts|hashAction650sCanonicalValue/,
  );
});

test("preserves strict expiry, exact duplicate idempotency, and conflict rejection", () => {
  const before = buildAction653jFixtureScenario("utc_a", {
    consumed_at: "2026-07-29T10:09:59.999999999Z",
    observed_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(
    runAction653jInternalVerificationCapsule(enabled, before.request)
      .instruction_status,
  ).toBe("prepared");
  for (const value of [
    "2026-07-29T10:10:00.000000000Z",
    "2026-07-29T10:10:00.000000001Z",
  ]) {
    const expired = buildAction653jFixtureScenario("utc_a", {
      consumed_at: value,
      observed_at: value,
    });
    const result = runAction653jInternalVerificationCapsule(
      enabled,
      expired.request,
    );
    expect(result.terminal_reason).toBe("confirmation_expired");
    expect(result.effects.manual_confirmation_consumptions).toBe(0);
  }

  const duplicateScenario = buildAction653jFixtureScenario();
  const first = runAction653jInternalVerificationCapsule(
    enabled,
    duplicateScenario.request,
  );
  expect(
    runAction653jInternalVerificationCapsule(enabled, {
      ...duplicateScenario.request,
    }),
  ).toBe(first);
  const conflict = runAction653jInternalVerificationCapsule(enabled, {
    ...duplicateScenario.request,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(conflict.terminal_reason).toBe("conflicting_instruction_reuse");
  expect(conflict.effects.manual_confirmation_consumptions).toBe(0);
});

test("preserves provenance-only synthetic replay and 651C audit interoperability", () => {
  const scenario = buildAction653jFixtureScenario();
  const result = runAction653jInternalVerificationCapsule(
    enabled,
    scenario.request,
  );
  const replay = replayAction653jPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  expect(canAction653jProceedToSyntheticReplay(result)).toBe(true);
  expect(replay?.accepted).toBe(true);
  expect(
    replayAction653jPreparedInstruction(
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
    resolve(root, "lib/action-653j-internal-verification-capsule.ts"),
    "utf8",
  );
  const imports = [
    ...source.matchAll(/^import[\s\S]*?from\s+["']([^"']+)["'];/gm),
  ].map((match) => match[1]);
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
  const scenario = buildAction653jFixtureScenario();
  const result = runAction653jInternalVerificationCapsule(
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
