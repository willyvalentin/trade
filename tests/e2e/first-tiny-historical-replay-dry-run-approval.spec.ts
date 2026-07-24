import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalReplayDryRunApproval,
  firstTinyHistoricalReplayDryRunApprovalMarker,
  type FirstTinyHistoricalReplayDryRunApprovalEnv,
} from "../../lib/first-tiny-historical-replay-dry-run-approval";
import {
  buildFirstTinyHistoricalReplayDryRunPlan,
  type FirstTinyHistoricalReplayDryRunPlanSummary,
} from "../../lib/first-tiny-historical-replay-dry-run-plan";
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
  "docs/first-tiny-historical-replay-dry-run-approval.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";

function validEnv(
  overrides: Partial<FirstTinyHistoricalReplayDryRunApprovalEnv> = {},
): FirstTinyHistoricalReplayDryRunApprovalEnv {
  return {
    TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED: "true",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_OPERATOR_LABEL: "operator-reviewed",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_REFERENCE: "action-299-test",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_TICKER: "AAPL",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_TRADING_DAY: "2026-07-08",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_INTERVAL: "5min",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_FETCH_RUN_ID: fetchRunId,
    TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_TICKERS: "1",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_DAYS: "1",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_SYNTHETIC_OUTCOME_PERSIST_ALLOWED: "false",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_SCANNER_EFFECT_ALLOWED: "false",
    TURE_FIRST_TINY_REPLAY_DRY_RUN_RANKING_EFFECT_ALLOWED: "false",
    ...overrides,
  };
}

function replayPlan(
  overrides: Partial<Record<keyof FirstTinyHistoricalReplayDryRunPlanSummary, unknown>> = {},
) {
  return {
    ...buildFirstTinyHistoricalReplayDryRunPlan(),
    ...overrides,
  } as unknown as FirstTinyHistoricalReplayDryRunPlanSummary;
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
      next_action: { label: "Review replay dry-run approval" },
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
          "first_tiny_historical_replay_approval_test",
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

function withEnv<T>(
  env: FirstTinyHistoricalReplayDryRunApprovalEnv,
  callback: () => T,
) {
  const previous = Object.fromEntries(
    Object.keys(validEnv()).map((key) => [key, process.env[key]]),
  );

  for (const key of Object.keys(validEnv())) {
    if (env[key] === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = env[key];
    }
  }

  try {
    return callback();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) {
        delete process.env[key];
      } else {
        process.env[key] = value;
      }
    }
  }
}

test("no signal is not configured but ready to accept a future signal", () => {
  const approval = buildFirstTinyHistoricalReplayDryRunApproval({ env: {} });

  expect(approval.approval_marker).toBe(
    firstTinyHistoricalReplayDryRunApprovalMarker,
  );
  expect(approval.approval_status).toBe("not_configured");
  expect(approval.signal.signal_active).toBe(false);
  expect(approval.signal.source_present).toBe(false);
  expect(approval.ready_to_accept_future_signal).toBe(true);
  expect(approval.ready_to_propose_replay_dry_run_action).toBe(false);
  expect(approval.replay_allowed_now).toBe(false);
  expect(approval.synthetic_outcome_persistence_allowed_now).toBe(false);
  expect(approval.scanner_use_allowed_now).toBe(false);
  expect(approval.ranking_change_allowed_now).toBe(false);
  expect(approval.safety.provider_call_executed).toBe(false);
  expect(approval.safety.synthetic_outcomes_persisted).toBe(false);
  expect(approval.safety.replay_executed).toBe(false);
  expect(approval.safety.scanner_behavior_changed).toBe(false);
  expect(approval.safety.live_ranking_changed).toBe(false);
});

test("valid signal is proposal-ready but still does not execute replay", () => {
  const approval = buildFirstTinyHistoricalReplayDryRunApproval({
    env: validEnv(),
  });

  expect(approval.approval_status).toBe("valid_for_future_replay_dry_run");
  expect(approval.signal.signal_active).toBe(true);
  expect(approval.signal.operator_label_present).toBe(true);
  expect(approval.signal.reference_present).toBe(true);
  expect(approval.source_verification).toBe(
    "first_tiny_historical_candle_persistence_verified",
  );
  expect(approval.ticker).toBe("AAPL");
  expect(approval.interval).toBe("5min");
  expect(approval.trading_day).toBe("2026-07-08");
  expect(approval.fetch_run_id).toBe(fetchRunId);
  expect(approval.candle_rows_verified).toBe(73);
  expect(approval.max_tickers).toBe(1);
  expect(approval.max_days).toBe(1);
  expect(approval.lookahead_safety_present).toBe(true);
  expect(approval.ready_to_accept_future_signal).toBe(true);
  expect(approval.ready_to_propose_replay_dry_run_action).toBe(true);
  expect(approval.replay_allowed_now).toBe(false);
  expect(approval.synthetic_outcome_persistence_allowed_now).toBe(false);
  expect(approval.scanner_use_allowed_now).toBe(false);
  expect(approval.ranking_change_allowed_now).toBe(false);
  expect(approval.safety.synthetic_outcomes_persisted).toBe(false);
  expect(approval.safety.replay_executed).toBe(false);
  expect(approval.safety.scanner_behavior_changed).toBe(false);
  expect(approval.safety.live_ranking_changed).toBe(false);
  expect(approval.warnings).toContain(
    "valid_signal_requires_separate_execute_action",
  );
});

const invalidSignalCases: Array<{
  name: string;
  env: Partial<FirstTinyHistoricalReplayDryRunApprovalEnv>;
  blocker: string;
}> = [
  {
    name: "wrong ticker",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_TICKER: "MSFT" },
    blocker: "ticker_mismatch",
  },
  {
    name: "wrong trading day",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_TRADING_DAY: "2026-07-09" },
    blocker: "trading_day_mismatch",
  },
  {
    name: "wrong interval",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_INTERVAL: "1min" },
    blocker: "interval_mismatch",
  },
  {
    name: "wrong fetch run id",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_FETCH_RUN_ID: "wrong" },
    blocker: "fetch_run_id_mismatch",
  },
  {
    name: "max tickers not 1",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_TICKERS: "2" },
    blocker: "max_tickers_not_1",
  },
  {
    name: "max days not 1",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_MAX_DAYS: "2" },
    blocker: "max_days_not_1",
  },
  {
    name: "synthetic outcome persist true",
    env: {
      TURE_FIRST_TINY_REPLAY_DRY_RUN_SYNTHETIC_OUTCOME_PERSIST_ALLOWED: "true",
    },
    blocker: "synthetic_outcome_persist_not_false",
  },
  {
    name: "scanner effect true",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_SCANNER_EFFECT_ALLOWED: "true" },
    blocker: "scanner_effect_not_false",
  },
  {
    name: "ranking effect true",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_RANKING_EFFECT_ALLOWED: "true" },
    blocker: "ranking_effect_not_false",
  },
  {
    name: "missing operator label",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_OPERATOR_LABEL: "" },
    blocker: "missing_operator_label",
  },
  {
    name: "missing reference",
    env: { TURE_FIRST_TINY_REPLAY_DRY_RUN_REFERENCE: "" },
    blocker: "missing_reference",
  },
];

for (const item of invalidSignalCases) {
  test(`invalid signal blocks: ${item.name}`, () => {
    const approval = buildFirstTinyHistoricalReplayDryRunApproval({
      env: validEnv(item.env),
    });

    expect(approval.approval_status).toBe("invalid");
    expect(approval.blockers).toContain(item.blocker);
    expect(approval.ready_to_propose_replay_dry_run_action).toBe(false);
    expect(approval.replay_allowed_now).toBe(false);
    expect(approval.synthetic_outcome_persistence_allowed_now).toBe(false);
    expect(approval.scanner_use_allowed_now).toBe(false);
    expect(approval.ranking_change_allowed_now).toBe(false);
    expect(approval.safety.replay_executed).toBe(false);
  });
}

test("plan source verification mismatch blocks approval", () => {
  const approval = buildFirstTinyHistoricalReplayDryRunApproval({
    env: validEnv(),
    replay_plan: replayPlan({
      source_verification: "wrong_source",
    }),
  });

  expect(approval.approval_status).toBe("invalid");
  expect(approval.blockers).toContain("source_verification_mismatch");
  expect(approval.ready_to_accept_future_signal).toBe(false);
  expect(approval.ready_to_propose_replay_dry_run_action).toBe(false);
});

test("candle rows not 73 blocks approval", () => {
  const approval = buildFirstTinyHistoricalReplayDryRunApproval({
    env: validEnv(),
    replay_plan: replayPlan({
      candle_rows_verified: 72,
    }),
  });

  expect(approval.approval_status).toBe("invalid");
  expect(approval.blockers).toContain("candle_rows_verified_not_73");
  expect(approval.ready_to_accept_future_signal).toBe(false);
  expect(approval.ready_to_propose_replay_dry_run_action).toBe(false);
});

test("durable artifact documents approval contract and safety", () => {
  const artifact = readFileSync(artifactPath, "utf8");

  expect(artifact).toContain("First Tiny Historical Replay Dry-Run Approval Gate");
  expect(artifact).toContain("TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED=true");
  expect(artifact).toContain("TURE_FIRST_TINY_REPLAY_DRY_RUN_TICKER=AAPL");
  expect(artifact).toContain(
    "TURE_FIRST_TINY_REPLAY_DRY_RUN_TRADING_DAY=2026-07-08",
  );
  expect(artifact).toContain("TURE_FIRST_TINY_REPLAY_DRY_RUN_INTERVAL=5min");
  expect(artifact).toContain(fetchRunId);
  expect(artifact).toContain("valid_for_future_replay_dry_run");
  expect(artifact).toContain("First Tiny Replay Dry-Run Execute Attempt");
  expect(artifact).toContain("No future candles visible before cutoff");
  expect(artifact).toContain("Persist synthetic outcomes");
});

test("diagnostics render approval without provider writes or replay", () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("unexpected provider call");
  }) as typeof fetch;

  try {
    const diagnostics = withEnv(validEnv(), () =>
      buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput()),
    );
    const section = diagnostics.sections.find(
      (entry) =>
        entry.section_id === "first_tiny_historical_replay_dry_run_approval",
    );
    const intelligenceOverview = diagnostics.sections.find(
      (entry) => entry.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe("First Tiny Replay Dry-Run Approval");
    expect(section?.lines).toContain(
      "Approval status: valid_for_future_replay_dry_run",
    );
    expect(section?.lines).toContain("Signal active: yes");
    expect(section?.lines).toContain(
      "Source verification: first_tiny_historical_candle_persistence_verified",
    );
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(`Fetch run id: ${fetchRunId}`);
    expect(section?.lines).toContain("Candle rows verified: 73");
    expect(section?.lines).toContain("Max tickers: 1");
    expect(section?.lines).toContain("Max days: 1");
    expect(section?.lines).toContain("Lookahead safety present: yes");
    expect(section?.lines).toContain("Replay allowed now: no");
    expect(section?.lines).toContain("Synthetic outcome persistence allowed: no");
    expect(section?.lines).toContain("Scanner use allowed: no");
    expect(section?.lines).toContain("Ranking change allowed: no");
    expect(section?.lines).toContain("Ready to accept future signal: yes");
    expect(section?.lines).toContain(
      "Ready to propose replay dry-run action: yes",
    );
    expect(section?.metrics.approval_status).toBe(
      "valid_for_future_replay_dry_run",
    );
    expect(section?.metrics.replay_allowed_now).toBe(false);
    expect(section?.metrics.synthetic_outcome_persistence_allowed_now).toBe(
      false,
    );
    expect(section?.metrics.scanner_use_allowed_now).toBe(false);
    expect(section?.metrics.ranking_change_allowed_now).toBe(false);
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.synthetic_outcomes_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_replay_dry_run_approval",
    );
    expect(intelligenceOverview?.lines).toContain(
      "First tiny replay approval: valid_for_future_replay_dry_run / replay no / scanner no / ranking no",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
