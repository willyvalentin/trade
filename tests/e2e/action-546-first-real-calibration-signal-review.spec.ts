import { expect, test } from "@playwright/test";

import { buildConfidenceProjectionOutcomeReview } from "../../lib/confidence-projection-outcome-review";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

function snapshot(
  index: number,
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  return {
    id: `snapshot-${index}`,
    snapshot_fingerprint: `fingerprint-${index}`,
    recommendation_id: `rec-${index}`,
    scan_run_id: "scan-run-1",
    ticker: `T${index}`,
    company_name: `Ticker ${index}`,
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
    confidence: 75,
    score: 75,
    rating: "valid",
    label: "valid",
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
      recommendation_tier: "valid",
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
  index: number,
  status: "target_hit" | "stop_hit",
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  return {
    id: `outcome-${index}`,
    snapshot_id: `snapshot-${index}`,
    snapshot_fingerprint: `fingerprint-${index}`,
    recommendation_id: `rec-${index}`,
    ticker: `T${index}`,
    side: "long",
    recommended_at: "2026-07-17T13:45:00.000Z",
    evaluated_at: "2026-07-17T14:15:00.000Z",
    horizon: "15m",
    status,
    entry: 100,
    stop: 98,
    target: 104,
    entry_triggered: true,
    entry_triggered_at: "2026-07-17T13:50:00.000Z",
    target_hit: status === "target_hit",
    target_hit_at: status === "target_hit" ? "2026-07-17T14:10:00.000Z" : null,
    stop_hit: status === "stop_hit",
    stop_hit_at: status === "stop_hit" ? "2026-07-17T14:10:00.000Z" : null,
    first_terminal_event: status === "target_hit" ? "target_hit" : "stop_hit",
    best_price_after_recommendation: 105,
    worst_price_after_recommendation: 97,
    best_r: status === "target_hit" ? 2.5 : 0.5,
    worst_r: status === "stop_hit" ? -1 : -0.5,
    eod_price: status === "target_hit" ? 104 : 98,
    eod_r: status === "target_hit" ? 2 : -1,
    current_price: status === "target_hit" ? 104 : 98,
    current_r: status === "target_hit" ? 2 : -1,
    max_favorable_excursion: status === "target_hit" ? 2.5 : 0.5,
    max_adverse_excursion: status === "stop_hit" ? -1 : -0.5,
    time_to_entry_minutes: 5,
    time_to_target_minutes: status === "target_hit" ? 25 : null,
    time_to_stop_minutes: status === "stop_hit" ? 25 : null,
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

function sampleBatch({
  start,
  count,
  confidence,
  tier,
  window,
  result,
}: {
  start: number;
  count: number;
  confidence: number;
  tier: string;
  window: "morning" | "midday" | "power_hour";
  result: "target_hit" | "stop_hit";
}) {
  const snapshots = Array.from({ length: count }, (_, offset) =>
    snapshot(start + offset, {
      confidence,
      score: confidence,
      rating: tier,
      label: tier,
      window,
      payload_json: {
        setup_type: "PULLBACK_CONTINUATION",
        recommendation_tier: tier,
        scan_window: window,
      },
    }),
  );
  const outcomes = Array.from({ length: count }, (_, offset) =>
    outcome(start + offset, result),
  );

  return { snapshots, outcomes };
}

test.describe("Action 546 first real calibration signal review", () => {
  test("selects strongest positive and negative sufficient subgroups", () => {
    const positive = sampleBatch({
      start: 0,
      count: 6,
      confidence: 75,
      tier: "valid",
      window: "morning",
      result: "target_hit",
    });
    const negative = sampleBatch({
      start: 100,
      count: 6,
      confidence: 85,
      tier: "strong",
      window: "midday",
      result: "stop_hit",
    });

    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: [...positive.snapshots, ...negative.snapshots],
      outcomes: [...positive.outcomes, ...negative.outcomes],
      previewEnabled: true,
    });

    expect(
      review.first_observed_calibration_signal.strongest_positive_subgroup
        .direction,
    ).toBe("helps");
    expect(
      review.first_observed_calibration_signal.strongest_positive_subgroup
        .sample_count,
    ).toBe(6);
    expect(
      review.first_observed_calibration_signal.strongest_negative_subgroup
        .direction,
    ).toBe("hurts");
    expect(
      review.first_observed_calibration_signal.selected_signal.direction,
    ).toBe("hurts");
    expect(
      review.first_observed_calibration_signal
        .recommended_calibration_adjustment_candidate,
    ).toContain("reduce or neutralize");
  });

  test("rejects subgroups below the minimum observation threshold", () => {
    const tiny = sampleBatch({
      start: 0,
      count: 4,
      confidence: 75,
      tier: "valid",
      window: "morning",
      result: "target_hit",
    });

    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: tiny.snapshots,
      outcomes: tiny.outcomes,
      previewEnabled: true,
    });

    expect(
      review.first_observed_calibration_signal.selected_signal.status,
    ).toBe("insufficient");
    expect(
      review.first_observed_calibration_signal
        .recommended_calibration_adjustment_candidate,
    ).toBe("preserve current behavior because evidence is insufficient");
  });

  test("uses deterministic tie handling across subgroup types", () => {
    const tied = sampleBatch({
      start: 0,
      count: 5,
      confidence: 75,
      tier: "valid",
      window: "morning",
      result: "target_hit",
    });

    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: tied.snapshots,
      outcomes: tied.outcomes,
      previewEnabled: true,
    });

    expect(
      review.first_observed_calibration_signal.strongest_positive_subgroup
        .subgroup_type,
    ).toBe("confidence_band");
    expect(
      review.first_observed_calibration_signal.strongest_positive_subgroup
        .subgroup_key,
    ).toBe("70-79");
  });

  test("handles no data and sample threshold labels", () => {
    const noData = buildConfidenceProjectionOutcomeReview({
      snapshots: [],
      outcomes: [],
      previewEnabled: true,
    });
    expect(noData.status).toBe("no_observations");
    expect(noData.first_observed_calibration_signal.selected_signal.status).toBe(
      "insufficient",
    );

    const weak = sampleBatch({
      start: 0,
      count: 5,
      confidence: 75,
      tier: "valid",
      window: "morning",
      result: "target_hit",
    });
    const early = sampleBatch({
      start: 100,
      count: 10,
      confidence: 75,
      tier: "valid",
      window: "morning",
      result: "target_hit",
    });
    const meaningful = sampleBatch({
      start: 200,
      count: 30,
      confidence: 75,
      tier: "valid",
      window: "morning",
      result: "target_hit",
    });

    expect(
      buildConfidenceProjectionOutcomeReview({
        snapshots: weak.snapshots,
        outcomes: weak.outcomes,
        previewEnabled: true,
      }).first_observed_calibration_signal.selected_signal
        .confidence_in_conclusion,
    ).toBe("weak_directional_signal");
    expect(
      buildConfidenceProjectionOutcomeReview({
        snapshots: early.snapshots,
        outcomes: early.outcomes,
        previewEnabled: true,
      }).first_observed_calibration_signal.selected_signal
        .confidence_in_conclusion,
    ).toBe("early_usable_signal");
    expect(
      buildConfidenceProjectionOutcomeReview({
        snapshots: meaningful.snapshots,
        outcomes: meaningful.outcomes,
        previewEnabled: true,
      }).first_observed_calibration_signal.selected_signal
        .confidence_in_conclusion,
    ).toBe("meaningful_signal");
  });

  test("keeps all downstream effect flags false", () => {
    const batch = sampleBatch({
      start: 0,
      count: 5,
      confidence: 75,
      tier: "valid",
      window: "morning",
      result: "target_hit",
    });
    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: batch.snapshots,
      outcomes: batch.outcomes,
      previewEnabled: true,
    });

    expect(review.no_effects.ranking_affected).toBe(false);
    expect(review.no_effects.scanner_affected).toBe(false);
    expect(review.no_effects.publication_affected).toBe(false);
    expect(review.no_effects.execution_affected).toBe(false);
    expect(review.no_effects.add_trade_affected).toBe(false);
    expect(review.no_effects.risk_affected).toBe(false);
    expect(review.no_effects.sizing_affected).toBe(false);
    expect(review.no_effects.provider_called).toBe(false);
    expect(review.no_effects.supabase_write_executed).toBe(false);
    expect(review.no_effects.persistence_created).toBe(false);
    expect(review.no_effects.learning_write_executed).toBe(false);
  });
});
