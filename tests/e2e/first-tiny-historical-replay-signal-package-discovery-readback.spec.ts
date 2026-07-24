import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { GET as pingGET } from "../../app/api/historical-backfill/first-tiny-signal-package-discovery-readback/ping/route";
import { POST as readbackPOST } from "../../app/api/historical-backfill/first-tiny-signal-package-discovery-readback/route";
import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
  runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback,
} from "../../lib/first-tiny-historical-replay-signal-package-discovery-readback";
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
  "docs/first-tiny-historical-replay-signal-package-discovery-readback.md",
);
const evaluatedAt = "2026-07-09T18:30:00.000Z";

type Row = Record<string, unknown>;

class ReadOnlyDiscoverySupabase {
  writeAttempted = false;

  constructor(readonly tables: Record<string, Row[]>) {}

  from(table: string) {
    return new ReadOnlyDiscoveryQuery(this, table);
  }
}

class ReadOnlyDiscoveryQuery {
  private filters: Array<[string, unknown]> = [];
  private gteFilters: Array<[string, string]> = [];
  private lteFilters: Array<[string, string]> = [];
  private maxRows = 100;

  constructor(
    private readonly supabase: ReadOnlyDiscoverySupabase,
    private readonly table: string,
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

  limit(count: number) {
    this.maxRows = count;
    return this;
  }

  insert() {
    this.supabase.writeAttempted = true;
    throw new Error("unexpected_insert");
  }

  update() {
    this.supabase.writeAttempted = true;
    throw new Error("unexpected_update");
  }

  upsert() {
    this.supabase.writeAttempted = true;
    throw new Error("unexpected_upsert");
  }

  then<TResult1 = { data: Row[]; error: null }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: Row[]; error: null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ) {
    return Promise.resolve({ data: this.filteredRows(), error: null }).then(
      onfulfilled,
      onrejected,
    );
  }

  private filteredRows() {
    return (this.supabase.tables[this.table] ?? [])
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
        String(left.created_at).localeCompare(String(right.created_at)),
      )
      .slice(0, this.maxRows);
  }
}

async function routePost(input: {
  secret?: string | null;
  body?: unknown;
  env?: Record<string, string | undefined>;
}) {
  const keys = [
    "AUTOMATION_SECRET",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE",
    "SUPABASE_SERVICE_ROLE_SECRET",
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
    return await readbackPOST(
      new Request(
        "http://localhost/api/historical-backfill/first-tiny-signal-package-discovery-readback",
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
      next_action: { label: "Review signal package discovery readback" },
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
        qa_checked_source_path: "signal_package_discovery_readback_test",
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

test("ping and auth guards are safe", async () => {
  const ping = await pingGET();
  const pingBody = await ping.json();

  expect(ping.status).toBe(200);
  expect(ping.headers.get("Cache-Control")).toBe("no-store");
  expect(pingBody.ok).toBe(true);
  expect(pingBody.route_ping).toBe(true);
  expect(pingBody.route_build_marker).toBe(
    firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
  );
  expect(pingBody.provider_call_executed).toBe(false);
  expect(pingBody.synthetic_outcomes_persisted).toBe(false);
  expect(pingBody.replay_executed).toBe(false);
  expect(pingBody.scanner_behavior_changed).toBe(false);
  expect(pingBody.supabase_write_executed).toBe(false);

  const missingAuth = await routePost({
    body: { run_signal_package_discovery_readback: true },
  });
  const missingAuthBody = await missingAuth.json();
  expect(missingAuth.status).toBe(401);
  expect(missingAuthBody.error).toBe("Unauthorized.");
  expect(missingAuthBody.provider_call_executed).toBe(false);
  expect(missingAuthBody.replay_executed).toBe(false);
  expect(missingAuthBody.supabase_write_executed).toBe(false);

  const authOnly = await routePost({
    secret: "route-secret",
    body: { auth_check_only: true },
  });
  const authOnlyBody = await authOnly.json();
  expect(authOnly.status).toBe(200);
  expect(authOnlyBody.ok).toBe(true);
  expect(authOnlyBody.auth_check_only).toBe(true);
  expect(authOnlyBody.provider_call_executed).toBe(false);
  expect(authOnlyBody.replay_executed).toBe(false);
  expect(authOnlyBody.supabase_write_executed).toBe(false);

  const missingFlag = await routePost({
    secret: "route-secret",
    body: {},
  });
  const missingFlagBody = await missingFlag.json();
  expect(missingFlag.status).toBe(400);
  expect(missingFlagBody.error).toBe(
    "run_signal_package_discovery_readback_true_required",
  );

  const override = await routePost({
    secret: "route-secret",
    body: {
      run_signal_package_discovery_readback: true,
      execute_replay: true,
    },
  });
  const overrideBody = await override.json();
  expect(override.status).toBe(400);
  expect(overrideBody.error).toBe("arbitrary_scope_or_effect_override_rejected");
  expect(overrideBody.synthetic_outcomes_persisted).toBe(false);
  expect(overrideBody.replay_executed).toBe(false);
});

test("route handles unavailable readback without effects", async () => {
  const response = await routePost({
    secret: "route-secret",
    env: {
      AUTOMATION_SECRET: "route-secret",
      NEXT_PUBLIC_SUPABASE_URL: undefined,
      SUPABASE_SERVICE_ROLE_KEY: undefined,
      SUPABASE_SERVICE_ROLE: undefined,
      SUPABASE_SERVICE_ROLE_SECRET: undefined,
    },
    body: { run_signal_package_discovery_readback: true },
  });
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(body.discovery_status).toBe("readback_unavailable");
  expect(body.readback_attempted).toBe(false);
  expect(body.provider_call_executed).toBe(false);
  expect(body.synthetic_outcomes_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
  expect(body.live_ranking_changed).toBe(false);
  expect(body.recommendation_rows_mutated).toBe(false);
  expect(body.supabase_write_executed).toBe(false);
});

test("readback reports no candidates safely", async () => {
  const supabase = new ReadOnlyDiscoverySupabase({
    recommendations: [],
    recommendation_snapshots: [],
  });
  const result =
    await runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback({
      execute_readback: true,
      supabase_client: supabase,
    });

  expect(result.discovery_status).toBe("no_candidates_found");
  expect(result.readback_attempted).toBe(true);
  expect(result.recommendation_rows_checked).toBe(0);
  expect(result.recommendation_snapshots_checked).toBe(0);
  expect(result.candidates_found).toBe(0);
  expect(result.compatible_candidates).toBe(0);
  expect(result.best_candidate_available).toBe(false);
  expect(result.signal_package_available_now).toBe(false);
  expect(result.blockers).toContain("no_compatible_signal_package_found");
  expect(result.provider_call_executed).toBe(false);
  expect(result.replay_executed).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(result.supabase_write_executed).toBe(false);
  expect(supabase.writeAttempted).toBe(false);
});

test("incomplete candidates are found but not compatible", async () => {
  const supabase = new ReadOnlyDiscoverySupabase({
    recommendations: [
      {
        id: "rec-incomplete",
        ticker: "AAPL",
        created_at: "2026-07-08T14:00:00.000Z",
        direction: "long",
        entry_low: 210,
      },
    ],
    recommendation_snapshots: [
      {
        id: "snap-incomplete",
        snapshot_fingerprint: "snap-incomplete",
        ticker: "AAPL",
        created_at: "2026-07-08T14:05:00.000Z",
        payload_json: { direction: "long", entry: 211 },
      },
    ],
  });
  const result =
    await runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback({
      execute_readback: true,
      supabase_client: supabase,
    });

  expect(result.discovery_status).toBe("candidates_found_none_compatible");
  expect(result.candidates_found).toBe(2);
  expect(result.compatible_candidates).toBe(0);
  expect(result.best_candidate_available).toBe(false);
  expect(result.signal_package_available_now).toBe(false);
  expect(result.top_missing_fields_or_reasons.join(",")).toContain(
    "missing_stop",
  );
  expect(result.top_missing_fields_or_reasons.join(",")).toContain(
    "missing_target",
  );
  expect(result.replay_executed).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(supabase.writeAttempted).toBe(false);
});

test("compatible candidate is detected conservatively", async () => {
  const supabase = new ReadOnlyDiscoverySupabase({
    recommendations: [],
    recommendation_snapshots: [
      {
        id: "snap-compatible",
        snapshot_fingerprint: "snap-compatible",
        recommendation_id: "rec-compatible",
        ticker: "AAPL",
        created_at: "2026-07-08T14:00:00.000Z",
        recommended_at: "2026-07-08T14:00:00.000Z",
        entry: 210,
        stop: 205,
        target: 220,
        confidence: 0.74,
        payload_json: {
          direction: "long",
          setup_label: "opening_drive",
          analysis_cutoff: "2026-07-08T14:00:00.000Z",
        },
      },
    ],
  });
  const result =
    await runFirstTinyHistoricalReplaySignalPackageDiscoveryReadback({
      execute_readback: true,
      supabase_client: supabase,
    });

  expect(result.discovery_status).toBe("compatible_signal_package_found");
  expect(result.recommendation_rows_checked).toBe(0);
  expect(result.recommendation_snapshots_checked).toBe(1);
  expect(result.candidates_found).toBe(1);
  expect(result.compatible_candidates).toBe(1);
  expect(result.best_candidate_available).toBe(true);
  expect(result.signal_package_available_now).toBe(true);
  expect(result.candidates[0]?.compatible).toBe(true);
  expect(result.candidates[0]?.entry).toBe(210);
  expect(result.candidates[0]?.stop).toBe(205);
  expect(result.candidates[0]?.target).toBe(220);
  expect(result.recommended_next_steps).toContain(
    "review_signal_package_before_replay",
  );
  expect(result.replay_executed).toBe(false);
  expect(result.synthetic_outcomes_persisted).toBe(false);
  expect(result.scanner_behavior_changed).toBe(false);
  expect(result.live_ranking_changed).toBe(false);
  expect(supabase.writeAttempted).toBe(false);
});

test("artifact documents route statuses and safety boundaries", () => {
  const artifact = readFileSync(artifactPath, "utf8");

  expect(artifact).toContain(
    "First Tiny Historical Replay Signal Package Discovery Readback",
  );
  expect(artifact).toContain("recommendations");
  expect(artifact).toContain("recommendation_snapshots");
  expect(artifact).toContain("compatible_signal_package_found");
  expect(artifact).toContain("candidates_found_none_compatible");
  expect(artifact).toContain(
    "first-tiny-signal-package-discovery-readback",
  );
  expect(artifact).toContain("run_signal_package_discovery_readback");
  expect(artifact).toContain("provider_call_executed");
  expect(artifact).toContain("supabase_write_executed");
  expect(artifact).toContain("Do not include real secrets");
});

test("diagnostics render readback plan without provider Supabase write or replay effects", () => {
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
        "first_tiny_historical_replay_signal_package_discovery_readback",
    );
    const intelligenceOverview = diagnostics.sections.find(
      (entry) => entry.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section?.title).toBe(
      "First Tiny Replay Signal Package Discovery Readback",
    );
    expect(section?.lines).toContain("Status: not_run");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain("Readback attempted: no");
    expect(section?.lines).toContain("Recommendation rows checked: 0");
    expect(section?.lines).toContain("Recommendation snapshots checked: 0");
    expect(section?.lines).toContain("Candidates found: 0");
    expect(section?.lines).toContain("Compatible candidates: 0");
    expect(section?.lines).toContain("Best candidate available: no");
    expect(section?.lines).toContain("Signal package available now: no");
    expect(section?.lines).toContain("Signal package created now: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Synthetic outcomes persisted: no");
    expect(section?.metrics.readback_marker).toBe(
      firstTinyHistoricalReplaySignalPackageDiscoveryReadbackMarker,
    );
    expect(section?.metrics.discovery_status).toBe("not_run");
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.synthetic_outcomes_persisted).toBe(false);
    expect(section?.metrics.recommendation_rows_mutated).toBe(false);
    expect(section?.metrics.supabase_write_executed).toBe(false);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_replay_signal_package_discovery_readback",
    );
    expect(intelligenceOverview?.lines).toContain(
      "First tiny signal package discovery readback: not_run / compatible no / replay no / persistence no",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
