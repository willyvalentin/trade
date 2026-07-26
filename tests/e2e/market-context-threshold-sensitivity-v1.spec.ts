import { expect, test } from "@playwright/test";

import {
  buildMarketContextIntelligenceV1,
  MARKET_CONTEXT_INTELLIGENCE_VERSION,
  MARKET_CONTEXT_THRESHOLD_VERSION,
  type MarketContextIntelligenceV1Input,
  type MarketContextMetricPoint,
} from "../../lib/market-context-intelligence-lab/contract-v1";
import { marketContextIntelligenceV1GoldenFixtures } from "../../lib/market-context-intelligence-lab/golden-fixtures-v1";
import {
  buildMarketContextSensitivityStudyReport,
  countVersionedThresholdLeaves,
  generateDeterministicInputPermutations,
  MARKET_CONTEXT_SENSITIVITY_STUDY_VERSION,
} from "../../lib/market-context-intelligence-lab/sensitivity-study-v1";
import machineReadableReport from "../../docs/evidence/action-667b-market-context-sensitivity-report.json";

function fixtureInput(id: string) {
  const fixture = marketContextIntelligenceV1GoldenFixtures.find(
    (candidate) => candidate.id === id,
  );
  if (!fixture) throw new Error(`Missing fixture: ${id}`);
  return cloneInput(fixture.input);
}

function cloneInput(input: MarketContextIntelligenceV1Input) {
  return JSON.parse(JSON.stringify(input)) as MarketContextIntelligenceV1Input;
}

function boundaryThreshold(
  report: ReturnType<typeof buildMarketContextSensitivityStudyReport>,
  thresholdId: string,
) {
  const threshold = report.thresholds.find(
    (candidate) => candidate.threshold_id === thresholdId,
  );
  if (!threshold) throw new Error(`Missing threshold result: ${thresholdId}`);
  return threshold;
}

function rebaseInput(
  source: MarketContextIntelligenceV1Input,
  decisionTimestamp: string,
) {
  const input = cloneInput(source);
  const decisionMs = Date.parse(decisionTimestamp);
  const pointTimestamp = new Date(decisionMs - 5 * 60_000).toISOString();
  const receivedTimestamp = new Date(decisionMs - 4 * 60_000).toISOString();
  input.decision_timestamp = decisionTimestamp;

  for (const benchmark of input.benchmarks) {
    benchmark.provider.source_timestamp = pointTimestamp;
    benchmark.provider.received_timestamp = receivedTimestamp;
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      point.timestamp = pointTimestamp;
    }
  }
  if (input.breadth) {
    input.breadth.timestamp = pointTimestamp;
    input.breadth.provider.source_timestamp = pointTimestamp;
    input.breadth.provider.received_timestamp = receivedTimestamp;
  }
  for (const sector of input.sectors ?? []) {
    sector.provider.source_timestamp = pointTimestamp;
    sector.provider.received_timestamp = receivedTimestamp;
    for (const point of [
      ...sector.short_horizon,
      ...sector.medium_horizon,
    ]) {
      point.timestamp = pointTimestamp;
    }
  }
  return input;
}

function setPointTrend(
  point: MarketContextMetricPoint,
  direction: -1 | 0 | 1,
) {
  point.close = direction > 0 ? 110 : direction < 0 ? 90 : 100;
  point.moving_average_short =
    direction > 0 ? 105 : direction < 0 ? 95 : 100;
  point.moving_average_long = 100;
  point.return_pct = direction * 3;
  point.momentum_pct = direction * 1.5;
  point.trend_slope_pct = direction * 0.2;
}

test("study covers every versioned threshold with below, exact, and above cases", () => {
  const report = buildMarketContextSensitivityStudyReport();

  expect(report.report_version).toBe(
    MARKET_CONTEXT_SENSITIVITY_STUDY_VERSION,
  );
  expect(report.context_version).toBe(MARKET_CONTEXT_INTELLIGENCE_VERSION);
  expect(report.threshold_version).toBe(MARKET_CONTEXT_THRESHOLD_VERSION);
  expect(countVersionedThresholdLeaves()).toBe(21);
  expect(report.threshold_count).toBe(21);
  expect(report.boundary_case_count).toBe(63);
  expect(report.sweep_count).toBe(10);
  expect(
    report.thresholds.every(
      (threshold) =>
        threshold.boundary_cases.length === 3 &&
        threshold.boundary_cases.map((item) => item.position).join(",") ===
          "directly_below,exact,directly_above",
    ),
  ).toBe(true);
  expect(report.evidence_digest.algorithm).toBe("sha256");
  expect(report.evidence_digest.value).toMatch(/^[a-f0-9]{64}$/);
  expect(report.production_or_historical_data_used).toBe(false);
  expect(report.shadow_only).toBe(true);
  expect(report.live_ranking_effect).toBe(false);
});

test("checked machine-readable report matches the deterministic study digest and summaries", () => {
  const report = buildMarketContextSensitivityStudyReport();

  expect(machineReadableReport).toMatchObject({
    report_version: report.report_version,
    context_version: report.context_version,
    threshold_version: report.threshold_version,
    threshold_count: report.threshold_count,
    boundary_case_count: report.boundary_case_count,
    sweep_count: report.sweep_count,
    production_or_historical_data_used: false,
    shadow_only: true,
    live_ranking_effect: false,
  });
  expect(machineReadableReport.evidence_digest).toEqual(
    report.evidence_digest,
  );
  expect(machineReadableReport.threshold_local_churn).toEqual(
    report.thresholds.map((threshold) => ({
      threshold_id: threshold.threshold_id,
      observable_transition_count:
        threshold.local_churn.observable_transition_count,
      classification_transition_count:
        threshold.local_churn.classification_transition_count,
      evidence_transition_count:
        threshold.local_churn.evidence_transition_count,
      rankability_transition_count:
        threshold.local_churn.rankability_transition_count,
      local_churn_ratio: threshold.local_churn.local_churn_ratio,
      assessment: threshold.local_churn.assessment,
    })),
  );
  expect(machineReadableReport.sweeps).toEqual(
    report.sweeps.map((sweep) => ({
      sweep_id: sweep.sweep_id,
      point_count: sweep.points.length,
      classification_transition_count:
        sweep.classification_transition_count,
      observable_transition_count: sweep.observable_transition_count,
      classification_churn_ratio: sweep.classification_churn_ratio,
      observable_churn_ratio: sweep.observable_churn_ratio,
    })),
  );
});

test("local threshold churn is bounded and no automatic threshold change is recommended", () => {
  const report = buildMarketContextSensitivityStudyReport();

  expect(report.findings.excessive_local_churn_thresholds).toEqual([]);
  expect(report.findings.unclear_semantics_thresholds).toEqual([
    "freshness_minutes.intraday",
    "freshness_minutes.sector_short",
  ]);
  expect(report.findings.threshold_version_change_recommended).toBe(false);
  expect(
    report.thresholds.filter(
      (threshold) =>
        threshold.local_churn.assessment === "excessive_local_churn",
    ),
  ).toEqual([]);
  expect(
    report.thresholds.every(
      (threshold) =>
        threshold.local_churn.classification_transition_count <= 1 &&
        threshold.local_churn.evidence_transition_count <= 1 &&
        threshold.local_churn.rankability_transition_count <= 1,
    ),
  ).toBe(true);
});

test("boundary semantics are explicit for trend, volatility, breadth, sector, freshness, and coverage", () => {
  const report = buildMarketContextSensitivityStudyReport();
  const directionalReturn = boundaryThreshold(
    report,
    "trend.directional_return_pct",
  );
  const highVolatility = boundaryThreshold(
    report,
    "volatility_pct.elevated_upper_bound",
  );
  const broadBreadth = boundaryThreshold(
    report,
    "breadth.broad_lower_bound",
  );
  const sectorShort = boundaryThreshold(
    report,
    "sector_relative_return_pct.short_directional",
  );
  const sectorMedium = boundaryThreshold(
    report,
    "sector_relative_return_pct.medium_directional",
  );
  const sectorAcceleration = boundaryThreshold(
    report,
    "sector_relative_return_pct.acceleration_delta",
  );
  const freshness = boundaryThreshold(
    report,
    "freshness_minutes.multi_day",
  );
  const coverage = boundaryThreshold(
    report,
    "minimum_coverage.essential_index",
  );

  expect(
    directionalReturn.boundary_cases.map(
      (item) => item.output.dimensions.trend_state,
    ),
  ).toEqual(["flat", "up", "up"]);
  expect(
    highVolatility.boundary_cases.map(
      (item) => item.output.regime_classification,
    ),
  ).toEqual([
    "neutral_balanced",
    "choppy_high_volatility",
    "choppy_high_volatility",
  ]);
  expect(
    broadBreadth.boundary_cases.map(
      (item) => item.output.regime_classification,
    ),
  ).toEqual(["risk_on_fragile", "risk_on_trending", "risk_on_trending"]);
  expect(
    sectorShort.boundary_cases.map(
      (item) =>
        item.output.sector_contexts.find(
          (context) => context.context_id === "technology",
        )?.classification,
    ),
  ).toEqual(["neutral", "improving", "improving"]);
  expect(
    sectorMedium.boundary_cases.map(
      (item) =>
        item.output.sector_contexts.find(
          (context) => context.context_id === "technology",
        )?.classification,
    ),
  ).toEqual(["improving", "strong", "strong"]);
  expect(
    sectorAcceleration.boundary_cases.map(
      (item) =>
        item.output.sector_contexts.find(
          (context) => context.context_id === "technology",
        )?.acceleration,
    ),
  ).toEqual(["steady", "accelerating", "accelerating"]);
  expect(
    freshness.boundary_cases.map(
      (item) => item.output.regime_classification,
    ),
  ).toEqual(["risk_on_trending", "risk_on_trending", "insufficient_data"]);
  expect(
    coverage.boundary_cases.map(
      (item) => item.output.regime_classification,
    ),
  ).toEqual(["insufficient_data", "risk_on_trending", "risk_on_trending"]);
});

test("all requested sensitivity sweeps report transitions and local churn", () => {
  const report = buildMarketContextSensitivityStudyReport();

  expect(report.sweeps.map((sweep) => sweep.dimension)).toEqual([
    "trend",
    "risk",
    "volatility",
    "breadth",
    "spy_qqq_agreement",
    "intraday_multi_day_agreement",
    "sector_relative_strength",
    "sector_acceleration",
    "freshness",
    "coverage",
  ]);
  expect(
    report.sweeps.every(
      (sweep) =>
        sweep.points.length >= 3 &&
        sweep.transitions.length === sweep.points.length - 1 &&
        sweep.observable_churn_ratio >= 0 &&
        sweep.observable_churn_ratio <= 1 &&
        sweep.classification_churn_ratio >= 0 &&
        sweep.classification_churn_ratio <= 1,
    ),
  ).toBe(true);
  expect(
    report.sweeps.find((sweep) => sweep.dimension === "spy_qqq_agreement")
      ?.points[0]?.output.regime_classification,
  ).toBe("conflicting_context");
  expect(
    report.sweeps.find(
      (sweep) => sweep.dimension === "intraday_multi_day_agreement",
    )?.points[0]?.output.regime_classification,
  ).toBe("conflicting_context");
});

test("all conservative stability invariants pass", () => {
  const report = buildMarketContextSensitivityStudyReport();

  expect(report.invariants).toHaveLength(6);
  expect(report.invariants.every((invariant) => invariant.passed)).toBe(true);
  expect(
    report.invariants.find(
      (invariant) =>
        invariant.invariant_id ===
        "quality_degradation_never_increases_evidence",
    )?.evidence,
  ).toEqual({
    fresh_evidence: "strong",
    stale_evidence: "insufficient",
    lower_coverage_evidence: "insufficient",
  });
  expect(
    report.invariants.find(
      (invariant) =>
        invariant.invariant_id ===
        "future_data_never_changes_classification",
    )?.evidence.future_points_excluded,
  ).toBe(2);
});

test("deterministically generated permutations preserve the entire output", () => {
  const input = fixtureInput("clear_risk_on_trend");
  for (const benchmark of input.benchmarks) {
    const olderIntraday = {
      ...benchmark.intraday[0]!,
      timestamp: "2026-07-24T19:45:00.000Z",
    };
    const olderMultiDay = {
      ...benchmark.multi_day[0]!,
      timestamp: "2026-07-23T19:55:00.000Z",
    };
    benchmark.intraday.push(olderIntraday);
    benchmark.multi_day.push(olderMultiDay);
  }
  const expected = buildMarketContextIntelligenceV1(input);
  const permutations = generateDeterministicInputPermutations(input, 64);

  expect(permutations).toHaveLength(64);
  expect(
    permutations.every(
      (permutation) =>
        JSON.stringify(buildMarketContextIntelligenceV1(permutation)) ===
        JSON.stringify(expected),
    ),
  ).toBe(true);
});

test("timezone-equivalent and DST-boundary instants produce identical output", () => {
  const source = fixtureInput("clear_risk_on_trend");
  const timezonePairs = [
    [
      "2026-03-29T03:30:00+02:00",
      "2026-03-29T01:30:00.000Z",
    ],
    [
      "2026-10-25T02:30:00+01:00",
      "2026-10-25T01:30:00.000Z",
    ],
    [
      "2026-11-01T01:30:00-04:00",
      "2026-11-01T05:30:00.000Z",
    ],
  ] as const;

  for (const [offsetDecision, utcDecision] of timezonePairs) {
    const offsetOutput = buildMarketContextIntelligenceV1(
      rebaseInput(source, offsetDecision),
    );
    const utcOutput = buildMarketContextIntelligenceV1(
      rebaseInput(source, utcDecision),
    );

    expect(offsetOutput).toEqual(utcOutput);
    expect(offsetOutput.decision_timestamp).toBe(
      new Date(offsetDecision).toISOString(),
    );
  }
});

test("duplicate timestamps and out-of-order candles are deterministic", () => {
  const identicalDuplicateInput = fixtureInput("clear_risk_on_trend");
  const baseline = buildMarketContextIntelligenceV1(identicalDuplicateInput);
  for (const benchmark of identicalDuplicateInput.benchmarks) {
    benchmark.intraday.push({ ...benchmark.intraday[0]! });
    benchmark.multi_day.push({ ...benchmark.multi_day[0]! });
  }
  expect(buildMarketContextIntelligenceV1(identicalDuplicateInput)).toEqual(
    baseline,
  );

  const conflictingDuplicates = fixtureInput("clear_risk_on_trend");
  for (const benchmark of conflictingDuplicates.benchmarks) {
    const duplicate = { ...benchmark.multi_day[0]! };
    setPointTrend(duplicate, -1);
    benchmark.multi_day.push(duplicate);
  }
  const reversedDuplicates = cloneInput(conflictingDuplicates);
  for (const benchmark of reversedDuplicates.benchmarks) {
    benchmark.multi_day.reverse();
  }
  expect(buildMarketContextIntelligenceV1(reversedDuplicates)).toEqual(
    buildMarketContextIntelligenceV1(conflictingDuplicates),
  );

  const outOfOrder = fixtureInput("clear_risk_on_trend");
  for (const benchmark of outOfOrder.benchmarks) {
    const older = {
      ...benchmark.multi_day[0]!,
      timestamp: "2026-07-20T19:55:00.000Z",
    };
    benchmark.multi_day.unshift(older);
  }
  const reversed = cloneInput(outOfOrder);
  for (const benchmark of reversed.benchmarks) benchmark.multi_day.reverse();
  expect(buildMarketContextIntelligenceV1(reversed)).toEqual(
    buildMarketContextIntelligenceV1(outOfOrder),
  );
});

test("future and invalid timestamps are excluded across timezone representations", () => {
  const input = rebaseInput(
    fixtureInput("clear_risk_on_trend"),
    "2026-03-29T03:30:00+02:00",
  );
  for (const benchmark of input.benchmarks) {
    benchmark.multi_day.push({
      ...benchmark.multi_day[0]!,
      timestamp: "2026-03-29T03:31:00+02:00",
      return_pct: -100,
      momentum_pct: -100,
      trend_slope_pct: -100,
    });
  }
  input.benchmarks[0]?.intraday.push({
    ...input.benchmarks[0].intraday[0]!,
    timestamp: "not-a-timestamp",
  });
  const output = buildMarketContextIntelligenceV1(input);

  expect(output.regime_classification).toBe("risk_on_trending");
  expect(output.leakage_control.future_points_excluded).toBe(2);
  expect(output.leakage_control.invalid_timestamps_excluded).toBe(1);
  expect(output.dimensions.data_quality_state).toBe("degraded");
  expect(output.reason_codes).toContain("future_points_excluded");
  expect(output.reason_codes).toContain("invalid_timestamps_excluded");
});

test("zero, tiny, negative, and large finite movements remain deterministic", () => {
  const zeroInput = fixtureInput("clear_risk_on_trend");
  const tinyInput = fixtureInput("clear_risk_on_trend");
  const negativeInput = fixtureInput("clear_risk_on_trend");
  const largeInput = fixtureInput("clear_risk_on_trend");

  for (const benchmark of zeroInput.benchmarks) {
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      setPointTrend(point, 0);
    }
  }
  for (const benchmark of tinyInput.benchmarks) {
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      point.close = 100.00000001;
      point.moving_average_short = 100;
      point.moving_average_long = 99.99999999;
      point.return_pct = 0.00000001;
      point.momentum_pct = 0.00000001;
      point.trend_slope_pct = 0.00000001;
    }
  }
  for (const benchmark of negativeInput.benchmarks) {
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      setPointTrend(point, -1);
    }
  }
  for (const benchmark of largeInput.benchmarks) {
    for (const point of [...benchmark.intraday, ...benchmark.multi_day]) {
      point.close = 1_000_000;
      point.moving_average_short = 500_000;
      point.moving_average_long = 100_000;
      point.return_pct = 10_000;
      point.momentum_pct = 5_000;
      point.trend_slope_pct = 1_000;
    }
  }

  expect(
    buildMarketContextIntelligenceV1(zeroInput).dimensions.trend_state,
  ).toBe("flat");
  expect(
    buildMarketContextIntelligenceV1(tinyInput).dimensions.trend_state,
  ).toBe("flat");
  expect(
    buildMarketContextIntelligenceV1(negativeInput).dimensions.trend_state,
  ).toBe("strong_down");
  expect(
    buildMarketContextIntelligenceV1(largeInput).dimensions.trend_state,
  ).toBe("strong_up");
});

test("NaN and Infinity are rejected with explicit deterministic contract errors", () => {
  const nanInput = fixtureInput("clear_risk_on_trend");
  nanInput.benchmarks[0]!.multi_day[0]!.return_pct = Number.NaN;
  const infinityInput = fixtureInput("clear_risk_on_trend");
  infinityInput.benchmarks[0]!.provider.coverage =
    Number.POSITIVE_INFINITY;
  const negativeInfinityInput = fixtureInput("clear_risk_on_trend");
  negativeInfinityInput.sectors![0]!.short_horizon[0]!.relative_return_vs_spy_pct =
    Number.NEGATIVE_INFINITY;

  expect(() => buildMarketContextIntelligenceV1(nanInput)).toThrow(
    /market_context_intelligence_v1_non_finite_numeric_input:benchmarks\.(QQQ|SPY)\.multi_day\.0\.return_pct/,
  );
  expect(() => buildMarketContextIntelligenceV1(infinityInput)).toThrow(
    /market_context_intelligence_v1_non_finite_numeric_input:benchmarks\.(QQQ|SPY)\.provider\.coverage/,
  );
  expect(() =>
    buildMarketContextIntelligenceV1(negativeInfinityInput),
  ).toThrow(
    /market_context_intelligence_v1_non_finite_numeric_input:sectors\.(financials|technology)\.short_horizon\.0\.relative_return_vs_spy_pct/,
  );
});

test("version policy forbids silent changes and canonical binding remains gated", () => {
  const report = buildMarketContextSensitivityStudyReport();

  expect(report.version_policy.silent_threshold_changes_forbidden).toBe(true);
  expect(report.version_policy.threshold_version_required_for).toHaveLength(4);
  expect(report.version_policy.contract_minor_required_for).toHaveLength(3);
  expect(report.version_policy.contract_major_required_for).toHaveLength(3);
  expect(report.version_policy.rollback_metadata_required).toEqual([
    "previous_context_version",
    "previous_threshold_version",
    "candidate_evidence_digest",
    "rollback_reason",
    "approved_by",
    "approved_at",
  ]);
  expect(report.canonical_binding_readiness.status).toBe("not_ready");
  expect(
    report.canonical_binding_readiness.gates.filter(
      (gate) => gate.status === "pending",
    ).map((gate) => gate.gate_id),
  ).toEqual([
    "track_2_adapter_compatibility_review",
    "approved_shadow_comparison",
  ]);
});
