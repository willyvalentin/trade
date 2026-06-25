import {
  resolvePlanReferencePriceMetadata,
  type PlanReferencePriceMetadata,
} from "@/lib/recommendation-plan-reference";
import type { IntradayIndicators } from "@/lib/intraday-indicators";

export type ReferenceRefreshDiagnostics = {
  reference_refresh_attempted_count: number;
  reference_refresh_success_count: number;
  reference_refresh_failed_count: number;
  reference_refresh_skipped_budget_count: number;
  reference_refresh_source_counts: Record<string, number>;
  reference_refresh_failure_reasons: Record<string, number>;
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
  reference_price_symbol?: string | null;
  reference_price_provider?: string | null;
  reference_price_read_path?: string | null;
};

export type ReferenceRefreshProviderResult = {
  ticker: string;
  indicators: IntradayIndicators | null;
  source: "cache" | "fresh" | "unavailable";
  cached_at: string | null;
  stale: boolean;
  warnings: string[];
};

export type ReferenceRefreshResult<T extends ReferenceRefreshCandidate> = {
  candidates: T[];
  diagnostics: ReferenceRefreshDiagnostics;
};

const refreshReferenceSource = "provider_intraday_reference_refresh";
const refreshReferenceReadPath =
  "reference_refresh.intraday_indicators.current_intraday_price";

function emptyDiagnostics(): ReferenceRefreshDiagnostics {
  return {
    reference_refresh_attempted_count: 0,
    reference_refresh_success_count: 0,
    reference_refresh_failed_count: 0,
    reference_refresh_skipped_budget_count: 0,
    reference_refresh_source_counts: {},
    reference_refresh_failure_reasons: {},
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
    provider: metadata.reference_price_provider,
    read_path: metadata.reference_price_read_path,
    price: metadata.reference_price_used_for_plan,
  };
}

function refreshedCandidate<T extends ReferenceRefreshCandidate>(
  candidate: T,
  result: ReferenceRefreshProviderResult,
): T {
  return {
    ...candidate,
    intraday_indicators: result.indicators,
    intraday_indicator_source: result.source,
    intraday_indicator_cached_at: result.cached_at,
    intraday_indicator_stale: result.stale,
    reference_price_used_for_plan: result.indicators?.latestPrice ?? null,
    reference_price_source: refreshReferenceSource,
    reference_price_timestamp: result.cached_at,
    reference_price_symbol: candidate.ticker,
    reference_price_provider: "twelve_data",
    reference_price_read_path: refreshReferenceReadPath,
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
      refreshedCandidates.push(candidate);
      continue;
    }

    diagnostics.reference_refresh_attempted_count += 1;
    diagnostics.reference_refresh_examples_by_ticker.attempted.push(candidate.ticker);

    try {
      const result = await fetchIntradayIndicators(candidate.ticker);

      if (result.ticker.trim().toUpperCase() !== candidate.ticker.toUpperCase()) {
        throw new Error("wrong_symbol_returned");
      }
      if (!result.indicators || result.indicators.latestPrice === null) {
        throw new Error("provider_data_unavailable");
      }
      if (result.stale) {
        throw new Error("stale_reference_price");
      }

      const candidateWithRefresh = refreshedCandidate(candidate, result);
      const after = resolvePlanReferencePriceMetadata(candidateWithRefresh, {
        enforceFreshness: true,
        now,
      });
      const afterReason = staleBlockReason(after);

      if (after.reference_price_used_for_plan === null || afterReason) {
        diagnostics.reference_refresh_failed_count += 1;
        diagnostics.reference_refresh_examples_by_ticker.failed.push(
          candidate.ticker,
        );
        diagnostics.reference_refresh_remaining_stale_reference_blocks += 1;
        increment(
          diagnostics.reference_refresh_failure_reasons,
          afterReason ?? "missing_fresh_reference_price",
        );
        refreshedCandidates.push(candidate);
        continue;
      }

      diagnostics.reference_refresh_success_count += 1;
      diagnostics.reference_refresh_examples_by_ticker.rescued.push(candidate.ticker);
      diagnostics.reference_refresh_final_references[candidate.ticker] =
        finalReference(after);
      increment(
        diagnostics.reference_refresh_source_counts,
        after.reference_price_source,
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
      increment(
        diagnostics.reference_refresh_failure_reasons,
        error instanceof Error && error.message
          ? error.message
          : "provider_data_unavailable",
      );
      refreshedCandidates.push(candidate);
    }
  }

  return {
    candidates: refreshedCandidates,
    diagnostics,
  };
}
