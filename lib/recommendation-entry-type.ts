import type {
  RecommendationOutcome,
  RecommendationOutcomeCandle,
} from "@/lib/recommendation-outcome-tracker";

const ENTRY_TYPE_DISTANCE_THRESHOLD_PCT = 0.3;

export type RecommendationEntryType =
  | "pullback_limit"
  | "breakout_stop"
  | "market_reference"
  | "range_reclaim"
  | "unknown";

export type RecommendationEntryTriggerSemantics =
  | "long_low_touches_entry"
  | "long_high_crosses_entry"
  | "short_high_touches_entry"
  | "short_low_crosses_entry"
  | "immediate_reference"
  | "unknown";

export type RecommendationEntryTypeSource =
  | "deterministic_plan_builder"
  | "metadata_inference"
  | "fallback_inference"
  | "unknown";

export type RecommendationEntryTypeConfidence = "high" | "medium" | "low";

export type RecommendationEntryTypeMetadata = {
  entry_type: RecommendationEntryType;
  entry_trigger_semantics: RecommendationEntryTriggerSemantics;
  entry_type_source: RecommendationEntryTypeSource;
  entry_type_confidence: RecommendationEntryTypeConfidence;
  entry_type_reference_price: number | null;
  entry_type_reference_price_source: string | null;
  entry_type_reference_price_read_path: string | null;
  entry_type_entry_distance_from_reference_pct: number | null;
  entry_type_warnings: string[];
};

export type EntryTypeSnapshotLike = {
  ticker?: string | null;
  entry?: number | null;
  side?: string | null;
  direction?: string | null;
  trade_direction?: string | null;
  recommendation_side?: string | null;
  quote_price?: number | null;
  payload_json?: Record<string, unknown> | null;
};

export type EntryTypeCandleLike = Pick<
  RecommendationOutcomeCandle,
  "timestamp" | "high" | "low" | "close"
>;

export type EntryTypeAwareTriggerDiagnostics = {
  entry_type: RecommendationEntryType;
  entry_trigger_semantics: RecommendationEntryTriggerSemantics;
  entry_type_source: RecommendationEntryTypeSource;
  entry_type_confidence: RecommendationEntryTypeConfidence;
  reference_price: number | null;
  reference_price_source: string | null;
  reference_price_read_path: string | null;
  official_triggered: boolean | null;
  entry_type_aware_triggered: boolean | null;
  official_triggered_at: string | null;
  entry_type_aware_triggered_at: string | null;
  official_status: RecommendationOutcome["status"] | null;
  status_if_entry_type_applied: RecommendationOutcome["status"] | null;
  trigger_disagreement: boolean;
  disagreement_reason: string | null;
  unknown_due_to_missing_reference: boolean;
  candle_count: number;
};

export type EntryTypeTriggerSummary = {
  total_outcomes: number;
  total_candidates: number;
  known_entry_type_count: number;
  unknown_entry_type_count: number;
  unknown_due_to_missing_reference_count: number;
  by_entry_type: Record<string, number>;
  by_trigger_semantics: Record<string, number>;
  by_source: Record<string, number>;
  current_route_triggered_count: number;
  official_triggered_count: number;
  entry_type_triggered_count: number;
  entry_type_aware_triggered_count: number;
  disagreement_count: number;
  disagreement_rate: number;
  top_disagreement_reasons: Array<{ reason: string; count: number }>;
  disagreement_reasons: Record<string, number>;
  tickers_with_disagreements: string[];
  disagreement_tickers: string[];
};

function finiteNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function recordOrNull(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeSide(value: unknown) {
  const text = textOrNull(value)?.toLowerCase();
  if (text === "short") return "short";
  if (text === "long") return "long";
  return "unknown";
}

function normalizeEntryType(value: unknown): RecommendationEntryType | null {
  if (
    value === "pullback_limit" ||
    value === "breakout_stop" ||
    value === "market_reference" ||
    value === "range_reclaim" ||
    value === "unknown"
  ) {
    return value;
  }
  return null;
}

function normalizeTriggerSemantics(
  value: unknown,
): RecommendationEntryTriggerSemantics | null {
  if (
    value === "long_low_touches_entry" ||
    value === "long_high_crosses_entry" ||
    value === "short_high_touches_entry" ||
    value === "short_low_crosses_entry" ||
    value === "immediate_reference" ||
    value === "unknown"
  ) {
    return value;
  }
  return null;
}

function normalizeSource(value: unknown): RecommendationEntryTypeSource {
  if (
    value === "deterministic_plan_builder" ||
    value === "metadata_inference" ||
    value === "fallback_inference" ||
    value === "unknown"
  ) {
    return value;
  }
  return "unknown";
}

function normalizeConfidence(value: unknown): RecommendationEntryTypeConfidence {
  if (value === "high" || value === "medium" || value === "low") {
    return value;
  }
  return "low";
}

function normalizeWarnings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
}

function distancePct(entry: number | null, referencePrice: number | null) {
  if (entry === null || referencePrice === null || referencePrice <= 0) {
    return null;
  }
  return Math.abs((entry - referencePrice) / referencePrice) * 100;
}

function metadataFromRecord(
  value: Record<string, unknown> | null,
): RecommendationEntryTypeMetadata | null {
  if (!value) return null;

  const nested = recordOrNull(value.entry_type_metadata);
  const source = nested ?? value;
  const entryType = normalizeEntryType(source.entry_type);

  if (!entryType) {
    return null;
  }

  return {
    entry_type: entryType,
    entry_trigger_semantics:
      normalizeTriggerSemantics(source.entry_trigger_semantics) ?? "unknown",
    entry_type_source: normalizeSource(source.entry_type_source),
    entry_type_confidence: normalizeConfidence(source.entry_type_confidence),
    entry_type_reference_price: finiteNumber(source.entry_type_reference_price),
    entry_type_reference_price_source: textOrNull(
      source.entry_type_reference_price_source,
    ),
    entry_type_reference_price_read_path: textOrNull(
      source.entry_type_reference_price_read_path,
    ),
    entry_type_entry_distance_from_reference_pct: finiteNumber(
      source.entry_type_entry_distance_from_reference_pct,
    ),
    entry_type_warnings: normalizeWarnings(source.entry_type_warnings),
  };
}

function inferSemantics(
  side: string,
  entryType: RecommendationEntryType,
): RecommendationEntryTriggerSemantics {
  if (entryType === "market_reference") return "immediate_reference";
  if (side === "short") {
    if (entryType === "pullback_limit") return "short_high_touches_entry";
    if (entryType === "breakout_stop" || entryType === "range_reclaim") {
      return "short_low_crosses_entry";
    }
  }
  if (side === "long") {
    if (entryType === "pullback_limit") return "long_low_touches_entry";
    if (entryType === "breakout_stop" || entryType === "range_reclaim") {
      return "long_high_crosses_entry";
    }
  }
  return "unknown";
}

export function inferRecommendationEntryTypeMetadata(input: {
  side?: string | null;
  entry?: number | null;
  referencePrice?: number | null;
  referencePriceSource?: string | null;
  referencePriceReadPath?: string | null;
  source?: RecommendationEntryTypeSource | null;
  existingMetadata?: Record<string, unknown> | null;
}): RecommendationEntryTypeMetadata {
  const explicit = metadataFromRecord(input.existingMetadata ?? null);
  if (explicit) {
    return {
      ...explicit,
      entry_trigger_semantics:
        explicit.entry_trigger_semantics === "unknown"
          ? inferSemantics(normalizeSide(input.side), explicit.entry_type)
          : explicit.entry_trigger_semantics,
    };
  }

  const side = normalizeSide(input.side);
  const entry = finiteNumber(input.entry);
  const referencePrice = finiteNumber(input.referencePrice);
  const distance = distancePct(entry, referencePrice);
  const warnings: string[] = [];
  let entryType: RecommendationEntryType = "unknown";

  if (entry === null || entry <= 0) {
    warnings.push("entry_unavailable");
  }
  if (referencePrice === null || referencePrice <= 0) {
    warnings.push("reference_price_unavailable");
  }
  if (side !== "long" && side !== "short") {
    warnings.push("side_unavailable");
  }

  if (entry !== null && referencePrice !== null && referencePrice > 0) {
    if (distance !== null && distance <= ENTRY_TYPE_DISTANCE_THRESHOLD_PCT) {
      entryType = "market_reference";
    } else if (side === "short") {
      entryType = entry > referencePrice ? "pullback_limit" : "breakout_stop";
    } else if (side === "long") {
      entryType = entry < referencePrice ? "pullback_limit" : "breakout_stop";
    }
  }

  return {
    entry_type: entryType,
    entry_trigger_semantics: inferSemantics(side, entryType),
    entry_type_source: input.source ?? "unknown",
    entry_type_confidence:
      entryType === "unknown" ? "low" : distance === null ? "medium" : "high",
    entry_type_reference_price: referencePrice,
    entry_type_reference_price_source: textOrNull(input.referencePriceSource),
    entry_type_reference_price_read_path: textOrNull(input.referencePriceReadPath),
    entry_type_entry_distance_from_reference_pct:
      distance === null ? null : Number(distance.toFixed(3)),
    entry_type_warnings: warnings,
  };
}

function referenceFromPayload(payload: Record<string, unknown> | null) {
  const planReference = recordOrNull(payload?.plan_reference_price);
  const tradePlan = recordOrNull(payload?.trade_plan);
  const recommendation = recordOrNull(payload?.recommendation);
  const sources = [
    { path: "payload.plan_reference_price", value: planReference },
    { path: "payload", value: payload },
    { path: "payload.trade_plan", value: tradePlan },
    { path: "payload.recommendation", value: recommendation },
  ];

  for (const source of sources) {
    const price = finiteNumber(source.value?.reference_price_used_for_plan);
    if (price !== null && price > 0) {
      return {
        price,
        source:
          textOrNull(source.value?.reference_price_source) ??
          textOrNull(source.value?.entry_type_reference_price_source),
        readPath:
          textOrNull(source.value?.reference_price_read_path) ??
          `${source.path}.reference_price_used_for_plan`,
      };
    }
  }

  return { price: null, source: null, readPath: null };
}

export function entryTypeMetadataForSnapshot(
  snapshot: EntryTypeSnapshotLike,
): RecommendationEntryTypeMetadata {
  const payload = snapshot.payload_json ?? null;
  const metadata =
    metadataFromRecord(payload) ??
    metadataFromRecord(recordOrNull(payload?.trade_plan)) ??
    metadataFromRecord(recordOrNull(payload?.recommendation));
  const reference = referenceFromPayload(payload);
  const side =
    snapshot.side ??
    snapshot.direction ??
    snapshot.trade_direction ??
    snapshot.recommendation_side ??
    null;

  return inferRecommendationEntryTypeMetadata({
    side,
    entry: finiteNumber(snapshot.entry),
    referencePrice: reference.price ?? finiteNumber(snapshot.quote_price),
    referencePriceSource:
      reference.source ?? (finiteNumber(snapshot.quote_price) !== null ? "quote_price" : null),
    referencePriceReadPath:
      reference.readPath ?? (finiteNumber(snapshot.quote_price) !== null ? "snapshot.quote_price" : null),
    source: metadata ? metadata.entry_type_source : "fallback_inference",
    existingMetadata: metadata,
  });
}

function candleTriggers(
  candle: EntryTypeCandleLike,
  semantics: RecommendationEntryTriggerSemantics,
  entry: number,
) {
  if (semantics === "immediate_reference") return true;
  const high = finiteNumber(candle.high);
  const low = finiteNumber(candle.low);
  if (high === null || low === null) return false;

  if (semantics === "long_low_touches_entry") return low <= entry;
  if (semantics === "long_high_crosses_entry") return high >= entry;
  if (semantics === "short_high_touches_entry") return high >= entry;
  if (semantics === "short_low_crosses_entry") return low <= entry;
  return false;
}

function candleTimestamp(value: EntryTypeCandleLike["timestamp"]) {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === "number") {
    return new Date(value > 10_000_000_000 ? value : value * 1000).toISOString();
  }
  return typeof value === "string" && value.trim() ? value : null;
}

export function evaluateEntryTypeAwareTrigger(input: {
  metadata: RecommendationEntryTypeMetadata;
  candles: EntryTypeCandleLike[];
  entry?: number | null;
  officialTriggered?: boolean | null;
  officialTriggeredAt?: string | null;
  officialStatus?: RecommendationOutcome["status"] | null;
}): EntryTypeAwareTriggerDiagnostics {
  const entry = finiteNumber(input.entry);
  const unknownDueToMissingReference =
    input.metadata.entry_type === "unknown" &&
    input.metadata.entry_type_warnings.includes("reference_price_unavailable");
  let triggered: boolean | null = null;
  let triggeredAt: string | null = null;

  if (entry !== null && input.metadata.entry_trigger_semantics !== "unknown") {
    if (input.metadata.entry_trigger_semantics === "immediate_reference") {
      triggered = true;
      triggeredAt =
        candleTimestamp(input.candles[0]?.timestamp) ??
        input.officialTriggeredAt ??
        null;
    } else {
      const index = input.candles.findIndex((candle) =>
        candleTriggers(candle, input.metadata.entry_trigger_semantics, entry),
      );
      triggered = index >= 0;
      triggeredAt =
        index >= 0 ? candleTimestamp(input.candles[index].timestamp) : null;
    }
  }

  const officialTriggered = input.officialTriggered ?? null;
  const triggerDisagreement =
    triggered !== null &&
    officialTriggered !== null &&
    triggered !== officialTriggered;
  const statusIfApplied =
    triggered === null
      ? null
      : triggered
        ? input.officialStatus === "entry_not_triggered"
          ? "entry_triggered"
          : input.officialStatus ?? "entry_triggered"
        : "entry_not_triggered";

  return {
    entry_type: input.metadata.entry_type,
    entry_trigger_semantics: input.metadata.entry_trigger_semantics,
    entry_type_source: input.metadata.entry_type_source,
    entry_type_confidence: input.metadata.entry_type_confidence,
    reference_price: input.metadata.entry_type_reference_price,
    reference_price_source: input.metadata.entry_type_reference_price_source,
    reference_price_read_path: input.metadata.entry_type_reference_price_read_path,
    official_triggered: officialTriggered,
    entry_type_aware_triggered: triggered,
    official_triggered_at: input.officialTriggeredAt ?? null,
    entry_type_aware_triggered_at: triggeredAt,
    official_status: input.officialStatus ?? null,
    status_if_entry_type_applied: statusIfApplied,
    trigger_disagreement: triggerDisagreement,
    disagreement_reason: triggerDisagreement
      ? `${input.metadata.entry_trigger_semantics}_differs_from_official_range_touch`
      : null,
    unknown_due_to_missing_reference: unknownDueToMissingReference,
    candle_count: input.candles.length,
  };
}

function increment(map: Record<string, number>, key: string | null | undefined) {
  const normalized = key && key.trim() ? key : "unknown";
  map[normalized] = (map[normalized] ?? 0) + 1;
}

export function summarizeEntryTypeTriggerDiagnostics(
  candidates: Array<{
    ticker?: string | null;
    entry_type_metadata?: RecommendationEntryTypeMetadata | null;
    entry_type_aware_trigger?: EntryTypeAwareTriggerDiagnostics | null;
  }>,
): EntryTypeTriggerSummary {
  const byEntryType: Record<string, number> = {};
  const byTriggerSemantics: Record<string, number> = {};
  const bySource: Record<string, number> = {};
  const disagreementReasons: Record<string, number> = {};
  const disagreementTickers = new Set<string>();
  let knownEntryTypeCount = 0;
  let unknownDueToMissingReferenceCount = 0;
  let officialTriggeredCount = 0;
  let entryTypeAwareTriggeredCount = 0;
  let disagreementCount = 0;

  for (const candidate of candidates) {
    const metadata = candidate.entry_type_metadata;
    const trigger = candidate.entry_type_aware_trigger;
    increment(byEntryType, metadata?.entry_type ?? trigger?.entry_type);
    increment(
      byTriggerSemantics,
      metadata?.entry_trigger_semantics ?? trigger?.entry_trigger_semantics,
    );
    increment(bySource, metadata?.entry_type_source ?? trigger?.entry_type_source);

    if (metadata && metadata.entry_type !== "unknown") {
      knownEntryTypeCount += 1;
    }
    if (trigger?.unknown_due_to_missing_reference) {
      unknownDueToMissingReferenceCount += 1;
    }
    if (trigger?.official_triggered === true) {
      officialTriggeredCount += 1;
    }
    if (trigger?.entry_type_aware_triggered === true) {
      entryTypeAwareTriggeredCount += 1;
    }
    if (trigger?.trigger_disagreement) {
      disagreementCount += 1;
      increment(disagreementReasons, trigger.disagreement_reason);
      if (candidate.ticker) {
        disagreementTickers.add(candidate.ticker);
      }
    }
  }

  return {
    total_outcomes: candidates.length,
    total_candidates: candidates.length,
    known_entry_type_count: knownEntryTypeCount,
    unknown_entry_type_count: Math.max(0, candidates.length - knownEntryTypeCount),
    unknown_due_to_missing_reference_count: unknownDueToMissingReferenceCount,
    by_entry_type: byEntryType,
    by_trigger_semantics: byTriggerSemantics,
    by_source: bySource,
    current_route_triggered_count: officialTriggeredCount,
    official_triggered_count: officialTriggeredCount,
    entry_type_triggered_count: entryTypeAwareTriggeredCount,
    entry_type_aware_triggered_count: entryTypeAwareTriggeredCount,
    disagreement_count: disagreementCount,
    disagreement_rate:
      candidates.length === 0 ? 0 : Number((disagreementCount / candidates.length).toFixed(3)),
    top_disagreement_reasons: Object.entries(disagreementReasons)
      .sort((first, second) => second[1] - first[1])
      .slice(0, 5)
      .map(([reason, count]) => ({ reason, count })),
    disagreement_reasons: disagreementReasons,
    tickers_with_disagreements: Array.from(disagreementTickers).sort(),
    disagreement_tickers: Array.from(disagreementTickers).sort(),
  };
}
