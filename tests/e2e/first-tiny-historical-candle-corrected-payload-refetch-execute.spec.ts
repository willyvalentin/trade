import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { POST as correctedPayloadRefetchPOST } from "../../app/api/historical-backfill/first-tiny-corrected-candle-payload-refetch/route";
import { GET as correctedPayloadRefetchPingGET } from "../../app/api/historical-backfill/first-tiny-corrected-candle-payload-refetch/ping/route";
import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyCorrectedPayloadRefetchApproval,
  type FirstTinyCorrectedPayloadRefetchApprovalEnv,
} from "../../lib/first-tiny-historical-candle-corrected-payload-refetch-approval";
import { buildFirstTinyCorrectedCandlePayloadRefetchPlan } from "../../lib/first-tiny-historical-candle-corrected-payload-refetch-plan";
import {
  buildFirstTinyCorrectedPayloadRefetchExecuteReadiness,
  executeFirstTinyCorrectedPayloadRefetch,
  firstTinyCorrectedCandlePayloadRefetchExecuteMarker,
} from "../../lib/first-tiny-historical-candle-corrected-payload-refetch-execute";
import { buildFirstTinyCandlePayloadRefetchResultVerification } from "../../lib/first-tiny-historical-candle-payload-refetch-result-verification";
import { buildFirstTinyCandlePayloadWindowSanityReview } from "../../lib/first-tiny-historical-candle-payload-window-sanity-review";
import {
  buildHistoricalCandleStorageReadback,
  historicalCandleStorageReadbackToDetection,
} from "../../lib/historical-candle-storage-readback";
import {
  buildMarketDiagnosticsConsoleSummary,
  type MarketDiagnosticsConsoleInput,
} from "../../lib/market-diagnostics-console";
import type { TwelveDataHistoricalRawResponse } from "../../lib/twelve-data-historical-response-parser";

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-candle-corrected-payload-refetch-execute-attempt.md",
);
const evaluatedAt = "2026-07-09T18:00:00.000Z";

function readRunbook() {
  return readFileSync(runbookPath, "utf8");
}

function validEnv(
  overrides: FirstTinyCorrectedPayloadRefetchApprovalEnv = {},
): FirstTinyCorrectedPayloadRefetchApprovalEnv {
  return {
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED: "true",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_OPERATOR_LABEL:
      "operator-a",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REFERENCE:
      "corrected-refetch-execute-001",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_TICKER: "AAPL",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY:
      "full_day_fetch_then_filter_locally",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_MAX_REQUESTS: "1",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_ESTIMATED_CREDITS: "1",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED:
      "false",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED:
      "false",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REPLAY_ALLOWED: "false",
    TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED:
      "false",
    ...overrides,
  };
}

function correctedPlanAndApproval(
  env: FirstTinyCorrectedPayloadRefetchApprovalEnv,
) {
  const verification = buildFirstTinyCandlePayloadRefetchResultVerification({});
  const windowReview =
    buildFirstTinyCandlePayloadWindowSanityReview(verification);
  const correctedPlan = buildFirstTinyCorrectedCandlePayloadRefetchPlan(
    verification,
    windowReview,
  );
  const approval = buildFirstTinyCorrectedPayloadRefetchApproval({
    env,
    window_review: windowReview,
    corrected_plan: correctedPlan,
  });

  return { correctedPlan, approval };
}

function mockTwelveDataResponse(input: {
  startMinutes?: number;
  count?: number;
} = {}): TwelveDataHistoricalRawResponse {
  const startMinutes = input.startMinutes ?? 9 * 60 + 30;
  const count = input.count ?? 79;
  const values = Array.from({ length: count }, (_, index) => {
    const totalMinutes = startMinutes + index * 5;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const price = 213 + index * 0.1;

    return {
      datetime: `2026-07-08 ${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")}:00`,
      open: price.toFixed(2),
      high: (price + 0.3).toFixed(2),
      low: (price - 0.2).toFixed(2),
      close: (price + 0.1).toFixed(2),
      volume: String(100000 + index),
    };
  });

  return {
    meta: {
      symbol: "AAPL",
      interval: "5min",
      exchange_timezone: "America/New_York",
      exchange: "NASDAQ",
      mic_code: "XNGS",
      type: "Common Stock",
    },
    values,
    status: "ok",
  };
}

async function routePost(input: {
  secret?: string | null;
  body?: unknown;
  env?: Record<string, string | undefined>;
}) {
  const trackedKeys = [
    "AUTOMATION_SECRET",
    "TWELVE_DATA_API_KEY",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE",
    "SUPABASE_SERVICE_ROLE_SECRET",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_OPERATOR_LABEL",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REFERENCE",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_TICKER",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_MAX_REQUESTS",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_ESTIMATED_CREDITS",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REPLAY_ALLOWED",
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED",
    "TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED",
    "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED",
    "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED",
  ];
  const previous = Object.fromEntries(
    trackedKeys.map((key) => [key, process.env[key]]),
  );
  process.env.AUTOMATION_SECRET = input.env?.AUTOMATION_SECRET ?? "route-secret";
  process.env.TWELVE_DATA_API_KEY = input.env?.TWELVE_DATA_API_KEY ?? "test-key";
  delete process.env.NEXT_PUBLIC_SUPABASE_URL;
  delete process.env.SUPABASE_SERVICE_ROLE_KEY;
  delete process.env.SUPABASE_SERVICE_ROLE;
  delete process.env.SUPABASE_SERVICE_ROLE_SECRET;
  for (const [key, value] of Object.entries(input.env ?? {})) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  const headers = new Headers({ "content-type": "application/json" });
  if (input.secret !== undefined && input.secret !== null) {
    headers.set("x-automation-secret", input.secret);
  }

  try {
    return await correctedPayloadRefetchPOST(
      new Request(
        "http://localhost/api/historical-backfill/first-tiny-corrected-candle-payload-refetch",
        {
          method: "POST",
          headers,
          body: JSON.stringify(input.body ?? {}),
        },
      ),
    );
  } finally {
    for (const key of trackedKeys) {
      if (previous[key] === undefined) delete process.env[key];
      else process.env[key] = previous[key];
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
      next_action: { label: "Review corrected payload refetch execute" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-09 14:00 America/New_York",
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
          "first_tiny_historical_candle_corrected_refetch_execute_test",
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

test("runbook documents corrected execute curl and result shapes", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "Corrected First Tiny Candle Payload Refetch Execute Attempt",
  );
  expect(runbook).toContain(
    "https://trade.valentinlabs.com/api/historical-backfill/first-tiny-corrected-candle-payload-refetch",
  );
  expect(runbook).toContain(
    "--data '{\"execute_corrected_payload_refetch\":true}'",
  );
  expect(runbook).toContain("corrected_payload_refetch_completed_no_persist");
  expect(runbook).toContain(
    "corrected_payload_refetch_window_mismatch_no_persist",
  );
  expect(runbook).toContain("corrected_payload_refetch_failed_no_persist");
  expect(runbook).toContain(
    "Disable the corrected payload-refetch approval signal immediately after a successful response.",
  );
});

test("ping endpoint is reachable and safe", async () => {
  const response = await correctedPayloadRefetchPingGET();
  const body = await response.json();

  expect(response.status).toBe(200);
  expect(response.headers.get("Cache-Control")).toBe("no-store");
  expect(body.ok).toBe(true);
  expect(body.route_ping).toBe(true);
  expect(body.route_build_marker).toBe(
    firstTinyCorrectedCandlePayloadRefetchExecuteMarker,
  );
  expect(body.provider_call_executed).toBe(false);
  expect(body.candles_persisted).toBe(false);
  expect(body.raw_response_persisted).toBe(false);
  expect(body.fetch_run_persisted).toBe(false);
  expect(body.replay_executed).toBe(false);
  expect(body.scanner_behavior_changed).toBe(false);
});

test("route auth and request shape are enforced safely", async () => {
  const missingAuth = await routePost({
    secret: null,
    body: { execute_corrected_payload_refetch: true },
  });
  const authCheck = await routePost({
    secret: "route-secret",
    body: { auth_check_only: true },
  });
  const missingExecute = await routePost({
    secret: "route-secret",
    body: {},
  });
  const override = await routePost({
    secret: "route-secret",
    body: { execute_corrected_payload_refetch: true, ticker: "MSFT" },
  });
  const missingAuthBody = await missingAuth.json();
  const authCheckBody = await authCheck.json();
  const missingExecuteBody = await missingExecute.json();
  const overrideBody = await override.json();

  expect(missingAuth.status).toBe(401);
  expect(missingAuthBody.error).toBe("Unauthorized.");
  expect(missingAuthBody.provider_call_executed).toBe(false);
  expect(authCheck.status).toBe(200);
  expect(authCheckBody.auth_check_only).toBe(true);
  expect(authCheckBody.provider_call_executed).toBe(false);
  expect(missingExecute.status).toBe(400);
  expect(missingExecuteBody.error).toBe(
    "execute_corrected_payload_refetch_true_required",
  );
  expect(override.status).toBe(400);
  expect(overrideBody.error).toBe(
    "arbitrary_scope_or_persistence_override_rejected",
  );
  expect(overrideBody.candles_persisted).toBe(false);
});

test("no approval or old approval families do not authorize corrected refetch", async () => {
  const noApproval = await routePost({
    secret: "route-secret",
    body: { execute_corrected_payload_refetch: true },
    env: {},
  });
  const oldProviderApproval = await routePost({
    secret: "route-secret",
    body: { execute_corrected_payload_refetch: true },
    env: { TURE_FIRST_TINY_HISTORICAL_FETCH_APPROVED: "true" },
  });
  const auditWriteApproval = await routePost({
    secret: "route-secret",
    body: { execute_corrected_payload_refetch: true },
    env: { TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED: "true" },
  });
  const priorPayloadApproval = await routePost({
    secret: "route-secret",
    body: { execute_corrected_payload_refetch: true },
    env: { TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED: "true" },
  });
  const noApprovalBody = await noApproval.json();
  const oldProviderBody = await oldProviderApproval.json();
  const auditBody = await auditWriteApproval.json();
  const priorPayloadBody = await priorPayloadApproval.json();

  expect(noApprovalBody.execution_status).toBe("not_approved");
  expect(oldProviderBody.execution_status).toBe("not_approved");
  expect(auditBody.execution_status).toBe("not_approved");
  expect(priorPayloadBody.execution_status).toBe("not_approved");
  expect(noApprovalBody.provider_call_executed).toBe(false);
});

test("invalid approval values block before provider call", async () => {
  const cases: Array<[FirstTinyCorrectedPayloadRefetchApprovalEnv, string]> = [
    [
      validEnv({ TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_TICKER: "MSFT" }),
      "ticker_mismatch",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY:
          "timezone_explicit_ny_start_end",
      }),
      "strategy_mismatch",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_MAX_REQUESTS: "2",
      }),
      "max_requests_not_one",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_ESTIMATED_CREDITS: "2",
      }),
      "estimated_credits_not_one",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED:
          "true",
      }),
      "candle_persist_not_allowed",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED:
          "true",
      }),
      "raw_response_persist_not_allowed",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REPLAY_ALLOWED: "true",
      }),
      "replay_not_allowed",
    ],
    [
      validEnv({
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED:
          "true",
      }),
      "scanner_effect_not_allowed",
    ],
  ];

  for (const [env, blocker] of cases) {
    let providerCalls = 0;
    const { correctedPlan, approval } = correctedPlanAndApproval(env);
    const result = await executeFirstTinyCorrectedPayloadRefetch({
      execute_corrected_payload_refetch: true,
      corrected_plan: correctedPlan,
      approval,
      cache_lookup: () => ({ available: true, hit: false }),
      provider_call: () => {
        providerCalls += 1;
        return {
          ok: true,
          http_status: 200,
          response: mockTwelveDataResponse(),
        };
      },
    });

    expect(result.execution_status).toBe("blocked");
    expect(result.blockers).toContain(blocker);
    expect(providerCalls).toBe(0);
    expect(result.candles_persisted).toBe(false);
  }
});

test("valid route approval executes exactly one mocked provider call and filters intended window", async () => {
  let providerCalls = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = (async () => {
    providerCalls += 1;
    return Response.json(mockTwelveDataResponse(), { status: 200 });
  }) as typeof fetch;

  try {
    const response = await routePost({
      secret: "route-secret",
      body: { execute_corrected_payload_refetch: true },
      env: validEnv(),
    });
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(providerCalls).toBe(1);
    expect(body.execution_status).toBe(
      "corrected_payload_refetch_completed_no_persist",
    );
    expect(body.provider_call_executed).toBe(true);
    expect(body.provider_call_succeeded).toBe(true);
    expect(body.strategy_id).toBe("full_day_fetch_then_filter_locally");
    expect(body.request_count).toBe(1);
    expect(body.estimated_credits).toBe(1);
    expect(body.filtered_candles).toBe(73);
    expect(body.valid_filtered_candles).toBe(73);
    expect(body.invalid_filtered_candles).toBe(0);
    expect(body.filtered_first_timestamp).toBe("2026-07-08T13:45:00.000Z");
    expect(body.filtered_last_timestamp).toBe("2026-07-08T19:45:00.000Z");
    expect(body.filtered_window_matches_intended).toBe(true);
    expect(body.normalized_payload).toHaveLength(73);
    expect(body.normalized_payload[0]).toMatchObject({
      provider: "twelve_data",
      ticker: "AAPL",
      interval: "5min",
      adjusted: false,
      trading_day: "2026-07-08",
      session: "regular",
      timezone: "America/New_York",
      fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    });
    expect(body.candles_persisted).toBe(false);
    expect(body.raw_response_persisted).toBe(false);
    expect(body.fetch_run_persisted).toBe(false);
    expect(body.replay_executed).toBe(false);
    expect(body.scanner_behavior_changed).toBe(false);
    expect(body.live_ranking_changed).toBe(false);
    expect(JSON.stringify(body)).not.toContain("apikey");
    expect(JSON.stringify(body)).not.toContain("test-key");
  } finally {
    globalThis.fetch = originalFetch;
  }
});

test("window mismatch and provider failure persist nothing", async () => {
  let providerCalls = 0;
  const { correctedPlan, approval } = correctedPlanAndApproval(validEnv());
  const mismatch = await executeFirstTinyCorrectedPayloadRefetch({
    execute_corrected_payload_refetch: true,
    corrected_plan: correctedPlan,
    approval,
    cache_lookup: () => ({ available: true, hit: false, source: "mock_cache" }),
    provider_call: () => {
      providerCalls += 1;
      return {
        ok: true,
        http_status: 200,
        response: mockTwelveDataResponse({
          startMinutes: 13 * 60 + 45,
          count: 27,
        }),
      };
    },
  });
  const failed = await executeFirstTinyCorrectedPayloadRefetch({
    execute_corrected_payload_refetch: true,
    corrected_plan: correctedPlan,
    approval,
    cache_lookup: () => ({ available: true, hit: false, source: "mock_cache" }),
    provider_call: () => {
      providerCalls += 1;
      return {
        ok: false,
        http_status: 500,
        response: null,
        error_type: "provider_http_error",
      };
    },
  });

  expect(providerCalls).toBe(2);
  expect(mismatch.execution_status).toBe(
    "corrected_payload_refetch_window_mismatch_no_persist",
  );
  expect(mismatch.provider_call_executed).toBe(true);
  expect(mismatch.filtered_window_matches_intended).toBe(false);
  expect(mismatch.candles_persisted).toBe(false);
  expect(mismatch.raw_response_persisted).toBe(false);
  expect(failed.execution_status).toBe(
    "corrected_payload_refetch_failed_no_persist",
  );
  expect(failed.provider_call_executed).toBe(true);
  expect(failed.candles_persisted).toBe(false);
  expect(failed.raw_response_persisted).toBe(false);
  expect(failed.fetch_run_persisted).toBe(false);
});

test("cache hit skips provider and returns response-only filtered payload", async () => {
  let providerCalls = 0;
  const { correctedPlan, approval } = correctedPlanAndApproval(validEnv());
  const providerResponse = mockTwelveDataResponse();
  const parsedRows =
    providerResponse.values?.map((value) => ({
      provider: "twelve_data" as const,
      ticker: "AAPL" as const,
      interval: "5min" as const,
      timestamp:
        value.datetime === "2026-07-08 09:30:00"
          ? "2026-07-08T13:30:00.000Z"
          : value.datetime === "2026-07-08 09:35:00"
            ? "2026-07-08T13:35:00.000Z"
            : value.datetime === "2026-07-08 09:40:00"
              ? "2026-07-08T13:40:00.000Z"
              : new Date(
                  Date.UTC(
                    2026,
                    6,
                    8,
                    Number(value.datetime?.slice(11, 13) ?? "0") + 4,
                    Number(value.datetime?.slice(14, 16) ?? "0"),
                  ),
                ).toISOString(),
      open: Number(value.open),
      high: Number(value.high),
      low: Number(value.low),
      close: Number(value.close),
      volume: Number(value.volume),
      adjusted: false as const,
      trading_day: "2026-07-08" as const,
      session: "regular" as const,
      timezone: "America/New_York" as const,
      fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f" as const,
    })) ?? [];
  const result = await executeFirstTinyCorrectedPayloadRefetch({
    execute_corrected_payload_refetch: true,
    corrected_plan: correctedPlan,
    approval,
    cache_lookup: () => ({
      available: true,
      hit: true,
      source: "mock_cache",
      candles: parsedRows,
    }),
    provider_call: () => {
      providerCalls += 1;
      return {
        ok: true,
        http_status: 200,
        response: providerResponse,
      };
    },
  });

  expect(providerCalls).toBe(0);
  expect(result.execution_status).toBe(
    "corrected_payload_refetch_cache_hit_no_provider_call",
  );
  expect(result.provider_call_executed).toBe(false);
  expect(result.filtered_candles).toBe(73);
  expect(result.normalized_payload_returned).toBe(true);
  expect(result.candles_persisted).toBe(false);
});

test("diagnostics rendering does not execute corrected refetch", () => {
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
        "corrected_first_tiny_historical_candle_payload_refetch_execute",
    );
    const readiness = buildFirstTinyCorrectedPayloadRefetchExecuteReadiness();

    expect(fetchCalls).toBe(0);
    expect(readiness.execution_status).toBe("not_approved");
    expect(section).toBeTruthy();
    expect(section?.lines).toContain("Status: not_approved");
    expect(section?.lines).toContain(
      "Strategy: full_day_fetch_then_filter_locally",
    );
    expect(section?.lines).toContain("Provider: Twelve Data");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain("Provider call executed: no");
    expect(section?.lines).toContain("Filtered candles: 0");
    expect(section?.lines).toContain("Filtered window matches intended: no");
    expect(section?.lines).toContain("Candles persisted: no");
    expect(section?.lines).toContain("Raw response persisted: no");
    expect(section?.lines).toContain("Fetch run persisted: no");
    expect(section?.lines).toContain("Replay executed: no");
    expect(section?.lines).toContain("Scanner behavior changed: no");
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.normalized_payload_rows).toBe(0);
    expect(diagnostics.copy_payloads.json.content).toContain(
      "corrected_first_tiny_historical_candle_payload_refetch_execute",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
