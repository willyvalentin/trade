import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import { deepFreezeAction650s } from "../../lib/action-650s-execution-identity";
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
import { buildAction653aFixtureScenario } from "../fixtures/action-653a-broker-neutral-execution-instruction-fixtures";

const root = resolve(__dirname, "../..");
const enabled = { enabled: true, kill_switch_active: false } as const;
const normativePaths = [
  "docs/action-653a-broker-neutral-execution-instruction-golden-report.json",
  "docs/action-653a-broker-neutral-execution-instruction.md",
  "lib/action-653a-broker-neutral-execution-instruction.ts",
  "tests/e2e/action-653a-broker-neutral-execution-instruction.spec.ts",
  "tests/fixtures/action-653a-broker-neutral-execution-instruction-fixtures.ts",
] as const;
const expectedSha256 = {
  "docs/action-653a-broker-neutral-execution-instruction-golden-report.json":
    "488dae5004582e1fa22f3576b12c274cd921c1f5ed7212cac22ee69a12d83375",
  "docs/action-653a-broker-neutral-execution-instruction.md":
    "b57999de2f5588eedf11588955ae450772a497683cb45708151e7b07e9802c16",
  "lib/action-653a-broker-neutral-execution-instruction.ts":
    "138dc40fbf214654300894c974413416c95867f7d01cbdba0f6c58352f1d0b0d",
  "tests/e2e/action-653a-broker-neutral-execution-instruction.spec.ts":
    "bcf73d0c55b30a31c3cb1da231861c53e8ef276dc5ccb6e15d5089223d19f0c4",
  "tests/fixtures/action-653a-broker-neutral-execution-instruction-fixtures.ts":
    "749c05f05fcb12dcc032cc6f704c5f287bdfbf9214b74d84e87121e10c09b6d1",
} as const;

function normativeDigest() {
  const combined = createHash("sha256");
  const individual: Record<string, string> = {};
  for (const artifact of normativePaths) {
    const bytes = readFileSync(resolve(root, artifact));
    individual[artifact] = createHash("sha256").update(bytes).digest("hex");
    combined.update(artifact);
    combined.update("\0");
    combined.update(bytes);
    combined.update("\0");
  }
  return {
    individual,
    combined: combined.digest("hex"),
  };
}

test("independently rebuilds the exact five-path normative freeze", () => {
  const rebuilt = normativeDigest();
  expect(rebuilt.individual).toEqual(expectedSha256);
  expect(rebuilt.combined).toBe(
    "c6001208fea3c72e1409c518b0382bc380fa83d29c260fced84b2d57e6851015",
  );
});

test("rejects risk-admission, boundary, and manual-confirmation substitution", () => {
  const riskScenario = buildAction653aFixtureScenario();
  const clonedRisk = deepFreezeAction650s({
    ...riskScenario.risk_admission,
  });
  const riskResult = runAction653aBrokerNeutralExecutionInstruction(enabled, {
    ...riskScenario.request,
    risk_admission: clonedRisk,
  });
  expect(riskResult.instruction_status).toBe("blocked");
  expect(riskResult.terminal_reason).toBe("risk_admission_unproven");

  const capabilityScenario = buildAction653aFixtureScenario();
  const clonedCapability = deepFreezeAction650s({
    ...capabilityScenario.request.confirmation_capability,
  });
  const capabilityResult =
    runAction653aBrokerNeutralExecutionInstruction(enabled, {
      ...capabilityScenario.request,
      confirmation_capability: clonedCapability,
    });
  expect(capabilityResult.instruction_status).toBe("blocked");
  expect(capabilityResult.terminal_reason).toBe("confirmation_rejected");

  const boundaryScenario = buildAction653aFixtureScenario();
  const clonedBoundary = Object.freeze({
    ...boundaryScenario.request.confirmation_boundary,
  });
  const boundaryResult =
    runAction653aBrokerNeutralExecutionInstruction(enabled, {
      ...boundaryScenario.request,
      confirmation_boundary: clonedBoundary,
    });
  expect(boundaryResult.instruction_status).toBe("blocked");
  expect(boundaryResult.terminal_reason).toBe("confirmation_rejected");
});

test("binds execution, session, handoff, risk, confirmation, and idempotency lineage", () => {
  const scenario = buildAction653aFixtureScenario();
  const result = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    scenario.request,
  );
  const prepared = scenario.request.prepared;
  const capability = scenario.request.confirmation_capability;

  expect(result.instruction_status).toBe("prepared");
  expect(result.lineage).toMatchObject({
    execution_identity:
      prepared.runtime_identity_context.execution_identity,
    lifecycle_identity:
      prepared.runtime_identity_context.lifecycle_identity,
    preparation_trace_identity: prepared.trace_identity,
    handoff_identity: prepared.handoff.identity.handoff_identity,
    handoff_digest: prepared.handoff.identity.handoff_digest,
    risk_admission_digest: scenario.risk_admission.terminal_digest,
    confirmation_request_digest: capability.confirmation_request_digest,
    confirmation_capability_digest: capability.capability_digest,
    session_identity: capability.session_identity,
    idempotency_identity: prepared.handoff.identity.idempotency_identity,
  });
  const { envelope_digest: claimed, ...projection } = result;
  expect(claimed).toBe(
    rebuildAction653aInstructionEnvelopeDigest(projection),
  );
});

test("rebuilds strict confirmation and instruction expiry boundaries at nanosecond precision", () => {
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
  const confirmationExpired =
    runAction653aBrokerNeutralExecutionInstruction(
      enabled,
      buildAction653aFixtureScenario("utc_a", {
        consumed_at: "2026-07-29T10:10:00.000000000Z",
        observed_at: "2026-07-29T10:10:00.000000000Z",
      }).request,
    );

  expect(before.instruction_status).toBe("prepared");
  expect(exact.instruction_status).toBe("expired");
  expect(after.instruction_status).toBe("expired");
  expect(confirmationExpired.terminal_reason).toBe("confirmation_expired");
});

test("locks quantity, price, notional, scales, units, currency, schema, and root shape", () => {
  const scenario = buildAction653aFixtureScenario();
  const result = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    scenario.request,
  );
  expect(result.instruction).toMatchObject({
    schema_version: "action_653a_broker_neutral_instruction_schema_v1",
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

  const { observed_at: _removed, ...stripped } =
    buildAction653aFixtureScenario().request;
  void _removed;
  const strippedResult =
    runAction653aBrokerNeutralExecutionInstruction(enabled, stripped);
  const extraResult = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    {
      ...buildAction653aFixtureScenario().request,
      schema_version: "caller_schema",
    },
  );
  expect(strippedResult.instruction_status).toBe("unmappable");
  expect(extraResult.instruction_status).toBe("unmappable");

  const substitutedResult = deepFreezeAction650s({
    ...result,
    instruction: {
      ...result.instruction!,
      schema_version: "caller_schema",
    },
  });
  expect(canAction653aProceedToSyntheticReplay(substitutedResult)).toBe(false);
});

test("keeps exact duplicates idempotent and conflicting or cross-execution reuse closed", () => {
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
    execution_identity: "action-653b-cross-execution",
  });
  const cross = runAction653aBrokerNeutralExecutionInstruction(enabled, {
    ...scenario.request,
    prepared: other.prepared,
    observed_at: "2026-07-29T10:00:02.500000002Z",
  });

  expect(duplicate).toBe(first);
  expect(conflict.terminal_reason).toBe("conflicting_instruction_reuse");
  expect(cross.terminal_reason).toBe("cross_execution_reuse_rejected");
});

test("rejects getters, accessors, proxies, cycles, depth, and budget inputs without traversal", () => {
  const base = buildAction653aFixtureScenario().request;
  let reads = 0;
  const accessor = { ...base } as Record<string, unknown>;
  Object.defineProperty(accessor, "observed_at", {
    enumerable: true,
    get() {
      reads += 1;
      return base.observed_at;
    },
  });
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
  const cycle = { ...base } as Record<string, unknown>;
  cycle.prepared = cycle;
  let extreme: Record<string, unknown> = {};
  for (let index = 0; index < 1_000; index += 1) {
    extreme = { nested: extreme };
  }
  Object.freeze(extreme);

  const results = [
    runAction653aBrokerNeutralExecutionInstruction(enabled, accessor),
    runAction653aBrokerNeutralExecutionInstruction(
      enabled,
      new Proxy(base, {}),
    ),
    runAction653aBrokerNeutralExecutionInstruction(enabled, cycle),
    runAction653aBrokerNeutralExecutionInstruction(enabled, {
      ...base,
      confirmation_capability: capabilityAccessor,
    }),
    runAction653aBrokerNeutralExecutionInstruction(enabled, {
      ...base,
      risk_admission: extreme,
    }),
  ];
  expect(reads).toBe(0);
  expect(results.every((result) => result.instruction === null)).toBe(true);
  expect(
    results.every((result) =>
      ["unmappable", "blocked"].includes(result.instruction_status),
    ),
  ).toBe(true);
});

test("rejects destination, transport, credential, browser, CDP, and write injection", () => {
  for (const injected of [
    { destination_identity: "caller_destination" },
    { broker_url: "https://example.invalid" },
    { credential: "redacted" },
    { session_cookie: "redacted" },
    { browser_cdp: "redacted" },
    { database_write: true },
  ]) {
    const result = runAction653aBrokerNeutralExecutionInstruction(enabled, {
      ...buildAction653aFixtureScenario().request,
      ...injected,
    });
    expect(result.instruction_status).toBe("unmappable");
    expect(result.instruction).toBeNull();
  }

  const prepared = runAction653aBrokerNeutralExecutionInstruction(
    enabled,
    buildAction653aFixtureScenario().request,
  );
  expect(JSON.stringify(prepared.instruction)).not.toMatch(
    /(?:https?:|credential|cookie|bankid|account|browser|cdp|socket)/i,
  );
  expect(prepared.safety).toMatchObject({
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
});

test("allows only a provenance-valid prepared envelope into synthetic replay and 651C audit", () => {
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
  const auditScenario = buildAction651cFixtureScenario();
  const audit = runAction651cExecutionQualityAuditV2(auditScenario.input);

  expect(canAction653aProceedToSyntheticReplay(prepared)).toBe(true);
  expect(replay?.accepted).toBe(true);
  expect(
    replayAction653aPreparedInstruction(
      clone,
      "2026-07-29T10:00:03.000000000Z",
    ),
  ).toBeNull();
  expect(audit.audit_status).toBe("audited");
  expect(verifyAction651cDiagnosticAuditResult(audit)).toBe(true);
  expect(audit.failure_provenance?.failure_lineage.execution_identity).toBe(
    prepared.lineage.execution_identity,
  );
});

test("makes failure provenance execution-unique and independently rebuildable", () => {
  const first = buildAction651aFixtureScenario("utc_a", {
    execution_identity: "action-653b-failure-one",
  });
  const second = buildAction651aFixtureScenario("utc_a", {
    execution_identity: "action-653b-failure-two",
  });
  const failureOne = runAction653aBrokerNeutralExecutionInstruction(enabled, {
    prepared: first.prepared,
    risk_admission: null,
    confirmation_boundary: first.boundary,
    confirmation_capability: first.capability,
    consumed_at: first.input.consumed_at,
    observed_at: "2026-07-29T10:00:02.500000000Z",
  });
  const failureTwo = runAction653aBrokerNeutralExecutionInstruction(enabled, {
    prepared: second.prepared,
    risk_admission: null,
    confirmation_boundary: second.boundary,
    confirmation_capability: second.capability,
    consumed_at: second.input.consumed_at,
    observed_at: "2026-07-29T10:00:02.500000000Z",
  });
  expect(failureOne.lineage.execution_identity).toBe(
    "action-653b-failure-one",
  );
  expect(failureTwo.lineage.execution_identity).toBe(
    "action-653b-failure-two",
  );
  expect(failureOne.failure_provenance?.failure_digest).not.toBe(
    failureTwo.failure_provenance?.failure_digest,
  );
  for (const failure of [failureOne, failureTwo]) {
    const provenance = failure.failure_provenance!;
    expect(provenance.failure_digest).toBe(
      rebuildAction653aFailureDigest({
        terminal_reason: provenance.terminal_reason,
        observed_rejected_input_digests:
          provenance.observed_rejected_input_digests,
        lineage: failure.lineage,
      }),
    );
  }
});
