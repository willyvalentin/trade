import "server-only";

import { getQuote } from "@/lib/market-data";
import type { ScannerCandidate } from "@/lib/scanner";
import { scannerUniverseTickers } from "@/lib/scanner-universe";

export type DynamicMoversDiscoveryProviderErrorType =
  | "none"
  | "disabled"
  | "missing_api_key"
  | "provider_error"
  | "empty_response"
  | "unknown";

export type DynamicMoversDiscoveryMover = {
  ticker: string;
  mover_source: string;
  mover_reason: string;
  price_change_pct: number | null;
  volume: number | null;
  relative_volume: number | null;
  gap_pct: number | null;
  volatility_proxy_pct: number | null;
  freshness_timestamp: string | null;
  stale: boolean;
  invalid: boolean;
  would_have_been_scanned_today: boolean;
  already_in_static_universe: boolean;
  would_pass_basic_structure_check: boolean;
  would_have_fresh_price: boolean;
  hypothetical_scan_priority_score: number | null;
};

export type DynamicMoversDiscoverySummary = {
  summary_version: "1.0";
  summary_kind: "dynamic_movers_discovery";
  generated_at: string;
  discovery_enabled: boolean;
  provider_attempted: "twelve_data" | null;
  provider_used: "twelve_data" | null;
  provider_error_type: DynamicMoversDiscoveryProviderErrorType;
  provider_error_message: string | null;
  returned_count: number;
  selected_preview_count: number;
  stale_invalid_mover_count: number;
  top_dynamic_movers: DynamicMoversDiscoveryMover[];
};

export type DynamicMoversDiscoveryInput = {
  candidates?: Array<Pick<ScannerCandidate, "ticker">>;
  maxTickers?: number | null;
  previewCount?: number | null;
  now?: Date;
};

const defaultMaxTickers = 25;
const defaultPreviewCount = 12;

export async function discoverDynamicMoversDiagnostics(
  input: DynamicMoversDiscoveryInput = {},
): Promise<DynamicMoversDiscoverySummary> {
  const now = input.now ?? new Date();
  const enabled = process.env.TURE_DYNAMIC_MOVERS_DISCOVERY_ENABLED === "true";

  if (!enabled) {
    return buildSummary({
      now,
      discoveryEnabled: false,
      providerAttempted: null,
      providerUsed: null,
      providerErrorType: "disabled",
      providerErrorMessage: null,
      returnedMovers: [],
      previewMovers: [],
    });
  }

  if (!process.env.TWELVE_DATA_API_KEY) {
    return buildSummary({
      now,
      discoveryEnabled: true,
      providerAttempted: "twelve_data",
      providerUsed: null,
      providerErrorType: "missing_api_key",
      providerErrorMessage: "TWELVE_DATA_API_KEY is not configured.",
      returnedMovers: [],
      previewMovers: [],
    });
  }

  const maxTickers = clampInteger(input.maxTickers, defaultMaxTickers, 1, 50);
  const previewCount = clampInteger(
    input.previewCount,
    defaultPreviewCount,
    1,
    25,
  );
  const selectedTickerSet = new Set(
    (input.candidates ?? []).map((candidate) => normalizeTicker(candidate.ticker)),
  );
  const symbols = Array.from(
    new Set(
      (input.candidates?.length ? input.candidates : scannerUniverseTickers)
        .map((candidate) => normalizeTicker(candidate.ticker))
        .filter((ticker): ticker is string => ticker !== null),
    ),
  ).slice(0, maxTickers);

  const results = await Promise.all(
    symbols.map(async (ticker) => {
      try {
        const quote = await getQuote(ticker);
        const gapPct = distancePct(quote.open, quote.previous_close);
        const volatilityProxyPct = distancePct(quote.high, quote.low, quote.open);
        const invalid =
          quote.current_price <= 0 ||
          quote.open <= 0 ||
          quote.previous_close <= 0 ||
          quote.high < quote.low;
        const score = invalid
          ? null
          : priorityScore({
              priceChangePct: quote.percent_change,
              gapPct,
              volatilityProxyPct,
              volume: quote.volume,
            });

        return {
          ticker,
          mover_source: moverSource(quote.percent_change, quote.volume),
          mover_reason: moverReason({ quote, gapPct, volatilityProxyPct }),
          price_change_pct: round(quote.percent_change),
          volume: quote.volume,
          relative_volume: null,
          gap_pct: gapPct,
          volatility_proxy_pct: volatilityProxyPct,
          freshness_timestamp: now.toISOString(),
          stale: false,
          invalid,
          would_have_been_scanned_today: selectedTickerSet.has(ticker),
          already_in_static_universe: staticUniverseTickerSet.has(ticker),
          would_pass_basic_structure_check:
            !invalid &&
            Math.abs(quote.percent_change) >= 0.5 &&
            quote.current_price > 0,
          would_have_fresh_price: !invalid,
          hypothetical_scan_priority_score: score,
        } satisfies DynamicMoversDiscoveryMover;
      } catch {
        return {
          ticker,
          mover_source: "provider_error",
          mover_reason: "Provider quote unavailable.",
          price_change_pct: null,
          volume: null,
          relative_volume: null,
          gap_pct: null,
          volatility_proxy_pct: null,
          freshness_timestamp: now.toISOString(),
          stale: false,
          invalid: true,
          would_have_been_scanned_today: selectedTickerSet.has(ticker),
          already_in_static_universe: staticUniverseTickerSet.has(ticker),
          would_pass_basic_structure_check: false,
          would_have_fresh_price: false,
          hypothetical_scan_priority_score: null,
        } satisfies DynamicMoversDiscoveryMover;
      }
    }),
  );
  const validMovers = results.filter((mover) => !mover.invalid);
  const previewMovers = [...validMovers]
    .sort(
      (first, second) =>
        (second.hypothetical_scan_priority_score ?? 0) -
        (first.hypothetical_scan_priority_score ?? 0),
    )
    .slice(0, previewCount);
  const providerErrorType =
    results.length === 0
      ? "empty_response"
      : validMovers.length === 0
        ? "provider_error"
        : "none";

  return buildSummary({
    now,
    discoveryEnabled: true,
    providerAttempted: "twelve_data",
    providerUsed: validMovers.length > 0 ? "twelve_data" : null,
    providerErrorType,
    providerErrorMessage:
      providerErrorType === "provider_error"
        ? "No valid dynamic mover quotes were returned."
        : null,
    returnedMovers: results,
    previewMovers,
  });
}

const staticUniverseTickerSet = new Set(
  scannerUniverseTickers.map((item) => item.ticker),
);

function buildSummary({
  now,
  discoveryEnabled,
  providerAttempted,
  providerUsed,
  providerErrorType,
  providerErrorMessage,
  returnedMovers,
  previewMovers,
}: {
  now: Date;
  discoveryEnabled: boolean;
  providerAttempted: "twelve_data" | null;
  providerUsed: "twelve_data" | null;
  providerErrorType: DynamicMoversDiscoveryProviderErrorType;
  providerErrorMessage: string | null;
  returnedMovers: DynamicMoversDiscoveryMover[];
  previewMovers: DynamicMoversDiscoveryMover[];
}): DynamicMoversDiscoverySummary {
  return {
    summary_version: "1.0",
    summary_kind: "dynamic_movers_discovery",
    generated_at: now.toISOString(),
    discovery_enabled: discoveryEnabled,
    provider_attempted: providerAttempted,
    provider_used: providerUsed,
    provider_error_type: providerErrorType,
    provider_error_message: providerErrorMessage,
    returned_count: returnedMovers.length,
    selected_preview_count: previewMovers.length,
    stale_invalid_mover_count: returnedMovers.filter(
      (mover) => mover.stale || mover.invalid,
    ).length,
    top_dynamic_movers: previewMovers,
  };
}

function normalizeTicker(value: string | null | undefined) {
  if (typeof value !== "string") return null;
  const ticker = value.trim().toUpperCase();
  return ticker.length > 0 ? ticker : null;
}

function clampInteger(
  value: number | null | undefined,
  fallback: number,
  min: number,
  max: number,
) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return fallback;
  }

  return Math.min(max, Math.max(min, Math.round(value)));
}

function round(value: number | null) {
  return value === null ? null : Math.round(value * 1000) / 1000;
}

function distancePct(
  first: number | null,
  second: number | null,
  denominator = second,
) {
  if (
    first === null ||
    second === null ||
    denominator === null ||
    denominator === 0
  ) {
    return null;
  }

  return round(((first - second) / Math.abs(denominator)) * 100);
}

function moverSource(priceChangePct: number, volume: number | null) {
  if (volume !== null && volume >= 5_000_000) return "top_volume";
  if (priceChangePct >= 2) return "intraday_gainer";
  if (priceChangePct <= -2) return "intraday_loser";
  return "intraday_movement";
}

function moverReason({
  quote,
  gapPct,
  volatilityProxyPct,
}: {
  quote: {
    percent_change: number;
    volume: number | null;
  };
  gapPct: number | null;
  volatilityProxyPct: number | null;
}) {
  const reasons = [
    Math.abs(quote.percent_change) >= 2
      ? `${quote.percent_change >= 0 ? "gainer" : "loser"} ${round(quote.percent_change)}%`
      : null,
    gapPct !== null && Math.abs(gapPct) >= 1
      ? `gap ${round(gapPct)}%`
      : null,
    volatilityProxyPct !== null && Math.abs(volatilityProxyPct) >= 2
      ? `range ${round(volatilityProxyPct)}%`
      : null,
    quote.volume !== null && quote.volume >= 5_000_000
      ? `volume ${Math.round(quote.volume)}`
      : null,
  ].filter((reason): reason is string => reason !== null);

  return reasons.length > 0 ? reasons.join("; ") : "Quote movement observed.";
}

function priorityScore({
  priceChangePct,
  gapPct,
  volatilityProxyPct,
  volume,
}: {
  priceChangePct: number;
  gapPct: number | null;
  volatilityProxyPct: number | null;
  volume: number | null;
}) {
  const volumeBonus =
    volume === null ? 0 : Math.min(20, Math.log10(Math.max(1, volume)) * 2);
  const score =
    Math.abs(priceChangePct) * 8 +
    Math.abs(gapPct ?? 0) * 5 +
    Math.abs(volatilityProxyPct ?? 0) * 4 +
    volumeBonus;

  return round(Math.min(100, score));
}
