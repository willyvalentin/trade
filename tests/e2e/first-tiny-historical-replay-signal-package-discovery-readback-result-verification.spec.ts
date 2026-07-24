import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerification,
  firstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerificationMarker,
} from "../../lib/first-tiny-historical-replay-signal-package-discovery-readback-result-verification";
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
  "docs/first-tiny-historical-replay-signal-package-discovery-readback-result-verification.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";

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
      next_action: { label: "Review readback result verification" },
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
        qa_checked_source_path: "signal_package_result_verification_test",
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

test("static helper verifies compatible discovery readback result", () => {
  const result =
    buildFirstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerification();

  expect(result.verification_marker).toBe(
    firstTinyHistoricalReplaySignalPackageDiscoveryReadbackResultVerificationMarker,
  );
  expect(result.verification_status).toBe(
    "signal_package_discovery_readback_verified",
  );
  expect(result.discovery_status).toBe("compatible_signal_package_found");
  expect(result.source_verification).toBe(
    "first_tiny_replay_dry_run_input_verified_no_signal_package",
  );
  expect(result.ticker).toBe("AAPL");
  expect(result.interval).toBe("5min");
  expect(result.trading_day).toBe("2026-07-08");
  expect(result.recommendation_rows_checked).toBe(2);
  expect(result.recommendation_snapshots_checked).toBe(7);
  expect(result.candidates_found).toBe(9);
  expect(result.compatible_candidates).toBe(9);
  expect(result.best_candidate_available).toBe(true);
  expect(result.signal_package_available_now).toBe(true);
  expect(result.signal_package_created_now).toBe(false);
  expect(result.candidate_group_count).toBe(2);
  expect(result.early_group_cutoff).toBe("2026-07-08T13:49:19Z");
  expect(result.later_group_cutoff).toBe("2026-07-08T16:47:52Z");
  expect(result.candidate_groups).toHaveLength(2);
  expect(result.candidates).toHaveLength(9);
  expect(result.replay_executed).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(result.scanner_behavior_changed).toBe(false);
  expect(result.live_ranking_changed).toBe(false);
  expect(result.recommendation_rows_mutated).toBe(false);
  expect(result.supabase_write_executed).toBe(false);
  expect(result.scanner_universe_changed).toBe(false);
  expect(result.ranking_change_allowed_now).toBe(false);
  expect(result.ready_for_signal_package_selection_plan).toBe(true);
  expect(result.recommended_next_steps).toContain(
    "create_signal_package_selection_plan",
  );
});

test("artifact records all candidates grouped result and safety flags", () => {
  const artifact = readFileSync(artifactPath, "utf8");

  expect(artifact).toContain(
    "First Tiny Signal Package Discovery Readback Result Verification",
  );
  expect(artifact).toContain("signal_package_discovery_readback_verified");
  expect(artifact).toContain("compatible_signal_package_found");
  expect(artifact).toContain("Candidates found: `9`");
  expect(artifact).toContain("Compatible candidates: `9`");
  expect(artifact).toContain(
    "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557",
  );
  expect(artifact).toContain(
    "recommendation_row:f87978f3-9ffa-4105-9823-040c8497d55b",
  );
  expect(artifact).toContain("recommendation_snapshot:rec_snap_g6m5eg");
  expect(artifact).toContain("recommendation_snapshot:rec_snap_hz0rjq");
  expect(artifact).toContain("Early Generation Group");
  expect(artifact).toContain("Later Generation Group");
  expect(artifact).toContain("2026-07-08T13:49:19Z");
  expect(artifact).toContain("2026-07-08T16:47:52Z");
  expect(artifact).toContain("synthetic_outcomes_persisted");
  expect(artifact).toContain("replay_executed");
  expect(artifact).toContain("recommendation_rows_mutated");
  expect(artifact).toContain("first_tiny_signal_package_selection_plan");
});

test("diagnostics render verification without Supabase replay or write effects", () => {
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
      (entry) =>
        entry.section_id ===
        "first_tiny_signal_package_discovery_readback_result_verification",
    );
    const intelligenceOverview = diagnostics.sections.find(
      (entry) => entry.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe(
      "First Tiny Signal Package Discovery Readback Result Verification",
    );
    expect(section?.lines).toContain(
      "Verification status: signal_package_discovery_readback_verified",
    );
    expect(section?.lines).toContain(
      "Discovery status: compatible_signal_package_found",
    );
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain("Recommendation rows checked: 2");
    expect(section?.lines).toContain("Recommendation snapshots checked: 7");
    expect(section?.lines).toContain("Candidates found: 9");
    expect(section?.lines).toContain("Compatible candidates: 9");
    expect(section?.lines).toContain("Best candidate available: yes");
    expect(section?.lines).toContain("Signal package available now: yes");
    expect(section?.lines).toContain("Signal package created now: no");
    expect(section?.lines).toContain("Candidate groups: 2");
    expect(section?.lines).toContain(
      "Early group cutoff: 2026-07-08T13:49:19Z",
    );
    expect(section?.lines).toContain(
      "Later group cutoff: 2026-07-08T16:47:52Z",
    );
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Synthetic outcomes persisted: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Live ranking changed: no");
    expect(section?.lines).toContain("Recommendation rows mutated: no");
    expect(section?.lines).toContain(
      "Ready for signal package selection plan: yes",
    );
    expect(section?.metrics.verification_status).toBe(
      "signal_package_discovery_readback_verified",
    );
    expect(section?.metrics.candidates_found).toBe(9);
    expect(section?.metrics.compatible_candidates).toBe(9);
    expect(section?.metrics.recommendation_rows_checked).toBe(2);
    expect(section?.metrics.recommendation_snapshots_checked).toBe(7);
    expect(section?.metrics.signal_package_available_now).toBe(true);
    expect(section?.metrics.signal_package_created_now).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.synthetic_outcomes_persisted).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.recommendation_rows_mutated).toBe(false);
    expect(section?.metrics.supabase_write_executed).toBe(false);
    expect(section?.metrics.ready_for_signal_package_selection_plan).toBe(true);
    expect(String(section?.metrics.candidate_ids)).toContain(
      "recommendation_snapshot:rec_snap_hz0rjq",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_signal_package_discovery_readback_result_verification",
    );
    expect(intelligenceOverview?.lines).toContain(
      "First tiny signal package discovery result: verified / 9 compatible / selection next / replay no",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
