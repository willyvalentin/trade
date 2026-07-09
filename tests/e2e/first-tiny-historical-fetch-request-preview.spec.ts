import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildFirstTinyHistoricalFetchApproval } from "../../lib/first-tiny-historical-fetch-approval";
import { buildFirstTinyHistoricalFetchRequestPreview } from "../../lib/first-tiny-historical-fetch-request-preview";
import { buildHistoricalBackfillDryRunPipeline } from "../../lib/historical-backfill-dry-run-pipeline";
import { buildHistoricalBackfillExecutionReadiness } from "../../lib/historical-backfill-execution-readiness";
import { buildHistoricalBackfillFetchPlan } from "../../lib/historical-backfill-fetch-planner";
import { buildHistoricalCandleStorageReadiness } from "../../lib/historical-candle-storage-readiness";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import { buildTwelveDataHistoricalFetchContract } from "../../lib/twelve-data-historical-fetch-contract";

const evaluatedAt = "2026-07-09T15:00:00.000Z";

function verifiedStorageReadiness() {
  const readback = buildHistoricalCandleStorageReadback({
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
  });

  return buildHistoricalCandleStorageReadiness({
    migration_detection: historicalCandleStorageReadbackToDetection(readback),
  });
}

function oneTickerFetchPlan() {
  return buildHistoricalBackfillFetchPlan({
    visible_recent_tickers: ["COIN"],
    static_universe_tickers: ["COIN"],
    history_days_requested: 1,
    max_selected_tickers: 1,
    migration_applied: true,
  });
}

function verifiedApprovalAndContract() {
  const storage = verifiedStorageReadiness();
  const fetchPlan = oneTickerFetchPlan();
  const pipeline = buildHistoricalBackfillDryRunPipeline({
    fetch_plan: fetchPlan,
    storage_readiness: storage,
    now: evaluatedAt,
  });
  const execution = buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storage,
    fetch_plan: fetchPlan,
    dry_run_pipeline: pipeline,
    provider_env_present: true,
  });
  const approval = buildFirstTinyHistoricalFetchApproval({
    storage_readiness: storage,
    execution_readiness: execution,
  });
  const contract = buildTwelveDataHistoricalFetchContract({
    historical_backfill_fetch_plan: fetchPlan,
    now: evaluatedAt,
  });

  return { approval, contract };
}

function baseDiagnosticsInput(): MarketDiagnosticsConsoleInput {
  const dailyLearningReview = buildDailyLearningReviewSummary({
    snapshots: [],
    outcomes: [],
    configured_static_universe_count: 50,
    now: evaluatedAt,
  });
  const detection = historicalCandleStorageReadbackToDetection(
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
      next_action: { label: "Review first tiny fetch request preview" },
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
      selected_ticker_symbols: ["COIN", "PLTR", "DKNG"],
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
          "first_tiny_historical_fetch_request_preview_test",
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
    historical_candle_storage_detection: detection,
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("empty input does not throw and remains preview only", () => {
  const preview = buildFirstTinyHistoricalFetchRequestPreview();

  expect(preview.advisory_only).toBe(true);
  expect(preview.preview_only).toBe(true);
  expect(preview.preview_status).toBe("not_requested");
  expect(preview.readiness.ready_to_preview_request).toBe(false);
  expect(preview.safety.provider_call_executed).toBe(false);
});

test("approval missing blocks preview", () => {
  const { contract } = verifiedApprovalAndContract();
  const preview = buildFirstTinyHistoricalFetchRequestPreview({
    twelve_data_historical_fetch_contract: contract,
  });

  expect(preview.preview_status).toBe("not_requested");
  expect(preview.blockers).toContain("first_tiny_fetch_approval_missing");
  expect(preview.readiness.ready_to_call_provider_now).toBe(false);
});

test("pending manual review creates ready request preview", () => {
  const { approval, contract } = verifiedApprovalAndContract();
  const preview = buildFirstTinyHistoricalFetchRequestPreview({
    approval,
    twelve_data_historical_fetch_contract: contract,
  });

  expect(preview.preview_status).toBe("ready");
  expect(preview.readiness.ready_to_preview_request).toBe(true);
  expect(preview.request_preview.provider).toBe("twelve_data");
  expect(preview.request_preview.endpoint).toBe("time_series");
  expect(preview.request_preview.ticker).toBe("COIN");
  expect(preview.request_preview.interval).toBe("5min");
  expect(preview.request_preview.trading_day).toBe("2026-07-08");
  expect(preview.request_preview.request_count).toBe(1);
  expect(preview.request_preview.estimated_credits).toBe(1);
  expect(preview.provider_parameters_preview.symbol).toBe("COIN");
  expect(preview.provider_parameters_preview.apikey_included).toBe(false);
  expect(preview.provider_parameters_preview.start_date).toBeTruthy();
  expect(preview.provider_parameters_preview.end_date).toBeTruthy();
});

test("runtime effects remain disabled", () => {
  const { approval, contract } = verifiedApprovalAndContract();
  const preview = buildFirstTinyHistoricalFetchRequestPreview({
    approval,
    twelve_data_historical_fetch_contract: contract,
  });

  expect(preview.readiness.ready_to_call_provider_now).toBe(false);
  expect(preview.readiness.ready_to_persist_candles_now).toBe(false);
  expect(preview.readiness.ready_to_create_fetch_run_now).toBe(false);
  expect(preview.readiness.ready_to_create_synthetic_outcomes).toBe(false);
  expect(preview.readiness.ready_to_run_replay).toBe(false);
  expect(preview.readiness.ready_to_affect_scanner).toBe(false);
  expect(preview.safety.provider_fetch_added).toBe(false);
  expect(preview.safety.historical_fetch_added).toBe(false);
  expect(preview.safety.provider_call_executed).toBe(false);
  expect(preview.safety.candles_persisted).toBe(false);
  expect(preview.safety.fetch_run_persisted).toBe(false);
  expect(preview.safety.synthetic_outcomes_persisted).toBe(false);
  expect(preview.safety.replay_executed).toBe(false);
  expect(preview.safety.scanner_behavior_changed).toBe(false);
});

test("diagnostics section prints expected preview and safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "first_tiny_historical_fetch_request_preview",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Preview only: yes");
  expect(section?.lines).toContain("Preview status: ready");
  expect(section?.lines).toContain("Approval status: pending_manual_review");
  expect(section?.lines).toContain("First fetch enabled: no");
  expect(section?.lines).toContain("Dry run only: yes");
  expect(section?.lines).toContain("Provider: Twelve Data");
  expect(section?.lines).toContain("Endpoint: time_series");
  expect(section?.lines).toContain("Ticker: COIN");
  expect(section?.lines).toContain("Interval: 5min");
  expect(section?.lines).toContain("Trading day: 2026-07-08");
  expect(section?.lines).toContain("Timezone: America/New_York");
  expect(section?.lines.some((line) => line.startsWith("Start date: "))).toBe(
    true,
  );
  expect(section?.lines.some((line) => line.startsWith("End date: "))).toBe(
    true,
  );
  expect(section?.lines).toContain("Order: ASC");
  expect(section?.lines).toContain("Outputsize: unknown");
  expect(section?.lines).toContain("Session: regular");
  expect(section?.lines).toContain("Adjusted: false");
  expect(
    section?.lines.some((line) =>
      line.startsWith(
        "Cache key: twelve_data:COIN:5min:2026-07-08:official_windows",
      ),
    ),
  ).toBe(true);
  expect(section?.lines).toContain("Request count: 1");
  expect(section?.lines).toContain("Estimated credits: 1");
  expect(section?.lines).toContain("Cache lookup required: yes");
  expect(section?.lines).toContain("Would skip provider if cache hit: yes");
  expect(section?.lines).toContain("Fetch-run audit required: yes");
  expect(section?.lines).toContain("Would create fetch-run record now: no");
  expect(section?.lines).toContain("API key included: no");
  expect(section?.lines).toContain("Ready to call provider now: no");
  expect(section?.lines).toContain("Ready to persist candles now: no");
  expect(section?.lines).toContain("Ready to create synthetic outcomes: no");
  expect(section?.lines).toContain("Ready to run replay: no");
  expect(section?.lines).toContain("Ready to affect scanner: no");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Historical fetch added: no");
  expect(section?.lines).toContain("Provider call executed: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Fetch run persisted: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Replay executed: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith(
        "First tiny fetch preview: ready / COIN / 1 request / provider call no / persist no",
      ),
    ),
  ).toBe(true);
});
