import { expect, test } from "@playwright/test";

import {
  classifyConfidenceProjectionOutcomeCompletion,
  confidenceProjectionObservationContractVersion,
} from "../../lib/confidence-projection-observation-contract";
import { buildConfidenceProjectionOutcomeReview } from "../../lib/confidence-projection-outcome-review";
import { computeRecommendationOutcome } from "../../lib/recommendation-outcome-tracker";
import { buildRecommendationSnapshot } from "../../lib/recommendation-snapshot";

function contractFromPayload(payload: Record<string, unknown>) {
  return payload.confidence_projection_observation_contract as
    | Record<string, unknown>
    | undefined;
}

function objectValue(value: unknown) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function futureSnapshot() {
  return buildRecommendationSnapshot({
    recommendation_id: "rec_future_aapl",
    scan_run_id: "scan_future_1",
    ticker: "AAPL",
    recommended_at: "2026-07-17T13:45:00.000Z",
    app_timestamp: "2026-07-17T13:45:00.000Z",
    window: "morning",
    entry: 100,
    stop: 98,
    target: 104,
    side: "long",
    confidence: 82,
    score: 82,
    rating: "valid",
    label: "valid",
    type: "PULLBACK_CONTINUATION",
    payload: {
      setup_type: "PULLBACK_CONTINUATION",
      recommendation_tier: "valid",
      scan_window: "morning",
    },
  });
}

test.describe("Action 548 future calibration observation data contract", () => {
  test("creates a versioned snapshot-time observation contract", () => {
    const snapshot = futureSnapshot();
    const contract = contractFromPayload(snapshot.payload_json);
    const identity = objectValue(contract?.identity);
    const confidence = objectValue(contract?.snapshot_time_confidence);
    const setup = objectValue(contract?.setup_metadata);
    const tradePlan = objectValue(contract?.trade_plan);

    expect(contract?.version).toBe(confidenceProjectionObservationContractVersion);
    expect(identity.recommendation_id).toBe("rec_future_aapl");
    expect(identity.snapshot_id).toBe(snapshot.id);
    expect(identity.snapshot_fingerprint).toBe(snapshot.snapshot_fingerprint);
    expect(confidence.original_confidence).toBe(82);
    expect(confidence.projected_confidence).toBe(87);
    expect(confidence.projection_source).toBe("stored_projection");
    expect(confidence.calibration_status).toBe("calibrated_observation_only");
    expect(setup.setup_type).toBe("PULLBACK_CONTINUATION");
    expect(setup.recommendation_tier).toBe("valid");
    expect(setup.trading_window).toBe("morning");
    expect(tradePlan.entry).toBe(100);
    expect(tradePlan.stop).toBe(98);
    expect(tradePlan.target).toBe(104);
  });

  test("creates an outcome-time contract with retained identity and completed success semantics", () => {
    const snapshot = futureSnapshot();
    const { outcome } = computeRecommendationOutcome({
      snapshot,
      horizon: "15m",
      source: "intraday_candles",
      provider: "test_fixture",
      evaluated_at: "2026-07-17T14:15:00.000Z",
      candles: [
        {
          timestamp: "2026-07-17T13:50:00.000Z",
          open: 100,
          high: 100.5,
          low: 99.5,
          close: 100.2,
        },
        {
          timestamp: "2026-07-17T14:05:00.000Z",
          open: 100.2,
          high: 104.5,
          low: 100,
          close: 104.2,
        },
      ],
    });
    const contract = contractFromPayload(outcome.payload_json);
    const identity = objectValue(contract?.identity);
    const semantics = objectValue(contract?.outcome_semantics);

    expect(contract?.version).toBe(confidenceProjectionObservationContractVersion);
    expect(identity.recommendation_id).toBe(snapshot.recommendation_id);
    expect(identity.snapshot_id).toBe(snapshot.id);
    expect(identity.snapshot_fingerprint).toBe(snapshot.snapshot_fingerprint);
    expect(semantics.completed_outcome_classification).toBe("completed_success");
    expect(semantics.binary_success_score).toBe(100);
    expect(semantics.target_reached).toBe(true);
  });

  test("maps completed failure and rejects incomplete outcomes without fabrication", () => {
    expect(
      classifyConfidenceProjectionOutcomeCompletion({
        status: "stop_before_target",
        target_hit: false,
        stop_hit: true,
        first_terminal_event: "stop_hit",
        eod_r: null,
        current_r: null,
        best_r: null,
        data_completeness: "complete",
        source: "intraday_candles",
      }),
    ).toEqual({
      classification: "completed_failure",
      binary_success_score: 0,
    });

    expect(
      classifyConfidenceProjectionOutcomeCompletion({
        status: "pending",
        target_hit: null,
        stop_hit: null,
        first_terminal_event: "unknown",
        eod_r: null,
        current_r: null,
        best_r: null,
        data_completeness: "none",
        source: "snapshot_only",
      }),
    ).toEqual({
      classification: "incomplete",
      binary_success_score: null,
    });
  });

  test("future contract-v1 row becomes complete after evaluated outcome", () => {
    const snapshot = futureSnapshot();
    const { outcome } = computeRecommendationOutcome({
      snapshot,
      horizon: "15m",
      source: "intraday_candles",
      provider: "test_fixture",
      evaluated_at: "2026-07-17T14:15:00.000Z",
      candles: [
        {
          timestamp: "2026-07-17T13:50:00.000Z",
          open: 100,
          high: 101,
          low: 99.5,
          close: 100.2,
        },
        {
          timestamp: "2026-07-17T14:05:00.000Z",
          open: 100.2,
          high: 104.5,
          low: 100,
          close: 104.2,
        },
      ],
    });

    const review = buildConfidenceProjectionOutcomeReview({
      snapshots: [snapshot],
      outcomes: [outcome],
      previewEnabled: true,
    });

    expect(review.complete_count).toBe(1);
    expect(review.observations[0]?.snapshot_contract_version).toBe(
      confidenceProjectionObservationContractVersion,
    );
    expect(review.observations[0]?.outcome_contract_version).toBe(
      confidenceProjectionObservationContractVersion,
    );
    expect(review.observations[0]?.projected_confidence_source).toBe(
      "stored_projection",
    );
    expect(review.observation_completeness.future_contract_coverage).toMatchObject({
      migration_required: false,
      snapshot_contract_count: 1,
      outcome_contract_count: 1,
      contract_join_ready_count: 1,
      expected_future_completeness: "complete_when_outcome_evaluated",
    });
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
