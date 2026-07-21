import {
  buildContinuousIntelligenceBudgetPlan,
  type ContinuousIntelligenceSession,
} from "@/lib/continuous-intelligence-budget-orchestrator";
import { buildContinuousIntelligenceBudgetPlanInput } from "@/lib/continuous-intelligence-budget-plan-input";
import { buildMarketSessionEvaluation } from "@/lib/market-session";
import {
  buildRollingRestCollectorShadowSummary,
  continuousIntelligenceShadowCollectorFlagName,
  isContinuousIntelligenceShadowCollectorEnabled,
  rollingRestCollectorContractVersion,
  type RollingRestCollectorJob,
  type RollingRestCollectorWorkloadClass,
} from "@/lib/rolling-rest-collector";
import { sharedCandleCacheContractVersion } from "@/lib/shared-candle-cache";

export const authenticatedShadowCollectorDryRunContractVersion =
  "authenticated_shadow_collector_dry_run_v1" as const;

export const authenticatedShadowCollectorDryRunRouteMarker =
  "action_567_authenticated_shadow_collector_dry_run_v1" as const;

export const authenticatedShadowCollectorDryRunRoutePath =
  "/api/automation/continuous-intelligence/shadow-collector/dry-run" as const;

export const authenticatedShadowCollectorDryRunLimits = {
  max_requested_tickers: 20,
  max_jobs: 20,
  max_estimated_credits: 320,
  max_time_range_ms: 6 * 60 * 60 * 1000,
  route_timeout_ms: 10_000,
  allowed_intervals: ["1min", "5min", "15min"] as const,
} as const;

const tickerPattern = /^[A-Z][A-Z0-9.-]{0,9}$/;

const supportedSessions: ContinuousIntelligenceSession[] = [
  "premarket",
  "regular",
  "after_hours",
  "overnight",
  "weekend_or_holiday",
  "unknown",
];

const supportedWorkloadClasses: RollingRestCollectorWorkloadClass[] = [
  "outcome_evaluation",
  "execution_ready_opportunity_monitoring",
  "hot_candidate_monitoring",
  "recommendation_validation",
  "broad_universe_refresh",
  "background_learning_historical_sampling",
];

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
]);

type DryRunRequestBody = Record<string, unknown>;

export type AuthenticatedShadowCollectorDryRunRequest = {
  tickers: string[];
  interval: (typeof authenticatedShadowCollectorDryRunLimits.allowed_intervals)[number] | null;
  time_range: { start: string; end: string } | null;
  max_jobs: number;
  estimated_credits: number | null;
  workload_classes: RollingRestCollectorWorkloadClass[] | null;
  session_override: ContinuousIntelligenceSession | null;
};

export type AuthenticatedShadowCollectorDryRunInputError = {
  code:
    | "arbitrary_target_input_forbidden"
    | "estimated_credits_out_of_bounds"
    | "invalid_interval"
    | "invalid_json_body"
    | "invalid_session_override"
    | "invalid_ticker"
    | "invalid_time_range"
    | "invalid_workload_class"
    | "max_jobs_out_of_bounds"
    | "session_override_not_allowed"
    | "ticker_limit_exceeded"
    | "time_range_exceeds_limit";
};

export type AuthenticatedShadowCollectorDryRunDiagnostics = {
  contract_version: typeof authenticatedShadowCollectorDryRunContractVersion;
  route_marker: typeof authenticatedShadowCollectorDryRunRouteMarker;
  route_path: typeof authenticatedShadowCollectorDryRunRoutePath;
  route_present: true;
  status: "not_observed";
  latest_safe_observed_result: null;
  authentication_required: true;
  feature_flag: typeof continuousIntelligenceShadowCollectorFlagName;
  feature_flag_state: "unknown";
  dry_run_only: true;
  provider_execution_allowed: false;
  database_writes_allowed: false;
  cache_mutation_allowed: false;
  schedule_present: false;
  next_action: string;
  no_effect_boundary: string;
};

export function buildAuthenticatedShadowCollectorDryRunDiagnostics(): AuthenticatedShadowCollectorDryRunDiagnostics {
  return {
    contract_version: authenticatedShadowCollectorDryRunContractVersion,
    route_marker: authenticatedShadowCollectorDryRunRouteMarker,
    route_path: authenticatedShadowCollectorDryRunRoutePath,
    route_present: true,
    status: "not_observed",
    latest_safe_observed_result: null,
    authentication_required: true,
    feature_flag: continuousIntelligenceShadowCollectorFlagName,
    feature_flag_state: "unknown",
    dry_run_only: true,
    provider_execution_allowed: false,
    database_writes_allowed: false,
    cache_mutation_allowed: false,
    schedule_present: false,
    next_action:
      "Use an authenticated dry-run request for server-side plan readback; do not enable execution.",
    no_effect_boundary:
      "No provider calls, cache mutation, schedules, recommendation changes, execution, scanner changes, or database writes.",
  };
}

function isRecord(value: unknown): value is DryRunRequestBody {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function numberInRange(
  value: unknown,
  min: number,
  max: number,
): value is number {
  return (
    typeof value === "number" &&
    Number.isFinite(value) &&
    Number.isInteger(value) &&
    value >= min &&
    value <= max
  );
}

function parseTime(value: unknown) {
  if (typeof value !== "string" || value.trim().length === 0) return null;
  const parsed = new Date(value);
  return Number.isFinite(parsed.getTime()) ? parsed : null;
}

function normalizeTickers(value: unknown): string[] | null {
  if (value === undefined) return [];
  if (!Array.isArray(value)) return null;
  if (value.length > authenticatedShadowCollectorDryRunLimits.max_requested_tickers) {
    return null;
  }

  const symbols = value.map((item) =>
    typeof item === "string" ? item.trim().toUpperCase() : "",
  );
  if (symbols.some((symbol) => !tickerPattern.test(symbol))) return null;
  return Array.from(new Set(symbols)).sort();
}

function requestError(
  code: AuthenticatedShadowCollectorDryRunInputError["code"],
): { ok: false; error: AuthenticatedShadowCollectorDryRunInputError } {
  return { ok: false, error: { code } };
}

export function parseAuthenticatedShadowCollectorDryRunRequest(
  body: unknown,
  options?: { allow_session_override?: boolean },
):
  | { ok: true; value: AuthenticatedShadowCollectorDryRunRequest }
  | { ok: false; error: AuthenticatedShadowCollectorDryRunInputError } {
  if (!isRecord(body)) return requestError("invalid_json_body");
  if (Object.keys(body).some((key) => prohibitedInputKeys.has(key))) {
    return requestError("arbitrary_target_input_forbidden");
  }

  if (
    body.tickers !== undefined &&
    Array.isArray(body.tickers) &&
    body.tickers.length > authenticatedShadowCollectorDryRunLimits.max_requested_tickers
  ) {
    return requestError("ticker_limit_exceeded");
  }
  const tickers = normalizeTickers(body.tickers);
  if (tickers === null) return requestError("invalid_ticker");

  const interval = body.interval ?? null;
  if (
    interval !== null &&
    (!authenticatedShadowCollectorDryRunLimits.allowed_intervals.includes(
      interval as (typeof authenticatedShadowCollectorDryRunLimits.allowed_intervals)[number],
    ) || typeof interval !== "string")
  ) {
    return requestError("invalid_interval");
  }

  const hasRange = body.start !== undefined || body.end !== undefined;
  const start = parseTime(body.start);
  const end = parseTime(body.end);
  if (hasRange && (!start || !end || end.getTime() <= start.getTime())) {
    return requestError("invalid_time_range");
  }
  if (
    start &&
    end &&
    end.getTime() - start.getTime() > authenticatedShadowCollectorDryRunLimits.max_time_range_ms
  ) {
    return requestError("time_range_exceeds_limit");
  }

  const maxJobs = body.max_jobs ?? authenticatedShadowCollectorDryRunLimits.max_jobs;
  if (
    !numberInRange(
      maxJobs,
      1,
      authenticatedShadowCollectorDryRunLimits.max_jobs,
    )
  ) {
    return requestError("max_jobs_out_of_bounds");
  }

  const estimatedCredits = body.estimated_credits ?? null;
  if (
    estimatedCredits !== null &&
    !numberInRange(
      estimatedCredits,
      0,
      authenticatedShadowCollectorDryRunLimits.max_estimated_credits,
    )
  ) {
    return requestError("estimated_credits_out_of_bounds");
  }

  const workloadClasses = body.workload_classes ?? null;
  if (
    workloadClasses !== null &&
    (!Array.isArray(workloadClasses) ||
      workloadClasses.some(
        (value) =>
          typeof value !== "string" ||
          !supportedWorkloadClasses.includes(value as RollingRestCollectorWorkloadClass),
      ))
  ) {
    return requestError("invalid_workload_class");
  }

  const sessionOverride = body.session_override ?? null;
  if (sessionOverride !== null) {
    if (
      typeof sessionOverride !== "string" ||
      !supportedSessions.includes(sessionOverride as ContinuousIntelligenceSession)
    ) {
      return requestError("invalid_session_override");
    }
    if (!options?.allow_session_override) {
      return requestError("session_override_not_allowed");
    }
  }

  return {
    ok: true,
    value: {
      tickers,
      interval: interval as AuthenticatedShadowCollectorDryRunRequest["interval"],
      time_range:
        start && end ? { start: start.toISOString(), end: end.toISOString() } : null,
      max_jobs: maxJobs,
      estimated_credits: estimatedCredits,
      workload_classes:
        workloadClasses === null
          ? null
          : Array.from(new Set(workloadClasses)).sort() as RollingRestCollectorWorkloadClass[],
      session_override: sessionOverride as ContinuousIntelligenceSession | null,
    },
  };
}

function jobsForRequest(
  jobs: RollingRestCollectorJob[],
  request: AuthenticatedShadowCollectorDryRunRequest,
) {
  const jobsMatchingWorkloadFilter = request.workload_classes
    ? jobs.filter((job) => request.workload_classes?.includes(job.workload_class))
    : jobs;
  const jobsAccepted = jobsMatchingWorkloadFilter.slice(0, request.max_jobs);

  return {
    jobs_available_from_plan: jobs.length,
    jobs_matching_workload_filter: jobsMatchingWorkloadFilter.length,
    jobs_accepted: jobsAccepted,
    jobs_excluded_by_workload_filter:
      jobs.length - jobsMatchingWorkloadFilter.length,
    jobs_truncated_by_max_jobs:
      jobsMatchingWorkloadFilter.length - jobsAccepted.length,
  };
}

export function buildAuthenticatedShadowCollectorDryRunResponse(input: {
  request: AuthenticatedShadowCollectorDryRunRequest;
  shadow_flag_value?: string | boolean | null;
  now?: Date | string | null;
}) {
  const generatedAt =
    input.now instanceof Date
      ? input.now.toISOString()
      : typeof input.now === "string" && Number.isFinite(new Date(input.now).getTime())
        ? new Date(input.now).toISOString()
        : new Date().toISOString();
  const marketSession = buildMarketSessionEvaluation({ now: generatedAt });
  const planInput = buildContinuousIntelligenceBudgetPlanInput({
    generated_at: generatedAt,
    market_phase: marketSession.phase,
    is_trading_day: marketSession.is_trading_day,
    // Authenticated request symbols remain bounded planning metadata only. They
    // never populate visible or execution-ready recommendation demand.
    scanner_context_symbols: input.request.tickers,
  });
  const plan = buildContinuousIntelligenceBudgetPlan({
    ...planInput,
    ...(input.request.session_override
      ? { session: input.request.session_override }
      : {}),
  });
  const shadowEnabled = isContinuousIntelligenceShadowCollectorEnabled(
    input.shadow_flag_value,
  );
  const collector = buildRollingRestCollectorShadowSummary({
    budget_plan: plan,
    shadow_mode_enabled: shadowEnabled,
    now: generatedAt,
  });
  const jobSelection = jobsForRequest(collector.jobs, input.request);
  const jobsDeferred = jobSelection.jobs_accepted.filter(
    (job) => job.defer_reason !== null,
  ).length;
  const deferReasons = jobSelection.jobs_accepted.reduce<Record<string, number>>((result, job) => {
    if (job.defer_reason) {
      result[job.defer_reason] = (result[job.defer_reason] ?? 0) + 1;
    }
    return result;
  }, {});

  return {
    ok: true,
    contract_version: authenticatedShadowCollectorDryRunContractVersion,
    route_marker: authenticatedShadowCollectorDryRunRouteMarker,
    build_marker: authenticatedShadowCollectorDryRunRouteMarker,
    generated_at: generatedAt,
    authentication: {
      authenticated: true,
      source: "x_automation_secret",
      failure_reason: null,
    },
    feature_flag: {
      name: continuousIntelligenceShadowCollectorFlagName,
      enabled: shadowEnabled,
    },
    dry_run: {
      dry_run_only: true,
      execution_disabled: true,
      execution_disabled_reason: "action_567_route_is_planning_only",
    },
    request_application: {
      // A true value here means the optional field was present and validated;
      // false means no client value was supplied, not that validation failed.
      validated_request_metadata: {
        tickers: input.request.tickers.length > 0,
        interval: input.request.interval !== null,
        time_range: input.request.time_range !== null,
        estimated_credits: input.request.estimated_credits !== null,
        workload_classes: input.request.workload_classes !== null,
        max_jobs: true,
        session_override: input.request.session_override !== null,
      },
      applied_to_plan: {
        tickers_as_scanner_context: input.request.tickers.length > 0,
        session_override: input.request.session_override !== null,
      },
      applied_to_response_job_selection: {
        workload_class_filter: input.request.workload_classes !== null,
        max_jobs_limit: true,
      },
      applied_to_jobs: {
        interval: false,
        time_range: false,
        estimated_credits: false,
      },
      not_applied_reasons: {
        interval: "action_565_plan_interval_metadata_unresolved",
        time_range: "action_565_plan_time_range_metadata_unresolved",
        estimated_credits:
          "client_input_cannot_override_action_565_budget_allocation",
      },
    },
    planner: {
      contract: plan.contract,
      version: plan.plan_version,
      session: plan.session,
      degradation_level: plan.degradation_level,
      provider_state: collector.provider_state,
      policy_totals: plan.policy,
      hard_reserve_preserved: plan.allocation.reserved_credits === 57,
    },
    collector: {
      contract: rollingRestCollectorContractVersion,
      cache_version: sharedCandleCacheContractVersion,
      status: collector.status,
      jobs_available_from_plan: jobSelection.jobs_available_from_plan,
      jobs_matching_workload_filter:
        jobSelection.jobs_matching_workload_filter,
      jobs_accepted: jobSelection.jobs_accepted.length,
      jobs_excluded_by_workload_filter:
        jobSelection.jobs_excluded_by_workload_filter,
      jobs_truncated_by_max_jobs: jobSelection.jobs_truncated_by_max_jobs,
      jobs_rejected_by_validation: 0,
      jobs_deferred: jobsDeferred,
      planner_credits: {
        requested: collector.diagnostics.planner_requested_credits,
        allocated: collector.diagnostics.planner_allocated_credits,
        deferred: collector.diagnostics.planner_deferred_credits,
      },
      executable_credits: jobSelection.jobs_accepted.reduce(
        (total, job) => total + job.executable_credits,
        0,
      ),
      top_rejection_or_defer_reasons: deferReasons,
      jobs: jobSelection.jobs_accepted,
    },
    input_bounds: {
      ...authenticatedShadowCollectorDryRunLimits,
      requested_ticker_count: input.request.tickers.length,
      requested_interval: input.request.interval,
      requested_time_range: input.request.time_range,
      requested_estimated_credits: input.request.estimated_credits,
      requested_workload_classes: input.request.workload_classes,
      session_override: input.request.session_override,
      session_override_allowed: input.request.session_override !== null,
    },
    no_effect_boundary: {
      provider_execution_allowed: false,
      provider_calls_executed: false,
      cache_mutation_allowed: false,
      cache_mutated: false,
      database_writes_allowed: false,
      database_writes_executed: false,
      collector_runtime_created: false,
      collector_runtime_executed: false,
      schedules_changed: false,
      recommendations_changed: false,
      ranking_changed: false,
      confidence_changed: false,
      ai_projection_changed: false,
      scanner_changed: false,
      execution_changed: false,
      broker_actions_executed: false,
    },
  } as const;
}
