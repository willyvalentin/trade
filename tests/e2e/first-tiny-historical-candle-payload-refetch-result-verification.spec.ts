import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyCandlePayloadRefetchResultVerification,
  firstTinyCandlePayloadRefetchResultVerificationMarker,
} from "../../lib/first-tiny-historical-candle-payload-refetch-result-verification";
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
  "docs/first-tiny-historical-candle-payload-refetch-result-verification.md",
);
const evaluatedAt = "2026-07-09T18:00:00.000Z";

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
      next_action: { label: "Review payload refetch result" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 14:00 America/New_York",
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
          "first_tiny_historical_candle_payload_refetch_result_test",
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

test("artifact records result verification and no-persist safety", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "First Tiny Historical Candle Payload Refetch Result Verification",
  );
  expect(runbook).toContain(firstTinyCandlePayloadRefetchResultVerificationMarker);
  expect(runbook).toContain("verified_with_window_review_required");
  expect(runbook).toContain("payload_refetch_completed_no_persist");
  expect(runbook).toContain("raw candles: `27`");
  expect(runbook).toContain("valid candles: `27`");
  expect(runbook).toContain("first payload timestamp: `2026-07-08T17:45:00.000Z`");
  expect(runbook).toContain("last payload timestamp: `2026-07-08T19:55:00.000Z`");
  expect(runbook).toContain("window bounds match planned UTC: `false`");
  expect(runbook).toContain("candle write ready: `false`");
  expect(runbook).toContain("No OHLCV values are invented");
  expect(runbook).toContain("candles persisted: `false`");
  expect(runbook).toContain("raw response persisted: `false`");
  expect(runbook).toContain("fetch run persisted: `false`");
  expect(runbook).toContain(
    "candle_persistence_not_ready_until_window_sanity_review_passes",
  );
  expect(runbook).not.toContain("apikey");
  expect(runbook).not.toContain("TWELVE_DATA_API_KEY");
});

test("helper verifies result and blocks candle writes pending window review", () => {
  const summary = buildFirstTinyCandlePayloadRefetchResultVerification({});

  expect(summary.verification_status).toBe(
    "verified_with_window_review_required",
  );
  expect(summary.execution_status).toBe("payload_refetch_completed_no_persist");
  expect(summary.provider_call_executed).toBe(true);
  expect(summary.provider_call_succeeded).toBe(true);
  expect(summary.provider).toBe("twelve_data");
  expect(summary.ticker).toBe("AAPL");
  expect(summary.interval).toBe("5min");
  expect(summary.trading_day).toBe("2026-07-08");
  expect(summary.existing_fetch_run_id).toBe(
    "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
  );
  expect(summary.raw_candles).toBe(27);
  expect(summary.normalized_candles).toBe(27);
  expect(summary.valid_candles).toBe(27);
  expect(summary.invalid_candles).toBe(0);
  expect(summary.duplicate_timestamps).toBe(0);
  expect(summary.out_of_order_candles).toBe(0);
  expect(summary.normalized_payload_available).toBe(true);
  expect(summary.normalized_payload_response_only).toBe(true);
  expect(summary.payload_artifact.review_rows).toHaveLength(27);
  expect(summary.payload_artifact.ohlcv_values_not_invented).toBe(true);
  expect(summary.candles_persisted).toBe(false);
  expect(summary.raw_response_persisted).toBe(false);
  expect(summary.fetch_run_persisted).toBe(false);
  expect(summary.replay_executed).toBe(false);
  expect(summary.scanner_behavior_changed).toBe(false);
  expect(summary.live_ranking_changed).toBe(false);
  expect(summary.window_sanity.first_payload_timestamp).toBe(
    "2026-07-08T17:45:00.000Z",
  );
  expect(summary.window_sanity.last_payload_timestamp).toBe(
    "2026-07-08T19:55:00.000Z",
  );
  expect(summary.window_sanity.row_count_matches).toBe(true);
  expect(summary.window_sanity.timestamps_are_5min_spaced).toBe(true);
  expect(summary.window_sanity.payload_sequence_valid).toBe(true);
  expect(summary.window_sanity.window_bounds_match_planned_utc).toBe(false);
  expect(summary.window_sanity.window_review_required).toBe(true);
  expect(summary.window_sanity.candle_write_ready).toBe(false);
});

test("helper warns if payload refetch approval signal is still enabled", () => {
  const summary = buildFirstTinyCandlePayloadRefetchResultVerification({
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED: "true",
  });

  expect(summary.approval_lock_warning.approval_signal_still_enabled).toBe(true);
  expect(summary.approval_lock_warning.warning).toBe(
    "disable_payload_refetch_approval_signal_after_success",
  );
});

test("diagnostics render result verification without provider or database writes", () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  const previousApproval =
    process.env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED;
  delete process.env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED;
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
        "first_tiny_historical_candle_payload_refetch_result_verification",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe(
      "First Tiny Candle Payload Refetch Result Verification",
    );
    expect(section?.lines).toContain(
      "Verification status: verified_with_window_review_required",
    );
    expect(section?.lines).toContain(
      "Execution status: payload_refetch_completed_no_persist",
    );
    expect(section?.lines).toContain("Provider call executed: yes");
    expect(section?.lines).toContain("Provider call succeeded: yes");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(
      "Existing fetch run id: fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    );
    expect(section?.lines).toContain("Valid candles: 27");
    expect(section?.lines).toContain("Payload available: yes");
    expect(section?.lines).toContain("Payload response only: yes");
    expect(section?.lines).toContain(
      "First timestamp: 2026-07-08T17:45:00.000Z",
    );
    expect(section?.lines).toContain(
      "Last timestamp: 2026-07-08T19:55:00.000Z",
    );
    expect(section?.lines).toContain("Row count matches expected: yes");
    expect(section?.lines).toContain("5min spacing valid: yes");
    expect(section?.lines).toContain("Window bounds match planned UTC: no");
    expect(section?.lines).toContain("Window review required: yes");
    expect(section?.lines).toContain("Candle write ready: no");
    expect(section?.lines).toContain("Candles persisted: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Fetch run persisted: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.metrics.read_only_static_verification).toBe(true);
    expect(section?.metrics.valid_candles).toBe(27);
    expect(section?.metrics.window_bounds_match_planned_utc).toBe(false);
    expect(section?.metrics.window_review_required).toBe(true);
    expect(section?.metrics.candle_write_ready).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(intelligence?.lines).toContain(
      "First tiny payload refetch result: verified / 27 valid / payload yes / write blocked pending window review",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_payload_refetch_result_verification",
    );
    const resultVerificationText = JSON.stringify({
      lines: section?.lines,
      metrics: section?.metrics,
    });
    expect(resultVerificationText).not.toContain("apikey");
    expect(resultVerificationText).not.toContain("TWELVE_DATA_API_KEY");
  } finally {
    globalThis.fetch = originalFetch;
    if (previousApproval === undefined) {
      delete process.env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED;
    } else {
      process.env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED =
        previousApproval;
    }
  }
});
