import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyFetchRunAuditWriteResultVerification,
  firstTinyFetchRunAuditWriteResultVerificationMarker,
} from "../../lib/first-tiny-historical-fetch-run-audit-write-result-verification";
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
  "docs/first-tiny-historical-fetch-run-audit-write-result-verification.md",
);
const evaluatedAt = "2026-07-09T15:30:00.000Z";

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
      next_action: { label: "Review audit write result verification" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 11:30 America/New_York",
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
          "first_tiny_historical_fetch_run_audit_write_result_test",
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

test("result verification runbook records completed row and safety flags", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "First Tiny Fetch-Run Audit Write Result Verification",
  );
  expect(runbook).toContain(firstTinyFetchRunAuditWriteResultVerificationMarker);
  expect(runbook).toContain("fetch_run_audit_write_completed");
  expect(runbook).toContain("historical_candle_fetch_runs");
  expect(runbook).toContain("fc58a15a-1748-4e8d-b7d9-03e4826c1d5f");
  expect(runbook).toContain("readback verified: `true`");
  expect(runbook).toContain("candles persisted: `false`");
  expect(runbook).toContain("raw response persisted: `false`");
  expect(runbook).toContain("replay executed: `false`");
  expect(runbook).toContain("scanner behavior changed: `false`");
  expect(runbook).toContain("live ranking changed: `false`");
  expect(runbook).toContain(
    "disable_fetch_run_audit_write_approval_signal_after_success",
  );
});

test("helper returns the verified audit write result without side effects", () => {
  const summary = buildFirstTinyFetchRunAuditWriteResultVerification({});

  expect(summary.verification_status).toBe("verified");
  expect(summary.verification_marker).toBe(
    firstTinyFetchRunAuditWriteResultVerificationMarker,
  );
  expect(summary.execution_status).toBe("fetch_run_audit_write_completed");
  expect(summary.target_table).toBe("historical_candle_fetch_runs");
  expect(summary.source_verification).toBe(
    "first_tiny_historical_fetch_no_persist_verified",
  );
  expect(summary.inserted_row_id).toBe(
    "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
  );
  expect(summary.readback_verified).toBe(true);
  expect(summary.ticker).toBe("AAPL");
  expect(summary.interval).toBe("5min");
  expect(summary.trading_day).toBe("2026-07-08");
  expect(summary.request_count).toBe(1);
  expect(summary.valid_candles).toBe(27);
  expect(summary.audit_rows_inserted).toBe(1);
  expect(summary.candles_persisted).toBe(false);
  expect(summary.raw_response_persisted).toBe(false);
  expect(summary.synthetic_outcomes_persisted).toBe(false);
  expect(summary.replay_executed).toBe(false);
  expect(summary.scanner_behavior_changed).toBe(false);
  expect(summary.live_ranking_changed).toBe(false);
  expect(summary.recommended_next_steps).toEqual([
    "disable_fetch_run_audit_write_approval_signal_after_success",
    "require_separate_approval_before_candle_persistence",
    "plan_first_tiny_candle_persistence_dry_run",
  ]);
});

test("helper warns when the audit-write approval signal is still enabled", () => {
  const summary = buildFirstTinyFetchRunAuditWriteResultVerification({
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED: "true",
  });

  expect(summary.approval_lock_warning.approval_signal_still_enabled).toBe(
    true,
  );
  expect(summary.approval_lock_warning.warning).toBe(
    "disable_fetch_run_audit_write_approval_signal_after_success",
  );
});

test("diagnostics render result verification and do not call provider", () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  const previousApproval =
    process.env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED;
  delete process.env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED;
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
        "first_tiny_fetch_run_audit_write_result_verification",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe(
      "First Tiny Fetch-Run Audit Write Result Verification",
    );
    expect(section?.lines).toContain("Verification status: verified");
    expect(section?.lines).toContain(
      "Execution status: fetch_run_audit_write_completed",
    );
    expect(section?.lines).toContain(
      "Target table: historical_candle_fetch_runs",
    );
    expect(section?.lines).toContain("Inserted rows: 1");
    expect(section?.lines).toContain(
      "Inserted row id: fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    );
    expect(section?.lines).toContain("Readback verified: yes");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain("Request count: 1");
    expect(section?.lines).toContain("Valid candles: 27");
    expect(section?.lines).toContain("Fetch run persisted: yes");
    expect(section?.lines).toContain("Candles persisted: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Live ranking changed: no");
    expect(section?.metrics.read_only_static_verification).toBe(true);
    expect(section?.metrics.fetch_run_persisted).toBe(true);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(intelligence?.lines).toContain(
      "First tiny fetch-run audit result: verified / inserted 1 / readback yes / candles no",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_fetch_run_audit_write_result_verification",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    );
  } finally {
    globalThis.fetch = originalFetch;
    if (previousApproval === undefined) {
      delete process.env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED;
    } else {
      process.env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED =
        previousApproval;
    }
  }
});
