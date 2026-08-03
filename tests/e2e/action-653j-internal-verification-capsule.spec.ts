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
  rebuildAction653jEnvelopeDigest,
  replayAction653jPreparedInstruction,
  runAction653jInternalVerificationCapsule,
} from "../../lib/action-653j-internal-verification-capsule";
import {
  action653jGoldenMatrixCases,
  buildAction653jFixtureScenario,
} from "../fixtures/action-653j-internal-verification-capsule-fixtures";
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";

const enabled = { enabled: true, kill_switch_active: false } as const;
const root = resolve(__dirname, "../..");

function sha256(path: string) {
  return createHash("sha256").update(readFileSync(resolve(root, path))).digest(
    "hex",
  );
}

function buildSubstitutedRisk() {
  const primary = buildAction653jFixtureScenario();
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity:
      primary.request.prepared.runtime_identity_context.execution_identity,
    runtime_instance_identity: "action-653j-substitute-runtime",
    runtime_session_identity: "action-653j-substitute-runtime-session",
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
  const risk = runAction652cExecutionIntentAdmission(
    { enabled: true, kill_switch_active: false },
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
        primary.predecessor.predecessor.predecessor.request.admission_at,
    },
  );
  if (risk.admission_status !== "admitted") {
    throw new Error(`substitute risk failed: ${risk.admission_reason}`);
  }
  return { primary, risk };
}

test("default-off and kill-switch perform zero snapshot or authority work", () => {
  let getterReads = 0;
  const request = Object.defineProperty({}, "prepared", {
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
    const result = runAction653jInternalVerificationCapsule(gate, request);
    expect(result.effects).toMatchObject({
      request_descriptor_reads: 0,
      caller_handle_acquisitions: 0,
      caller_handle_provenance_verifications: 0,
      post_snapshot_caller_reads: 0,
      digest_operations: 0,
      manual_confirmation_consumptions: 0,
    });
  }
  expect(getterReads).toBe(0);
});

test("descriptor snapshot executes nested getters exactly zero times", () => {
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
  const result = runAction653jInternalVerificationCapsule(enabled, {
    ...scenario.request,
    confirmation_capability: capability,
  });
  expect(getterReads).toBe(0);
  expect(result.terminal_reason).toBe("input_snapshot_rejected");
  expect(result.effects.manual_confirmation_consumptions).toBe(0);
});

test("iteratively rejects proxies, cycles, depth, and accessor roots", () => {
  const proxyScenario = buildAction653jFixtureScenario();
  expect(
    runAction653jInternalVerificationCapsule(enabled, {
      ...proxyScenario.request,
      risk_admission: new Proxy(proxyScenario.request.risk_admission, {}),
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");

  const cycleScenario = buildAction653jFixtureScenario();
  const cyclic = {
    ...cycleScenario.request.confirmation_capability,
  } as Record<string, unknown>;
  cyclic.cycle = cyclic;
  expect(
    runAction653jInternalVerificationCapsule(enabled, {
      ...cycleScenario.request,
      confirmation_capability: cyclic,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");

  const depthScenario = buildAction653jFixtureScenario();
  let nested: Record<string, unknown> = {};
  for (
    let index = 0;
    index <= action653jSnapshotBudget.maximum_depth;
    index += 1
  ) {
    nested = { nested };
  }
  expect(
    runAction653jInternalVerificationCapsule(enabled, {
      ...depthScenario.request,
      risk_admission: nested,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");

  const accessorScenario = buildAction653jFixtureScenario();
  let rootReads = 0;
  const rootAccessor = { ...accessorScenario.request };
  Object.defineProperty(rootAccessor, "observed_at", {
    enumerable: true,
    get() {
      rootReads += 1;
      return accessorScenario.request.observed_at;
    },
  });
  expect(
    runAction653jInternalVerificationCapsule(enabled, rootAccessor)
      .terminal_reason,
  ).toBe("input_snapshot_rejected");
  expect(rootReads).toBe(0);
});

test("capsule finalization reads no caller handles after the boundary", () => {
  const scenario = buildAction653jFixtureScenario();
  const request = { ...scenario.request };
  const issued = issueAction653jInternalVerificationCapsule(enabled, request);
  expect(issued.status).toBe("capsule_ready");
  if (issued.status !== "capsule_ready") return;

  let postBoundaryReads = 0;
  for (const key of [
    "prepared",
    "risk_admission",
    "confirmation_boundary",
    "confirmation_capability",
  ] as const) {
    const revocable = Proxy.revocable({}, {
      get() {
        postBoundaryReads += 1;
        throw new Error(`post-boundary read: ${key}`);
      },
      getOwnPropertyDescriptor() {
        postBoundaryReads += 1;
        throw new Error(`post-boundary descriptor read: ${key}`);
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
  expect(result?.instruction_status).toBe("prepared");
  expect(result?.effects).toMatchObject({
    caller_handle_acquisitions: 1,
    caller_handle_provenance_verifications: 1,
    post_snapshot_caller_reads: 0,
    caller_handles_forwarded_downstream: false,
  });
  expect(postBoundaryReads).toBe(0);
  expect(Object.keys(issued.capsule).sort()).toEqual([
    "capsule_digest",
    "capsule_policy_version",
    "contract_version",
    "descriptor_witness_digest",
    "identity_binding_digest",
    "instruction_digest",
    "runtime_provenance_binding_digest",
    "snapshot_digest",
  ]);
  const source = readFileSync(
    resolve(root, "lib/action-653j-internal-verification-capsule.ts"),
    "utf8",
  );
  const boundarySource = source.slice(
    source.indexOf(
      "export function issueAction653jInternalVerificationCapsule",
    ),
    source.indexOf(
      "export function materializeAction653jVerifiedInstruction",
    ),
  );
  for (const authorityCall of [
    "hasAction650sPreparedExecutionProvenance(",
    "canAction652cProceedToManualConfirmation(",
    "getAction650uManualConfirmationConsumptionState(",
    "verifyAction650uManualConfirmationCapability(",
    "consumeAction650uManualConfirmation(",
  ]) {
    expect(boundarySource.split(authorityCall)).toHaveLength(2);
  }
  const downstreamSource = source.slice(
    source.indexOf(
      "export function materializeAction653jVerifiedInstruction",
    ),
  );
  expect(downstreamSource).not.toMatch(/\bhandles\b|capabilityHandle/);
});

test("substituted lineage consumes zero and the same capability remains usable", () => {
  const { primary, risk } = buildSubstitutedRisk();
  const capability = primary.request.confirmation_capability;
  const invalid = runAction653jInternalVerificationCapsule(enabled, {
    ...primary.request,
    risk_admission: risk,
  });
  expect(invalid.terminal_reason).toBe("execution_lineage_mismatch");
  expect(invalid.effects.manual_confirmation_consumptions).toBe(0);
  expect(getAction650uManualConfirmationConsumptionState(capability)).toBe(
    "unconsumed",
  );

  const valid = runAction653jInternalVerificationCapsule(
    enabled,
    primary.request,
  );
  expect(valid.instruction_status).toBe("prepared");
  expect(valid.effects.manual_confirmation_consumptions).toBe(1);
  expect(getAction650uManualConfirmationConsumptionState(capability)).toBe(
    "consumed",
  );
});

test("parity and temporal failures all precede confirmation consumption", () => {
  const mutations = [
    (request: Record<string, unknown>) => {
      const risk = JSON.parse(
        JSON.stringify(request.risk_admission),
      ) as Record<string, unknown>;
      const predecessor = risk.predecessor_admission as Record<
        string,
        unknown
      >;
      const intent = predecessor.intent_projection as Record<string, unknown>;
      intent.notional = { value: "1", scale: 6, unit: "SEK_micros" };
      request.risk_admission = risk;
    },
    (request: Record<string, unknown>) => {
      request.observed_at = "2026-07-29T10:00:32.000000000Z";
    },
    (request: Record<string, unknown>) => {
      request.consumed_at = "2026-07-29T10:10:00.000000000Z";
    },
  ];
  for (const mutate of mutations) {
    const scenario = buildAction653jFixtureScenario();
    const request = { ...scenario.request } as Record<string, unknown>;
    mutate(request);
    const result = runAction653jInternalVerificationCapsule(enabled, request);
    expect(result.instruction_status).not.toBe("prepared");
    expect(result.effects.manual_confirmation_consumptions).toBe(0);
    expect(
      getAction650uManualConfirmationConsumptionState(
        scenario.request.confirmation_capability,
      ),
    ).toBe("unconsumed");
  }
});

test("strict expiry uses minus-one, boundary, and plus-one nanoseconds", () => {
  const before = buildAction653jFixtureScenario("utc_a", {
    consumed_at: "2026-07-29T10:09:59.999999999Z",
    observed_at: "2026-07-29T10:09:59.999999999Z",
  });
  expect(
    runAction653jInternalVerificationCapsule(enabled, before.request)
      .instruction_status,
  ).toBe("prepared");

  for (const consumedAt of [
    "2026-07-29T10:10:00.000000000Z",
    "2026-07-29T10:10:00.000000001Z",
  ]) {
    const scenario = buildAction653jFixtureScenario("utc_a", {
      consumed_at: consumedAt,
      observed_at: consumedAt,
    });
    const result = runAction653jInternalVerificationCapsule(
      enabled,
      scenario.request,
    );
    expect(result.terminal_reason).toBe("confirmation_expired");
    expect(result.effects.manual_confirmation_consumptions).toBe(0);
  }
});

test("valid consumption is one-shot and exact duplicate is idempotent", () => {
  const scenario = buildAction653jFixtureScenario();
  const first = runAction653jInternalVerificationCapsule(
    enabled,
    scenario.request,
  );
  const duplicate = runAction653jInternalVerificationCapsule(enabled, {
    ...scenario.request,
  });
  expect(first.instruction_status).toBe("prepared");
  expect(duplicate).toBe(first);
  expect(first.effects.manual_confirmation_consumptions).toBe(1);
  expect(
    getAction650uManualConfirmationConsumptionState(
      scenario.request.confirmation_capability,
    ),
  ).toBe("consumed");
  const { envelope_digest: claimed, ...projection } = first;
  expect(claimed).toBe(rebuildAction653jEnvelopeDigest(projection));
});

test("conflicting and cross-execution reuse consume zero additional times", () => {
  const scenario = buildAction653jFixtureScenario();
  expect(
    runAction653jInternalVerificationCapsule(enabled, scenario.request)
      .instruction_status,
  ).toBe("prepared");
  const conflicting = runAction653jInternalVerificationCapsule(enabled, {
    ...scenario.request,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(conflicting.terminal_reason).toBe(
    "conflicting_instruction_reuse",
  );
  expect(conflicting.effects.manual_confirmation_consumptions).toBe(0);

  const cross = buildAction653jFixtureScenario();
  expect(
    runAction653jInternalVerificationCapsule(enabled, cross.request)
      .instruction_status,
  ).toBe("prepared");
  const crossPrepared = JSON.parse(
    JSON.stringify(cross.request.prepared),
  ) as Record<string, unknown>;
  const runtime = crossPrepared.runtime_identity_context as Record<
    string,
    unknown
  >;
  runtime.execution_identity = "action-653j-cross-execution";
  const result = runAction653jInternalVerificationCapsule(enabled, {
    ...cross.request,
    prepared: crossPrepared,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(result.terminal_reason).toBe("cross_execution_reuse_rejected");
  expect(result.effects.manual_confirmation_consumptions).toBe(0);
});

test("private capsule provenance rejects clones and self-consistent tampering", () => {
  const scenario = buildAction653jFixtureScenario();
  const issued = issueAction653jInternalVerificationCapsule(
    enabled,
    scenario.request,
  );
  expect(issued.status).toBe("capsule_ready");
  if (issued.status !== "capsule_ready") return;
  const clone = Object.freeze({ ...issued.capsule });
  const tampered = Object.freeze({
    ...issued.capsule,
    identity_binding_digest: "action_653j_forged_identity",
  });
  expect(materializeAction653jVerifiedInstruction(clone)).toBeNull();
  expect(materializeAction653jVerifiedInstruction(tampered)).toBeNull();
  expect(
    materializeAction653jVerifiedInstruction(issued.capsule)
      ?.instruction_status,
  ).toBe("prepared");
});

test("synthetic replay and 651C diagnostic audit interoperate", () => {
  const scenario = buildAction653jFixtureScenario();
  const result = runAction653jInternalVerificationCapsule(
    enabled,
    scenario.request,
  );
  const replay = replayAction653jPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  const auditScenario = buildAction651cFixtureScenario();
  const audit = runAction651cExecutionQualityAuditV2(auditScenario.input);
  expect(canAction653jProceedToSyntheticReplay(result)).toBe(true);
  expect(replay?.accepted).toBe(true);
  expect(audit.audit_status).toBe("audited");
  expect(verifyAction651cDiagnosticAuditResult(audit)).toBe(true);
  expect(audit.safety.real_broker_evidence).toBe(false);
  expect(audit.safety.performance_eligible).toBe(false);
});

test("golden matrix is cross-timezone and reverse-order deterministic", () => {
  const results = action653jGoldenMatrixCases.map((entry) =>
    runAction653jInternalVerificationCapsule(
      enabled,
      buildAction653jFixtureScenario(entry.clock, {
        reverse_input_order: entry.reverse_input_order,
      }).request,
    ),
  );
  expect(results.map((result) => result.instruction_status)).toEqual(
    results.map(() => "prepared"),
  );
  expect(new Set(results.map((result) => result.envelope_digest)).size).toBe(1);
  expect(new Set(results.map((result) => result.snapshot_digest)).size).toBe(1);
  expect(new Set(results.map((result) => result.capsule_digest)).size).toBe(1);
});

test("golden evidence, predecessor bytes, and capability exclusions are closed", () => {
  const scenario = buildAction653jFixtureScenario();
  const result = runAction653jInternalVerificationCapsule(
    enabled,
    scenario.request,
  );
  const replay = replayAction653jPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  const golden = JSON.parse(
    readFileSync(
      resolve(
        root,
        "docs/action-653j-internal-verification-capsule-golden-report.json",
      ),
      "utf8",
    ),
  );
  expect(golden.contract_version).toBe(result.contract_version);
  expect(golden.matrix.common_envelope_digest).toBe(result.envelope_digest);
  expect(golden.matrix.common_snapshot_digest).toBe(result.snapshot_digest);
  expect(golden.matrix.common_capsule_digest).toBe(result.capsule_digest);
  expect(golden.matrix.common_instruction_digest).toBe(
    result.instruction?.instruction_digest,
  );
  expect(golden.matrix.common_replay_evidence_digest).toBe(
    replay?.evidence_digest,
  );

  const predecessorHashes = {
    "docs/action-653h-safe-instruction-successor-golden-report.json":
      "58e753482cddddf58e5facd6459fc39a288ddafc8dfcc004a53e134cc2966f7e",
    "docs/action-653h-safe-instruction-successor.md":
      "78a1ccf357a9943d48cf5e8083f30c8830348b7e5f25a9a60f8e27784c9f9b10",
    "lib/action-653h-safe-instruction-successor.ts":
      "eb33f199bf1767410d6600e6d5a05444cfdcbe120fa7d9878d9abd7ce1180046",
    "tests/e2e/action-653h-safe-instruction-successor.spec.ts":
      "3baa677e5650da9314727712b5712bb78444f17ed1bd7418f8f3306dbb946976",
    "tests/fixtures/action-653h-safe-instruction-successor-fixtures.ts":
      "1b6df3745bf81736eaf7b313d9c7c7d3a5ba0986f8036bf9193af03a908f28c7",
  };
  for (const [path, expected] of Object.entries(predecessorHashes)) {
    expect(sha256(path)).toBe(expected);
  }

  const source = readFileSync(
    resolve(root, "lib/action-653j-internal-verification-capsule.ts"),
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
  expect(result.safety).toMatchObject({
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
});
