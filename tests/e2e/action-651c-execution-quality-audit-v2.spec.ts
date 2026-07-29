import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  rebuildAction651cAuditEvidenceDigest,
  rebuildAction651cFailureEvidenceDigest,
  rebuildAction651cFailureLineageDigest,
  rebuildAction651cSnapshotDigest,
  runAction651cExecutionQualityAuditV2,
  verifyAction651cDiagnosticAuditResult,
  type Action651cDiagnosticAuditInput,
  type Action651cDiagnosticAuditResult,
} from "../../lib/action-651c-execution-quality-audit-v2";
import { runAction651aDiagnosticExecutionQualityAudit } from "../../lib/action-651a-diagnostic-execution-quality-audit";
import {
  action651cGoldenMatrixCases,
  buildAction651cFixtureScenario,
} from "../fixtures/action-651c-execution-quality-audit-v2-fixtures";

const root = resolve(__dirname, "../..");

test("Action 651C preserves V1 attacks and makes failure identity lineage-unique", () => {
  const v1First = buildAction651cFixtureScenario("utc_a", {
    execution_identity: "action-651c-collision-one",
  });
  const v1Second = buildAction651cFixtureScenario("utc_a", {
    execution_identity: "action-651c-collision-two",
  });
  const v1FirstResult = runAction651aDiagnosticExecutionQualityAudit({
    ...v1First.predecessor.input,
    capability: null,
  });
  const v1SecondResult = runAction651aDiagnosticExecutionQualityAudit({
    ...v1Second.predecessor.input,
    capability: null,
  });
  expect(v1FirstResult.failure_provenance?.evidence_digest).toBe(
    v1SecondResult.failure_provenance?.evidence_digest,
  );

  const v2First = runAction651cExecutionQualityAuditV2({
    ...v1First.input,
    capability: null,
  });
  const v2Second = runAction651cExecutionQualityAuditV2({
    ...v1Second.input,
    capability: null,
  });
  expect(v2First.failure_provenance?.evidence_digest).not.toBe(
    v2Second.failure_provenance?.evidence_digest,
  );
  expect(
    v2First.failure_provenance?.failure_lineage.execution_identity,
  ).toBe("action-651c-collision-one");
  expect(
    v2Second.failure_provenance?.failure_lineage.execution_identity,
  ).toBe("action-651c-collision-two");
});

test("Action 651C reproduces V1 accessor execution and eliminates it in V2", () => {
  const v1Scenario = buildAction651cFixtureScenario();
  let v1Reads = 0;
  const v1Price = {
    source: "synthetic_manual_confirmation_fixture" as const,
    get price_micros() {
      v1Reads += 1;
      return v1Reads === 1 ? "179250000" : "179260000";
    },
    observed_at: v1Scenario.predecessor.capability.confirmed_at,
  };
  runAction651aDiagnosticExecutionQualityAudit({
    ...v1Scenario.predecessor.input,
    confirmed_price: v1Price,
  });
  expect(v1Reads).toBe(2);

  const v2Scenario = buildAction651cFixtureScenario();
  let v2Reads = 0;
  const v2Price = {
    source: "synthetic_manual_confirmation_fixture" as const,
    get price_micros() {
      v2Reads += 1;
      return v2Reads === 1 ? "179250000" : "179260000";
    },
    observed_at: v2Scenario.predecessor.capability.confirmed_at,
  };
  const result = runAction651cExecutionQualityAuditV2({
    ...v2Scenario.input,
    confirmed_price: v2Price,
  });
  expect(v2Reads).toBe(0);
  expect(result).toMatchObject({
    audit_status: "unmappable",
    snapshot_evidence: {
      status: "rejected",
      failure_reason: "accessor_rejected",
      failure_path: "$.confirmed_price.price_micros",
    },
  });
});

test("Action 651C binds complete preparation, confirmation and replay lineage", () => {
  const scenario = buildAction651cFixtureScenario();
  const result = runAction651cExecutionQualityAuditV2(scenario.input);
  const lineage = result.failure_provenance?.failure_lineage;
  expect(result.audit_status).toBe("audited");
  expect(lineage).toMatchObject({
    execution_identity:
      scenario.predecessor.prepared.runtime_identity_context.execution_identity,
    lifecycle_identity:
      scenario.predecessor.prepared.runtime_identity_context.lifecycle_identity,
    runtime_identity_context_digest:
      scenario.predecessor.prepared.runtime_identity_context_digest,
    preparation_trace_identity: scenario.predecessor.prepared.trace_identity,
    handoff_identity:
      scenario.predecessor.prepared.handoff.identity.handoff_identity,
    handoff_digest:
      scenario.predecessor.prepared.handoff.identity.handoff_digest,
    canonical_order_payload_digest:
      scenario.predecessor.prepared.handoff.identity
        .canonical_order_payload_digest,
    confirmation_request_digest:
      scenario.predecessor.capability.confirmation_request_digest,
    confirmation_capability_digest:
      scenario.predecessor.capability.capability_digest,
    confirmation_consumption_state: "consumed",
    session_identity: scenario.predecessor.capability.session_identity,
    session_started_at: scenario.predecessor.capability.session_started_at,
    session_expires_at: scenario.predecessor.capability.session_expires_at,
    temporal_policy_version:
      scenario.predecessor.capability.temporal_policy_version,
    idempotency_identity:
      scenario.predecessor.prepared.handoff.identity.idempotency_identity,
    correlation_identity:
      scenario.predecessor.prepared.handoff.identity.correlation_identity,
  });
  expect(lineage?.confirmation_receipt_digest).toMatch(
    /^action_650u_confirmation_receipt_/,
  );
  expect(lineage?.confirmed_replay_trace_identity).toMatch(
    /^action_650u_confirmed_replay_/,
  );
  expect(lineage?.terminal_digest).toMatch(/^action_651a_terminal_/);
});

test("Action 651C independently rebuilds snapshot, lineage, failure and audit", () => {
  const result = runAction651cExecutionQualityAuditV2(
    buildAction651cFixtureScenario().input,
  );
  if (!result.snapshot_evidence || !result.failure_provenance) {
    throw new Error("Expected enabled V2 evidence.");
  }
  expect(rebuildAction651cSnapshotDigest(result.snapshot_evidence)).toBe(
    result.snapshot_evidence.snapshot_digest,
  );
  expect(
    rebuildAction651cFailureLineageDigest(
      result.failure_provenance.failure_lineage,
    ),
  ).toBe(result.failure_provenance.failure_lineage.lineage_digest);
  expect(rebuildAction651cFailureEvidenceDigest(result.failure_provenance)).toBe(
    result.failure_provenance.evidence_digest,
  );
  expect(rebuildAction651cAuditEvidenceDigest(result)).toBe(
    result.audit_evidence_digest,
  );
  expect(verifyAction651cDiagnosticAuditResult(result)).toBe(true);
});

test("Action 651C rejects self-consistently recomputed failure evidence clones", () => {
  const original = runAction651cExecutionQualityAuditV2({
    ...buildAction651cFixtureScenario().input,
    capability: null,
  });
  if (!original.failure_provenance) {
    throw new Error("Expected failure evidence.");
  }
  const changedLineage = {
    ...original.failure_provenance.failure_lineage,
    execution_identity: "action-651c-self-consistent-substitution",
  };
  const recomputedLineage = {
    ...changedLineage,
    lineage_digest: rebuildAction651cFailureLineageDigest(changedLineage),
  };
  const changedFailure = {
    ...original.failure_provenance,
    failure_lineage: recomputedLineage,
  };
  const recomputedFailure = {
    ...changedFailure,
    evidence_digest: rebuildAction651cFailureEvidenceDigest(changedFailure),
  };
  const changedResult = {
    ...original,
    failure_provenance: recomputedFailure,
  };
  const recomputedResult = {
    ...changedResult,
    audit_evidence_digest: rebuildAction651cAuditEvidenceDigest(changedResult),
  } as Action651cDiagnosticAuditResult;

  expect(rebuildAction651cFailureEvidenceDigest(recomputedFailure)).toBe(
    recomputedFailure.evidence_digest,
  );
  expect(rebuildAction651cAuditEvidenceDigest(recomputedResult)).toBe(
    recomputedResult.audit_evidence_digest,
  );
  expect(verifyAction651cDiagnosticAuditResult(recomputedResult)).toBe(false);
});

test("Action 651C rejects proxies, cycles and budget exhaustion with sanitized evidence", () => {
  const proxyScenario = buildAction651cFixtureScenario();
  const proxiedPrice = new Proxy(
    {
      source: "synthetic_manual_confirmation_fixture" as const,
      price_micros: "179250000",
      observed_at: proxyScenario.predecessor.capability.confirmed_at,
    },
    {},
  );
  const proxyResult = runAction651cExecutionQualityAuditV2({
    ...proxyScenario.input,
    confirmed_price: proxiedPrice,
  });
  expect(proxyResult.snapshot_evidence).toMatchObject({
    status: "rejected",
    failure_reason: "proxy_rejected",
  });

  const cycleScenario = buildAction651cFixtureScenario();
  const cycle: Record<string, unknown> = {
    source: "synthetic_manual_confirmation_fixture",
    price_micros: "179250000",
    observed_at: cycleScenario.predecessor.capability.confirmed_at,
  };
  cycle.self = cycle;
  const cycleResult = runAction651cExecutionQualityAuditV2({
    ...cycleScenario.input,
    confirmed_price: cycle as never,
  });
  expect(cycleResult.snapshot_evidence).toMatchObject({
    status: "rejected",
    failure_reason: "cycle_rejected",
  });

  const budgetScenario = buildAction651cFixtureScenario();
  const oversized: Record<string, unknown> = {
    source: "synthetic_manual_confirmation_fixture",
    price_micros: "179250000",
    observed_at: budgetScenario.predecessor.capability.confirmed_at,
  };
  for (let index = 0; index < 2_100; index += 1) {
    oversized[`bounded_${index}`] = index;
  }
  const budgetResult = runAction651cExecutionQualityAuditV2({
    ...budgetScenario.input,
    confirmed_price: oversized as never,
  });
  expect(budgetResult.snapshot_evidence).toMatchObject({
    status: "rejected",
    failure_reason: "snapshot_budget_exceeded",
  });

  for (const result of [proxyResult, cycleResult, budgetResult]) {
    expect(result.audit_status).toBe("unmappable");
    expect(result.failure_provenance?.source_reason).not.toContain(
      "179250000",
    );
    expect(
      result.snapshot_evidence?.observed_input_digests
        .rejection_witness_digest,
    ).toMatch(/^action_651c_snapshot_rejection_/);
    expect(verifyAction651cDiagnosticAuditResult(result)).toBe(true);
  }
});

test("Action 651C snapshot isolates post-verification input mutation", () => {
  const scenario = buildAction651cFixtureScenario();
  const confirmedPrice = {
    source: "synthetic_manual_confirmation_fixture" as const,
    price_micros: "179250000",
    observed_at: scenario.predecessor.capability.confirmed_at,
  };
  const result = runAction651cExecutionQualityAuditV2({
    ...scenario.input,
    confirmed_price: confirmedPrice,
  });
  const digest = result.audit_evidence_digest;
  confirmedPrice.price_micros = "999999999";

  expect(result.confirmed_price_projection?.price_micros).toBe("179250000");
  expect(result.audit_evidence_digest).toBe(digest);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.snapshot_evidence)).toBe(true);
  expect(Object.isFrozen(result.failure_provenance?.failure_lineage)).toBe(true);
  expect(verifyAction651cDiagnosticAuditResult(result)).toBe(true);
});

test("Action 651C remains deterministic across timezones and reversed input order", () => {
  const results = action651cGoldenMatrixCases.map((entry) =>
    runAction651cExecutionQualityAuditV2(
      buildAction651cFixtureScenario(entry.clock, {
        reverse_input_order: entry.reverse_input_order,
      }).input,
    ),
  );
  for (const result of results) {
    expect(result.audit_status).toBe("audited");
    expect(result.audit_evidence_digest).toBe(results[0].audit_evidence_digest);
    expect(result.failure_provenance).toEqual(results[0].failure_provenance);
    expect(result.snapshot_evidence).toEqual(results[0].snapshot_evidence);
  }
});

test("Action 651C preserves default-off and kill-switch zero-work", () => {
  for (const gate of [
    { enabled: false, kill_switch_active: false, expected: ["enabled"] },
    {
      enabled: true,
      kill_switch_active: true,
      expected: ["enabled", "kill_switch_active"],
    },
  ] as const) {
    const reads: PropertyKey[] = [];
    const input = new Proxy(gate, {
      get(target, property, receiver) {
        reads.push(property);
        if (property !== "enabled" && property !== "kill_switch_active") {
          throw new Error(`Unexpected gate read: ${String(property)}`);
        }
        return Reflect.get(target, property, receiver);
      },
    }) as unknown as Action651cDiagnosticAuditInput;
    const result = runAction651cExecutionQualityAuditV2(input);
    expect(reads).toEqual(gate.expected);
    expect(result.audit_evidence_digest).toBeNull();
    expect(result.snapshot_evidence).toBeNull();
  }
});

test("Action 651C preserves synthetic projections and closed safety flags", () => {
  const result = runAction651cExecutionQualityAuditV2(
    buildAction651cFixtureScenario().input,
  );
  expect(result.planned_price_projection).toMatchObject({
    source: "verified_execution_preparation",
    planned_limit_price: "179",
    planned_stop_price: "180",
  });
  expect(result.confirmed_price_projection).toMatchObject({
    source: "synthetic_manual_confirmation_fixture",
    price_micros: "179250000",
  });
  expect(result.synthetic_fill_projection).toMatchObject({
    source: "synthetic_replay_fixture",
    price_micros: "179100000",
    signed_slippage_vs_confirmed_micros: "-150000",
  });
  expect(result.safety).toEqual({
    diagnostic_only: true,
    real_broker_evidence: false,
    performance_eligible: false,
    automatic_execution_allowed: false,
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
});

test("Action 651C has no live, browser, persistence or process edge", () => {
  const source = readFileSync(
    resolve(root, "lib/action-651c-execution-quality-audit-v2.ts"),
    "utf8",
  );
  expect(source).not.toMatch(/\b(?:fetch|WebSocket|XMLHttpRequest)\s*\(/);
  expect(source).not.toMatch(/\b(?:spawn|exec|fork)\s*\(/);
  expect(source).not.toMatch(/\.(?:insert|upsert)\s*\(/);
  expect(source).not.toMatch(
    /\b(?:supabase|database|table|query)\w*\s*\.\s*delete\s*\(/i,
  );
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:avanza|supabase|playwright|puppeteer|browser|cdp)/i,
  );
  expect(source).not.toMatch(
    /from\s+["']node:(?:child_process|net|http|https)/,
  );
});

test("Action 651C golden report matches runtime remediation evidence", () => {
  const golden = JSON.parse(
    readFileSync(
      resolve(
        root,
        "docs/action-651c-execution-quality-audit-v2-golden-report.json",
      ),
      "utf8",
    ),
  );
  const common = runAction651cExecutionQualityAuditV2(
    buildAction651cFixtureScenario().input,
  );
  const collisionOne = runAction651cExecutionQualityAuditV2({
    ...buildAction651cFixtureScenario("utc_a", {
      execution_identity: "action-651c-collision-one",
    }).input,
    capability: null,
  });
  const collisionTwo = runAction651cExecutionQualityAuditV2({
    ...buildAction651cFixtureScenario("utc_a", {
      execution_identity: "action-651c-collision-two",
    }).input,
    capability: null,
  });
  const accessorScenario = buildAction651cFixtureScenario();
  let reads = 0;
  const accessor = runAction651cExecutionQualityAuditV2({
    ...accessorScenario.input,
    confirmed_price: {
      source: "synthetic_manual_confirmation_fixture",
      get price_micros() {
        reads += 1;
        return "179250000";
      },
      observed_at: accessorScenario.predecessor.capability.confirmed_at,
    },
  });
  expect(common.audit_evidence_digest).toBe(
    golden.matrix.common_audit_evidence_digest,
  );
  expect(common.snapshot_evidence?.snapshot_digest).toBe(
    golden.matrix.common_snapshot_digest,
  );
  expect(common.failure_provenance?.evidence_digest).toBe(
    golden.matrix.common_failure_evidence_digest,
  );
  expect(common.failure_provenance?.failure_lineage.lineage_digest).toBe(
    golden.matrix.common_failure_lineage_digest,
  );
  expect(common.predecessor_audit_evidence_digest).toBe(
    golden.matrix.predecessor_audit_evidence_digest,
  );
  expect(collisionOne.failure_provenance?.evidence_digest).toBe(
    golden.failure_collision_matrix.first_execution_failure_digest,
  );
  expect(collisionTwo.failure_provenance?.evidence_digest).toBe(
    golden.failure_collision_matrix.second_execution_failure_digest,
  );
  expect(reads).toBe(golden.accessor_rejection.getter_reads);
  expect(accessor.audit_evidence_digest).toBe(
    golden.accessor_rejection.audit_evidence_digest,
  );
  expect(accessor.snapshot_evidence?.snapshot_digest).toBe(
    golden.accessor_rejection.snapshot_digest,
  );
  expect(accessor.failure_provenance?.evidence_digest).toBe(
    golden.accessor_rejection.failure_evidence_digest,
  );
  expect(accessor.snapshot_evidence?.failure_reason).toBe(
    golden.accessor_rejection.failure_reason,
  );
});
