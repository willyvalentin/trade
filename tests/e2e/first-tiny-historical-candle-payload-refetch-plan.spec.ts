import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyHistoricalCandlePayloadRefetchPlan,
  firstTinyHistoricalCandlePayloadRefetchPlanMarker,
} from "../../lib/first-tiny-historical-candle-payload-refetch-plan";
import { firstTinyHistoricalCandlePersistenceDryRunPlanMarker } from "../../lib/first-tiny-historical-candle-persistence-dry-run-plan";
import { firstTinyFetchRunAuditWriteResultVerificationMarker } from "../../lib/first-tiny-historical-fetch-run-audit-write-result-verification";
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
  "docs/first-tiny-historical-candle-payload-refetch-plan.md",
);
const evaluatedAt = "2026-07-09T16:30:00.000Z";

function readRunbook() {
  return readFileSync(runbookPath, "utf8");
}

function validEnv(overrides: Record<string, string | undefined> = {}) {
  return {
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED: "true",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_OPERATOR_LABEL:
      "willy_manual_payload_refetch_001",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REFERENCE:
      "first_tiny_candle_payload_refetch_20260709_aapl",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_TICKER: "AAPL",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_MAX_REQUESTS: "1",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_ESTIMATED_CREDITS: "1",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED: "false",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED:
      "false",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REPLAY_ALLOWED: "false",
    TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED: "false",
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
      next_action: { label: "Review payload refetch plan" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 12:30 America/New_York",
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
          "first_tiny_historical_candle_payload_refetch_plan_test",
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

test("runbook documents payload refetch scope and no-write guarantees", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("First Tiny Historical Candle Payload Refetch Plan");
  expect(runbook).toContain(firstTinyHistoricalCandlePayloadRefetchPlanMarker);
  expect(runbook).toContain(firstTinyFetchRunAuditWriteResultVerificationMarker);
  expect(runbook).toContain(firstTinyHistoricalCandlePersistenceDryRunPlanMarker);
  expect(runbook).toContain("fc58a15a-1748-4e8d-b7d9-03e4826c1d5f");
  expect(runbook).toContain("AAPL");
  expect(runbook).toContain("5min");
  expect(runbook).toContain("2026-07-08T13:45:00.000Z");
  expect(runbook).toContain("2026-07-08T19:45:00.000Z");
  expect(runbook).toContain("provider call allowed now: `false`");
  expect(runbook).toContain("candles persisted: `false`");
  expect(runbook).toContain("raw response persisted: `false`");
  expect(runbook).toContain("No Invented Candle Values");
  expect(runbook).toContain("Approved payload refetch execute action");
});

test("no signal is not configured and remains planning-only", () => {
  const plan = buildFirstTinyHistoricalCandlePayloadRefetchPlan({ env: {} });

  expect(plan.refetch_plan_status).toBe("planned");
  expect(plan.plan_marker).toBe(firstTinyHistoricalCandlePayloadRefetchPlanMarker);
  expect(plan.dry_run_only).toBe(true);
  expect(plan.source_verification).toBe(
    firstTinyFetchRunAuditWriteResultVerificationMarker,
  );
  expect(plan.existing_fetch_run_id).toBe(
    "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
  );
  expect(plan.approval_status).toBe("not_configured");
  expect(plan.readiness.ready_to_accept_future_signal).toBe(true);
  expect(plan.readiness.ready_to_propose_payload_refetch_action).toBe(false);
  expect(plan.readiness.execute_now).toBe(false);
  expect(plan.permissions.provider_call_allowed_now).toBe(false);
  expect(plan.permissions.candle_persistence_allowed_now).toBe(false);
  expect(plan.permissions.raw_response_persistence_allowed_now).toBe(false);
  expect(plan.permissions.replay_allowed_now).toBe(false);
  expect(plan.permissions.scanner_effect_allowed_now).toBe(false);
  expect(plan.safety.provider_call_executed).toBe(false);
  expect(plan.safety.candles_persisted).toBe(false);
  expect(plan.safety.raw_response_persisted).toBe(false);
  expect(plan.safety.no_ohlcv_values_invented).toBe(true);
});

test("valid signal is valid for future refetch but still does not execute", () => {
  const plan = buildFirstTinyHistoricalCandlePayloadRefetchPlan({
    env: validEnv(),
  });

  expect(plan.approval_status).toBe("valid_for_future_payload_refetch");
  expect(plan.blockers).toEqual([]);
  expect(plan.readiness.ready_to_accept_future_signal).toBe(true);
  expect(plan.readiness.ready_to_propose_payload_refetch_action).toBe(true);
  expect(plan.readiness.execute_now).toBe(false);
  expect(plan.permissions.provider_call_allowed_now).toBe(false);
  expect(plan.permissions.candle_persistence_allowed_now).toBe(false);
  expect(plan.permissions.raw_response_persistence_allowed_now).toBe(false);
  expect(plan.safety.provider_fetch_added).toBe(false);
  expect(plan.safety.historical_fetch_added).toBe(false);
  expect(plan.safety.candles_persisted).toBe(false);
  expect(plan.safety.raw_response_persisted).toBe(false);
});

test("refetch scope matches the verified AAPL request exactly", () => {
  const plan = buildFirstTinyHistoricalCandlePayloadRefetchPlan({ env: {} });

  expect(plan.refetch_scope).toMatchObject({
    provider: "twelve_data",
    endpoint: "time_series",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    start_date: "2026-07-08T13:45:00.000Z",
    end_date: "2026-07-08T19:45:00.000Z",
    timezone: "America/New_York",
    session: "regular",
    adjusted: false,
    request_count: 1,
    estimated_credits: 1,
    expected_candle_rows: 27,
    cache_key:
      "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false",
    existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
  });
});

test("invalid signal values produce explicit blockers", () => {
  const cases: Array<[Record<string, string | undefined>, string]> = [
    [
      validEnv({ TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_TICKER: "MSFT" }),
      "ticker_mismatch",
    ],
    [
      validEnv({ TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_MAX_REQUESTS: "2" }),
      "max_requests_not_one",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_ESTIMATED_CREDITS: "2",
      }),
      "estimated_credits_not_one",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED: "true",
      }),
      "candle_persist_not_allowed",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED:
          "true",
      }),
      "raw_response_persist_not_allowed",
    ],
    [
      validEnv({ TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REPLAY_ALLOWED: "true" }),
      "replay_not_allowed",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED: "true",
      }),
      "scanner_effect_not_allowed",
    ],
  ];

  for (const [env, blocker] of cases) {
    const plan = buildFirstTinyHistoricalCandlePayloadRefetchPlan({ env });
    expect(plan.approval_status).toBe("invalid");
    expect(plan.blockers).toContain(blocker);
    expect(plan.permissions.provider_call_allowed_now).toBe(false);
    expect(plan.safety.candles_persisted).toBe(false);
  }
});

test("diagnostics render payload refetch plan without provider or write calls", () => {
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
        "first_tiny_historical_candle_payload_refetch_plan",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe("First Tiny Candle Payload Refetch Plan");
    expect(section?.lines).toContain("Status: planned / dry-run only");
    expect(section?.lines).toContain(
      `Source verification: ${firstTinyFetchRunAuditWriteResultVerificationMarker}`,
    );
    expect(section?.lines).toContain(
      "Existing fetch run id: fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    );
    expect(section?.lines).toContain("Provider: twelve_data");
    expect(section?.lines).toContain("Endpoint: time_series");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain("Request count: 1");
    expect(section?.lines).toContain("Estimated credits: 1");
    expect(section?.lines).toContain("Expected candle rows: 27");
    expect(section?.lines).toContain("Provider call allowed now: no");
    expect(section?.lines).toContain("Candle persistence allowed now: no");
    expect(section?.lines).toContain(
      "Raw response persistence allowed now: no",
    );
    expect(section?.lines).toContain("Replay allowed now: no");
    expect(section?.lines).toContain("Scanner effect allowed now: no");
    expect(section?.lines).toContain("Approval status: not_configured");
    expect(section?.lines).toContain("Ready to accept future signal: yes");
    expect(section?.lines).toContain(
      "Ready to propose payload refetch action: no",
    );
    expect(section?.metrics.provider_call_allowed_now).toBe(false);
    expect(section?.metrics.candle_persistence_allowed_now).toBe(false);
    expect(section?.metrics.raw_response_persistence_allowed_now).toBe(false);
    expect(section?.metrics.replay_allowed_now).toBe(false);
    expect(section?.metrics.scanner_effect_allowed_now).toBe(false);
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.no_ohlcv_values_invented).toBe(true);
    expect(section?.metrics.recommended_next_steps).toContain(
      "require_separate_action_before_provider_refetch",
    );
    expect(intelligence?.lines).toContain(
      "First tiny candle payload refetch: planned / approval not_configured / provider call no / write no",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_payload_refetch_plan",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
