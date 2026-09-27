import { expect, test } from "@playwright/test";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  buildScannerClockPriorShadowAttribution,
  scannerClockPriorShadowAttributionFromUnknown,
  SCANNER_CLOCK_PRIOR_SHADOW_ATTRIBUTION_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow-attribution";
import type { ScannerClockPriorShadowComparison } from "@/lib/scanner-ranking-clock-prior-shadow";

function comparison(): ScannerClockPriorShadowComparison {
  return {
    comparison_version: "scanner_clock_prior_shadow_comparison_v1",
    comparison_kind: "scanner_clock_prior_shadow_comparison",
    generated_at: "2026-09-27T18:00:00.000Z",
    status: "comparable",
    baseline_policy_version: "scanner_candidate_ranking_v1.2",
    shadow_policy_version: "scanner_candidate_ranking_clock_neutral_v1",
    hypothesis: "named_clock_priors_add_quality_beyond_observed_features",
    candidate_count: 1,
    candidate_tickers: ["CLOCK"],
    baseline_selected_tickers: ["CLOCK"],
    shadow_selected_tickers: [],
    selection_changed: true,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    quality_improvement_claimed: false,
    quality_evidence_status: "not_evaluated",
    reason_codes: [],
    displacements: [
      {
        ticker: "CLOCK",
        baseline_rank: 1,
        shadow_rank: 1,
        rank_change: 0,
        baseline_score: 82,
        shadow_score: 74,
        score_change: -8,
        baseline_tier: "strong",
        shadow_tier: "valid",
        baseline_selected: true,
        shadow_selected: false,
        legacy_timing_score: 67,
        baseline_signal_strength: 82,
        shadow_signal_strength: 79,
        baseline_window_fit: 67,
        shadow_window_fit: 50,
        legacy_setup_classification_bonus_removed: 3,
        legacy_clock_warning_count: 1,
        baseline_warnings_penalty: -2,
        shadow_warnings_penalty: 0,
      },
    ],
  };
}

function decisionRecord(): CandidateDecisionRecord {
  return {
    record_version: "candidate_decision_record_v3",
    record_kind: "candidate_decision_record",
    scan_run_id: "scan-run-clock-1",
    scan_run_fingerprint: "scan-fingerprint-clock-1",
    decision_timestamp: "2026-09-27T18:00:00.000Z",
    strategy_reference: null,
    versions: {
      scanner_version: "scanner-v1",
      universe_version: "universe-v1",
      scoring_version: "scoring-v1",
      ranking_version: "scanner_candidate_ranking_v1.2",
      build_version: "build-v1",
      provider_contract_version: "provider-v1",
    },
    learning_attribution: {
      attribution_version: "candidate_decision_learning_attribution_v1",
      recommendation_publish_policy_version: "policy-v1",
      confidence: {
        semantics: "ordinal_not_calibrated",
        numeric_confidence: null,
        numeric_confidence_scale: "not_available",
      },
      canonical_evaluation_versions: null,
      attribution_status: "incomplete",
      reason_codes: ["canonical_evaluation_versions_missing"],
    },
    coverage: {
      expected_candidate_count: 1,
      observed_candidate_count: 1,
      ranked_candidate_count: 1,
      full_membership_declared: true,
      full_membership_captured: true,
      membership_reason_codes: [],
      pre_truncation_capture_evidence: null,
    },
    candidates: [
      {
        candidate_id: "scanner_candidate:v1:scan-run-clock-1:CLOCK",
        ticker: "CLOCK",
        company_name: "Clock Incorporated",
        sector: "Technology",
        disposition: "selected_not_published",
        eligibility: "eligible",
        reason_codes: [],
        data: {
          provider_source: "twelve_data",
          source_timestamp: "2026-09-27T17:59:00.000Z",
          freshness: "fresh",
          indicator_source: "fresh",
          gap_codes: [],
        },
        ranking: {
          rank: 1,
          score: 82,
          tier: "strong",
          selected: true,
          selection_bucket: "selected",
          rank_reason: "ranked",
          tie_break_key: "CLOCK",
          components: [],
          warnings: [],
          gaps: [],
        },
        build: null,
      },
    ],
    final_decision: {
      disposition: "no_trade",
      published_tickers: [],
      no_trade_reason: "no_publishable_candidate",
      recommendation_build_path: "no_publish",
    },
  };
}

test("binds clock-prior displacement to the exact immutable candidate decision", () => {
  const result = buildScannerClockPriorShadowAttribution({
    comparison: comparison(),
    decisionRecord: decisionRecord(),
  });

  expect(result).toMatchObject({
    attribution_version: SCANNER_CLOCK_PRIOR_SHADOW_ATTRIBUTION_VERSION,
    status: "attributed",
    scan_run_id: "scan-run-clock-1",
    scan_run_fingerprint: "scan-fingerprint-clock-1",
    candidate_count: 1,
    attributed_candidate_count: 1,
    outcome_join_basis: "candidate_decision_id",
    outcome_evidence_status: "not_evaluated",
    quality_improvement_claimed: false,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    reason_codes: [],
    candidates: [
      {
        candidate_id: "scanner_candidate:v1:scan-run-clock-1:CLOCK",
        ticker: "CLOCK",
        candidate_decision_disposition: "selected_not_published",
        baseline_selected: true,
        shadow_selected: false,
      },
    ],
  });
});

test("compares only the ranked population and accepts pre-ranking filters", () => {
  const record = decisionRecord();
  record.coverage.expected_candidate_count = 2;
  record.coverage.observed_candidate_count = 2;
  record.candidates.push({
    ...record.candidates[0]!,
    candidate_id: "scanner_candidate:v1:scan-run-clock-1:FILTERED",
    ticker: "FILTERED",
    disposition: "filtered_before_ranking",
    eligibility: "ineligible",
    ranking: null,
  });

  const result = buildScannerClockPriorShadowAttribution({
    comparison: comparison(),
    decisionRecord: record,
  });

  expect(result).toMatchObject({
    status: "attributed",
    candidate_count: 1,
    attributed_candidate_count: 1,
    reason_codes: [],
  });
});

test("preserves an exact zero-candidate no-trade attribution", () => {
  const emptyComparison = comparison();
  emptyComparison.candidate_count = 0;
  emptyComparison.candidate_tickers = [];
  emptyComparison.baseline_selected_tickers = [];
  emptyComparison.shadow_selected_tickers = [];
  emptyComparison.selection_changed = false;
  emptyComparison.displacements = [];
  const emptyDecision = decisionRecord();
  emptyDecision.coverage.expected_candidate_count = 0;
  emptyDecision.coverage.observed_candidate_count = 0;
  emptyDecision.coverage.ranked_candidate_count = 0;
  emptyDecision.candidates = [];

  const result = buildScannerClockPriorShadowAttribution({
    comparison: emptyComparison,
    decisionRecord: emptyDecision,
  });

  expect(result).toMatchObject({
    status: "attributed",
    candidate_count: 0,
    attributed_candidate_count: 0,
    candidates: [],
    reason_codes: [],
    quality_improvement_claimed: false,
  });
  expect(scannerClockPriorShadowAttributionFromUnknown(result)).toEqual(result);
});

test("fails closed when baseline evidence differs from the immutable decision", () => {
  const record = decisionRecord();
  record.candidates[0]!.ranking!.score = 81;

  const result = buildScannerClockPriorShadowAttribution({
    comparison: comparison(),
    decisionRecord: record,
  });

  expect(result).toMatchObject({
    status: "conflicting",
    attributed_candidate_count: 0,
    candidates: [],
  });
  expect(result?.reason_codes).toEqual([
    "baseline_decision_evidence_conflict",
    "candidate_attribution_incomplete",
  ]);
});

test("never invents attribution without an immutable candidate decision", () => {
  const result = buildScannerClockPriorShadowAttribution({
    comparison: comparison(),
    decisionRecord: null,
  });

  expect(result).toMatchObject({
    status: "conflicting",
    attributed_candidate_count: 0,
    candidates: [],
  });
  expect(result?.reason_codes).toEqual([
    "candidate_attribution_incomplete",
    "candidate_decision_identity_missing",
    "candidate_decision_join_missing",
    "candidate_population_mismatch",
    "decision_time_order_invalid",
  ]);
});

test("strictly round-trips valid persisted attribution", () => {
  const result = buildScannerClockPriorShadowAttribution({
    comparison: comparison(),
    decisionRecord: decisionRecord(),
  });

  expect(scannerClockPriorShadowAttributionFromUnknown(result)).toEqual(result);
  expect(
    scannerClockPriorShadowAttributionFromUnknown({
      ...result,
      execution_effect: true,
    }),
  ).toBeNull();
  expect(
    scannerClockPriorShadowAttributionFromUnknown({
      ...result,
      attribution_version: "future-version",
    }),
  ).toBeNull();
  expect(
    scannerClockPriorShadowAttributionFromUnknown({
      ...result,
      candidates: [result!.candidates[0], result!.candidates[0]],
      candidate_count: 2,
      attributed_candidate_count: 2,
    }),
  ).toBeNull();
});

test("omits the receipt when no clock-prior comparison was produced", () => {
  expect(
    buildScannerClockPriorShadowAttribution({
      comparison: null,
      decisionRecord: decisionRecord(),
    }),
  ).toBeNull();
});
