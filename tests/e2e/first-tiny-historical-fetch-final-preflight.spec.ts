import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildFirstTinyHistoricalFetchApproval } from "../../lib/first-tiny-historical-fetch-approval";
import { buildFirstTinyHistoricalFetchApprovalSignalReadiness } from "../../lib/first-tiny-historical-fetch-approval-signal-readiness";
import { buildFirstTinyHistoricalFetchExecutionPlan } from "../../lib/first-tiny-historical-fetch-execution-plan";
import { buildFirstTinyHistoricalFetchFinalPreflight } from "../../lib/first-tiny-historical-fetch-final-preflight";
import { buildFirstTinyHistoricalFetchOperatorApproval } from "../../lib/first-tiny-historical-fetch-operator-approval";
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

function verifiedStorageReadiness() {
  return buildHistoricalCandleStorageReadiness({
    migration_detection: storageDetection(),
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

function verifiedChain() {
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
  const requestPreview = buildFirstTinyHistoricalFetchRequestPreview({
    approval,
    twelve_data_historical_fetch_contract: contract,
  });
  const operatorApproval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval,
    request_preview: requestPreview,
    execution_readiness: execution,
  });
  const executionPlan = buildFirstTinyHistoricalFetchExecutionPlan({
    operator_approval: operatorApproval,
    request_preview: requestPreview,
  });
  const signalReadiness = buildFirstTinyHistoricalFetchApprovalSignalReadiness({
    operator_approval: operatorApproval,
    request_preview: requestPreview,
    execution_plan: executionPlan,
  });

  return {
    storage,
    execution,
    approval,
    requestPreview,
    operatorApproval,
    executionPlan,
    signalReadiness,
  };
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
      next_action: { label: "Review first tiny approval signal" },
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
          "first_tiny_historical_fetch_approval_signal_readiness_test",
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

test("empty input does not throw and remains advisory final preflight only", () => {
  const preflight = buildFirstTinyHistoricalFetchFinalPreflight();

  expect(preflight.advisory_only).toBe(true);
  expect(preflight.final_preflight_only).toBe(true);
  expect(preflight.preflight_status).toBe("not_ready");
  expect(preflight.readiness.ready_to_review_final_preflight).toBe(true);
  expect(preflight.readiness.ready_to_propose_first_provider_call_action).toBe(
    false,
  );
  expect(preflight.readiness.ready_to_execute_now).toBe(false);
});

test("missing prerequisite layers block with explicit reasons", () => {
  const chain = verifiedChain();
  const noStorage = buildFirstTinyHistoricalFetchFinalPreflight({
    execution_readiness: chain.execution,
    approval: chain.approval,
    request_preview: chain.requestPreview,
    operator_approval: chain.operatorApproval,
    execution_plan: chain.executionPlan,
    approval_signal_readiness: chain.signalReadiness,
  });
  const noOperator = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: chain.storage,
    execution_readiness: chain.execution,
    approval: chain.approval,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    approval_signal_readiness: chain.signalReadiness,
  });

  expect(noStorage.preflight_status).toBe("blocked");
  expect(noStorage.blockers).toContain("storage_not_verified");
  expect(noOperator.preflight_status).toBe("blocked");
  expect(noOperator.blockers).toContain(
    "operator_approval_not_ready_for_decision",
  );
});

test("missing request preview, execution plan, and signal readiness block", () => {
  const chain = verifiedChain();
  const noPreview = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: chain.storage,
    execution_readiness: chain.execution,
    approval: chain.approval,
    operator_approval: chain.operatorApproval,
    execution_plan: chain.executionPlan,
    approval_signal_readiness: chain.signalReadiness,
  });
  const noPlan = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: chain.storage,
    execution_readiness: chain.execution,
    approval: chain.approval,
    request_preview: chain.requestPreview,
    operator_approval: chain.operatorApproval,
    approval_signal_readiness: chain.signalReadiness,
  });
  const noSignalReadiness = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: chain.storage,
    execution_readiness: chain.execution,
    approval: chain.approval,
    request_preview: chain.requestPreview,
    operator_approval: chain.operatorApproval,
    execution_plan: chain.executionPlan,
  });

  expect(noPreview.blockers).toContain("request_preview_not_ready");
  expect(noPlan.blockers).toContain(
    "execution_plan_not_ready_for_future_approval",
  );
  expect(noSignalReadiness.blockers).toContain(
    "approval_signal_contract_not_ready",
  );
});

test("all ready layers make the final preflight proposal-ready only", () => {
  const chain = verifiedChain();
  const preflight = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: chain.storage,
    execution_readiness: chain.execution,
    approval: chain.approval,
    request_preview: chain.requestPreview,
    operator_approval: chain.operatorApproval,
    execution_plan: chain.executionPlan,
    approval_signal_readiness: chain.signalReadiness,
  });

  expect(preflight.preflight_status).toBe(
    "ready_to_propose_first_provider_call_action",
  );
  expect(preflight.blockers).toEqual([]);
  expect(preflight.request_scope.provider).toBe("twelve_data");
  expect(preflight.request_scope.endpoint).toBe("time_series");
  expect(preflight.request_scope.ticker).toBe("COIN");
  expect(preflight.request_scope.interval).toBe("5min");
  expect(preflight.request_scope.request_count).toBe(1);
  expect(preflight.request_scope.estimated_credits).toBe(1);
  expect(preflight.readiness.ready_to_propose_first_provider_call_action).toBe(
    true,
  );
  expect(preflight.readiness.ready_to_execute_now).toBe(false);
  expect(preflight.readiness.ready_to_call_provider_now).toBe(false);
});

test("runtime effects and safety remain disabled", () => {
  const chain = verifiedChain();
  const preflight = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: chain.storage,
    execution_readiness: chain.execution,
    approval: chain.approval,
    request_preview: chain.requestPreview,
    operator_approval: chain.operatorApproval,
    execution_plan: chain.executionPlan,
    approval_signal_readiness: chain.signalReadiness,
  });

  expect(preflight.preflight_checks.explicit_separate_action_required).toBe(
    true,
  );
  expect(preflight.readiness.ready_to_persist_candles_now).toBe(false);
  expect(preflight.readiness.ready_to_create_fetch_run_now).toBe(false);
  expect(preflight.readiness.ready_to_create_synthetic_outcomes).toBe(false);
  expect(preflight.readiness.ready_to_run_replay).toBe(false);
  expect(preflight.readiness.ready_to_affect_scanner).toBe(false);
  expect(preflight.safety.provider_fetch_added).toBe(false);
  expect(preflight.safety.historical_fetch_added).toBe(false);
  expect(preflight.safety.provider_call_executed).toBe(false);
  expect(preflight.safety.candles_persisted).toBe(false);
  expect(preflight.safety.fetch_run_persisted).toBe(false);
  expect(preflight.safety.synthetic_outcomes_persisted).toBe(false);
  expect(preflight.safety.replay_executed).toBe(false);
  expect(preflight.safety.scanner_behavior_changed).toBe(false);
  expect(preflight.safety.requires_separate_action_for_provider_call).toBe(
    true,
  );
});

test("diagnostics section prints expected final preflight safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) =>
      item.section_id ===
      "first_tiny_historical_fetch_final_preflight",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Final preflight only: yes");
  expect(section?.lines).toContain(
    "Preflight status: ready_to_propose_first_provider_call_action",
  );
  expect(section?.lines).toContain("Storage verified: yes");
  expect(section?.lines).toContain(
    "Execution readiness ready for manual review: yes",
  );
  expect(section?.lines).toContain("Approval gate pending manual review: yes");
  expect(section?.lines).toContain("Request preview ready: yes");
  expect(section?.lines).toContain(
    "Operator approval ready for decision: yes",
  );
  expect(section?.lines).toContain(
    "Execution plan ready for future approval: yes",
  );
  expect(section?.lines).toContain("Approval signal contract ready: yes");
  expect(section?.lines).toContain("Provider: Twelve Data");
  expect(section?.lines).toContain("Endpoint: time_series");
  expect(section?.lines).toContain("Ticker: COIN");
  expect(section?.lines).toContain("Interval: 5min");
  expect(section?.lines).toContain("Request count: 1");
  expect(section?.lines).toContain("Estimated credits: 1");
  expect(section?.lines).toContain("Cache lookup required: yes");
  expect(section?.lines).toContain("Fetch-run audit required: yes");
  expect(section?.lines).toContain("Persist allowed: no");
  expect(section?.lines).toContain("Replay allowed: no");
  expect(section?.lines).toContain("Scanner effect allowed: no");
  expect(section?.lines).toContain("Provider env present: yes");
  expect(section?.lines).toContain("Budget policy present: yes");
  expect(section?.lines).toContain("Lookahead safety present: yes");
  expect(section?.lines).toContain("Pause near scan windows: yes");
  expect(section?.lines).toContain("Pause on provider warnings: yes");
  expect(section?.lines).toContain("Explicit separate action required: yes");
  expect(section?.lines).toContain("Ready to review final preflight: yes");
  expect(section?.lines).toContain(
    "Ready to propose first provider-call action: yes",
  );
  expect(section?.lines).toContain("Ready to execute now: no");
  expect(section?.lines).toContain("Ready to call provider now: no");
  expect(section?.lines).toContain("Ready to persist candles now: no");
  expect(section?.lines).toContain("Ready to create fetch-run now: no");
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
        "First tiny fetch final preflight: ready_to_propose_first_provider_call_action / execute no / provider call no / persist no",
      ),
    ),
  ).toBe(true);
});
