export const ENTRY_TYPE_DISTANCE_THRESHOLD_PCT = 0.3;

export const RECOMMENDATION_ENTRY_TYPES = [
  "pullback_limit",
  "breakout_stop",
  "market_reference",
  "range_reclaim",
  "unknown",
] as const;

export type RecommendationEntryType = (typeof RECOMMENDATION_ENTRY_TYPES)[number];

export const RECOMMENDATION_ENTRY_TRIGGER_SEMANTICS = [
  "long_low_touches_entry",
  "long_high_crosses_entry",
  "immediate_reference",
  "short_high_touches_entry",
  "short_low_crosses_entry",
  "unknown",
] as const;

export type RecommendationEntryTriggerSemantics =
  (typeof RECOMMENDATION_ENTRY_TRIGGER_SEMANTICS)[number];

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
  entry_type_warnings: string[];
  entry_type_reference_price: number | null;
  entry_type_reference_source: string | null;
  entry_type_reference_read_path: string | null;
  entry_type_reference_distance_pct: number | null;
  entry_type_requires_reference_price: boolean;
  reference_price_missing_for_entry_type: boolean;
  unknown_due_to_missing_reference: boolean;
};

export type EntryTypeAwareTriggerDiagnostics = {
  official_trigger_semantics_used: string;
  entry_type: RecommendationEntryType;
  entry_type_source: RecommendationEntryTypeSource;
  entry_type_confidence: RecommendationEntryTypeConfidence;
  entry_type_warnings: string[];
  entry_type_aware_trigger_semantics: RecommendationEntryTriggerSemantics;
  entry_type_aware_entry_triggered: boolean | null;
  entry_type_aware_entry_triggered_at: string | null;
  entry_type_aware_status_if_applied: string | null;
  entry_type_trigger_disagreement: boolean;
  entry_type_trigger_disagreement_reason: string | null;
  unknown_due_to_missing_reference: boolean;
  reference_price_missing_for_entry_type: boolean;
  entry_type_requires_reference_price: boolean;
};

export type EntryTypeTriggerSummary = {
  total_outcomes: number;
  known_entry_type_count: number;
  unknown_entry_type_count: number;
  by_entry_type: Record<string, number>;
  by_trigger_semantics: Record<string, number>;
  entry_type_triggered_count: number;
  current_route_triggered_count: number;
  disagreement_count: number;
  disagreement_rate: number;
  top_disagreement_reasons: Record<string, number>;
  tickers_with_disagreements: string[];
  unknown_due_to_missing_reference_count: number;
};

export type EntryTypeSnapshotLike = {
  ticker?: string | null;
  entry?: number | null;
  side?: string | null;
  quote_price?: number | null;
  payload_json?: Record<string, unknown> | null;
};

export type EntryTypeCandleLike = {
  timestamp?: string | Date | number | null;
  high?: number | null;
  low?: number | null;
};

function finiteNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function textOrNull(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function objectOrNull(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function normalizeSide(value: unknown): "long" | "short" | "unknown" {
  const text = textOrNull(value)?.toLowerCase();
  if (text === "short" || text === "sell") return "short";
  if (text === "long" || text === "buy") return "long";
  return "unknown";
}

function normalizeEntryType(value: unknown): RecommendationEntryType | null {
  return RECOMMENDATION_ENTRY_TYPES.includes(value as RecommendationEntryType)
    ? (value as RecommendationEntryType)
    : null;
}

function normalizeSemantics(
  value: unknown,
): RecommendationEntryTriggerSemantics | null {
  return RECOMMENDATION_ENTRY_TRIGGER_SEMANTICS.includes(
    value as RecommendationEntryTriggerSemantics,
  )
    ? (value as RecommendationEntryTriggerSemantics)
    : null;
}

function normalizeSource(value: unknown): RecommendationEntryTypeSource {
  return value === "deterministic_plan_builder" ||
    value === "metadata_inference" ||
    value === "fallback_inference"
    ? value
    : "unknown";
}

function normalizeConfidence(value: unknown): RecommendationEntryTypeConfidence {
  return value === "high" || value === "medium" || value === "low"
    ? value
    : "low";
}

function timestampIso(value: unknown): string | null {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "number" && Number.isFinite(value)) {
    const normalized = value > 10_000_000_000 ? value : value * 1000;
    const date = new Date(normalized);
    return Number.isFinite(date.getTime()) ? date.toISOString() : null;
  }
  if (typeof value === "string" && value.trim() !== "") {
    const date = new Date(value);
    return Number.isFinite(date.getTime()) ? date.toISOString() : value.trim();
  }
  return null;
}

function roundPct(value: number | null): number | null {
  return value === null ? null : Math.round(value * 1000) / 1000;
}

function distancePct(entry: number | null, reference: number | null) {
  if (entry === null || reference === null || reference === 0) return null;
  return roundPct(((entry - reference) / Math.abs(reference)) * 100);
}

function arrayOfStrings(value: unknown) {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === "string")
    : [];
}

function semanticsFor(
  side: "long" | "short" | "unknown",
  entryType: RecommendationEntryType,
): RecommendationEntryTriggerSemantics {
  if (entryType === "market_reference") return "immediate_reference";
  if (side === "long" && entryType === "pullback_limit") {
    return "long_low_touches_entry";
  }
  if (
    side === "long" &&
    (entryType === "breakout_stop" || entryType === "range_reclaim")
  ) {
    return "long_high_crosses_entry";
  }
  if (side === "short" && entryType === "pullback_limit") {
    return "short_high_touches_entry";
  }
  if (
    side === "short" &&
    (entryType === "breakout_stop" || entryType === "range_reclaim")
  ) {
    return "short_low_crosses_entry";
  }
  return "unknown";
}

function readExplicitMetadataFromRecord(
  record: Record<string, unknown> | null,
): RecommendationEntryTypeMetadata | null {
  if (!record) return null;
  const entryType = normalizeEntryType(record.entry_type);
  if (!entryType) return null;

  return {
    entry_type: entryType,
    entry_trigger_semantics:
      normalizeSemantics(record.entry_trigger_semantics) ?? "unknown",
    entry_type_source: normalizeSource(record.entry_type_source),
    entry_type_confidence: normalizeConfidence(record.entry_type_confidence),
    entry_type_warnings: arrayOfStrings(record.entry_type_warnings),
    entry_type_reference_price: finiteNumber(record.entry_type_reference_price),
    entry_type_reference_source: textOrNull(record.entry_type_reference_source),
    entry_type_reference_read_path: textOrNull(
      record.entry_type_reference_read_path,
    ),
    entry_type_reference_distance_pct: finiteNumber(
      record.entry_type_reference_distance_pct,
    ),
    entry_type_requires_reference_price:
      record.entry_type_requires_reference_price !== false,
    reference_price_missing_for_entry_type:
      record.reference_price_missing_for_entry_type === true,
    unknown_due_to_missing_reference:
      record.unknown_due_to_missing_reference === true,
  };
}

function readExplicitMetadata(
  payload: Record<string, unknown> | null,
): RecommendationEntryTypeMetadata | null {
  return (
    readExplicitMetadataFromRecord(payload) ??
    readExplicitMetadataFromRecord(objectOrNull(payload?.entry_type_metadata)) ??
    readExplicitMetadataFromRecord(objectOrNull(payload?.trade_plan)) ??
    readExplicitMetadataFromRecord(objectOrNull(payload?.recommendation))
  );
}

function readReferencePrice(snapshot: EntryTypeSnapshotLike | null) {
  const payload = objectOrNull(snapshot?.payload_json);
  const tradePlan = objectOrNull(payload?.trade_plan);
  const recommendation = objectOrNull(payload?.recommendation);
  const planReference = objectOrNull(payload?.plan_reference_price);
  const candidates: Array<{
    value: unknown;
    source: unknown;
    readPath: string;
  }> = [
    {
      value: payload?.reference_price_used_for_plan,
      source: payload?.reference_price_source,
      readPath: "snapshot.payload_json.reference_price_used_for_plan",
    },
    {
      value: planReference?.reference_price_used_for_plan,
      source: planReference?.reference_price_source,
      readPath:
        "snapshot.payload_json.plan_reference_price.reference_price_used_for_plan",
    },
    {
      value: tradePlan?.reference_price_used_for_plan,
      source: tradePlan?.reference_price_source,
      readPath: "snapshot.payload_json.trade_plan.reference_price_used_for_plan",
    },
    {
      value: recommendation?.reference_price_used_for_plan,
      source: recommendation?.reference_price_source,
      readPath:
        "snapshot.payload_json.recommendation.reference_price_used_for_plan",
    },
    {
      value: snapshot?.quote_price,
      source: "provider_quote_price",
      readPath: "snapshot.quote_price",
    },
    {
      value: payload?.quote_price,
      source: "provider_quote_price",
      readPath: "snapshot.payload_json.quote_price",
    },
    {
      value: payload?.reference_price,
      source: "snapshot_payload_price",
      readPath: "snapshot.payload_json.reference_price",
    },
  ];

  for (const candidate of candidates) {
    const value = finiteNumber(candidate.value);
    if (value !== null && value > 0) {
      return {
        value,
        source: textOrNull(candidate.source) ?? "unknown",
        readPath: candidate.readPath,
      };
    }
  }

  return { value: null, source: "unknown", readPath: null };
}

export function inferRecommendationEntryTypeMetadata(input: {
  side?: string | null;
  entry?: number | null;
  referencePrice?: number | null;
  referencePriceSource?: string | null;
  referencePriceReadPath?: string | null;
  source?: RecommendationEntryTypeSource;
  existingMetadata?: RecommendationEntryTypeMetadata | null;
}): RecommendationEntryTypeMetadata {
  if (input.existingMetadata) {
    return input.existingMetadata;
  }

  const side = normalizeSide(input.side);
  const entry = finiteNumber(input.entry);
  const referencePrice = finiteNumber(input.referencePrice);
  const distance = distancePct(entry, referencePrice);
  const warnings: string[] = [];

  if (side !== "long" && side !== "short") {
    warnings.push("entry_type_side_missing");
  }
  if (entry === null) {
    warnings.push("entry_type_entry_missing");
  }

  if (referencePrice === null) {
    return {
      entry_type: "unknown",
      entry_trigger_semantics: "unknown",
      entry_type_source: input.source ?? "fallback_inference",
      entry_type_confidence: "low",
      entry_type_warnings: [
        ...warnings,
        "reference_price_missing_for_entry_type",
        "unknown_due_to_missing_reference",
      ],
      entry_type_reference_price: null,
      entry_type_reference_source: input.referencePriceSource ?? "unknown",
      entry_type_reference_read_path: input.referencePriceReadPath ?? null,
      entry_type_reference_distance_pct: null,
      entry_type_requires_reference_price: true,
      reference_price_missing_for_entry_type: true,
      unknown_due_to_missing_reference: true,
    };
  }

  let entryType: RecommendationEntryType = "unknown";
  if (entry !== null && side !== "unknown" && distance !== null) {
    if (Math.abs(distance) <= ENTRY_TYPE_DISTANCE_THRESHOLD_PCT) {
      entryType = "market_reference";
    } else if (side === "long") {
      entryType = distance < 0 ? "pullback_limit" : "breakout_stop";
    } else {
      entryType = distance > 0 ? "pullback_limit" : "breakout_stop";
    }
  }

  if (entryType === "unknown") {
    warnings.push("entry_type_inference_ambiguous");
  }

  return {
    entry_type: entryType,
    entry_trigger_semantics: semanticsFor(side, entryType),
    entry_type_source: input.source ?? "metadata_inference",
    entry_type_confidence: entryType === "unknown" ? "low" : "medium",
    entry_type_warnings: warnings,
    entry_type_reference_price: referencePrice,
    entry_type_reference_source: input.referencePriceSource ?? "unknown",
    entry_type_reference_read_path: input.referencePriceReadPath ?? null,
    entry_type_reference_distance_pct: distance,
    entry_type_requires_reference_price: true,
    reference_price_missing_for_entry_type: false,
    unknown_due_to_missing_reference: false,
  };
}

export function entryTypeMetadataForSnapshot(
  snapshot: EntryTypeSnapshotLike | null,
): RecommendationEntryTypeMetadata {
  const payload = objectOrNull(snapshot?.payload_json);
  const explicit = readExplicitMetadata(payload);
  if (explicit) return explicit;

  const reference = readReferencePrice(snapshot);
  return inferRecommendationEntryTypeMetadata({
    side: snapshot?.side ?? textOrNull(payload?.side),
    entry: finiteNumber(snapshot?.entry),
    referencePrice: reference.value,
    referencePriceSource: reference.source,
    referencePriceReadPath: reference.readPath,
    source: "fallback_inference",
  });
}

function candleTriggered(
  candle: EntryTypeCandleLike,
  entry: number,
  semantics: RecommendationEntryTriggerSemantics,
) {
  const high = finiteNumber(candle.high);
  const low = finiteNumber(candle.low);

  if (semantics === "immediate_reference") return true;
  if (semantics === "long_low_touches_entry") {
    return low !== null && low <= entry;
  }
  if (semantics === "long_high_crosses_entry") {
    return high !== null && high >= entry;
  }
  if (semantics === "short_high_touches_entry") {
    return high !== null && high >= entry;
  }
  if (semantics === "short_low_crosses_entry") {
    return low !== null && low <= entry;
  }
  return false;
}

function targetTouched(
  candle: EntryTypeCandleLike,
  target: number,
  side: "long" | "short",
) {
  const high = finiteNumber(candle.high);
  const low = finiteNumber(candle.low);
  return side === "short"
    ? low !== null && low <= target
    : high !== null && high >= target;
}

function stopTouched(
  candle: EntryTypeCandleLike,
  stop: number,
  side: "long" | "short",
) {
  const high = finiteNumber(candle.high);
  const low = finiteNumber(candle.low);
  return side === "short"
    ? high !== null && high >= stop
    : low !== null && low <= stop;
}

function disagreementReason(input: {
  side: "long" | "short" | "unknown";
  entryType: RecommendationEntryType;
  diagnosticTriggered: boolean | null;
  officialTriggered: boolean | null;
}) {
  if (input.diagnosticTriggered === input.officialTriggered) return null;
  if (input.side === "long" && input.entryType === "breakout_stop") {
    return input.diagnosticTriggered
      ? "long_breakout_high_crossed_but_current_route_not_triggered"
      : "long_breakout_current_route_triggered_but_high_cross_not_confirmed";
  }
  if (input.side === "short" && input.entryType === "breakout_stop") {
    return input.diagnosticTriggered
      ? "short_breakout_low_crossed_but_current_route_not_triggered"
      : "short_breakout_current_route_triggered_but_low_cross_not_confirmed";
  }
  if (input.entryType === "market_reference") {
    return input.diagnosticTriggered
      ? `${input.side}_market_reference_immediate_but_current_route_not_triggered`
      : `${input.side}_market_reference_current_route_triggered_but_immediate_not_confirmed`;
  }
  return `${input.side}_${input.entryType}_trigger_disagreement`;
}

export function evaluateEntryTypeAwareTrigger(input: {
  metadata: RecommendationEntryTypeMetadata;
  side?: string | null;
  entry?: number | null;
  stop?: number | null;
  target?: number | null;
  candles?: EntryTypeCandleLike[] | null;
  officialEntryTriggered?: boolean | null;
  officialStatus?: string | null;
}): EntryTypeAwareTriggerDiagnostics {
  const side = normalizeSide(input.side);
  const entry = finiteNumber(input.entry);
  const stop = finiteNumber(input.stop);
  const target = finiteNumber(input.target);
  const candles = input.candles ?? [];
  const semantics = input.metadata.entry_trigger_semantics;
  let triggered: boolean | null = null;
  let triggeredAt: string | null = null;
  let statusIfApplied: string | null = input.officialStatus ?? null;

  if (
    entry !== null &&
    side !== "unknown" &&
    semantics !== "unknown" &&
    candles.length > 0
  ) {
    const triggerIndex =
      semantics === "immediate_reference"
        ? 0
        : candles.findIndex((candle) => candleTriggered(candle, entry, semantics));
    triggered = triggerIndex >= 0;
    triggeredAt = triggerIndex >= 0 ? timestampIso(candles[triggerIndex]?.timestamp) : null;
    statusIfApplied = triggered ? "entry_triggered" : "entry_not_triggered";

    if (
      triggered &&
      triggerIndex >= 0 &&
      stop !== null &&
      target !== null &&
      (side === "long" || side === "short")
    ) {
      for (let index = triggerIndex; index < candles.length; index += 1) {
        const candle = candles[index];
        const targetHit = targetTouched(candle, target, side);
        const stopHit = stopTouched(candle, stop, side);
        if (targetHit && stopHit) {
          statusIfApplied = "unknown";
          break;
        }
        if (targetHit) {
          statusIfApplied = "target_before_stop";
          break;
        }
        if (stopHit) {
          statusIfApplied = "stop_before_target";
          break;
        }
        statusIfApplied = "neither_hit";
      }
    }
  } else if (input.metadata.entry_type === "unknown") {
    triggered = input.officialEntryTriggered ?? null;
    statusIfApplied = input.officialStatus ?? null;
  }

  const officialTriggered = input.officialEntryTriggered ?? null;
  const disagreement =
    triggered !== null &&
    officialTriggered !== null &&
    triggered !== officialTriggered;
  const reason = disagreement
    ? disagreementReason({
        side,
        entryType: input.metadata.entry_type,
        diagnosticTriggered: triggered,
        officialTriggered,
      })
    : null;

  return {
    official_trigger_semantics_used: "current_candle_range_touches_entry",
    entry_type: input.metadata.entry_type,
    entry_type_source: input.metadata.entry_type_source,
    entry_type_confidence: input.metadata.entry_type_confidence,
    entry_type_warnings: input.metadata.entry_type_warnings,
    entry_type_aware_trigger_semantics: semantics,
    entry_type_aware_entry_triggered: triggered,
    entry_type_aware_entry_triggered_at: triggeredAt,
    entry_type_aware_status_if_applied: statusIfApplied,
    entry_type_trigger_disagreement: disagreement,
    entry_type_trigger_disagreement_reason: reason,
    unknown_due_to_missing_reference:
      input.metadata.unknown_due_to_missing_reference,
    reference_price_missing_for_entry_type:
      input.metadata.reference_price_missing_for_entry_type,
    entry_type_requires_reference_price:
      input.metadata.entry_type_requires_reference_price,
  };
}

function increment(record: Record<string, number>, key: string) {
  record[key] = (record[key] ?? 0) + 1;
}

export function summarizeEntryTypeTriggerDiagnostics(
  items: Array<{
    ticker?: string | null;
    entryType?: RecommendationEntryTypeMetadata | null;
    trigger?: EntryTypeAwareTriggerDiagnostics | null;
    currentRouteTriggered?: boolean | null;
  }>,
): EntryTypeTriggerSummary {
  const summary: EntryTypeTriggerSummary = {
    total_outcomes: items.length,
    known_entry_type_count: 0,
    unknown_entry_type_count: 0,
    by_entry_type: {},
    by_trigger_semantics: {},
    entry_type_triggered_count: 0,
    current_route_triggered_count: 0,
    disagreement_count: 0,
    disagreement_rate: 0,
    top_disagreement_reasons: {},
    tickers_with_disagreements: [],
    unknown_due_to_missing_reference_count: 0,
  };
  const disagreementTickers = new Set<string>();

  for (const item of items) {
    const metadata = item.entryType;
    const trigger = item.trigger;
    const entryType = metadata?.entry_type ?? trigger?.entry_type ?? "unknown";
    const semantics =
      trigger?.entry_type_aware_trigger_semantics ??
      metadata?.entry_trigger_semantics ??
      "unknown";

    increment(summary.by_entry_type, entryType);
    increment(summary.by_trigger_semantics, semantics);

    if (entryType === "unknown") {
      summary.unknown_entry_type_count += 1;
    } else {
      summary.known_entry_type_count += 1;
    }

    if (trigger?.entry_type_aware_entry_triggered === true) {
      summary.entry_type_triggered_count += 1;
    }
    if (item.currentRouteTriggered === true) {
      summary.current_route_triggered_count += 1;
    }
    if (
      metadata?.unknown_due_to_missing_reference === true ||
      trigger?.unknown_due_to_missing_reference === true
    ) {
      summary.unknown_due_to_missing_reference_count += 1;
    }
    if (trigger?.entry_type_trigger_disagreement) {
      summary.disagreement_count += 1;
      if (trigger.entry_type_trigger_disagreement_reason) {
        increment(
          summary.top_disagreement_reasons,
          trigger.entry_type_trigger_disagreement_reason,
        );
      }
      if (item.ticker) disagreementTickers.add(item.ticker);
    }
  }

  summary.disagreement_rate =
    summary.total_outcomes > 0
      ? summary.disagreement_count / summary.total_outcomes
      : 0;
  summary.tickers_with_disagreements = Array.from(disagreementTickers).sort();

  return summary;
}
