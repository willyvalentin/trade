import type { HistoricalBackfillExecutionReadinessSummary } from "@/lib/historical-backfill-execution-readiness";
import type { HistoricalCandleStorageReadinessSummary } from "@/lib/historical-candle-storage-readiness";

export type FirstTinyHistoricalFetchApprovalStatus =
  | "not_requested"
  | "pending_manual_review"
  | "approved_for_future_action"
  | "rejected"
  | "blocked";

export type FirstTinyHistoricalFetchApprovalSource =
  | "none"
  | "local_dev_only"
  | "server_env"
  | "manual_operator_note";

export type FirstTinyHistoricalFetchApprovalInput = {
  storage_readiness?: HistoricalCandleStorageReadinessSummary | null;
  execution_readiness?: HistoricalBackfillExecutionReadinessSummary | null;
  approval_source?: FirstTinyHistoricalFetchApprovalSource | null;
  selected_trading_day?: string | null;
};

export type FirstTinyHistoricalFetchApprovalSummary = {
  advisory_only: true;
  approval_required: true;
  approval_status: FirstTinyHistoricalFetchApprovalStatus;
  approval_source: FirstTinyHistoricalFetchApprovalSource;
  first_fetch_enabled: false;
  dry_run_only: true;
  candidate_plan: {
    provider: "twelve_data";
    max_tickers: 1;
    max_trading_days: 1;
    interval: "5min";
    selected_tickers: string[];
    selected_trading_day: string | null;
    request_count_limit: number;
    estimated_credit_limit: number;
    pause_near_scan_windows: true;
    pause_on_provider_warnings: true;
    cache_reuse_before_fetch: true;
    fetch_run_audit_required: true;
  };
  prerequisites: {
    schema_readback_ok: boolean;
    migration_verified: boolean;
    historical_candles_table_detected: boolean;
    historical_candle_fetch_runs_table_detected: boolean;
    provider_env_present: boolean | "unknown";
    budget_policy_present: boolean;
    lookahead_safety_present: boolean;
    dry_run_pipeline_ready: boolean;
    persistence_plan_ready: boolean;
    manual_approval_gate_passed: false;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
  readiness: {
    ready_for_manual_review: boolean;
    ready_to_enable_future_fetch: false;
    ready_to_call_provider_now: false;
    ready_to_persist_candles_now: false;
    ready_to_create_synthetic_outcomes: false;
    ready_to_run_replay: false;
    ready_to_affect_scanner: false;
  };
  safety: {
    advisory_only: true;
    provider_fetch_added: false;
    historical_fetch_added: false;
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

function signalIsTrue(value: boolean | "unknown" | null | undefined) {
  return value === true;
}

function providerSignal(value: boolean | "unknown" | null | undefined) {
  if (value === true || value === false || value === "unknown") return value;
  return "unknown";
}

function firstTicker(input: FirstTinyHistoricalFetchApprovalInput) {
  const ticker =
    input.execution_readiness?.first_fetch_candidate_plan
      .selected_candidate_tickers[0] ?? "AAPL";
  const normalized = ticker.trim().toUpperCase();

  return normalized.length > 0 ? normalized : "AAPL";
}

export function buildFirstTinyHistoricalFetchApproval(
  input: FirstTinyHistoricalFetchApprovalInput = {},
): FirstTinyHistoricalFetchApprovalSummary {
  const storage = input.storage_readiness ?? null;
  const execution = input.execution_readiness ?? null;
  const schemaReadbackOk =
    storage?.migration_readiness.schema_readback_status === "ok" ||
    storage?.migration_readiness.migration_applied === "yes";
  const migrationVerified =
    execution?.readiness_gates.migration_gate_passed === true;
  const providerEnvPresent = providerSignal(
    execution?.prerequisites.provider_env_present,
  );
  const dryRunPipelineReady =
    execution?.prerequisites.dry_run_pipeline_ready === true;
  const persistencePlanReady =
    execution?.prerequisites.persistence_plan_ready === true;
  const budgetPolicyPresent =
    execution?.prerequisites.provider_budget_policy_present === true;
  const lookaheadSafetyPresent =
    execution?.prerequisites.lookahead_safety_present === true;
  const executionReadyForManualReview =
    execution?.readiness_status === "ready_for_manual_review";
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!schemaReadbackOk) pushUnique(blockers, "schema_readback_not_verified");
  if (!migrationVerified) pushUnique(blockers, "migration_not_verified");
  if (!executionReadyForManualReview) {
    pushUnique(blockers, "execution_readiness_not_ready_for_manual_review");
  }
  if (!dryRunPipelineReady) pushUnique(blockers, "dry_run_pipeline_not_ready");
  if (!persistencePlanReady) pushUnique(blockers, "persistence_plan_not_ready");
  if (!budgetPolicyPresent) pushUnique(blockers, "budget_policy_missing");
  if (!lookaheadSafetyPresent) pushUnique(blockers, "lookahead_safety_missing");
  if (providerEnvPresent !== true) {
    pushUnique(warnings, "provider_env_not_verified");
  }

  const approvalStatus: FirstTinyHistoricalFetchApprovalStatus =
    blockers.length > 0 ? "blocked" : "pending_manual_review";
  const readyForManualReview =
    approvalStatus === "pending_manual_review" &&
    providerEnvPresent === true;

  return {
    advisory_only: true,
    approval_required: true,
    approval_status: approvalStatus,
    approval_source: input.approval_source ?? "none",
    first_fetch_enabled: false,
    dry_run_only: true,
    candidate_plan: {
      provider: "twelve_data",
      max_tickers: 1,
      max_trading_days: 1,
      interval: "5min",
      selected_tickers: [firstTicker(input)],
      selected_trading_day: input.selected_trading_day ?? null,
      request_count_limit: 1,
      estimated_credit_limit: 1,
      pause_near_scan_windows: true,
      pause_on_provider_warnings: true,
      cache_reuse_before_fetch: true,
      fetch_run_audit_required: true,
    },
    prerequisites: {
      schema_readback_ok: schemaReadbackOk,
      migration_verified: migrationVerified,
      historical_candles_table_detected: signalIsTrue(
        execution?.prerequisites.historical_candles_table_detected,
      ),
      historical_candle_fetch_runs_table_detected: signalIsTrue(
        execution?.prerequisites.historical_candle_fetch_runs_table_detected,
      ),
      provider_env_present: providerEnvPresent,
      budget_policy_present: budgetPolicyPresent,
      lookahead_safety_present: lookaheadSafetyPresent,
      dry_run_pipeline_ready: dryRunPipelineReady,
      persistence_plan_ready: persistencePlanReady,
      manual_approval_gate_passed: false,
    },
    blockers,
    warnings,
    recommended_next_steps: [
      ...(blockers.length > 0
        ? ["resolve_historical_fetch_approval_blockers"]
        : ["review_first_tiny_fetch_plan_with_operator"]),
      "keep_first_fetch_disabled_until_separate_explicit_approval",
      "keep_provider_fetch_persistence_replay_and_scanner_effects_disabled",
    ],
    readiness: {
      ready_for_manual_review: readyForManualReview,
      ready_to_enable_future_fetch: false,
      ready_to_call_provider_now: false,
      ready_to_persist_candles_now: false,
      ready_to_create_synthetic_outcomes: false,
      ready_to_run_replay: false,
      ready_to_affect_scanner: false,
    },
    safety: {
      advisory_only: true,
      provider_fetch_added: false,
      historical_fetch_added: false,
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
