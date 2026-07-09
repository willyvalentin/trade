import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalReplaySignalPackageDiscoveryPlan,
  firstTinyHistoricalReplaySignalPackageDiscoveryPlanMarker,
  firstTinyHistoricalReplaySignalPackageDiscoverySourceVerification,
} from "../../lib/first-tiny-historical-replay-signal-package-discovery-plan";
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
  "docs/first-tiny-historical-replay-signal-package-discovery-plan.md",
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
      next_action: { label: "Review signal package discovery plan" },
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
        qa_checked_source_path: "signal_package_discovery_plan_test",
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

test("static helper defines a read-only signal package discovery plan", () => {
  const plan = buildFirstTinyHistoricalReplaySignalPackageDiscoveryPlan();

  expect(plan.plan_marker).toBe(
    firstTinyHistoricalReplaySignalPackageDiscoveryPlanMarker,
  );
  expect(plan.discovery_plan_status).toBe("planned");
  expect(plan.dry_run_only).toBe(true);
  expect(plan.source_verification).toBe(
    firstTinyHistoricalReplaySignalPackageDiscoverySourceVerification,
  );
  expect(plan.target_replay_scope.ticker).toBe("AAPL");
  expect(plan.target_replay_scope.interval).toBe("5min");
  expect(plan.target_replay_scope.trading_day).toBe("2026-07-08");
  expect(plan.target_replay_scope.candle_source_table).toBe(
    "historical_candles",
  );
  expect(plan.target_replay_scope.candle_rows_verified).toBe(73);
  expect(plan.signal_package_available_now).toBe(false);
  expect(plan.signal_package_created_now).toBe(false);
  expect(plan.replay_executed).toBe(false);
  expect(plan.synthetic_outcomes_persisted).toBe(false);
  expect(plan.scanner_behavior_changed).toBe(false);
  expect(plan.live_ranking_changed).toBe(false);
  expect(plan.provider_call_executed).toBe(false);
  expect(plan.supabase_read_executed).toBe(false);
  expect(plan.supabase_write_executed).toBe(false);
  expect(plan.recommendation_rows_mutated).toBe(false);
  expect(plan.scanner_universe_changed).toBe(false);
  expect(plan.ranking_change_allowed_now).toBe(false);
  expect(plan.scanner_use_allowed_now).toBe(false);
  expect(plan.synthetic_outcome_persistence_allowed_now).toBe(false);
  expect(plan.requires_separate_operator_approval).toBe(true);
  expect(plan.compatible_package_requirements).toContain("signal_package_id");
  expect(plan.compatible_package_requirements).toContain(
    "entry_price_or_rule",
  );
  expect(plan.compatible_package_requirements).toContain(
    "target_price_or_rule",
  );
  expect(plan.compatible_package_requirements).toContain(
    "lookahead_safety_metadata",
  );
  expect(plan.candidate_discovery_sources).toContain(
    "existing_recommendation_rows_for_aapl_2026_07_08",
  );
  expect(plan.candidate_discovery_sources).toContain(
    "recommendation_snapshots_for_aapl_2026_07_08",
  );
  expect(plan.blocking_reasons).toContain("replay_signal_package_missing");
  expect(plan.recommended_next_steps).toContain(
    "add_signal_package_discovery_readback",
  );
});

test("artifact documents the package gap requirements and next path", () => {
  const artifact = readFileSync(artifactPath, "utf8");

  expect(artifact).toContain(
    "First Tiny Historical Replay Signal Package Discovery Plan",
  );
  expect(artifact).toContain(
    "replay_dry_run_completed_no_signal_package",
  );
  expect(artifact).toContain(
    "first_tiny_replay_dry_run_input_verified_no_signal_package",
  );
  expect(artifact).toContain("historical_candles");
  expect(artifact).toContain("AAPL");
  expect(artifact).toContain("2026-07-08");
  expect(artifact).toContain("Candle rows verified: `73`");
  expect(artifact).toContain("signal_package_id");
  expect(artifact).toContain("existing_recommendation_snapshot");
  expect(artifact).toContain("static_replay_fixture");
  expect(artifact).toContain("manually_reviewed_signal_package");
  expect(artifact).toContain("replay_signal_package_missing");
  expect(artifact).toContain("cannot_compute_counterfactual_without_entry_stop_target");
  expect(artifact).toContain("Synthetic outcomes persisted: `false`");
  expect(artifact).toContain("Scanner behavior changed: `false`");
  expect(artifact).toContain("Add signal package discovery readback");
  expect(artifact).toContain("static/manual signal package plan");
});

test("diagnostics render discovery plan without provider Supabase or replay effects", () => {
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
        "first_tiny_historical_replay_signal_package_discovery_plan",
    );
    const intelligenceOverview = diagnostics.sections.find(
      (entry) => entry.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe(
      "First Tiny Replay Signal Package Discovery Plan",
    );
    expect(section?.severity).toBe("warning");
    expect(section?.lines).toContain("Status: planned / dry-run only");
    expect(section?.lines).toContain(
      "Source verification: first_tiny_replay_dry_run_input_verified_no_signal_package",
    );
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain("Candle rows verified: 73");
    expect(section?.lines).toContain("Signal package available now: no");
    expect(section?.lines).toContain("Signal package created now: no");
    expect(section?.lines).toContain("Compatible package requirements: 17");
    expect(section?.lines).toContain("Candidate discovery sources: 4");
    expect(section?.lines).toContain("Replay executable now: no");
    expect(section?.lines).toContain(
      "Synthetic outcome persistence allowed: no",
    );
    expect(section?.lines).toContain("Scanner use allowed: no");
    expect(section?.lines).toContain("Ranking change allowed: no");
    expect(section?.lines).toContain("Separate approval required: yes");
    expect(section?.metrics.plan_marker).toBe(
      firstTinyHistoricalReplaySignalPackageDiscoveryPlanMarker,
    );
    expect(section?.metrics.discovery_plan_status).toBe("planned");
    expect(section?.metrics.dry_run_only).toBe(true);
    expect(section?.metrics.candle_rows_verified).toBe(73);
    expect(section?.metrics.signal_package_available_now).toBe(false);
    expect(section?.metrics.signal_package_created_now).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.synthetic_outcomes_persisted).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.supabase_read_executed).toBe(false);
    expect(section?.metrics.supabase_write_executed).toBe(false);
    expect(section?.metrics.recommendation_rows_mutated).toBe(false);
    expect(section?.metrics.ranking_change_allowed_now).toBe(false);
    expect(section?.metrics.scanner_use_allowed_now).toBe(false);
    expect(section?.metrics.compatible_package_requirement_count).toBe(17);
    expect(section?.metrics.candidate_discovery_source_count).toBe(4);
    expect(String(section?.metrics.blocking_reasons)).toContain(
      "replay_signal_package_missing",
    );
    expect(String(section?.metrics.recommended_next_steps)).toContain(
      "add_signal_package_discovery_readback",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_replay_signal_package_discovery_plan",
    );
    expect(intelligenceOverview?.lines).toContain(
      "First tiny signal package discovery: planned / package missing / replay result no / persistence no",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
