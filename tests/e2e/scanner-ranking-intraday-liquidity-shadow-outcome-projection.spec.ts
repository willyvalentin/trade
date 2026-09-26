import { expect, test } from "@playwright/test";

import {
  buildCandidateDecisionCapture,
  buildCandidateDecisionRecord,
} from "@/lib/candidate-decision-record";
import { buildCandidateDecisionLearningAttribution } from "@/lib/candidate-decision-learning-attribution";
import { CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION } from "@/lib/recommendation-outcome-canonical-coverage";
import { recommendationOutcomeEvaluationAnchorFromSnapshot } from "@/lib/recommendation-outcome-evaluation-anchor";
import { computeRecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import { buildRecommendationScanRun } from "@/lib/recommendation-scan-run";
import { buildRecommendationSnapshot } from "@/lib/recommendation-snapshot";
import { RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION } from "@/lib/research-snapshot-candidate-linkage";
import { recommendationDecisionFeatureVectorFromScannerCandidate } from "@/lib/recommendation-decision-feature-vector";
import { buildScannerCandidateRankingSummary } from "@/lib/scanner-candidate-ranking";
import {
  buildScannerIntradayLiquidityShadowAttribution,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow-attribution";
import {
  buildScannerIntradayLiquidityShadowOutcomeProjection,
  SCANNER_INTRADAY_LIQUIDITY_SHADOW_OUTCOME_PROJECTION_VERSION,
} from "@/lib/scanner-ranking-intraday-liquidity-shadow-outcome-projection";
import { evaluateScannerIntradayLiquidityShadowScan } from "@/lib/server/scanner-intraday-liquidity-shadow-canonical-evaluation";
import type { ScannerIntradayLiquidityShadowComparison } from "@/lib/scanner-ranking-intraday-liquidity-shadow";
import type { ScannerCandidate } from "@/lib/scanner";

const DECIDED_AT = "2026-09-26T14:30:00.000Z";

function scannerCandidate(): ScannerCandidate & { local_score: number } {
  return {
    ticker: "FIT",
    company_name: "Fit Incorporated",
    sector: "Technology",
    mock_current_price: 100,
    mock_trend: "uptrend",
    mock_volume_context: "expanding volume",
    mock_support: 96,
    mock_resistance: 110,
    mock_news_context: "No adverse news",
    latest_close: 100,
    volume_ratio: 1.8,
    recent_volume_ratio: 1.8,
    proposed_entry_low: 99,
    proposed_entry_high: 100,
    proposed_stop_loss: 96,
    proposed_target_1: 106,
    proposed_target_2: 110,
    proposed_risk_reward: 2.5,
    intraday_indicators: {
      vwap: 99,
      latestPrice: 100,
      priceVsVwapPercent: 1,
      isAboveVwap: true,
      recentHigh: 101,
      recentLow: 98,
      recentRangePercent: 3,
      momentumPercent: 2,
      momentumDirection: "up",
      volumeTrend: "expanding",
      latestVolume: 1800,
      averageVolume: 1000,
      warnings: [],
    },
    intraday_indicator_source: "fresh",
    intraday_indicator_cached_at: DECIDED_AT,
    reference_price_timestamp: DECIDED_AT,
    reference_price_provider: "twelve_data",
    local_score: 96,
  };
}

function fixture() {
  const candidate = scannerCandidate();
  const ranking = buildScannerCandidateRankingSummary({
    candidates: [candidate],
    targetMin: 1,
    targetMax: 1,
    now: new Date(DECIDED_AT),
  });
  const scanRun = buildRecommendationScanRun({
    trading_date: "2026-09-26",
    observed_at: DECIDED_AT,
    completed_at: DECIDED_AT,
    window: "midday",
    source: "supabase",
    scanned_ticker_count: 1,
    raw_candidate_count: 1,
  });
  const capture = buildCandidateDecisionCapture({
    captureTimestamp: DECIDED_AT,
    universe: [candidate],
    observedCandidates: [candidate],
    ranking,
    eligibleCandidateTickers: [candidate.ticker],
    publishableThreshold: 70,
    publishedTickers: [],
    recommendationBuildPath: "no_publishable_candidate",
  });
  const record = buildCandidateDecisionRecord({
    scanRun,
    capture,
    scoringVersion: "score_test_v1",
    buildVersion: "test-build-v1",
    learningAttribution: buildCandidateDecisionLearningAttribution({
      recommendationPublishPolicyVersion: "publish_test_v1",
      canonicalEvaluationVersions: {
        engine_version: "engine_test_v1",
        scoring_version: "score_test_v1",
        ranking_version: "scanner_candidate_ranking_v1.2",
        setup_taxonomy_version: "taxonomy_test_v1",
        confidence_contract_version: "ordinal_test_v1",
        evaluator_version: "canonical_outcome_evaluator_v1",
        provider_contract_version: "provider_test_v1",
        git_commit: "a".repeat(40),
        build_identity: "test-build-v1",
      },
    }),
  });
  expect(record).not.toBeNull();
  const decisionCandidate = record!.candidates[0]!;
  expect(decisionCandidate.ranking).not.toBeNull();
  const comparison: ScannerIntradayLiquidityShadowComparison = {
    comparison_version: "scanner_intraday_liquidity_shadow_comparison_v1",
    comparison_kind: "scanner_intraday_liquidity_shadow_comparison",
    generated_at: DECIDED_AT,
    status: "comparable",
    baseline_policy_version: "scanner_candidate_ranking_v1.2",
    shadow_policy_version:
      "scanner_candidate_ranking_verified_intraday_liquidity_v1",
    candidate_count: 1,
    candidate_tickers: [candidate.ticker],
    verified_intraday_volume_count: 1,
    missing_verified_intraday_volume_count: 0,
    baseline_selected_tickers: [candidate.ticker],
    shadow_selected_tickers: [candidate.ticker],
    selection_changed: false,
    live_ranking_effect: false,
    publication_effect: false,
    quality_improvement_claimed: false,
    quality_evidence_status: "not_evaluated",
    reason_codes: [],
    displacements: [
      {
        ticker: candidate.ticker,
        baseline_rank: decisionCandidate.ranking!.rank,
        shadow_rank: 1,
        rank_change: 0,
        baseline_score: decisionCandidate.ranking!.score,
        shadow_score: decisionCandidate.ranking!.score,
        score_change: 0,
        baseline_tier: decisionCandidate.ranking!.tier,
        shadow_tier: decisionCandidate.ranking!.tier,
        baseline_selected: true,
        shadow_selected: true,
        daily_volume_ratio: 1.8,
        verified_intraday_volume_ratio: 1.8,
        shadow_liquidity_score: 8,
        shadow_reason_codes: [],
      },
    ],
  };
  const attribution = buildScannerIntradayLiquidityShadowAttribution({
    comparison,
    decisionRecord: record,
  });
  expect(attribution?.status).toBe("attributed");
  const persistedRun = {
    ...scanRun,
    payload_json: {
      ...scanRun.payload_json,
      candidate_decision_record: record,
      scanner_intraday_liquidity_shadow_comparison: comparison,
      scanner_intraday_liquidity_shadow_attribution: attribution,
    },
  };
  const snapshot = buildRecommendationSnapshot({
    recommendation_id: null,
    scan_run_id: scanRun.run_fingerprint,
    ticker: candidate.ticker,
    company_name: candidate.company_name,
    recommended_at: DECIDED_AT,
    app_timestamp: DECIDED_AT,
    window: "midday",
    source_mode: "research_only",
    data_mode: "research_only",
    is_visible: false,
    is_real: true,
    entry: 100,
    stop: 96,
    target: 108,
    side: "long",
    confidence: 82,
    payload: {
      visibility_status: "research_only",
      research_only: true,
      learning_scope: "research_only",
      candidate_id: decisionCandidate.candidate_id,
      candidate_decision_id: decisionCandidate.candidate_id,
      candidate_decision_disposition: decisionCandidate.disposition,
      candidate_decision_linkage_version:
        RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
      candidate_decision_linkage_status: "verified",
      data_timestamp: "2026-09-26T14:29:00.000Z",
      intraday_indicator_response_identity: {
        contract_version: "twelve_data_response_identity_v1",
        digest_algorithm: "sha256",
        payload_sha256: `sha256:${"1".repeat(64)}`,
        payload_byte_length: 214,
      },
      decision_feature_vector:
        recommendationDecisionFeatureVectorFromScannerCandidate(candidate),
      provider_source: "twelve_data",
      provider_version: "provider_test_v1",
      market_data_adapter_version: "adapter_test_v1",
      build_marker: "test-build-v1",
    },
  });
  const evaluationAnchor = recommendationOutcomeEvaluationAnchorFromSnapshot(
    snapshot,
  );
  expect(evaluationAnchor).not.toBeNull();
  const computed = computeRecommendationOutcome({
    snapshot,
    horizon: "60m",
    evaluated_at: "2026-09-26T15:35:00.000Z",
    source: "intraday_candles",
    provider: "twelve_data",
    data_completeness: "complete",
    candles: [
      {
        timestamp: "2026-09-26T14:31:00.000Z",
        open: 100,
        high: 101,
        low: 99,
        close: 100,
      },
      {
        timestamp: "2026-09-26T14:36:00.000Z",
        open: 100,
        high: 108,
        low: 99,
        close: 107,
      },
    ],
  }).outcome;
  const outcome = {
    ...computed,
    payload_json: {
      ...computed.payload_json,
      canonical_provider_coverage: {
        contract_version: CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION,
        provider_status: "available",
        freshness: "fresh",
        expected_candle_count: 2,
        observed_candle_count: 2,
        malformed_candle_count: 0,
        blockers: [],
        candle_interval: "5min",
        horizon: "60m",
        request_start_at: evaluationAnchor!.evaluation_anchor_start_at,
        request_end_at: "2026-09-26T15:30:00.000Z",
        required_horizon_end_at: "2026-09-26T15:30:00.000Z",
        horizon_elapsed: true,
        response_status: "available",
        evaluation_anchor_contract_version:
          "recommendation_outcome_evaluation_anchor_v1",
        decision_timestamp: evaluationAnchor!.decision_timestamp,
        evaluation_anchor_start_at:
          evaluationAnchor!.evaluation_anchor_start_at,
        decision_to_anchor_seconds:
          evaluationAnchor!.decision_to_anchor_seconds,
        decision_timestamp_interval_aligned:
          evaluationAnchor!.decision_timestamp_interval_aligned,
      },
    },
  };

  return { persistedRun, snapshot, outcome };
}

test("compares exact baseline and shadow selections against canonical outcomes", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const projection = buildScannerIntradayLiquidityShadowOutcomeProjection({
    scanRuns: [persistedRun],
    snapshots: [snapshot],
    outcomes: [outcome],
  });

  expect(projection).toMatchObject({
    contract_version:
      SCANNER_INTRADAY_LIQUIDITY_SHADOW_OUTCOME_PROJECTION_VERSION,
    status: "comparable",
    coverage: {
      attribution_receipts_found: 1,
      attributed_scan_runs: 1,
      selected_union_candidate_count: 1,
      exact_snapshot_link_count: 1,
      complete_primary_outcome_count: 1,
      incomplete_candidate_count: 0,
      conflicting_candidate_count: 0,
    },
    baseline: {
      selected_candidate_count: 1,
      complete_primary_outcome_count: 1,
    },
    shadow: {
      selected_candidate_count: 1,
      complete_primary_outcome_count: 1,
    },
    observed_deltas: {
      entry_triggered_rate: 0,
      mean_current_r: null,
      target_minus_stop_rate: 0,
    },
    promotion_readiness: "blocked_insufficient_evidence",
    quality_improvement_claimed: false,
    live_ranking_effect: false,
    publication_effect: false,
    outcome_join_basis: "candidate_decision_id",
  });
  expect(projection.reason_codes).toEqual([
    "minimum_forward_outcome_sample_not_met",
  ]);
});

test("preserves a missing exact snapshot as an explicit coverage gap", () => {
  const { persistedRun, outcome } = fixture();
  const projection = buildScannerIntradayLiquidityShadowOutcomeProjection({
    scanRuns: [persistedRun],
    snapshots: [],
    outcomes: [outcome],
  });

  expect(projection.status).toBe("coverage_incomplete");
  expect(projection.coverage).toMatchObject({
    selected_union_candidate_count: 1,
    exact_snapshot_link_count: 0,
    complete_primary_outcome_count: 0,
    incomplete_candidate_count: 1,
  });
  expect(projection.reason_codes).toEqual([
    "minimum_forward_outcome_sample_not_met",
    "selected_candidate_snapshot_missing",
  ]);
});

test("fails closed when a persisted attribution receipt is malformed", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const malformedRun = {
    ...persistedRun,
    payload_json: {
      ...persistedRun.payload_json,
      scanner_intraday_liquidity_shadow_attribution: {
        ...(persistedRun.payload_json
          .scanner_intraday_liquidity_shadow_attribution as Record<
          string,
          unknown
        >),
        scan_run_fingerprint: "wrong-fingerprint",
      },
    },
  };
  const projection = buildScannerIntradayLiquidityShadowOutcomeProjection({
    scanRuns: [malformedRun],
    snapshots: [snapshot],
    outcomes: [outcome],
  });

  expect(projection.status).toBe("conflicting");
  expect(projection.coverage).toMatchObject({
    attribution_receipts_found: 1,
    attributed_scan_runs: 0,
    conflicting_or_malformed_scan_runs: 1,
    complete_primary_outcome_count: 0,
  });
  expect(projection.reason_codes).toEqual([
    "minimum_forward_outcome_sample_not_met",
    "no_valid_shadow_attribution_receipt",
    "shadow_attribution_or_decision_lineage_conflicting",
  ]);
});

test("maps a complete persisted scan into the canonical paired rank evaluator", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const result = evaluateScannerIntradayLiquidityShadowScan({
    scanRun: persistedRun,
    snapshots: [snapshot],
    outcomes: [outcome],
    bootstrapSeed: "intraday-liquidity-shadow:test-seed-v1",
  });

  expect(result.status, JSON.stringify(result, null, 2)).toBe(
    "probability_semantics_missing",
  );
  expect(result.coverage).toEqual({
    expected_candidate_count: 1,
    exact_snapshot_count: 1,
    canonical_primary_outcome_count: 1,
  });
  expect(result.evaluation).toMatchObject({
    status: "probability_semantics_missing",
    shadow_only: true,
    live_ranking_effect: false,
    causal_improvement_claimed: false,
    pairing_evidence: {
      version_difference_set: {
        differences: ["ranking_version"],
      },
    },
  });
  expect(result.reason_codes).toContain(
    "confidence_is_ordinal_not_probability",
  );
  expect(result.reason_codes).toContain("threshold_sweep_diagnostic_only");
  expect(result).toMatchObject({
    threshold_policy_semantics: "diagnostic_all_candidates_only",
    shadow_only: true,
    live_ranking_effect: false,
    publication_effect: false,
    causal_improvement_claimed: false,
  });
});

test("refuses canonical ranking evaluation when any candidate outcome is missing", () => {
  const { persistedRun, snapshot } = fixture();
  const result = evaluateScannerIntradayLiquidityShadowScan({
    scanRun: persistedRun,
    snapshots: [snapshot],
    outcomes: [],
    bootstrapSeed: "intraday-liquidity-shadow:test-seed-v1",
  });

  expect(result.status).toBe("insufficient_evidence");
  expect(result.evaluation).toBeNull();
  expect(result.coverage).toEqual({
    expected_candidate_count: 1,
    exact_snapshot_count: 1,
    canonical_primary_outcome_count: 0,
  });
  expect(result.reason_codes).toEqual([
    "candidate_primary_outcome_incomplete",
    "complete_candidate_outcome_coverage_required",
  ]);
});

test("fails closed when persisted comparison scores drift from the attribution", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const comparison = structuredClone(
    persistedRun.payload_json
      .scanner_intraday_liquidity_shadow_comparison as ScannerIntradayLiquidityShadowComparison,
  );
  comparison.displacements[0]!.baseline_score += 1;
  const tamperedRun = {
    ...persistedRun,
    payload_json: {
      ...persistedRun.payload_json,
      scanner_intraday_liquidity_shadow_comparison: comparison,
    },
  };
  const result = evaluateScannerIntradayLiquidityShadowScan({
    scanRun: tamperedRun,
    snapshots: [snapshot],
    outcomes: [outcome],
    bootstrapSeed: "intraday-liquidity-shadow:test-seed-v1",
  });

  expect(result.status).toBe("conflicting");
  expect(result.evaluation).toBeNull();
  expect(result.reason_codes).toEqual([
    "shadow_scan_lineage_or_comparison_conflicting",
  ]);
});
