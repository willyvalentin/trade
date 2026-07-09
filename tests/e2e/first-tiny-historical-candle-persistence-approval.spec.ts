import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyCandlePersistenceApproval,
  type FirstTinyCandlePersistenceApprovalEnv,
} from "../../lib/first-tiny-historical-candle-persistence-approval";
import { buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan } from "../../lib/first-tiny-historical-candle-executable-persistence-dry-run-plan";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import {
  buildMarketDiagnosticsConsoleSummary,
  type MarketDiagnosticsConsoleInput,
} from "../../lib/market-diagnostics-console";

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-candle-persistence-approval.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";

function validEnv(
  overrides: Partial<FirstTinyCandlePersistenceApprovalEnv> = {},
): FirstTinyCandlePersistenceApprovalEnv {
  return {
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED: "true",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_OPERATOR_LABEL: "operator-reviewed",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_REFERENCE: "action-294-test",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_TICKER: "AAPL",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_INTERVAL: "5min",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_TRADING_DAY: "2026-07-08",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_FETCH_RUN_ID: fetchRunId,
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_MAX_ROWS: "73",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_EXPECTED_INSERTS: "73",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_RAW_RESPONSE_PERSIST_ALLOWED: "false",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_REPLAY_ALLOWED: "false",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_SCANNER_EFFECT_ALLOWED: "false",
    ...overrides,
  };
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
      next_action: { label: "Review candle persistence approval" },
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
        qa_checked_source_path:
          "first_tiny_historical_candle_persistence_approval_test",
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

test("runbook documents exact env contract and no-write safety", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("First Tiny Candle Persistence Approval Gate");
  expect(runbook).toContain("TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED");
  expect(runbook).toContain("TURE_FIRST_TINY_CANDLE_PERSISTENCE_MAX_ROWS=73");
  expect(runbook).toContain(
    "TURE_FIRST_TINY_CANDLE_PERSISTENCE_EXPECTED_INSERTS=73",
  );
  expect(runbook).toContain("valid_for_future_candle_persistence");
  expect(runbook).toContain("candle write allowed now: `false`");
  expect(runbook).toContain("First Tiny Candle Persistence Execute Attempt");
  expect(runbook).not.toContain("apikey");
});

test("no signal is not configured but ready to accept a future signal", () => {
  const approval = buildFirstTinyCandlePersistenceApproval({ env: {} });

  expect(approval.approval_status).toBe("not_configured");
  expect(approval.signal.signal_active).toBe(false);
  expect(approval.readiness.ready_to_accept_future_signal).toBe(true);
  expect(approval.readiness.ready_to_propose_candle_persistence_write).toBe(
    false,
  );
  expect(approval.readiness.candle_write_allowed_now).toBe(false);
  expect(approval.safety.candles_persisted).toBe(false);
  expect(approval.safety.raw_response_persisted).toBe(false);
  expect(approval.safety.fetch_run_persisted).toBe(false);
  expect(approval.safety.replay_executed).toBe(false);
  expect(approval.safety.scanner_behavior_changed).toBe(false);
  expect(approval.safety.live_ranking_changed).toBe(false);
});

test("valid signal is proposal-ready but still no-write", () => {
  const approval = buildFirstTinyCandlePersistenceApproval({ env: validEnv() });

  expect(approval.approval_status).toBe(
    "valid_for_future_candle_persistence",
  );
  expect(approval.signal.signal_active).toBe(true);
  expect(approval.readiness.ready_to_propose_candle_persistence_write).toBe(
    true,
  );
  expect(approval.dry_run_snapshot.candidate_candle_rows).toBe(73);
  expect(approval.dry_run_snapshot.timestamp_valid_rows).toBe(73);
  expect(approval.dry_run_snapshot.candle_write_valid_rows).toBe(73);
  expect(approval.dry_run_snapshot.planned_inserts).toBe(73);
  expect(approval.dry_run_snapshot.planned_invalid_rejections).toBe(0);
  expect(approval.readiness.candle_write_allowed_now).toBe(false);
  expect(approval.safety.candle_write_executed).toBe(false);
  expect(approval.safety.candles_persisted).toBe(false);
  expect(approval.safety.raw_response_persisted).toBe(false);
  expect(approval.safety.fetch_run_persisted).toBe(false);
  expect(approval.safety.replay_executed).toBe(false);
  expect(approval.safety.scanner_behavior_changed).toBe(false);
  expect(approval.safety.live_ranking_changed).toBe(false);
});

test("invalid signal reports exact blockers", () => {
  const cases: Array<[Partial<FirstTinyCandlePersistenceApprovalEnv>, string]> = [
    [{ TURE_FIRST_TINY_CANDLE_PERSISTENCE_TICKER: "MSFT" }, "ticker_mismatch"],
    [{ TURE_FIRST_TINY_CANDLE_PERSISTENCE_INTERVAL: "1min" }, "interval_mismatch"],
    [
      { TURE_FIRST_TINY_CANDLE_PERSISTENCE_TRADING_DAY: "2026-07-09" },
      "trading_day_mismatch",
    ],
    [
      { TURE_FIRST_TINY_CANDLE_PERSISTENCE_FETCH_RUN_ID: "wrong" },
      "fetch_run_id_mismatch",
    ],
    [{ TURE_FIRST_TINY_CANDLE_PERSISTENCE_MAX_ROWS: "72" }, "max_rows_not_73"],
    [
      { TURE_FIRST_TINY_CANDLE_PERSISTENCE_EXPECTED_INSERTS: "72" },
      "expected_inserts_mismatch",
    ],
    [
      { TURE_FIRST_TINY_CANDLE_PERSISTENCE_RAW_RESPONSE_PERSIST_ALLOWED: "true" },
      "raw_response_persist_not_allowed",
    ],
    [{ TURE_FIRST_TINY_CANDLE_PERSISTENCE_REPLAY_ALLOWED: "true" }, "replay_not_allowed"],
    [
      { TURE_FIRST_TINY_CANDLE_PERSISTENCE_SCANNER_EFFECT_ALLOWED: "true" },
      "scanner_effect_not_allowed",
    ],
    [
      { TURE_FIRST_TINY_CANDLE_PERSISTENCE_OPERATOR_LABEL: "" },
      "operator_label_missing",
    ],
    [
      { TURE_FIRST_TINY_CANDLE_PERSISTENCE_REFERENCE: "" },
      "approval_reference_missing",
    ],
  ];

  for (const [override, blocker] of cases) {
    const approval = buildFirstTinyCandlePersistenceApproval({
      env: validEnv(override),
    });

    expect(approval.approval_status, blocker).toBe("invalid");
    expect(approval.blockers, blocker).toContain(blocker);
    expect(approval.readiness.candle_write_allowed_now).toBe(false);
    expect(approval.safety.candles_persisted).toBe(false);
  }
});

test("expected inserts can follow an explicit readback-backed dry-run split", () => {
  const basePlan = buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan();
  const readbackPlan = {
    ...basePlan,
    cache_readback: {
      ...basePlan.cache_readback,
      status: "available",
      exact_insert_update_skip_split_available: true,
      warning: null,
    },
    upsert_plan: {
      ...basePlan.upsert_plan,
      planned_inserts: 72,
      planned_skips: 1,
    },
  } as typeof basePlan;
  const approval = buildFirstTinyCandlePersistenceApproval({
    env: validEnv({
      TURE_FIRST_TINY_CANDLE_PERSISTENCE_EXPECTED_INSERTS: "72",
    }),
    dry_run_plan: readbackPlan,
  });

  expect(approval.approval_status).toBe(
    "valid_for_future_candle_persistence",
  );
  expect(approval.expected_contract.expected_inserts).toBe(72);
  expect(approval.dry_run_snapshot.planned_inserts).toBe(72);
  expect(approval.readiness.candle_write_allowed_now).toBe(false);
});

test("source verification and plan version mismatch block approval", () => {
  const basePlan = buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan();
  const sourceMismatch = {
    ...basePlan,
    source_verification: "wrong_source",
  } as unknown as typeof basePlan;
  const versionMismatch = {
    ...basePlan,
    plan_version: "v1",
  } as unknown as typeof basePlan;

  const sourceApproval = buildFirstTinyCandlePersistenceApproval({
    env: validEnv(),
    dry_run_plan: sourceMismatch,
  });
  const versionApproval = buildFirstTinyCandlePersistenceApproval({
    env: validEnv(),
    dry_run_plan: versionMismatch,
  });

  expect(sourceApproval.approval_status).toBe("invalid");
  expect(sourceApproval.blockers).toContain("source_verification_mismatch");
  expect(versionApproval.approval_status).toBe("invalid");
  expect(versionApproval.blockers).toContain("plan_version_mismatch");
  expect(sourceApproval.readiness.candle_write_allowed_now).toBe(false);
  expect(versionApproval.readiness.candle_write_allowed_now).toBe(false);
});

test("diagnostics render approval gate without provider or Supabase write effects", () => {
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
      (item) =>
        item.section_id ===
        "first_tiny_historical_candle_persistence_approval",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe("First Tiny Candle Persistence Approval");
    expect(section?.lines).toContain("Approval status: not_configured");
    expect(section?.lines).toContain("Signal active: no");
    expect(section?.lines).toContain("Expected ticker: AAPL");
    expect(section?.lines).toContain("Expected interval: 5min");
    expect(section?.lines).toContain("Expected trading day: 2026-07-08");
    expect(section?.lines).toContain(`Expected fetch run id: ${fetchRunId}`);
    expect(section?.lines).toContain("Expected max rows: 73");
    expect(section?.lines).toContain("Expected inserts: 73");
    expect(section?.lines).toContain("Plan version: v2_static_ohlcv_payload");
    expect(section?.lines).toContain(
      "Source verification: corrected_first_tiny_ohlcv_payload_static_captured",
    );
    expect(section?.lines).toContain("Candle-write-valid rows: 73");
    expect(section?.lines).toContain("Planned inserts: 73");
    expect(section?.lines).toContain("Planned rejections: 0");
    expect(section?.lines).toContain("Raw response persistence allowed: no");
    expect(section?.lines).toContain("Replay allowed: no");
    expect(section?.lines).toContain("Scanner effect allowed: no");
    expect(section?.lines).toContain("Candle write allowed now: no");
    expect(section?.lines).toContain("Candles persisted: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Fetch run persisted: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Ready to accept future signal: yes");
    expect(section?.lines).toContain(
      "Ready to propose candle persistence write: no",
    );
    expect(section?.metrics.approval_status).toBe("not_configured");
    expect(section?.metrics.ready_to_accept_future_signal).toBe(true);
    expect(section?.metrics.ready_to_propose_candle_persistence_write).toBe(
      false,
    );
    expect(section?.metrics.candle_write_allowed_now).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.recommended_next_steps).toContain(
      "require_separate_action_before_candle_insert",
    );
    expect(intelligence?.lines).toContain(
      "First tiny candle persistence approval: not_configured / execute no / write no",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_persistence_approval",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
