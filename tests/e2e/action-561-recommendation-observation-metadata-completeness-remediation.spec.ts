import { expect, test } from "@playwright/test";

import {
  buildConfidenceProjectionOutcomeReview,
  type ConfidenceProjectionOutcomeObservation,
} from "../../lib/confidence-projection-outcome-review";
import { confidenceProjectionObservationContractVersion } from "../../lib/confidence-projection-observation-contract";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

function snapshot(
  index: number,
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  return {
    id: `snapshot-561-${index}`,
    snapshot_fingerprint: `fingerprint-561-${index}`,
    recommendation_id: `rec-561-${index}`,
    scan_run_id: "scan-run-action-561",
    ticker: `A${index}`,
    company_name: `Action 561 ${index}`,
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
    id: `outcome-561-${index}-${horizon}`,
    snapshot_id: `snapshot-561-${index}`,
    snapshot_fingerprint: `fingerprint-561-${index}`,
    recommendation_id: `rec-561-${index}`,
    ticker: `A${index}`,
    side: "long",
    recommended_at: "2026-07-20T13:45:00.000Z",
    evaluated_at: "2026-07-20T14:45:00.000Z",
    horizon,
    status,
    entry: 100,
    stop: 98,
    target: 104,
    entry_triggered: status !== "entry_not_triggered",
    entry_triggered_at: status === "entry_not_triggered" ? null : "2026-07-20T13:50:00.000Z",
    target_hit: status === "target_hit" || status === "target_before_stop",
    target_hit_at:
      status === "target_hit" || status === "target_before_stop"
        ? "2026-07-20T14:00:00.000Z"
        : null,
    stop_hit: status === "stop_hit" || status === "stop_before_target",
    stop_hit_at:
      status === "stop_hit" || status === "stop_before_target"
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
    time_to_target_minutes:
      status === "target_hit" || status === "target_before_stop" ? 25 : null,
    time_to_stop_minutes:
      status === "stop_hit" || status === "stop_before_target" ? 25 : null,
    source: "intraday_candles",
    provider: "twelve_data",
    data_completeness: "complete",
    warnings: [],
    blockers: [],
    payload_json: {},
    created_at: "2026-07-20T14:45:00.000Z",
    updated_at: "2026-07-20T14:45:00.000Z",
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

function firstObservation(
  snapshots: RecommendationSnapshot[],
  outcomes: RecommendationOutcome[],
): ConfidenceProjectionOutcomeObservation {
  const observation = reviewFor(snapshots, outcomes).observations[0];
  expect(observation).toBeTruthy();
  return observation;
}

test.describe("Action 561 recommendation observation metadata completeness remediation", () => {
  test("keeps a missing recommendation id complete when snapshot identity is stable", () => {
    const currentSnapshot = snapshot(1, { recommendation_id: null });
    const currentOutcome = outcome(1, "60m", {
      recommendation_id: null,
      snapshot_fingerprint: null,
    });
    const review = reviewFor([currentSnapshot], [currentOutcome]);

    expect(review.complete_count).toBe(1);
    expect(review.observations[0]?.stable_identity_source).toBe(
      "snapshot_fingerprint",
    );
    expect(review.observations[0]?.insufficient_reasons).not.toContain(
      "missing_recommendation_id",
    );
    expect(
      review.recommendation_observation_completeness
        .recovered_by_identity_normalization,
    ).toBe(1);
  });

  test("rejects ambiguous snapshot identity instead of guessing from ticker", () => {
    const first = snapshot(1, { snapshot_fingerprint: "ambiguous-561" });
    const second = snapshot(2, { snapshot_fingerprint: "ambiguous-561" });
    const currentOutcome = outcome(1, "60m", {
      snapshot_id: null,
      snapshot_fingerprint: "ambiguous-561",
      recommendation_id: null,
    });
    const review = reviewFor([first, second], [currentOutcome]);

    expect(review.complete_count).toBe(0);
    expect(review.observations[0]?.join_source).toBe("ambiguous");
    expect(review.observations[0]?.insufficient_reasons).toContain(
      "ambiguous_join",
    );
  });

  test("treats missing setup metadata as optional subgroup gaps", () => {
    const currentSnapshot = snapshot(1, {
      window: "unknown",
      rating: null,
      label: null,
      type: null,
      payload_json: {},
    });
    const review = reviewFor([currentSnapshot], [outcome(1, "60m")]);

    expect(review.complete_count).toBe(1);
    expect(review.observations[0]?.optional_metadata_gaps).toEqual(
      expect.arrayContaining([
        "missing_setup_type",
        "missing_recommendation_tier",
        "missing_trading_window",
      ]),
    );
    expect(review.observations[0]?.insufficient_reasons).not.toContain(
      "missing_required_setup_metadata",
    );
    expect(
      review.recommendation_observation_completeness.optional_metadata_gap_count,
    ).toBe(1);
  });

  test("recovers original confidence and stored projection from contract-v1 payload", () => {
    const currentSnapshot = snapshot(1, {
      confidence: null,
      score: null,
      payload_json: {
        confidence_projection_observation_contract: {
          version: confidenceProjectionObservationContractVersion,
          identity: {
            recommendation_id: "rec-561-1",
            snapshot_id: "snapshot-561-1",
            snapshot_fingerprint: "fingerprint-561-1",
          },
          snapshot_time_confidence: {
            original_confidence: 79,
            projected_confidence: 84,
            calibration_status: "calibrated_observation_only",
          },
          setup_metadata: {
            setup_type: "VWAP_HOLD_CONTINUATION",
            recommendation_tier: "valid",
            trading_window: "morning",
          },
        },
      },
    });
    const observation = firstObservation([currentSnapshot], [outcome(1, "60m")]);

    expect(observation.completeness).toBe("complete");
    expect(observation.original_confidence).toBe(79);
    expect(observation.original_confidence_source).toBe("contract_v1");
    expect(observation.projected_confidence).toBe(84);
    expect(observation.projected_confidence_source).toBe("stored_projection");
  });

  test("recomputes projection only from matched immutable snapshot inputs", () => {
    const recomputed = firstObservation(
      [snapshot(1)],
      [outcome(1, "60m", { payload_json: { confidence: 5 } })],
    );
    expect(recomputed.completeness).toBe("complete");
    expect(recomputed.projected_confidence_source).toBe(
      "deterministically_recomputed_projection",
    );

    const noSnapshot = firstObservation([], [outcome(2, "60m")]);
    expect(noSnapshot.completeness).toBe("insufficient_data");
    expect(noSnapshot.projected_confidence_source).toBe("unavailable");
    expect(noSnapshot.insufficient_reasons).toContain("missing_snapshot_match");
  });

  test("continues rejecting unknown horizons and preserving recommendation dedupe", () => {
    const unknown = reviewFor([snapshot(1)], [outcome(1, "unknown")]);
    expect(unknown.complete_count).toBe(0);
    expect(unknown.observations[0]?.insufficient_reasons).toContain(
      "unknown_outcome_horizon",
    );

    const deduped = reviewFor(
      [snapshot(2)],
      [outcome(2, "15m"), outcome(2, "30m"), outcome(2, "60m")],
    );
    expect(deduped.complete_count).toBe(1);
    expect(deduped.horizon_level.complete_count).toBe(3);
    expect(deduped.recommendation_level_deduplication.selected_60m_count).toBe(1);
    expect(deduped.no_effects).toMatchObject({
      ranking_affected: false,
      scanner_affected: false,
      publication_affected: false,
      execution_affected: false,
      add_trade_affected: false,
      risk_affected: false,
      sizing_affected: false,
      provider_called: false,
      persistence_created: false,
      learning_write_executed: false,
    });
  });
});
