import { expect, test } from "@playwright/test";

import { buildDayTradeScanOrchestrationSummary } from "../../lib/day-trade-scan-orchestration";
import { buildDayTradeWindowRecommendationTargetSummary } from "../../lib/day-trade-window-recommendation-target";
import { buildRecommendationEngineControlCenterSummary } from "../../lib/recommendation-engine-control-center";
import { buildRecommendationServingCadenceSummary } from "../../lib/recommendation-serving-cadence";
import { buildScannerCandidateRankingSummary } from "../../lib/scanner-candidate-ranking";
import type { ScannerCandidate } from "../../lib/scanner";

const marketStatus = {
  isOpenDay: true,
  reason: "Trading day",
  date: "2026-09-17",
  dayType: "trading_day" as const,
  marketOpenTime: "09:30",
  marketCloseTime: "16:00",
  provider: "polygon",
};

function rankedCandidate(ticker: string, localScore: number) {
  return {
    ticker,
    company_name: `${ticker} Inc.`,
    mock_trend: "momentum",
    latest_close: 100,
    proposed_entry_low: 100,
    proposed_entry_high: 101,
    proposed_stop_loss: 98,
    proposed_target_1: 104,
    proposed_target_2: 106,
    proposed_risk_reward: 2.5,
    volume_ratio: 1.8,
    intraday_indicator_source: "fresh",
    intraday_indicator_cached_at: "2026-09-17T14:00:00.000Z",
    intraday_indicators: {
      latestPrice: 100,
      latestVolume: 200_000,
      averageVolume: 100_000,
    },
    local_score: localScore,
    setup_type: "OPENING_RANGE_BREAKOUT",
  } as unknown as ScannerCandidate & { local_score: number; setup_type: string };
}

test("a single Strong candidate is selected without a fill quota", () => {
  const summary = buildScannerCandidateRankingSummary({
    candidates: [rankedCandidate("ONE", 95)],
    scanWindow: "morning_momentum",
    now: new Date("2026-09-17T14:00:00.000Z"),
  });

  expect(summary).toMatchObject({
    target_min: 0,
    target_max: 3,
    selected_count: 1,
    target_status: "within_target",
  });
  expect(summary.warnings.map((warning) => warning.warning_id)).not.toContain(
    "below_selection_target",
  );
});

test("legacy ranking targets cannot expand the selective public cap", () => {
  const summary = buildScannerCandidateRankingSummary({
    candidates: [
      rankedCandidate("ONE", 95),
      rankedCandidate("TWO", 94),
      rankedCandidate("THREE", 93),
      rankedCandidate("FOUR", 92),
    ],
    // This describes obsolete caller intent. The central ranker must retain
    // the decision record while enforcing the current publication policy.
    targetMin: 6,
    targetMax: 10,
    scanWindow: "morning_momentum",
    now: new Date("2026-09-17T14:00:00.000Z"),
  });

  expect(summary).toMatchObject({
    target_min: 0,
    target_max: 3,
    selected_count: 3,
    overflow_count: 1,
    target_status: "within_target",
  });
  expect(summary.results).toHaveLength(4);
});

test("Experimental candidates remain in the decision record but never fill a public batch", () => {
  const experimentalCandidate = {
    ...rankedCandidate("RESEARCH", 0),
    volume_ratio: 0.5,
    proposed_risk_reward: 1.6,
  };
  const summary = buildScannerCandidateRankingSummary({
    candidates: [rankedCandidate("STRONG", 95), experimentalCandidate],
    scanWindow: "morning_momentum",
    now: new Date("2026-09-17T14:00:00.000Z"),
  });

  expect(summary.selected_count).toBe(1);
  expect(summary.selection.selected_tickers).toEqual(["STRONG"]);
  expect(summary.results).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        ticker: "RESEARCH",
        selected: false,
        selection_bucket: "not_selected",
        score: expect.objectContaining({ tier: "experimental" }),
      }),
    ]),
  );
});

test("one qualified candidate is publishable while an empty healthy window is explicit no_trade", () => {
  const orchestration = buildDayTradeScanOrchestrationSummary({
    now: "2026-09-17T14:00:00.000Z",
    marketStatus,
  });
  const singleCandidateCadence = buildRecommendationServingCadenceSummary({
    tradingDate: "2026-09-17",
    orchestration,
    ranking: {
      selected_count: 1,
      target_status: "within_target",
    } as never,
    visibleRecommendations: [],
    now: "2026-09-17T14:00:00.000Z",
  });
  const noTradeCadence = buildRecommendationServingCadenceSummary({
    tradingDate: "2026-09-17",
    orchestration,
    ranking: {
      selected_count: 0,
      target_status: "empty",
    } as never,
    visibleRecommendations: [],
    now: "2026-09-17T14:00:00.000Z",
  });
  const windowSummary = buildDayTradeWindowRecommendationTargetSummary({
    recommendations: [],
    current_window: "morning",
    now: "2026-09-17T14:00:00.000Z",
  });

  expect(singleCandidateCadence).toMatchObject({
    batch_target: { min: 0, max: 3 },
    serving_decision: "publish_official_batch",
    status: "ready",
    no_trade_valid: false,
  });
  expect(noTradeCadence).toMatchObject({
    serving_decision: "insufficient_quality",
    status: "no_trade_valid",
    no_trade_valid: true,
  });
  expect(windowSummary).toMatchObject({
    summary_version: "1.1",
    status: "no_recommendations",
    ideal_min: 0,
    ideal_max: 3,
    gap: expect.objectContaining({ gap_to_ideal_min: 0 }),
  });
  expect(windowSummary.warnings.map((warning) => warning.warning_id)).not.toContain(
    "too_few_recommendations_for_learning",
  );
});

test("Engine Insights reports a clean empty window as no_trade, never a count shortfall", () => {
  const dayTarget = buildDayTradeWindowRecommendationTargetSummary({
    recommendations: [],
    current_window: "morning",
    scan_observability: {
      status: "healthy",
    } as never,
    now: "2026-09-17T14:00:00.000Z",
  });
  const summary = buildRecommendationEngineControlCenterSummary({
    scan_observability: {
      status: "healthy",
      visible_recommendation_count: 0,
      run_context: { data_age_minutes: 2 },
      summary: "Clean scan completed with no trade-ready candidates.",
      warnings: [],
    },
    day_trade_window_target: dayTarget,
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
    learning_insights: {
      overall_learning_status: "not_enough_data",
      top_insights: [],
    },
    sample_quality: {
      status: "insufficient_data",
      learning_readiness: "not_ready",
      suggestions: [],
      gaps: [],
    },
    confidence_readiness: {
      status: "not_enough_data",
      blockers: [],
      warnings: [],
    },
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
    now: "2026-09-17T14:00:00.000Z",
  } as never);

  const publication = summary.sections.find(
    (section) => section.section_id === "window_target_health",
  );
  const trend = summary.sections.find(
    (section) => section.section_id === "scan_run_trend",
  );

  expect(publication).toMatchObject({
    title: "Selective publication",
    signals: [
      expect.objectContaining({
        formatted_value: "No trade",
        message: "No candidate was promoted merely to satisfy a count.",
      }),
      expect.objectContaining({ formatted_value: "0–3 cap" }),
    ],
  });
  expect(trend?.signals[0]).toMatchObject({
    label: "Runs needing review",
    formatted_value: "0 / 1",
  });
});
