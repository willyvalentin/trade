import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalFetchRunAuditWritePlan,
} from "../../lib/first-tiny-historical-fetch-run-audit-write-plan";
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
  "docs/first-tiny-historical-fetch-run-audit-write-plan.md",
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
      next_action: { label: "Review first tiny fetch-run audit plan" },
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
          "first_tiny_historical_fetch_run_audit_write_plan_test",
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

test("artifact documents dry-run audit write plan and future approval contract", () => {
  const artifact = readArtifact();

  expect(artifact).toContain(
    "First Tiny Historical Fetch Run Audit Write Plan",
  );
  expect(artifact).toContain("Target table: `historical_candle_fetch_runs`");
  expect(artifact).toContain(
    "Source verification: `first_tiny_historical_fetch_no_persist_verified`",
  );
  expect(artifact).toContain("Ticker: `AAPL`");
  expect(artifact).toContain("Interval: `5min`");
  expect(artifact).toContain("Trading day: `2026-07-08`");
  expect(artifact).toContain("Planned audit rows: `1`");
  expect(artifact).toContain("Candle rows to persist: `0`");
  expect(artifact).toContain("Raw response to persist: no");
  expect(artifact).toContain("Replay to run: no");
  expect(artifact).toContain("Scanner behavior changed: no");
  expect(artifact).toContain(
    "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED",
  );
  expect(artifact).toContain("ticker must match `AAPL`");
  expect(artifact).toContain("max rows must equal `1`");
});

test("helper builds one-row dry-run audit plan from verified no-persist result", () => {
  const plan = buildFirstTinyHistoricalFetchRunAuditWritePlan({
    migration_detection: storageDetection(),
  });

  expect(plan.status).toBe("planned");
  expect(plan.plan_mode).toBe("dry_run_only");
  expect(plan.source_verification).toBe(
    "first_tiny_historical_fetch_no_persist_verified",
  );
  expect(plan.target_table).toBe("historical_candle_fetch_runs");
  expect(plan.table_readiness.table_detected).toBe("yes");
  expect(plan.table_readiness.rls_enabled).toBe("yes");
  expect(plan.table_readiness.service_role_only_path_expected).toBe(true);
  expect(plan.table_readiness.client_writes_allowed).toBe("no");
  expect(plan.table_readiness.schema_readback_attempted).toBe(true);
  expect(plan.table_readiness.schema_readback_status).toBe("ok");
  expect(plan.planned_audit_record.provider).toBe("twelve_data");
  expect(plan.planned_audit_record.endpoint).toBe("time_series");
  expect(plan.planned_audit_record.ticker).toBe("AAPL");
  expect(plan.planned_audit_record.interval).toBe("5min");
  expect(plan.planned_audit_record.trading_day).toBe("2026-07-08");
  expect(plan.planned_audit_record.request_count).toBe(1);
  expect(plan.planned_audit_record.estimated_credits).toBe(1);
  expect(plan.planned_audit_record.call_attempted).toBe(true);
  expect(plan.planned_audit_record.call_succeeded).toBe(true);
  expect(plan.planned_audit_record.http_status).toBe(200);
  expect(plan.planned_audit_record.parse_status).toBe("ok");
  expect(plan.planned_audit_record.valid_candles).toBe(27);
  expect(plan.planned_audit_record.planned_inserts).toBe(27);
  expect(plan.write_gate.dry_run_only).toBe(true);
  expect(plan.write_gate.fetch_run_write_allowed_now).toBe(false);
  expect(plan.write_gate.fetch_run_persisted).toBe(false);
  expect(plan.write_gate.candles_persisted).toBe(false);
  expect(plan.write_gate.raw_response_persisted).toBe(false);
  expect(plan.write_gate.synthetic_outcomes_persisted).toBe(false);
  expect(plan.write_gate.replay_executed).toBe(false);
  expect(plan.write_gate.scanner_behavior_changed).toBe(false);
  expect(plan.write_gate.live_ranking_changed).toBe(false);
  expect(plan.write_gate.planned_audit_rows).toBe(1);
  expect(plan.write_gate.candle_rows_to_persist).toBe(0);
  expect(plan.future_approval_contract.active_now).toBe(false);
  expect(plan.future_approval_contract.env_names).toContain(
    "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED",
  );
  expect(plan.future_approval_contract.validation_rules).toContain(
    "ticker_must_match_AAPL",
  );
  expect(plan.future_approval_contract.validation_rules).toContain(
    "max_rows_must_equal_1",
  );
});

test("helper remains dry-run when schema readback is unavailable", () => {
  const plan = buildFirstTinyHistoricalFetchRunAuditWritePlan();

  expect(plan.table_readiness.table_detected).toBe("unknown");
  expect(plan.table_readiness.schema_readback_attempted).toBe(false);
  expect(plan.write_gate.fetch_run_write_allowed_now).toBe(false);
  expect(plan.write_gate.fetch_run_persisted).toBe(false);
  expect(plan.write_gate.candles_persisted).toBe(false);
});

test("market diagnostics surfaces audit write plan with write disabled", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "first_tiny_fetch_run_audit_write_plan",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Status: planned / dry run only");
  expect(section?.lines).toContain(
    "Source verification: first_tiny_historical_fetch_no_persist_verified",
  );
  expect(section?.lines).toContain(
    "Target table: historical_candle_fetch_runs",
  );
  expect(section?.lines).toContain("Table detected: yes");
  expect(section?.lines).toContain("RLS enabled: yes");
  expect(section?.lines).toContain("Client writes allowed: no");
  expect(section?.lines).toContain("Write allowed now: no");
  expect(section?.lines).toContain("Fetch run persisted: no");
  expect(section?.lines).toContain("Ticker: AAPL");
  expect(section?.lines).toContain("Interval: 5min");
  expect(section?.lines).toContain("Trading day: 2026-07-08");
  expect(section?.lines).toContain("Planned audit rows: 1");
  expect(section?.lines).toContain("Candle rows to persist: 0");
  expect(section?.lines).toContain("Raw response to persist: no");
  expect(section?.lines).toContain("Replay to run: no");
  expect(section?.lines).toContain("Scanner effect: no");
  expect(section?.lines).toContain(
    "Requires separate operator approval: yes",
  );
  expect(section?.metrics.dry_run_only).toBe(true);
  expect(section?.metrics.fetch_run_write_allowed_now).toBe(false);
  expect(section?.metrics.fetch_run_persisted).toBe(false);
  expect(section?.metrics.candles_persisted).toBe(false);
  expect(section?.metrics.raw_response_persisted).toBe(false);
  expect(section?.metrics.replay_executed).toBe(false);
  expect(section?.metrics.scanner_behavior_changed).toBe(false);
  expect(section?.metrics.live_ranking_changed).toBe(false);
  expect(section?.metrics.planned_audit_rows).toBe(1);
  expect(section?.metrics.ticker).toBe("AAPL");
  expect(section?.metrics.request_count).toBe(1);
  expect(section?.metrics.valid_candles).toBe(27);
  expect(String(section?.metrics.recommended_next_steps)).toContain(
    "require_separate_approval_before_fetch_run_audit_write",
  );
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith(
        "First tiny fetch-run audit write plan: planned / rows 1 / write no / candles no",
      ),
    ),
  ).toBe(true);
});
