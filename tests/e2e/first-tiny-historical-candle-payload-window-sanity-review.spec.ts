import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import { buildFirstTinyCandlePayloadRefetchResultVerification } from "../../lib/first-tiny-historical-candle-payload-refetch-result-verification";
import {
  buildFirstTinyCandlePayloadWindowSanityReview,
  firstTinyCandlePayloadWindowSanityReviewMarker,
} from "../../lib/first-tiny-historical-candle-payload-window-sanity-review";
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
  "docs/first-tiny-historical-candle-payload-window-sanity-review.md",
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
      next_action: { label: "Review payload window sanity" },
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
          "first_tiny_historical_candle_payload_window_review_test",
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

test("artifact documents payload window mismatch and blocked writes", () => {
  const runbook = readRunbook();

  expect(runbook).toContain("First Tiny Historical Candle Payload Window Sanity Review");
  expect(runbook).toContain(firstTinyCandlePayloadWindowSanityReviewMarker);
  expect(runbook).toContain("review status: `corrected_refetch_required`");
  expect(runbook).toContain("planned UTC start: `2026-07-08T13:45:00.000Z`");
  expect(runbook).toContain("planned UTC end: `2026-07-08T19:45:00.000Z`");
  expect(runbook).toContain(
    "payload UTC first timestamp: `2026-07-08T17:45:00.000Z`",
  );
  expect(runbook).toContain(
    "payload UTC last timestamp: `2026-07-08T19:55:00.000Z`",
  );
  expect(runbook).toContain("planned NY start: `2026-07-08 09:45 America/New_York`");
  expect(runbook).toContain("planned NY end: `2026-07-08 15:45 America/New_York`");
  expect(runbook).toContain(
    "payload NY first timestamp: `2026-07-08 13:45 America/New_York`",
  );
  expect(runbook).toContain(
    "payload NY last timestamp: `2026-07-08 15:55 America/New_York`",
  );
  expect(runbook).toContain("row count matches: `true`");
  expect(runbook).toContain("timestamps are 5min spaced: `true`");
  expect(runbook).toContain("window bounds match planned UTC: `false`");
  expect(runbook).toContain("candle write ready: `false`");
  expect(runbook).toContain("executable candle persistence plan ready: `false`");
  expect(runbook).toContain("review_twelve_data_time_window_semantics");
  expect(runbook).toContain("define_corrected_refetch_window");
  expect(runbook).toContain("keep_candle_persistence_disabled");
  expect(runbook).not.toContain("apikey");
  expect(runbook).not.toContain("TWELVE_DATA_API_KEY");
});

test("helper keeps current payload blocked pending corrected window review", () => {
  const review = buildFirstTinyCandlePayloadWindowSanityReview(
    buildFirstTinyCandlePayloadRefetchResultVerification({}),
  );

  expect(review.review_status).toBe("corrected_refetch_required");
  expect(review.planned_start_date_utc).toBe("2026-07-08T13:45:00.000Z");
  expect(review.planned_end_date_utc).toBe("2026-07-08T19:45:00.000Z");
  expect(review.payload_first_timestamp_utc).toBe("2026-07-08T17:45:00.000Z");
  expect(review.payload_last_timestamp_utc).toBe("2026-07-08T19:55:00.000Z");
  expect(review.planned_start_date_ny).toBe("2026-07-08 09:45 America/New_York");
  expect(review.planned_end_date_ny).toBe("2026-07-08 15:45 America/New_York");
  expect(review.payload_first_timestamp_ny).toBe(
    "2026-07-08 13:45 America/New_York",
  );
  expect(review.payload_last_timestamp_ny).toBe(
    "2026-07-08 15:55 America/New_York",
  );
  expect(review.payload_row_count).toBe(27);
  expect(review.expected_row_count).toBe(27);
  expect(review.row_count_matches).toBe(true);
  expect(review.timestamps_are_5min_spaced).toBe(true);
  expect(review.duplicate_timestamps).toBe(0);
  expect(review.out_of_order_candles).toBe(0);
  expect(review.payload_sequence_valid).toBe(true);
  expect(review.window_bounds_match_planned_utc).toBe(false);
  expect(review.operator_window_acceptance).toBe(false);
  expect(review.candle_write_ready).toBe(false);
  expect(review.executable_candle_persistence_plan_ready).toBe(false);
  expect(review.corrected_refetch_required).toBe(true);
  expect(review.possible_causes.timezone_conversion_mismatch).toBe("possible");
  expect(review.possible_causes.provider_ignores_or_adjusts_start_end).toBe(
    "possible",
  );
  expect(review.possible_causes.outputsize_or_order_window_behavior).toBe(
    "possible",
  );
  expect(review.possible_causes.market_window_definition_mismatch).toBe(
    "possible",
  );
  expect(review.possible_causes.payload_represents_later_window_than_planned).toBe(
    true,
  );
  expect(review.acceptance_criteria.expected_row_count_matches).toBe(true);
  expect(review.acceptance_criteria.five_minute_spacing_valid).toBe(true);
  expect(review.acceptance_criteria.no_duplicate_timestamps).toBe(true);
  expect(review.acceptance_criteria.no_out_of_order_candles).toBe(true);
  expect(
    review.acceptance_criteria
      .first_timestamp_within_accepted_intended_analysis_window,
  ).toBe(false);
  expect(
    review.acceptance_criteria
      .last_timestamp_within_accepted_intended_analysis_window,
  ).toBe(false);
  expect(review.acceptance_criteria.timezone_interpretation_documented).toBe(
    false,
  );
  expect(review.acceptance_criteria.operator_explicitly_accepts_window).toBe(
    false,
  );
  expect(review.provider_call_executed).toBe(false);
  expect(review.candles_persisted).toBe(false);
  expect(review.raw_response_persisted).toBe(false);
  expect(review.fetch_run_persisted).toBe(false);
  expect(review.synthetic_outcomes_persisted).toBe(false);
  expect(review.replay_executed).toBe(false);
  expect(review.scanner_behavior_changed).toBe(false);
  expect(review.live_ranking_changed).toBe(false);
});

test("diagnostics render window sanity review without provider or database writes", () => {
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
        "first_tiny_historical_candle_payload_window_sanity_review",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.title).toBe(
      "First Tiny Candle Payload Window Sanity Review",
    );
    expect(section?.lines).toContain("Review status: corrected_refetch_required");
    expect(section?.lines).toContain("Ticker: AAPL");
    expect(section?.lines).toContain("Interval: 5min");
    expect(section?.lines).toContain("Trading day: 2026-07-08");
    expect(section?.lines).toContain(
      "Planned UTC window: 2026-07-08T13:45:00.000Z -> 2026-07-08T19:45:00.000Z",
    );
    expect(section?.lines).toContain(
      "Payload UTC window: 2026-07-08T17:45:00.000Z -> 2026-07-08T19:55:00.000Z",
    );
    expect(section?.lines).toContain(
      "Planned NY window: 2026-07-08 09:45 America/New_York -> 2026-07-08 15:45 America/New_York",
    );
    expect(section?.lines).toContain(
      "Payload NY window: 2026-07-08 13:45 America/New_York -> 2026-07-08 15:55 America/New_York",
    );
    expect(section?.lines).toContain("Row count matches: yes");
    expect(section?.lines).toContain("5min spacing valid: yes");
    expect(section?.lines).toContain("Window bounds match planned UTC: no");
    expect(section?.lines).toContain("Operator window acceptance: no");
    expect(section?.lines).toContain("Candle write ready: no");
    expect(section?.lines).toContain(
      "Executable candle persistence plan ready: no",
    );
    expect(section?.lines).toContain("Corrected refetch required: yes");
    expect(section?.metrics.read_only_static_review).toBe(true);
    expect(section?.metrics.review_status).toBe("corrected_refetch_required");
    expect(section?.metrics.planned_start_date_utc).toBe(
      "2026-07-08T13:45:00.000Z",
    );
    expect(section?.metrics.payload_first_timestamp_utc).toBe(
      "2026-07-08T17:45:00.000Z",
    );
    expect(section?.metrics.row_count_matches).toBe(true);
    expect(section?.metrics.timestamps_are_5min_spaced).toBe(true);
    expect(section?.metrics.window_bounds_match_planned_utc).toBe(false);
    expect(section?.metrics.candle_write_ready).toBe(false);
    expect(section?.metrics.executable_candle_persistence_plan_ready).toBe(false);
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(section?.metrics.recommended_next_steps).toContain(
      "review_twelve_data_time_window_semantics",
    );
    expect(section?.metrics.recommended_next_steps).toContain(
      "define_corrected_refetch_window",
    );
    expect(section?.metrics.recommended_next_steps).toContain(
      "keep_candle_persistence_disabled",
    );
    expect(intelligence?.lines).toContain(
      "First tiny payload window review: review required / write blocked",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "first_tiny_historical_candle_payload_window_sanity_review",
    );
    const reviewText = JSON.stringify({
      lines: section?.lines,
      metrics: section?.metrics,
    });
    expect(reviewText).not.toContain("apikey");
    expect(reviewText).not.toContain("TWELVE_DATA_API_KEY");
  } finally {
    globalThis.fetch = originalFetch;
  }
});
