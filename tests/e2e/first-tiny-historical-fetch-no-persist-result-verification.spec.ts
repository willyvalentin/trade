import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalFetchNoPersistResultVerification,
  firstTinyHistoricalFetchNoPersistVerificationMarker,
} from "../../lib/first-tiny-historical-fetch-no-persist-result-verification";
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
  "docs/first-tiny-historical-fetch-no-persist-result-verification.md",
);
const evaluatedAt = "2026-07-09T15:00:00.000Z";

function readArtifact() {
  return readFileSync(artifactPath, "utf8");
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
      next_action: { label: "Review first tiny result verification" },
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
        qa_checked_source_path:
          "first_tiny_historical_fetch_no_persist_result_verification_test",
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

test("verification artifact exists and records the production no-persist result", () => {
  const artifact = readArtifact();

  expect(artifact).toContain(
    "First Tiny Historical Fetch No-Persist Result Verification",
  );
  expect(artifact).toContain(
    "Conclusion: `first_tiny_historical_fetch_no_persist_verified`",
  );
  expect(artifact).toContain(
    "Route used: `POST /api/historical-backfill/first-tiny-fetch`",
  );
  expect(artifact).toContain("Latest manual result: `provider_call_completed_no_persist`");
  expect(artifact).toContain("Provider call happened exactly once");
  expect(artifact).toContain("Ticker: `AAPL`");
  expect(artifact).toContain("Interval: `5min`");
  expect(artifact).toContain("Trading day: `2026-07-08`");
  expect(artifact).toContain("Raw candles: `27`");
  expect(artifact).toContain("Normalized candles: `27`");
  expect(artifact).toContain("Valid candles: `27`");
  expect(artifact).toContain("Invalid candles: `0`");
  expect(artifact).toContain("Planned inserts: `27`");
  expect(artifact).toContain("Raw response persisted: no");
  expect(artifact).toContain("Candles persisted: no");
  expect(artifact).toContain("Fetch run persisted: no");
  expect(artifact).toContain("Replay executed: no");
  expect(artifact).toContain("Scanner behavior changed: no");
  expect(artifact).toContain("Live ranking changed: no");
});

test("static helper reports verified no-persist result without effect flags", () => {
  const verification = buildFirstTinyHistoricalFetchNoPersistResultVerification();

  expect(verification.verification_status).toBe("verified");
  expect(verification.verification_marker).toBe(
    firstTinyHistoricalFetchNoPersistVerificationMarker,
  );
  expect(verification.provider_result.execution_status).toBe(
    "provider_call_completed_no_persist",
  );
  expect(verification.provider_result.provider_call_executed).toBe(true);
  expect(verification.provider_result.call_succeeded).toBe(true);
  expect(verification.request_scope.ticker).toBe("AAPL");
  expect(verification.request_scope.interval).toBe("5min");
  expect(verification.request_scope.trading_day).toBe("2026-07-08");
  expect(verification.request_scope.request_count).toBe(1);
  expect(verification.request_scope.estimated_credits).toBe(1);
  expect(verification.cache_result.cache_lookup_attempted).toBe(true);
  expect(verification.cache_result.cache_hit).toBe(false);
  expect(verification.parser_result.valid_candles).toBe(27);
  expect(verification.persistence_plan.planned_inserts).toBe(27);
  expect(verification.provider_result.raw_response_persisted).toBe(false);
  expect(verification.persistence_plan.candles_persisted).toBe(false);
  expect(verification.persistence_plan.fetch_run_persisted).toBe(false);
  expect(verification.safety.synthetic_outcomes_persisted).toBe(false);
  expect(verification.safety.replay_executed).toBe(false);
  expect(verification.safety.scanner_behavior_changed).toBe(false);
  expect(verification.safety.live_ranking_changed).toBe(false);
  expect(verification.recommended_next_steps).toContain(
    "disable_first_tiny_fetch_approval_signal_after_successful_no_persist_test",
  );
});

test("market diagnostics surfaces no-persist verification summary", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) =>
      item.section_id ===
      "first_tiny_historical_fetch_no_persist_result_verification",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Verification status: verified");
  expect(section?.lines).toContain(
    "Latest manual result: provider_call_completed_no_persist",
  );
  expect(section?.lines).toContain("Provider call executed: yes");
  expect(section?.lines).toContain("Provider call succeeded: yes");
  expect(section?.lines).toContain("Ticker: AAPL");
  expect(section?.lines).toContain("Interval: 5min");
  expect(section?.lines).toContain("Trading day: 2026-07-08");
  expect(section?.lines).toContain("Request count: 1");
  expect(section?.lines).toContain("Estimated credits: 1");
  expect(section?.lines).toContain("Cache lookup attempted: yes");
  expect(section?.lines).toContain("Cache hit: no");
  expect(section?.lines).toContain("Raw/normalized/valid/invalid candles: 27/27/27/0");
  expect(section?.lines).toContain(
    "Planned inserts/updates/skips/rejections: 27/0/0/0",
  );
  expect(section?.lines).toContain("Raw response persisted: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Fetch run persisted: no");
  expect(section?.lines).toContain("Replay executed: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(section?.lines).toContain("Live ranking changed: no");
  expect(section?.lines).toContain(
    "Approval lock warning: disable_first_tiny_fetch_approval_signal_after_successful_no_persist_test",
  );
  expect(section?.metrics.latest_manual_result).toBe(
    "provider_call_completed_no_persist",
  );
  expect(section?.metrics.request_count).toBe(1);
  expect(section?.metrics.valid_candles).toBe(27);
  expect(section?.metrics.candles_persisted).toBe(false);
  expect(section?.metrics.fetch_run_persisted).toBe(false);
  expect(section?.metrics.replay_executed).toBe(false);
  expect(section?.metrics.scanner_behavior_changed).toBe(false);
  expect(section?.metrics.live_ranking_changed).toBe(false);
  expect(
    String(section?.metrics.recommended_next_steps),
  ).toContain(
    "disable_first_tiny_fetch_approval_signal_after_successful_no_persist_test",
  );
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith(
        "First tiny no-persist verification: verified / AAPL 5min / candles 27 / persist no",
      ),
    ),
  ).toBe(true);
});

test("diagnostics rendering does not call provider or database write paths", () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("unexpected network call during static verification");
  }) as typeof fetch;

  try {
    const diagnostics =
      buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
    const section = diagnostics.sections.find(
      (item) =>
        item.section_id ===
        "first_tiny_historical_fetch_no_persist_result_verification",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.metrics.read_only_static_verification).toBe(true);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.synthetic_outcomes_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
