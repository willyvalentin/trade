import type { RecommendationEntryTypeSource } from "@/lib/recommendation-entry-type";

export type PlanReferenceMetadataStatus =
  | "complete"
  | "price_missing_timestamp"
  | "price_missing_source"
  | "price_missing_source_and_timestamp"
  | "missing_price";

export type PlanReferenceMetadataTrace = {
  candidate_price_available_before_generation: boolean;
  generated_recommendation_retained_reference_price: boolean | null;
  price_read_path: string | null;
  source_read_path: string | null;
  timestamp_read_path: string | null;
  provider_read_path: string | null;
};

export type PlanReferencePriceMetadata = {
  reference_price_used_for_plan: number | null;
  reference_price_source: string;
  reference_price_timestamp: string | null;
  reference_price_symbol: string | null;
  reference_price_provider: string | null;
  reference_price_read_path: string | null;
  plan_reference_metadata_status: PlanReferenceMetadataStatus;
  plan_reference_metadata_trace: PlanReferenceMetadataTrace;
};

type ReferenceCandidate = {
  value: unknown;
  source: string;
  readPath: string;
};

type TextCandidate = {
  value: unknown;
  readPath: string;
};

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function numberOrNull(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function normalizeTicker(value: unknown) {
  const ticker = textOrNull(value);
  return ticker ? ticker.toUpperCase() : null;
}

function firstNumber(candidates: ReferenceCandidate[]) {
  for (const candidate of candidates) {
    const value = numberOrNull(candidate.value);
    if (value !== null && value > 0) {
      return { ...candidate, value };
    }
  }

  return null;
}

function firstText(candidates: TextCandidate[]) {
  for (const candidate of candidates) {
    const value = textOrNull(candidate.value);
    if (value) {
      return { ...candidate, value };
    }
  }

  return null;
}

function metadataStatus(input: {
  price: number | null;
  source: string;
  timestamp: string | null;
}): PlanReferenceMetadataStatus {
  if (input.price === null) return "missing_price";

  const hasKnownSource = input.source !== "unknown";
  const hasTimestamp = input.timestamp !== null;

  if (hasKnownSource && hasTimestamp) return "complete";
  if (hasKnownSource) return "price_missing_timestamp";
  if (hasTimestamp) return "price_missing_source";
  return "price_missing_source_and_timestamp";
}

export function markPlanReferenceRetained(
  metadata: PlanReferencePriceMetadata,
): PlanReferencePriceMetadata {
  return {
    ...metadata,
    plan_reference_metadata_trace: {
      ...metadata.plan_reference_metadata_trace,
      generated_recommendation_retained_reference_price:
        metadata.reference_price_used_for_plan !== null,
    },
  };
}

export function resolvePlanReferencePriceMetadata(
  candidateInput: unknown,
): PlanReferencePriceMetadata {
  const candidate = objectOrNull(candidateInput) ?? {};
  const planReference = objectOrNull(candidate.plan_reference_price);
  const latestCandle = objectOrNull(candidate.latest_candle);
  const latestCandleCamel = objectOrNull(candidate.latestCandle);
  const intradayIndicators = objectOrNull(candidate.intraday_indicators);

  const price = firstNumber([
    {
      value: candidate.reference_price_used_for_plan,
      source: textOrNull(candidate.reference_price_source) ?? "unknown",
      readPath: "candidate.reference_price_used_for_plan",
    },
    {
      value: planReference?.reference_price_used_for_plan,
      source: textOrNull(planReference?.reference_price_source) ?? "unknown",
      readPath: "candidate.plan_reference_price.reference_price_used_for_plan",
    },
    {
      value: planReference?.price,
      source: textOrNull(planReference?.source) ?? "unknown",
      readPath: "candidate.plan_reference_price.price",
    },
    {
      value: candidate.latest_close,
      source: "fallback_last_price",
      readPath: "candidate.latest_close",
    },
    {
      value: candidate.latestClose,
      source: "fallback_last_price",
      readPath: "candidate.latestClose",
    },
    {
      value: latestCandle?.close,
      source: "latest_intraday_candle_close",
      readPath: "candidate.latest_candle.close",
    },
    {
      value: latestCandleCamel?.close,
      source: "latest_intraday_candle_close",
      readPath: "candidate.latestCandle.close",
    },
    {
      value: candidate.close,
      source: "latest_intraday_candle_close",
      readPath: "candidate.close",
    },
    {
      value: candidate.last_price,
      source: "fallback_last_price",
      readPath: "candidate.last_price",
    },
    {
      value: candidate.price,
      source: "current_price",
      readPath: "candidate.price",
    },
    {
      value: intradayIndicators?.latestPrice,
      source: "latest_intraday_candle_close",
      readPath: "candidate.intraday_indicators.latestPrice",
    },
    {
      value: candidate.mock_current_price,
      source: "current_price",
      readPath: "candidate.mock_current_price",
    },
  ]);

  const source = firstText([
    {
      value: candidate.reference_price_source,
      readPath: "candidate.reference_price_source",
    },
    {
      value: planReference?.reference_price_source,
      readPath: "candidate.plan_reference_price.reference_price_source",
    },
    { value: planReference?.source, readPath: "candidate.plan_reference_price.source" },
  ]);
  const timestamp = firstText([
    {
      value: candidate.reference_price_timestamp,
      readPath: "candidate.reference_price_timestamp",
    },
    {
      value: planReference?.reference_price_timestamp,
      readPath: "candidate.plan_reference_price.reference_price_timestamp",
    },
    {
      value: planReference?.timestamp,
      readPath: "candidate.plan_reference_price.timestamp",
    },
    { value: latestCandle?.timestamp, readPath: "candidate.latest_candle.timestamp" },
    { value: latestCandle?.datetime, readPath: "candidate.latest_candle.datetime" },
    { value: latestCandle?.time, readPath: "candidate.latest_candle.time" },
    { value: latestCandleCamel?.timestamp, readPath: "candidate.latestCandle.timestamp" },
    { value: latestCandleCamel?.datetime, readPath: "candidate.latestCandle.datetime" },
    { value: latestCandleCamel?.time, readPath: "candidate.latestCandle.time" },
    { value: candidate.data_timestamp, readPath: "candidate.data_timestamp" },
    { value: candidate.market_data_timestamp, readPath: "candidate.market_data_timestamp" },
    {
      value: candidate.intraday_indicator_cached_at,
      readPath: "candidate.intraday_indicator_cached_at",
    },
    { value: candidate.recommended_at, readPath: "candidate.recommended_at" },
  ]);
  const provider = firstText([
    {
      value: candidate.reference_price_provider,
      readPath: "candidate.reference_price_provider",
    },
    {
      value: planReference?.reference_price_provider,
      readPath: "candidate.plan_reference_price.reference_price_provider",
    },
    {
      value: planReference?.provider,
      readPath: "candidate.plan_reference_price.provider",
    },
    { value: candidate.market_data_provider, readPath: "candidate.market_data_provider" },
    { value: candidate.provider, readPath: "candidate.provider" },
  ]);

  const resolvedSource = source?.value ?? price?.source ?? "unknown";
  const resolvedPrice = price?.value ?? null;
  const resolvedTimestamp = timestamp?.value ?? null;

  return {
    reference_price_used_for_plan: resolvedPrice,
    reference_price_source: resolvedPrice === null ? "unknown" : resolvedSource,
    reference_price_timestamp: resolvedTimestamp,
    reference_price_symbol:
      normalizeTicker(candidate.reference_price_symbol) ??
      normalizeTicker(planReference?.reference_price_symbol) ??
      normalizeTicker(candidate.ticker),
    reference_price_provider: provider?.value ?? null,
    reference_price_read_path: price?.readPath ?? null,
    plan_reference_metadata_status: metadataStatus({
      price: resolvedPrice,
      source: resolvedPrice === null ? "unknown" : resolvedSource,
      timestamp: resolvedTimestamp,
    }),
    plan_reference_metadata_trace: {
      candidate_price_available_before_generation: resolvedPrice !== null,
      generated_recommendation_retained_reference_price: null,
      price_read_path: price?.readPath ?? null,
      source_read_path: source?.readPath ?? (price ? price.readPath : null),
      timestamp_read_path: timestamp?.readPath ?? null,
      provider_read_path: provider?.readPath ?? null,
    },
  };
}

export function entryTypeSourceForBuildPath(
  buildPath: string | null | undefined,
): RecommendationEntryTypeSource {
  return buildPath === "deterministic_fallback"
    ? "deterministic_plan_builder"
    : "metadata_inference";
}
