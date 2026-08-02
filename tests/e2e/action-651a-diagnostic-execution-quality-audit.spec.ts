import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  runAction651aDiagnosticExecutionQualityAudit,
  type Action651aDiagnosticAuditInput,
} from "../../lib/action-651a-diagnostic-execution-quality-audit";
import {
  action651aGoldenMatrixCases,
  buildAction651aFixtureScenario,
} from "../fixtures/action-651a-diagnostic-execution-quality-fixtures";

const root = resolve(__dirname, "../..");

test("Action 651A returns before request traversal and work when default-off", () => {
  const reads: PropertyKey[] = [];
  const input = new Proxy(
    { enabled: false },
    {
      get(target, property, receiver) {
        reads.push(property);
        if (property !== "enabled") {
          throw new Error(`Unexpected disabled-path read: ${String(property)}`);
        }
        return Reflect.get(target, property, receiver);
      },
    },
  ) as unknown as Action651aDiagnosticAuditInput;

  const result = runAction651aDiagnosticExecutionQualityAudit(input);
  expect(reads).toEqual(["enabled"]);
  expect(result).toMatchObject({
    gate_status: "disabled",
    audit_status: "incomplete",
    audit_evidence_digest: null,
    lineage: null,
  });
  expect(result.effects).toEqual({
    audit_records_persisted: 0,
    provider_calls: 0,
    database_writes: 0,
    order_mutations: 0,
    trade_mutations: 0,
    position_mutations: 0,
    process_spawns: 0,
  });
});

test("Action 651A kill switch returns before request traversal and work", () => {
  const reads: PropertyKey[] = [];
  const input = new Proxy(
    { enabled: true, kill_switch_active: true },
    {
      get(target, property, receiver) {
        reads.push(property);
        if (property !== "enabled" && property !== "kill_switch_active") {
          throw new Error(`Unexpected killed-path read: ${String(property)}`);
        }
        return Reflect.get(target, property, receiver);
      },
    },
  ) as unknown as Action651aDiagnosticAuditInput;

  const result = runAction651aDiagnosticExecutionQualityAudit(input);
  expect(reads).toEqual(["enabled", "kill_switch_active"]);
  expect(result).toMatchObject({
    gate_status: "kill_switch_active",
    audit_status: "incomplete",
    audit_evidence_digest: null,
    lineage: null,
  });
});

test("Action 651A binds lineage and nanosecond timing for confirmed replay", () => {
  const scenario = buildAction651aFixtureScenario();
  const result = runAction651aDiagnosticExecutionQualityAudit(scenario.input);

  expect(result.audit_status).toBe("audited");
  expect(result.failure_provenance).toMatchObject({
    failure_kind: "none",
    source_reason: null,
  });
  expect(result.lineage).toMatchObject({
    execution_identity: scenario.prepared.runtime_identity_context.execution_identity,
    lifecycle_identity: scenario.prepared.runtime_identity_context.lifecycle_identity,
    handoff_digest: scenario.prepared.handoff.identity.handoff_digest,
    confirmation_capability_digest: scenario.capability.capability_digest,
    session_identity: scenario.capability.session_identity,
    idempotency_identity:
      scenario.prepared.handoff.identity.idempotency_identity,
  });
  expect(result.lineage?.confirmation_receipt_digest).toMatch(
    /^action_650u_confirmation_receipt_/,
  );
  expect(result.lineage?.terminal_digest).toMatch(/^action_651a_terminal_/);
  expect(result.timing_projection).toMatchObject({
    precision: "nanoseconds",
    planned_to_waiting_nanoseconds: "0",
    waiting_to_confirmation_nanoseconds: "1000000000",
    confirmation_to_simulated_submission_nanoseconds: "1000000000",
    simulated_submission_to_simulated_terminal_nanoseconds: "1000000000",
  });
});

test("Action 651A keeps planned, confirmed and synthetic fill projections separate", () => {
  const result = runAction651aDiagnosticExecutionQualityAudit(
    buildAction651aFixtureScenario().input,
  );

  expect(result.planned_price_projection).toMatchObject({
    source: "verified_execution_preparation",
    planned_limit_price: "179",
    planned_stop_price: "180",
  });
  expect(result.confirmed_price_projection).toMatchObject({
    source: "synthetic_manual_confirmation_fixture",
    price_micros: "179250000",
    point_in_time_safe: true,
  });
  expect(result.synthetic_fill_projection).toMatchObject({
    source: "synthetic_replay_fixture",
    price_micros: "179100000",
    signed_slippage_vs_confirmed_micros: "-150000",
    adverse_slippage_vs_confirmed_micros: "150000",
    calculation: "synthetic_confirmed_minus_synthetic_fill",
  });
  expect(result.safety).toMatchObject({
    diagnostic_only: true,
    real_broker_evidence: false,
    performance_eligible: false,
    automatic_execution_allowed: false,
  });
});

test("Action 651A golden matrix is deterministic across zones and input order", () => {
  const results = action651aGoldenMatrixCases.map((entry) => {
    const scenario = buildAction651aFixtureScenario(entry.clock, {
      reverse_input_order: entry.reverse_input_order,
    });
    return {
      name: entry.name,
      result: runAction651aDiagnosticExecutionQualityAudit(scenario.input),
    };
  });
  const reference = results[0].result;

  for (const { result } of results) {
    expect(result.audit_status).toBe("audited");
    expect(result.audit_evidence_digest).toBe(reference.audit_evidence_digest);
    expect(result.timing_projection).toEqual(reference.timing_projection);
    expect(result.lineage).toEqual(reference.lineage);
    expect(result.planned_price_projection).toEqual(
      reference.planned_price_projection,
    );
    expect(result.confirmed_price_projection).toEqual(
      reference.confirmed_price_projection,
    );
    expect(result.synthetic_fill_projection).toEqual(
      reference.synthetic_fill_projection,
    );
  }
});

test("Action 651A classifies missing, late, expired and conflicting confirmation", () => {
  const missing = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...missing.input,
      capability: null,
    }),
  ).toMatchObject({
    audit_status: "incomplete",
    failure_provenance: { failure_kind: "confirmation_missing" },
  });

  const late = buildAction651aFixtureScenario("utc_a", {
    maximum_confirmation_latency_nanoseconds: "999999999",
  });
  expect(runAction651aDiagnosticExecutionQualityAudit(late.input)).toMatchObject({
    audit_status: "incomplete",
    failure_provenance: { failure_kind: "confirmation_late" },
  });

  const expired = buildAction651aFixtureScenario("utc_a", {
    consumed_at: "2026-07-29T10:10:00.000000000Z",
  });
  expect(
    runAction651aDiagnosticExecutionQualityAudit(expired.input),
  ).toMatchObject({
    audit_status: "incomplete",
    failure_provenance: { failure_kind: "confirmation_expired" },
  });

  const conflicting = buildAction651aFixtureScenario();
  const clone = {
    ...conflicting.capability,
    session_identity: "substituted-session",
  };
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...conflicting.input,
      capability: clone,
    }),
  ).toMatchObject({
    audit_status: "conflicting",
    failure_provenance: { failure_kind: "confirmation_conflicting" },
  });
});

test("Action 651A marks point-in-time drift and malformed price input closed", () => {
  const unsafe = buildAction651aFixtureScenario("utc_a", {
    confirmed_price_observed_at: "2026-07-29T10:00:01.000000001Z",
  });
  expect(runAction651aDiagnosticExecutionQualityAudit(unsafe.input)).toMatchObject({
    audit_status: "not_point_in_time_safe",
    failure_provenance: {
      failure_kind: "price_observation_not_point_in_time_safe",
    },
    confirmed_price_projection: { point_in_time_safe: false },
  });

  const malformed = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...malformed.input,
      synthetic_fill: {
        source: "synthetic_replay_fixture",
        price_micros: "179.1",
      },
    }),
  ).toMatchObject({
    audit_status: "unmappable",
    failure_provenance: { failure_kind: "diagnostic_input_unmappable" },
  });
});

test("Action 651A rejects capability cloning, reuse and cross-execution substitution", () => {
  const cloneScenario = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...cloneScenario.input,
      capability: { ...cloneScenario.capability },
    }),
  ).toMatchObject({
    audit_status: "conflicting",
    failure_provenance: { failure_kind: "confirmation_conflicting" },
  });

  const reused = buildAction651aFixtureScenario();
  const first = runAction651aDiagnosticExecutionQualityAudit(reused.input);
  expect(first.audit_status).toBe("audited");
  expect(runAction651aDiagnosticExecutionQualityAudit(reused.input)).toMatchObject({
    audit_status: "conflicting",
    failure_provenance: { failure_kind: "confirmation_conflicting" },
  });

  const left = buildAction651aFixtureScenario();
  const right = buildAction651aFixtureScenario("utc_a", {
    execution_identity: "action-651a-other-execution",
  });
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...left.input,
      capability: right.capability,
    }),
  ).toMatchObject({
    audit_status: "conflicting",
    failure_provenance: { failure_kind: "confirmation_conflicting" },
  });
});

test("Action 651A binds conflicting replay failure provenance and terminal digest", () => {
  const scenario = buildAction651aFixtureScenario();
  const acceptedTerminal = scenario.input.broker_events.find(
    (event) => event.event_type === "terminal",
  );
  if (!acceptedTerminal || acceptedTerminal.event_type !== "terminal") {
    throw new Error("Expected terminal fixture.");
  }
  const result = runAction651aDiagnosticExecutionQualityAudit({
    ...scenario.input,
    broker_events: [
      ...scenario.input.broker_events,
      {
        ...acceptedTerminal,
        terminal_status: "failed",
        observed_at: "2026-07-29T10:00:04.000000000Z",
      },
    ],
  });

  expect(result).toMatchObject({
    audit_status: "conflicting",
    failure_provenance: {
      failure_kind: "confirmed_replay_conflicting",
      source_reason: "conflicting_terminal_result",
    },
  });
  expect(result.failure_provenance?.evidence_digest).toMatch(
    /^action_651a_failure_/,
  );
  expect(result.lineage?.terminal_digest).toMatch(/^action_651a_terminal_/);
});

test("Action 651A safety flags and effects stay closed", () => {
  const result = runAction651aDiagnosticExecutionQualityAudit(
    buildAction651aFixtureScenario().input,
  );
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
  expect(result.effects).toEqual({
    audit_records_persisted: 0,
    provider_calls: 0,
    database_writes: 0,
    order_mutations: 0,
    trade_mutations: 0,
    position_mutations: 0,
    process_spawns: 0,
  });
});

test("Action 651A implementation has a closed local import graph", () => {
  const source = readFileSync(
    resolve(root, "lib/action-651a-diagnostic-execution-quality-audit.ts"),
    "utf8",
  );
  const imports = [...source.matchAll(/from\s+"([^"]+)"/g)].map(
    (match) => match[1],
  );
  expect(imports).toEqual([
    "@/lib/action-650s-execution-identity",
    "@/lib/action-650s-execution-preparation",
    "@/lib/action-650u-confirmed-execution-replay",
    "@/lib/action-650u-manual-confirmation",
    "@/lib/action-650u-temporal-confirmation-policy",
  ]);
  expect(source).not.toMatch(/\b(?:fetch|WebSocket|XMLHttpRequest)\s*\(/);
  expect(source).not.toMatch(/\b(?:spawn|exec|fork)\s*\(/);
  expect(source).not.toMatch(/\.(?:insert|upsert|delete)\s*\(/);
  expect(source).not.toMatch(/from\s+["'][^"']*(?:supabase|playwright|puppeteer)/i);
  expect(source).not.toMatch(/from\s+["']node:(?:child_process|net|http|https)/);
});

test("Action 651A golden report matches the deterministic runtime evidence", () => {
  const report = JSON.parse(
    readFileSync(
      resolve(
        root,
        "docs/action-651a-diagnostic-execution-quality-golden-report.json",
      ),
      "utf8",
    ),
  ) as {
    contract_version: string;
    matrix: { cases: string[]; common_audit_evidence_digest: string };
    expected: Record<string, unknown>;
  };
  const result = runAction651aDiagnosticExecutionQualityAudit(
    buildAction651aFixtureScenario().input,
  );
  const expected = {
    audit_status: result.audit_status,
    lineage: result.lineage,
    timing_projection: result.timing_projection,
    planned_price_projection: result.planned_price_projection,
    confirmed_price_projection: result.confirmed_price_projection,
    synthetic_fill_projection: result.synthetic_fill_projection,
    failure_provenance: result.failure_provenance,
    safety: result.safety,
    effects: result.effects,
  };
  if (process.env.ACTION_651A_PRINT_GOLDEN === "true") {
    console.log(
      `ACTION_651A_GOLDEN=${JSON.stringify({
        common_audit_evidence_digest: result.audit_evidence_digest,
        expected,
      })}`,
    );
  }

  expect(report.contract_version).toBe(
    "action_651a_diagnostic_execution_quality_golden_report_v1",
  );
  expect(report.matrix.cases).toEqual(
    action651aGoldenMatrixCases.map(({ name }) => name),
  );
  expect(report.matrix.common_audit_evidence_digest).toBe(
    result.audit_evidence_digest,
  );
  expect(report.expected).toEqual(expected);
});
