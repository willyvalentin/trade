import type { ScannerCandidate } from "@/lib/scanner";
import { admissibleRecentIntradayVolumeRatio } from "@/lib/intraday-indicators";

export const RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION =
  "recommendation_decision_feature_vector_v3" as const;
export const LEGACY_INTRADAY_NAMED_DAILY_RANGE_VECTOR_VERSION =
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
const currentFeatureNames = featureNames.map(name => name === "intraday_average_range_percent"
  ? "daily_average_range_percent" as const : name);

export type RecommendationDecisionFeatureName = (typeof featureNames)[number] | "daily_average_range_percent";
type RangeFeatureName = "intraday_average_range_percent" | "daily_average_range_percent";
type FeatureValues = Record<Exclude<RecommendationDecisionFeatureName, RangeFeatureName>, number | null> &
  Partial<Record<RangeFeatureName, number | null>>;

export type RecommendationDecisionFeatureVector = {
  contract_version:
    | typeof RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
    | typeof LEGACY_INTRADAY_NAMED_DAILY_RANGE_VECTOR_VERSION
    | typeof LEGACY_RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION;
  feature_values: FeatureValues;
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
    (value === "daily_average_range_percent" || featureNames.includes(value as (typeof featureNames)[number]))
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
  contractVersion: typeof RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION |
    typeof LEGACY_INTRADAY_NAMED_DAILY_RANGE_VECTOR_VERSION = RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION,
): RecommendationDecisionFeatureVector {
  const intraday = candidate.intraday_indicators ?? null;
  const names = contractVersion === RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION ? currentFeatureNames : featureNames;
  const featureValues: FeatureValues = {
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
    // The scanner's average_range_percent is calculated from DAILY bars.
    // v1/v2's misleading name survives only in explicit historical projection.
    [contractVersion === RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
      ? "daily_average_range_percent" : "intraday_average_range_percent"]: finiteNumberOrNull(
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
    contract_version: contractVersion,
    feature_values: featureValues,
    explicit_unavailable_feature_names: sortedFeatureNames(
      names.filter((name) => featureValues[name] === null),
    ),
  };
}

/**
 * The former feature projection survives as v1 evidence. v2 changed
 * `intraday_recent_volume_ratio` to come from two complete intraday
 * windows instead of being mislabeled daily-candle arithmetic. Historical v1
 * values remain readable but must not be pooled with v2 as the same feature.
 * v3 names the unchanged daily average range honestly. Historical v1/v2
 * retain their exact old keys/values; relabelling the version is not conversion.
 */
export function recommendationDecisionFeatureVectorFromUnknown(
  value: unknown,
): RecommendationDecisionFeatureVector | null {
  const raw = objectOrNull(value);
  const contractVersion =
    raw?.contract_version === RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
      ? RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
      : raw?.contract_version === LEGACY_INTRADAY_NAMED_DAILY_RANGE_VECTOR_VERSION
        ? LEGACY_INTRADAY_NAMED_DAILY_RANGE_VECTOR_VERSION
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
  const names = contractVersion === RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION ? currentFeatureNames : featureNames;
  const rawUnavailable = Array.isArray(raw.explicit_unavailable_feature_names)
    ? raw.explicit_unavailable_feature_names
    : null;

  if (
    !rawFeatureValues ||
    !rawUnavailable ||
    Object.keys(rawFeatureValues).length !== names.length ||
    !names.every((name) => Object.hasOwn(rawFeatureValues, name))
  ) {
    return null;
  }

  const featureValues = {} as FeatureValues;

  for (const name of names) {
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
    names.filter((name) => featureValues[name] === null),
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

/** Supported normalized input bases are explicit and separate. Callers must
 * still require one exact version across a population; this never pools v2/v3. */
export function isCompletedInputDecisionFeatureVectorVersion(value: unknown): value is
  typeof RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION | typeof LEGACY_INTRADAY_NAMED_DAILY_RANGE_VECTOR_VERSION {
  return value === RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION || value === LEGACY_INTRADAY_NAMED_DAILY_RANGE_VECTOR_VERSION;
}

/** Preserve old output shape on old sources. A NEW v3 vector exposes the
 * original daily mean under its truthful period, never as an intraday mean. */
export function recommendationDecisionRangeFeature(vector: RecommendationDecisionFeatureVector) {
  return vector.contract_version === RECOMMENDATION_DECISION_FEATURE_VECTOR_VERSION
    ? { daily_average_range_percent: vector.feature_values.daily_average_range_percent ?? null }
    : { intraday_average_range_percent: vector.feature_values.intraday_average_range_percent ?? null };
}
