import type { IntradayIndicators } from "@/lib/intraday-indicators";

export type RecommendationOutputSourceMode =
  | "real"
  | "demo"
  | "mock"
  | "local"
  | "mixed"
  | "unknown";

export type RecommendationOutputEnrichmentMetadata = {
  recommendation_source_mode: RecommendationOutputSourceMode;
  provider_source: string | null;
  market_data_source: string | null;
  market_data_timestamp: string | null;
  market_data_age_minutes: number | null;
  intraday_indicator_source: string | null;
  intraday_indicator_stale: boolean | null;
  scanner_source: string | null;
  scan_window: string | null;
  scan_run_id: string | null;
  scan_run_fingerprint: string | null;
  enrichment_warnings: string[];
  enrichment_gaps: string[];
};

export type RecommendationOutputEnrichmentItem = {
  id: string | null;
  ticker: string | null;
  company_name: string | null;
  side: string | null;
  entry: number | null;
  entry_low: number | null;
  entry_high: number | null;
  stop: number | null;
  target: number | null;
  confidence: number | string | null;
  rationale: string | null;
  recommended_at: string | null;
  data_timestamp: string | null;
  data_age_minutes: number | null;
  provider_source: string | null;
  market_session_phase: string | null;
  quote_last_price: number | null;
  candle_context: {
    vwap: number | null;
    recent_high: number | null;
    recent_low: number | null;
    recent_range_percent: number | null;
    momentum_percent: number | null;
    momentum_direction: string;
    volume_trend: string;
  } | null;
  volume: number | null;
  liquidity: string | number | null;
  spread: number | null;
  scan_run_id: string | null;
  scan_run_fingerprint: string | null;
  source_mode: RecommendationOutputSourceMode;
  data_mode: string | null;
  missing_fields: string[];
  warnings: string[];
  learning_compatible: boolean;
};

export type RecommendationOutputEnrichmentSummary = {
  summary_id: string;
  summary_version: "1.0";
  summary_kind: "recommendation_output_enrichment";
  generated_at: string;
  total_recommendations: number;
  enrichment_applied_count: number;
  learning_compatible_count: number;
  missing_required_field_count: number;
  source_counts: Record<RecommendationOutputSourceMode, number>;
  provider_source_coverage_rate: number;
  field_coverage_rate: number;
  market_data_timestamp_coverage_rate: number;
  items: RecommendationOutputEnrichmentItem[];
  gaps: string[];
  warnings: string[];
};

export type RecommendationOutputEnrichmentInputItem = {
  id?: string | null;
  ticker?: string | null;
  company_name?: string | null;
  side?: string | null;
  direction?: string | null;
  entry?: number | null;
  entry_low?: number | null;
  entry_high?: number | null;
  stop?: number | null;
  stop_loss?: number | null;
  target?: number | null;
  target_1?: number | null;
  target_2?: number | null;
  confidence?: number | string | null;
  confidence_score?: number | null;
  confidence_label?: string | null;
  rationale?: string | null;
  thesis?: string | null;
  reason?: string | null;
  catalyst?: string | null;
  recommended_at?: string | Date | null;
  created_at?: string | Date | null;
  data_mode?: string | null;
  source_mode?: string | null;
  is_demo?: boolean | null;
  intraday_indicators?: IntradayIndicators | null;
  output_metadata?: Partial<RecommendationOutputEnrichmentMetadata> | null;
  scan_run_id?: string | null;
  scan_run_fingerprint?: string | null;
  market_session_phase?: string | null;
  market_session_source?: string | null;
  provider_source?: string | null;
  market_data_source?: string | null;
  market_data_timestamp?: string | Date | null;
  latest_price?: number | null;
  intraday_high?: number | null;
  intraday_low?: number | null;
  latest_volume?: number | null;
  average_volume?: number | null;
  liquidity?: string | number | null;
  spread?: number | null;
};

export type RecommendationOutputEnrichmentInput = {
  recommendations: RecommendationOutputEnrichmentInputItem[];
  default_source_mode?: RecommendationOutputSourceMode | string | null;
  default_provider_source?: string | null;
  default_market_session_phase?: string | null;
  default_market_session_source?: string | null;
  scan_run_id?: string | null;
  scan_run_fingerprint?: string | null;
  now?: Date | string | null;
};

const sourceModes: RecommendationOutputSourceMode[] = [
  "real",
  "demo",
  "mock",
  "local",
  "mixed",
  "unknown",
];

const requiredFields = [
  "ticker",
  "side",
  "entry",
  "stop",
  "target",
  "confidence",
  "rationale",
  "recommended_at",
  "data_timestamp",
  "provider_source",
  "market_session_phase",
] as const;

function toDate(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date : null;
  }

  return null;
}

function toIso(value: Date | string | null | undefined) {
  return toDate(value)?.toISOString() ?? null;
}

function textOrNull(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function firstNumber(...values: Array<unknown>) {
  for (const value of values) {
    const numberValue = finiteNumber(value);
    if (numberValue !== null) {
      return numberValue;
    }
  }

  return null;
}

function firstText(...values: Array<string | null | undefined>) {
  for (const value of values) {
    const text = textOrNull(value);
    if (text !== null) {
      return text;
    }
  }

  return null;
}

function minutesBetween(later: Date, earlier: Date) {
  return Math.max(0, Math.round((later.getTime() - earlier.getTime()) / 60000));
}

function normalizeSourceMode(
  value: string | null | undefined,
): RecommendationOutputSourceMode {
  if (value === "supabase" || value === "real_market_data" || value === "scanner") {
    return "real";
  }

  if (value === "dev_preview" || value === "local_storage") {
    return "local";
  }

  return sourceModes.includes(value as RecommendationOutputSourceMode)
    ? (value as RecommendationOutputSourceMode)
    : "unknown";
}

function hasField(
  item: RecommendationOutputEnrichmentItem,
  field: (typeof requiredFields)[number],
) {
  if (field === "ticker") return item.ticker !== null;
  if (field === "side") return item.side !== null;
  if (field === "entry") return item.entry !== null;
  if (field === "stop") return item.stop !== null;
  if (field === "target") return item.target !== null;
  if (field === "confidence") return item.confidence !== null;
  if (field === "rationale") return item.rationale !== null;
  if (field === "recommended_at") return item.recommended_at !== null;
  if (field === "data_timestamp") return item.data_timestamp !== null;
  if (field === "provider_source") return item.provider_source !== null;
  if (field === "market_session_phase") return item.market_session_phase !== null;
  return false;
}

function percent(part: number, total: number) {
  if (total <= 0) {
    return 0;
  }

  return Math.round((part / total) * 100);
}

export function buildRecommendationOutputEnrichmentMetadata(input: {
  recommendation_source_mode?: RecommendationOutputSourceMode | string | null;
  provider_source?: string | null;
  market_data_source?: string | null;
  market_data_timestamp?: string | Date | null;
  intraday_indicator_source?: string | null;
  intraday_indicator_stale?: boolean | null;
  scanner_source?: string | null;
  scan_window?: string | null;
  scan_run_id?: string | null;
  scan_run_fingerprint?: string | null;
  now?: Date | string | null;
  warnings?: string[];
  gaps?: string[];
}): RecommendationOutputEnrichmentMetadata {
  const now = toDate(input.now) ?? new Date();
  const marketDataTimestamp = toIso(input.market_data_timestamp);
  const timestampDate = toDate(marketDataTimestamp);
  const gaps = [...(input.gaps ?? [])];
  const warnings = [...(input.warnings ?? [])];

  if (!marketDataTimestamp) {
    gaps.push("market_data_timestamp_unavailable");
  }

  if (!textOrNull(input.provider_source)) {
    gaps.push("provider_source_unavailable");
  }

  if (input.intraday_indicator_stale === true) {
    warnings.push("intraday_indicator_data_stale");
  }

  return {
    recommendation_source_mode: normalizeSourceMode(
      input.recommendation_source_mode,
    ),
    provider_source: textOrNull(input.provider_source),
    market_data_source: textOrNull(input.market_data_source),
    market_data_timestamp: marketDataTimestamp,
    market_data_age_minutes: timestampDate
      ? minutesBetween(now, timestampDate)
      : null,
    intraday_indicator_source: textOrNull(input.intraday_indicator_source),
    intraday_indicator_stale:
      typeof input.intraday_indicator_stale === "boolean"
        ? input.intraday_indicator_stale
        : null,
    scanner_source: textOrNull(input.scanner_source),
    scan_window: textOrNull(input.scan_window),
    scan_run_id: textOrNull(input.scan_run_id),
    scan_run_fingerprint: textOrNull(input.scan_run_fingerprint),
    enrichment_warnings: Array.from(new Set(warnings)),
    enrichment_gaps: Array.from(new Set(gaps)),
  };
}

export function buildRecommendationOutputEnrichmentSummary(
  input: RecommendationOutputEnrichmentInput,
): RecommendationOutputEnrichmentSummary {
  const now = toDate(input.now) ?? new Date();
  const items = input.recommendations.map((recommendation) => {
    const metadata = recommendation.output_metadata ?? {};
    const indicators = recommendation.intraday_indicators ?? null;
    const sourceMode = recommendation.is_demo
      ? "demo"
      : normalizeSourceMode(
          recommendation.source_mode ??
            metadata.recommendation_source_mode ??
            input.default_source_mode,
        );
    const recommendedAt = toIso(recommendation.recommended_at ?? recommendation.created_at);
    const dataTimestamp =
      toIso(recommendation.market_data_timestamp) ??
      toIso(metadata.market_data_timestamp);
    const dataTimestampDate = toDate(dataTimestamp);
    const entry = firstNumber(
      recommendation.entry,
      recommendation.entry_high,
      recommendation.entry_low,
    );
    const target = firstNumber(
      recommendation.target,
      recommendation.target_1,
      recommendation.target_2,
    );
    const providerSource = firstText(
      recommendation.provider_source,
      metadata.provider_source,
      input.default_provider_source,
    );
    const marketSessionPhase = firstText(
      recommendation.market_session_phase,
      input.default_market_session_phase,
    );
    const quoteLastPrice = firstNumber(
      recommendation.latest_price,
      indicators?.latestPrice,
    );
    const volume = firstNumber(
      recommendation.latest_volume,
      indicators?.latestVolume,
      recommendation.average_volume,
      indicators?.averageVolume,
    );
    const warnings = [...(metadata.enrichment_warnings ?? [])];

    if (metadata.intraday_indicator_stale === true) {
      warnings.push("Intraday indicator context is stale.");
    }

    const item: RecommendationOutputEnrichmentItem = {
      id: recommendation.id ?? null,
      ticker: textOrNull(recommendation.ticker),
      company_name: textOrNull(recommendation.company_name),
      side: firstText(recommendation.side, recommendation.direction),
      entry,
      entry_low: finiteNumber(recommendation.entry_low),
      entry_high: finiteNumber(recommendation.entry_high),
      stop: firstNumber(recommendation.stop, recommendation.stop_loss),
      target,
      confidence:
        finiteNumber(recommendation.confidence_score) ??
        recommendation.confidence ??
        textOrNull(recommendation.confidence_label),
      rationale: firstText(
        recommendation.rationale,
        recommendation.thesis,
        recommendation.reason,
        recommendation.catalyst,
      ),
      recommended_at: recommendedAt,
      data_timestamp: dataTimestamp,
      data_age_minutes:
        typeof metadata.market_data_age_minutes === "number" &&
        Number.isFinite(metadata.market_data_age_minutes)
          ? metadata.market_data_age_minutes
          : dataTimestampDate
            ? minutesBetween(now, dataTimestampDate)
            : null,
      provider_source: providerSource,
      market_session_phase: marketSessionPhase,
      quote_last_price: quoteLastPrice,
      candle_context: indicators
        ? {
            vwap: indicators.vwap,
            recent_high:
              firstNumber(recommendation.intraday_high, indicators.recentHigh),
            recent_low: firstNumber(recommendation.intraday_low, indicators.recentLow),
            recent_range_percent: indicators.recentRangePercent,
            momentum_percent: indicators.momentumPercent,
            momentum_direction: indicators.momentumDirection,
            volume_trend: indicators.volumeTrend,
          }
        : null,
      volume,
      liquidity: recommendation.liquidity ?? null,
      spread: finiteNumber(recommendation.spread),
      scan_run_id:
        textOrNull(recommendation.scan_run_id) ??
        textOrNull(metadata.scan_run_id) ??
        textOrNull(input.scan_run_id),
      scan_run_fingerprint:
        textOrNull(recommendation.scan_run_fingerprint) ??
        textOrNull(metadata.scan_run_fingerprint) ??
        textOrNull(input.scan_run_fingerprint),
      source_mode: sourceMode,
      data_mode: textOrNull(recommendation.data_mode),
      missing_fields: [],
      warnings: Array.from(new Set(warnings)),
      learning_compatible: false,
    };
    const missingFields = requiredFields.filter((field) => !hasField(item, field));

    return {
      ...item,
      missing_fields: missingFields,
      learning_compatible: missingFields.length === 0 && sourceMode !== "demo",
    };
  });
  const missingRequiredFieldCount = items.reduce(
    (total, item) => total + item.missing_fields.length,
    0,
  );
  const sourceCounts = sourceModes.reduce(
    (counts, sourceMode) => ({
      ...counts,
      [sourceMode]: items.filter((item) => item.source_mode === sourceMode).length,
    }),
    {} as Record<RecommendationOutputSourceMode, number>,
  );
  const providerSourceCoverageRate = percent(
    items.filter((item) => item.provider_source !== null).length,
    items.length,
  );
  const marketDataTimestampCoverageRate = percent(
    items.filter((item) => item.data_timestamp !== null).length,
    items.length,
  );
  const availableFieldCount = items.reduce(
    (total, item) =>
      total + requiredFields.filter((field) => hasField(item, field)).length,
    0,
  );
  const totalFieldCount = items.length * requiredFields.length;
  const gaps = Array.from(
    new Set([
      ...items.flatMap((item) =>
        item.missing_fields.map((field) => `missing_${field}`),
      ),
      ...items.flatMap(
        (item) => item.warnings.filter((warning) => warning.endsWith("_unavailable")),
      ),
    ]),
  );

  return {
    summary_id: `recommendation_output_enrichment:${now.toISOString()}`,
    summary_version: "1.0",
    summary_kind: "recommendation_output_enrichment",
    generated_at: now.toISOString(),
    total_recommendations: items.length,
    enrichment_applied_count: items.filter(
      (item) =>
        item.provider_source !== null ||
        item.data_timestamp !== null ||
        item.quote_last_price !== null ||
        item.candle_context !== null,
    ).length,
    learning_compatible_count: items.filter((item) => item.learning_compatible).length,
    missing_required_field_count: missingRequiredFieldCount,
    source_counts: sourceCounts,
    provider_source_coverage_rate: providerSourceCoverageRate,
    field_coverage_rate: percent(availableFieldCount, totalFieldCount),
    market_data_timestamp_coverage_rate: marketDataTimestampCoverageRate,
    items,
    gaps,
    warnings: Array.from(new Set(items.flatMap((item) => item.warnings))),
  };
}

export function recommendationOutputEnrichmentJson(
  summary: RecommendationOutputEnrichmentSummary,
) {
  return JSON.stringify(summary, null, 2);
}
