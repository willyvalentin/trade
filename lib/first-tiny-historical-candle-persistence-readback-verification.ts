import {
  buildFirstTinyCorrectedOhlcvPayloadStaticCapture,
  type FirstTinyCorrectedOhlcvPayloadStaticCaptureRow,
  type FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary,
} from "@/lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import { firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification } from "@/lib/first-tiny-historical-candle-executable-persistence-dry-run-plan";

export const firstTinyCandlePersistenceReadbackVerificationRouteBuildMarker =
  "action_296_first_tiny_candle_persistence_readback_verification";

export type FirstTinyCandlePersistenceReadbackVerificationStatus =
  | "not_run"
  | "candle_persistence_readback_verified"
  | "candle_persistence_readback_incomplete"
  | "candle_persistence_readback_mismatch"
  | "failed";

export type FirstTinyCandlePersistenceReadbackSupabaseClient = {
  from: (table: string) => unknown;
};

export type FirstTinyCandlePersistenceReadbackVerificationInput = {
  static_ohlcv_capture?: FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary | null;
  supabase_client?: FirstTinyCandlePersistenceReadbackSupabaseClient | null;
};

export type FirstTinyCandlePersistenceReadbackVerificationSummary = {
  verification_status: FirstTinyCandlePersistenceReadbackVerificationStatus;
  route_build_marker: typeof firstTinyCandlePersistenceReadbackVerificationRouteBuildMarker;
  target_table: "historical_candles";
  source_verification: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification;
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  session: "regular";
  timezone: "America/New_York";
  adjusted: false;
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  expected_rows: 73;
  readback_rows: number;
  matched_rows: number;
  missing_rows: number;
  unexpected_rows: number;
  mismatched_rows: number;
  duplicate_timestamps: number;
  out_of_order_rows: number;
  first_timestamp: string | null;
  last_timestamp: string | null;
  timestamps_5min_spaced: boolean;
  readback_verified: boolean;
  candles_persisted: boolean;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  missing_timestamp_examples: string[];
  unexpected_timestamp_examples: string[];
  mismatch_examples: Array<{
    timestamp: string | null;
    reasons: string[];
  }>;
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
};

type QueryBuilder = {
  select?: (...args: unknown[]) => QueryBuilder;
  eq?: (...args: unknown[]) => QueryBuilder;
  gte?: (...args: unknown[]) => QueryBuilder;
  lte?: (...args: unknown[]) => QueryBuilder;
  order?: (...args: unknown[]) => QueryBuilder;
  limit?: (...args: unknown[]) => QueryBuilder;
  then?: PromiseLike<{ data?: unknown; error?: unknown }>["then"];
};

type NormalizedReadbackRow = {
  provider: string | null;
  ticker: string | null;
  interval: string | null;
  timestamp: string | null;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  adjusted: boolean | null;
  trading_day: string | null;
  session: string | null;
  timezone: string | null;
  fetch_run_id: string | null;
};

const tableName = "historical_candles";
const expectedFirstTimestamp = "2026-07-08T13:45:00.000Z";
const expectedLastTimestamp = "2026-07-08T19:45:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
const intervalMs = 5 * 60 * 1000;

function asBuilder(value: unknown): QueryBuilder {
  return (value ?? {}) as QueryBuilder;
}

function errorMessage(error: unknown) {
  if (!error) return null;
  if (error instanceof Error) return error.message;
  if (typeof error === "object" && "message" in error) {
    const message = (error as { message?: unknown }).message;
    return typeof message === "string" ? message : JSON.stringify(error);
  }
  return String(error);
}

async function resolveQuery(builder: QueryBuilder) {
  if (typeof builder.then !== "function") {
    return { data: null, error: new Error("query_readback_unavailable") };
  }

  return builder as unknown as Promise<{ data?: unknown; error?: unknown }>;
}

function numberValue(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function stringValue(value: unknown) {
  return typeof value === "string" ? value : null;
}

function booleanValue(value: unknown) {
  return typeof value === "boolean" ? value : null;
}

function isoTimestamp(value: unknown) {
  if (typeof value !== "string") return null;
  const parsed = new Date(value);
  if (!Number.isFinite(parsed.getTime())) return null;
  return parsed.toISOString();
}

function normalizeReadbackRow(row: unknown): NormalizedReadbackRow | null {
  if (typeof row !== "object" || row === null) return null;
  const data = row as Record<string, unknown>;

  return {
    provider: stringValue(data.provider),
    ticker: stringValue(data.ticker),
    interval: stringValue(data.interval),
    timestamp: isoTimestamp(data.timestamp),
    open: numberValue(data.open),
    high: numberValue(data.high),
    low: numberValue(data.low),
    close: numberValue(data.close),
    volume: numberValue(data.volume),
    adjusted: booleanValue(data.adjusted),
    trading_day: stringValue(data.trading_day),
    session: stringValue(data.session),
    timezone: stringValue(data.timezone),
    fetch_run_id: stringValue(data.fetch_run_id),
  };
}

function sameNumber(left: number | null, right: number | null) {
  return left !== null && right !== null && Object.is(left, right);
}

function compareRow(
  readback: NormalizedReadbackRow | undefined,
  source: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow,
) {
  const reasons: string[] = [];

  if (!readback) {
    return { matches: false, reasons: ["missing_readback_row"] };
  }

  if (readback.provider !== source.provider) reasons.push("provider_mismatch");
  if (readback.ticker !== source.ticker) reasons.push("ticker_mismatch");
  if (readback.interval !== source.interval) reasons.push("interval_mismatch");
  if (readback.timestamp !== source.timestamp) reasons.push("timestamp_mismatch");
  if (!sameNumber(readback.open, source.open)) reasons.push("open_mismatch");
  if (!sameNumber(readback.high, source.high)) reasons.push("high_mismatch");
  if (!sameNumber(readback.low, source.low)) reasons.push("low_mismatch");
  if (!sameNumber(readback.close, source.close)) reasons.push("close_mismatch");
  if (!sameNumber(readback.volume, source.volume)) {
    reasons.push("volume_mismatch");
  }
  if (readback.adjusted !== source.adjusted) reasons.push("adjusted_mismatch");
  if (readback.trading_day !== source.trading_day) {
    reasons.push("trading_day_mismatch");
  }
  if (readback.session !== source.session) reasons.push("session_mismatch");
  if (readback.timezone !== source.timezone) reasons.push("timezone_mismatch");
  if (readback.fetch_run_id !== source.fetch_run_id) {
    reasons.push("fetch_run_id_mismatch");
  }

  return { matches: reasons.length === 0, reasons };
}

function duplicateTimestampCount(rows: NormalizedReadbackRow[]) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const row of rows) {
    if (!row.timestamp) continue;
    if (seen.has(row.timestamp)) duplicates.add(row.timestamp);
    seen.add(row.timestamp);
  }

  return duplicates.size;
}

function outOfOrderCount(rows: NormalizedReadbackRow[]) {
  let previous: number | null = null;
  let count = 0;

  for (const row of rows) {
    if (!row.timestamp) continue;
    const current = new Date(row.timestamp).getTime();
    if (previous !== null && current < previous) count += 1;
    previous = current;
  }

  return count;
}

function timestampsAre5minSpaced(rows: NormalizedReadbackRow[]) {
  if (rows.length !== 73) return false;
  return rows.every((row, index) => {
    const expected = new Date(
      new Date(expectedFirstTimestamp).getTime() + index * intervalMs,
    ).toISOString();
    return row.timestamp === expected;
  });
}

function baseSummary(
  input: Partial<FirstTinyCandlePersistenceReadbackVerificationSummary> = {},
): FirstTinyCandlePersistenceReadbackVerificationSummary {
  return {
    verification_status: input.verification_status ?? "not_run",
    route_build_marker:
      firstTinyCandlePersistenceReadbackVerificationRouteBuildMarker,
    target_table: tableName,
    source_verification:
      firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    session: "regular",
    timezone: "America/New_York",
    adjusted: false,
    fetch_run_id: fetchRunId,
    expected_rows: 73,
    readback_rows: input.readback_rows ?? 0,
    matched_rows: input.matched_rows ?? 0,
    missing_rows: input.missing_rows ?? 0,
    unexpected_rows: input.unexpected_rows ?? 0,
    mismatched_rows: input.mismatched_rows ?? 0,
    duplicate_timestamps: input.duplicate_timestamps ?? 0,
    out_of_order_rows: input.out_of_order_rows ?? 0,
    first_timestamp: input.first_timestamp ?? null,
    last_timestamp: input.last_timestamp ?? null,
    timestamps_5min_spaced: input.timestamps_5min_spaced ?? false,
    readback_verified: input.readback_verified ?? false,
    candles_persisted: input.candles_persisted ?? false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    missing_timestamp_examples: input.missing_timestamp_examples ?? [],
    unexpected_timestamp_examples: input.unexpected_timestamp_examples ?? [],
    mismatch_examples: input.mismatch_examples ?? [],
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    recommended_next_steps:
      input.recommended_next_steps ??
      ["investigate_readback_before_any_replay_or_scanner_use"],
  };
}

async function readRows(input: {
  client: FirstTinyCandlePersistenceReadbackSupabaseClient;
}) {
  const query = asBuilder(input.client.from(tableName));
  const selected =
    query.select?.(
      "provider,ticker,interval,timestamp,open,high,low,close,volume,adjusted,trading_day,session,timezone,fetch_run_id",
    ) ?? query;
  const filtered = selected
    .eq?.("provider", "twelve_data")
    ?.eq?.("ticker", "AAPL")
    ?.eq?.("interval", "5min")
    ?.eq?.("trading_day", "2026-07-08")
    ?.eq?.("adjusted", false)
    ?.gte?.("timestamp", expectedFirstTimestamp)
    ?.lte?.("timestamp", expectedLastTimestamp) ?? selected;
  const ordered = filtered.order?.("timestamp", { ascending: true }) ?? filtered;
  const limited = ordered.limit?.(100) ?? ordered;

  return resolveQuery(limited);
}

export function buildFirstTinyCandlePersistenceReadbackVerificationReadiness(): FirstTinyCandlePersistenceReadbackVerificationSummary {
  return baseSummary({
    verification_status: "not_run",
    warnings: ["readback_verification_route_not_run"],
  });
}

export async function verifyFirstTinyCandlePersistenceReadback(
  input: FirstTinyCandlePersistenceReadbackVerificationInput = {},
): Promise<FirstTinyCandlePersistenceReadbackVerificationSummary> {
  const staticCapture =
    input.static_ohlcv_capture ??
    buildFirstTinyCorrectedOhlcvPayloadStaticCapture();
  const sourceRows = staticCapture.rows;
  const serviceRole = input.supabase_client;

  if (!serviceRole) {
    return baseSummary({
      verification_status: "failed",
      blockers: ["supabase_service_role_unavailable"],
      warnings: ["readback_verification_not_completed"],
    });
  }

  const readback = await readRows({ client: serviceRole });
  const readbackError = errorMessage(readback.error);

  if (readbackError) {
    return baseSummary({
      verification_status: "failed",
      blockers: [`readback_query_failed:${readbackError}`],
      warnings: ["readback_verification_not_completed"],
    });
  }

  const rawRows = Array.isArray(readback.data) ? readback.data : [];
  const normalizedRows = rawRows
    .map(normalizeReadbackRow)
    .filter((row): row is NormalizedReadbackRow => row !== null);
  const byTimestamp = new Map(
    normalizedRows.map((row) => [row.timestamp ?? "", row]),
  );
  const sourceTimestamps = new Set(sourceRows.map((row) => row.timestamp));
  const missing = sourceRows.filter((row) => !byTimestamp.has(row.timestamp));
  const unexpected = normalizedRows.filter(
    (row) => row.timestamp === null || !sourceTimestamps.has(row.timestamp),
  );
  const mismatches = sourceRows
    .map((source) => {
      const comparison = compareRow(byTimestamp.get(source.timestamp), source);
      return {
        timestamp: source.timestamp,
        matches: comparison.matches,
        reasons: comparison.reasons,
      };
    })
    .filter((item) => !item.matches && !missing.some((row) => row.timestamp === item.timestamp));
  const matchedRows = sourceRows.length - missing.length - mismatches.length;
  const duplicateTimestamps = duplicateTimestampCount(normalizedRows);
  const outOfOrderRows = outOfOrderCount(normalizedRows);
  const firstTimestamp = normalizedRows[0]?.timestamp ?? null;
  const lastTimestamp = normalizedRows.at(-1)?.timestamp ?? null;
  const fiveMinSpaced = timestampsAre5minSpaced(normalizedRows);
  const verified =
    rawRows.length === 73 &&
    normalizedRows.length === 73 &&
    matchedRows === 73 &&
    missing.length === 0 &&
    unexpected.length === 0 &&
    mismatches.length === 0 &&
    duplicateTimestamps === 0 &&
    outOfOrderRows === 0 &&
    firstTimestamp === expectedFirstTimestamp &&
    lastTimestamp === expectedLastTimestamp &&
    fiveMinSpaced;
  const verificationStatus: FirstTinyCandlePersistenceReadbackVerificationStatus =
    verified
      ? "candle_persistence_readback_verified"
      : missing.length > 0 || rawRows.length < 73
        ? "candle_persistence_readback_incomplete"
        : "candle_persistence_readback_mismatch";

  return baseSummary({
    verification_status: verificationStatus,
    readback_rows: rawRows.length,
    matched_rows: Math.max(0, matchedRows),
    missing_rows: missing.length,
    unexpected_rows: unexpected.length,
    mismatched_rows: mismatches.length,
    duplicate_timestamps: duplicateTimestamps,
    out_of_order_rows: outOfOrderRows,
    first_timestamp: firstTimestamp,
    last_timestamp: lastTimestamp,
    timestamps_5min_spaced: fiveMinSpaced,
    readback_verified: verified,
    candles_persisted: verified || rawRows.length > 0,
    missing_timestamp_examples: missing.map((row) => row.timestamp).slice(0, 6),
    unexpected_timestamp_examples: unexpected
      .map((row) => row.timestamp ?? "missing_timestamp")
      .slice(0, 6),
    mismatch_examples: mismatches
      .map((item) => ({ timestamp: item.timestamp, reasons: item.reasons }))
      .slice(0, 6),
    blockers: verified ? [] : [verificationStatus],
    warnings: verified
      ? []
      : ["investigate_readback_before_any_replay_or_scanner_use"],
    recommended_next_steps: verified
      ? [
          "disable_candle_persistence_approval_signal_after_success",
          "document_candle_persistence_result",
          "require_separate_approval_before_replay_or_scanner_use",
        ]
      : ["investigate_readback_before_any_replay_or_scanner_use"],
  });
}
