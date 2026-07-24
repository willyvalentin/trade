import { expect, test } from "@playwright/test";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyCorrectedOhlcvPayloadStaticCapture,
  firstTinyCorrectedOhlcvPayloadStaticCaptureMarker,
} from "../../lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import { firstTinyCorrectedPayloadRefetchResultVerificationMarker } from "../../lib/first-tiny-historical-candle-corrected-payload-refetch-result-verification";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import {
  buildMarketDiagnosticsConsoleSummary,
  type MarketDiagnosticsConsoleInput,
} from "../../lib/market-diagnostics-console";

const payloadPath = join(
  process.cwd(),
  "docs/first-tiny-historical-candle-corrected-filtered-ohlcv-payload.json",
);
const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture.md",
);
const evaluatedAt = "2026-07-09T19:00:00.000Z";
const firstTimestamp = "2026-07-08T13:45:00.000Z";
const lastTimestamp = "2026-07-08T19:45:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";

type StaticPayloadRow = {
  provider: string;
  ticker: string;
  interval: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  adjusted: boolean;
  trading_day: string;
  session: string;
  timezone: string;
  fetch_run_id: string;
};

function readPayload(): StaticPayloadRow[] {
  return JSON.parse(readFileSync(payloadPath, "utf8")) as StaticPayloadRow[];
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
      next_action: { label: "Review corrected OHLCV static capture" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 15:00 America/New_York",
      calendar_confidence: "high",
      provider_calendar_available: true,
      fallback_calendar_scan_allowed: false,
      active_window: "power_hour",
      decision: "scan_allowed",
      should_scan_now: true,
      next_window: "closed",
      next_window_label: "Closed",
      next_window_starts_at: null,
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
          "first_tiny_corrected_ohlcv_payload_static_capture_test",
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

test("static JSON artifact exists and contains exactly the supplied window", () => {
  expect(existsSync(payloadPath)).toBe(true);
  const rows = readPayload();
  const rawText = readFileSync(payloadPath, "utf8");

  expect(rows).toHaveLength(73);
  expect(rows[0]?.timestamp).toBe(firstTimestamp);
  expect(rows.at(-1)?.timestamp).toBe(lastTimestamp);
  expect(rawText).not.toContain("apikey");
  expect(rawText).not.toContain("TWELVE_DATA_API_KEY");
  expect(rawText).not.toContain("AUTOMATION_SECRET");
  expect(rawText).not.toContain("approval");

  rows.forEach((row, index) => {
    const expectedTimestamp = new Date(
      new Date(firstTimestamp).getTime() + index * 5 * 60 * 1000,
    ).toISOString();
    expect(row.timestamp).toBe(expectedTimestamp);
    expect(row.provider).toBe("twelve_data");
    expect(row.ticker).toBe("AAPL");
    expect(row.interval).toBe("5min");
    expect(row.adjusted).toBe(false);
    expect(row.trading_day).toBe("2026-07-08");
    expect(row.session).toBe("regular");
    expect(row.timezone).toBe("America/New_York");
    expect(row.fetch_run_id).toBe(fetchRunId);
    expect(Number.isFinite(row.open)).toBe(true);
    expect(Number.isFinite(row.high)).toBe(true);
    expect(Number.isFinite(row.low)).toBe(true);
    expect(Number.isFinite(row.close)).toBe(true);
    expect(Number.isFinite(row.volume)).toBe(true);
    expect(row.volume).toBeGreaterThanOrEqual(0);
    expect(row.high).toBeGreaterThanOrEqual(row.low);
    expect(row.high).toBeGreaterThanOrEqual(row.open);
    expect(row.high).toBeGreaterThanOrEqual(row.close);
    expect(row.low).toBeLessThanOrEqual(row.open);
    expect(row.low).toBeLessThanOrEqual(row.close);
  });
});

test("helper validates static OHLCV payload read-only", () => {
  const capture = buildFirstTinyCorrectedOhlcvPayloadStaticCapture();

  expect(capture.capture_status).toBe("captured_static_review_payload");
  expect(capture.capture_marker).toBe(
    firstTinyCorrectedOhlcvPayloadStaticCaptureMarker,
  );
  expect(capture.source).toBe("operator_observed_action_289_response");
  expect(capture.source_verification).toBe(
    firstTinyCorrectedPayloadRefetchResultVerificationMarker,
  );
  expect(capture.provider).toBe("twelve_data");
  expect(capture.ticker).toBe("AAPL");
  expect(capture.interval).toBe("5min");
  expect(capture.trading_day).toBe("2026-07-08");
  expect(capture.fetch_run_id).toBe(fetchRunId);
  expect(capture.row_count).toBe(73);
  expect(capture.expected_row_count).toBe(73);
  expect(capture.first_timestamp).toBe(firstTimestamp);
  expect(capture.last_timestamp).toBe(lastTimestamp);
  expect(capture.row_count_matches).toBe(true);
  expect(capture.timestamps_are_5min_spaced).toBe(true);
  expect(capture.duplicate_timestamps).toBe(0);
  expect(capture.out_of_order_candles).toBe(0);
  expect(capture.ohlcv_values_present).toBe(true);
  expect(capture.ohlcv_values_valid).toBe(true);
  expect(capture.high_low_geometry_valid).toBe(true);
  expect(capture.volume_values_valid).toBe(true);
  expect(capture.adjusted_false_for_all_rows).toBe(true);
  expect(capture.fetch_run_id_valid_for_all_rows).toBe(true);
  expect(capture.invalid_row_count).toBe(0);
  expect(capture.candle_write_ready).toBe(false);
  expect(capture.ready_for_executable_persistence_dry_run).toBe(true);
  expect(capture.candles_persisted).toBe(false);
  expect(capture.raw_response_persisted).toBe(false);
  expect(capture.fetch_run_persisted).toBe(false);
  expect(capture.replay_executed).toBe(false);
  expect(capture.scanner_behavior_changed).toBe(false);
  expect(capture.live_ranking_changed).toBe(false);
});

test("runbook documents source, safety, and next step", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("Corrected First Tiny OHLCV Payload Static Capture");
  expect(runbook).toContain(firstTinyCorrectedOhlcvPayloadStaticCaptureMarker);
  expect(runbook).toContain("operator_observed_action_289_response");
  expect(runbook).toContain(
    "docs/first-tiny-historical-candle-corrected-filtered-ohlcv-payload.json",
  );
  expect(runbook).toContain("row count: `73`");
  expect(runbook).toContain("OHLCV values valid: `true`");
  expect(runbook).toContain("candle write ready: `false`");
  expect(runbook).toContain(
    "rebuild_executable_candle_persistence_dry_run_from_static_ohlcv_payload",
  );
  expect(runbook).not.toContain("apikey");
  expect(runbook).not.toContain("TWELVE_DATA_API_KEY");
});

test("diagnostics render static capture without provider or write side effects", () => {
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
        "corrected_first_tiny_historical_candle_ohlcv_payload_static_capture",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe(
      "Corrected First Tiny OHLCV Payload Static Capture",
    );
    expect(section?.lines).toContain(
      "Capture status: captured_static_review_payload",
    );
    expect(section?.lines).toContain(
      "Source: operator_observed_action_289_response",
    );
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(`Fetch run id: ${fetchRunId}`);
    expect(section?.lines).toContain("Row count: 73");
    expect(section?.lines).toContain(`First timestamp: ${firstTimestamp}`);
    expect(section?.lines).toContain(`Last timestamp: ${lastTimestamp}`);
    expect(section?.lines).toContain("Row count matches: yes");
    expect(section?.lines).toContain("5min spacing valid: yes");
    expect(section?.lines).toContain("OHLCV values present: yes");
    expect(section?.lines).toContain("OHLCV values valid: yes");
    expect(section?.lines).toContain("Candle write ready: no");
    expect(section?.lines).toContain(
      "Ready for executable persistence dry-run: yes",
    );
    expect(section?.lines).toContain("Candles persisted: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Fetch run persisted: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Live ranking changed: no");
    expect(section?.metrics.row_count).toBe(73);
    expect(section?.metrics.ohlcv_values_valid).toBe(true);
    expect(section?.metrics.candle_write_ready).toBe(false);
    expect(section?.metrics.ready_for_executable_persistence_dry_run).toBe(
      true,
    );
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(intelligence?.lines).toContain(
      "Corrected first tiny OHLCV payload: static captured / 73 valid / persistence dry-run next",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "corrected_first_tiny_historical_candle_ohlcv_payload_static_capture",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
