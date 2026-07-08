import { expect, test } from "@playwright/test";

import {
  buildDailyLearningReviewSummary,
  type DailyLearningReviewSummary,
} from "../../lib/daily-learning-review";
import { buildMarketDiagnosticsConsoleSummary } from "../../lib/market-diagnostics-console";
import type { MarketDiagnosticsConsoleInput } from "../../lib/market-diagnostics-console";
import {
  buildModelGovernanceSummary,
  staticModelGovernanceRegistry,
  type TureModelChangeRecord,
} from "../../lib/model-change-governance";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

const tradingDay = "2026-07-06";
const evaluatedAt = "2026-07-06T15:00:00.000Z";

function snapshot(ticker: string): RecommendationSnapshot {
  return {
    id: `snap-${ticker}`,
    snapshot_fingerprint: `snap-${ticker}`,
    recommendation_id: `rec-${ticker}`,
    scan_run_id: "rec_scan_run_governance",
    ticker,
    company_name: null,
    recommended_at: "2026-07-06T14:30:00.000Z",
    app_timestamp: "2026-07-06T14:30:00.000Z",
    window: "midday",
    status: "visible",
    source_mode: "official",
    data_mode: "supabase",
    market_session_phase: "regular",
    market_session_risk: null,
    market_session_source: null,
    is_visible: true,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 100,
    entry_low: 100,
    entry_high: 100,
    stop: 98,
    target: 104,
    side: "long",
    risk_per_share: 2,
    reward_per_share: 4,
    planned_risk_reward: 2,
    confidence: 72,
    score: 70,
    rating: "valid",
    label: null,
    type: null,
    rationale: "Positive momentum with high relative volume.",
    reason: null,
    catalyst: null,
    primary_risk: null,
    market_data_snapshot: null,
    quote_price: 100,
    volume: null,
    liquidity: null,
    spread: null,
    freshness: null,
    data_age_minutes: null,
    intake_quality_json: null,
    scan_observability_json: null,
    empty_state_json: null,
    quality_json: null,
    payload_json: {
      batch_fingerprint: "rec_batch_governance",
      visibility_status: "visible",
      setup_type: "momentum breakout",
      entry_type_metadata: {
        entry_type: "pullback_limit",
        trigger_semantics: "touch_entry",
      },
      market_regime: { regime: "risk_on" },
      plan_price_freshness: {
        classification: "fresh",
        reference_price: 100,
      },
      day_trade_window_recommendation_target: { tier: "valid" },
    },
    was_taken: false,
    linked_position_id: null,
    created_at: "2026-07-06T14:30:00.000Z",
    updated_at: "2026-07-06T14:30:00.000Z",
  };
}

function outcome(ticker: string): RecommendationOutcome {
  return {
    id: `outcome-${ticker}`,
    snapshot_id: `snap-${ticker}`,
    snapshot_fingerprint: `snap-${ticker}`,
    recommendation_id: `rec-${ticker}`,
    ticker,
    side: "long",
    recommended_at: "2026-07-06T14:30:00.000Z",
    evaluated_at: evaluatedAt,
    horizon: "15m",
    status: "neither_hit",
    entry: 100,
    stop: 98,
    target: 104,
    entry_triggered: true,
    entry_triggered_at: evaluatedAt,
    target_hit: false,
    target_hit_at: null,
    stop_hit: false,
    stop_hit_at: null,
    first_terminal_event: "neither",
    best_price_after_recommendation: 101,
    worst_price_after_recommendation: 99,
    best_r: 0.4,
    worst_r: -0.1,
    eod_price: null,
    eod_r: null,
    current_price: 100,
    current_r: 0,
    max_favorable_excursion: 1,
    max_adverse_excursion: -1,
    time_to_entry_minutes: 2,
    time_to_target_minutes: null,
    time_to_stop_minutes: null,
    source: "intraday_candles",
    provider: "twelve_data",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: {},
    created_at: evaluatedAt,
    updated_at: evaluatedAt,
  };
}

function dailyReview() {
  return buildDailyLearningReviewSummary({
    trading_day: tradingDay,
    latest_batch_fingerprint: "rec_batch_governance",
    snapshots: [snapshot("AAPL")],
    outcomes: [outcome("AAPL")],
    now: evaluatedAt,
  });
}

function baseDiagnosticsInput(
  dailyLearningReview: DailyLearningReviewSummary,
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
      scanner_readiness: { selected_ticker_count: 1 },
      outcome_readiness: {
        route_available: true,
        evaluated_recommendations: dailyLearningReview.evaluated_outcome_count,
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
      next_action: { label: "Review governance" },
      blockers: [],
      warnings: [],
    },
    scan_orchestration: {
      current_utc_time: evaluatedAt,
      current_ny_time: "2026-07-06 11:00 America/New_York",
      calendar_confidence: "high",
      provider_calendar_available: true,
      fallback_calendar_scan_allowed: false,
      active_window: "midday",
      decision: "scan_allowed",
      should_scan_now: true,
      next_window: "power_hour",
      next_window_label: "Power Hour",
      next_window_starts_at: "2026-07-06T19:00:00.000Z",
      warnings: [],
      official_scan_windows: [],
      official_window_statuses: [],
    },
    serving_cadence: {
      warnings: [],
      serving_decision: "served",
      no_trade_valid: false,
      visible_recommendation_count: dailyLearningReview.visible_evaluated_count,
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
      selected_tickers: ["AAPL"],
    },
    scanner_output_qa: {
      overall_status: "healthy",
      summary: "healthy",
      warnings: [],
      recommended_next_action: { label: "No action" },
      candidate_count: 1,
      metadata_coverage: {
        recommendation_rows_with_data_timestamp: 1,
        recommendation_rows_with_provider_source: 1,
        explicit_gap_count: 0,
        missing_metadata_fields: [],
        qa_checked_source_path: "model_change_governance_test",
        metadata_missing_at_stage: null,
      },
    },
    real_output_readiness: {
      overall_status: "ready",
      blockers: [],
      warnings: [],
      coverage: {
        strong_count: 0,
        valid_count: 1,
        experimental_count: 0,
      },
    },
    batch_memory: {
      warnings: [],
      latest_batch: {
        batch_fingerprint: "rec_batch_governance",
        scan_run_fingerprint: "rec_scan_run_governance",
      },
      persistence_status: "ok",
      persistence_mode: "persisted",
      total_batches: 1,
    },
    scan_run_history: {
      top_warnings: [],
      latest_run_status: "completed",
      total_scan_runs: 1,
    },
    daily_targets: {
      warnings: [],
      total_recommendations_today: 1,
      full_day_recommendation_target_min: 4,
      full_day_recommendation_target_max: 12,
    },
    day_window_target: {
      status: "served",
      strong_candidate_gate: {
        candidates_considered_for_strong: 1,
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
        total_recommendations: 1,
        pending_outcomes: 0,
        evaluated_recommendations: dailyLearningReview.evaluated_outcome_count,
      },
    },
    daily_learning_review: dailyLearningReview,
    scan_readback: null,
    outcome_evaluation: null,
    outcome_learning: null,
    entry_tuning_proposal: null,
    recommendation_output_enrichment: null,
    metadata_coverage: null,
  } as unknown as MarketDiagnosticsConsoleInput;
}

test("model governance summary builds from static registry", () => {
  const summary = buildModelGovernanceSummary();

  expect(summary.advisory_only).toBe(true);
  expect(summary.summary.total_changes).toBeGreaterThanOrEqual(7);
  expect(summary.summary.advisory_only_count).toBeGreaterThanOrEqual(7);
  expect(summary.current_intelligence_layers).toContain("setup_labeling_v1");
  expect(summary.current_intelligence_layers).toContain(
    "confidence_calibration_v1",
  );
  expect(summary.latest_change?.id).toBe("confidence_calibration_v1_advisory");
});

test("model governance safety locks automatic changes off", () => {
  const summary = buildModelGovernanceSummary();

  expect(summary.safety.automatic_model_updates_enabled).toBe(false);
  expect(summary.safety.live_ranking_changes_enabled).toBe(false);
  expect(summary.safety.rollback_required_for_live_changes).toBe(true);
  expect(summary.safety.minimum_sample_size_required).toBe(100);
});

test("model governance records promotion requirements for every layer", () => {
  for (const record of staticModelGovernanceRegistry) {
    expect(record.advisory_only).toBe(true);
    expect(record.rollback_available).toBe(true);
    expect(record.promotion_requirements).toContain(
      "minimum_outcome_count_100",
    );
    expect(record.promotion_requirements).toContain("manual_approval_required");
    expect(record.promotion_requirements).toContain("rollback_plan_exists");
  }
});

test("model governance counts changes by type and status", () => {
  const summary = buildModelGovernanceSummary();

  expect(summary.summary.changes_by_status.advisory_only).toBe(
    summary.summary.advisory_only_count,
  );
  expect(summary.summary.changes_by_type.setup_labeling).toBe(1);
  expect(summary.summary.changes_by_type.confidence_calibration).toBe(1);
});

test("model governance resolves proposed, rejected, and rolled back records", () => {
  const base = staticModelGovernanceRegistry[0];
  const records: TureModelChangeRecord[] = [
    { ...base, id: "proposed_change", status: "proposed", introduced_action_number: 300 },
    { ...base, id: "rejected_change", status: "rejected", introduced_action_number: 301 },
    { ...base, id: "rolled_back_change", status: "rolled_back", introduced_action_number: 302 },
  ];
  const summary = buildModelGovernanceSummary({ records });

  expect(summary.proposed_changes.map((item) => item.id)).toContain(
    "proposed_change",
  );
  expect(summary.rejected_changes.map((item) => item.id)).toContain(
    "rejected_change",
  );
  expect(summary.rolled_back_changes.map((item) => item.id)).toContain(
    "rolled_back_change",
  );
  expect(summary.latest_change?.id).toBe("rolled_back_change");
});

test("model governance missing input does not throw", () => {
  expect(() => buildModelGovernanceSummary(null)).not.toThrow();
  expect(buildModelGovernanceSummary(null).advisory_only).toBe(true);
});

test("daily learning review includes model governance compact readback", () => {
  const summary = dailyReview();

  expect(summary.model_governance.advisory_only).toBe(true);
  expect(summary.model_governance.safety.automatic_model_updates_enabled).toBe(
    false,
  );
  expect(summary.model_governance.promotion_ready_changes).toHaveLength(0);
  expect(summary.model_governance.changes_needing_more_data).toContain(
    "confidence_calibration_v1_advisory",
  );
});

test("market diagnostics renders model change governance section", () => {
  const diagnostics = buildMarketDiagnosticsConsoleSummary(
    baseDiagnosticsInput(dailyReview()),
  );
  const section = diagnostics.sections.find(
    (item) => item.section_id === "model_change_governance",
  );
  const dailySection = diagnostics.sections.find(
    (item) => item.section_id === "daily_learning_review",
  );

  expect(section).toBeTruthy();
  expect(section?.lines.join("\n")).toContain("Advisory mode: yes");
  expect(section?.lines.join("\n")).toContain(
    "Automatic model updates: disabled",
  );
  expect(section?.lines.join("\n")).toContain("Live ranking changes: disabled");
  expect(section?.lines.join("\n")).toContain(
    "Latest change: confidence_calibration_v1_advisory",
  );
  expect(section?.lines.join("\n")).toContain(
    "Active/advisory/shadow/rejected/rolled back: 0/7/0/0/0",
  );
  expect(section?.lines.join("\n")).toContain("Rollback required: yes");
  expect(dailySection?.lines.join("\n")).toContain(
    "Model governance: advisory-only",
  );
  expect(dailySection?.lines.join("\n")).toContain(
    "Automatic updates enabled: no",
  );
});
