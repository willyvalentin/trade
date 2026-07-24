import {
  buildFirstTinyHistoricalFetchRunAuditWritePlan,
  type FirstTinyHistoricalFetchRunAuditWritePlanSummary,
} from "@/lib/first-tiny-historical-fetch-run-audit-write-plan";

export type FirstTinyFetchRunAuditWriteApprovalStatus =
  | "not_configured"
  | "invalid"
  | "valid_for_future_audit_write";

export type FirstTinyFetchRunAuditWriteApprovalEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyFetchRunAuditWriteApprovalSignal = {
  source_type: "none" | "server_env";
  source_present: boolean;
  approved: boolean | null;
  operator_label: string | null;
  approval_reference: string | null;
  ticker: string | null;
  max_rows: number | null;
  candle_persist_allowed: boolean | null;
  replay_allowed: boolean | null;
  scanner_effect_allowed: boolean | null;
};

export type FirstTinyFetchRunAuditWriteApprovalInput = {
  env?: FirstTinyFetchRunAuditWriteApprovalEnv | null;
  audit_write_plan?: FirstTinyHistoricalFetchRunAuditWritePlanSummary | null;
};

export type FirstTinyFetchRunAuditWriteApprovalSummary = {
  advisory_only: true;
  approval_gate_only: true;
  approval_status: FirstTinyFetchRunAuditWriteApprovalStatus;
  signal: FirstTinyFetchRunAuditWriteApprovalSignal & {
    signal_active: boolean;
    operator_label_present: boolean;
    approval_reference_present: boolean;
  };
  expected_contract: {
    source_verification: "first_tiny_historical_fetch_no_persist_verified";
    expected_ticker: "AAPL";
    expected_max_rows: 1;
    expected_candle_persist_allowed: false;
    expected_replay_allowed: false;
    expected_scanner_effect_allowed: false;
    expected_planned_audit_rows: 1;
  };
  validation: {
    approved_valid: boolean;
    operator_label_valid: boolean;
    approval_reference_valid: boolean;
    ticker_valid: boolean;
    max_rows_valid: boolean;
    candle_persist_scope_valid: boolean;
    replay_scope_valid: boolean;
    scanner_effect_scope_valid: boolean;
    source_verification_ready: boolean;
    audit_write_plan_ready: boolean;
    planned_audit_rows_valid: boolean;
    raw_response_persistence_blocked: boolean;
    candle_persistence_blocked: boolean;
    replay_scanner_ranking_effects_blocked: boolean;
  };
  readiness: {
    ready_to_accept_future_signal: boolean;
    ready_to_propose_audit_write_action: boolean;
    write_allowed_now: false;
    fetch_run_persisted: false;
    candles_persisted: false;
    raw_response_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
  safety: {
    advisory_only: true;
    provider_call_executed: false;
    historical_fetch_added: false;
    fetch_run_write_executed: false;
    fetch_run_persisted: false;
    candles_persisted: false;
    raw_response_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_separate_future_action: true;
  };
};

const envKeys = [
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED",
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL",
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE",
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER",
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS",
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED",
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED",
  "TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED",
] as const;

function normalizeText(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function normalizeTicker(value: string | null | undefined) {
  return normalizeText(value)?.toUpperCase() ?? null;
}

function parseBoolean(value: string | undefined) {
  if (value === undefined) return null;
  const normalized = value.trim().toLowerCase();
  if (normalized === "true") return true;
  if (normalized === "false") return false;
  return null;
}

function parsePositiveInteger(value: string | undefined) {
  if (value === undefined || value.trim().length === 0) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

export function buildFirstTinyFetchRunAuditWriteApprovalSignalFromEnv(
  env: FirstTinyFetchRunAuditWriteApprovalEnv = process.env,
): FirstTinyFetchRunAuditWriteApprovalSignal {
  const sourcePresent = envKeys.some(
    (key) => normalizeText(env[key]) !== null,
  );

  return {
    source_type: sourcePresent ? "server_env" : "none",
    source_present: sourcePresent,
    approved: parseBoolean(
      env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_APPROVED,
    ),
    operator_label: normalizeText(
      env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_OPERATOR_LABEL,
    ),
    approval_reference: normalizeText(
      env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REFERENCE,
    ),
    ticker: normalizeTicker(
      env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_TICKER,
    ),
    max_rows: parsePositiveInteger(
      env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_MAX_ROWS,
    ),
    candle_persist_allowed: parseBoolean(
      env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_CANDLE_PERSIST_ALLOWED,
    ),
    replay_allowed: parseBoolean(
      env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_REPLAY_ALLOWED,
    ),
    scanner_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_FETCH_RUN_AUDIT_WRITE_SCANNER_EFFECT_ALLOWED,
    ),
  };
}

function auditWritePlanReady(
  plan: FirstTinyHistoricalFetchRunAuditWritePlanSummary,
) {
  return (
    plan.status === "planned" &&
    plan.plan_mode === "dry_run_only" &&
    plan.source_verification ===
      "first_tiny_historical_fetch_no_persist_verified" &&
    plan.target_table === "historical_candle_fetch_runs" &&
    plan.write_gate.dry_run_only === true &&
    plan.write_gate.fetch_run_write_allowed_now === false &&
    plan.write_gate.fetch_run_persisted === false &&
    plan.write_gate.planned_audit_rows === 1 &&
    plan.write_gate.candle_rows_to_persist === 0 &&
    plan.write_gate.raw_response_to_persist === false &&
    plan.write_gate.raw_response_persisted === false &&
    plan.write_gate.candles_persisted === false &&
    plan.write_gate.replay_executed === false &&
    plan.write_gate.scanner_behavior_changed === false &&
    plan.write_gate.live_ranking_changed === false
  );
}

export function buildFirstTinyFetchRunAuditWriteApproval(
  input: FirstTinyFetchRunAuditWriteApprovalInput = {},
): FirstTinyFetchRunAuditWriteApprovalSummary {
  const plan =
    input.audit_write_plan ?? buildFirstTinyHistoricalFetchRunAuditWritePlan();
  const signal = buildFirstTinyFetchRunAuditWriteApprovalSignalFromEnv(
    input.env ?? process.env,
  );
  const sourceVerificationReady =
    plan.source_verification ===
    "first_tiny_historical_fetch_no_persist_verified";
  const planReady = auditWritePlanReady(plan);
  const rawResponsePersistenceBlocked =
    plan.write_gate.raw_response_persisted === false &&
    plan.write_gate.raw_response_to_persist === false;
  const candlePersistenceBlocked =
    plan.write_gate.candles_persisted === false &&
    plan.write_gate.candle_rows_to_persist === 0;
  const replayScannerRankingBlocked =
    plan.write_gate.replay_executed === false &&
    plan.write_gate.scanner_behavior_changed === false &&
    plan.write_gate.live_ranking_changed === false;
  const validation = {
    approved_valid: signal.approved === true,
    operator_label_valid: normalizeText(signal.operator_label) !== null,
    approval_reference_valid:
      normalizeText(signal.approval_reference) !== null,
    ticker_valid: normalizeTicker(signal.ticker) === "AAPL",
    max_rows_valid: signal.max_rows === 1,
    candle_persist_scope_valid: signal.candle_persist_allowed === false,
    replay_scope_valid: signal.replay_allowed === false,
    scanner_effect_scope_valid: signal.scanner_effect_allowed === false,
    source_verification_ready: sourceVerificationReady,
    audit_write_plan_ready: planReady,
    planned_audit_rows_valid: plan.write_gate.planned_audit_rows === 1,
    raw_response_persistence_blocked: rawResponsePersistenceBlocked,
    candle_persistence_blocked: candlePersistenceBlocked,
    replay_scanner_ranking_effects_blocked: replayScannerRankingBlocked,
  };
  const blockers: string[] = [];

  if (signal.source_present) {
    if (!validation.approved_valid) pushUnique(blockers, "approval_not_true");
    if (!validation.operator_label_valid) {
      pushUnique(blockers, "operator_label_missing");
    }
    if (!validation.approval_reference_valid) {
      pushUnique(blockers, "approval_reference_missing");
    }
    if (!validation.ticker_valid) pushUnique(blockers, "ticker_mismatch");
    if (!validation.max_rows_valid) pushUnique(blockers, "max_rows_not_one");
    if (!validation.candle_persist_scope_valid) {
      pushUnique(blockers, "candle_persist_not_allowed");
    }
    if (!validation.replay_scope_valid) {
      pushUnique(blockers, "replay_not_allowed");
    }
    if (!validation.scanner_effect_scope_valid) {
      pushUnique(blockers, "scanner_effect_not_allowed");
    }
    if (!validation.source_verification_ready) {
      pushUnique(blockers, "source_verification_not_ready");
    }
    if (!validation.audit_write_plan_ready) {
      pushUnique(blockers, "audit_write_plan_not_ready");
    }
    if (!validation.planned_audit_rows_valid) {
      pushUnique(blockers, "planned_audit_rows_not_one");
    }
    if (!validation.raw_response_persistence_blocked) {
      pushUnique(blockers, "raw_response_persistence_not_blocked");
    }
    if (!validation.candle_persistence_blocked) {
      pushUnique(blockers, "candle_persistence_not_blocked");
    }
    if (!validation.replay_scanner_ranking_effects_blocked) {
      pushUnique(blockers, "replay_scanner_ranking_effect_not_blocked");
    }
  }

  const approvalStatus: FirstTinyFetchRunAuditWriteApprovalStatus =
    !signal.source_present
      ? "not_configured"
      : blockers.length === 0
        ? "valid_for_future_audit_write"
        : "invalid";
  const readyToPropose =
    approvalStatus === "valid_for_future_audit_write" && planReady;

  return {
    advisory_only: true,
    approval_gate_only: true,
    approval_status: approvalStatus,
    signal: {
      ...signal,
      signal_active: signal.source_present,
      operator_label_present: validation.operator_label_valid,
      approval_reference_present: validation.approval_reference_valid,
    },
    expected_contract: {
      source_verification: "first_tiny_historical_fetch_no_persist_verified",
      expected_ticker: "AAPL",
      expected_max_rows: 1,
      expected_candle_persist_allowed: false,
      expected_replay_allowed: false,
      expected_scanner_effect_allowed: false,
      expected_planned_audit_rows: 1,
    },
    validation,
    readiness: {
      ready_to_accept_future_signal: planReady,
      ready_to_propose_audit_write_action: readyToPropose,
      write_allowed_now: false,
      fetch_run_persisted: false,
      candles_persisted: false,
      raw_response_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
    },
    blockers,
    warnings: signal.source_present ? [] : ["approval_signal_not_configured"],
    recommended_next_steps: readyToPropose
      ? [
          "require_separate_action_before_fetch_run_insert",
          "keep_candle_persistence_disabled",
        ]
      : [
          "configure_valid_fetch_run_audit_write_approval_signal",
          "require_separate_action_before_fetch_run_insert",
          "keep_candle_persistence_disabled",
        ],
    safety: {
      advisory_only: true,
      provider_call_executed: false,
      historical_fetch_added: false,
      fetch_run_write_executed: false,
      fetch_run_persisted: false,
      candles_persisted: false,
      raw_response_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_separate_future_action: true,
    },
  };
}
