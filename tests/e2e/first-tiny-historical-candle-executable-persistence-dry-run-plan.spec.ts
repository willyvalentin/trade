import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan,
  firstTinyHistoricalCandleExecutablePersistenceDryRunPlanMarker,
  type FirstTinyExecutableCandleRow,
} from "../../lib/first-tiny-historical-candle-executable-persistence-dry-run-plan";
import { firstTinyCorrectedPayloadRefetchResultVerificationMarker } from "../../lib/first-tiny-historical-candle-corrected-payload-refetch-result-verification";
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
  "docs/first-tiny-historical-candle-executable-persistence-dry-run-plan.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";
const firstTimestamp = "2026-07-08T13:45:00.000Z";
const lastTimestamp = "2026-07-08T19:45:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";

function readRunbook() {
  return readFileSync(runbookPath, "utf8");
}

function validRows(): FirstTinyExecutableCandleRow[] {
  const start = new Date(firstTimestamp).getTime();

  return Array.from({ length: 73 }, (_, index) => {
    const price = 210 + index * 0.1;
    return {
      provider: "twelve_data",
      ticker: "AAPL",
      interval: "5min",
      timestamp: new Date(start + index * 5 * 60 * 1000).toISOString(),
      open: Number(price.toFixed(2)),
      high: Number((price + 0.4).toFixed(2)),
      low: Number((price - 0.3).toFixed(2)),
      close: Number((price + 0.1).toFixed(2)),
      volume: 100000 + index,
      adjusted: false,
      trading_day: "2026-07-08",
      session: "regular",
      timezone: "America/New_York",
      fetch_run_id: fetchRunId,
      source_verification: firstTinyCorrectedPayloadRefetchResultVerificationMarker,
      source_strategy: "full_day_fetch_then_filter_locally",
      ohlcv_values_recorded_in_artifact: true,
    };
  });
}

function persistenceKey(row: FirstTinyExecutableCandleRow) {
  return [
    row.provider,
    row.ticker,
    row.interval,
    row.timestamp,
    row.adjusted ? "adjusted_true" : "adjusted_false",
  ].join(":");
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
      next_action: { label: "Review executable candle persistence dry-run" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 14:30 America/New_York",
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
          "first_tiny_historical_candle_executable_persistence_dry_run_plan_test",
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

test("runbook documents executable dry-run plan and no-write guarantees", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "Executable First Tiny Candle Persistence Dry-Run Plan",
  );
  expect(runbook).toContain(
    firstTinyHistoricalCandleExecutablePersistenceDryRunPlanMarker,
  );
  expect(runbook).toContain(firstTinyCorrectedPayloadRefetchResultVerificationMarker);
  expect(runbook).toContain("historical_candles");
  expect(runbook).toContain("provider, ticker, interval, timestamp, adjusted");
  expect(runbook).toContain(fetchRunId);
  expect(runbook).toContain("expected candle rows: `73`");
  expect(runbook).toContain("candidate candle rows: `73`");
  expect(runbook).toContain("timestamp metadata valid rows: `73`");
  expect(runbook).toContain("valid candle rows: `0`");
  expect(runbook).toContain("OHLCV missing rows: `73`");
  expect(runbook).toContain("planned invalid rejections: `73`");
  expect(runbook).toContain("does not invent them");
  expect(runbook).toContain("candles persisted: `false`");
  expect(runbook).toContain("raw response persisted: `false`");
  expect(runbook).toContain("fetch run persisted: `false`");
  expect(runbook).toContain("replay executed: `false`");
  expect(runbook).toContain("scanner behavior changed: `false`");
  expect(runbook).not.toContain("apikey");
});

test("default plan uses Action 290 rows and rejects missing OHLCV without writes", () => {
  const plan = buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan();

  expect(plan.plan_status).toBe("planned");
  expect(plan.plan_marker).toBe(
    firstTinyHistoricalCandleExecutablePersistenceDryRunPlanMarker,
  );
  expect(plan.dry_run_only).toBe(true);
  expect(plan.source_verification).toBe(
    firstTinyCorrectedPayloadRefetchResultVerificationMarker,
  );
  expect(plan.target_table).toBe("historical_candles");
  expect(plan.fetch_run.fetch_run_id).toBe(fetchRunId);
  expect(plan.payload_summary.source_payload_rows).toBe(73);
  expect(plan.payload_summary.expected_candle_rows).toBe(73);
  expect(plan.payload_summary.candidate_candle_rows).toBe(73);
  expect(plan.payload_summary.timestamp_metadata_valid_rows).toBe(73);
  expect(plan.payload_summary.valid_candle_rows).toBe(0);
  expect(plan.payload_summary.invalid_candle_rows).toBe(73);
  expect(plan.payload_summary.ohlcv_valid_rows).toBe(0);
  expect(plan.payload_summary.ohlcv_missing_rows).toBe(73);
  expect(plan.payload_summary.first_timestamp).toBe(firstTimestamp);
  expect(plan.payload_summary.last_timestamp).toBe(lastTimestamp);
  expect(plan.payload_summary.five_minute_spacing_valid).toBe(true);
  expect(plan.payload_summary.window_matches_intended).toBe(true);
  expect(plan.upsert_plan.planned_inserts).toBe(0);
  expect(plan.upsert_plan.planned_updates).toBe(0);
  expect(plan.upsert_plan.planned_skips).toBe(0);
  expect(plan.upsert_plan.planned_invalid_rejections).toBe(73);
  expect(plan.validation.rejection_reason_counts.missing_or_invalid_open).toBe(
    73,
  );
  expect(
    plan.validation.rejection_reason_counts
      .ohlcv_values_not_recorded_in_source_artifact,
  ).toBe(73);
  expect(plan.safety.candle_write_allowed_now).toBe(false);
  expect(plan.safety.candles_persisted).toBe(false);
  expect(plan.safety.raw_response_persisted).toBe(false);
  expect(plan.safety.fetch_run_persisted).toBe(false);
  expect(plan.safety.replay_executed).toBe(false);
  expect(plan.safety.scanner_behavior_changed).toBe(false);
  expect(plan.safety.live_ranking_changed).toBe(false);
  expect(plan.safety.requires_separate_operator_approval).toBe(true);
});

test("supplied executable OHLCV rows plan 73 inserts while still blocking writes", () => {
  const plan = buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan({
    candidate_rows: validRows(),
  });

  expect(plan.payload_summary.executable_payload_available).toBe(true);
  expect(plan.payload_summary.candidate_candle_rows).toBe(73);
  expect(plan.payload_summary.valid_candle_rows).toBe(73);
  expect(plan.payload_summary.invalid_candle_rows).toBe(0);
  expect(plan.payload_summary.ohlcv_valid_rows).toBe(73);
  expect(plan.payload_summary.ohlcv_missing_rows).toBe(0);
  expect(plan.payload_summary.first_timestamp).toBe(firstTimestamp);
  expect(plan.payload_summary.last_timestamp).toBe(lastTimestamp);
  expect(plan.payload_summary.five_minute_spacing_valid).toBe(true);
  expect(plan.payload_summary.window_matches_intended).toBe(true);
  expect(plan.validation.finite_ohlcv_rows).toBe(73);
  expect(plan.validation.ohlc_geometry_valid_rows).toBe(73);
  expect(plan.validation.non_negative_volume_rows).toBe(73);
  expect(plan.conflict_target).toEqual([
    "provider",
    "ticker",
    "interval",
    "timestamp",
    "adjusted",
  ]);
  expect(plan.upsert_plan.planned_inserts).toBe(73);
  expect(plan.upsert_plan.planned_updates).toBe(0);
  expect(plan.upsert_plan.planned_skips).toBe(0);
  expect(plan.upsert_plan.planned_invalid_rejections).toBe(0);
  expect(plan.safety.candle_write_allowed_now).toBe(false);
  expect(plan.safety.candles_persisted).toBe(false);
  expect(plan.safety.raw_response_persisted).toBe(false);
  expect(plan.safety.fetch_run_persisted).toBe(false);
  expect(plan.safety.replay_executed).toBe(false);
  expect(plan.safety.scanner_behavior_changed).toBe(false);
  expect(plan.safety.live_ranking_changed).toBe(false);
});

test("available readback classifies valid rows as skip or update", () => {
  const rows = validRows();
  const existingSkip = persistenceKey(rows[0] as FirstTinyExecutableCandleRow);
  const existingUpdate = persistenceKey(rows[1] as FirstTinyExecutableCandleRow);
  const plan = buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan({
    candidate_rows: rows,
    cache_readback_status: "available",
    existing_candle_keys: [existingSkip, existingUpdate],
    existing_candle_keys_requiring_update: [existingUpdate],
  });

  expect(plan.cache_readback.status).toBe("available");
  expect(plan.cache_readback.exact_insert_update_skip_split_available).toBe(true);
  expect(plan.upsert_plan.planned_inserts).toBe(71);
  expect(plan.upsert_plan.planned_updates).toBe(1);
  expect(plan.upsert_plan.planned_skips).toBe(1);
  expect(plan.upsert_plan.planned_invalid_rejections).toBe(0);
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
        "first_tiny_historical_candle_executable_persistence_dry_run_plan",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe(
      "Executable First Tiny Candle Persistence Dry-Run Plan",
    );
    expect(section?.lines).toContain("Status: planned / dry-run only");
    expect(section?.lines).toContain(
      `Source verification: ${firstTinyCorrectedPayloadRefetchResultVerificationMarker}`,
    );
    expect(section?.lines).toContain("Target table: historical_candles");
    expect(section?.lines).toContain(`Fetch run id: ${fetchRunId}`);
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain("Executable payload available: no");
    expect(section?.lines).toContain("Candidate candle rows: 73");
    expect(section?.lines).toContain("Timestamp metadata valid rows: 73");
    expect(section?.lines).toContain("Valid candle rows: 0");
    expect(section?.lines).toContain("Invalid candle rows: 73");
    expect(section?.lines).toContain("OHLCV valid rows: 0");
    expect(section?.lines).toContain("OHLCV missing rows: 73");
    expect(section?.lines).toContain(`First timestamp: ${firstTimestamp}`);
    expect(section?.lines).toContain(`Last timestamp: ${lastTimestamp}`);
    expect(section?.lines).toContain("5min spacing valid: yes");
    expect(section?.lines).toContain("Window matches intended: yes");
    expect(section?.lines).toContain("Cache readback status: unavailable");
    expect(section?.lines).toContain("Planned inserts: 0");
    expect(section?.lines).toContain("Planned updates: 0");
    expect(section?.lines).toContain("Planned skips: 0");
    expect(section?.lines).toContain("Planned rejections: 73");
    expect(section?.lines).toContain(
      "Conflict target: provider, ticker, interval, timestamp, adjusted",
    );
    expect(section?.lines).toContain("Candle write allowed now: no");
    expect(section?.lines).toContain("Candles persisted: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Fetch run persisted: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Live ranking changed: no");
    expect(section?.lines).toContain("Requires separate operator approval: yes");
    expect(section?.metrics.dry_run_only).toBe(true);
    expect(section?.metrics.target_table).toBe("historical_candles");
    expect(section?.metrics.expected_candle_rows).toBe(73);
    expect(section?.metrics.candidate_candle_rows).toBe(73);
    expect(section?.metrics.valid_candle_rows).toBe(0);
    expect(section?.metrics.invalid_candle_rows).toBe(73);
    expect(section?.metrics.planned_inserts).toBe(0);
    expect(section?.metrics.planned_invalid_rejections).toBe(73);
    expect(section?.metrics.candle_write_allowed_now).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.recommended_next_steps).toContain(
      "require_separate_candle_persistence_approval_signal",
    );
    expect(intelligence?.lines).toContain(
      "Executable first tiny candle persistence plan: dry-run / 0 valid / write no",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_executable_persistence_dry_run_plan",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
