import {
  buildFirstTinyHistoricalCandlePersistenceDryRunPlan,
  type FirstTinyHistoricalCandlePersistenceDryRunPlanSummary,
} from "@/lib/first-tiny-historical-candle-persistence-dry-run-plan";
import { firstTinyFetchRunAuditWriteResultVerificationMarker } from "@/lib/first-tiny-historical-fetch-run-audit-write-result-verification";

export const firstTinyHistoricalCandlePayloadRefetchPlanMarker =
  "first_tiny_historical_candle_payload_refetch_planned";

export type FirstTinyHistoricalCandlePayloadRefetchApprovalStatus =
  | "not_configured"
  | "invalid"
  | "valid_for_future_payload_refetch";

export type FirstTinyHistoricalCandlePayloadRefetchEnv = Record<
  string,
  string | undefined
>;

export type FirstTinyHistoricalCandlePayloadRefetchSignal = {
  source_type: "none" | "server_env";
  source_present: boolean;
  approved: boolean | null;
  operator_label: string | null;
  approval_reference: string | null;
  ticker: string | null;
  max_requests: number | null;
  estimated_credits: number | null;
  candle_persist_allowed: boolean | null;
  raw_response_persist_allowed: boolean | null;
  replay_allowed: boolean | null;
  scanner_effect_allowed: boolean | null;
};

export type FirstTinyHistoricalCandlePayloadRefetchPlanInput = {
  env?: FirstTinyHistoricalCandlePayloadRefetchEnv | null;
  candle_persistence_plan?: FirstTinyHistoricalCandlePersistenceDryRunPlanSummary | null;
};

export type FirstTinyHistoricalCandlePayloadRefetchPlanSummary = {
  advisory_only: true;
  refetch_plan_status: "planned";
  plan_marker: typeof firstTinyHistoricalCandlePayloadRefetchPlanMarker;
  plan_mode: "dry_run_only";
  dry_run_only: true;
  source_verification: typeof firstTinyFetchRunAuditWriteResultVerificationMarker;
  existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  refetch_scope: {
    provider: "twelve_data";
    endpoint: "time_series";
    ticker: "AAPL";
    interval: "5min";
    trading_day: "2026-07-08";
    start_date: "2026-07-08T13:45:00.000Z";
    end_date: "2026-07-08T19:45:00.000Z";
    timezone: "America/New_York";
    session: "regular";
    adjusted: false;
    request_count: 1;
    estimated_credits: 1;
    expected_candle_rows: 27;
    cache_key: "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false";
    existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f";
  };
  future_approval_contract: {
    env_names: string[];
    validation_rules: string[];
    requires_separate_operator_approval: true;
    active_now: boolean;
  };
  approval_status: FirstTinyHistoricalCandlePayloadRefetchApprovalStatus;
  signal: FirstTinyHistoricalCandlePayloadRefetchSignal & {
    signal_active: boolean;
    operator_label_present: boolean;
    approval_reference_present: boolean;
  };
  validation: {
    approved_valid: boolean;
    operator_label_valid: boolean;
    approval_reference_valid: boolean;
    ticker_valid: boolean;
    max_requests_valid: boolean;
    estimated_credits_valid: boolean;
    candle_persist_scope_valid: boolean;
    raw_response_persist_scope_valid: boolean;
    replay_scope_valid: boolean;
    scanner_effect_scope_valid: boolean;
    source_verification_ready: boolean;
    fetch_run_id_valid: boolean;
    candle_persistence_dry_run_plan_ready: boolean;
    payload_missing_confirmed: boolean;
  };
  readiness: {
    ready_to_accept_future_signal: boolean;
    ready_to_propose_payload_refetch_action: boolean;
    execute_now: false;
  };
  permissions: {
    provider_call_allowed_now: false;
    candle_persistence_allowed_now: false;
    raw_response_persistence_allowed_now: false;
    replay_allowed_now: false;
    scanner_effect_allowed_now: false;
    requires_separate_operator_approval: true;
  };
  blockers: string[];
  warnings: string[];
  safety: {
    provider_call_executed: false;
    provider_fetch_added: false;
    historical_fetch_added: false;
    candles_persisted: false;
    raw_response_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    no_ohlcv_values_invented: true;
  };
  recommended_next_steps: [
    "configure_valid_payload_refetch_approval_signal",
    "require_separate_action_before_provider_refetch",
    "keep_candle_persistence_disabled_until_payload_is_available",
  ];
};

const envNames = [
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_OPERATOR_LABEL",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REFERENCE",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_TICKER",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_MAX_REQUESTS",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_ESTIMATED_CREDITS",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REPLAY_ALLOWED",
  "TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED",
] as const;

const validationRules = [
  "approved must be true",
  "operator label required",
  "reference required",
  "ticker must equal AAPL",
  "max requests must equal 1",
  "estimated credits must equal 1",
  "candle persist allowed must be false",
  "raw response persist allowed must be false",
  "replay allowed must be false",
  "scanner effect allowed must be false",
  "source verification must be first_tiny_fetch_run_audit_write_verified",
  "fetch_run_id must match fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
];

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

export function buildFirstTinyHistoricalCandlePayloadRefetchSignalFromEnv(
  env: FirstTinyHistoricalCandlePayloadRefetchEnv = process.env,
): FirstTinyHistoricalCandlePayloadRefetchSignal {
  const sourcePresent = envNames.some(
    (key) => normalizeText(env[key]) !== null,
  );

  return {
    source_type: sourcePresent ? "server_env" : "none",
    source_present: sourcePresent,
    approved: parseBoolean(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_APPROVED,
    ),
    operator_label: normalizeText(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_OPERATOR_LABEL,
    ),
    approval_reference: normalizeText(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REFERENCE,
    ),
    ticker: normalizeTicker(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_TICKER,
    ),
    max_requests: parsePositiveInteger(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_MAX_REQUESTS,
    ),
    estimated_credits: parsePositiveInteger(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_ESTIMATED_CREDITS,
    ),
    candle_persist_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_CANDLE_PERSIST_ALLOWED,
    ),
    raw_response_persist_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_RAW_RESPONSE_PERSIST_ALLOWED,
    ),
    replay_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_REPLAY_ALLOWED,
    ),
    scanner_effect_allowed: parseBoolean(
      env.TURE_FIRST_TINY_CANDLE_PAYLOAD_REFETCH_SCANNER_EFFECT_ALLOWED,
    ),
  };
}

function dryRunPlanReady(
  plan: FirstTinyHistoricalCandlePersistenceDryRunPlanSummary,
) {
  return (
    plan.plan_status === "planned" &&
    plan.plan_mode === "dry_run_only" &&
    plan.source_verification ===
      firstTinyFetchRunAuditWriteResultVerificationMarker &&
    plan.target_table === "historical_candles" &&
    plan.fetch_run.fetch_run_id === "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f" &&
    plan.count_level_plan.expected_candle_rows === 27 &&
    plan.payload_availability.candle_payload_available === false &&
    plan.payload_availability.no_ohlcv_values_invented === true &&
    plan.safety.candles_persisted === false &&
    plan.safety.raw_response_persisted === false &&
    plan.safety.replay_executed === false &&
    plan.safety.scanner_behavior_changed === false &&
    plan.safety.live_ranking_changed === false
  );
}

export function buildFirstTinyHistoricalCandlePayloadRefetchPlan(
  input: FirstTinyHistoricalCandlePayloadRefetchPlanInput = {},
): FirstTinyHistoricalCandlePayloadRefetchPlanSummary {
  const candlePersistencePlan =
    input.candle_persistence_plan ??
    buildFirstTinyHistoricalCandlePersistenceDryRunPlan();
  const signal = buildFirstTinyHistoricalCandlePayloadRefetchSignalFromEnv(
    input.env ?? process.env,
  );
  const validation = {
    approved_valid: signal.approved === true,
    operator_label_valid: normalizeText(signal.operator_label) !== null,
    approval_reference_valid:
      normalizeText(signal.approval_reference) !== null,
    ticker_valid: normalizeTicker(signal.ticker) === "AAPL",
    max_requests_valid: signal.max_requests === 1,
    estimated_credits_valid: signal.estimated_credits === 1,
    candle_persist_scope_valid: signal.candle_persist_allowed === false,
    raw_response_persist_scope_valid:
      signal.raw_response_persist_allowed === false,
    replay_scope_valid: signal.replay_allowed === false,
    scanner_effect_scope_valid: signal.scanner_effect_allowed === false,
    source_verification_ready:
      candlePersistencePlan.source_verification ===
      firstTinyFetchRunAuditWriteResultVerificationMarker,
    fetch_run_id_valid:
      candlePersistencePlan.fetch_run.fetch_run_id ===
      "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    candle_persistence_dry_run_plan_ready:
      dryRunPlanReady(candlePersistencePlan),
    payload_missing_confirmed:
      candlePersistencePlan.payload_availability.candle_payload_available ===
        false &&
      candlePersistencePlan.payload_availability
        .executable_candle_rows_available === false,
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
    if (!validation.max_requests_valid) {
      pushUnique(blockers, "max_requests_not_one");
    }
    if (!validation.estimated_credits_valid) {
      pushUnique(blockers, "estimated_credits_not_one");
    }
    if (!validation.candle_persist_scope_valid) {
      pushUnique(blockers, "candle_persist_not_allowed");
    }
    if (!validation.raw_response_persist_scope_valid) {
      pushUnique(blockers, "raw_response_persist_not_allowed");
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
    if (!validation.fetch_run_id_valid) {
      pushUnique(blockers, "fetch_run_id_mismatch");
    }
    if (!validation.candle_persistence_dry_run_plan_ready) {
      pushUnique(blockers, "candle_persistence_dry_run_plan_not_ready");
    }
    if (!validation.payload_missing_confirmed) {
      pushUnique(blockers, "payload_missing_not_confirmed");
    }
  }

  const approvalStatus: FirstTinyHistoricalCandlePayloadRefetchApprovalStatus =
    !signal.source_present
      ? "not_configured"
      : blockers.length === 0
        ? "valid_for_future_payload_refetch"
        : "invalid";

  return {
    advisory_only: true,
    refetch_plan_status: "planned",
    plan_marker: firstTinyHistoricalCandlePayloadRefetchPlanMarker,
    plan_mode: "dry_run_only",
    dry_run_only: true,
    source_verification: firstTinyFetchRunAuditWriteResultVerificationMarker,
    existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    refetch_scope: {
      provider: "twelve_data",
      endpoint: "time_series",
      ticker: "AAPL",
      interval: "5min",
      trading_day: "2026-07-08",
      start_date: "2026-07-08T13:45:00.000Z",
      end_date: "2026-07-08T19:45:00.000Z",
      timezone: "America/New_York",
      session: "regular",
      adjusted: false,
      request_count: 1,
      estimated_credits: 1,
      expected_candle_rows: 27,
      cache_key:
        "twelve_data:AAPL:5min:2026-07-08:official_windows:America/New_York:adjusted_false",
      existing_fetch_run_id: "fc58a15a-1748-4e8d-b7d9-03e4826c1d5f",
    },
    future_approval_contract: {
      env_names: [...envNames],
      validation_rules: validationRules,
      requires_separate_operator_approval: true,
      active_now: signal.source_present,
    },
    approval_status: approvalStatus,
    signal: {
      ...signal,
      signal_active: signal.source_present,
      operator_label_present: normalizeText(signal.operator_label) !== null,
      approval_reference_present:
        normalizeText(signal.approval_reference) !== null,
    },
    validation,
    readiness: {
      ready_to_accept_future_signal:
        approvalStatus === "not_configured" ||
        approvalStatus === "valid_for_future_payload_refetch",
      ready_to_propose_payload_refetch_action:
        approvalStatus === "valid_for_future_payload_refetch",
      execute_now: false,
    },
    permissions: {
      provider_call_allowed_now: false,
      candle_persistence_allowed_now: false,
      raw_response_persistence_allowed_now: false,
      replay_allowed_now: false,
      scanner_effect_allowed_now: false,
      requires_separate_operator_approval: true,
    },
    blockers,
    warnings:
      approvalStatus === "valid_for_future_payload_refetch"
        ? ["future_execute_action_required_before_provider_refetch"]
        : ["payload_refetch_not_executable_in_this_action"],
    safety: {
      provider_call_executed: false,
      provider_fetch_added: false,
      historical_fetch_added: false,
      candles_persisted: false,
      raw_response_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      no_ohlcv_values_invented: true,
    },
    recommended_next_steps: [
      "configure_valid_payload_refetch_approval_signal",
      "require_separate_action_before_provider_refetch",
      "keep_candle_persistence_disabled_until_payload_is_available",
    ],
  };
}
