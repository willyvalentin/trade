import { expect, test } from "@playwright/test";
import { readFileSync } from "node:fs";
import { join } from "node:path";

import { buildDailyLearningReviewSummary } from "../../lib/daily-learning-review";
import {
  buildFirstTinyCorrectedPayloadRefetchApproval,
  type FirstTinyCorrectedPayloadRefetchApprovalEnv,
} from "../../lib/first-tiny-historical-candle-corrected-payload-refetch-approval";
import { buildFirstTinyCorrectedCandlePayloadRefetchPlan } from "../../lib/first-tiny-historical-candle-corrected-payload-refetch-plan";
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
  "docs/first-tiny-historical-candle-corrected-payload-refetch-approval.md",
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
      "corrected-refetch-approval-001",
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

function approvalFor(env: FirstTinyCorrectedPayloadRefetchApprovalEnv) {
  const verification = buildFirstTinyCandlePayloadRefetchResultVerification({});
  const windowReview =
    buildFirstTinyCandlePayloadWindowSanityReview(verification);
  const correctedPlan = buildFirstTinyCorrectedCandlePayloadRefetchPlan(
    verification,
    windowReview,
  );

  return buildFirstTinyCorrectedPayloadRefetchApproval({
    env,
    window_review: windowReview,
    corrected_plan: correctedPlan,
  });
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
      next_action: { label: "Review corrected payload refetch approval" },
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
          "first_tiny_historical_candle_corrected_refetch_approval_test",
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

test("runbook documents approval env contract and no-execute state", () => {
  const runbook = readRunbook();

  expect(runbook).toContain(
    "Corrected First Tiny Candle Payload Refetch Approval Gate",
  );
  expect(runbook).toContain(
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_APPROVED=true",
  );
  expect(runbook).toContain(
    "TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY=full_day_fetch_then_filter_locally",
  );
  expect(runbook).toContain("valid_for_future_corrected_payload_refetch");
  expect(runbook).toContain(
    "Corrected First Tiny Candle Payload Refetch Execute Attempt",
  );
  expect(runbook).toContain("provider call executed: `false`");
  expect(runbook).toContain("candles persisted: `false`");
  expect(runbook).not.toContain("apikey");
  expect(runbook).not.toContain("TWELVE_DATA_API_KEY");
});

test("no signal is not configured but can accept future signal when plan is ready", () => {
  const approval = approvalFor({});

  expect(approval.approval_status).toBe("not_configured");
  expect(approval.signal.signal_active).toBe(false);
  expect(approval.readiness.ready_to_accept_future_signal).toBe(true);
  expect(approval.readiness.ready_to_propose_corrected_refetch_action).toBe(
    false,
  );
  expect(approval.readiness.provider_call_allowed_now).toBe(false);
  expect(approval.readiness.candle_persistence_allowed_now).toBe(false);
});

test("valid signal is ready for future proposal but executes nothing", () => {
  const approval = approvalFor(validEnv());

  expect(approval.approval_status).toBe(
    "valid_for_future_corrected_payload_refetch",
  );
  expect(approval.signal.signal_active).toBe(true);
  expect(approval.signal.operator_label_present).toBe(true);
  expect(approval.signal.approval_reference_present).toBe(true);
  expect(approval.validation.prior_window_review_requires_correction).toBe(true);
  expect(approval.validation.previous_payload_not_accepted_for_write).toBe(true);
  expect(approval.readiness.ready_to_propose_corrected_refetch_action).toBe(
    true,
  );
  expect(approval.readiness.provider_call_allowed_now).toBe(false);
  expect(approval.readiness.candle_persistence_allowed_now).toBe(false);
  expect(approval.readiness.raw_response_persistence_allowed_now).toBe(false);
  expect(approval.safety.provider_call_executed).toBe(false);
  expect(approval.safety.candles_persisted).toBe(false);
  expect(approval.safety.raw_response_persisted).toBe(false);
  expect(approval.safety.replay_executed).toBe(false);
  expect(approval.safety.scanner_behavior_changed).toBe(false);
  expect(approval.safety.live_ranking_changed).toBe(false);
});

test.describe("invalid corrected approval signals", () => {
  const cases: Array<[
    string,
    FirstTinyCorrectedPayloadRefetchApprovalEnv,
    string,
  ]> = [
    [
      "wrong ticker",
      { TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_TICKER: "MSFT" },
      "ticker_mismatch",
    ],
    [
      "wrong strategy",
      {
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_STRATEGY:
          "timezone_explicit_ny_start_end",
      },
      "strategy_mismatch",
    ],
    [
      "max requests not one",
      { TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_MAX_REQUESTS: "2" },
      "max_requests_not_one",
    ],
    [
      "estimated credits not one",
      { TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_ESTIMATED_CREDITS: "2" },
      "estimated_credits_not_one",
    ],
    [
      "candle persist true",
      {
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED:
          "true",
      },
      "candle_persist_not_allowed",
    ],
    [
      "raw response persist true",
      {
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED:
          "true",
      },
      "raw_response_persist_not_allowed",
    ],
    [
      "replay true",
      { TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REPLAY_ALLOWED: "true" },
      "replay_not_allowed",
    ],
    [
      "scanner effect true",
      {
        TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED:
          "true",
      },
      "scanner_effect_not_allowed",
    ],
    [
      "missing operator label",
      { TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_OPERATOR_LABEL: "" },
      "operator_label_missing",
    ],
    [
      "missing reference",
      { TURE_FIRST_TINY_CORRECTED_PAYLOAD_REFETCH_REFERENCE: "" },
      "approval_reference_missing",
    ],
  ];

  for (const [label, overrides, blocker] of cases) {
    test(`${label} blocks approval`, () => {
      const approval = approvalFor(validEnv(overrides));

      expect(approval.approval_status).toBe("invalid");
      expect(approval.blockers).toContain(blocker);
      expect(approval.readiness.provider_call_allowed_now).toBe(false);
      expect(approval.readiness.candle_persistence_allowed_now).toBe(false);
    });
  }
});

test("prior window review not corrected required blocks approval", () => {
  const verification = buildFirstTinyCandlePayloadRefetchResultVerification({});
  const windowReview = {
    ...buildFirstTinyCandlePayloadWindowSanityReview(verification),
    review_status: "review_required" as const,
    corrected_refetch_required: false,
  };
  const correctedPlan = buildFirstTinyCorrectedCandlePayloadRefetchPlan(
    verification,
    windowReview,
  );
  const approval = buildFirstTinyCorrectedPayloadRefetchApproval({
    env: validEnv(),
    window_review: windowReview,
    corrected_plan: correctedPlan,
  });

  expect(approval.approval_status).toBe("invalid");
  expect(approval.blockers).toContain(
    "prior_window_review_not_corrected_required",
  );
  expect(approval.readiness.provider_call_allowed_now).toBe(false);
  expect(approval.readiness.candle_persistence_allowed_now).toBe(false);
});

test("diagnostics render approval gate without provider or database writes", () => {
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
        "corrected_first_tiny_historical_candle_payload_refetch_approval",
    );
    const intelligence = diagnostics.sections.find(
      (item) => item.section_id === "intelligence_overview",
    );

    expect(fetchCalls).toBe(0);
    expect(section).toBeTruthy();
    expect(section?.lines).toContain("Approval status: not_configured");
    expect(section?.lines).toContain("Signal active: no");
    expect(section?.lines).toContain("Expected ticker: AAPL");
    expect(section?.lines).toContain(
      "Expected strategy: full_day_fetch_then_filter_locally",
    );
    expect(section?.lines).toContain("Expected max requests: 1");
    expect(section?.lines).toContain("Expected estimated credits: 1");
    expect(section?.lines).toContain("Candle persistence allowed: no");
    expect(section?.lines).toContain("Raw response persistence allowed: no");
    expect(section?.lines).toContain("Replay allowed: no");
    expect(section?.lines).toContain("Scanner effect allowed: no");
    expect(section?.lines).toContain("Prior window mismatch confirmed: yes");
    expect(section?.lines).toContain("Corrected plan ready: yes");
    expect(section?.lines).toContain("Provider call allowed now: no");
    expect(section?.lines).toContain("Candle persistence allowed now: no");
    expect(section?.lines).toContain("Ready to accept future signal: yes");
    expect(section?.lines).toContain(
      "Ready to propose corrected refetch action: no",
    );
    expect(section?.metrics.approval_status).toBe("not_configured");
    expect(section?.metrics.ready_to_accept_future_signal).toBe(true);
    expect(section?.metrics.ready_to_propose_corrected_refetch_action).toBe(
      false,
    );
    expect(section?.metrics.provider_call_allowed_now).toBe(false);
    expect(section?.metrics.candle_persistence_allowed_now).toBe(false);
    expect(section?.metrics.raw_response_persistence_allowed_now).toBe(false);
    expect(section?.metrics.provider_call_executed).toBe(false);
    expect(section?.metrics.candles_persisted).toBe(false);
    expect(section?.metrics.raw_response_persisted).toBe(false);
    expect(section?.metrics.fetch_run_persisted).toBe(false);
    expect(section?.metrics.replay_executed).toBe(false);
    expect(section?.metrics.scanner_behavior_changed).toBe(false);
    expect(section?.metrics.live_ranking_changed).toBe(false);
    expect(intelligence?.lines).toContain(
      "Corrected first tiny payload refetch approval: not_configured / execute no / write no",
    );
    expect(diagnostics.copy_payloads.json.content).toContain(
      "corrected_first_tiny_historical_candle_payload_refetch_approval",
    );
  } finally {
    globalThis.fetch = originalFetch;
  }
});
