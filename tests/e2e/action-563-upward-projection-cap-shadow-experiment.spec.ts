import { expect, test } from "@playwright/test";

import {
  applyUpwardProjectionCapShadowVariant,
  buildConfidenceProjectionOutcomeReview,
} from "../../lib/confidence-projection-outcome-review";
import type { RecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "../../lib/recommendation-snapshot";

function snapshot(
  index: number,
  originalConfidence: number,
  projectedConfidence: number,
  overrides: Partial<RecommendationSnapshot> = {},
): RecommendationSnapshot {
  return {
    id: `snapshot-563-${index}`,
    snapshot_fingerprint: `fingerprint-563-${index}`,
    recommendation_id: `rec-563-${index}`,
    scan_run_id: "scan-run-action-563",
    ticker: `S${index}`,
    company_name: `Action 563 ${index}`,
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
    confidence: originalConfidence,
    score: originalConfidence,
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
      confidence_projection: {
        projected_confidence: projectedConfidence,
      },
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
  horizon: RecommendationOutcome["horizon"] = "60m",
  overrides: Partial<RecommendationOutcome> = {},
): RecommendationOutcome {
  const status = overrides.status ?? "neither_hit";

  return {
    id: `outcome-563-${index}-${horizon}`,
    snapshot_id: `snapshot-563-${index}`,
    snapshot_fingerprint: `fingerprint-563-${index}`,
    recommendation_id: `rec-563-${index}`,
    ticker: `S${index}`,
    side: "long",
    recommended_at: "2026-07-20T13:45:00.000Z",
    evaluated_at: "2026-07-20T14:45:00.000Z",
    horizon,
    status,
    entry: 100,
    stop: 98,
    target: 104,
    entry_triggered: status !== "entry_not_triggered",
    entry_triggered_at:
      status === "entry_not_triggered" ? null : "2026-07-20T13:50:00.000Z",
    target_hit: status === "target_hit",
    target_hit_at: status === "target_hit" ? "2026-07-20T14:00:00.000Z" : null,
    stop_hit: status === "stop_hit",
    stop_hit_at: status === "stop_hit" ? "2026-07-20T14:00:00.000Z" : null,
    first_terminal_event:
      status === "target_hit"
        ? "target_hit"
        : status === "stop_hit"
          ? "stop_hit"
          : status === "neither_hit"
            ? "neither"
            : "expired",
    best_price_after_recommendation: 101,
    worst_price_after_recommendation: 99,
    best_r: status === "target_hit" ? 2 : 0.2,
    worst_r: status === "stop_hit" ? -1 : -0.4,
    eod_price: 100,
    eod_r: 0,
    current_price: 100,
    current_r: 0,
    max_favorable_excursion: 0.4,
    max_adverse_excursion: -0.4,
    time_to_entry_minutes: status === "entry_not_triggered" ? null : 5,
    time_to_target_minutes: status === "target_hit" ? 25 : null,
    time_to_stop_minutes: status === "stop_hit" ? 25 : null,
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

test.describe("Action 563 upward projection cap shadow experiment", () => {
  test("caps positive deltas at +3, +2, +1, and no upward adjustment", () => {
    expect(
      applyUpwardProjectionCapShadowVariant({
        originalConfidence: 80,
        currentProjectedConfidence: 88,
        currentProjectionDelta: 8,
        variant: "upward_cap_plus_3",
      }),
    ).toMatchObject({
      shadow_projected_confidence: 83,
      shadow_delta: 3,
      cap_applied: true,
      amount_removed_from_current_adjustment: 5,
    });

    expect(
      applyUpwardProjectionCapShadowVariant({
        originalConfidence: 80,
        currentProjectedConfidence: 88,
        currentProjectionDelta: 8,
        variant: "upward_cap_plus_2",
      }).shadow_projected_confidence,
    ).toBe(82);
    expect(
      applyUpwardProjectionCapShadowVariant({
        originalConfidence: 80,
        currentProjectedConfidence: 88,
        currentProjectionDelta: 8,
        variant: "upward_cap_plus_1",
      }).shadow_projected_confidence,
    ).toBe(81);
    expect(
      applyUpwardProjectionCapShadowVariant({
        originalConfidence: 80,
        currentProjectedConfidence: 88,
        currentProjectionDelta: 8,
        variant: "no_upward_adjustment",
      }).shadow_projected_confidence,
    ).toBe(80);
  });

  test("leaves zero and negative deltas unchanged and bounds confidence", () => {
    expect(
      applyUpwardProjectionCapShadowVariant({
        originalConfidence: 80,
        currentProjectedConfidence: 80,
        currentProjectionDelta: 0,
        variant: "no_upward_adjustment",
      }),
    ).toMatchObject({
      shadow_projected_confidence: 80,
      shadow_delta: 0,
      cap_applied: false,
    });
    expect(
      applyUpwardProjectionCapShadowVariant({
        originalConfidence: 80,
        currentProjectedConfidence: 76,
        currentProjectionDelta: -4,
        variant: "no_upward_adjustment",
      }),
    ).toMatchObject({
      shadow_projected_confidence: 76,
      shadow_delta: -4,
      cap_applied: false,
    });
    expect(
      applyUpwardProjectionCapShadowVariant({
        originalConfidence: 99,
        currentProjectedConfidence: 110,
        currentProjectionDelta: 11,
        variant: "upward_cap_plus_3",
      }).shadow_projected_confidence,
    ).toBe(100);
  });

  test("evaluates variants on recommendation-level observations only", () => {
    const review = reviewFor(
      [snapshot(1, 70, 75)],
      [outcome(1, "15m"), outcome(1, "30m"), outcome(1, "60m")],
    );
    const experiment = review.upward_projection_cap_shadow_experiment;
    const noRaise = experiment.variants.find(
      (variant) => variant.variant === "no_upward_adjustment",
    );

    expect(review.complete_count).toBe(1);
    expect(review.horizon_level.complete_count).toBe(3);
    expect(experiment.eligible_recommendation_level_observations).toBe(1);
    expect(noRaise?.eligible_observations).toBe(1);
    expect(noRaise?.cap_applied_observations).toBe(1);
  });

  test("keeps current projection as baseline while selecting deterministic shadow candidate", () => {
    const snapshots = Array.from({ length: 6 }, (_, index) =>
      snapshot(index + 1, 70, 75),
    );
    const outcomes = snapshots.map((_, index) => outcome(index + 1));
    const review = reviewFor(snapshots, outcomes);
    const experiment = review.upward_projection_cap_shadow_experiment;
    const current = experiment.variants.find(
      (variant) => variant.variant === "current_projection",
    );
    const noRaise = experiment.variants.find(
      (variant) => variant.variant === "no_upward_adjustment",
    );

    expect(review.mean_projected_error).toBe(75);
    expect(current).toMatchObject({
      selection_status: "baseline",
      cap_applied_observations: 0,
      mean_calibration_error: 75,
    });
    expect(noRaise).toMatchObject({
      cap_applied_observations: 6,
      mean_calibration_error: 70,
      improvement_vs_current_projection: 5,
      selection_status: "candidate",
    });
    expect(experiment.selected_provisional_candidate?.variant).toBe(
      "no_upward_adjustment",
    );
    expect(experiment.evidence_strength).toBe("weak_directional");
    expect(review.observations[0]?.projected_confidence).toBe(75);
  });

  test("classifies insufficient capped samples without changing no-effect boundaries", () => {
    const snapshots = Array.from({ length: 4 }, (_, index) =>
      snapshot(index + 1, 70, 75),
    );
    const outcomes = snapshots.map((_, index) => outcome(index + 1));
    const experiment = reviewFor(
      snapshots,
      outcomes,
    ).upward_projection_cap_shadow_experiment;

    expect(experiment.selected_provisional_candidate?.variant).toBe(
      "no_upward_adjustment",
    );
    expect(experiment.evidence_strength).toBe("insufficient");
    expect(experiment.persistence_created).toBe(false);
    expect(experiment.current_visible_projection_changed).toBe(false);
    expect(experiment.no_effects).toMatchObject({
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
      projection_formula_changed: false,
    });
  });
});
