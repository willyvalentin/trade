import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  hashAction650sCanonicalValue,
} from "../../lib/action-650s-execution-identity";
import {
  runAction651aDiagnosticExecutionQualityAudit,
  type Action651aDiagnosticAuditInput,
  type Action651aDiagnosticAuditResult,
} from "../../lib/action-651a-diagnostic-execution-quality-audit";
import {
  buildAction651aFixtureScenario,
} from "../fixtures/action-651a-diagnostic-execution-quality-fixtures";

const root = resolve(__dirname, "../..");
const normativePaths = [
  "docs/action-651a-diagnostic-execution-quality-audit.md",
  "docs/action-651a-diagnostic-execution-quality-golden-report.json",
  "lib/action-651a-diagnostic-execution-quality-audit.ts",
  "tests/e2e/action-651a-diagnostic-execution-quality-audit.spec.ts",
  "tests/fixtures/action-651a-diagnostic-execution-quality-fixtures.ts",
] as const;

function sha256(path: string) {
  return createHash("sha256")
    .update(readFileSync(resolve(root, path)))
    .digest("hex");
}

function combinedNormativeDigest() {
  const lines = normativePaths
    .map((path) => `${sha256(path)}  ${path}`)
    .sort();
  return createHash("sha256")
    .update(`${lines.join("\n")}\n`)
    .digest("hex");
}

function withTerminalAt(
  input: Action651aDiagnosticAuditInput,
  observedAt: string,
): Action651aDiagnosticAuditInput {
  return {
    ...input,
    broker_events: input.broker_events
      .filter((event) => event.event_type === "terminal")
      .map((event) => ({ ...event, observed_at: observedAt })),
  };
}

function rebuiltAuditDigest(result: Action651aDiagnosticAuditResult) {
  const { audit_evidence_digest: _claimed, ...base } = result;
  void _claimed;
  return `action_651a_audit_${hashAction650sCanonicalValue(base)}`;
}

test("Action 651B rebuilds the frozen five-path digest and golden identity", () => {
  expect(combinedNormativeDigest()).toBe(
    "29ab1879041034f8ccaf9a49dd2272c5b05ff1f42c3941e0914503b37fc518f3",
  );
  const golden = JSON.parse(
    readFileSync(
      resolve(
        root,
        "docs/action-651a-diagnostic-execution-quality-golden-report.json",
      ),
      "utf8",
    ),
  ) as { matrix: { common_audit_evidence_digest: string } };
  expect(golden.matrix.common_audit_evidence_digest).toBe(
    "action_651a_audit_1edeb10da455650c79b1b1a37c19fea96103ae909c64e31ecd8ec679ce80c1ee",
  );
});

test("Action 651B independently rebuilds complete lineage and audit digests", () => {
  const scenario = buildAction651aFixtureScenario();
  const result = runAction651aDiagnosticExecutionQualityAudit(scenario.input);
  const lineage = result.lineage;
  if (!lineage) throw new Error("Expected lineage.");
  const { lineage_digest: _claimed, ...projection } = lineage;
  void _claimed;

  expect(lineage.lineage_digest).toBe(
    `action_651a_lineage_${hashAction650sCanonicalValue(projection)}`,
  );
  expect(result.audit_evidence_digest).toBe(rebuiltAuditDigest(result));
  expect(lineage).toMatchObject({
    execution_identity:
      scenario.prepared.runtime_identity_context.execution_identity,
    lifecycle_identity:
      scenario.prepared.runtime_identity_context.lifecycle_identity,
    runtime_identity_context_digest:
      scenario.prepared.runtime_identity_context_digest,
    handoff_identity: scenario.prepared.handoff.identity.handoff_identity,
    handoff_digest: scenario.prepared.handoff.identity.handoff_digest,
    canonical_order_payload_digest:
      scenario.prepared.handoff.identity.canonical_order_payload_digest,
    confirmation_request_digest:
      scenario.capability.confirmation_request_digest,
    confirmation_capability_digest: scenario.capability.capability_digest,
    session_identity: scenario.capability.session_identity,
    idempotency_identity:
      scenario.prepared.handoff.identity.idempotency_identity,
    correlation_identity:
      scenario.prepared.handoff.identity.correlation_identity,
  });
});

test("Action 651B verifies exact, negative, reversed, extreme and boundary instants", () => {
  const exact = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit(
      withTerminalAt(
        exact.input,
        "2026-07-29T10:00:02.000000000Z",
      ),
    ),
  ).toMatchObject({
    audit_status: "audited",
    timing_projection: {
      simulated_submission_to_simulated_terminal_nanoseconds: "0",
    },
  });

  const plusOne = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit(
      withTerminalAt(
        plusOne.input,
        "2026-07-29T10:00:02.000000001Z",
      ),
    ),
  ).toMatchObject({
    audit_status: "audited",
    timing_projection: {
      simulated_submission_to_simulated_terminal_nanoseconds: "1",
    },
  });

  const minusOne = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit(
      withTerminalAt(
        minusOne.input,
        "2026-07-29T10:00:01.999999999Z",
      ),
    ).audit_status,
  ).not.toBe("audited");

  const reversed = buildAction651aFixtureScenario("utc_a", {
    reverse_input_order: true,
  });
  expect(
    runAction651aDiagnosticExecutionQualityAudit(reversed.input).audit_status,
  ).toBe("audited");

  const extreme = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...extreme.input,
      consumed_at: "9999-12-31T23:59:59.999999999Z",
    }).audit_status,
  ).not.toBe("audited");
});

test("Action 651B preserves missed, late, expired and conflicting classifications", () => {
  const missed = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...missed.input,
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
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...conflicting.input,
      capability: { ...conflicting.capability },
    }),
  ).toMatchObject({
    audit_status: "conflicting",
    failure_provenance: { failure_kind: "confirmation_conflicting" },
  });
});

test("Action 651B verifies projection separation and integer micros scale", () => {
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
  });
  expect(result.synthetic_fill_projection).toMatchObject({
    source: "synthetic_replay_fixture",
    price_micros: "179100000",
    signed_slippage_vs_confirmed_micros: "-150000",
    adverse_slippage_vs_confirmed_micros: "150000",
  });
  expect(result.confirmed_price_projection?.price_micros).toMatch(/^[1-9]\d*$/);
  expect(result.synthetic_fill_projection?.price_micros).toMatch(/^[1-9]\d*$/);
  expect(result.safety).toMatchObject({
    diagnostic_only: true,
    real_broker_evidence: false,
    performance_eligible: false,
    automatic_execution_allowed: false,
  });
});

test("Action 651B independently rebuilds terminal identity and detects naive tampering", () => {
  const scenario = buildAction651aFixtureScenario();
  const result = runAction651aDiagnosticExecutionQualityAudit(scenario.input);
  const terminal = scenario.input.broker_events.find(
    (event) => event.event_type === "terminal",
  );
  if (!terminal) throw new Error("Expected terminal.");
  const canonicalTerminal = {
    ...terminal,
    observed_at: "2026-07-29T10:00:03.000000000Z",
  };
  expect(result.lineage?.terminal_digest).toBe(
    `action_651a_terminal_${hashAction650sCanonicalValue(canonicalTerminal)}`,
  );

  const tampered = {
    ...result,
    confirmed_price_projection: {
      ...result.confirmed_price_projection!,
      price_micros: "999999999",
    },
  } as Action651aDiagnosticAuditResult;
  expect(tampered.audit_evidence_digest).not.toBe(rebuiltAuditDigest(tampered));
});

test("Action 651B requires failure-provenance identity to bind execution lineage", () => {
  const first = buildAction651aFixtureScenario("utc_a", {
    execution_identity: "action-651b-failure-one",
  });
  const second = buildAction651aFixtureScenario("utc_a", {
    execution_identity: "action-651b-failure-two",
  });
  const firstResult = runAction651aDiagnosticExecutionQualityAudit({
    ...first.input,
    capability: null,
  });
  const secondResult = runAction651aDiagnosticExecutionQualityAudit({
    ...second.input,
    capability: null,
  });

  expect(firstResult.lineage?.lineage_digest).not.toBe(
    secondResult.lineage?.lineage_digest,
  );
  expect(firstResult.failure_provenance?.evidence_digest).not.toBe(
    secondResult.failure_provenance?.evidence_digest,
  );
});

test("Action 651B outputs remain frozen and capability proxies and cycles fail closed", () => {
  const frozen = buildAction651aFixtureScenario();
  const result = runAction651aDiagnosticExecutionQualityAudit(frozen.input);
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.lineage)).toBe(true);
  expect(Object.isFrozen(result.timing_projection)).toBe(true);
  expect(Object.isFrozen(result.synthetic_fill_projection)).toBe(true);

  const proxied = buildAction651aFixtureScenario();
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...proxied.input,
      capability: new Proxy(proxied.capability, {}),
    }).audit_status,
  ).toBe("conflicting");

  const cyclic = buildAction651aFixtureScenario();
  const cycle: Record<string, unknown> = {};
  cycle.self = cycle;
  expect(
    runAction651aDiagnosticExecutionQualityAudit({
      ...cyclic.input,
      confirmed_price: cycle as never,
    }).audit_status,
  ).toBe("unmappable");
});

test("Action 651B rejects accessor observations without executing accessors", () => {
  const scenario = buildAction651aFixtureScenario();
  let accessorReads = 0;
  const confirmedPrice = {
    source: "synthetic_manual_confirmation_fixture" as const,
    get price_micros() {
      accessorReads += 1;
      return "179250000";
    },
    observed_at: scenario.capability.confirmed_at,
  };
  const result = runAction651aDiagnosticExecutionQualityAudit({
    ...scenario.input,
    confirmed_price: confirmedPrice,
  });

  expect(accessorReads).toBe(0);
  expect(result.audit_status).toBe("unmappable");
});

test("Action 651B default-off and kill-switch paths perform only gate reads", () => {
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
          throw new Error(`Unexpected zero-work read: ${String(property)}`);
        }
        return Reflect.get(target, property, receiver);
      },
    }) as unknown as Action651aDiagnosticAuditInput;
    const result = runAction651aDiagnosticExecutionQualityAudit(input);
    expect(reads).toEqual(gate.expected);
    expect(result.audit_evidence_digest).toBeNull();
    expect(result.lineage).toBeNull();
  }
});

test("Action 651B finds no live, persistence, process or performance claim edge", () => {
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
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:avanza|supabase|playwright|puppeteer|browser|cdp)/i,
  );
  expect(source).not.toMatch(
    /from\s+["']node:(?:child_process|net|http|https)/,
  );

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
});
