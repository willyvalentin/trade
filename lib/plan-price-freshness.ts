import {
  planReferenceMetadataDiagnostics,
  type PlanReferenceMetadataStatus,
} from "@/lib/recommendation-inline-metadata";

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
  reference_price_symbol: string | null;
  reference_price_provider: string | null;
  reference_price_read_path: string | null;
  first_available_candle_close: number | null;
  first_available_candle_timestamp: string | null;
  latest_provider_price_if_available: number | null;
  entry_distance_from_first_candle_close_pct: number | null;
  stop_distance_from_first_candle_close_pct: number | null;
  target_distance_from_first_candle_close_pct: number | null;
  entry_distance_from_reference_price_pct: number | null;
  reference_to_first_candle_drift_pct: number | null;
  classification: PlanPriceFreshnessClassification;
  plan_reference_metadata_status: PlanReferenceMetadataStatus;
  plan_reference_metadata_missing_reason: string | null;
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
  plan_reference_metadata_status: PlanReferenceMetadataStatus;
  plan_reference_metadata_missing_reason: string | null;
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
  reference_metadata_present_count: number;
  reference_metadata_missing_but_plan_prices_present_count: number;
  reference_metadata_missing_no_plan_prices_count: number;
  top_tickers_missing_reference_metadata: PlanPriceFreshnessSummaryTicker[];
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
  readPath: string;
  provider?: unknown;
  symbol?: unknown;
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

function textOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function planReferenceMetadataStatusOrNull(
  value: unknown,
): PlanReferenceMetadataStatus | null {
  return value === "present" ||
    value === "missing_but_plan_prices_present" ||
    value === "missing_no_plan_prices"
    ? value
    : null;
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
      return {
        value,
        source: candidate.source,
        readPath: candidate.readPath,
        provider: textOrNull(candidate.provider),
        symbol: textOrNull(candidate.symbol),
      };
    }
  }
  return {
    value: null,
    source: "unknown",
    readPath: null,
    provider: null,
    symbol: null,
  };
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
  const planReference = getNestedObject(payload, "plan_reference_price");

  return firstReferencePrice([
    {
      value: payload?.reference_price_used_for_plan,
      source: textOrNull(payload?.reference_price_source) ?? "unknown",
      readPath: "snapshot.payload_json.reference_price_used_for_plan",
      provider: payload?.reference_price_provider,
      symbol: payload?.reference_price_symbol ?? snapshot?.ticker,
    },
    {
      value: planReference?.reference_price_used_for_plan,
      source: textOrNull(planReference?.reference_price_source) ?? "unknown",
      readPath: "snapshot.payload_json.plan_reference_price.reference_price_used_for_plan",
      provider: planReference?.reference_price_provider,
      symbol: planReference?.reference_price_symbol ?? snapshot?.ticker,
    },
    {
      value: tradePlan?.reference_price_used_for_plan,
      source: textOrNull(tradePlan?.reference_price_source) ?? "unknown",
      readPath: "snapshot.payload_json.trade_plan.reference_price_used_for_plan",
      provider: tradePlan?.reference_price_provider,
      symbol: tradePlan?.reference_price_symbol ?? snapshot?.ticker,
    },
    {
      value: recommendation?.reference_price_used_for_plan,
      source: textOrNull(recommendation?.reference_price_source) ?? "unknown",
      readPath:
        "snapshot.payload_json.recommendation.reference_price_used_for_plan",
      provider: recommendation?.reference_price_provider,
      symbol: recommendation?.reference_price_symbol ?? snapshot?.ticker,
    },
    {
      value: payload?.reference_price,
      source: "snapshot_payload_price",
      readPath: "snapshot.payload_json.reference_price",
      symbol: snapshot?.ticker,
    },
    {
      value: payload?.referencePrice,
      source: "snapshot_payload_price",
      readPath: "snapshot.payload_json.referencePrice",
      symbol: snapshot?.ticker,
    },
    {
      value: payload?.quote_price,
      source: "provider_quote_price",
      readPath: "snapshot.payload_json.quote_price",
      symbol: snapshot?.ticker,
    },
    {
      value: payload?.quotePrice,
      source: "provider_quote_price",
      readPath: "snapshot.payload_json.quotePrice",
      symbol: snapshot?.ticker,
    },
    {
      value: tradePlan?.reference_price,
      source: "snapshot_payload_price",
      readPath: "snapshot.payload_json.trade_plan.reference_price",
      symbol: snapshot?.ticker,
    },
    {
      value: tradePlan?.referencePrice,
      source: "snapshot_payload_price",
      readPath: "snapshot.payload_json.trade_plan.referencePrice",
      symbol: snapshot?.ticker,
    },
    {
      value: recommendation?.reference_price,
      source: "snapshot_payload_price",
      readPath: "snapshot.payload_json.recommendation.reference_price",
      symbol: snapshot?.ticker,
    },
    {
      value: snapshot?.quote_price,
      source: "provider_quote_price",
      readPath: "snapshot.quote_price",
      symbol: snapshot?.ticker,
    },
    {
      value: marketData?.reference_price,
      source: "snapshot_payload_price",
      readPath: "snapshot.market_data_snapshot.reference_price",
      symbol: snapshot?.ticker,
    },
    {
      value: marketData?.price,
      source: "snapshot_payload_price",
      readPath: "snapshot.market_data_snapshot.price",
      symbol: snapshot?.ticker,
    },
    {
      value: marketData?.latest_price,
      source: "latest_intraday_candle_close",
      readPath: "snapshot.market_data_snapshot.latest_price",
      symbol: snapshot?.ticker,
    },
    {
      value: marketData?.last_price,
      source: "fallback_last_price",
      readPath: "snapshot.market_data_snapshot.last_price",
      symbol: snapshot?.ticker,
    },
    {
      value: marketData?.lastPrice,
      source: "fallback_last_price",
      readPath: "snapshot.market_data_snapshot.lastPrice",
      symbol: snapshot?.ticker,
    },
    {
      value: marketData?.current_price,
      source: "current_price",
      readPath: "snapshot.market_data_snapshot.current_price",
      symbol: snapshot?.ticker,
    },
    {
      value: marketData?.close,
      source: "latest_intraday_candle_close",
      readPath: "snapshot.market_data_snapshot.close",
      symbol: snapshot?.ticker,
    },
    {
      value: payloadMarketData?.reference_price,
      source: "snapshot_payload_price",
      readPath: "snapshot.payload_json.market_data.reference_price",
      symbol: snapshot?.ticker,
    },
    {
      value: payloadMarketData?.price,
      source: "snapshot_payload_price",
      readPath: "snapshot.payload_json.market_data.price",
      symbol: snapshot?.ticker,
    },
    {
      value: payloadMarketData?.latest_price,
      source: "latest_intraday_candle_close",
      readPath: "snapshot.payload_json.market_data.latest_price",
      symbol: snapshot?.ticker,
    },
    {
      value: payloadMarketData?.last_price,
      source: "fallback_last_price",
      readPath: "snapshot.payload_json.market_data.last_price",
      symbol: snapshot?.ticker,
    },
    {
      value: payloadMarketData?.lastPrice,
      source: "fallback_last_price",
      readPath: "snapshot.payload_json.market_data.lastPrice",
      symbol: snapshot?.ticker,
    },
    {
      value: payloadMarketData?.current_price,
      source: "current_price",
      readPath: "snapshot.payload_json.market_data.current_price",
      symbol: snapshot?.ticker,
    },
    {
      value: payloadMarketData?.close,
      source: "latest_intraday_candle_close",
      readPath: "snapshot.payload_json.market_data.close",
      symbol: snapshot?.ticker,
    },
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
  const planReference = getNestedObject(payload, "plan_reference_price");

  return firstReferenceTimestamp([
    {
      value: payload?.reference_price_timestamp,
      source: "snapshot.payload_json.reference_price_timestamp",
    },
    {
      value: planReference?.reference_price_timestamp,
      source:
        "snapshot.payload_json.plan_reference_price.reference_price_timestamp",
    },
    {
      value: tradePlan?.reference_price_timestamp,
      source: "snapshot.payload_json.trade_plan.reference_price_timestamp",
    },
    {
      value: recommendation?.reference_price_timestamp,
      source:
        "snapshot.payload_json.recommendation.reference_price_timestamp",
    },
    { value: payload?.referencePriceTimestamp, source: "snapshot.payload_json.referencePriceTimestamp" },
    { value: payload?.quote_timestamp, source: "snapshot.payload_json.quote_timestamp" },
    { value: payload?.market_data_timestamp, source: "snapshot.payload_json.market_data_timestamp" },
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
  const payload = objectOrNull(snapshot?.payload_json);
  const computedMetadataDiagnostics = planReferenceMetadataDiagnostics({
    referencePrice: reference.value,
    entry,
    stop,
    target,
  });
  const metadataStatus =
    planReferenceMetadataStatusOrNull(
      payload?.plan_reference_metadata_status,
    ) ?? computedMetadataDiagnostics.plan_reference_metadata_status;
  const metadataMissingReason =
    textOrNull(payload?.plan_reference_metadata_missing_reason) ??
    computedMetadataDiagnostics.plan_reference_metadata_missing_reason;
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
    reference_price_symbol: reference.symbol,
    reference_price_provider: reference.provider,
    reference_price_read_path: reference.readPath,
    first_available_candle_close: first.close,
    first_available_candle_timestamp: first.timestamp,
    latest_provider_price_if_available: latestPrice,
    entry_distance_from_first_candle_close_pct: entryDistanceFromFirstCandle,
    stop_distance_from_first_candle_close_pct: distancePct(stop, first.close),
    target_distance_from_first_candle_close_pct: distancePct(target, first.close),
    entry_distance_from_reference_price_pct: distancePct(entry, reference.value),
    reference_to_first_candle_drift_pct: distancePct(reference.value, first.close),
    classification,
    plan_reference_metadata_status: metadataStatus,
    plan_reference_metadata_missing_reason: metadataMissingReason,
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
  const missingReferenceMetadataTickers: PlanPriceFreshnessSummaryTicker[] = [];
  let referenceMetadataPresentCount = 0;
  let referenceMetadataMissingButPlanPricesPresentCount = 0;
  let referenceMetadataMissingNoPlanPricesCount = 0;

  for (const item of diagnosticsItems) {
    const diagnostics = item.diagnostics;
    if (!diagnostics) continue;
    counts[diagnostics.classification] += 1;
    if (diagnostics.plan_reference_metadata_status === "present") {
      referenceMetadataPresentCount += 1;
    } else if (
      diagnostics.plan_reference_metadata_status ===
      "missing_but_plan_prices_present"
    ) {
      referenceMetadataMissingButPlanPricesPresentCount += 1;
    } else {
      referenceMetadataMissingNoPlanPricesCount += 1;
    }
    const source = diagnostics.reference_price_source ?? "unknown";
    referenceSourceCounts[source] = (referenceSourceCounts[source] ?? 0) + 1;
    if (diagnostics.plan_reference_metadata_status !== "present") {
      missingReferenceMetadataTickers.push({
        ticker: item.ticker ?? null,
        snapshot_fingerprint: item.snapshot_fingerprint ?? null,
        horizon: item.horizon ?? null,
        entry_distance_from_first_candle_close_pct:
          diagnostics.entry_distance_from_first_candle_close_pct,
        classification: diagnostics.classification,
        reference_price_source: diagnostics.reference_price_source,
        reference_price_used_for_plan: diagnostics.reference_price_used_for_plan,
        first_available_candle_close: diagnostics.first_available_candle_close,
        plan_reference_metadata_status:
          diagnostics.plan_reference_metadata_status,
        plan_reference_metadata_missing_reason:
          diagnostics.plan_reference_metadata_missing_reason,
      });
    }
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
        plan_reference_metadata_status:
          diagnostics.plan_reference_metadata_status,
        plan_reference_metadata_missing_reason:
          diagnostics.plan_reference_metadata_missing_reason,
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
    reference_metadata_present_count: referenceMetadataPresentCount,
    reference_metadata_missing_but_plan_prices_present_count:
      referenceMetadataMissingButPlanPricesPresentCount,
    reference_metadata_missing_no_plan_prices_count:
      referenceMetadataMissingNoPlanPricesCount,
    top_tickers_missing_reference_metadata: missingReferenceMetadataTickers.slice(
      0,
      10,
    ),
    warning: staleRatio > 0.3 ? stalePlanWarning : null,
  };
}

export function planPriceFreshnessWarningText() {
  return stalePlanWarning;
}
