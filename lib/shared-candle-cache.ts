export const sharedCandleCacheContractVersion = "shared_candle_cache_v1" as const;

export type SharedCandleValidationStatus =
  | "valid"
  | "invalid"
  | "lookahead_rejected"
  | "stale";

export type SharedCandleFreshnessStatus =
  | "fresh"
  | "slightly_stale_reusable"
  | "stale_refreshable"
  | "expired_or_invalid";

export type SharedCandleCacheHitStatus =
  | "exact_hit"
  | "range_hit"
  | "partial_hit"
  | "miss";

export type SharedCandleCacheProviderState =
  | "available"
  | "unknown"
  | "provider_unavailable";

export type SharedCandleCacheCandle = {
  contract_version: typeof sharedCandleCacheContractVersion;
  provider: string;
  ticker: string;
  interval: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
  timezone: string;
  adjusted: boolean;
  market_session: string;
  fetched_at: string;
  source_request_id: string;
  validation_status: SharedCandleValidationStatus;
};

export type SharedCandleCacheKeyParts = {
  provider: string;
  ticker: string;
  interval: string;
  timestamp: string;
  timezone: string;
  adjusted: boolean;
};

export type SharedCandleCacheRangeRequest = {
  provider: string;
  ticker: string;
  interval: string;
  start: string;
  end: string;
  timezone: string;
  adjusted: boolean;
  analysis_cutoff?: string | null;
};

export type SharedCandleCacheLookupResult = {
  contract_version: typeof sharedCandleCacheContractVersion;
  status: SharedCandleCacheHitStatus;
  candles: SharedCandleCacheCandle[];
  missing_ranges: Array<{ start: string; end: string }>;
  stale_count: number;
  rejected_lookahead_count: number;
  provenance: {
    cache_key: string;
    hit_count: number;
    miss_count: number;
    partial_count: number;
  };
};

export type SharedCandleCacheMergeResult = {
  contract_version: typeof sharedCandleCacheContractVersion;
  accepted_count: number;
  rejected_count: number;
  duplicate_count: number;
  invalid_count: number;
  lookahead_rejected_count: number;
  cache_size: number;
};

export type SharedCandleCacheSnapshot = {
  contract_version: typeof sharedCandleCacheContractVersion;
  cache_size: number;
  stale_entry_count: number;
  max_entries: number;
  ttl_ms: number;
  oldest_entry_at: string | null;
  newest_entry_at: string | null;
};

export type SharedCandleProviderRequest = SharedCandleCacheRangeRequest & {
  request_id: string;
  missing_ranges: Array<{ start: string; end: string }>;
};

export type SharedCandleProviderResult = {
  provider_attempted: boolean;
  provider_call_count: number;
  requested_ticker_count: number;
  returned_candle_count: number;
  response_latency_ms: number | null;
  timeout: boolean;
  rate_limit: boolean;
  provider_error_category: string | null;
  estimated_credits: number | null;
  actual_credits: number | null;
  candles: SharedCandleCacheCandle[];
};

export type SharedCandleCacheCollectionResult = {
  contract_version: typeof sharedCandleCacheContractVersion;
  cache_lookup: SharedCandleCacheLookupResult;
  provider_call_attempted: boolean;
  provider_call_executed: boolean;
  provider_result: SharedCandleProviderResult | null;
  merge_result: SharedCandleCacheMergeResult | null;
  candles: SharedCandleCacheCandle[];
  deferred_reason: string | null;
  no_effect_boundary: {
    recommendations_changed: false;
    ranking_changed: false;
    execution_changed: false;
    provider_called_when_disabled: false;
    writes_executed: false;
  };
};

type CacheEntry = {
  candle: SharedCandleCacheCandle;
  cache_key: string;
  inserted_at_ms: number;
};

export type SharedCandleCache = {
  lookupExact: (
    parts: SharedCandleCacheKeyParts,
    options?: { now?: Date | string | null; analysis_cutoff?: string | null },
  ) => SharedCandleCacheLookupResult;
  lookupRange: (
    request: SharedCandleCacheRangeRequest,
    options?: { now?: Date | string | null },
  ) => SharedCandleCacheLookupResult;
  merge: (
    candles: SharedCandleCacheCandle[],
    options?: { now?: Date | string | null; analysis_cutoff?: string | null },
  ) => SharedCandleCacheMergeResult;
  snapshot: (options?: { now?: Date | string | null }) => SharedCandleCacheSnapshot;
  cleanup: (options?: { now?: Date | string | null }) => number;
};

export type SharedCandleRequestCoalescerSnapshot = {
  contract_version: typeof sharedCandleCacheContractVersion;
  in_flight_count: number;
  completed_count: number;
  joined_request_count: number;
  stale_cleanup_count: number;
  entries: Array<{
    request_key: string;
    first_requester: string;
    joined_count: number;
    started_at: string;
    completed_at: string | null;
    completion_status: "in_flight" | "completed" | "failed" | "timeout";
    provider_call_executed: boolean;
    cache_satisfied: boolean;
    timeout: boolean;
  }>;
};

type CoalescerEntry<T> = {
  request_key: string;
  first_requester: string;
  joined_count: number;
  started_at_ms: number;
  started_at: string;
  completed_at: string | null;
  completion_status: "in_flight" | "completed" | "failed" | "timeout";
  provider_call_executed: boolean;
  cache_satisfied: boolean;
  timeout: boolean;
  promise: Promise<T>;
};

function asDate(value: Date | string | null | undefined): Date {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value;
  }

  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) {
      return parsed;
    }
  }

  return new Date();
}

function parseTime(value: string): number | null {
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) ? timestamp : null;
}

function normalizeText(value: string): string {
  return value.trim().toUpperCase();
}

export function buildSharedCandleCacheKey(parts: SharedCandleCacheKeyParts): string {
  return [
    normalizeText(parts.provider),
    normalizeText(parts.ticker),
    parts.interval.trim().toLowerCase(),
    new Date(parts.timestamp).toISOString(),
    parts.timezone.trim() || "UTC",
    parts.adjusted ? "adjusted" : "raw",
  ].join("|");
}

export function buildSharedCandleRangeKey(
  request: SharedCandleCacheRangeRequest,
): string {
  return [
    normalizeText(request.provider),
    normalizeText(request.ticker),
    request.interval.trim().toLowerCase(),
    new Date(request.start).toISOString(),
    new Date(request.end).toISOString(),
    request.timezone.trim() || "UTC",
    request.adjusted ? "adjusted" : "raw",
  ].join("|");
}

function intervalMs(interval: string): number {
  const normalized = interval.trim().toLowerCase();
  const match = normalized.match(/^(\d+)(m|min|minute|minutes)$/);
  if (match) {
    return Number(match[1]) * 60_000;
  }

  if (normalized === "1h" || normalized === "60m") {
    return 60 * 60_000;
  }

  return 60_000;
}

function expectedTimestamps(request: SharedCandleCacheRangeRequest): string[] {
  const start = parseTime(request.start);
  const end = parseTime(request.end);
  if (start === null || end === null || end < start) {
    return [];
  }

  const step = intervalMs(request.interval);
  const values: string[] = [];
  for (let time = start; time <= end; time += step) {
    values.push(new Date(time).toISOString());
  }
  return values;
}

function collapseMissing(timestamps: string[], interval: string) {
  const step = intervalMs(interval);
  const ranges: Array<{ start: string; end: string }> = [];
  let start: number | null = null;
  let previous: number | null = null;

  for (const timestamp of timestamps) {
    const time = parseTime(timestamp);
    if (time === null) {
      continue;
    }

    if (start === null || previous === null || time !== previous + step) {
      if (start !== null && previous !== null) {
        ranges.push({
          start: new Date(start).toISOString(),
          end: new Date(previous).toISOString(),
        });
      }
      start = time;
    }

    previous = time;
  }

  if (start !== null && previous !== null) {
    ranges.push({
      start: new Date(start).toISOString(),
      end: new Date(previous).toISOString(),
    });
  }

  return ranges;
}

function sortCandles(candles: SharedCandleCacheCandle[]) {
  return [...candles].sort(
    (left, right) =>
      (parseTime(left.timestamp) ?? 0) - (parseTime(right.timestamp) ?? 0),
  );
}

export function validateSharedCandle(
  candle: SharedCandleCacheCandle,
  options?: { analysis_cutoff?: string | null },
): SharedCandleValidationStatus {
  const candleTime = parseTime(candle.timestamp);
  if (candleTime === null) {
    return "invalid";
  }

  const cutoff = options?.analysis_cutoff ? parseTime(options.analysis_cutoff) : null;
  if (cutoff !== null && candleTime > cutoff) {
    return "lookahead_rejected";
  }

  const prices = [candle.open, candle.high, candle.low, candle.close];
  if (prices.some((value) => !Number.isFinite(value))) {
    return "invalid";
  }

  if (candle.high < candle.low || candle.open < 0 || candle.close < 0) {
    return "invalid";
  }

  if (candle.volume !== null && (!Number.isFinite(candle.volume) || candle.volume < 0)) {
    return "invalid";
  }

  return "valid";
}

export function evaluateSharedCandleFreshness(input: {
  candle: SharedCandleCacheCandle;
  now?: Date | string | null;
  ttl_ms?: number | null;
  analysis_cutoff?: string | null;
}): SharedCandleFreshnessStatus {
  const validation = validateSharedCandle(input.candle, {
    analysis_cutoff: input.analysis_cutoff,
  });
  if (validation === "invalid" || validation === "lookahead_rejected") {
    return "expired_or_invalid";
  }

  const now = asDate(input.now);
  const fetchedAt = parseTime(input.candle.fetched_at);
  if (fetchedAt === null) {
    return "expired_or_invalid";
  }

  const ttlMs = input.ttl_ms ?? 5 * 60_000;
  const ageMs = Math.max(0, now.getTime() - fetchedAt);
  if (ageMs <= ttlMs) {
    return "fresh";
  }
  if (ageMs <= ttlMs * 3) {
    return "slightly_stale_reusable";
  }
  if (ageMs <= ttlMs * 12) {
    return "stale_refreshable";
  }
  return "expired_or_invalid";
}

export function createSharedCandleCache(options?: {
  max_entries?: number;
  ttl_ms?: number;
}): SharedCandleCache {
  const maxEntries = Math.max(1, Math.floor(options?.max_entries ?? 500));
  const ttlMs = Math.max(1_000, Math.floor(options?.ttl_ms ?? 5 * 60_000));
  const entries = new Map<string, CacheEntry>();

  function cleanup(options?: { now?: Date | string | null }) {
    const now = asDate(options?.now);
    let removed = 0;
    for (const [key, entry] of entries) {
      const freshness = evaluateSharedCandleFreshness({
        candle: entry.candle,
        now,
        ttl_ms: ttlMs,
      });
      if (freshness === "expired_or_invalid") {
        entries.delete(key);
        removed += 1;
      }
    }
    return removed;
  }

  function enforceLimit() {
    if (entries.size <= maxEntries) {
      return;
    }

    const sorted = [...entries.entries()].sort((left, right) => {
      const age = left[1].inserted_at_ms - right[1].inserted_at_ms;
      return age === 0 ? left[0].localeCompare(right[0]) : age;
    });

    for (const [key] of sorted.slice(0, Math.max(0, entries.size - maxEntries))) {
      entries.delete(key);
    }
  }

  function merge(
    candles: SharedCandleCacheCandle[],
    options?: { now?: Date | string | null; analysis_cutoff?: string | null },
  ): SharedCandleCacheMergeResult {
    const now = asDate(options?.now);
    let accepted = 0;
    let rejected = 0;
    let duplicate = 0;
    let invalid = 0;
    let lookaheadRejected = 0;

    for (const candle of sortCandles(candles)) {
      const validation = validateSharedCandle(candle, {
        analysis_cutoff: options?.analysis_cutoff,
      });
      if (validation !== "valid") {
        rejected += 1;
        if (validation === "lookahead_rejected") {
          lookaheadRejected += 1;
        } else {
          invalid += 1;
        }
        continue;
      }

      const key = buildSharedCandleCacheKey(candle);
      if (entries.has(key)) {
        duplicate += 1;
      }
      entries.set(key, {
        candle: {
          ...candle,
          validation_status: "valid",
        },
        cache_key: key,
        inserted_at_ms: now.getTime(),
      });
      accepted += 1;
    }

    enforceLimit();

    return {
      contract_version: sharedCandleCacheContractVersion,
      accepted_count: accepted,
      rejected_count: rejected,
      duplicate_count: duplicate,
      invalid_count: invalid,
      lookahead_rejected_count: lookaheadRejected,
      cache_size: entries.size,
    };
  }

  function lookupExact(
    parts: SharedCandleCacheKeyParts,
    options?: { now?: Date | string | null; analysis_cutoff?: string | null },
  ): SharedCandleCacheLookupResult {
    cleanup({ now: options?.now });
    const cacheKey = buildSharedCandleCacheKey(parts);
    const entry = entries.get(cacheKey);
    if (!entry) {
      return {
        contract_version: sharedCandleCacheContractVersion,
        status: "miss",
        candles: [],
        missing_ranges: [{ start: parts.timestamp, end: parts.timestamp }],
        stale_count: 0,
        rejected_lookahead_count: 0,
        provenance: {
          cache_key: cacheKey,
          hit_count: 0,
          miss_count: 1,
          partial_count: 0,
        },
      };
    }

    const freshness = evaluateSharedCandleFreshness({
      candle: entry.candle,
      now: options?.now,
      ttl_ms: ttlMs,
      analysis_cutoff: options?.analysis_cutoff,
    });
    if (freshness === "expired_or_invalid") {
      return {
        contract_version: sharedCandleCacheContractVersion,
        status: "miss",
        candles: [],
        missing_ranges: [{ start: parts.timestamp, end: parts.timestamp }],
        stale_count: 0,
        rejected_lookahead_count: 1,
        provenance: {
          cache_key: cacheKey,
          hit_count: 0,
          miss_count: 1,
          partial_count: 0,
        },
      };
    }

    return {
      contract_version: sharedCandleCacheContractVersion,
      status: "exact_hit",
      candles: [entry.candle],
      missing_ranges: [],
      stale_count: freshness === "stale_refreshable" ? 1 : 0,
      rejected_lookahead_count: 0,
      provenance: {
        cache_key: cacheKey,
        hit_count: 1,
        miss_count: 0,
        partial_count: 0,
      },
    };
  }

  function lookupRange(
    request: SharedCandleCacheRangeRequest,
    options?: { now?: Date | string | null },
  ): SharedCandleCacheLookupResult {
    cleanup({ now: options?.now });
    const timestamps = expectedTimestamps(request);
    const candles: SharedCandleCacheCandle[] = [];
    const missing: string[] = [];
    let staleCount = 0;
    let lookaheadRejected = 0;

    for (const timestamp of timestamps) {
      const exact = lookupExact(
        {
          provider: request.provider,
          ticker: request.ticker,
          interval: request.interval,
          timestamp,
          timezone: request.timezone,
          adjusted: request.adjusted,
        },
        { now: options?.now, analysis_cutoff: request.analysis_cutoff },
      );
      if (exact.candles.length > 0) {
        candles.push(...exact.candles);
        staleCount += exact.stale_count;
      } else {
        missing.push(timestamp);
        lookaheadRejected += exact.rejected_lookahead_count;
      }
    }

    const status: SharedCandleCacheHitStatus =
      timestamps.length > 0 && candles.length === timestamps.length
        ? "range_hit"
        : candles.length > 0
          ? "partial_hit"
          : "miss";

    return {
      contract_version: sharedCandleCacheContractVersion,
      status,
      candles: sortCandles(candles),
      missing_ranges: collapseMissing(missing, request.interval),
      stale_count: staleCount,
      rejected_lookahead_count: lookaheadRejected,
      provenance: {
        cache_key: buildSharedCandleRangeKey(request),
        hit_count: candles.length,
        miss_count: missing.length,
        partial_count: status === "partial_hit" ? 1 : 0,
      },
    };
  }

  function snapshot(options?: { now?: Date | string | null }): SharedCandleCacheSnapshot {
    cleanup({ now: options?.now });
    const now = asDate(options?.now);
    const values = [...entries.values()];
    const fetchedTimes = values
      .map((entry) => parseTime(entry.candle.fetched_at))
      .filter((value): value is number => value !== null)
      .sort((left, right) => left - right);
    const staleEntryCount = values.filter(
      (entry) =>
        evaluateSharedCandleFreshness({
          candle: entry.candle,
          now,
          ttl_ms: ttlMs,
        }) === "stale_refreshable",
    ).length;

    return {
      contract_version: sharedCandleCacheContractVersion,
      cache_size: entries.size,
      stale_entry_count: staleEntryCount,
      max_entries: maxEntries,
      ttl_ms: ttlMs,
      oldest_entry_at:
        fetchedTimes.length > 0 ? new Date(fetchedTimes[0]).toISOString() : null,
      newest_entry_at:
        fetchedTimes.length > 0
          ? new Date(fetchedTimes[fetchedTimes.length - 1]).toISOString()
          : null,
    };
  }

  return {
    lookupExact,
    lookupRange,
    merge,
    snapshot,
    cleanup,
  };
}

export function createSharedCandleRequestCoalescer(options?: {
  max_entries?: number;
  ttl_ms?: number;
}) {
  const maxEntries = Math.max(1, Math.floor(options?.max_entries ?? 100));
  const ttlMs = Math.max(1_000, Math.floor(options?.ttl_ms ?? 30_000));
  const inFlight = new Map<string, CoalescerEntry<unknown>>();
  const completed: Array<CoalescerEntry<unknown>> = [];
  let joinedRequestCount = 0;
  let staleCleanupCount = 0;

  function cleanup(options?: { now?: Date | string | null }) {
    const now = asDate(options?.now);
    for (const [key, entry] of inFlight) {
      if (now.getTime() - entry.started_at_ms > ttlMs) {
        inFlight.delete(key);
        entry.completed_at = now.toISOString();
        entry.completion_status = "timeout";
        entry.timeout = true;
        completed.unshift(entry);
        staleCleanupCount += 1;
      }
    }

    if (completed.length > maxEntries) {
      completed.splice(maxEntries);
    }
  }

  function snapshot(options?: {
    now?: Date | string | null;
  }): SharedCandleRequestCoalescerSnapshot {
    cleanup({ now: options?.now });
    const entries = [...inFlight.values(), ...completed].slice(0, maxEntries);
    return {
      contract_version: sharedCandleCacheContractVersion,
      in_flight_count: inFlight.size,
      completed_count: completed.length,
      joined_request_count: joinedRequestCount,
      stale_cleanup_count: staleCleanupCount,
      entries: entries.map((entry) => ({
        request_key: entry.request_key,
        first_requester: entry.first_requester,
        joined_count: entry.joined_count,
        started_at: entry.started_at,
        completed_at: entry.completed_at,
        completion_status: entry.completion_status,
        provider_call_executed: entry.provider_call_executed,
        cache_satisfied: entry.cache_satisfied,
        timeout: entry.timeout,
      })),
    };
  }

  async function run<T>(
    input: {
      request_key: string;
      requester_id: string;
      cache_satisfied?: boolean;
      now?: Date | string | null;
    },
    operation: () => Promise<T>,
  ): Promise<T> {
    cleanup({ now: input.now });
    const existing = inFlight.get(input.request_key) as
      | CoalescerEntry<T>
      | undefined;
    if (existing) {
      existing.joined_count += 1;
      joinedRequestCount += 1;
      return existing.promise;
    }

    const now = asDate(input.now);
    const entry: CoalescerEntry<T> = {
      request_key: input.request_key,
      first_requester: input.requester_id,
      joined_count: 0,
      started_at_ms: now.getTime(),
      started_at: now.toISOString(),
      completed_at: null,
      completion_status: "in_flight",
      provider_call_executed: true,
      cache_satisfied: input.cache_satisfied ?? false,
      timeout: false,
      promise: Promise.resolve().then(operation),
    };

    inFlight.set(input.request_key, entry as CoalescerEntry<unknown>);

    try {
      const result = await entry.promise;
      inFlight.delete(input.request_key);
      entry.completed_at = asDate(null).toISOString();
      entry.completion_status = "completed";
      completed.unshift(entry as CoalescerEntry<unknown>);
      cleanup({ now: entry.completed_at });
      return result;
    } catch (error) {
      inFlight.delete(input.request_key);
      entry.completed_at = asDate(null).toISOString();
      entry.completion_status = "failed";
      completed.unshift(entry as CoalescerEntry<unknown>);
      cleanup({ now: entry.completed_at });
      throw error;
    }
  }

  return {
    run,
    snapshot,
    cleanup,
  };
}

export async function collectSharedCandlesWithCache(input: {
  cache: SharedCandleCache;
  coalescer?: ReturnType<typeof createSharedCandleRequestCoalescer> | null;
  request: SharedCandleCacheRangeRequest;
  provider_state: SharedCandleCacheProviderState;
  shadow_mode_enabled: boolean;
  request_id: string;
  requester_id: string;
  now?: Date | string | null;
  provider: (
    request: SharedCandleProviderRequest,
  ) => Promise<SharedCandleProviderResult>;
}): Promise<SharedCandleCacheCollectionResult> {
  const cacheLookup = input.cache.lookupRange(input.request, { now: input.now });
  const hasFreshFullHit =
    cacheLookup.status === "range_hit" && cacheLookup.stale_count === 0;
  if (hasFreshFullHit || !input.shadow_mode_enabled) {
    return {
      contract_version: sharedCandleCacheContractVersion,
      cache_lookup: cacheLookup,
      provider_call_attempted: false,
      provider_call_executed: false,
      provider_result: null,
      merge_result: null,
      candles: cacheLookup.candles,
      deferred_reason: hasFreshFullHit
        ? null
        : "shadow_collector_disabled_cache_only",
      no_effect_boundary: {
        recommendations_changed: false,
        ranking_changed: false,
        execution_changed: false,
        provider_called_when_disabled: false,
        writes_executed: false,
      },
    };
  }

  if (input.provider_state !== "available") {
    return {
      contract_version: sharedCandleCacheContractVersion,
      cache_lookup: cacheLookup,
      provider_call_attempted: false,
      provider_call_executed: false,
      provider_result: null,
      merge_result: null,
      candles: cacheLookup.candles,
      deferred_reason:
        input.provider_state === "provider_unavailable"
          ? "provider_unavailable_cache_only"
          : "provider_state_unknown_cache_only",
      no_effect_boundary: {
        recommendations_changed: false,
        ranking_changed: false,
        execution_changed: false,
        provider_called_when_disabled: false,
        writes_executed: false,
      },
    };
  }

  const requestKey = buildSharedCandleRangeKey(input.request);
  const providerOperation = () =>
    input.provider({
      ...input.request,
      request_id: input.request_id,
      missing_ranges:
        cacheLookup.missing_ranges.length > 0
          ? cacheLookup.missing_ranges
          : [{ start: input.request.start, end: input.request.end }],
    });
  const providerResult = input.coalescer
    ? await input.coalescer.run(
        {
          request_key: requestKey,
          requester_id: input.requester_id,
          cache_satisfied: false,
          now: input.now,
        },
        providerOperation,
      )
    : await providerOperation();

  const mergeResult = input.cache.merge(providerResult.candles, {
    now: input.now,
    analysis_cutoff: input.request.analysis_cutoff,
  });
  const refreshedLookup = input.cache.lookupRange(input.request, { now: input.now });

  return {
    contract_version: sharedCandleCacheContractVersion,
    cache_lookup: cacheLookup,
    provider_call_attempted: true,
    provider_call_executed: providerResult.provider_call_count > 0,
    provider_result: providerResult,
    merge_result: mergeResult,
    candles: refreshedLookup.candles,
    deferred_reason:
      refreshedLookup.status === "range_hit" ? null : "partial_or_missing_after_fetch",
    no_effect_boundary: {
      recommendations_changed: false,
      ranking_changed: false,
      execution_changed: false,
      provider_called_when_disabled: false,
      writes_executed: false,
    },
  };
}
