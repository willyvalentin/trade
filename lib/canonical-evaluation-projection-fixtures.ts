import type {
  CanonicalProjectionMetadata,
} from "@/lib/canonical-evaluation-projection-adapters";
import {
  action664aGoldenVersions,
} from "@/lib/canonical-recommendation-evaluation-fixtures";
import type { RecommendationBatch } from "@/lib/recommendation-batch-memory";
import type { SelectedCandidateBuildDiagnostic } from "@/lib/recommendation-build-diagnostics";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationScanRun } from "@/lib/recommendation-scan-run";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";
import type { ScannerCandidateRankingResult } from "@/lib/scanner-candidate-ranking";
import type { ScannerCandidate } from "@/lib/scanner";
import type { ReplayWithSignalPackageResult } from "@/lib/replay-with-signal-package-result-model";

const decisionTimestamp = "2026-07-08T13:32:00.000Z";

function metadata(
  overrides: CanonicalProjectionMetadata = {},
): CanonicalProjectionMetadata {
  return {
    versions: action664aGoldenVersions,
    regime: "risk_on",
    sector: "Technology",
    freshness: "fresh",
    provider: "golden_provider",
    ...overrides,
  };
}

function snapshot(
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  return {
    id: "snapshot-visible-001",
    snapshot_fingerprint: "snapshot-fingerprint-visible-001",
    recommendation_id: "recommendation-visible-001",
    scan_run_id: "scan-run-001",
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: decisionTimestamp,
    app_timestamp: decisionTimestamp,
    window: "morning",
    status: "visible",
    source_mode: "supabase",
    data_mode: "real",
    market_session_phase: "morning",
    market_session_risk: "normal",
    market_session_source: "market_calendar",
    is_visible: true,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 210,
    entry_low: 209.5,
    entry_high: 210.5,
    stop: 207,
    target: 216,
    side: "long",
    risk_per_share: 3,
    reward_per_share: 6,
    planned_risk_reward: 2,
    confidence: 0.78,
    score: 84,
    rating: null,
    label: null,
    type: "momentum_continuation",
    rationale: "Golden visible fixture",
    reason: "Opening drive",
    catalyst: null,
    primary_risk: "Market reversal",
    market_data_snapshot: null,
    quote_price: 210,
    volume: 1_000_000,
    liquidity: "high",
    spread: 0.02,
    freshness: "fresh",
    data_age_minutes: 1,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      candidate_id: "candidate-visible-001",
      market_regime: "risk_on",
      sector: "Technology",
      provider: "golden_provider",
    },
    was_taken: false,
    linked_position_id: null,
    created_at: decisionTimestamp,
    updated_at: decisionTimestamp,
    ...overrides,
  };
}

function scanRun(
  overrides: Partial<RecommendationScanRun> = {},
): RecommendationScanRun {
  return {
    id: "scan-run-001",
    run_fingerprint: "scan-run-fingerprint-001",
    trading_date: "2026-07-08",
    window: "morning",
    status: "completed",
    source: "supabase",
    observed_at: "2026-07-08T13:31:00.000Z",
    started_at: "2026-07-08T13:30:00.000Z",
    completed_at: "2026-07-08T13:33:00.000Z",
    market_session_phase: "morning",
    market_session_risk: "normal",
    market_session_source: "market_calendar",
    data_mode: "real",
    scan_observability_status: "complete",
    counts: {
      visible_recommendation_count: 1,
      accepted_count: 1,
      needs_review_count: 0,
      rejected_count: 0,
      incomplete_count: 0,
      strong_count: 1,
      valid_count: 0,
      experimental_count: 0,
      rejected_tier_count: 0,
      incomplete_tier_count: 0,
      unknown_tier_count: 0,
    },
    window_target_status: "below_target",
    gap_to_target: 5,
    overflow_above_target: 0,
    tickers_represented: ["AAPL"],
    ticker_count: 1,
    duplicate_ticker_count: 0,
    stale_candidate_count: 0,
    incomplete_data_candidate_count: 0,
    scanned_ticker_count: 10,
    raw_candidate_count: 4,
    scan_duration_ms: 2_000,
    top_intake_reasons: [],
    warnings: [],
    provider_statuses: [
      {
        source_id: "golden_provider",
        label: "Golden provider",
        status: "available",
        message: "Available",
      },
    ],
    unknown_metrics: [],
    payload_json: { market_regime: "risk_on" },
    created_at: "2026-07-08T13:30:00.000Z",
    updated_at: "2026-07-08T13:33:00.000Z",
    ...overrides,
  };
}

function batch(
  member: RecommendationSnapshot | null,
  overrides: Partial<RecommendationBatch> = {},
): RecommendationBatch {
  return {
    id: "batch-001",
    batch_fingerprint: "batch-fingerprint-001",
    trading_date: "2026-07-08",
    window: "morning",
    batch_type: "official",
    status: "published",
    serving_decision: "serve_latest_official_batch",
    freshness_status: "fresh",
    published_at: decisionTimestamp,
    served_at: decisionTimestamp,
    observed_at: decisionTimestamp,
    expires_at: "2026-07-08T15:00:00.000Z",
    scan_run_id: "scan-run-001",
    scan_run_fingerprint: "scan-run-fingerprint-001",
    recommendation_snapshot_ids: member ? [member.id] : [],
    recommendation_snapshot_fingerprints: member
      ? [member.snapshot_fingerprint]
      : [],
    recommendation_tickers: member?.ticker ? [member.ticker] : [],
    recommendation_count: member ? 1 : 0,
    strong_count: member ? 1 : 0,
    valid_count: 0,
    experimental_count: 0,
    rejected_count: 0,
    incomplete_count: 0,
    unknown_tier_count: 0,
    target_status: member ? "below_target" : "no_trade_valid",
    gap_to_target: member ? 5 : 6,
    overflow_above_target: 0,
    source_mode: "supabase",
    data_mode: "real",
    market_session_phase: "morning",
    warnings: [],
    gaps: [],
    metadata_score: 100,
    payload_json: { market_regime: "risk_on" },
    created_at: decisionTimestamp,
    updated_at: decisionTimestamp,
    ...overrides,
  };
}

function providerCoverage(
  overrides: Record<string, unknown> = {},
): Record<string, unknown> {
  return {
    provider_status: "available",
    freshness: "fresh",
    expected_candle_count: 12,
    observed_candle_count: 12,
    malformed_candle_count: 0,
    blockers: [],
    ...overrides,
  };
}

function outcome(
  horizon: "15m" | "30m" | "60m",
  parent: RecommendationSnapshot,
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  return {
    id: `outcome-${parent.id}-${horizon}`,
    snapshot_id: parent.id,
    snapshot_fingerprint: parent.snapshot_fingerprint,
    recommendation_id: parent.recommendation_id,
    ticker: parent.ticker,
    side: "long",
    recommended_at: parent.recommended_at,
    evaluated_at: "2026-07-08T14:32:00.000Z",
    horizon,
    status: "target_before_stop",
    entry: 210,
    stop: 207,
    target: 216,
    entry_triggered: true,
    entry_triggered_at: "2026-07-08T13:35:00.000Z",
    target_hit: true,
    target_hit_at: "2026-07-08T13:55:00.000Z",
    stop_hit: false,
    stop_hit_at: null,
    first_terminal_event: "target_hit",
    best_price_after_recommendation: 217,
    worst_price_after_recommendation: 209,
    best_r: 2.33,
    worst_r: -0.33,
    eod_price: null,
    eod_r: null,
    current_price: 216,
    current_r: 2,
    max_favorable_excursion: 7,
    max_adverse_excursion: -1,
    time_to_entry_minutes: 3,
    time_to_target_minutes: 23,
    time_to_stop_minutes: null,
    source: "intraday_candles",
    provider: "golden_provider",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: {
      canonical_provider_coverage: providerCoverage({
        expected_candle_count:
          horizon === "15m" ? 3 : horizon === "30m" ? 6 : 12,
        observed_candle_count:
          horizon === "15m" ? 3 : horizon === "30m" ? 6 : 12,
      }),
    },
    created_at: "2026-07-08T14:32:00.000Z",
    updated_at: "2026-07-08T14:32:00.000Z",
    ...overrides,
  };
}

function candidate(
  overrides: Partial<ScannerCandidate> = {},
): ScannerCandidate {
  return {
    ticker: "PLTR",
    company_name: "Palantir",
    sector: "Technology",
    mock_current_price: 140,
    mock_trend: "up",
    mock_volume_context: "strong",
    mock_support: 137,
    mock_resistance: 146,
    mock_news_context: "none",
    intraday_indicator_source: "cache",
    intraday_indicator_stale: false,
    reference_price_provider: "golden_provider",
    reference_price_timestamp: "2026-07-08T13:31:00.000Z",
    ...overrides,
  };
}

function ranking(
  overrides: Partial<ScannerCandidateRankingResult> = {},
): ScannerCandidateRankingResult {
  return {
    ticker: "PLTR",
    company_name: "Palantir",
    rank: 2,
    selected: false,
    selection_bucket: "not_selected",
    rank_reason: "Below selected cutoff",
    source_contribution: "base_universe",
    score: {
      total_score: 72,
      normalized_score: 72,
      tier: "valid",
      components: [],
      warnings: [],
      gaps: [],
    },
    ...overrides,
  };
}

function rejectedBuildDiagnostic(
  overrides: Partial<SelectedCandidateBuildDiagnostic> = {},
): SelectedCandidateBuildDiagnostic {
  return {
    ticker: "PLTR",
    side: "long",
    score: 72,
    tier: "valid",
    setup_type: "momentum_continuation",
    source: "base_universe",
    reference_price_status: "fresh",
    reference_price_source: "golden_provider",
    reference_price_read_path: "scanner_cache",
    reference_price_age_minutes: 1,
    vwap_status: "above",
    momentum_status: "positive",
    volume_status: "strong",
    risk_geometry_status: "valid",
    enough_data_to_build_plan: true,
    built: false,
    rejection_reason: "below_publish_threshold",
    rejection_category: "quality",
    explanation: "Valid candidate below publish threshold.",
    ...overrides,
  };
}

function historicalReplay(
  overrides: Partial<ReplayWithSignalPackageResult> = {},
): ReplayWithSignalPackageResult {
  return {
    execution_status: "replay_with_signal_package_completed",
    outcome_status: "target_hit",
    counterfactual_result_available: true,
    source_verification: "static_verified_candles",
    candidate_id: "historical-candidate-001",
    source_type: "historical_synthetic",
    source_row_id: "historical-source-row-001",
    ticker: "MSFT",
    interval: "5min",
    trading_day: "2026-06-01",
    analysis_cutoff: "2026-06-01T13:35:00.000Z",
    direction: "long",
    planned_entry: 450,
    planned_stop: 445,
    planned_target: 460,
    candles_read: 12,
    candles_verified: 12,
    lookahead_safety_passed: true,
    entry_touched: true,
    stop_touched: false,
    target_touched: true,
    entry_timestamp: "2026-06-01T13:40:00.000Z",
    exit_timestamp: "2026-06-01T14:05:00.000Z",
    exit_reason: "target_hit",
    gross_price_move: 10,
    gross_r_multiple: 2,
    replay_executed: true,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommendation_rows_mutated: false,
    supabase_write_executed: false,
    provider_call_executed: false,
    blockers: [],
    warnings: [],
    ...overrides,
  };
}

export const action664bVisibleSnapshot = snapshot();
export const action664bScanRun = scanRun();
export const action664bVisibleBatch = batch(action664bVisibleSnapshot);
export const action664bVisibleOutcomes = [
  outcome("15m", action664bVisibleSnapshot),
  outcome("30m", action664bVisibleSnapshot),
  outcome("60m", action664bVisibleSnapshot),
];
export const action664bVisibleMetadata = metadata({
  candidate_id: "candidate-visible-001",
  batch_id: action664bVisibleBatch.id,
  batch_fingerprint: action664bVisibleBatch.batch_fingerprint,
  scan_run_id: action664bScanRun.id,
  scan_run_fingerprint: action664bScanRun.run_fingerprint,
});

export const action664bResearchSnapshot = snapshot({
  id: "snapshot-research-001",
  snapshot_fingerprint: "snapshot-fingerprint-research-001",
  recommendation_id: "recommendation-research-001",
  status: "hidden",
  source_mode: "research_only",
  data_mode: "research_only",
  is_visible: false,
  payload_json: {
    candidate_id: "candidate-research-001",
    visibility_status: "research_only",
    market_regime: "risk_on",
    sector: "Technology",
  },
});
export const action664bResearchMetadata = metadata({
  candidate_id: "candidate-research-001",
});

export const action664bShadowCandidate = candidate({
  ticker: "NVDA",
  company_name: "Nvidia",
});
export const action664bShadowMetadata = metadata({
  producer_decision_id: "shadow-candidate-decision-001",
  decision_timestamp: decisionTimestamp,
  sample_type: "shadow",
  candidate_id: "candidate-shadow-001",
  numeric_confidence: 0.64,
  confidence_label: "medium",
});

export const action664bHistoricalReplay = historicalReplay();
export const action664bHistoricalMetadata = metadata({
  numeric_confidence: 0.7,
  confidence_label: "medium",
  provider_coverage: {
    status: "complete",
    expected_candle_count: 12,
    observed_candle_count: 12,
    reason_codes: [],
  },
});

export const action664bRejectedCandidate = candidate();
export const action664bRejectedRanking = ranking();
export const action664bRejectedBuildDiagnostic = rejectedBuildDiagnostic();
export const action664bRejectedBatch = batch(null, {
  id: "batch-rejected-context-001",
  batch_fingerprint: "batch-rejected-context-fingerprint-001",
  rejected_count: 1,
});
export const action664bRejectedMetadata = metadata({
  producer_decision_id: "rejected-candidate-decision-001",
  decision_timestamp: decisionTimestamp,
  sample_type: "rejected_candidate",
  candidate_id: "candidate-rejected-001",
  batch_id: "batch-rejected-context-001",
  batch_fingerprint: "batch-rejected-context-fingerprint-001",
  numeric_confidence: 0.55,
  confidence_label: "medium",
});

export const action664bNoTradeBatch = batch(null, {
  id: "batch-no-trade-001",
  batch_fingerprint: "batch-no-trade-fingerprint-001",
  status: "no_trade_valid",
  serving_decision: "no_trade_valid",
  target_status: "no_trade_valid",
});
export const action664bNoTradeMetadata = metadata({
  sample_type: "no_trade",
  numeric_confidence: null,
  confidence_label: null,
});

export const action664bLegacySnapshotWithoutDecisionId = snapshot({
  id: "snapshot-legacy-no-decision-id",
  snapshot_fingerprint: "snapshot-fingerprint-legacy-no-decision-id",
  recommendation_id: null,
});

export const action664bSampleConflictSnapshot = snapshot({
  id: "snapshot-sample-conflict",
  snapshot_fingerprint: "snapshot-fingerprint-sample-conflict",
  recommendation_id: "recommendation-sample-conflict",
  source_mode: "research_only",
  data_mode: "research_only",
  payload_json: {
    visibility_status: "research_only",
  },
});

export const action664bMissingVersionsSnapshot = snapshot({
  id: "snapshot-missing-versions",
  snapshot_fingerprint: "snapshot-fingerprint-missing-versions",
  recommendation_id: "recommendation-missing-versions",
});

export const action664bDuplicateHorizonSnapshot = snapshot({
  id: "snapshot-duplicate-horizon",
  snapshot_fingerprint: "snapshot-fingerprint-duplicate-horizon",
  recommendation_id: "recommendation-duplicate-horizon",
});
export const action664bDuplicateHorizonOutcomes = [
  outcome("60m", action664bDuplicateHorizonSnapshot, {
    id: "outcome-duplicate-60m-a",
  }),
  outcome("60m", action664bDuplicateHorizonSnapshot, {
    id: "outcome-duplicate-60m-b",
  }),
  outcome("30m", action664bDuplicateHorizonSnapshot),
];

export const action664bProviderGapSnapshot = snapshot({
  id: "snapshot-provider-gap",
  snapshot_fingerprint: "snapshot-fingerprint-provider-gap",
  recommendation_id: "recommendation-provider-gap",
});
export const action664bProviderGapOutcomes = [
  outcome("60m", action664bProviderGapSnapshot, {
    id: "outcome-provider-gap-60m",
    status: "incomplete",
    provider: "golden_provider",
    data_completeness: "partial",
    target_hit: null,
    first_terminal_event: "unknown",
    blockers: ["provider_gap"],
    payload_json: {
      canonical_provider_coverage: providerCoverage({
        provider_status: "gap",
        freshness: "unknown",
        expected_candle_count: 12,
        observed_candle_count: 4,
        blockers: ["provider_gap"],
      }),
    },
  }),
];

export const action664bContextOnlyBatch = batch(action664bVisibleSnapshot);

export const action664bFixtureMetadata = metadata;
