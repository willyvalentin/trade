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
  reference_timestamp_age_ms?: number | null;
  reference_timestamp_age_minutes?: number | null;
  reference_freshness_checked_at?: string | null;
  reference_freshness_market_date?: string | null;
  reference_freshness_status?: "not_checked" | "accepted" | "rejected";
  reference_price_stale_block_reason?: string | null;
  reference_price_source_attempted?: string | null;
  reference_price_final_source_used?: string | null;
  reference_price_rejected_read_path?: string | null;
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
  timestamp?: unknown;
  timestampReadPath?: string;
  provider?: unknown;
  providerReadPath?: string;
};

type TextCandidate = {
  value: unknown;
  readPath: string;
};

export type PlanReferenceFreshnessOptions = {
  enforceFreshness?: boolean;
  now?: Date | string | number;
  allowClosedMarketReviewReadback?: boolean;
};

type ResolvedReferenceCandidate = ReferenceCandidate & {
  value: number;
  timestampValue: string | null;
  providerValue: string | null;
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

function dateOrNull(value: unknown) {
  if (value instanceof Date) {
    return Number.isFinite(value.getTime()) ? value : null;
  }

  if (typeof value === "string" || typeof value === "number") {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function normalizeTicker(value: unknown) {
  const ticker = textOrNull(value);
  return ticker ? ticker.toUpperCase() : null;
}

function firstNumber(candidates: ReferenceCandidate[]) {
  for (const candidate of candidates) {
    const resolved = resolvedReferenceCandidate(candidate);
    if (resolved) return resolved;
  }

  return null;
}

function resolvedReferenceCandidate(
  candidate: ReferenceCandidate,
): ResolvedReferenceCandidate | null {
  const value = numberOrNull(candidate.value);
  if (value === null || value <= 0) return null;

  return {
    ...candidate,
    value,
    timestampValue: textOrNull(candidate.timestamp) ?? null,
    providerValue: textOrNull(candidate.provider) ?? null,
  };
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

function marketDateKey(date: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((part) => part.type === "year")?.value;
  const month = parts.find((part) => part.type === "month")?.value;
  const day = parts.find((part) => part.type === "day")?.value;

  return year && month && day ? `${year}-${month}-${day}` : null;
}

function previousWeekdayDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  if (!year || !month || !day) return null;

  const date = new Date(Date.UTC(year, month - 1, day, 12));

  do {
    date.setUTCDate(date.getUTCDate() - 1);
  } while (date.getUTCDay() === 0 || date.getUTCDay() === 6);

  return date.toISOString().slice(0, 10);
}

function isDailyCandleCandidate(candidate: ResolvedReferenceCandidate) {
  const text = `${candidate.source} ${candidate.readPath}`.toLowerCase();

  return (
    text.includes("candle") ||
    text.includes("latest_close") ||
    text.includes("latestclose")
  );
}

function isScannerCacheCandidate(candidate: ResolvedReferenceCandidate) {
  const text = [
    candidate.source,
    candidate.providerValue,
    candidate.readPath,
    candidate.timestampReadPath,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return text.includes("scanner_cache");
}

function freshnessDecision(
  candidate: ResolvedReferenceCandidate,
  options: PlanReferenceFreshnessOptions,
) {
  const now = dateOrNull(options.now) ?? new Date();
  const checkedAt = now.toISOString();
  const marketDate = marketDateKey(now);
  const timestampDate = dateOrNull(candidate.timestampValue);

  if (options.allowClosedMarketReviewReadback) {
    return {
      accepted: true,
      reason: null,
      checkedAt,
      marketDate,
      ageMs: timestampDate ? now.getTime() - timestampDate.getTime() : null,
    };
  }

  if (!timestampDate || !marketDate) {
    return {
      accepted: false,
      reason: "missing_fresh_reference_price",
      checkedAt,
      marketDate,
      ageMs: null,
    };
  }

  const ageMs = now.getTime() - timestampDate.getTime();
  if (ageMs < 0) {
    return {
      accepted: false,
      reason: "future_reference_timestamp",
      checkedAt,
      marketDate,
      ageMs,
    };
  }

  const referenceMarketDate = marketDateKey(timestampDate);
  const previousTradingDate = previousWeekdayDateKey(marketDate);
  const acceptedDate =
    referenceMarketDate === marketDate ||
    (isDailyCandleCandidate(candidate) &&
      !isScannerCacheCandidate(candidate) &&
      referenceMarketDate === previousTradingDate);

  return {
    accepted: acceptedDate,
    reason: acceptedDate
      ? null
      : isScannerCacheCandidate(candidate)
        ? "scanner_cache_reference_too_old"
        : "stale_reference_price",
    checkedAt,
    marketDate,
    ageMs,
  };
}

function resolveFreshReferenceCandidate(
  candidates: ReferenceCandidate[],
  options: PlanReferenceFreshnessOptions,
) {
  let firstRejected:
    | (ResolvedReferenceCandidate & {
        freshness: ReturnType<typeof freshnessDecision>;
      })
    | null = null;

  for (const candidate of candidates) {
    const resolved = resolvedReferenceCandidate(candidate);
    if (!resolved) continue;

    const freshness = freshnessDecision(resolved, options);
    if (freshness.accepted) {
      return { selected: resolved, rejected: firstRejected, freshness };
    }

    firstRejected ??= { ...resolved, freshness };
  }

  return { selected: null, rejected: firstRejected, freshness: null };
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
  options: PlanReferenceFreshnessOptions = {},
): PlanReferencePriceMetadata {
  const candidate = objectOrNull(candidateInput) ?? {};
  const planReference = objectOrNull(candidate.plan_reference_price);
  const quote = objectOrNull(candidate.quote);
  const latestQuote = objectOrNull(candidate.latest_quote);
  const providerQuote = objectOrNull(candidate.provider_quote);
  const candle = objectOrNull(candidate.candle);
  const latestCandle = objectOrNull(candidate.latest_candle);
  const latestCandleCamel = objectOrNull(candidate.latestCandle);
  const providerCandle = objectOrNull(candidate.provider_candle);
  const intradayIndicators = objectOrNull(candidate.intraday_indicators);

  const priceCandidates: ReferenceCandidate[] = [
    {
      value: candidate.reference_price_used_for_plan,
      source: textOrNull(candidate.reference_price_source) ?? "unknown",
      readPath: "candidate.reference_price_used_for_plan",
      timestamp: candidate.reference_price_timestamp,
      timestampReadPath: "candidate.reference_price_timestamp",
      provider: candidate.reference_price_provider,
      providerReadPath: "candidate.reference_price_provider",
    },
    {
      value: planReference?.reference_price_used_for_plan,
      source: textOrNull(planReference?.reference_price_source) ?? "unknown",
      readPath: "candidate.plan_reference_price.reference_price_used_for_plan",
      timestamp: planReference?.reference_price_timestamp,
      timestampReadPath: "candidate.plan_reference_price.reference_price_timestamp",
      provider: planReference?.reference_price_provider,
      providerReadPath: "candidate.plan_reference_price.reference_price_provider",
    },
    {
      value: planReference?.price,
      source: textOrNull(planReference?.source) ?? "unknown",
      readPath: "candidate.plan_reference_price.price",
      timestamp: planReference?.timestamp,
      timestampReadPath: "candidate.plan_reference_price.timestamp",
      provider: planReference?.provider,
      providerReadPath: "candidate.plan_reference_price.provider",
    },
    {
      value: candidate.latest_close,
      source: "scanner_candidate_latest_close",
      readPath: "scanner_candidate.latest_close",
      timestamp: candidate.reference_price_timestamp,
      timestampReadPath: "candidate.reference_price_timestamp",
      provider: candidate.reference_price_provider,
      providerReadPath: "candidate.reference_price_provider",
    },
    {
      value: candidate.latestClose,
      source: "scanner_candidate_latest_close",
      readPath: "scanner_candidate.latestClose",
      timestamp: candidate.reference_price_timestamp,
      timestampReadPath: "candidate.reference_price_timestamp",
      provider: candidate.reference_price_provider,
      providerReadPath: "candidate.reference_price_provider",
    },
    {
      value: quote?.price,
      source: "scanner_candidate_quote_price",
      readPath: "scanner_candidate.quote.price",
      timestamp: quote?.timestamp ?? quote?.datetime ?? quote?.updated_at,
      timestampReadPath: "scanner_candidate.quote.timestamp",
      provider: quote?.provider ?? quote?.source,
      providerReadPath: "scanner_candidate.quote.provider",
    },
    {
      value: quote?.last_price,
      source: "scanner_candidate_quote_price",
      readPath: "scanner_candidate.quote.last_price",
      timestamp: quote?.timestamp ?? quote?.datetime ?? quote?.updated_at,
      timestampReadPath: "scanner_candidate.quote.timestamp",
      provider: quote?.provider ?? quote?.source,
      providerReadPath: "scanner_candidate.quote.provider",
    },
    {
      value: quote?.close,
      source: "scanner_candidate_quote_price",
      readPath: "scanner_candidate.quote.close",
      timestamp: quote?.timestamp ?? quote?.datetime ?? quote?.updated_at,
      timestampReadPath: "scanner_candidate.quote.timestamp",
      provider: quote?.provider ?? quote?.source,
      providerReadPath: "scanner_candidate.quote.provider",
    },
    {
      value: latestQuote?.price,
      source: "scanner_candidate_quote_price",
      readPath: "scanner_candidate.latest_quote.price",
      timestamp:
        latestQuote?.timestamp ?? latestQuote?.datetime ?? latestQuote?.updated_at,
      timestampReadPath: "scanner_candidate.latest_quote.timestamp",
      provider: latestQuote?.provider ?? latestQuote?.source,
      providerReadPath: "scanner_candidate.latest_quote.provider",
    },
    {
      value: latestQuote?.last_price,
      source: "scanner_candidate_quote_price",
      readPath: "scanner_candidate.latest_quote.last_price",
      timestamp:
        latestQuote?.timestamp ?? latestQuote?.datetime ?? latestQuote?.updated_at,
      timestampReadPath: "scanner_candidate.latest_quote.timestamp",
      provider: latestQuote?.provider ?? latestQuote?.source,
      providerReadPath: "scanner_candidate.latest_quote.provider",
    },
    {
      value: providerQuote?.price,
      source: "scanner_candidate_quote_price",
      readPath: "scanner_candidate.provider_quote.price",
      timestamp:
        providerQuote?.timestamp ??
        providerQuote?.datetime ??
        providerQuote?.updated_at,
      timestampReadPath: "scanner_candidate.provider_quote.timestamp",
      provider: providerQuote?.provider ?? providerQuote?.source,
      providerReadPath: "scanner_candidate.provider_quote.provider",
    },
    {
      value: providerQuote?.last_price,
      source: "scanner_candidate_quote_price",
      readPath: "scanner_candidate.provider_quote.last_price",
      timestamp:
        providerQuote?.timestamp ??
        providerQuote?.datetime ??
        providerQuote?.updated_at,
      timestampReadPath: "scanner_candidate.provider_quote.timestamp",
      provider: providerQuote?.provider ?? providerQuote?.source,
      providerReadPath: "scanner_candidate.provider_quote.provider",
    },
    {
      value: candle?.close,
      source: "scanner_candidate_candle_close",
      readPath: "scanner_candidate.candle.close",
      timestamp: candle?.timestamp ?? candle?.datetime ?? candle?.time,
      timestampReadPath: "scanner_candidate.candle.timestamp",
      provider: candle?.provider ?? candle?.source,
      providerReadPath: "scanner_candidate.candle.provider",
    },
    {
      value: latestCandle?.close,
      source: "scanner_candidate_candle_close",
      readPath: "scanner_candidate.latest_candle.close",
      timestamp:
        latestCandle?.timestamp ?? latestCandle?.datetime ?? latestCandle?.time,
      timestampReadPath: "scanner_candidate.latest_candle.timestamp",
      provider: latestCandle?.provider ?? latestCandle?.source,
      providerReadPath: "scanner_candidate.latest_candle.provider",
    },
    {
      value: latestCandleCamel?.close,
      source: "scanner_candidate_candle_close",
      readPath: "scanner_candidate.latestCandle.close",
      timestamp:
        latestCandleCamel?.timestamp ??
        latestCandleCamel?.datetime ??
        latestCandleCamel?.time,
      timestampReadPath: "scanner_candidate.latestCandle.timestamp",
      provider: latestCandleCamel?.provider ?? latestCandleCamel?.source,
      providerReadPath: "scanner_candidate.latestCandle.provider",
    },
    {
      value: providerCandle?.close,
      source: "scanner_candidate_candle_close",
      readPath: "scanner_candidate.provider_candle.close",
      timestamp:
        providerCandle?.timestamp ??
        providerCandle?.datetime ??
        providerCandle?.time,
      timestampReadPath: "scanner_candidate.provider_candle.timestamp",
      provider: providerCandle?.provider ?? providerCandle?.source,
      providerReadPath: "scanner_candidate.provider_candle.provider",
    },
    {
      value: candidate.close,
      source: "scanner_candidate_candle_close",
      readPath: "scanner_candidate.close",
      timestamp: candidate.data_timestamp ?? candidate.market_data_timestamp,
      timestampReadPath: "candidate.data_timestamp",
      provider: candidate.market_data_provider ?? candidate.provider,
      providerReadPath: "candidate.market_data_provider",
    },
    {
      value: candidate.last_price,
      source: "scanner_candidate_latest_close",
      readPath: "scanner_candidate.last_price",
      timestamp: candidate.data_timestamp ?? candidate.market_data_timestamp,
      timestampReadPath: "candidate.data_timestamp",
      provider: candidate.market_data_provider ?? candidate.provider,
      providerReadPath: "candidate.market_data_provider",
    },
    {
      value: candidate.price,
      source: "scanner_candidate_price",
      readPath: "scanner_candidate.price",
      timestamp: candidate.data_timestamp ?? candidate.market_data_timestamp,
      timestampReadPath: "candidate.data_timestamp",
      provider: candidate.market_data_provider ?? candidate.provider,
      providerReadPath: "candidate.market_data_provider",
    },
    {
      value: intradayIndicators?.latestPrice,
      source: "scanner_candidate_intraday_latest_price",
      readPath: "scanner_candidate.intraday_indicators.latestPrice",
      timestamp: candidate.intraday_indicator_cached_at,
      timestampReadPath: "candidate.intraday_indicator_cached_at",
      provider: candidate.reference_price_provider ?? candidate.provider,
      providerReadPath: "candidate.reference_price_provider",
    },
    {
      value: candidate.mock_current_price,
      source: "scanner_candidate_mock_current_price",
      readPath: "scanner_candidate.mock_current_price",
      timestamp: candidate.reference_price_timestamp,
      timestampReadPath: "candidate.reference_price_timestamp",
      provider: candidate.reference_price_provider,
      providerReadPath: "candidate.reference_price_provider",
    },
  ];
  const freshnessResult = options.enforceFreshness
    ? resolveFreshReferenceCandidate(priceCandidates, options)
    : null;
  const price = options.enforceFreshness
    ? (freshnessResult?.selected ?? null)
    : firstNumber(priceCandidates);

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
    { value: quote?.timestamp, readPath: "scanner_candidate.quote.timestamp" },
    { value: quote?.datetime, readPath: "scanner_candidate.quote.datetime" },
    { value: quote?.updated_at, readPath: "scanner_candidate.quote.updated_at" },
    { value: latestQuote?.timestamp, readPath: "scanner_candidate.latest_quote.timestamp" },
    { value: latestQuote?.datetime, readPath: "scanner_candidate.latest_quote.datetime" },
    { value: latestQuote?.updated_at, readPath: "scanner_candidate.latest_quote.updated_at" },
    { value: providerQuote?.timestamp, readPath: "scanner_candidate.provider_quote.timestamp" },
    { value: providerQuote?.datetime, readPath: "scanner_candidate.provider_quote.datetime" },
    { value: providerQuote?.updated_at, readPath: "scanner_candidate.provider_quote.updated_at" },
    { value: candle?.timestamp, readPath: "scanner_candidate.candle.timestamp" },
    { value: candle?.datetime, readPath: "scanner_candidate.candle.datetime" },
    { value: candle?.time, readPath: "scanner_candidate.candle.time" },
    { value: latestCandle?.timestamp, readPath: "scanner_candidate.latest_candle.timestamp" },
    { value: latestCandle?.datetime, readPath: "scanner_candidate.latest_candle.datetime" },
    { value: latestCandle?.time, readPath: "scanner_candidate.latest_candle.time" },
    { value: latestCandleCamel?.timestamp, readPath: "scanner_candidate.latestCandle.timestamp" },
    { value: latestCandleCamel?.datetime, readPath: "scanner_candidate.latestCandle.datetime" },
    { value: latestCandleCamel?.time, readPath: "scanner_candidate.latestCandle.time" },
    { value: providerCandle?.timestamp, readPath: "scanner_candidate.provider_candle.timestamp" },
    { value: providerCandle?.datetime, readPath: "scanner_candidate.provider_candle.datetime" },
    { value: providerCandle?.time, readPath: "scanner_candidate.provider_candle.time" },
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
    { value: quote?.provider, readPath: "scanner_candidate.quote.provider" },
    { value: quote?.source, readPath: "scanner_candidate.quote.source" },
    { value: latestQuote?.provider, readPath: "scanner_candidate.latest_quote.provider" },
    { value: latestQuote?.source, readPath: "scanner_candidate.latest_quote.source" },
    { value: providerQuote?.provider, readPath: "scanner_candidate.provider_quote.provider" },
    { value: providerQuote?.source, readPath: "scanner_candidate.provider_quote.source" },
    { value: candle?.provider, readPath: "scanner_candidate.candle.provider" },
    { value: candle?.source, readPath: "scanner_candidate.candle.source" },
    { value: latestCandle?.provider, readPath: "scanner_candidate.latest_candle.provider" },
    { value: latestCandle?.source, readPath: "scanner_candidate.latest_candle.source" },
    { value: providerCandle?.provider, readPath: "scanner_candidate.provider_candle.provider" },
    { value: providerCandle?.source, readPath: "scanner_candidate.provider_candle.source" },
    { value: candidate.market_data_provider, readPath: "candidate.market_data_provider" },
    { value: candidate.provider, readPath: "candidate.provider" },
  ]);

  const resolvedSource = price?.source ?? source?.value ?? "unknown";
  const resolvedPrice = price?.value ?? null;
  const resolvedTimestamp = price?.timestampValue ?? timestamp?.value ?? null;
  const resolvedProvider = price?.providerValue ?? provider?.value ?? null;
  const acceptedFreshness = freshnessResult?.freshness ?? null;
  const rejectedFreshness = freshnessResult?.rejected?.freshness ?? null;
  const freshness = acceptedFreshness ?? rejectedFreshness;
  const rejectedCandidate = freshnessResult?.rejected ?? null;

  return {
    reference_price_used_for_plan: resolvedPrice,
    reference_price_source: resolvedPrice === null ? "unknown" : resolvedSource,
    reference_price_timestamp: resolvedTimestamp,
    reference_price_symbol:
      normalizeTicker(candidate.reference_price_symbol) ??
      normalizeTicker(planReference?.reference_price_symbol) ??
      normalizeTicker(candidate.ticker),
    reference_price_provider: resolvedProvider,
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
      source_read_path: price?.readPath ?? source?.readPath ?? null,
      timestamp_read_path:
        price?.timestampReadPath ?? timestamp?.readPath ?? null,
      provider_read_path: price?.providerReadPath ?? provider?.readPath ?? null,
      reference_timestamp_age_ms: freshness?.ageMs ?? null,
      reference_timestamp_age_minutes:
        typeof freshness?.ageMs === "number"
          ? Math.round(freshness.ageMs / 60000)
          : null,
      reference_freshness_checked_at: freshness?.checkedAt ?? null,
      reference_freshness_market_date: freshness?.marketDate ?? null,
      reference_freshness_status: options.enforceFreshness
        ? price
          ? "accepted"
          : "rejected"
        : "not_checked",
      reference_price_stale_block_reason:
        options.enforceFreshness && !price
          ? (rejectedFreshness?.reason ?? "missing_fresh_reference_price")
          : null,
      reference_price_source_attempted:
        rejectedCandidate?.source ?? price?.source ?? null,
      reference_price_final_source_used: price?.source ?? null,
      reference_price_rejected_read_path: rejectedCandidate?.readPath ?? null,
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
