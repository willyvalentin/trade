import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import type { HistoricalCandle } from "../../lib/historical-candle-cache";
import {
  buildHistoricalCandlePersistencePlan,
  buildHistoricalCandleUpsertPlan,
  validateHistoricalCandlePersistenceReadiness,
} from "../../lib/historical-candle-persistence-plan";
import { buildHistoricalCandleStorageReadiness } from "../../lib/historical-candle-storage-readiness";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import { buildProviderBudgetGuardSummary } from "../../lib/provider-budget-guard";
import { buildProviderPlanProfile } from "../../lib/provider-plan-profile";
import { buildTwelveDataHistoricalResponseParserReadiness } from "../../lib/twelve-data-historical-response-parser";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import type { ScannerUniverseCoverageSummary } from "../../lib/scanner-universe";

const evaluatedAt = "2026-07-09T15:00:00.000Z";

function candle(overrides: Partial<HistoricalCandle> = {}): HistoricalCandle {
  return {
    ticker: "AAPL",
    interval: "5min",
    timestamp: "2026-07-08T13:30:00.000Z",
    open: 213.1,
    high: 213.5,
    low: 212.9,
    close: 213.2,
    volume: 123456,
    source: "twelve_data",
    adjusted: false,
    timezone: "America/New_York",
    ...(overrides as HistoricalCandle),
  };
}

function candleWithCacheKey(
  overrides: Partial<HistoricalCandle & { cache_key?: string | null }> = {},
) {
  return {
    ...candle(overrides),
    cache_key:
      overrides.cache_key ??
      "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false",
  } as HistoricalCandle & { cache_key: string };
}

function storageReadinessApplied() {
  return buildHistoricalCandleStorageReadiness({
    migration_draft_reviewed: true,
    migration_detection: {
      historical_candles_table_detected: true,
      historical_candle_fetch_runs_table_detected: true,
      expected_unique_key_detected: true,
      expected_indexes_detected: true,
      rls_enabled_detected: true,
      client_write_policies_detected: false,
      client_read_policies_detected: false,
      detection_source: "mock_schema_readback",
      checked_at: evaluatedAt,
    },
  });
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
      next_action: { label: "Review candle persistence plan" },
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
        qa_checked_source_path: "historical_candle_persistence_plan_test",
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
    historical_candle_storage_detection: {
      historical_candles_table_detected: true,
      historical_candle_fetch_runs_table_detected: true,
      expected_unique_key_detected: true,
      expected_indexes_detected: true,
      rls_enabled_detected: true,
      client_write_policies_detected: false,
      client_read_policies_detected: false,
      detection_source: "mock_schema_readback",
      checked_at: evaluatedAt,
    },
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
    ...overrides,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("empty input does not throw and remains advisory dry-run only", () => {
  const plan = buildHistoricalCandlePersistencePlan();

  expect(plan.advisory_only).toBe(true);
  expect(plan.dry_run_only).toBe(true);
  expect(plan.input_summary.candles_received).toBe(0);
  expect(plan.readiness.ready_to_persist_candles).toBe(false);
});

test("valid candles produce planned inserts", () => {
  const plan = buildHistoricalCandlePersistencePlan({
    candles: [candleWithCacheKey(), candleWithCacheKey({
      ticker: "AMD",
      timestamp: "2026-07-08T13:35:00.000Z",
      cache_key:
        "twelve_data:AMD:5min:2026-07-08:official_windows:America/New_York:adjusted_false",
    })],
    storage_readiness: storageReadinessApplied(),
  });

  expect(plan.input_summary.valid_candles).toBe(2);
  expect(plan.upsert_plan.planned_inserts).toBe(2);
  expect(plan.cache_analysis.cache_misses).toBe(2);
});

test("invalid candles produce planned invalid rejections", () => {
  const plan = buildHistoricalCandlePersistencePlan({
    candles: [candleWithCacheKey({ high: 99, low: 101 })],
  });

  expect(plan.input_summary.invalid_candles).toBe(1);
  expect(plan.upsert_plan.planned_invalid_rejections).toBe(1);
  expect(plan.validation_mapping.validation_status_counts.invalid).toBe(1);
});

test("duplicate input candles are deduped", () => {
  const duplicate = candleWithCacheKey();
  const plan = buildHistoricalCandlePersistencePlan({
    candles: [duplicate, duplicate],
  });

  expect(plan.input_summary.duplicate_input_candles).toBe(1);
  expect(plan.upsert_plan.planned_duplicates_deduped).toBe(1);
  expect(plan.upsert_plan.planned_inserts).toBe(1);
});

test("existing cache key produces planned skip", () => {
  const row = candleWithCacheKey();
  const plan = buildHistoricalCandlePersistencePlan({
    candles: [row],
    existing_cache_keys: [row.cache_key],
  });

  expect(plan.cache_analysis.cache_hits).toBe(1);
  expect(plan.upsert_plan.planned_skips).toBe(1);
  expect(plan.upsert_plan.planned_updates).toBe(0);
});

test("missing cache key still plans insert and records metadata gap", () => {
  const plan = buildHistoricalCandlePersistencePlan({
    candles: [candle()],
  });

  expect(plan.cache_analysis.missing_cache_key_count).toBe(1);
  expect(plan.upsert_plan.planned_inserts).toBe(1);
  expect(plan.metadata_gaps).toContain("cache_key_missing");
});

test("migration unknown keeps ready_to_persist_candles false", () => {
  const readiness = validateHistoricalCandlePersistenceReadiness();
  const plan = buildHistoricalCandlePersistencePlan({
    candles: [candleWithCacheKey()],
  });

  expect(readiness.migration_applied).toBe("unknown");
  expect(plan.persistence_context.migration_applied).toBe("unknown");
  expect(plan.readiness.ready_to_persist_candles).toBe(false);
  expect(plan.readiness.ready_to_write_fetch_run).toBe(false);
});

test("conflict target uses storage unique key", () => {
  const upsert = buildHistoricalCandleUpsertPlan({
    candles: [candleWithCacheKey()],
  });

  expect(upsert.conflict_target).toEqual([
    "provider",
    "ticker",
    "interval",
    "timestamp",
    "adjusted",
  ]);
});

test("safety flags prevent fetch run candle synthetic and scanner writes", () => {
  const plan = buildHistoricalCandlePersistencePlan({
    candles: buildTwelveDataHistoricalResponseParserReadiness().candles,
  });

  expect(plan.safety.fetch_run_persisted).toBe(false);
  expect(plan.safety.candles_persisted).toBe(false);
  expect(plan.safety.synthetic_outcomes_persisted).toBe(false);
  expect(plan.safety.scanner_behavior_changed).toBe(false);
  expect(plan.safety.provider_fetch_added).toBe(false);
  expect(plan.safety.historical_fetch_added).toBe(false);
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "historical_candle_persistence_plan",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Dry run only: yes");
  expect(section?.lines).toContain("Target table: historical_candles");
  expect(section?.lines).toContain(
    "Fetch runs table: historical_candle_fetch_runs",
  );
  expect(section?.lines).toContain("Migration applied: yes");
  expect(section?.lines).toContain("Table detected: yes");
  expect(section?.lines).toContain("Candles received/valid/invalid: 2 / 2 / 0");
  expect(section?.lines).toContain(
    "Planned inserts/updates/skips/rejections: 2 / 0 / 0 / 0",
  );
  expect(section?.lines).toContain("Cache hits/misses: 0 / 2");
  expect(section?.lines).toContain(
    "Conflict target: provider, ticker, interval, timestamp, adjusted",
  );
  expect(section?.lines).toContain("Fetch-run audit: dry-run only");
  expect(section?.lines).toContain("Ready to plan upsert: yes");
  expect(section?.lines).toContain("Ready to persist candles: no");
  expect(section?.lines).toContain("Ready to create synthetic outcomes: no");
  expect(section?.lines).toContain("Ready to run backfill: no");
  expect(section?.lines).toContain("Ready to use for scanner: no");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Historical fetch added: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Fetch run persisted: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith("Historical candle persistence: dry-run"),
    ),
  ).toBe(true);
});
