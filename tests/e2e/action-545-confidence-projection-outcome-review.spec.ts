import { expect, test } from "@playwright/test";

import {
  buildConfidenceProjectionOutcomeReview,
  compareConfidenceProjectionCalibration,
  mapOutcomeToBinaryConfidenceScore,
} from "../../lib/confidence-projection-outcome-review";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

function snapshot(
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  return {
    id: "snapshot-aapl",
    snapshot_fingerprint: "fingerprint-aapl",
    recommendation_id: "rec-aapl",
    scan_run_id: "scan-run-1",
    ticker: "AAPL",
    company_name: "Apple",
    recommended_at: "2026-07-17T13:45:00.000Z",
    app_timestamp: "2026-07-17T13:45:00.000Z",
    window: "morning",
    status: "visible",
    source_mode: "supabase",
    data_mode: "live",
    market_session_phase: null,
    market_session_risk: null,
    market_session_source: null,
    is_visible: true,
    is_demo: false,
    is_mock: false,
    is_real: true,
    entry: 100,
    entry_low: 99,
    entry_high: 101,
    stop: 98,
    target: 104,
    side: "long",
    risk_per_share: 2,
    reward_per_share: 4,
    planned_risk_reward: 2,
    confidence: 82,
    score: 82,
    rating: "strong",
    label: "strong",
    type: "PULLBACK_CONTINUATION",
    rationale: null,
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
      setup_type: "PULLBACK_CONTINUATION",
      recommendation_tier: "strong",
      scan_window: "morning",
    },
    was_taken: false,
    linked_position_id: null,
    created_at: "2026-07-17T13:45:00.000Z",
    updated_at: "2026-07-17T13:45:00.000Z",
    ...overrides,
  };
}

function outcome(
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  return {
    id: "outcome-aapl-15m",
    snapshot_id: "snapshot-aapl",
    snapshot_fingerprint: "fingerprint-aapl",
    recommendation_id: "rec-aapl",
    ticker: "AAPL",
    side: "long",
    recommended_at: "2026-07-17T13:45:00.000Z",
    evaluated_at: "2026-07-17T14:15:00.000Z",
    horizon: "15m",
    status: "target_hit",
    entry: 100,
    stop: 98,
    target: 104,
    entry_triggered: true,
    entry_triggered_at: "2026-07-17T13:50:00.000Z",
    target_hit: true,
    target_hit_at: "2026-07-17T14:10:00.000Z",
    stop_hit: false,
    stop_hit_at: null,
    first_terminal_event: "target_hit",
    best_price_after_recommendation: 105,
    worst_price_after_recommendation: 99,
    best_r: 2.5,
    worst_r: -0.5,
    eod_price: 104,
    eod_r: 2,
    current_price: 104,
    current_r: 2,
    max_favorable_excursion: 2.5,
    max_adverse_excursion: -0.5,
    time_to_entry_minutes: 5,
    time_to_target_minutes: 25,
    time_to_stop_minutes: null,
    source: "intraday_candles",
    provider: "twelve_data",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: {},
    created_at: "2026-07-17T14:15:00.000Z",
    updated_at: "2026-07-17T14:15:00.000Z",
    ...overrides,
  };
}

test.describe("Action 545 confidence projection outcome review", () => {
  test("maps completed successful and unsuccessful outcomes to binary scores", () => {
    expect(mapOutcomeToBinaryConfidenceScore(outcome())).toBe(100);
    expect(
      mapOutcomeToBinaryConfidenceScore(
        outcome({
          status: "stop_hit",
          target_hit: false,
          stop_hit: true,
          first_terminal_event: "stop_hit",
        }),
      ),
    ).toBe(0);
    expect(
      mapOutcomeToBinaryConfidenceScore(
        outcome({
          status: "pending",
          target_hit: null,
          stop_hit: null,
          first_terminal_event: "unknown",
        }),
      ),
    ).toBeNull();
  });

  test("classifies projected confidence as closer, worse, neutral, or insufficient", () => {
    expect(
      compareConfidenceProjectionCalibration({
        originalConfidence: 82,
        projectedConfidence: 87,
        outcomeScore: 100,
      }).comparison,
    ).toBe("improved");
    expect(
      compareConfidenceProjectionCalibration({
        originalConfidence: 82,
        projectedConfidence: 87,
        outcomeScore: 0,
      }).comparison,
    ).toBe("worsened");
    expect(
      compareConfidenceProjectionCalibration({
        originalConfidence: 82,
        projectedConfidence: 82,
        outcomeScore: 100,
      }).comparison,
    ).toBe("neutral");
    expect(
      compareConfidenceProjectionCalibration({
        originalConfidence: null,
        projectedConfidence: 82,
        outcomeScore: 100,
      }).comparison,
    ).toBe("insufficient_data");
  });

  test("builds aggregate review with groups, rates, sample quality, and no-effect flags", () => {
    const snapshots = [
      snapshot(),
      snapshot({
        id: "snapshot-msft",
        snapshot_fingerprint: "fingerprint-msft",
        recommendation_id: "rec-msft",
        ticker: "MSFT",
        window: "midday",
        confidence: 100,
        score: 100,
        rating: "valid",
        label: "valid",
        type: "PULLBACK_CONTINUATION",
        payload_json: {
          setup_type: "PULLBACK_CONTINUATION",
          recommendation_tier: "valid",
          scan_window: "midday",
        },
      }),
      snapshot({
        id: "snapshot-nvda",
        snapshot_fingerprint: "fingerprint-nvda",
        recommendation_id: "rec-nvda",
        ticker: "NVDA",
        window: "power_hour",
        confidence: null,
        score: null,
      }),
    ];
    const outcomes = [
      outcome(),
      outcome({
        id: "outcome-msft-15m",
        snapshot_id: "snapshot-msft",
        snapshot_fingerprint: "fingerprint-msft",
        recommendation_id: "rec-msft",
        ticker: "MSFT",
        status: "entry_not_triggered",
        target_hit: false,
        stop_hit: false,
        first_terminal_event: "expired",
        eod_r: null,
        current_r: null,
      }),
      outcome({
        id: "outcome-nvda-15m",
        snapshot_id: "snapshot-nvda",
        snapshot_fingerprint: "fingerprint-nvda",
        recommendation_id: "rec-nvda",
        ticker: "NVDA",
        status: "target_hit",
      }),
    ];

    const review = buildConfidenceProjectionOutcomeReview({
      snapshots,
      outcomes,
      previewEnabled: true,
    });

    expect(review.observed_count).toBe(3);
    expect(review.complete_count).toBe(2);
    expect(review.insufficient_count).toBe(1);
    expect(review.improved_count).toBe(1);
    expect(review.worsened_count).toBe(0);
    expect(review.neutral_count).toBe(1);
    expect(review.improved_rate).toBe(50);
    expect(review.sample_quality).toBe("insufficient_sample");
    expect(review.raised_count).toBe(1);
    expect(review.unchanged_count).toBe(1);
    expect(review.confidence_bands).toHaveLength(6);
    expect(review.confidence_bands.map((band) => band.key)).toEqual([
      "0-49",
      "50-59",
      "60-69",
      "70-79",
      "80-89",
      "90-100",
    ]);
    expect(review.tiers.map((tier) => tier.key)).toContain("strong");
    expect(review.windows.map((window) => window.key)).toContain("morning");
    expect(review.explanation_categories.map((category) => category.key)).toContain(
      "momentum_continuation",
    );

    expect(review.no_effects.ranking_affected).toBe(false);
    expect(review.no_effects.scanner_affected).toBe(false);
    expect(review.no_effects.execution_affected).toBe(false);
    expect(review.no_effects.add_trade_affected).toBe(false);
    expect(review.no_effects.provider_called).toBe(false);
    expect(review.no_effects.supabase_write_executed).toBe(false);
    expect(review.no_effects.persistence_created).toBe(false);
    expect(review.no_effects.learning_write_executed).toBe(false);
  });

  test("assigns sample quality thresholds", () => {
    const snapshots = Array.from({ length: 30 }, (_, index) =>
      snapshot({
        id: `snapshot-${index}`,
        snapshot_fingerprint: `fingerprint-${index}`,
        recommendation_id: `rec-${index}`,
      }),
    );
    const outcomes = snapshots.map((item, index) =>
      outcome({
        id: `outcome-${index}`,
        snapshot_id: item.id,
        snapshot_fingerprint: item.snapshot_fingerprint,
        recommendation_id: item.recommendation_id,
      }),
    );

    expect(
      buildConfidenceProjectionOutcomeReview({
        snapshots,
        outcomes: outcomes.slice(0, 9),
        previewEnabled: true,
      }).sample_quality,
    ).toBe("insufficient_sample");
    expect(
      buildConfidenceProjectionOutcomeReview({
        snapshots,
        outcomes: outcomes.slice(0, 10),
        previewEnabled: true,
      }).sample_quality,
    ).toBe("early_directional_signal");
    expect(
      buildConfidenceProjectionOutcomeReview({
        snapshots,
        outcomes,
        previewEnabled: true,
      }).sample_quality,
    ).toBe("usable_observation_sample");
  });
});
