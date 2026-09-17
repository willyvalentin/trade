import type {
  RecommendationOutcomeCandle,
  RecommendationOutcomeHorizon,
} from "@/lib/recommendation-outcome-tracker";

export const CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION =
  "canonical_outcome_provider_coverage_receipt_v1" as const;

type CandleRequest = {
  interval: "5min" | "15min";
  start_at: string;
  end_at: string;
  horizon: RecommendationOutcomeHorizon;
};

type CandleResult = {
  status: "available" | "missing_candles" | "provider_error" | "skipped";
  provider: string | null;
};

export type CanonicalOutcomeProviderCoverageReceipt = {
  contract_version: typeof CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION;
  provider_status: "available" | "gap" | "error" | "unavailable";
  freshness: "fresh" | "unknown";
  expected_candle_count: number | null;
  observed_candle_count: number;
  malformed_candle_count: number;
  blockers: string[];
  candle_interval: "5min" | "15min";
  horizon: RecommendationOutcomeHorizon;
  request_start_at: string;
  request_end_at: string;
  required_horizon_end_at: string | null;
  horizon_elapsed: boolean;
  response_status: CandleResult["status"];
};

function horizonMs(horizon: RecommendationOutcomeHorizon) {
  if (horizon === "15m") return 15 * 60 * 1000;
  if (horizon === "30m") return 30 * 60 * 1000;
  if (horizon === "60m") return 60 * 60 * 1000;
  return null;
}

function intervalMs(interval: CandleRequest["interval"]) {
  return interval === "15min" ? 15 * 60 * 1000 : 5 * 60 * 1000;
}

function candleTimestamp(value: RecommendationOutcomeCandle["timestamp"]) {
  if (value instanceof Date) return value.getTime();
  if (typeof value === "number" && Number.isFinite(value)) {
    return value < 10_000_000_000 ? value * 1000 : value;
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function hasFiniteOhlc(candle: RecommendationOutcomeCandle) {
  return [candle.open, candle.high, candle.low, candle.close].every(
    (value) => typeof value === "number" && Number.isFinite(value),
  );
}

function providerStatus(result: CandleResult) {
  if (result.status === "available" && result.provider) return "available" as const;
  if (result.status === "missing_candles") return "gap" as const;
  if (result.status === "provider_error") return "error" as const;
  return "unavailable" as const;
}

/**
 * Captures the exact evidence needed to decide whether an outcome's candle
 * window can be used by the canonical evaluator. It intentionally does not
 * infer missing bars from a non-empty response: a complete receipt needs an
 * elapsed, interval-aligned window with every expected candle slot present.
 */
export function buildCanonicalOutcomeProviderCoverageReceipt({
  candles,
  request,
  result,
}: {
  candles: RecommendationOutcomeCandle[];
  request: CandleRequest;
  result: CandleResult;
}): CanonicalOutcomeProviderCoverageReceipt {
  const interval = intervalMs(request.interval);
  const duration = horizonMs(request.horizon);
  const start = Date.parse(request.start_at);
  const requestEnd = Date.parse(request.end_at);
  const blockers = new Set<string>();
  const status = providerStatus(result);
  const validStart = Number.isFinite(start);
  const validRequestEnd = Number.isFinite(requestEnd);
  const requiredEnd =
    validStart && duration !== null ? start + duration : null;
  const alignedStart = validStart && start % interval === 0;
  const expectedCount =
    duration !== null && duration % interval === 0 ? duration / interval : null;
  const horizonElapsed =
    requiredEnd !== null && validRequestEnd && requestEnd >= requiredEnd;

  if (duration === null) blockers.add("unsupported_canonical_outcome_horizon");
  if (!validStart || !validRequestEnd) blockers.add("candle_request_window_invalid");
  if (!alignedStart) blockers.add("recommendation_timestamp_not_candle_interval_aligned");
  if (!horizonElapsed) blockers.add("outcome_horizon_not_fully_elapsed");
  if (status !== "available") blockers.add(`provider_${status}`);

  const expectedSlots = new Set<number>();
  if (requiredEnd !== null && expectedCount !== null && alignedStart) {
    for (let slot = start; slot < requiredEnd; slot += interval) {
      expectedSlots.add(slot);
    }
  }

  const observedSlots = new Set<number>();
  let malformedCandleCount = 0;
  let duplicateCandleCount = 0;

  for (const candle of candles) {
    const timestamp = candleTimestamp(candle.timestamp);
    if (timestamp === null) {
      malformedCandleCount += 1;
      continue;
    }

    if (!expectedSlots.has(timestamp)) continue;
    if (!hasFiniteOhlc(candle)) {
      malformedCandleCount += 1;
      continue;
    }
    if (observedSlots.has(timestamp)) {
      duplicateCandleCount += 1;
      continue;
    }
    observedSlots.add(timestamp);
  }

  if (malformedCandleCount > 0) blockers.add("malformed_candle_observed");
  if (duplicateCandleCount > 0) blockers.add("duplicate_candle_interval_observed");
  if (expectedCount === null || observedSlots.size !== expectedCount) {
    blockers.add("candle_coverage_incomplete");
  }

  const freshness =
    status === "available" &&
    horizonElapsed &&
    alignedStart &&
    expectedCount !== null &&
    observedSlots.size === expectedCount &&
    malformedCandleCount === 0 &&
    duplicateCandleCount === 0
      ? "fresh"
      : "unknown";

  return {
    contract_version: CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION,
    provider_status: status,
    freshness,
    expected_candle_count: expectedCount,
    observed_candle_count: observedSlots.size,
    malformed_candle_count: malformedCandleCount,
    blockers: Array.from(blockers).sort(),
    candle_interval: request.interval,
    horizon: request.horizon,
    request_start_at: request.start_at,
    request_end_at: request.end_at,
    required_horizon_end_at:
      requiredEnd === null ? null : new Date(requiredEnd).toISOString(),
    horizon_elapsed: horizonElapsed,
    response_status: result.status,
  };
}

export function hasVersionedCanonicalOutcomeProviderCoverage(value: unknown) {
  return (
    typeof value === "object" &&
    value !== null &&
    !Array.isArray(value) &&
    (value as Record<string, unknown>).contract_version ===
      CANONICAL_OUTCOME_PROVIDER_COVERAGE_RECEIPT_VERSION
  );
}

export function canonicalOutcomeProviderCoverageQuality(value: unknown) {
  if (!hasVersionedCanonicalOutcomeProviderCoverage(value)) return 0;

  const receipt = value as Record<string, unknown>;
  const complete =
    receipt.provider_status === "available" &&
    receipt.freshness === "fresh" &&
    typeof receipt.expected_candle_count === "number" &&
    Number.isInteger(receipt.expected_candle_count) &&
    receipt.expected_candle_count > 0 &&
    receipt.observed_candle_count === receipt.expected_candle_count &&
    receipt.malformed_candle_count === 0 &&
    Array.isArray(receipt.blockers) &&
    receipt.blockers.length === 0;

  return complete ? 2 : 1;
}
