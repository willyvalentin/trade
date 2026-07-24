import type { FirstTinyHistoricalFetchOperatorApprovalSummary } from "@/lib/first-tiny-historical-fetch-operator-approval";
import type { FirstTinyHistoricalFetchRequestPreviewSummary } from "@/lib/first-tiny-historical-fetch-request-preview";

export type FirstTinyHistoricalFetchExecutionPlanStatus =
  | "ready_for_future_approval"
  | "blocked"
  | "not_requested";

export type FirstTinyHistoricalFetchExecutionPlanStepId =
  | "operator_approval_check"
  | "cache_lookup"
  | "provider_request_if_cache_miss"
  | "provider_response_parse"
  | "candle_validation"
  | "fetch_run_audit_plan"
  | "candle_persistence_plan"
  | "post_fetch_replay_gate";

export type FirstTinyHistoricalFetchExecutionPlanStepStatus =
  | "planned"
  | "blocked_until_future_approval"
  | "planned_no_write"
  | "blocked_separate_approval_required";

export type FirstTinyHistoricalFetchExecutionPlanStep = {
  step_id: FirstTinyHistoricalFetchExecutionPlanStepId;
  order: number;
  required: true;
  status: FirstTinyHistoricalFetchExecutionPlanStepStatus;
  executes_now: false;
};

export type FirstTinyHistoricalFetchExecutionPlanInput = {
  operator_approval?:
    | FirstTinyHistoricalFetchOperatorApprovalSummary
    | null;
  request_preview?: FirstTinyHistoricalFetchRequestPreviewSummary | null;
};

export type FirstTinyHistoricalFetchExecutionPlanSummary = {
  advisory_only: true;
  execution_plan_only: true;
  execution_plan_status: FirstTinyHistoricalFetchExecutionPlanStatus;
  execution_context: {
    operator_approval_status: FirstTinyHistoricalFetchOperatorApprovalSummary["approval_record_status"];
    request_preview_status: FirstTinyHistoricalFetchRequestPreviewSummary["preview_status"];
    first_fetch_enabled: false;
    dry_run_only: true;
    provider_call_allowed_now: false;
    persistence_allowed_now: false;
  };
  planned_steps: FirstTinyHistoricalFetchExecutionPlanStep[];
  request_scope: {
    provider: "twelve_data";
    endpoint: "time_series";
    ticker: string;
    interval: "5min";
    trading_day: string | null;
    request_count: number;
    estimated_credits: number;
    cache_key: string;
    cache_lookup_required: true;
    fetch_run_audit_required: true;
  };
  execution_limits: {
    max_tickers: 1;
    max_trading_days: 1;
    max_requests: 1;
    max_estimated_credits: 1;
    pause_near_scan_windows: true;
    pause_on_provider_warnings: true;
    cache_reuse_before_fetch: true;
  };
  blockers: string[];
  warnings: string[];
  recommended_next_steps: string[];
  readiness: {
    ready_to_review_execution_plan: boolean;
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
    execution_plan_only: true;
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

function plannedSteps(): FirstTinyHistoricalFetchExecutionPlanStep[] {
  return [
    {
      step_id: "operator_approval_check",
      order: 1,
      required: true,
      status: "planned",
      executes_now: false,
    },
    {
      step_id: "cache_lookup",
      order: 2,
      required: true,
      status: "planned",
      executes_now: false,
    },
    {
      step_id: "provider_request_if_cache_miss",
      order: 3,
      required: true,
      status: "blocked_until_future_approval",
      executes_now: false,
    },
    {
      step_id: "provider_response_parse",
      order: 4,
      required: true,
      status: "planned",
      executes_now: false,
    },
    {
      step_id: "candle_validation",
      order: 5,
      required: true,
      status: "planned",
      executes_now: false,
    },
    {
      step_id: "fetch_run_audit_plan",
      order: 6,
      required: true,
      status: "planned_no_write",
      executes_now: false,
    },
    {
      step_id: "candle_persistence_plan",
      order: 7,
      required: true,
      status: "planned_no_write",
      executes_now: false,
    },
    {
      step_id: "post_fetch_replay_gate",
      order: 8,
      required: true,
      status: "blocked_separate_approval_required",
      executes_now: false,
    },
  ];
}

export function buildFirstTinyHistoricalFetchExecutionPlan(
  input: FirstTinyHistoricalFetchExecutionPlanInput = {},
): FirstTinyHistoricalFetchExecutionPlanSummary {
  const operatorApproval = input.operator_approval ?? null;
  const requestPreview = input.request_preview ?? null;
  const operatorStatus =
    operatorApproval?.approval_record_status ?? "not_created";
  const previewStatus = requestPreview?.preview_status ?? "not_requested";
  const blockers: string[] = [];
  const warnings = [
    "execution_plan_only_no_provider_call",
    "execution_plan_does_not_enable_fetch",
  ];

  if (!operatorApproval) {
    pushUnique(blockers, "operator_approval_record_missing");
  } else if (
    operatorStatus !== "pending_operator_decision" &&
    operatorStatus !== "approved_for_future_fetch"
  ) {
    pushUnique(blockers, "operator_approval_not_ready_for_execution_plan");
  }
  if (!requestPreview || previewStatus !== "ready") {
    pushUnique(blockers, "request_preview_not_ready");
  }

  const readyToReview = blockers.length === 0;
  const executionPlanStatus: FirstTinyHistoricalFetchExecutionPlanStatus =
    !operatorApproval && !requestPreview
      ? "not_requested"
      : readyToReview
        ? "ready_for_future_approval"
        : "blocked";

  return {
    advisory_only: true,
    execution_plan_only: true,
    execution_plan_status: executionPlanStatus,
    execution_context: {
      operator_approval_status: operatorStatus,
      request_preview_status: previewStatus,
      first_fetch_enabled: false,
      dry_run_only: true,
      provider_call_allowed_now: false,
      persistence_allowed_now: false,
    },
    planned_steps: plannedSteps(),
    request_scope: {
      provider: "twelve_data",
      endpoint: "time_series",
      ticker: normalizeTicker(requestPreview?.request_preview.ticker),
      interval: "5min",
      trading_day: requestPreview?.request_preview.trading_day ?? null,
      request_count: requestPreview?.request_preview.request_count ?? 0,
      estimated_credits:
        requestPreview?.request_preview.estimated_credits ?? 0,
      cache_key: requestPreview?.request_preview.cache_key ?? "unknown",
      cache_lookup_required: true,
      fetch_run_audit_required: true,
    },
    execution_limits: {
      max_tickers: 1,
      max_trading_days: 1,
      max_requests: 1,
      max_estimated_credits: 1,
      pause_near_scan_windows: true,
      pause_on_provider_warnings: true,
      cache_reuse_before_fetch: true,
    },
    blockers,
    warnings,
    recommended_next_steps: [
      ...(readyToReview
        ? ["review_first_tiny_historical_fetch_execution_plan"]
        : ["resolve_first_tiny_execution_plan_blockers"]),
      "require_separate_operator_approval_before_provider_call",
      "keep_fetch_run_candle_replay_and_scanner_effects_disabled",
    ],
    readiness: {
      ready_to_review_execution_plan: readyToReview,
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
      execution_plan_only: true,
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
