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
    payload_json: {
      scan_window: "morning",
    },
    created_at: "2026-07-17T14:15:00.000Z",
    updated_at: "2026-07-17T14:15:00.000Z",
    ...overrides,
  };
}

test.describe("Action 547 projection observation completeness remediation", () => {
  test("joins by fingerprint, snapshot id, and recommendation id in priority order", () => {
    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: [
        snapshot(1),
        snapshot(2, { snapshot_fingerprint: "different-fp" }),
        snapshot(3, { snapshot_fingerprint: "different-fp-2", id: "different-id" }),
      ],
      outcomes: [
        outcome(1),
        outcome(2, { snapshot_fingerprint: "legacy-fp" }),
        outcome(3, { snapshot_fingerprint: "legacy-fp-2", snapshot_id: "legacy-id" }),
      ],
      previewEnabled: true,
    });

    expect(review.observations[0]?.join_source).toBe("snapshot_fingerprint");
    expect(review.observations[1]?.join_source).toBe("snapshot_id");
    expect(review.observations[2]?.join_source).toBe("recommendation_id");
    expect(review.observation_completeness.successful_join_count).toBe(3);
  });

  test("uses only unique composite fallback and rejects ambiguous fallback matches", () => {
    const unique = snapshot(10, {
      snapshot_fingerprint: "stored-fp-10",
      recommendation_id: "stored-rec-10",
    });
    const ambiguousA = snapshot(20, {
      id: "ambiguous-a",
      snapshot_fingerprint: "stored-fp-a",
      recommendation_id: "stored-rec-a",
    });
    const ambiguousB = snapshot(20, {
      id: "ambiguous-b",
      snapshot_fingerprint: "stored-fp-b",
      recommendation_id: "stored-rec-b",
    });
    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: [unique, ambiguousA, ambiguousB],
      outcomes: [
        outcome(10, {
          snapshot_id: "legacy-id-10",
          snapshot_fingerprint: "legacy-fp-10",
          recommendation_id: "legacy-rec-10",
        }),
        outcome(20, {
          snapshot_id: "legacy-id-20",
          snapshot_fingerprint: "legacy-fp-20",
          recommendation_id: "legacy-rec-20",
        }),
      ],
      previewEnabled: true,
    });

    expect(review.observations[0]?.join_source).toBe("unique_composite_fallback");
    expect(review.observations[1]?.join_source).toBe("ambiguous");
    expect(review.observations[1]?.insufficient_reasons).toContain(
      "ambiguous_join",
    );
  });

  test("derives projection from snapshot-time inputs without outcome confidence leakage", () => {
    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: [
        snapshot(1),
        snapshot(2, {
          confidence: null,
          score: null,
          payload_json: {
            setup_type: "PULLBACK_CONTINUATION",
            recommendation_tier: "valid",
            scan_window: "morning",
          },
        }),
      ],
      outcomes: [
        outcome(1),
        outcome(2, {
          payload_json: {
            scan_window: "morning",
            confidence_score: 99,
          },
        }),
      ],
      previewEnabled: true,
    });

    expect(review.observations[0]?.projected_confidence_source).toBe(
      "deterministically_recomputed_projection",
    );
    expect(review.observations[0]?.projected_confidence).toBe(80);
    expect(review.observations[1]?.original_confidence).toBeNull();
    expect(review.observations[1]?.insufficient_reasons).toContain(
      "missing_original_confidence",
    );
  });

  test("classifies incomplete outcomes and multiple insufficiency reasons", () => {
    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: [
        snapshot(1, {
          confidence: null,
          score: null,
          type: "UNKNOWN",
          payload_json: {},
        }),
      ],
      outcomes: [
        outcome(1, {
          status: "pending",
          target_hit: null,
          stop_hit: null,
          first_terminal_event: "unknown",
        }),
      ],
      previewEnabled: true,
    });

    expect(review.complete_count).toBe(0);
    expect(review.observations[0]?.insufficient_reasons).toEqual(
      expect.arrayContaining([
        "missing_original_confidence",
        "missing_projected_confidence",
        "projection_not_derivable",
        "missing_completed_outcome",
        "unsupported_outcome_status",
        "missing_required_setup_metadata",
      ]),
    );
  });

  test("aggregates blocker counts, rates, and no-effect flags", () => {
    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: [snapshot(1)],
      outcomes: [
        outcome(1),
        outcome(2, {
          snapshot_id: "missing",
          snapshot_fingerprint: "missing",
          recommendation_id: "missing",
          status: "pending",
          target_hit: null,
          stop_hit: null,
          first_terminal_event: "unknown",
        }),
      ],
      previewEnabled: true,
    });

    expect(review.observation_completeness.eligible_observations).toBe(2);
    expect(review.observation_completeness.complete_observations).toBe(1);
    expect(review.observation_completeness.completeness_rate).toBe(50);
    expect(review.observation_completeness.successful_join_rate).toBe(50);
    expect(
      review.observation_completeness.reason_counts.find(
        (item) => item.reason === "missing_snapshot_match",
      )?.count,
    ).toBe(1);
    expect(
      review.observation_completeness.category_counts.find(
        (item) => item.category === "join_related",
      )?.count,
    ).toBe(1);
    expect(review.no_effects.ranking_affected).toBe(false);
    expect(review.no_effects.scanner_affected).toBe(false);
    expect(review.no_effects.execution_affected).toBe(false);
    expect(review.no_effects.provider_called).toBe(false);
    expect(review.no_effects.supabase_write_executed).toBe(false);
    expect(review.no_effects.persistence_created).toBe(false);
  });
});
