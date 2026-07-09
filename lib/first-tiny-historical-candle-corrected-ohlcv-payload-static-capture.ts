import correctedFilteredOhlcvPayload from "@/docs/first-tiny-historical-candle-corrected-filtered-ohlcv-payload.json";
import { firstTinyCorrectedPayloadRefetchResultVerificationMarker } from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-result-verification";
import type { FirstTinyExecutableCandleRow } from "@/lib/first-tiny-historical-candle-executable-persistence-dry-run-plan";

export const firstTinyCorrectedOhlcvPayloadStaticCaptureMarker =
  "first_tiny_corrected_ohlcv_payload_static_capture_validated";

export type FirstTinyCorrectedOhlcvPayloadStaticCaptureRow =
  FirstTinyExecutableCandleRow;

export type FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary = {
  capture_status: "captured_static_review_payload";
  capture_marker: typeof firstTinyCorrectedOhlcvPayloadStaticCaptureMarker;
  source: "operator_observed_action_289_response";
  source_verification: typeof firstTinyCorrectedPayloadRefetchResultVerificationMarker;
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  row_count: number;
  expected_row_count: 73;
  first_timestamp: string | null;
  last_timestamp: string | null;
  row_count_matches: boolean;
  timestamps_are_5min_spaced: boolean;
  duplicate_timestamps: number;
  out_of_order_candles: number;
  ohlcv_values_present: boolean;
  ohlcv_values_valid: boolean;
  high_low_geometry_valid: boolean;
  volume_values_valid: boolean;
  adjusted_false_for_all_rows: boolean;
  provider_valid_for_all_rows: boolean;
  ticker_valid_for_all_rows: boolean;
  interval_valid_for_all_rows: boolean;
  timestamp_valid_for_all_rows: boolean;
  trading_day_valid_for_all_rows: boolean;
  session_valid_for_all_rows: boolean;
  timezone_valid_for_all_rows: boolean;
  fetch_run_id_valid_for_all_rows: boolean;
  invalid_row_count: number;
  invalid_examples: Array<{
    index: number;
    timestamp: string | null;
    reasons: string[];
  }>;
  candle_write_ready: false;
  ready_for_executable_persistence_dry_run: boolean;
  candles_persisted: false;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  recommended_next_steps: [
    "rebuild_executable_candle_persistence_dry_run_from_static_ohlcv_payload",
    "require_separate_candle_persistence_approval_signal",
    "keep_replay_and_scanner_effects_disabled",
  ];
  rows: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow[];
};

const expectedFirstTimestamp = "2026-07-08T13:45:00.000Z";
const expectedLastTimestamp = "2026-07-08T19:45:00.000Z";
const expectedFetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
const intervalMs = 5 * 60 * 1000;

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIsoUtcTimestamp(value: unknown): value is string {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function timestampMs(value: unknown) {
  if (!isIsoUtcTimestamp(value)) return null;
  return new Date(value).getTime();
}

function normalizeRows(): FirstTinyCorrectedOhlcvPayloadStaticCaptureRow[] {
  return correctedFilteredOhlcvPayload.map((row) => ({
    ...row,
    source_verification: firstTinyCorrectedPayloadRefetchResultVerificationMarker,
    source_strategy: "full_day_fetch_then_filter_locally",
    ohlcv_values_recorded_in_artifact: true,
  })) as FirstTinyCorrectedOhlcvPayloadStaticCaptureRow[];
}

function duplicateTimestampCount(
  rows: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow[],
) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const row of rows) {
    if (!row.timestamp) continue;
    if (seen.has(row.timestamp)) duplicates.add(row.timestamp);
    seen.add(row.timestamp);
  }

  return duplicates.size;
}

function outOfOrderCount(
  rows: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow[],
) {
  let previous: number | null = null;
  let count = 0;

  for (const row of rows) {
    const current = timestampMs(row.timestamp);
    if (current === null) continue;
    if (previous !== null && current < previous) count += 1;
    previous = current;
  }

  return count;
}

function validateRow(
  row: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow,
  index: number,
) {
  const reasons: string[] = [];
  const expectedTimestamp = new Date(
    new Date(expectedFirstTimestamp).getTime() + index * intervalMs,
  ).toISOString();

  if (row.provider !== "twelve_data") reasons.push("provider_mismatch");
  if (row.ticker !== "AAPL") reasons.push("ticker_mismatch");
  if (row.interval !== "5min") reasons.push("interval_mismatch");
  if (!isIsoUtcTimestamp(row.timestamp)) reasons.push("timestamp_not_iso_utc");
  if (row.timestamp !== expectedTimestamp) {
    reasons.push("timestamp_sequence_mismatch");
  }
  if (!isFiniteNumber(row.open)) reasons.push("open_not_finite");
  if (!isFiniteNumber(row.high)) reasons.push("high_not_finite");
  if (!isFiniteNumber(row.low)) reasons.push("low_not_finite");
  if (!isFiniteNumber(row.close)) reasons.push("close_not_finite");
  if (!isFiniteNumber(row.volume)) reasons.push("volume_not_finite");
  if (isFiniteNumber(row.volume) && row.volume < 0) {
    reasons.push("volume_negative");
  }
  if (
    isFiniteNumber(row.high) &&
    isFiniteNumber(row.low) &&
    row.high < row.low
  ) {
    reasons.push("high_below_low");
  }
  if (
    isFiniteNumber(row.high) &&
    ((isFiniteNumber(row.open) && row.high < row.open) ||
      (isFiniteNumber(row.close) && row.high < row.close))
  ) {
    reasons.push("high_below_open_or_close");
  }
  if (
    isFiniteNumber(row.low) &&
    ((isFiniteNumber(row.open) && row.low > row.open) ||
      (isFiniteNumber(row.close) && row.low > row.close))
  ) {
    reasons.push("low_above_open_or_close");
  }
  if (row.adjusted !== false) reasons.push("adjusted_not_false");
  if (row.trading_day !== "2026-07-08") reasons.push("trading_day_mismatch");
  if (row.session !== "regular") reasons.push("session_mismatch");
  if (row.timezone !== "America/New_York") reasons.push("timezone_mismatch");
  if (row.fetch_run_id !== expectedFetchRunId) {
    reasons.push("fetch_run_id_mismatch");
  }

  return {
    index,
    timestamp: typeof row.timestamp === "string" ? row.timestamp : null,
    valid: reasons.length === 0,
    reasons,
  };
}

function allRows(
  rows: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow[],
  predicate: (row: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow) => boolean,
) {
  return rows.length > 0 && rows.every(predicate);
}

export function buildFirstTinyCorrectedOhlcvPayloadStaticCapture(): FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary {
  const rows = normalizeRows();
  const validations = rows.map(validateRow);
  const firstTimestamp = rows[0]?.timestamp ?? null;
  const lastTimestamp = rows.at(-1)?.timestamp ?? null;
  const rowCountMatches = rows.length === 73;
  const timestampsAre5minSpaced =
    rowCountMatches &&
    rows.every((row, index) => {
      const current = timestampMs(row.timestamp);
      const expected =
        new Date(expectedFirstTimestamp).getTime() + index * intervalMs;
      return current === expected;
    });
  const duplicateTimestamps = duplicateTimestampCount(rows);
  const outOfOrderCandles = outOfOrderCount(rows);
  const ohlcvValuesPresent = allRows(
    rows,
    (row) =>
      row.open !== null &&
      row.high !== null &&
      row.low !== null &&
      row.close !== null &&
      row.volume !== null,
  );
  const volumeValuesValid = allRows(
    rows,
    (row) => isFiniteNumber(row.volume) && row.volume >= 0,
  );
  const highLowGeometryValid = allRows(
    rows,
    (row) =>
      isFiniteNumber(row.open) &&
      isFiniteNumber(row.high) &&
      isFiniteNumber(row.low) &&
      isFiniteNumber(row.close) &&
      row.high >= row.low &&
      row.high >= row.open &&
      row.high >= row.close &&
      row.low <= row.open &&
      row.low <= row.close,
  );
  const ohlcvValuesValid =
    ohlcvValuesPresent && volumeValuesValid && highLowGeometryValid;
  const invalidExamples = validations
    .filter((validation) => !validation.valid)
    .slice(0, 6)
    .map(({ index, timestamp, reasons }) => ({ index, timestamp, reasons }));
  const invalidRowCount = validations.filter(
    (validation) => !validation.valid,
  ).length;
  const readyForDryRun =
    rowCountMatches &&
    firstTimestamp === expectedFirstTimestamp &&
    lastTimestamp === expectedLastTimestamp &&
    timestampsAre5minSpaced &&
    duplicateTimestamps === 0 &&
    outOfOrderCandles === 0 &&
    ohlcvValuesValid &&
    invalidRowCount === 0;

  return {
    capture_status: "captured_static_review_payload",
    capture_marker: firstTinyCorrectedOhlcvPayloadStaticCaptureMarker,
    source: "operator_observed_action_289_response",
    source_verification: firstTinyCorrectedPayloadRefetchResultVerificationMarker,
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    fetch_run_id: expectedFetchRunId,
    row_count: rows.length,
    expected_row_count: 73,
    first_timestamp: firstTimestamp,
    last_timestamp: lastTimestamp,
    row_count_matches: rowCountMatches,
    timestamps_are_5min_spaced: timestampsAre5minSpaced,
    duplicate_timestamps: duplicateTimestamps,
    out_of_order_candles: outOfOrderCandles,
    ohlcv_values_present: ohlcvValuesPresent,
    ohlcv_values_valid: ohlcvValuesValid,
    high_low_geometry_valid: highLowGeometryValid,
    volume_values_valid: volumeValuesValid,
    adjusted_false_for_all_rows: allRows(rows, (row) => row.adjusted === false),
    provider_valid_for_all_rows: allRows(
      rows,
      (row) => row.provider === "twelve_data",
    ),
    ticker_valid_for_all_rows: allRows(rows, (row) => row.ticker === "AAPL"),
    interval_valid_for_all_rows: allRows(
      rows,
      (row) => row.interval === "5min",
    ),
    timestamp_valid_for_all_rows: allRows(rows, (row) =>
      isIsoUtcTimestamp(row.timestamp),
    ),
    trading_day_valid_for_all_rows: allRows(
      rows,
      (row) => row.trading_day === "2026-07-08",
    ),
    session_valid_for_all_rows: allRows(
      rows,
      (row) => row.session === "regular",
    ),
    timezone_valid_for_all_rows: allRows(
      rows,
      (row) => row.timezone === "America/New_York",
    ),
    fetch_run_id_valid_for_all_rows: allRows(
      rows,
      (row) => row.fetch_run_id === expectedFetchRunId,
    ),
    invalid_row_count: invalidRowCount,
    invalid_examples: invalidExamples,
    candle_write_ready: false,
    ready_for_executable_persistence_dry_run: readyForDryRun,
    candles_persisted: false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    recommended_next_steps: [
      "rebuild_executable_candle_persistence_dry_run_from_static_ohlcv_payload",
      "require_separate_candle_persistence_approval_signal",
      "keep_replay_and_scanner_effects_disabled",
    ],
    rows,
  };
}
