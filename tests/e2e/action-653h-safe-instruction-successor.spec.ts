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
  action653hGoldenMatrixCases,
  buildAction653hFixtureScenario,
} from "../fixtures/action-653h-safe-instruction-successor-fixtures";
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";
import {
  action653hSnapshotBudget,
  canAction653hProceedToSyntheticReplay,
  rebuildAction653hEnvelopeDigest,
  replayAction653hPreparedInstruction,
  runAction653hSafeInstructionSuccessor,
} from "../../lib/action-653h-safe-instruction-successor";

const enabled = { enabled: true, kill_switch_active: false } as const;
const root = resolve(__dirname, "../..");

function buildSubstitutedRisk() {
  const primary = buildAction653hFixtureScenario();
  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity:
      primary.request.prepared.runtime_identity_context.execution_identity,
    runtime_instance_identity: "action-653h-substitute-runtime",
    runtime_session_identity: "action-653h-substitute-runtime-session",
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
        primary.predecessor.predecessor.request.admission_at,
    },
  );
  if (risk.admission_status !== "admitted") {
    throw new Error(`substitute risk failed: ${risk.admission_reason}`);
  }
  return { primary, risk };
}

test("default-off and kill-switch return before descriptor or digest work", () => {
  let reads = 0;
  const request = Object.defineProperty({}, "prepared", {
    enumerable: true,
    get() {
      reads += 1;
      throw new Error("must not execute");
    },
  });
  const disabled = runAction653hSafeInstructionSuccessor(
    { enabled: false, kill_switch_active: false },
    request,
  );
  const killed = runAction653hSafeInstructionSuccessor(
    { enabled: true, kill_switch_active: true },
    request,
  );
  expect(reads).toBe(0);
  for (const result of [disabled, killed]) {
    expect(result.effects).toMatchObject({
      request_descriptor_reads: 0,
      caller_getters_executed: 0,
      recursive_caller_traversals: 0,
      digest_operations: 0,
      manual_confirmation_consumptions: 0,
    });
  }
});

test("M1 closes the unfrozen nested getter attack without one getter read", () => {
  const legacyScenario = buildAction653hFixtureScenario();
  let legacyGetterReads = 0;
  const legacyCapability = {
    ...legacyScenario.request.confirmation_capability,
  } as Record<string, unknown>;
  Object.defineProperty(legacyCapability, "capability_digest", {
    enumerable: true,
    get() {
      legacyGetterReads += 1;
      return legacyScenario.request.confirmation_capability.capability_digest;
    },
  });
  runAction653aBrokerNeutralExecutionInstruction(enabled, {
    ...legacyScenario.request,
    confirmation_capability: legacyCapability,
  });
  expect(legacyGetterReads).toBeGreaterThan(0);

  const scenario = buildAction653hFixtureScenario();
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
  const result = runAction653hSafeInstructionSuccessor(enabled, {
    ...scenario.request,
    confirmation_capability: capability,
  });
  expect(getterReads).toBe(0);
  expect(result.instruction_status).toBe("unmappable");
  expect(result.terminal_reason).toBe("input_snapshot_rejected");
  expect(result.effects.manual_confirmation_consumptions).toBe(0);
  expect(
    getAction650uManualConfirmationConsumptionState(
      scenario.request.confirmation_capability,
    ),
  ).toBe("unconsumed");
});

test("iteratively rejects root/nested accessors, proxies, cycles, and budget excess", () => {
  const rootAccessorScenario = buildAction653hFixtureScenario();
  let rootReads = 0;
  const rootAccessor = { ...rootAccessorScenario.request };
  Object.defineProperty(rootAccessor, "observed_at", {
    enumerable: true,
    get() {
      rootReads += 1;
      return rootAccessorScenario.request.observed_at;
    },
  });
  expect(
    runAction653hSafeInstructionSuccessor(enabled, rootAccessor)
      .terminal_reason,
  ).toBe("input_snapshot_rejected");
  expect(rootReads).toBe(0);

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
  cyclic.cycle = cyclic;
  expect(
    runAction653hSafeInstructionSuccessor(enabled, {
      ...cycleScenario.request,
      confirmation_capability: cyclic,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");

  const budgetScenario = buildAction653hFixtureScenario();
  let nested: Record<string, unknown> = {};
  for (
    let index = 0;
    index <= action653hSnapshotBudget.maximum_depth;
    index += 1
  ) {
    nested = { nested };
  }
  expect(
    runAction653hSafeInstructionSuccessor(enabled, {
      ...budgetScenario.request,
      risk_admission: nested,
    }).terminal_reason,
  ).toBe("input_snapshot_rejected");
});

test("M2 validates substituted risk lineage before consumption and preserves retry", () => {
  const legacy = buildSubstitutedRisk();
  const legacyAttack = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    {
      ...legacy.primary.request,
      risk_admission: legacy.risk,
    },
  );
  expect(legacyAttack.terminal_reason).toBe("execution_lineage_mismatch");
  expect(
    getAction650uManualConfirmationConsumptionState(
      legacy.primary.request.confirmation_capability,
    ),
  ).toBe("consumed");
  expect(
    runAction653aBrokerNeutralExecutionInstruction(
      enabled,
      legacy.primary.request,
    ).terminal_reason,
  ).toBe("confirmation_rejected");

  const { primary, risk } = buildSubstitutedRisk();
  const capability = primary.request.confirmation_capability;
  const attack = runAction653hSafeInstructionSuccessor(enabled, {
    ...primary.request,
    risk_admission: risk,
  });
  expect(attack.instruction_status).toBe("conflicting");
  expect(attack.terminal_reason).toBe("execution_lineage_mismatch");
  expect(attack.effects.manual_confirmation_consumptions).toBe(0);
  expect(
    getAction650uManualConfirmationConsumptionState(capability),
  ).toBe("unconsumed");

  const correct = runAction653hSafeInstructionSuccessor(
    enabled,
    primary.request,
  );
  expect(correct.instruction_status).toBe("prepared");
  expect(correct.effects.manual_confirmation_consumptions).toBe(1);
  expect(
    getAction650uManualConfirmationConsumptionState(capability),
  ).toBe("consumed");
});

test("all parity, temporal, identity, and destination checks precede consumption", () => {
  const cases = [
    {
      mutate: (request: Record<string, unknown>) => {
        const risk = JSON.parse(
          JSON.stringify(request.risk_admission),
        ) as Record<string, unknown>;
        const predecessor = risk.predecessor_admission as Record<
          string,
          unknown
        >;
        const intent = predecessor.intent_projection as Record<
          string,
          unknown
        >;
        intent.notional = {
          value: "1",
          scale: 6,
          unit: "SEK_micros",
        };
        request.risk_admission = risk;
      },
    },
    {
      mutate: (request: Record<string, unknown>) => {
        request.observed_at = "2026-07-29T10:00:32.000000000Z";
      },
    },
    {
      mutate: (request: Record<string, unknown>) => {
        request.consumed_at = "2026-07-29T10:10:00.000000000Z";
      },
    },
  ];
  for (const entry of cases) {
    const scenario = buildAction653hFixtureScenario();
    const request = { ...scenario.request } as Record<string, unknown>;
    entry.mutate(request);
    const result = runAction653hSafeInstructionSuccessor(enabled, request);
    expect(result.instruction_status).not.toBe("prepared");
    expect(result.effects.manual_confirmation_consumptions).toBe(0);
    expect(
      getAction650uManualConfirmationConsumptionState(
        scenario.request.confirmation_capability,
      ),
    ).toBe("unconsumed");
  }
});

test("checks strict confirmation and instruction expiry boundaries before consumption", () => {
  const confirmationBefore = buildAction653hFixtureScenario("utc_a", {
    consumed_at: "2026-07-29T10:09:59.999999999Z",
    observed_at: "2026-07-29T10:09:59.999999999Z",
  });
  const beforeResult = runAction653hSafeInstructionSuccessor(
    enabled,
    confirmationBefore.request,
  );
  expect(beforeResult.instruction_status).toBe("prepared");
  expect(beforeResult.effects.manual_confirmation_consumptions).toBe(1);

  for (const consumedAt of [
    "2026-07-29T10:10:00.000000000Z",
    "2026-07-29T10:10:00.000000001Z",
  ]) {
    const scenario = buildAction653hFixtureScenario("utc_a", {
      consumed_at: consumedAt,
      observed_at: consumedAt,
    });
    const result = runAction653hSafeInstructionSuccessor(
      enabled,
      scenario.request,
    );
    expect(result.terminal_reason).toBe("confirmation_expired");
    expect(result.effects.manual_confirmation_consumptions).toBe(0);
    expect(
      getAction650uManualConfirmationConsumptionState(
        scenario.request.confirmation_capability,
      ),
    ).toBe("unconsumed");
  }

  const instructionBefore = buildAction653hFixtureScenario("utc_a", {
    observed_at: "2026-07-29T10:00:31.999999999Z",
  });
  expect(
    runAction653hSafeInstructionSuccessor(
      enabled,
      instructionBefore.request,
    ).instruction_status,
  ).toBe("prepared");
  for (const observedAt of [
    "2026-07-29T10:00:32.000000000Z",
    "2026-07-29T10:00:32.000000001Z",
  ]) {
    const scenario = buildAction653hFixtureScenario("utc_a", {
      observed_at: observedAt,
    });
    const result = runAction653hSafeInstructionSuccessor(
      enabled,
      scenario.request,
    );
    expect(result.terminal_reason).toBe("instruction_expired");
    expect(result.effects.manual_confirmation_consumptions).toBe(0);
  }
});

test("rejects caller schema and destination surfaces before consumption", () => {
  for (const extra of [
    {
      destination_identity: "caller-broker-destination",
    },
    {
      instruction_schema_version: "caller-schema",
    },
  ]) {
    const scenario = buildAction653hFixtureScenario();
    const result = runAction653hSafeInstructionSuccessor(enabled, {
      ...scenario.request,
      ...extra,
    });
    expect(result.terminal_reason).toBe("input_snapshot_rejected");
    expect(result.effects.manual_confirmation_consumptions).toBe(0);
    expect(
      getAction650uManualConfirmationConsumptionState(
        scenario.request.confirmation_capability,
      ),
    ).toBe("unconsumed");
  }
});

test("valid attempt consumes once and exact duplicate remains idempotent", () => {
  const scenario = buildAction653hFixtureScenario();
  const first = runAction653hSafeInstructionSuccessor(
    enabled,
    scenario.request,
  );
  const duplicate = runAction653hSafeInstructionSuccessor(
    enabled,
    { ...scenario.request },
  );
  expect(first.instruction_status).toBe("prepared");
  expect(duplicate).toBe(first);
  expect(first.effects.manual_confirmation_consumptions).toBe(1);
  expect(
    getAction650uManualConfirmationConsumptionState(
      scenario.request.confirmation_capability,
    ),
  ).toBe("consumed");
  const { envelope_digest: claimed, ...projection } = first;
  expect(claimed).toBe(rebuildAction653hEnvelopeDigest(projection));
});

test("conflicting and cross-execution reuse fail without a second consumption", () => {
  const conflictScenario = buildAction653hFixtureScenario();
  const prepared = runAction653hSafeInstructionSuccessor(
    enabled,
    conflictScenario.request,
  );
  expect(prepared.instruction_status).toBe("prepared");
  const conflicting = runAction653hSafeInstructionSuccessor(enabled, {
    ...conflictScenario.request,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(conflicting.terminal_reason).toBe(
    "conflicting_instruction_reuse",
  );
  expect(conflicting.effects.manual_confirmation_consumptions).toBe(0);

  const crossScenario = buildAction653hFixtureScenario();
  const crossPrepared = runAction653hSafeInstructionSuccessor(
    enabled,
    crossScenario.request,
  );
  expect(crossPrepared.instruction_status).toBe("prepared");
  const crossExecution = JSON.parse(
    JSON.stringify(crossScenario.request.prepared),
  ) as Record<string, unknown>;
  const runtime = crossExecution.runtime_identity_context as Record<
    string,
    unknown
  >;
  runtime.execution_identity = "action-653h-cross-execution";
  const cross = runAction653hSafeInstructionSuccessor(enabled, {
    ...crossScenario.request,
    prepared: crossExecution,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  });
  expect(cross.terminal_reason).toBe("cross_execution_reuse_rejected");
  expect(cross.effects.manual_confirmation_consumptions).toBe(0);
});

test("uses immutable snapshot bytes after capture despite root mutation", () => {
  const scenario = buildAction653hFixtureScenario();
  const request = { ...scenario.request };
  const result = runAction653hSafeInstructionSuccessor(enabled, request);
  const digest = result.envelope_digest;
  request.observed_at = "2099-01-01T00:00:00.000000000Z";
  expect(result.envelope_digest).toBe(digest);
  expect(result.instruction?.instrument).toBe("AAPL");
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.instruction)).toBe(true);
});

test("preserves synthetic replay and 651C diagnostic audit interoperability", () => {
  const scenario = buildAction653hFixtureScenario();
  const result = runAction653hSafeInstructionSuccessor(
    enabled,
    scenario.request,
  );
  const replay = replayAction653hPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  const clone = Object.freeze({ ...result });
  const auditScenario = buildAction651cFixtureScenario();
  const audit = runAction651cExecutionQualityAuditV2(auditScenario.input);

  expect(canAction653hProceedToSyntheticReplay(result)).toBe(true);
  expect(replay?.accepted).toBe(true);
  expect(
    replayAction653hPreparedInstruction(
      clone,
      "2026-07-29T10:00:03.000000000Z",
    ),
  ).toBeNull();
  expect(audit.audit_status).toBe("audited");
  expect(verifyAction651cDiagnosticAuditResult(audit)).toBe(true);
  expect(audit.safety.real_broker_evidence).toBe(false);
  expect(audit.safety.performance_eligible).toBe(false);
});

test("is deterministic across timezone forms and reversed input order", () => {
  const results = action653hGoldenMatrixCases.map((entry) =>
    runAction653hSafeInstructionSuccessor(
      enabled,
      buildAction653hFixtureScenario(entry.clock, {
        reverse_input_order: entry.reverse_input_order,
      }).request,
    ),
  );
  expect(results.map((result) => result.instruction_status)).toEqual(
    results.map(() => "prepared"),
  );
  expect(new Set(results.map((result) => result.envelope_digest)).size).toBe(1);
  expect(
    new Set(results.map((result) => result.snapshot_digest)).size,
  ).toBe(1);
});

test("golden report and structural capability exclusions remain closed", () => {
  const scenario = buildAction653hFixtureScenario();
  const result = runAction653hSafeInstructionSuccessor(
    enabled,
    scenario.request,
  );
  const golden = JSON.parse(
    readFileSync(
      resolve(
        root,
        "docs/action-653h-safe-instruction-successor-golden-report.json",
      ),
      "utf8",
    ),
  );
  const replay = replayAction653hPreparedInstruction(
    result,
    "2026-07-29T10:00:03.000000000Z",
  );
  expect(golden.contract_version).toBe(result.contract_version);
  expect(golden.matrix.common_envelope_digest).toBe(result.envelope_digest);
  expect(golden.matrix.common_snapshot_digest).toBe(result.snapshot_digest);
  expect(golden.matrix.common_instruction_digest).toBe(
    result.instruction?.instruction_digest,
  );
  expect(golden.matrix.common_replay_evidence_digest).toBe(
    replay?.evidence_digest,
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
