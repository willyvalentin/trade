import { expect, test } from "@playwright/test";
import { createHash } from "node:crypto";

import {
  evaluateInternalPaperDriftHealth,
  INTERNAL_PAPER_DRIFT_HEALTH_VERSION,
  INTERNAL_PAPER_DRIFT_METRIC_WINDOW_VERSION,
  verifyInternalPaperDriftHealthDigest,
  type InternalPaperDriftHealthInput,
  type InternalPaperDriftMetricWindow,
} from "@/lib/internal-paper-drift-health";

const digest = (value: string) =>
  createHash("sha256").update(value).digest("hex");

function window(
  overrides: Partial<InternalPaperDriftMetricWindow> = {},
): InternalPaperDriftMetricWindow {
  return {
    metric_window_version: INTERNAL_PAPER_DRIFT_METRIC_WINDOW_VERSION,
    source_digest: digest("metric-window"),
    observed_at: "2026-09-24T13:30:00.000Z",
    window_start: "2026-09-15T13:30:00.000Z",
    window_end: "2026-09-23T20:00:00.000Z",
    observation_count: 100,
    operating_status: "healthy",
    feature_missing_rate: 0.05,
    regime_distribution: [
      { regime: "risk_on", share: 0.7 },
      { regime: "risk_off", share: 0.3 },
    ],
    net_expectancy_r: 0.4,
    calibration_error: 0.1,
    outcome_coverage: 0.95,
    execution_cost_r: 0.05,
    ...overrides,
  };
}

function input(
  overrides: Partial<InternalPaperDriftHealthInput> = {},
): InternalPaperDriftHealthInput {
  return {
    drift_health_version: INTERNAL_PAPER_DRIFT_HEALTH_VERSION,
    policy: {
      policy_version: "internal_paper_drift_health_policy_v1",
      policy_frozen_at: "2026-09-24T09:00:00.000Z",
      evaluated_at: "2026-09-24T13:45:00.000Z",
      minimum_rolling_observations: 20,
      narrow_feature_missing_rate_increase: 0.05,
      pause_feature_missing_rate_increase: 0.15,
      narrow_regime_distribution_distance: 0.2,
      pause_regime_distribution_distance: 0.5,
      narrow_expectancy_r_decline: 0.2,
      pause_expectancy_r_decline: 0.5,
      narrow_calibration_error_increase: 0.03,
      pause_calibration_error_increase: 0.1,
      narrow_outcome_coverage_decline: 0.05,
      pause_outcome_coverage_decline: 0.15,
      narrow_execution_cost_r_increase: 0.05,
      pause_execution_cost_r_increase: 0.2,
    },
    baseline: window({
      source_digest: digest("baseline"),
      observed_at: "2026-09-24T09:00:00.000Z",
    }),
    rolling: window({
      source_digest: digest("rolling"),
      observed_at: "2026-09-24T13:40:00.000Z",
      window_start: "2026-09-24T09:30:00.000Z",
      window_end: "2026-09-24T13:30:00.000Z",
      observation_count: 40,
      feature_missing_rate: 0.07,
      regime_distribution: [
        { regime: "risk_on", share: 0.65 },
        { regime: "risk_off", share: 0.35 },
      ],
      net_expectancy_r: 0.3,
      calibration_error: 0.11,
      outcome_coverage: 0.92,
      execution_cost_r: 0.06,
    }),
    ...overrides,
  };
}

test("continues only when every supplied rolling metric remains inside frozen bounds", () => {
  const result = evaluateInternalPaperDriftHealth(input());

  expect(result).toMatchObject({
    status: "completed",
    action: "continue",
    classification: "healthy",
    reason_codes: [],
    drift_dimensions: [],
    metric_deltas: {
      feature_missing_rate: 0.02,
      regime_distribution_distance: 0.05,
      expectancy_r_decline: 0.1,
      calibration_error_increase: 0.01,
      outcome_coverage_decline: 0.03,
      execution_cost_r_increase: 0.01,
    },
  });
  expect(verifyInternalPaperDriftHealthDigest(result)).toBe(true);
});

test("narrows on bounded statistical deterioration without treating it as an outage", () => {
  const result = evaluateInternalPaperDriftHealth(
    input({
      rolling: window({
        source_digest: digest("rolling"),
        observed_at: "2026-09-24T13:40:00.000Z",
        window_start: "2026-09-24T09:30:00.000Z",
        window_end: "2026-09-24T13:30:00.000Z",
        observation_count: 40,
        feature_missing_rate: 0.07,
        regime_distribution: [
          { regime: "risk_on", share: 0.65 },
          { regime: "risk_off", share: 0.35 },
        ],
        net_expectancy_r: 0.1,
        calibration_error: 0.15,
        outcome_coverage: 0.92,
        execution_cost_r: 0.06,
      }),
    }),
  );

  expect(result).toMatchObject({
    status: "completed",
    action: "narrow",
    classification: "statistical_drift",
    drift_dimensions: ["calibration_error", "net_expectancy_r"],
    reason_codes: [
      "calibration_error_deteriorated",
      "net_expectancy_r_deteriorated",
    ],
  });
});

test("pauses on severe measured drift while retaining the exact dimension", () => {
  const result = evaluateInternalPaperDriftHealth(
    input({
      rolling: window({
        source_digest: digest("rolling"),
        observed_at: "2026-09-24T13:40:00.000Z",
        window_start: "2026-09-24T09:30:00.000Z",
        window_end: "2026-09-24T13:30:00.000Z",
        observation_count: 40,
        feature_missing_rate: 0.3,
        regime_distribution: [
          { regime: "risk_on", share: 0.65 },
          { regime: "risk_off", share: 0.35 },
        ],
        net_expectancy_r: 0.3,
        calibration_error: 0.11,
        outcome_coverage: 0.92,
        execution_cost_r: 0.06,
      }),
    }),
  );

  expect(result).toMatchObject({
    status: "completed",
    action: "pause",
    classification: "statistical_drift",
    drift_dimensions: ["feature_missing_rate"],
    reason_codes: ["feature_missing_rate_deteriorated"],
  });
});

test("classifies an operational outage separately from strategy or model drift", () => {
  const result = evaluateInternalPaperDriftHealth(
    input({
      rolling: window({
        source_digest: digest("outage"),
        observed_at: "2026-09-24T13:40:00.000Z",
        window_start: "2026-09-24T09:30:00.000Z",
        window_end: "2026-09-24T13:30:00.000Z",
        observation_count: 1,
        operating_status: "outage",
        feature_missing_rate: null,
        regime_distribution: null,
        net_expectancy_r: null,
        calibration_error: null,
        outcome_coverage: null,
        execution_cost_r: null,
      }),
    }),
  );

  expect(result).toMatchObject({
    status: "completed",
    action: "pause",
    classification: "operational_outage",
    reason_codes: ["operational_outage_detected"],
    drift_dimensions: [],
    metric_deltas: {
      feature_missing_rate: null,
      regime_distribution_distance: null,
      expectancy_r_decline: null,
      calibration_error_increase: null,
      outcome_coverage_decline: null,
      execution_cost_r_increase: null,
    },
  });
  expect(verifyInternalPaperDriftHealthDigest(result)).toBe(true);
});

test("narrows when the rolling window lacks the frozen minimum sample", () => {
  const result = evaluateInternalPaperDriftHealth(
    input({
      rolling: { ...input().rolling, observation_count: 19 },
    }),
  );

  expect(result).toMatchObject({
    status: "completed",
    action: "narrow",
    classification: "insufficient_evidence",
    reason_codes: ["rolling_window_minimum_sample_unmet"],
    drift_dimensions: [],
  });
});

test("fails closed on mixed-version, overlapping or malformed metric windows", () => {
  const mixedVersion = evaluateInternalPaperDriftHealth(
    input({
      rolling: {
        ...input().rolling,
        metric_window_version: "unknown" as typeof INTERNAL_PAPER_DRIFT_METRIC_WINDOW_VERSION,
      },
    }),
  );
  const overlapping = evaluateInternalPaperDriftHealth(
    input({
      rolling: { ...input().rolling, window_start: "2026-09-20T13:30:00.000Z" },
    }),
  );
  const lateFrozenPolicy = evaluateInternalPaperDriftHealth(
    input({
      policy: {
        ...input().policy,
        policy_frozen_at: "2026-09-24T10:00:00.000Z",
      },
    }),
  );
  const malformed = evaluateInternalPaperDriftHealth({
    drift_health_version: INTERNAL_PAPER_DRIFT_HEALTH_VERSION,
    policy: null,
    baseline: null,
    rolling: null,
  } as unknown as InternalPaperDriftHealthInput);

  expect(mixedVersion).toMatchObject({
    status: "blocked",
    reason_codes: ["rolling_window_invalid"],
  });
  expect(overlapping).toMatchObject({
    status: "blocked",
    reason_codes: ["metric_window_order_invalid"],
  });
  expect(lateFrozenPolicy).toMatchObject({
    status: "blocked",
    reason_codes: ["metric_window_order_invalid"],
  });
  expect(malformed).toMatchObject({
    status: "blocked",
    reason_codes: expect.arrayContaining([
      "baseline_window_invalid",
      "drift_health_policy_invalid",
      "rolling_window_invalid",
    ]),
  });
  expect(verifyInternalPaperDriftHealthDigest(mixedVersion)).toBe(true);
  expect(verifyInternalPaperDriftHealthDigest(overlapping)).toBe(true);
  expect(verifyInternalPaperDriftHealthDigest(malformed)).toBe(true);
});

test("has no provider, policy-promotion, runtime-pause or broker authority", () => {
  const result = evaluateInternalPaperDriftHealth(input());

  expect(result.authority).toEqual({
    can_request_provider_data: false,
    can_change_ranking_or_publication: false,
    can_persist_or_pause_runtime: false,
    can_promote_strategy: false,
    can_execute_broker_action: false,
  });
  expect(Object.isFrozen(result)).toBe(true);
  expect(Object.isFrozen(result.authority)).toBe(true);
  expect(() => {
    (result.authority as { can_persist_or_pause_runtime: boolean }).can_persist_or_pause_runtime = true;
  }).toThrow(TypeError);
});
