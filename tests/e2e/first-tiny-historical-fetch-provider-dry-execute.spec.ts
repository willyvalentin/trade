import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildFirstTinyHistoricalFetchApproval } from "../../lib/first-tiny-historical-fetch-approval";
import { buildFirstTinyHistoricalFetchApprovalSignalReadiness } from "../../lib/first-tiny-historical-fetch-approval-signal-readiness";
import { buildFirstTinyHistoricalFetchExecutionPlan } from "../../lib/first-tiny-historical-fetch-execution-plan";
import { buildFirstTinyHistoricalFetchFinalPreflight } from "../../lib/first-tiny-historical-fetch-final-preflight";
import { buildFirstTinyHistoricalFetchOperatorApproval } from "../../lib/first-tiny-historical-fetch-operator-approval";
import { buildFirstTinyHistoricalFetchProviderDryExecute } from "../../lib/first-tiny-historical-fetch-provider-dry-execute";
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

function validSignal() {
  return {
    source_type: "server_env" as const,
    source_present: true,
    approved: true,
    operator_label: "operator",
    approval_reference: "approval-ref-1",
    provider: "twelve_data",
    ticker: "COIN",
    interval: "5min",
    max_requests: 1,
    max_estimated_credits: 1,
    persist_allowed: false,
    replay_allowed: false,
    scanner_effect_allowed: false,
    production_safe: true,
  };
}

function approvedChain(signal = validSignal()) {
  const chain = verifiedChain();
  const signalReadiness =
    buildFirstTinyHistoricalFetchApprovalSignalReadiness({
      operator_approval: chain.operatorApproval,
      request_preview: chain.requestPreview,
      execution_plan: chain.executionPlan,
      signal,
    });
  const finalPreflight = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: chain.storage,
    execution_readiness: chain.execution,
    approval: chain.approval,
    request_preview: chain.requestPreview,
    operator_approval: chain.operatorApproval,
    execution_plan: chain.executionPlan,
    approval_signal_readiness: signalReadiness,
  });

  return { ...chain, signalReadiness, finalPreflight };
}

function providerResponse() {
  return {
    meta: {
      symbol: "COIN",
      interval: "5min",
      exchange_timezone: "America/New_York",
      exchange: "NASDAQ",
    },
    values: [
      {
        datetime: "2026-07-08 09:30:00",
        open: "220.10",
        high: "221.50",
        low: "219.80",
        close: "221.00",
        volume: "1000",
      },
      {
        datetime: "2026-07-08 09:35:00",
        open: "221.00",
        high: "222.00",
        low: "220.90",
        close: "221.40",
        volume: "1200",
      },
    ],
    status: "ok",
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

test("no approval signal returns not approved and performs no provider call", () => {
  const chain = verifiedChain();
  const finalPreflight = buildFirstTinyHistoricalFetchFinalPreflight({
    storage_readiness: chain.storage,
    execution_readiness: chain.execution,
    approval: chain.approval,
    request_preview: chain.requestPreview,
    operator_approval: chain.operatorApproval,
    execution_plan: chain.executionPlan,
    approval_signal_readiness: chain.signalReadiness,
  });
  const result = buildFirstTinyHistoricalFetchProviderDryExecute({
    final_preflight: finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
  });

  expect(result.execution_status).toBe("not_approved");
  expect(result.provider_call_capable).toBe(true);
  expect(result.provider_call_executed).toBe(false);
  expect(result.provider_result.call_attempted).toBe(false);
  expect(result.approval_context.signal_valid_for_execution).toBe(false);
});

test("invalid approval signal returns blocked and performs no provider call", () => {
  const chain = approvedChain({ ...validSignal(), production_safe: false });
  const result = buildFirstTinyHistoricalFetchProviderDryExecute({
    final_preflight: chain.finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
    execute_provider_call: false,
  });

  expect(result.execution_status).toBe("blocked");
  expect(result.blockers).toContain("approval_signal_not_valid_for_execution");
  expect(result.provider_result.call_attempted).toBe(false);
});

test("scope mismatch returns blocked and performs no provider call", () => {
  const chain = approvedChain({ ...validSignal(), ticker: "AAPL" });
  const result = buildFirstTinyHistoricalFetchProviderDryExecute({
    final_preflight: chain.finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
  });

  expect(result.execution_status).toBe("blocked");
  expect(result.blockers).toContain("approval_signal_not_valid_for_execution");
  expect(result.provider_result.call_attempted).toBe(false);
});

test("cache hit skips provider call", async () => {
  const chain = approvedChain();
  const result = await buildFirstTinyHistoricalFetchProviderDryExecute({
    execute_provider_call: true,
    final_preflight: chain.finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
    cache_lookup: () => ({
      available: true,
      hit: true,
      source: "historical_candles",
    }),
    provider_call: () => {
      throw new Error("provider should not be called on cache hit");
    },
  });

  expect(result.execution_status).toBe("cache_hit_skipped_provider");
  expect(result.cache_preflight.cache_lookup_attempted).toBe(true);
  expect(result.cache_preflight.cache_hit).toBe(true);
  expect(result.provider_result.call_attempted).toBe(false);
});

test("cache lookup unavailable blocks provider call", async () => {
  const chain = approvedChain();
  const result = await buildFirstTinyHistoricalFetchProviderDryExecute({
    execute_provider_call: true,
    final_preflight: chain.finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
    cache_lookup: () => ({ available: false, hit: false }),
  });

  expect(result.execution_status).toBe("blocked");
  expect(result.blockers).toContain("cache_lookup_unavailable");
  expect(result.provider_result.call_attempted).toBe(false);
});

test("valid approval and cache miss attempts one mocked provider call", async () => {
  const chain = approvedChain();
  let calls = 0;
  const result = await buildFirstTinyHistoricalFetchProviderDryExecute({
    execute_provider_call: true,
    final_preflight: chain.finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
    cache_lookup: () => ({ available: true, hit: false }),
    provider_call: (scope) => {
      calls += 1;
      expect(scope.provider).toBe("twelve_data");
      expect(scope.endpoint).toBe("time_series");
      expect(scope.ticker).toBe("COIN");
      expect(scope.interval).toBe("5min");
      expect(scope.request_count).toBe(1);
      expect(scope.estimated_credits).toBe(1);
      return {
        ok: true,
        http_status: 200,
        response: providerResponse(),
      };
    },
  });

  expect(calls).toBe(1);
  expect(result.execution_status).toBe("provider_call_completed_no_persist");
  expect(result.provider_call_executed).toBe(true);
  expect(result.provider_result.call_attempted).toBe(true);
  expect(result.provider_result.call_succeeded).toBe(true);
  expect(result.provider_result.api_key_included_in_diagnostics).toBe(false);
  expect(result.parser_result.parse_attempted).toBe(true);
  expect(result.parser_result.parse_status).toBe("ok");
  expect(result.parser_result.raw_candles).toBe(2);
  expect(result.parser_result.normalized_candles).toBe(2);
  expect(result.parser_result.valid_candles).toBe(2);
  expect(result.persistence_plan.persistence_planned).toBe(true);
  expect(result.persistence_plan.planned_inserts).toBe(2);
});

test("provider failure stays no-persist", async () => {
  const chain = approvedChain();
  const result = await buildFirstTinyHistoricalFetchProviderDryExecute({
    execute_provider_call: true,
    final_preflight: chain.finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
    cache_lookup: () => ({ available: true, hit: false }),
    provider_call: () => ({
      ok: false,
      http_status: 429,
      response: { status: "error", message: "rate limit" },
      error_type: "provider_error_response",
    }),
  });

  expect(result.execution_status).toBe("provider_call_failed_no_persist");
  expect(result.provider_call_executed).toBe(true);
  expect(result.parser_result.parse_attempted).toBe(false);
  expect(result.persistence_plan.persistence_planned).toBe(false);
  expect(result.safety.candles_persisted).toBe(false);
});

test("request count cannot exceed one", () => {
  const chain = approvedChain();
  const requestPreview = {
    ...chain.requestPreview,
    request_preview: {
      ...chain.requestPreview.request_preview,
      request_count: 2,
    },
  };
  const result = buildFirstTinyHistoricalFetchProviderDryExecute({
    final_preflight: chain.finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
  });

  expect(result.execution_status).toBe("blocked");
  expect(result.blockers).toContain("preview_request_count_must_equal_one");
});

test("runtime effects remain disabled", async () => {
  const chain = approvedChain();
  const result = await buildFirstTinyHistoricalFetchProviderDryExecute({
    execute_provider_call: true,
    final_preflight: chain.finalPreflight,
    approval_signal_readiness: chain.signalReadiness,
    request_preview: chain.requestPreview,
    execution_plan: chain.executionPlan,
    storage_readiness: chain.storage,
    cache_lookup: () => ({ available: true, hit: false }),
    provider_call: () => ({
      ok: true,
      http_status: 200,
      response: providerResponse(),
    }),
  });

  expect(result.provider_result.raw_response_persisted).toBe(false);
  expect(result.persistence_plan.candles_persisted).toBe(false);
  expect(result.persistence_plan.fetch_run_persisted).toBe(false);
  expect(result.readiness.ready_to_persist_candles_now).toBe(false);
  expect(result.readiness.ready_to_create_fetch_run_now).toBe(false);
  expect(result.readiness.ready_to_create_synthetic_outcomes).toBe(false);
  expect(result.readiness.ready_to_run_replay).toBe(false);
  expect(result.readiness.ready_to_affect_scanner).toBe(false);
  expect(result.safety.synthetic_outcomes_persisted).toBe(false);
  expect(result.safety.replay_executed).toBe(false);
  expect(result.safety.scanner_behavior_changed).toBe(false);
  expect(result.safety.live_ranking_changed).toBe(false);
  expect(result.safety.max_one_request_enforced).toBe(true);
  expect(result.safety.max_one_ticker_enforced).toBe(true);
  expect(result.safety.no_persistence_enforced).toBe(true);
});

test("diagnostics section prints expected provider dry execute safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) =>
      item.section_id ===
      "first_tiny_historical_fetch_provider_dry_execute",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Dry execute only: yes");
  expect(section?.lines).toContain("Provider call capable: yes");
  expect(section?.lines).toContain("Execution status: not_approved");
  expect(section?.lines).toContain(
    "Approval signal valid for execution: no",
  );
  expect(section?.lines).toContain("Signal active: no");
  expect(section?.lines).toContain("Provider: Twelve Data");
  expect(section?.lines).toContain("Endpoint: time_series");
  expect(section?.lines).toContain("Ticker: COIN");
  expect(section?.lines).toContain("Interval: 5min");
  expect(section?.lines).toContain("Request count: 1");
  expect(section?.lines).toContain("Estimated credits: 1");
  expect(section?.lines).toContain("Cache lookup attempted: no");
  expect(section?.lines).toContain("Cache hit: unknown");
  expect(section?.lines).toContain("Provider skipped due cache hit: no");
  expect(section?.lines).toContain("Provider call attempted: no");
  expect(section?.lines).toContain("Provider call succeeded: no");
  expect(section?.lines).toContain("Raw response received: no");
  expect(section?.lines).toContain("Raw response persisted: no");
  expect(section?.lines).toContain("Parse attempted: no");
  expect(section?.lines).toContain("Parse status: not_attempted");
  expect(section?.lines).toContain("Raw/normalized/valid/invalid candles: 0/0/0/0");
  expect(section?.lines).toContain(
    "Planned inserts/updates/skips/rejections: 0/0/0/0",
  );
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Fetch run persisted: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Replay executed: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(section?.lines).toContain("Live ranking changed: no");
  expect(section?.lines).toContain("Max one request enforced: yes");
  expect(section?.lines).toContain("Max one ticker enforced: yes");
  expect(section?.lines).toContain("No persistence enforced: yes");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith(
        "First tiny provider dry execute: not_approved / call no / persist no / scanner no",
      ),
    ),
  ).toBe(true);
});
