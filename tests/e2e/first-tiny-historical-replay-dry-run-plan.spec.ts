import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildFirstTinyCandlePersistenceResultVerification } from "../../lib/first-tiny-historical-candle-persistence-result-verification";
import {
  buildFirstTinyHistoricalReplayDryRunPlan,
  firstTinyHistoricalReplayDryRunPlanMarker,
  firstTinyHistoricalReplayDryRunSourceVerification,
} from "../../lib/first-tiny-historical-replay-dry-run-plan";
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
  "docs/first-tiny-historical-replay-dry-run-plan.md",
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
      next_action: { label: "Review replay dry-run plan" },
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
        qa_checked_source_path: "first_tiny_historical_replay_plan_test",
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

test("static replay dry-run plan uses verified persisted candle scope", () => {
  const plan = buildFirstTinyHistoricalReplayDryRunPlan({
    candle_persistence_result:
      buildFirstTinyCandlePersistenceResultVerification({}),
  });

  expect(plan.plan_marker).toBe(firstTinyHistoricalReplayDryRunPlanMarker);
  expect(plan.replay_plan_status).toBe("planned");
  expect(plan.dry_run_only).toBe(true);
  expect(plan.source_verification).toBe(
    firstTinyHistoricalReplayDryRunSourceVerification,
  );
  expect(plan.source_verification).toBe(
    "first_tiny_historical_candle_persistence_verified",
  );
  expect(plan.source_table).toBe("historical_candles");
  expect(plan.provider).toBe("twelve_data");
  expect(plan.ticker).toBe("AAPL");
  expect(plan.interval).toBe("5min");
  expect(plan.trading_day).toBe("2026-07-08");
  expect(plan.fetch_run_id).toBe(fetchRunId);
  expect(plan.candle_rows_available).toBe(73);
  expect(plan.candle_rows_verified).toBe(73);
  expect(plan.replay_allowed_now).toBe(false);
  expect(plan.synthetic_outcome_persistence_allowed_now).toBe(false);
  expect(plan.scanner_use_allowed_now).toBe(false);
  expect(plan.ranking_change_allowed_now).toBe(false);
  expect(plan.requires_separate_operator_approval).toBe(true);
  expect(plan.lookahead_safety_required).toBe(true);
  expect(plan.candidate_replay_scope.tickers).toEqual(["AAPL"]);
  expect(plan.candidate_replay_scope.trading_days).toEqual(["2026-07-08"]);
  expect(plan.candidate_replay_scope.intervals).toEqual(["5min"]);
  expect(plan.candidate_replay_scope.verified_window_ny).toBe(
    "09:45-15:45 America/New_York",
  );
  expect(plan.candidate_replay_scope.verified_window_utc).toBe(
    "2026-07-08T13:45:00.000Z-2026-07-08T19:45:00.000Z",
  );
  expect(plan.candidate_replay_scope.sample_origin).toBe(
    "historical_persisted_first_tiny",
  );
  expect(plan.candidate_replay_scope.allowed_future_use).toBe(
    "dry_run_counterfactual_only",
  );
  expect(plan.candidate_replay_scope.disallowed_current_use).toEqual([
    "scanner",
    "ranking",
    "live_recommendations",
  ]);
});

test("lookahead gates and future approval contract remain inactive", () => {
  const plan = buildFirstTinyHistoricalReplayDryRunPlan();

  expect(plan.lookahead_safety_gates).toEqual([
    "analysis_cutoff_required_per_candidate",
    "no_future_candles_visible_before_cutoff",
    "entry_exit_simulation_uses_only_candles_after_generated_signal_time",
    "no_synthetic_outcomes_persisted_without_separate_approval",
    "no_scanner_or_ranking_changes_without_separate_approval",
  ]);
  expect(plan.future_approval_contract.active_now).toBe(false);
  expect(plan.future_approval_contract.env_names).toEqual([
    "TURE_FIRST_TINY_REPLAY_APPROVED",
    "TURE_FIRST_TINY_REPLAY_OPERATOR_LABEL",
    "TURE_FIRST_TINY_REPLAY_REFERENCE",
    "TURE_FIRST_TINY_REPLAY_TICKER",
    "TURE_FIRST_TINY_REPLAY_TRADING_DAY",
    "TURE_FIRST_TINY_REPLAY_MAX_TICKERS",
    "TURE_FIRST_TINY_REPLAY_MAX_DAYS",
    "TURE_FIRST_TINY_REPLAY_SYNTHETIC_OUTCOME_PERSIST_ALLOWED",
    "TURE_FIRST_TINY_REPLAY_SCANNER_EFFECT_ALLOWED",
    "TURE_FIRST_TINY_REPLAY_RANKING_EFFECT_ALLOWED",
  ]);
  expect(plan.safety.provider_call_executed).toBe(false);
  expect(plan.safety.provider_call_attempted).toBe(false);
  expect(plan.safety.historical_fetch_added).toBe(false);
  expect(plan.safety.candles_persisted).toBe(false);
  expect(plan.safety.raw_response_persisted).toBe(false);
  expect(plan.safety.fetch_run_persisted).toBe(false);
  expect(plan.safety.synthetic_outcomes_persisted).toBe(false);
  expect(plan.safety.replay_executed).toBe(false);
  expect(plan.safety.scanner_behavior_changed).toBe(false);
  expect(plan.safety.live_ranking_changed).toBe(false);
  expect(plan.recommended_next_steps).toEqual([
    "review_replay_dry_run_plan",
    "add_replay_approval_gate",
    "keep_synthetic_outcomes_scanner_and_ranking_disabled",
  ]);
});

test("durable artifact documents replay dry-run boundaries", () => {
  const artifact = readFileSync(artifactPath, "utf8");

  expect(artifact).toContain("First Tiny Historical Replay Dry-Run Plan");
  expect(artifact).toContain(
    "first_tiny_historical_candle_persistence_verified",
  );
  expect(artifact).toContain("historical_candles");
  expect(artifact).toContain("AAPL");
  expect(artifact).toContain("5min");
  expect(artifact).toContain("2026-07-08");
  expect(artifact).toContain(fetchRunId);
  expect(artifact).toContain("Candle rows available: `73`");
  expect(artifact).toContain("Candle rows verified: `73`");
  expect(artifact).toContain("Analysis cutoff per candidate");
  expect(artifact).toContain("No future candles visible before the cutoff");
  expect(artifact).toContain("Replay allowed now: `false`");
  expect(artifact).toContain("Scanner use allowed now: `false`");
  expect(artifact).toContain("Ranking change allowed now: `false`");
  expect(artifact).toContain("TURE_FIRST_TINY_REPLAY_APPROVED");
  expect(artifact).toContain("keep_synthetic_outcomes_scanner_and_ranking_disabled");
});

test("diagnostics render dry-run plan without provider writes or replay", () => {
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
      (item) => item.section_id === "first_tiny_historical_replay_dry_run_plan",
    );
    const intelligenceOverview = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe(
      "First Tiny Persisted Candle Replay Dry-Run Plan",
    );
    expect(section?.severity).toBe("info");
    expect(section?.lines).toContain("Status: planned / dry-run only");
    expect(section?.lines).toContain(
      "Source verification: first_tiny_historical_candle_persistence_verified",
    );
    expect(section?.lines).toContain("Source table: historical_candles");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(`Fetch run id: ${fetchRunId}`);
    expect(section?.lines).toContain("Candle rows available: 73");
    expect(section?.lines).toContain("Candle rows verified: 73");
    expect(section?.lines).toContain("Replay allowed now: no");
    expect(section?.lines).toContain(
      "Synthetic outcome persistence allowed now: no",
    );
    expect(section?.lines).toContain("Scanner use allowed now: no");
    expect(section?.lines).toContain("Ranking change allowed now: no");
    expect(section?.lines).toContain("Lookahead safety required: yes");
    expect(section?.lines).toContain(
      "Separate operator approval required: yes",
    );
    expect(section?.lines).toContain(
      "Recommended next steps: review_replay_dry_run_plan, add_replay_approval_gate, keep_synthetic_outcomes_scanner_and_ranking_disabled",
    );
    expect(section?.metrics.dry_run_only).toBe(true);
    expect(section?.metrics.candle_rows_available).toBe(73);
    expect(section?.metrics.candle_rows_verified).toBe(73);
    expect(section?.metrics.replay_allowed_now).toBe(false);
    expect(
      section?.metrics.synthetic_outcome_persistence_allowed_now,
    ).toBe(false);
    expect(section?.metrics.scanner_use_allowed_now).toBe(false);
    expect(section?.metrics.ranking_change_allowed_now).toBe(false);
    expect(section?.metrics.lookahead_safety_required).toBe(true);
    expect(section?.metrics.requires_separate_operator_approval).toBe(true);
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.historical_fetch_added).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.synthetic_outcomes_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_replay_dry_run_plan",
    );
    expect(intelligenceOverview?.lines).toContain(
      "First tiny replay plan: dry-run / 73 persisted candles / replay no / scanner no",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
