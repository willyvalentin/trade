import { expect, test } from "@playwright/test";

import {
  buildDailyLearningReviewSummary,
  type DailyLearningReviewSummary,
} from "../../lib/daily-learning-review";
import { buildIntelligenceOverview } from "../../lib/intelligence-overview";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

const tradingDay = "2026-07-06";
const evaluatedAt = "2026-07-06T15:00:00.000Z";

function overviewInput(outcomeCount = 57) {
  return {
    latest_batch_fingerprint: "rec_batch_brain",
    latest_evaluated_batch_fingerprint: "rec_batch_brain",
    outcome_count: outcomeCount,
    unique_snapshot_count: Math.max(1, Math.floor(outcomeCount / 3)),
    setup_labeling: {
      advisory_mode: true,
      known_setup_label_count: outcomeCount,
      unknown_setup_label_count: 0,
      setup_mix: { market_reference_momentum: 9 },
    },
    sector_industry_mapping: {
      advisory_mode: true,
      sector_mix: { technology: 4, financials: 2, energy: 2 },
      low_confidence_mapping_count: 0,
    },
    sector_group_breakdowns: [{ sample_confidence: "medium" }],
    ticker_profile_summary: {
      advisory_mode: true,
      profiles_built_count: 4,
      new_count: 2,
      observed_count: 2,
      trusted_count: 0,
      deprioritized_count: 0,
      unknown_count: 0,
      sample_confidence_low_count: 2,
      sample_confidence_medium_count: 2,
      sample_confidence_high_count: 0,
    },
    market_regime: {
      advisory_mode: true,
      latest_evaluated_batch_regime_label: "risk_off",
      latest_evaluated_batch_regime_confidence: "medium",
    },
    trade_quality_summary: {
      advisory_mode: true,
      overall_quality_mix: { weak: 2, fair: 5, good: 2, strong: 0, unknown: 0 },
      most_common_weak_components: { market_regime_support: 4 },
    },
    confidence_calibration: {
      advisory_only: true,
      buckets: [
        { bucket: "60_69", outcome_count: 21 },
        { bucket: "70_79", outcome_count: 24 },
        { bucket: "80_89", outcome_count: 12 },
      ],
      monotonicity_check: {
        higher_confidence_outperforms_lower: null,
        caution_flags: ["insufficient_sample_size"],
      },
      sample_confidence: "medium",
    },
    model_governance: {
      advisory_only: true,
      current_intelligence_layers: [
        "setup_labeling_v1",
        "daily_learning_review_v2",
        "sector_mapping_v1",
        "ticker_profile_v1",
        "market_regime_v1",
        "trade_quality_v1",
        "confidence_calibration_v1",
      ],
      promotion_ready_changes: [],
      safety: {
        automatic_model_updates_enabled: false,
        live_ranking_changes_enabled: false,
        minimum_sample_size_required: 100,
      },
    },
    engine_adjustment_candidates: [],
  };
}

function snapshot(ticker: string): RecommendationSnapshot {
  return {
    id: `snap-${ticker}`,
    snapshot_fingerprint: `snap-${ticker}`,
    recommendation_id: `rec-${ticker}`,
    scan_run_id: "rec_scan_run_brain",
    ticker,
    company_name: null,
    recommended_at: "2026-07-06T14:30:00.000Z",
    app_timestamp: "2026-07-06T14:30:00.000Z",
    window: "midday",
    status: "visible",
    source_mode: "official",
    data_mode: "supabase",
    market_session_phase: "regular",
    market_session_risk: null,
    market_session_source: null,
    is_visible: true,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 100,
    entry_low: 100,
    entry_high: 100,
    stop: 98,
    target: 104,
    side: "long",
    risk_per_share: 2,
    reward_per_share: 4,
    planned_risk_reward: 2,
    confidence: 72,
    score: 70,
    rating: "valid",
    label: null,
    type: null,
    rationale: "Positive momentum with high relative volume.",
    reason: null,
    catalyst: null,
    primary_risk: null,
    market_data_snapshot: null,
    quote_price: 100,
    volume: null,
    liquidity: null,
    spread: null,
    freshness: null,
    data_age_minutes: null,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      batch_fingerprint: "rec_batch_brain",
      visibility_status: "visible",
      setup_type: "momentum breakout",
      entry_type_metadata: {
        entry_type: "pullback_limit",
        trigger_semantics: "touch_entry",
      },
      market_regime: { regime: "risk_off" },
      plan_price_freshness: {
        classification: "fresh",
        reference_price: 100,
      },
      day_trade_window_recommendation_target: { tier: "valid" },
    },
    was_taken: false,
    linked_position_id: null,
    created_at: "2026-07-06T14:30:00.000Z",
    updated_at: "2026-07-06T14:30:00.000Z",
  };
}

function outcome(ticker: string): RecommendationOutcome {
  return {
    id: `outcome-${ticker}`,
    snapshot_id: `snap-${ticker}`,
    snapshot_fingerprint: `snap-${ticker}`,
    recommendation_id: `rec-${ticker}`,
    ticker,
    side: "long",
    recommended_at: "2026-07-06T14:30:00.000Z",
    evaluated_at: evaluatedAt,
    horizon: "15m",
    status: "neither_hit",
    entry: 100,
    stop: 98,
    target: 104,
    entry_triggered: true,
    entry_triggered_at: evaluatedAt,
    target_hit: false,
    target_hit_at: null,
    stop_hit: false,
    stop_hit_at: null,
    first_terminal_event: "neither",
    best_price_after_recommendation: 101,
    worst_price_after_recommendation: 99,
    best_r: 0.4,
    worst_r: -0.1,
    eod_price: null,
    eod_r: null,
    current_price: 100,
    current_r: 0,
    max_favorable_excursion: 1,
    max_adverse_excursion: -1,
    time_to_entry_minutes: 2,
    time_to_target_minutes: null,
    time_to_stop_minutes: null,
    source: "intraday_candles",
    provider: "twelve_data",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: {},
    created_at: evaluatedAt,
    updated_at: evaluatedAt,
  };
}

function dailyReview() {
  return buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_brain",
    snapshots: [snapshot("AAPL")],
    outcomes: [outcome("AAPL")],
    now: evaluatedAt,
  });
}

function baseDiagnosticsInput(
  dailyLearningReview: DailyLearningReviewSummary,
): MarketDiagnosticsConsoleInput {
  return {
    now: evaluatedAt,
    market_session: {
      evaluated_at: evaluatedAt,
      market_is_open: true,
      phase: "regular",
    },
    market_status: { dayType: "trading" },
    data_mode_clarity: {
      overall_mode: "paper",
      execution_reality: "human_confirmed_required",
    },
    engine_control_center: { overall_status: "ready" },
    live_market_trial_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      checks: [],
      provider_env_readiness: {
        server_secret_status: "inferred_available",
        supabase_public_env_available: true,
      },
      persistence_readiness: {
        scan_runs_available: true,
        batches_available: true,
        snapshots_available: true,
      },
      scanner_readiness: { selected_ticker_count: 1 },
      outcome_readiness: {
        route_available: true,
        evaluated_recommendations: dailyLearningReview.evaluated_outcome_count,
      },
      can_do_now: {
        observe_only: true,
        log_recommendations: true,
        evaluate_outcomes: true,
        paper_or_manual_tracking_ready: true,
      },
      not_enabled: {
        broker_automation: true,
        order_submission: true,
        automatic_avanza_execution: true,
        automatic_trading_execution: true,
      },
      latest_automation_scan: { decision: "completed" },
    },
    live_market_trial_runbook: {
      status: "ready",
      phase: "regular",
      next_action: { label: "Review intelligence" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-06 11:00 America/New_York",
      calendar_confidence: "high",
      provider_calendar_available: true,
      fallback_calendar_scan_allowed: false,
      active_window: "midday",
      decision: "scan_allowed",
      should_scan_now: true,
      next_window: "power_hour",
      next_window_label: "Power Hour",
      next_window_starts_at: "2026-07-06T19:00:00.000Z",
      warnings: [],
      official_scan_windows: [],
      official_window_statuses: [],
    },
    serving_cadence: {
      warnings: [],
      serving_decision: "served",
      no_trade_valid: false,
      visible_recommendation_count: dailyLearningReview.visible_evaluated_count,
      batch_status: "served",
      batch_target: { min: 2, max: 12 },
    },
    provider_budget_guard: {
      status: "ok",
      next_action: { label: "No action" },
      warnings: [],
      plan_mode: "grow",
      totals: {
        estimated_calls_per_window: 0,
        estimated_calls_per_day: 0,
      },
      latest_limit_signal: { status: "ok" },
    },
    scanner_universe: {
      warnings: [],
      selected_tickers: ["AAPL"],
    },
    scanner_output_qa: {
      overall_status: "healthy",
      summary: "healthy",
      warnings: [],
      recommended_next_action: { label: "No action" },
      candidate_count: 1,
      metadata_coverage: {
        recommendation_rows_with_data_timestamp: 1,
        recommendation_rows_with_provider_source: 1,
        explicit_gap_count: 0,
        missing_metadata_fields: [],
        qa_checked_source_path: "intelligence_overview_test",
        metadata_missing_at_stage: null,
      },
    },
    real_output_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      coverage: {
        strong_count: 0,
        valid_count: 1,
        experimental_count: 0,
      },
    },
    batch_memory: {
      warnings: [],
      latest_batch: {
        batch_fingerprint: "rec_batch_brain",
        scan_run_fingerprint: "rec_scan_run_brain",
      },
      persistence_status: "ok",
      persistence_mode: "persisted",
      total_batches: 1,
    },
    scan_run_history: {
      top_warnings: [],
      latest_run_status: "completed",
      total_scan_runs: 1,
    },
    daily_targets: {
      warnings: [],
      total_recommendations_today: 1,
      full_day_recommendation_target_min: 4,
      full_day_recommendation_target_max: 12,
    },
    day_window_target: {
      status: "served",
      strong_candidate_gate: {
        candidates_considered_for_strong: 1,
        candidates_blocked_from_strong: 0,
        top_blocking_reasons: [],
        blocked_by_stale_plan_count: 0,
        blocked_by_entry_distance_too_large_count: 0,
        blocked_by_invalid_risk_geometry_count: 0,
        blocked_by_missing_provider_reference_count: 0,
        blocked_by_setup_quality_below_minimum_count: 0,
      },
    },
    performance: {
      summary: {
        total_recommendations: 1,
        pending_outcomes: 0,
        evaluated_recommendations: dailyLearningReview.evaluated_outcome_count,
      },
    },
    daily_learning_review: dailyLearningReview,
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("intelligence overview summarizes active advisory layers", () => {
  const overview = buildIntelligenceOverview(overviewInput());

  expect(overview.advisory_only).toBe(true);
  expect(overview.active_layers).toContain("setup_labeling");
  expect(overview.active_layers).toContain("model_governance");
  expect(overview.latest_signals.market_regime).toBe("risk_off");
  expect(overview.latest_signals.setup_mix.market_reference_momentum).toBe(9);
  expect(overview.safety.live_ranking_changes_enabled).toBe(false);
});

test("intelligence overview falls back safely when layers are missing", () => {
  const overview = buildIntelligenceOverview(null);

  expect(overview.advisory_only).toBe(true);
  expect(overview.layer_status.setup_labeling.status).toBe("missing");
  expect(overview.metadata_gaps).toContain("missing_setup_labeling");
  expect(overview.recommended_learning_focus).toContain("collect_more_data");
});

test("intelligence overview sample confidence follows outcome count", () => {
  expect(
    buildIntelligenceOverview(overviewInput(1)).data_readiness.sample_confidence,
  ).toBe("low");
  expect(
    buildIntelligenceOverview(overviewInput(30)).data_readiness.sample_confidence,
  ).toBe("medium");
  expect(
    buildIntelligenceOverview(overviewInput(100)).data_readiness.sample_confidence,
  ).toBe("high");
});

test("intelligence overview keeps model and live ranking changes disabled", () => {
  const overview = buildIntelligenceOverview(overviewInput(150));

  expect(overview.data_readiness.enough_for_model_change).toBe(false);
  expect(overview.data_readiness.enough_for_live_ranking_change).toBe(false);
  expect(overview.safety.automatic_model_updates_enabled).toBe(false);
  expect(overview.safety.requires_manual_review).toBe(true);
});

test("intelligence overview keeps confidence layer active when confidence is unknown", () => {
  const overview = buildIntelligenceOverview({
    ...overviewInput(93),
    confidence_calibration: {
      advisory_only: true,
      buckets: [{ bucket: "unknown", outcome_count: 93 }],
      monotonicity_check: {
        higher_confidence_outperforms_lower: null,
        caution_flags: ["missing_confidence"],
      },
      sample_confidence: "medium",
    },
  });

  expect(overview.active_layers).toContain("confidence_calibration");
  expect(overview.latest_signals.confidence_bucket_mix.unknown).toBe(93);
  expect(overview.recommended_learning_focus).toContain(
    "collect_more_confidence_calibration_data",
  );
});

test("daily learning review keeps all advisory layers active with outcome data", () => {
  const summary = dailyReview();

  expect(summary.intelligence_overview.active_layers).toEqual(
    expect.arrayContaining([
      "setup_labeling",
      "daily_learning_review",
      "sector_mapping",
      "ticker_profiles",
      "market_regime",
      "trade_quality",
      "confidence_calibration",
      "model_governance",
    ]),
  );
});

test("intelligence overview recommends focus from weak signals", () => {
  const overview = buildIntelligenceOverview({
    ...overviewInput(12),
    sector_group_breakdowns: [
      { sample_confidence: "low" },
      { sample_confidence: "low" },
    ],
    ticker_profile_summary: {
      ...overviewInput().ticker_profile_summary,
      profiles_built_count: 2,
      sample_confidence_low_count: 2,
      sample_confidence_medium_count: 0,
    },
    setup_labeling: {
      ...overviewInput().setup_labeling,
      unknown_setup_label_count: 3,
    },
    engine_adjustment_candidates: [
      { candidate: "entry_not_triggering", confidence: "low" },
      { candidate: "weak_follow_through", confidence: "low" },
    ],
  });

  expect(overview.recommended_learning_focus).toContain(
    "review_market_regime_support",
  );
  expect(overview.recommended_learning_focus).toContain(
    "collect_more_confidence_calibration_data",
  );
  expect(overview.recommended_learning_focus).toContain(
    "collect_more_ticker_profile_data",
  );
  expect(overview.recommended_learning_focus).toContain(
    "collect_more_sector_outcomes",
  );
  expect(overview.recommended_learning_focus).toContain(
    "improve_setup_label_metadata",
  );
  expect(overview.recommended_learning_focus).toContain("review_entry_timing");
  expect(overview.recommended_learning_focus).toContain(
    "review_follow_through_filters",
  );
});

test("daily learning review includes intelligence overview", () => {
  const summary = dailyReview();

  expect(summary.intelligence_overview.advisory_only).toBe(true);
  expect(summary.intelligence_overview.active_layers).toContain(
    "daily_learning_review",
  );
  expect(summary.intelligence_overview.data_readiness.enough_for_model_change).toBe(
    false,
  );
  expect(summary.intelligence_overview.safety.live_ranking_changes_enabled).toBe(
    false,
  );
});

test("market diagnostics renders intelligence overview section", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput(dailyReview()),
  );
  const section = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );
  const dailySection = diagnostics.sections.find(
    (item) => item.section_id === "daily_learning_review",
  );

  expect(section).toBeTruthy();
  expect(section?.lines.join("\n")).toContain("Advisory mode: yes");
  expect(section?.lines.join("\n")).toContain("Active layers");
  expect(section?.lines.join("\n")).toContain("Latest evaluated batch");
  expect(section?.lines.join("\n")).toContain("Recommended focus");
  expect(section?.lines.join("\n")).toContain("Enough for model change: no");
  expect(section?.lines.join("\n")).toContain(
    "Live ranking changes enabled: no",
  );
  expect(dailySection?.lines.join("\n")).toContain("Intelligence overview");
});
