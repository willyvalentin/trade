import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { NextRequest } from "next/server";

import { GET as pingGET } from "../../app/api/historical-backfill/first-tiny-candle-persistence-readback/ping/route";
import { POST as readbackPOST } from "../../app/api/historical-backfill/first-tiny-candle-persistence-readback/route";
import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildFirstTinyCorrectedOhlcvPayloadStaticCapture } from "../../lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import {
  firstTinyCandlePersistenceReadbackVerificationRouteBuildMarker,
  verifyFirstTinyCandlePersistenceReadback,
} from "../../lib/first-tiny-historical-candle-persistence-readback-verification";
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
  "docs/first-tiny-historical-candle-persistence-readback-verification.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";

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
      | ((value: { data: CandleRow[]; error: null }) => TResult1 | PromiseLike<TResult1>)
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

function persistedRows(overrides: Partial<CandleRow> = {}): CandleRow[] {
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
    ...overrides,
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
    return await readbackPOST(
      new Request(
        "http://localhost/api/historical-backfill/first-tiny-candle-persistence-readback",
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
      next_action: { label: "Review candle readback verification" },
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
          "first_tiny_historical_candle_persistence_readback_verification_test",
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

test("runbook documents readback curls and safety", () => {
  const runbook = readFileSync(runbookPath, "utf8");

  expect(runbook).toContain("First Tiny Candle Persistence Readback Verification");
  expect(runbook).toContain("write_completed_readback_unavailable");
  expect(runbook).toContain("first-tiny-candle-persistence-readback/ping");
  expect(runbook).toContain('"verify_candle_persistence_readback":true');
  expect(runbook).toContain("candle_persistence_readback_verified");
  expect(runbook).toContain("candle_persistence_readback_incomplete");
  expect(runbook).toContain("candle_persistence_readback_mismatch");
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
    firstTinyCandlePersistenceReadbackVerificationRouteBuildMarker,
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
    body: { verify_candle_persistence_readback: true },
  });
  const authCheck = await routePost({
    secret: "route-secret",
    body: { auth_check_only: true },
  });
  const missingFlag = await routePost({ secret: "route-secret", body: {} });
  const rejectedWrite = await routePost({
    secret: "route-secret",
    body: {
      verify_candle_persistence_readback: true,
      execute_candle_persistence: true,
    },
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
    error: "verify_candle_persistence_readback_true_required",
    candles_persisted: false,
  });
  expect(rejectedWrite.status).toBe(400);
  expect(await rejectedWrite.json()).toMatchObject({
    error: "write_execute_or_scope_override_rejected",
    candles_persisted: false,
  });
});

test("successful mocked readback verifies all 73 rows", async () => {
  const supabase = new ReadOnlyMockSupabase(persistedRows());
  const result = await verifyFirstTinyCandlePersistenceReadback({
    supabase_client: supabase,
  });

  expect(result.verification_status).toBe(
    "candle_persistence_readback_verified",
  );
  expect(result.expected_rows).toBe(73);
  expect(result.readback_rows).toBe(73);
  expect(result.matched_rows).toBe(73);
  expect(result.missing_rows).toBe(0);
  expect(result.unexpected_rows).toBe(0);
  expect(result.mismatched_rows).toBe(0);
  expect(result.readback_verified).toBe(true);
  expect(result.candles_persisted).toBe(true);
  expect(result.raw_response_persisted).toBe(false);
  expect(result.fetch_run_persisted).toBe(false);
  expect(result.replay_executed).toBe(false);
  expect(result.scanner_behavior_changed).toBe(false);
  expect(result.live_ranking_changed).toBe(false);
  expect(supabase.writeAttempted).toBe(false);
});

test("missing rows return incomplete", async () => {
  const supabase = new ReadOnlyMockSupabase(persistedRows().slice(0, 72));
  const result = await verifyFirstTinyCandlePersistenceReadback({
    supabase_client: supabase,
  });

  expect(result.verification_status).toBe(
    "candle_persistence_readback_incomplete",
  );
  expect(result.readback_rows).toBe(72);
  expect(result.missing_rows).toBe(1);
  expect(result.missing_timestamp_examples).toHaveLength(1);
  expect(result.readback_verified).toBe(false);
  expect(supabase.writeAttempted).toBe(false);
});

test("mismatched OHLCV and fetch run id return mismatch", async () => {
  const ohlcvRows = persistedRows();
  ohlcvRows[0] = { ...ohlcvRows[0], close: 1 };
  const fetchRunRows = persistedRows();
  fetchRunRows[0] = { ...fetchRunRows[0], fetch_run_id: "wrong" };
  const ohlcv = await verifyFirstTinyCandlePersistenceReadback({
    supabase_client: new ReadOnlyMockSupabase(ohlcvRows),
  });
  const fetchRun = await verifyFirstTinyCandlePersistenceReadback({
    supabase_client: new ReadOnlyMockSupabase(fetchRunRows),
  });

  expect(ohlcv.verification_status).toBe(
    "candle_persistence_readback_mismatch",
  );
  expect(ohlcv.mismatch_examples[0]?.reasons).toContain("close_mismatch");
  expect(fetchRun.verification_status).toBe(
    "candle_persistence_readback_mismatch",
  );
  expect(fetchRun.mismatch_examples[0]?.reasons).toContain(
    "fetch_run_id_mismatch",
  );
});

test("unexpected rows are handled safely", async () => {
  const rows = persistedRows();
  rows.push({
    ...rows[0],
    timestamp: "2026-07-08T13:46:00.000Z",
  });
  const result = await verifyFirstTinyCandlePersistenceReadback({
    supabase_client: new ReadOnlyMockSupabase(rows),
  });

  expect(result.verification_status).toBe(
    "candle_persistence_readback_mismatch",
  );
  expect(result.unexpected_rows).toBe(1);
  expect(result.readback_verified).toBe(false);
});

test("diagnostics rendering does not write or query provider", () => {
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
        "first_tiny_historical_candle_persistence_readback_verification",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe(
      "First Tiny Candle Persistence Readback Verification",
    );
    expect(section?.lines).toContain("Status: not_run");
    expect(section?.lines).toContain("Target table: historical_candles");
    expect(section?.lines).toContain(
      "Source verification: corrected_first_tiny_ohlcv_payload_static_captured",
    );
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(`Fetch run id: ${fetchRunId}`);
    expect(section?.lines).toContain("Expected rows: 73");
    expect(section?.lines).toContain("Readback rows: 0/73");
    expect(section?.lines).toContain("Matched rows: 0/73");
    expect(section?.lines).toContain("Readback verified: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Fetch run persisted by this action: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.metrics.verification_status).toBe("not_run");
    expect(section?.metrics.readback_verified).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_persistence_readback_verification",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("proxy allows readback route and ping to reach handlers", async () => {
  const previous = process.env.TRADE_APP_PASSWORD;
  process.env.TRADE_APP_PASSWORD = "trade-password";

  try {
    const route = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-candle-persistence-readback",
        { method: "POST" },
      ),
    );
    const routeSlash = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-candle-persistence-readback/",
        { method: "POST" },
      ),
    );
    const ping = await proxy(
      new NextRequest(
        "http://localhost/api/historical-backfill/first-tiny-candle-persistence-readback/ping",
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
