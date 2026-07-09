import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildHistoricalBackfillDryRunPipeline,
  type HistoricalBackfillDryRunPipelineInput,
} from "../../lib/historical-backfill-dry-run-pipeline";
import { buildHistoricalBackfillExecutionReadiness } from "../../lib/historical-backfill-execution-readiness";
import { buildHistoricalCandleStorageReadiness } from "../../lib/historical-candle-storage-readiness";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import { buildProviderBudgetGuardSummary } from "../../lib/provider-budget-guard";
import { buildProviderPlanProfile } from "../../lib/provider-plan-profile";
import type { ScannerUniverseCoverageSummary } from "../../lib/scanner-universe";

const evaluatedAt = "2026-07-09T15:00:00.000Z";

function storageReadinessApplied() {
  return buildHistoricalCandleStorageReadiness({
    migration_draft_reviewed: true,
    migration_detection: {
      historical_candles_table_detected: true,
      historical_candle_fetch_runs_table_detected: true,
      expected_unique_key_detected: true,
      expected_indexes_detected: true,
      rls_enabled_detected: true,
      client_write_policies_detected: false,
      client_read_policies_detected: false,
      detection_source: "mock_schema_readback",
      checked_at: evaluatedAt,
    },
  });
}

function pipelineInput(
  overrides: Partial<HistoricalBackfillDryRunPipelineInput> = {},
): HistoricalBackfillDryRunPipelineInput {
  return {
    fetch_plan_input: {
      visible_recent_tickers: ["AAPL", "AMD", "PLTR"],
      static_universe_tickers: ["AAPL", "AMD", "PLTR"],
      history_days_requested: 2,
      max_selected_tickers: 3,
      migration_applied: true,
    },
    storage_readiness: storageReadinessApplied(),
    now: evaluatedAt,
    ...overrides,
  };
}

function readyPipeline() {
  return buildHistoricalBackfillDryRunPipeline(pipelineInput());
}

function providerBudgetGuard() {
  return buildProviderBudgetGuardSummary({
    plan_mode: "grow",
    scanner_universe: {
      selected_tickers: 3,
      scan_budget: {
        requested_tickers: 3,
        effective_tickers: 3,
      },
    } as ScannerUniverseCoverageSummary,
    custom_limits: {
      daily_soft_limit: 2500,
      window_soft_limit: 450,
    },
    provider_env: { twelve_data_configured: true },
    now: evaluatedAt,
  });
}

function baseDiagnosticsInput(
  overrides: Partial<MarketDiagnosticsConsoleInput> = {},
): MarketDiagnosticsConsoleInput {
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
      outcome_readiness: {
        route_available: true,
        evaluated_recommendations: 0,
      },
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
      next_action: { label: "Review historical execution readiness" },
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
    provider_budget_guard: providerBudgetGuard(),
    provider_plan_profile: buildProviderPlanProfile({
      TWELVE_DATA_PLAN_MODE: "grow",
    }),
    scanner_universe: {
      warnings: [],
      selected_tickers: 3,
      selected_ticker_symbols: ["AAPL", "AMD", "PLTR"],
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
        qa_checked_source_path: "historical_backfill_execution_readiness_test",
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
    historical_candle_storage_detection: {
      historical_candles_table_detected: true,
      historical_candle_fetch_runs_table_detected: true,
      expected_unique_key_detected: true,
      expected_indexes_detected: true,
      rls_enabled_detected: true,
      client_write_policies_detected: false,
      client_read_policies_detected: false,
      detection_source: "mock_schema_readback",
      checked_at: evaluatedAt,
    },
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
    ...overrides,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("empty input does not throw and remains advisory only", () => {
  const readiness = buildHistoricalBackfillExecutionReadiness();

  expect(readiness.advisory_only).toBe(true);
  expect(readiness.readiness_status).toBe("blocked");
  expect(readiness.safety.provider_fetch_added).toBe(false);
  expect(readiness.safety.historical_fetch_added).toBe(false);
  expect(readiness.safety.candles_persisted).toBe(false);
  expect(readiness.safety.fetch_run_persisted).toBe(false);
  expect(readiness.safety.synthetic_outcomes_persisted).toBe(false);
  expect(readiness.safety.replay_executed).toBe(false);
  expect(readiness.safety.scanner_behavior_changed).toBe(false);
});

test("migration unknown blocks readiness", () => {
  const readiness = buildHistoricalBackfillExecutionReadiness({
    dry_run_pipeline: readyPipeline(),
    provider_env_present: true,
  });

  expect(readiness.readiness_status).toBe("blocked");
  expect(readiness.blockers).toContain(
    "apply_or_verify_historical_candle_storage_migration",
  );
  expect(readiness.recommended_next_steps).toContain(
    "apply_migration_and_rerun_diagnostics",
  );
});

test("migration applied with unknown provider can move only to manual review", () => {
  const pipeline = readyPipeline();
  const readiness = buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storageReadinessApplied(),
    dry_run_pipeline: pipeline,
    provider_env_present: "unknown",
  });

  expect(readiness.readiness_status).toBe("ready_for_manual_review");
  expect(readiness.readiness_gates.migration_gate_passed).toBe(true);
  expect(readiness.readiness_gates.provider_gate_passed).toBe(false);
  expect(readiness.readiness_gates.manual_approval_gate_passed).toBe(false);
  expect(readiness.first_fetch_candidate_plan.enabled).toBe(false);
});

test("missing dry-run pipeline blocks readiness", () => {
  const readiness = buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storageReadinessApplied(),
    provider_env_present: true,
  });

  expect(readiness.readiness_status).toBe("blocked");
  expect(readiness.blockers).toContain(
    "historical_backfill_dry_run_pipeline_missing",
  );
});

test("provider env missing blocks first tiny fetch readiness", () => {
  const readiness = buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storageReadinessApplied(),
    dry_run_pipeline: readyPipeline(),
    provider_env_present: false,
  });

  expect(readiness.readiness_status).toBe("ready_for_manual_review");
  expect(readiness.readiness_status).not.toBe(
    "ready_for_first_tiny_fetch_later",
  );
  expect(readiness.warnings).toContain(
    "provider_env_not_verified_for_future_fetch",
  );
});

test("provider present can reach future tiny fetch readiness while still disabled", () => {
  const readiness = buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storageReadinessApplied(),
    dry_run_pipeline: readyPipeline(),
    provider_env_present: true,
  });

  expect(readiness.readiness_status).toBe("ready_for_first_tiny_fetch_later");
  expect(readiness.readiness_gates.provider_gate_passed).toBe(true);
  expect(readiness.readiness_gates.manual_approval_gate_passed).toBe(false);
  expect(readiness.first_fetch_candidate_plan.enabled).toBe(false);
  expect(readiness.first_fetch_candidate_plan.dry_run_only).toBe(true);
  expect(readiness.safety.provider_fetch_added).toBe(false);
  expect(readiness.safety.candles_persisted).toBe(false);
});

test("manual approval and all execution safety gates remain closed", () => {
  const readiness = buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storageReadinessApplied(),
    dry_run_pipeline: readyPipeline(),
    provider_env_present: true,
  });

  expect(readiness.prerequisites.manual_approval_required).toBe(true);
  expect(readiness.readiness_gates.manual_approval_gate_passed).toBe(false);
  expect(readiness.first_fetch_candidate_plan.enabled).toBe(false);
  expect(readiness.safety.provider_fetch_added).toBe(false);
  expect(readiness.safety.historical_fetch_added).toBe(false);
  expect(readiness.safety.candles_persisted).toBe(false);
  expect(readiness.safety.fetch_run_persisted).toBe(false);
  expect(readiness.safety.synthetic_outcomes_persisted).toBe(false);
  expect(readiness.safety.replay_executed).toBe(false);
  expect(readiness.safety.scanner_behavior_changed).toBe(false);
  expect(readiness.safety.live_ranking_changed).toBe(false);
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "historical_backfill_execution_readiness",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain(
    "Readiness status: ready_for_first_tiny_fetch_later",
  );
  expect(section?.lines).toContain("Migration applied: yes");
  expect(section?.lines).toContain(
    "historical_candles table detected: yes",
  );
  expect(section?.lines).toContain(
    "historical_candle_fetch_runs table detected: yes",
  );
  expect(section?.lines).toContain("Dry-run pipeline ready: yes");
  expect(section?.lines).toContain("Request contract ready: yes");
  expect(section?.lines).toContain("Response parser ready: yes");
  expect(section?.lines).toContain("Persistence plan ready: yes");
  expect(section?.lines).toContain("Provider env present: yes");
  expect(section?.lines).toContain("Budget policy present: yes");
  expect(section?.lines).toContain("Lookahead safety present: yes");
  expect(section?.lines).toContain("Manual approval required: yes");
  expect(section?.lines).toContain("Manual approval gate passed: no");
  expect(section?.lines).toContain(
    "First tiny fetch candidate: disabled / dry-run only / tickers AAPL, AMD, PLTR / days 1 / interval 5min",
  );
  expect(section?.lines).toContain("Ready to call provider: no");
  expect(section?.lines).toContain("Ready to persist candles: no");
  expect(section?.lines).toContain("Ready to create synthetic outcomes: no");
  expect(section?.lines).toContain("Ready to run replay: no");
  expect(section?.lines).toContain("Ready to affect scanner: no");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Historical fetch added: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Fetch run persisted: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Replay executed: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith(
        "Historical backfill execution readiness: ready_for_first_tiny_fetch_later",
      ),
    ),
  ).toBe(true);
});

