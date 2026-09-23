import type { ScannerCandidate } from "@/lib/scanner";
import { admissibleRecentIntradayVolumeRatio } from "@/lib/intraday-indicators";

export const RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION =
  "recommendation_decision_feature_vector_v2" as const;
const LEGACY_RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION =
  "recommendation_decision_feature_vector_v1" as const;

const featureNames = [
  "latest_price",
  "daily_volume_ratio",
  "daily_distance_to_20d_high",
  "daily_change_5d_percent",
  "intraday_recent_change_percent",
  "intraday_recent_range_position",
  "intraday_recent_volume_ratio",
  "intraday_average_range_percent",
  "intraday_latest_range_percent",
  "intraday_range_expansion_ratio",
  "intraday_vwap",
  "intraday_price_vs_vwap_percent",
  "intraday_recent_range_percent",
  "intraday_momentum_percent",
  "intraday_latest_volume",
  "intraday_average_volume",
  "planned_risk_reward",
  "scanner_local_score",
] as const;

export type RecommendationDecisionFeatureName = (typeof featureNames)[number];

export type RecommendationDecisionFeatureVector = {
  contract_version:
    | typeof RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
    | typeof LEGACY_RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION;
  feature_values: Record<RecommendationDecisionFeatureName, number | null>;
  explicit_unavailable_feature_names: RecommendationDecisionFeatureName[];
};

function finiteNumberOrNull(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function featureNameOrNull(value: unknown): RecommendationDecisionFeatureName | null {
  return typeof value === "string" &&
    featureNames.includes(value as RecommendationDecisionFeatureName)
    ? (value as RecommendationDecisionFeatureName)
    : null;
}

function sortedFeatureNames(
  names: RecommendationDecisionFeatureName[],
): RecommendationDecisionFeatureName[] {
  return [...names].sort((left, right) => left.localeCompare(right));
}

function sameFeatureNames(
  left: RecommendationDecisionFeatureName[],
  right: RecommendationDecisionFeatureName[],
) {
  return (
    left.length === right.length &&
    left.every((name, index) => name === right[index])
  );
}

/**
 * Captures the bounded set of derived inputs used by the current scanner and
 * plan construction. It deliberately records unavailable inputs as explicit
 * nulls instead of substituting zeros or retaining raw candles.
 */
export function recommendationDecisionFeatureVectorFromScannerCandidate(
  candidate: Pick<
    ScannerCandidate,
    | "latest_close"
    | "intraday_indicators"
    | "volume_ratio"
    | "distance_to_20d_high"
    | "change_5d_percent"
    | "recent_change_percent"
    | "recent_range_position"
    | "average_range_percent"
    | "latest_range_percent"
    | "range_expansion_ratio"
    | "proposed_risk_reward"
    | "intraday_indicator_stale"
  > & {
    local_score?: number;
  },
  observedAtSeconds = Date.now() / 1000,
): RecommendationDecisionFeatureVector {
  const intraday = candidate.intraday_indicators ?? null;
  const featureValues: Record<RecommendationDecisionFeatureName, number | null> = {
    latest_price: finiteNumberOrNull(
      candidate.latest_close ?? intraday?.latestPrice,
    ),
    daily_volume_ratio: finiteNumberOrNull(candidate.volume_ratio),
    daily_distance_to_20d_high: finiteNumberOrNull(
      candidate.distance_to_20d_high,
    ),
    daily_change_5d_percent: finiteNumberOrNull(candidate.change_5d_percent),
    intraday_recent_change_percent: finiteNumberOrNull(
      candidate.recent_change_percent,
    ),
    intraday_recent_range_position: finiteNumberOrNull(
      candidate.recent_range_position,
    ),
    intraday_recent_volume_ratio: finiteNumberOrNull(
      admissibleRecentIntradayVolumeRatio(
        intraday,
        candidate.intraday_indicator_stale,
        observedAtSeconds,
      ),
    ),
    intraday_average_range_percent: finiteNumberOrNull(
      candidate.average_range_percent,
    ),
    intraday_latest_range_percent: finiteNumberOrNull(
      candidate.latest_range_percent,
    ),
    intraday_range_expansion_ratio: finiteNumberOrNull(
      candidate.range_expansion_ratio,
    ),
    intraday_vwap: finiteNumberOrNull(intraday?.vwap),
    intraday_price_vs_vwap_percent: finiteNumberOrNull(
      intraday?.priceVsVwapPercent,
    ),
    intraday_recent_range_percent: finiteNumberOrNull(
      intraday?.recentRangePercent,
    ),
    intraday_momentum_percent: finiteNumberOrNull(intraday?.momentumPercent),
    intraday_latest_volume: finiteNumberOrNull(intraday?.latestVolume),
    intraday_average_volume: finiteNumberOrNull(intraday?.averageVolume),
    planned_risk_reward: finiteNumberOrNull(candidate.proposed_risk_reward),
    scanner_local_score: finiteNumberOrNull(candidate.local_score),
  };

  return {
    contract_version: RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION,
    feature_values: featureValues,
    explicit_unavailable_feature_names: sortedFeatureNames(
      featureNames.filter((name) => featureValues[name] === null),
    ),
  };
}

/**
 * The former feature projection survives as v1 evidence. New decisions use v2
 * because `intraday_recent_volume_ratio` now comes from two complete intraday
 * windows instead of being mislabeled daily-candle arithmetic. Historical v1
 * values remain readable but must not be pooled with v2 as the same feature.
 */
export function recommendationDecisionFeatureVectorFromUnknown(
  value: unknown,
): RecommendationDecisionFeatureVector | null {
  const raw = objectOrNull(value);
  const contractVersion =
    raw?.contract_version === RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
      ? RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
      : raw?.contract_version ===
          LEGACY_RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
        ? LEGACY_RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
        : null;

  if (
    !raw ||
    !contractVersion ||
    Object.keys(raw).length !== 3 ||
    !Object.hasOwn(raw, "feature_values") ||
    !Object.hasOwn(raw, "explicit_unavailable_feature_names")
  ) {
    return null;
  }

  const rawFeatureValues = objectOrNull(raw.feature_values);
  const rawUnavailable = Array.isArray(raw.explicit_unavailable_feature_names)
    ? raw.explicit_unavailable_feature_names
    : null;

  if (
    !rawFeatureValues ||
    !rawUnavailable ||
    Object.keys(rawFeatureValues).length !== featureNames.length ||
    !featureNames.every((name) => Object.hasOwn(rawFeatureValues, name))
  ) {
    return null;
  }

  const featureValues = {} as Record<
    RecommendationDecisionFeatureName,
    number | null
  >;

  for (const name of featureNames) {
    const current = rawFeatureValues[name];

    if (current !== null && finiteNumberOrNull(current) === null) {
      return null;
    }

    featureValues[name] = current === null ? null : finiteNumberOrNull(current);
  }

  const unavailableNames = rawUnavailable.map(featureNameOrNull);

  if (unavailableNames.some((name) => name === null)) {
    return null;
  }

  const normalizedUnavailableNames =
    unavailableNames as RecommendationDecisionFeatureName[];
  const expectedUnavailableNames = sortedFeatureNames(
    featureNames.filter((name) => featureValues[name] === null),
  );

  if (
    new Set(normalizedUnavailableNames).size !== normalizedUnavailableNames.length ||
    !sameFeatureNames(normalizedUnavailableNames, expectedUnavailableNames)
  ) {
    return null;
  }

  return {
    contract_version: contractVersion,
    feature_values: featureValues,
    explicit_unavailable_feature_names: normalizedUnavailableNames,
  };
}
