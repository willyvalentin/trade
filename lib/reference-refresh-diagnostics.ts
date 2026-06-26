import {
  resolvePlanReferencePriceMetadata,
  type PlanReferencePriceMetadata,
} from "@/lib/recommendation-plan-reference";
import type { IntradayIndicators } from "@/lib/intraday-indicators";

export type ReferenceRefreshFailureReason =
  | "provider_no_data"
  | "provider_error"
  | "provider_timeout"
  | "provider_rate_limited"
  | "provider_returned_stale_timestamp"
  | "provider_returned_future_timestamp"
  | "provider_future_beyond_scan_skew_tolerance"
  | "provider_wrong_symbol"
  | "provider_invalid_price"
  | "provider_missing_timestamp"
  | "provider_missing_price"
  | "provider_response_shape_unrecognized"
  | "cache_hit_but_stale"
  | "cache_hit_but_wrong_day"
  | "budget_skipped"
  | "refresh_not_attempted_not_eligible"
  | "unknown_refresh_failure";

export type ReferenceRefreshSource =
  | "candidate_metadata"
  | "intraday_indicator_cache"
  | "twelve_data_intraday"
  | "twelve_data_quote"
  | "unknown";

export type ReferencePriceTimestampKind =
  | "market_data_time"
  | "fetch_time"
  | "cache_time"
  | "unknown";

export type ReferenceRefreshTimestampValidationStatus =
  | "provider_timestamp_current"
  | "provider_timestamp_within_scan_skew_tolerance"
  | "provider_future_beyond_scan_skew_tolerance"
  | "provider_returned_future_timestamp"
  | "provider_timestamp_wrong_trading_day"
  | "provider_timestamp_missing";

export type ReferenceRefreshAttemptDiagnostic = {
  ticker: string;
  provider_symbol: string | null;
  source_attempted: ReferenceRefreshSource;
  timestamp: string | null;
  reference_price_timestamp_kind: ReferencePriceTimestampKind;
  reference_price_timestamp_skew_ms: number | null;
  reference_price_scan_time: string | null;
  reference_price_timestamp_validation_status:
    | ReferenceRefreshTimestampValidationStatus
    | null;
  price: number | null;
  provider: string | null;
  read_path: string | null;
  ny_trading_date: string | null;
  accepted: boolean;
  rejection_reason: ReferenceRefreshFailureReason | null;
  provider_message: string | null;
};

export type ReferenceRefreshDiagnostics = {
  reference_refresh_attempted_count: number;
  reference_refresh_success_count: number;
  reference_refresh_failed_count: number;
  reference_refresh_skipped_budget_count: number;
  reference_refresh_source_counts: Record<string, number>;
  reference_refresh_accepted_source_counts: Record<string, number>;
  reference_refresh_rejected_source_counts: Record<string, number>;
  reference_refresh_failure_reasons: Partial<
    Record<ReferenceRefreshFailureReason, number>
  >;
  reference_refresh_failure_examples: Partial<
    Record<ReferenceRefreshFailureReason, string[]>
  >;
  reference_refresh_attempts: ReferenceRefreshAttemptDiagnostic[];
  reference_refresh_examples_by_ticker: {
    attempted: string[];
    rescued: string[];
    failed: string[];
    skipped_budget: string[];
  };
  reference_refresh_final_references: Record<
    string,
    {
      source: string | null;
      timestamp: string | null;
      timestamp_kind?: ReferencePriceTimestampKind | null;
      timestamp_skew_ms?: number | null;
      scan_time?: string | null;
      provider: string | null;
      read_path: string | null;
      price: number | null;
    }
  >;
  reference_refresh_rescued_from_scanner_cache_reference_too_old_count: number;
  reference_refresh_remaining_stale_reference_blocks: number;
};

export type ReferenceRefreshCandidate = {
  ticker: string;
  intraday_indicators?: IntradayIndicators | null;
  intraday_indicator_source?: "cache" | "fresh" | "unavailable";
  intraday_indicator_cached_at?: string | null;
  intraday_indicator_stale?: boolean;
  reference_price_used_for_plan?: number | null;
  reference_price_source?: string | null;
  reference_price_timestamp?: string | null;
  reference_price_timestamp_kind?: ReferencePriceTimestampKind | null;
  reference_price_timestamp_skew_ms?: number | null;
  reference_price_scan_time?: string | null;
  reference_price_timestamp_validation_status?:
    | ReferenceRefreshTimestampValidationStatus
    | null;
  reference_price_symbol?: string | null;
  reference_price_provider?: string | null;
  reference_price_read_path?: string | null;
};

export type ReferenceRefreshProviderResult = {
  ticker: string;
  indicators: IntradayIndicators | null;
  source: "cache" | "fresh" | "unavailable";
  cached_at: string | null;
  timestamp_kind?: ReferencePriceTimestampKind | null;
  stale: boolean;
  warnings: string[];
  provider?: string | null;
  provider_symbol?: string | null;
  provider_message?: string | null;
  read_path?: string | null;
};

export type ReferenceRefreshResult<T extends ReferenceRefreshCandidate> = {
  candidates: T[];
  diagnostics: ReferenceRefreshDiagnostics;
};

const refreshReferenceSource = "provider_intraday_reference_refresh";
const refreshReferenceReadPath =
  "reference_refresh.intraday_indicators.current_intraday_price";
export const REFERENCE_REFRESH_SCAN_TIME_SKEW_TOLERANCE_MS = 120_000;

function emptyDiagnostics(): ReferenceRefreshDiagnostics {
  return {
    reference_refresh_attempted_count: 0,
    reference_refresh_success_count: 0,
    reference_refresh_failed_count: 0,
    reference_refresh_skipped_budget_count: 0,
    reference_refresh_source_counts: {},
    reference_refresh_accepted_source_counts: {},
    reference_refresh_rejected_source_counts: {},
    reference_refresh_failure_reasons: {},
    reference_refresh_failure_examples: {},
    reference_refresh_attempts: [],
    reference_refresh_examples_by_ticker: {
      attempted: [],
      rescued: [],
      failed: [],
      skipped_budget: [],
    },
    reference_refresh_final_references: {},
    reference_refresh_rescued_from_scanner_cache_reference_too_old_count: 0,
    reference_refresh_remaining_stale_reference_blocks: 0,
  };
}

function increment(record: Record<string, number>, key: string | null | undefined) {
  const normalized = key && key.trim() ? key.trim() : "unknown";
  record[normalized] = (record[normalized] ?? 0) + 1;
}

function incrementFailure(
  diagnostics: ReferenceRefreshDiagnostics,
  reason: ReferenceRefreshFailureReason,
  example: string,
) {
  diagnostics.reference_refresh_failure_reasons[reason] =
    (diagnostics.reference_refresh_failure_reasons[reason] ?? 0) + 1;
  const examples = diagnostics.reference_refresh_failure_examples[reason] ?? [];
  if (examples.length < 8) {
    examples.push(example);
  }
  diagnostics.reference_refresh_failure_examples[reason] = examples;
}

function staleBlockReason(metadata: PlanReferencePriceMetadata) {
  return (
    metadata.plan_reference_metadata_trace.reference_price_stale_block_reason ??
    (metadata.reference_price_used_for_plan === null
      ? "missing_fresh_reference_price"
      : null)
  );
}

function shouldAttemptRefresh(metadata: PlanReferencePriceMetadata) {
  const reason = staleBlockReason(metadata);

  return (
    reason === "scanner_cache_reference_too_old" ||
    reason === "missing_fresh_reference_price" ||
    reason === "missing_reference_timestamp" ||
    reason === "missing_reference_source" ||
    reason === "stale_reference_price" ||
    reason === "future_reference_timestamp"
  );
}

function finalReference(metadata: PlanReferencePriceMetadata) {
  return {
    source: metadata.reference_price_source,
    timestamp: metadata.reference_price_timestamp,
    timestamp_kind: null,
    timestamp_skew_ms: null,
    scan_time: null,
    provider: metadata.reference_price_provider,
    read_path: metadata.reference_price_read_path,
    price: metadata.reference_price_used_for_plan,
  };
}

function priceFromResult(result: ReferenceRefreshProviderResult | null) {
  const price = result?.indicators?.latestPrice;
  return typeof price === "number" && Number.isFinite(price) ? price : null;
}

function providerMessage(result: ReferenceRefreshProviderResult | null) {
  const messages = [
    result?.provider_message,
    ...(result?.warnings ?? []),
  ].filter((message): message is string => Boolean(message && message.trim()));

  return messages.length > 0 ? messages.slice(0, 3).join("; ").slice(0, 240) : null;
}

function nyTradingDate(value: Date | string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const part = (type: string) =>
    parts.find((entry) => entry.type === type)?.value ?? "";

  return `${part("year")}-${part("month")}-${part("day")}`;
}

function isoOrNull(value: Date | string | number | null | undefined) {
  if (value === null || value === undefined) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function referenceSourceFromResult(
  result: ReferenceRefreshProviderResult | null,
): ReferenceRefreshSource {
  if (!result) return "unknown";
  if (result.source === "cache") return "intraday_indicator_cache";
  if (result.source === "fresh") return "twelve_data_intraday";
  if (result.provider === "twelve_data_quote") return "twelve_data_quote";

  return "twelve_data_intraday";
}

function timestampKindFromResult(
  result: ReferenceRefreshProviderResult | null,
): ReferencePriceTimestampKind {
  if (!result) return "unknown";
  if (
    result.timestamp_kind === "market_data_time" ||
    result.timestamp_kind === "fetch_time" ||
    result.timestamp_kind === "cache_time" ||
    result.timestamp_kind === "unknown"
  ) {
    return result.timestamp_kind;
  }
  if (result.source === "cache") return "cache_time";
  if (result.source === "fresh") return "fetch_time";

  return "unknown";
}

function timestampValidationForResult(input: {
  result: ReferenceRefreshProviderResult | null;
  now: Date | string | number;
}) {
  const scanTime = isoOrNull(input.now);
  const timestamp = isoOrNull(input.result?.cached_at);
  const kind = timestampKindFromResult(input.result);

  if (!timestamp || !scanTime) {
    return {
      kind,
      skewMs: null,
      scanTime,
      status: "provider_timestamp_missing" as const,
      rejectionReason: "provider_missing_timestamp" as const,
    };
  }

  const timestampDate = new Date(timestamp);
  const scanDate = new Date(scanTime);
  const skewMs = timestampDate.getTime() - scanDate.getTime();
  const resultTradingDate = nyTradingDate(timestamp);
  const currentTradingDate = nyTradingDate(scanTime);

  if (
    resultTradingDate !== null &&
    currentTradingDate !== null &&
    resultTradingDate !== currentTradingDate
  ) {
    return {
      kind,
      skewMs,
      scanTime,
      status: "provider_timestamp_wrong_trading_day" as const,
      rejectionReason:
        kind === "cache_time"
          ? ("cache_hit_but_wrong_day" as const)
          : skewMs > 0
            ? ("provider_returned_future_timestamp" as const)
            : ("provider_returned_stale_timestamp" as const),
    };
  }

  if (skewMs <= 0) {
    return {
      kind,
      skewMs,
      scanTime,
      status: "provider_timestamp_current" as const,
      rejectionReason: null,
    };
  }

  if (kind === "fetch_time" && skewMs <= REFERENCE_REFRESH_SCAN_TIME_SKEW_TOLERANCE_MS) {
    return {
      kind,
      skewMs,
      scanTime,
      status: "provider_timestamp_within_scan_skew_tolerance" as const,
      rejectionReason: null,
    };
  }

  if (kind === "fetch_time") {
    return {
      kind,
      skewMs,
      scanTime,
      status: "provider_future_beyond_scan_skew_tolerance" as const,
      rejectionReason: "provider_future_beyond_scan_skew_tolerance" as const,
    };
  }

  return {
    kind,
    skewMs,
    scanTime,
    status: "provider_returned_future_timestamp" as const,
    rejectionReason: "provider_returned_future_timestamp" as const,
  };
}

function normalizeProviderFailureReason(
  message: string | null | undefined,
): ReferenceRefreshFailureReason {
  const normalized = (message ?? "").toLowerCase();
  if (!normalized) return "provider_error";
  if (
    normalized.includes("rate") ||
    normalized.includes("429") ||
    normalized.includes("quota") ||
    normalized.includes("limit")
  ) {
    return "provider_rate_limited";
  }
  if (
    normalized.includes("timeout") ||
    normalized.includes("timed out") ||
    normalized.includes("abort")
  ) {
    return "provider_timeout";
  }
  if (
    normalized.includes("shape") ||
    normalized.includes("unrecognized") ||
    normalized.includes("invalid json") ||
    normalized.includes("parse")
  ) {
    return "provider_response_shape_unrecognized";
  }

  return "provider_error";
}

function exampleFor(
  ticker: string,
  timestamp: string | null,
  reason?: ReferenceRefreshFailureReason | null,
  now?: Date | string | number,
) {
  if (!timestamp) return ticker;
  if (
    reason === "provider_returned_future_timestamp" ||
    reason === "provider_future_beyond_scan_skew_tolerance"
  ) {
    const scanTime = isoOrNull(now);
    return scanTime ? `${ticker}@${timestamp} scan@${scanTime}` : `${ticker}@${timestamp}`;
  }

  return `${ticker}@${timestamp}`;
}

function attemptDiagnostic(input: {
  ticker: string;
  result: ReferenceRefreshProviderResult | null;
  source: ReferenceRefreshSource;
  accepted: boolean;
  rejectionReason: ReferenceRefreshFailureReason | null;
  now: Date | string | number;
}): ReferenceRefreshAttemptDiagnostic {
  const timestampValidation = timestampValidationForResult({
    result: input.result,
    now: input.now,
  });

  return {
    ticker: input.ticker,
    provider_symbol: input.result?.provider_symbol ?? input.result?.ticker ?? null,
    source_attempted: input.source,
    timestamp: input.result?.cached_at ?? null,
    reference_price_timestamp_kind: timestampValidation.kind,
    reference_price_timestamp_skew_ms: timestampValidation.skewMs,
    reference_price_scan_time: timestampValidation.scanTime,
    reference_price_timestamp_validation_status:
      timestampValidation.status === "provider_timestamp_missing" && !input.result
        ? null
        : timestampValidation.status,
    price: priceFromResult(input.result),
    provider: input.result ? input.result.provider ?? "twelve_data" : null,
    read_path: input.result ? input.result.read_path ?? refreshReferenceReadPath : null,
    ny_trading_date: nyTradingDate(input.result?.cached_at),
    accepted: input.accepted,
    rejection_reason: input.rejectionReason,
    provider_message: providerMessage(input.result),
  };
}

function failureReasonFromAfter(
  after: PlanReferencePriceMetadata,
  result: ReferenceRefreshProviderResult,
  now: Date | string | number,
): ReferenceRefreshFailureReason {
  const reason = staleBlockReason(after);
  const resultSource = referenceSourceFromResult(result);
  const timestampValidation = timestampValidationForResult({ result, now });
  const resultTradingDate = nyTradingDate(result.cached_at);
  const currentTradingDate = nyTradingDate(now);

  if (
    resultSource === "intraday_indicator_cache" &&
    resultTradingDate !== null &&
    currentTradingDate !== null &&
    resultTradingDate !== currentTradingDate
  ) {
    return "cache_hit_but_wrong_day";
  }
  if (reason === "future_reference_timestamp") {
    return timestampValidation.rejectionReason ===
      "provider_future_beyond_scan_skew_tolerance"
      ? "provider_future_beyond_scan_skew_tolerance"
      : "provider_returned_future_timestamp";
  }
  if (reason === "missing_reference_timestamp") {
    return "provider_missing_timestamp";
  }
  if (
    reason === "missing_fresh_reference_price" ||
    after.reference_price_used_for_plan === null
  ) {
    return priceFromResult(result) === null
      ? "provider_missing_price"
      : "unknown_refresh_failure";
  }
  if (
    reason === "stale_reference_price" ||
    reason === "scanner_cache_reference_too_old"
  ) {
    return resultSource === "intraday_indicator_cache"
      ? "cache_hit_but_stale"
      : "provider_returned_stale_timestamp";
  }

  return "unknown_refresh_failure";
}

function rejectionReasonForResult(
  result: ReferenceRefreshProviderResult,
  candidateTicker: string,
  now: Date | string | number,
): ReferenceRefreshFailureReason | null {
  const source = referenceSourceFromResult(result);
  const message = providerMessage(result);
  const price = result.indicators?.latestPrice;
  const timestampValidation = timestampValidationForResult({ result, now });
  const resultTradingDate = nyTradingDate(result.cached_at);
  const currentTradingDate = nyTradingDate(now);

  if (result.ticker.trim().toUpperCase() !== candidateTicker.toUpperCase()) {
    return "provider_wrong_symbol";
  }
  if (!result.indicators) {
    return message ? normalizeProviderFailureReason(message) : "provider_no_data";
  }
  if (price === null || price === undefined) {
    return "provider_missing_price";
  }
  if (typeof price !== "number" || !Number.isFinite(price) || price <= 0) {
    return "provider_invalid_price";
  }
  if (!result.cached_at) {
    return "provider_missing_timestamp";
  }
  if (
    timestampValidation.rejectionReason === "provider_returned_future_timestamp" ||
    timestampValidation.rejectionReason ===
      "provider_future_beyond_scan_skew_tolerance" ||
    timestampValidation.rejectionReason === "provider_returned_stale_timestamp"
  ) {
    return timestampValidation.rejectionReason;
  }
  if (
    source === "intraday_indicator_cache" &&
    resultTradingDate !== null &&
    currentTradingDate !== null &&
    resultTradingDate !== currentTradingDate
  ) {
    return "cache_hit_but_wrong_day";
  }
  if (result.stale) {
    return source === "intraday_indicator_cache"
      ? "cache_hit_but_stale"
      : "provider_returned_stale_timestamp";
  }

  return null;
}

function refreshedCandidate<T extends ReferenceRefreshCandidate>(
  candidate: T,
  result: ReferenceRefreshProviderResult,
  now: Date | string | number,
): T {
  const timestampValidation = timestampValidationForResult({ result, now });

  return {
    ...candidate,
    intraday_indicators: result.indicators,
    intraday_indicator_source: result.source,
    intraday_indicator_cached_at: result.cached_at,
    intraday_indicator_stale: result.stale,
    reference_price_used_for_plan: result.indicators?.latestPrice ?? null,
    reference_price_source: refreshReferenceSource,
    reference_price_timestamp: result.cached_at,
    reference_price_timestamp_kind: timestampValidation.kind,
    reference_price_timestamp_skew_ms: timestampValidation.skewMs,
    reference_price_scan_time: timestampValidation.scanTime,
    reference_price_timestamp_validation_status: timestampValidation.status,
    reference_price_symbol: candidate.ticker,
    reference_price_provider: "twelve_data",
    reference_price_read_path: refreshReferenceReadPath,
  };
}

function validationNowForRefresh(
  result: ReferenceRefreshProviderResult,
  now: Date | string | number,
) {
  const timestampValidation = timestampValidationForResult({ result, now });
  return timestampValidation.status ===
    "provider_timestamp_within_scan_skew_tolerance"
    ? result.cached_at ?? now
    : now;
}

function finalReferenceFromRefresh(
  metadata: PlanReferencePriceMetadata,
  result: ReferenceRefreshProviderResult,
  now: Date | string | number,
) {
  const timestampValidation = timestampValidationForResult({ result, now });

  return {
    source: metadata.reference_price_source,
    timestamp: metadata.reference_price_timestamp,
    timestamp_kind: timestampValidation.kind,
    timestamp_skew_ms: timestampValidation.skewMs,
    scan_time: timestampValidation.scanTime,
    provider: metadata.reference_price_provider,
    read_path: metadata.reference_price_read_path,
    price: metadata.reference_price_used_for_plan,
  };
}

export async function refreshSelectedCandidateReferences<
  T extends ReferenceRefreshCandidate,
>({
  candidates,
  maxAttempts,
  now = new Date(),
  fetchIntradayIndicators,
}: {
  candidates: T[];
  maxAttempts: number;
  now?: Date | string | number;
  fetchIntradayIndicators: (
    ticker: string,
  ) => Promise<ReferenceRefreshProviderResult>;
}): Promise<ReferenceRefreshResult<T>> {
  const diagnostics = emptyDiagnostics();
  const refreshedCandidates: T[] = [];
  const cap = Math.max(0, Math.floor(maxAttempts));

  for (const candidate of candidates) {
    const before = resolvePlanReferencePriceMetadata(candidate, {
      enforceFreshness: true,
      now,
    });
    const beforeReason = staleBlockReason(before);

    if (!shouldAttemptRefresh(before)) {
      refreshedCandidates.push(candidate);
      if (
        before.plan_reference_metadata_trace.reference_price_rejected_read_path &&
        before.reference_price_used_for_plan !== null
      ) {
        diagnostics.reference_refresh_final_references[candidate.ticker] =
          finalReference(before);
        increment(
          diagnostics.reference_refresh_source_counts,
          before.reference_price_source,
        );
      }
      continue;
    }

    if (diagnostics.reference_refresh_attempted_count >= cap) {
      diagnostics.reference_refresh_skipped_budget_count += 1;
      diagnostics.reference_refresh_examples_by_ticker.skipped_budget.push(
        candidate.ticker,
      );
      diagnostics.reference_refresh_remaining_stale_reference_blocks += 1;
      increment(diagnostics.reference_refresh_source_counts, "unknown");
      increment(diagnostics.reference_refresh_rejected_source_counts, "unknown");
      incrementFailure(diagnostics, "budget_skipped", candidate.ticker);
      diagnostics.reference_refresh_attempts.push(
        attemptDiagnostic({
          ticker: candidate.ticker,
          result: null,
          source: "unknown",
          accepted: false,
          rejectionReason: "budget_skipped",
          now,
        }),
      );
      refreshedCandidates.push(candidate);
      continue;
    }

    diagnostics.reference_refresh_attempted_count += 1;
    diagnostics.reference_refresh_examples_by_ticker.attempted.push(candidate.ticker);

    try {
      const result = await fetchIntradayIndicators(candidate.ticker);
      const source = referenceSourceFromResult(result);
      increment(diagnostics.reference_refresh_source_counts, source);
      const preflightRejection = rejectionReasonForResult(
        result,
        candidate.ticker,
        now,
      );

      if (preflightRejection) {
        diagnostics.reference_refresh_failed_count += 1;
        diagnostics.reference_refresh_examples_by_ticker.failed.push(
          candidate.ticker,
        );
        diagnostics.reference_refresh_remaining_stale_reference_blocks += 1;
        increment(diagnostics.reference_refresh_rejected_source_counts, source);
        incrementFailure(
          diagnostics,
          preflightRejection,
          exampleFor(candidate.ticker, result.cached_at, preflightRejection, now),
        );
        diagnostics.reference_refresh_attempts.push(
          attemptDiagnostic({
            ticker: candidate.ticker,
            result,
            source,
            accepted: false,
            rejectionReason: preflightRejection,
            now,
          }),
        );
        refreshedCandidates.push(candidate);
        continue;
      }

      const candidateWithRefresh = refreshedCandidate(candidate, result, now);
      const after = resolvePlanReferencePriceMetadata(candidateWithRefresh, {
        enforceFreshness: true,
        now: validationNowForRefresh(result, now),
      });
      const afterReason = staleBlockReason(after);

      if (after.reference_price_used_for_plan === null || afterReason) {
        const rejectionReason = failureReasonFromAfter(after, result, now);
        diagnostics.reference_refresh_failed_count += 1;
        diagnostics.reference_refresh_examples_by_ticker.failed.push(
          candidate.ticker,
        );
        diagnostics.reference_refresh_remaining_stale_reference_blocks += 1;
        increment(diagnostics.reference_refresh_rejected_source_counts, source);
        incrementFailure(
          diagnostics,
          rejectionReason,
          exampleFor(candidate.ticker, result.cached_at, rejectionReason, now),
        );
        diagnostics.reference_refresh_attempts.push(
          attemptDiagnostic({
            ticker: candidate.ticker,
            result,
            source,
            accepted: false,
            rejectionReason,
            now,
          }),
        );
        refreshedCandidates.push(candidate);
        continue;
      }

      diagnostics.reference_refresh_success_count += 1;
      diagnostics.reference_refresh_examples_by_ticker.rescued.push(candidate.ticker);
      diagnostics.reference_refresh_final_references[candidate.ticker] =
        finalReferenceFromRefresh(after, result, now);
      increment(
        diagnostics.reference_refresh_accepted_source_counts,
        source,
      );
      diagnostics.reference_refresh_attempts.push(
        attemptDiagnostic({
          ticker: candidate.ticker,
          result,
          source,
          accepted: true,
          rejectionReason: null,
          now,
        }),
      );
      if (beforeReason === "scanner_cache_reference_too_old") {
        diagnostics.reference_refresh_rescued_from_scanner_cache_reference_too_old_count +=
          1;
      }
      refreshedCandidates.push(candidateWithRefresh);
    } catch (error) {
      diagnostics.reference_refresh_failed_count += 1;
      diagnostics.reference_refresh_examples_by_ticker.failed.push(candidate.ticker);
      diagnostics.reference_refresh_remaining_stale_reference_blocks += 1;
      const message = error instanceof Error ? error.message : null;
      const rejectionReason = normalizeProviderFailureReason(message);
      increment(diagnostics.reference_refresh_source_counts, "unknown");
      increment(diagnostics.reference_refresh_rejected_source_counts, "unknown");
      incrementFailure(diagnostics, rejectionReason, candidate.ticker);
      diagnostics.reference_refresh_attempts.push(
        attemptDiagnostic({
          ticker: candidate.ticker,
          result: null,
          source: "unknown",
          accepted: false,
          rejectionReason,
          now,
        }),
      );
      refreshedCandidates.push(candidate);
    }
  }

  return {
    candidates: refreshedCandidates,
    diagnostics,
  };
}
