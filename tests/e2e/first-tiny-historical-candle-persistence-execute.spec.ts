import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { GET as pingGET } from "../../app/api/historical-backfill/first-tiny-candle-persistence/ping/route";
import { POST as executePOST } from "../../app/api/historical-backfill/first-tiny-candle-persistence/route";
import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import type { FirstTinyCandlePersistenceApprovalEnv } from "../../lib/first-tiny-historical-candle-persistence-approval";
import {
  buildFirstTinyCandlePersistenceExecuteReadiness,
  executeFirstTinyCandlePersistence,
  firstTinyCandlePersistenceExecuteRouteBuildMarker,
} from "../../lib/first-tiny-historical-candle-persistence-execute";
import { buildFirstTinyCorrectedOhlcvPayloadStaticCapture } from "../../lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import {
  buildMarketDiagnosticsConsoleSummary,
  type MarketDiagnosticsConsoleInput,
} from "../../lib/market-diagnostics-console";
import { proxy } from "../../proxy";
import { NextRequest } from "next/server";

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-candle-persistence-execute-attempt.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";

type CandleRow = Record<string, unknown>;

class MockSupabase {
  rows: CandleRow[];
  upsertCalls: CandleRow[][] = [];

  constructor(rows: CandleRow[] = []) {
    this.rows = rows;
  }

  from(table: string) {
    return new MockQuery(this, table);
  }
}

class MockQuery {
  private filters: Array<[string, unknown]> = [];
  private inFilters: Array<[string, unknown[]]> = [];
  private upsertRows: CandleRow[] | null = null;

  constructor(
    private readonly supabase: MockSupabase,
    readonly table: string,
  ) {}

  select() {
    return this;
  }

  eq(column: string, value: unknown) {
    this.filters.push([column, value]);
    return this;
  }

  in(column: string, values: unknown[]) {
    this.inFilters.push([column, values]);
    return this;
  }

  order() {
    return this;
  }

  limit() {
    return this;
  }

  upsert(rows: CandleRow[]) {
    this.upsertRows = rows;
    return this;
  }

  then<TResult1 = { data: CandleRow[]; error: null }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: CandleRow[]; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve(this.resolve()).then(onfulfilled, onrejected);
  }

  private resolve() {
    if (this.upsertRows) {
      this.supabase.upsertCalls.push(this.upsertRows);
      for (const row of this.upsertRows) {
        const index = this.supabase.rows.findIndex((existing) =>
          sameKey(existing, row),
        );
        if (index >= 0) {
          this.supabase.rows[index] = {
            ...this.supabase.rows[index],
            ...row,
          };
        } else {
          this.supabase.rows.push({ ...row });
        }
      }
      return { data: this.filteredRows(), error: null };
    }

    return { data: this.filteredRows(), error: null };
  }

  private filteredRows() {
    return this.supabase.rows
      .filter((row) =>
        this.filters.every(([column, value]) => row[column] === value),
      )
      .filter((row) =>
        this.inFilters.every(([column, values]) => values.includes(row[column])),
      )
      .sort((left, right) =>
        String(left.timestamp).localeCompare(String(right.timestamp)),
      );
  }
}

function sameKey(left: CandleRow, right: CandleRow) {
  return (
    left.provider === right.provider &&
    left.ticker === right.ticker &&
    left.interval === right.interval &&
    left.timestamp === right.timestamp &&
    left.adjusted === right.adjusted
  );
}

function validEnv(
  overrides: Partial<FirstTinyCandlePersistenceApprovalEnv> = {},
): FirstTinyCandlePersistenceApprovalEnv {
  return {
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_APPROVED: "true",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_OPERATOR_LABEL: "operator-reviewed",
    TURE_FIRST_TINY_CANDLE_PERSISTENCE_REFERENCE: "action-295-test",
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

function sourceRows() {
  return buildFirstTinyCorrectedOhlcvPayloadStaticCapture().rows;
}

function persistedRows() {
  return sourceRows().map((row) => ({
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

async function routePost(input: {
  secret?: string | null;
  body?: unknown;
  env?: Record<string, string | undefined>;
}) {
  const previous = process.env.AUTOMATION_SECRET;
  process.env.AUTOMATION_SECRET = input.env?.AUTOMATION_SECRET ?? "route-secret";
  const headers = new Headers({ "content-type": "application/json" });
  if (input.secret !== undefined && input.secret !== null) {
    headers.set("x-automation-secret", input.secret);
  }

  try {
    return await executePOST(
      new Request(
        "http://localhost/api/historical-backfill/first-tiny-candle-persistence",
        {
          method: "POST",
          headers,
          body: JSON.stringify(input.body ?? {}),
        },
      ),
    );
  } finally {
    if (previous === undefined) {
      delete process.env.AUTOMATION_SECRET;
    } else {
      process.env.AUTOMATION_SECRET = previous;
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
      next_action: { label: "Review candle persistence execute readiness" },
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
          "first_tiny_historical_candle_persistence_execute_test",
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

test("runbook documents curl commands and safety states", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("First Tiny Candle Persistence Execute Attempt");
  expect(runbook).toContain("first-tiny-candle-persistence/ping");
  expect(runbook).toContain('"execute_candle_persistence":true');
  expect(runbook).toContain("candle_persistence_completed");
  expect(runbook).toContain("candle_persistence_already_recorded");
  expect(runbook).toContain("existing_row_mismatch_requires_manual_review");
  expect(runbook).toContain("disable the candle persistence approval env signal");
  expect(runbook).not.toContain("apikey");
});

test("ping reachable and safe", async () => {
  const response = await pingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expect(body.route_build_marker).toBe(
    firstTinyCandlePersistenceExecuteRouteBuildMarker,
  );
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.raw_response_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
});

test("route auth and body guards are safe", async () => {
  const missingAuth = await routePost({
    secret: null,
    body: { execute_candle_persistence: true },
  });
  const authCheck = await routePost({
    secret: "route-secret",
    body: { auth_check_only: true },
  });
  const missingFlag = await routePost({
    secret: "route-secret",
    body: {},
  });
  const override = await routePost({
    secret: "route-secret",
    body: { execute_candle_persistence: true, ticker: "MSFT" },
  });

  expect(missingAuth.status).toBe(401);
  expect(await missingAuth.json()).toMatchObject({
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
  });
  expect(authCheck.status).toBe(200);
  expect(await authCheck.json()).toMatchObject({
    ok: true,
    auth_check_only: true,
    candles_persisted: false,
  });
  expect(missingFlag.status).toBe(400);
  expect(await missingFlag.json()).toMatchObject({
    error: "execute_candle_persistence_true_required",
    candles_persisted: false,
  });
  expect(override.status).toBe(400);
  expect(await override.json()).toMatchObject({
    error: "arbitrary_scope_or_persistence_override_rejected",
    candles_persisted: false,
  });
});

test("route without approval returns not approved and no write", async () => {
  const response = await routePost({
    secret: "route-secret",
    body: { execute_candle_persistence: true },
  });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.execution_status).toBe("not_approved");
  expect(body.candles_persisted).toBe(false);
  expect(body.candle_rows_inserted).toBe(0);
  expect(body.raw_response_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
});

test("old approval signals do not authorize candle persistence", async () => {
  const result = await executeFirstTinyCandlePersistence({
    execute_candle_persistence: true,
    env: {
      TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED: "true",
      TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED: "true",
    },
    supabase_client: new MockSupabase(),
  });

  expect(result.execution_status).toBe("not_approved");
  expect(result.candles_persisted).toBe(false);
});

test("valid approval authorizes exactly one mocked upsert and verifies readback", async () => {
  const supabase = new MockSupabase();
  const result = await executeFirstTinyCandlePersistence({
    execute_candle_persistence: true,
    env: validEnv(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe("candle_persistence_completed");
  expect(result.target_table).toBe("historical_candles");
  expect(result.source_verification).toBe(
    "corrected_first_tiny_ohlcv_payload_static_captured",
  );
  expect(result.plan_version).toBe("v2_static_ohlcv_payload");
  expect(result.attempted_rows).toBe(73);
  expect(result.candle_rows_inserted).toBe(73);
  expect(result.candle_rows_updated).toBe(0);
  expect(result.candle_rows_skipped).toBe(0);
  expect(result.candle_rows_rejected).toBe(0);
  expect(result.readback_verified).toBe(true);
  expect(result.candles_persisted).toBe(true);
  expect(supabase.upsertCalls).toHaveLength(1);
  expect(supabase.upsertCalls[0]).toHaveLength(73);
  expect(supabase.rows).toHaveLength(73);
  expect(result.raw_response_persisted).toBe(false);
  expect(result.fetch_run_persisted).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(result.replay_executed).toBe(false);
  expect(result.scanner_behavior_changed).toBe(false);
  expect(result.live_ranking_changed).toBe(false);
});

test("approval blockers prevent writes", async () => {
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
  ];

  for (const [override, blocker] of cases) {
    const supabase = new MockSupabase();
    const result = await executeFirstTinyCandlePersistence({
      execute_candle_persistence: true,
      env: validEnv(override),
      supabase_client: supabase,
    });

    expect(result.execution_status, blocker).toBe("blocked");
    expect(result.blockers, blocker).toContain(blocker);
    expect(result.candles_persisted).toBe(false);
    expect(supabase.upsertCalls).toHaveLength(0);
  }
});

test("duplicate matching rows return already recorded without upsert", async () => {
  const supabase = new MockSupabase(persistedRows());
  const result = await executeFirstTinyCandlePersistence({
    execute_candle_persistence: true,
    env: validEnv(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe("candle_persistence_already_recorded");
  expect(result.candle_rows_inserted).toBe(0);
  expect(result.candle_rows_updated).toBe(0);
  expect(result.candle_rows_skipped).toBe(73);
  expect(result.duplicate_prevented).toBe(true);
  expect(result.candles_persisted).toBe(true);
  expect(result.readback_verified).toBe(true);
  expect(supabase.upsertCalls).toHaveLength(0);
});

test("existing mismatched row blocks for manual review", async () => {
  const rows = persistedRows();
  rows[0] = { ...rows[0], close: 1 };
  const supabase = new MockSupabase(rows);
  const result = await executeFirstTinyCandlePersistence({
    execute_candle_persistence: true,
    env: validEnv(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe("blocked");
  expect(result.blockers).toContain("existing_row_mismatch_requires_manual_review");
  expect(result.candles_persisted).toBe(false);
  expect(supabase.upsertCalls).toHaveLength(0);
});

test("readiness and diagnostics do not execute writes or provider calls", () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("unexpected provider call");
  }) as typeof fetch;

  try {
    const readiness = buildFirstTinyCandlePersistenceExecuteReadiness({
      env: {},
    });
    const diagnostics = buildMarketDiagnosticsConsoleSummary(
      baseDiagnosticsInput(),
    );
    const section = diagnostics.sections.find(
      (item) =>
        item.section_id ===
        "first_tiny_historical_candle_persistence_execute",
    );

    expect(fetchCalls).toBe(0);
    expect(readiness.execution_status).toBe("not_approved");
    expect(readiness.candles_persisted).toBe(false);
    expect(section?.title).toBe("First Tiny Candle Persistence Execute");
    expect(section?.lines).toContain("Status: not_approved");
    expect(section?.lines).toContain("Target table: historical_candles");
    expect(section?.lines).toContain("Plan version: v2_static_ohlcv_payload");
    expect(section?.lines).toContain(
      "Source verification: corrected_first_tiny_ohlcv_payload_static_captured",
    );
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(`Fetch run id: ${fetchRunId}`);
    expect(section?.lines).toContain("Expected rows: 73");
    expect(section?.lines).toContain("Inserted rows: 0/73");
    expect(section?.lines).toContain("Updated rows: 0/73");
    expect(section?.lines).toContain("Skipped rows: 0/73");
    expect(section?.lines).toContain("Rejected rows: 0");
    expect(section?.lines).toContain("Readback verified: no");
    expect(section?.lines).toContain("Candles persisted: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Fetch run persisted: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.lines).toContain("Live ranking changed: no");
    expect(section?.metrics.execution_status).toBe("not_approved");
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_persistence_execute",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("proxy allows candle persistence route and ping to reach handlers", async () => {
  const previous = process.env.TRADE_APP_PASSWORD;
  process.env.TRADE_APP_PASSWORD = "trade-password";

  try {
    const route = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-candle-persistence",
        { method: "POST" },
      ),
    );
    const routeSlash = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-candle-persistence/",
        { method: "POST" },
      ),
    );
    const ping = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-candle-persistence/ping",
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
