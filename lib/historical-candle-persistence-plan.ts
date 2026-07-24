import {
  validateHistoricalCandleShape,
  type HistoricalCandle,
} from "@/lib/historical-candle-cache";
import {
  buildHistoricalCandleStorageReadiness,
  type HistoricalCandleStorageReadinessSummary,
  type HistoricalCandleStorageVerificationStatus,
} from "@/lib/historical-candle-storage-readiness";

export type HistoricalCandlePersistenceFetchRunMetadata = {
  provider_credits_estimated?: number | null;
  fetch_run_id?: string | null;
};

export type HistoricalCandlePersistencePlanInput = {
  candles?: HistoricalCandle[] | null;
  storage_readiness?: HistoricalCandleStorageReadinessSummary | null;
  existing_cache_keys?: string[] | null;
  existing_candle_keys?: string[] | null;
  fetch_run_metadata?: HistoricalCandlePersistenceFetchRunMetadata | null;
};

export type HistoricalCandlePersistencePlanSummary = {
  advisory_only: true;
  dry_run_only: true;
  persistence_context: {
    target_table: "historical_candles";
    fetch_runs_table: "historical_candle_fetch_runs";
    provider: "twelve_data";
    migration_applied: HistoricalCandleStorageVerificationStatus;
    table_detected: HistoricalCandleStorageVerificationStatus;
    fetch_run_audit_required: true;
  };
  input_summary: {
    candles_received: number;
    valid_candles: number;
    invalid_candles: number;
    duplicate_input_candles: number;
    unique_cache_keys: number;
  };
  upsert_plan: {
    planned_inserts: number;
    planned_updates: number;
    planned_skips: number;
    planned_invalid_rejections: number;
    planned_duplicates_deduped: number;
    conflict_target: string[];
    reuse_before_fetch: true;
    dedupe_required: true;
  };
  cache_analysis: {
    cache_hits: number;
    cache_misses: number;
    existing_cache_keys_checked: number;
    missing_cache_key_count: number;
  };
  fetch_run_audit_plan: {
    create_fetch_run_record: false;
    planned_status: "dry_run_only";
    provider_credits_estimated: number | null;
    provider_credits_used: 0;
    cache_hits: number;
    cache_misses: number;
    candle_count: number;
  };
  validation_mapping: {
    validation_status_counts: Record<string, number>;
    quality_flag_counts: Record<string, number>;
    invalid_examples: Array<{
      ticker: string | null;
      timestamp: string | null;
      reason_codes: string[];
      missing_fields: string[];
    }>;
  };
  readiness: {
    ready_to_plan_upsert: boolean;
    ready_to_write_fetch_run: false;
    ready_to_persist_candles: false;
    ready_to_create_synthetic_outcomes: false;
    ready_to_run_backfill: false;
    ready_to_use_for_scanner: false;
  };
  safety: {
    advisory_only: true;
    dry_run_only: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
  recommended_next_steps: string[];
  reason_codes: string[];
  caution_flags: string[];
  metadata_gaps: string[];
};

const conflictTarget = ["provider", "ticker", "interval", "timestamp", "adjusted"];

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : null;
}

function normalizeText(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function increment(record: Record<string, number>, key: string, amount = 1) {
  record[key] = (record[key] ?? 0) + amount;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function persistenceKey(candle: HistoricalCandle) {
  const provider = normalizeText(candle.source ?? "twelve_data") ?? "twelve_data";
  const ticker = normalizeTicker(candle.ticker ?? null) ?? "UNKNOWN";
  const interval = normalizeText(String(candle.interval ?? "unknown")) ?? "unknown";
  const timestamp = normalizeText(candle.timestamp ?? null) ?? "unknown_timestamp";
  const adjusted = candle.adjusted === true ? "adjusted_true" : "adjusted_false";

  return [provider, ticker, interval, timestamp, adjusted].join(":");
}

function cacheKey(candle: HistoricalCandle) {
  return normalizeText((candle as HistoricalCandle & { cache_key?: string | null }).cache_key ?? null);
}

function validationStatus(reasonCodes: string[]) {
  if (reasonCodes.length === 0) return "valid";
  if (reasonCodes.includes("missing_required_fields")) {
    return "invalid";
  }
  if (reasonCodes.some((reason) => reason.startsWith("invalid_ohlc"))) {
    return "invalid";
  }
  return "valid_with_warning";
}

function qualityFlags(input: {
  candle: HistoricalCandle;
  reasonCodes: string[];
  duplicate: boolean;
}) {
  const flags: string[] = [];
  if (input.duplicate) flags.push("duplicate_timestamp");
  if (input.reasonCodes.some((reason) => reason.startsWith("invalid_ohlc"))) {
    flags.push("malformed_ohlc");
  }
  if (input.reasonCodes.includes("missing_required_fields")) {
    flags.push("missing_required_field");
  }
  if (!input.candle.source || input.candle.source === "unknown") {
    flags.push("stale_or_unknown_source");
  }
  return flags;
}

export function validateHistoricalCandlePersistenceReadiness(
  input: HistoricalCandlePersistencePlanInput = {},
) {
  const storageReadiness =
    input.storage_readiness ?? buildHistoricalCandleStorageReadiness();

  return {
    ready_to_plan_upsert: true,
    ready_to_write_fetch_run: false as const,
    ready_to_persist_candles: false as const,
    ready_to_create_synthetic_outcomes: false as const,
    ready_to_run_backfill: false as const,
    ready_to_use_for_scanner: false as const,
    migration_applied: storageReadiness.migration_readiness.migration_applied,
    table_detected:
      storageReadiness.migration_readiness.historical_candles_table_detected,
  };
}

export function buildHistoricalCandleUpsertPlan(
  input: HistoricalCandlePersistencePlanInput = {},
) {
  return buildHistoricalCandlePersistencePlan(input).upsert_plan;
}

export function buildHistoricalCandlePersistencePlan(
  input: HistoricalCandlePersistencePlanInput = {},
): HistoricalCandlePersistencePlanSummary {
  const storageReadiness =
    input.storage_readiness ?? buildHistoricalCandleStorageReadiness();
  const candles = Array.isArray(input.candles) ? input.candles : [];
  const existingCacheKeys = new Set(
    (input.existing_cache_keys ?? []).map((key) => key.trim()).filter(Boolean),
  );
  const existingCandleKeys = new Set(
    (input.existing_candle_keys ?? []).map((key) => key.trim()).filter(Boolean),
  );
  const seenPersistenceKeys = new Set<string>();
  const seenCacheKeys = new Set<string>();
  const validationStatusCounts: Record<string, number> = {};
  const qualityFlagCounts: Record<string, number> = {};
  const reasonCodes = ["historical_candle_persistence_plan_dry_run_only"];
  const cautionFlags = [
    "dry_run_only",
    "candle_persistence_not_enabled",
    "fetch_run_persistence_not_enabled",
  ];
  const metadataGaps: string[] = [];
  const invalidExamples: HistoricalCandlePersistencePlanSummary["validation_mapping"]["invalid_examples"] = [];
  let validCandles = 0;
  let invalidCandles = 0;
  let duplicateInputCandles = 0;
  let plannedInserts = 0;
  let plannedSkips = 0;
  let plannedInvalidRejections = 0;
  let plannedDuplicatesDeduped = 0;
  let cacheHits = 0;
  let cacheMisses = 0;
  let missingCacheKeyCount = 0;

  for (const candle of candles) {
    const validation = validateHistoricalCandleShape(candle);
    const key = persistenceKey(candle);
    const keyDuplicate = seenPersistenceKeys.has(key);
    const candidateCacheKey = cacheKey(candle);

    if (candidateCacheKey) {
      seenCacheKeys.add(candidateCacheKey);
    } else {
      missingCacheKeyCount += 1;
      pushUnique(metadataGaps, "cache_key_missing");
    }

    if (keyDuplicate) {
      duplicateInputCandles += 1;
      plannedDuplicatesDeduped += 1;
      increment(validationStatusCounts, "duplicate");
      increment(qualityFlagCounts, "duplicate_timestamp");
      pushUnique(reasonCodes, "duplicate_input_candles_detected");
      continue;
    }

    seenPersistenceKeys.add(key);

    for (const reason of validation.reason_codes) {
      pushUnique(reasonCodes, reason);
    }
    for (const field of validation.missing_fields) {
      pushUnique(metadataGaps, field);
    }

    const status = validationStatus(validation.reason_codes);
    increment(validationStatusCounts, status);
    for (const flag of qualityFlags({
      candle,
      reasonCodes: validation.reason_codes,
      duplicate: false,
    })) {
      increment(qualityFlagCounts, flag);
    }

    if (!validation.valid) {
      invalidCandles += 1;
      plannedInvalidRejections += 1;
      if (invalidExamples.length < 6) {
        invalidExamples.push({
          ticker: validation.ticker,
          timestamp: validation.timestamp,
          reason_codes: validation.reason_codes,
          missing_fields: validation.missing_fields,
        });
      }
      continue;
    }

    validCandles += 1;

    if (
      (candidateCacheKey && existingCacheKeys.has(candidateCacheKey)) ||
      existingCandleKeys.has(key)
    ) {
      cacheHits += 1;
      plannedSkips += 1;
    } else {
      cacheMisses += 1;
      plannedInserts += 1;
    }
  }

  if (candles.length === 0) {
    pushUnique(metadataGaps, "candles_missing");
    cautionFlags.push("no_candles_to_plan");
  }
  if (storageReadiness.migration_readiness.migration_applied !== "yes") {
    cautionFlags.push("migration_not_verified_for_persistence");
    pushUnique(reasonCodes, "migration_not_verified");
  }
  if (
    storageReadiness.migration_readiness.historical_candles_table_detected !==
    "yes"
  ) {
    pushUnique(reasonCodes, "historical_candles_table_not_verified");
  }

  return {
    advisory_only: true,
    dry_run_only: true,
    persistence_context: {
      target_table: storageReadiness.proposed_schema.primary_table,
      fetch_runs_table: storageReadiness.proposed_schema.fetch_runs_table,
      provider: storageReadiness.proposed_schema.provider,
      migration_applied: storageReadiness.migration_readiness.migration_applied,
      table_detected:
        storageReadiness.migration_readiness.historical_candles_table_detected,
      fetch_run_audit_required: true,
    },
    input_summary: {
      candles_received: candles.length,
      valid_candles: validCandles,
      invalid_candles: invalidCandles,
      duplicate_input_candles: duplicateInputCandles,
      unique_cache_keys: seenCacheKeys.size,
    },
    upsert_plan: {
      planned_inserts: plannedInserts,
      planned_updates: 0,
      planned_skips: plannedSkips,
      planned_invalid_rejections: plannedInvalidRejections,
      planned_duplicates_deduped: plannedDuplicatesDeduped,
      conflict_target: conflictTarget,
      reuse_before_fetch: true,
      dedupe_required: true,
    },
    cache_analysis: {
      cache_hits: cacheHits,
      cache_misses: cacheMisses,
      existing_cache_keys_checked: existingCacheKeys.size + existingCandleKeys.size,
      missing_cache_key_count: missingCacheKeyCount,
    },
    fetch_run_audit_plan: {
      create_fetch_run_record: false,
      planned_status: "dry_run_only",
      provider_credits_estimated:
        input.fetch_run_metadata?.provider_credits_estimated ?? null,
      provider_credits_used: 0,
      cache_hits: cacheHits,
      cache_misses: cacheMisses,
      candle_count: validCandles,
    },
    validation_mapping: {
      validation_status_counts: validationStatusCounts,
      quality_flag_counts: qualityFlagCounts,
      invalid_examples: invalidExamples,
    },
    readiness: {
      ready_to_plan_upsert: true,
      ready_to_write_fetch_run: false,
      ready_to_persist_candles: false,
      ready_to_create_synthetic_outcomes: false,
      ready_to_run_backfill: false,
      ready_to_use_for_scanner: false,
    },
    safety: {
      advisory_only: true,
      dry_run_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
    recommended_next_steps: [
      "apply_or_verify_historical_candle_storage_migration",
      "review_dry_run_upsert_counts_before_enabling_writes",
      "wire_fetch_run_audit_only_after_separate_approval",
      "keep_historical_candles_out_of_scanner_until_replay_is_approved",
    ],
    reason_codes: reasonCodes,
    caution_flags: cautionFlags,
    metadata_gaps: metadataGaps,
  };
}

export function historicalCandlePersistencePlanJson(
  summary: HistoricalCandlePersistencePlanSummary,
) {
  return JSON.stringify(summary, null, 2);
}
