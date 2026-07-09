import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildHistoricalBackfillDryRunPipeline,
  type HistoricalBackfillDryRunPipelineInput,
} from "../../lib/historical-backfill-dry-run-pipeline";
import { buildHistoricalCandleStorageReadiness } from "../../lib/historical-candle-storage-readiness";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import { buildProviderBudgetGuardSummary } from "../../lib/provider-budget-guard";
import { buildProviderPlanProfile } from "../../lib/provider-plan-profile";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
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
      visible_recent_tickers: ["AAPL", "AMD"],
      static_universe_tickers: ["AAPL", "AMD"],
      history_days_requested: 2,
      max_selected_tickers: 2,
      migration_applied: true,
    },
    storage_readiness: storageReadinessApplied(),
    now: evaluatedAt,
    ...overrides,
  };
}

function invalidMockResponse() {
  return {
    meta: {
      symbol: "AAPL",
      interval: "5min",
      exchange_timezone: "America/New_York",
      exchange: "NASDAQ",
    },
    values: [
      {
        datetime: "2026-07-08 09:30:00",
        open: "100",
        high: "99",
        low: "101",
        close: "100",
        volume: "10",
      },
    ],
    status: "ok",
  };
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
      next_action: { label: "Review historical backfill dry run" },
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
        qa_checked_source_path: "historical_backfill_dry_run_pipeline_test",
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

test("empty input does not throw and remains safe", () => {
  const pipeline = buildHistoricalBackfillDryRunPipeline();

  expect(pipeline.advisory_only).toBe(true);
  expect(pipeline.dry_run_only).toBe(true);
  expect(pipeline.mock_only).toBe(true);
  expect(pipeline.pipeline_status).toBe("empty");
  expect(pipeline.safety.provider_fetch_added).toBe(false);
  expect(pipeline.safety.historical_fetch_added).toBe(false);
  expect(pipeline.safety.candles_persisted).toBe(false);
  expect(pipeline.safety.fetch_run_persisted).toBe(false);
  expect(pipeline.safety.synthetic_outcomes_persisted).toBe(false);
  expect(pipeline.safety.replay_executed).toBe(false);
  expect(pipeline.safety.scanner_behavior_changed).toBe(false);
});

test("pipeline builds request plan", () => {
  const pipeline = buildHistoricalBackfillDryRunPipeline(pipelineInput());

  expect(pipeline.pipeline_steps.fetch_plan_built).toBe(true);
  expect(pipeline.pipeline_steps.request_plan_built).toBe(true);
  expect(pipeline.request_contract_summary.requests_planned).toBe(4);
  expect(pipeline.request_contract_summary.valid_requests).toBe(4);
});

test("pipeline parses mock responses and normalizes valid candles", () => {
  const pipeline = buildHistoricalBackfillDryRunPipeline(pipelineInput());

  expect(pipeline.pipeline_steps.mock_responses_parsed).toBe(true);
  expect(pipeline.pipeline_steps.candles_normalized).toBe(true);
  expect(pipeline.parser_summary.mock_responses_used).toBe(1);
  expect(pipeline.parser_summary.normalized_candles).toBe(12);
  expect(pipeline.parser_summary.valid_candles).toBe(12);
});

test("pipeline flags invalid candles", () => {
  const pipeline = buildHistoricalBackfillDryRunPipeline(
    pipelineInput({ mock_responses: [invalidMockResponse()] }),
  );

  expect(pipeline.pipeline_status).toBe("partial");
  expect(pipeline.parser_summary.invalid_candles).toBe(1);
  expect(pipeline.persistence_summary.planned_invalid_rejections).toBe(1);
});

test("pipeline builds persistence plan and summarizes insert counts", () => {
  const pipeline = buildHistoricalBackfillDryRunPipeline(pipelineInput());

  expect(pipeline.pipeline_steps.persistence_plan_built).toBe(true);
  expect(pipeline.persistence_summary.candles_received).toBe(12);
  expect(pipeline.persistence_summary.planned_inserts).toBe(12);
  expect(pipeline.persistence_summary.planned_skips).toBe(0);
  expect(pipeline.persistence_summary.planned_invalid_rejections).toBe(0);
  expect(pipeline.persistence_summary.cache_misses).toBe(12);
});

test("pipeline summarizes skips when cache keys already exist", () => {
  const first = buildHistoricalBackfillDryRunPipeline(pipelineInput());
  const cacheKey = first.components.parsers[0]?.candles[0]
    ? (first.components.parsers[0].candles[0] as { cache_key?: string | null })
        .cache_key
    : null;
  const pipeline = buildHistoricalBackfillDryRunPipeline(
    pipelineInput({ existing_cache_keys: cacheKey ? [cacheKey] : [] }),
  );

  expect(pipeline.persistence_summary.planned_skips).toBe(12);
  expect(pipeline.persistence_summary.cache_hits).toBe(12);
});

test("readiness keeps provider persistence replay and scanner gates closed", () => {
  const pipeline = buildHistoricalBackfillDryRunPipeline(pipelineInput());

  expect(pipeline.readiness.ready_to_run_mock_pipeline).toBe(true);
  expect(pipeline.readiness.ready_to_call_provider).toBe(false);
  expect(pipeline.readiness.ready_to_persist_candles).toBe(false);
  expect(pipeline.readiness.ready_to_create_synthetic_outcomes).toBe(false);
  expect(pipeline.readiness.ready_to_run_replay).toBe(false);
  expect(pipeline.readiness.ready_to_affect_scanner).toBe(false);
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "historical_backfill_dry_run_pipeline",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Dry run only: yes");
  expect(section?.lines).toContain("Mock only: yes");
  expect(section?.lines).toContain("Pipeline status: ready");
  expect(section?.lines).toContain(
    "Steps: fetch plan yes / requests yes / parser yes / persistence plan yes",
  );
  expect(section?.lines).toContain("History days planned: 5");
  expect(section?.lines).toContain("Requests planned/valid/invalid: 15 / 15 / 0");
  expect(section?.lines).toContain("Mock responses used: 1");
  expect(section?.lines).toContain(
    "Raw/normalized/valid/invalid candles: 12 / 12 / 12 / 0",
  );
  expect(section?.lines).toContain(
    "Planned inserts/updates/skips/rejections: 12 / 0 / 0 / 0",
  );
  expect(section?.lines).toContain("Cache hits/misses: 0 / 12");
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
      line.startsWith("Historical backfill dry-run: ready"),
    ),
  ).toBe(true);
});
