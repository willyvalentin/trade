import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { buildHistoricalCandleStorageReadiness } from "../../lib/historical-candle-storage-readiness";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";

const evaluatedAt = "2026-07-09T15:00:00.000Z";
const migrationPath = resolve(
  process.cwd(),
  "supabase/migrations/20260709000000_create_historical_candle_storage.sql",
);
const migrationSql = readFileSync(migrationPath, "utf8").replace(/\r\n/g, "\n");
const executableSql = stripSqlStrings(stripSqlComments(migrationSql).toLowerCase());

function stripSqlComments(sql: string) {
  return sql.replace(/\/\*[\s\S]*?\*\//gu, "").replace(/--.*$/gmu, "");
}

function stripSqlStrings(sql: string) {
  return sql.replace(/'(?:''|[^'])*'/gu, "''");
}

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/gu, "\\$&");
}

function tableBlock(tableName: string) {
  const blockPattern = new RegExp(
    `create table if not exists public\\.${escapeRegExp(tableName)} \\([\\s\\S]*?\\n\\);`,
    "iu",
  );
  const match = migrationSql.match(blockPattern);

  expect(match, `table block exists for ${tableName}`).not.toBeNull();

  return match?.[0].toLowerCase() ?? "";
}

function expectSqlContains(fragment: string) {
  expect(migrationSql.toLowerCase()).toContain(fragment.toLowerCase());
}

function baseDiagnosticsInput(
  overrides: Partial<MarketDiagnosticsConsoleInput> = {},
): MarketDiagnosticsConsoleInput {
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
      scanner_readiness: { selected_ticker_count: 6 },
      outcome_readiness: {
        route_available: true,
        evaluated_recommendations: 0,
      },
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
      next_action: { label: "Review candle storage readiness" },
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
        qa_checked_source_path: "historical_candle_storage_readiness_test",
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
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    daily_learning_review: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
    ...overrides,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("empty input does not throw and stays advisory", () => {
  const summary = buildHistoricalCandleStorageReadiness();

  expect(summary.advisory_only).toBe(true);
  expect(summary.proposed_schema.primary_table).toBe("historical_candles");
  expect(summary.proposed_schema.fetch_runs_table).toBe(
    "historical_candle_fetch_runs",
  );
  expect(summary.proposed_schema.candle_contract_version).toBe("v1");
});

test("historical candles table defines key indexes and dedupe policy", () => {
  const summary = buildHistoricalCandleStorageReadiness();

  expect(summary.historical_candles_table.required_columns).toContain("id");
  expect(summary.historical_candles_table.required_columns).toContain(
    "cache_key",
  );
  expect(summary.historical_candles_table.optional_columns).toContain(
    "raw_payload",
  );
  expect(summary.historical_candles_table.proposed_unique_key).toEqual([
    "provider",
    "ticker",
    "interval",
    "timestamp",
    "adjusted",
  ]);
  expect(summary.historical_candles_table.proposed_indexes).toContain(
    "ticker_interval_timestamp",
  );
  expect(summary.historical_candles_table.dedupe_required).toBe(true);
  expect(summary.historical_candles_table.reuse_before_fetch).toBe(true);
});

test("fetch runs table is present for provider budget and cache audit", () => {
  const summary = buildHistoricalCandleStorageReadiness();

  expect(
    summary.historical_candle_fetch_runs_table.required_columns,
  ).toContain("provider_credits_used");
  expect(
    summary.historical_candle_fetch_runs_table.required_columns,
  ).toContain("cache_hits");
  expect(summary.historical_candle_fetch_runs_table.proposed_indexes).toContain(
    "provider_status_requested_at",
  );
  expect(summary.historical_candle_fetch_runs_table.purpose).toContain(
    "Audit historical candle cache",
  );
});

test("retention and lookahead policy remains explicit", () => {
  const summary = buildHistoricalCandleStorageReadiness();

  expect(summary.retention_policy.ttl_policy_required).toBe(true);
  expect(summary.retention_policy.manual_review_required).toBe(true);
  expect(
    summary.retention_policy
      .deletion_blocked_when_referenced_by_synthetic_outcomes,
  ).toBe(true);
  expect(
    summary.lookahead_safety
      .stored_candles_can_include_future_relative_to_replay,
  ).toBe(true);
  expect(
    summary.lookahead_safety
      .replay_signal_generation_must_filter_to_analysis_cutoff,
  ).toBe(true);
  expect(summary.lookahead_safety.sample_origin_must_be_tagged).toBe(true);
});

test("RLS and access policy blocks public client access", () => {
  const summary = buildHistoricalCandleStorageReadiness();

  expect(summary.rls_and_access.service_role_write_only).toBe(true);
  expect(summary.rls_and_access.public_client_write_allowed).toBe(false);
  expect(summary.rls_and_access.public_client_read_allowed).toBe(false);
  expect(summary.rls_and_access.diagnostics_read_allowed).toBe(true);
  expect(summary.rls_and_access.raw_provider_payload_ui_exposure_allowed).toBe(
    false,
  );
});

test("migration and runtime safety flags stay disabled", () => {
  const summary = buildHistoricalCandleStorageReadiness();

  expect(summary.migration_readiness.ready_to_write_migration).toBe(true);
  expect(summary.migration_readiness.migration_file_present).toBe(true);
  expect(summary.migration_readiness.migration_applied).toBe("unknown");
  expect(summary.migration_readiness.historical_candles_table_detected).toBe(
    "unknown",
  );
  expect(
    summary.migration_readiness
      .historical_candle_fetch_runs_table_detected,
  ).toBe("unknown");
  expect(summary.migration_readiness.expected_unique_key_detected).toBe(
    "unknown",
  );
  expect(summary.migration_readiness.expected_indexes_detected).toBe("unknown");
  expect(summary.migration_readiness.rls_enabled_detected).toBe("unknown");
  expect(summary.migration_readiness.client_writes_allowed).toBe("unknown");
  expect(summary.migration_readiness.client_reads_allowed).toBe("unknown");
  expect(summary.migration_readiness.ready_to_apply_migration).toBe(true);
  expect(summary.migration_readiness.ready_to_fetch_historical_data).toBe(
    false,
  );
  expect(summary.migration_readiness.ready_to_persist_candles).toBe(false);
  expect(summary.migration_readiness.ready_to_use_for_backfill).toBe(false);
  expect(summary.migration_readiness.ready_to_use_for_scanner).toBe(false);
  expect(summary.safety.migration_applied).toBe("unknown");
  expect(summary.safety.provider_fetch_added).toBe(false);
  expect(summary.safety.historical_fetch_added).toBe(false);
  expect(summary.safety.candles_persisted).toBe(false);
  expect(summary.safety.synthetic_outcomes_persisted).toBe(false);
  expect(summary.safety.scanner_behavior_changed).toBe(false);
});

test("migration detection handles applied table metadata without enabling runtime use", () => {
  const summary = buildHistoricalCandleStorageReadiness({
    migration_detection: {
      historical_candles_table_detected: true,
      historical_candle_fetch_runs_table_detected: true,
      expected_unique_key_detected: true,
      expected_indexes_detected: true,
      rls_enabled_detected: true,
      client_write_policies_detected: false,
      client_read_policies_detected: false,
      detection_source: "mock_schema_readback",
      checked_at: evaluatedAt,
    },
  });

  expect(summary.migration_readiness.migration_applied).toBe("yes");
  expect(summary.migration_readiness.expected_unique_key_detected).toBe("yes");
  expect(summary.migration_readiness.expected_indexes_detected).toBe("yes");
  expect(summary.migration_readiness.rls_enabled_detected).toBe("yes");
  expect(summary.migration_readiness.client_write_policies_detected).toBe("no");
  expect(summary.migration_readiness.client_read_policies_detected).toBe("no");
  expect(summary.migration_readiness.client_writes_allowed).toBe("no");
  expect(summary.migration_readiness.client_reads_allowed).toBe("no");
  expect(summary.migration_readiness.ready_to_apply_migration).toBe(false);
  expect(summary.migration_readiness.ready_to_fetch_historical_data).toBe(
    false,
  );
  expect(summary.migration_readiness.ready_to_persist_candles).toBe(false);
  expect(summary.migration_readiness.ready_to_use_for_backfill).toBe(false);
  expect(summary.migration_readiness.ready_to_use_for_scanner).toBe(false);
  expect(summary.safety.migration_applied).toBe("yes");
  expect(summary.safety.provider_fetch_added).toBe(false);
  expect(summary.safety.candles_persisted).toBe(false);
  expect(summary.safety.scanner_behavior_changed).toBe(false);
});

test("diagnostics section prints expected safety lines", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(baseDiagnosticsInput());
  const section = diagnostics.sections.find(
    (item) => item.section_id === "historical_candle_storage_readiness",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section).toBeTruthy();
  expect(section?.lines).toContain("Advisory mode: yes");
  expect(section?.lines).toContain("Proposed table: historical_candles");
  expect(section?.lines).toContain(
    "Proposed fetch-runs table: historical_candle_fetch_runs",
  );
  expect(section?.lines).toContain("Candle contract version: v1");
  expect(section?.lines).toContain("Migration file exists: yes");
  expect(section?.lines).toContain("Migration applied: unknown");
  expect(section?.lines).toContain(
    "historical_candles table detected: unknown",
  );
  expect(section?.lines).toContain(
    "historical_candle_fetch_runs table detected: unknown",
  );
  expect(section?.lines).toContain("Unique key detected: unknown");
  expect(section?.lines).toContain("Indexes detected: unknown");
  expect(section?.lines).toContain("RLS enabled: unknown");
  expect(section?.lines).toContain("Client writes allowed: unknown");
  expect(section?.lines).toContain("Client reads allowed: unknown");
  expect(section?.lines).toContain(
    "Unique key: provider, ticker, interval, timestamp, adjusted",
  );
  expect(section?.lines).toContain("Dedupe required: yes");
  expect(section?.lines).toContain("Reuse before fetch: yes");
  expect(section?.lines).toContain("TTL policy required: yes");
  expect(section?.lines).toContain(
    "Lookahead safety: replay must filter to analysis cutoff",
  );
  expect(section?.lines).toContain("Ready to write migration: yes");
  expect(section?.lines).toContain("Ready to apply migration: yes");
  expect(section?.lines).toContain("Ready to fetch historical data: no");
  expect(section?.lines).toContain("Ready to persist candles: no");
  expect(section?.lines).toContain("Ready to use for backfill: no");
  expect(section?.lines).toContain("Ready to use for scanner: no");
  expect(section?.lines).toContain("Provider fetch added: no");
  expect(section?.lines).toContain("Historical fetch added: no");
  expect(section?.lines).toContain("Candles persisted: no");
  expect(section?.lines).toContain("Synthetic outcomes persisted: no");
  expect(section?.lines).toContain("Scanner behavior changed: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith("Historical candle storage: schema planned"),
    ),
  ).toBe(true);
});

test("diagnostics can render applied table detection while keeping fetch and persist off", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput({
      historical_candle_storage_detection: {
        historical_candles_table_detected: true,
        historical_candle_fetch_runs_table_detected: true,
        expected_unique_key_detected: true,
        expected_indexes_detected: true,
        rls_enabled_detected: true,
        client_write_policies_detected: false,
        client_read_policies_detected: false,
        detection_source: "mock_schema_readback",
        checked_at: evaluatedAt,
      },
    }),
  );
  const section = diagnostics.sections.find(
    (item) => item.section_id === "historical_candle_storage_readiness",
  );
  const intelligence = diagnostics.sections.find(
    (item) => item.section_id === "intelligence_overview",
  );

  expect(section?.lines).toContain("Migration applied: yes");
  expect(section?.lines).toContain("historical_candles table detected: yes");
  expect(section?.lines).toContain(
    "historical_candle_fetch_runs table detected: yes",
  );
  expect(section?.lines).toContain("Unique key detected: yes");
  expect(section?.lines).toContain("Indexes detected: yes");
  expect(section?.lines).toContain("RLS enabled: yes");
  expect(section?.lines).toContain("Client writes allowed: no");
  expect(section?.lines).toContain("Client reads allowed: no");
  expect(section?.lines).toContain("Ready to apply migration: no");
  expect(section?.lines).toContain("Ready to fetch historical data: no");
  expect(section?.lines).toContain("Ready to persist candles: no");
  expect(section?.lines).toContain("Ready to use for scanner: no");
  expect(
    intelligence?.lines.some((line) =>
      line.startsWith(
        "Historical candle storage: schema planned / migration yes",
      ),
    ),
  ).toBe(true);
});

test("migration creates historical candle storage tables and constraints", () => {
  const candlesBlock = tableBlock("historical_candles");
  const fetchRunsBlock = tableBlock("historical_candle_fetch_runs");

  expect(candlesBlock).toContain("id uuid primary key default gen_random_uuid()");
  expect(candlesBlock).toContain("provider text not null");
  expect(candlesBlock).toContain("ticker text not null");
  expect(candlesBlock).toContain("\"timestamp\" timestamptz not null");
  expect(candlesBlock).toContain("duplicate_of_id uuid null references public.historical_candles(id) on delete set null");
  expect(candlesBlock).toContain("unique (provider, ticker, interval, \"timestamp\", adjusted)");
  expect(candlesBlock).toContain("check (interval in ('1min', '5min', '15min', '30min', '1h', '1day'))");
  expect(candlesBlock).toContain("check (high >= low)");
  expect(candlesBlock).toContain("check (high >= open)");
  expect(candlesBlock).toContain("check (high >= close)");
  expect(candlesBlock).toContain("check (low <= open)");
  expect(candlesBlock).toContain("check (low <= close)");
  expect(candlesBlock).toContain("check (volume is null or volume >= 0)");
  expect(candlesBlock).toContain("check (length(btrim(ticker)) > 0)");
  expect(candlesBlock).toContain("check (length(btrim(provider)) > 0)");
  expect(candlesBlock).toContain("check (length(btrim(cache_key)) > 0)");

  expect(fetchRunsBlock).toContain("provider text not null");
  expect(fetchRunsBlock).toContain("request_type text not null");
  expect(fetchRunsBlock).toContain("ticker_count integer not null default 0");
  expect(fetchRunsBlock).toContain("candle_count integer not null default 0");
  expect(fetchRunsBlock).toContain("cache_hits integer not null default 0");
  expect(fetchRunsBlock).toContain("cache_misses integer not null default 0");
  expect(fetchRunsBlock).toContain("check (length(btrim(provider)) > 0)");
  expect(fetchRunsBlock).toContain("check (length(btrim(request_type)) > 0)");
  expect(fetchRunsBlock).toContain("check (ticker_count >= 0)");
  expect(fetchRunsBlock).toContain("check (candle_count >= 0)");
  expect(fetchRunsBlock).toContain("check (cache_hits >= 0)");
  expect(fetchRunsBlock).toContain("check (cache_misses >= 0)");
  expect(fetchRunsBlock).toContain(
    "check (provider_credits_estimated is null or provider_credits_estimated >= 0)",
  );
  expect(fetchRunsBlock).toContain(
    "check (provider_credits_used is null or provider_credits_used >= 0)",
  );
});

test("migration creates required indexes and enables restrictive RLS", () => {
  for (const fragment of [
    "create index if not exists historical_candles_ticker_interval_timestamp_idx",
    "on public.historical_candles (ticker, interval, \"timestamp\")",
    "create index if not exists historical_candles_provider_ticker_trading_day_idx",
    "on public.historical_candles (provider, ticker, trading_day)",
    "create index if not exists historical_candles_interval_timestamp_idx",
    "on public.historical_candles (interval, \"timestamp\")",
    "create index if not exists historical_candles_fetch_run_id_idx",
    "on public.historical_candles (fetch_run_id)",
    "create index if not exists historical_candles_validation_status_idx",
    "on public.historical_candles (validation_status)",
    "create index if not exists historical_candles_cache_key_idx",
    "on public.historical_candles (cache_key)",
    "create index if not exists historical_candles_trading_day_interval_idx",
    "on public.historical_candles (trading_day, interval)",
    "create index if not exists historical_candle_fetch_runs_provider_requested_at_idx",
    "on public.historical_candle_fetch_runs (provider, requested_at)",
    "create index if not exists historical_candle_fetch_runs_status_idx",
    "on public.historical_candle_fetch_runs (status)",
    "create index if not exists historical_candle_fetch_runs_interval_trading_day_range_idx",
    "alter table public.historical_candle_fetch_runs\n  enable row level security;",
    "alter table public.historical_candles\n  enable row level security;",
  ]) {
    expectSqlContains(fragment);
  }

  expect(executableSql).not.toMatch(/\bcreate\s+policy\b/u);
  expect(executableSql).not.toMatch(/\bgrant\s+/u);
  expect(executableSql).not.toMatch(/\busing\s*\(\s*true\s*\)/u);
  expect(executableSql).not.toMatch(/\bwith\s+check\s*\(\s*true\s*\)/u);
});

test("migration contains no seed data provider fetches functions or triggers", () => {
  for (const forbiddenPattern of [
    /\binsert\s+into\b/u,
    /\bupsert\b/u,
    /\bupdate\s+[\s\S]{0,120}\s+set\b/u,
    /\bdelete\s+from\b/u,
    /\bcopy\s+/u,
    /\bcreate\s+(?:or\s+replace\s+)?function\b/u,
    /\bcreate\s+trigger\b/u,
    /\bhttp\b/u,
    /\bfetch\b/u,
  ]) {
    expect(executableSql).not.toMatch(forbiddenPattern);
  }
});
