import { expect, test } from "@playwright/test";
import { build } from "esbuild";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import { createClient } from "@supabase/supabase-js";

import {
  createActiveScanTrace,
  SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
  summarizeScanProviderCandidateObservations,
  type ScanProviderCandidateObservation,
} from "@/lib/active-scan-trace";
import { buildObservationCycleAdmission } from "@/lib/observation-cycle-admission-policy";
import { buildObservationCycleReceipt } from "@/lib/observation-cycle-receipt";
import {
  buildScannerProviderCreditAllocationLiveEvaluation,
} from "@/lib/scanner-provider-credit-allocation-live-evaluation";
import { SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT } from "@/lib/scanner-provider-credit-allocation-live-experiment";
import { buildScannerProviderCreditAllocationExecutionPlan } from "@/lib/scanner-provider-credit-allocation-plan";
import { buildScannerProviderCreditAllocationReconciliation } from "@/lib/scanner-provider-credit-allocation-reconciliation";
import { buildScannerProviderCreditAllocationRuntimeAdmission } from "@/lib/scanner-provider-credit-allocation-runtime-admission";
import { resolveScheduledScanProviderCreditBudget } from "@/lib/scheduled-scan-ticker-cap";
import { scheduledScanInvocationReceiptFromAttempt } from "@/lib/scheduled-scan-invocation-receipt";
import type { ScanLogEntry } from "@/lib/scan-log-core";

const contract =
  SCANNER_PROVIDER_CREDIT_ALLOCATION_LIVE_EXPERIMENT_CONTRACT;
const revision = "a".repeat(40);
const ownerUserId = "11111111-1111-4111-8111-111111111111";
const tickers = ["NVO", "SLB", "GS", "RDDT", "MU", "AMD", "PLTR", "NVDA"];

function secondsAfter(timestamp: string, seconds: number) {
  return new Date(Date.parse(timestamp) + seconds * 1000).toISOString();
}

function buildTerminalRecord(
  slot: (typeof contract.slots)[number],
  overrides: {
    revision?: string;
    expectedRevision?: string;
    fail?: boolean;
    providerErrors?: number;
    staleInputs?: number;
    diverged?: boolean;
  } = {},
) {
  const deployedRevision = overrides.revision ?? revision;
  const routeReceivedAt = secondsAfter(slot.slot_utc, 4);
  const admission = buildScannerProviderCreditAllocationRuntimeAdmission({
    enabled: true,
    experimentId: contract.experiment_id,
    scheduledInvocationBound: true,
    scheduledSlotUtc: slot.slot_utc,
    now: new Date(routeReceivedAt),
    expectedRevision: overrides.expectedRevision ?? revision,
    deployedRevision,
  });
  const demands = tickers.map((ticker, tickerIndex) => ({
    ticker,
    ticker_index: tickerIndex,
    daily_refresh_required: true,
    intraday_refresh_required: true,
  }));
  const plan = buildScannerProviderCreditAllocationExecutionPlan({
    policyVersion: admission.selected_policy_version,
    providerCreditCap: contract.scanner_provider_credit_cap,
    intradayProviderCreditCap: 3,
    candidateDemands: demands,
  });
  const reconciliation = buildScannerProviderCreditAllocationReconciliation({
    plan,
    actualAllocations: overrides.diverged ? [] : plan.allocations,
    admissionFingerprint: admission.admission_fingerprint,
  });
  const allocationKeys = new Set(
    plan.allocations.map(
      (allocation) =>
        `${allocation.ticker_index}:${allocation.ticker}:${allocation.data_class}`,
    ),
  );
  const observations: ScanProviderCandidateObservation[] = demands.map(
    (demand) => {
      const daily = allocationKeys.has(
        `${demand.ticker_index}:${demand.ticker}:daily`,
      );
      const intraday = allocationKeys.has(
        `${demand.ticker_index}:${demand.ticker}:intraday`,
      );
      return {
        observation_version: SCAN_PROVIDER_CANDIDATE_OBSERVATION_VERSION,
        ticker: demand.ticker,
        ticker_index: demand.ticker_index,
        status: daily ? "rankable" : "not_rankable",
        daily_data_source: daily ? "provider" : "unavailable",
        intraday_data_source: intraday ? "provider" : "unavailable",
        provider_credits_reserved: Number(daily) + Number(intraday),
        reason_codes: daily ? [] : ["daily_refresh_credit_cap_reached"],
      };
    },
  );
  const recorder = createActiveScanTrace({
    routeReceivedAt,
    scheduledFunctionFiredAtUtc: slot.slot_utc,
    scanWindow: "midday",
  });
  recorder.update({
    scheduled_gate_allowed: true,
    scheduled_gate_policy_version: "continuous_market_scan_admission_v1",
    market_status: "open",
    market_session: "regular",
  });
  recorder.updateMarketDataFetch({
    attempted_tickers: tickers.length,
    provider_calls_reserved_count: plan.allocations.length,
    daily_candle_provider_calls_reserved_count: plan.allocations.filter(
      (item) => item.data_class === "daily",
    ).length,
    intraday_indicator_provider_calls_reserved_count: plan.allocations.filter(
      (item) => item.data_class === "intraday",
    ).length,
    quote_success_count: plan.allocations.length,
    quote_error_count: overrides.providerErrors ?? 0,
    stale_count: overrides.staleInputs ?? 0,
    provider_credit_policy_version: "basic_free_scan_credit_guard_v1",
    candidate_observations: observations,
    candidate_observation_summary:
      summarizeScanProviderCandidateObservations(observations),
    provider_credit_allocation_runtime_admission: admission,
    provider_credit_allocation_execution_plan: plan,
    provider_credit_allocation_reconciliation: reconciliation,
  });
  recorder.updateRawCandidates({ raw_candidate_count: tickers.length });
  recorder.updateRanking({
    ranking_attempted: true,
    ranked_count: observations.filter((item) => item.status === "rankable").length,
    selected_count: 0,
  });
  recorder.updateFinal({
    recommendations_created: 0,
    recommendations_published_count: 0,
    no_publish_reason: "below_publish_threshold",
    scan_run_fingerprint: `scan_${slot.pair}_${slot.arm}`,
  });
  const observationAdmission = buildObservationCycleAdmission({
    now: new Date(routeReceivedAt),
    sessionVerifiedOpen: true,
    recentScanRuns: [],
    recentPreRunFailures: [],
    providerBudget: resolveScheduledScanProviderCreditBudget({ planMode: "free" }),
  });
  const scheduledInvocationReceipt = scheduledScanInvocationReceiptFromAttempt({
    source: "netlify_scheduled_function",
    mode: "scheduled",
    payload: {
      scheduled_slot_started_at_utc: slot.slot_utc,
      scheduled_slot_identity_source: "netlify_event_next_run",
      build_deployment_identity: {
        schema_version: "scheduled_scan_deployment_identity_v1",
        deploy_id: "a".repeat(24),
        deploy_context: "production",
        commit_ref: deployedRevision,
        site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
      },
    },
  });
  const record = buildObservationCycleReceipt({
    ownerUserId,
    attemptFingerprint: `attempt_${slot.pair}_${slot.arm}`,
    source: "netlify_scheduled_function",
    mode: "scheduled",
    outcome: overrides.fail ? "failed" : "scanned",
    allowed: true,
    routeReceivedAtUtc: routeReceivedAt,
    scheduledFunctionFiredAtUtc: slot.slot_utc,
    orchestrationDecision: "continuous_market_scan_admission_v1",
    skipReason: null,
    scanLog: overrides.fail
      ? null
      : ({
          created_at: secondsAfter(slot.slot_utc, 8),
          source: "scheduled",
          scan_window: "continuous",
          market_status: "open",
          result: "no_high_quality_setup",
          message: "fixture",
          recommendations_created: 0,
          publishable_threshold: 60,
        } as unknown as ScanLogEntry),
    activeScanTrace: recorder.trace,
    scanRunFingerprint: overrides.fail ? null : `scan_${slot.pair}_${slot.arm}`,
    scheduledInvocationReceipt,
    observationAdmission,
  });
  expect(record).not.toBeNull();
  return record!;
}

function buildTerminalReceipt(...args: Parameters<typeof buildTerminalRecord>) {
  return buildTerminalRecord(...args).receipt_json;
}

function buildScheduledAttemptRow(
  slot: (typeof contract.slots)[number],
  deployedRevision = revision,
) {
  return {
    attempt_fingerprint: `attempt_${slot.pair}_${slot.arm}`,
    utc_timestamp: secondsAfter(slot.slot_utc, 8),
    trading_date: contract.trading_date,
    intraday_scan_window: "midday",
    source: "netlify_scheduled_function",
    mode: "scheduled",
    payload_json: {
      scheduled_slot_started_at_utc: slot.slot_utc,
      scheduled_slot_identity_source: "netlify_event_next_run",
      build_deployment_identity: {
        schema_version: "scheduled_scan_deployment_identity_v1",
        deploy_id: "a".repeat(24),
        deploy_context: "production",
        commit_ref: deployedRevision,
        site_id: "2b582e03-ac97-4371-8051-558d9980fb94",
      },
      basic_free_scheduled_scan_credit_reservation: {
        guard_version: "basic_free_scheduled_scan_credit_guard_v1",
        contract_version: "basic_free_discovery_credit_reservation_v1",
        scope: "normal_scheduled_scan",
        status: "provider_execution_allowed",
        provider_execution_allowed: true,
        trading_date: contract.trading_date,
        minute_bucket: slot.slot_utc,
        requested_credits: contract.total_provider_credit_cap_per_attempt,
        declared_daily_credit_budget: 800,
        declared_per_minute_credit_budget:
          contract.total_provider_credit_cap_per_attempt,
        daily_reserved_credits:
          contract.total_provider_credit_cap_per_attempt,
        daily_remaining_credits:
          800 - contract.total_provider_credit_cap_per_attempt,
        minute_reserved_credits:
          contract.total_provider_credit_cap_per_attempt,
        minute_remaining_credits: 0,
        idempotent: false,
        finalization_status: "finalized",
        finalization_proven: true,
        safe_blocker: null,
      },
    },
  };
}

test("compares the complete switchback without authorizing live promotion", () => {
  const receipts = contract.slots.map((slot) => buildTerminalReceipt(slot));
  const evaluation = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts,
    scheduledAttemptRows: contract.slots.map((slot) =>
      buildScheduledAttemptRow(slot),
    ),
    expectedRevision: revision,
    evaluatedAt: new Date("2026-10-01T17:31:00.000Z"),
  });

  expect(evaluation.status).toBe("available");
  expect(evaluation.counts).toMatchObject({
    completed_slots: 6,
    invalid_slots: 0,
    total_provider_credits_reserved: 48,
  });
  expect(evaluation.arms.baseline).toMatchObject({
    completed_attempts: 3,
    rankable_candidates: 9,
    candidates_receiving_provider_credit: 9,
  });
  expect(evaluation.arms.challenger).toMatchObject({
    completed_attempts: 3,
    rankable_candidates: 18,
    candidates_receiving_provider_credit: 18,
  });
  expect(evaluation.paired_comparison).toMatchObject({
    completed_pairs: 3,
    signal: "challenger_better_on_all_primary_proxies",
    guardrails: { passed: true },
    recommendation_quality: "unproven",
    next_step: "evaluate_canonical_outcomes_before_any_promotion",
  });
  expect(evaluation.authority).toEqual({
    can_call_provider: false,
    can_reserve_provider_credit: false,
    can_change_live_allocation: false,
    can_change_ranking_or_publication: false,
    can_lower_threshold: false,
    can_publish_candidate: false,
    can_execute_broker_action: false,
  });
});

for (const deficit of ["providerErrors", "staleInputs"] as const) {
  test(`retains baseline when better coverage comes with more ${deficit}`, () => {
    const evaluation = buildScannerProviderCreditAllocationLiveEvaluation({
      receipts: contract.slots.map((slot) =>
        buildTerminalReceipt(slot, {
          [deficit]: slot.arm === "challenger" ? 1 : 0,
        }),
      ),
      scheduledAttemptRows: contract.slots.map((slot) =>
        buildScheduledAttemptRow(slot),
      ),
      expectedRevision: revision,
      evaluatedAt: new Date("2026-10-01T17:31:00.000Z"),
    });

    expect(evaluation.status).toBe("available");
    expect(evaluation.paired_comparison.rankable_candidate_fraction_delta)
      .toBeGreaterThan(0);
    expect(evaluation.paired_comparison).toMatchObject({
      signal: "guardrail_regression",
      guardrails: {
        passed: false,
        provider_error_delta: deficit === "providerErrors" ? 3 : 0,
        stale_input_delta: deficit === "staleInputs" ? 3 : 0,
      },
      recommendation_quality: "unproven",
      next_step: "retain_baseline",
    });
    expect(Object.values(evaluation.authority).every((value) => value === false))
      .toBe(true);
  });
}

test("retains missing slots as in-progress before expiry and inconclusive after", () => {
  const receipts = contract.slots.slice(0, 2).map((slot) =>
    buildTerminalReceipt(slot),
  );
  const active = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts,
    scheduledAttemptRows: contract.slots
      .slice(0, 2)
      .map((slot) => buildScheduledAttemptRow(slot)),
    expectedRevision: revision,
    evaluatedAt: new Date("2026-10-01T14:05:00.000Z"),
  });
  expect(active.status).toBe("in_progress");
  expect(active.counts).toMatchObject({ completed_slots: 2, missing_slots: 4 });
  expect(active.paired_comparison.signal).toBe("insufficient_evidence");
  expect(active.paired_comparison.next_step).toBe("complete_frozen_switchback");

  const expired = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts,
    scheduledAttemptRows: contract.slots
      .slice(0, 2)
      .map((slot) => buildScheduledAttemptRow(slot)),
    expectedRevision: revision,
    evaluatedAt: new Date("2026-10-01T17:31:00.000Z"),
  });
  expect(expired.status).toBe("inconclusive");
  expect(expired.paired_comparison.next_step).toBe(
    "review_incomplete_evidence_before_new_experiment",
  );
  expect(expired.reason_codes).toContain(
    "live_allocation_experiment_expired_incomplete",
  );
});

test("fails closed on invalid evidence but keeps an operational stop inconclusive", () => {
  const duplicate = buildTerminalReceipt(contract.slots[0]);
  expect(
    buildScannerProviderCreditAllocationLiveEvaluation({
      receipts: [duplicate, duplicate],
      scheduledAttemptRows: [buildScheduledAttemptRow(contract.slots[0])],
      expectedRevision: revision,
      evaluatedAt: new Date("2026-10-01T13:50:00.000Z"),
    }),
  ).toMatchObject({
    status: "fail",
    counts: { duplicate_slots: 1 },
  });

  const drifted = buildTerminalReceipt(contract.slots[0], {
    revision: "b".repeat(40),
  });
  expect(
    buildScannerProviderCreditAllocationLiveEvaluation({
      receipts: [drifted],
      scheduledAttemptRows: [
        buildScheduledAttemptRow(contract.slots[0], "b".repeat(40)),
      ],
      expectedRevision: revision,
      evaluatedAt: new Date("2026-10-01T13:50:00.000Z"),
    }).reason_codes,
  ).toContain("live_allocation_experiment_receipt_invalid");

  const failures = contract.slots.slice(0, 2).map((slot) =>
    buildTerminalReceipt(slot, { fail: true }),
  );
  const stopped = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts: failures,
    scheduledAttemptRows: contract.slots
      .slice(0, 2)
      .map((slot) => buildScheduledAttemptRow(slot)),
    expectedRevision: revision,
    evaluatedAt: new Date("2026-10-01T14:05:00.000Z"),
  });
  expect(stopped.status).toBe("inconclusive");
  expect(stopped.counts).toMatchObject({
    maximum_consecutive_operational_failures: 2,
    scanner_credits_reserved: 12,
    total_provider_credits_reserved: 16,
  });
  expect(stopped.reason_codes).toContain(
    "live_allocation_experiment_consecutive_failure_stop",
  );
  expect(stopped.reason_codes).not.toContain("live_allocation_experiment_expired_incomplete");
  expect(stopped.paired_comparison).toMatchObject({
    signal: "insufficient_evidence",
    recommendation_quality: "unproven",
    next_step: "review_incomplete_evidence_before_new_experiment",
  });
  expect(Object.values(stopped.authority).every(value => value === false)).toBe(true);
});

test("preserves a failed allocation-integrity result even before the operational stop", () => {
  const slot = contract.slots[0];
  const receipt = buildTerminalReceipt(slot, { fail: true, diverged: true });
  const evaluation = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts: [receipt],
    scheduledAttemptRows: [buildScheduledAttemptRow(slot)],
    expectedRevision: revision,
    evaluatedAt: new Date(secondsAfter(slot.slot_utc, 60)),
  });
  expect(evaluation.counts.invalid_receipts).toBe(0);
  expect(evaluation.status).toBe("fail");
  expect(evaluation.reason_codes).toContain("live_allocation_experiment_allocation_integrity_breach");
  expect(evaluation.paired_comparison.next_step).toBe("repair_or_reject_experiment_evidence");
});

test("keeps incomplete scientific evidence separate from integrity failure at the stop", () => {
  const first = contract.slots[0];
  const single = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts: [buildTerminalReceipt(first, { fail: true })],
    scheduledAttemptRows: [buildScheduledAttemptRow(first)],
    expectedRevision: revision,
    evaluatedAt: new Date(secondsAfter(first.slot_utc, 60)),
  });
  expect(single.status).toBe("in_progress");
  expect(single.counts.maximum_consecutive_operational_failures).toBe(1);

  const slots = contract.slots.slice(0, 3);
  const stopped = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts: slots.map((slot, index) => buildTerminalReceipt(slot, { fail: index < 2 })),
    scheduledAttemptRows: slots.map(slot => buildScheduledAttemptRow(slot)),
    expectedRevision: revision,
    evaluatedAt: new Date(secondsAfter(slots[2].slot_utc, 60)),
  });
  expect(stopped.status).toBe("inconclusive");
  expect(stopped.counts).toMatchObject({ completed_slots: 1, failed_slots: 2, missing_slots: 3 });
  expect(stopped.paired_comparison.signal).toBe("insufficient_evidence");

  const invalid = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts: contract.slots.slice(0, 2).map((slot, index) => buildTerminalReceipt(slot, { fail: true, diverged: index === 1 })),
    scheduledAttemptRows: contract.slots.slice(0, 2).map(slot => buildScheduledAttemptRow(slot)),
    expectedRevision: revision,
    evaluatedAt: new Date(secondsAfter(contract.slots[1].slot_utc, 60)),
  });
  expect(invalid.status).toBe("fail");
  expect(invalid.reason_codes).toContain("live_allocation_experiment_allocation_integrity_breach");
});

test("counts orphan reservations and detects their budget or revision breaches", () => {
  const row = buildScheduledAttemptRow(contract.slots[0]);
  const evaluate = (attempt: unknown) =>
    buildScannerProviderCreditAllocationLiveEvaluation({
      receipts: [],
      scheduledAttemptRows: [attempt],
      expectedRevision: revision,
      evaluatedAt: new Date("2026-10-01T17:31:00.000Z"),
    });
  expect(evaluate(row)).toMatchObject({
    status: "inconclusive",
    counts: { missing_slots: 6, total_provider_credits_reserved: 8 },
  });
  const overBudget = {
    ...row,
    payload_json: {
      ...row.payload_json,
      basic_free_scheduled_scan_credit_reservation: {
        ...row.payload_json.basic_free_scheduled_scan_credit_reservation,
        requested_credits: 9,
      },
    },
  };
  expect(evaluate(overBudget)).toMatchObject({ status: "fail" });
  expect(evaluate(buildScheduledAttemptRow(contract.slots[0], "b".repeat(40))))
    .toMatchObject({ status: "fail" });
});

test("rejects undeclared or tampered evidence and never treats it as quality proof", () => {
  const validReceipt = buildTerminalReceipt(contract.slots[0]);
  const missingCreditEvidence =
    buildScannerProviderCreditAllocationLiveEvaluation({
      receipts: [validReceipt],
      scheduledAttemptRows: [],
      expectedRevision: revision,
      evaluatedAt: new Date("2026-10-01T13:50:00.000Z"),
    });
  expect(missingCreditEvidence.status).toBe("fail");
  expect(missingCreditEvidence.reason_codes).toContain(
    "live_allocation_experiment_slot_evidence_invalid",
  );
  expect(missingCreditEvidence.slots[0].reason_codes).toContain(
    "live_allocation_experiment_credit_evidence_invalid",
  );

  const receipt = structuredClone(
    validReceipt,
  ) as unknown as {
    trigger: { scheduled_slot_started_at_utc: string | null };
  };
  receipt.trigger.scheduled_slot_started_at_utc = "2026-10-01T14:15:00.000Z";
  const evaluation = buildScannerProviderCreditAllocationLiveEvaluation({
    receipts: [receipt],
    scheduledAttemptRows: [buildScheduledAttemptRow(contract.slots[0])],
    expectedRevision: revision,
    evaluatedAt: new Date("2026-10-01T14:16:00.000Z"),
  });
  expect(evaluation.status).toBe("fail");
  expect(evaluation.reason_codes).toContain(
    "live_allocation_experiment_undeclared_slot_receipt",
  );
  expect(evaluation.paired_comparison.recommendation_quality).toBe("unproven");
});

test("authenticated readback joins database evidence and rejects incomplete or foreign rows", async () => {
  const observedRevision = "40d671b93a6ca9aa6acf2a40c6949a10663d7d2f";
  const requests: URL[] = [];
  let mode: "complete" | "truncated" | "foreign" | "error" = "complete";
  const client = createClient("https://fixture.invalid", "synthetic-test-key", {
    auth: { persistSession: false, autoRefreshToken: false },
    global: {
      fetch: async (input, init) => {
        expect(init?.method ?? "GET").toBe("GET");
        const url = new URL(String(input));
        requests.push(url);
        const cycles = url.pathname.endsWith("/observation_cycle_receipts");
        expect(url.searchParams.get("limit")).toBe("100");
        const timeColumn = cycles ? "scheduled_slot_at" : "scheduled_function_fired_at";
        expect(url.searchParams.getAll(timeColumn)).toEqual([
          `gte.${contract.slots[0].slot_utc}`, `lt.${contract.expires_at_utc}`,
        ]);
        if (cycles) expect(url.searchParams.get("owner_user_id")).toBe(`eq.${ownerUserId}`);
        if (mode === "error") return new Response('{"message":"fixture failure"}', { status: 400 });
        const rows = contract.slots.map((slot) => cycles
          ? buildTerminalRecord(slot, { revision: observedRevision, expectedRevision: observedRevision })
          : buildScheduledAttemptRow(slot, observedRevision));
        if (cycles && mode === "foreign") {
          Object.assign(rows[0], { owner_user_id: "22222222-2222-4222-8222-222222222222" });
        }
        return new Response(JSON.stringify(rows), {
          headers: { "Content-Type": "application/json", "Content-Range": `0-5/${mode === "truncated" ? 7 : 6}` },
        });
      },
    },
  });
  const fixture = { client, authenticated: false, ownerUserId };
  const bundle = await build({
    entryPoints: [resolve("app/api/app/provider-credit-allocation-live-evaluation/route.ts")],
    bundle: true, platform: "node", format: "cjs", write: false,
    external: ["next/server"],
    plugins: [{ name: "readback-boundaries", setup(builder) {
      builder.onResolve({ filter: /^(server-only|@\/lib\/supabase-server|@\/lib\/server\/application-session)$/ },
        ({ path }) => ({ path, namespace: "fixture" }));
      builder.onLoad({ filter: /.*/, namespace: "fixture" }, ({ path }) => ({
        contents: path === "server-only" ? "" : path.endsWith("supabase-server")
          ? "export const getServerSupabaseClient = () => ({client: fixture.client});"
          : "export const requireApplicationSession = async () => fixture.authenticated ? {owner_user_id: fixture.ownerUserId} : null; export const applicationSessionUnauthorizedResponse = () => Response.json({error:'unauthenticated'}, {status:401});",
        loader: "js",
      }));
    } }],
  });
  const loadedModule = { exports: {} as { GET: () => Promise<Response> } };
  new Function("require", "module", "exports", "fixture", bundle.outputFiles[0].text)(
    createRequire(resolve("package.json")), loadedModule, loadedModule.exports, fixture,
  );
  expect((await loadedModule.exports.GET()).status).toBe(401);
  expect(requests).toHaveLength(0);
  fixture.authenticated = true;
  const response = await loadedModule.exports.GET();
  expect(response.status, await response.clone().text()).toBe(200);
  expect(response.headers.get("cache-control")).toBe("no-store");
  expect(await response.json()).toMatchObject({ status: "available", evaluation: {
    status: "available", expected_revision: observedRevision,
    counts: { completed_slots: 6, total_provider_credits_reserved: 48 },
  } });
  for (mode of ["truncated", "foreign", "error"] as const) {
    const rejected = await loadedModule.exports.GET();
    expect(rejected.status).toBe(503);
    expect(await rejected.json()).toMatchObject({ status: "unavailable", evaluation: null });
  }
});
