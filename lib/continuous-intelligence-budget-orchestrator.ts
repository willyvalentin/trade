export type ContinuousIntelligenceSession =
  | "premarket"
  | "regular"
  | "after_hours"
  | "overnight"
  | "weekend_or_holiday"
  | "unknown";

export type ContinuousIntelligencePriority =
  | "critical"
  | "high"
  | "normal"
  | "background";

export type ContinuousIntelligenceRestLayerName =
  | "hot"
  | "warm"
  | "broad"
  | "background";

export type ContinuousIntelligenceDegradationLevel =
  | "normal"
  | "constrained"
  | "critical_only"
  | "provider_blocked"
  | "unknown";

export type ContinuousIntelligenceProviderState =
  | "available"
  | "provider_unavailable"
  | "unknown";

export type ContinuousIntelligenceDeferReason =
  | "hard_reserve_protected"
  | "higher_priority_work_preempted"
  | "session_policy_limit"
  | "no_eligible_capacity"
  | "live_market_priority"
  | "provider_unavailable"
  | "legacy_runtime_boundary"
  | "missing_demand_metadata"
  | "missing_execution_ready_metadata"
  | "websocket_slot_limit_reached"
  | "duplicate_lower_priority_symbol"
  | "unknown_capacity_metadata";

export type ContinuousIntelligenceDemandSource =
  | "runtime_observed"
  | "product_policy_default"
  | "missing_runtime_metadata";

export type ContinuousIntelligenceWorkloadKind =
  | "open_position_monitoring"
  | "stop_exit_monitoring"
  | "execution_ready_opportunity_monitoring"
  | "recommendation_outcome_evaluation"
  | "hot_candidate_monitoring"
  | "recommendation_validation"
  | "failed_stale_data_recovery"
  | "warm_universe_refresh"
  | "broad_universe_refresh"
  | "dynamic_movers_discovery"
  | "continuous_shadow_sampling"
  | "historical_backfill"
  | "ticker_memory_enrichment"
  | "replay"
  | "feature_recomputation"
  | "model_calibration_review_inputs";

export type ContinuousIntelligenceWorkloadDemand = {
  workload_id: string;
  kind: ContinuousIntelligenceWorkloadKind;
  label: string;
  priority: ContinuousIntelligencePriority;
  rest_layer: ContinuousIntelligenceRestLayerName;
  requested_symbols?: string[];
  requested_credits?: number | null;
  websocket_symbols?: string[];
  protected_capacity?: boolean;
  demand_metadata_available?: boolean;
  demand_source?: ContinuousIntelligenceDemandSource;
  refresh_objective?: string;
};

export type ContinuousIntelligenceLegacyConstraintInput = {
  grow_scan_ticker_cap?: number | null;
  grow_background_scan_cadence_minutes?: number | null;
  scanner_default_scan_budget?: number | null;
  scanner_max_scan_budget?: number | null;
  official_scan_windows_per_day?: number | null;
  scheduled_scan_cron?: string | null;
  scheduled_scan_gate?: string | null;
  outcome_max_batches?: number | null;
  outcome_max_snapshots?: number | null;
  market_data_fetch_mode?: string | null;
  shared_cache_status?: string | null;
  dynamic_movers_status?: string | null;
};

export type ContinuousIntelligenceBudgetPolicy = {
  total_credits: 377;
  hard_reserve_credits: 57;
  normal_planned_max_credits: 320;
  websocket_slot_limit: 8;
  provenance:
    "product_policy_pending_provider_usage_semantics_verification";
};

export type ContinuousIntelligenceBudgetPlanInput = {
  generated_at: string;
  session: ContinuousIntelligenceSession;
  provider_state?: ContinuousIntelligenceProviderState;
  capacity_metadata_available?: boolean;
  degradation_level?: ContinuousIntelligenceDegradationLevel | null;
  workloads?: ContinuousIntelligenceWorkloadDemand[];
  legacy_constraints?: ContinuousIntelligenceLegacyConstraintInput;
};

export type ContinuousIntelligenceSessionTarget = {
  session: ContinuousIntelligenceSession;
  min_credits: number;
  max_credits: number;
  policy_note: string;
};

export type ContinuousIntelligenceWorkloadAllocation = {
  workload_id: string;
  kind: ContinuousIntelligenceWorkloadKind;
  label: string;
  priority: ContinuousIntelligencePriority;
  rest_layer: ContinuousIntelligenceRestLayerName;
  requested_symbols: string[];
  allocated_symbols: string[];
  deferred_symbols: string[];
  requested_credits: number;
  allocated_credits: number;
  deferred_credits: number;
  protected_capacity: boolean;
  demand_source: ContinuousIntelligenceDemandSource;
  allocation_status: "allocated" | "partial" | "deferred";
  defer_reasons: ContinuousIntelligenceDeferReason[];
};

export type ContinuousIntelligenceRestLayerPlan = {
  layer: ContinuousIntelligenceRestLayerName;
  eligible_workload_ids: string[];
  requested_symbols: string[];
  allocated_symbols: string[];
  refresh_objective: string;
  estimated_credits: number;
  allocated_credits: number;
  shard_count: number;
  shard_size: number;
  deferred_symbol_count: number;
  defer_or_pause_reason: ContinuousIntelligenceDeferReason | null;
};

export type ContinuousIntelligenceWebSocketAssignment = {
  symbol: string;
  workload_id: string;
  reason: string;
  priority: ContinuousIntelligencePriority;
  rank: number;
  assignment_status: "assigned" | "deferred";
  displacement_or_defer_reason: ContinuousIntelligenceDeferReason | null;
};

export type ContinuousIntelligenceBackgroundQueueItem = {
  workload_id: string;
  label: string;
  priority: ContinuousIntelligencePriority;
  requested_credits: number;
  allocated_credits: number;
  deferred_credits: number;
  defer_reason: ContinuousIntelligenceDeferReason | null;
};

export type ContinuousIntelligenceHorizonPlan = {
  horizon: "next_minute" | "next_5_minutes" | "next_15_minutes";
  allocated_credits: number;
  protected_workload_ids: string[];
  active_rest_layers: ContinuousIntelligenceRestLayerName[];
  websocket_slots_used: number;
  planning_note: string;
};

export type ContinuousIntelligenceLegacyConstraint = {
  constraint_id: string;
  observed_value: string | number | boolean | null;
  expected_continuous_policy: string;
  mismatch: boolean;
  reason_code:
    | "legacy_scan_cap_grow_25"
    | "legacy_grow_background_cadence"
    | "legacy_scanner_budget_fragmentation"
    | "legacy_three_window_model"
    | "legacy_scheduled_scan_gate"
    | "outcome_capacity_protected"
    | "direct_no_store_fetches"
    | "shared_cache_incomplete"
    | "dynamic_movers_provider_status";
};

export type ContinuousIntelligenceBudgetPlan = {
  plan_id: string;
  plan_version: "1.0";
  plan_kind: "continuous_intelligence_budget_plan";
  contract: "continuous_intelligence_budget_plan_v1";
  generated_at: string;
  session: ContinuousIntelligenceSession;
  degradation_level: ContinuousIntelligenceDegradationLevel;
  status: "planning_only" | "provider_blocked" | "unknown_capacity";
  policy: ContinuousIntelligenceBudgetPolicy;
  session_target: ContinuousIntelligenceSessionTarget;
  demand: {
    workload_count: number;
    requested_credits: number;
    requested_symbols: number;
    missing_demand_metadata_workloads: string[];
  };
  allocation: {
    requested_credits: number;
    allocated_credits: number;
    deferred_credits: number;
    reserved_credits: number;
    unused_headroom_credits: number;
    emergency_critical_headroom_credits: number;
    planned_max_credits: number;
    normal_planned_limit_respected: boolean;
    negative_allocations_present: false;
  };
  priority_allocation: Record<
    ContinuousIntelligencePriority,
    {
      requested_credits: number;
      allocated_credits: number;
      deferred_credits: number;
      workload_count: number;
    }
  >;
  workloads: ContinuousIntelligenceWorkloadAllocation[];
  rest_layers: ContinuousIntelligenceRestLayerPlan[];
  websocket_hot_set: {
    slot_limit: 8;
    assigned_count: number;
    deferred_count: number;
    assignments: ContinuousIntelligenceWebSocketAssignment[];
    deferred: ContinuousIntelligenceWebSocketAssignment[];
  };
  background_queue: {
    queued_count: number;
    allocated_credits: number;
    deferred_credits: number;
    items: ContinuousIntelligenceBackgroundQueueItem[];
  };
  horizons: {
    next_minute: ContinuousIntelligenceHorizonPlan;
    next_5_minutes: ContinuousIntelligenceHorizonPlan;
    next_15_minutes: ContinuousIntelligenceHorizonPlan;
  };
  protected_workloads: string[];
  deferred_workloads: string[];
  pause_reasons: ContinuousIntelligenceDeferReason[];
  warnings: string[];
  legacy_constraints: ContinuousIntelligenceLegacyConstraint[];
  no_effect_boundaries: {
    provider_calls: false;
    websocket_connections: false;
    schedule_changes: false;
    recommendation_publication: false;
    ranking_changes: false;
    execution_changes: false;
    database_writes: false;
    migrations: false;
  };
};

const priorityOrder: Record<ContinuousIntelligencePriority, number> = {
  critical: 0,
  high: 1,
  normal: 2,
  background: 3,
};

const restLayerShardSizes: Record<ContinuousIntelligenceRestLayerName, number> = {
  hot: 8,
  warm: 20,
  broad: 50,
  background: 25,
};

const policy: ContinuousIntelligenceBudgetPolicy = {
  total_credits: 377,
  hard_reserve_credits: 57,
  normal_planned_max_credits: 320,
  websocket_slot_limit: 8,
  provenance: "product_policy_pending_provider_usage_semantics_verification",
};

function nonNegativeInteger(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

function uniqueSymbols(symbols: string[] | null | undefined) {
  return Array.from(
    new Set(
      (symbols ?? [])
        .map((symbol) => symbol.trim().toUpperCase())
        .filter((symbol) => symbol.length > 0),
    ),
  ).sort();
}

function sessionTarget(
  session: ContinuousIntelligenceSession,
): ContinuousIntelligenceSessionTarget {
  if (session === "regular") {
    return {
      session,
      min_credits: 260,
      max_credits: 300,
      policy_note: "Regular market prioritizes live observation and outcomes.",
    };
  }

  if (session === "premarket") {
    return {
      session,
      min_credits: 220,
      max_credits: 280,
      policy_note: "Premarket prioritizes discovery and candidate formation.",
    };
  }

  if (session === "after_hours") {
    return {
      session,
      min_credits: 140,
      max_credits: 220,
      policy_note: "After-hours prioritizes outcome completion and data quality.",
    };
  }

  if (session === "overnight") {
    return {
      session,
      min_credits: 250,
      max_credits: 320,
      policy_note:
        "Overnight can use broad background capacity while hard reserve remains visible.",
    };
  }

  if (session === "weekend_or_holiday") {
    return {
      session,
      min_credits: 0,
      max_credits: 160,
      policy_note:
        "Weekend or holiday planning is background-oriented with live-critical work normally inactive.",
    };
  }

  return {
    session,
    min_credits: 0,
    max_credits: 0,
    policy_note: "Unknown session does not permit optimistic provider allocation.",
  };
}

function normalizeWorkload(
  workload: ContinuousIntelligenceWorkloadDemand,
): ContinuousIntelligenceWorkloadDemand & {
  normalized_symbols: string[];
  requested_credit_count: number;
  demand_source: ContinuousIntelligenceDemandSource;
} {
  const normalizedSymbols = uniqueSymbols(workload.requested_symbols);
  const explicitCredits = nonNegativeInteger(workload.requested_credits);
  const requestedCredits =
    explicitCredits > 0 ? explicitCredits : normalizedSymbols.length;

  return {
    ...workload,
    normalized_symbols: normalizedSymbols,
    requested_credit_count: requestedCredits,
    demand_source: workload.demand_source ?? "runtime_observed",
  };
}

function derivedDegradationLevel(input: {
  providerState: ContinuousIntelligenceProviderState;
  capacityMetadataAvailable: boolean;
  unknownSession: boolean;
  requested: number;
  plannedCap: number;
  supplied: ContinuousIntelligenceDegradationLevel | null | undefined;
}) {
  if (input.supplied) return input.supplied;
  if (input.providerState === "provider_unavailable") return "provider_blocked";
  if (input.unknownSession) return "unknown";
  if (!input.capacityMetadataAvailable) return "unknown";
  if (input.requested > input.plannedCap) return "constrained";
  return "normal";
}

function executableCap(input: {
  degradation: ContinuousIntelligenceDegradationLevel;
  target: ContinuousIntelligenceSessionTarget;
}) {
  if (input.degradation === "provider_blocked" || input.degradation === "unknown") {
    return 0;
  }

  if (input.degradation === "critical_only") {
    return Math.min(input.target.max_credits, policy.normal_planned_max_credits);
  }

  return Math.min(input.target.max_credits, policy.normal_planned_max_credits);
}

function allocationReason(input: {
  degradation: ContinuousIntelligenceDegradationLevel;
  remaining: number;
  priority: ContinuousIntelligencePriority;
  kind: ContinuousIntelligenceWorkloadKind;
  metadataAvailable: boolean;
  target: ContinuousIntelligenceSessionTarget;
}): ContinuousIntelligenceDeferReason {
  if (input.degradation === "provider_blocked") return "provider_unavailable";
  if (input.degradation === "unknown") return "unknown_capacity_metadata";
  if (!input.metadataAvailable) {
    return input.kind === "execution_ready_opportunity_monitoring"
      ? "missing_execution_ready_metadata"
      : "missing_demand_metadata";
  }
  if (input.degradation === "critical_only" && input.priority !== "critical") {
    return "higher_priority_work_preempted";
  }
  if (input.target.max_credits === 0) return "session_policy_limit";
  if (input.remaining <= 0) return "hard_reserve_protected";
  return "no_eligible_capacity";
}

function allocateWorkloads(input: {
  workloads: ReturnType<typeof normalizeWorkload>[];
  cap: number;
  degradation: ContinuousIntelligenceDegradationLevel;
  target: ContinuousIntelligenceSessionTarget;
}) {
  let remaining = input.cap;

  return input.workloads
    .slice()
    .sort(
      (left, right) =>
        priorityOrder[left.priority] - priorityOrder[right.priority] ||
        left.workload_id.localeCompare(right.workload_id),
    )
    .map((workload): ContinuousIntelligenceWorkloadAllocation => {
      const metadataAvailable = workload.demand_metadata_available !== false;
      const allowedByCriticalOnly =
        input.degradation !== "critical_only" || workload.priority === "critical";
      const executable =
        input.degradation !== "provider_blocked" &&
        input.degradation !== "unknown" &&
        metadataAvailable &&
        allowedByCriticalOnly;
      const allocatedCredits = executable
        ? Math.min(workload.requested_credit_count, remaining)
        : 0;
      remaining = Math.max(0, remaining - allocatedCredits);
      const deferredCredits = Math.max(
        0,
        workload.requested_credit_count - allocatedCredits,
      );
      const allocatedSymbolCount =
        workload.requested_credit_count > 0 && workload.normalized_symbols.length > 0
          ? Math.min(workload.normalized_symbols.length, allocatedCredits)
          : workload.normalized_symbols.length;
      const allocatedSymbols = workload.normalized_symbols.slice(0, allocatedSymbolCount);
      const deferredSymbols = workload.normalized_symbols.slice(allocatedSymbolCount);
      const deferReasons =
        deferredCredits > 0 || !executable
          ? [
              allocationReason({
                degradation: input.degradation,
                remaining,
                priority: workload.priority,
                kind: workload.kind,
                metadataAvailable,
                target: input.target,
              }),
            ]
          : [];

      return {
        workload_id: workload.workload_id,
        kind: workload.kind,
        label: workload.label,
        priority: workload.priority,
        rest_layer: workload.rest_layer,
        requested_symbols: workload.normalized_symbols,
        allocated_symbols: allocatedSymbols,
        deferred_symbols: deferredSymbols,
        requested_credits: workload.requested_credit_count,
        allocated_credits: allocatedCredits,
        deferred_credits: deferredCredits,
        protected_capacity:
          Boolean(workload.protected_capacity) ||
          workload.priority === "critical" ||
          workload.kind === "recommendation_outcome_evaluation",
        demand_source: workload.demand_source,
        allocation_status:
          !executable
            ? "deferred"
            : allocatedCredits === 0 && workload.requested_credit_count > 0
            ? "deferred"
            : deferredCredits > 0
              ? "partial"
              : "allocated",
        defer_reasons: deferReasons,
      };
    });
}

function buildRestLayers(
  allocations: ContinuousIntelligenceWorkloadAllocation[],
): ContinuousIntelligenceRestLayerPlan[] {
  const objectives: Record<ContinuousIntelligenceRestLayerName, string> = {
    hot: "Refresh live-critical and execution-ready intelligence first.",
    warm: "Refresh high-priority candidates, validation, and outcomes.",
    broad: "Refresh broad universe and dynamic discovery when capacity remains.",
    background: "Use residual capacity for research, replay, enrichment, and recomputation.",
  };

  return (["hot", "warm", "broad", "background"] as const).map((layer) => {
    const layerAllocations = allocations.filter((item) => item.rest_layer === layer);
    const requestedSymbols = uniqueSymbols(
      layerAllocations.flatMap((item) => item.requested_symbols),
    );
    const allocatedSymbols = uniqueSymbols(
      layerAllocations.flatMap((item) => item.allocated_symbols),
    );
    const estimatedCredits = layerAllocations.reduce(
      (sum, item) => sum + item.requested_credits,
      0,
    );
    const allocatedCredits = layerAllocations.reduce(
      (sum, item) => sum + item.allocated_credits,
      0,
    );
    const deferredReasons = layerAllocations.flatMap((item) => item.defer_reasons);
    const shardSize = restLayerShardSizes[layer];

    return {
      layer,
      eligible_workload_ids: layerAllocations.map((item) => item.workload_id).sort(),
      requested_symbols: requestedSymbols,
      allocated_symbols: allocatedSymbols,
      refresh_objective: objectives[layer],
      estimated_credits: estimatedCredits,
      allocated_credits: allocatedCredits,
      shard_count:
        allocatedSymbols.length > 0 ? Math.ceil(allocatedSymbols.length / shardSize) : 0,
      shard_size: shardSize,
      deferred_symbol_count: Math.max(0, requestedSymbols.length - allocatedSymbols.length),
      defer_or_pause_reason: deferredReasons[0] ?? null,
    };
  });
}

function websocketCandidates(workloads: ReturnType<typeof normalizeWorkload>[]) {
  return workloads
    .flatMap((workload) => {
      const symbols = uniqueSymbols(workload.websocket_symbols ?? workload.requested_symbols);
      return symbols.map((symbol) => ({
        symbol,
        workload_id: workload.workload_id,
        reason: workload.label,
        priority: workload.priority,
        priority_order: priorityOrder[workload.priority],
        kind: workload.kind,
      }));
    })
    .sort(
      (left, right) =>
        left.priority_order - right.priority_order ||
        websocketKindOrder(left.kind) - websocketKindOrder(right.kind) ||
        left.symbol.localeCompare(right.symbol) ||
        left.workload_id.localeCompare(right.workload_id),
    );
}

function websocketKindOrder(kind: ContinuousIntelligenceWorkloadKind) {
  if (kind === "open_position_monitoring" || kind === "stop_exit_monitoring") {
    return 0;
  }
  if (kind === "execution_ready_opportunity_monitoring") return 1;
  if (kind === "hot_candidate_monitoring") return 2;
  if (kind === "recommendation_validation") return 3;
  if (kind === "dynamic_movers_discovery") return 4;
  return 5;
}

function buildWebSocketHotSet(input: {
  workloads: ReturnType<typeof normalizeWorkload>[];
  degradation: ContinuousIntelligenceDegradationLevel;
}) {
  const assigned: ContinuousIntelligenceWebSocketAssignment[] = [];
  const deferred: ContinuousIntelligenceWebSocketAssignment[] = [];
  const seen = new Set<string>();

  for (const candidate of websocketCandidates(input.workloads)) {
    const rank = assigned.length + deferred.length + 1;

    if (input.degradation === "provider_blocked" || input.degradation === "unknown") {
      deferred.push({
        symbol: candidate.symbol,
        workload_id: candidate.workload_id,
        reason: candidate.reason,
        priority: candidate.priority,
        rank,
        assignment_status: "deferred",
        displacement_or_defer_reason:
          input.degradation === "provider_blocked"
            ? "provider_unavailable"
            : "unknown_capacity_metadata",
      });
      continue;
    }

    if (seen.has(candidate.symbol)) {
      deferred.push({
        symbol: candidate.symbol,
        workload_id: candidate.workload_id,
        reason: candidate.reason,
        priority: candidate.priority,
        rank,
        assignment_status: "deferred",
        displacement_or_defer_reason: "duplicate_lower_priority_symbol",
      });
      continue;
    }

    seen.add(candidate.symbol);

    if (assigned.length >= policy.websocket_slot_limit) {
      deferred.push({
        symbol: candidate.symbol,
        workload_id: candidate.workload_id,
        reason: candidate.reason,
        priority: candidate.priority,
        rank,
        assignment_status: "deferred",
        displacement_or_defer_reason: "websocket_slot_limit_reached",
      });
      continue;
    }

    assigned.push({
      symbol: candidate.symbol,
      workload_id: candidate.workload_id,
      reason: candidate.reason,
      priority: candidate.priority,
      rank,
      assignment_status: "assigned",
      displacement_or_defer_reason: null,
    });
  }

  return {
    slot_limit: policy.websocket_slot_limit,
    assigned_count: assigned.length,
    deferred_count: deferred.length,
    assignments: assigned,
    deferred,
  } satisfies ContinuousIntelligenceBudgetPlan["websocket_hot_set"];
}

function priorityAllocation(
  allocations: ContinuousIntelligenceWorkloadAllocation[],
) {
  return Object.fromEntries(
    (["critical", "high", "normal", "background"] as const).map((priority) => {
      const items = allocations.filter((item) => item.priority === priority);
      return [
        priority,
        {
          requested_credits: items.reduce((sum, item) => sum + item.requested_credits, 0),
          allocated_credits: items.reduce((sum, item) => sum + item.allocated_credits, 0),
          deferred_credits: items.reduce((sum, item) => sum + item.deferred_credits, 0),
          workload_count: items.length,
        },
      ];
    }),
  ) as ContinuousIntelligenceBudgetPlan["priority_allocation"];
}

function backgroundQueue(
  allocations: ContinuousIntelligenceWorkloadAllocation[],
): ContinuousIntelligenceBudgetPlan["background_queue"] {
  const items = allocations
    .filter((item) => item.priority === "background")
    .map((item) => ({
      workload_id: item.workload_id,
      label: item.label,
      priority: item.priority,
      requested_credits: item.requested_credits,
      allocated_credits: item.allocated_credits,
      deferred_credits: item.deferred_credits,
      defer_reason: item.defer_reasons[0] ?? null,
    }));

  return {
    queued_count: items.length,
    allocated_credits: items.reduce((sum, item) => sum + item.allocated_credits, 0),
    deferred_credits: items.reduce((sum, item) => sum + item.deferred_credits, 0),
    items,
  };
}

function horizonPlan(
  horizon: ContinuousIntelligenceHorizonPlan["horizon"],
  allocations: ContinuousIntelligenceWorkloadAllocation[],
  layers: ContinuousIntelligenceRestLayerPlan[],
  websocketSlots: number,
): ContinuousIntelligenceHorizonPlan {
  const protectedWorkloads = allocations
    .filter((item) => item.protected_capacity && item.allocated_credits > 0)
    .map((item) => item.workload_id)
    .sort();
  const activeLayers = layers
    .filter((item) => item.allocated_credits > 0)
    .map((item) => item.layer);
  const divisor =
    horizon === "next_minute" ? 15 : horizon === "next_5_minutes" ? 3 : 1;

  return {
    horizon,
    allocated_credits: Math.ceil(
      allocations.reduce((sum, item) => sum + item.allocated_credits, 0) / divisor,
    ),
    protected_workload_ids: protectedWorkloads,
    active_rest_layers: activeLayers,
    websocket_slots_used: websocketSlots,
    planning_note:
      "Deterministic view over the same allocation plan; no timers or schedules are created.",
  };
}

function legacyConstraints(
  input: ContinuousIntelligenceLegacyConstraintInput | undefined,
): ContinuousIntelligenceLegacyConstraint[] {
  const legacy = input ?? {};

  return [
    {
      constraint_id: "grow_scan_ticker_cap",
      observed_value: legacy.grow_scan_ticker_cap ?? 25,
      expected_continuous_policy:
        "Central continuous planner must allocate from explicit demand before runtime caps change.",
      mismatch: true,
      reason_code: "legacy_scan_cap_grow_25",
    },
    {
      constraint_id: "grow_background_scan_cadence",
      observed_value: `${legacy.grow_background_scan_cadence_minutes ?? 10} minutes`,
      expected_continuous_policy:
        "Background cadence remains a legacy scan-oriented assumption until rolling collection exists.",
      mismatch: true,
      reason_code: "legacy_grow_background_cadence",
    },
    {
      constraint_id: "scanner_universe_budget_fragmentation",
      observed_value: `default ${legacy.scanner_default_scan_budget ?? 50} / max ${legacy.scanner_max_scan_budget ?? 100}`,
      expected_continuous_policy:
        "Scanner universe limits remain visible legacy assumptions, not the new global truth.",
      mismatch: true,
      reason_code: "legacy_scanner_budget_fragmentation",
    },
    {
      constraint_id: "three_official_scan_windows",
      observed_value: legacy.official_scan_windows_per_day ?? 3,
      expected_continuous_policy:
        "Morning, Midday, and Power Hour may remain labels/checkpoints but not product gates.",
      mismatch: true,
      reason_code: "legacy_three_window_model",
    },
    {
      constraint_id: "scheduled_scan_gate",
      observed_value:
        legacy.scheduled_scan_gate ??
        "netlify every 15m, official scans still gated by day-trade windows",
      expected_continuous_policy:
        "Continuous intelligence will require future rolling collection; Action 565 does not alter schedules.",
      mismatch: true,
      reason_code: "legacy_scheduled_scan_gate",
    },
    {
      constraint_id: "scheduled_outcome_evaluation_limits",
      observed_value: `max_batches ${legacy.outcome_max_batches ?? 5} / max_snapshots ${legacy.outcome_max_snapshots ?? 10}`,
      expected_continuous_policy:
        "Outcome evaluation is protected high-priority capacity and cannot be starved.",
      mismatch: false,
      reason_code: "outcome_capacity_protected",
    },
    {
      constraint_id: "market_data_fetch_mode",
      observed_value: legacy.market_data_fetch_mode ?? "direct Twelve Data fetch cache:no-store",
      expected_continuous_policy:
        "Shared request-budget and dedupe orchestration are deferred to Action 566.",
      mismatch: true,
      reason_code: "direct_no_store_fetches",
    },
    {
      constraint_id: "shared_cache_gap",
      observed_value: legacy.shared_cache_status ?? "best_effort_memory_and_partial_persistence",
      expected_continuous_policy:
        "Do not claim a complete shared candle cache until Action 566 implements it.",
      mismatch: true,
      reason_code: "shared_cache_incomplete",
    },
    {
      constraint_id: "dynamic_movers_provider_status",
      observed_value: legacy.dynamic_movers_status ?? "unknown",
      expected_continuous_policy:
        "Dynamic movers can inform demand only when explicitly supplied.",
      mismatch: (legacy.dynamic_movers_status ?? "unknown") !== "ready",
      reason_code: "dynamic_movers_provider_status",
    },
  ];
}

function warningList(input: {
  degradation: ContinuousIntelligenceDegradationLevel;
  missingDemandMetadataWorkloads: string[];
  session: ContinuousIntelligenceSession;
  deferredWorkloads: string[];
}) {
  const warnings: string[] = [
    "Planning only: no provider calls, WebSocket connections, schedule changes, writes, ranking changes, or execution changes are performed.",
    "Product policy values are pending provider usage semantics verification.",
  ];

  if (input.missingDemandMetadataWorkloads.length > 0) {
    warnings.push("Some workloads lack current demand metadata.");
  }

  if (input.session === "unknown") {
    warnings.push("Unknown session prevents optimistic provider allocation.");
  }

  if (input.degradation === "provider_blocked") {
    warnings.push("Provider unavailable state blocks executable provider allocation.");
  }

  if (input.deferredWorkloads.length > 0) {
    warnings.push("One or more workloads were deferred by priority, reserve, or session policy.");
  }

  return warnings;
}

export function buildContinuousIntelligenceBudgetPlan(
  input: ContinuousIntelligenceBudgetPlanInput,
): ContinuousIntelligenceBudgetPlan {
  const target = sessionTarget(input.session);
  const workloads = (input.workloads ?? []).map(normalizeWorkload);
  const requestedCredits = workloads.reduce(
    (sum, workload) => sum + workload.requested_credit_count,
    0,
  );
  const providerState = input.provider_state ?? "available";
  const capacityMetadataAvailable = input.capacity_metadata_available !== false;
  const degradation = derivedDegradationLevel({
    providerState,
    capacityMetadataAvailable,
    unknownSession: input.session === "unknown",
    requested: requestedCredits,
    plannedCap: Math.min(target.max_credits, policy.normal_planned_max_credits),
    supplied: input.degradation_level,
  });
  const cap = executableCap({ degradation, target });
  const allocations = allocateWorkloads({
    workloads,
    cap,
    degradation,
    target,
  });
  const restLayers = buildRestLayers(allocations);
  const websocketHotSet = buildWebSocketHotSet({ workloads, degradation });
  const allocatedCredits = allocations.reduce(
    (sum, item) => sum + item.allocated_credits,
    0,
  );
  const deferredCredits = Math.max(0, requestedCredits - allocatedCredits);
  const missingDemandMetadataWorkloads = workloads
    .filter((workload) => workload.demand_metadata_available === false)
    .map((workload) => workload.workload_id)
    .sort();
  const protectedWorkloads = allocations
    .filter((item) => item.protected_capacity)
    .map((item) => item.workload_id)
    .sort();
  const deferredWorkloads = allocations
    .filter((item) => item.deferred_credits > 0 || item.allocation_status === "deferred")
    .map((item) => item.workload_id)
    .sort();
  const pauseReasons = Array.from(
    new Set(allocations.flatMap((item) => item.defer_reasons)),
  ).sort();
  const background = backgroundQueue(allocations);

  return {
    plan_id: `continuous_intelligence_budget_plan_${input.generated_at}`,
    plan_version: "1.0",
    plan_kind: "continuous_intelligence_budget_plan",
    contract: "continuous_intelligence_budget_plan_v1",
    generated_at: input.generated_at,
    session: input.session,
    degradation_level: degradation,
    status:
      degradation === "provider_blocked"
        ? "provider_blocked"
        : degradation === "unknown"
          ? "unknown_capacity"
          : "planning_only",
    policy,
    session_target: target,
    demand: {
      workload_count: workloads.length,
      requested_credits: requestedCredits,
      requested_symbols: uniqueSymbols(workloads.flatMap((item) => item.normalized_symbols))
        .length,
      missing_demand_metadata_workloads: missingDemandMetadataWorkloads,
    },
    allocation: {
      requested_credits: requestedCredits,
      allocated_credits: allocatedCredits,
      deferred_credits: deferredCredits,
      reserved_credits: policy.hard_reserve_credits,
      unused_headroom_credits: Math.max(
        0,
        policy.normal_planned_max_credits - allocatedCredits,
      ),
      emergency_critical_headroom_credits:
        policy.total_credits - policy.normal_planned_max_credits,
      planned_max_credits: policy.normal_planned_max_credits,
      normal_planned_limit_respected:
        allocatedCredits <= policy.normal_planned_max_credits,
      negative_allocations_present: false,
    },
    priority_allocation: priorityAllocation(allocations),
    workloads: allocations,
    rest_layers: restLayers,
    websocket_hot_set: websocketHotSet,
    background_queue: background,
    horizons: {
      next_minute: horizonPlan(
        "next_minute",
        allocations,
        restLayers,
        websocketHotSet.assigned_count,
      ),
      next_5_minutes: horizonPlan(
        "next_5_minutes",
        allocations,
        restLayers,
        websocketHotSet.assigned_count,
      ),
      next_15_minutes: horizonPlan(
        "next_15_minutes",
        allocations,
        restLayers,
        websocketHotSet.assigned_count,
      ),
    },
    protected_workloads: protectedWorkloads,
    deferred_workloads: deferredWorkloads,
    pause_reasons: pauseReasons,
    warnings: warningList({
      degradation,
      missingDemandMetadataWorkloads,
      session: input.session,
      deferredWorkloads,
    }),
    legacy_constraints: legacyConstraints(input.legacy_constraints),
    no_effect_boundaries: {
      provider_calls: false,
      websocket_connections: false,
      schedule_changes: false,
      recommendation_publication: false,
      ranking_changes: false,
      execution_changes: false,
      database_writes: false,
      migrations: false,
    },
  };
}

export function continuousIntelligenceBudgetPlanJson(
  plan: ContinuousIntelligenceBudgetPlan,
) {
  return JSON.stringify(plan, null, 2);
}
