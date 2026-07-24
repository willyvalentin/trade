import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { POST as auditWritePOST } from "../../app/api/historical-backfill/first-tiny-fetch-run-audit-write/route";
import {
  buildFirstTinyFetchRunAuditWriteExecuteReadiness,
  executeFirstTinyFetchRunAuditWrite,
} from "../../lib/first-tiny-historical-fetch-run-audit-write-execute";
import {
  buildFirstTinyHistoricalFetchRunAuditWritePlan,
} from "../../lib/first-tiny-historical-fetch-run-audit-write-plan";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildMarketDiagnosticsConsoleSummary,
  type MarketDiagnosticsConsoleInput,
} from "../../lib/market-diagnostics-console";

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-fetch-run-audit-write-execute-attempt.md",
);
const evaluatedAt = "2026-07-09T15:00:00.000Z";

type MockRow = Record<string, unknown> & {
  id?: string;
  metadata?: Record<string, unknown>;
};

class MockSupabase {
  rows: MockRow[];
  inserted: MockRow[] = [];

  constructor(rows: MockRow[] = []) {
    this.rows = rows;
  }

  from(table: string) {
    return new MockQuery(this, table);
  }
}

class MockQuery {
  private filters: Array<[string, unknown]> = [];
  private insertedRows: MockRow[] | null = null;

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

  limit() {
    return this;
  }

  insert(rows: MockRow[]) {
    this.insertedRows = rows;
    return this;
  }

  async maybeSingle() {
    return {
      data:
        this.supabase.rows.find((row) =>
          this.filters.every(([column, value]) => valueFor(row, column) === value),
        ) ?? null,
      error: null,
    };
  }

  async single() {
    if (!this.insertedRows || this.insertedRows.length !== 1) {
      return { data: null, error: new Error("expected_one_insert_row") };
    }
    const row = {
      id: `mock_fetch_run_${this.supabase.rows.length + 1}`,
      ...this.insertedRows[0],
    };
    this.supabase.rows.push(row);
    this.supabase.inserted.push(row);
    return { data: row, error: null };
  }
}

function valueFor(row: MockRow, column: string) {
  if (column.startsWith("metadata->>")) {
    return row.metadata?.[column.slice("metadata->>".length)];
  }
  return row[column];
}

function readRunbook() {
  return readFileSync(runbookPath, "utf8");
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

function validEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED: "true",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL:
      "willy_manual_approval_003",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE:
      "first_tiny_fetch_run_audit_write_execute_20260709",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER: "AAPL",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS: "1",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED: "false",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED: "false",
    TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED: "false",
    ...overrides,
  };
}

function existingRow(env = validEnv()): MockRow {
  return {
    id: "existing_fetch_run_1",
    provider: "twelve_data",
    request_type: "time_series",
    ticker_count: 1,
    candle_count: 27,
    interval: "5min",
    trading_day_start: "2026-07-08",
    trading_day_end: "2026-07-08",
    status: "completed_no_persist",
    provider_credits_estimated: 1,
    provider_credits_used: 1,
    cache_hits: 0,
    cache_misses: 1,
    metadata: {
      source_verification: "first_tiny_historical_fetch_no_persist_verified",
      approval_reference:
        env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE,
      ticker: "AAPL",
      request_count: 1,
      valid_candles: 27,
      raw_response_persisted: false,
      candles_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
  };
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
    return await auditWritePOST(
      new Request(
        "http://localhost/api/historical-backfill/first-tiny-fetch-run-audit-write",
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
      next_action: { label: "Review audit write execute readiness" },
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
          "first_tiny_historical_fetch_run_audit_write_execute_test",
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

test("runbook documents curl and expected result shapes", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "First Tiny Fetch-Run Audit Write Execute Attempt",
  );
  expect(runbook).toContain(
    "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-fetch-run-audit-write",
  );
  expect(runbook).toContain("--data '{\"execute_fetch_run_audit_write\":true}'");
  expect(runbook).toContain("fetch_run_audit_write_completed");
  expect(runbook).toContain("fetch_run_audit_write_already_recorded");
  expect(runbook).toContain("disable the audit-write approval env signal");
  expect(runbook).toContain("Any candle persistence requires a separate future approval");
});

test("route rejects missing auth safely", async () => {
  const response = await routePost({
    secret: null,
    body: { execute_fetch_run_audit_write: true },
  });
  const body = await response.json();

  expect(response.status).toBe(401);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.error).toBe("Unauthorized.");
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.raw_response_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
});

test("route rejects missing execute flag and scope overrides", async () => {
  const missing = await routePost({
    secret: "route-secret",
    body: {},
  });
  const override = await routePost({
    secret: "route-secret",
    body: { execute_fetch_run_audit_write: true, ticker: "MSFT" },
  });
  const missingBody = await missing.json();
  const overrideBody = await override.json();

  expect(missing.status).toBe(400);
  expect(missingBody.error).toBe("execute_fetch_run_audit_write_true_required");
  expect(override.status).toBe(400);
  expect(overrideBody.error).toBe(
    "arbitrary_scope_or_persistence_override_rejected",
  );
  expect(overrideBody.candles_persisted).toBe(false);
});

test("no approval signal returns not approved without insert", async () => {
  const supabase = new MockSupabase();
  const result = await executeFirstTinyFetchRunAuditWrite({
    execute_fetch_run_audit_write: true,
    env: {},
    audit_write_plan: readyPlan(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe("not_approved");
  expect(result.audit_rows_inserted).toBe(0);
  expect(result.fetch_run_persisted).toBe(false);
  expect(supabase.inserted).toHaveLength(0);
});

test("old provider-call approval signal does not authorize write", async () => {
  const supabase = new MockSupabase();
  const result = await executeFirstTinyFetchRunAuditWrite({
    execute_fetch_run_audit_write: true,
    env: {
      TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED: "true",
      TURE_FIRST_TINY_HISTORICAL_FETCH_TICKER: "AAPL",
    },
    audit_write_plan: readyPlan(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe("not_approved");
  expect(result.audit_rows_inserted).toBe(0);
  expect(supabase.inserted).toHaveLength(0);
});

test("valid audit write signal inserts exactly one row and verifies readback", async () => {
  const supabase = new MockSupabase();
  const result = await executeFirstTinyFetchRunAuditWrite({
    execute_fetch_run_audit_write: true,
    env: validEnv(),
    audit_write_plan: readyPlan(),
    supabase_client: supabase,
    now: evaluatedAt,
  });

  expect(result.execution_status).toBe("fetch_run_audit_write_completed");
  expect(result.audit_rows_inserted).toBe(1);
  expect(result.fetch_run_persisted).toBe(true);
  expect(result.readback_verified).toBe(true);
  expect(result.duplicate_prevented).toBe(false);
  expect(result.candles_persisted).toBe(false);
  expect(result.raw_response_persisted).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(result.replay_executed).toBe(false);
  expect(result.scanner_behavior_changed).toBe(false);
  expect(result.live_ranking_changed).toBe(false);
  expect(result.max_one_row_enforced).toBe(true);
  expect(result.no_candle_persistence_enforced).toBe(true);
  expect(supabase.inserted).toHaveLength(1);
  expect(supabase.inserted[0]).toMatchObject({
    provider: "twelve_data",
    request_type: "time_series",
    ticker_count: 1,
    candle_count: 27,
    interval: "5min",
    trading_day_start: "2026-07-08",
    trading_day_end: "2026-07-08",
    status: "completed_no_persist",
    provider_credits_estimated: 1,
    provider_credits_used: 1,
    cache_hits: 0,
    cache_misses: 1,
  });
  expect(supabase.inserted[0].metadata).toMatchObject({
    source_verification: "first_tiny_historical_fetch_no_persist_verified",
    ticker: "AAPL",
    request_count: 1,
    valid_candles: 27,
    raw_response_persisted: false,
    candles_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    created_by_action:
      "action_280_first_tiny_fetch_run_audit_write_execute_attempt",
  });
});

test("invalid approval values block insert", async () => {
  const cases = [
    validEnv({ TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS: "2" }),
    validEnv({ TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER: "MSFT" }),
    validEnv({
      TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED: "true",
    }),
    validEnv({ TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED: "true" }),
    validEnv({
      TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED: "true",
    }),
  ];

  for (const env of cases) {
    const supabase = new MockSupabase();
    const result = await executeFirstTinyFetchRunAuditWrite({
      execute_fetch_run_audit_write: true,
      env,
      audit_write_plan: readyPlan(),
      supabase_client: supabase,
    });

    expect(result.execution_status).toBe("blocked");
    expect(result.audit_rows_inserted).toBe(0);
    expect(result.fetch_run_persisted).toBe(false);
    expect(supabase.inserted).toHaveLength(0);
  }
});

test("duplicate existing audit row returns already recorded and inserts zero", async () => {
  const env = validEnv();
  const supabase = new MockSupabase([existingRow(env)]);
  const result = await executeFirstTinyFetchRunAuditWrite({
    execute_fetch_run_audit_write: true,
    env,
    audit_write_plan: readyPlan(),
    supabase_client: supabase,
  });

  expect(result.execution_status).toBe(
    "fetch_run_audit_write_already_recorded",
  );
  expect(result.audit_rows_inserted).toBe(0);
  expect(result.fetch_run_persisted).toBe(true);
  expect(result.duplicate_prevented).toBe(true);
  expect(result.readback_verified).toBe(true);
  expect(supabase.inserted).toHaveLength(0);
});

test("diagnostics rendering does not execute write", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "first_tiny_fetch_run_audit_write_execute",
  );
  const readiness = buildFirstTinyFetchRunAuditWriteExecuteReadiness({
    env: {},
    audit_write_plan: readyPlan(),
  });

  expect(readiness.execution_status).toBe("not_approved");
  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Status: not_approved");
  expect(section?.lines).toContain(
    "Target table: historical_candle_fetch_runs",
  );
  expect(section?.lines).toContain("Planned rows: 1");
  expect(section?.lines).toContain("Inserted rows: 0");
  expect(section?.lines).toContain("Readback verified: no");
  expect(section?.lines).toContain("Ticker: AAPL");
  expect(section?.lines).toContain("Interval: 5min");
  expect(section?.lines).toContain("Trading day: 2026-07-08");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Raw response persisted: no");
  expect(section?.lines).toContain("Replay executed: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(section?.lines).toContain("Live ranking changed: no");
  expect(section?.metrics.diagnostics_only_no_write).toBe(true);
  expect(section?.metrics.audit_rows_inserted).toBe(0);
  expect(section?.metrics.fetch_run_persisted).toBe(false);
  expect(section?.metrics.candles_persisted).toBe(false);
});

test("execute helper does not call Twelve Data", async () => {
  let fetchCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    fetchCalls += 1;
    throw new Error("unexpected provider call");
  }) as typeof fetch;

  try {
    const result = await executeFirstTinyFetchRunAuditWrite({
      execute_fetch_run_audit_write: true,
      env: validEnv(),
      audit_write_plan: readyPlan(),
      supabase_client: new MockSupabase(),
    });

    expect(result.execution_status).toBe("fetch_run_audit_write_completed");
    expect(fetchCalls).toBe(0);
  } finally {
    globalThis.fetch = originalFetch;
  }
});
