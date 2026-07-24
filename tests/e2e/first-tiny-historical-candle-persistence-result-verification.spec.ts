import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyCandlePersistenceResultVerification,
  firstTinyCandlePersistenceResultVerificationMarker,
} from "../../lib/first-tiny-historical-candle-persistence-result-verification";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import {
  buildMarketDiagnosticsConsoleSummary,
  type MarketDiagnosticsConsoleInput,
} from "../../lib/market-diagnostics-console";

const artifactPath = join(
  process.cwd(),
  "docs/first-tiny-historical-candle-persistence-result-verification.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";

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
      next_action: { label: "Review persistence result verification" },
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
          "first_tiny_historical_candle_persistence_result_verification_test",
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

function withApprovalEnv<T>(value: string | undefined, callback: () => T) {
  const previous = process.env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED;
  if (value === undefined) {
    delete process.env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED;
  } else {
    process.env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED = value;
  }

  try {
    return callback();
  } finally {
    if (previous === undefined) {
      delete process.env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED;
    } else {
      process.env.TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED = previous;
    }
  }
}

test("static helper records verified candle persistence result", () => {
  const result = buildFirstTinyCandlePersistenceResultVerification({});

  expect(result.result_marker).toBe(
    firstTinyCandlePersistenceResultVerificationMarker,
  );
  expect(result.verification_status).toBe("candle_persistence_verified");
  expect(result.target_table).toBe("historical_candles");
  expect(result.source_verification).toBe(
    "corrected_first_tiny_ohlcv_payload_static_captured",
  );
  expect(result.provider).toBe("twelve_data");
  expect(result.ticker).toBe("AAPL");
  expect(result.interval).toBe("5min");
  expect(result.trading_day).toBe("2026-07-08");
  expect(result.fetch_run_id).toBe(fetchRunId);
  expect(result.expected_rows).toBe(73);
  expect(result.readback_rows).toBe(73);
  expect(result.matched_rows).toBe(73);
  expect(result.missing_rows).toBe(0);
  expect(result.unexpected_rows).toBe(0);
  expect(result.mismatched_rows).toBe(0);
  expect(result.duplicate_timestamps).toBe(0);
  expect(result.out_of_order_rows).toBe(0);
  expect(result.first_timestamp).toBe("2026-07-08T13:45:00.000Z");
  expect(result.last_timestamp).toBe("2026-07-08T19:45:00.000Z");
  expect(result.timestamps_5min_spaced).toBe(true);
  expect(result.candles_persisted).toBe(true);
  expect(result.readback_verified).toBe(true);
  expect(result.raw_response_persisted).toBe(false);
  expect(result.fetch_run_persisted).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(result.replay_executed).toBe(false);
  expect(result.scanner_behavior_changed).toBe(false);
  expect(result.live_ranking_changed).toBe(false);
  expect(result.provider_call_executed).toBe(false);
  expect(result.provider_call_attempted).toBe(false);
  expect(result.ready_for_replay_dry_run_planning).toBe(true);
  expect(result.replay_allowed_now).toBe(false);
  expect(result.scanner_use_allowed_now).toBe(false);
  expect(result.conclusion).toBe(
    "first_tiny_historical_candle_persistence_verified",
  );
});

test("artifact documents production result and safety boundaries", () => {
  const artifact = readFileSync(artifactPath, "utf8");

  expect(artifact).toContain(
    "first_tiny_historical_candle_persistence_verified",
  );
  expect(artifact).toContain("candle_persistence_verified");
  expect(artifact).toContain("historical_candles");
  expect(artifact).toContain("AAPL");
  expect(artifact).toContain("5min");
  expect(artifact).toContain("2026-07-08");
  expect(artifact).toContain(fetchRunId);
  expect(artifact).toContain("Expected rows: `73`");
  expect(artifact).toContain("Readback rows: `73`");
  expect(artifact).toContain("Matched rows: `73`");
  expect(artifact).toContain("First timestamp: `2026-07-08T13:45:00.000Z`");
  expect(artifact).toContain("Last timestamp: `2026-07-08T19:45:00.000Z`");
  expect(artifact).toContain("Provider call executed during readback: `false`");
  expect(artifact).toContain("Replay executed: `false`");
  expect(artifact).toContain("Scanner behavior changed: `false`");
  expect(artifact).toContain("Live ranking changed: `false`");
  expect(artifact).toContain("Require a separate explicit approval");
});

test("approval lock warning only appears when approval env is still enabled", () => {
  const noSignal = buildFirstTinyCandlePersistenceResultVerification({});
  const disabled = buildFirstTinyCandlePersistenceResultVerification({
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED: "false",
  });
  const enabled = buildFirstTinyCandlePersistenceResultVerification({
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED: " TrUe ",
  });

  expect(noSignal.candle_persistence_approval_signal_present).toBe(false);
  expect(noSignal.candle_persistence_approval_signal_still_enabled).toBe(false);
  expect(noSignal.warnings).toEqual([]);
  expect(disabled.candle_persistence_approval_signal_present).toBe(true);
  expect(disabled.candle_persistence_approval_signal_still_enabled).toBe(false);
  expect(disabled.warnings).toEqual([]);
  expect(enabled.candle_persistence_approval_signal_present).toBe(true);
  expect(enabled.candle_persistence_approval_signal_still_enabled).toBe(true);
  expect(enabled.warnings).toContain(
    "disable_candle_persistence_approval_signal_after_success",
  );
});

test("diagnostics render result without provider or Supabase writes", () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("unexpected provider call");
  }) as typeof fetch;

  try {
    const diagnostics = withApprovalEnv("true", () =>
      buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput()),
    );
    const section = diagnostics.sections.find(
      (item) =>
        item.section_id ===
        "first_tiny_historical_candle_persistence_result_verification",
    );
    const intelligenceOverview = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe(
      "First Tiny Candle Persistence Result Verification",
    );
    expect(section?.severity).toBe("warning");
    expect(section?.lines).toContain(
      "Verification status: candle_persistence_verified",
    );
    expect(section?.lines).toContain("Target table: historical_candles");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(`Fetch run id: ${fetchRunId}`);
    expect(section?.lines).toContain("Expected rows: 73");
    expect(section?.lines).toContain("Readback rows: 73");
    expect(section?.lines).toContain("Matched rows: 73");
    expect(section?.lines).toContain("Missing rows: 0");
    expect(section?.lines).toContain("Unexpected rows: 0");
    expect(section?.lines).toContain("Mismatched rows: 0");
    expect(section?.lines).toContain(
      "First timestamp: 2026-07-08T13:45:00.000Z",
    );
    expect(section?.lines).toContain(
      "Last timestamp: 2026-07-08T19:45:00.000Z",
    );
    expect(section?.lines).toContain("Candles persisted: yes");
    expect(section?.lines).toContain("Readback verified: yes");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Fetch run persisted by readback: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Live ranking changed: no");
    expect(section?.lines).toContain(
      "Ready for replay dry-run planning: yes",
    );
    expect(section?.lines).toContain("Replay allowed now: no");
    expect(section?.lines).toContain("Scanner use allowed now: no");
    expect(section?.lines).toContain(
      "Approval lock warning: disable_candle_persistence_approval_signal_after_success",
    );
    expect(section?.metrics.verification_status).toBe(
      "candle_persistence_verified",
    );
    expect(section?.metrics.readback_rows).toBe(73);
    expect(section?.metrics.matched_rows).toBe(73);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.ready_for_replay_dry_run_planning).toBe(true);
    expect(section?.metrics.replay_allowed_now).toBe(false);
    expect(section?.metrics.scanner_use_allowed_now).toBe(false);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_persistence_result_verification",
    );
    expect(intelligenceOverview?.lines).toContain(
      "First tiny candle persistence result: verified / 73 persisted / readback yes / replay no",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
