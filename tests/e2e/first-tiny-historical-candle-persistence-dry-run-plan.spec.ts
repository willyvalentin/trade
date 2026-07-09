import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalCandlePersistenceDryRunPlan,
  firstTinyHistoricalCandlePersistenceDryRunPlanMarker,
} from "../../lib/first-tiny-historical-candle-persistence-dry-run-plan";
import { firstTinyFetchRunAuditWriteResultVerificationMarker } from "../../lib/first-tiny-historical-fetch-run-audit-write-result-verification";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import {
  buildMarketDiagnosticsConsoleSummary,
  type MarketDiagnosticsConsoleInput,
} from "../../lib/market-diagnostics-console";

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-candle-persistence-dry-run-plan.md",
);
const evaluatedAt = "2026-07-09T16:00:00.000Z";

function readRunbook() {
  return readFileSync(runbookPath, "utf8");
}

function storageDetection() {
  return historicalCandleStorageReadbackToDetection(
    buildHistoricalCandleStorageReadback({
      readback_attempted: true,
      migration_versions: ["20260709000000"],
      tables: ["historical_candles", "historical_candle_fetch_runs"],
      unique_constraint_columns: [
        "provider",
        "ticker",
        "interval",
        "timestamp",
        "adjusted",
      ],
      indexes: [
        "historical_candles_ticker_interval_timestamp_idx",
        "historical_candles_provider_ticker_trading_day_idx",
        "historical_candles_interval_timestamp_idx",
        "historical_candles_fetch_run_id_idx",
        "historical_candles_validation_status_idx",
        "historical_candle_fetch_runs_provider_requested_at_idx",
        "historical_candle_fetch_runs_status_idx",
        "historical_candle_fetch_runs_interval_trading_day_range_idx",
      ],
      rls_enabled_by_table: {
        historical_candles: true,
        historical_candle_fetch_runs: true,
      },
      policies: [],
      client_grants: [],
      checked_at: evaluatedAt,
      detection_source: "test_catalog_readback",
    }),
  );
}

function baseDiagnosticsInput(): MarketDiagnosticsConsoleInput {
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
      outcome_readiness: { route_available: true, evaluated_recommendations: 0 },
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
      next_action: { label: "Review candle persistence dry-run" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 12:00 America/New_York",
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
        qa_checked_source_path:
          "first_tiny_historical_candle_persistence_dry_run_plan_test",
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
    historical_candle_storage_detection: storageDetection(),
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("runbook documents count-level candle persistence dry-run only", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "First Tiny Historical Candle Persistence Dry-Run Plan",
  );
  expect(runbook).toContain(firstTinyHistoricalCandlePersistenceDryRunPlanMarker);
  expect(runbook).toContain(firstTinyFetchRunAuditWriteResultVerificationMarker);
  expect(runbook).toContain("fc58a15a-1748-4e8d-b7d9-03e4826c1d5f");
  expect(runbook).toContain("historical_candles");
  expect(runbook).toContain("provider, ticker, interval, timestamp, adjusted");
  expect(runbook).toContain("expected candle rows: `27`");
  expect(runbook).toContain("candle payload available: `false`");
  expect(runbook).toContain("No OHLCV candle rows are invented");
  expect(runbook).toContain(
    "separate approved provider refetch for the fixed AAPL / 5min / 2026-07-08 scope",
  );
  expect(runbook).toContain("candles persisted: `false`");
  expect(runbook).toContain("replay executed: `false`");
  expect(runbook).toContain("scanner behavior changed: `false`");
});

test("helper builds the exact dry-run plan without executable candle rows", () => {
  const plan = buildFirstTinyHistoricalCandlePersistenceDryRunPlan();

  expect(plan.plan_status).toBe("planned");
  expect(plan.plan_marker).toBe(
    firstTinyHistoricalCandlePersistenceDryRunPlanMarker,
  );
  expect(plan.plan_mode).toBe("dry_run_only");
  expect(plan.dry_run_only).toBe(true);
  expect(plan.source_verification).toBe(
    firstTinyFetchRunAuditWriteResultVerificationMarker,
  );
  expect(plan.target_table).toBe("historical_candles");
  expect(plan.candle_write_allowed_now).toBe(false);
  expect(plan.fetch_run.fetch_run_id).toBe(
    "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
  );
  expect(plan.fetch_run.fetch_run_id_attached).toBe(true);
  expect(plan.request_scope).toMatchObject({
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    session: "regular",
    timezone: "America/New_York",
    adjusted: false,
  });
  expect(plan.count_level_plan.expected_candle_rows).toBe(27);
  expect(plan.count_level_plan.planned_inserts).toBe(27);
  expect(plan.count_level_plan.planned_updates).toBe(0);
  expect(plan.count_level_plan.planned_skips).toBe(0);
  expect(plan.count_level_plan.planned_invalid_rejections).toBe(0);
  expect(plan.count_level_plan.conflict_target).toEqual([
    "provider",
    "ticker",
    "interval",
    "timestamp",
    "adjusted",
  ]);
  expect(plan.payload_availability.candle_payload_available).toBe(false);
  expect(plan.payload_availability.executable_candle_rows_available).toBe(false);
  expect(plan.payload_availability.executable_candle_write_ready).toBe(false);
  expect(plan.payload_availability.ready_for_future_candle_write).toBe(false);
  expect(plan.payload_availability.no_ohlcv_values_invented).toBe(true);
  expect(plan.payload_availability.normalized_candle_rows).toEqual([]);
  expect(plan.safety.candles_persisted).toBe(false);
  expect(plan.safety.raw_response_persisted).toBe(false);
  expect(plan.safety.synthetic_outcomes_persisted).toBe(false);
  expect(plan.safety.replay_executed).toBe(false);
  expect(plan.safety.scanner_behavior_changed).toBe(false);
  expect(plan.safety.live_ranking_changed).toBe(false);
  expect(plan.recommended_next_steps).toContain(
    "require_separate_provider_refetch_or_payload_capture_before_candle_write_if_payload_missing",
  );
});

test("diagnostics render dry-run plan and do not call provider or write paths", () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("unexpected provider call");
  }) as typeof fetch;

  try {
    const diagnostics = buildMarketDiagnosticsConsoleSummary(
      baseDiagnosticsInput(),
    );
    const section = diagnostics.sections.find(
      (item) =>
        item.section_id ===
        "first_tiny_historical_candle_persistence_dry_run_plan",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe(
      "First Tiny Candle Persistence Dry-Run Plan",
    );
    expect(section?.lines).toContain("Status: planned / dry-run only");
    expect(section?.lines).toContain(
      `Source verification: ${firstTinyFetchRunAuditWriteResultVerificationMarker}`,
    );
    expect(section?.lines).toContain("Target table: historical_candles");
    expect(section?.lines).toContain(
      "Fetch run id: fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    );
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain("Expected candle rows: 27");
    expect(section?.lines).toContain("Candle payload available: no");
    expect(section?.lines).toContain("Count-level plan ready: yes");
    expect(section?.lines).toContain("Executable candle rows available: no");
    expect(section?.lines).toContain("Ready for future candle write: no");
    expect(section?.lines).toContain("Candle write allowed now: no");
    expect(section?.lines).toContain("Candles persisted: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Live ranking changed: no");
    expect(section?.metrics.dry_run_only).toBe(true);
    expect(section?.metrics.target_table).toBe("historical_candles");
    expect(section?.metrics.expected_candle_rows).toBe(27);
    expect(section?.metrics.candle_payload_available).toBe(false);
    expect(section?.metrics.executable_candle_write_ready).toBe(false);
    expect(section?.metrics.normalized_candle_rows_count).toBe(0);
    expect(section?.metrics.no_ohlcv_values_invented).toBe(true);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.recommended_next_steps).toContain(
      "require_separate_provider_refetch_or_payload_capture_before_candle_write_if_payload_missing",
    );
    expect(intelligence?.lines).toContain(
      "First tiny candle persistence dry-run: planned / expected 27 / payload no / write no",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_persistence_dry_run_plan",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
