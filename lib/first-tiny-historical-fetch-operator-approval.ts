import type { HistoricalBackfillExecutionReadinessSummary } from "@/lib/historical-backfill-execution-readiness";
import type { FirstTinyHistoricalFetchApprovalSummary } from "@/lib/first-tiny-historical-fetch-approval";
import type { FirstTinyHistoricalFetchRequestPreviewSummary } from "@/lib/first-tiny-historical-fetch-request-preview";

export type FirstTinyHistoricalFetchOperatorApprovalStatus =
  | "not_created"
  | "pending_operator_decision"
  | "approved_for_future_fetch"
  | "rejected"
  | "blocked";

export type FirstTinyHistoricalFetchOperatorApprovalSourceType =
  | "none"
  | "server_env"
  | "manual_operator_note"
  | "local_dev_only";

export type FirstTinyHistoricalFetchOperatorApprovalSourceInput = {
  source_type?: FirstTinyHistoricalFetchOperatorApprovalSourceType | null;
  source_present?: boolean | null;
  production_safe?: boolean | null;
  operator_label?: string | null;
  approved_at?: string | null;
  approval_reference?: string | null;
  decision?:
    | "approved_for_future_fetch"
    | "rejected"
    | "pending_operator_decision"
    | null;
};

export type FirstTinyHistoricalFetchOperatorApprovalInput = {
  approval?: FirstTinyHistoricalFetchApprovalSummary | null;
  request_preview?: FirstTinyHistoricalFetchRequestPreviewSummary | null;
  execution_readiness?: HistoricalBackfillExecutionReadinessSummary | null;
  approval_source?: FirstTinyHistoricalFetchOperatorApprovalSourceInput | null;
};

export type FirstTinyHistoricalFetchOperatorApprovalSummary = {
  advisory_only: true;
  approval_record_only: true;
  approval_record_status: FirstTinyHistoricalFetchOperatorApprovalStatus;
  approval_source: {
    source_type: FirstTinyHistoricalFetchOperatorApprovalSourceType;
    source_present: boolean;
    production_safe: boolean;
    operator_label: string | null;
    approved_at: string | null;
    approval_reference: string | null;
  };
  approval_scope: {
    provider: "twelve_data";
    endpoint: "time_series";
    ticker: string;
    interval: "5min";
    max_tickers: 1;
    max_trading_days: 1;
    request_count_limit: 1;
    estimated_credit_limit: 1;
    cache_lookup_required: true;
    fetch_run_audit_required: true;
    persist_allowed: false;
    replay_allowed: false;
    scanner_effect_allowed: false;
  };
  prerequisites: {
    schema_readback_ok: boolean;
    execution_readiness_ready_for_manual_review: boolean;
    approval_gate_pending_manual_review: boolean;
    request_preview_ready: boolean;
    provider_env_present: boolean | "unknown";
    budget_policy_present: boolean;
    lookahead_safety_present: boolean;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
  readiness: {
    ready_for_operator_decision: boolean;
    ready_to_enable_future_fetch: false;
    ready_to_call_provider_now: false;
    ready_to_persist_candles_now: false;
    ready_to_create_fetch_run_now: false;
    ready_to_create_synthetic_outcomes: false;
    ready_to_run_replay: false;
    ready_to_affect_scanner: false;
  };
  safety: {
    advisory_only: true;
    approval_record_only: true;
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

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : "UNKNOWN";
}

function nullableText(value: string | null | undefined) {
  const text = value?.trim() ?? "";
  return text.length > 0 ? text : null;
}

function approvalSource(
  input: FirstTinyHistoricalFetchOperatorApprovalSourceInput | null,
): FirstTinyHistoricalFetchOperatorApprovalSummary["approval_source"] {
  const sourceType = input?.source_type ?? "none";
  const sourcePresent =
    sourceType !== "none" && input?.source_present === true;

  return {
    source_type: sourceType,
    source_present: sourcePresent,
    production_safe: input?.production_safe ?? true,
    operator_label: nullableText(input?.operator_label),
    approved_at: nullableText(input?.approved_at),
    approval_reference: nullableText(input?.approval_reference),
  };
}

function approvalStatus(input: {
  blockers: string[];
  source: FirstTinyHistoricalFetchOperatorApprovalSummary["approval_source"];
  decision:
    | FirstTinyHistoricalFetchOperatorApprovalSourceInput["decision"]
    | undefined;
}): FirstTinyHistoricalFetchOperatorApprovalStatus {
  if (input.blockers.length > 0) return "blocked";
  if (!input.source.source_present) return "pending_operator_decision";
  if (input.decision === "approved_for_future_fetch") {
    return "approved_for_future_fetch";
  }
  if (input.decision === "rejected") return "rejected";
  return "pending_operator_decision";
}

export function buildFirstTinyHistoricalFetchOperatorApproval(
  input: FirstTinyHistoricalFetchOperatorApprovalInput = {},
): FirstTinyHistoricalFetchOperatorApprovalSummary {
  const approval = input.approval ?? null;
  const preview = input.request_preview ?? null;
  const execution = input.execution_readiness ?? null;
  const source = approvalSource(input.approval_source ?? null);
  const blockers: string[] = [];
  const warnings = [
    "approval_record_only_no_provider_call",
    "approval_record_does_not_enable_fetch",
  ];
  const schemaReadbackOk = approval?.prerequisites.schema_readback_ok === true;
  const executionReadyForManualReview =
    execution?.readiness_status === "ready_for_manual_review";
  const approvalGatePendingManualReview =
    approval?.approval_status === "pending_manual_review";
  const requestPreviewReady = preview?.preview_status === "ready";

  if (!schemaReadbackOk) pushUnique(blockers, "schema_readback_not_verified");
  if (!executionReadyForManualReview) {
    pushUnique(blockers, "execution_readiness_not_ready_for_manual_review");
  }
  if (!approvalGatePendingManualReview) {
    pushUnique(blockers, "approval_gate_not_pending_manual_review");
  }
  if (!requestPreviewReady) {
    pushUnique(blockers, "first_tiny_request_preview_not_ready");
  }
  if (!source.production_safe) {
    pushUnique(blockers, "approval_source_not_production_safe");
  }

  const status = approvalStatus({
    blockers,
    source,
    decision: input.approval_source?.decision,
  });
  const readyForOperatorDecision =
    status === "pending_operator_decision" &&
    blockers.length === 0 &&
    !source.source_present;

  return {
    advisory_only: true,
    approval_record_only: true,
    approval_record_status: status,
    approval_source: source,
    approval_scope: {
      provider: "twelve_data",
      endpoint: "time_series",
      ticker: normalizeTicker(preview?.request_preview.ticker),
      interval: "5min",
      max_tickers: 1,
      max_trading_days: 1,
      request_count_limit: 1,
      estimated_credit_limit: 1,
      cache_lookup_required: true,
      fetch_run_audit_required: true,
      persist_allowed: false,
      replay_allowed: false,
      scanner_effect_allowed: false,
    },
    prerequisites: {
      schema_readback_ok: schemaReadbackOk,
      execution_readiness_ready_for_manual_review:
        executionReadyForManualReview,
      approval_gate_pending_manual_review: approvalGatePendingManualReview,
      request_preview_ready: requestPreviewReady,
      provider_env_present:
        approval?.prerequisites.provider_env_present ?? "unknown",
      budget_policy_present:
        approval?.prerequisites.budget_policy_present === true,
      lookahead_safety_present:
        approval?.prerequisites.lookahead_safety_present === true,
    },
    blockers,
    warnings,
    recommended_next_steps: [
      ...(blockers.length > 0
        ? ["resolve_first_tiny_operator_approval_blockers"]
        : source.source_present
          ? ["review_recorded_operator_decision_before_future_action"]
          : ["record_explicit_operator_decision_for_first_tiny_fetch"]),
      "require_separate_execution_action_before_provider_call",
      "keep_fetch_run_candle_replay_and_scanner_effects_disabled",
    ],
    readiness: {
      ready_for_operator_decision: readyForOperatorDecision,
      ready_to_enable_future_fetch: false,
      ready_to_call_provider_now: false,
      ready_to_persist_candles_now: false,
      ready_to_create_fetch_run_now: false,
      ready_to_create_synthetic_outcomes: false,
      ready_to_run_replay: false,
      ready_to_affect_scanner: false,
    },
    safety: {
      advisory_only: true,
      approval_record_only: true,
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
