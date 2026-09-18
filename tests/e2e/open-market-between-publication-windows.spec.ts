import { expect, test } from "@playwright/test";

import { buildLiveMarketTrialReadinessSummary } from "../../lib/live-market-trial-readiness";
import { buildRecommendationEngineControlCenterSummary } from "../../lib/recommendation-engine-control-center";
import { deriveDayTradeMarketWaitState } from "../../lib/day-trade-market-wait-state";

test("market wait state keeps a positively open market outside publication windows", () => {
  expect(
    deriveDayTradeMarketWaitState({
      market_is_open: true,
      active_window: "closed",
    }),
  ).toEqual({
    is_wait_state: false,
    market_is_open: true,
    outside_official_publication_window: true,
  });

  expect(
    deriveDayTradeMarketWaitState({
      market_is_open: true,
      active_window: "morning",
    }),
  ).toEqual({
    is_wait_state: false,
    market_is_open: true,
    outside_official_publication_window: false,
  });
});

test("Engine Insights does not call a positively open market closed when a stale wait flag disagrees", () => {
  const summary = buildRecommendationEngineControlCenterSummary({
    scan_observability: {
      status: "healthy",
      visible_recommendation_count: 0,
      run_context: { data_age_minutes: 2 },
      summary: "No official scan is due between publication windows.",
      warnings: [],
    },
    day_trade_window_target: {
      current_window_count: { total: 0, strong: 0, valid: 0, experimental: 0 },
      ideal_max: 3,
      overflow_above_ideal_max: 0,
      status: "no_recommendations",
      warnings: [],
    },
    performance: {
      summary: {
        total_recommendations: 0,
        evaluated_recommendations: 0,
        pending_outcomes: 0,
        incomplete_outcomes: 0,
        unknown_outcomes: 0,
        target_before_stop_rate: null,
        stop_before_target_rate: null,
        average_best_r: null,
        average_worst_r: null,
      },
    },
    tier_performance: {
      comparison: { directional_status: "not_enough_data", notes: [] },
      evaluated_recommendations: 0,
    },
    learning_insights: { overall_learning_status: "not_enough_data", top_insights: [] },
    sample_quality: {
      status: "insufficient_data",
      learning_readiness: "not_ready",
      suggestions: [],
      gaps: [],
    },
    confidence_readiness: { status: "not_enough_data", blockers: [], warnings: [] },
    improvement_backlog: {
      overall_status: "data_first",
      top_items: [],
      all_items: [],
      blockers: [],
    },
    scan_run_history: {
      total_scan_runs: 1,
      review_required_run_count: 0,
      review_required_run_rate: 0,
      latest_run_status: "empty",
      status_breakdown: [],
      target_hit_rate: 0,
      warnings: [],
    },
    market_wait_state: {
      is_wait_state: true,
      market_is_open: true,
      outside_official_publication_window: false,
      next_window_label: "Power hour",
    },
    now: "2026-09-18T18:14:00.000Z",
  } as never);

  const scanHealth = summary.sections.find(
    (section) => section.section_id === "current_scan_health",
  );
  const publication = summary.sections.find(
    (section) => section.section_id === "window_target_health",
  );

  expect(summary.next_action).toMatchObject({
    action_id: "between_official_publication_windows",
    label: "Official publication is between windows",
  });
  expect(summary.overall_message).toContain("US market is open");
  expect(summary.overall_message).not.toContain("Closed market");
  expect(scanHealth?.summary).toContain("US market is open");
  expect(publication?.status).toBe("learning");
  expect(publication?.signals[0]).toMatchObject({
    formatted_value: "Between windows",
    message: "No recommendation outcome is implied before the next official publication window.",
  });
});

test("live trial readiness labels an open interval truthfully when a stale window says closed", () => {
  const summary = buildLiveMarketTrialReadinessSummary({
    supabase_public_env_available: true,
    market_session: { phase: "regular" },
    market_status: { dayType: "open", provider: "polygon" },
    scan_orchestration: {
      active_window: "closed",
      decision: "market_closed",
      market_is_open: true,
      next_window: "closed",
      next_window_starts_at: null,
      next_window_label: "Next trading day",
      fallback_calendar_scan_allowed: false,
      calendar_confidence: "provider_confirmed",
      scan_reason: "Legacy closed-window label.",
      trading_date: "2026-09-18",
      ny_time: "14:14",
    },
    scanner_universe: {
      selected_tickers: 50,
      scan_budget: { requested_tickers: 50 },
      dynamic_movers: true,
    },
    scanner_qa: {
      overall_status: "blocked",
      summary: "No official candidate ranking has run in this interval.",
      warnings: [],
    },
    serving_cadence: {
      next_window: "power_hour",
      next_window_starts_at: "15:00",
      status: "waiting",
      batch_type: "not_started",
      batch_status: "unknown",
      freshness_status: "unknown",
      no_trade_valid: false,
      visible_recommendation_count: 0,
      warnings: [],
    },
    batch_memory: {
      latest_batch: null,
      persistence_status: "ready",
      persistence_mode: "supabase",
      total_batches: 0,
    },
    scan_run_history: { total_scan_runs: 1, source_scope: "supabase" },
    performance: {
      summary: {
        total_recommendations: 0,
        evaluated_recommendations: 0,
        pending_outcomes: 0,
        incomplete_outcomes: 0,
      },
    },
    real_output_readiness: {
      overall_status: "unknown",
      coverage: { visible_recommendations: 0, market_data_coverage_rate: 0 },
    },
    data_mode_clarity: {
      has_demo_data: false,
      has_mock_broker_data: false,
      summary: "Live-data state is not yet observed.",
      execution_reality: "manual",
    },
    automation_scan_route_available: true,
    now: "2026-09-18T18:14:00.000Z",
  } as never);

  const marketWindow = summary.checks.find(
    (check) => check.check_id === "market_window",
  );
  const candidateRanking = summary.checks.find(
    (check) => check.check_id === "candidate_ranking",
  );
  const scannerQa = summary.checks.find(
    (check) => check.check_id === "scanner_qa",
  );

  expect(summary.overall_status).toBe("ready_with_warnings");
  expect(summary.summary).not.toContain("Closed market");
  expect(summary.copy.market_window_context).toContain("US market is open");
  expect(marketWindow).toMatchObject({
    status: "pass",
    message:
      "US market is open outside the configured official publication windows. Background observation is separately scheduled and gated.",
  });
  expect(candidateRanking?.message).toContain(
    "not scheduled between official publication windows",
  );
  expect(scannerQa?.message).toContain("between publication windows");
  expect(summary.suggested_monday_trial_action).toMatchObject({
    action_id: "between_official_publication_windows",
  });
});
