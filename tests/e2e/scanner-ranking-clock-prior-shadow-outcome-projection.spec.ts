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
import { buildScannerClockPriorShadowAttribution } from "@/lib/scanner-ranking-clock-prior-shadow-attribution";
import { SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION } from "@/lib/scanner-clock-prior-shadow-evidence-reuse";
import {
  buildScannerClockPriorShadowOutcomeProjection,
  SCANNER_CLOCK_PRIOR_SHADOW_OUTCOME_PROJECTION_VERSION,
} from "@/lib/scanner-ranking-clock-prior-shadow-outcome-projection";
import {
  evaluateScannerClockPriorShadowScan,
  SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION,
} from "@/lib/server/scanner-clock-prior-shadow-canonical-evaluation";
import {
  buildScannerClockPriorShadowForwardDecisionPlan,
  buildScannerClockPriorShadowPolicyReference,
  classifyScannerClockPriorShadowForwardPrecisionDecision,
  evaluateScannerClockPriorShadowForwardDecision,
  type ScannerClockPriorShadowForwardPartitionResult,
  type ScannerClockPriorShadowForwardEvidenceBindings,
} from "@/lib/server/scanner-clock-prior-shadow-forward-decision";
import type { ScannerClockPriorShadowComparison } from "@/lib/scanner-ranking-clock-prior-shadow";
import type { ScannerCandidate } from "@/lib/scanner";

const DECIDED_AT = "2026-09-26T14:30:00.000Z";
function marketRegimeContext(decidedAt: string) {
  return {
    contract_version: "market_regime_decision_context_v1" as const,
    classifier_version: "market_regime_v1" as const,
    captured_at: decidedAt,
    regime: "risk_on" as const,
  };
}

function scannerCandidate(input: {
  decidedAt?: string;
  ticker?: string;
} = {}): ScannerCandidate & { local_score: number } {
  const decidedAt = input.decidedAt ?? DECIDED_AT;
  const ticker = input.ticker ?? "FIT";
  return {
    ticker,
    company_name: `${ticker} Incorporated`,
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
    intraday_indicator_cached_at: decidedAt,
    reference_price_timestamp: decidedAt,
    reference_price_provider: "twelve_data",
    local_score: 96,
  };
}

function fixture(input: {
  decidedAt?: string;
  ticker?: string;
  terminal?: "target" | "stop";
  includeUnselected?: boolean;
} = {}) {
  const decidedAt = input.decidedAt ?? DECIDED_AT;
  const terminal = input.terminal ?? "target";
  const candidate = scannerCandidate({
    decidedAt,
    ticker: input.ticker,
  });
  const unselectedCandidate = input.includeUnselected
    ? {
        ...scannerCandidate({
          decidedAt,
          ticker: `${candidate.ticker}X`,
        }),
        local_score: 55,
      }
    : null;
  const candidates = unselectedCandidate
    ? [candidate, unselectedCandidate]
    : [candidate];
  const regimeContext = marketRegimeContext(decidedAt);
  const isoAfter = (minutes: number) =>
    new Date(Date.parse(decidedAt) + minutes * 60_000).toISOString();
  const ranking = buildScannerCandidateRankingSummary({
    candidates,
    targetMin: 1,
    targetMax: 1,
    now: new Date(decidedAt),
  });
  const scanRun = buildRecommendationScanRun({
    trading_date: decidedAt.slice(0, 10),
    observed_at: decidedAt,
    completed_at: decidedAt,
    window: "midday",
    source: "supabase",
    scanned_ticker_count: candidates.length,
    raw_candidate_count: candidates.length,
  });
  const capture = buildCandidateDecisionCapture({
    captureTimestamp: decidedAt,
    universe: candidates,
    observedCandidates: candidates,
    ranking,
    eligibleCandidateTickers: candidates.map((item) => item.ticker),
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
  const comparison: ScannerClockPriorShadowComparison = {
    comparison_version: "scanner_clock_prior_shadow_comparison_v1",
    comparison_kind: "scanner_clock_prior_shadow_comparison",
    generated_at: decidedAt,
    status: "comparable",
    baseline_policy_version: "scanner_candidate_ranking_v1.2",
    shadow_policy_version: "scanner_candidate_ranking_clock_neutral_v1",
    hypothesis: "named_clock_priors_add_quality_beyond_observed_features",
    candidate_count: candidates.length,
    candidate_tickers: candidates.map((item) => item.ticker),
    baseline_selected_tickers: [candidate.ticker],
    shadow_selected_tickers: [candidate.ticker],
    selection_changed: false,
    live_ranking_effect: false,
    publication_effect: false,
    execution_effect: false,
    quality_improvement_claimed: false,
    quality_evidence_status: "not_evaluated",
    reason_codes: [],
    displacements: record!.candidates.map((item) => {
      const sourceCandidate = candidates.find(
        (source) => source.ticker === item.ticker,
      )!;
      return {
        ticker: item.ticker,
        baseline_rank: item.ranking!.rank,
        shadow_rank: item.ranking!.rank,
        rank_change: 0,
        baseline_score: item.ranking!.score,
        shadow_score: item.ranking!.score,
        score_change: 0,
        baseline_tier: item.ranking!.tier,
        shadow_tier: item.ranking!.tier,
        baseline_selected: item.ranking!.selected,
        shadow_selected: item.ranking!.selected,
        legacy_timing_score: 50,
        baseline_signal_strength: sourceCandidate.local_score,
        shadow_signal_strength: sourceCandidate.local_score,
        baseline_window_fit: 50,
        shadow_window_fit: 50,
        legacy_setup_classification_bonus_removed: 0,
        legacy_clock_warning_count: 0,
        baseline_warnings_penalty: 0,
        shadow_warnings_penalty: 0,
      };
    }),
  };
  const attribution = buildScannerClockPriorShadowAttribution({
    comparison,
    decisionRecord: record,
  });
  expect(attribution?.status).toBe("attributed");
  const persistedRun = {
    ...scanRun,
    payload_json: {
      ...scanRun.payload_json,
      market_regime: { regime: "risk_on" },
      market_regime_context: regimeContext,
      candidate_decision_record: record,
      scanner_clock_prior_shadow_comparison: comparison,
      scanner_clock_prior_shadow_attribution: attribution,
      scanner_clock_prior_shadow_evidence_reuse: {
        reuse_version: SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION,
        reuse_kind: "scanner_clock_prior_shadow_evidence_reuse",
        status: "ready",
        scan_run_id: attribution!.scan_run_id,
        scan_run_fingerprint: attribution!.scan_run_fingerprint,
        comparison_version: comparison.comparison_version,
        baseline_policy_version: comparison.baseline_policy_version,
        shadow_policy_version: comparison.shadow_policy_version,
        candidate_count: candidates.length,
        visible_snapshot_tickers: [],
        research_snapshot_tickers: candidates.map((item) => item.ticker),
        missing_snapshot_tickers: [],
        covered_candidate_count: candidates.length,
        complete_population_reused: true,
        source_capture_version:
          "scanner_intraday_liquidity_shadow_evidence_capture_v1",
        provider_requests_added: 0,
        provider_credits_added: 0,
        live_ranking_effect: false,
        publication_effect: false,
        execution_effect: false,
        quality_improvement_claimed: false,
        reason_codes: [],
      },
    },
  };
  const evidence = candidates.map((sourceCandidate) => {
    const linkedDecision = record!.candidates.find(
      (item) => item.ticker === sourceCandidate.ticker,
    )!;
    const snapshot = buildRecommendationSnapshot({
      recommendation_id: null,
      scan_run_id: scanRun.run_fingerprint,
      ticker: sourceCandidate.ticker,
      company_name: sourceCandidate.company_name,
      recommended_at: decidedAt,
      app_timestamp: decidedAt,
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
        market_regime: { regime: "risk_on" },
        market_regime_context: regimeContext,
        visibility_status: "research_only",
        research_only: true,
        learning_scope: "research_only",
        candidate_id: linkedDecision.candidate_id,
        candidate_decision_id: linkedDecision.candidate_id,
        candidate_decision_disposition: linkedDecision.disposition,
        candidate_decision_linkage_version:
          RESEARCH_SNAPSHOT_CANDIDATE_DECISION_LINKAGE_VERSION,
        candidate_decision_linkage_status: "verified",
        clock_prior_shadow_evidence_sample: true,
        clock_prior_shadow_evidence_reuse_version:
          SCANNER_CLOCK_PRIOR_SHADOW_EVIDENCE_REUSE_VERSION,
        data_timestamp: isoAfter(-1),
        intraday_indicator_response_identity: {
          contract_version: "twelve_data_response_identity_v1",
          digest_algorithm: "sha256",
          payload_sha256: `sha256:${"1".repeat(64)}`,
          payload_byte_length: 214,
        },
        decision_feature_vector:
          recommendationDecisionFeatureVectorFromScannerCandidate(
            sourceCandidate,
          ),
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
      evaluated_at: isoAfter(65),
      source: "intraday_candles",
      provider: "twelve_data",
      data_completeness: "complete",
      candles: [
        {
          timestamp: isoAfter(1),
          open: 100,
          high: 101,
          low: 99,
          close: 100,
        },
        {
          timestamp: isoAfter(6),
          open: 100,
          high: terminal === "target" ? 108 : 101,
          low: terminal === "stop" ? 95 : 99,
          close: terminal === "target" ? 107 : 96,
        },
      ],
    }).outcome;
    const outcome = {
      ...computed,
      payload_json: {
        ...computed.payload_json,
        canonical_provider_coverage: {
          contract_version:
            CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION,
          provider_status: "available",
          freshness: "fresh",
          expected_candle_count: 2,
          observed_candle_count: 2,
          malformed_candle_count: 0,
          blockers: [],
          candle_interval: "5min",
          horizon: "60m",
          request_start_at: evaluationAnchor!.evaluation_anchor_start_at,
          request_end_at: isoAfter(60),
          required_horizon_end_at: isoAfter(60),
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
    return { snapshot, outcome };
  });
  const snapshots = evidence.map((item) => item.snapshot);
  const outcomes = evidence.map((item) => item.outcome);

  return {
    persistedRun,
    snapshot: snapshots[0]!,
    outcome: outcomes[0]!,
    snapshots,
    outcomes,
  };
}

test("compares exact baseline and shadow selections against canonical outcomes", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const projection = buildScannerClockPriorShadowOutcomeProjection({
    scanRuns: [persistedRun],
    snapshots: [snapshot],
    outcomes: [outcome],
  });

  expect(projection).toMatchObject({
    contract_version:
      SCANNER_CLOCK_PRIOR_SHADOW_OUTCOME_PROJECTION_VERSION,
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
    execution_effect: false,
    outcome_join_basis: "candidate_decision_id",
  });
  expect(projection.reason_codes).toEqual([
    "minimum_forward_outcome_sample_not_met",
  ]);
});

test("preserves a missing exact snapshot as an explicit coverage gap", () => {
  const { persistedRun, outcome } = fixture();
  const projection = buildScannerClockPriorShadowOutcomeProjection({
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
      scanner_clock_prior_shadow_attribution: {
        ...(persistedRun.payload_json
          .scanner_clock_prior_shadow_attribution as Record<
          string,
          unknown
        >),
        scan_run_fingerprint: "wrong-fingerprint",
      },
    },
  };
  const projection = buildScannerClockPriorShadowOutcomeProjection({
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
    "clock_prior_attribution_or_decision_lineage_conflicting",
    "minimum_forward_outcome_sample_not_met",
    "no_valid_clock_prior_attribution_receipt",
  ]);
});

test("fails closed when the persisted comparison and attribution disagree", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const comparison = persistedRun.payload_json
    .scanner_clock_prior_shadow_comparison as ScannerClockPriorShadowComparison;
  const conflictingRun = {
    ...persistedRun,
    payload_json: {
      ...persistedRun.payload_json,
      scanner_clock_prior_shadow_comparison: {
        ...comparison,
        generated_at: "2026-09-26T14:29:59.000Z",
      },
    },
  };
  const projection = buildScannerClockPriorShadowOutcomeProjection({
    scanRuns: [conflictingRun],
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
    "clock_prior_attribution_or_decision_lineage_conflicting",
    "minimum_forward_outcome_sample_not_met",
    "no_valid_clock_prior_attribution_receipt",
  ]);
});

test("maps the exact clock-neutral cohort into the canonical paired rank evaluator", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const result = evaluateScannerClockPriorShadowScan({
    scanRun: persistedRun,
    snapshots: [snapshot],
    outcomes: [outcome],
    bootstrapSeed: "clock-prior-shadow:test-seed-v1",
  });

  expect(result.adapter_version).toBe(
    SCANNER_CLOCK_PRIOR_SHADOW_CANONICAL_EVALUATION_ADAPTER_VERSION,
  );
  expect(result.status, JSON.stringify(result, null, 2)).toBe(
    "probability_semantics_missing",
  );
  expect(result.coverage).toEqual({
    expected_candidate_count: 1,
    exact_snapshot_count: 1,
    canonical_primary_outcome_count: 1,
  });
  expect(result.candidate_performance_at_k_version).toBe(
    "scanner_ranking_shadow_candidate_performance_at_k_v1",
  );
  expect(result.candidate_performance_at_k?.["1"]?.expectancy_r).toEqual({
    value: 2,
    numerator: 2,
    denominator: 1,
    identity_count: 1,
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

test("refuses clock-neutral canonical evaluation without every primary outcome", () => {
  const { persistedRun, snapshot } = fixture();
  const result = evaluateScannerClockPriorShadowScan({
    scanRun: persistedRun,
    snapshots: [snapshot],
    outcomes: [],
    bootstrapSeed: "clock-prior-shadow:test-seed-v1",
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

test("fails clock-neutral canonical evaluation closed on comparison drift", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const comparison = structuredClone(
    persistedRun.payload_json
      .scanner_clock_prior_shadow_comparison as ScannerClockPriorShadowComparison,
  );
  comparison.generated_at = "2026-09-26T14:29:59.000Z";
  const result = evaluateScannerClockPriorShadowScan({
    scanRun: {
      ...persistedRun,
      payload_json: {
        ...persistedRun.payload_json,
        scanner_clock_prior_shadow_comparison: comparison,
      },
    },
    snapshots: [snapshot],
    outcomes: [outcome],
    bootstrapSeed: "clock-prior-shadow:test-seed-v1",
  });

  expect(result.status).toBe("conflicting");
  expect(result.evaluation).toBeNull();
  expect(result.reason_codes).toEqual([
    "shadow_scan_lineage_or_comparison_conflicting",
  ]);
});

test("fails clock-neutral canonical evaluation closed without decision-time regime", () => {
  const { persistedRun, snapshot, outcome } = fixture();
  const result = evaluateScannerClockPriorShadowScan({
    scanRun: {
      ...persistedRun,
      payload_json: {
        ...persistedRun.payload_json,
        market_regime: undefined,
        market_regime_context: undefined,
      },
    },
    snapshots: [snapshot],
    outcomes: [outcome],
    bootstrapSeed: "clock-prior-shadow:test-seed-v1",
  });

  expect(result.status).toBe("insufficient_evidence");
  expect(result.reason_codes).toEqual([
    "decision_market_regime_context_missing",
  ]);
});

test("refuses canonical evaluation without the explicit full-population reuse receipt", () => {
  const { persistedRun, snapshot, outcome } = fixture();

  const result = evaluateScannerClockPriorShadowScan({
    scanRun: {
      ...persistedRun,
      payload_json: {
        ...persistedRun.payload_json,
        scanner_clock_prior_shadow_evidence_reuse: undefined,
      },
    },
    snapshots: [snapshot],
    outcomes: [outcome],
    bootstrapSeed: "clock-prior-shadow:missing-capture-v1",
  });

  expect(result).toMatchObject({
    status: "insufficient_evidence",
    reason_codes: [
      "clock_prior_full_population_capture_missing_or_conflicting",
    ],
    shadow_only: true,
    live_ranking_effect: false,
    publication_effect: false,
    causal_improvement_claimed: false,
  });
});

test("records zero-candidate no-trade as valid lineage without claiming quality", () => {
  const { persistedRun } = fixture();
  const decisionRecord = structuredClone(
    persistedRun.payload_json.candidate_decision_record,
  ) as NonNullable<ReturnType<typeof buildCandidateDecisionRecord>>;
  decisionRecord.coverage.expected_candidate_count = 0;
  decisionRecord.coverage.observed_candidate_count = 0;
  decisionRecord.coverage.ranked_candidate_count = 0;
  decisionRecord.candidates = [];
  const comparison = structuredClone(
    persistedRun.payload_json
      .scanner_clock_prior_shadow_comparison as ScannerClockPriorShadowComparison,
  );
  comparison.candidate_count = 0;
  comparison.candidate_tickers = [];
  comparison.baseline_selected_tickers = [];
  comparison.shadow_selected_tickers = [];
  comparison.selection_changed = false;
  comparison.displacements = [];
  const attribution = buildScannerClockPriorShadowAttribution({
    comparison,
    decisionRecord,
  });
  expect(attribution?.status).toBe("attributed");

  const result = evaluateScannerClockPriorShadowScan({
    scanRun: {
      ...persistedRun,
      payload_json: {
        ...persistedRun.payload_json,
        candidate_decision_record: decisionRecord,
        scanner_clock_prior_shadow_comparison: comparison,
        scanner_clock_prior_shadow_attribution: attribution,
        scanner_clock_prior_shadow_evidence_reuse: {
          ...persistedRun.payload_json
            .scanner_clock_prior_shadow_evidence_reuse as Record<string, unknown>,
          candidate_count: 0,
          visible_snapshot_tickers: [],
          research_snapshot_tickers: [],
          missing_snapshot_tickers: [],
          covered_candidate_count: 0,
          complete_population_reused: true,
        },
      },
    },
    snapshots: [],
    outcomes: [],
    bootstrapSeed: "clock-prior-shadow:zero-candidate-test-seed-v1",
  });

  expect(result).toMatchObject({
    status: "insufficient_evidence",
    evaluation: null,
    coverage: {
      expected_candidate_count: 0,
      exact_snapshot_count: 0,
      canonical_primary_outcome_count: 0,
    },
    reason_codes: ["no_ranked_candidates_to_evaluate"],
    shadow_only: true,
    live_ranking_effect: false,
    publication_effect: false,
    causal_improvement_claimed: false,
  });
});

const FORWARD_HYPOTHESIS =
  "Removing named clock priors improves canonical top-one ranking precision without changing the eligible population.";
const FORWARD_OWNER_ID = "11111111-1111-4111-8111-111111111111";
const FORWARD_CHARTER_ID = "22222222-2222-4222-8222-222222222222";
const FORWARD_SEGMENT_KEY = "clock-prior:all-us-equities";
const FORWARD_CHARTER_FINGERPRINT = "a".repeat(64);

const builtForwardPolicyReference = buildScannerClockPriorShadowPolicyReference({
  createdAt: "2026-09-23T12:00:00.000Z",
  charter: {
    charter_id: FORWARD_CHARTER_ID,
    charter_fingerprint: FORWARD_CHARTER_FINGERPRINT,
    owner_user_id: FORWARD_OWNER_ID,
    segment_key: FORWARD_SEGMENT_KEY,
    policy_attribution: {
      recommendation_publish_policy_version: "publish_v1",
      canonical_evaluation_versions: {
        engine_version: "engine_v1",
        scoring_version: "scoring_v1",
        ranking_version: "scanner_candidate_ranking_v1.2",
        setup_taxonomy_version: "setup_v1",
        confidence_contract_version: "confidence_v1",
        evaluator_version: "evaluator_v1",
        provider_contract_version: "provider_v1",
        git_commit: "fixture-commit",
        build_identity: "fixture-build",
      },
    },
    charter: {
      contract_version: "recommendation_evaluation_charter_v1",
      hypothesis: FORWARD_HYPOTHESIS,
      eligible_universe: "US equities",
      setup_slices: ["all_setups"],
      regime_slices: ["all_regimes"],
      outcome_rules: {
        primary_horizon: "60m",
        diagnostic_horizons: ["15m", "30m", "60m"],
        semantics: "Canonical terminal outcomes for shadow ranking evaluation.",
      },
      evaluation_window: {
        minimum_complete_decisions: 10,
        held_out_decision_count: 5,
        walk_forward_decision_count: 5,
      },
      thresholds: {
        minimum_precision_at_k: 0.5,
        minimum_expectancy_r: 0,
        maximum_calibration_error: 0.2,
        minimum_outcome_coverage: 0.9,
        maximum_missingness: 0.1,
        maximum_provider_credits_per_decision: 8,
        minimum_reliability: 0.9,
      },
      concentration_limits: {
        maximum_single_ticker_share: 0.25,
        maximum_single_sector_share: 0.5,
        maximum_single_setup_share: 1,
        maximum_single_regime_share: 1,
      },
      feasibility_inputs: {
        spread: "required",
        liquidity: "required",
        volatility: "required",
        halt_risk: "required",
        trigger_attainment: "required",
        conservative_slippage: "required",
      },
    },
    created_at: "2026-09-23T12:00:00.000Z",
  },
});
if (!builtForwardPolicyReference) {
  throw new Error("forward policy reference fixture must build");
}
const forwardPolicyReference = builtForwardPolicyReference;

function forwardEvidenceBindings(): ScannerClockPriorShadowForwardEvidenceBindings {
  return {
    evaluation_charter: {
      charter_id: FORWARD_CHARTER_ID,
      charter_fingerprint: FORWARD_CHARTER_FINGERPRINT,
      owner_user_id: FORWARD_OWNER_ID,
      segment_key: FORWARD_SEGMENT_KEY,
      hypothesis: FORWARD_HYPOTHESIS,
      baseline_ranking_version: "scanner_candidate_ranking_v1.2",
      created_at: "2026-09-23T12:00:00.000Z",
    },
    policy_reference: {
      reference_fingerprint: forwardPolicyReference.reference_fingerprint,
      owner_user_id: FORWARD_OWNER_ID,
      segment_key: FORWARD_SEGMENT_KEY,
      evaluation_charter_fingerprint: FORWARD_CHARTER_FINGERPRINT,
      baseline_ranking_version: "scanner_candidate_ranking_v1.2",
      candidate_ranking_version: "scanner_candidate_ranking_clock_neutral_v1",
      created_at: "2026-09-23T12:00:00.000Z",
    },
  };
}

function forwardDecisionPlan() {
  const plan = buildScannerClockPriorShadowForwardDecisionPlan({
    created_at: "2026-09-24T12:00:00.000Z",
    owner_user_id: FORWARD_OWNER_ID,
    segment_key: FORWARD_SEGMENT_KEY,
    hypothesis: FORWARD_HYPOTHESIS,
    evaluation_charter_id: FORWARD_CHARTER_ID,
    evaluation_charter_fingerprint: FORWARD_CHARTER_FINGERPRINT,
    policy_reference: forwardPolicyReference,
    baseline_ranking_version: "scanner_candidate_ranking_v1.2",
    candidate_ranking_version: "scanner_candidate_ranking_clock_neutral_v1",
    primary_k: 1,
    windows: {
      held_out: {
        start_at: "2026-09-25T13:30:00.000Z",
        end_at: "2026-10-02T00:00:00.000Z",
        minimum_opportunity_sets: 5,
        minimum_ranked_candidates: 10,
        minimum_trading_days: 5,
      },
      walk_forward: {
        start_at: "2026-10-02T13:30:00.000Z",
        end_at: "2026-10-09T00:00:00.000Z",
        minimum_opportunity_sets: 5,
        minimum_ranked_candidates: 10,
        minimum_trading_days: 5,
      },
    },
    thresholds: {
      continue_minimum_precision_delta: 0.01,
      reject_maximum_precision_delta: -0.01,
    },
  });
  expect(plan).not.toBeNull();
  return plan!;
}

test("withholds a complete cohort until the full recommendation-quality charter is satisfied", () => {
  const heldOut = [
    "2026-09-25",
    "2026-09-28",
    "2026-09-29",
    "2026-09-30",
    "2026-10-01",
  ].map((day, index) => fixture({
    decidedAt: `${day}T14:30:00.000Z`,
    ticker: `H${index}D`,
    terminal: index % 2 === 0 ? "target" : "stop",
    includeUnselected: true,
  }));
  const walkForward = [
    "2026-10-02",
    "2026-10-05",
    "2026-10-06",
    "2026-10-07",
    "2026-10-08",
  ].map((day, index) => fixture({
    decidedAt: `${day}T14:30:00.000Z`,
    ticker: `F${index}D`,
    terminal: index % 2 === 0 ? "stop" : "target",
    includeUnselected: true,
  }));
  const cohort = [...heldOut, ...walkForward];
  const result = evaluateScannerClockPriorShadowForwardDecision({
    plan: forwardDecisionPlan(),
    evidenceBindings: forwardEvidenceBindings(),
    scanRuns: cohort.map((item) => item.persistedRun),
    snapshots: cohort.flatMap((item) => item.snapshots),
    outcomes: cohort.flatMap((item) => item.outcomes),
    bootstrapSeed: "clock-prior-forward:test-seed-v1",
  });

  expect(result).toMatchObject({
    status: "evidence_incomplete",
    decision: "pending",
    evidence_binding: {
      owner_user_id: FORWARD_OWNER_ID,
      segment_key: FORWARD_SEGMENT_KEY,
      evaluation_charter_id: FORWARD_CHARTER_ID,
      evaluation_charter_fingerprint: FORWARD_CHARTER_FINGERPRINT,
      policy_reference_fingerprint: forwardPolicyReference.reference_fingerprint,
    },
    shadow_only: true,
    live_ranking_effect: false,
    publication_effect: false,
    causal_improvement_claimed: false,
    authority: {
      can_change_ranking_or_publication: false,
      can_promote_policy: false,
      can_request_provider_data: false,
      can_execute_broker_action: false,
    },
  });
  expect(result.partitions).toEqual([
    expect.objectContaining({
      partition: "held_out",
      opportunity_set_count: 5,
      ranked_candidate_count: 10,
      trading_day_count: 5,
      evidence_complete: false,
    }),
    expect.objectContaining({
      partition: "walk_forward",
      opportunity_set_count: 5,
      ranked_candidate_count: 10,
      trading_day_count: 5,
      evidence_complete: false,
    }),
  ]);
  expect(result.reason_codes).toEqual(expect.arrayContaining([
    "candidate_calibrated_probability_semantics_missing",
    "candidate_precision_charter_minimum_not_met",
    "forward_charter_scorecard_incomplete",
  ]));
});

test("withholds a complete cohort whose candidate expectancy misses the charter", () => {
  const heldOut = [
    "2026-09-25",
    "2026-09-28",
    "2026-09-29",
    "2026-09-30",
    "2026-10-01",
  ].map((day, index) => fixture({
    decidedAt: `${day}T14:30:00.000Z`,
    ticker: `E${index}H`,
    terminal: "stop",
    includeUnselected: true,
  }));
  const walkForward = [
    "2026-10-02",
    "2026-10-05",
    "2026-10-06",
    "2026-10-07",
    "2026-10-08",
  ].map((day, index) => fixture({
    decidedAt: `${day}T14:30:00.000Z`,
    ticker: `E${index}F`,
    terminal: "stop",
    includeUnselected: true,
  }));
  const cohort = [...heldOut, ...walkForward];
  const result = evaluateScannerClockPriorShadowForwardDecision({
    plan: forwardDecisionPlan(),
    evidenceBindings: forwardEvidenceBindings(),
    scanRuns: cohort.map((item) => item.persistedRun),
    snapshots: cohort.flatMap((item) => item.snapshots),
    outcomes: cohort.flatMap((item) => item.outcomes),
    bootstrapSeed: "clock-prior-forward:weak-expectancy-seed-v1",
  });

  expect(result).toMatchObject({
    status: "evidence_incomplete",
    decision: "pending",
    shadow_only: true,
    live_ranking_effect: false,
    publication_effect: false,
  });
  expect(result.reason_codes).toEqual(expect.arrayContaining([
    "candidate_expectancy_charter_minimum_not_met",
    "candidate_precision_charter_minimum_not_met",
    "forward_charter_scorecard_incomplete",
  ]));
});

test("withholds a forward decision when canonical outcomes or a declared partition are incomplete", () => {
  const heldOut = fixture({
    decidedAt: "2026-09-25T14:30:00.000Z",
    ticker: "HLD",
  });
  const result = evaluateScannerClockPriorShadowForwardDecision({
    plan: forwardDecisionPlan(),
    evidenceBindings: forwardEvidenceBindings(),
    scanRuns: [heldOut.persistedRun],
    snapshots: [heldOut.snapshot],
    outcomes: [],
    bootstrapSeed: "clock-prior-forward:incomplete-test-seed-v1",
  });

  expect(result.status).toBe("evidence_incomplete");
  expect(result.decision).toBe("pending");
  expect(result.reason_codes).toEqual(expect.arrayContaining([
    "candidate_primary_outcome_incomplete",
    "canonical_scan_evaluation_incomplete",
    "minimum_opportunity_sets_not_met",
    "minimum_ranked_candidates_not_met",
  ]));
});

test("fails the forward cohort closed on duplicate scans or a changed frozen plan", () => {
  const heldOut = fixture({
    decidedAt: "2026-09-25T14:30:00.000Z",
    ticker: "HLD",
  });
  const duplicate = evaluateScannerClockPriorShadowForwardDecision({
    plan: forwardDecisionPlan(),
    evidenceBindings: forwardEvidenceBindings(),
    scanRuns: [heldOut.persistedRun, heldOut.persistedRun],
    snapshots: [heldOut.snapshot],
    outcomes: [heldOut.outcome],
    bootstrapSeed: "clock-prior-forward:duplicate-test-seed-v1",
  });
  expect(duplicate).toMatchObject({
    status: "conflicting",
    decision: "pending",
    reason_codes: ["duplicate_scan_run_fingerprint"],
  });

  const changedPlan = {
    ...forwardDecisionPlan(),
    thresholds: {
      continue_minimum_precision_delta: 0,
      reject_maximum_precision_delta: -0.01,
    },
  };
  expect(evaluateScannerClockPriorShadowForwardDecision({
    plan: changedPlan,
    evidenceBindings: forwardEvidenceBindings(),
    scanRuns: [],
    snapshots: [],
    outcomes: [],
    bootstrapSeed: "clock-prior-forward:changed-plan-test-seed-v1",
  })).toMatchObject({
    status: "invalid_plan",
    decision: "pending",
    reason_codes: ["forward_decision_plan_invalid_or_changed"],
  });
});

test("fails the forward plan closed when its durable charter or policy reference binding drifts", () => {
  const bindings = forwardEvidenceBindings();
  const result = evaluateScannerClockPriorShadowForwardDecision({
    plan: forwardDecisionPlan(),
    evidenceBindings: {
      ...bindings,
      policy_reference: {
        ...bindings.policy_reference,
        reference_fingerprint: "c".repeat(64),
      },
    },
    scanRuns: [],
    snapshots: [],
    outcomes: [],
    bootstrapSeed: "clock-prior-forward:binding-drift-seed-v1",
  });

  expect(result).toMatchObject({
    status: "invalid_plan",
    decision: "pending",
    reason_codes: ["forward_decision_charter_or_policy_reference_binding_invalid"],
  });
});

test("uses frozen conservative boundaries for continue, narrow and reject", () => {
  const partition = (
    name: "held_out" | "walk_forward",
    lower: number,
    upper: number,
  ): ScannerClockPriorShadowForwardPartitionResult => ({
    partition: name,
    opportunity_set_count: 20,
    no_trade_opportunity_set_count: 2,
    ranked_candidate_count: 80,
    trading_day_count: 5,
    baseline_precision: {
      value: 0.5,
      numerator: 40,
      denominator: 80,
      lower: 0.4,
      upper: 0.6,
    },
    candidate_precision: {
      value: 0.6,
      numerator: 48,
      denominator: 80,
      lower: 0.5,
      upper: 0.7,
    },
    precision_delta: {
      value: 0.1,
      conservative_lower: lower,
      conservative_upper: upper,
      interval_method: "seeded_trading_day_cluster_bootstrap_v1",
      bootstrap_iterations: 1_000,
      bootstrap_seed: `fixture:${name}`,
    },
    evidence_complete: true,
    reason_codes: [],
  });
  const thresholds = {
    continue_minimum_precision_delta: 0.02,
    reject_maximum_precision_delta: -0.02,
  };

  expect(classifyScannerClockPriorShadowForwardPrecisionDecision({
    partitions: [
      partition("held_out", 0.03, 0.16),
      partition("walk_forward", 0.02, 0.12),
    ],
    thresholds,
  })).toBe("continue");
  expect(classifyScannerClockPriorShadowForwardPrecisionDecision({
    partitions: [
      partition("held_out", -0.01, 0.08),
      partition("walk_forward", -0.01, 0.07),
    ],
    thresholds,
  })).toBe("narrow");
  expect(classifyScannerClockPriorShadowForwardPrecisionDecision({
    partitions: [
      partition("held_out", -0.03, 0.01),
      partition("walk_forward", -0.15, -0.02),
    ],
    thresholds,
  })).toBe("reject");

  expect(classifyScannerClockPriorShadowForwardPrecisionDecision({
    partitions: [
      partition("held_out", 0.03, 0.16),
      partition("held_out", 0.03, 0.16),
    ],
    thresholds,
  })).toBe("pending");
  expect(classifyScannerClockPriorShadowForwardPrecisionDecision({
    partitions: [
      partition("held_out", 0.03, 0.16),
      partition("walk_forward", 0.03, 0.16),
    ],
    thresholds: {
      continue_minimum_precision_delta: -0.02,
      reject_maximum_precision_delta: 0.02,
    },
  })).toBe("pending");
});
