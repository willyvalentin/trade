import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalReplaySignalPackageSelectionApproval,
  firstTinyHistoricalReplaySignalPackageSelectionApprovalMarker,
  type FirstTinySignalPackageSelectionApprovalEnv,
} from "../../lib/first-tiny-historical-replay-signal-package-selection-approval";
import {
  buildFirstTinyHistoricalReplaySignalPackageSelectionPlan,
  type FirstTinySignalPackageSelectionPlanSummary,
} from "../../lib/first-tiny-historical-replay-signal-package-selection-plan";
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
  "docs/first-tiny-historical-replay-signal-package-selection-approval.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";
const candidateId =
  "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
const sourceRowId = "7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
const analysisCutoff = "2026-07-08T13:49:19.521608+00:00";

function validEnv(
  overrides: Partial<FirstTinySignalPackageSelectionApprovalEnv> = {},
): FirstTinySignalPackageSelectionApprovalEnv {
  return {
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED: "true",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_OPERATOR_LABEL:
      "operator-approved",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_REFERENCE:
      "manual-approval-reference",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_CANDIDATE_ID: candidateId,
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_TYPE: "recommendation_row",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_ROW_ID: sourceRowId,
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TICKER: "AAPL",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_INTERVAL: "5min",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TRADING_DAY: "2026-07-08",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ANALYSIS_CUTOFF: analysisCutoff,
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_DIRECTION: "long",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ENTRY: "304.86",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_STOP: "295.62",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TARGET: "334.12",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SYNTHETIC_OUTCOME_PERSIST_ALLOWED:
      "false",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SCANNER_EFFECT_ALLOWED: "false",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_RANKING_EFFECT_ALLOWED: "false",
    ...overrides,
  };
}

function selectionPlan(
  overrides: Partial<FirstTinySignalPackageSelectionPlanSummary> = {},
): FirstTinySignalPackageSelectionPlanSummary {
  return {
    ...buildFirstTinyHistoricalReplaySignalPackageSelectionPlan(),
    ...overrides,
  } as FirstTinySignalPackageSelectionPlanSummary;
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
      next_action: { label: "Review selection approval gate" },
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
        qa_checked_source_path: "signal_package_selection_approval_test",
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

test("no approval signal is not configured and remains safe", () => {
  const approval = buildFirstTinyHistoricalReplaySignalPackageSelectionApproval({
    env: {},
  });

  expect(approval.approval_marker).toBe(
    firstTinyHistoricalReplaySignalPackageSelectionApprovalMarker,
  );
  expect(approval.approval_status).toBe("not_configured");
  expect(approval.signal.source_present).toBe(false);
  expect(approval.signal.signal_active).toBe(false);
  expect(approval.selected_candidate_authorized_now).toBe(false);
  expect(approval.ready_to_accept_future_signal).toBe(true);
  expect(approval.ready_to_propose_replay_with_signal_package).toBe(false);
  expect(approval.replay_allowed_now).toBe(false);
  expect(approval.synthetic_outcome_persistence_allowed_now).toBe(false);
  expect(approval.scanner_use_allowed_now).toBe(false);
  expect(approval.ranking_change_allowed_now).toBe(false);
  expect(approval.provider_call_executed).toBe(false);
  expect(approval.provider_call_attempted).toBe(false);
  expect(approval.supabase_read_executed).toBe(false);
  expect(approval.supabase_write_executed).toBe(false);
  expect(approval.replay_executed).toBe(false);
  expect(approval.synthetic_outcomes_persisted).toBe(false);
  expect(approval.scanner_behavior_changed).toBe(false);
  expect(approval.live_ranking_changed).toBe(false);
});

test("valid approval signal authorizes only a future replay proposal", () => {
  const approval = buildFirstTinyHistoricalReplaySignalPackageSelectionApproval({
    env: validEnv(),
  });

  expect(approval.approval_status).toBe(
    "valid_for_future_replay_with_signal_package",
  );
  expect(approval.signal.source_type).toBe("server_env");
  expect(approval.signal.signal_active).toBe(true);
  expect(approval.selected_candidate_authorized_now).toBe(true);
  expect(approval.ready_to_propose_replay_with_signal_package).toBe(true);
  expect(approval.replay_allowed_now).toBe(false);
  expect(approval.synthetic_outcome_persistence_allowed_now).toBe(false);
  expect(approval.scanner_use_allowed_now).toBe(false);
  expect(approval.ranking_change_allowed_now).toBe(false);
  expect(approval.provider_call_executed).toBe(false);
  expect(approval.provider_call_attempted).toBe(false);
  expect(approval.supabase_read_executed).toBe(false);
  expect(approval.supabase_write_executed).toBe(false);
  expect(approval.replay_executed).toBe(false);
  expect(approval.synthetic_outcomes_persisted).toBe(false);
  expect(approval.scanner_behavior_changed).toBe(false);
  expect(approval.live_ranking_changed).toBe(false);
  expect(approval.warnings).toContain("valid_signal_does_not_execute_replay");
});

test.describe("invalid approval signals expose exact blockers", () => {
  const cases: Array<{
    name: string;
    env: Partial<FirstTinySignalPackageSelectionApprovalEnv>;
    blocker: string;
  }> = [
    {
      name: "wrong candidate",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_CANDIDATE_ID: "other" },
      blocker: "candidate_id_mismatch",
    },
    {
      name: "wrong source type",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_TYPE: "snapshot" },
      blocker: "source_type_mismatch",
    },
    {
      name: "wrong source row",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SOURCE_ROW_ID: "other" },
      blocker: "source_row_id_mismatch",
    },
    {
      name: "wrong ticker",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TICKER: "MSFT" },
      blocker: "ticker_mismatch",
    },
    {
      name: "wrong interval",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_INTERVAL: "1min" },
      blocker: "interval_mismatch",
    },
    {
      name: "wrong trading day",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TRADING_DAY: "2026-07-09" },
      blocker: "trading_day_mismatch",
    },
    {
      name: "wrong analysis cutoff",
      env: {
        TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ANALYSIS_CUTOFF:
          "2026-07-08T14:00:00.000Z",
      },
      blocker: "analysis_cutoff_mismatch",
    },
    {
      name: "wrong direction",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_DIRECTION: "short" },
      blocker: "direction_mismatch",
    },
    {
      name: "wrong entry",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_ENTRY: "304.87" },
      blocker: "entry_mismatch",
    },
    {
      name: "wrong stop",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_STOP: "295.63" },
      blocker: "stop_mismatch",
    },
    {
      name: "wrong target",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TARGET: "334.13" },
      blocker: "target_mismatch",
    },
    {
      name: "synthetic persistence allowed",
      env: {
        TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SYNTHETIC_OUTCOME_PERSIST_ALLOWED:
          "true",
      },
      blocker: "synthetic_outcome_persist_not_false",
    },
    {
      name: "scanner effect allowed",
      env: {
        TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_SCANNER_EFFECT_ALLOWED: "true",
      },
      blocker: "scanner_effect_not_false",
    },
    {
      name: "ranking effect allowed",
      env: {
        TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_RANKING_EFFECT_ALLOWED: "true",
      },
      blocker: "ranking_effect_not_false",
    },
    {
      name: "missing operator label",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_OPERATOR_LABEL: "" },
      blocker: "missing_operator_label",
    },
    {
      name: "missing reference",
      env: { TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_REFERENCE: "" },
      blocker: "missing_reference",
    },
  ];

  for (const item of cases) {
    test(item.name, () => {
      const approval =
        buildFirstTinyHistoricalReplaySignalPackageSelectionApproval({
          env: validEnv(item.env),
        });

      expect(approval.approval_status).toBe("invalid");
      expect(approval.selected_candidate_authorized_now).toBe(false);
      expect(approval.ready_to_propose_replay_with_signal_package).toBe(false);
      expect(approval.blockers).toContain(item.blocker);
      expect(approval.replay_allowed_now).toBe(false);
      expect(approval.synthetic_outcome_persistence_allowed_now).toBe(false);
      expect(approval.scanner_use_allowed_now).toBe(false);
      expect(approval.ranking_change_allowed_now).toBe(false);
    });
  }
});

test("source verification mismatch blocks approval", () => {
  const approval = buildFirstTinyHistoricalReplaySignalPackageSelectionApproval({
    env: validEnv(),
    selection_plan: selectionPlan({
      source_verification: "wrong_source",
    } as unknown as Partial<FirstTinySignalPackageSelectionPlanSummary>),
  });

  expect(approval.approval_status).toBe("invalid");
  expect(approval.blockers).toContain("source_verification_mismatch");
  expect(approval.blockers).toContain("selection_plan_not_ready");
  expect(approval.selected_candidate_authorized_now).toBe(false);
  expect(approval.replay_allowed_now).toBe(false);
});

test("artifact documents approval contract and future execution boundary", () => {
  const artifact = readFileSync(artifactPath, "utf8");

  expect(artifact).toContain(
    "First Tiny Historical Replay Signal Package Selection Approval Gate",
  );
  expect(artifact).toContain(
    "TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED",
  );
  expect(artifact).toContain(candidateId);
  expect(artifact).toContain(sourceRowId);
  expect(artifact).toContain(analysisCutoff);
  expect(artifact).toContain("valid_for_future_replay_with_signal_package");
  expect(artifact).toContain(
    "First Tiny Replay With Signal Package Dry-Run Execute Attempt",
  );
  expect(artifact).toContain("replay_executed");
  expect(artifact).toContain("synthetic_outcomes_persisted");
  expect(artifact).toContain("scanner_behavior_changed");
  expect(artifact).toContain("live_ranking_changed");
});

test("diagnostics render approval gate without provider Supabase or replay effects", () => {
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
      (entry) =>
        entry.section_id === "first_tiny_signal_package_selection_approval",
    );
    const intelligenceOverview = diagnostics.sections.find(
      (entry) => entry.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe("First Tiny Signal Package Selection Approval");
    expect(section?.lines).toContain("Approval status: not_configured");
    expect(section?.lines).toContain("Signal active: no");
    expect(section?.lines).toContain(`Recommended candidate id: ${candidateId}`);
    expect(section?.lines).toContain("Source type: recommendation_row");
    expect(section?.lines).toContain(`Source row id: ${sourceRowId}`);
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(`Analysis cutoff: ${analysisCutoff}`);
    expect(section?.lines).toContain("Direction: long");
    expect(section?.lines).toContain("Entry: 304.86");
    expect(section?.lines).toContain("Stop: 295.62");
    expect(section?.lines).toContain("Target: 334.12");
    expect(section?.lines).toContain("Selected candidate authorized now: no");
    expect(section?.lines).toContain("Ready to accept future signal: yes");
    expect(section?.lines).toContain(
      "Ready to propose replay with signal package: no",
    );
    expect(section?.lines).toContain("Replay allowed now: no");
    expect(section?.lines).toContain(
      "Synthetic outcome persistence allowed: no",
    );
    expect(section?.lines).toContain("Scanner use allowed: no");
    expect(section?.lines).toContain("Ranking change allowed: no");
    expect(section?.metrics.approval_status).toBe("not_configured");
    expect(section?.metrics.signal_active).toBe(false);
    expect(section?.metrics.recommended_candidate_id).toBe(candidateId);
    expect(section?.metrics.selected_candidate_authorized_now).toBe(false);
    expect(section?.metrics.ready_to_accept_future_signal).toBe(true);
    expect(section?.metrics.ready_to_propose_replay_with_signal_package).toBe(
      false,
    );
    expect(section?.metrics.replay_allowed_now).toBe(false);
    expect(section?.metrics.synthetic_outcome_persistence_allowed_now).toBe(
      false,
    );
    expect(section?.metrics.scanner_use_allowed_now).toBe(false);
    expect(section?.metrics.ranking_change_allowed_now).toBe(false);
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.provider_call_attempted).toBe(false);
    expect(section?.metrics.supabase_read_executed).toBe(false);
    expect(section?.metrics.supabase_write_executed).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.synthetic_outcomes_persisted).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_signal_package_selection_approval",
    );
    expect(intelligenceOverview?.lines).toContain(
      "First tiny signal package selection approval: not_configured / candidate authorized no / replay no",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
