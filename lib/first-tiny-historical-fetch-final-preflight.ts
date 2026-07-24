import type { HistoricalBackfillExecutionReadinessSummary } from "@/lib/historical-backfill-execution-readiness";
import type { HistoricalCandleStorageReadinessSummary } from "@/lib/historical-candle-storage-readiness";
import type { FirstTinyHistoricalFetchApprovalSummary } from "@/lib/first-tiny-historical-fetch-approval";
import type { FirstTinyHistoricalFetchApprovalSignalReadinessSummary } from "@/lib/first-tiny-historical-fetch-approval-signal-readiness";
import type { FirstTinyHistoricalFetchExecutionPlanSummary } from "@/lib/first-tiny-historical-fetch-execution-plan";
import type { FirstTinyHistoricalFetchOperatorApprovalSummary } from "@/lib/first-tiny-historical-fetch-operator-approval";
import type { FirstTinyHistoricalFetchRequestPreviewSummary } from "@/lib/first-tiny-historical-fetch-request-preview";

export type FirstTinyHistoricalFetchFinalPreflightStatus =
  | "ready_to_propose_first_provider_call_action"
  | "blocked"
  | "not_ready";

export type FirstTinyHistoricalFetchFinalPreflightInput = {
  storage_readiness?: HistoricalCandleStorageReadinessSummary | null;
  execution_readiness?: HistoricalBackfillExecutionReadinessSummary | null;
  approval?: FirstTinyHistoricalFetchApprovalSummary | null;
  request_preview?: FirstTinyHistoricalFetchRequestPreviewSummary | null;
  operator_approval?:
    | FirstTinyHistoricalFetchOperatorApprovalSummary
    | null;
  execution_plan?: FirstTinyHistoricalFetchExecutionPlanSummary | null;
  approval_signal_readiness?:
    | FirstTinyHistoricalFetchApprovalSignalReadinessSummary
    | null;
};

export type FirstTinyHistoricalFetchFinalPreflightSummary = {
  advisory_only: true;
  final_preflight_only: true;
  preflight_status: FirstTinyHistoricalFetchFinalPreflightStatus;
  chain_status: {
    storage_verified: boolean;
    execution_readiness_ready_for_manual_review: boolean;
    approval_gate_pending_manual_review: boolean;
    request_preview_ready: boolean;
    operator_approval_ready_for_decision: boolean;
    execution_plan_ready_for_future_approval: boolean;
    approval_signal_contract_ready: boolean;
  };
  request_scope: {
    provider: "twelve_data";
    endpoint: "time_series";
    ticker: string;
    interval: "5min";
    request_count: 1;
    estimated_credits: 1;
    cache_lookup_required: true;
    fetch_run_audit_required: true;
    persist_allowed: false;
    replay_allowed: false;
    scanner_effect_allowed: false;
  };
  preflight_checks: {
    schema_readback_ok: boolean;
    provider_env_present: boolean | "unknown";
    budget_policy_present: boolean;
    lookahead_safety_present: boolean;
    cache_reuse_before_fetch: boolean;
    pause_near_scan_windows: boolean;
    pause_on_provider_warnings: boolean;
    max_one_request: boolean;
    max_one_credit: boolean;
    no_persistence_allowed: boolean;
    no_replay_allowed: boolean;
    no_scanner_effect_allowed: boolean;
    explicit_separate_action_required: true;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
  readiness: {
    ready_to_review_final_preflight: boolean;
    ready_to_propose_first_provider_call_action: boolean;
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
    final_preflight_only: true;
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
    requires_separate_action_for_provider_call: true;
  };
};

function pushUnique(values: string[], value: string) {
  if (!values.includes(value)) values.push(value);
}

function normalizeTicker(value: string | null | undefined) {
  const ticker = value?.trim().toUpperCase() ?? "";
  return ticker.length > 0 && ticker !== "UNKNOWN" ? ticker : "UNKNOWN";
}

function storageVerified(
  storage: HistoricalCandleStorageReadinessSummary | null,
) {
  return (
    storage?.migration_readiness.schema_readback_status === "ok" ||
    storage?.migration_readiness.migration_applied === "yes"
  );
}

function anyInputPresent(input: FirstTinyHistoricalFetchFinalPreflightInput) {
  return Boolean(
    input.storage_readiness ||
      input.execution_readiness ||
      input.approval ||
      input.request_preview ||
      input.operator_approval ||
      input.execution_plan ||
      input.approval_signal_readiness,
  );
}

export function buildFirstTinyHistoricalFetchFinalPreflight(
  input: FirstTinyHistoricalFetchFinalPreflightInput = {},
): FirstTinyHistoricalFetchFinalPreflightSummary {
  const storage = input.storage_readiness ?? null;
  const execution = input.execution_readiness ?? null;
  const approval = input.approval ?? null;
  const preview = input.request_preview ?? null;
  const operatorApproval = input.operator_approval ?? null;
  const executionPlan = input.execution_plan ?? null;
  const signalReadiness = input.approval_signal_readiness ?? null;
  const chainStatus = {
    storage_verified: storageVerified(storage),
    execution_readiness_ready_for_manual_review:
      execution?.readiness_status === "ready_for_manual_review",
    approval_gate_pending_manual_review:
      approval?.approval_status === "pending_manual_review",
    request_preview_ready: preview?.preview_status === "ready",
    operator_approval_ready_for_decision:
      operatorApproval?.readiness.ready_for_operator_decision === true,
    execution_plan_ready_for_future_approval:
      executionPlan?.execution_plan_status === "ready_for_future_approval",
    approval_signal_contract_ready:
      signalReadiness?.readiness.ready_to_accept_future_signal === true,
  };
  const preflightChecks = {
    schema_readback_ok: approval?.prerequisites.schema_readback_ok === true,
    provider_env_present:
      signalReadiness?.prerequisites.provider_env_present ??
      approval?.prerequisites.provider_env_present ??
      "unknown",
    budget_policy_present:
      signalReadiness?.prerequisites.budget_policy_present === true ||
      approval?.prerequisites.budget_policy_present === true,
    lookahead_safety_present:
      signalReadiness?.prerequisites.lookahead_safety_present === true ||
      approval?.prerequisites.lookahead_safety_present === true,
    cache_reuse_before_fetch:
      preview?.cache_preflight.reuse_before_fetch === true ||
      approval?.candidate_plan.cache_reuse_before_fetch === true,
    pause_near_scan_windows:
      executionPlan?.execution_limits.pause_near_scan_windows === true ||
      approval?.candidate_plan.pause_near_scan_windows === true,
    pause_on_provider_warnings:
      executionPlan?.execution_limits.pause_on_provider_warnings === true ||
      approval?.candidate_plan.pause_on_provider_warnings === true,
    max_one_request:
      preview?.request_preview.request_count === 1 &&
      executionPlan?.request_scope.request_count === 1,
    max_one_credit:
      preview?.request_preview.estimated_credits === 1 &&
      executionPlan?.request_scope.estimated_credits === 1,
    no_persistence_allowed:
      operatorApproval?.approval_scope.persist_allowed === false &&
      signalReadiness?.expected_signal_contract.expected_persist_allowed ===
        false,
    no_replay_allowed:
      operatorApproval?.approval_scope.replay_allowed === false &&
      signalReadiness?.expected_signal_contract.expected_replay_allowed ===
        false,
    no_scanner_effect_allowed:
      operatorApproval?.approval_scope.scanner_effect_allowed === false &&
      signalReadiness?.expected_signal_contract
        .expected_scanner_effect_allowed === false,
    explicit_separate_action_required: true as const,
  };
  const blockers: string[] = [];

  if (!chainStatus.storage_verified) pushUnique(blockers, "storage_not_verified");
  if (!chainStatus.execution_readiness_ready_for_manual_review) {
    pushUnique(blockers, "execution_readiness_not_ready_for_manual_review");
  }
  if (!chainStatus.approval_gate_pending_manual_review) {
    pushUnique(blockers, "approval_gate_not_pending_manual_review");
  }
  if (!chainStatus.request_preview_ready) {
    pushUnique(blockers, "request_preview_not_ready");
  }
  if (!chainStatus.operator_approval_ready_for_decision) {
    pushUnique(blockers, "operator_approval_not_ready_for_decision");
  }
  if (!chainStatus.execution_plan_ready_for_future_approval) {
    pushUnique(blockers, "execution_plan_not_ready_for_future_approval");
  }
  if (!chainStatus.approval_signal_contract_ready) {
    pushUnique(blockers, "approval_signal_contract_not_ready");
  }
  if (!preflightChecks.schema_readback_ok) {
    pushUnique(blockers, "schema_readback_not_verified");
  }
  if (!preflightChecks.budget_policy_present) {
    pushUnique(blockers, "budget_policy_missing");
  }
  if (!preflightChecks.lookahead_safety_present) {
    pushUnique(blockers, "lookahead_safety_missing");
  }
  if (!preflightChecks.cache_reuse_before_fetch) {
    pushUnique(blockers, "cache_reuse_before_fetch_missing");
  }
  if (!preflightChecks.pause_near_scan_windows) {
    pushUnique(blockers, "pause_near_scan_windows_missing");
  }
  if (!preflightChecks.pause_on_provider_warnings) {
    pushUnique(blockers, "pause_on_provider_warnings_missing");
  }
  if (!preflightChecks.max_one_request) {
    pushUnique(blockers, "max_one_request_missing");
  }
  if (!preflightChecks.max_one_credit) {
    pushUnique(blockers, "max_one_credit_missing");
  }
  if (!preflightChecks.no_persistence_allowed) {
    pushUnique(blockers, "no_persistence_allowed_check_failed");
  }
  if (!preflightChecks.no_replay_allowed) {
    pushUnique(blockers, "no_replay_allowed_check_failed");
  }
  if (!preflightChecks.no_scanner_effect_allowed) {
    pushUnique(blockers, "no_scanner_effect_allowed_check_failed");
  }

  const ready = blockers.length === 0;
  const status: FirstTinyHistoricalFetchFinalPreflightStatus = ready
    ? "ready_to_propose_first_provider_call_action"
    : anyInputPresent(input)
      ? "blocked"
      : "not_ready";

  return {
    advisory_only: true,
    final_preflight_only: true,
    preflight_status: status,
    chain_status: chainStatus,
    request_scope: {
      provider: "twelve_data",
      endpoint: "time_series",
      ticker: normalizeTicker(preview?.request_preview.ticker),
      interval: "5min",
      request_count: 1,
      estimated_credits: 1,
      cache_lookup_required: true,
      fetch_run_audit_required: true,
      persist_allowed: false,
      replay_allowed: false,
      scanner_effect_allowed: false,
    },
    preflight_checks: preflightChecks,
    blockers,
    warnings: [
      "final_preflight_only_no_provider_call",
      "separate_action_required_for_provider_call",
    ],
    recommended_next_steps: [
      ...(ready
        ? ["propose_separate_first_provider_call_action_for_operator_review"]
        : ["resolve_first_tiny_final_preflight_blockers"]),
      "keep_provider_fetch_persistence_replay_and_scanner_effects_disabled",
    ],
    readiness: {
      ready_to_review_final_preflight: true,
      ready_to_propose_first_provider_call_action: ready,
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
      final_preflight_only: true,
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
      requires_separate_action_for_provider_call: true,
    },
  };
}
