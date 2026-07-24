import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

import { GET as pingGET } from "../../app/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping/route";
import { POST as executePOST } from "../../app/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/route";
import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildFirstTinyCorrectedOhlcvPayloadStaticCapture } from "../../lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import {
  executeFirstTinyReplayWithSignalPackageDryRun,
  firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
  simulateFirstTinyReplayWithSignalPackage,
  type FirstTinyReplayWithSignalPackageCandle,
} from "../../lib/first-tiny-historical-replay-with-signal-package-dry-run-execute";
import type { FirstTinySignalPackageSelectionApprovalEnv } from "../../lib/first-tiny-historical-replay-signal-package-selection-approval";
import {
  buildFirstTinyHistoricalReplaySignalPackageSelectionApproval,
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
import { proxy } from "../../proxy";

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-replay-with-signal-package-dry-run-execute-attempt.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";
const candidateId =
  "recommendation_row:7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
const sourceRowId = "7dd59e66-7e54-4d35-92f9-5cc1ae11c557";
const analysisCutoff = "2026-07-08T13:49:19.521608+00:00";

type CandleRow = Record<string, unknown>;

class ReadOnlyMockSupabase {
  writeAttempted = false;

  constructor(readonly rows: CandleRow[]) {}

  from(table: string) {
    return new ReadOnlyMockQuery(this, table);
  }
}

class ReadOnlyMockQuery {
  private filters: Array<[string, unknown]> = [];
  private gteFilters: Array<[string, string]> = [];
  private lteFilters: Array<[string, string]> = [];

  constructor(
    private readonly supabase: ReadOnlyMockSupabase,
    readonly table: string,
  ) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push([column, value]);
    return this;
  }

  gte(column: string, value: string) {
    this.gteFilters.push([column, value]);
    return this;
  }

  lte(column: string, value: string) {
    this.lteFilters.push([column, value]);
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  insert() {
    this.supabase.writeAttempted = true;
    throw new Error("unexpected_insert");
  }

  upsert() {
    this.supabase.writeAttempted = true;
    throw new Error("unexpected_upsert");
  }

  then<TResult1 = { data: CandleRow[]; error: null }, TResult2 = never>(
    onfulfilled?:
      | ((
          value: { data: CandleRow[]; error: null },
        ) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve({ data: this.filteredRows(), error: null }).then(
      onfulfilled,
      onrejected,
    );
  }

  private filteredRows() {
    return this.supabase.rows
      .filter((row) =>
        this.filters.every(([column, value]) => row[column] === value),
      )
      .filter((row) =>
        this.gteFilters.every(
          ([column, value]) =>
            new Date(String(row[column])).getTime() >= new Date(value).getTime(),
        ),
      )
      .filter((row) =>
        this.lteFilters.every(
          ([column, value]) =>
            new Date(String(row[column])).getTime() <= new Date(value).getTime(),
        ),
      )
      .sort((left, right) =>
        String(left.timestamp).localeCompare(String(right.timestamp)),
      );
  }
}

function persistedRows(): CandleRow[] {
  return buildFirstTinyCorrectedOhlcvPayloadStaticCapture().rows.map((row) => ({
    provider: row.provider,
    ticker: row.ticker,
    interval: row.interval,
    timestamp: row.timestamp,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    volume: row.volume,
    adjusted: row.adjusted,
    trading_day: row.trading_day,
    session: row.session,
    timezone: row.timezone,
    fetch_run_id: row.fetch_run_id,
  }));
}

function validEnv(
  overrides: Partial<FirstTinySignalPackageSelectionApprovalEnv> = {},
): FirstTinySignalPackageSelectionApprovalEnv {
  return {
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED: "true",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_OPERATOR_LABEL:
      "operator-reviewed",
    TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_REFERENCE: "action-307-test",
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

async function routePost(input: {
  secret?: string | null;
  body?: unknown;
  env?: Record<string, string | undefined>;
}) {
  const keys = [
    "AUTOMATION_SECRET",
    ...Object.keys(validEnv()),
    "TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED",
    "TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED",
  ];
  const previous = Object.fromEntries(
    keys.map((key) => [key, process.env[key]]),
  );
  process.env.AUTOMATION_SECRET = input.env?.AUTOMATION_SECRET ?? "route-secret";
  for (const [key, value] of Object.entries(input.env ?? {})) {
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
  const headers = new Headers({ "content-type": "application/json" });
  if (input.secret !== undefined && input.secret !== null) {
    headers.set("x-automation-secret", input.secret);
  }

  try {
    return await executePOST(
      new Request(
        "http://localhost/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
        {
          method: "POST",
          headers,
          body: JSON.stringify(input.body ?? {}),
        },
      ),
    );
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
      next_action: { label: "Review signal package replay execute" },
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
        qa_checked_source_path: "signal_package_replay_execute_test",
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

function scenarioCandle(
  timestamp: string,
  high: number,
  low: number,
  close = high,
): FirstTinyReplayWithSignalPackageCandle {
  return {
    timestamp,
    open: close,
    high,
    low,
    close,
  };
}

test("runbook documents execute curl approval contract and safety", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain(
    "First Tiny Replay With Signal Package Dry-Run Execute Attempt",
  );
  expect(runbook).toContain(
    "first-tiny-replay-with-signal-package-dry-run/ping",
  );
  expect(runbook).toContain(
    '"execute_replay_with_signal_package_dry_run":true',
  );
  expect(runbook).toContain("TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_APPROVED");
  expect(runbook).toContain(candidateId);
  expect(runbook).toContain("not_approved");
  expect(runbook).toContain("replay_with_signal_package_completed");
  expect(runbook).toContain("blocked_missing_candles");
  expect(runbook).toContain("blocked_candle_verification_failed");
  expect(runbook).toContain("ambiguous_intrabar_conservative_stop");
  expect(runbook).toContain("No Twelve Data provider call");
  expect(runbook).toContain("disable the signal package selection approval env");
  expect(runbook).toContain("replay-with-signal-package result verification");
});

test("ping reachable and safe", async () => {
  const response = await pingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expect(body.route_build_marker).toBe(
    firstTinyReplayWithSignalPackageDryRunExecuteBuildMarker,
  );
  expect(body.provider_call_executed).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.synthetic_outcomes_persisted).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
  expect(body.recommendation_rows_mutated).toBe(false);
  expect(body.supabase_write_executed).toBe(false);
});

test("route auth and body guards are safe", async () => {
  const missingAuth = await routePost({
    secret: null,
    body: { execute_replay_with_signal_package_dry_run: true },
  });
  const authCheck = await routePost({
    secret: "route-secret",
    body: { auth_check_only: true },
  });
  const missingFlag = await routePost({ secret: "route-secret", body: {} });
  const rejectedOverride = await routePost({
    secret: "route-secret",
    body: {
      execute_replay_with_signal_package_dry_run: true,
      candidate_id: candidateId,
    },
  });
  const rejectedSynthetic = await routePost({
    secret: "route-secret",
    body: {
      execute_replay_with_signal_package_dry_run: true,
      persist_synthetic_outcomes: true,
    },
  });

  expect(missingAuth.status).toBe(401);
  expect(await missingAuth.json()).toMatchObject({
    replay_executed: false,
    synthetic_outcomes_persisted: false,
    scanner_behavior_changed: false,
    recommendation_rows_mutated: false,
  });
  expect(authCheck.status).toBe(200);
  expect(await authCheck.json()).toMatchObject({
    ok: true,
    auth_check_only: true,
    replay_executed: false,
  });
  expect(missingFlag.status).toBe(400);
  expect(await missingFlag.json()).toMatchObject({
    error: "execute_replay_with_signal_package_dry_run_true_required",
    replay_executed: false,
  });
  expect(rejectedOverride.status).toBe(400);
  expect(await rejectedOverride.json()).toMatchObject({
    error: "arbitrary_scope_candidate_or_effect_override_rejected",
    replay_executed: false,
  });
  expect(rejectedSynthetic.status).toBe(400);
  expect(await rejectedSynthetic.json()).toMatchObject({
    error: "arbitrary_scope_candidate_or_effect_override_rejected",
    synthetic_outcomes_persisted: false,
  });
});

test("no approval signal returns not approved", async () => {
  const response = await routePost({
    secret: "route-secret",
    body: { execute_replay_with_signal_package_dry_run: true },
    env: Object.fromEntries(
      Object.keys(validEnv()).map((key) => [key, undefined]),
    ),
  });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.execution_status).toBe("not_approved");
  expect(body.replay_executed).toBe(false);
  expect(body.synthetic_outcomes_persisted).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
});

test("old approval signals do not authorize signal-package replay", async () => {
  const response = await routePost({
    secret: "route-secret",
    body: { execute_replay_with_signal_package_dry_run: true },
    env: {
      TURE_FIRST_TINY_REPLAY_DRY_RUN_APPROVED: "true",
      TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED: "true",
    },
  });
  const body = await response.json();

  expect(body.execution_status).toBe("not_approved");
  expect(body.approval_status).toBe("not_configured");
  expect(body.replay_executed).toBe(false);
});

test("valid selection approval authorizes exactly one mocked read-only replay", async () => {
  const supabase = new ReadOnlyMockSupabase(persistedRows());
  const result = await executeFirstTinyReplayWithSignalPackageDryRun({
    execute_replay_with_signal_package_dry_run: true,
    env: validEnv(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe("replay_with_signal_package_completed");
  expect(result.replay_outcome_status).toBe("open_at_window_end");
  expect(result.replay_executed).toBe(true);
  expect(result.counterfactual_result_available).toBe(true);
  expect(result.candles_read).toBe(73);
  expect(result.candles_verified).toBe(73);
  expect(result.entry_touched).toBe(true);
  expect(result.stop_touched).toBe(false);
  expect(result.target_touched).toBe(false);
  expect(result.planned_entry).toBe(304.86);
  expect(result.planned_stop).toBe(295.62);
  expect(result.planned_target).toBe(334.12);
  expect(result.lookahead_safety_passed).toBe(true);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(result.scanner_behavior_changed).toBe(false);
  expect(result.live_ranking_changed).toBe(false);
  expect(result.recommendation_rows_mutated).toBe(false);
  expect(result.supabase_write_executed).toBe(false);
  expect(result.provider_call_executed).toBe(false);
  expect(supabase.writeAttempted).toBe(false);
});

test("wrong Action 306 candidate value blocks before Supabase read", async () => {
  const result = await executeFirstTinyReplayWithSignalPackageDryRun({
    execute_replay_with_signal_package_dry_run: true,
    env: validEnv({
      TURE_FIRST_TINY_SIGNAL_PACKAGE_SELECTION_TARGET: "334.13",
    }),
    supabase_client: new ReadOnlyMockSupabase(persistedRows()),
  });

  expect(result.execution_status).toBe("not_approved");
  expect(result.blockers).toContain("target_mismatch");
  expect(result.supabase_read_executed).toBe(false);
  expect(result.replay_executed).toBe(false);
});

test("signal package validation mismatch blocks explicitly", async () => {
  const validPlan = buildFirstTinyHistoricalReplaySignalPackageSelectionPlan();
  const validApproval =
    buildFirstTinyHistoricalReplaySignalPackageSelectionApproval({
      env: validEnv(),
      selection_plan: validPlan,
    });
  const mismatchedPlan = {
    ...validPlan,
    recommended_candidate: {
      ...validPlan.recommended_candidate,
      target: 334.13,
    },
  } as unknown as FirstTinySignalPackageSelectionPlanSummary;
  const result = await executeFirstTinyReplayWithSignalPackageDryRun({
    execute_replay_with_signal_package_dry_run: true,
    selection_plan: mismatchedPlan,
    selection_approval: validApproval,
    supabase_client: new ReadOnlyMockSupabase(persistedRows()),
  });

  expect(result.execution_status).toBe(
    "blocked_signal_package_validation_failed",
  );
  expect(result.blockers).toContain("target_mismatch");
  expect(result.supabase_read_executed).toBe(false);
  expect(result.replay_executed).toBe(false);
});

test("missing candles block without writes", async () => {
  const supabase = new ReadOnlyMockSupabase([]);
  const result = await executeFirstTinyReplayWithSignalPackageDryRun({
    execute_replay_with_signal_package_dry_run: true,
    env: validEnv(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe("blocked_missing_candles");
  expect(result.candles_read).toBe(0);
  expect(result.replay_executed).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(supabase.writeAttempted).toBe(false);
});

test("candle verification mismatch blocks without replay", async () => {
  const rows = persistedRows();
  rows[10] = { ...rows[10], high: 999 };
  const supabase = new ReadOnlyMockSupabase(rows);
  const result = await executeFirstTinyReplayWithSignalPackageDryRun({
    execute_replay_with_signal_package_dry_run: true,
    env: validEnv(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe("blocked_candle_verification_failed");
  expect(result.replay_executed).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(supabase.writeAttempted).toBe(false);
});

test("simulation handles no entry triggered", () => {
  const result = simulateFirstTinyReplayWithSignalPackage([
    scenarioCandle("2026-07-08T13:50:00.000Z", 304, 300, 303),
  ]);

  expect(result.replay_outcome_status).toBe("no_entry_triggered");
  expect(result.entry_touched).toBe(false);
  expect(result.counterfactual_result_available).toBe(true);
});

test("simulation handles target hit", () => {
  const result = simulateFirstTinyReplayWithSignalPackage([
    scenarioCandle("2026-07-08T13:50:00.000Z", 305, 304, 305),
    scenarioCandle("2026-07-08T13:55:00.000Z", 335, 310, 334.12),
  ]);

  expect(result.replay_outcome_status).toBe("target_hit");
  expect(result.entry_touched).toBe(true);
  expect(result.target_touched).toBe(true);
  expect(result.stop_touched).toBe(false);
  expect(result.exit_reason).toBe("target_hit");
});

test("simulation handles stop hit", () => {
  const result = simulateFirstTinyReplayWithSignalPackage([
    scenarioCandle("2026-07-08T13:50:00.000Z", 305, 304, 305),
    scenarioCandle("2026-07-08T13:55:00.000Z", 306, 295, 296),
  ]);

  expect(result.replay_outcome_status).toBe("stop_hit");
  expect(result.entry_touched).toBe(true);
  expect(result.stop_touched).toBe(true);
  expect(result.target_touched).toBe(false);
  expect(result.gross_r_multiple).toBe(-1);
});

test("simulation handles open at window end", () => {
  const result = simulateFirstTinyReplayWithSignalPackage([
    scenarioCandle("2026-07-08T13:50:00.000Z", 305, 304, 305),
    scenarioCandle("2026-07-08T13:55:00.000Z", 310, 306, 309),
  ]);

  expect(result.replay_outcome_status).toBe("open_at_window_end");
  expect(result.entry_touched).toBe(true);
  expect(result.exit_reason).toBe("window_end_mark_to_close");
});

test("same-candle ambiguity uses conservative stop handling", () => {
  const result = simulateFirstTinyReplayWithSignalPackage([
    scenarioCandle("2026-07-08T13:50:00.000Z", 335, 295, 300),
  ]);

  expect(result.replay_outcome_status).toBe(
    "ambiguous_intrabar_conservative_stop",
  );
  expect(result.entry_touched).toBe(true);
  expect(result.stop_touched).toBe(true);
  expect(result.target_touched).toBe(true);
  expect(result.gross_r_multiple).toBe(-1);
});

test("diagnostics rendering does not execute replay", () => {
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
        entry.section_id ===
        "first_tiny_replay_with_signal_package_dry_run_execute",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe(
      "First Tiny Replay With Signal Package Dry-Run Execute",
    );
    expect(section?.lines).toContain("Status: not_approved");
    expect(section?.lines).toContain(`Selected candidate id: ${candidateId}`);
    expect(section?.lines).toContain(`Source row id: ${sourceRowId}`);
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(`Analysis cutoff: ${analysisCutoff}`);
    expect(section?.lines).toContain("Direction: long");
    expect(section?.lines).toContain("Entry: 304.86");
    expect(section?.lines).toContain("Stop: 295.62");
    expect(section?.lines).toContain("Target: 334.12");
    expect(section?.lines).toContain("Candles read: 0/73");
    expect(section?.lines).toContain("Candles verified: 0/73");
    expect(section?.lines).toContain("Counterfactual result available: no");
    expect(section?.lines).toContain("Replay outcome status: pending");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Synthetic outcomes persisted: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Live ranking changed: no");
    expect(section?.lines).toContain("Recommendation rows mutated: no");
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.synthetic_outcomes_persisted).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.recommendation_rows_mutated).toBe(false);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_replay_with_signal_package_dry_run_execute",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("proxy allows signal package replay route and ping to reach handlers", async () => {
  const previous = process.env.TRADE_APP_PASSWORD;
  process.env.TRADE_APP_PASSWORD = "trade-password";

  try {
    const route = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run",
        { method: "POST" },
      ),
    );
    const routeSlash = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/",
        { method: "POST" },
      ),
    );
    const ping = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-replay-with-signal-package-dry-run/ping",
      ),
    );

    expect(route.status).not.toBe(401);
    expect(routeSlash.status).not.toBe(401);
    expect(ping.status).not.toBe(401);
  } finally {
    if (previous === undefined) {
      delete process.env.TRADE_APP_PASSWORD;
    } else {
      process.env.TRADE_APP_PASSWORD = previous;
    }
  }
});
