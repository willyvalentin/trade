import {
  buildContinuousIntelligenceBudgetPlan,
  type ContinuousIntelligenceBudgetPlan,
} from "@/lib/continuous-intelligence-budget-orchestrator";
import { buildContinuousIntelligenceBudgetPlanInput } from "@/lib/continuous-intelligence-budget-plan-input";
import { buildMarketSessionEvaluation } from "@/lib/market-session";

export const boundedShadowCollectorExecutionProofContractVersion =
  "bounded_shadow_collector_execution_proof_v1" as const;

export const boundedShadowCollectorExecutionProofRouteMarker =
  "action_568_bounded_shadow_collector_execution_proof_v1" as const;

export const boundedShadowCollectorExecutionProofRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof" as const;

export const boundedShadowCollectorExecutionProofPreflightRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/preflight" as const;

export const boundedShadowCollectorExecutionProofAuthorizationRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/authorization" as const;

export const boundedShadowCollectorExecutionProofAuthorizationHeaderName =
  "x-ture-bounded-proof-authorization" as const;

export const boundedShadowCollectorExecutionProofAuthorizationLimits = {
  ttl_ms: 60_000,
  max_records: 8,
} as const;

export const boundedShadowCollectorExecutionProofPreflightContractVersion =
  "bounded_shadow_collector_execution_proof_preflight_v1" as const;

export const boundedShadowCollectorExecutionProofPreflightRouteMarker =
  "action_569_production_bounded_execution_preflight_v1" as const;

export const boundedShadowCollectorExecutionProofAuthorizationRouteMarker =
  "action_570_one_time_operator_authorization_v1" as const;

export const boundedShadowCollectorExecutionProofFlagName =
  "TURE_CONTINUOUS_INTELLIGENCE_BOUNDED_SHADOW_EXECUTION_ENABLED" as const;

export const boundedShadowCollectorExecutionProofLimits = {
  allowed_intervals: ["5min", "15min"] as const,
  max_time_range_ms: 30 * 60 * 1000,
  max_provider_requests: 1,
  max_provider_credits: 1,
  provider_timeout_ms: 5_000,
  max_in_flight_requests: 1,
} as const;

const tickerPattern = /^[A-Z][A-Z0-9.-]{0,9}$/;

const prohibitedInputKeys = new Set([
  "api_key",
  "apiKey",
  "authorization",
  "database",
  "database_target",
  "endpoint",
  "provider",
  "provider_endpoint",
  "url",
  "workload",
  "workloads",
  "session",
  "session_override",
  "total_credits",
  "hard_reserve_credits",
]);

const allowedInputKeys = new Set(["tickers", "interval", "start", "end"]);

export type BoundedShadowCollectorExecutionProofBlocker =
  | "authentication_failed"
  | "feature_flag_disabled"
  | "invalid_request"
  | "unsupported_interval"
  | "time_range_too_large"
  | "planner_unavailable"
  | "provider_not_configured"
  | "provider_metadata_unresolved"
  | "budget_not_available"
  | "reserve_boundary_violation"
  | "planner_authorization_unavailable"
  | "more_than_one_request_required"
  | "runtime_capacity_unavailable"
  | "operator_authorization_required"
  | "operator_authorization_invalid"
  | "operator_authorization_expired"
  | "operator_authorization_mismatch"
  | "operator_authorization_already_consumed"
  | "operator_authorization_in_use"
  | "authorization_capacity_unavailable"
  | "authorization_generation_failed"
  | "authorization_preflight_blocked"
  | "internal_execution_failure"
  | "provider_timeout"
  | "provider_failure"
  | "invalid_provider_response"
  | "duplicate_request_in_flight";

export type BoundedShadowCollectorExecutionProofRequest = {
  ticker: string;
  interval: (typeof boundedShadowCollectorExecutionProofLimits.allowed_intervals)[number];
  start: string;
  end: string;
};

export type BoundedShadowCollectorExecutionProofInputError =
  | "invalid_json_body"
  | "arbitrary_target_input_forbidden"
  | "exactly_one_ticker_required"
  | "invalid_ticker"
  | "unsupported_interval"
  | "invalid_time_range"
  | "time_range_too_large"
  | "future_time_range";

export type BoundedShadowCollectorExecutionProofCandle = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number | null;
};

export type BoundedShadowCollectorExecutionProofProviderResult = {
  provider: "twelve_data";
  provider_call_count: number;
  estimated_credits: number | null;
  actual_credits: number | null;
  provider_outcome: "success" | "provider_error" | "provider_blocked";
  provider_status: "available" | "empty" | "provider_error";
  provider_error_category: string | null;
  fallback_used: boolean;
  response_structurally_valid: boolean;
  retry_count: number | null;
  rate_limited: boolean;
  candles: BoundedShadowCollectorExecutionProofCandle[];
};

export type BoundedShadowCollectorPlannerAuthorization = {
  workload_id: string;
  workload_class: ContinuousIntelligenceBudgetPlan["workloads"][number]["kind"];
  rest_layer: ContinuousIntelligenceBudgetPlan["workloads"][number]["rest_layer"];
  demand_source: ContinuousIntelligenceBudgetPlan["workloads"][number]["demand_source"];
  ticker_allocated_by_planner: true;
  planner_requested_credits: number;
  planner_allocated_credits: number;
  proof_executable_credits: 1;
  credit_source: "normal_planned_capacity";
  execution_ready_reserve_consumed: false;
};

export type BoundedShadowCollectorExecutionRuntimeObservation = {
  in_flight_count: number;
  max_in_flight_requests: 1;
  identical_request_in_flight: boolean;
  other_request_in_flight: boolean;
  capacity_available: boolean;
};

export type BoundedShadowCollectorExecutionProofGateChecks = {
  execution_feature_flag_enabled: boolean;
  provider_configured: boolean;
  provider_budget_metadata_resolved: boolean;
  provider_budget_status_accepted: boolean;
  action_565_plan_available: boolean;
  planner_status_is_planning_only: boolean;
  planner_degradation_allows_bounded_proof: boolean;
  policy_totals_match: boolean;
  hard_reserve_intact: boolean;
  ticker_entered_through_scanner_context: boolean;
  matching_planner_workload_exists: boolean;
  workload_is_normal_priority: boolean;
  workload_is_not_protected_capacity: boolean;
  workload_is_not_execution_ready_monitoring: boolean;
  ticker_is_explicitly_allocated: boolean;
  workload_has_allocated_normal_credit: boolean;
  proof_would_consume_exactly_one_normal_credit: boolean;
  execution_ready_reserve_untouched: boolean;
  identical_request_not_in_flight: boolean;
  other_request_not_in_flight: boolean;
  runtime_capacity_available: boolean;
  provider_request_ceiling_is_one: boolean;
  provider_credit_ceiling_is_one: boolean;
  timeout_ceiling_is_five_seconds: boolean;
};

export type BoundedShadowCollectorExecutionProofGateEvaluation = {
  eligible: boolean;
  primary_blocker: BoundedShadowCollectorExecutionProofBlocker | null;
  blockers: BoundedShadowCollectorExecutionProofBlocker[];
  checks: BoundedShadowCollectorExecutionProofGateChecks;
  authorization: BoundedShadowCollectorPlannerAuthorization | null;
};

export type BoundedShadowCollectorExecutionProofPreflightResult = {
  contract_version: typeof boundedShadowCollectorExecutionProofPreflightContractVersion;
  eligible: boolean;
  status: "ready" | "blocked";
  request_fingerprint: string;
  generated_at: string;
  authentication_passed: true;
  gates: BoundedShadowCollectorExecutionProofGateChecks;
  primary_blocker: BoundedShadowCollectorExecutionProofBlocker | null;
  blocker_categories: BoundedShadowCollectorExecutionProofBlocker[];
  planner: {
    contract: ContinuousIntelligenceBudgetPlan["contract"] | null;
    version: ContinuousIntelligenceBudgetPlan["plan_version"] | null;
    session: ContinuousIntelligenceBudgetPlan["session"] | null;
    authorization: BoundedShadowCollectorPlannerAuthorization | null;
  };
  runtime: BoundedShadowCollectorExecutionRuntimeObservation;
  provider: {
    configured: boolean;
    metadata_status: "within_budget" | "approaching_limit" | "unresolved";
  };
  feature_flag: {
    name: typeof boundedShadowCollectorExecutionProofFlagName;
    enabled: boolean;
    action_567_planning_flag_is_execution_authorization: false;
  };
  limits: {
    max_provider_requests: 1;
    max_provider_credits: 1;
    provider_timeout_ms: 5_000;
  };
  no_effect_boundary: {
    provider_calls_executed: false;
    provider_credits_consumed: 0;
    shared_cache_mutated: false;
    supabase_writes_executed: false;
    recommendations_changed: false;
    ranking_changed: false;
    confidence_changed: false;
    scanner_changed: false;
    execution_or_broker_actions: false;
    schedule_changes: false;
    runtime_capacity_reserved: false;
  };
  execution_recheck_required: true;
  operator_authorization_required_for_execution: true;
  authorization_issuance_route_present: true;
};

export type BoundedShadowCollectorExecutionProofProvider = (input: {
  ticker: string;
  interval: BoundedShadowCollectorExecutionProofRequest["interval"];
  start: Date;
  end: Date;
  signal: AbortSignal;
}) => Promise<BoundedShadowCollectorExecutionProofProviderResult>;

export type BoundedShadowCollectorExecutionProofDiagnostics = {
  contract_version: typeof boundedShadowCollectorExecutionProofContractVersion;
  route_marker: typeof boundedShadowCollectorExecutionProofRouteMarker;
  route_path: typeof boundedShadowCollectorExecutionProofRoutePath;
  route_present: true;
  status: "not_observed";
  latest_safe_observed_result: null;
  authentication_required: true;
  execution_feature_flag: typeof boundedShadowCollectorExecutionProofFlagName;
  execution_feature_flag_state: "unknown";
  provider_call_inferred_by_client: false;
  browser_route_invocation: false;
  no_effect_boundary: string;
  next_action: string;
};

export type BoundedShadowCollectorExecutionProofResult =
  | {
      ok: true;
      status: "executed";
      request_fingerprint: string;
      request: BoundedShadowCollectorExecutionProofRequest;
      planner: {
        contract: ContinuousIntelligenceBudgetPlan["contract"];
        version: ContinuousIntelligenceBudgetPlan["plan_version"];
        session: ContinuousIntelligenceBudgetPlan["session"];
        provider_state: "available";
        policy_totals: ContinuousIntelligenceBudgetPlan["policy"];
        hard_reserve_preserved: true;
        authorization: BoundedShadowCollectorPlannerAuthorization;
      };
      execution: {
        provider: "twelve_data";
        provider_request_count: 1;
        estimated_credits: number;
        actual_credits: number | null;
        candle_count: number;
        first_candle_at: string | null;
        last_candle_at: string | null;
        response_freshness: "current_request";
        provider_status_category: "available" | "empty";
        retry_count: 0;
        fallback_used: false;
      };
      no_effect_boundary: {
        shared_cache_mutated: false;
        supabase_writes_executed: false;
        recommendation_changes: false;
        ranking_changes: false;
        confidence_changes: false;
        scanner_changes: false;
        execution_changes: false;
        broker_actions: false;
        schedule_changes: false;
      };
    }
  | {
      ok: false;
      status: "blocked" | "failed";
      blocker: BoundedShadowCollectorExecutionProofBlocker;
      request_fingerprint: string | null;
      safe_message: string;
      provider_request_count: 0 | 1;
      no_effect_boundary: {
        shared_cache_mutated: false;
        supabase_writes_executed: false;
        recommendation_changes: false;
        ranking_changes: false;
        confidence_changes: false;
        scanner_changes: false;
        execution_changes: false;
        broker_actions: false;
        schedule_changes: false;
      };
    };

type ExecutionProofRuntimeInput = {
  request: BoundedShadowCollectorExecutionProofRequest;
  budget_plan: ContinuousIntelligenceBudgetPlan | null;
  provider_configured: boolean;
  provider_metadata_status: string | null;
  execution_feature_enabled: boolean;
  ticker_input_source: "scanner_context_symbols";
  evaluation_now: Date | string;
  provider: BoundedShadowCollectorExecutionProofProvider;
  now?: Date | string;
  timeout_ms?: number;
};

type ExecutionProofGateInput = Omit<ExecutionProofRuntimeInput, "provider" | "now" | "timeout_ms"> & {
  runtime: BoundedShadowCollectorExecutionRuntimeObservation;
};

function noEffectBoundary() {
  return {
    shared_cache_mutated: false,
    supabase_writes_executed: false,
    recommendation_changes: false,
    ranking_changes: false,
    confidence_changes: false,
    scanner_changes: false,
    execution_changes: false,
    broker_actions: false,
    schedule_changes: false,
  } as const;
}

function asDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function record(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function requestError(error: BoundedShadowCollectorExecutionProofInputError) {
  return { ok: false as const, error };
}

export function parseBoundedShadowCollectorExecutionProofRequest(
  body: unknown,
  options?: { now?: Date | string },
):
  | { ok: true; value: BoundedShadowCollectorExecutionProofRequest }
  | { ok: false; error: BoundedShadowCollectorExecutionProofInputError } {
  if (!record(body)) return requestError("invalid_json_body");
  if (
    Object.keys(body).some(
      (key) => prohibitedInputKeys.has(key) || !allowedInputKeys.has(key),
    )
  ) {
    return requestError("arbitrary_target_input_forbidden");
  }
  if (!Array.isArray(body.tickers) || body.tickers.length !== 1) {
    return requestError("exactly_one_ticker_required");
  }
  const rawTicker = body.tickers[0];
  const ticker = typeof rawTicker === "string" ? rawTicker.trim().toUpperCase() : "";
  if (!tickerPattern.test(ticker)) return requestError("invalid_ticker");
  if (
    typeof body.interval !== "string" ||
    !boundedShadowCollectorExecutionProofLimits.allowed_intervals.includes(
      body.interval as BoundedShadowCollectorExecutionProofRequest["interval"],
    )
  ) {
    return requestError("unsupported_interval");
  }
  const start = asDate(body.start);
  const end = asDate(body.end);
  if (!start || !end || end.getTime() <= start.getTime()) {
    return requestError("invalid_time_range");
  }
  if (end.getTime() - start.getTime() > boundedShadowCollectorExecutionProofLimits.max_time_range_ms) {
    return requestError("time_range_too_large");
  }
  const now = options?.now ? asDate(options.now instanceof Date ? options.now.toISOString() : options.now) : new Date();
  if (now && end.getTime() > now.getTime()) return requestError("future_time_range");

  return {
    ok: true,
    value: {
      ticker,
      interval: body.interval as BoundedShadowCollectorExecutionProofRequest["interval"],
      start: start.toISOString(),
      end: end.toISOString(),
    },
  };
}

export function isBoundedShadowCollectorExecutionProofEnabled(value: unknown) {
  return value === "true" || value === "1" || value === "enabled";
}

export function normalizeBoundedShadowCollectorProviderMetadataStatus(value: unknown) {
  return value === "within_budget" || value === "approaching_limit" ? value : null;
}

export function buildBoundedShadowCollectorExecutionProofPlan(input: {
  now: Date;
  provider_metadata_status: string | null;
  proof_ticker: string;
}) {
  const session = buildMarketSessionEvaluation({ now: input.now });
  const marketPhase =
    session.phase === "regular" ||
    session.phase === "pre_market" ||
    session.phase === "after_hours"
      ? session.phase
      : "unknown";
  const planInput = buildContinuousIntelligenceBudgetPlanInput({
    generated_at: input.now.toISOString(),
    market_phase: marketPhase,
    is_trading_day: session.is_trading_day,
    provider_budget_status: input.provider_metadata_status,
    active_position_symbols: [],
    visible_recommendation_symbols: [],
    scanner_selected_symbols: [],
    scanner_context_symbols: [input.proof_ticker],
    dynamic_mover_symbols: [],
    dynamic_movers_status: undefined,
    dynamic_movers_selected_count: 0,
    outcome_symbols: [],
    pending_outcomes: 0,
    legacy_constraints: {},
  });

  return {
    budget_plan: buildContinuousIntelligenceBudgetPlan(planInput),
    ticker_input_source: "scanner_context_symbols" as const,
    evaluation_now: input.now.toISOString(),
  };
}

export function buildBoundedShadowCollectorExecutionProofDiagnostics(): BoundedShadowCollectorExecutionProofDiagnostics {
  return {
    contract_version: boundedShadowCollectorExecutionProofContractVersion,
    route_marker: boundedShadowCollectorExecutionProofRouteMarker,
    route_path: boundedShadowCollectorExecutionProofRoutePath,
    route_present: true,
    status: "not_observed",
    latest_safe_observed_result: null,
    authentication_required: true,
    execution_feature_flag: boundedShadowCollectorExecutionProofFlagName,
    execution_feature_flag_state: "unknown",
    provider_call_inferred_by_client: false,
    browser_route_invocation: false,
    no_effect_boundary:
      "No browser route invocation, provider call inference, cache mutation, persistence, schedule, recommendation, scanner, ranking, execution, or broker effects.",
    next_action:
      "Keep the bounded execution flag disabled until an operator explicitly authorizes one authenticated proof request.",
  };
}

export type BoundedShadowCollectorExecutionProofPreflightDiagnostics = {
  contract_version: typeof boundedShadowCollectorExecutionProofPreflightContractVersion;
  route_marker: typeof boundedShadowCollectorExecutionProofPreflightRouteMarker;
  route_path: typeof boundedShadowCollectorExecutionProofPreflightRoutePath;
  route_present: true;
  status: "not_observed";
  latest_safe_observed_result: null;
  authentication_required: true;
  browser_route_invocation: false;
  provider_call_inferred_by_client: false;
  execution_capacity_reserved: false;
  no_effect_boundary: string;
  next_action: string;
};

export function buildBoundedShadowCollectorExecutionProofPreflightDiagnostics(): BoundedShadowCollectorExecutionProofPreflightDiagnostics {
  return {
    contract_version: boundedShadowCollectorExecutionProofPreflightContractVersion,
    route_marker: boundedShadowCollectorExecutionProofPreflightRouteMarker,
    route_path: boundedShadowCollectorExecutionProofPreflightRoutePath,
    route_present: true,
    status: "not_observed",
    latest_safe_observed_result: null,
    authentication_required: true,
    browser_route_invocation: false,
    provider_call_inferred_by_client: false,
    execution_capacity_reserved: false,
    no_effect_boundary:
      "No browser invocation, provider call, credit consumption, cache mutation, persistence, schedule, recommendation, scanner, ranking, execution, or broker effect.",
    next_action:
      "Use an authenticated preflight only when an operator needs an instantaneous readiness observation; execution rechecks every gate.",
  };
}

function normalizeBoundedShadowCollectorExecutionProofEvaluationTimestamp(
  value: Date | string,
) {
  const timestamp = value instanceof Date ? value : new Date(value);
  if (!Number.isFinite(timestamp.getTime())) {
    throw new Error("Invalid bounded execution proof evaluation timestamp.");
  }
  return timestamp.toISOString();
}

export function buildBoundedShadowCollectorExecutionProofPreflightResult(
  input: ExecutionProofGateInput,
): BoundedShadowCollectorExecutionProofPreflightResult {
  const evaluation = evaluateBoundedShadowCollectorExecutionProofGates(input);
  const plan = input.budget_plan;
  return {
    contract_version: boundedShadowCollectorExecutionProofPreflightContractVersion,
    eligible: evaluation.eligible,
    status: evaluation.eligible ? "ready" : "blocked",
    request_fingerprint: boundedShadowCollectorExecutionProofFingerprint(input.request),
    generated_at: normalizeBoundedShadowCollectorExecutionProofEvaluationTimestamp(
      input.evaluation_now,
    ),
    authentication_passed: true,
    gates: evaluation.checks,
    primary_blocker: evaluation.primary_blocker,
    blocker_categories: evaluation.blockers,
    planner: {
      contract: plan?.contract ?? null,
      version: plan?.plan_version ?? null,
      session: plan?.session ?? null,
      authorization: evaluation.authorization,
    },
    runtime: input.runtime,
    provider: {
      configured: input.provider_configured,
      metadata_status:
        normalizeBoundedShadowCollectorProviderMetadataStatus(
          input.provider_metadata_status,
        ) ?? "unresolved",
    },
    feature_flag: {
      name: boundedShadowCollectorExecutionProofFlagName,
      enabled: input.execution_feature_enabled,
      action_567_planning_flag_is_execution_authorization: false,
    },
    limits: {
      max_provider_requests: 1,
      max_provider_credits: 1,
      provider_timeout_ms: 5_000,
    },
    no_effect_boundary: {
      provider_calls_executed: false,
      provider_credits_consumed: 0,
      shared_cache_mutated: false,
      supabase_writes_executed: false,
      recommendations_changed: false,
      ranking_changed: false,
      confidence_changed: false,
      scanner_changed: false,
      execution_or_broker_actions: false,
      schedule_changes: false,
      runtime_capacity_reserved: false,
    },
    execution_recheck_required: true,
    operator_authorization_required_for_execution: true,
    authorization_issuance_route_present: true,
  };
}

export function boundedShadowCollectorExecutionProofFingerprint(
  request: BoundedShadowCollectorExecutionProofRequest,
) {
  return [request.ticker, request.interval, request.start, request.end].join("|");
}

export function buildBoundedShadowCollectorExecutionProofBlockedResult(
  blocker: BoundedShadowCollectorExecutionProofBlocker,
  requestFingerprint: string | null,
  safeMessage: string,
  providerRequestCount: 0 | 1 = 0,
): BoundedShadowCollectorExecutionProofResult {
  return {
    ok: false,
    status:
      blocker === "provider_timeout" ||
      blocker === "provider_failure" ||
      blocker === "invalid_provider_response" ||
      blocker === "internal_execution_failure"
        ? "failed"
        : "blocked",
    blocker,
    request_fingerprint: requestFingerprint,
    safe_message: safeMessage,
    provider_request_count: providerRequestCount,
    no_effect_boundary: noEffectBoundary(),
  };
}

function validCandle(candle: BoundedShadowCollectorExecutionProofCandle) {
  return (
    Number.isFinite(candle.timestamp) &&
    Number.isFinite(candle.open) &&
    Number.isFinite(candle.high) &&
    Number.isFinite(candle.low) &&
    Number.isFinite(candle.close) &&
    (candle.volume === null || Number.isFinite(candle.volume))
  );
}

function plannerAuthorization(
  plan: ContinuousIntelligenceBudgetPlan,
  ticker: string,
): BoundedShadowCollectorPlannerAuthorization | null {
  const workload = plan.workloads.find(
    (item) =>
      item.priority === "normal" &&
      item.protected_capacity === false &&
      item.kind !== "execution_ready_opportunity_monitoring" &&
      item.allocated_credits >= 1 &&
      item.allocated_symbols.includes(ticker),
  );
  if (!workload) return null;

  return {
    workload_id: workload.workload_id,
    workload_class: workload.kind,
    rest_layer: workload.rest_layer,
    demand_source: workload.demand_source,
    ticker_allocated_by_planner: true,
    planner_requested_credits: workload.requested_credits,
    planner_allocated_credits: workload.allocated_credits,
    proof_executable_credits: 1,
    credit_source: "normal_planned_capacity",
    execution_ready_reserve_consumed: false,
  };
}

function firstPlannerWorkloadForTicker(
  plan: ContinuousIntelligenceBudgetPlan | null,
  ticker: string,
) {
  return plan?.workloads.find((item) => item.allocated_symbols.includes(ticker)) ?? null;
}

export function evaluateBoundedShadowCollectorExecutionProofGates(
  input: ExecutionProofGateInput,
): BoundedShadowCollectorExecutionProofGateEvaluation {
  const plan = input.budget_plan;
  const planAvailable = plan?.contract === "continuous_intelligence_budget_plan_v1";
  const plannerStatusIsPlanningOnly = plan?.status === "planning_only";
  const plannerDegradationAllowsBoundedProof = Boolean(
    plan &&
      plan.degradation_level !== "provider_blocked" &&
      plan.degradation_level !== "unknown",
  );
  const providerMetadataResolved =
    typeof input.provider_metadata_status === "string" &&
    input.provider_metadata_status.trim().length > 0;
  const providerBudgetStatusAccepted =
    normalizeBoundedShadowCollectorProviderMetadataStatus(
      input.provider_metadata_status,
    ) !== null;
  const tickerWorkload = firstPlannerWorkloadForTicker(plan, input.request.ticker);
  const authorization = plan ? plannerAuthorization(plan, input.request.ticker) : null;
  const inspectedWorkload = authorization
    ? plan?.workloads.find((item) => item.workload_id === authorization.workload_id) ?? null
    : tickerWorkload;
  const policyTotalsMatch = Boolean(
    plan &&
      plan.policy.total_credits === 377 &&
      plan.policy.hard_reserve_credits === 57 &&
      plan.policy.normal_planned_max_credits === 320,
  );
  const hardReserveIntact = Boolean(
    plan &&
      plan.allocation.reserved_credits >= plan.policy.hard_reserve_credits &&
      plan.allocation.planned_max_credits <= plan.policy.normal_planned_max_credits &&
      plan.allocation.allocated_credits <= plan.policy.normal_planned_max_credits,
  );
  const checks: BoundedShadowCollectorExecutionProofGateChecks = {
    execution_feature_flag_enabled: input.execution_feature_enabled,
    provider_configured: input.provider_configured,
    provider_budget_metadata_resolved: providerMetadataResolved,
    provider_budget_status_accepted: providerBudgetStatusAccepted,
    action_565_plan_available: planAvailable,
    planner_status_is_planning_only: plannerStatusIsPlanningOnly,
    planner_degradation_allows_bounded_proof: plannerDegradationAllowsBoundedProof,
    policy_totals_match: policyTotalsMatch,
    hard_reserve_intact: hardReserveIntact,
    ticker_entered_through_scanner_context:
      input.ticker_input_source === "scanner_context_symbols",
    matching_planner_workload_exists: inspectedWorkload !== null,
    workload_is_normal_priority: inspectedWorkload?.priority === "normal",
    workload_is_not_protected_capacity: inspectedWorkload?.protected_capacity === false,
    workload_is_not_execution_ready_monitoring:
      inspectedWorkload !== null &&
      inspectedWorkload.kind !== "execution_ready_opportunity_monitoring",
    ticker_is_explicitly_allocated:
      inspectedWorkload?.allocated_symbols.includes(input.request.ticker) === true,
    workload_has_allocated_normal_credit:
      inspectedWorkload?.priority === "normal" && inspectedWorkload.allocated_credits >= 1,
    proof_would_consume_exactly_one_normal_credit: authorization?.proof_executable_credits === 1,
    execution_ready_reserve_untouched:
      authorization?.execution_ready_reserve_consumed === false,
    identical_request_not_in_flight: !input.runtime.identical_request_in_flight,
    other_request_not_in_flight: !input.runtime.other_request_in_flight,
    runtime_capacity_available: input.runtime.capacity_available,
    provider_request_ceiling_is_one:
      boundedShadowCollectorExecutionProofLimits.max_provider_requests === 1,
    provider_credit_ceiling_is_one:
      boundedShadowCollectorExecutionProofLimits.max_provider_credits === 1,
    timeout_ceiling_is_five_seconds:
      boundedShadowCollectorExecutionProofLimits.provider_timeout_ms === 5_000,
  };
  const blockers: BoundedShadowCollectorExecutionProofBlocker[] = [];
  if (!checks.execution_feature_flag_enabled) blockers.push("feature_flag_disabled");
  if (!checks.provider_configured) blockers.push("provider_not_configured");
  if (!checks.provider_budget_metadata_resolved) blockers.push("provider_metadata_unresolved");
  if (checks.provider_budget_metadata_resolved && !checks.provider_budget_status_accepted) {
    blockers.push("budget_not_available");
  }
  if (!checks.action_565_plan_available) blockers.push("planner_unavailable");
  if (!checks.planner_status_is_planning_only || !checks.planner_degradation_allows_bounded_proof) {
    blockers.push("budget_not_available");
  }
  if (!checks.policy_totals_match) blockers.push("budget_not_available");
  if (!checks.hard_reserve_intact) blockers.push("reserve_boundary_violation");
  if (!authorization) blockers.push("planner_authorization_unavailable");
  if (!checks.identical_request_not_in_flight) blockers.push("duplicate_request_in_flight");
  if (!checks.other_request_not_in_flight || !checks.runtime_capacity_available) {
    blockers.push("runtime_capacity_unavailable");
  }
  if (!checks.provider_request_ceiling_is_one) blockers.push("more_than_one_request_required");
  if (!checks.provider_credit_ceiling_is_one || !checks.timeout_ceiling_is_five_seconds) {
    blockers.push("budget_not_available");
  }
  return {
    eligible: blockers.length === 0,
    primary_blocker: blockers[0] ?? null,
    blockers: [...new Set(blockers)],
    checks,
    authorization,
  };
}

function runtimeGate(input: ExecutionProofRuntimeInput, runtime: BoundedShadowCollectorExecutionRuntimeObservation) {
  const evaluation = evaluateBoundedShadowCollectorExecutionProofGates({
    request: input.request,
    budget_plan: input.budget_plan,
    provider_configured: input.provider_configured,
    provider_metadata_status: input.provider_metadata_status,
    execution_feature_enabled: input.execution_feature_enabled,
    ticker_input_source: input.ticker_input_source,
    evaluation_now: input.evaluation_now,
    runtime,
  });
  if (evaluation.eligible && evaluation.authorization) return evaluation;
  const fingerprint = boundedShadowCollectorExecutionProofFingerprint(input.request);
  const blocker = evaluation.primary_blocker ?? "planner_authorization_unavailable";
  const messages: Record<BoundedShadowCollectorExecutionProofBlocker, string> = {
    authentication_failed: "Authentication is required.",
    feature_flag_disabled: "Bounded execution proof is disabled.",
    invalid_request: "Request validation failed.",
    unsupported_interval: "The interval is unsupported.",
    time_range_too_large: "The requested time range is too large.",
    planner_unavailable: "Action 565 planner output is unavailable.",
    provider_not_configured: "Provider configuration is unavailable.",
    provider_metadata_unresolved: "Provider budget metadata is unresolved.",
    budget_not_available: "Planner capacity is not available for a bounded proof.",
    reserve_boundary_violation: "Hard reserve protection is not intact.",
    planner_authorization_unavailable: "The requested ticker has no allocated normal-capacity planner authorization.",
    more_than_one_request_required: "The proof requires more than one provider request.",
    runtime_capacity_unavailable: "Another bounded proof request is already in flight.",
    provider_timeout: "Provider request exceeded the bounded timeout.",
    provider_failure: "Provider request failed.",
    invalid_provider_response: "Provider response failed bounded proof validation.",
    duplicate_request_in_flight: "An identical proof request is already in flight.",
    operator_authorization_required: "A one-time operator authorization is required.",
    operator_authorization_invalid: "Operator authorization is invalid.",
    operator_authorization_expired: "Operator authorization has expired.",
    operator_authorization_mismatch: "Operator authorization does not match this request.",
    operator_authorization_already_consumed: "Operator authorization has already been consumed.",
    operator_authorization_in_use: "Operator authorization is already being consumed.",
    authorization_capacity_unavailable: "Operator authorization capacity is unavailable.",
    authorization_generation_failed: "Operator authorization could not be issued safely.",
    authorization_preflight_blocked: "Current execution preflight is not eligible.",
    internal_execution_failure: "Bounded execution proof could not be completed safely.",
  };
  return buildBoundedShadowCollectorExecutionProofBlockedResult(blocker, fingerprint, messages[blocker]);
}

async function executeOnce(
  input: ExecutionProofRuntimeInput,
  gate: BoundedShadowCollectorExecutionProofGateEvaluation,
): Promise<BoundedShadowCollectorExecutionProofResult> {
  const plan = input.budget_plan;
  if (!plan) return buildBoundedShadowCollectorExecutionProofBlockedResult("planner_unavailable", null, "Action 565 planner output is unavailable.");
  if (!gate.authorization) {
    return buildBoundedShadowCollectorExecutionProofBlockedResult(
      "planner_authorization_unavailable",
      boundedShadowCollectorExecutionProofFingerprint(input.request),
      "The requested ticker has no allocated normal-capacity planner authorization.",
    );
  }
  const fingerprint = boundedShadowCollectorExecutionProofFingerprint(input.request);
  const controller = new AbortController();
  const timeoutMs = Math.min(
    Math.max(1, input.timeout_ms ?? boundedShadowCollectorExecutionProofLimits.provider_timeout_ms),
    boundedShadowCollectorExecutionProofLimits.provider_timeout_ms,
  );
  let timedOut = false;
  const timeout = setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, timeoutMs);

  try {
    const providerResult = await input.provider({
      ticker: input.request.ticker,
      interval: input.request.interval,
      start: new Date(input.request.start),
      end: new Date(input.request.end),
      signal: controller.signal,
    });
    if (timedOut) {
      return buildBoundedShadowCollectorExecutionProofBlockedResult("provider_timeout", fingerprint, "Provider request exceeded the bounded timeout.", 1);
    }
    if (
      providerResult.provider !== "twelve_data" ||
      providerResult.provider_call_count !== 1 ||
      providerResult.provider_outcome !== "success" ||
      (providerResult.provider_status !== "available" &&
        providerResult.provider_status !== "empty") ||
      providerResult.provider_error_category !== null ||
      providerResult.fallback_used ||
      !providerResult.response_structurally_valid ||
      providerResult.retry_count !== 0 ||
      providerResult.rate_limited ||
      !Array.isArray(providerResult.candles) ||
      providerResult.candles.some((candle) => !validCandle(candle)) ||
      providerResult.estimated_credits === null ||
      providerResult.estimated_credits < 0 ||
      providerResult.estimated_credits > boundedShadowCollectorExecutionProofLimits.max_provider_credits ||
      (providerResult.actual_credits !== null &&
        (providerResult.actual_credits < 0 ||
          providerResult.actual_credits > boundedShadowCollectorExecutionProofLimits.max_provider_credits))
    ) {
      return buildBoundedShadowCollectorExecutionProofBlockedResult("invalid_provider_response", fingerprint, "Provider response failed bounded proof validation.", 1);
    }
    const candles = providerResult.candles.slice().sort((left, right) => left.timestamp - right.timestamp);
    const first = candles[0] ?? null;
    const last = candles.at(-1) ?? null;
    return {
      ok: true,
      status: "executed",
      request_fingerprint: fingerprint,
      request: input.request,
      planner: {
        contract: plan.contract,
        version: plan.plan_version,
        session: plan.session,
        provider_state: "available",
        policy_totals: plan.policy,
        hard_reserve_preserved: true,
        authorization: gate.authorization,
      },
      execution: {
        provider: "twelve_data",
        provider_request_count: 1,
        estimated_credits: providerResult.estimated_credits,
        actual_credits: providerResult.actual_credits,
        candle_count: candles.length,
        first_candle_at: first ? new Date(first.timestamp * 1000).toISOString() : null,
        last_candle_at: last ? new Date(last.timestamp * 1000).toISOString() : null,
        response_freshness: "current_request",
        provider_status_category: candles.length > 0 ? "available" : "empty",
        retry_count: 0,
        fallback_used: false,
      },
      no_effect_boundary: noEffectBoundary(),
    };
  } catch {
    return buildBoundedShadowCollectorExecutionProofBlockedResult(
      timedOut || controller.signal.aborted ? "provider_timeout" : "provider_failure",
      fingerprint,
      timedOut || controller.signal.aborted
        ? "Provider request exceeded the bounded timeout."
        : "Provider request failed.",
      1,
    );
  } finally {
    clearTimeout(timeout);
  }
}

export function createBoundedShadowCollectorExecutionProofRuntime() {
  const maxInFlight = boundedShadowCollectorExecutionProofLimits.max_in_flight_requests;
  const inFlight = new Map<string, Promise<BoundedShadowCollectorExecutionProofResult>>();

  const observe = (request: BoundedShadowCollectorExecutionProofRequest) => {
    const fingerprint = boundedShadowCollectorExecutionProofFingerprint(request);
    const identicalRequestInFlight = inFlight.has(fingerprint);
    const otherRequestInFlight = inFlight.size > 0 && !identicalRequestInFlight;
    return {
      in_flight_count: inFlight.size,
      max_in_flight_requests: maxInFlight,
      identical_request_in_flight: identicalRequestInFlight,
      other_request_in_flight: otherRequestInFlight,
      capacity_available: inFlight.size < maxInFlight,
    } as const;
  };

  return {
    preflight(input: Omit<ExecutionProofRuntimeInput, "provider" | "now" | "timeout_ms">) {
      const runtime = observe(input.request);
      return buildBoundedShadowCollectorExecutionProofPreflightResult({
        ...input,
        runtime,
      });
    },
    async execute(input: ExecutionProofRuntimeInput) {
      const fingerprint = boundedShadowCollectorExecutionProofFingerprint(input.request);
      const gate = runtimeGate(input, observe(input.request));
      if ("ok" in gate) return gate;
      const operation = Promise.resolve().then(() => executeOnce(input, gate));
      inFlight.set(fingerprint, operation);
      try {
        return await operation;
      } finally {
        inFlight.delete(fingerprint);
      }
    },
    snapshot() {
      return { in_flight_count: inFlight.size, max_in_flight_requests: maxInFlight };
    },
    observe,
  };
}

// Process-local only: bounded duplicate protection for this shadow proof route.
export const boundedShadowCollectorExecutionProofRuntime =
  createBoundedShadowCollectorExecutionProofRuntime();
