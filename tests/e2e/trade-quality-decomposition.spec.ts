import { expect, test } from "@playwright/test";

import {
  buildDailyLearningReviewSummary,
  type DailyLearningReviewSummary,
} from "../../lib/daily-learning-review";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";
import {
  buildTradeQualityDecomposition,
  buildTradeQualityDecompositionSummary,
} from "../../lib/trade-quality-decomposition";

const tradingDay = "2026-07-06";
const evaluatedAt = "2026-07-06T15:00:00.000Z";

function snapshot(
  ticker: string,
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  const fingerprint = overrides.snapshot_fingerprint ?? `snap-${ticker}`;
  const researchOnly =
    overrides.source_mode === "research_only" ||
    overrides.payload_json?.visibility_status === "research_only";

  return {
    id: overrides.id ?? fingerprint,
    snapshot_fingerprint: fingerprint,
    recommendation_id:
      "recommendation_id" in overrides
        ? (overrides.recommendation_id ?? null)
        : `rec-${ticker}`,
    scan_run_id: overrides.scan_run_id ?? "rec_scan_run_trade_quality",
    ticker: overrides.ticker ?? ticker,
    company_name: overrides.company_name ?? null,
    recommended_at: overrides.recommended_at ?? "2026-07-06T14:30:00.000Z",
    app_timestamp: overrides.app_timestamp ?? "2026-07-06T14:30:00.000Z",
    window: overrides.window ?? "midday",
    status: overrides.status ?? (researchOnly ? "hidden" : "visible"),
    source_mode: overrides.source_mode ?? (researchOnly ? "research_only" : "official"),
    data_mode: overrides.data_mode ?? (researchOnly ? "research_only" : "supabase"),
    market_session_phase: overrides.market_session_phase ?? "regular",
    market_session_risk: overrides.market_session_risk ?? null,
    market_session_source: overrides.market_session_source ?? null,
    is_visible: overrides.is_visible ?? !researchOnly,
    is_demo: overrides.is_demo ?? false,
    is_mock: overrides.is_mock ?? false,
    is_real: overrides.is_real ?? true,
    entry: overrides.entry ?? 100,
    entry_low: overrides.entry_low ?? 100,
    entry_high: overrides.entry_high ?? 100,
    stop: overrides.stop ?? 98,
    target: overrides.target ?? 104,
    side: overrides.side ?? "long",
    risk_per_share: overrides.risk_per_share ?? 2,
    reward_per_share: overrides.reward_per_share ?? 4,
    planned_risk_reward: overrides.planned_risk_reward ?? 2,
    confidence: overrides.confidence ?? 70,
    score: overrides.score ?? 70,
    rating: overrides.rating ?? "valid",
    label: overrides.label ?? null,
    type: overrides.type ?? null,
    rationale: overrides.rationale ?? "Positive momentum with high relative volume.",
    reason: overrides.reason ?? null,
    catalyst: overrides.catalyst ?? null,
    primary_risk: overrides.primary_risk ?? null,
    market_data_snapshot: overrides.market_data_snapshot ?? null,
    quote_price: overrides.quote_price ?? 100,
    volume: overrides.volume ?? null,
    liquidity: overrides.liquidity ?? null,
    spread: overrides.spread ?? null,
    freshness: overrides.freshness ?? null,
    data_age_minutes: overrides.data_age_minutes ?? null,
    intake_quality_json: overrides.intake_quality_json ?? null,
    scan_observability_json: overrides.scan_observability_json ?? null,
    empty_state_json: overrides.empty_state_json ?? null,
    quality_json: overrides.quality_json ?? null,
    payload_json: overrides.payload_json ?? {
      batch_fingerprint: "rec_batch_trade_quality",
      visibility_status: researchOnly ? "research_only" : "visible",
      setup_type: "momentum breakout",
      entry_type_metadata: {
        entry_type: "pullback_limit",
        trigger_semantics: "touch_entry",
      },
      plan_price_freshness: {
        classification: "fresh",
        reference_price: 100,
        reference_timestamp: "2026-07-06T14:30:00.000Z",
      },
      market_regime: { regime: "risk_off" },
      provider: "twelve_data",
      source: "intraday_candles",
      day_trade_window_recommendation_target: { tier: "valid" },
    },
    was_taken: overrides.was_taken ?? false,
    linked_position_id: overrides.linked_position_id ?? null,
    created_at: overrides.created_at ?? "2026-07-06T14:30:00.000Z",
    updated_at: overrides.updated_at ?? "2026-07-06T14:30:00.000Z",
  };
}

function outcome(
  ticker: string,
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  const fingerprint = overrides.snapshot_fingerprint ?? `snap-${ticker}`;

  return {
    id: overrides.id ?? `outcome-${ticker}-${overrides.horizon ?? "15m"}`,
    snapshot_id: overrides.snapshot_id ?? fingerprint,
    snapshot_fingerprint:
      "snapshot_fingerprint" in overrides
        ? (overrides.snapshot_fingerprint ?? null)
        : fingerprint,
    recommendation_id:
      "recommendation_id" in overrides
        ? (overrides.recommendation_id ?? null)
        : `rec-${ticker}`,
    ticker: "ticker" in overrides ? (overrides.ticker ?? null) : ticker,
    side: overrides.side ?? "long",
    recommended_at: overrides.recommended_at ?? "2026-07-06T14:30:00.000Z",
    evaluated_at: overrides.evaluated_at ?? evaluatedAt,
    horizon: overrides.horizon ?? "15m",
    status: overrides.status ?? "neither_hit",
    entry: overrides.entry ?? 100,
    stop: overrides.stop ?? 98,
    target: overrides.target ?? 104,
    entry_triggered: overrides.entry_triggered ?? true,
    entry_triggered_at: overrides.entry_triggered_at ?? evaluatedAt,
    target_hit: overrides.target_hit ?? false,
    target_hit_at: overrides.target_hit_at ?? null,
    stop_hit: overrides.stop_hit ?? false,
    stop_hit_at: overrides.stop_hit_at ?? null,
    first_terminal_event: overrides.first_terminal_event ?? "neither",
    best_price_after_recommendation:
      overrides.best_price_after_recommendation ?? 101,
    worst_price_after_recommendation:
      overrides.worst_price_after_recommendation ?? 99,
    best_r: "best_r" in overrides ? (overrides.best_r ?? null) : 0.4,
    worst_r: "worst_r" in overrides ? (overrides.worst_r ?? null) : -0.1,
    eod_price: overrides.eod_price ?? null,
    eod_r: overrides.eod_r ?? null,
    current_price: overrides.current_price ?? 100,
    current_r: overrides.current_r ?? 0,
    max_favorable_excursion: overrides.max_favorable_excursion ?? 1,
    max_adverse_excursion: overrides.max_adverse_excursion ?? -1,
    time_to_entry_minutes: overrides.time_to_entry_minutes ?? 2,
    time_to_target_minutes: overrides.time_to_target_minutes ?? null,
    time_to_stop_minutes: overrides.time_to_stop_minutes ?? null,
    source: overrides.source ?? "intraday_candles",
    provider: overrides.provider ?? "twelve_data",
    data_completeness: overrides.data_completeness ?? "complete",
    warnings: overrides.warnings ?? [],
    blockers: overrides.blockers ?? [],
    payload_json: overrides.payload_json ?? {},
    created_at: overrides.created_at ?? evaluatedAt,
    updated_at: overrides.updated_at ?? evaluatedAt,
  };
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
      scanner_readiness: { selected_ticker_count: 2 },
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
      next_action: { label: "Review learning" },
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
      selected_tickers: ["AAPL", "PLTR"],
    },
    scanner_output_qa: {
      overall_status: "healthy",
      summary: "healthy",
      warnings: [],
      recommended_next_action: { label: "No action" },
      candidate_count: 2,
      metadata_coverage: {
        recommendation_rows_with_data_timestamp: 2,
        recommendation_rows_with_provider_source: 2,
        explicit_gap_count: 0,
        missing_metadata_fields: [],
        qa_checked_source_path: "trade_quality_decomposition_test",
        metadata_missing_at_stage: null,
      },
    },
    real_output_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      coverage: {
        strong_count: 1,
        valid_count: 1,
        experimental_count: 0,
      },
    },
    batch_memory: {
      warnings: [],
      latest_batch: {
        batch_fingerprint: "rec_batch_trade_quality",
        scan_run_fingerprint: "rec_scan_run_trade_quality",
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
      total_recommendations_today: 2,
      full_day_recommendation_target_min: 4,
      full_day_recommendation_target_max: 12,
    },
    day_window_target: {
      status: "served",
      strong_candidate_gate: {
        candidates_considered_for_strong: 2,
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
        total_recommendations: 2,
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

test("trade quality decomposition scores strong structure and stays advisory", () => {
  const quality = buildTradeQualityDecomposition({
    ticker: "AAPL",
    snapshot_identity: "snap-aapl",
    side: "long",
    setup_family: "momentum_breakout",
    setup_confidence: "high",
    entry_type: "pullback_limit",
    plan_freshness_classification: "fresh",
    entry: 100,
    stop: 98,
    target: 104,
    volume_context: "High relative volume with positive momentum.",
    trend_context: "Positive momentum and strong trend above MA20.",
    sector_group: "technology",
    sector_mapping_source: "static_core_universe",
    ticker_status: "trusted",
    ticker_confidence: "high",
    market_regime_label: "risk_on",
    provider: "twelve_data",
    source: "intraday_candles",
    data_timestamp: "2026-07-06T14:30:00.000Z",
    reference_price_present: true,
  });

  expect(quality.advisory_only).toBe(true);
  expect(quality.components.setup_quality.label).toBe("strong");
  expect(quality.components.risk_reward_quality.reason_codes).toContain(
    "strong_planned_risk_reward",
  );
  expect(quality.components.data_quality.label).toBe("strong");
  expect(quality.overall_quality_score).not.toBeNull();
});

test("trade quality decomposition handles missing metadata without crashing", () => {
  const quality = buildTradeQualityDecomposition({
    ticker: "UNKNOWN",
    entry: 100,
    stop: 99,
    target: 101,
    reference_price_present: false,
  });

  expect(quality.components.setup_quality.label).toBe("unknown");
  expect(quality.components.data_quality.caution_flags).toContain(
    "missing_reference_price",
  );
  expect(quality.metadata_gaps).toContain("missing_reference_price");
});

test("trade quality decomposition marks risk-off long regime support as weak", () => {
  const quality = buildTradeQualityDecomposition({
    ticker: "PLTR",
    side: "long",
    entry: 100,
    stop: 98,
    target: 104,
    market_regime_label: "risk_off",
  });

  expect(quality.components.market_regime_support.label).toBe("weak");
  expect(quality.components.market_regime_support.caution_flags).toContain(
    "risk_off_long_requires_confirmation",
  );
});

test("trade quality summary aggregates quality mix and weak components", () => {
  const strong = buildTradeQualityDecomposition({
    ticker: "AAPL",
    setup_family: "momentum_breakout",
    setup_confidence: "high",
    entry_type: "pullback_limit",
    plan_freshness_classification: "fresh",
    entry: 100,
    stop: 98,
    target: 104,
    volume_context: "High relative volume and positive momentum.",
    trend_context: "Positive momentum and strong trend.",
    sector_group: "technology",
    sector_mapping_source: "static_core_universe",
    ticker_status: "trusted",
    ticker_confidence: "high",
    market_regime_label: "risk_on",
    provider: "twelve_data",
    data_timestamp: evaluatedAt,
    reference_price_present: true,
  });
  const weak = buildTradeQualityDecomposition({
    ticker: "PLTR",
    side: "long",
    entry: 100,
    stop: 98,
    target: 104,
    market_regime_label: "risk_off",
    reference_price_present: false,
  });

  const summary = buildTradeQualityDecompositionSummary([
    {
      decomposition: strong,
      setup_family: "momentum_breakout",
      sector_group: "technology",
      ticker: "AAPL",
      market_regime_label: "risk_on",
      current_batch: true,
    },
    {
      decomposition: weak,
      setup_family: "unknown",
      sector_group: "unknown",
      ticker: "PLTR",
      market_regime_label: "risk_off",
      current_batch: true,
    },
  ]);

  expect(summary.advisory_mode).toBe(true);
  expect(summary.current_batch_decomposed_count).toBe(2);
  expect(
    summary.overall_quality_mix.weak + summary.overall_quality_mix.fair,
  ).toBeGreaterThanOrEqual(1);
  expect(summary.most_common_weak_components.market_regime_support).toBe(1);
  expect(summary.metadata_gaps.missing_reference_price).toBe(1);
  expect(summary.quality_by_ticker.map((item) => item.key)).toContain("aapl");
});

test("daily learning review includes trade quality decomposition rows", () => {
  const aapl = snapshot("AAPL");
  const pltr = snapshot("PLTR", {
    source_mode: "research_only",
    data_mode: "research_only",
    payload_json: {
      batch_fingerprint: "rec_batch_trade_quality",
      visibility_status: "research_only",
      learning_acceleration_sample: true,
      setup_type: "momentum breakout",
      entry_type_metadata: {
        entry_type: "pullback_limit",
        trigger_semantics: "touch_entry",
      },
      plan_price_freshness: { classification: "fresh", reference_price: 100 },
      market_regime: { regime: "risk_off" },
      day_trade_window_recommendation_target: { tier: "experimental" },
    },
  });

  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_trade_quality",
    snapshots: [aapl, pltr],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: aapl.snapshot_fingerprint,
        recommendation_id: aapl.recommendation_id,
        warnings: ["Risk off tape; long setups require confirmation."],
      }),
      outcome("PLTR", {
        snapshot_fingerprint: pltr.snapshot_fingerprint,
        recommendation_id: pltr.recommendation_id,
        warnings: ["Risk off tape; long setups require confirmation."],
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.trade_quality_decompositions).toHaveLength(2);
  expect(summary.trade_quality_summary.current_batch_decomposed_count).toBe(2);
  expect(summary.trade_quality_summary.advisory_mode).toBe(true);
  expect(
    summary.trade_quality_summary.most_common_weak_components
      .market_regime_support,
  ).toBeGreaterThanOrEqual(1);
  expect(summary.trade_quality_summary.quality_by_setup_family.length).toBeGreaterThan(0);
});

test("market diagnostics renders trade quality decomposition section", () => {
  const aapl = snapshot("AAPL");
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_trade_quality",
    snapshots: [aapl],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: aapl.snapshot_fingerprint,
        recommendation_id: aapl.recommendation_id,
        warnings: ["Risk off tape; long setups require confirmation."],
      }),
    ],
    now: evaluatedAt,
  });
  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput(summary),
  );
  const section = diagnostics.sections.find(
    (item) => item.section_id === "trade_quality_decomposition",
  );
  const dailySection = diagnostics.sections.find(
    (item) => item.section_id === "daily_learning_review",
  );

  expect(section).toBeTruthy();
  expect(section?.lines.join("\n")).toContain("Advisory mode: yes");
  expect(section?.lines.join("\n")).toContain("Current batch decomposed");
  expect(section?.lines.join("\n")).toContain("Overall quality mix");
  expect(section?.lines.join("\n")).toContain("Weakest components");
  expect(dailySection?.lines.join("\n")).toContain("Trade quality mix");
  expect(dailySection?.lines.join("\n")).toContain("Trade quality by setup");
});
