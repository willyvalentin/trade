import type { DynamicMarketMoversSummary } from "@/lib/dynamic-market-movers";
import type {
  DynamicMoversDiscoveryMover,
  DynamicMoversDiscoverySummary,
} from "@/lib/dynamic-movers-discovery";
import type { TickerUniverseReadinessSummary } from "@/lib/ticker-universe-readiness";

export type DynamicMoversReadinessConfidence = "low" | "medium" | "high";

export type DynamicMoversReadinessMover = Partial<DynamicMoversDiscoveryMover> & {
  ticker?: string | null;
  source?: string | null;
  as_of?: string | null;
  fetched_at?: string | null;
  price?: number | null;
  last_price?: number | null;
  percent_change?: number | null;
  change_percent?: number | null;
  volume?: number | null;
  relative_volume?: number | null;
  market_session?: string | null;
  provider?: string | null;
  premarket_change_percent?: number | null;
  catalyst_headline?: string | null;
  news_source?: string | null;
};

export type DynamicMoversReadinessInput = {
  dynamic_movers?: DynamicMarketMoversSummary | null;
  dynamic_movers_discovery?: DynamicMoversDiscoverySummary | null;
  ticker_universe_readiness?: TickerUniverseReadinessSummary | null;
  static_universe_count?: number | null;
  static_universe_symbols?: string[] | null;
  visible_tickers?: string[] | null;
  movers?: DynamicMoversReadinessMover[] | null;
};

export type DynamicMoversReadinessSummary = {
  advisory_only: true;
  provider_status: {
    enabled: boolean;
    available: boolean;
    attempted: boolean;
    provider_used: string | null;
    provider_error_type: string | null;
    returned_count: number;
    selected_preview_count: number;
    stale_or_invalid_count: number;
  };
  expected_mover_shape: {
    required_fields: string[];
    optional_fields: string[];
    supported_sort_keys: string[];
  };
  current_gap_analysis: {
    missing_provider: boolean;
    missing_symbols: boolean;
    missing_price_change: boolean;
    missing_volume_signal: boolean;
    missing_relative_volume: boolean;
    missing_premarket_signal: boolean;
    missing_news_or_catalyst: boolean;
    missing_timestamp: boolean;
    missing_provider_source: boolean;
  };
  static_universe_comparison: {
    static_universe_count: number | null;
    observed_ticker_count: number;
    research_heavy_tickers: string[];
    visible_tickers: string[];
    dynamic_gap_candidates: string[];
    overlap_with_static_universe: string[];
    outside_static_universe_candidates: string[];
  };
  readiness: {
    intake_ready: boolean;
    safe_to_use_for_scanner: false;
    safe_to_preview: boolean;
    safe_to_shadow_compare: boolean;
    safe_to_change_universe: false;
    sample_confidence: DynamicMoversReadinessConfidence;
  };
  recommended_next_steps: string[];
  safety: {
    advisory_only: true;
    scanner_universe_changed: false;
    live_ranking_changed: false;
    provider_fetch_added: false;
    requires_manual_review: true;
  };
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

const requiredFields = [
  "ticker",
  "source",
  "as_of",
  "price_or_last_price",
  "percent_change_or_change_percent",
  "volume_or_relative_volume",
  "market_session",
];

const optionalFields = [
  "premarket_change_percent",
  "gap_percent",
  "relative_volume",
  "catalyst_headline",
  "news_source",
  "sector",
  "industry",
  "float",
  "market_cap",
  "liquidity_score",
  "spread_estimate",
  "volatility_score",
  "reason_codes",
];

const supportedSortKeys = [
  "percent_change",
  "relative_volume",
  "volume",
  "gap_percent",
  "volatility_score",
  "liquidity_score",
];

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 ? ticker : null;
}

function uniqueTickers(values: Array<string | null | undefined>) {
  return Array.from(
    new Set(
      values
        .map((value) => normalizeTicker(value))
        .filter((value): value is string => value !== null),
    ),
  ).sort();
}

function finiteCount(value: number | null | undefined) {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function inputMovers(input: DynamicMoversReadinessInput) {
  if (input.movers && input.movers.length > 0) return input.movers;
  return input.dynamic_movers_discovery?.top_dynamic_movers ?? [];
}

function moverTicker(mover: DynamicMoversReadinessMover) {
  return normalizeTicker(mover.ticker ?? null);
}

function moverHasSource(mover: DynamicMoversReadinessMover) {
  return Boolean(
    text(mover.source) ||
      text(mover.mover_source) ||
      text(mover.provider) ||
      text(mover.news_source),
  );
}

function moverHasTimestamp(mover: DynamicMoversReadinessMover) {
  return Boolean(
    text(mover.as_of) ||
      text(mover.fetched_at) ||
      text(mover.freshness_timestamp),
  );
}

function moverHasPrice(mover: DynamicMoversReadinessMover) {
  return Boolean(
    finiteNumber(mover.price) ?? finiteNumber(mover.last_price),
  );
}

function moverHasChange(mover: DynamicMoversReadinessMover) {
  return Boolean(
    finiteNumber(mover.percent_change) ??
      finiteNumber(mover.change_percent) ??
      finiteNumber(mover.price_change_pct),
  );
}

function moverHasVolume(mover: DynamicMoversReadinessMover) {
  return Boolean(
    finiteNumber(mover.volume) ?? finiteNumber(mover.relative_volume),
  );
}

function moverHasMarketSession(mover: DynamicMoversReadinessMover) {
  return Boolean(text(mover.market_session));
}

function moverHasPremarket(mover: DynamicMoversReadinessMover) {
  return (
    finiteNumber((mover as Record<string, unknown>).premarket_change_percent) !==
      null || finiteNumber(mover.gap_pct) !== null
  );
}

function moverHasCatalyst(mover: DynamicMoversReadinessMover) {
  return Boolean(
    text((mover as Record<string, unknown>).catalyst_headline) ||
      text((mover as Record<string, unknown>).news_source) ||
      text(mover.mover_reason),
  );
}

function missingRequiredFieldGaps(movers: DynamicMoversReadinessMover[]) {
  const gaps: string[] = [];

  if (movers.length === 0) return gaps;
  if (movers.some((mover) => !moverTicker(mover))) pushUnique(gaps, "missing_ticker");
  if (movers.some((mover) => !moverHasSource(mover))) pushUnique(gaps, "missing_source");
  if (movers.some((mover) => !moverHasTimestamp(mover))) pushUnique(gaps, "missing_as_of");
  if (movers.some((mover) => !moverHasPrice(mover))) {
    pushUnique(gaps, "missing_price_or_last_price");
  }
  if (movers.some((mover) => !moverHasChange(mover))) {
    pushUnique(gaps, "missing_percent_change_or_change_percent");
  }
  if (movers.some((mover) => !moverHasVolume(mover))) {
    pushUnique(gaps, "missing_volume_or_relative_volume");
  }
  if (movers.some((mover) => !moverHasMarketSession(mover))) {
    pushUnique(gaps, "missing_market_session");
  }

  return gaps;
}

function providerEnabled(input: DynamicMoversReadinessInput) {
  if (input.dynamic_movers_discovery) {
    return input.dynamic_movers_discovery.discovery_enabled;
  }
  if (input.dynamic_movers) {
    return input.dynamic_movers.status !== "disabled";
  }
  return false;
}

function providerAvailable(input: DynamicMoversReadinessInput) {
  if (input.dynamic_movers?.status === "available") return true;
  if (input.dynamic_movers?.status === "partial") return true;
  if (
    input.dynamic_movers_discovery?.provider_error_type === "none" &&
    input.dynamic_movers_discovery.returned_count > 0
  ) {
    return true;
  }
  return input.movers !== null && input.movers !== undefined && input.movers.length > 0;
}

function providerAttempted(input: DynamicMoversReadinessInput) {
  return Boolean(
    input.dynamic_movers_discovery?.provider_attempted ||
      input.dynamic_movers?.source === "provider_adapter",
  );
}

function providerUsed(input: DynamicMoversReadinessInput) {
  return (
    input.dynamic_movers_discovery?.provider_used ??
    input.dynamic_movers?.provider ??
    null
  );
}

function providerErrorType(input: DynamicMoversReadinessInput) {
  if (input.dynamic_movers_discovery) {
    return input.dynamic_movers_discovery.provider_error_type === "none"
      ? null
      : input.dynamic_movers_discovery.provider_error_type;
  }
  if (!input.dynamic_movers) return "dynamic_movers_provider_unavailable";
  if (
    input.dynamic_movers.status === "provider_unavailable" ||
    input.dynamic_movers.status === "disabled" ||
    input.dynamic_movers.status === "empty" ||
    input.dynamic_movers.status === "stale" ||
    input.dynamic_movers.status === "unknown"
  ) {
    return input.dynamic_movers.status;
  }
  return null;
}

function currentGaps(input: {
  movers: DynamicMoversReadinessMover[];
  available: boolean;
  providerUsed: string | null;
}) {
  const movers = input.movers;

  return {
    missing_provider: !input.available || input.providerUsed === null,
    missing_symbols: movers.length === 0 || movers.some((mover) => !moverTicker(mover)),
    missing_price_change:
      movers.length === 0 || movers.some((mover) => !moverHasChange(mover)),
    missing_volume_signal:
      movers.length === 0 || movers.some((mover) => !moverHasVolume(mover)),
    missing_relative_volume:
      movers.length === 0 ||
      movers.some((mover) => finiteNumber(mover.relative_volume) === null),
    missing_premarket_signal:
      movers.length === 0 || movers.some((mover) => !moverHasPremarket(mover)),
    missing_news_or_catalyst:
      movers.length === 0 || movers.some((mover) => !moverHasCatalyst(mover)),
    missing_timestamp:
      movers.length === 0 || movers.some((mover) => !moverHasTimestamp(mover)),
    missing_provider_source:
      movers.length === 0 || movers.some((mover) => !moverHasSource(mover)),
  };
}

function confidenceFor(count: number): DynamicMoversReadinessConfidence {
  if (count >= 100) return "high";
  if (count >= 30) return "medium";
  return "low";
}

function staticUniverseComparison(input: {
  readiness: TickerUniverseReadinessSummary | null;
  staticUniverseCount: number | null;
  staticUniverseSymbols: string[];
  visibleTickers: string[];
  moverTickers: string[];
}) {
  const researchHeavy =
    input.readiness?.ticker_classification.research_heavy_candidates ?? [];
  const dynamicGaps =
    input.readiness?.ticker_classification.dynamic_mover_gap_candidates ?? [];
  const fallbackCandidates = uniqueTickers([...researchHeavy, ...dynamicGaps]);
  const comparisonCandidates =
    input.moverTickers.length > 0 ? input.moverTickers : fallbackCandidates;
  const staticSet = new Set(input.staticUniverseSymbols);

  return {
    static_universe_count: input.staticUniverseCount,
    observed_ticker_count:
      input.readiness?.universe_status.observed_today_count ?? 0,
    research_heavy_tickers: researchHeavy,
    visible_tickers: input.visibleTickers,
    dynamic_gap_candidates: dynamicGaps.length > 0 ? dynamicGaps : fallbackCandidates,
    overlap_with_static_universe: comparisonCandidates.filter((ticker) =>
      staticSet.has(ticker),
    ),
    outside_static_universe_candidates: comparisonCandidates.filter(
      (ticker) => !staticSet.has(ticker),
    ),
  };
}

function readinessFlags(input: {
  available: boolean;
  movers: DynamicMoversReadinessMover[];
  requiredGaps: string[];
}) {
  const safeToPreview =
    input.available &&
    input.movers.length > 0 &&
    input.movers.every(
      (mover) =>
        moverTicker(mover) !== null &&
        moverHasTimestamp(mover) &&
        moverHasSource(mover),
    );
  const safeToShadowCompare =
    safeToPreview &&
    input.movers.every(
      (mover) => moverHasPrice(mover) && moverHasChange(mover) && moverHasVolume(mover),
    );

  return {
    intakeReady: input.available && input.requiredGaps.length === 0,
    safeToPreview,
    safeToShadowCompare,
  };
}

function nextSteps(input: {
  available: boolean;
  requiredGaps: string[];
  safeToPreview: boolean;
  safeToShadowCompare: boolean;
}) {
  const steps: string[] = [];

  if (!input.available) {
    steps.push("connect_dynamic_movers_provider");
  }
  if (input.requiredGaps.length > 0) {
    steps.push("map_required_mover_fields");
  }
  if (!input.safeToPreview && input.available) {
    steps.push("validate_preview_payload_before_ui_display");
  }
  if (!input.safeToShadowCompare && input.safeToPreview) {
    steps.push("add_shadow_compare_required_volume_and_change_fields");
  }
  steps.push("manual_review_before_scanner_universe_change");

  return Array.from(new Set(steps));
}

function metadataGaps(input: {
  requiredGaps: string[];
  gaps: ReturnType<typeof currentGaps>;
  available: boolean;
}) {
  const gaps = [...input.requiredGaps];
  if (!input.available) pushUnique(gaps, "missing_provider");
  for (const [key, value] of Object.entries(input.gaps)) {
    if (value) pushUnique(gaps, key);
  }
  return gaps;
}

export function buildDynamicMoversReadiness(
  input: DynamicMoversReadinessInput = {},
): DynamicMoversReadinessSummary {
  const movers = inputMovers(input);
  const enabled = providerEnabled(input);
  const available = providerAvailable(input);
  const attempted = providerAttempted(input);
  const used = providerUsed(input);
  const moverTickers = uniqueTickers(movers.map((mover) => moverTicker(mover)));
  const staticUniverseSymbols = uniqueTickers(input.static_universe_symbols ?? []);
  const visibleTickers = uniqueTickers(
    input.visible_tickers ??
      input.ticker_universe_readiness?.ticker_classification.core_candidates ??
      [],
  );
  const returnedCount =
    input.dynamic_movers_discovery?.returned_count ??
    input.dynamic_movers?.fetched_count ??
    movers.length;
  const selectedPreviewCount =
    input.dynamic_movers_discovery?.selected_preview_count ??
    input.dynamic_movers?.selected_count ??
    movers.length;
  const staleInvalidCount =
    input.dynamic_movers_discovery?.stale_invalid_mover_count ??
    ((input.dynamic_movers?.stale_count ?? 0) +
      (input.dynamic_movers?.unknown_source_count ?? 0));
  const gapAnalysis = currentGaps({
    movers,
    available,
    providerUsed: used,
  });
  const requiredGaps = missingRequiredFieldGaps(movers);
  const flags = readinessFlags({ available, movers, requiredGaps });
  const gaps = metadataGaps({ requiredGaps, gaps: gapAnalysis, available });
  const reasonCodes: string[] = [];
  const cautionFlags: string[] = [];

  if (!available) {
    reasonCodes.push("provider_unavailable");
    cautionFlags.push("dynamic_movers_not_ready_for_intake");
  }
  if (requiredGaps.length > 0) {
    reasonCodes.push("required_fields_missing");
  }
  if (!flags.safeToShadowCompare) {
    cautionFlags.push("not_safe_for_shadow_compare");
  }

  return {
    advisory_only: true,
    provider_status: {
      enabled,
      available,
      attempted,
      provider_used: used,
      provider_error_type: providerErrorType(input),
      returned_count: finiteCount(returnedCount),
      selected_preview_count: finiteCount(selectedPreviewCount),
      stale_or_invalid_count: finiteCount(staleInvalidCount),
    },
    expected_mover_shape: {
      required_fields: requiredFields,
      optional_fields: optionalFields,
      supported_sort_keys: supportedSortKeys,
    },
    current_gap_analysis: gapAnalysis,
    static_universe_comparison: staticUniverseComparison({
      readiness: input.ticker_universe_readiness ?? null,
      staticUniverseCount:
        typeof input.static_universe_count === "number" &&
        Number.isFinite(input.static_universe_count)
          ? Math.max(0, Math.round(input.static_universe_count))
          : input.ticker_universe_readiness?.universe_status
              .configured_static_universe_count ?? null,
      staticUniverseSymbols,
      visibleTickers,
      moverTickers,
    }),
    readiness: {
      intake_ready: flags.intakeReady,
      safe_to_preview: flags.safeToPreview,
      safe_to_shadow_compare: flags.safeToShadowCompare,
      safe_to_use_for_scanner: false,
      safe_to_change_universe: false,
      sample_confidence: confidenceFor(finiteCount(returnedCount)),
    },
    recommended_next_steps: nextSteps({
      available,
      requiredGaps,
      safeToPreview: flags.safeToPreview,
      safeToShadowCompare: flags.safeToShadowCompare,
    }),
    safety: {
      advisory_only: true,
      scanner_universe_changed: false,
      live_ranking_changed: false,
      provider_fetch_added: false,
      requires_manual_review: true,
    },
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: gaps,
  };
}

export function dynamicMoversReadinessSummaryJson(
  summary: DynamicMoversReadinessSummary,
) {
  return JSON.stringify(summary, null, 2);
}
