import type {
  ContinuousIntelligenceBudgetPlan,
  ContinuousIntelligenceDemandSource,
  ContinuousIntelligenceDegradationLevel,
  ContinuousIntelligencePriority,
  ContinuousIntelligenceProviderState,
  ContinuousIntelligenceRestLayerName,
  ContinuousIntelligenceWorkloadKind,
} from "@/lib/continuous-intelligence-budget-orchestrator";
import {
  collectSharedCandlesWithCache,
  createSharedCandleCache,
  createSharedCandleRequestCoalescer,
  sharedCandleCacheContractVersion,
  type SharedCandleCache,
  type SharedCandleCacheCollectionResult,
  type SharedCandleCacheRangeRequest,
  type SharedCandleProviderRequest,
  type SharedCandleProviderResult,
} from "@/lib/shared-candle-cache";

export const rollingRestCollectorContractVersion =
  "rolling_rest_collector_v1" as const;

export const continuousIntelligenceShadowCollectorFlagName =
  "TURE_CONTINUOUS_INTELLIGENCE_SHADOW_COLLECTOR_ENABLED" as const;

export type RollingRestCollectorStatus =
  | "planning_only"
  | "shadow_runtime_observed";

export type RollingRestCollectorWorkloadClass =
  | "outcome_evaluation"
  | "execution_ready_opportunity_monitoring"
  | "hot_candidate_monitoring"
  | "recommendation_validation"
  | "broad_universe_refresh"
  | "background_learning_historical_sampling";

export type RollingRestCollectorJob = {
  contract_version: typeof rollingRestCollectorContractVersion;
  job_id: string;
  planner_version: ContinuousIntelligenceBudgetPlan["plan_version"];
  source_workload_id: string;
  source_workload_kind: ContinuousIntelligenceWorkloadKind;
  workload_class: RollingRestCollectorWorkloadClass;
  priority: ContinuousIntelligencePriority;
  rest_layer: ContinuousIntelligenceRestLayerName;
  requested_symbols: string[];
  allocated_symbols: string[];
  deferred_symbols: string[];
  websocket_symbols: string[];
  interval: string | null;
  requested_time_range: {
    start: string | null;
    end: string | null;
    analysis_cutoff: string | null;
  };
  planner_requested_credits: number;
  planner_allocated_credits: number;
  planner_deferred_credits: number;
  planner_defer_reasons: string[];
  executable_credits: number;
  defer_reason: string | null;
  shard_index: number;
  shard_count: number;
  shard_size: number;
  cache_first: boolean;
  provider_call_allowed: boolean;
  shadow_only: true;
  demand_source: ContinuousIntelligenceDemandSource;
  demand_metadata_available: boolean;
};

export type RollingRestCollectorShadowSummary = {
  contract_version: typeof rollingRestCollectorContractVersion;
  collector_version: typeof rollingRestCollectorContractVersion;
  cache_version: typeof sharedCandleCacheContractVersion;
  budget_plan_contract: ContinuousIntelligenceBudgetPlan["contract"];
  budget_plan_version: ContinuousIntelligenceBudgetPlan["plan_version"];
  status: RollingRestCollectorStatus;
  shadow_mode_enabled: boolean;
  feature_flag: typeof continuousIntelligenceShadowCollectorFlagName;
  generated_at: string;
  session: string;
  degradation_level: ContinuousIntelligenceDegradationLevel;
  provider_state: ContinuousIntelligenceProviderState;
  policy: ContinuousIntelligenceBudgetPlan["policy"];
  allocation: ContinuousIntelligenceBudgetPlan["allocation"];
  jobs: RollingRestCollectorJob[];
  diagnostics: {
    jobs_planned: number;
    jobs_cache_checked: number;
    jobs_provider_executed: number;
    jobs_cache_satisfied: number;
    jobs_partially_satisfied: number;
    jobs_deferred: number;
    cache_hits: number;
    cache_misses: number;
    cache_partial_hits: number;
    in_flight_joins: number;
    provider_calls_attempted: number;
    provider_calls_succeeded: number;
    provider_calls_failed: number;
    candles_returned: number;
    candles_valid: number;
    candles_invalid: number;
    planner_requested_credits: number;
    planner_allocated_credits: number;
    planner_deferred_credits: number;
    executable_credits: number;
    actual_credits: number;
    top_defer_reasons: Record<string, number>;
    cache_size: number;
    stale_entry_count: number;
    timeout_count: number;
    next_action: string;
  };
  memory_policy: {
    max_cache_entries: number;
    cache_ttl_ms: number;
    max_in_flight_entries: number;
    in_flight_ttl_ms: number;
    serverless_limitations:
      "process-local-shadow-cache-not-durable-or-globally-shared";
  };
  no_effect_boundary: {
    recommendations_changed: false;
    ranking_changed: false;
    confidence_changed: false;
    ai_projection_changed: false;
    execution_changed: false;
    scanner_universe_changed: false;
    official_schedules_changed: false;
    database_writes_executed: false;
    websocket_connections_opened: false;
  };
};

export type RollingRestCollectorRuntimeAudit = {
  jobs_cache_checked: number;
  jobs_provider_executed: number;
  jobs_cache_satisfied: number;
  jobs_partially_satisfied: number;
  cache_hits: number;
  cache_misses: number;
  cache_partial_hits: number;
  provider_calls_attempted: number;
  provider_calls_succeeded: number;
  provider_calls_failed: number;
  candles_returned: number;
  candles_valid: number;
  candles_invalid: number;
  actual_credits: number;
  timeout_count: number;
};

function dateIso(value: Date | string | null | undefined) {
  if (value instanceof Date && Number.isFinite(value.getTime())) {
    return value.toISOString();
  }
  if (typeof value === "string" && value.trim().length > 0) {
    const parsed = new Date(value);
    if (Number.isFinite(parsed.getTime())) {
      return parsed.toISOString();
    }
  }
  return new Date().toISOString();
}

export function isContinuousIntelligenceShadowCollectorEnabled(
  value?: string | boolean | null,
): boolean {
  if (value === true) {
    return true;
  }
  if (typeof value !== "string") {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "enabled";
}

function countDeferReasons(jobs: RollingRestCollectorJob[]) {
  return jobs.reduce<Record<string, number>>((counts, item) => {
    if (item.defer_reason) {
      counts[item.defer_reason] = (counts[item.defer_reason] ?? 0) + 1;
    }
    return counts;
  }, {});
}

function providerAllowed(input: {
  shadow_enabled: boolean;
  provider_state: ContinuousIntelligenceProviderState;
  defer_reason: string | null;
  executable_credits: number;
  ticker_count: number;
  interval: string | null;
}) {
  return (
    input.shadow_enabled &&
    input.provider_state === "available" &&
    input.defer_reason === null &&
    input.executable_credits > 0 &&
    input.ticker_count > 0 &&
    input.interval !== null
  );
}

function providerStateFromPlan(
  plan: ContinuousIntelligenceBudgetPlan,
): ContinuousIntelligenceProviderState {
  if (plan.degradation_level === "provider_blocked" || plan.status === "provider_blocked") {
    return "provider_unavailable";
  }
  if (plan.degradation_level === "unknown" || plan.status === "unknown_capacity") {
    return "unknown";
  }
  return "available";
}

function workloadClass(
  kind: ContinuousIntelligenceWorkloadKind,
): RollingRestCollectorWorkloadClass {
  if (kind === "recommendation_outcome_evaluation") {
    return "outcome_evaluation";
  }
  if (
    kind === "execution_ready_opportunity_monitoring" ||
    kind === "open_position_monitoring" ||
    kind === "stop_exit_monitoring"
  ) {
    return "execution_ready_opportunity_monitoring";
  }
  if (
    kind === "hot_candidate_monitoring" ||
    kind === "dynamic_movers_discovery" ||
    kind === "failed_stale_data_recovery"
  ) {
    return "hot_candidate_monitoring";
  }
  if (kind === "recommendation_validation") {
    return "recommendation_validation";
  }
  if (kind === "warm_universe_refresh" || kind === "broad_universe_refresh") {
    return "broad_universe_refresh";
  }
  return "background_learning_historical_sampling";
}

function adaptJobs(input: {
  budget_plan: ContinuousIntelligenceBudgetPlan;
  shadow_enabled: boolean;
}) {
  const providerState = providerStateFromPlan(input.budget_plan);
  const layerMetadata = new Map(
    input.budget_plan.rest_layers.map((layer) => [layer.layer, layer]),
  );
  const missingDemandMetadata = new Set(
    input.budget_plan.demand.missing_demand_metadata_workloads,
  );
  return input.budget_plan.workloads.map<RollingRestCollectorJob>((workload) => {
    const layer = layerMetadata.get(workload.rest_layer);
    const demandMetadataAvailable = !missingDemandMetadata.has(
      workload.workload_id,
    );
    const interval: string | null = null;
    const requestedTimeRange = {
      start: null,
      end: null,
      analysis_cutoff: null,
    };
    const executableCredits =
      workload.allocated_symbols.length > 0 && interval !== null
        ? workload.allocated_credits
        : 0;
    const deferReason =
      workload.kind === "execution_ready_opportunity_monitoring" &&
      !demandMetadataAvailable
        ? "missing_execution_ready_metadata"
        : workload.defer_reasons[0] ??
      (executableCredits === 0 && workload.allocated_symbols.length === 0
        ? "no_concrete_ticker_demand"
        : interval === null
          ? "unresolved_request_interval"
          : null);
    return {
      contract_version: rollingRestCollectorContractVersion,
      job_id: `rolling_rest_shadow_${workload.workload_id}`,
      planner_version: input.budget_plan.plan_version,
      source_workload_id: workload.workload_id,
      source_workload_kind: workload.kind,
      workload_class: workloadClass(workload.kind),
      priority: workload.priority,
      rest_layer: workload.rest_layer,
      requested_symbols: workload.requested_symbols,
      allocated_symbols: workload.allocated_symbols,
      deferred_symbols: workload.deferred_symbols,
      websocket_symbols: input.budget_plan.websocket_hot_set.assignments
        .filter((assignment) => assignment.workload_id === workload.workload_id)
        .map((assignment) => assignment.symbol),
      interval,
      requested_time_range: requestedTimeRange,
      planner_requested_credits: workload.requested_credits,
      planner_allocated_credits: workload.allocated_credits,
      planner_deferred_credits: workload.deferred_credits,
      planner_defer_reasons: workload.defer_reasons,
      executable_credits: executableCredits,
      defer_reason: deferReason,
      shard_index: 0,
      shard_count: layer?.shard_count ?? 0,
      shard_size: layer?.shard_size ?? 0,
      cache_first: true,
      provider_call_allowed: providerAllowed({
        shadow_enabled: input.shadow_enabled,
        provider_state: providerState,
        defer_reason: workload.defer_reasons[0] ?? null,
        executable_credits: executableCredits,
        ticker_count: workload.allocated_symbols.length,
        interval,
      }),
      shadow_only: true,
      demand_source: workload.demand_source,
      demand_metadata_available: demandMetadataAvailable,
    };
  });
}

function emptyAudit(): RollingRestCollectorRuntimeAudit {
  return {
    jobs_cache_checked: 0,
    jobs_provider_executed: 0,
    jobs_cache_satisfied: 0,
    jobs_partially_satisfied: 0,
    cache_hits: 0,
    cache_misses: 0,
    cache_partial_hits: 0,
    provider_calls_attempted: 0,
    provider_calls_succeeded: 0,
    provider_calls_failed: 0,
    candles_returned: 0,
    candles_valid: 0,
    candles_invalid: 0,
    actual_credits: 0,
    timeout_count: 0,
  };
}

function mergeAudit(
  left: RollingRestCollectorRuntimeAudit,
  right?: Partial<RollingRestCollectorRuntimeAudit> | null,
) {
  if (!right) {
    return left;
  }
  const merged = { ...left };
  for (const key of Object.keys(merged) as Array<keyof RollingRestCollectorRuntimeAudit>) {
    merged[key] += right[key] ?? 0;
  }
  return merged;
}

export function buildRollingRestCollectorShadowSummary(input: {
  budget_plan: ContinuousIntelligenceBudgetPlan;
  shadow_mode_enabled?: boolean | string | null;
  now?: Date | string | null;
  cache_snapshot?: {
    cache_size: number;
    stale_entry_count: number;
    max_entries: number;
    ttl_ms: number;
  } | null;
  runtime_audit?: Partial<RollingRestCollectorRuntimeAudit> | null;
  in_flight_joins?: number | null;
}): RollingRestCollectorShadowSummary {
  const shadowEnabled = isContinuousIntelligenceShadowCollectorEnabled(
    input.shadow_mode_enabled,
  );
  const jobs = adaptJobs({
    budget_plan: input.budget_plan,
    shadow_enabled: shadowEnabled,
  });
  const cacheSnapshot = input.cache_snapshot ?? {
    cache_size: 0,
    stale_entry_count: 0,
    max_entries: 500,
    ttl_ms: 5 * 60_000,
  };
  const audit = mergeAudit(emptyAudit(), input.runtime_audit);
  const providerExecuted = audit.jobs_provider_executed;
  const status: RollingRestCollectorStatus =
    !shadowEnabled || audit.jobs_cache_checked === 0
      ? "planning_only"
      : providerExecuted > 0 || audit.jobs_cache_satisfied > 0
        ? "shadow_runtime_observed"
        : "planning_only";

  return {
    contract_version: rollingRestCollectorContractVersion,
    collector_version: rollingRestCollectorContractVersion,
    cache_version: sharedCandleCacheContractVersion,
    budget_plan_contract: input.budget_plan.contract,
    budget_plan_version: input.budget_plan.plan_version,
    status,
    shadow_mode_enabled: shadowEnabled,
    feature_flag: continuousIntelligenceShadowCollectorFlagName,
    generated_at: dateIso(input.now),
    session: input.budget_plan.session,
    degradation_level: input.budget_plan.degradation_level,
    provider_state: providerStateFromPlan(input.budget_plan),
    policy: input.budget_plan.policy,
    allocation: input.budget_plan.allocation,
    jobs,
    diagnostics: {
      jobs_planned: jobs.length,
      jobs_cache_checked: audit.jobs_cache_checked,
      jobs_provider_executed: audit.jobs_provider_executed,
      jobs_cache_satisfied: audit.jobs_cache_satisfied,
      jobs_partially_satisfied: audit.jobs_partially_satisfied,
      jobs_deferred: jobs.filter((item) => item.defer_reason !== null).length,
      cache_hits: audit.cache_hits,
      cache_misses: audit.cache_misses,
      cache_partial_hits: audit.cache_partial_hits,
      in_flight_joins: input.in_flight_joins ?? 0,
      provider_calls_attempted: audit.provider_calls_attempted,
      provider_calls_succeeded: audit.provider_calls_succeeded,
      provider_calls_failed: audit.provider_calls_failed,
      candles_returned: audit.candles_returned,
      candles_valid: audit.candles_valid,
      candles_invalid: audit.candles_invalid,
      planner_requested_credits: jobs.reduce(
        (total, item) => total + item.planner_requested_credits,
        0,
      ),
      planner_allocated_credits: jobs.reduce(
        (total, item) => total + item.planner_allocated_credits,
        0,
      ),
      planner_deferred_credits: jobs.reduce(
        (total, item) => total + item.planner_deferred_credits,
        0,
      ),
      executable_credits: jobs.reduce(
        (total, item) => total + item.executable_credits,
        0,
      ),
      actual_credits: audit.actual_credits,
      top_defer_reasons: countDeferReasons(jobs),
      cache_size: cacheSnapshot.cache_size,
      stale_entry_count: cacheSnapshot.stale_entry_count,
      timeout_count: audit.timeout_count,
      next_action: shadowEnabled
        ? "Review shadow runtime audit before any schedule or live consumer."
        : "Keep the collector in planning-only diagnostics until shadow mode is explicitly enabled.",
    },
    memory_policy: {
      max_cache_entries: cacheSnapshot.max_entries,
      cache_ttl_ms: cacheSnapshot.ttl_ms,
      max_in_flight_entries: 100,
      in_flight_ttl_ms: 30_000,
      serverless_limitations:
        "process-local-shadow-cache-not-durable-or-globally-shared",
    },
    no_effect_boundary: {
      recommendations_changed: false,
      ranking_changed: false,
      confidence_changed: false,
      ai_projection_changed: false,
      execution_changed: false,
      scanner_universe_changed: false,
      official_schedules_changed: false,
      database_writes_executed: false,
      websocket_connections_opened: false,
    },
  };
}

function auditFromCollection(
  result: SharedCandleCacheCollectionResult,
): RollingRestCollectorRuntimeAudit {
  return {
    jobs_cache_checked: 1,
    jobs_provider_executed: result.provider_call_executed ? 1 : 0,
    jobs_cache_satisfied:
      result.cache_lookup.status === "range_hit" && !result.provider_call_executed
        ? 1
        : 0,
    jobs_partially_satisfied:
      result.cache_lookup.status === "partial_hit" ? 1 : 0,
    cache_hits: result.cache_lookup.provenance.hit_count,
    cache_misses: result.cache_lookup.status === "miss" ? 1 : 0,
    cache_partial_hits: result.cache_lookup.status === "partial_hit" ? 1 : 0,
    provider_calls_attempted: result.provider_call_attempted ? 1 : 0,
    provider_calls_succeeded:
      result.provider_result && !result.provider_result.provider_error_category
        ? 1
        : 0,
    provider_calls_failed:
      result.provider_result?.provider_error_category ? 1 : 0,
    candles_returned: result.provider_result?.returned_candle_count ?? 0,
    candles_valid: result.merge_result?.accepted_count ?? 0,
    candles_invalid: result.merge_result?.rejected_count ?? 0,
    actual_credits: result.provider_result?.actual_credits ?? 0,
    timeout_count: result.provider_result?.timeout ? 1 : 0,
  };
}

export function createRollingRestCollectorShadowRuntime(input?: {
  cache?: SharedCandleCache;
  coalescer?: ReturnType<typeof createSharedCandleRequestCoalescer>;
}) {
  const cache =
    input?.cache ??
    createSharedCandleCache({
      max_entries: 500,
      ttl_ms: 5 * 60_000,
    });
  const coalescer = input?.coalescer ?? createSharedCandleRequestCoalescer();
  let audit = emptyAudit();

  return {
    cache,
    coalescer,
    async execute(input: {
      request: SharedCandleCacheRangeRequest;
      provider_state: ContinuousIntelligenceProviderState;
      shadow_mode_enabled: boolean;
      request_id: string;
      requester_id: string;
      provider: (
        request: SharedCandleProviderRequest,
      ) => Promise<SharedCandleProviderResult>;
    }): Promise<SharedCandleCacheCollectionResult> {
      const result = await collectSharedCandlesWithCache({
        cache,
        coalescer,
        request: input.request,
        provider_state: input.provider_state,
        shadow_mode_enabled: input.shadow_mode_enabled,
        request_id: input.request_id,
        requester_id: input.requester_id,
        provider: input.provider,
      });
      audit = mergeAudit(audit, auditFromCollection(result));
      return result;
    },
    snapshotAudit() {
      return {
        runtime_audit: { ...audit },
        cache_snapshot: cache.snapshot(),
        coalescer_snapshot: coalescer.snapshot(),
      };
    },
  };
}

export function createRollingRestCollectorShadowCache() {
  return createSharedCandleCache({
    max_entries: 500,
    ttl_ms: 5 * 60_000,
  });
}
