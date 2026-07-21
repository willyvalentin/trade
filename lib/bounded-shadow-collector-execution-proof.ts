import type { ContinuousIntelligenceBudgetPlan } from "@/lib/continuous-intelligence-budget-orchestrator";

export const boundedShadowCollectorExecutionProofContractVersion =
  "bounded_shadow_collector_execution_proof_v1" as const;

export const boundedShadowCollectorExecutionProofRouteMarker =
  "action_568_bounded_shadow_collector_execution_proof_v1" as const;

export const boundedShadowCollectorExecutionProofRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof" as const;

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
  provider_metadata_status: "within_budget" | "approaching_limit" | null;
  provider: BoundedShadowCollectorExecutionProofProvider;
  now?: Date | string;
  timeout_ms?: number;
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

export function boundedShadowCollectorExecutionProofFingerprint(
  request: BoundedShadowCollectorExecutionProofRequest,
) {
  return [request.ticker, request.interval, request.start, request.end].join("|");
}

function blocked(
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
      blocker === "invalid_provider_response"
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

function runtimeGate(input: ExecutionProofRuntimeInput) {
  const fingerprint = boundedShadowCollectorExecutionProofFingerprint(input.request);
  if (!input.provider_configured) {
    return blocked("provider_not_configured", fingerprint, "Provider configuration is unavailable.");
  }
  if (input.provider_metadata_status === null) {
    return blocked("provider_metadata_unresolved", fingerprint, "Provider budget metadata is unresolved.");
  }
  const plan = input.budget_plan;
  if (!plan || plan.contract !== "continuous_intelligence_budget_plan_v1") {
    return blocked("planner_unavailable", fingerprint, "Action 565 planner output is unavailable.");
  }
  if (
    plan.status !== "planning_only" ||
    plan.degradation_level === "provider_blocked" ||
    plan.degradation_level === "unknown"
  ) {
    return blocked("budget_not_available", fingerprint, "Planner capacity is not available for a bounded proof.");
  }
  if (
    plan.policy.total_credits !== 377 ||
    plan.policy.hard_reserve_credits !== 57 ||
    plan.policy.normal_planned_max_credits !== 320
  ) {
    return blocked("budget_not_available", fingerprint, "Planner policy does not match the bounded proof contract.");
  }
  if (
    plan.allocation.reserved_credits < plan.policy.hard_reserve_credits ||
    plan.allocation.planned_max_credits > plan.policy.normal_planned_max_credits ||
    plan.allocation.allocated_credits > plan.policy.normal_planned_max_credits
  ) {
    return blocked("reserve_boundary_violation", fingerprint, "Hard reserve protection is not intact.");
  }
  if (boundedShadowCollectorExecutionProofLimits.max_provider_requests !== 1) {
    return blocked("more_than_one_request_required", fingerprint, "The proof requires more than one provider request.");
  }
  const authorization = plannerAuthorization(plan, input.request.ticker);
  if (!authorization) {
    return blocked(
      "planner_authorization_unavailable",
      fingerprint,
      "The requested ticker has no allocated normal-capacity planner authorization.",
    );
  }
  return { authorization };
}

async function executeOnce(
  input: ExecutionProofRuntimeInput,
): Promise<BoundedShadowCollectorExecutionProofResult> {
  const gate = runtimeGate(input);
  if ("ok" in gate) return gate;
  const plan = input.budget_plan;
  if (!plan) return blocked("planner_unavailable", null, "Action 565 planner output is unavailable.");
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
      return blocked("provider_timeout", fingerprint, "Provider request exceeded the bounded timeout.", 1);
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
      return blocked("invalid_provider_response", fingerprint, "Provider response failed bounded proof validation.", 1);
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
    return blocked(
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

  return {
    async execute(input: ExecutionProofRuntimeInput) {
      const fingerprint = boundedShadowCollectorExecutionProofFingerprint(input.request);
      if (inFlight.has(fingerprint)) {
        return blocked("duplicate_request_in_flight", fingerprint, "An identical proof request is already in flight.");
      }
      if (inFlight.size >= maxInFlight) {
        return blocked("runtime_capacity_unavailable", fingerprint, "Another bounded proof request is already in flight.");
      }
      const operation = executeOnce(input);
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
  };
}

// Process-local only: bounded duplicate protection for this shadow proof route.
export const boundedShadowCollectorExecutionProofRuntime =
  createBoundedShadowCollectorExecutionProofRuntime();
