import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import { buildProviderBudgetGuardSummary } from "../../lib/provider-budget-guard";
import { buildProviderPlanProfile } from "../../lib/provider-plan-profile";
import {
  buildTwelveDataHistoricalResponseParserReadiness,
  normalizeTwelveDataCandle,
  parseTwelveDataHistoricalResponse,
  type TwelveDataHistoricalRawResponse,
} from "../../lib/twelve-data-historical-response-parser";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import type { ScannerUniverseCoverageSummary } from "../../lib/scanner-universe";

const evaluatedAt = "2026-07-09T15:00:00.000Z";

function validResponse(
  overrides: Partial<TwelveDataHistoricalRawResponse> = {},
): TwelveDataHistoricalRawResponse {
  return {
    meta: {
      symbol: "AAPL",
      interval: "5min",
      currency: "USD",
      exchange_timezone: "America/New_York",
      exchange: "NASDAQ",
      mic_code: "XNGS",
      type: "Common Stock",
    },
    values: [
      {
        datetime: "2026-07-08 09:30:00",
        open: "213.10",
        high: "213.50",
        low: "212.90",
        close: "213.20",
        volume: "123456",
      },
      {
        datetime: "2026-07-08 09:35:00",
        open: "213.20",
        high: "214.00",
        low: "213.00",
        close: "213.80",
        volume: "234567",
      },
    ],
    status: "ok",
    ...overrides,
  };
}

function providerBudgetGuard() {
  return buildProviderBudgetGuardSummary({
    plan_mode: "grow",
    scanner_universe: {
      selected_tickers: 3,
      scan_budget: {
        requested_tickers: 3,
        effective_tickers: 3,
      },
    } as ScannerUniverseCoverageSummary,
    custom_limits: {
      daily_soft_limit: 2500,
      window_soft_limit: 450,
    },
    provider_env: { twelve_data_configured: true },
    now: evaluatedAt,
  });
}

function baseDiagnosticsInput(
  overrides: Partial<MarketDiagnosticsConsoleInput> = {},
): MarketDiagnosticsConsoleInput {
  const dailyLearningReview = buildDailyLearningReviewSummary({
    snapshots: [],
    outcomes: [],
    configured_static_universe_count: 50,
    now: evaluatedAt,
  });

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
      scanner_readiness: { selected_ticker_count: 3 },
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
      next_action: { label: "Review Twelve Data response parser" },
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
    provider_budget_guard: providerBudgetGuard(),
    provider_plan_profile: buildProviderPlanProfile({
      TWELVE_DATA_PLAN_MODE: "grow",
    }),
    scanner_universe: {
      warnings: [],
      selected_tickers: 3,
      selected_ticker_symbols: ["AAPL", "AMD", "PLTR"],
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
        qa_checked_source_path: "twelve_data_historical_response_parser_test",
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
    daily_learning_review: dailyLearningReview,
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
    ...overrides,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("empty input does not throw", () => {
  const summary = parseTwelveDataHistoricalResponse();

  expect(summary.advisory_only).toBe(true);
  expect(summary.mock_only).toBe(true);
  expect(summary.parse_status).toBe("empty");
});

test("valid mock response parses to valid normalized candles", () => {
  const summary = parseTwelveDataHistoricalResponse({
    response: validResponse(),
    context: {
      ticker: "AAPL",
      interval: "5min",
      trading_day: "2026-07-08",
      session: "official_windows",
    },
  });

  expect(summary.parse_status).toBe("ok");
  expect(summary.validation.raw_candles_count).toBe(2);
  expect(summary.validation.valid_candles_count).toBe(2);
  expect(summary.validation.invalid_candles_count).toBe(0);
  expect(summary.candles[0]?.ticker).toBe("AAPL");
  expect(summary.candles[0]?.source).toBe("twelve_data");
});

test("numeric strings parse correctly", () => {
  const candle = normalizeTwelveDataCandle(
    {
      datetime: "2026-07-08 09:30:00",
      open: "213.10",
      high: "213.50",
      low: "212.90",
      close: "213.20",
      volume: "123456",
    },
    { ticker: "AAPL", interval: "5min", timezone: "America/New_York" },
  );

  expect(candle.open).toBe(213.1);
  expect(candle.high).toBe(213.5);
  expect(candle.low).toBe(212.9);
  expect(candle.close).toBe(213.2);
  expect(candle.volume).toBe(123456);
  expect(candle.timestamp).toContain("T");
});

test("missing values response returns empty safely", () => {
  const summary = parseTwelveDataHistoricalResponse({
    response: validResponse({ values: null }),
  });

  expect(summary.parse_status).toBe("empty");
  expect(summary.validation.raw_candles_count).toBe(0);
});

test("error response returns parse_status error", () => {
  const summary = parseTwelveDataHistoricalResponse({
    response: {
      status: "error",
      code: 400,
      message: "Bad request",
    },
  });

  expect(summary.parse_status).toBe("error");
  expect(summary.provider_error_code).toBe("400");
  expect(summary.provider_error_message).toBe("Bad request");
});

test("invalid OHLC geometry is flagged", () => {
  const summary = parseTwelveDataHistoricalResponse({
    response: validResponse({
      values: [
        {
          datetime: "2026-07-08 09:30:00",
          open: "100",
          high: "99",
          low: "101",
          close: "100",
          volume: "10",
        },
      ],
    }),
  });

  expect(summary.parse_status).toBe("partial");
  expect(summary.validation.invalid_candles_count).toBe(1);
  expect(summary.reason_codes).toContain("invalid_ohlc_high_below_low");
});

test("duplicate timestamps are detected", () => {
  const summary = parseTwelveDataHistoricalResponse({
    response: validResponse({
      values: [
        validResponse().values?.[0] ?? {},
        validResponse().values?.[0] ?? {},
      ],
    }),
  });

  expect(summary.parse_status).toBe("partial");
  expect(summary.validation.duplicate_timestamp_count).toBe(1);
  expect(summary.reason_codes).toContain("duplicate_timestamps_detected");
});

test("out-of-order candles are detected and normalized output is sorted", () => {
  const response = validResponse();
  const summary = parseTwelveDataHistoricalResponse({
    response: {
      ...response,
      values: [...(response.values ?? [])].reverse(),
    },
  });

  expect(summary.parse_status).toBe("partial");
  expect(summary.validation.out_of_order_count).toBe(1);
  expect(new Date(summary.candles[0]?.timestamp ?? "").getTime()).toBeLessThan(
    new Date(summary.candles[1]?.timestamp ?? "").getTime(),
  );
});

test("symbol mismatch is flagged", () => {
  const summary = parseTwelveDataHistoricalResponse({
    response: validResponse(),
    context: { ticker: "MSFT", interval: "5min" },
  });

  expect(summary.parse_status).toBe("partial");
  expect(summary.reason_codes).toContain("meta_ticker_mismatch");
});

test("interval mismatch is flagged", () => {
  const summary = parseTwelveDataHistoricalResponse({
    response: validResponse(),
    context: { ticker: "AAPL", interval: "15min" },
  });

  expect(summary.parse_status).toBe("partial");
  expect(summary.reason_codes).toContain("interval_mismatch");
});

test("cache key mapping works", () => {
  const summary = buildTwelveDataHistoricalResponseParserReadiness();

  expect(summary.cache_mapping.cache_key).toContain("twelve_data:AAPL:5min");
  expect(summary.cache_mapping.provider).toBe("twelve_data");
  expect(summary.cache_mapping.session).toBe("official_windows");
});

test("safety flags keep provider fetch persistence and scanner changes disabled", () => {
  const summary = buildTwelveDataHistoricalResponseParserReadiness();

  expect(summary.safety.provider_fetch_added).toBe(false);
  expect(summary.safety.historical_fetch_added).toBe(false);
  expect(summary.safety.candles_persisted).toBe(false);
  expect(summary.safety.synthetic_outcomes_persisted).toBe(false);
  expect(summary.safety.scanner_behavior_changed).toBe(false);
  expect(summary.safety.live_ranking_changed).toBe(false);
  expect(summary.readiness.ready_to_parse_provider_response).toBe(false);
  expect(summary.readiness.ready_to_persist_candles).toBe(false);
  expect(summary.readiness.ready_to_run_backfill).toBe(false);
  expect(summary.readiness.safe_to_affect_scanner).toBe(false);
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "twelve_data_historical_response_parser",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Mock mode: yes");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Historical fetch added: no");
  expect(section?.lines).toContain("Parse status: ok");
  expect(section?.lines).toContain(
    "Raw/normalized/valid/invalid candles: 2 / 2 / 2 / 0",
  );
  expect(section?.lines).toContain("Duplicate timestamps: 0");
  expect(section?.lines).toContain("Out-of-order candles: 0");
  expect(section?.lines).toContain("Cache key mapped: yes");
  expect(section?.lines).toContain("Ready to parse mock response: yes");
  expect(section?.lines).toContain("Ready to parse provider response: no");
  expect(section?.lines).toContain("Ready to persist candles: no");
  expect(section?.lines).toContain("Ready to run backfill: no");
  expect(section?.lines).toContain("Safe to affect scanner: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith("Twelve Data response parser: mock"),
    ),
  ).toBe(true);
});
