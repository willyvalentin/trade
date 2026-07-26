import {
  CANONICAL_OUTCOME_EVALUATOR_VERSION,
  type CanonicalConfidence,
  type CanonicalCoverage,
  type CanonicalEvaluationCandle,
  type CanonicalEvaluationVersions,
  type CanonicalHorizonOutcome,
  type CanonicalOutcomeInput,
  type CanonicalRecommendationIdentityInput,
  type CanonicalSampleType,
} from "@/lib/canonical-recommendation-evaluation";

export const action664aGoldenVersions: CanonicalEvaluationVersions = {
  engine_version: "engine_golden_v1",
  scoring_version: "scoring_golden_v1",
  ranking_version: "ranking_golden_v1",
  setup_taxonomy_version: "setup_taxonomy_golden_v1",
  confidence_contract_version: "confidence_probability_v1",
  evaluator_version: CANONICAL_OUTCOME_EVALUATOR_VERSION,
  provider_contract_version: "provider_golden_candles_v1",
  git_commit: "f578dd5bedeccb0f95b58c4f15ba2cb3dc1eea33",
  build_identity: "action_664a_golden_fixture_build",
};

export const action664aGoldenIdentity: CanonicalRecommendationIdentityInput = {
  source_namespace: "recommendation_snapshot",
  decision_id: "golden:decision:001",
  decided_at: "2026-07-08T13:32:00.000Z",
};

export const action664aGoldenConfidence: CanonicalConfidence = {
  numeric_confidence: 0.72,
  numeric_confidence_scale: "probability_0_1",
  confidence_label: "medium",
};

export const action664aGoldenSampleTypes: CanonicalSampleType[] = [
  "visible",
  "research_only",
  "shadow",
  "historical_synthetic",
  "rejected_candidate",
  "no_trade",
];

function candle(
  startAt: string,
  endAt: string,
  values: {
    open?: number;
    high?: number;
    low?: number;
    close?: number;
  } = {},
): CanonicalEvaluationCandle {
  return {
    start_at: startAt,
    end_at: endAt,
    open: values.open ?? 100,
    high: values.high ?? 101,
    low: values.low ?? 99,
    close: values.close ?? 100.5,
    volume: 1_000,
  };
}

const completeCoverage: CanonicalOutcomeInput["coverage"] = {
  provider_status: "available",
  freshness: "fresh",
  expected_candle_count: 1,
  blockers: [],
};

export const action664aLeakageCutoffFixture: CanonicalOutcomeInput = {
  recommended_at: "2026-07-08T13:32:00.000Z",
  side: "long",
  entry_policy: "immediate_at_recommendation",
  entry: 100,
  stop: 98,
  target: 104,
  candles: [
    candle("2026-07-08T13:30:00.000Z", "2026-07-08T13:35:00.000Z", {
      high: 105,
      low: 99,
    }),
    candle("2026-07-08T13:35:00.000Z", "2026-07-08T13:40:00.000Z", {
      high: 101,
      low: 99,
    }),
  ],
  coverage: completeCoverage,
};

export const action664aSameCandleFixture: CanonicalOutcomeInput = {
  recommended_at: "2026-07-08T13:30:00.000Z",
  side: "long",
  entry_policy: "immediate_at_recommendation",
  entry: 100,
  stop: 98,
  target: 104,
  candles: [
    candle("2026-07-08T13:30:00.000Z", "2026-07-08T13:35:00.000Z", {
      high: 105,
      low: 97,
    }),
  ],
  coverage: completeCoverage,
};

export const action664aNoEntryFixture: CanonicalOutcomeInput = {
  recommended_at: "2026-07-08T13:30:00.000Z",
  side: "long",
  entry_policy: "touch_after_recommendation",
  entry: 100,
  stop: 98,
  target: 104,
  candles: [
    candle("2026-07-08T13:30:00.000Z", "2026-07-08T13:35:00.000Z", {
      open: 102,
      high: 103,
      low: 101,
      close: 102,
    }),
  ],
  coverage: completeCoverage,
};

export const action664aProviderGapFixture: CanonicalOutcomeInput = {
  recommended_at: "2026-07-08T13:30:00.000Z",
  side: "long",
  entry_policy: "immediate_at_recommendation",
  entry: 100,
  stop: 98,
  target: 104,
  candles: [],
  coverage: {
    provider_status: "gap",
    freshness: "unknown",
    expected_candle_count: 3,
    blockers: ["provider_returned_no_candles"],
  },
};

export const action664aStaleFixture: CanonicalOutcomeInput = {
  recommended_at: "2026-07-08T13:30:00.000Z",
  side: "long",
  entry_policy: "immediate_at_recommendation",
  entry: 100,
  stop: 98,
  target: 104,
  candles: [
    candle("2026-07-08T13:30:00.000Z", "2026-07-08T13:35:00.000Z"),
  ],
  coverage: {
    provider_status: "available",
    freshness: "stale",
    expected_candle_count: 1,
    blockers: [],
  },
};

function coverage(
  status: CanonicalCoverage["status"],
): CanonicalCoverage {
  return {
    status,
    expected_candle_count: 1,
    observed_candle_count: status === "complete" ? 1 : 0,
    reason_codes: status === "complete" ? [] : [`fixture_${status}`],
  };
}

export const action664aHorizonPriorityFixture: CanonicalHorizonOutcome<string>[] =
  [
    { horizon: "15m", coverage: coverage("complete"), outcome: "15m-result" },
    { horizon: "60m", coverage: coverage("complete"), outcome: "60m-result" },
    { horizon: "30m", coverage: coverage("complete"), outcome: "30m-result" },
  ];

export const action664aHorizonFallbackFixture: CanonicalHorizonOutcome<string>[] =
  [
    { horizon: "60m", coverage: coverage("incomplete"), outcome: "60m-partial" },
    { horizon: "15m", coverage: coverage("complete"), outcome: "15m-result" },
    { horizon: "30m", coverage: coverage("complete"), outcome: "30m-result" },
  ];
