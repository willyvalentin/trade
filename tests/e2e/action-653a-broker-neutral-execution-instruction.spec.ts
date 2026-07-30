import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  deepFreezeAction650s,
} from "../../lib/action-650s-execution-identity";
import {
  canAction653aProceedToSyntheticReplay,
  rebuildAction653aFailureDigest,
  rebuildAction653aInstructionEnvelopeDigest,
  replayAction653aPreparedInstruction,
  runAction653aBrokerNeutralExecutionInstruction,
} from "../../lib/action-653a-broker-neutral-execution-instruction";
import {
  runAction651cExecutionQualityAuditV2,
  verifyAction651cDiagnosticAuditResult,
} from "../../lib/action-651c-execution-quality-audit-v2";
import { buildAction651aFixtureScenario } from "../fixtures/action-651a-diagnostic-execution-quality-fixtures";
import { buildAction651cFixtureScenario } from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";
import {
  action653aGoldenMatrixCases,
  buildAction653aFixtureScenario,
} from "../fixtures/action-653a-broker-neutral-execution-instruction-fixtures";
import golden from "../../docs/action-653a-broker-neutral-execution-instruction-golden-report.json";

const enabled = { enabled: true, kill_switch_active: false } as const;
const root = resolve(__dirname, "../..");

test("default-off and kill-switch return before every request read or digest", () => {
  let reads = 0;
  const hostile = new Proxy(
    {},
    {
      ownKeys() {
        reads += 1;
        throw new Error("must not enumerate");
      },
      get() {
        reads += 1;
        throw new Error("must not read");
      },
    },
  );

  const disabled = runAction653aBrokerNeutralExecutionInstruction(
    { enabled: false, kill_switch_active: false },
    hostile,
  );
  const killed = runAction653aBrokerNeutralExecutionInstruction(
    { enabled: true, kill_switch_active: true },
    hostile,
  );

  expect(reads).toBe(0);
  for (const result of [disabled, killed]) {
    expect(result.instruction_status).toBe("blocked");
    expect(result.envelope_digest).toBeNull();
    expect(result.effects).toMatchObject({
      request_reads: 0,
      digest_operations: 0,
      manual_confirmation_consumptions: 0,
      transport_requests: 0,
      provider_calls: 0,
      database_writes: 0,
    });
  }
});

test("prepares one immutable broker-neutral synthetic-only instruction", () => {
  const scenario = buildAction653aFixtureScenario();
  const result = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    scenario.request,
  );

  expect(result.instruction_status).toBe("prepared");
  expect(result.terminal_reason).toBe("instruction_prepared");
  expect(result.instruction).toMatchObject({
    schema_version: "action_653a_broker_neutral_instruction_schema_v1",
    destination_identity: "action_653a_synthetic_replay_only",
    execution_identity: "action-651a-execution",
    instrument: "AAPL",
    side: "SELL",
    quantity: { value: "5", scale: 0, unit: "units" },
    limit_price: {
      value: "179000000",
      scale: 6,
      unit: "SEK_micros_per_unit",
      currency: "SEK",
    },
    notional: {
      value: "895000000",
      scale: 6,
      unit: "SEK_micros",
      currency: "SEK",
    },
  });
  expect(result.lineage.risk_admission_digest).toBe(
    scenario.risk_admission.terminal_digest,
  );
  expect(result.lineage.confirmation_consumption_digest).toMatch(
    /^action_650u_confirmation_receipt_/,
  );
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.instruction)).toBe(true);
  expect(canAction653aProceedToSyntheticReplay(result)).toBe(true);
  const { envelope_digest: claimed, ...projection } = result;
  expect(claimed).toBe(
    rebuildAction653aInstructionEnvelopeDigest(projection),
  );
});

test("rejects unproven or non-admitted risk admission before instruction preparation", () => {
  const scenario = buildAction653aFixtureScenario();
  const clone = deepFreezeAction650s({
    ...scenario.risk_admission,
  });
  const result = runAction653aBrokerNeutralExecutionInstruction(enabled, {
    ...scenario.request,
    risk_admission: clone,
  });

  expect(result.instruction_status).toBe("blocked");
  expect(result.terminal_reason).toBe("risk_admission_unproven");
  expect(result.instruction).toBeNull();
  expect(result.failure_provenance?.observed_rejected_input_digests)
    .toEqual(result.observed_input_digests);
  const failure = result.failure_provenance!;
  expect(failure.failure_digest).toBe(
    rebuildAction653aFailureDigest({
      terminal_reason: failure.terminal_reason,
      observed_rejected_input_digests:
        failure.observed_rejected_input_digests,
      lineage: result.lineage,
    }),
  );

  const callerAuthority = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    { ...buildAction653aFixtureScenario().request, broker_url: "synthetic" },
  );
  expect(callerAuthority.instruction_status).toBe("unmappable");
  expect(callerAuthority.terminal_reason).toBe("input_snapshot_rejected");
});

test("binds a genuine one-shot manual confirmation and rejects automatic clones", () => {
  const scenario = buildAction653aFixtureScenario();
  const prepared = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    scenario.request,
  );
  expect(prepared.instruction_status).toBe("prepared");

  const automaticClone = deepFreezeAction650s({
    ...scenario.request.prepared,
    handoff: {
      ...scenario.request.prepared.handoff,
      payload: {
        ...scenario.request.prepared.handoff.payload,
        execution_mode: "automatic",
      },
    },
  });
  const automatic = runAction653aBrokerNeutralExecutionInstruction(enabled, {
    ...buildAction653aFixtureScenario().request,
    prepared: automaticClone,
  });
  expect(automatic.instruction_status).toBe("blocked");
  expect(automatic.instruction).toBeNull();
  expect(automatic.safety.automatic_execution).toBe(false);
});

test("requires exact risk quantity, price, notional, unit, scale, and currency projection", () => {
  const scenario = buildAction653aFixtureScenario();
  const result = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    scenario.request,
  );
  const risk = scenario.risk_admission.predecessor_admission?.intent_projection;

  expect(result.instruction?.quantity).toEqual({
    ...risk?.quantity,
  });
  expect(result.instruction?.limit_price.value).toBe(
    risk?.limit_price.value,
  );
  expect(result.instruction?.notional.value).toBe(risk?.notional.value);
  expect(result.instruction?.limit_price.currency).toBe("SEK");
  expect(result.instruction?.notional.currency).toBe("SEK");

  const tamperedRisk = deepFreezeAction650s({
    ...buildAction653aFixtureScenario().risk_admission,
    predecessor_admission: {
      ...buildAction653aFixtureScenario().risk_admission
        .predecessor_admission!,
      intent_projection: {
        ...buildAction653aFixtureScenario().risk_admission
          .predecessor_admission!.intent_projection!,
        notional: { value: "1", scale: 6, unit: "SEK_micros" },
      },
    },
  });
  const rejected = runAction653aBrokerNeutralExecutionInstruction(enabled, {
    ...buildAction653aFixtureScenario().request,
    risk_admission: tamperedRisk,
  });
  expect(rejected.instruction_status).toBe("blocked");
  expect(rejected.instruction).toBeNull();
});

test("uses strict nanosecond instruction expiry at minus-one, boundary, and plus-one", () => {
  const before = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    buildAction653aFixtureScenario("utc_a", {
      observed_at: "2026-07-29T10:00:31.999999999Z",
    }).request,
  );
  const exact = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    buildAction653aFixtureScenario("utc_a", {
      observed_at: "2026-07-29T10:00:32.000000000Z",
    }).request,
  );
  const after = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    buildAction653aFixtureScenario("utc_a", {
      observed_at: "2026-07-29T10:00:32.000000001Z",
    }).request,
  );

  expect(before.instruction_status).toBe("prepared");
  expect(before.instruction?.instruction_expires_at).toBe(
    "2026-07-29T10:00:32.000000000Z",
  );
  for (const result of [exact, after]) {
    expect(result.instruction_status).toBe("expired");
    expect(result.terminal_reason).toBe("instruction_expired");
    expect(result.instruction).toBeNull();
  }

  const confirmationExpiry =
    runAction653aBrokerNeutralExecutionInstruction(
      enabled,
      buildAction653aFixtureScenario("utc_a", {
        consumed_at: "2026-07-29T10:10:00.000000000Z",
        observed_at: "2026-07-29T10:10:00.000000000Z",
      }).request,
    );
  expect(confirmationExpiry.instruction_status).toBe("expired");
  expect(confirmationExpiry.terminal_reason).toBe("confirmation_expired");
});

test("exact duplicate is idempotent while conflicting and cross-execution reuse fail closed", () => {
  const scenario = buildAction653aFixtureScenario();
  const first = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    scenario.request,
  );
  const duplicate = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    scenario.request,
  );
  const conflict = runAction653aBrokerNeutralExecutionInstruction(enabled, {
    ...scenario.request,
    observed_at: "2026-07-29T10:00:02.500000001Z",
  });
  const other = buildAction651aFixtureScenario("utc_a", {
    execution_identity: "action-653a-other-execution",
  });
  const crossExecution = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    {
      ...scenario.request,
      prepared: other.prepared,
      observed_at: "2026-07-29T10:00:02.500000002Z",
    },
  );

  expect(duplicate).toBe(first);
  expect(conflict.instruction_status).toBe("conflicting");
  expect(conflict.terminal_reason).toBe("conflicting_instruction_reuse");
  expect(crossExecution.instruction_status).toBe("conflicting");
  expect(crossExecution.terminal_reason).toBe(
    "cross_execution_reuse_rejected",
  );
});

test("single-read descriptor inspection rejects accessors, proxies, and cycles without getter execution", () => {
  const base = buildAction653aFixtureScenario().request;
  let reads = 0;
  const accessor: Record<string, unknown> = {
    ...base,
  };
  Object.defineProperty(accessor, "observed_at", {
    enumerable: true,
    get() {
      reads += 1;
      return base.observed_at;
    },
  });
  const cycle = { ...base } as Record<string, unknown>;
  cycle.prepared = cycle;
  const capabilityAccessor = {
    ...base.confirmation_capability,
  } as Record<string, unknown>;
  Object.defineProperty(capabilityAccessor, "capability_digest", {
    enumerable: true,
    get() {
      reads += 1;
      return "forged";
    },
  });
  Object.freeze(capabilityAccessor);
  const inputs = [
    accessor,
    new Proxy(base, {}),
    cycle,
    { ...base, confirmation_capability: capabilityAccessor },
    { ...base, confirmation_capability: new Proxy(base.confirmation_capability, {}) },
  ];

  for (const [index, input] of inputs.entries()) {
    const result = runAction653aBrokerNeutralExecutionInstruction(
      enabled,
      input,
    );
    expect(["unmappable", "blocked"]).toContain(
      result.instruction_status,
    );
    expect([
      "input_snapshot_rejected",
      "confirmation_rejected",
    ]).toContain(result.terminal_reason);
    if (index < 3) {
      expect(result.instruction_status).toBe("unmappable");
      expect(result.terminal_reason).toBe("input_snapshot_rejected");
    }
    expect(result.instruction).toBeNull();
    expect(result.failure_provenance?.failure_digest).toMatch(
      /^action_653a_failure_/,
    );
  }
  expect(reads).toBe(0);
});

test("failure evidence binds rejected inputs and prepared output ignores post-verification mutation", () => {
  const malformedScenario = buildAction653aFixtureScenario();
  const malformed = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    { ...malformedScenario.request, observed_at: "not-an-instant" },
  );
  const clonedRiskScenario = buildAction653aFixtureScenario();
  const clonedRisk = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    {
      ...clonedRiskScenario.request,
      risk_admission: deepFreezeAction650s({
        ...clonedRiskScenario.risk_admission,
      }),
    },
  );
  expect(malformed.failure_provenance?.failure_digest).not.toBe(
    clonedRisk.failure_provenance?.failure_digest,
  );
  expect(malformed.observed_input_digests.rejected_input_digest).not.toBeNull();

  const mutableScenario = buildAction653aFixtureScenario();
  const request = { ...mutableScenario.request };
  const prepared = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    request,
  );
  const envelope = prepared.envelope_digest;
  request.observed_at = "2099-01-01T00:00:00.000000000Z";
  expect(prepared.envelope_digest).toBe(envelope);
  expect(prepared.instruction?.instrument).toBe("AAPL");
});

test("only a provenance-valid prepared instruction reaches the pure synthetic replay gate", () => {
  const scenario = buildAction653aFixtureScenario();
  const prepared = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    scenario.request,
  );
  const replay = replayAction653aPreparedInstruction(
    prepared,
    "2026-07-29T10:00:03.000000000Z",
  );
  const clone = deepFreezeAction650s({ ...prepared });

  expect(replay).toMatchObject({
    destination_identity: "action_653a_synthetic_replay_only",
    execution_identity: "action-651a-execution",
    accepted: true,
    synthetic_only: true,
  });
  expect(
    replayAction653aPreparedInstruction(
      clone,
      "2026-07-29T10:00:03.000000000Z",
    ),
  ).toBeNull();
  expect(
    replayAction653aPreparedInstruction(
      prepared,
      "2026-07-29T10:00:32.000000000Z",
    ),
  ).toBeNull();
});

test("preserves admitted-confirmed-prepared-synthetic-replay-to-651C-audit interop", () => {
  const instructionScenario = buildAction653aFixtureScenario();
  const instruction = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    instructionScenario.request,
  );
  const replay = replayAction653aPreparedInstruction(
    instruction,
    "2026-07-29T10:00:03.000000000Z",
  );

  const auditScenario = buildAction651cFixtureScenario();
  const audit = runAction651cExecutionQualityAuditV2(auditScenario.input);

  expect(instructionScenario.risk_admission.admission_status).toBe(
    "admitted",
  );
  expect(instruction.instruction_status).toBe("prepared");
  expect(replay?.accepted).toBe(true);
  expect(audit.audit_status).toBe("audited");
  expect(verifyAction651cDiagnosticAuditResult(audit)).toBe(true);
  expect(
    audit.failure_provenance?.failure_lineage.execution_identity,
  ).toBe(instruction.lineage.execution_identity);
  expect(audit.failure_provenance?.failure_lineage.session_identity).toBe(
    instruction.lineage.session_identity,
  );
  expect(audit.safety.real_broker_evidence).toBe(false);
  expect(audit.safety.performance_eligible).toBe(false);
});

test("golden matrix is deterministic across UTC forms, Stockholm, New York, and reversed input order", () => {
  const results = action653aGoldenMatrixCases.map((entry) =>
    runAction653aBrokerNeutralExecutionInstruction(
      enabled,
      buildAction653aFixtureScenario(entry.clock, {
        reverse_input_order: entry.reverse_input_order,
      }).request,
    ),
  );
  const replays = results.map((result) =>
    replayAction653aPreparedInstruction(
      result,
      "2026-07-29T10:00:03.000000000Z",
    ),
  );

  expect(results.map((result) => result.instruction_status)).toEqual(
    results.map(() => "prepared"),
  );
  expect(results.map((result) => result.envelope_digest)).toEqual(
    results.map(() => results[0].envelope_digest),
  );
  for (const result of results) {
    expect(result.instruction).toEqual(results[0].instruction);
  }
  for (const replay of replays) {
    expect(replay?.evidence_digest).toBe(replays[0]?.evidence_digest);
  }
  expect(golden.case_names).toEqual(
    action653aGoldenMatrixCases.map((entry) => entry.name),
  );
  expect(golden.common_envelope_digest).toBe(results[0].envelope_digest);
  expect(golden.common_instruction_digest).toBe(
    results[0].instruction?.instruction_digest,
  );
  expect(golden.common_submission_intent_identity).toBe(
    results[0].instruction?.submission_intent_identity,
  );
  expect(golden.common_synthetic_replay_evidence_digest).toBe(
    replays[0]?.evidence_digest,
  );
});

test("implementation exposes no transport, provider, persistence, or live capability interface", () => {
  const source = readFileSync(
    resolve(
      root,
      "lib/action-653a-broker-neutral-execution-instruction.ts",
    ),
    "utf8",
  );
  const importedModules = [
    ...source.matchAll(/from\\s+["']([^"']+)["']/g),
  ].map((match) => match[1]);
  const forbiddenImport =
    /(?:avanza|playwright|puppeteer|supabase|database|bankid|credential|browser|cdp|socket|fetch|transport|broker)/i;

  expect(importedModules.filter((value) => forbiddenImport.test(value))).toEqual(
    [],
  );
  expect(source).not.toMatch(/\b(?:fetch|XMLHttpRequest|WebSocket)\s*\(/);
  expect(source).not.toMatch(
    /\b(?:submitOrder|placeOrder|insert|upsert|update|delete)\s*\(/,
  );
  expect(source).not.toMatch(
    /from\s+["'](?:node:)?(?:child_process|cluster|worker_threads)["']/,
  );
  const result = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    buildAction653aFixtureScenario().request,
  );
  expect(JSON.stringify(result.instruction)).not.toMatch(
    /(?:https?:|credential|cookie|bankid|account|browser|cdp|socket)/i,
  );
  expect(golden.safety).toEqual({
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
});
