import {
  buildFirstTinyCandlePersistenceApproval,
  type FirstTinyCandlePersistenceApprovalEnv,
  type FirstTinyCandlePersistenceApprovalSummary,
} from "@/lib/first-tiny-historical-candle-persistence-approval";
import {
  buildFirstTinyCorrectedOhlcvPayloadStaticCapture,
  type FirstTinyCorrectedOhlcvPayloadStaticCaptureRow,
  type FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary,
} from "@/lib/first-tiny-historical-candle-corrected-ohlcv-payload-static-capture";
import {
  buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan,
  firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion,
  firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
  type FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanSummary,
} from "@/lib/first-tiny-historical-candle-executable-persistence-dry-run-plan";

export const firstTinyCandlePersistenceExecuteRouteBuildMarker =
  "action_295_first_tiny_candle_persistence_execute_attempt";

export type FirstTinyCandlePersistenceExecutionStatus =
  | "not_approved"
  | "ready_with_valid_signal"
  | "blocked"
  | "failed"
  | "candle_persistence_completed"
  | "candle_persistence_already_recorded"
  | "write_completed_readback_unavailable";

export type FirstTinyCandlePersistenceSupabaseClient = {
  from: (table: string) => unknown;
};

export type FirstTinyCandlePersistenceExecuteInput = {
  execute_candle_persistence?: boolean | null;
  env?: FirstTinyCandlePersistenceApprovalEnv | null;
  static_ohlcv_capture?: FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary | null;
  dry_run_plan?: FirstTinyHistoricalCandleExecutablePersistenceDryRunPlanSummary | null;
  approval?: FirstTinyCandlePersistenceApprovalSummary | null;
  supabase_client?: FirstTinyCandlePersistenceSupabaseClient | null;
};

export type FirstTinyCandlePersistenceExecuteSummary = {
  execution_status: FirstTinyCandlePersistenceExecutionStatus;
  route_build_marker: typeof firstTinyCandlePersistenceExecuteRouteBuildMarker;
  target_table: "historical_candles";
  source_verification: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification;
  plan_version: typeof firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion;
  approval_status: FirstTinyCandlePersistenceApprovalSummary["approval_status"];
  provider: "twelve_data";
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  session: "regular";
  timezone: "America/New_York";
  adjusted: false;
  fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  expected_rows: 73;
  attempted_rows: number;
  candle_rows_inserted: number;
  candle_rows_updated: number;
  candle_rows_skipped: number;
  candle_rows_rejected: number;
  readback_verified: boolean;
  duplicate_prevented: boolean;
  candles_persisted: boolean;
  raw_response_persisted: false;
  fetch_run_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  provider_call_executed: false;
  provider_call_attempted: false;
  max_73_rows_enforced: true;
  no_raw_response_persistence_enforced: true;
  no_fetch_run_persistence_enforced: true;
  no_replay_enforced: true;
  no_scanner_ranking_effect_enforced: true;
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
};

type QueryBuilder = {
  select?: (...args: unknown[]) => QueryBuilder;
  eq?: (...args: unknown[]) => QueryBuilder;
  in?: (...args: unknown[]) => QueryBuilder;
  order?: (...args: unknown[]) => QueryBuilder;
  limit?: (...args: unknown[]) => QueryBuilder;
  upsert?: (...args: unknown[]) => QueryBuilder;
  then?: PromiseLike<{ data?: unknown; error?: unknown }>["then"];
};

const tableName = "historical_candles";
const fetchRunId = "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
const expectedFirstTimestamp = "2026-07-08T13:45:00.000Z";
const expectedLastTimestamp = "2026-07-08T19:45:00.000Z";
const noWriteNextSteps = [
  "configure_valid_candle_persistence_approval_signal",
  "require_explicit_operator_execute_call",
  "keep_replay_and_scanner_effects_disabled",
] as const;
const successNextSteps = [
  "disable_candle_persistence_approval_signal_after_success",
  "verify_candle_persistence_readback",
  "require_separate_approval_before_replay_or_scanner_use",
] as const;

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

function normalizeExistingRow(row: unknown) {
  if (typeof row !== "object" || row === null) return null;
  const data = row as Record<string, unknown>;

  return {
    provider: stringValue(data.provider),
    ticker: stringValue(data.ticker),
    interval: stringValue(data.interval),
    timestamp: stringValue(data.timestamp),
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

function rowMatchesStatic(
  existing: unknown,
  source: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow,
) {
  const row = normalizeExistingRow(existing);
  if (!row) return false;

  return (
    row.provider === source.provider &&
    row.ticker === source.ticker &&
    row.interval === source.interval &&
    row.timestamp === source.timestamp &&
    sameNumber(row.open, source.open) &&
    sameNumber(row.high, source.high) &&
    sameNumber(row.low, source.low) &&
    sameNumber(row.close, source.close) &&
    sameNumber(row.volume, source.volume) &&
    row.adjusted === source.adjusted &&
    row.trading_day === source.trading_day &&
    row.session === source.session &&
    row.timezone === source.timezone &&
    row.fetch_run_id === source.fetch_run_id
  );
}

function cacheKey(row: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow) {
  return [
    row.provider,
    row.ticker,
    row.interval,
    row.trading_day,
    row.session,
    row.timezone,
    row.adjusted ? "adjusted_true" : "adjusted_false",
    row.timestamp,
  ].join(":");
}

function buildCandleRecord(row: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow) {
  return {
    provider: row.provider,
    ticker: row.ticker,
    interval: row.interval,
    timestamp: row.timestamp,
    trading_day: row.trading_day,
    session: row.session,
    timezone: row.timezone,
    open: row.open,
    high: row.high,
    low: row.low,
    close: row.close,
    volume: row.volume,
    adjusted: row.adjusted,
    source: row.provider,
    cache_key: cacheKey(row),
    provider_request_id: null,
    fetch_run_id: row.fetch_run_id,
    raw_payload: null,
    metadata: {
      created_by_action: firstTinyCandlePersistenceExecuteRouteBuildMarker,
      source_verification:
        firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
      plan_version: firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion,
      learning_backfill_scope: "first_tiny_static_ohlcv_payload",
      raw_response_persisted: false,
      fetch_run_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    quality_flags: [],
    validation_status: "validated_static_payload",
  };
}

function baseSummary(input: {
  status: FirstTinyCandlePersistenceExecutionStatus;
  approval: FirstTinyCandlePersistenceApprovalSummary;
  attemptedRows?: number;
  inserted?: number;
  updated?: number;
  skipped?: number;
  rejected?: number;
  readbackVerified?: boolean;
  duplicatePrevented?: boolean;
  candlesPersisted?: boolean;
  blockers?: string[];
  warnings?: string[];
  nextSteps?: string[];
}): FirstTinyCandlePersistenceExecuteSummary {
  return {
    execution_status: input.status,
    route_build_marker: firstTinyCandlePersistenceExecuteRouteBuildMarker,
    target_table: tableName,
    source_verification:
      firstTinyHistoricalCandleExecutablePersistenceDryRunSourceVerification,
    plan_version: firstTinyHistoricalCandleExecutablePersistenceDryRunPlanVersion,
    approval_status: input.approval.approval_status,
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    session: "regular",
    timezone: "America/New_York",
    adjusted: false,
    fetch_run_id: fetchRunId,
    expected_rows: 73,
    attempted_rows: input.attemptedRows ?? 0,
    candle_rows_inserted: input.inserted ?? 0,
    candle_rows_updated: input.updated ?? 0,
    candle_rows_skipped: input.skipped ?? 0,
    candle_rows_rejected: input.rejected ?? 0,
    readback_verified: input.readbackVerified ?? false,
    duplicate_prevented: input.duplicatePrevented ?? false,
    candles_persisted: input.candlesPersisted ?? false,
    raw_response_persisted: false,
    fetch_run_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    provider_call_executed: false,
    provider_call_attempted: false,
    max_73_rows_enforced: true,
    no_raw_response_persistence_enforced: true,
    no_fetch_run_persistence_enforced: true,
    no_replay_enforced: true,
    no_scanner_ranking_effect_enforced: true,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    recommended_next_steps: input.nextSteps ?? [...noWriteNextSteps],
  };
}

function exactSourceRows(capture: FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary) {
  return capture.rows;
}

function sourceRowsReady(
  capture: FirstTinyCorrectedOhlcvPayloadStaticCaptureSummary,
) {
  const rows = exactSourceRows(capture);
  return (
    capture.ready_for_executable_persistence_dry_run === true &&
    rows.length === 73 &&
    rows[0]?.timestamp === expectedFirstTimestamp &&
    rows.at(-1)?.timestamp === expectedLastTimestamp &&
    new Set(rows.map((row) => row.timestamp)).size === 73
  );
}

async function readExistingRows(input: {
  client: FirstTinyCandlePersistenceSupabaseClient;
  timestamps: string[];
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
    ?.in?.("timestamp", input.timestamps) ?? selected;
  const ordered = filtered.order?.("timestamp", { ascending: true }) ?? filtered;
  const limited = ordered.limit?.(73) ?? ordered;

  return resolveQuery(limited);
}

async function upsertCandleRows(input: {
  client: FirstTinyCandlePersistenceSupabaseClient;
  records: Array<Record<string, unknown>>;
}) {
  const query = asBuilder(input.client.from(tableName));
  const upserted =
    query.upsert?.(input.records, {
      onConflict: "provider,ticker,interval,timestamp,adjusted",
    }) ?? query;
  const selected =
    upserted.select?.(
      "provider,ticker,interval,timestamp,open,high,low,close,volume,adjusted,trading_day,session,timezone,fetch_run_id",
    ) ?? upserted;
  const ordered = selected.order?.("timestamp", { ascending: true }) ?? selected;

  return resolveQuery(ordered);
}

function rowsArray(data: unknown) {
  return Array.isArray(data) ? data : [];
}

function verifyRowsAgainstSource(input: {
  readbackRows: unknown[];
  sourceRows: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow[];
}) {
  if (input.readbackRows.length !== 73 || input.sourceRows.length !== 73) {
    return false;
  }

  const byTimestamp = new Map(
    input.readbackRows.map((row) => [
      normalizeExistingRow(row)?.timestamp ?? "",
      row,
    ]),
  );

  if (byTimestamp.size !== 73) return false;

  return input.sourceRows.every((source) =>
    rowMatchesStatic(byTimestamp.get(source.timestamp), source),
  );
}

function existingRowsMatch(input: {
  existingRows: unknown[];
  sourceRows: FirstTinyCorrectedOhlcvPayloadStaticCaptureRow[];
}) {
  const byTimestamp = new Map(
    input.existingRows.map((row) => [
      normalizeExistingRow(row)?.timestamp ?? "",
      row,
    ]),
  );
  const mismatches = input.sourceRows.filter((source) => {
    const existing = byTimestamp.get(source.timestamp);
    return existing !== undefined && !rowMatchesStatic(existing, source);
  });

  return {
    allExistingMatch:
      input.existingRows.length === 73 &&
      input.sourceRows.every((source) =>
        rowMatchesStatic(byTimestamp.get(source.timestamp), source),
      ),
    mismatchCount: mismatches.length,
  };
}

export function buildFirstTinyCandlePersistenceExecuteReadiness(
  input: Pick<
    FirstTinyCandlePersistenceExecuteInput,
    "env" | "static_ohlcv_capture" | "dry_run_plan" | "approval"
  > = {},
): FirstTinyCandlePersistenceExecuteSummary {
  const staticCapture =
    input.static_ohlcv_capture ??
    buildFirstTinyCorrectedOhlcvPayloadStaticCapture();
  const plan =
    input.dry_run_plan ??
    buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan();
  const approval =
    input.approval ??
    buildFirstTinyCandlePersistenceApproval({
      env: input.env ?? process.env,
      static_ohlcv_capture: staticCapture,
      dry_run_plan: plan,
    });
  const ready =
    approval.approval_status === "valid_for_future_candle_persistence" &&
    approval.readiness.ready_to_propose_candle_persistence_write &&
    sourceRowsReady(staticCapture);

  return baseSummary({
    status: ready ? "ready_with_valid_signal" : "not_approved",
    approval,
    attemptedRows: 0,
    warnings: ready ? [] : ["candle_persistence_approval_signal_not_valid"],
    nextSteps: ready
      ? [
          "operator_may_call_explicit_candle_persistence_route",
          "disable_candle_persistence_approval_signal_after_success",
          "verify_candle_persistence_readback",
          "require_separate_approval_before_replay_or_scanner_use",
        ]
      : [...noWriteNextSteps],
  });
}

export async function executeFirstTinyCandlePersistence(
  input: FirstTinyCandlePersistenceExecuteInput = {},
): Promise<FirstTinyCandlePersistenceExecuteSummary> {
  const staticCapture =
    input.static_ohlcv_capture ??
    buildFirstTinyCorrectedOhlcvPayloadStaticCapture();
  const plan =
    input.dry_run_plan ??
    buildFirstTinyHistoricalCandleExecutablePersistenceDryRunPlan();
  const approval =
    input.approval ??
    buildFirstTinyCandlePersistenceApproval({
      env: input.env ?? process.env,
      static_ohlcv_capture: staticCapture,
      dry_run_plan: plan,
    });

  if (approval.approval_status !== "valid_for_future_candle_persistence") {
    return baseSummary({
      status:
        approval.approval_status === "invalid" ? "blocked" : "not_approved",
      approval,
      blockers: approval.blockers,
      warnings:
        approval.approval_status === "not_configured"
          ? ["candle_persistence_approval_signal_not_configured"]
          : approval.warnings,
    });
  }

  if (input.execute_candle_persistence !== true) {
    return baseSummary({
      status: "ready_with_valid_signal",
      approval,
      blockers: ["execute_candle_persistence_true_required"],
      nextSteps: [
        "operator_may_call_explicit_candle_persistence_route",
        "require_separate_approval_before_replay_or_scanner_use",
      ],
    });
  }

  const sourceRows = exactSourceRows(staticCapture);

  if (!sourceRowsReady(staticCapture)) {
    return baseSummary({
      status: "blocked",
      approval,
      attemptedRows: sourceRows.length,
      blockers: ["static_ohlcv_payload_not_ready"],
    });
  }

  if (
    plan.payload_summary.candle_write_valid_rows !== 73 ||
    plan.upsert_plan.planned_invalid_rejections !== 0 ||
    plan.safety.candle_write_allowed_now !== false
  ) {
    return baseSummary({
      status: "blocked",
      approval,
      attemptedRows: sourceRows.length,
      blockers: ["dry_run_plan_not_ready_for_execute"],
    });
  }

  const serviceRole = input.supabase_client;

  if (!serviceRole) {
    return baseSummary({
      status: "blocked",
      approval,
      attemptedRows: sourceRows.length,
      blockers: ["supabase_service_role_unavailable"],
    });
  }

  const existing = await readExistingRows({
    client: serviceRole,
    timestamps: sourceRows.map((row) => row.timestamp),
  });
  const existingError = errorMessage(existing.error);

  if (existingError) {
    return baseSummary({
      status: "blocked",
      approval,
      attemptedRows: sourceRows.length,
      blockers: [`existing_rows_lookup_failed:${existingError}`],
    });
  }

  const existingRows = rowsArray(existing.data);
  const existingMatch = existingRowsMatch({ existingRows, sourceRows });

  if (existingMatch.mismatchCount > 0) {
    return baseSummary({
      status: "blocked",
      approval,
      attemptedRows: sourceRows.length,
      blockers: ["existing_row_mismatch_requires_manual_review"],
      skipped: existingRows.length,
    });
  }

  if (existingMatch.allExistingMatch) {
    return baseSummary({
      status: "candle_persistence_already_recorded",
      approval,
      attemptedRows: sourceRows.length,
      skipped: 73,
      duplicatePrevented: true,
      candlesPersisted: true,
      readbackVerified: true,
      nextSteps: [...successNextSteps],
    });
  }

  const records = sourceRows.map(buildCandleRecord);
  const upsert = await upsertCandleRows({ client: serviceRole, records });
  const upsertError = errorMessage(upsert.error);

  if (upsertError) {
    return baseSummary({
      status: "failed",
      approval,
      attemptedRows: sourceRows.length,
      blockers: [`upsert_failed:${upsertError}`],
    });
  }

  const upsertRows = rowsArray(upsert.data);
  const insertedRows = 73 - existingRows.length;
  const updatedRows = existingRows.length;

  if (upsertRows.length === 73) {
    const verified = verifyRowsAgainstSource({
      readbackRows: upsertRows,
      sourceRows,
    });

    return baseSummary({
      status: verified
        ? "candle_persistence_completed"
        : "write_completed_readback_unavailable",
      approval,
      attemptedRows: sourceRows.length,
      inserted: insertedRows,
      updated: updatedRows,
      skipped: 0,
      readbackVerified: verified,
      candlesPersisted: true,
      warnings: verified
        ? []
        : ["upsert_succeeded_but_readback_verification_failed"],
      nextSteps: [...successNextSteps],
    });
  }

  const readback = await readExistingRows({
    client: serviceRole,
    timestamps: sourceRows.map((row) => row.timestamp),
  });
  const readbackError = errorMessage(readback.error);

  if (readbackError) {
    return baseSummary({
      status: "write_completed_readback_unavailable",
      approval,
      attemptedRows: sourceRows.length,
      inserted: insertedRows,
      updated: updatedRows,
      candlesPersisted: true,
      warnings: [`readback_failed:${readbackError}`],
      nextSteps: [...successNextSteps],
    });
  }

  const readbackRows = rowsArray(readback.data);
  const verified = verifyRowsAgainstSource({ readbackRows, sourceRows });

  return baseSummary({
    status: verified
      ? "candle_persistence_completed"
      : "write_completed_readback_unavailable",
    approval,
    attemptedRows: sourceRows.length,
    inserted: insertedRows,
    updated: updatedRows,
    readbackVerified: verified,
    candlesPersisted: true,
    warnings: verified
      ? []
      : ["upsert_succeeded_but_readback_verification_failed"],
    nextSteps: [...successNextSteps],
  });
}
