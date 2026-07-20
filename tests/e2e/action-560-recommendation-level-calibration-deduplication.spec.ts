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
    scan_run_id: "scan-run-action-560",
    ticker: `T${index}`,
    company_name: `Ticker ${index}`,
    recommended_at: "2026-07-20T13:45:00.000Z",
    app_timestamp: "2026-07-20T13:45:00.000Z",
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
    rating: "valid",
    label: "valid",
    type: "VWAP_HOLD_CONTINUATION",
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
      setup_type: "VWAP_HOLD_CONTINUATION",
      recommendation_tier: "valid",
      scan_window: "morning",
    },
    was_taken: false,
    linked_position_id: null,
    created_at: "2026-07-20T13:45:00.000Z",
    updated_at: "2026-07-20T13:45:00.000Z",
    ...overrides,
  };
}

function outcome(
  index: number,
  horizon: RecommendationOutcome["horizon"],
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  const status = overrides.status ?? "target_hit";

  return {
    id: `outcome-${index}-${horizon}`,
    snapshot_id: `snapshot-${index}`,
    snapshot_fingerprint: `fingerprint-${index}`,
    recommendation_id: `rec-${index}`,
    ticker: `T${index}`,
    side: "long",
    recommended_at: "2026-07-20T13:45:00.000Z",
    evaluated_at: `2026-07-20T14:${horizon === "15m" ? "00" : horizon === "30m" ? "15" : "45"}:00.000Z`,
    horizon,
    status,
    entry: 100,
    stop: 98,
    target: 104,
    entry_triggered: status !== "entry_not_triggered",
    entry_triggered_at: status === "entry_not_triggered" ? null : "2026-07-20T13:50:00.000Z",
    target_hit: status === "target_hit" || status === "target_before_stop",
    target_hit_at: status === "target_hit" || status === "target_before_stop"
      ? "2026-07-20T14:00:00.000Z"
      : null,
    stop_hit: status === "stop_hit" || status === "stop_before_target",
    stop_hit_at: status === "stop_hit" || status === "stop_before_target"
      ? "2026-07-20T14:00:00.000Z"
      : null,
    first_terminal_event:
      status === "target_hit" || status === "target_before_stop"
        ? "target_hit"
        : status === "stop_hit" || status === "stop_before_target"
          ? "stop_hit"
          : status === "neither_hit"
            ? "neither"
            : "expired",
    best_price_after_recommendation: 105,
    worst_price_after_recommendation: 99,
    best_r: status === "target_hit" || status === "target_before_stop" ? 2.5 : 0.4,
    worst_r: status === "stop_hit" || status === "stop_before_target" ? -1 : -0.5,
    eod_price: 104,
    eod_r: status === "target_hit" || status === "target_before_stop" ? 2 : 0,
    current_price: 104,
    current_r: status === "target_hit" || status === "target_before_stop" ? 2 : 0,
    max_favorable_excursion: 2.5,
    max_adverse_excursion: -0.5,
    time_to_entry_minutes: status === "entry_not_triggered" ? null : 5,
    time_to_target_minutes: status === "target_hit" || status === "target_before_stop" ? 25 : null,
    time_to_stop_minutes: status === "stop_hit" || status === "stop_before_target" ? 25 : null,
    source: "intraday_candles",
    provider: "twelve_data",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: {},
    created_at: "2026-07-20T14:00:00.000Z",
    updated_at: "2026-07-20T14:00:00.000Z",
    ...overrides,
  };
}

function reviewFor(
  snapshots: RecommendationSnapshot[],
  outcomes: RecommendationOutcome[],
) {
  return buildConfidenceProjectionOutcomeReview({
    snapshots,
    outcomes,
    previewEnabled: true,
  });
}

test.describe("Action 560 recommendation-level calibration deduplication", () => {
  test("uses one 15m horizon when it is the only complete outcome", () => {
    const review = reviewFor([snapshot(1)], [outcome(1, "15m")]);

    expect(review.review_mode).toBe("recommendation_level");
    expect(review.observed_count).toBe(1);
    expect(review.complete_count).toBe(1);
    expect(review.recommendation_level_deduplication.selected_15m_count).toBe(1);
    expect(review.horizon_level.complete_count).toBe(1);
  });

  test("selects the longest complete horizon for two or three complete horizons", () => {
    const two = reviewFor(
      [snapshot(1)],
      [outcome(1, "15m"), outcome(1, "30m")],
    );
    expect(two.complete_count).toBe(1);
    expect(two.recommendation_level_deduplication.selected_30m_count).toBe(1);
    expect(two.recommendation_level_deduplication.deduplicated_outcome_row_count).toBe(1);
    expect(two.horizon_level.complete_count).toBe(2);

    const three = reviewFor(
      [snapshot(2)],
      [outcome(2, "15m"), outcome(2, "30m"), outcome(2, "60m")],
    );
    expect(three.complete_count).toBe(1);
    expect(three.recommendation_level_deduplication.selected_60m_count).toBe(1);
    expect(three.horizon_level.complete_count).toBe(3);
  });

  test("falls back from incomplete 60m and 30m to the longest complete available horizon", () => {
    const fallbackTo30 = reviewFor(
      [snapshot(1)],
      [
        outcome(1, "15m"),
        outcome(1, "30m"),
        outcome(1, "60m", {
          status: "pending",
          target_hit: null,
          stop_hit: null,
          first_terminal_event: "unknown",
          data_completeness: "none",
        }),
      ],
    );
    expect(fallbackTo30.complete_count).toBe(1);
    expect(fallbackTo30.recommendation_level_deduplication.selected_30m_count).toBe(1);

    const fallbackTo15 = reviewFor(
      [snapshot(2)],
      [
        outcome(2, "15m"),
        outcome(2, "30m", {
          status: "pending",
          target_hit: null,
          stop_hit: null,
          first_terminal_event: "unknown",
          data_completeness: "none",
        }),
        outcome(2, "60m", {
          status: "pending",
          target_hit: null,
          stop_hit: null,
          first_terminal_event: "unknown",
          data_completeness: "none",
        }),
      ],
    );
    expect(fallbackTo15.complete_count).toBe(1);
    expect(fallbackTo15.recommendation_level_deduplication.selected_15m_count).toBe(1);
  });

  test("rejects unknown horizons and dedupes duplicate horizon rows", () => {
    const unknown = reviewFor(
      [snapshot(1)],
      [outcome(1, "unknown")],
    );
    expect(unknown.complete_count).toBe(0);
    expect(unknown.observations[0]?.insufficient_reasons).toContain(
      "unknown_outcome_horizon",
    );

    const duplicate = reviewFor(
      [snapshot(2)],
      [
        outcome(2, "15m", { evaluated_at: "2026-07-20T14:00:00.000Z" }),
        outcome(2, "15m", { evaluated_at: "2026-07-20T14:05:00.000Z" }),
      ],
    );
    expect(duplicate.horizon_level.observed_count).toBe(1);
    expect(duplicate.complete_count).toBe(1);
  });

  test("tracks stable and evolving valid cross-horizon sequences", () => {
    const stable = reviewFor(
      [snapshot(1)],
      [
        outcome(1, "15m", { status: "neither_hit", target_hit: false, stop_hit: false }),
        outcome(1, "30m", { status: "neither_hit", target_hit: false, stop_hit: false }),
        outcome(1, "60m", { status: "neither_hit", target_hit: false, stop_hit: false }),
      ],
    );
    expect(stable.recommendation_level_deduplication.stable_horizon_sequence_count).toBe(1);

    const evolving = reviewFor(
      [snapshot(2)],
      [
        outcome(2, "15m", { status: "entry_not_triggered", target_hit: false, stop_hit: false }),
        outcome(2, "30m", { status: "neither_hit", target_hit: false, stop_hit: false }),
        outcome(2, "60m", { status: "target_hit" }),
      ],
    );
    expect(evolving.complete_count).toBe(1);
    expect(evolving.recommendation_level_deduplication.selected_60m_count).toBe(1);
    expect(evolving.recommendation_level_deduplication.evolving_valid_horizon_sequence_count).toBe(1);
  });

  test("blocks target-stop and confidence identity conflicts", () => {
    const targetStopConflict = reviewFor(
      [snapshot(1)],
      [
        outcome(1, "15m", { status: "target_hit" }),
        outcome(1, "60m", { status: "stop_hit" }),
      ],
    );
    expect(targetStopConflict.complete_count).toBe(0);
    expect(
      targetStopConflict.recommendation_level_deduplication
        .identities_blocked_by_horizon_conflict,
    ).toBe(1);
    expect(
      targetStopConflict.recommendation_level_deduplication.conflict_reasons
        .target_stop_conflict,
    ).toBe(1);

    const confidenceConflict = reviewFor(
      [
        snapshot(2, { recommendation_id: "shared-rec", confidence: 70, score: 70 }),
        snapshot(3, { recommendation_id: "shared-rec", confidence: 82, score: 82 }),
      ],
      [
        outcome(2, "15m", { recommendation_id: "shared-rec" }),
        outcome(3, "60m", { recommendation_id: "shared-rec" }),
      ],
    );
    expect(confidenceConflict.complete_count).toBe(0);
    expect(
      confidenceConflict.recommendation_level_deduplication.conflict_reasons
        .confidence_differs_across_horizons,
    ).toBe(1);
  });

  test("keeps recommendation metrics primary and horizon diagnostics available without side effects", () => {
    const review = reviewFor(
      [snapshot(1)],
      [outcome(1, "15m"), outcome(1, "30m"), outcome(1, "60m")],
    );

    expect(review.observed_count).toBe(1);
    expect(review.complete_count).toBe(1);
    expect(review.horizon_level.review_mode).toBe("horizon_level");
    expect(review.horizon_level.complete_count).toBe(3);
    expect(review.horizon_level.horizon_groups.map((group) => group.key)).toEqual([
      "15m",
      "30m",
      "60m",
    ]);
    expect(review.no_effects).toMatchObject({
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      add_trade_affected: false,
      risk_affected: false,
      sizing_affected: false,
      provider_called: false,
      supabase_write_executed: false,
      persistence_created: false,
      learning_write_executed: false,
    });
  });
});
