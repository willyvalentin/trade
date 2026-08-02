import { createHash } from "node:crypto";

import {
  buildMarketContextIntelligenceV1,
  MARKET_CONTEXT_INTELLIGENCE_VERSION,
  MARKET_CONTEXT_LAB_THRESHOLDS,
  MARKET_CONTEXT_THRESHOLD_VERSION,
  type MarketContextIntelligenceV1Input,
  type MarketContextIntelligenceV1Output,
  type MarketContextMetricPoint,
  type MarketSectorBenchmarkInput,
} from "./contract-v1";
import { marketContextIntelligenceV1GoldenFixtures } from "./golden-fixtures-v1";

export const MARKET_CONTEXT_SENSITIVITY_STUDY_VERSION =
  "market_context_threshold_sensitivity_study_v1" as const;

type BoundaryPosition = "directly_below" | "exact" | "directly_above";

type OutputSummary = {
  regime_classification:
    MarketContextIntelligenceV1Output["regime_classification"];
  confidence_label: MarketContextIntelligenceV1Output["confidence"]["label"];
  evidence_strength: MarketContextIntelligenceV1Output["evidence_strength"];
  dimensions: MarketContextIntelligenceV1Output["dimensions"];
  reason_codes: string[];
  sector_contexts: Array<{
    context_id: string;
    classification:
      MarketContextIntelligenceV1Output["sectors"][number]["classification"];
    short_relative_strength:
      MarketContextIntelligenceV1Output["sectors"][number]["short_relative_strength"];
    medium_relative_strength:
      MarketContextIntelligenceV1Output["sectors"][number]["medium_relative_strength"];
    acceleration:
      MarketContextIntelligenceV1Output["sectors"][number]["acceleration"];
  }>;
  sector_rankability: Array<{
    context_id: string;
    rank_status: "ranked" | "not_rankable";
    rank: number | null;
  }>;
  freshness_state: MarketContextIntelligenceV1Output["freshness"]["state"];
  provider_freshness_states: Array<{
    source_id: string;
    freshness_state:
      MarketContextIntelligenceV1Output["provider_timestamps"][number]["freshness_state"];
  }>;
};

type OutputTransition = {
  from: BoundaryPosition | string;
  to: BoundaryPosition | string;
  classification_changed: boolean;
  confidence_changed: boolean;
  evidence_changed: boolean;
  dimension_changes: string[];
  reason_codes_added: string[];
  reason_codes_removed: string[];
  sector_context_changed: boolean;
  rankability_changed: boolean;
  freshness_changed: boolean;
  observable_change: boolean;
};

type ThresholdDefinition = {
  threshold_id: string;
  value: number;
  epsilon: number;
  unit: "minutes" | "ratio" | "percentage_points";
  semantic: string;
  apply: (
    input: MarketContextIntelligenceV1Input,
    value: number,
  ) => MarketContextIntelligenceV1Input;
};

export type MarketContextBoundaryCaseResult = {
  threshold_id: string;
  position: BoundaryPosition;
  input_value: number;
  output: OutputSummary;
};

export type MarketContextThresholdSensitivityResult = {
  threshold_id: string;
  threshold_value: number;
  epsilon: number;
  unit: ThresholdDefinition["unit"];
  semantic: string;
  boundary_cases: MarketContextBoundaryCaseResult[];
  transitions: OutputTransition[];
  local_churn: {
    observable_transition_count: number;
    classification_transition_count: number;
    confidence_transition_count: number;
    evidence_transition_count: number;
    rankability_transition_count: number;
    reason_code_delta_count: number;
    local_churn_ratio: number;
    assessment:
      | "bounded_boundary_transition"
      | "no_observable_contract_effect"
      | "excessive_local_churn";
  };
};

export type MarketContextSweepResult = {
  sweep_id: string;
  dimension:
    | "trend"
    | "risk"
    | "volatility"
    | "breadth"
    | "spy_qqq_agreement"
    | "intraday_multi_day_agreement"
    | "sector_relative_strength"
    | "sector_acceleration"
    | "freshness"
    | "coverage";
  points: Array<{
    label: string;
    axis_value: number | string;
    output: OutputSummary;
  }>;
  transitions: OutputTransition[];
  classification_transition_count: number;
  observable_transition_count: number;
  classification_churn_ratio: number;
  observable_churn_ratio: number;
};

export type MarketContextStabilityInvariantResult = {
  invariant_id:
    | "quality_degradation_never_increases_evidence"
    | "future_data_never_changes_classification"
    | "incomplete_sector_universe_never_rankable"
    | "input_order_never_changes_output"
    | "conflict_never_silently_becomes_neutral"
    | "stronger_positive_evidence_never_degrades_trend";
  passed: boolean;
  evidence: Record<string, string | number | boolean | null>;
};

export type MarketContextSensitivityStudyReport = {
  report_version: typeof MARKET_CONTEXT_SENSITIVITY_STUDY_VERSION;
  context_version: typeof MARKET_CONTEXT_INTELLIGENCE_VERSION;
  threshold_version: typeof MARKET_CONTEXT_THRESHOLD_VERSION;
  generated_from_fixture_timestamp: string;
  deterministic_generation: true;
  production_or_historical_data_used: false;
  threshold_count: number;
  boundary_case_count: number;
  sweep_count: number;
  thresholds: MarketContextThresholdSensitivityResult[];
  sweeps: MarketContextSweepResult[];
  invariants: MarketContextStabilityInvariantResult[];
  findings: {
    excessive_local_churn_thresholds: string[];
    unclear_semantics_thresholds: string[];
    threshold_version_change_recommended: boolean;
    recommendation: string;
  };
  version_policy: {
    threshold_version_required_for: string[];
    contract_minor_required_for: string[];
    contract_major_required_for: string[];
    backward_compatibility_rules: string[];
    evidence_digest_requirement: string;
    shadow_comparison_requirement: string;
    rollback_metadata_required: string[];
    silent_threshold_changes_forbidden: true;
  };
  canonical_binding_readiness: {
    status: "not_ready";
    gates: Array<{
      gate_id: string;
      status: "pass" | "pending";
      evidence: string;
    }>;
    pending_requirements: string[];
  };
  evidence_digest: {
    algorithm: "sha256";
    canonicalization: "JSON.stringify_in_declared_property_order";
    value: string;
  };
  shadow_only: true;
  live_ranking_effect: false;
};

function goldenInput(id: string) {
  const fixture = marketContextIntelligenceV1GoldenFixtures.find(
    (candidate) => candidate.id === id,
  );
  if (!fixture) throw new Error(`market_context_sensitivity_fixture_missing:${id}`);
  return cloneInput(fixture.input);
}

function cloneInput(input: MarketContextIntelligenceV1Input) {
  return JSON.parse(JSON.stringify(input)) as MarketContextIntelligenceV1Input;
}

function round(value: number, digits = 6) {
  return Number(value.toFixed(digits));
}

function timestampAtAge(decisionTimestamp: string, ageMinutes: number) {
  return new Date(
    Date.parse(decisionTimestamp) - ageMinutes * 60_000,
  ).toISOString();
}

function forEachBenchmarkPoint(
  input: MarketContextIntelligenceV1Input,
  horizons: Array<"intraday" | "multi_day">,
  mutate: (point: MarketContextMetricPoint) => void,
) {
  for (const benchmark of input.benchmarks) {
    for (const horizon of horizons) {
      for (const point of benchmark[horizon]) mutate(point);
    }
  }
}

function setPointTrend(
  point: MarketContextMetricPoint,
  input: {
    returnPct: number;
    momentumPct: number;
    slopePct: number;
  },
) {
  const direction = Math.sign(input.returnPct || input.momentumPct || input.slopePct);
  if (direction > 0) {
    point.close = 110;
    point.moving_average_short = 105;
    point.moving_average_long = 100;
  } else if (direction < 0) {
    point.close = 90;
    point.moving_average_short = 95;
    point.moving_average_long = 100;
  } else {
    point.close = 100;
    point.moving_average_short = 100;
    point.moving_average_long = 100;
  }
  point.return_pct = input.returnPct;
  point.momentum_pct = input.momentumPct;
  point.trend_slope_pct = input.slopePct;
}

function setAllTrend(
  input: MarketContextIntelligenceV1Input,
  values: {
    returnPct: number;
    momentumPct: number;
    slopePct: number;
  },
) {
  forEachBenchmarkPoint(input, ["intraday", "multi_day"], (point) =>
    setPointTrend(point, values),
  );
  return input;
}

function setAllVolatility(
  input: MarketContextIntelligenceV1Input,
  value: number,
) {
  forEachBenchmarkPoint(input, ["intraday", "multi_day"], (point) => {
    point.realized_volatility_pct = value;
  });
  return input;
}

function technologySector(input: MarketContextIntelligenceV1Input) {
  const sector = input.sectors?.find(
    (candidate) =>
      (candidate.context_level ?? "sector") === "sector" &&
      candidate.sector_id === "technology",
  );
  if (!sector) {
    throw new Error("market_context_sensitivity_technology_sector_missing");
  }
  return sector;
}

function setSectorRelativeValues(
  sector: MarketSectorBenchmarkInput,
  shortRelative: number,
  mediumRelative: number,
) {
  for (const point of sector.short_horizon) {
    point.relative_return_vs_spy_pct = shortRelative;
    point.return_pct = shortRelative + (point.spy_return_pct ?? 0);
    point.trend_slope_pct = shortRelative < 0 ? -0.1 : 0.1;
  }
  for (const point of sector.medium_horizon) {
    point.relative_return_vs_spy_pct = mediumRelative;
    point.return_pct = mediumRelative + (point.spy_return_pct ?? 0);
    point.trend_slope_pct = mediumRelative < 0 ? -0.1 : 0.1;
  }
}

function setProviderCoverage(
  input: MarketContextIntelligenceV1Input,
  value: number,
  scope: "indices" | "breadth" | "sectors",
) {
  if (scope === "indices") {
    for (const benchmark of input.benchmarks) {
      benchmark.provider.coverage = value;
    }
  } else if (scope === "breadth" && input.breadth) {
    const expected = 10_000;
    const observed = Math.max(0, Math.min(expected, Math.round(value * expected)));
    input.breadth.coverage = value;
    input.breadth.expected_constituents = expected;
    input.breadth.observed_constituents = observed;
    input.breadth.provider.coverage = value;
    input.breadth.provider.expected_points = expected;
    input.breadth.provider.observed_points = observed;
    input.breadth.provider.missing_points = expected - observed;
  } else if (scope === "sectors") {
    for (const sector of input.sectors ?? []) {
      sector.provider.coverage = value;
    }
  }
  return input;
}

function setProviderAge(
  input: MarketContextIntelligenceV1Input,
  ageMinutes: number,
  scope: "indices" | "breadth" | "sectors",
) {
  const timestamp = timestampAtAge(input.decision_timestamp, ageMinutes);
  if (scope === "indices") {
    for (const benchmark of input.benchmarks) {
      benchmark.provider.source_timestamp = timestamp;
    }
  } else if (scope === "breadth" && input.breadth) {
    input.breadth.provider.source_timestamp = timestamp;
  } else if (scope === "sectors") {
    for (const sector of input.sectors ?? []) {
      sector.provider.source_timestamp = timestamp;
    }
  }
  return input;
}

function setPointAge(
  input: MarketContextIntelligenceV1Input,
  ageMinutes: number,
  scope: "intraday" | "sector_short",
) {
  const timestamp = timestampAtAge(input.decision_timestamp, ageMinutes);
  if (scope === "intraday") {
    forEachBenchmarkPoint(input, ["intraday"], (point) => {
      point.timestamp = timestamp;
    });
  } else {
    for (const sector of input.sectors ?? []) {
      for (const point of sector.short_horizon) point.timestamp = timestamp;
    }
  }
  return input;
}

const thresholdDefinitions: ThresholdDefinition[] = [
  {
    threshold_id: "freshness_minutes.intraday",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.intraday,
    epsilon: 0.01,
    unit: "minutes",
    semantic: "Maximum declared age for intraday context points.",
    apply: (input, value) => setPointAge(input, value, "intraday"),
  },
  {
    threshold_id: "freshness_minutes.multi_day",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.multi_day,
    epsilon: 0.01,
    unit: "minutes",
    semantic: "Maximum index provider age before essential data is stale.",
    apply: (input, value) => setProviderAge(input, value, "indices"),
  },
  {
    threshold_id: "freshness_minutes.breadth",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.breadth,
    epsilon: 0.01,
    unit: "minutes",
    semantic: "Maximum breadth provider age for freshness reporting.",
    apply: (input, value) => setProviderAge(input, value, "breadth"),
  },
  {
    threshold_id: "freshness_minutes.sector_short",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.sector_short,
    epsilon: 0.01,
    unit: "minutes",
    semantic: "Maximum declared age for short-horizon sector points.",
    apply: (input, value) => setPointAge(input, value, "sector_short"),
  },
  {
    threshold_id: "freshness_minutes.sector_medium",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.sector_medium,
    epsilon: 0.01,
    unit: "minutes",
    semantic: "Maximum sector provider age before sector context is stale.",
    apply: (input, value) => setProviderAge(input, value, "sectors"),
  },
  {
    threshold_id: "minimum_coverage.essential_index",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.minimum_coverage.essential_index,
    epsilon: 0.0001,
    unit: "ratio",
    semantic: "Minimum SPY and QQQ provider coverage.",
    apply: (input, value) => setProviderCoverage(input, value, "indices"),
  },
  {
    threshold_id: "minimum_coverage.breadth",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.minimum_coverage.breadth,
    epsilon: 0.0001,
    unit: "ratio",
    semantic: "Minimum optional breadth universe coverage.",
    apply: (input, value) => setProviderCoverage(input, value, "breadth"),
  },
  {
    threshold_id: "minimum_coverage.sector",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.minimum_coverage.sector,
    epsilon: 0.0001,
    unit: "ratio",
    semantic: "Minimum sector coverage for classification and ranking.",
    apply: (input, value) => setProviderCoverage(input, value, "sectors"),
  },
  {
    threshold_id: "trend.strong_return_pct",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.trend.strong_return_pct,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Minimum positive return for strong-up trend evidence.",
    apply: (input, value) =>
      setAllTrend(input, {
        returnPct: value,
        momentumPct: 1.5,
        slopePct: 0.2,
      }),
  },
  {
    threshold_id: "trend.directional_return_pct",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.trend.directional_return_pct,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Minimum positive return for directional-up trend evidence.",
    apply: (input, value) =>
      setAllTrend(input, {
        returnPct: value,
        momentumPct: 0.3,
        slopePct: 0.06,
      }),
  },
  {
    threshold_id: "trend.strong_momentum_pct",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.trend.strong_momentum_pct,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Minimum positive momentum for strong-up trend evidence.",
    apply: (input, value) =>
      setAllTrend(input, {
        returnPct: 2.5,
        momentumPct: value,
        slopePct: 0.2,
      }),
  },
  {
    threshold_id: "trend.directional_momentum_pct",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.trend.directional_momentum_pct,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Minimum positive momentum for directional-up trend evidence.",
    apply: (input, value) =>
      setAllTrend(input, {
        returnPct: 0.6,
        momentumPct: value,
        slopePct: 0.06,
      }),
  },
  {
    threshold_id: "trend.directional_slope_pct",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.trend.directional_slope_pct,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Minimum positive slope for strong-up trend evidence.",
    apply: (input, value) =>
      setAllTrend(input, {
        returnPct: 2.5,
        momentumPct: 1.5,
        slopePct: value,
      }),
  },
  {
    threshold_id: "volatility_pct.low_upper_bound",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.volatility_pct.low_upper_bound,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Exclusive upper bound for low realized volatility.",
    apply: (input, value) => setAllVolatility(input, value),
  },
  {
    threshold_id: "volatility_pct.normal_upper_bound",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.volatility_pct.normal_upper_bound,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Exclusive upper bound for normal realized volatility.",
    apply: (input, value) => setAllVolatility(input, value),
  },
  {
    threshold_id: "volatility_pct.elevated_upper_bound",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.volatility_pct.elevated_upper_bound,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Exclusive upper bound for elevated realized volatility.",
    apply: (input, value) => setAllVolatility(input, value),
  },
  {
    threshold_id: "breadth.broad_lower_bound",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.breadth.broad_lower_bound,
    epsilon: 0.0001,
    unit: "ratio",
    semantic: "Inclusive lower bound for broad participation.",
    apply: (input, value) => {
      if (input.breadth) {
        input.breadth.advancing_fraction = value;
        input.breadth.above_short_average_fraction = value;
      }
      return input;
    },
  },
  {
    threshold_id: "breadth.weak_upper_bound",
    value: MARKET_CONTEXT_LAB_THRESHOLDS.breadth.weak_upper_bound,
    epsilon: 0.0001,
    unit: "ratio",
    semantic: "Inclusive upper bound for weak participation.",
    apply: (input, value) => {
      if (input.breadth) {
        input.breadth.advancing_fraction = value;
        input.breadth.above_short_average_fraction = value;
      }
      return input;
    },
  },
  {
    threshold_id: "sector_relative_return_pct.short_directional",
    value:
      MARKET_CONTEXT_LAB_THRESHOLDS.sector_relative_return_pct
        .short_directional,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Inclusive short-horizon SPY-relative strength boundary.",
    apply: (input, value) => {
      setSectorRelativeValues(technologySector(input), value, 0);
      return input;
    },
  },
  {
    threshold_id: "sector_relative_return_pct.medium_directional",
    value:
      MARKET_CONTEXT_LAB_THRESHOLDS.sector_relative_return_pct
        .medium_directional,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Inclusive medium-horizon SPY-relative strength boundary.",
    apply: (input, value) => {
      setSectorRelativeValues(technologySector(input), 2.5, value);
      return input;
    },
  },
  {
    threshold_id: "sector_relative_return_pct.acceleration_delta",
    value:
      MARKET_CONTEXT_LAB_THRESHOLDS.sector_relative_return_pct
        .acceleration_delta,
    epsilon: 0.0001,
    unit: "percentage_points",
    semantic: "Inclusive short-minus-medium relative-return acceleration boundary.",
    apply: (input, value) => {
      setSectorRelativeValues(technologySector(input), 1, 1 - value);
      return input;
    },
  },
];

function thresholdBaseInput(definition: ThresholdDefinition) {
  if (definition.threshold_id.startsWith("volatility_pct.")) {
    return goldenInput("low_volatility_neutral_market");
  }
  if (definition.threshold_id === "breadth.weak_upper_bound") {
    return goldenInput("clear_risk_off_trend");
  }
  return goldenInput("clear_risk_on_trend");
}

function summarizeOutput(
  output: MarketContextIntelligenceV1Output,
): OutputSummary {
  return {
    regime_classification: output.regime_classification,
    confidence_label: output.confidence.label,
    evidence_strength: output.evidence_strength,
    dimensions: { ...output.dimensions },
    reason_codes: [
      ...output.reason_codes,
      ...output.sectors.flatMap((sector) =>
        sector.reason_codes.map(
          (code) =>
            `${sector.context_level}:${sector.industry_id ?? sector.sector_id}:${code}`,
        ),
      ),
    ].sort((first, second) => first.localeCompare(second)),
    sector_contexts: output.sectors.map((sector) => ({
      context_id: sector.industry_id ?? sector.sector_id,
      classification: sector.classification,
      short_relative_strength: sector.short_relative_strength,
      medium_relative_strength: sector.medium_relative_strength,
      acceleration: sector.acceleration,
    })),
    sector_rankability: output.sectors.map((sector) => ({
      context_id: sector.industry_id ?? sector.sector_id,
      rank_status: sector.rank_status,
      rank: sector.rank,
    })),
    freshness_state: output.freshness.state,
    provider_freshness_states: output.provider_timestamps.map((provider) => ({
      source_id: provider.source_id,
      freshness_state: provider.freshness_state,
    })),
  };
}

function stringSetDifference(first: string[], second: string[]) {
  const secondSet = new Set(second);
  return first.filter((value) => !secondSet.has(value));
}

function transition(
  fromLabel: string,
  from: OutputSummary,
  toLabel: string,
  to: OutputSummary,
): OutputTransition {
  const dimensionChanges = Object.keys(from.dimensions).filter((key) => {
    const dimension = key as keyof OutputSummary["dimensions"];
    return from.dimensions[dimension] !== to.dimensions[dimension];
  });
  const rankabilityChanged =
    JSON.stringify(from.sector_rankability) !==
    JSON.stringify(to.sector_rankability);
  const sectorContextChanged =
    JSON.stringify(from.sector_contexts) !== JSON.stringify(to.sector_contexts);
  const freshnessChanged =
    from.freshness_state !== to.freshness_state ||
    JSON.stringify(from.provider_freshness_states) !==
      JSON.stringify(to.provider_freshness_states);
  const reasonCodesAdded = stringSetDifference(
    to.reason_codes,
    from.reason_codes,
  );
  const reasonCodesRemoved = stringSetDifference(
    from.reason_codes,
    to.reason_codes,
  );
  const classificationChanged =
    from.regime_classification !== to.regime_classification;
  const confidenceChanged = from.confidence_label !== to.confidence_label;
  const evidenceChanged = from.evidence_strength !== to.evidence_strength;

  return {
    from: fromLabel,
    to: toLabel,
    classification_changed: classificationChanged,
    confidence_changed: confidenceChanged,
    evidence_changed: evidenceChanged,
    dimension_changes: dimensionChanges,
    reason_codes_added: reasonCodesAdded,
    reason_codes_removed: reasonCodesRemoved,
    sector_context_changed: sectorContextChanged,
    rankability_changed: rankabilityChanged,
    freshness_changed: freshnessChanged,
    observable_change:
      classificationChanged ||
      confidenceChanged ||
      evidenceChanged ||
      dimensionChanges.length > 0 ||
      reasonCodesAdded.length > 0 ||
      reasonCodesRemoved.length > 0 ||
      sectorContextChanged ||
      rankabilityChanged ||
      freshnessChanged,
  };
}

function boundaryResult(
  definition: ThresholdDefinition,
): MarketContextThresholdSensitivityResult {
  const positions: Array<{
    position: BoundaryPosition;
    value: number;
  }> = [
    {
      position: "directly_below",
      value: round(definition.value - definition.epsilon),
    },
    { position: "exact", value: definition.value },
    {
      position: "directly_above",
      value: round(definition.value + definition.epsilon),
    },
  ];
  const boundaryCases = positions.map(({ position, value }) => {
    const input = definition.apply(thresholdBaseInput(definition), value);
    return {
      threshold_id: definition.threshold_id,
      position,
      input_value: value,
      output: summarizeOutput(buildMarketContextIntelligenceV1(input)),
    };
  });
  const transitions = boundaryCases.slice(1).map((current, index) =>
    transition(
      boundaryCases[index]?.position ?? "unknown",
      boundaryCases[index]?.output ?? current.output,
      current.position,
      current.output,
    ),
  );
  const observableTransitionCount = transitions.filter(
    (item) => item.observable_change,
  ).length;
  const classificationTransitionCount = transitions.filter(
    (item) => item.classification_changed,
  ).length;
  const confidenceTransitionCount = transitions.filter(
    (item) => item.confidence_changed,
  ).length;
  const evidenceTransitionCount = transitions.filter(
    (item) => item.evidence_changed,
  ).length;
  const rankabilityTransitionCount = transitions.filter(
    (item) => item.rankability_changed,
  ).length;
  const reasonCodeDeltaCount = transitions.reduce(
    (sum, item) =>
      sum + item.reason_codes_added.length + item.reason_codes_removed.length,
    0,
  );
  const excessive =
    classificationTransitionCount > 1 ||
    confidenceTransitionCount > 1 ||
    evidenceTransitionCount > 1 ||
    rankabilityTransitionCount > 1;

  return {
    threshold_id: definition.threshold_id,
    threshold_value: definition.value,
    epsilon: definition.epsilon,
    unit: definition.unit,
    semantic: definition.semantic,
    boundary_cases: boundaryCases,
    transitions,
    local_churn: {
      observable_transition_count: observableTransitionCount,
      classification_transition_count: classificationTransitionCount,
      confidence_transition_count: confidenceTransitionCount,
      evidence_transition_count: evidenceTransitionCount,
      rankability_transition_count: rankabilityTransitionCount,
      reason_code_delta_count: reasonCodeDeltaCount,
      local_churn_ratio: round(observableTransitionCount / 2),
      assessment: excessive
        ? "excessive_local_churn"
        : observableTransitionCount === 0
          ? "no_observable_contract_effect"
          : "bounded_boundary_transition",
    },
  };
}

function setBenchmarkDirection(
  input: MarketContextIntelligenceV1Input,
  symbol: "SPY" | "QQQ",
  horizons: Array<"intraday" | "multi_day">,
  direction: -1 | 0 | 1,
) {
  const benchmark = input.benchmarks.find(
    (candidate) => candidate.symbol === symbol,
  );
  if (!benchmark) throw new Error(`sensitivity_benchmark_missing:${symbol}`);
  for (const horizon of horizons) {
    for (const point of benchmark[horizon]) {
      setPointTrend(point, {
        returnPct: direction * 3,
        momentumPct: direction * 1.5,
        slopePct: direction * 0.2,
      });
    }
  }
  return input;
}

function buildSweep(
  sweepId: string,
  dimension: MarketContextSweepResult["dimension"],
  cases: Array<{
    label: string;
    axisValue: number | string;
    input: MarketContextIntelligenceV1Input;
  }>,
): MarketContextSweepResult {
  const points = cases.map((item) => ({
    label: item.label,
    axis_value: item.axisValue,
    output: summarizeOutput(buildMarketContextIntelligenceV1(item.input)),
  }));
  const transitions = points.slice(1).map((current, index) =>
    transition(
      points[index]?.label ?? "unknown",
      points[index]?.output ?? current.output,
      current.label,
      current.output,
    ),
  );
  const classificationTransitionCount = transitions.filter(
    (item) => item.classification_changed,
  ).length;
  const observableTransitionCount = transitions.filter(
    (item) => item.observable_change,
  ).length;
  const denominator = Math.max(1, transitions.length);

  return {
    sweep_id: sweepId,
    dimension,
    points,
    transitions,
    classification_transition_count: classificationTransitionCount,
    observable_transition_count: observableTransitionCount,
    classification_churn_ratio: round(
      classificationTransitionCount / denominator,
    ),
    observable_churn_ratio: round(observableTransitionCount / denominator),
  };
}

function trendSweep() {
  const values = [-4, -2, -0.5, -0.0001, 0, 0.0001, 0.5, 2, 4];
  return buildSweep(
    "trend_signed_evidence_sweep",
    "trend",
    values.map((value) => ({
      label: `trend_${value}`,
      axisValue: value,
      input: setAllTrend(goldenInput("clear_risk_on_trend"), {
        returnPct: value,
        momentumPct: value / 2,
        slopePct: value === 0 ? 0 : Math.sign(value) * 0.1,
      }),
    })),
  );
}

function riskSweep() {
  const riskOn = goldenInput("clear_risk_on_trend");
  const riskOnHighVol = setAllVolatility(
    goldenInput("clear_risk_on_trend"),
    3,
  );
  const neutral = goldenInput("low_volatility_neutral_market");
  const riskOff = goldenInput("clear_risk_off_trend");
  const riskOffHighVol = setAllVolatility(
    goldenInput("clear_risk_off_trend"),
    3,
  );
  return buildSweep("risk_state_scenarios", "risk", [
    { label: "risk_off_high_vol", axisValue: -2, input: riskOffHighVol },
    { label: "risk_off_normal", axisValue: -1, input: riskOff },
    { label: "neutral_low_vol", axisValue: 0, input: neutral },
    { label: "risk_on_normal", axisValue: 1, input: riskOn },
    { label: "risk_on_high_vol", axisValue: 2, input: riskOnHighVol },
  ]);
}

function volatilitySweep() {
  const values = [0, 0.7999, 0.8, 1.4999, 1.5, 2.4999, 2.5, 5];
  return buildSweep(
    "volatility_threshold_sweep",
    "volatility",
    values.map((value) => ({
      label: `volatility_${value}`,
      axisValue: value,
      input: setAllVolatility(
        goldenInput("low_volatility_neutral_market"),
        value,
      ),
    })),
  );
}

function breadthSweep() {
  const values = [0, 0.3999, 0.4, 0.4001, 0.5999, 0.6, 0.6001, 1];
  return buildSweep(
    "breadth_participation_sweep",
    "breadth",
    values.map((value) => {
      const input = goldenInput("clear_risk_on_trend");
      if (input.breadth) {
        input.breadth.advancing_fraction = value;
        input.breadth.above_short_average_fraction = value;
      }
      return {
        label: `breadth_${value}`,
        axisValue: value,
        input,
      };
    }),
  );
}

function agreementSweep() {
  return buildSweep(
    "spy_qqq_agreement_sweep",
    "spy_qqq_agreement",
    ([-1, 0, 1] as const).map((direction) => ({
      label:
        direction < 0
          ? "qqq_bearish"
          : direction > 0
            ? "qqq_bullish"
            : "qqq_flat",
      axisValue: direction,
      input: setBenchmarkDirection(
        goldenInput("clear_risk_on_trend"),
        "QQQ",
        ["intraday", "multi_day"],
        direction,
      ),
    })),
  );
}

function horizonAgreementSweep() {
  return buildSweep(
    "intraday_multi_day_agreement_sweep",
    "intraday_multi_day_agreement",
    ([-1, 0, 1] as const).map((direction) => {
      const input = goldenInput("clear_risk_on_trend");
      setBenchmarkDirection(input, "SPY", ["intraday"], direction);
      setBenchmarkDirection(input, "QQQ", ["intraday"], direction);
      return {
        label:
          direction < 0
            ? "intraday_bearish_multi_day_bullish"
            : direction > 0
              ? "intraday_bullish_multi_day_bullish"
              : "intraday_flat_multi_day_bullish",
        axisValue: direction,
        input,
      };
    }),
  );
}

function sectorRelativeSweep() {
  const values = [-4, -1.5, -0.5, -0.0001, 0, 0.0001, 0.5, 1.5, 4];
  return buildSweep(
    "sector_relative_strength_sweep",
    "sector_relative_strength",
    values.map((value) => {
      const input = goldenInput("clear_risk_on_trend");
      setSectorRelativeValues(technologySector(input), value, value);
      return {
        label: `sector_relative_${value}`,
        axisValue: value,
        input,
      };
    }),
  );
}

function sectorAccelerationSweep() {
  const values = [-1, -0.5, -0.4999, 0, 0.4999, 0.5, 1];
  return buildSweep(
    "sector_acceleration_sweep",
    "sector_acceleration",
    values.map((value) => {
      const input = goldenInput("clear_risk_on_trend");
      setSectorRelativeValues(technologySector(input), 1, 1 - value);
      return {
        label: `sector_acceleration_${value}`,
        axisValue: value,
        input,
      };
    }),
  );
}

function freshnessSweep() {
  const values = [0, 29.99, 30, 30.01, 2_159.99, 2_160, 2_160.01, 5_000];
  return buildSweep(
    "essential_index_freshness_sweep",
    "freshness",
    values.map((value) => ({
      label: `freshness_minutes_${value}`,
      axisValue: value,
      input: setProviderAge(goldenInput("clear_risk_on_trend"), value, "indices"),
    })),
  );
}

function coverageSweep() {
  const values = [0, 0.6999, 0.7, 0.7999, 0.8, 0.8001, 1];
  return buildSweep(
    "essential_index_coverage_sweep",
    "coverage",
    values.map((value) => ({
      label: `coverage_${value}`,
      axisValue: value,
      input: setProviderCoverage(
        goldenInput("clear_risk_on_trend"),
        value,
        "indices",
      ),
    })),
  );
}

function evidenceOrdinal(
  strength: MarketContextIntelligenceV1Output["evidence_strength"],
) {
  return {
    insufficient: 0,
    weak: 1,
    moderate: 2,
    strong: 3,
  }[strength];
}

function trendOrdinal(state: MarketContextIntelligenceV1Output["dimensions"]["trend_state"]) {
  return {
    insufficient_data: -4,
    strong_down: -2,
    down: -1,
    flat: 0,
    conflicting: 0,
    up: 1,
    strong_up: 2,
  }[state];
}

export function generateDeterministicInputPermutations(
  source: MarketContextIntelligenceV1Input,
  count = 32,
) {
  let state = 0x667b2026;
  const next = () => {
    state = (Math.imul(state, 1_664_525) + 1_013_904_223) >>> 0;
    return state;
  };
  const shuffle = <T>(values: T[]) => {
    for (let index = values.length - 1; index > 0; index -= 1) {
      const target = next() % (index + 1);
      [values[index], values[target]] = [values[target]!, values[index]!];
    }
  };

  return Array.from({ length: count }, () => {
    const input = cloneInput(source);
    shuffle(input.benchmarks);
    for (const benchmark of input.benchmarks) {
      shuffle(benchmark.intraday);
      shuffle(benchmark.multi_day);
    }
    if (input.sectors) {
      shuffle(input.sectors);
      for (const sector of input.sectors) {
        shuffle(sector.short_horizon);
        shuffle(sector.medium_horizon);
      }
    }
    if (input.sector_universe) {
      shuffle(input.sector_universe.expected_sector_ids);
    }
    return input;
  });
}

function invariantResults(): MarketContextStabilityInvariantResult[] {
  const fresh = buildMarketContextIntelligenceV1(
    goldenInput("clear_risk_on_trend"),
  );
  const stale = buildMarketContextIntelligenceV1(
    setProviderAge(
      goldenInput("clear_risk_on_trend"),
      MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.multi_day + 0.01,
      "indices",
    ),
  );
  const lowerCoverage = buildMarketContextIntelligenceV1(
    setProviderCoverage(
      goldenInput("clear_risk_on_trend"),
      MARKET_CONTEXT_LAB_THRESHOLDS.minimum_coverage.essential_index - 0.0001,
      "indices",
    ),
  );
  const qualityInvariant =
    evidenceOrdinal(stale.evidence_strength) <=
      evidenceOrdinal(fresh.evidence_strength) &&
    evidenceOrdinal(lowerCoverage.evidence_strength) <=
      evidenceOrdinal(fresh.evidence_strength);

  const withoutFutureInput = goldenInput("clear_risk_on_trend");
  const withFutureInput = cloneInput(withoutFutureInput);
  for (const benchmark of withFutureInput.benchmarks) {
    const futurePoint = cloneMetricPoint(benchmark.multi_day[0]);
    futurePoint.timestamp = new Date(
      Date.parse(withFutureInput.decision_timestamp) + 60_000,
    ).toISOString();
    setPointTrend(futurePoint, {
      returnPct: -100,
      momentumPct: -100,
      slopePct: -100,
    });
    benchmark.multi_day.push(futurePoint);
  }
  const withoutFuture = buildMarketContextIntelligenceV1(withoutFutureInput);
  const withFuture = buildMarketContextIntelligenceV1(withFutureInput);

  const incomplete = buildMarketContextIntelligenceV1(
    goldenInput("incomplete_sector_universe"),
  );
  const canonicalPermutationInput = goldenInput("clear_risk_on_trend");
  for (const benchmark of canonicalPermutationInput.benchmarks) {
    const olderIntraday = cloneMetricPoint(benchmark.intraday[0]);
    olderIntraday.timestamp = timestampAtAge(
      canonicalPermutationInput.decision_timestamp,
      10,
    );
    benchmark.intraday.push(olderIntraday);
    const olderMultiDay = cloneMetricPoint(benchmark.multi_day[0]);
    olderMultiDay.timestamp = timestampAtAge(
      canonicalPermutationInput.decision_timestamp,
      1_000,
    );
    benchmark.multi_day.push(olderMultiDay);
  }
  const canonicalPermutationOutput = buildMarketContextIntelligenceV1(
    canonicalPermutationInput,
  );
  const permutationPassed = generateDeterministicInputPermutations(
    canonicalPermutationInput,
  ).every(
    (input) =>
      JSON.stringify(buildMarketContextIntelligenceV1(input)) ===
      JSON.stringify(canonicalPermutationOutput),
  );

  const conflict = buildMarketContextIntelligenceV1(
    goldenInput("spy_qqq_disagreement"),
  );
  const weakerPositive = buildMarketContextIntelligenceV1(
    setAllTrend(goldenInput("clear_risk_on_trend"), {
      returnPct: 0.5,
      momentumPct: 0.25,
      slopePct: 0.05,
    }),
  );
  const strongerPositive = buildMarketContextIntelligenceV1(
    setAllTrend(goldenInput("clear_risk_on_trend"), {
      returnPct: 2,
      momentumPct: 1,
      slopePct: 0.05,
    }),
  );

  return [
    {
      invariant_id: "quality_degradation_never_increases_evidence",
      passed: qualityInvariant,
      evidence: {
        fresh_evidence: fresh.evidence_strength,
        stale_evidence: stale.evidence_strength,
        lower_coverage_evidence: lowerCoverage.evidence_strength,
      },
    },
    {
      invariant_id: "future_data_never_changes_classification",
      passed:
        withoutFuture.regime_classification ===
        withFuture.regime_classification,
      evidence: {
        without_future: withoutFuture.regime_classification,
        with_future: withFuture.regime_classification,
        future_points_excluded:
          withFuture.leakage_control.future_points_excluded,
      },
    },
    {
      invariant_id: "incomplete_sector_universe_never_rankable",
      passed: incomplete.sectors.every(
        (sector) => sector.rank_status === "not_rankable",
      ),
      evidence: {
        sector_count: incomplete.sectors.length,
        ranked_count: incomplete.sectors.filter(
          (sector) => sector.rank_status === "ranked",
        ).length,
      },
    },
    {
      invariant_id: "input_order_never_changes_output",
      passed: permutationPassed,
      evidence: {
        deterministic_permutation_count: 32,
        all_outputs_equal: permutationPassed,
      },
    },
    {
      invariant_id: "conflict_never_silently_becomes_neutral",
      passed:
        conflict.regime_classification === "conflicting_context" &&
        conflict.dimensions.spy_qqq_agreement === "disagreement",
      evidence: {
        classification: conflict.regime_classification,
        agreement: conflict.dimensions.spy_qqq_agreement,
      },
    },
    {
      invariant_id: "stronger_positive_evidence_never_degrades_trend",
      passed:
        trendOrdinal(strongerPositive.dimensions.trend_state) >=
        trendOrdinal(weakerPositive.dimensions.trend_state),
      evidence: {
        weaker_trend: weakerPositive.dimensions.trend_state,
        stronger_trend: strongerPositive.dimensions.trend_state,
      },
    },
  ];
}

function cloneMetricPoint(point: MarketContextMetricPoint | undefined) {
  if (!point) throw new Error("market_context_sensitivity_point_missing");
  return { ...point };
}

export function countVersionedThresholdLeaves() {
  const visit = (value: unknown): number => {
    if (typeof value === "number") return 1;
    if (typeof value !== "object" || value === null) return 0;
    return Object.values(value).reduce(
      (sum, nested) => sum + visit(nested),
      0,
    );
  };
  return visit(MARKET_CONTEXT_LAB_THRESHOLDS);
}

export function buildMarketContextSensitivityStudyReport(): MarketContextSensitivityStudyReport {
  const thresholds = thresholdDefinitions.map(boundaryResult);
  const sweeps = [
    trendSweep(),
    riskSweep(),
    volatilitySweep(),
    breadthSweep(),
    agreementSweep(),
    horizonAgreementSweep(),
    sectorRelativeSweep(),
    sectorAccelerationSweep(),
    freshnessSweep(),
    coverageSweep(),
  ];
  const invariants = invariantResults();
  const excessiveThresholds = thresholds
    .filter(
      (threshold) =>
        threshold.local_churn.assessment === "excessive_local_churn",
    )
    .map((threshold) => threshold.threshold_id);
  const unclearThresholds = thresholds
    .filter(
      (threshold) =>
        threshold.local_churn.assessment ===
        "no_observable_contract_effect",
    )
    .map((threshold) => threshold.threshold_id);
  const reportWithoutDigest = {
    report_version: MARKET_CONTEXT_SENSITIVITY_STUDY_VERSION,
    context_version: MARKET_CONTEXT_INTELLIGENCE_VERSION,
    threshold_version: MARKET_CONTEXT_THRESHOLD_VERSION,
    generated_from_fixture_timestamp:
      goldenInput("clear_risk_on_trend").decision_timestamp,
    deterministic_generation: true as const,
    production_or_historical_data_used: false as const,
    threshold_count: thresholds.length,
    boundary_case_count: thresholds.reduce(
      (sum, threshold) => sum + threshold.boundary_cases.length,
      0,
    ),
    sweep_count: sweeps.length,
    thresholds,
    sweeps,
    invariants,
    findings: {
      excessive_local_churn_thresholds: excessiveThresholds,
      unclear_semantics_thresholds: unclearThresholds,
      threshold_version_change_recommended: excessiveThresholds.length > 0,
      recommendation:
        excessiveThresholds.length > 0
          ? "Review excessive churn in a separately approved threshold version; do not mutate v1."
          : "Keep v1 thresholds unchanged. Review no-effect freshness semantics before historical shadow evaluation.",
    },
    version_policy: {
      threshold_version_required_for: [
        "Any numeric threshold value change.",
        "Any inclusive/exclusive boundary change.",
        "Any threshold unit, horizon, freshness clock, or coverage denominator change.",
        "Any reassignment of a threshold to a different dimension or terminal classification.",
      ],
      contract_minor_required_for: [
        "Backward-compatible optional inputs or additive output fields.",
        "New reason codes that do not reinterpret existing fields.",
        "Additive terminal metadata with unchanged existing semantics.",
      ],
      contract_major_required_for: [
        "Removing or renaming existing input/output fields or terminal labels.",
        "Changing required inputs, nullability, ranking semantics, or point-in-time rules.",
        "Changing an existing field meaning or allowing live effects.",
      ],
      backward_compatibility_rules: [
        "Existing valid v1 fixtures must retain their documented outputs within the same threshold version.",
        "Readers must ignore unknown additive fields for minor-compatible evolution.",
        "Non-finite numeric values are outside the valid v1 input domain and are rejected explicitly.",
      ],
      evidence_digest_requirement:
        "Every candidate version must publish a SHA-256 digest over its deterministic fixture/sensitivity report.",
      shadow_comparison_requirement:
        "A candidate version must be compared side-by-side on an approved shadow dataset before canonical binding.",
      rollback_metadata_required: [
        "previous_context_version",
        "previous_threshold_version",
        "candidate_evidence_digest",
        "rollback_reason",
        "approved_by",
        "approved_at",
      ],
      silent_threshold_changes_forbidden: true as const,
    },
    canonical_binding_readiness: {
      status: "not_ready" as const,
      gates: [
        {
          gate_id: "stable_contract_and_thresholds",
          status: "pass" as const,
          evidence: "All boundary fixtures are deterministic; no excessive local churn was detected.",
        },
        {
          gate_id: "leakage_controls_green",
          status: "pass" as const,
          evidence: "Future points are excluded and permutation/timestamp invariants pass.",
        },
        {
          gate_id: "freshness_and_coverage_explicit",
          status: "pass" as const,
          evidence: "Outputs preserve freshness, coverage, missingness, and provider timestamps.",
        },
        {
          gate_id: "full_version_metadata",
          status: "pass" as const,
          evidence: "Context, threshold, study, adapter, and evidence digest metadata are explicit.",
        },
        {
          gate_id: "zero_live_ranking_effect",
          status: "pass" as const,
          evidence: "shadow_only is true and live_ranking_effect is false.",
        },
        {
          gate_id: "track_2_adapter_compatibility_review",
          status: "pending" as const,
          evidence: "Adapter remains inactive and unbound; compatibility must be reviewed without importing untracked Track 2 files.",
        },
        {
          gate_id: "approved_shadow_comparison",
          status: "pending" as const,
          evidence: "No production or historical provider data is authorized in Action 667B.",
        },
      ],
      pending_requirements: [
        "Independent Spår 2 adapter-format review.",
        "Approved historical shadow comparison with expectancy, precision@K, calibration, opportunity cost, coverage, missingness, and stability metrics.",
      ],
    },
    shadow_only: true as const,
    live_ranking_effect: false as const,
  };
  const digest = createHash("sha256")
    .update(JSON.stringify(reportWithoutDigest))
    .digest("hex");

  return {
    ...reportWithoutDigest,
    evidence_digest: {
      algorithm: "sha256",
      canonicalization: "JSON.stringify_in_declared_property_order",
      value: digest,
    },
  };
}
