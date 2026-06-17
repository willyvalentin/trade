import { recommendationConfidenceMetadataPrefix } from "@/lib/recommendation-inline-metadata";
import type { PlanPriceFreshnessDiagnostics } from "@/lib/plan-price-freshness";
import type { RecommendationEntryTypeMetadata } from "@/lib/recommendation-entry-type";
import type { RecommendationOutcome } from "@/lib/recommendation-outcome-tracker";
import type { RecommendationSnapshot } from "@/lib/recommendation-snapshot";

export type PlanReferenceMetadataTraceStage =
  | "raw_ranked_scanner_candidate_metadata"
  | "generated_recommendation_object_before_persistence"
  | "inline_confidence_metadata"
  | "persisted_recommendation_row_metadata_fields"
  | "snapshot_payload"
  | "rebuilt_snapshot_payload_from_persisted_recommendation_rows"
  | "outcome_payload_candidate_readback"
  | "plan_price_freshness_input"
  | "entry_type_inference_input";

export type PlanReferenceMetadataParseStatus =
  | "present_numeric"
  | "present_numeric_string"
  | "present_non_numeric"
  | "missing"
  | "malformed_inline_metadata"
  | "not_available_at_stage";

export type PlanReferenceMetadataTraceClassification =
  | "complete_reference_metadata"
  | "price_only"
  | "timestamp_only"
  | "source_only"
  | "missing_reference_price"
  | "missing_reference_timestamp"
  | "missing_reference_source"
  | "missing_all_reference_metadata"
  | "malformed_inline_metadata";

export type PlanReferenceMetadataTraceFoundValue = {
  stage: PlanReferenceMetadataTraceStage;
  read_path: string;
  value: number | string | null;
  parse_status: PlanReferenceMetadataParseStatus;
};

export type PlanReferenceMetadataTraceItem = {
  ticker: string | null;
  recommendation_id: string | null;
  snapshot_fingerprint: string | null;
  batch_fingerprint: string | null;
  scan_run_fingerprint: string | null;
  horizon: string | null;
  entry: number | null;
  stop: number | null;
  target: number | null;
  side: string | null;
  recommended_at: string | null;
  reference_price_candidate_values_found: PlanReferenceMetadataTraceFoundValue[];
  reference_timestamp_candidate_values_found: PlanReferenceMetadataTraceFoundValue[];
  reference_source_provider_candidate_values_found: PlanReferenceMetadataTraceFoundValue[];
  read_paths_where_values_found: string[];
  parse_status: PlanReferenceMetadataParseStatus;
  stage_parse_statuses: Record<PlanReferenceMetadataTraceStage, PlanReferenceMetadataParseStatus>;
  first_missing_stage: PlanReferenceMetadataTraceStage | null;
  reference_price_available: boolean;
  reference_timestamp_available: boolean;
  reference_source_available: boolean;
  classification: PlanReferenceMetadataTraceClassification;
};

export type PlanReferenceMetadataTraceSummary = {
  total_traced_items: number;
  traced_by_ticker: Record<string, number>;
  complete_reference_metadata_count: number;
  missing_reference_price_count: number;
  missing_reference_timestamp_count: number;
  missing_reference_source_count: number;
  malformed_inline_metadata_count: number;
  first_missing_stage_counts: Record<string, number>;
  reference_price_read_path_counts: Record<string, number>;
  reference_timestamp_read_path_counts: Record<string, number>;
  reference_source_read_path_counts: Record<string, number>;
  top_missing_reference_tickers: string[];
  top_malformed_inline_metadata_tickers: string[];
  sample_traces: PlanReferenceMetadataTraceItem[];
};

export type PlanReferenceMetadataTraceCandidateLike = {
  snapshot_fingerprint?: string | null;
  recommendation_id?: string | null;
  ticker?: string | null;
  horizon?: string | null;
  outcome_id?: string | null;
  plan_price_freshness?: PlanPriceFreshnessDiagnostics | null;
  entry_type_metadata?: RecommendationEntryTypeMetadata | null;
};

const traceStages: PlanReferenceMetadataTraceStage[] = [
  "raw_ranked_scanner_candidate_metadata",
  "generated_recommendation_object_before_persistence",
  "inline_confidence_metadata",
  "persisted_recommendation_row_metadata_fields",
  "snapshot_payload",
  "rebuilt_snapshot_payload_from_persisted_recommendation_rows",
  "outcome_payload_candidate_readback",
  "plan_price_freshness_input",
  "entry_type_inference_input",
];

const referencePriceKeys = new Set([
  "reference_price_used_for_plan",
  "plan_reference_price",
  "reference_price",
  "referencePrice",
  "quote_price",
  "quotePrice",
  "current_price",
  "last_price",
  "lastPrice",
  "latest_price",
  "latest_close",
  "close",
  "price",
  "entry_type_reference_price",
]);

const referenceTimestampKeys = new Set([
  "reference_price_timestamp",
  "referencePriceTimestamp",
  "quote_timestamp",
  "market_data_timestamp",
  "timestamp",
  "updated_at",
  "as_of",
  "asOf",
]);

const referenceSourceKeys = new Set([
  "reference_price_source",
  "reference_price_provider",
  "reference_price_read_path",
  "entry_type_reference_price_source",
  "entry_type_reference_price_read_path",
]);

function finiteNumber(value: unknown) {
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

function textOrNull(value: unknown) {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function readPathJoin(base: string, key: string) {
  return base ? `${base}.${key}` : key;
}

function parseStatusForPrice(value: unknown): PlanReferenceMetadataParseStatus {
  if (typeof value === "number") {
    return Number.isFinite(value) ? "present_numeric" : "present_non_numeric";
  }
  if (typeof value === "string") {
    return finiteNumber(value) !== null
      ? "present_numeric_string"
      : "present_non_numeric";
  }
  return value === null || value === undefined ? "missing" : "present_non_numeric";
}

function parseStatusForText(value: unknown): PlanReferenceMetadataParseStatus {
  return textOrNull(value) ? "present_non_numeric" : "missing";
}

function parseInlineMetadata(value: unknown): {
  metadata: Record<string, unknown> | null;
  malformed: boolean;
} {
  if (typeof value !== "string" || !value.includes(recommendationConfidenceMetadataPrefix)) {
    return { metadata: null, malformed: false };
  }

  const jsonStart =
    value.indexOf(recommendationConfidenceMetadataPrefix) +
    recommendationConfidenceMetadataPrefix.length;
  const end = value.lastIndexOf("]");
  if (end === -1 || end <= jsonStart) {
    return { metadata: null, malformed: true };
  }

  try {
    const parsed = JSON.parse(value.slice(jsonStart, end)) as unknown;
    return { metadata: objectOrNull(parsed), malformed: objectOrNull(parsed) === null };
  } catch {
    return { metadata: null, malformed: true };
  }
}

function addFoundValue(
  target: PlanReferenceMetadataTraceFoundValue[],
  input: {
    stage: PlanReferenceMetadataTraceStage;
    readPath: string;
    value: unknown;
    parseStatus: PlanReferenceMetadataParseStatus;
  },
) {
  if (input.parseStatus === "missing") return;
  target.push({
    stage: input.stage,
    read_path: input.readPath,
    value:
      typeof input.value === "number"
        ? input.value
        : typeof input.value === "string"
          ? input.value
          : input.value === null || input.value === undefined
            ? null
            : JSON.stringify(input.value).slice(0, 200),
    parse_status: input.parseStatus,
  });
}

function scanReferenceFields(input: {
  value: unknown;
  path: string;
  stage: PlanReferenceMetadataTraceStage;
  prices: PlanReferenceMetadataTraceFoundValue[];
  timestamps: PlanReferenceMetadataTraceFoundValue[];
  sources: PlanReferenceMetadataTraceFoundValue[];
  maxDepth?: number;
}) {
  const maxDepth = input.maxDepth ?? 5;
  const visit = (value: unknown, path: string, depth: number) => {
    if (depth > maxDepth) return;
    const record = objectOrNull(value);
    if (!record) return;

    for (const [key, child] of Object.entries(record)) {
      const childPath = readPathJoin(path, key);
      if (referencePriceKeys.has(key)) {
        addFoundValue(input.prices, {
          stage: input.stage,
          readPath: childPath,
          value: child,
          parseStatus: parseStatusForPrice(child),
        });
      }
      if (referenceTimestampKeys.has(key)) {
        addFoundValue(input.timestamps, {
          stage: input.stage,
          readPath: childPath,
          value: child,
          parseStatus: parseStatusForText(child),
        });
      }
      if (referenceSourceKeys.has(key)) {
        addFoundValue(input.sources, {
          stage: input.stage,
          readPath: childPath,
          value: child,
          parseStatus: parseStatusForText(child),
        });
      }
      if (child !== null && typeof child === "object" && !Array.isArray(child)) {
        visit(child, childPath, depth + 1);
      }
    }
  };

  visit(input.value, input.path, 0);
}

function firstAvailablePrice(values: PlanReferenceMetadataTraceFoundValue[]) {
  return values.some((value) => {
    const parsed = finiteNumber(value.value);
    return parsed !== null && parsed > 0;
  });
}

function firstAvailableText(values: PlanReferenceMetadataTraceFoundValue[]) {
  return values.some((value) => {
    const text = textOrNull(value.value);
    return text !== null && text.toLowerCase() !== "unknown";
  });
}

function combinedParseStatus(input: {
  malformed: boolean;
  prices: PlanReferenceMetadataTraceFoundValue[];
  timestamps: PlanReferenceMetadataTraceFoundValue[];
  sources: PlanReferenceMetadataTraceFoundValue[];
}): PlanReferenceMetadataParseStatus {
  if (input.malformed) return "malformed_inline_metadata";
  const all = [...input.prices, ...input.timestamps, ...input.sources];
  if (all.some((value) => value.parse_status === "present_numeric")) {
    return "present_numeric";
  }
  if (all.some((value) => value.parse_status === "present_numeric_string")) {
    return "present_numeric_string";
  }
  if (all.some((value) => value.parse_status === "present_non_numeric")) {
    return "present_non_numeric";
  }
  return "missing";
}

function classify(input: {
  price: boolean;
  timestamp: boolean;
  source: boolean;
  malformed: boolean;
}): PlanReferenceMetadataTraceClassification {
  if (input.price && input.timestamp && input.source) {
    return "complete_reference_metadata";
  }
  if (input.malformed) return "malformed_inline_metadata";
  if (input.price && !input.timestamp && !input.source) return "price_only";
  if (!input.price && input.timestamp && !input.source) return "timestamp_only";
  if (!input.price && !input.timestamp && input.source) return "source_only";
  if (!input.price && !input.timestamp && !input.source) {
    return "missing_all_reference_metadata";
  }
  if (!input.price) return "missing_reference_price";
  if (!input.timestamp) return "missing_reference_timestamp";
  return "missing_reference_source";
}

function stageStatus(
  stage: PlanReferenceMetadataTraceStage,
  prices: PlanReferenceMetadataTraceFoundValue[],
  timestamps: PlanReferenceMetadataTraceFoundValue[],
  sources: PlanReferenceMetadataTraceFoundValue[],
  available: boolean,
  malformed: boolean,
) {
  if (!available) return "not_available_at_stage";
  return combinedParseStatus({
    malformed,
    prices: prices.filter((value) => value.stage === stage),
    timestamps: timestamps.filter((value) => value.stage === stage),
    sources: sources.filter((value) => value.stage === stage),
  });
}

function findFirstMissingStage(
  statuses: Record<PlanReferenceMetadataTraceStage, PlanReferenceMetadataParseStatus>,
) {
  return (
    traceStages.find(
      (stage) =>
        statuses[stage] === "missing" ||
        statuses[stage] === "malformed_inline_metadata",
    ) ??
    traceStages.find((stage) => statuses[stage] === "not_available_at_stage") ??
    null
  );
}

function increment(map: Record<string, number>, key: string | null | undefined) {
  const normalized = key && key.trim() ? key.trim() : "unknown";
  map[normalized] = (map[normalized] ?? 0) + 1;
}

function topKeys(map: Record<string, number>, limit: number) {
  return Object.entries(map)
    .sort((left, right) => right[1] - left[1] || left[0].localeCompare(right[0]))
    .slice(0, limit)
    .map(([key]) => key);
}

export function buildPlanReferenceMetadataTrace(input: {
  snapshots?: RecommendationSnapshot[];
  candidates?: PlanReferenceMetadataTraceCandidateLike[];
  outcomes?: RecommendationOutcome[];
  batchFingerprint?: string | null;
  scanRunFingerprint?: string | null;
  sampleLimit?: number;
}): PlanReferenceMetadataTraceSummary {
  const snapshots = input.snapshots ?? [];
  const candidates = input.candidates ?? [];
  const outcomes = input.outcomes ?? [];
  const snapshotsByFingerprint = new Map(
    snapshots.map((snapshot) => [snapshot.snapshot_fingerprint, snapshot]),
  );
  const outcomesById = new Map(outcomes.map((outcome) => [outcome.id, outcome]));
  const outcomesBySnapshot = new Map<string, RecommendationOutcome>();
  for (const outcome of outcomes) {
    if (outcome.snapshot_fingerprint && !outcomesBySnapshot.has(outcome.snapshot_fingerprint)) {
      outcomesBySnapshot.set(outcome.snapshot_fingerprint, outcome);
    }
  }
  const traceInputs =
    candidates.length > 0
      ? candidates.map((candidate) => ({
          candidate,
          snapshot: candidate.snapshot_fingerprint
            ? snapshotsByFingerprint.get(candidate.snapshot_fingerprint) ?? null
            : null,
          outcome:
            (candidate.outcome_id ? outcomesById.get(candidate.outcome_id) : null) ??
            (candidate.snapshot_fingerprint
              ? outcomesBySnapshot.get(candidate.snapshot_fingerprint) ?? null
              : null),
        }))
      : snapshots.map((snapshot) => ({
          candidate: null,
          snapshot,
          outcome: outcomesBySnapshot.get(snapshot.snapshot_fingerprint) ?? null,
        }));
  const traces: PlanReferenceMetadataTraceItem[] = traceInputs.map(
    ({ candidate, snapshot, outcome }) => {
      const payload = objectOrNull(snapshot?.payload_json) ?? null;
      const recommendation = objectOrNull(payload?.recommendation);
      const inline = parseInlineMetadata(recommendation?.reason_to_avoid);
      const planFreshness = candidate?.plan_price_freshness ?? null;
      const entryTypeMetadata = candidate?.entry_type_metadata ?? null;
      const prices: PlanReferenceMetadataTraceFoundValue[] = [];
      const timestamps: PlanReferenceMetadataTraceFoundValue[] = [];
      const sources: PlanReferenceMetadataTraceFoundValue[] = [];

      const scanTrace = objectOrNull(payload?.active_scan_trace);
      const rawCandidates = objectOrNull(scanTrace?.raw_candidates);
      scanReferenceFields({
        value: rawCandidates,
        path: "active_scan_trace.raw_candidates",
        stage: "raw_ranked_scanner_candidate_metadata",
        prices,
        timestamps,
        sources,
      });
      scanReferenceFields({
        value: recommendation,
        path: "recommendation",
        stage: "generated_recommendation_object_before_persistence",
        prices,
        timestamps,
        sources,
      });
      scanReferenceFields({
        value: inline.metadata,
        path: "recommendation.reason_to_avoid.confidence_meta",
        stage: "inline_confidence_metadata",
        prices,
        timestamps,
        sources,
      });
      scanReferenceFields({
        value: payload,
        path: "persisted_recommendation_row.payload_json",
        stage: "persisted_recommendation_row_metadata_fields",
        prices,
        timestamps,
        sources,
      });
      scanReferenceFields({
        value: payload,
        path: "snapshot.payload_json",
        stage: "snapshot_payload",
        prices,
        timestamps,
        sources,
      });
      scanReferenceFields({
        value: payload,
        path: "rebuilt_snapshot.payload_json",
        stage: "rebuilt_snapshot_payload_from_persisted_recommendation_rows",
        prices,
        timestamps,
        sources,
      });
      scanReferenceFields({
        value: outcome?.payload_json,
        path: "outcome.payload_json",
        stage: "outcome_payload_candidate_readback",
        prices,
        timestamps,
        sources,
      });
      scanReferenceFields({
        value: planFreshness,
        path: "candidate.plan_price_freshness",
        stage: "plan_price_freshness_input",
        prices,
        timestamps,
        sources,
      });
      scanReferenceFields({
        value: entryTypeMetadata,
        path: "candidate.entry_type_metadata",
        stage: "entry_type_inference_input",
        prices,
        timestamps,
        sources,
      });

      const stageParseStatuses = Object.fromEntries(
        traceStages.map((stage) => [
          stage,
          stageStatus(
            stage,
            prices,
            timestamps,
            sources,
            stage === "raw_ranked_scanner_candidate_metadata"
              ? rawCandidates !== null
              : stage === "generated_recommendation_object_before_persistence"
                ? recommendation !== null
                : stage === "inline_confidence_metadata"
                  ? inline.metadata !== null || inline.malformed
                  : stage === "outcome_payload_candidate_readback"
                    ? outcome !== null
                    : stage === "plan_price_freshness_input"
                      ? planFreshness !== null
                      : stage === "entry_type_inference_input"
                        ? entryTypeMetadata !== null
                        : payload !== null,
            stage === "inline_confidence_metadata" && inline.malformed,
          ),
        ]),
      ) as Record<PlanReferenceMetadataTraceStage, PlanReferenceMetadataParseStatus>;
      const priceAvailable = firstAvailablePrice(prices);
      const timestampAvailable = firstAvailableText(timestamps);
      const sourceAvailable = firstAvailableText(sources);
      const classification = classify({
        price: priceAvailable,
        timestamp: timestampAvailable,
        source: sourceAvailable,
        malformed: inline.malformed,
      });

      return {
        ticker: candidate?.ticker ?? snapshot?.ticker ?? outcome?.ticker ?? null,
        recommendation_id:
          candidate?.recommendation_id ?? snapshot?.recommendation_id ?? null,
        snapshot_fingerprint:
          candidate?.snapshot_fingerprint ?? snapshot?.snapshot_fingerprint ?? null,
        batch_fingerprint:
          textOrNull(payload?.batch_fingerprint) ?? input.batchFingerprint ?? null,
        scan_run_fingerprint:
          snapshot?.scan_run_id ??
          textOrNull(payload?.scan_run_fingerprint) ??
          input.scanRunFingerprint ??
          null,
        horizon: candidate?.horizon ?? outcome?.horizon ?? null,
        entry: finiteNumber(snapshot?.entry ?? outcome?.entry),
        stop: finiteNumber(snapshot?.stop ?? outcome?.stop),
        target: finiteNumber(snapshot?.target ?? outcome?.target),
        side: textOrNull(snapshot?.side) ?? textOrNull(outcome?.side) ?? null,
        recommended_at: snapshot?.recommended_at ?? outcome?.recommended_at ?? null,
        reference_price_candidate_values_found: prices,
        reference_timestamp_candidate_values_found: timestamps,
        reference_source_provider_candidate_values_found: sources,
        read_paths_where_values_found: Array.from(
          new Set([...prices, ...timestamps, ...sources].map((value) => value.read_path)),
        ).sort(),
        parse_status: combinedParseStatus({
          malformed: inline.malformed,
          prices,
          timestamps,
          sources,
        }),
        stage_parse_statuses: stageParseStatuses,
        first_missing_stage: findFirstMissingStage(stageParseStatuses),
        reference_price_available: priceAvailable,
        reference_timestamp_available: timestampAvailable,
        reference_source_available: sourceAvailable,
        classification,
      };
    },
  );
  const tracedByTicker: Record<string, number> = {};
  const firstMissingStageCounts: Record<string, number> = {};
  const pricePathCounts: Record<string, number> = {};
  const timestampPathCounts: Record<string, number> = {};
  const sourcePathCounts: Record<string, number> = {};
  const missingTickerCounts: Record<string, number> = {};
  const malformedTickerCounts: Record<string, number> = {};
  let complete = 0;
  let missingPrice = 0;
  let missingTimestamp = 0;
  let missingSource = 0;
  let malformed = 0;

  for (const trace of traces) {
    increment(tracedByTicker, trace.ticker);
    if (trace.classification === "complete_reference_metadata") complete += 1;
    if (!trace.reference_price_available) {
      missingPrice += 1;
      increment(missingTickerCounts, trace.ticker);
    }
    if (!trace.reference_timestamp_available) missingTimestamp += 1;
    if (!trace.reference_source_available) missingSource += 1;
    if (trace.classification === "malformed_inline_metadata") {
      malformed += 1;
      increment(malformedTickerCounts, trace.ticker);
    }
    increment(firstMissingStageCounts, trace.first_missing_stage);
    for (const value of trace.reference_price_candidate_values_found) {
      increment(pricePathCounts, value.read_path);
    }
    for (const value of trace.reference_timestamp_candidate_values_found) {
      increment(timestampPathCounts, value.read_path);
    }
    for (const value of trace.reference_source_provider_candidate_values_found) {
      increment(sourcePathCounts, value.read_path);
    }
  }

  return {
    total_traced_items: traces.length,
    traced_by_ticker: tracedByTicker,
    complete_reference_metadata_count: complete,
    missing_reference_price_count: missingPrice,
    missing_reference_timestamp_count: missingTimestamp,
    missing_reference_source_count: missingSource,
    malformed_inline_metadata_count: malformed,
    first_missing_stage_counts: firstMissingStageCounts,
    reference_price_read_path_counts: pricePathCounts,
    reference_timestamp_read_path_counts: timestampPathCounts,
    reference_source_read_path_counts: sourcePathCounts,
    top_missing_reference_tickers: topKeys(missingTickerCounts, 10),
    top_malformed_inline_metadata_tickers: topKeys(malformedTickerCounts, 10),
    sample_traces: traces.slice(0, input.sampleLimit ?? 12),
  };
}
