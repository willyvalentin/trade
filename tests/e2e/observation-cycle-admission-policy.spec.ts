import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import {
  buildObservationCycleAdmission,
  observationCycleAdmissionFromUnknown,
} from "../../lib/observation-cycle-admission-policy";
import type { RecommendationScanRun } from "../../lib/recommendation-scan-run";
import { resolveScheduledScanProviderCreditBudget } from "../../lib/scheduled-scan-ticker-cap";

const boundedBudget = resolveScheduledScanProviderCreditBudget({
  planMode: "free",
});

function run(input: {
  observedAt: string;
  status?: RecommendationScanRun["status"];
  rawCandidateCount?: number | null;
  visibleCount?: number;
  strongCount?: number;
  needsReviewCount?: number;
  staleCount?: number | null;
  incompleteCount?: number | null;
  expectedCount?: number;
  observedCount?: number;
  fullMembership?: boolean;
  ticker?: string;
  score?: number;
}): RecommendationScanRun {
  const ticker = input.ticker ?? "TEST";
  const expectedCount = input.expectedCount ?? 8;
  const observedCount = input.observedCount ?? expectedCount;
  const status = input.status ?? "empty";
  return {
    id: `run-${input.observedAt}`,
    run_fingerprint: `scan-run-${input.observedAt}`,
    trading_date: "2026-09-28",
    window: "midday",
    status,
    source: "supabase",
    observed_at: input.observedAt,
    started_at: input.observedAt,
    completed_at: input.observedAt,
    market_session_phase: "regular",
    market_session_risk: null,
    market_session_source: "polygon",
    data_mode: "live",
    scan_observability_status: "healthy",
    counts: {
      visible_recommendation_count: input.visibleCount ?? 0,
      accepted_count: 0,
      needs_review_count: input.needsReviewCount ?? 0,
      rejected_count: 0,
      incomplete_count: 0,
      strong_count: input.strongCount ?? 0,
      valid_count: 0,
      experimental_count: 0,
      rejected_tier_count: 0,
      incomplete_tier_count: 0,
      unknown_tier_count: 0,
    },
    window_target_status: "no_recommendations",
    gap_to_target: null,
    overflow_above_target: null,
    tickers_represented: [],
    ticker_count: 0,
    duplicate_ticker_count: 0,
    stale_candidate_count: input.staleCount ?? 0,
    incomplete_data_candidate_count: input.incompleteCount ?? 0,
    scanned_ticker_count: expectedCount,
    raw_candidate_count: input.rawCandidateCount ?? 3,
    scan_duration_ms: 1_000,
    top_intake_reasons: [],
    warnings: [],
    provider_statuses: [
      {
        source_id: "twelve_data",
        label: "Twelve Data",
        status: status === "failed" ? "unavailable" : "available",
        message: "fixture",
      },
    ],
    unknown_metrics: [],
    payload_json: {
      candidate_decision_record: {
        record_kind: "candidate_decision_record",
        coverage: {
          expected_candidate_count: expectedCount,
          observed_candidate_count: observedCount,
          full_membership_captured: input.fullMembership ?? true,
        },
        candidates: Array.from({ length: expectedCount }, (_, index) => ({
          ticker: index === 0 ? ticker : `T${index}`,
          disposition: "ranked_not_selected",
          ranking: { rank: index + 1, score: input.score ?? 60 },
        })),
        final_decision: {
          disposition: "no_trade",
        },
      },
    },
    created_at: input.observedAt,
    updated_at: input.observedAt,
  };
}

function admission(input: {
  now: string;
  runs?: RecommendationScanRun[];
  sessionVerifiedOpen?: boolean;
  budget?: typeof boundedBudget | null;
}) {
  return buildObservationCycleAdmission({
    now: new Date(input.now),
    sessionVerifiedOpen: input.sessionVerifiedOpen ?? true,
    recentScanRuns: input.runs ?? [],
    providerBudget:
      input.budget === undefined ? boundedBudget : input.budget,
  });
}

test("admits a first bounded observation while retaining an inert authority receipt", () => {
  const result = admission({ now: "2026-09-28T14:00:00.000Z" });
  expect(result).toMatchObject({
    policy_version: "observation_cycle_admission_v1",
    decision: "request_current_data",
    request_current_data: true,
    next_eligible_at: null,
    reason_codes: [
      "initial_observation_required",
      "atomic_provider_credit_reservation_required",
      "prior_freshness_unknown",
      "prior_coverage_unknown",
      "material_change_unknown",
    ],
    facts: {
      session: { status: "verified_open" },
      provider_budget: {
        status: "bounded",
        max_known_credits_per_scan: 8,
        atomic_reservation_required: true,
      },
    },
    authority: {
      calls_provider: false,
      reserves_provider_credits: false,
      changes_ranking: false,
      publishes_candidate: false,
      executes_broker_order: false,
    },
  });
  expect(observationCycleAdmissionFromUnknown(result)).toEqual(result);
});

test("keeps a complete fresh no-trade cycle on the highest admitted quarter-hour cadence", () => {
  const previous = run({ observedAt: "2026-09-28T14:00:00.000Z" });
  expect(
    admission({
      now: "2026-09-28T14:14:59.000Z",
      runs: [previous],
    }),
  ).toMatchObject({
    decision: "no_request",
    next_eligible_at: "2026-09-28T14:15:00.000Z",
    facts: {
      freshness: { status: "fresh", age_minutes: 14 },
      coverage: { status: "complete" },
      candidate_state: { status: "no_trade" },
      retry_backoff: { delay_minutes: 15 },
    },
  });
  expect(
    admission({
      now: "2026-09-28T14:15:00.000Z",
      runs: [previous],
    }),
  ).toMatchObject({
    decision: "request_current_data",
    reason_codes: [
      "periodic_observation_due",
      "atomic_provider_credit_reservation_required",
      "material_change_unknown",
    ],
  });
});

test("keeps active and watch candidates on the fifteen-minute follow-up cadence", () => {
  const previous = run({
    observedAt: "2026-09-28T14:00:00.000Z",
    visibleCount: 1,
    strongCount: 1,
  });
  const result = admission({
    now: "2026-09-28T14:15:00.000Z",
    runs: [previous],
  });
  expect(result).toMatchObject({
    decision: "request_current_data",
    reason_codes: [
      "candidate_follow_up_due",
      "atomic_provider_credit_reservation_required",
      "material_change_unknown",
    ],
    facts: {
      candidate_state: { status: "active" },
      retry_backoff: { delay_minutes: 15 },
    },
  });
});

test("derives exponential retry backoff from durable same-day failures", () => {
  const failures = [
    run({ observedAt: "2026-09-28T14:30:00.000Z", status: "failed" }),
    run({ observedAt: "2026-09-28T14:15:00.000Z", status: "failed" }),
    run({ observedAt: "2026-09-28T14:00:00.000Z", status: "failed" }),
  ];
  expect(
    admission({ now: "2026-09-28T15:20:00.000Z", runs: failures }),
  ).toMatchObject({
    decision: "no_request",
    next_eligible_at: "2026-09-28T15:30:00.000Z",
    facts: {
      freshness: { status: "unavailable" },
      retry_backoff: {
        consecutive_retryable_failures: 3,
        delay_minutes: 60,
      },
    },
  });
  expect(
    admission({ now: "2026-09-28T15:30:00.000Z", runs: failures }),
  ).toMatchObject({
    decision: "request_current_data",
    reason_codes: expect.arrayContaining([
      "retry_backoff_elapsed",
      "atomic_provider_credit_reservation_required",
    ]),
  });
});

test("orders valid durable observations by instant rather than timestamp text", () => {
  const laterInstantWithEarlierText = run({
    observedAt: "2026-09-28T11:45:00-04:00",
    status: "failed",
  });
  const earlierInstantWithLaterText = run({
    observedAt: "2026-09-28T15:30:00.000Z",
    status: "completed",
  });

  expect(
    admission({
      now: "2026-09-28T16:00:00.000Z",
      runs: [earlierInstantWithLaterText, laterInstantWithEarlierText],
    }),
  ).toMatchObject({
    next_eligible_at: "2026-09-28T16:00:00.000Z",
    facts: {
      freshness: {
        latest_observed_at: "2026-09-28T15:45:00.000Z",
        age_minutes: 15,
      },
      retry_backoff: {
        consecutive_retryable_failures: 1,
        delay_minutes: 15,
      },
    },
  });
});

test("fails closed before provider work without verified session and bounded budget", () => {
  expect(
    admission({
      now: "2026-09-28T14:00:00.000Z",
      sessionVerifiedOpen: false,
    }),
  ).toMatchObject({
    decision: "reject",
    request_current_data: false,
    reason_codes: expect.arrayContaining([
      "market_session_not_provider_confirmed_open",
    ]),
  });
  expect(
    admission({ now: "2026-09-28T14:00:00.000Z", budget: null }),
  ).toMatchObject({
    decision: "reject",
    request_current_data: false,
    reason_codes: expect.arrayContaining(["provider_budget_not_bounded"]),
  });
});

test("rejects future durable history instead of treating it as fresh", () => {
  const future = run({ observedAt: "2026-09-28T14:15:00.000Z" });
  expect(
    admission({ now: "2026-09-28T14:00:00.000Z", runs: [future] }),
  ).toMatchObject({
    decision: "reject",
    reason_codes: [
      "observation_history_future_timestamp",
      "atomic_provider_credit_reservation_required",
      "prior_freshness_unknown",
      "material_change_unknown",
    ],
  });
});

test("records material candidate-state change only from two valid durable decisions", () => {
  const latest = run({
    observedAt: "2026-09-28T14:15:00.000Z",
    ticker: "CHANGED",
    score: 72,
  });
  const previous = run({
    observedAt: "2026-09-28T14:00:00.000Z",
    ticker: "BEFORE",
    score: 60,
  });
  expect(
    admission({
      now: "2026-09-28T14:20:00.000Z",
      runs: [latest, previous],
    }),
  ).toMatchObject({
    decision: "no_request",
    facts: {
      material_change: {
        status: "observed",
        basis: "candidate_decision_comparison",
      },
    },
  });
});

test("rejects a forged authority bit in an untrusted admission receipt", () => {
  const valid = admission({ now: "2026-09-28T14:00:00.000Z" });
  expect(
    observationCycleAdmissionFromUnknown({
      ...valid,
      authority: { ...valid.authority, calls_provider: true },
    }),
  ).toBeNull();

  expect(
    observationCycleAdmissionFromUnknown({
      ...valid,
      facts: {
        ...valid.facts,
        retry_backoff: {
          ...valid.facts.retry_backoff,
          delay_minutes: 0,
        },
      },
    }),
  ).toBeNull();

  const waiting = admission({
    now: "2026-09-28T14:05:00.000Z",
    runs: [run({ observedAt: "2026-09-28T14:00:00.000Z" })],
  });
  expect(waiting.decision).toBe("no_request");
  expect(
    observationCycleAdmissionFromUnknown({
      ...waiting,
      facts: {
        ...waiting.facts,
        session: { status: "rejected" },
      },
    }),
  ).toBeNull();
  expect(
    observationCycleAdmissionFromUnknown({
      ...waiting,
      facts: {
        ...waiting.facts,
        provider_budget: {
          ...waiting.facts.provider_budget,
          status: "unbounded",
          max_known_credits_per_scan: null,
        },
      },
    }),
  ).toBeNull();
  expect(
    observationCycleAdmissionFromUnknown({
      ...waiting,
      next_eligible_at: "2026-09-28T15:15:00.000Z",
      facts: {
        ...waiting.facts,
        retry_backoff: {
          ...waiting.facts.retry_backoff,
          delay_minutes: 75,
          next_eligible_at: "2026-09-28T15:15:00.000Z",
        },
      },
    }),
  ).toBeNull();
});

test("wires the policy before the normal-scan provider path", () => {
  const route = readFileSync(
    resolve(__dirname, "../../app/api/automation/run-scan/route.ts"),
    "utf8",
  );
  const policyBuild = route.indexOf(
    "const scheduledGateDiagnostics = buildContinuousMarketScanAdmission({",
  );
  const policyGate = route.indexOf(
    "if (!scheduledGateDiagnostics.scheduled_gate_allowed) {",
  );
  const providerEnvironment = route.indexOf("const providerEnv = providerEnvironmentReady();");
  const creditReservation = route.indexOf(
    "await prepareBasicFreeScheduledScanCreditGuard({",
  );
  const generation = route.indexOf("generationResult = await generateRecommendations({");

  expect(route).toContain(
    "providerBudget: scheduledRuntimeConfig.scheduled_provider_credit_budget",
  );
  expect(route).toContain(
    "observationAdmission: scheduledGateDiagnostics.observation_admission",
  );
  expect(route).not.toContain(
    "if (!force && !scheduledGateDiagnostics.scheduled_gate_allowed)",
  );
  expect(route).toContain(
    "const backgroundDiscoveryObservationAllowed =\n    catalogOnlyReferenceModeReady &&",
  );
  expect(route).not.toContain(
    "observeMarketWideDiscoveryBetweenPublicationWindows",
  );
  expect(route).not.toContain(
    "!scheduledGateDiagnostics.scheduled_gate_allowed) &&\n    canObserveBackgroundDiscoveryBetweenPublicationWindows",
  );
  expect(policyBuild).toBeGreaterThan(-1);
  expect(policyGate).toBeGreaterThan(policyBuild);
  expect(providerEnvironment).toBeGreaterThan(policyGate);
  expect(creditReservation).toBeGreaterThan(providerEnvironment);
  expect(generation).toBeGreaterThan(creditReservation);
});
