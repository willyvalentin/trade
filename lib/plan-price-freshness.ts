export type PlanPriceFreshnessClassification =
  | "fresh_plan"
  | "slightly_stale_plan"
  | "stale_plan"
  | "severely_stale_plan"
  | "missing_reference_price"
  | "missing_reference_timestamp"
  | "provider_price_unavailable";

export type PlanPriceFreshnessDiagnostics = {
  reference_price_used_for_plan: number | null;
  reference_price_source: string | null;
  reference_price_timestamp: string | null;
  first_available_candle_close: number | null;
  first_available_candle_timestamp: string | null;
  latest_provider_price_if_available: number | null;
  entry_distance_from_first_candle_close_pct: number | null;
  stop_distance_from_first_candle_close_pct: number | null;
  target_distance_from_first_candle_close_pct: number | null;
  entry_distance_from_reference_price_pct: number | null;
  reference_to_first_candle_drift_pct: number | null;
  classification: PlanPriceFreshnessClassification;
  warnings: string[];
};

export type PlanPriceFreshnessSummaryTicker = {
  ticker: string | null;
  snapshot_fingerprint: string | null;
  horizon: string | null;
  entry_distance_from_first_candle_close_pct: number | null;
  classification: PlanPriceFreshnessClassification;
  reference_price_source: string | null;
  reference_price_used_for_plan: number | null;
  first_available_candle_close: number | null;
};

export type PlanPriceFreshnessSummary = {
  total_snapshots: number;
  evaluated_snapshots: number;
  fresh_plan_count: number;
  slightly_stale_plan_count: number;
  stale_plan_count: number;
  severely_stale_plan_count: number;
  missing_reference_price_count: number;
  missing_reference_timestamp_count: number;
  provider_price_unavailable_count: number;
  average_entry_distance_from_first_candle_close_pct: number | null;
  worst_entry_distance_from_first_candle_close_pct: number | null;
  stale_or_severely_stale_ratio: number;
  largest_distance_tickers: PlanPriceFreshnessSummaryTicker[];
  reference_price_source_counts: Record<string, number>;
  warning: string | null;
};

export type PlanPriceFreshnessSnapshotLike = {
  snapshot_fingerprint?: string | null;
  ticker?: string | null;
  recommended_at?: string | null;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  quote_price?: number | null;
  market_data_snapshot?: unknown;
  payload_json?: Record<string, unknown> | null;
};

export type PlanPriceFreshnessCandleLike = {
  timestamp?: string | null;
  close?: number | null;
};

type ReferencePriceCandidate = {
  value: unknown;
  source: string;
};

type ReferenceTimestampCandidate = {
  value: unknown;
  source: string;
};

const stalePlanWarning =
  "Official plans may be using stale or far-away reference prices. Review plan price source before tuning entry strategy.";

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function toIso(value: unknown): string | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value !== "string" || value.trim() === "") return null;
  const date = new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function roundPct(value: number | null): number | null {
  return value === null ? null : Math.round(value * 1000) / 1000;
}

function distancePct(value: number | null, reference: number | null): number | null {
  if (value === null || reference === null || reference === 0) return null;
  return roundPct((Math.abs(value - reference) / Math.abs(reference)) * 100);
}

function getNestedObject(
  root: Record<string, unknown> | null,
  key: string,
): Record<string, unknown> | null {
  if (!root) return null;
  return objectOrNull(root[key]);
}

function firstReferencePrice(candidates: ReferencePriceCandidate[]) {
  for (const candidate of candidates) {
    const value = finiteNumber(candidate.value);
    if (value !== null && value > 0) {
      return { value, source: candidate.source };
    }
  }
  return { value: null, source: null };
}

function firstReferenceTimestamp(candidates: ReferenceTimestampCandidate[]) {
  for (const candidate of candidates) {
    const value = toIso(candidate.value);
    if (value) {
      return { value, source: candidate.source };
    }
  }
  return { value: null, source: null };
}

function extractReferencePrice(snapshot: PlanPriceFreshnessSnapshotLike | null) {
  const payload = objectOrNull(snapshot?.payload_json);
  const marketData = objectOrNull(snapshot?.market_data_snapshot);
  const payloadMarketData =
    getNestedObject(payload, "market_data_snapshot") ??
    getNestedObject(payload, "market_data") ??
    getNestedObject(payload, "quote") ??
    getNestedObject(payload, "provider_quote");
  const tradePlan = getNestedObject(payload, "trade_plan");
  const recommendation = getNestedObject(payload, "recommendation");

  return firstReferencePrice([
    { value: payload?.reference_price, source: "snapshot.payload_json.reference_price" },
    { value: payload?.referencePrice, source: "snapshot.payload_json.referencePrice" },
    { value: payload?.quote_price, source: "snapshot.payload_json.quote_price" },
    { value: payload?.quotePrice, source: "snapshot.payload_json.quotePrice" },
    { value: tradePlan?.reference_price, source: "snapshot.payload_json.trade_plan.reference_price" },
    { value: tradePlan?.referencePrice, source: "snapshot.payload_json.trade_plan.referencePrice" },
    { value: recommendation?.reference_price, source: "snapshot.payload_json.recommendation.reference_price" },
    { value: snapshot?.quote_price, source: "snapshot.quote_price" },
    { value: marketData?.reference_price, source: "snapshot.market_data_snapshot.reference_price" },
    { value: marketData?.price, source: "snapshot.market_data_snapshot.price" },
    { value: marketData?.latest_price, source: "snapshot.market_data_snapshot.latest_price" },
    { value: marketData?.last_price, source: "snapshot.market_data_snapshot.last_price" },
    { value: marketData?.lastPrice, source: "snapshot.market_data_snapshot.lastPrice" },
    { value: marketData?.current_price, source: "snapshot.market_data_snapshot.current_price" },
    { value: marketData?.close, source: "snapshot.market_data_snapshot.close" },
    { value: payloadMarketData?.reference_price, source: "snapshot.payload_json.market_data.reference_price" },
    { value: payloadMarketData?.price, source: "snapshot.payload_json.market_data.price" },
    { value: payloadMarketData?.latest_price, source: "snapshot.payload_json.market_data.latest_price" },
    { value: payloadMarketData?.last_price, source: "snapshot.payload_json.market_data.last_price" },
    { value: payloadMarketData?.lastPrice, source: "snapshot.payload_json.market_data.lastPrice" },
    { value: payloadMarketData?.current_price, source: "snapshot.payload_json.market_data.current_price" },
    { value: payloadMarketData?.close, source: "snapshot.payload_json.market_data.close" },
  ]);
}

function extractReferenceTimestamp(snapshot: PlanPriceFreshnessSnapshotLike | null) {
  const payload = objectOrNull(snapshot?.payload_json);
  const marketData = objectOrNull(snapshot?.market_data_snapshot);
  const payloadMarketData =
    getNestedObject(payload, "market_data_snapshot") ??
    getNestedObject(payload, "market_data") ??
    getNestedObject(payload, "quote") ??
    getNestedObject(payload, "provider_quote");
  const tradePlan = getNestedObject(payload, "trade_plan");
  const recommendation = getNestedObject(payload, "recommendation");

  return firstReferenceTimestamp([
    {
      value: payload?.reference_price_timestamp,
      source: "snapshot.payload_json.reference_price_timestamp",
    },
    { value: payload?.referencePriceTimestamp, source: "snapshot.payload_json.referencePriceTimestamp" },
    { value: payload?.quote_timestamp, source: "snapshot.payload_json.quote_timestamp" },
    { value: payload?.market_data_timestamp, source: "snapshot.payload_json.market_data_timestamp" },
    { value: tradePlan?.reference_price_timestamp, source: "snapshot.payload_json.trade_plan.reference_price_timestamp" },
    { value: recommendation?.reference_price_timestamp, source: "snapshot.payload_json.recommendation.reference_price_timestamp" },
    { value: marketData?.timestamp, source: "snapshot.market_data_snapshot.timestamp" },
    { value: marketData?.updated_at, source: "snapshot.market_data_snapshot.updated_at" },
    { value: marketData?.as_of, source: "snapshot.market_data_snapshot.as_of" },
    { value: marketData?.asOf, source: "snapshot.market_data_snapshot.asOf" },
    { value: payloadMarketData?.timestamp, source: "snapshot.payload_json.market_data.timestamp" },
    { value: payloadMarketData?.updated_at, source: "snapshot.payload_json.market_data.updated_at" },
    { value: payloadMarketData?.as_of, source: "snapshot.payload_json.market_data.as_of" },
    { value: payloadMarketData?.asOf, source: "snapshot.payload_json.market_data.asOf" },
  ]);
}

function firstCandle(candles: PlanPriceFreshnessCandleLike[] | null | undefined) {
  for (const candle of candles ?? []) {
    const close = finiteNumber(candle.close);
    const timestamp = toIso(candle.timestamp);
    if (close !== null && close > 0) {
      return { close, timestamp };
    }
  }
  return { close: null, timestamp: null };
}

function latestProviderPrice(
  candles: PlanPriceFreshnessCandleLike[] | null | undefined,
  explicitValue: unknown,
) {
  const explicit = finiteNumber(explicitValue);
  if (explicit !== null && explicit > 0) return explicit;

  for (const candle of [...(candles ?? [])].reverse()) {
    const close = finiteNumber(candle.close);
    if (close !== null && close > 0) return close;
  }

  return null;
}

function classifyPlanFreshness(input: {
  referencePrice: number | null;
  referenceTimestamp: string | null;
  firstCandleClose: number | null;
  latestProviderPrice: number | null;
  entryDistanceFromFirstCandleClosePct: number | null;
}): PlanPriceFreshnessClassification {
  if (input.referencePrice === null) return "missing_reference_price";
  if (input.firstCandleClose === null && input.latestProviderPrice === null) {
    return "provider_price_unavailable";
  }
  const distance = input.entryDistanceFromFirstCandleClosePct;
  if (distance === null) {
    return input.referenceTimestamp === null
      ? "missing_reference_timestamp"
      : "provider_price_unavailable";
  }
  if (distance <= 1.5) return "fresh_plan";
  if (distance <= 3) return "slightly_stale_plan";
  if (distance <= 7) return "stale_plan";
  return "severely_stale_plan";
}

export function computePlanPriceFreshnessDiagnostics(input: {
  snapshot?: PlanPriceFreshnessSnapshotLike | null;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  candles?: PlanPriceFreshnessCandleLike[] | null;
  latestProviderPrice?: number | null;
}): PlanPriceFreshnessDiagnostics {
  const snapshot = input.snapshot ?? null;
  const entry = finiteNumber(input.entry) ?? finiteNumber(snapshot?.entry);
  const stop = finiteNumber(input.stop) ?? finiteNumber(snapshot?.stop);
  const target = finiteNumber(input.target) ?? finiteNumber(snapshot?.target);
  const reference = extractReferencePrice(snapshot);
  const referenceTimestamp = extractReferenceTimestamp(snapshot);
  const first = firstCandle(input.candles);
  const latestPrice = latestProviderPrice(input.candles, input.latestProviderPrice);
  const entryDistanceFromFirstCandle = distancePct(entry, first.close);
  const classification = classifyPlanFreshness({
    referencePrice: reference.value,
    referenceTimestamp: referenceTimestamp.value,
    firstCandleClose: first.close,
    latestProviderPrice: latestPrice,
    entryDistanceFromFirstCandleClosePct: entryDistanceFromFirstCandle,
  });
  const warnings: string[] = [];

  if (classification === "missing_reference_price") {
    warnings.push("Reference price used for the official plan is unavailable.");
  }
  if (referenceTimestamp.value === null) {
    warnings.push("Reference price timestamp for the official plan is unavailable.");
  }
  if (classification === "provider_price_unavailable") {
    warnings.push("Provider candle/latest price is unavailable for plan freshness comparison.");
  }
  if (classification === "stale_plan" || classification === "severely_stale_plan") {
    warnings.push("Official entry is far from the first available provider candle close.");
  }

  return {
    reference_price_used_for_plan: reference.value,
    reference_price_source: reference.source,
    reference_price_timestamp: referenceTimestamp.value,
    first_available_candle_close: first.close,
    first_available_candle_timestamp: first.timestamp,
    latest_provider_price_if_available: latestPrice,
    entry_distance_from_first_candle_close_pct: entryDistanceFromFirstCandle,
    stop_distance_from_first_candle_close_pct: distancePct(stop, first.close),
    target_distance_from_first_candle_close_pct: distancePct(target, first.close),
    entry_distance_from_reference_price_pct: distancePct(entry, reference.value),
    reference_to_first_candle_drift_pct: distancePct(reference.value, first.close),
    classification,
    warnings,
  };
}

export function summarizePlanPriceFreshness(
  items: Array<{
    ticker?: string | null;
    snapshot_fingerprint?: string | null;
    horizon?: string | null;
    diagnostics?: PlanPriceFreshnessDiagnostics | null;
  }>,
): PlanPriceFreshnessSummary {
  const diagnosticsItems = items.filter((item) => item.diagnostics);
  const counts: Record<PlanPriceFreshnessClassification, number> = {
    fresh_plan: 0,
    slightly_stale_plan: 0,
    stale_plan: 0,
    severely_stale_plan: 0,
    missing_reference_price: 0,
    missing_reference_timestamp: 0,
    provider_price_unavailable: 0,
  };
  const referenceSourceCounts: Record<string, number> = {};
  const distances: number[] = [];
  const tickerDistances: PlanPriceFreshnessSummaryTicker[] = [];

  for (const item of diagnosticsItems) {
    const diagnostics = item.diagnostics;
    if (!diagnostics) continue;
    counts[diagnostics.classification] += 1;
    const source = diagnostics.reference_price_source ?? "unknown";
    referenceSourceCounts[source] = (referenceSourceCounts[source] ?? 0) + 1;
    const distance = diagnostics.entry_distance_from_first_candle_close_pct;
    if (distance !== null) {
      distances.push(distance);
      tickerDistances.push({
        ticker: item.ticker ?? null,
        snapshot_fingerprint: item.snapshot_fingerprint ?? null,
        horizon: item.horizon ?? null,
        entry_distance_from_first_candle_close_pct: distance,
        classification: diagnostics.classification,
        reference_price_source: diagnostics.reference_price_source,
        reference_price_used_for_plan: diagnostics.reference_price_used_for_plan,
        first_available_candle_close: diagnostics.first_available_candle_close,
      });
    }
  }

  const staleOrSevere = counts.stale_plan + counts.severely_stale_plan;
  const evaluated = diagnosticsItems.length;
  const staleRatio = evaluated > 0 ? staleOrSevere / evaluated : 0;
  const average =
    distances.length === 0
      ? null
      : roundPct(distances.reduce((sum, value) => sum + value, 0) / distances.length);
  const worst = distances.length === 0 ? null : roundPct(Math.max(...distances));

  return {
    total_snapshots: items.length,
    evaluated_snapshots: evaluated,
    fresh_plan_count: counts.fresh_plan,
    slightly_stale_plan_count: counts.slightly_stale_plan,
    stale_plan_count: counts.stale_plan,
    severely_stale_plan_count: counts.severely_stale_plan,
    missing_reference_price_count: counts.missing_reference_price,
    missing_reference_timestamp_count: counts.missing_reference_timestamp,
    provider_price_unavailable_count: counts.provider_price_unavailable,
    average_entry_distance_from_first_candle_close_pct: average,
    worst_entry_distance_from_first_candle_close_pct: worst,
    stale_or_severely_stale_ratio: roundPct(staleRatio) ?? 0,
    largest_distance_tickers: tickerDistances
      .sort(
        (left, right) =>
          (right.entry_distance_from_first_candle_close_pct ?? -1) -
          (left.entry_distance_from_first_candle_close_pct ?? -1),
      )
      .slice(0, 10),
    reference_price_source_counts: referenceSourceCounts,
    warning: staleRatio > 0.3 ? stalePlanWarning : null,
  };
}

export function planPriceFreshnessWarningText() {
  return stalePlanWarning;
}
