import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";

import { createAction650sRuntimeIdentityContext } from "../../lib/action-650s-execution-identity";
import { prepareAction650sExecution } from "../../lib/action-650s-execution-preparation";
import {
  canAction652aProceedToManualConfirmation,
  rebuildAction652aAdmissionTerminalDigest,
  runAction652aExecutionIntentAdmission,
  type Action652aAdmissionRequest,
  type Action652aAdmissionResult,
  type Action652aExecutionIntent,
} from "../../lib/action-652a-execution-risk-envelope-admission";
import { runAction651cExecutionQualityAuditV2 } from "../../lib/action-651c-execution-quality-audit-v2";
import {
  action652aGoldenMatrixCases,
  buildAction652aFixtureScenario,
} from "../fixtures/action-652a-execution-risk-envelope-admission-fixtures";
import goldenReport from "../../docs/action-652a-execution-risk-envelope-admission-golden-report.json";

const enabled = { enabled: true, kill_switch_active: false } as const;

function run(
  request: unknown = buildAction652aFixtureScenario().request,
): Action652aAdmissionResult {
  return runAction652aExecutionIntentAdmission(enabled, request);
}

function withIntent(
  request: Action652aAdmissionRequest,
  patch: Partial<Action652aExecutionIntent>,
) {
  return {
    ...request,
    intent: {
      ...request.intent,
      ...patch,
    },
  };
}

test("default-off and kill-switch return before request access or digest work", () => {
  let reads = 0;
  const hostile = new Proxy(
    {},
    {
      get() {
        reads += 1;
        throw new Error("request must not be read");
      },
      ownKeys() {
        reads += 1;
        throw new Error("request must not be cloned");
      },
    },
  );

  const disabled = runAction652aExecutionIntentAdmission(
    { enabled: false, kill_switch_active: false },
    hostile,
  );
  const killed = runAction652aExecutionIntentAdmission(
    { enabled: true, kill_switch_active: true },
    hostile,
  );

  expect(reads).toBe(0);
  for (const result of [disabled, killed]) {
    expect(result.terminal_digest).toBeNull();
    expect(result.effects).toEqual({
      request_reads: 0,
      authority_reads: 0,
      digest_operations: 0,
      broker_requests: 0,
      provider_calls: 0,
      credential_reads: 0,
      database_reads: 0,
      database_writes: 0,
      process_spawns: 0,
      trade_mutations: 0,
    });
  }
});

test("admits an exact synthetic intent and binds all external authority identities", () => {
  const result = run();

  expect(result.admission_status).toBe("admitted");
  expect(result.admission_reason).toBe("risk_envelope_satisfied");
  expect(result.lineage).toMatchObject({
    execution_identity: "action-651a-execution",
    session_identity: "action-651a-confirmation-session",
  });
  expect(result.intent_projection).toMatchObject({
    instrument: "AAPL",
    side: "SELL",
    quantity: { value: "5", scale: 0, unit: "units" },
    limit_price: {
      value: "179000000",
      scale: 6,
      unit: "SEK_micros_per_unit",
    },
    notional: { value: "895000000", scale: 6, unit: "SEK_micros" },
  });
  expect(result.risk_authority_projection).toMatchObject({
    policy_identity: "action-652a-policy-stockholm-read-only",
    snapshot_identity: "action-652a-snapshot-finalized-read-only",
    market_authority_identity: "action-652a-market-session-authority",
    calendar_identity: "action-652a-synthetic-calendar",
  });
  expect(result.manual_confirmation_admission).not.toBe(false);
  expect(canAction652aProceedToManualConfirmation(result)).toBe(true);
  const { terminal_digest: terminalDigest, ...withoutTerminal } = result;
  expect(terminalDigest).toBe(
    rebuildAction652aAdmissionTerminalDigest(withoutTerminal),
  );
  expect(Object.isFrozen(result)).toBe(true);
});

test("enforces exact quantity, notional, and price-deviation envelope boundaries", () => {
  const quantityBoundary = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: { maximum_quantity_units: "5" },
    }).request,
  );
  const quantityPlusOne = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: { maximum_quantity_units: "4" },
    }).request,
  );
  const notionalBoundary = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: { maximum_notional_micros: "895000000" },
    }).request,
  );
  const notionalPlusOne = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: { maximum_notional_micros: "894999999" },
    }).request,
  );
  const exactPrice = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: {
        reference_price_micros: "179000000",
        maximum_price_deviation_ppm: "0",
      },
    }).request,
  );
  const oneMicroOutside = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: {
        reference_price_micros: "179000001",
        maximum_price_deviation_ppm: "0",
      },
    }).request,
  );

  expect(quantityBoundary.admission_status).toBe("admitted");
  expect(quantityPlusOne.admission_reason).toBe("quantity_limit_exceeded");
  expect(notionalBoundary.admission_status).toBe("admitted");
  expect(notionalPlusOne.admission_reason).toBe("notional_limit_exceeded");
  expect(exactPrice.admission_status).toBe("admitted");
  expect(oneMicroOutside.admission_reason).toBe(
    "price_deviation_limit_exceeded",
  );
});

test("enforces daily, cash, exposure, and open-intent snapshot boundaries", () => {
  const cases = [
    {
      options: {
        policy: { maximum_daily_orders: "2" },
      },
      reason: "daily_order_limit_exceeded",
    },
    {
      options: {
        policy: { maximum_daily_notional_micros: "1894999999" },
      },
      reason: "daily_notional_limit_exceeded",
    },
    {
      options: {
        policy: { maximum_exposure_micros: "1894999999" },
      },
      reason: "exposure_limit_exceeded",
    },
    {
      options: {
        policy: { maximum_open_intents: "1" },
      },
      reason: "open_intent_limit_exceeded",
    },
    {
      options: {
        policy: { maximum_open_intent_notional_micros: "994999999" },
      },
      reason: "open_intent_limit_exceeded",
    },
  ] as const;

  for (const entry of cases) {
    const result = run(
      buildAction652aFixtureScenario("utc_a", entry.options).request,
    );
    expect(result.admission_status).toBe("rejected");
    expect(result.admission_reason).toBe(entry.reason);
  }

  const runtime = createAction650sRuntimeIdentityContext({
    execution_identity: "action-652a-buy-execution",
    runtime_instance_identity: "action-652a-buy-runtime",
    runtime_session_identity: "action-652a-buy-runtime-session",
    created_at: "2026-07-29T09:55:00.000000000Z",
  });
  if (!runtime) throw new Error("BUY fixture runtime creation failed.");
  const buyPrepared = prepareAction650sExecution({
    runtime,
    observed_at: "2026-07-29T10:00:00.000000000Z",
    candidates: [
      {
        candidate_identity: "action-652a-buy-candidate",
        trigger: "recommendation_entry",
        ticker: "AAPL",
        side: "BUY",
        quantity: 5,
        order_type: "LIMIT",
        limit_price: 179,
        stop_price: null,
        created_at: "2026-07-29T09:50:00.000000000Z",
        expires_at: "2026-07-29T10:01:00.000000000Z",
      },
    ],
  });
  if (buyPrepared.current_state !== "waiting_for_manual_confirmation") {
    throw new Error("BUY fixture preparation failed.");
  }
  const buyScenario = buildAction652aFixtureScenario("utc_a", {
    policy: { maximum_cash_use_micros: "894999999" },
  });
  const cashRejected = run({
    ...buyScenario.request,
    prepared: buyPrepared,
    intent: {
      ...buyScenario.request.intent,
      execution_identity: buyPrepared.runtime_identity_context.execution_identity,
      preparation_trace_identity: buyPrepared.trace_identity,
      handoff_identity: buyPrepared.handoff.identity.handoff_identity,
      side: "BUY",
    },
  });
  expect(cashRejected.admission_reason).toBe("cash_limit_exceeded");
});

test("uses strict nanosecond policy, intent, session, and finalized-snapshot boundaries", () => {
  const beforeIntentExpiry = run(
    buildAction652aFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:00.999999999Z",
      policy: { maximum_snapshot_age_nanoseconds: "1499999999" },
    }).request,
  );
  const atIntentExpiry = run(
    buildAction652aFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:01.000000000Z",
      policy: { maximum_snapshot_age_nanoseconds: "1500000000" },
    }).request,
  );
  const afterIntentExpiry = run(
    buildAction652aFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:01.000000001Z",
      policy: { maximum_snapshot_age_nanoseconds: "1500000001" },
    }).request,
  );
  const snapshotAgeBoundary = run();
  const snapshotAgePlusOne = run(
    buildAction652aFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:00.000000001Z",
    }).request,
  );
  const sessionOpenBoundary = run(
    buildAction652aFixtureScenario("utc_a", {
      market_authority: {
        session_open_at: "2026-07-29T10:00:00.000000000Z",
      },
    }).request,
  );
  const beforeSessionOpen = run(
    buildAction652aFixtureScenario("utc_a", {
      market_authority: {
        session_open_at: "2026-07-29T10:00:00.000000001Z",
      },
    }).request,
  );
  const unfinalized = run(
    buildAction652aFixtureScenario("utc_a", {
      snapshot: { finalized: false },
    }).request,
  );
  const policyExpiryMinusOne = run(
    buildAction652aFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:00.999999999Z",
      policy: {
        expires_at: "2026-07-29T10:00:01.000000000Z",
        maximum_snapshot_age_nanoseconds: "1499999999",
      },
    }).request,
  );
  const policyExpiryExact = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: { expires_at: "2026-07-29T10:00:00.000000000Z" },
    }).request,
  );
  const policyExpiryPlusOne = run(
    buildAction652aFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:00.000000001Z",
      policy: {
        expires_at: "2026-07-29T10:00:00.000000000Z",
        maximum_snapshot_age_nanoseconds: "500000001",
      },
    }).request,
  );
  const snapshotExpiryMinusOne = run(
    buildAction652aFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:00.999999999Z",
      policy: { maximum_snapshot_age_nanoseconds: "1499999999" },
      snapshot: { expires_at: "2026-07-29T10:00:01.000000000Z" },
    }).request,
  );
  const snapshotExpiryExact = run(
    buildAction652aFixtureScenario("utc_a", {
      snapshot: { expires_at: "2026-07-29T10:00:00.000000000Z" },
    }).request,
  );
  const snapshotExpiryPlusOne = run(
    buildAction652aFixtureScenario("utc_a", {
      admission_at: "2026-07-29T10:00:00.000000001Z",
      policy: { maximum_snapshot_age_nanoseconds: "500000001" },
      snapshot: { expires_at: "2026-07-29T10:00:00.000000000Z" },
    }).request,
  );
  const finalizedAtAdmission = run(
    buildAction652aFixtureScenario("utc_a", {
      snapshot: { finalized_at: "2026-07-29T10:00:00.000000000Z" },
    }).request,
  );
  const finalizedAfterAdmission = run(
    buildAction652aFixtureScenario("utc_a", {
      snapshot: { finalized_at: "2026-07-29T10:00:00.000000001Z" },
    }).request,
  );

  expect(beforeIntentExpiry.admission_status).toBe("admitted");
  expect(atIntentExpiry.admission_reason).toBe("intent_expired");
  expect(afterIntentExpiry.admission_reason).toBe("intent_expired");
  expect(snapshotAgeBoundary.admission_status).toBe("admitted");
  expect(snapshotAgePlusOne.admission_reason).toBe("snapshot_too_old");
  expect(sessionOpenBoundary.admission_status).toBe("admitted");
  expect(beforeSessionOpen.admission_reason).toBe("market_session_closed");
  expect(unfinalized.admission_reason).toBe("snapshot_not_finalized");
  expect(unfinalized.admission_status).toBe("not_point_in_time_safe");
  expect(policyExpiryMinusOne.admission_status).toBe("admitted");
  expect(policyExpiryExact.admission_reason).toBe("risk_policy_expired");
  expect(policyExpiryPlusOne.admission_reason).toBe("risk_policy_expired");
  expect(snapshotExpiryMinusOne.admission_status).toBe("admitted");
  expect(snapshotExpiryExact.admission_reason).toBe("snapshot_expired");
  expect(snapshotExpiryPlusOne.admission_reason).toBe("snapshot_expired");
  expect(finalizedAtAdmission.admission_status).toBe("admitted");
  expect(finalizedAfterAdmission.admission_reason).toBe("snapshot_from_future");
});

test("rejects negative, overflow, scale, unit, and recomputed-notional conflicts", () => {
  const scenario = buildAction652aFixtureScenario();
  const negative = run(
    withIntent(scenario.request, {
      quantity: { value: "-1", scale: 0, unit: "units" },
    }),
  );
  const overflow = run(
    withIntent(scenario.request, {
      quantity: {
        value: "170141183460469231731687303715884105728",
        scale: 0,
        unit: "units",
      },
    }),
  );
  const scale = run(
    withIntent(scenario.request, {
      limit_price: {
        value: "179000000",
        scale: 5,
        unit: "SEK_micros_per_unit",
      },
    }),
  );
  const unit = run(
    withIntent(scenario.request, {
      notional: { value: "895000000", scale: 6, unit: "USD_micros" },
    }),
  );
  const recomputed = run(
    withIntent(scenario.request, {
      notional: { value: "895000001", scale: 6, unit: "SEK_micros" },
    }),
  );

  expect(negative.admission_reason).toBe("numeric_value_invalid");
  expect(overflow.admission_reason).toBe("numeric_overflow");
  expect(scale.admission_reason).toBe("intent_scale_or_unit_conflicting");
  expect(unit.admission_reason).toBe("intent_scale_or_unit_conflicting");
  expect(recomputed.admission_reason).toBe("intent_notional_conflicting");
});

test("rejects caller authority injection, cloned handles, lineage substitution, and symbols", () => {
  const scenario = buildAction652aFixtureScenario();
  const injected = run({
    ...scenario.request,
    maximum_quantity_units: "999999",
  });
  const clonedAuthority = run({
    ...scenario.request,
    external_risk_authority: structuredClone(scenario.authority),
  });
  const substituted = run(
    withIntent(scenario.request, {
      execution_identity: "substituted-execution",
    }),
  );
  const symbol = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: { symbol_allowlist: ["MSFT"] },
    }).request,
  );

  expect(injected.admission_reason).toBe("admission_input_shape_conflicting");
  expect(clonedAuthority.admission_reason).toBe(
    "risk_authority_provenance_unproven",
  );
  expect(substituted.admission_reason).toBe("execution_lineage_conflicting");
  expect(symbol.admission_reason).toBe("instrument_not_allowed");
});

test("rejects accessors without execution plus proxies, cycles, and snapshot budget excess", () => {
  const scenario = buildAction652aFixtureScenario();
  let getterReads = 0;
  const accessorRequest = {
    ...scenario.request,
    get intent() {
      getterReads += 1;
      return scenario.request.intent;
    },
  };
  const proxyRequest = new Proxy(scenario.request, {});
  const cyclic = { ...scenario.request } as Record<string, unknown>;
  cyclic.cycle = cyclic;
  const extreme = {
    ...scenario.request,
    intent: {
      ...scenario.request.intent,
      instrument: "A".repeat(100_000),
    },
  };

  for (const hostile of [accessorRequest, proxyRequest, cyclic, extreme]) {
    const result = run(hostile);
    expect(result.admission_status).toBe("incomplete");
    expect(result.admission_reason).toBe("input_snapshot_rejected");
    expect(result.failure_provenance?.failure_digest).toMatch(
      /^action_652a_admission_failure_/,
    );
  }
  expect(getterReads).toBe(0);
});

test("binds distinct failure provenance and rejects post-verification mutation or clones", () => {
  const first = run(
    buildAction652aFixtureScenario("utc_a", {
      execution_identity: "action-652a-lineage-a",
      policy: { maximum_quantity_units: "4" },
    }).request,
  );
  const second = run(
    buildAction652aFixtureScenario("utc_a", {
      execution_identity: "action-652a-lineage-b",
      policy: { maximum_quantity_units: "4" },
    }).request,
  );
  expect(first.admission_reason).toBe("quantity_limit_exceeded");
  expect(second.admission_reason).toBe("quantity_limit_exceeded");
  expect(first.failure_provenance?.failure_digest).not.toBe(
    second.failure_provenance?.failure_digest,
  );
  expect(first.observed_input_digests.preparation_digest).not.toBe(
    second.observed_input_digests.preparation_digest,
  );

  const mutableScenario = buildAction652aFixtureScenario();
  const admitted = run(mutableScenario.request);
  (
    mutableScenario.request.intent as {
      instrument: string;
    }
  ).instrument = "MSFT";
  expect(admitted.intent_projection?.instrument).toBe("AAPL");
  const cloned = structuredClone(admitted);
  expect(canAction652aProceedToManualConfirmation(cloned)).toBe(false);
  expect(() => {
    (admitted.intent_projection as { instrument: string }).instrument = "MSFT";
  }).toThrow();
  expect(canAction652aProceedToManualConfirmation(admitted)).toBe(true);
});

test("is deterministic across UTC forms, Stockholm, New York, and reversed allowlist order", () => {
  const results = action652aGoldenMatrixCases.map((entry) =>
    run(
      buildAction652aFixtureScenario(entry.clock, {
        reverse_allowlist: entry.reverse_allowlist,
      }).request,
    ),
  );
  expect(results.map((result) => result.admission_status)).toEqual(
    Array(5).fill("admitted"),
  );
  expect(new Set(results.map((result) => result.terminal_digest)).size).toBe(1);
  expect(
    new Set(
      results.map(
        (result) =>
          result.manual_confirmation_admission &&
          result.manual_confirmation_admission.admission_digest,
      ),
    ).size,
  ).toBe(1);
  expect(results[0].terminal_digest).toBe(goldenReport.admission_terminal_digest);
});

test("gates full admitted → manual confirmation → synthetic replay → 651C audit interop", () => {
  const scenario = buildAction652aFixtureScenario();
  const admission = run(scenario.request);
  expect(canAction652aProceedToManualConfirmation(admission)).toBe(true);

  const audit = runAction651cExecutionQualityAuditV2(
    scenario.predecessor.input,
  );
  expect(audit.audit_status).toBe("audited");
  expect(audit.audit_evidence_digest).toBe(
    goldenReport.action_651c_audit_evidence_digest,
  );

  const rejected = run(
    buildAction652aFixtureScenario("utc_a", {
      policy: { maximum_quantity_units: "4" },
    }).request,
  );
  expect(canAction652aProceedToManualConfirmation(rejected)).toBe(false);
});

test("keeps broker, live, authority, process, persistence, and performance surfaces absent", () => {
  const source = readFileSync(
    "lib/action-652a-execution-risk-envelope-admission.ts",
    "utf8",
  );
  expect(source).not.toMatch(
    /from\s+["'][^"']*(?:avanza|browser|playwright|puppeteer|supabase|database|broker|child_process)[^"']*["']/i,
  );
  expect(source).not.toMatch(/\b(?:fetch|spawn|exec|fork|insert|update|upsert)\s*\(/);
  expect(source).not.toMatch(/performance[_ -]?(?:eligible|claim)|real[_ -]?fill/i);

  const result = run();
  expect(result.safety).toEqual({
    diagnostic_only: true,
    synthetic_only: true,
    real_broker_submission: false,
    avanza_live_access: false,
    credential_access: false,
    browser_or_cdp_access: false,
    automatic_execution: false,
    trade_mutation: false,
    production_write: false,
  });
  expect(result.effects).toMatchObject({
    broker_requests: 0,
    provider_calls: 0,
    credential_reads: 0,
    database_reads: 0,
    database_writes: 0,
    process_spawns: 0,
    trade_mutations: 0,
  });
});
