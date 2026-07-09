import { expect, test } from "@playwright/test";

import {
  buildHistoricalCandleCacheKey,
  buildHistoricalCandleCacheReadiness,
  validateHistoricalCandleShape,
  type HistoricalCandle,
} from "../../lib/historical-candle-cache";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";

const evaluatedAt = "2026-07-09T15:00:00.000Z";

function candle(overrides: Partial<HistoricalCandle> = {}): HistoricalCandle {
  return {
    ticker: "AAPL",
    interval: "5min",
    timestamp: "2026-07-09T14:30:00.000Z",
    open: 100,
    high: 103,
    low: 99,
    close: 102,
    volume: 1_000_000,
    source: "mock",
    adjusted: false,
    timezone: "America/New_York",
    ...overrides,
  };
}

function baseDiagnosticsInput(
  overrides: Partial<MarketDiagnosticsConsoleInput> = {},
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
      scanner_readiness: { selected_ticker_count: 6 },
      outcome_readiness: {
        route_available: true,
        evaluated_recommendations: 0,
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
      next_action: { label: "Review candle cache" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 11:00 America/New_York",
      calendar_confidence: "high",
      provider_calendar_available: true,
      fallback_calendar_scan_allowed: false,
      active_window: "midday",
      decision: "scan_allowed",
      should_scan_now: true,
      next_window: "power_hour",
      next_window_label: "Power Hour",
      next_window_starts_at: "2026-07-09T19:00:00.000Z",
      warnings: [],
      official_scan_windows: [],
      official_window_statuses: [],
    },
    serving_cadence: {
      warnings: [],
      serving_decision: "served",
      no_trade_valid: false,
      visible_recommendation_count: 0,
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
      selected_tickers: 3,
      selected_ticker_symbols: ["AAPL", "PLTR", "DKNG"],
      total_universe_size: 50,
    },
    scanner_output_qa: {
      overall_status: "healthy",
      summary: "healthy",
      warnings: [],
      recommended_next_action: { label: "No action" },
      candidate_count: 0,
      metadata_coverage: {
        recommendation_rows_with_data_timestamp: 0,
        recommendation_rows_with_provider_source: 0,
        explicit_gap_count: 0,
        missing_metadata_fields: [],
        qa_checked_source_path: "historical_candle_cache_test",
        metadata_missing_at_stage: null,
      },
    },
    real_output_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      coverage: {
        strong_count: 0,
        valid_count: 0,
        experimental_count: 0,
      },
    },
    batch_memory: {
      warnings: [],
      latest_batch: null,
      persistence_status: "ok",
      persistence_mode: "persisted",
      total_batches: 0,
    },
    scan_run_history: {
      top_warnings: [],
      latest_run_status: "completed",
      total_scan_runs: 0,
    },
    daily_targets: {
      warnings: [],
      total_recommendations_today: 0,
      full_day_recommendation_target_min: 4,
      full_day_recommendation_target_max: 12,
    },
    day_window_target: {
      status: "served",
      strong_candidate_gate: {
        candidates_considered_for_strong: 0,
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
        total_recommendations: 0,
        pending_outcomes: 0,
        evaluated_recommendations: 0,
      },
    },
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    daily_learning_review: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
    ...overrides,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("empty input does not throw", () => {
  const summary = buildHistoricalCandleCacheReadiness();

  expect(summary.advisory_only).toBe(true);
  expect(summary.validation.candles_inspected).toBe(0);
  expect(summary.readiness.ready_to_define_storage).toBe(true);
});

test("valid candle passes validation", () => {
  const result = validateHistoricalCandleShape(candle());

  expect(result.valid).toBe(true);
  expect(result.reason_codes).toEqual([]);
});

test("invalid OHLC geometry fails validation", () => {
  const result = validateHistoricalCandleShape(
    candle({ high: 98, low: 99, open: 100, close: 102 }),
  );

  expect(result.valid).toBe(false);
  expect(result.reason_codes).toContain("invalid_ohlc_high_below_low");
  expect(result.reason_codes).toContain(
    "invalid_ohlc_high_below_open_or_close",
  );
});

test("missing timestamp fails validation", () => {
  const result = validateHistoricalCandleShape(candle({ timestamp: null }));

  expect(result.valid).toBe(false);
  expect(result.missing_fields).toContain("timestamp");
});

test("missing ticker fails validation", () => {
  const result = validateHistoricalCandleShape(candle({ ticker: "" }));

  expect(result.valid).toBe(false);
  expect(result.missing_fields).toContain("ticker");
});

test("negative volume fails validation", () => {
  const result = validateHistoricalCandleShape(candle({ volume: -1 }));

  expect(result.valid).toBe(false);
  expect(result.reason_codes).toContain("negative_volume");
});

test("duplicate timestamp detection is reported", () => {
  const summary = buildHistoricalCandleCacheReadiness({
    candles: [candle(), candle()],
  });

  expect(summary.validation.stale_or_out_of_order).toBe(1);
  expect(summary.reason_codes).toContain("duplicate_timestamps_detected");
});

test("cache key is stable and deterministic", () => {
  const key = buildHistoricalCandleCacheKey({
    provider: "twelve_data",
    ticker: "aapl",
    interval: "5min",
    trading_day: "2026-07-08",
    session: "regular",
    timezone: "America/New_York",
    adjusted: false,
  });

  expect(key).toBe(
    "twelve_data:AAPL:5min:2026-07-08:regular:America/New_York:adjusted_false",
  );
});

test("lookahead and safety flags are present", () => {
  const summary = buildHistoricalCandleCacheReadiness();

  expect(summary.lookahead_safety.analysis_cutoff_required).toBe(true);
  expect(summary.lookahead_safety.cache_can_include_future_candles).toBe(true);
  expect(summary.lookahead_safety.signal_generation_must_filter_to_cutoff).toBe(
    true,
  );
  expect(summary.safety.provider_fetch_added).toBe(false);
  expect(summary.safety.historical_fetch_added).toBe(false);
  expect(summary.safety.candles_persisted).toBe(false);
  expect(summary.safety.scanner_behavior_changed).toBe(false);
  expect(summary.readiness.ready_to_fetch_historical_data).toBe(false);
  expect(summary.readiness.ready_to_use_for_backfill).toBe(false);
  expect(summary.readiness.ready_to_use_for_scanner).toBe(false);
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "historical_candle_cache",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Provider: Twelve Data");
  expect(section?.lines).toContain("Preferred interval: 5min");
  expect(section?.lines).toContain(
    "Storage table proposed: historical_candles",
  );
  expect(section?.lines).toContain("Reuse before fetch: yes");
  expect(section?.lines).toContain("Dedupe required: yes");
  expect(section?.lines).toContain("Ready to define storage: yes");
  expect(section?.lines).toContain("Ready to fetch historical data: no");
  expect(section?.lines).toContain("Ready to use for backfill: no");
  expect(section?.lines).toContain("Ready to use for scanner: no");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Historical fetch added: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith("Historical candle cache: planned"),
    ),
  ).toBe(true);
});
