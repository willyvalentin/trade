export const MARKET_CONTEXT_INTELLIGENCE_VERSION =
  "market_context_intelligence_v1" as const;

export const MARKET_CONTEXT_THRESHOLD_VERSION =
  "market_context_intelligence_thresholds_2026_07_26_v1" as const;

export const MARKET_CONTEXT_LAB_THRESHOLDS = {
  freshness_minutes: {
    intraday: 30,
    multi_day: 2_160,
    breadth: 30,
    sector_short: 30,
    sector_medium: 2_160,
  },
  minimum_coverage: {
    essential_index: 0.8,
    breadth: 0.7,
    sector: 0.8,
  },
  trend: {
    strong_return_pct: 2,
    directional_return_pct: 0.5,
    strong_momentum_pct: 1,
    directional_momentum_pct: 0.25,
    directional_slope_pct: 0.05,
  },
  volatility_pct: {
    low_upper_bound: 0.8,
    normal_upper_bound: 1.5,
    elevated_upper_bound: 2.5,
  },
  breadth: {
    broad_lower_bound: 0.6,
    weak_upper_bound: 0.4,
  },
  sector_relative_return_pct: {
    short_directional: 0.5,
    medium_directional: 1.5,
    acceleration_delta: 0.5,
  },
} as const;

export type MarketContextInterval = "intraday" | "multi_day";

export type MarketContextMetricPoint = {
  timestamp: string;
  close: number | null;
  return_pct: number | null;
  moving_average_short: number | null;
  moving_average_long: number | null;
  momentum_pct: number | null;
  trend_slope_pct: number | null;
  realized_volatility_pct: number | null;
  range_pct: number | null;
};

export type MarketContextProviderMetadata = {
  provider: string;
  source_timestamp: string | null;
  received_timestamp?: string | null;
  expected_points: number;
  observed_points: number;
  missing_points: number;
  coverage: number;
};

export type MarketContextBenchmarkInput = {
  symbol: "SPY" | "QQQ";
  intraday: MarketContextMetricPoint[];
  multi_day: MarketContextMetricPoint[];
  provider: MarketContextProviderMetadata;
};

export type MarketBreadthInput = {
  timestamp: string;
  advancing_fraction: number | null;
  above_short_average_fraction: number | null;
  expected_constituents: number;
  observed_constituents: number;
  coverage: number;
  provider: MarketContextProviderMetadata;
};

export type SectorHorizonInput = {
  timestamp: string;
  return_pct: number | null;
  spy_return_pct: number | null;
  relative_return_vs_spy_pct: number | null;
  trend_slope_pct: number | null;
  realized_volatility_pct: number | null;
};

export type MarketSectorBenchmarkInput = {
  context_level?: "sector" | "industry";
  sector_id: string;
  industry_id?: string | null;
  benchmark_symbol: string;
  short_horizon: SectorHorizonInput[];
  medium_horizon: SectorHorizonInput[];
  provider: MarketContextProviderMetadata;
};

export type MarketContextIntelligenceV1Input = {
  decision_timestamp: string;
  benchmarks: MarketContextBenchmarkInput[];
  breadth?: MarketBreadthInput | null;
  sectors?: MarketSectorBenchmarkInput[];
  sector_universe?: {
    expected_sector_ids: string[];
  } | null;
};

export type MarketContextTrendState =
  | "strong_up"
  | "up"
  | "flat"
  | "down"
  | "strong_down"
  | "conflicting"
  | "insufficient_data";

export type MarketContextRiskState =
  | "risk_on"
  | "neutral"
  | "risk_off"
  | "stressed"
  | "conflicting"
  | "insufficient_data";

export type MarketContextVolatilityState =
  | "low"
  | "normal"
  | "elevated"
  | "high"
  | "insufficient_data";

export type MarketContextBreadthState =
  | "broad"
  | "narrow"
  | "weak"
  | "unavailable"
  | "insufficient_data";

export type MarketContextAgreementState =
  | "agreement_bullish"
  | "agreement_bearish"
  | "agreement_neutral"
  | "disagreement"
  | "insufficient_data";

export type MarketContextHorizonState =
  | "bullish"
  | "neutral"
  | "bearish"
  | "choppy"
  | "conflicting"
  | "insufficient_data";

export type MarketContextDataQualityState =
  | "good"
  | "degraded"
  | "stale"
  | "provider_gap"
  | "insufficient_data";

export type MarketContextRegimeClassification =
  | "risk_on_trending"
  | "risk_on_fragile"
  | "neutral_balanced"
  | "choppy_high_volatility"
  | "risk_off_orderly"
  | "risk_off_stressed"
  | "insufficient_data"
  | "conflicting_context";

export type MarketContextEvidenceStrength =
  | "insufficient"
  | "weak"
  | "moderate"
  | "strong";

export type MarketContextConfidenceLabel =
  | "insufficient_evidence"
  | "limited_evidence"
  | "supported"
  | "strongly_supported";

export type SectorStrengthClassification =
  | "strong"
  | "improving"
  | "neutral"
  | "deteriorating"
  | "weak"
  | "conflicting"
  | "insufficient_data";

export type SectorTrendAgreement =
  | "bullish_agreement"
  | "bearish_agreement"
  | "mixed"
  | "insufficient_data";

export type SectorAccelerationState =
  | "accelerating"
  | "steady"
  | "decelerating"
  | "insufficient_data";

export type ProviderTimestampOutput = {
  source_id: string;
  provider: string;
  source_timestamp: string | null;
  received_timestamp: string | null;
  freshness_minutes: number | null;
  freshness_state: "fresh" | "stale" | "missing" | "future_excluded";
  coverage: number;
  missing_points: number;
};

export type MarketSectorContextOutput = {
  context_level: "sector" | "industry";
  sector_id: string;
  industry_id: string | null;
  benchmark_symbol: string;
  classification: SectorStrengthClassification;
  short_relative_strength: "strong" | "neutral" | "weak" | "insufficient_data";
  medium_relative_strength: "strong" | "neutral" | "weak" | "insufficient_data";
  short_relative_return_vs_spy_pct: number | null;
  medium_relative_return_vs_spy_pct: number | null;
  trend_agreement: SectorTrendAgreement;
  acceleration: SectorAccelerationState;
  freshness_state: "fresh" | "stale" | "missing";
  coverage: number;
  missingness: number;
  rank_status: "ranked" | "not_rankable";
  rank: number | null;
  comparable_sector_count: number;
  reason_codes: string[];
};

export type MarketContextIntelligenceV1Output = {
  context_version: typeof MARKET_CONTEXT_INTELLIGENCE_VERSION;
  threshold_version: typeof MARKET_CONTEXT_THRESHOLD_VERSION;
  decision_timestamp: string;
  regime_classification: MarketContextRegimeClassification;
  dimensions: {
    trend_state: MarketContextTrendState;
    risk_state: MarketContextRiskState;
    volatility_state: MarketContextVolatilityState;
    breadth_state: MarketContextBreadthState;
    spy_qqq_agreement: MarketContextAgreementState;
    intraday_context: MarketContextHorizonState;
    multi_day_context: MarketContextHorizonState;
    data_quality_state: MarketContextDataQualityState;
  };
  sectors: MarketSectorContextOutput[];
  confidence: {
    label: MarketContextConfidenceLabel;
    calibrated_probability: false;
    basis: "deterministic_rule_evidence_not_probability";
  };
  evidence_strength: MarketContextEvidenceStrength;
  provider_timestamps: ProviderTimestampOutput[];
  freshness: {
    state: "fresh" | "degraded" | "stale" | "insufficient_data";
    stalest_minutes: number | null;
    stale_source_ids: string[];
  };
  coverage: {
    essential_index_coverage: number;
    breadth_coverage: number | null;
    sector_coverage: number | null;
    missingness: number;
  };
  leakage_control: {
    future_points_excluded: number;
    future_provider_timestamps_excluded: number;
    invalid_timestamps_excluded: number;
  };
  reason_codes: string[];
  shadow_only: true;
  live_ranking_effect: false;
};

type SanitizedPoint = MarketContextMetricPoint & {
  timestamp_ms: number;
};

type BenchmarkAnalysis = {
  symbol: "SPY" | "QQQ";
  intraday: SanitizedPoint | null;
  multiDay: SanitizedPoint | null;
  intradayTrend: MarketContextTrendState;
  multiDayTrend: MarketContextTrendState;
  provider: MarketContextProviderMetadata;
};

type LeakageCounters = {
  futurePoints: number;
  futureProviderTimestamps: number;
  invalidTimestamps: number;
};

type ProviderAnalysis = {
  output: ProviderTimestampOutput;
  isGap: boolean;
  isStale: boolean;
  hasFutureTimestamp: boolean;
};

const finite = (value: number | null | undefined): value is number =>
  typeof value === "number" && Number.isFinite(value);

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const round = (value: number, digits = 4) =>
  Number(value.toFixed(digits));

const uniqueSorted = (values: string[]) =>
  Array.from(new Set(values)).sort((first, second) =>
    first.localeCompare(second),
  );

function timestampMs(value: string | null | undefined) {
  if (!value) return null;
  const parsed = Date.parse(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function canonicalTimestamp(value: string) {
  const parsed = timestampMs(value);
  if (parsed === null) {
    throw new Error("market_context_intelligence_v1_invalid_decision_timestamp");
  }
  return new Date(parsed).toISOString();
}

function assertFiniteNumericValue(
  value: unknown,
  path: string,
  nullable = false,
) {
  if (value === null && nullable) return;
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new Error(
      `market_context_intelligence_v1_non_finite_numeric_input:${path}`,
    );
  }
}

function validateProviderNumbers(
  provider: MarketContextProviderMetadata,
  path: string,
) {
  assertFiniteNumericValue(provider.expected_points, `${path}.expected_points`);
  assertFiniteNumericValue(provider.observed_points, `${path}.observed_points`);
  assertFiniteNumericValue(provider.missing_points, `${path}.missing_points`);
  assertFiniteNumericValue(provider.coverage, `${path}.coverage`);
}

function validateMetricPointNumbers(
  point: MarketContextMetricPoint,
  path: string,
) {
  assertFiniteNumericValue(point.close, `${path}.close`, true);
  assertFiniteNumericValue(point.return_pct, `${path}.return_pct`, true);
  assertFiniteNumericValue(
    point.moving_average_short,
    `${path}.moving_average_short`,
    true,
  );
  assertFiniteNumericValue(
    point.moving_average_long,
    `${path}.moving_average_long`,
    true,
  );
  assertFiniteNumericValue(point.momentum_pct, `${path}.momentum_pct`, true);
  assertFiniteNumericValue(
    point.trend_slope_pct,
    `${path}.trend_slope_pct`,
    true,
  );
  assertFiniteNumericValue(
    point.realized_volatility_pct,
    `${path}.realized_volatility_pct`,
    true,
  );
  assertFiniteNumericValue(point.range_pct, `${path}.range_pct`, true);
}

function validateSectorPointNumbers(
  point: SectorHorizonInput,
  path: string,
) {
  assertFiniteNumericValue(point.return_pct, `${path}.return_pct`, true);
  assertFiniteNumericValue(
    point.spy_return_pct,
    `${path}.spy_return_pct`,
    true,
  );
  assertFiniteNumericValue(
    point.relative_return_vs_spy_pct,
    `${path}.relative_return_vs_spy_pct`,
    true,
  );
  assertFiniteNumericValue(
    point.trend_slope_pct,
    `${path}.trend_slope_pct`,
    true,
  );
  assertFiniteNumericValue(
    point.realized_volatility_pct,
    `${path}.realized_volatility_pct`,
    true,
  );
}

function validateFiniteNumericInput(input: MarketContextIntelligenceV1Input) {
  const benchmarks = [...input.benchmarks].sort((first, second) =>
    first.symbol.localeCompare(second.symbol),
  );
  for (const benchmark of benchmarks) {
    benchmark.intraday.forEach((point, index) =>
      validateMetricPointNumbers(
        point,
        `benchmarks.${benchmark.symbol}.intraday.${index}`,
      ),
    );
    benchmark.multi_day.forEach((point, index) =>
      validateMetricPointNumbers(
        point,
        `benchmarks.${benchmark.symbol}.multi_day.${index}`,
      ),
    );
    validateProviderNumbers(
      benchmark.provider,
      `benchmarks.${benchmark.symbol}.provider`,
    );
  }

  if (input.breadth) {
    assertFiniteNumericValue(
      input.breadth.advancing_fraction,
      "breadth.advancing_fraction",
      true,
    );
    assertFiniteNumericValue(
      input.breadth.above_short_average_fraction,
      "breadth.above_short_average_fraction",
      true,
    );
    assertFiniteNumericValue(
      input.breadth.expected_constituents,
      "breadth.expected_constituents",
    );
    assertFiniteNumericValue(
      input.breadth.observed_constituents,
      "breadth.observed_constituents",
    );
    assertFiniteNumericValue(input.breadth.coverage, "breadth.coverage");
    validateProviderNumbers(input.breadth.provider, "breadth.provider");
  }

  const sectors = [...(input.sectors ?? [])].sort((first, second) => {
    const firstId = first.industry_id ?? first.sector_id;
    const secondId = second.industry_id ?? second.sector_id;
    return firstId.localeCompare(secondId);
  });
  for (const sector of sectors) {
    const contextId = sector.industry_id ?? sector.sector_id;
    sector.short_horizon.forEach((point, index) =>
      validateSectorPointNumbers(
        point,
        `sectors.${contextId}.short_horizon.${index}`,
      ),
    );
    sector.medium_horizon.forEach((point, index) =>
      validateSectorPointNumbers(
        point,
        `sectors.${contextId}.medium_horizon.${index}`,
      ),
    );
    validateProviderNumbers(
      sector.provider,
      `sectors.${contextId}.provider`,
    );
  }
}

function sanitizeLatestPoint(
  points: MarketContextMetricPoint[],
  decisionMs: number,
  leakage: LeakageCounters,
) {
  const eligible: SanitizedPoint[] = [];

  for (const point of points) {
    const parsed = timestampMs(point.timestamp);
    if (parsed === null) {
      leakage.invalidTimestamps += 1;
      continue;
    }
    if (parsed > decisionMs) {
      leakage.futurePoints += 1;
      continue;
    }
    eligible.push({
      ...point,
      timestamp: new Date(parsed).toISOString(),
      timestamp_ms: parsed,
    });
  }

  eligible.sort((first, second) => {
    if (second.timestamp_ms !== first.timestamp_ms) {
      return second.timestamp_ms - first.timestamp_ms;
    }
    return stablePointKey(first).localeCompare(stablePointKey(second));
  });

  return eligible[0] ?? null;
}

function stablePointKey(point: MarketContextMetricPoint) {
  return [
    point.timestamp,
    point.close,
    point.return_pct,
    point.moving_average_short,
    point.moving_average_long,
    point.momentum_pct,
    point.trend_slope_pct,
    point.realized_volatility_pct,
    point.range_pct,
  ].join("|");
}

function pointTrend(point: SanitizedPoint | null): MarketContextTrendState {
  if (
    !point ||
    !finite(point.close) ||
    !finite(point.return_pct) ||
    !finite(point.moving_average_short) ||
    !finite(point.moving_average_long) ||
    !finite(point.momentum_pct) ||
    !finite(point.trend_slope_pct)
  ) {
    return "insufficient_data";
  }

  const thresholds = MARKET_CONTEXT_LAB_THRESHOLDS.trend;
  const bullishStack =
    point.close > point.moving_average_short &&
    point.moving_average_short > point.moving_average_long;
  const bearishStack =
    point.close < point.moving_average_short &&
    point.moving_average_short < point.moving_average_long;

  if (
    bullishStack &&
    point.return_pct >= thresholds.strong_return_pct &&
    point.momentum_pct >= thresholds.strong_momentum_pct &&
    point.trend_slope_pct >= thresholds.directional_slope_pct
  ) {
    return "strong_up";
  }

  if (
    bearishStack &&
    point.return_pct <= -thresholds.strong_return_pct &&
    point.momentum_pct <= -thresholds.strong_momentum_pct &&
    point.trend_slope_pct <= -thresholds.directional_slope_pct
  ) {
    return "strong_down";
  }

  if (
    point.close > point.moving_average_short &&
    point.return_pct >= thresholds.directional_return_pct &&
    point.momentum_pct >= thresholds.directional_momentum_pct &&
    point.trend_slope_pct >= 0
  ) {
    return "up";
  }

  if (
    point.close < point.moving_average_short &&
    point.return_pct <= -thresholds.directional_return_pct &&
    point.momentum_pct <= -thresholds.directional_momentum_pct &&
    point.trend_slope_pct <= 0
  ) {
    return "down";
  }

  return "flat";
}

function trendDirection(state: MarketContextTrendState) {
  if (state === "strong_up" || state === "up") return 1;
  if (state === "strong_down" || state === "down") return -1;
  if (state === "flat") return 0;
  return null;
}

function agreementState(
  spy: BenchmarkAnalysis | null,
  qqq: BenchmarkAnalysis | null,
): MarketContextAgreementState {
  if (!spy || !qqq) return "insufficient_data";
  const spyDirection = trendDirection(spy.multiDayTrend);
  const qqqDirection = trendDirection(qqq.multiDayTrend);
  if (spyDirection === null || qqqDirection === null) return "insufficient_data";
  if (spyDirection > 0 && qqqDirection > 0) return "agreement_bullish";
  if (spyDirection < 0 && qqqDirection < 0) return "agreement_bearish";
  if (spyDirection === 0 && qqqDirection === 0) return "agreement_neutral";
  if (spyDirection * qqqDirection < 0) return "disagreement";
  return "disagreement";
}

function combinedTrend(
  analyses: BenchmarkAnalysis[],
  horizon: "intraday" | "multiDay",
): MarketContextTrendState {
  const states = analyses.map((analysis) =>
    horizon === "intraday" ? analysis.intradayTrend : analysis.multiDayTrend,
  );
  if (states.length < 2 || states.includes("insufficient_data")) {
    return "insufficient_data";
  }
  const directions = states.map(trendDirection);
  if (directions.some((direction) => direction === null)) {
    return "insufficient_data";
  }
  if ((directions[0] ?? 0) * (directions[1] ?? 0) < 0) return "conflicting";
  if (states.every((state) => state === "strong_up")) return "strong_up";
  if (states.every((state) => state === "strong_down")) return "strong_down";
  if (directions.every((direction) => (direction ?? 0) > 0)) return "up";
  if (directions.every((direction) => (direction ?? 0) < 0)) return "down";
  if (directions.every((direction) => direction === 0)) return "flat";
  return "conflicting";
}

function volatilityState(
  analyses: BenchmarkAnalysis[],
): MarketContextVolatilityState {
  const values = analyses.flatMap((analysis) => {
    const value = analysis.multiDay?.realized_volatility_pct;
    return finite(value) ? [value] : [];
  });
  if (values.length < 2) return "insufficient_data";
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  const thresholds = MARKET_CONTEXT_LAB_THRESHOLDS.volatility_pct;
  if (average < thresholds.low_upper_bound) return "low";
  if (average < thresholds.normal_upper_bound) return "normal";
  if (average < thresholds.elevated_upper_bound) return "elevated";
  return "high";
}

function horizonContext(
  trend: MarketContextTrendState,
  volatility: MarketContextVolatilityState,
): MarketContextHorizonState {
  if (trend === "insufficient_data" || volatility === "insufficient_data") {
    return "insufficient_data";
  }
  if (trend === "conflicting") return "conflicting";
  if (volatility === "high" && trend === "flat") return "choppy";
  const direction = trendDirection(trend);
  if (direction === 1) return "bullish";
  if (direction === -1) return "bearish";
  return volatility === "high" || volatility === "elevated"
    ? "choppy"
    : "neutral";
}

function breadthState(
  breadth: MarketBreadthInput | null | undefined,
  decisionMs: number,
  reasonCodes: string[],
  leakage: LeakageCounters,
) {
  if (!breadth) {
    reasonCodes.push("breadth_unavailable");
    return {
      state: "unavailable" as const,
      coverage: null,
      provider: null,
    };
  }

  const breadthTimestamp = timestampMs(breadth.timestamp);
  if (breadthTimestamp === null) {
    leakage.invalidTimestamps += 1;
    reasonCodes.push("breadth_invalid_timestamp");
    return {
      state: "insufficient_data" as const,
      coverage: clamp01(breadth.coverage),
      provider: breadth.provider,
    };
  }
  if (breadthTimestamp > decisionMs) {
    leakage.futurePoints += 1;
    reasonCodes.push("breadth_future_point_excluded");
    return {
      state: "insufficient_data" as const,
      coverage: clamp01(breadth.coverage),
      provider: breadth.provider,
    };
  }
  if (
    breadth.coverage < MARKET_CONTEXT_LAB_THRESHOLDS.minimum_coverage.breadth ||
    breadth.observed_constituents <= 0 ||
    breadth.observed_constituents + breadth.provider.missing_points <
      breadth.expected_constituents
  ) {
    reasonCodes.push("breadth_coverage_insufficient");
    return {
      state: "insufficient_data" as const,
      coverage: clamp01(breadth.coverage),
      provider: breadth.provider,
    };
  }
  if (
    !finite(breadth.advancing_fraction) ||
    !finite(breadth.above_short_average_fraction)
  ) {
    reasonCodes.push("breadth_metrics_missing");
    return {
      state: "insufficient_data" as const,
      coverage: clamp01(breadth.coverage),
      provider: breadth.provider,
    };
  }

  const thresholds = MARKET_CONTEXT_LAB_THRESHOLDS.breadth;
  if (
    breadth.advancing_fraction >= thresholds.broad_lower_bound &&
    breadth.above_short_average_fraction >= thresholds.broad_lower_bound
  ) {
    return {
      state: "broad" as const,
      coverage: clamp01(breadth.coverage),
      provider: breadth.provider,
    };
  }
  if (
    breadth.advancing_fraction <= thresholds.weak_upper_bound &&
    breadth.above_short_average_fraction <= thresholds.weak_upper_bound
  ) {
    return {
      state: "weak" as const,
      coverage: clamp01(breadth.coverage),
      provider: breadth.provider,
    };
  }
  return {
    state: "narrow" as const,
    coverage: clamp01(breadth.coverage),
    provider: breadth.provider,
  };
}

function providerAnalysis(
  sourceId: string,
  metadata: MarketContextProviderMetadata,
  decisionMs: number,
  freshnessLimitMinutes: number,
  leakage: LeakageCounters,
): ProviderAnalysis {
  const parsed = timestampMs(metadata.source_timestamp);
  const coverage = clamp01(
    finite(metadata.coverage) ? metadata.coverage : 0,
  );
  const received = timestampMs(metadata.received_timestamp);
  const receivedTimestamp =
    received === null ? null : new Date(received).toISOString();
  const isGap =
    parsed === null ||
    metadata.observed_points <= 0 ||
    metadata.missing_points > 0 ||
    coverage < MARKET_CONTEXT_LAB_THRESHOLDS.minimum_coverage.essential_index;

  if (parsed === null) {
    return {
      output: {
        source_id: sourceId,
        provider: metadata.provider,
        source_timestamp: null,
        received_timestamp: receivedTimestamp,
        freshness_minutes: null,
        freshness_state: "missing",
        coverage,
        missing_points: Math.max(0, metadata.missing_points),
      },
      isGap: true,
      isStale: false,
      hasFutureTimestamp: false,
    };
  }

  if (parsed > decisionMs) {
    leakage.futureProviderTimestamps += 1;
    return {
      output: {
        source_id: sourceId,
        provider: metadata.provider,
        source_timestamp: null,
        received_timestamp: receivedTimestamp,
        freshness_minutes: null,
        freshness_state: "future_excluded",
        coverage,
        missing_points: Math.max(0, metadata.missing_points),
      },
      isGap: true,
      isStale: false,
      hasFutureTimestamp: true,
    };
  }

  const freshnessMinutes = round((decisionMs - parsed) / 60_000, 2);
  const isStale = freshnessMinutes > freshnessLimitMinutes;

  return {
    output: {
      source_id: sourceId,
      provider: metadata.provider,
      source_timestamp: new Date(parsed).toISOString(),
      received_timestamp: receivedTimestamp,
      freshness_minutes: freshnessMinutes,
      freshness_state: isStale ? "stale" : "fresh",
      coverage,
      missing_points: Math.max(0, metadata.missing_points),
    },
    isGap,
    isStale,
    hasFutureTimestamp: false,
  };
}

function riskState(
  trend: MarketContextTrendState,
  volatility: MarketContextVolatilityState,
  agreement: MarketContextAgreementState,
): MarketContextRiskState {
  if (
    trend === "insufficient_data" ||
    volatility === "insufficient_data" ||
    agreement === "insufficient_data"
  ) {
    return "insufficient_data";
  }
  if (agreement === "disagreement" || trend === "conflicting") {
    return "conflicting";
  }
  const direction = trendDirection(trend);
  if (direction === 1) {
    return volatility === "high" ? "neutral" : "risk_on";
  }
  if (direction === -1) {
    return volatility === "high" ? "stressed" : "risk_off";
  }
  return volatility === "high" ? "stressed" : "neutral";
}

function dataQualityState(input: {
  analyses: BenchmarkAnalysis[];
  providers: ProviderAnalysis[];
  leakage: LeakageCounters;
}) {
  const hasBothBenchmarks =
    input.analyses.some((analysis) => analysis.symbol === "SPY") &&
    input.analyses.some((analysis) => analysis.symbol === "QQQ");
  const essentialPointsPresent =
    hasBothBenchmarks &&
    input.analyses.every(
      (analysis) => analysis.intraday !== null && analysis.multiDay !== null,
    );
  if (!essentialPointsPresent) return "insufficient_data" as const;
  if (input.providers.some((provider) => provider.isGap)) {
    return "provider_gap" as const;
  }
  if (input.providers.some((provider) => provider.isStale)) {
    return "stale" as const;
  }
  if (
    input.leakage.futurePoints > 0 ||
    input.leakage.futureProviderTimestamps > 0 ||
    input.leakage.invalidTimestamps > 0
  ) {
    return "degraded" as const;
  }
  return "good" as const;
}

function terminalRegime(input: {
  quality: MarketContextDataQualityState;
  agreement: MarketContextAgreementState;
  intraday: MarketContextHorizonState;
  multiDay: MarketContextHorizonState;
  risk: MarketContextRiskState;
  volatility: MarketContextVolatilityState;
  breadth: MarketContextBreadthState;
  trend: MarketContextTrendState;
}): MarketContextRegimeClassification {
  if (
    input.quality === "insufficient_data" ||
    input.quality === "provider_gap" ||
    input.quality === "stale"
  ) {
    return "insufficient_data";
  }
  if (
    input.agreement === "disagreement" ||
    input.risk === "conflicting" ||
    input.trend === "conflicting" ||
    input.intraday === "conflicting" ||
    (input.intraday === "bullish" && input.multiDay === "bearish") ||
    (input.intraday === "bearish" && input.multiDay === "bullish")
  ) {
    return "conflicting_context";
  }
  if (
    input.volatility === "high" &&
    (input.trend === "flat" || input.intraday === "choppy")
  ) {
    return "choppy_high_volatility";
  }
  if (input.risk === "stressed") return "risk_off_stressed";
  if (input.risk === "risk_off") return "risk_off_orderly";
  if (input.risk === "risk_on") {
    if (
      input.breadth === "broad" &&
      (input.volatility === "low" || input.volatility === "normal") &&
      (input.trend === "strong_up" || input.trend === "up")
    ) {
      return "risk_on_trending";
    }
    return "risk_on_fragile";
  }
  return "neutral_balanced";
}

function evidenceFor(input: {
  regime: MarketContextRegimeClassification;
  quality: MarketContextDataQualityState;
  breadth: MarketContextBreadthState;
  leakage: LeakageCounters;
}) {
  let strength: MarketContextEvidenceStrength;
  if (
    input.regime === "insufficient_data" ||
    input.quality === "insufficient_data" ||
    input.quality === "provider_gap" ||
    input.quality === "stale"
  ) {
    strength = "insufficient";
  } else if (
    input.quality === "degraded" ||
    input.breadth === "unavailable" ||
    input.breadth === "insufficient_data" ||
    input.leakage.futurePoints > 0 ||
    input.leakage.futureProviderTimestamps > 0
  ) {
    strength = "weak";
  } else if (input.regime === "conflicting_context") {
    strength = "moderate";
  } else {
    strength = "strong";
  }

  const label: MarketContextConfidenceLabel =
    strength === "strong"
      ? "strongly_supported"
      : strength === "moderate"
        ? "supported"
        : strength === "weak"
          ? "limited_evidence"
          : "insufficient_evidence";

  return { strength, label };
}

function reasonCodesFor(input: {
  regime: MarketContextRegimeClassification;
  trend: MarketContextTrendState;
  risk: MarketContextRiskState;
  volatility: MarketContextVolatilityState;
  breadth: MarketContextBreadthState;
  agreement: MarketContextAgreementState;
  quality: MarketContextDataQualityState;
  leakage: LeakageCounters;
  existing: string[];
}) {
  const codes = [
    ...input.existing,
    `regime_${input.regime}`,
    `trend_${input.trend}`,
    `risk_${input.risk}`,
    `volatility_${input.volatility}`,
    `breadth_${input.breadth}`,
    `spy_qqq_${input.agreement}`,
    `data_quality_${input.quality}`,
  ];
  if (input.leakage.futurePoints > 0) {
    codes.push("future_points_excluded");
  }
  if (input.leakage.futureProviderTimestamps > 0) {
    codes.push("future_provider_timestamps_excluded");
  }
  if (input.leakage.invalidTimestamps > 0) {
    codes.push("invalid_timestamps_excluded");
  }
  return uniqueSorted(codes);
}

function sanitizeSectorPoint(
  points: SectorHorizonInput[],
  decisionMs: number,
  leakage: LeakageCounters,
) {
  const eligible = points.flatMap((point) => {
    const parsed = timestampMs(point.timestamp);
    if (parsed === null) {
      leakage.invalidTimestamps += 1;
      return [];
    }
    if (parsed > decisionMs) {
      leakage.futurePoints += 1;
      return [];
    }
    return [{ ...point, timestamp: new Date(parsed).toISOString(), timestamp_ms: parsed }];
  });
  eligible.sort((first, second) => {
    if (second.timestamp_ms !== first.timestamp_ms) {
      return second.timestamp_ms - first.timestamp_ms;
    }
    return sectorPointKey(first).localeCompare(sectorPointKey(second));
  });
  return eligible[0] ?? null;
}

function sectorPointKey(point: SectorHorizonInput) {
  return [
    point.timestamp,
    point.return_pct,
    point.spy_return_pct,
    point.relative_return_vs_spy_pct,
    point.trend_slope_pct,
    point.realized_volatility_pct,
  ].join("|");
}

function sectorRelativeReturn(point: SectorHorizonInput | null) {
  if (!point) return null;
  if (finite(point.relative_return_vs_spy_pct)) {
    return point.relative_return_vs_spy_pct;
  }
  if (finite(point.return_pct) && finite(point.spy_return_pct)) {
    return round(point.return_pct - point.spy_return_pct);
  }
  return null;
}

function relativeState(
  value: number | null,
  threshold: number,
): MarketSectorContextOutput["short_relative_strength"] {
  if (!finite(value)) return "insufficient_data";
  if (value >= threshold) return "strong";
  if (value <= -threshold) return "weak";
  return "neutral";
}

function sectorContext(
  sector: MarketSectorBenchmarkInput,
  decisionMs: number,
  leakage: LeakageCounters,
) {
  const contextLevel = sector.context_level ?? "sector";
  const contextId =
    contextLevel === "industry"
      ? sector.industry_id?.trim() || `${sector.sector_id}:${sector.benchmark_symbol}`
      : sector.sector_id;
  const short = sanitizeSectorPoint(
    sector.short_horizon,
    decisionMs,
    leakage,
  );
  const medium = sanitizeSectorPoint(
    sector.medium_horizon,
    decisionMs,
    leakage,
  );
  const shortRelative = sectorRelativeReturn(short);
  const mediumRelative = sectorRelativeReturn(medium);
  const thresholds =
    MARKET_CONTEXT_LAB_THRESHOLDS.sector_relative_return_pct;
  const shortState = relativeState(
    shortRelative,
    thresholds.short_directional,
  );
  const mediumState = relativeState(
    mediumRelative,
    thresholds.medium_directional,
  );
  const shortSlope = short?.trend_slope_pct;
  const mediumSlope = medium?.trend_slope_pct;
  let trendAgreement: SectorTrendAgreement = "insufficient_data";
  if (finite(shortSlope) && finite(mediumSlope)) {
    if (shortSlope > 0 && mediumSlope > 0) {
      trendAgreement = "bullish_agreement";
    } else if (shortSlope < 0 && mediumSlope < 0) {
      trendAgreement = "bearish_agreement";
    } else {
      trendAgreement = "mixed";
    }
  }

  let acceleration: SectorAccelerationState = "insufficient_data";
  if (finite(shortRelative) && finite(mediumRelative)) {
    const delta = shortRelative - mediumRelative;
    if (delta >= thresholds.acceleration_delta) {
      acceleration = "accelerating";
    } else if (delta <= -thresholds.acceleration_delta) {
      acceleration = "decelerating";
    } else {
      acceleration = "steady";
    }
  }

  const provider = providerAnalysis(
    `${contextLevel}:${contextId}`,
    sector.provider,
    decisionMs,
    MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.sector_medium,
    leakage,
  );
  const freshnessState: MarketSectorContextOutput["freshness_state"] =
    provider.output.freshness_state === "fresh"
      ? "fresh"
      : provider.output.freshness_state === "stale"
        ? "stale"
        : "missing";
  const reasonCodes: string[] = [];
  if (!short || !medium) reasonCodes.push("sector_horizon_missing");
  if (provider.isGap) reasonCodes.push("sector_provider_gap");
  if (provider.isStale) reasonCodes.push("sector_data_stale");
  if (
    sector.provider.coverage <
    MARKET_CONTEXT_LAB_THRESHOLDS.minimum_coverage.sector
  ) {
    reasonCodes.push("sector_coverage_insufficient");
  }

  let classification: SectorStrengthClassification;
  if (
    shortState === "insufficient_data" ||
    mediumState === "insufficient_data" ||
    freshnessState !== "fresh" ||
    provider.isGap
  ) {
    classification = "insufficient_data";
  } else if (shortState === "strong" && mediumState === "strong") {
    classification = "strong";
  } else if (shortState === "weak" && mediumState === "weak") {
    classification = "weak";
  } else if (
    acceleration === "accelerating" &&
    (shortState === "strong" || mediumState === "neutral")
  ) {
    classification = "improving";
  } else if (
    acceleration === "decelerating" &&
    (shortState === "weak" || mediumState === "neutral")
  ) {
    classification = "deteriorating";
  } else if (
    (shortState === "strong" && mediumState === "weak") ||
    (shortState === "weak" && mediumState === "strong") ||
    trendAgreement === "mixed"
  ) {
    classification = "conflicting";
  } else {
    classification = "neutral";
  }

  reasonCodes.push(`sector_classification_${classification}`);
  reasonCodes.push(`sector_trend_${trendAgreement}`);
  reasonCodes.push(`sector_acceleration_${acceleration}`);

  return {
    output: {
      context_level: contextLevel,
      sector_id: sector.sector_id,
      industry_id:
        contextLevel === "industry"
          ? sector.industry_id?.trim() || null
          : null,
      benchmark_symbol: sector.benchmark_symbol,
      classification,
      short_relative_strength: shortState,
      medium_relative_strength: mediumState,
      short_relative_return_vs_spy_pct: finite(shortRelative)
        ? round(shortRelative)
        : null,
      medium_relative_return_vs_spy_pct: finite(mediumRelative)
        ? round(mediumRelative)
        : null,
      trend_agreement: trendAgreement,
      acceleration,
      freshness_state: freshnessState,
      coverage: round(clamp01(sector.provider.coverage)),
      missingness: round(1 - clamp01(sector.provider.coverage)),
      rank_status: "not_rankable" as const,
      rank: null,
      comparable_sector_count: 0,
      reason_codes: uniqueSorted(reasonCodes),
    },
    provider,
    rankable:
      contextLevel === "sector" &&
      classification !== "insufficient_data" &&
      freshnessState === "fresh" &&
      sector.provider.coverage >=
        MARKET_CONTEXT_LAB_THRESHOLDS.minimum_coverage.sector,
  };
}

function rankSectors(
  sectorResults: ReturnType<typeof sectorContext>[],
  expectedSectorIds: string[],
): MarketSectorContextOutput[] {
  const sectorOnlyResults = sectorResults.filter(
    (result) => result.output.context_level === "sector",
  );
  const industryResults = sectorResults.map((result) => result.output).filter(
    (result) => result.context_level === "industry",
  );
  const expected = uniqueSorted(
    expectedSectorIds.map((value) => value.trim()).filter(Boolean),
  );
  const resultIds = uniqueSorted(
    sectorOnlyResults.map((result) => result.output.sector_id),
  );
  const universeComplete =
    expected.length > 0 &&
    expected.length === resultIds.length &&
    expected.every((sectorId, index) => sectorId === resultIds[index]) &&
    sectorOnlyResults.every((result) => result.rankable);

  if (!universeComplete) {
    return [
      ...sectorResults
      .map((result) => ({
        ...result.output,
        reason_codes: uniqueSorted([
          ...result.output.reason_codes,
          result.output.context_level === "sector"
            ? "sector_universe_not_rankable"
            : "industry_context_not_sector_rankable",
        ]),
      })),
    ].sort(compareRelativeContexts);
  }

  const ranked = [...sectorOnlyResults].sort((first, second) => {
    const firstValue =
      first.output.medium_relative_return_vs_spy_pct ??
      Number.NEGATIVE_INFINITY;
    const secondValue =
      second.output.medium_relative_return_vs_spy_pct ??
      Number.NEGATIVE_INFINITY;
    if (secondValue !== firstValue) return secondValue - firstValue;
    return first.output.sector_id.localeCompare(second.output.sector_id);
  });
  const rankBySector = new Map(
    ranked.map((result, index) => [result.output.sector_id, index + 1]),
  );

  const rankedSectors = sectorOnlyResults
    .map((result) => ({
      ...result.output,
      rank_status: "ranked" as const,
      rank: rankBySector.get(result.output.sector_id) ?? null,
      comparable_sector_count: sectorOnlyResults.length,
      reason_codes: uniqueSorted([
        ...result.output.reason_codes,
        "sector_rank_complete_comparable_universe",
      ]),
    }));
  const unrankedIndustries = industryResults.map((result) => ({
    ...result,
    reason_codes: uniqueSorted([
      ...result.reason_codes,
      "industry_context_not_sector_rankable",
    ]),
  }));
  return [...rankedSectors, ...unrankedIndustries].sort(
    compareRelativeContexts,
  );
}

function compareRelativeContexts(
  first: MarketSectorContextOutput,
  second: MarketSectorContextOutput,
) {
  const byLevel = first.context_level.localeCompare(second.context_level);
  if (byLevel !== 0) return byLevel;
  const firstId = first.industry_id ?? first.sector_id;
  const secondId = second.industry_id ?? second.sector_id;
  return firstId.localeCompare(secondId);
}

export function buildMarketContextIntelligenceV1(
  input: MarketContextIntelligenceV1Input,
): MarketContextIntelligenceV1Output {
  validateFiniteNumericInput(input);
  const decisionTimestamp = canonicalTimestamp(input.decision_timestamp);
  const decisionMs = Date.parse(decisionTimestamp);
  const leakage: LeakageCounters = {
    futurePoints: 0,
    futureProviderTimestamps: 0,
    invalidTimestamps: 0,
  };
  const reasonCodes: string[] = [];
  const benchmarkBySymbol = new Map<"SPY" | "QQQ", BenchmarkAnalysis>();
  const benchmarkProviders: ProviderAnalysis[] = [];

  const sortedBenchmarks = [...input.benchmarks].sort((first, second) =>
    first.symbol.localeCompare(second.symbol),
  );
  for (const benchmark of sortedBenchmarks) {
    const intraday = sanitizeLatestPoint(
      benchmark.intraday,
      decisionMs,
      leakage,
    );
    const multiDay = sanitizeLatestPoint(
      benchmark.multi_day,
      decisionMs,
      leakage,
    );
    const analysis: BenchmarkAnalysis = {
      symbol: benchmark.symbol,
      intraday,
      multiDay,
      intradayTrend: pointTrend(intraday),
      multiDayTrend: pointTrend(multiDay),
      provider: benchmark.provider,
    };

    if (benchmarkBySymbol.has(benchmark.symbol)) {
      reasonCodes.push(`duplicate_${benchmark.symbol.toLowerCase()}_input`);
      continue;
    }
    benchmarkBySymbol.set(benchmark.symbol, analysis);
    benchmarkProviders.push(
      providerAnalysis(
        `index:${benchmark.symbol}`,
        benchmark.provider,
        decisionMs,
        MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.multi_day,
        leakage,
      ),
    );
  }

  const analyses = (["QQQ", "SPY"] as const).flatMap((symbol) => {
    const analysis = benchmarkBySymbol.get(symbol);
    return analysis ? [analysis] : [];
  });
  if (!benchmarkBySymbol.has("SPY")) reasonCodes.push("spy_input_missing");
  if (!benchmarkBySymbol.has("QQQ")) reasonCodes.push("qqq_input_missing");

  const breadth = breadthState(
    input.breadth,
    decisionMs,
    reasonCodes,
    leakage,
  );
  const breadthProvider = breadth.provider
    ? providerAnalysis(
        "breadth:market",
        breadth.provider,
        decisionMs,
        MARKET_CONTEXT_LAB_THRESHOLDS.freshness_minutes.breadth,
        leakage,
      )
    : null;

  const sectorInputs = [...(input.sectors ?? [])].sort((first, second) => {
    const byLevel = (first.context_level ?? "sector").localeCompare(
      second.context_level ?? "sector",
    );
    if (byLevel !== 0) return byLevel;
    const firstId = first.industry_id ?? first.sector_id;
    const secondId = second.industry_id ?? second.sector_id;
    const bySector = firstId.localeCompare(secondId);
    return bySector !== 0
      ? bySector
      : first.benchmark_symbol.localeCompare(second.benchmark_symbol);
  });
  const sectorResults = sectorInputs.map((sector) =>
    sectorContext(sector, decisionMs, leakage),
  );
  const sectors = rankSectors(
    sectorResults,
    input.sector_universe?.expected_sector_ids ?? [],
  );

  const agreement = agreementState(
    benchmarkBySymbol.get("SPY") ?? null,
    benchmarkBySymbol.get("QQQ") ?? null,
  );
  const intradayTrend = combinedTrend(analyses, "intraday");
  const multiDayTrend = combinedTrend(analyses, "multiDay");
  const volatility = volatilityState(analyses);
  const intradayContext = horizonContext(intradayTrend, volatility);
  const multiDayContext = horizonContext(multiDayTrend, volatility);
  const risk = riskState(multiDayTrend, volatility, agreement);
  const quality = dataQualityState({
    analyses,
    providers: benchmarkProviders,
    leakage,
  });
  const regime = terminalRegime({
    quality,
    agreement,
    intraday: intradayContext,
    multiDay: multiDayContext,
    risk,
    volatility,
    breadth: breadth.state,
    trend: multiDayTrend,
  });
  const evidence = evidenceFor({
    regime,
    quality,
    breadth: breadth.state,
    leakage,
  });
  const providers = [
    ...benchmarkProviders,
    ...(breadthProvider ? [breadthProvider] : []),
    ...sectorResults.map((result) => result.provider),
  ].sort((first, second) =>
    first.output.source_id.localeCompare(second.output.source_id),
  );
  const staleSourceIds = providers
    .filter((provider) => provider.isStale)
    .map((provider) => provider.output.source_id)
    .sort((first, second) => first.localeCompare(second));
  const freshnessValues = providers.flatMap((provider) =>
    finite(provider.output.freshness_minutes)
      ? [provider.output.freshness_minutes]
      : [],
  );
  const essentialCoverage =
    analyses.length === 0
      ? 0
      : analyses.reduce(
          (sum, analysis) => sum + clamp01(analysis.provider.coverage),
          0,
        ) / 2;
  const sectorCoverage =
    sectorResults.length === 0
      ? null
      : sectorResults.reduce(
          (sum, result) => sum + result.output.coverage,
          0,
        ) / sectorResults.length;
  const allCoverage = [
    ...analyses.map((analysis) => clamp01(analysis.provider.coverage)),
    ...(breadth.coverage === null ? [] : [breadth.coverage]),
    ...sectorResults.map((result) => result.output.coverage),
  ];
  const missingness =
    allCoverage.length === 0
      ? 1
      : 1 -
        allCoverage.reduce((sum, coverage) => sum + coverage, 0) /
          allCoverage.length;

  return {
    context_version: MARKET_CONTEXT_INTELLIGENCE_VERSION,
    threshold_version: MARKET_CONTEXT_THRESHOLD_VERSION,
    decision_timestamp: decisionTimestamp,
    regime_classification: regime,
    dimensions: {
      trend_state: multiDayTrend,
      risk_state: risk,
      volatility_state: volatility,
      breadth_state: breadth.state,
      spy_qqq_agreement: agreement,
      intraday_context: intradayContext,
      multi_day_context: multiDayContext,
      data_quality_state: quality,
    },
    sectors,
    confidence: {
      label: evidence.label,
      calibrated_probability: false,
      basis: "deterministic_rule_evidence_not_probability",
    },
    evidence_strength: evidence.strength,
    provider_timestamps: providers.map((provider) => provider.output),
    freshness: {
      state:
        quality === "stale"
          ? "stale"
          : quality === "provider_gap" || quality === "insufficient_data"
            ? "insufficient_data"
            : quality === "degraded"
              ? "degraded"
              : "fresh",
      stalest_minutes:
        freshnessValues.length === 0 ? null : Math.max(...freshnessValues),
      stale_source_ids: staleSourceIds,
    },
    coverage: {
      essential_index_coverage: round(clamp01(essentialCoverage)),
      breadth_coverage:
        breadth.coverage === null ? null : round(breadth.coverage),
      sector_coverage:
        sectorCoverage === null ? null : round(clamp01(sectorCoverage)),
      missingness: round(clamp01(missingness)),
    },
    leakage_control: {
      future_points_excluded: leakage.futurePoints,
      future_provider_timestamps_excluded: leakage.futureProviderTimestamps,
      invalid_timestamps_excluded: leakage.invalidTimestamps,
    },
    reason_codes: reasonCodesFor({
      regime,
      trend: multiDayTrend,
      risk,
      volatility,
      breadth: breadth.state,
      agreement,
      quality,
      leakage,
      existing: reasonCodes,
    }),
    shadow_only: true,
    live_ranking_effect: false,
  };
}
