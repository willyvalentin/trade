import { expect, test } from "@playwright/test";

import {
  buildRecommendationEvaluationCharterInput,
  type RecommendationEvaluationCharter,
} from "@/lib/recommendation-evaluation-charter";
import type { LearningBaselineScanRun } from "@/lib/recommendation-learning-baseline-readiness";
import { scannerClockPriorShadowForwardPlanProfile } from "@/lib/scanner-clock-prior-shadow-forward-plan-profile";
import {
  SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow";
import {
  assessScannerClockPriorShadowForwardCollectionAdmission,
  SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_ADMISSION_VERSION,
  SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_POLICY_VERSION,
} from "@/lib/server/scanner-clock-prior-shadow-forward-collection-admission";
import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  buildScannerClockPriorShadowPolicyReference,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import { scannerClockPriorShadowEvaluationCharterDefinition } from "@/lib/server/scanner-clock-prior-shadow-evaluation-charter";

const ownerUserId = "11111111-1111-4111-8111-111111111111";
const charterId = "22222222-2222-4222-8222-222222222222";
const segmentKey = "clock-prior:all-us-equities";
const policy = {
  recommendation_publish_policy_version: "recommendation_publish_policy_v1",
  canonical_evaluation_versions: {
    engine_version: "engine_v1",
    scoring_version: "scoring_v1",
    ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
    setup_taxonomy_version: "setup_v1",
    confidence_contract_version: "confidence_v1",
    evaluator_version: "evaluator_v1",
    provider_contract_version: "provider_v1",
    git_commit: "fixture-commit",
    build_identity: "fixture-build",
  },
};

const charterInput = buildRecommendationEvaluationCharterInput({
  ownerUserId,
  segmentKey,
  policy,
  charter: scannerClockPriorShadowEvaluationCharterDefinition,
});
if (!charterInput) throw new Error("charter fixture must build");
const charter: RecommendationEvaluationCharter = {
  ...charterInput,
  charter_id: charterId,
  created_at: "2026-09-27T08:00:00.000Z",
};
const policyReference = buildScannerClockPriorShadowPolicyReference({
  charter,
  createdAt: charter.created_at,
});
if (!policyReference) throw new Error("policy reference fixture must build");
const plan = buildScannerClockPriorShadowForwardDecisionPlan({
  created_at: "2026-09-27T08:01:00.000Z",
  owner_user_id: ownerUserId,
  segment_key: segmentKey,
  hypothesis: charter.charter.hypothesis,
  evaluation_charter_id: charterId,
  evaluation_charter_fingerprint: charter.charter_fingerprint,
  policy_reference: policyReference,
  baseline_ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
  candidate_ranking_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
  primary_k: scannerClockPriorShadowForwardPlanProfile.primary_k,
  windows: scannerClockPriorShadowForwardPlanProfile.windows,
  thresholds: scannerClockPriorShadowForwardPlanProfile.thresholds,
});
if (!plan) throw new Error("plan fixture must build");

function scanRun({
  id,
  observedAt,
  candidateCount = 0,
  expectedCandidateCount = candidateCount,
  sourceTimestamp = observedAt,
  tradingDate = observedAt.slice(0, 10),
}: {
  id: string;
  observedAt: string;
  candidateCount?: number;
  expectedCandidateCount?: number;
  sourceTimestamp?: string;
  tradingDate?: string;
}): LearningBaselineScanRun {
  const rankedTickers = Array.from(
    { length: candidateCount },
    (_, index) => `T${String(index).padStart(3, "0")}`,
  );
  const universeTickers = Array.from(
    { length: expectedCandidateCount },
    (_, index) => `T${String(index).padStart(3, "0")}`,
  );
  const runFingerprint = `fingerprint-${id}`;
  return {
    id,
    run_fingerprint: runFingerprint,
    trading_date: tradingDate,
    window: "morning",
    observed_at: observedAt,
    payload_json: {
      scanner_clock_prior_shadow_comparison: {
        comparison_version: "scanner_clock_prior_shadow_comparison_v1",
        comparison_kind: "scanner_clock_prior_shadow_comparison",
        generated_at: observedAt,
        status: "comparable",
        baseline_policy_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
        shadow_policy_version: SCANNER_CLOCK_PRIOR_SHADOW_POLICY_VERSION,
        hypothesis: "named_clock_priors_add_quality_beyond_observed_features",
        candidate_count: candidateCount,
        candidate_tickers: rankedTickers,
        baseline_selected_tickers: [],
        shadow_selected_tickers: [],
        selection_changed: false,
        live_ranking_effect: false,
        publication_effect: false,
        execution_effect: false,
        quality_improvement_claimed: false,
        quality_evidence_status: "not_evaluated",
        reason_codes: [],
        displacements: rankedTickers.map((ticker, index) => ({
          ticker,
          baseline_rank: index + 1,
          shadow_rank: index + 1,
          rank_change: 0,
          baseline_score: 80 - index,
          shadow_score: 80 - index,
          score_change: 0,
          baseline_tier: "valid",
          shadow_tier: "valid",
          baseline_selected: false,
          shadow_selected: false,
          legacy_timing_score: 50,
          baseline_signal_strength: 80 - index,
          shadow_signal_strength: 80 - index,
          baseline_window_fit: 50,
          shadow_window_fit: 50,
          legacy_setup_classification_bonus_removed: 0,
          legacy_clock_warning_count: 0,
          baseline_warnings_penalty: 0,
          shadow_warnings_penalty: 0,
        })),
      },
      candidate_decision_record: {
        record_version: "candidate_decision_record_v1",
        record_kind: "candidate_decision_record",
        scan_run_id: id,
        scan_run_fingerprint: runFingerprint,
        decision_timestamp: observedAt,
        versions: {
          scanner_version: "scanner-test-v1",
          universe_version: "scanner_universe_v1",
          scoring_version: "day_trade_score_v1",
          ranking_version: SCANNER_CLOCK_PRIOR_BASELINE_POLICY_VERSION,
          build_version: "test-build-v1",
          provider_contract_version: "twelve_data_market_data_v1",
        },
        coverage: {
          expected_candidate_count: expectedCandidateCount,
          observed_candidate_count: candidateCount,
          ranked_candidate_count: candidateCount,
          full_membership_declared: true,
          full_membership_captured: true,
          membership_reason_codes: [],
          pre_truncation_capture_evidence: null,
        },
        candidates: universeTickers.map((ticker, index) => {
          const ranked = index < candidateCount;
          return {
            candidate_id: `scanner_candidate:v1:${id}:${ticker}`,
            ticker,
            company_name: `${ticker} Incorporated`,
            sector: "Technology",
            disposition: ranked ? "ranked_not_selected" : "not_evaluated",
            eligibility: ranked ? "ineligible" : "unknown",
            reason_codes: ranked
              ? ["ranking_not_selected"]
              : ["candidate_provider_gap"],
            data: {
              provider_source: ranked ? "twelve_data" : null,
              source_timestamp: ranked ? sourceTimestamp : null,
              freshness: ranked ? "fresh" : "gap",
              indicator_source: ranked ? "fresh" : "unavailable",
              gap_codes: ranked ? [] : ["candidate_provider_gap"],
            },
            ranking: ranked
              ? {
                  rank: index + 1,
                  score: 80 - index,
                  tier: "valid",
                  selected: false,
                  selection_bucket: "not_selected",
                  rank_reason: "ranked",
                  tie_break_key: ticker,
                  components: [],
                  warnings: [],
                  gaps: [],
                }
              : null,
            build: null,
          };
        }),
        final_decision: {
          disposition: "no_trade",
          published_tickers: [],
          no_trade_reason: "no_publishable_candidate",
          recommendation_build_path: "no_publish",
        },
      },
    },
  };
}

function assess(
  scanRuns: LearningBaselineScanRun[] = [],
  overrides: Partial<Parameters<
    typeof assessScannerClockPriorShadowForwardCollectionAdmission
  >[0]> = {},
) {
  return assessScannerClockPriorShadowForwardCollectionAdmission({
    evaluatedAt: "2026-09-28T12:00:00.000Z",
    targetTradingDate: "2026-09-28",
    plan,
    scanRuns,
    ...overrides,
  });
}

test("admits a bounded first-hour manifest for the exact frozen held-out plan", () => {
  const result = assess();

  expect(result).toMatchObject({
    contract_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_ADMISSION_VERSION,
    collection_policy_version:
      SCANNER_CLOCK_PRIOR_SHADOW_FORWARD_COLLECTION_POLICY_VERSION,
    status: "admitted",
    reason_codes: ["frozen_partition_evidence_deficit"],
    plan_fingerprint: plan.plan_fingerprint,
    target_partition: "held_out",
    next_eligible_trading_date: "2026-09-29",
    target_day: {
      accepted_attempt_count: 0,
      remaining_attempt_capacity: 4,
      admitted_slots: [
        "2026-09-28T13:30:00.000Z",
        "2026-09-28T13:45:00.000Z",
        "2026-09-28T14:00:00.000Z",
        "2026-09-28T14:15:00.000Z",
      ],
      maximum_provider_credits: 32,
    },
    authority: {
      schedule_effect: false,
      provider_effect: false,
      ranking_effect: false,
      publication_effect: false,
      paper_effect: false,
      broker_effect: false,
    },
  });
  expect(result.progress.held_out).toMatchObject({
    remaining_opportunity_sets: 30,
    remaining_ranked_candidates: 30,
    remaining_trading_days: 8,
    minimums_met: false,
  });
});

test("counts honest no-trade opportunities and only emits unused future slots", () => {
  const result = assess(
    [
      scanRun({ id: "one", observedAt: "2026-09-28T13:30:00.000Z" }),
      scanRun({ id: "two", observedAt: "2026-09-28T13:45:00.000Z" }),
    ],
    { evaluatedAt: "2026-09-28T13:50:00.000Z" },
  );

  expect(result.status).toBe("admitted");
  expect(result.progress.held_out).toMatchObject({
    opportunity_set_count: 2,
    no_trade_opportunity_set_count: 2,
    ranked_candidate_count: 0,
    trading_day_count: 1,
    remaining_opportunity_sets: 28,
    remaining_ranked_candidates: 30,
    remaining_trading_days: 7,
  });
  expect(result.target_day).toEqual({
    attributable_attempt_count: 2,
    accepted_attempt_count: 2,
    remaining_attempt_capacity: 2,
    admitted_slots: [
      "2026-09-28T14:00:00.000Z",
      "2026-09-28T14:15:00.000Z",
    ],
    maximum_provider_credits: 16,
  });
});

test("does not count a partial universe as a complete ranked opportunity set", () => {
  const result = assess(
    [
      scanRun({
        id: "partial-universe",
        observedAt: "2026-09-28T13:30:00.000Z",
        candidateCount: 6,
        expectedCandidateCount: 8,
      }),
    ],
    { evaluatedAt: "2026-09-28T13:35:00.000Z" },
  );

  expect(result.status).toBe("admitted");
  expect(result.reason_codes).toEqual([
    "frozen_partition_evidence_deficit",
    "scan_candidate_decision_coverage_incomplete",
  ]);
  expect(result.progress.held_out).toMatchObject({
    opportunity_set_count: 0,
    ranked_candidate_count: 0,
    trading_day_count: 0,
  });
  expect(result.target_day).toMatchObject({
    attributable_attempt_count: 1,
    accepted_attempt_count: 0,
    remaining_attempt_capacity: 3,
  });
  expect(result.target_day.admitted_slots).not.toContain(
    "2026-09-28T13:30:00.000Z",
  );
});

test("does not count an old source timestamp even when its stored label says fresh", () => {
  const result = assess(
    [
      scanRun({
        id: "old-source",
        observedAt: "2026-09-28T13:30:00.000Z",
        candidateCount: 1,
        sourceTimestamp: "2026-05-28T13:31:14.866Z",
      }),
    ],
    { evaluatedAt: "2026-09-28T13:35:00.000Z" },
  );

  expect(result.status).toBe("admitted");
  expect(result.reason_codes).toEqual([
    "frozen_partition_evidence_deficit",
    "scan_candidate_decision_freshness_incomplete",
  ]);
  expect(result.progress.held_out.ranked_candidate_count).toBe(0);
  expect(result.target_day).toMatchObject({
    attributable_attempt_count: 1,
    accepted_attempt_count: 0,
    remaining_attempt_capacity: 3,
  });
});

test("fails closed on duplicate fingerprints instead of silently shrinking the cohort", () => {
  const first = scanRun({ id: "one", observedAt: "2026-09-28T13:30:00.000Z" });
  const duplicate = {
    ...scanRun({ id: "two", observedAt: "2026-09-28T13:45:00.000Z" }),
    run_fingerprint: first.run_fingerprint,
  };
  const result = assess([first, duplicate]);

  expect(result.status).toBe("blocked");
  expect(result.reason_codes).toEqual(["duplicate_scan_run_fingerprint"]);
  expect(result.target_day.maximum_provider_credits).toBe(0);
});

test("fails closed on duplicate slots and evidence above the frozen daily cap", () => {
  const duplicateSlot = assess([
    scanRun({ id: "one", observedAt: "2026-09-28T13:30:00.000Z" }),
    scanRun({ id: "two", observedAt: "2026-09-28T13:30:00.000Z" }),
  ]);
  expect(duplicateSlot.status).toBe("blocked");
  expect(duplicateSlot.reason_codes).toEqual(["duplicate_scan_observed_at"]);

  const overCap = assess([
    scanRun({ id: "one", observedAt: "2026-09-28T13:30:00.000Z" }),
    scanRun({ id: "two", observedAt: "2026-09-28T13:45:00.000Z" }),
    scanRun({ id: "three", observedAt: "2026-09-28T14:00:00.000Z" }),
    scanRun({ id: "four", observedAt: "2026-09-28T14:15:00.000Z" }),
    scanRun({ id: "five", observedAt: "2026-09-28T14:30:00.000Z" }),
  ]);
  expect(overCap.status).toBe("blocked");
  expect(overCap.reason_codes).toEqual(["daily_collection_limit_exceeded"]);
  expect(overCap.target_day.maximum_provider_credits).toBe(0);
});

test("fails closed on date/session mismatch and exact-plan drift", () => {
  const mismatched = assess([
    scanRun({
      id: "wrong-date",
      observedAt: "2026-09-28T13:30:00.000Z",
      tradingDate: "2026-09-29",
    }),
  ]);
  expect(mismatched.status).toBe("blocked");
  expect(mismatched.reason_codes).toContain("scan_trading_date_or_session_mismatch");

  const drifted = assess([], {
    plan: {
      ...plan,
      primary_k: 1,
    },
  });
  expect(drifted.status).toBe("blocked");
  expect(drifted.reason_codes).toEqual(["frozen_plan_invalid_or_drifted"]);
});

test("keeps held-out and walk-forward evidence separate", () => {
  const result = assess(
    [
      scanRun({
        id: "held-out",
        observedAt: "2026-09-28T13:30:00.000Z",
        candidateCount: 2,
      }),
      scanRun({
        id: "walk-forward",
        observedAt: "2026-10-12T13:30:00.000Z",
        candidateCount: 3,
      }),
    ],
    {
      evaluatedAt: "2026-10-12T12:00:00.000Z",
      targetTradingDate: "2026-10-12",
    },
  );

  expect(result.status).toBe("admitted");
  expect(result.target_partition).toBe("walk_forward");
  expect(result.progress.held_out).toMatchObject({
    opportunity_set_count: 1,
    ranked_candidate_count: 2,
    trading_day_count: 1,
  });
  expect(result.progress.walk_forward).toMatchObject({
    opportunity_set_count: 1,
    ranked_candidate_count: 3,
    trading_day_count: 1,
  });
});

test("rejects weekends, out-of-window dates, and exhausted same-day admission", () => {
  const weekend = assess([], { targetTradingDate: "2026-10-03" });
  expect(weekend.status).toBe("blocked");
  expect(weekend.reason_codes).toEqual(["target_date_not_verified_open_session"]);

  const beforeWindow = assess([], { targetTradingDate: "2026-09-25" });
  expect(beforeWindow.status).toBe("blocked");
  expect(beforeWindow.reason_codes).toEqual(["target_date_outside_declared_partitions"]);

  const fullDay = assess([
    scanRun({ id: "one", observedAt: "2026-09-28T13:30:00.000Z" }),
    scanRun({ id: "two", observedAt: "2026-09-28T13:45:00.000Z" }),
    scanRun({ id: "three", observedAt: "2026-09-28T14:00:00.000Z" }),
    scanRun({ id: "four", observedAt: "2026-09-28T14:15:00.000Z" }),
  ]);
  expect(fullDay.status).toBe("no_collection_needed");
  expect(fullDay.reason_codes).toEqual(["target_day_collection_limit_reached"]);
  expect(fullDay.next_eligible_trading_date).toBe("2026-09-29");
  expect(fullDay.target_day.maximum_provider_credits).toBe(0);
});
