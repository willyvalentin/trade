import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyFetchRunAuditWriteApproval,
  buildFirstTinyFetchRunAuditWriteApprovalSignalFromEnv,
  type FirstTinyFetchRunAuditWriteApprovalEnv,
} from "../../lib/first-tiny-historical-fetch-run-audit-write-approval";
import {
  buildFirstTinyHistoricalFetchRunAuditWritePlan,
  type FirstTinyHistoricalFetchRunAuditWritePlanSummary,
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
  "docs/first-tiny-historical-fetch-run-audit-write-approval.md",
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

function readyPlan() {
  return buildFirstTinyHistoricalFetchRunAuditWritePlan({
    migration_detection: storageDetection(),
  });
}

function validEnv(
  overrides: FirstTinyFetchRunAuditWriteApprovalEnv = {},
): FirstTinyFetchRunAuditWriteApprovalEnv {
  return {
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED: "true",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL:
      "willy_manual_approval_002",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE:
      "first_tiny_fetch_run_audit_write_approval_20260709",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER: "AAPL",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS: "1",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED: "false",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED: "false",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED: "false",
    ...overrides,
  };
}

function planWith(
  mutate: (
    plan: FirstTinyHistoricalFetchRunAuditWritePlanSummary,
  ) => unknown,
) {
  const plan = readyPlan();
  mutate(plan);
  return plan;
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
      next_action: { label: "Review fetch-run audit write approval" },
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
          "first_tiny_historical_fetch_run_audit_write_approval_test",
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

test("artifact documents approval contract and valid-but-no-write state", () => {
  const artifact = readArtifact();

  expect(artifact).toContain(
    "First Tiny Fetch-Run Audit Write Approval Gate",
  );
  expect(artifact).toContain(
    "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED",
  );
  expect(artifact).toContain(
    "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED=false",
  );
  expect(artifact).toContain("ticker equals `AAPL`");
  expect(artifact).toContain("max rows equals `1`");
  expect(artifact).toContain("approval status: `valid_for_future_audit_write`");
  expect(artifact).toContain("write allowed now: no");
  expect(artifact).toContain("first tiny fetch-run audit write execute attempt");
});

test("no signal is not configured but can accept future signal when plan is ready", () => {
  const approval = buildFirstTinyFetchRunAuditWriteApproval({
    env: {},
    audit_write_plan: readyPlan(),
  });

  expect(approval.approval_status).toBe("not_configured");
  expect(approval.signal.signal_active).toBe(false);
  expect(approval.blockers).toEqual([]);
  expect(approval.readiness.ready_to_accept_future_signal).toBe(true);
  expect(approval.readiness.ready_to_propose_audit_write_action).toBe(false);
  expect(approval.readiness.write_allowed_now).toBe(false);
  expect(approval.readiness.fetch_run_persisted).toBe(false);
  expect(approval.readiness.candles_persisted).toBe(false);
  expect(approval.safety.replay_executed).toBe(false);
  expect(approval.safety.scanner_behavior_changed).toBe(false);
  expect(approval.safety.live_ranking_changed).toBe(false);
});

test("valid signal is valid for future audit write but does not write", () => {
  const approval = buildFirstTinyFetchRunAuditWriteApproval({
    env: validEnv(),
    audit_write_plan: readyPlan(),
  });

  expect(approval.approval_status).toBe("valid_for_future_audit_write");
  expect(approval.signal.signal_active).toBe(true);
  expect(approval.validation.source_verification_ready).toBe(true);
  expect(approval.validation.audit_write_plan_ready).toBe(true);
  expect(approval.validation.planned_audit_rows_valid).toBe(true);
  expect(approval.readiness.ready_to_accept_future_signal).toBe(true);
  expect(approval.readiness.ready_to_propose_audit_write_action).toBe(true);
  expect(approval.readiness.write_allowed_now).toBe(false);
  expect(approval.safety.fetch_run_write_executed).toBe(false);
  expect(approval.safety.fetch_run_persisted).toBe(false);
  expect(approval.safety.candles_persisted).toBe(false);
  expect(approval.safety.raw_response_persisted).toBe(false);
  expect(approval.safety.synthetic_outcomes_persisted).toBe(false);
  expect(approval.safety.replay_executed).toBe(false);
  expect(approval.safety.scanner_behavior_changed).toBe(false);
  expect(approval.safety.live_ranking_changed).toBe(false);
});

test("invalid signal values block approval", () => {
  const cases: Array<{
    env: FirstTinyFetchRunAuditWriteApprovalEnv;
    blocker: string;
  }> = [
    {
      env: validEnv({ TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER: "MSFT" }),
      blocker: "ticker_mismatch",
    },
    {
      env: validEnv({ TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS: "2" }),
      blocker: "max_rows_not_one",
    },
    {
      env: validEnv({
        TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED: "true",
      }),
      blocker: "candle_persist_not_allowed",
    },
    {
      env: validEnv({
        TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED: "true",
      }),
      blocker: "replay_not_allowed",
    },
    {
      env: validEnv({
        TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED: "true",
      }),
      blocker: "scanner_effect_not_allowed",
    },
    {
      env: validEnv({
        TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL: "",
      }),
      blocker: "operator_label_missing",
    },
    {
      env: validEnv({
        TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE: "",
      }),
      blocker: "approval_reference_missing",
    },
  ];

  for (const item of cases) {
    const approval = buildFirstTinyFetchRunAuditWriteApproval({
      env: item.env,
      audit_write_plan: readyPlan(),
    });

    expect(approval.approval_status).toBe("invalid");
    expect(approval.blockers).toContain(item.blocker);
    expect(approval.readiness.write_allowed_now).toBe(false);
    expect(approval.safety.fetch_run_persisted).toBe(false);
    expect(approval.safety.candles_persisted).toBe(false);
  }
});

test("source verification and planned row mismatches block approval", () => {
  const sourceMissingPlan = planWith((plan) => {
    (
      plan as unknown as {
        source_verification: string;
      }
    ).source_verification = "missing_source_verification";
  });
  const rowMismatchPlan = planWith((plan) => {
    (
      plan.write_gate as unknown as {
        planned_audit_rows: number;
      }
    ).planned_audit_rows = 2;
  });

  const sourceApproval = buildFirstTinyFetchRunAuditWriteApproval({
    env: validEnv(),
    audit_write_plan: sourceMissingPlan,
  });
  const rowApproval = buildFirstTinyFetchRunAuditWriteApproval({
    env: validEnv(),
    audit_write_plan: rowMismatchPlan,
  });

  expect(sourceApproval.approval_status).toBe("invalid");
  expect(sourceApproval.blockers).toContain("source_verification_not_ready");
  expect(sourceApproval.blockers).toContain("audit_write_plan_not_ready");
  expect(rowApproval.approval_status).toBe("invalid");
  expect(rowApproval.blockers).toContain("planned_audit_rows_not_one");
  expect(rowApproval.blockers).toContain("audit_write_plan_not_ready");
  expect(rowApproval.safety.fetch_run_persisted).toBe(false);
});

test("signal parser uses only safe categories and values", () => {
  const signal = buildFirstTinyFetchRunAuditWriteApprovalSignalFromEnv(
    validEnv(),
  );

  expect(signal.source_type).toBe("server_env");
  expect(signal.source_present).toBe(true);
  expect(signal.approved).toBe(true);
  expect(signal.ticker).toBe("AAPL");
  expect(signal.max_rows).toBe(1);
  expect(signal.candle_persist_allowed).toBe(false);
  expect(signal.replay_allowed).toBe(false);
  expect(signal.scanner_effect_allowed).toBe(false);
});

test("diagnostics reports approval gate and recommends separate action", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "first_tiny_fetch_run_audit_write_approval",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Approval status: not_configured");
  expect(section?.lines).toContain("Signal active: no");
  expect(section?.lines).toContain("Source verification ready: yes");
  expect(section?.lines).toContain("Audit write plan ready: yes");
  expect(section?.lines).toContain("Expected ticker: AAPL");
  expect(section?.lines).toContain("Expected max rows: 1");
  expect(section?.lines).toContain("Candle persist allowed: no");
  expect(section?.lines).toContain("Replay allowed: no");
  expect(section?.lines).toContain("Scanner effect allowed: no");
  expect(section?.lines).toContain("Write allowed now: no");
  expect(section?.lines).toContain("Fetch run persisted: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Replay executed: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(section?.lines).toContain("Ready to accept future signal: yes");
  expect(section?.lines).toContain(
    "Ready to propose audit write action: no",
  );
  expect(section?.metrics.write_allowed_now).toBe(false);
  expect(section?.metrics.fetch_run_persisted).toBe(false);
  expect(section?.metrics.candles_persisted).toBe(false);
  expect(section?.metrics.raw_response_persisted).toBe(false);
  expect(section?.metrics.replay_executed).toBe(false);
  expect(section?.metrics.scanner_behavior_changed).toBe(false);
  expect(section?.metrics.live_ranking_changed).toBe(false);
  expect(String(section?.metrics.recommended_next_steps)).toContain(
    "configure_valid_fetch_run_audit_write_approval_signal",
  );
  expect(String(section?.metrics.recommended_next_steps)).toContain(
    "require_separate_action_before_fetch_run_insert",
  );
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith(
        "First tiny fetch-run audit approval: not_configured / ready yes / write no",
      ),
    ),
  ).toBe(true);
});

test("approval diagnostics do not call provider or write paths", () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("unexpected network call during approval gate diagnostics");
  }) as typeof fetch;

  try {
    const approval = buildFirstTinyFetchRunAuditWriteApproval({
      env: validEnv(),
      audit_write_plan: readyPlan(),
    });

    expect(fetchCalls).toBe(0);
    expect(approval.safety.provider_call_executed).toBe(false);
    expect(approval.safety.historical_fetch_added).toBe(false);
    expect(approval.safety.fetch_run_write_executed).toBe(false);
    expect(approval.safety.fetch_run_persisted).toBe(false);
    expect(approval.safety.candles_persisted).toBe(false);
    expect(approval.safety.raw_response_persisted).toBe(false);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
