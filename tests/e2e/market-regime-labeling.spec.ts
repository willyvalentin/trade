import { expect, test } from "@playwright/test";

import {
  buildDailyLearningReviewSummary,
  type DailyLearningReviewSummary,
} from "../../lib/daily-learning-review";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import { buildMarketRegimeLabel } from "../../lib/market-regime-labeling";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

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
    scan_run_id: overrides.scan_run_id ?? "rec_scan_run_market_regime",
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
    rationale: overrides.rationale ?? null,
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
      batch_fingerprint: "rec_batch_market_regime",
      visibility_status: researchOnly ? "research_only" : "visible",
      setup_type: "momentum breakout",
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
        qa_checked_source_path: "market_regime_labeling_test",
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
        batch_fingerprint: "rec_batch_market_regime",
        scan_run_fingerprint: "rec_scan_run_market_regime",
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

test("market regime labels risk off from negative momentum and bearish warnings", () => {
  const label = buildMarketRegimeLabel({
    text_signals: [
      "Market regime is risk_off; long setups require stronger confirmation.",
      "Negative momentum and bearish/choppy trend structure.",
    ],
    sector_mix: { technology: 2, financials: 1 },
    setup_family_mix: { momentum_breakout: 2 },
    outcome_count: 30,
  });

  expect(label.regime_label).toBe("risk_off");
  expect(label.regime_confidence).toBe("high");
  expect(label.reason_codes).toContain("negative_momentum");
  expect(label.reason_codes).toContain("bearish_choppy_structure");
  expect(label.caution_flags).toContain("long_setups_require_confirmation");
  expect(label.advisory_only).toBe(true);
});

test("market regime labels choppy from weak candidate mix and chop structure", () => {
  const label = buildMarketRegimeLabel({
    text_signals: ["Midday window is choppy with tight range structure."],
    sector_mix: { technology: 1, energy: 1 },
    setup_family_mix: { unknown: 2 },
    experimental_candidate_count: 5,
    strong_candidate_count: 0,
    valid_candidate_count: 1,
    outcome_count: 12,
  });

  expect(label.regime_label).toBe("choppy");
  expect(label.reason_codes).toContain("experimental_heavy_candidate_mix");
  expect(label.caution_flags).toContain("weak_candidate_mix");
});

test("market regime labels risk on from positive momentum and strong trend", () => {
  const label = buildMarketRegimeLabel({
    text_signals: ["Risk on with positive momentum and strong trend above MA20."],
    sector_mix: { technology: 2, industrials: 1 },
    setup_family_mix: { trend_day_pullback: 2 },
    positive_momentum_count: 1,
    strong_trend_count: 1,
    strong_candidate_count: 2,
    outcome_count: 100,
  });

  expect(label.regime_label).toBe("risk_on");
  expect(label.regime_confidence).toBe("high");
  expect(label.sample_confidence).toBe("high");
});

test("market regime labels sector rotation from concentrated sector mix", () => {
  const label = buildMarketRegimeLabel({
    text_signals: ["Sector leadership is concentrated."],
    sector_mix: { technology: 4, financials: 1, energy: 1 },
    setup_family_mix: { momentum_breakout: 6 },
    outcome_count: 6,
  });

  expect(label.regime_label).toBe("sector_rotation");
  expect(label.reason_codes).toContain("sector_concentration");
});

test("market regime falls back to unknown with metadata gaps", () => {
  const label = buildMarketRegimeLabel();

  expect(label.regime_label).toBe("unknown");
  expect(label.regime_confidence).toBe("low");
  expect(label.reason_codes).toContain("insufficient_market_regime_metadata");
  expect(label.metadata_gaps).toContain("missing_market_regime_text_signals");
  expect(label.metadata_gaps).toContain("missing_sector_mix");
  expect(() => buildMarketRegimeLabel(null)).not.toThrow();
});

test("market regime records low medium high sample confidence", () => {
  expect(buildMarketRegimeLabel({ outcome_count: 1 }).sample_confidence).toBe(
    "low",
  );
  expect(buildMarketRegimeLabel({ outcome_count: 30 }).sample_confidence).toBe(
    "medium",
  );
  expect(buildMarketRegimeLabel({ outcome_count: 100 }).sample_confidence).toBe(
    "high",
  );
});

test("daily learning review includes market regime readback", () => {
  const aapl = snapshot("AAPL", {
    rating: "strong",
    rationale: "Risk off tape with negative momentum.",
    payload_json: {
      batch_fingerprint: "rec_batch_market_regime",
      visibility_status: "visible",
      setup_type: "market reference momentum",
      market_regime: { regime: "risk_off" },
      day_trade_window_recommendation_target: { tier: "strong" },
    },
  });
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_market_regime",
    snapshots: [aapl],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: aapl.snapshot_fingerprint,
        recommendation_id: aapl.recommendation_id,
        warnings: ["Negative momentum; long setups require confirmation."],
      }),
    ],
    now: evaluatedAt,
  });

  expect(summary.market_regime.latest_evaluated_batch_regime_label).toBe(
    "risk_off",
  );
  expect(summary.market_regime.latest_regime_label.reason_codes).toContain(
    "explicit_risk_off",
  );
  expect(summary.market_regime.outcomes_by_regime.risk_off).toBe(1);
  expect(
    summary.market_regime.setup_family_mix_by_regime.risk_off
      ?.market_reference_momentum,
  ).toBe(1);
  expect(summary.market_regime.advisory_mode).toBe(true);
});

test("market diagnostics renders market regime labeling section", () => {
  const aapl = snapshot("AAPL", {
    payload_json: {
      batch_fingerprint: "rec_batch_market_regime",
      visibility_status: "visible",
      setup_type: "market reference momentum",
      market_regime: { regime: "risk_off" },
      day_trade_window_recommendation_target: { tier: "strong" },
    },
  });
  const summary = buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_market_regime",
    snapshots: [aapl],
    outcomes: [
      outcome("AAPL", {
        snapshot_fingerprint: aapl.snapshot_fingerprint,
        recommendation_id: aapl.recommendation_id,
        warnings: ["Negative momentum and bearish/choppy structure."],
      }),
    ],
    now: evaluatedAt,
  });
  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput(summary),
  );
  const section = diagnostics.sections.find(
    (item) => item.section_id === "market_regime_labeling",
  );
  const dailySection = diagnostics.sections.find(
    (item) => item.section_id === "daily_learning_review",
  );

  expect(section).toBeTruthy();
  expect(section?.lines.join("\n")).toContain("Advisory mode: yes");
  expect(section?.lines.join("\n")).toContain("Latest regime: risk_off");
  expect(section?.lines.join("\n")).toContain("Reason codes");
  expect(section?.lines.join("\n")).toContain("Metadata gaps");
  expect(dailySection?.lines.join("\n")).toContain("Latest market regime");
  expect(dailySection?.lines.join("\n")).toContain("Regime x setup family");
});

