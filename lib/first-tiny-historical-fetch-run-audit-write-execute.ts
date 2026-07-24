import {
  buildFirstTinyFetchRunAuditWriteApproval,
  type FirstTinyFetchRunAuditWriteApprovalEnv,
  type FirstTinyFetchRunAuditWriteApprovalSummary,
} from "@/lib/first-tiny-historical-fetch-run-audit-write-approval";
import {
  buildFirstTinyHistoricalFetchRunAuditWritePlan,
  type FirstTinyHistoricalFetchRunAuditWritePlanSummary,
} from "@/lib/first-tiny-historical-fetch-run-audit-write-plan";

export type FirstTinyFetchRunAuditWriteExecutionStatus =
  | "not_approved"
  | "ready_with_valid_signal"
  | "blocked"
  | "failed"
  | "fetch_run_audit_write_completed"
  | "fetch_run_audit_write_already_recorded"
  | "write_completed_readback_unavailable";

export type FirstTinyFetchRunAuditWriteSupabaseClient = {
  from: (table: string) => unknown;
};

export type FirstTinyFetchRunAuditWriteExecuteInput = {
  execute_fetch_run_audit_write?: boolean | null;
  env?: FirstTinyFetchRunAuditWriteApprovalEnv | null;
  audit_write_plan?: FirstTinyHistoricalFetchRunAuditWritePlanSummary | null;
  supabase_client?: FirstTinyFetchRunAuditWriteSupabaseClient | null;
  now?: Date | string | null;
};

export type FirstTinyFetchRunAuditWriteExecuteSummary = {
  execution_status: FirstTinyFetchRunAuditWriteExecutionStatus;
  target_table: "historical_candle_fetch_runs";
  source_verification: "first_tiny_historical_fetch_no_persist_verified";
  planned_rows: 1;
  audit_rows_inserted: 0 | 1;
  readback_verified: boolean;
  duplicate_prevented: boolean;
  approval_status: FirstTinyFetchRunAuditWriteApprovalSummary["approval_status"];
  fetch_run_persisted: boolean;
  candles_persisted: false;
  raw_response_persisted: false;
  synthetic_outcomes_persisted: false;
  replay_executed: false;
  scanner_behavior_changed: false;
  live_ranking_changed: false;
  max_one_row_enforced: true;
  no_candle_persistence_enforced: true;
  no_raw_response_persistence_enforced: true;
  no_replay_enforced: true;
  no_scanner_ranking_effect_enforced: true;
  ticker: "AAPL";
  interval: "5min";
  trading_day: "2026-07-08";
  request_count: 1;
  valid_candles: 27;
  operator_label: string | null;
  approval_reference: string | null;
  inserted_row_id: string | null;
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
};

type QueryBuilder = {
  select?: (...args: unknown[]) => QueryBuilder;
  eq?: (...args: unknown[]) => QueryBuilder;
  limit?: (...args: unknown[]) => QueryBuilder;
  maybeSingle?: () => Promise<{ data?: unknown; error?: unknown }>;
  insert?: (...args: unknown[]) => QueryBuilder;
  single?: () => Promise<{ data?: unknown; error?: unknown }>;
};

const tableName = "historical_candle_fetch_runs";
const actionId =
  "action_280_first_tiny_fetch_run_audit_write_execute_attempt";

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

function isoNow(input: Date | string | null | undefined) {
  if (input instanceof Date) return input.toISOString();
  if (typeof input === "string" && input.trim().length > 0) {
    return new Date(input).toISOString();
  }
  return new Date().toISOString();
}

function baseSummary(input: {
  status: FirstTinyFetchRunAuditWriteExecutionStatus;
  approval: FirstTinyFetchRunAuditWriteApprovalSummary;
  inserted?: 0 | 1;
  readbackVerified?: boolean;
  duplicatePrevented?: boolean;
  fetchRunPersisted?: boolean;
  insertedRowId?: string | null;
  blockers?: string[];
  warnings?: string[];
  nextSteps?: string[];
}): FirstTinyFetchRunAuditWriteExecuteSummary {
  return {
    execution_status: input.status,
    target_table: tableName,
    source_verification: "first_tiny_historical_fetch_no_persist_verified",
    planned_rows: 1,
    audit_rows_inserted: input.inserted ?? 0,
    readback_verified: input.readbackVerified ?? false,
    duplicate_prevented: input.duplicatePrevented ?? false,
    approval_status: input.approval.approval_status,
    fetch_run_persisted: input.fetchRunPersisted ?? false,
    candles_persisted: false,
    raw_response_persisted: false,
    synthetic_outcomes_persisted: false,
    replay_executed: false,
    scanner_behavior_changed: false,
    live_ranking_changed: false,
    max_one_row_enforced: true,
    no_candle_persistence_enforced: true,
    no_raw_response_persistence_enforced: true,
    no_replay_enforced: true,
    no_scanner_ranking_effect_enforced: true,
    ticker: "AAPL",
    interval: "5min",
    trading_day: "2026-07-08",
    request_count: 1,
    valid_candles: 27,
    operator_label: input.approval.signal.operator_label,
    approval_reference: input.approval.signal.approval_reference,
    inserted_row_id: input.insertedRowId ?? null,
    blockers: input.blockers ?? [],
    warnings: input.warnings ?? [],
    recommended_next_steps:
      input.nextSteps ??
      [
        "configure_valid_fetch_run_audit_write_approval_signal",
        "require_separate_approval_before_candle_persistence",
      ],
  };
}

function buildAuditRecord(input: {
  plan: FirstTinyHistoricalFetchRunAuditWritePlanSummary;
  approval: FirstTinyFetchRunAuditWriteApprovalSummary;
  now: string;
}) {
  const record = input.plan.planned_audit_record;

  return {
    provider: record.provider,
    request_type: record.request_type,
    ticker_count: record.ticker_count,
    candle_count: record.candle_count,
    interval: record.interval,
    trading_day_start: record.trading_day_start,
    trading_day_end: record.trading_day_end,
    completed_at: input.now,
    status: record.status,
    error_type: null,
    provider_credits_estimated: record.provider_credits_estimated,
    provider_credits_used: record.provider_credits_used,
    cache_hits: record.cache_hits,
    cache_misses: record.cache_misses,
    metadata: {
      source_verification: input.plan.source_verification,
      endpoint: record.endpoint,
      ticker: record.ticker,
      trading_day: record.trading_day,
      session: record.session,
      timezone: record.timezone,
      adjusted: record.adjusted,
      cache_key: record.cache_key,
      request_count: record.request_count,
      estimated_credits: record.estimated_credits,
      cache_lookup_attempted: true,
      cache_hit: false,
      call_attempted: record.call_attempted,
      call_succeeded: record.call_succeeded,
      http_status: record.http_status,
      parse_status: record.parse_status,
      raw_candles: record.raw_candles,
      normalized_candles: record.normalized_candles,
      valid_candles: record.valid_candles,
      invalid_candles: record.invalid_candles,
      planned_inserts: record.planned_inserts,
      planned_updates: record.planned_updates,
      planned_skips: record.planned_skips,
      planned_invalid_rejections: record.planned_invalid_rejections,
      raw_response_persisted: false,
      candles_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      operator_label: input.approval.signal.operator_label,
      approval_reference: input.approval.signal.approval_reference,
      created_by_action: actionId,
      idempotency_key: [
        input.plan.source_verification,
        input.approval.signal.approval_reference,
        record.ticker,
        record.trading_day,
        actionId,
      ].join(":"),
    },
  };
}

function rowId(row: unknown) {
  if (typeof row === "object" && row !== null && "id" in row) {
    const id = (row as { id?: unknown }).id;
    return typeof id === "string" ? id : null;
  }
  return null;
}

function metadata(row: unknown): Record<string, unknown> {
  if (typeof row !== "object" || row === null || !("metadata" in row)) {
    return {};
  }
  const value = (row as { metadata?: unknown }).metadata;
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function verifyReadback(row: unknown) {
  const data = row as Record<string, unknown>;
  const meta = metadata(row);

  return (
    data.provider === "twelve_data" &&
    data.request_type === "time_series" &&
    data.interval === "5min" &&
    data.trading_day_start === "2026-07-08" &&
    data.trading_day_end === "2026-07-08" &&
    meta.ticker === "AAPL" &&
    meta.request_count === 1 &&
    meta.valid_candles === 27 &&
    meta.candles_persisted === false &&
    meta.raw_response_persisted === false &&
    meta.replay_executed === false &&
    meta.scanner_behavior_changed === false &&
    meta.live_ranking_changed === false
  );
}

async function existingAuditRow(input: {
  client: FirstTinyFetchRunAuditWriteSupabaseClient;
  plan: FirstTinyHistoricalFetchRunAuditWritePlanSummary;
  approval: FirstTinyFetchRunAuditWriteApprovalSummary;
}) {
  const query = asBuilder(input.client.from(tableName));
  const selected = query.select?.("*") ?? query;
  const filtered = [
    ["provider", "twelve_data"],
    ["request_type", "time_series"],
    ["interval", "5min"],
    ["trading_day_start", "2026-07-08"],
    ["trading_day_end", "2026-07-08"],
    ["metadata->>source_verification", input.plan.source_verification],
    ["metadata->>approval_reference", input.approval.signal.approval_reference],
    ["metadata->>ticker", "AAPL"],
  ].reduce(
    (builder, [column, value]) => builder.eq?.(column, value) ?? builder,
    selected,
  );
  const limited = filtered.limit?.(1) ?? filtered;

  if (!limited.maybeSingle) {
    return { data: null, error: new Error("duplicate_readback_unavailable") };
  }

  return limited.maybeSingle();
}

async function insertAuditRow(input: {
  client: FirstTinyFetchRunAuditWriteSupabaseClient;
  record: Record<string, unknown>;
}) {
  const query = asBuilder(input.client.from(tableName));
  const inserted = query.insert?.([input.record]) ?? query;
  const selected = inserted.select?.("*") ?? inserted;

  if (!selected.single) {
    return { data: null, error: new Error("insert_readback_unavailable") };
  }

  return selected.single();
}

export function buildFirstTinyFetchRunAuditWriteExecuteReadiness(
  input: Pick<
    FirstTinyFetchRunAuditWriteExecuteInput,
    "env" | "audit_write_plan"
  > = {},
): FirstTinyFetchRunAuditWriteExecuteSummary {
  const plan =
    input.audit_write_plan ?? buildFirstTinyHistoricalFetchRunAuditWritePlan();
  const approval = buildFirstTinyFetchRunAuditWriteApproval({
    env: input.env ?? process.env,
    audit_write_plan: plan,
  });
  const ready =
    approval.approval_status === "valid_for_future_audit_write" &&
    approval.readiness.ready_to_propose_audit_write_action;

  return baseSummary({
    status: ready ? "ready_with_valid_signal" : "not_approved",
    approval,
    warnings: ready ? [] : ["audit_write_approval_signal_not_valid"],
    nextSteps: ready
      ? [
          "operator_may_call_explicit_audit_write_route",
          "disable_fetch_run_audit_write_approval_signal_after_success",
          "require_separate_approval_before_candle_persistence",
        ]
      : [
          "configure_valid_fetch_run_audit_write_approval_signal",
          "require_separate_approval_before_candle_persistence",
        ],
  });
}

export async function executeFirstTinyFetchRunAuditWrite(
  input: FirstTinyFetchRunAuditWriteExecuteInput = {},
): Promise<FirstTinyFetchRunAuditWriteExecuteSummary> {
  const plan =
    input.audit_write_plan ?? buildFirstTinyHistoricalFetchRunAuditWritePlan();
  const approval = buildFirstTinyFetchRunAuditWriteApproval({
    env: input.env ?? process.env,
    audit_write_plan: plan,
  });

  if (approval.approval_status !== "valid_for_future_audit_write") {
    return baseSummary({
      status:
        approval.approval_status === "invalid" ? "blocked" : "not_approved",
      approval,
      blockers: approval.blockers,
      warnings:
        approval.approval_status === "not_configured"
          ? ["audit_write_approval_signal_not_configured"]
          : approval.warnings,
    });
  }

  if (input.execute_fetch_run_audit_write !== true) {
    return baseSummary({
      status: "ready_with_valid_signal",
      approval,
      blockers: ["execute_fetch_run_audit_write_true_required"],
      nextSteps: [
        "operator_may_call_explicit_audit_write_route",
        "require_separate_approval_before_candle_persistence",
      ],
    });
  }

  const serviceRole = input.supabase_client;

  if (!serviceRole) {
    return baseSummary({
      status: "blocked",
      approval,
      blockers: ["supabase_service_role_unavailable"],
    });
  }

  const existing = await existingAuditRow({
    client: serviceRole,
    plan,
    approval,
  });
  const existingError = errorMessage(existing.error);

  if (existingError && existingError !== "JSON object requested, multiple (or no) rows returned") {
    return baseSummary({
      status: "blocked",
      approval,
      blockers: [`duplicate_lookup_failed:${existingError}`],
    });
  }

  if (existing.data) {
    return baseSummary({
      status: "fetch_run_audit_write_already_recorded",
      approval,
      duplicatePrevented: true,
      fetchRunPersisted: true,
      readbackVerified: verifyReadback(existing.data),
      insertedRowId: rowId(existing.data),
      nextSteps: [
        "disable_fetch_run_audit_write_approval_signal_after_success",
        "verify_audit_row_readback",
        "require_separate_approval_before_candle_persistence",
      ],
    });
  }

  const insert = await insertAuditRow({
    client: serviceRole,
    record: buildAuditRecord({
      plan,
      approval,
      now: isoNow(input.now),
    }),
  });
  const insertError = errorMessage(insert.error);

  if (insertError) {
    return baseSummary({
      status: "failed",
      approval,
      blockers: [`insert_failed:${insertError}`],
    });
  }

  if (!insert.data) {
    return baseSummary({
      status: "write_completed_readback_unavailable",
      approval,
      inserted: 1,
      fetchRunPersisted: true,
      warnings: ["insert_succeeded_but_readback_unavailable"],
      nextSteps: [
        "disable_fetch_run_audit_write_approval_signal_after_success",
        "verify_audit_row_readback",
        "require_separate_approval_before_candle_persistence",
      ],
    });
  }

  return baseSummary({
    status: verifyReadback(insert.data)
      ? "fetch_run_audit_write_completed"
      : "write_completed_readback_unavailable",
    approval,
    inserted: 1,
    fetchRunPersisted: true,
    readbackVerified: verifyReadback(insert.data),
    insertedRowId: rowId(insert.data),
    warnings: verifyReadback(insert.data)
      ? []
      : ["insert_succeeded_but_readback_verification_failed"],
    nextSteps: [
      "disable_fetch_run_audit_write_approval_signal_after_success",
      "verify_audit_row_readback",
      "require_separate_approval_before_candle_persistence",
    ],
  });
}
