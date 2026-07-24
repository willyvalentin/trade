import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyCorrectedCandlePayloadRefetchPlan,
  firstTinyCorrectedCandlePayloadRefetchPlanMarker,
} from "../../lib/first-tiny-historical-candle-corrected-payload-refetch-plan";
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

const runbookPath = join(
  process.cwd(),
  "docs/first-tiny-historical-candle-corrected-payload-refetch-plan.md",
);
const evaluatedAt = "2026-07-09T18:00:00.000Z";

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
      next_action: { label: "Review corrected payload refetch plan" },
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
          "first_tiny_historical_candle_corrected_refetch_plan_test",
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

test("artifact documents corrected dry-run plan and no-write guarantees", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("Corrected First Tiny Historical Candle Payload Refetch Plan");
  expect(runbook).toContain(firstTinyCorrectedCandlePayloadRefetchPlanMarker);
  expect(runbook).toContain("plan status: `planned`");
  expect(runbook).toContain("dry run only: `true`");
  expect(runbook).toContain("reason: `prior_payload_window_mismatch`");
  expect(runbook).toContain(
    "intended NY start: `2026-07-08 09:45 America/New_York`",
  );
  expect(runbook).toContain(
    "intended NY end: `2026-07-08 15:45 America/New_York`",
  );
  expect(runbook).toContain(
    "intended UTC start: `2026-07-08T13:45:00.000Z`",
  );
  expect(runbook).toContain(
    "intended UTC end: `2026-07-08T19:45:00.000Z`",
  );
  expect(runbook).toContain(
    "prior returned NY window: `2026-07-08 13:45 America/New_York -> 2026-07-08 15:55 America/New_York`",
  );
  expect(runbook).toContain("prior payload accepted for write: `false`");
  expect(runbook).toContain("timezone_explicit_ny_start_end");
  expect(runbook).toContain("utc_start_end_with_timezone_validation");
  expect(runbook).toContain("outputsize_from_intended_end");
  expect(runbook).toContain("full_day_fetch_then_filter_locally");
  expect(runbook).toContain(
    "Recommended strategy: `full_day_fetch_then_filter_locally`",
  );
  expect(runbook).toContain("provider call allowed now: `false`");
  expect(runbook).toContain("candle persistence allowed now: `false`");
  expect(runbook).toContain("requires separate operator approval: `true`");
  expect(runbook).toContain("configure_corrected_payload_refetch_approval_signal");
  expect(runbook).not.toContain("apikey");
  expect(runbook).not.toContain("TWELVE_DATA_API_KEY");
});

test("helper records prior mismatch and keeps corrected plan dry-run only", () => {
  const verification = buildFirstTinyCandlePayloadRefetchResultVerification({});
  const windowReview =
    buildFirstTinyCandlePayloadWindowSanityReview(verification);
  const plan = buildFirstTinyCorrectedCandlePayloadRefetchPlan(
    verification,
    windowReview,
  );

  expect(plan.corrected_refetch_plan_status).toBe("planned");
  expect(plan.dry_run_only).toBe(true);
  expect(plan.reason).toBe("prior_payload_window_mismatch");
  expect(plan.provider).toBe("twelve_data");
  expect(plan.endpoint).toBe("time_series");
  expect(plan.ticker).toBe("AAPL");
  expect(plan.interval).toBe("5min");
  expect(plan.trading_day).toBe("2026-07-08");
  expect(plan.intended_session).toBe("official_windows");
  expect(plan.intended_ny_start).toBe("2026-07-08 09:45 America/New_York");
  expect(plan.intended_ny_end).toBe("2026-07-08 15:45 America/New_York");
  expect(plan.intended_utc_start).toBe("2026-07-08T13:45:00.000Z");
  expect(plan.intended_utc_end).toBe("2026-07-08T19:45:00.000Z");
  expect(plan.expected_interval_minutes).toBe(5);
  expect(plan.expected_accepted_row_count).toBe(73);
  expect(plan.prior_payload.planned_utc_window).toBe(
    "2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z",
  );
  expect(plan.prior_payload.returned_utc_window).toBe(
    "2026-07-08T17:45:00.000Z -> 2026-07-08T19:55:00.000Z",
  );
  expect(plan.prior_payload.returned_ny_window).toBe(
    "2026-07-08 13:45 America/New_York -> 2026-07-08 15:55 America/New_York",
  );
  expect(plan.prior_payload.accepted_for_write).toBe(false);
  expect(plan.prior_payload.review_status).toBe("corrected_refetch_required");
  expect(plan.candidate_strategies.map((strategy) => strategy.strategy_id)).toEqual(
    [
      "timezone_explicit_ny_start_end",
      "utc_start_end_with_timezone_validation",
      "outputsize_from_intended_end",
      "full_day_fetch_then_filter_locally",
    ],
  );
  expect(plan.recommended_strategy_id).toBe(
    "full_day_fetch_then_filter_locally",
  );
  expect(
    plan.candidate_strategies.find(
      (strategy) =>
        strategy.strategy_id === "full_day_fetch_then_filter_locally",
    )?.recommendation,
  ).toBe("recommended");
  expect(plan.provider_call_allowed_now).toBe(false);
  expect(plan.candle_persistence_allowed_now).toBe(false);
  expect(plan.raw_response_persistence_allowed_now).toBe(false);
  expect(plan.replay_allowed_now).toBe(false);
  expect(plan.scanner_effect_allowed_now).toBe(false);
  expect(plan.requires_separate_operator_approval).toBe(true);
  expect(plan.future_validation_rules).toContain(
    "accepted_payload_covers_intended_ny_0945_to_1545",
  );
  expect(plan.future_validation_rules).toContain(
    "candle_write_remains_disabled_until_later_action",
  );
  expect(plan.provider_call_executed).toBe(false);
  expect(plan.candles_persisted).toBe(false);
  expect(plan.raw_response_persisted).toBe(false);
  expect(plan.fetch_run_persisted).toBe(false);
  expect(plan.synthetic_outcomes_persisted).toBe(false);
  expect(plan.replay_executed).toBe(false);
  expect(plan.scanner_behavior_changed).toBe(false);
  expect(plan.live_ranking_changed).toBe(false);
});

test("diagnostics render corrected plan without provider or database writes", () => {
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
        "corrected_first_tiny_historical_candle_payload_refetch_plan",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe(
      "Corrected First Tiny Candle Payload Refetch Plan",
    );
    expect(section?.lines).toContain("Status: planned / dry-run only");
    expect(section?.lines).toContain("Reason: prior_payload_window_mismatch");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(
      "Intended NY window: 2026-07-08 09:45 America/New_York -> 2026-07-08 15:45 America/New_York",
    );
    expect(section?.lines).toContain(
      "Intended UTC window: 2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z",
    );
    expect(section?.lines).toContain(
      "Previous payload NY window: 2026-07-08 13:45 America/New_York -> 2026-07-08 15:55 America/New_York",
    );
    expect(section?.lines).toContain("Previous payload accepted for write: no");
    expect(section?.lines).toContain(
      "Recommended strategy: full_day_fetch_then_filter_locally",
    );
    expect(section?.lines).toContain("Provider call allowed now: no");
    expect(section?.lines).toContain("Candle persistence allowed now: no");
    expect(section?.lines).toContain("Raw response persistence allowed now: no");
    expect(section?.lines).toContain(
      "Requires separate operator approval: yes",
    );
    expect(section?.metrics.corrected_refetch_plan_status).toBe("planned");
    expect(section?.metrics.dry_run_only).toBe(true);
    expect(section?.metrics.provider_call_allowed_now).toBe(false);
    expect(section?.metrics.candle_persistence_allowed_now).toBe(false);
    expect(section?.metrics.raw_response_persistence_allowed_now).toBe(false);
    expect(section?.metrics.replay_allowed_now).toBe(false);
    expect(section?.metrics.scanner_effect_allowed_now).toBe(false);
    expect(section?.metrics.requires_separate_operator_approval).toBe(true);
    expect(section?.metrics.previous_payload_accepted_for_write).toBe(false);
    expect(section?.metrics.recommended_strategy).toBe(
      "full_day_fetch_then_filter_locally",
    );
    expect(section?.metrics.candidate_strategy_ids).toContain(
      "timezone_explicit_ny_start_end",
    );
    expect(section?.metrics.candidate_strategy_ids).toContain(
      "full_day_fetch_then_filter_locally",
    );
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.recommended_next_steps).toContain(
      "review_corrected_refetch_strategy",
    );
    expect(section?.metrics.recommended_next_steps).toContain(
      "configure_corrected_payload_refetch_approval_signal",
    );
    expect(section?.metrics.recommended_next_steps).toContain(
      "keep_candle_persistence_disabled",
    );
    expect(intelligence?.lines).toContain(
      "Corrected first tiny payload refetch plan: planned / prior window mismatch / write disabled",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "corrected_first_tiny_historical_candle_payload_refetch_plan",
    );
    const planText = JSON.stringify({
      lines: section?.lines,
      metrics: section?.metrics,
    });
    expect(planText).not.toContain("apikey");
    expect(planText).not.toContain("TWELVE_DATA_API_KEY");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
