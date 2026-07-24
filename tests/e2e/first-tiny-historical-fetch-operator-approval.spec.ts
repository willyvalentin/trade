import { expect, test } from "@playwright/test";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildFirstTinyHistoricalFetchApproval } from "../../lib/first-tiny-historical-fetch-approval";
import { buildFirstTinyHistoricalFetchOperatorApproval } from "../../lib/first-tiny-historical-fetch-operator-approval";
import { buildFirstTinyHistoricalFetchRequestPreview } from "../../lib/first-tiny-historical-fetch-request-preview";
import { buildHistoricalBackfillDryRunPipeline } from "../../lib/historical-backfill-dry-run-pipeline";
import { buildHistoricalBackfillExecutionReadiness } from "../../lib/historical-backfill-execution-readiness";
import type { HistoricalBackfillExecutionReadinessSummary } from "../../lib/historical-backfill-execution-readiness";
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

  return { storage, execution, approval, requestPreview };
}

function executionNotReady(): HistoricalBackfillExecutionReadinessSummary {
  const storage = verifiedStorageReadiness();
  const fetchPlan = oneTickerFetchPlan();

  return buildHistoricalBackfillExecutionReadiness({
    storage_readiness: storage,
    fetch_plan: fetchPlan,
    provider_env_present: true,
  });
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
      next_action: { label: "Review first tiny operator approval" },
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
          "first_tiny_historical_fetch_operator_approval_test",
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

test("empty input does not throw and remains advisory record only", () => {
  const approval = buildFirstTinyHistoricalFetchOperatorApproval();

  expect(approval.advisory_only).toBe(true);
  expect(approval.approval_record_only).toBe(true);
  expect(approval.approval_record_status).toBe("blocked");
  expect(approval.safety.provider_call_executed).toBe(false);
});

test("missing schema readback blocks", () => {
  const { execution, requestPreview } = verifiedChain();
  const approvalGate = buildFirstTinyHistoricalFetchApproval({
    execution_readiness: execution,
  });
  const approval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval: approvalGate,
    request_preview: requestPreview,
    execution_readiness: execution,
  });

  expect(approval.approval_record_status).toBe("blocked");
  expect(approval.blockers).toContain("schema_readback_not_verified");
});

test("missing execution readiness blocks", () => {
  const { approval: approvalGate, requestPreview } = verifiedChain();
  const approval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval: approvalGate,
    request_preview: requestPreview,
  });

  expect(approval.approval_record_status).toBe("blocked");
  expect(approval.blockers).toContain(
    "execution_readiness_not_ready_for_manual_review",
  );
});

test("not-ready execution readiness blocks", () => {
  const { approval: approvalGate, requestPreview } = verifiedChain();
  const approval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval: approvalGate,
    request_preview: requestPreview,
    execution_readiness: executionNotReady(),
  });

  expect(approval.approval_record_status).toBe("blocked");
  expect(approval.blockers).toContain(
    "execution_readiness_not_ready_for_manual_review",
  );
});

test("missing request preview blocks", () => {
  const { approval: approvalGate, execution } = verifiedChain();
  const approval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval: approvalGate,
    execution_readiness: execution,
  });

  expect(approval.approval_record_status).toBe("blocked");
  expect(approval.blockers).toContain("first_tiny_request_preview_not_ready");
});

test("ready prerequisites create pending operator decision", () => {
  const { approval: approvalGate, execution, requestPreview } = verifiedChain();
  const approval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval: approvalGate,
    request_preview: requestPreview,
    execution_readiness: execution,
  });

  expect(approval.approval_record_status).toBe("pending_operator_decision");
  expect(approval.readiness.ready_for_operator_decision).toBe(true);
  expect(approval.approval_source.source_type).toBe("none");
  expect(approval.approval_source.source_present).toBe(false);
  expect(approval.approval_source.production_safe).toBe(true);
});

test("approval scope comes from request preview and remains non-executable", () => {
  const { approval: approvalGate, execution, requestPreview } = verifiedChain();
  const approval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval: approvalGate,
    request_preview: requestPreview,
    execution_readiness: execution,
  });

  expect(approval.approval_scope.provider).toBe("twelve_data");
  expect(approval.approval_scope.endpoint).toBe("time_series");
  expect(approval.approval_scope.ticker).toBe("COIN");
  expect(approval.approval_scope.interval).toBe("5min");
  expect(approval.approval_scope.request_count_limit).toBe(1);
  expect(approval.approval_scope.estimated_credit_limit).toBe(1);
  expect(approval.approval_scope.persist_allowed).toBe(false);
  expect(approval.approval_scope.replay_allowed).toBe(false);
  expect(approval.approval_scope.scanner_effect_allowed).toBe(false);
});

test("runtime effects remain disabled", () => {
  const { approval: approvalGate, execution, requestPreview } = verifiedChain();
  const approval = buildFirstTinyHistoricalFetchOperatorApproval({
    approval: approvalGate,
    request_preview: requestPreview,
    execution_readiness: execution,
  });

  expect(approval.readiness.ready_to_enable_future_fetch).toBe(false);
  expect(approval.readiness.ready_to_call_provider_now).toBe(false);
  expect(approval.readiness.ready_to_persist_candles_now).toBe(false);
  expect(approval.readiness.ready_to_create_fetch_run_now).toBe(false);
  expect(approval.readiness.ready_to_create_synthetic_outcomes).toBe(false);
  expect(approval.readiness.ready_to_run_replay).toBe(false);
  expect(approval.readiness.ready_to_affect_scanner).toBe(false);
  expect(approval.safety.provider_fetch_added).toBe(false);
  expect(approval.safety.historical_fetch_added).toBe(false);
  expect(approval.safety.provider_call_executed).toBe(false);
  expect(approval.safety.candles_persisted).toBe(false);
  expect(approval.safety.fetch_run_persisted).toBe(false);
  expect(approval.safety.synthetic_outcomes_persisted).toBe(false);
  expect(approval.safety.replay_executed).toBe(false);
  expect(approval.safety.scanner_behavior_changed).toBe(false);
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "first_tiny_historical_fetch_operator_approval",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Approval record only: yes");
  expect(section?.lines).toContain(
    "Approval record status: pending_operator_decision",
  );
  expect(section?.lines).toContain("Approval source: none");
  expect(section?.lines).toContain("Source present: no");
  expect(section?.lines).toContain("Production safe: yes");
  expect(section?.lines).toContain("Operator label: unknown");
  expect(section?.lines).toContain("Approval reference: unknown");
  expect(section?.lines).toContain(
    "Scope: Twelve Data / time_series / COIN / 5min / 1 request / 1 credit",
  );
  expect(section?.lines).toContain("Cache lookup required: yes");
  expect(section?.lines).toContain("Fetch-run audit required: yes");
  expect(section?.lines).toContain("Persist allowed: no");
  expect(section?.lines).toContain("Replay allowed: no");
  expect(section?.lines).toContain("Scanner effect allowed: no");
  expect(section?.lines).toContain("Schema readback ok: yes");
  expect(section?.lines).toContain(
    "Execution readiness ready_for_manual_review: yes",
  );
  expect(section?.lines).toContain(
    "Approval gate pending manual review: yes",
  );
  expect(section?.lines).toContain("Request preview ready: yes");
  expect(section?.lines).toContain("Ready for operator decision: yes");
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
        "First tiny fetch operator approval: pending_operator_decision / provider call no / persist no",
      ),
    ),
  ).toBe(true);
});
