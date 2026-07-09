import type { FirstTinyHistoricalFetchExecutionPlanSummary } from "@/lib/first-tiny-historical-fetch-execution-plan";
import type { FirstTinyHistoricalFetchOperatorApprovalSummary } from "@/lib/first-tiny-historical-fetch-operator-approval";
import type { FirstTinyHistoricalFetchRequestPreviewSummary } from "@/lib/first-tiny-historical-fetch-request-preview";

export type FirstTinyHistoricalFetchApprovalSignalStatus =
  | "not_configured"
  | "configured_but_inactive"
  | "valid_for_future_action"
  | "invalid"
  | "blocked";

export type FirstTinyHistoricalFetchApprovalSignalSourceType =
  | "none"
  | "server_env"
  | "manual_operator_note"
  | "local_dev_only";

export type FirstTinyHistoricalFetchApprovalSignalInput = {
  source_type?: FirstTinyHistoricalFetchApprovalSignalSourceType | null;
  source_present?: boolean | null;
  approved?: boolean | null;
  operator_label?: string | null;
  approval_reference?: string | null;
  provider?: string | null;
  ticker?: string | null;
  interval?: string | null;
  max_requests?: number | null;
  max_estimated_credits?: number | null;
  persist_allowed?: boolean | null;
  replay_allowed?: boolean | null;
  scanner_effect_allowed?: boolean | null;
  production_safe?: boolean | null;
};

export type FirstTinyHistoricalFetchApprovalSignalReadinessInput = {
  operator_approval?:
    | FirstTinyHistoricalFetchOperatorApprovalSummary
    | null;
  request_preview?: FirstTinyHistoricalFetchRequestPreviewSummary | null;
  execution_plan?: FirstTinyHistoricalFetchExecutionPlanSummary | null;
  signal?: FirstTinyHistoricalFetchApprovalSignalInput | null;
};

export type FirstTinyHistoricalFetchApprovalSignalReadinessSummary = {
  advisory_only: true;
  approval_signal_readiness_only: true;
  approval_signal_status: FirstTinyHistoricalFetchApprovalSignalStatus;
  supported_signal_sources: ["server_env", "manual_operator_note"];
  expected_signal_contract: {
    required_fields: string[];
    expected_provider: "twelve_data";
    expected_ticker: string;
    expected_interval: "5min";
    expected_max_requests: 1;
    expected_max_estimated_credits: 1;
    expected_persist_allowed: false;
    expected_replay_allowed: false;
    expected_scanner_effect_allowed: false;
  };
  detected_signal: {
    source_type: FirstTinyHistoricalFetchApprovalSignalSourceType;
    source_present: boolean;
    approved_value: boolean | null;
    operator_label: string | null;
    approval_reference: string | null;
    operator_label_present: boolean;
    approval_reference_present: boolean;
    scope_matches_preview: boolean | "unknown";
    production_safe: boolean;
    signal_active: false;
  };
  validation: {
    signal_shape_valid: boolean;
    approval_value_valid: boolean;
    operator_label_valid: boolean;
    approval_reference_valid: boolean;
    provider_scope_valid: boolean;
    ticker_scope_valid: boolean;
    interval_scope_valid: boolean;
    request_limit_valid: boolean;
    credit_limit_valid: boolean;
    persist_scope_valid: boolean;
    replay_scope_valid: boolean;
    scanner_scope_valid: boolean;
  };
  prerequisites: {
    operator_approval_record_ready: boolean;
    request_preview_ready: boolean;
    execution_plan_ready_for_future_approval: boolean;
    schema_readback_ok: boolean;
    provider_env_present: boolean | "unknown";
    budget_policy_present: boolean;
    lookahead_safety_present: boolean;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
  readiness: {
    ready_to_review_signal_contract: boolean;
    ready_to_accept_future_signal: boolean;
    ready_to_enable_future_fetch: false;
    ready_to_execute_now: false;
    ready_to_call_provider_now: false;
    ready_to_persist_candles_now: false;
    ready_to_create_fetch_run_now: false;
    ready_to_create_synthetic_outcomes: false;
    ready_to_run_replay: false;
    ready_to_affect_scanner: false;
  };
  safety: {
    advisory_only: true;
    approval_signal_readiness_only: true;
    signal_active: false;
    provider_fetch_added: false;
    historical_fetch_added: false;
    provider_call_executed: false;
    candles_persisted: false;
    fetch_run_persisted: false;
    synthetic_outcomes_persisted: false;
    replay_executed: false;
    scanner_behavior_changed: false;
    live_ranking_changed: false;
    requires_manual_review: true;
  };
};

const requiredFields = [
  "approved",
  "operator_label",
  "approval_reference",
  "provider",
  "ticker",
  "interval",
  "max_requests",
  "max_estimated_credits",
  "persist_allowed",
  "replay_allowed",
  "scanner_effect_allowed",
];

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : "UNKNOWN";
}

function normalizeText(value: string | null | undefined) {
  return value?.trim() ?? "";
}

function sourceType(
  signal: FirstTinyHistoricalFetchApprovalSignalInput | null,
): FirstTinyHistoricalFetchApprovalSignalSourceType {
  return signal?.source_type ?? "none";
}

function sourcePresent(
  signal: FirstTinyHistoricalFetchApprovalSignalInput | null,
) {
  const type = sourceType(signal);
  return type !== "none" && signal?.source_present === true;
}

function expectedTicker(
  requestPreview: FirstTinyHistoricalFetchRequestPreviewSummary | null,
) {
  return normalizeTicker(requestPreview?.request_preview.ticker);
}

function validationFor(input: {
  signal: FirstTinyHistoricalFetchApprovalSignalInput | null;
  signalPresent: boolean;
  expectedTicker: string;
}) {
  if (!input.signalPresent) {
    return {
      signal_shape_valid: false,
      approval_value_valid: false,
      operator_label_valid: false,
      approval_reference_valid: false,
      provider_scope_valid: false,
      ticker_scope_valid: false,
      interval_scope_valid: false,
      request_limit_valid: false,
      credit_limit_valid: false,
      persist_scope_valid: false,
      replay_scope_valid: false,
      scanner_scope_valid: false,
    };
  }

  const signal = input.signal ?? {};
  const fieldValidation = {
    approval_value_valid: signal.approved === true,
    operator_label_valid: normalizeText(signal.operator_label).length > 0,
    approval_reference_valid:
      normalizeText(signal.approval_reference).length > 0,
    provider_scope_valid: normalizeText(signal.provider) === "twelve_data",
    ticker_scope_valid: normalizeTicker(signal.ticker) === input.expectedTicker,
    interval_scope_valid: normalizeText(signal.interval) === "5min",
    request_limit_valid: signal.max_requests === 1,
    credit_limit_valid: signal.max_estimated_credits === 1,
    persist_scope_valid: signal.persist_allowed === false,
    replay_scope_valid: signal.replay_allowed === false,
    scanner_scope_valid: signal.scanner_effect_allowed === false,
  };

  return {
    signal_shape_valid: Object.values(fieldValidation).every(Boolean),
    ...fieldValidation,
  };
}

function signalStatus(input: {
  prerequisiteBlockers: string[];
  signalPresent: boolean;
  signalShapeValid: boolean;
  sourceType: FirstTinyHistoricalFetchApprovalSignalSourceType;
  productionSafe: boolean;
}): FirstTinyHistoricalFetchApprovalSignalStatus {
  if (!input.signalPresent) return "not_configured";
  if (!input.productionSafe || !input.signalShapeValid) return "invalid";
  if (input.prerequisiteBlockers.length > 0) return "blocked";
  if (
    input.sourceType === "server_env" ||
    input.sourceType === "manual_operator_note"
  ) {
    return "valid_for_future_action";
  }
  return "configured_but_inactive";
}

export function buildFirstTinyHistoricalFetchApprovalSignalReadiness(
  input: FirstTinyHistoricalFetchApprovalSignalReadinessInput = {},
): FirstTinyHistoricalFetchApprovalSignalReadinessSummary {
  const operatorApproval = input.operator_approval ?? null;
  const requestPreview = input.request_preview ?? null;
  const executionPlan = input.execution_plan ?? null;
  const signal = input.signal ?? null;
  const type = sourceType(signal);
  const present = sourcePresent(signal);
  const ticker = expectedTicker(requestPreview);
  const productionSafe = signal?.production_safe ?? true;
  const operatorReady =
    operatorApproval?.approval_record_status === "pending_operator_decision" ||
    operatorApproval?.approval_record_status === "approved_for_future_fetch";
  const previewReady = requestPreview?.preview_status === "ready";
  const planReady =
    executionPlan?.execution_plan_status === "ready_for_future_approval";
  const schemaReadbackOk =
    operatorApproval?.prerequisites.schema_readback_ok === true;
  const budgetPolicyPresent =
    operatorApproval?.prerequisites.budget_policy_present === true;
  const lookaheadSafetyPresent =
    operatorApproval?.prerequisites.lookahead_safety_present === true;
  const providerEnvPresent =
    operatorApproval?.prerequisites.provider_env_present ?? "unknown";
  const blockers: string[] = [];

  if (!operatorReady) {
    pushUnique(blockers, "operator_approval_record_not_ready");
  }
  if (!previewReady) pushUnique(blockers, "request_preview_not_ready");
  if (!planReady) {
    pushUnique(blockers, "execution_plan_not_ready_for_future_approval");
  }
  if (!schemaReadbackOk) pushUnique(blockers, "schema_readback_not_verified");
  if (!budgetPolicyPresent) pushUnique(blockers, "budget_policy_missing");
  if (!lookaheadSafetyPresent) pushUnique(blockers, "lookahead_safety_missing");

  const validation = validationFor({
    signal,
    signalPresent: present,
    expectedTicker: ticker,
  });
  const scopeMatchesPreview = present
    ? validation.provider_scope_valid &&
      validation.ticker_scope_valid &&
      validation.interval_scope_valid
    : "unknown";
  const status = signalStatus({
    prerequisiteBlockers: blockers,
    signalPresent: present,
    signalShapeValid: validation.signal_shape_valid,
    sourceType: type,
    productionSafe,
  });
  const readyToAcceptFutureSignal =
    blockers.length === 0 && previewReady && operatorReady && planReady;

  return {
    advisory_only: true,
    approval_signal_readiness_only: true,
    approval_signal_status: status,
    supported_signal_sources: ["server_env", "manual_operator_note"],
    expected_signal_contract: {
      required_fields: requiredFields,
      expected_provider: "twelve_data",
      expected_ticker: ticker,
      expected_interval: "5min",
      expected_max_requests: 1,
      expected_max_estimated_credits: 1,
      expected_persist_allowed: false,
      expected_replay_allowed: false,
      expected_scanner_effect_allowed: false,
    },
    detected_signal: {
      source_type: type,
      source_present: present,
      approved_value: present ? signal?.approved ?? null : null,
      operator_label: present ? normalizeText(signal?.operator_label) || null : null,
      approval_reference: present
        ? normalizeText(signal?.approval_reference) || null
        : null,
      operator_label_present:
        present && normalizeText(signal?.operator_label).length > 0,
      approval_reference_present:
        present && normalizeText(signal?.approval_reference).length > 0,
      scope_matches_preview: scopeMatchesPreview,
      production_safe: productionSafe,
      signal_active: false,
    },
    validation,
    prerequisites: {
      operator_approval_record_ready: operatorReady,
      request_preview_ready: previewReady,
      execution_plan_ready_for_future_approval: planReady,
      schema_readback_ok: schemaReadbackOk,
      provider_env_present: providerEnvPresent,
      budget_policy_present: budgetPolicyPresent,
      lookahead_safety_present: lookaheadSafetyPresent,
    },
    blockers,
    warnings: [
      "approval_signal_readiness_only_no_provider_call",
      "valid_signal_does_not_enable_fetch_in_this_action",
    ],
    recommended_next_steps: [
      ...(readyToAcceptFutureSignal
        ? ["review_future_approval_signal_contract"]
        : ["resolve_first_tiny_approval_signal_prerequisites"]),
      "keep_signal_inactive_until_separate_execution_action",
      "keep_fetch_run_candle_replay_and_scanner_effects_disabled",
    ],
    readiness: {
      ready_to_review_signal_contract: true,
      ready_to_accept_future_signal: readyToAcceptFutureSignal,
      ready_to_enable_future_fetch: false,
      ready_to_execute_now: false,
      ready_to_call_provider_now: false,
      ready_to_persist_candles_now: false,
      ready_to_create_fetch_run_now: false,
      ready_to_create_synthetic_outcomes: false,
      ready_to_run_replay: false,
      ready_to_affect_scanner: false,
    },
    safety: {
      advisory_only: true,
      approval_signal_readiness_only: true,
      signal_active: false,
      provider_fetch_added: false,
      historical_fetch_added: false,
      provider_call_executed: false,
      candles_persisted: false,
      fetch_run_persisted: false,
      synthetic_outcomes_persisted: false,
      replay_executed: false,
      scanner_behavior_changed: false,
      live_ranking_changed: false,
      requires_manual_review: true,
    },
  };
}
