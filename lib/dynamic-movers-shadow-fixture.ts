import type { TickerUniverseReadinessSummary } from "@/lib/ticker-universe-readiness";

export type DynamicMoverContractStatus =
  | "valid"
  | "preview_only"
  | "invalid"
  | "stale"
  | "missing_required_fields";

export type DynamicMoverContractReadinessLabel =
  | "not_ready"
  | "contract_ready"
  | "preview_ready"
  | "shadow_compare_ready";

export type DynamicMoverContractMover = {
  ticker?: string | null;
  source?: string | null;
  as_of?: string | null;
  price?: number | null;
  last_price?: number | null;
  percent_change?: number | null;
  change_percent?: number | null;
  volume?: number | null;
  relative_volume?: number | null;
  market_session?: string | null;
  premarket_change_percent?: number | null;
  gap_percent?: number | null;
  catalyst_headline?: string | null;
  news_source?: string | null;
  sector?: string | null;
  industry?: string | null;
  float?: number | null;
  market_cap?: number | null;
  liquidity_score?: number | null;
  spread_estimate?: number | null;
  volatility_score?: number | null;
  reason_codes?: string[] | null;
};

export type DynamicMoverContractValidation = {
  ticker: string | null;
  status: DynamicMoverContractStatus;
  safe_to_preview: boolean;
  safe_to_shadow_compare: boolean;
  stale: boolean;
  age_minutes: number | null;
  missing_required_fields: string[];
  reason_codes: string[];
  metadata_gaps: string[];
};

export type DynamicMoversShadowAuditInput = {
  movers?: DynamicMoverContractMover[] | null;
  static_universe_count?: number | null;
  static_universe_symbols?: string[] | null;
  research_heavy_tickers?: string[] | null;
  visible_tickers?: string[] | null;
  observed_tickers?: string[] | null;
  ticker_universe_readiness?: TickerUniverseReadinessSummary | null;
  now?: Date | string | null;
};

export type DynamicMoversShadowAuditSummary = {
  advisory_only: true;
  mock_mode: true;
  provider_fetch_added: false;
  fixture_summary: {
    total_movers: number;
    valid_movers: number;
    preview_only_movers: number;
    invalid_movers: number;
    stale_movers: number;
    missing_required_field_count: number;
  };
  contract_validation: {
    required_fields: string[];
    optional_fields: string[];
    missing_field_counts: Record<string, number>;
    invalid_examples: Array<{
      ticker: string | null;
      status: DynamicMoverContractStatus;
      missing_required_fields: string[];
      reason_codes: string[];
    }>;
    stale_examples: Array<{
      ticker: string | null;
      as_of: string | null;
      age_minutes: number | null;
    }>;
  };
  static_universe_comparison: {
    static_universe_count: number | null;
    movers_inside_static_universe: string[];
    movers_outside_static_universe: string[];
    overlap_with_research_heavy: string[];
    overlap_with_visible: string[];
    overlap_with_observed: string[];
  };
  shadow_readiness: {
    safe_to_preview: boolean;
    safe_to_shadow_compare: boolean;
    safe_to_use_for_scanner: false;
    safe_to_change_universe: false;
    readiness_label: DynamicMoverContractReadinessLabel;
  };
  recommended_next_steps: string[];
  safety: {
    advisory_only: true;
    mock_only: true;
    provider_fetch_added: false;
    scanner_universe_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

const staleAfterMinutes = 60;

export const dynamicMoverContractRequiredFields = [
  "ticker",
  "source",
  "as_of",
  "price_or_last_price",
  "percent_change_or_change_percent",
  "volume_or_relative_volume",
  "market_session",
];

export const dynamicMoverContractOptionalFields = [
  "premarket_change_percent",
  "gap_percent",
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

function text(value: unknown) {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) return value;
  if (typeof value === "string") {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }
  return null;
}

function minutesAgo(now: Date, minutes: number) {
  return new Date(now.getTime() - minutes * 60_000).toISOString();
}

function ageMinutes(asOf: string | null | undefined, now: Date) {
  const date = toDate(asOf ?? null);
  if (!date) return null;
  return Math.max(0, (now.getTime() - date.getTime()) / 60_000);
}

function hasPrice(mover: DynamicMoverContractMover) {
  return finiteNumber(mover.price) !== null || finiteNumber(mover.last_price) !== null;
}

function hasChange(mover: DynamicMoverContractMover) {
  return (
    finiteNumber(mover.percent_change) !== null ||
    finiteNumber(mover.change_percent) !== null
  );
}

function hasVolume(mover: DynamicMoverContractMover) {
  return (
    finiteNumber(mover.volume) !== null ||
    finiteNumber(mover.relative_volume) !== null
  );
}

function missingRequiredFields(mover: DynamicMoverContractMover) {
  const missing: string[] = [];

  if (!normalizeTicker(mover.ticker ?? null)) missing.push("ticker");
  if (!text(mover.source)) missing.push("source");
  if (!text(mover.as_of)) missing.push("as_of");
  if (!hasPrice(mover)) missing.push("price_or_last_price");
  if (!hasChange(mover)) missing.push("percent_change_or_change_percent");
  if (!hasVolume(mover)) missing.push("volume_or_relative_volume");
  if (!text(mover.market_session)) missing.push("market_session");

  return missing;
}

function increment(record: Record<string, number>, key: string) {
  record[key] = (record[key] ?? 0) + 1;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

export function buildMockDynamicMoversFixture(input: {
  now?: Date | string | null;
} = {}): DynamicMoverContractMover[] {
  const now = toDate(input.now ?? null) ?? new Date();

  return [
    {
      ticker: "PLTR",
      source: "top_gainer",
      as_of: minutesAgo(now, 5),
      price: 146.2,
      percent_change: 4.8,
      volume: 52_000_000,
      relative_volume: 2.6,
      market_session: "regular",
      premarket_change_percent: 1.4,
      gap_percent: 1.1,
      sector: "technology",
      industry: "data_analytics_ai",
      catalyst_headline: "AI software momentum and unusual volume",
      news_source: "mock_fixture",
      liquidity_score: 92,
      spread_estimate: 0.04,
      volatility_score: 78,
      reason_codes: ["research_heavy_overlap", "mock_valid"],
    },
    {
      ticker: "AAPL",
      source: "relative_volume",
      as_of: minutesAgo(now, 4),
      last_price: 214.4,
      change_percent: 1.2,
      volume: 38_000_000,
      relative_volume: 1.7,
      market_session: "regular",
      sector: "technology",
      industry: "consumer_electronics",
      catalyst_headline: "Static universe visible overlap example",
      news_source: "mock_fixture",
      liquidity_score: 98,
      spread_estimate: 0.01,
      volatility_score: 34,
      reason_codes: ["visible_static_overlap", "mock_valid"],
    },
    {
      ticker: "NEWM",
      source: "top_volume",
      as_of: minutesAgo(now, 8),
      price: 18.35,
      percent_change: 7.1,
      volume: 11_500_000,
      relative_volume: 4.4,
      market_session: "regular",
      premarket_change_percent: 2.2,
      gap_percent: 3.4,
      sector: "technology",
      industry: "unknown",
      catalyst_headline: "Outside static universe mock mover",
      news_source: "mock_fixture",
      volatility_score: 85,
      reason_codes: ["outside_static_universe", "mock_valid"],
    },
    {
      ticker: "SMCI",
      source: "high_volatility",
      as_of: minutesAgo(now, 7),
      volume: 8_000_000,
      relative_volume: 2.1,
      market_session: "regular",
      sector: "technology",
      industry: "ai_infrastructure",
      catalyst_headline: "Missing price and change example",
      news_source: "mock_fixture",
      reason_codes: ["missing_price_change_fixture"],
    },
    {
      ticker: "NKE",
      source: "top_gainer",
      as_of: minutesAgo(now, 6),
      price: 76.8,
      percent_change: 2.7,
      market_session: "regular",
      sector: "consumer_discretionary",
      industry: "apparel",
      catalyst_headline: "Missing volume example",
      news_source: "mock_fixture",
      reason_codes: ["missing_volume_fixture"],
    },
    {
      ticker: "COIN",
      source: "intraday_momentum",
      as_of: minutesAgo(now, 180),
      price: 356.4,
      percent_change: 3.3,
      volume: 7_400_000,
      relative_volume: 1.9,
      market_session: "regular",
      sector: "crypto_linked",
      industry: "crypto_exchange",
      catalyst_headline: "Stale timestamp example",
      news_source: "mock_fixture",
      reason_codes: ["stale_fixture"],
    },
    {
      price: 12.4,
      percent_change: 5.9,
      volume: 2_200_000,
      relative_volume: 3.2,
      market_session: "regular",
      sector: "unknown",
      industry: "unknown",
      catalyst_headline: "Missing ticker/source/as_of example",
      news_source: "mock_fixture",
      reason_codes: ["missing_identity_fixture"],
    },
  ];
}

export function validateDynamicMoverContract(
  mover: DynamicMoverContractMover,
  input: { now?: Date | string | null } = {},
): DynamicMoverContractValidation {
  const now = toDate(input.now ?? null) ?? new Date();
  const missing = missingRequiredFields(mover);
  const identityMissing = missing.some((field) =>
    field === "ticker" || field === "source" || field === "as_of",
  );
  const age = ageMinutes(mover.as_of ?? null, now);
  const stale = age !== null && age > staleAfterMinutes;
  const safeToPreview = !identityMissing && !stale;
  const safeToShadowCompare =
    safeToPreview &&
    hasPrice(mover) &&
    hasChange(mover) &&
    hasVolume(mover) &&
    text(mover.market_session) !== null;
  const reasonCodes: string[] = [];
  const metadataGaps = [...missing];
  let status: DynamicMoverContractStatus = "valid";

  if (identityMissing) {
    status = "missing_required_fields";
    reasonCodes.push("missing_identity_or_timestamp");
  } else if (stale) {
    status = "stale";
    reasonCodes.push("stale_timestamp");
  } else if (missing.length > 0) {
    status = "preview_only";
    reasonCodes.push("preview_only_missing_shadow_fields");
  }

  if (missing.length > 0) {
    reasonCodes.push("required_fields_missing");
  }
  if (status === "valid") {
    reasonCodes.push("contract_valid");
  }

  return {
    ticker: normalizeTicker(mover.ticker ?? null),
    status,
    safe_to_preview: safeToPreview,
    safe_to_shadow_compare: safeToShadowCompare,
    stale,
    age_minutes: age,
    missing_required_fields: missing,
    reason_codes: reasonCodes,
    metadata_gaps: metadataGaps,
  };
}

function comparison(input: {
  movers: DynamicMoverContractMover[];
  staticUniverseCount: number | null;
  staticUniverseSymbols: string[];
  researchHeavyTickers: string[];
  visibleTickers: string[];
  observedTickers: string[];
}) {
  const moverTickers = uniqueTickers(input.movers.map((mover) => mover.ticker));
  const staticSet = new Set(input.staticUniverseSymbols);
  const researchSet = new Set(input.researchHeavyTickers);
  const visibleSet = new Set(input.visibleTickers);
  const observedSet = new Set(input.observedTickers);

  return {
    static_universe_count: input.staticUniverseCount,
    movers_inside_static_universe: moverTickers.filter((ticker) =>
      staticSet.has(ticker),
    ),
    movers_outside_static_universe: moverTickers.filter(
      (ticker) => !staticSet.has(ticker),
    ),
    overlap_with_research_heavy: moverTickers.filter((ticker) =>
      researchSet.has(ticker),
    ),
    overlap_with_visible: moverTickers.filter((ticker) => visibleSet.has(ticker)),
    overlap_with_observed: moverTickers.filter((ticker) =>
      observedSet.has(ticker),
    ),
  };
}

function readinessLabel(input: {
  safeToPreview: boolean;
  safeToShadowCompare: boolean;
  totalMovers: number;
}) {
  if (input.safeToShadowCompare) return "shadow_compare_ready";
  if (input.safeToPreview) return "preview_ready";
  if (input.totalMovers > 0) return "contract_ready";
  return "not_ready";
}

export function buildDynamicMoversShadowAudit(
  input: DynamicMoversShadowAuditInput = {},
): DynamicMoversShadowAuditSummary {
  const now = toDate(input.now ?? null) ?? new Date();
  const movers = input.movers ?? buildMockDynamicMoversFixture({ now });
  const validations = movers.map((mover) =>
    validateDynamicMoverContract(mover, { now }),
  );
  const missingFieldCounts: Record<string, number> = {};
  const metadataGaps: string[] = [];
  const reasonCodes: string[] = [];
  const cautionFlags: string[] = [];

  for (const validation of validations) {
    for (const field of validation.missing_required_fields) {
      increment(missingFieldCounts, field);
      pushUnique(metadataGaps, field);
    }
    for (const reason of validation.reason_codes) {
      pushUnique(reasonCodes, reason);
    }
  }

  const validMovers = validations.filter((item) => item.status === "valid");
  const previewOnlyMovers = validations.filter(
    (item) => item.status === "preview_only",
  );
  const staleMovers = validations.filter((item) => item.stale);
  const invalidMovers = validations.filter(
    (item) =>
      item.status === "invalid" || item.status === "missing_required_fields",
  );
  const missingRequiredFieldCount = validations.filter(
    (item) => item.missing_required_fields.length > 0,
  ).length;
  const safeToPreview = validMovers.length > 0;
  const safeToShadowCompare = validMovers.some(
    (item) => item.safe_to_shadow_compare,
  );
  const tickerReadiness = input.ticker_universe_readiness ?? null;
  const staticUniverseSymbols = uniqueTickers(input.static_universe_symbols ?? []);
  const researchHeavy = uniqueTickers(
    input.research_heavy_tickers ??
      tickerReadiness?.ticker_classification.research_heavy_candidates ??
      [],
  );
  const visibleTickers = uniqueTickers(
    input.visible_tickers ??
      tickerReadiness?.ticker_classification.core_candidates ??
      [],
  );
  const observedTickers = uniqueTickers(
    input.observed_tickers ??
      tickerReadiness?.ticker_metrics.map((metric) => metric.ticker) ??
      [],
  );
  const staticUniverseCount =
    typeof input.static_universe_count === "number" &&
    Number.isFinite(input.static_universe_count)
      ? Math.max(0, Math.round(input.static_universe_count))
      : tickerReadiness?.universe_status.configured_static_universe_count ?? null;
  const staticComparison = comparison({
    movers,
    staticUniverseCount,
    staticUniverseSymbols,
    researchHeavyTickers: researchHeavy,
    visibleTickers,
    observedTickers,
  });
  const recommendedNextSteps: string[] = [];

  if (missingRequiredFieldCount > 0) {
    recommendedNextSteps.push("fix_mock_mover_required_field_gaps");
  }
  if (staleMovers.length > 0) {
    recommendedNextSteps.push("enforce_dynamic_mover_timestamp_freshness");
    pushUnique(cautionFlags, "stale_mock_movers_present");
  }
  if (staticComparison.movers_outside_static_universe.length > 0) {
    recommendedNextSteps.push("review_outside_static_universe_mock_movers");
  }
  if (safeToShadowCompare) {
    recommendedNextSteps.push("shadow_compare_mock_movers_against_static_universe");
  }
  recommendedNextSteps.push("manual_review_before_scanner_universe_change");

  if (!safeToPreview) pushUnique(cautionFlags, "mock_fixture_not_preview_ready");
  if (!safeToShadowCompare) {
    pushUnique(cautionFlags, "mock_fixture_not_shadow_compare_ready");
  }

  return {
    advisory_only: true,
    mock_mode: true,
    provider_fetch_added: false,
    fixture_summary: {
      total_movers: movers.length,
      valid_movers: validMovers.length,
      preview_only_movers: previewOnlyMovers.length,
      invalid_movers: invalidMovers.length,
      stale_movers: staleMovers.length,
      missing_required_field_count: missingRequiredFieldCount,
    },
    contract_validation: {
      required_fields: dynamicMoverContractRequiredFields,
      optional_fields: dynamicMoverContractOptionalFields,
      missing_field_counts: missingFieldCounts,
      invalid_examples: validations
        .filter(
          (item) =>
            item.status === "invalid" ||
            item.status === "missing_required_fields" ||
            item.status === "preview_only",
        )
        .slice(0, 6)
        .map((item) => ({
          ticker: item.ticker,
          status: item.status,
          missing_required_fields: item.missing_required_fields,
          reason_codes: item.reason_codes,
        })),
      stale_examples: validations
        .filter((item) => item.stale)
        .slice(0, 6)
        .map((item) => ({
          ticker: item.ticker,
          as_of:
            movers.find((mover) => normalizeTicker(mover.ticker) === item.ticker)
              ?.as_of ?? null,
          age_minutes: item.age_minutes,
        })),
    },
    static_universe_comparison: staticComparison,
    shadow_readiness: {
      safe_to_preview: safeToPreview,
      safe_to_shadow_compare: safeToShadowCompare,
      safe_to_use_for_scanner: false,
      safe_to_change_universe: false,
      readiness_label: readinessLabel({
        safeToPreview,
        safeToShadowCompare,
        totalMovers: movers.length,
      }),
    },
    recommended_next_steps: Array.from(new Set(recommendedNextSteps)),
    safety: {
      advisory_only: true,
      mock_only: true,
      provider_fetch_added: false,
      scanner_universe_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
  };
}

export function dynamicMoversShadowAuditJson(
  summary: DynamicMoversShadowAuditSummary,
) {
  return JSON.stringify(summary, null, 2);
}
