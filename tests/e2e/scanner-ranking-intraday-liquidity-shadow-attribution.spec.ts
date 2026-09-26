import { expect, test } from "@playwright/test";

import type { CandidateDecisionRecord } from "@/lib/candidate-decision-record";
import {
  buildScannerIntradayLiquidityShadowAttribution,
  SCANNER_INTRADAY_LIQUIDITY_SHADOW_ATTRIBUTION_VERSION,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow-attribution";
import type { ScannerIntradayLiquidityShadowComparison } from "@/lib/scanner-ranking-intraday-liquidity-shadow";

function comparison(): ScannerIntradayLiquidityShadowComparison {
  return {
    comparison_version: "scanner_intraday_liquidity_shadow_comparison_v1",
    comparison_kind: "scanner_intraday_liquidity_shadow_comparison",
    generated_at: "2026-09-26T18:00:00.000Z",
    status: "comparable",
    baseline_policy_version: "scanner_candidate_ranking_v1.2",
    shadow_policy_version:
      "scanner_candidate_ranking_verified_intraday_liquidity_v1",
    candidate_count: 1,
    candidate_tickers: ["FIT"],
    verified_intraday_volume_count: 1,
    missing_verified_intraday_volume_count: 0,
    baseline_selected_tickers: ["FIT"],
    shadow_selected_tickers: [],
    selection_changed: true,
    live_ranking_effect: false,
    publication_effect: false,
    quality_improvement_claimed: false,
    quality_evidence_status: "not_evaluated",
    reason_codes: [],
    displacements: [
      {
        ticker: "FIT",
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
        daily_volume_ratio: 1.8,
        verified_intraday_volume_ratio: 0.7,
        shadow_liquidity_score: 3,
        shadow_reason_codes: [],
      },
    ],
  };
}

function decisionRecord(): CandidateDecisionRecord {
  return {
    record_version: "candidate_decision_record_v3",
    record_kind: "candidate_decision_record",
    scan_run_id: "scan-run-1",
    scan_run_fingerprint: "scan-fingerprint-1",
    decision_timestamp: "2026-09-26T18:00:00.000Z",
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
        candidate_id: "scanner_candidate:v1:scan-run-1:FIT",
        ticker: "FIT",
        company_name: "Fit Incorporated",
        sector: "Technology",
        disposition: "selected_not_published",
        eligibility: "eligible",
        reason_codes: [],
        data: {
          provider_source: "twelve_data",
          source_timestamp: "2026-09-26T17:59:00.000Z",
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
          tie_break_key: "FIT",
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

test("binds a shadow displacement to the exact immutable candidate decision", () => {
  const result = buildScannerIntradayLiquidityShadowAttribution({
    comparison: comparison(),
    decisionRecord: decisionRecord(),
  });

  expect(result).toMatchObject({
    attribution_version:
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_ATTRIBUTION_VERSION,
    status: "attributed",
    scan_run_id: "scan-run-1",
    scan_run_fingerprint: "scan-fingerprint-1",
    comparison_generated_at: "2026-09-26T18:00:00.000Z",
    candidate_decision_timestamp: "2026-09-26T18:00:00.000Z",
    candidate_count: 1,
    attributed_candidate_count: 1,
    outcome_join_basis: "candidate_decision_id",
    outcome_evidence_status: "not_evaluated",
    quality_improvement_claimed: false,
    live_ranking_effect: false,
    publication_effect: false,
    reason_codes: [],
    candidates: [
      {
        candidate_id: "scanner_candidate:v1:scan-run-1:FIT",
        ticker: "FIT",
        candidate_decision_disposition: "selected_not_published",
        baseline_selected: true,
        shadow_selected: false,
      },
    ],
  });
});

test("compares the exact ranked population without rejecting pre-ranking filters", () => {
  const record = decisionRecord();
  record.coverage.expected_candidate_count = 2;
  record.coverage.observed_candidate_count = 2;
  record.candidates.push({
    ...record.candidates[0]!,
    candidate_id: "scanner_candidate:v1:scan-run-1:FILTERED",
    ticker: "FILTERED",
    disposition: "filtered_before_ranking",
    eligibility: "ineligible",
    ranking: null,
  });

  const result = buildScannerIntradayLiquidityShadowAttribution({
    comparison: comparison(),
    decisionRecord: record,
  });

  expect(result).toMatchObject({
    status: "attributed",
    candidate_count: 1,
    attributed_candidate_count: 1,
    reason_codes: [],
  });
  expect(result?.candidates.map((candidate) => candidate.ticker)).toEqual([
    "FIT",
  ]);
});

test("fails closed when baseline evidence differs from the immutable decision", () => {
  const record = decisionRecord();
  record.candidates[0]!.ranking!.score = 81;

  const result = buildScannerIntradayLiquidityShadowAttribution({
    comparison: comparison(),
    decisionRecord: record,
  });

  expect(result).toMatchObject({
    status: "conflicting",
    candidate_count: 1,
    attributed_candidate_count: 0,
    candidates: [],
  });
  expect(result?.reason_codes).toEqual([
    "baseline_decision_evidence_conflict",
    "candidate_attribution_incomplete",
  ]);
});

test("never invents an attribution when the candidate decision is absent", () => {
  const result = buildScannerIntradayLiquidityShadowAttribution({
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

test("omits the receipt when no shadow comparison was produced", () => {
  expect(
    buildScannerIntradayLiquidityShadowAttribution({
      comparison: null,
      decisionRecord: decisionRecord(),
    }),
  ).toBeNull();
});
