import {
  buildFirstTinyCorrectedOhlcvPayloadStaticCapture,
  firstTinyCorrectedOhlcvPayloadStaticCaptureMarker,
} from "@/lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import {
  buildFirstTinyCorrectedPayloadRefetchResultVerification,
  firstTinyCorrectedPayloadRefetchResultVerificationMarker,
  type FirstTinyCorrectedPayloadRefetchResultVerificationSummary,
} from "@/lib/first-tiny-historical-candle-corrected-payload-refetch-result-verification";

export const firstTinyHistoricalCandleExecutablePersistenceDryRunPlanMarker =
  "first_tiny_historical_candle_executable_persistence_dry_run_planned";
export const firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion =
  "v2_static_ohlcv_payload";
export const firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification =
  "corrected_first_tiny_ohlcv_payload_static_captured";

export type FirstTinyExecutableCandlePersistenceReadbackStatus =
  | "available"
  | "unavailable";

export type FirstTinyExecutableCandlePersistenceAction =
  | "planned_insert"
  | "planned_update"
  | "planned_skip"
  | "planned_rejection";

export type FirstTinyExecutableCandleRow = {
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  timestamp: string;
  open: number | null;
  high: number | null;
  low: number | null;
  close: number | null;
  volume: number | null;
  adjusted: false;
  trading_day: "2026-07-08";
  session: "regular";
  timezone: "America/New_York";
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  source_verification: typeof firstTinyCorrectedPayloadRefetchResultVerificationMarker;
  source_strategy: "full_day_fetch_then_filter_locally";
  ohlcv_values_recorded_in_artifact: boolean;
};

export type FirstTinyExecutableCandlePersistencePlanRow = {
  timestamp: string | null;
  persistence_key: string;
  action: FirstTinyExecutableCandlePersistenceAction;
  valid: boolean;
  rejection_reasons: string[];
};

export type FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanInput = {
  source_verification?: FirstTinyCorrectedPayloadRefetchResultVerificationSummary | null;
  candidate_rows?: FirstTinyExecutableCandleRow[] | null;
  cache_readback_status?: FirstTinyExecutableCandlePersistenceReadbackStatus | null;
  existing_candle_keys?: string[] | null;
  existing_candle_keys_requiring_update?: string[] | null;
};

export type FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanSummary = {
  plan_status: "planned";
  plan_marker: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunPlanMarker;
  plan_version: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion;
  plan_mode: "dry_run_only";
  dry_run_only: true;
  source_verification: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification;
  source_capture_marker: typeof firstTinyCorrectedOhlcvPayloadStaticCaptureMarker;
  source_artifact: "docs/first-tiny-historical-candle-corrected-filtered-ohlcv-payload.json";
  source_verification_status: "verified_ready_for_executable_candle_persistence_plan";
  source_execution_status: "corrected_payload_refetch_completed_no_persist";
  source_strategy: "full_day_fetch_then_filter_locally";
  target_table: "historical_candles";
  conflict_target: ["provider", "ticker", "interval", "timestamp", "adjusted"];
  request_scope: {
    provider: "twelve_data";
    ticker: "AAPL";
    interval: "5min";
    trading_day: "2026-07-08";
    session: "regular";
    timezone: "America/New_York";
    adjusted: false;
  };
  fetch_run: {
    fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
    fetch_run_id_attached: true;
  };
  payload_summary: {
    executable_payload_available: boolean;
    source_payload_rows: 73;
    expected_candle_rows: 73;
    candidate_candle_rows: number;
    timestamp_metadata_valid_rows: number;
    timestamp_valid_rows: number;
    candle_write_valid_rows: number;
    valid_candle_rows: number;
    invalid_candle_rows: number;
    ohlcv_valid_rows: number;
    ohlcv_missing_rows: number;
    ohlcv_values_not_invented: true;
    first_timestamp: string | null;
    last_timestamp: string | null;
    five_minute_spacing_valid: boolean;
    window_matches_intended: boolean;
  };
  validation: {
    provider_valid_rows: number;
    ticker_valid_rows: number;
    interval_valid_rows: number;
    timestamp_valid_rows: number;
    adjusted_valid_rows: number;
    trading_day_valid_rows: number;
    session_valid_rows: number;
    timezone_valid_rows: number;
    fetch_run_id_valid_rows: number;
    finite_ohlcv_rows: number;
    ohlc_geometry_valid_rows: number;
    non_negative_volume_rows: number;
    rejection_reason_counts: Record<string, number>;
    invalid_examples: Array<{
      timestamp: string | null;
      reasons: string[];
    }>;
  };
  cache_readback: {
    status: FirstTinyExecutableCandlePersistenceReadbackStatus;
    existing_keys_checked: number;
    existing_rows_detected: number;
    exact_insert_update_skip_split_available: boolean;
    warning: "exact_insert_update_skip_split_requires_readback" | null;
  };
  upsert_plan: {
    planned_inserts: number;
    planned_updates: number;
    planned_skips: number;
    planned_invalid_rejections: number;
    planned_rows: FirstTinyExecutableCandlePersistencePlanRow[];
  };
  safety: {
    candle_write_allowed_now: false;
    requires_separate_operator_approval: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    raw_response_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
  };
  recommended_next_steps: [
    "review_executable_candle_persistence_plan_v2",
    "require_separate_candle_persistence_approval_signal",
    "keep_replay_and_scanner_effects_disabled",
  ];
  warnings: string[];
};

const expectedFirstTimestamp = "2026-07-08T13:45:00.000Z";
const expectedLastTimestamp = "2026-07-08T19:45:00.000Z";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
const intervalMs = 5 * 60 * 1000;
const conflictTarget = [
  "provider",
  "ticker",
  "interval",
  "timestamp",
  "adjusted",
] as const;

function increment(record: Record<string, number>, key: string) {
  record[key] = (record[key] ?? 0) + 1;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function isIsoUtcTimestamp(value: string | null | undefined) {
  if (typeof value !== "string") return false;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) && parsed.toISOString() === value;
}

function timestampMs(value: string | null | undefined) {
  if (!isIsoUtcTimestamp(value)) return null;
  return new Date(value as string).getTime();
}

function persistenceKey(
  row: Pick<
    FirstTinyExecutableCandleRow,
    "provider" | "ticker" | "interval" | "timestamp" | "adjusted"
  >,
) {
  return [
    row.provider,
    row.ticker,
    row.interval,
    row.timestamp,
    row.adjusted ? "adjusted_true" : "adjusted_false",
  ].join(":");
}

function fiveMinuteSpacingValid(rows: FirstTinyExecutableCandleRow[]) {
  return rows.every((row, index) => {
    if (index === 0) return row.timestamp === expectedFirstTimestamp;
    const previous = timestampMs(rows[index - 1]?.timestamp);
    const current = timestampMs(row.timestamp);
    return previous !== null && current !== null && current - previous === intervalMs;
  });
}

function validateRow(row: FirstTinyExecutableCandleRow, index: number) {
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
  if (!isFiniteNumber(row.open)) reasons.push("missing_or_invalid_open");
  if (!isFiniteNumber(row.high)) reasons.push("missing_or_invalid_high");
  if (!isFiniteNumber(row.low)) reasons.push("missing_or_invalid_low");
  if (!isFiniteNumber(row.close)) reasons.push("missing_or_invalid_close");
  if (!isFiniteNumber(row.volume)) reasons.push("missing_or_invalid_volume");
  if (isFiniteNumber(row.volume) && row.volume < 0) {
    reasons.push("negative_volume");
  }
  if (
    isFiniteNumber(row.high) &&
    isFiniteNumber(row.low) &&
    row.high < row.low
  ) {
    reasons.push("invalid_ohlc_high_below_low");
  }
  if (
    isFiniteNumber(row.high) &&
    ((isFiniteNumber(row.open) && row.high < row.open) ||
      (isFiniteNumber(row.close) && row.high < row.close))
  ) {
    reasons.push("invalid_ohlc_high_below_open_or_close");
  }
  if (
    isFiniteNumber(row.low) &&
    ((isFiniteNumber(row.open) && row.low > row.open) ||
      (isFiniteNumber(row.close) && row.low > row.close))
  ) {
    reasons.push("invalid_ohlc_low_above_open_or_close");
  }
  if (row.adjusted !== false) reasons.push("adjusted_not_false");
  if (row.trading_day !== "2026-07-08") reasons.push("trading_day_mismatch");
  if (row.session !== "regular") reasons.push("session_mismatch");
  if (row.timezone !== "America/New_York") reasons.push("timezone_mismatch");
  if (row.fetch_run_id !== fetchRunId) reasons.push("fetch_run_id_mismatch");
  if (
    row.source_verification !==
    firstTinyCorrectedPayloadRefetchResultVerificationMarker
  ) {
    reasons.push("source_verification_mismatch");
  }
  if (row.source_strategy !== "full_day_fetch_then_filter_locally") {
    reasons.push("source_strategy_mismatch");
  }
  if (row.ohlcv_values_recorded_in_artifact !== true) {
    reasons.push("ohlcv_values_not_recorded_in_source_artifact");
  }

  return {
    valid: reasons.length === 0,
    timestamp_metadata_valid:
      row.provider === "twelve_data" &&
      row.ticker === "AAPL" &&
      row.interval === "5min" &&
      isIsoUtcTimestamp(row.timestamp) &&
      row.timestamp === expectedTimestamp &&
      row.adjusted === false &&
      row.trading_day === "2026-07-08" &&
      row.session === "regular" &&
      row.timezone === "America/New_York" &&
      row.fetch_run_id === fetchRunId,
    ohlcv_valid:
      isFiniteNumber(row.open) &&
      isFiniteNumber(row.high) &&
      isFiniteNumber(row.low) &&
      isFiniteNumber(row.close) &&
      isFiniteNumber(row.volume) &&
      row.volume >= 0 &&
      row.high >= row.low &&
      row.high >= row.open &&
      row.high >= row.close &&
      row.low <= row.open &&
      row.low <= row.close,
    reasons,
  };
}

function countWhere(
  rows: FirstTinyExecutableCandleRow[],
  predicate: (row: FirstTinyExecutableCandleRow) => boolean,
) {
  return rows.filter(predicate).length;
}

export function buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan(
  input: FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanInput = {},
): FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanSummary {
  const source =
    input.source_verification ??
    buildFirstTinyCorrectedPayloadRefetchResultVerification();
  const staticOhlcvCapture = buildFirstTinyCorrectedOhlcvPayloadStaticCapture();
  const candidateRows =
    input.candidate_rows ??
    staticOhlcvCapture.rows;
  const cacheReadbackStatus = input.cache_readback_status ?? "unavailable";
  const existingKeys = new Set(input.existing_candle_keys ?? []);
  const updateKeys = new Set(input.existing_candle_keys_requiring_update ?? []);
  const validations = candidateRows.map(validateRow);
  const rejectionReasonCounts: Record<string, number> = {};
  const plannedRows: FirstTinyExecutableCandlePersistencePlanRow[] = [];
  let plannedInserts = 0;
  let plannedUpdates = 0;
  let plannedSkips = 0;
  let plannedInvalidRejections = 0;

  for (const [index, row] of candidateRows.entries()) {
    const validation = validations[index];
    const key = persistenceKey(row);
    let action: FirstTinyExecutableCandlePersistenceAction = "planned_insert";

    if (!validation?.valid) {
      action = "planned_rejection";
      plannedInvalidRejections += 1;
      for (const reason of validation?.reasons ?? ["unknown_invalid_row"]) {
        increment(rejectionReasonCounts, reason);
      }
    } else if (cacheReadbackStatus === "available" && existingKeys.has(key)) {
      if (updateKeys.has(key)) {
        action = "planned_update";
        plannedUpdates += 1;
      } else {
        action = "planned_skip";
        plannedSkips += 1;
      }
    } else {
      plannedInserts += 1;
    }

    plannedRows.push({
      timestamp: row.timestamp ?? null,
      persistence_key: key,
      action,
      valid: validation?.valid ?? false,
      rejection_reasons: validation?.reasons ?? ["unknown_invalid_row"],
    });
  }

  const firstTimestamp = candidateRows[0]?.timestamp ?? null;
  const lastTimestamp = candidateRows.at(-1)?.timestamp ?? null;
  const spacingValid = fiveMinuteSpacingValid(candidateRows);
  const windowMatches =
    candidateRows.length === 73 &&
    firstTimestamp === expectedFirstTimestamp &&
    lastTimestamp === expectedLastTimestamp &&
    spacingValid;
  const validRows = validations.filter((validation) => validation.valid).length;
  const timestampMetadataValidRows = validations.filter(
    (validation) => validation.timestamp_metadata_valid,
  ).length;
  const ohlcvValidRows = validations.filter(
    (validation) => validation.ohlcv_valid,
  ).length;
  const warnings: string[] = ["dry_run_only_no_candle_write"];

  if (cacheReadbackStatus === "unavailable") {
    warnings.push("exact_insert_update_skip_split_requires_readback");
  }
  if (validRows === 0 && candidateRows.length > 0) {
    warnings.push("executable_ohlcv_payload_not_available_in_static_artifact");
  }

  return {
    plan_status: "planned",
    plan_marker: firstTinyHistoricalCandleExecutablePersistenceDryRunPlanMarker,
    plan_version: firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion,
    plan_mode: "dry_run_only",
    dry_run_only: true,
    source_verification:
      firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
    source_capture_marker: firstTinyCorrectedOhlcvPayloadStaticCaptureMarker,
    source_artifact:
      "docs/first-tiny-historical-candle-corrected-filtered-ohlcv-payload.json",
    source_verification_status: source.verification_status,
    source_execution_status: source.execution_status,
    source_strategy: source.strategy_id,
    target_table: "historical_candles",
    conflict_target: [...conflictTarget],
    request_scope: {
      provider: "twelve_data",
      ticker: "AAPL",
      interval: "5min",
      trading_day: "2026-07-08",
      session: "regular",
      timezone: "America/New_York",
      adjusted: false,
    },
    fetch_run: {
      fetch_run_id: fetchRunId,
      fetch_run_id_attached: true,
    },
    payload_summary: {
      executable_payload_available: validRows === candidateRows.length,
      source_payload_rows: 73,
      expected_candle_rows: 73,
      candidate_candle_rows: candidateRows.length,
      timestamp_metadata_valid_rows: timestampMetadataValidRows,
      timestamp_valid_rows: timestampMetadataValidRows,
      candle_write_valid_rows: validRows,
      valid_candle_rows: validRows,
      invalid_candle_rows: candidateRows.length - validRows,
      ohlcv_valid_rows: ohlcvValidRows,
      ohlcv_missing_rows: candidateRows.length - ohlcvValidRows,
      ohlcv_values_not_invented: true,
      first_timestamp: firstTimestamp,
      last_timestamp: lastTimestamp,
      five_minute_spacing_valid: spacingValid,
      window_matches_intended: windowMatches,
    },
    validation: {
      provider_valid_rows: countWhere(
        candidateRows,
        (row) => row.provider === "twelve_data",
      ),
      ticker_valid_rows: countWhere(candidateRows, (row) => row.ticker === "AAPL"),
      interval_valid_rows: countWhere(
        candidateRows,
        (row) => row.interval === "5min",
      ),
      timestamp_valid_rows: countWhere(candidateRows, (row) =>
        isIsoUtcTimestamp(row.timestamp),
      ),
      adjusted_valid_rows: countWhere(
        candidateRows,
        (row) => row.adjusted === false,
      ),
      trading_day_valid_rows: countWhere(
        candidateRows,
        (row) => row.trading_day === "2026-07-08",
      ),
      session_valid_rows: countWhere(
        candidateRows,
        (row) => row.session === "regular",
      ),
      timezone_valid_rows: countWhere(
        candidateRows,
        (row) => row.timezone === "America/New_York",
      ),
      fetch_run_id_valid_rows: countWhere(
        candidateRows,
        (row) => row.fetch_run_id === fetchRunId,
      ),
      finite_ohlcv_rows: ohlcvValidRows,
      ohlc_geometry_valid_rows: ohlcvValidRows,
      non_negative_volume_rows: countWhere(
        candidateRows,
        (row) => isFiniteNumber(row.volume) && row.volume >= 0,
      ),
      rejection_reason_counts: rejectionReasonCounts,
      invalid_examples: plannedRows
        .filter((row) => row.action === "planned_rejection")
        .slice(0, 6)
        .map((row) => ({
          timestamp: row.timestamp,
          reasons: row.rejection_reasons,
        })),
    },
    cache_readback: {
      status: cacheReadbackStatus,
      existing_keys_checked:
        cacheReadbackStatus === "available" ? existingKeys.size : 0,
      existing_rows_detected:
        cacheReadbackStatus === "available"
          ? plannedRows.filter(
              (row) =>
                row.action === "planned_skip" ||
                row.action === "planned_update",
            ).length
          : 0,
      exact_insert_update_skip_split_available: cacheReadbackStatus === "available",
      warning:
        cacheReadbackStatus === "available"
          ? null
          : "exact_insert_update_skip_split_requires_readback",
    },
    upsert_plan: {
      planned_inserts: plannedInserts,
      planned_updates: plannedUpdates,
      planned_skips: plannedSkips,
      planned_invalid_rejections: plannedInvalidRejections,
      planned_rows: plannedRows,
    },
    safety: {
      candle_write_allowed_now: false,
      requires_separate_operator_approval: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    recommended_next_steps: [
      "review_executable_candle_persistence_plan_v2",
      "require_separate_candle_persistence_approval_signal",
      "keep_replay_and_scanner_effects_disabled",
    ],
    warnings,
  };
}
