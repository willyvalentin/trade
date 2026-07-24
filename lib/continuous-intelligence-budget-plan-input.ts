import type {
  ContinuousIntelligenceBudgetPlanInput,
  ContinuousIntelligenceProviderState,
  ContinuousIntelligenceSession,
  ContinuousIntelligenceWorkloadDemand,
} from "@/lib/continuous-intelligence-budget-orchestrator";

export type ContinuousIntelligenceRuntimePlanInput = {
  generated_at: string;
  market_phase?: string | null;
  market_day_type?: string | null;
  is_trading_day?: boolean | null;
  provider_budget_status?: string | null;
  active_position_symbols?: Array<string | null | undefined>;
  visible_recommendation_symbols?: Array<string | null | undefined>;
  scanner_selected_symbols?: Array<string | null | undefined>;
  scanner_context_symbols?: Array<string | null | undefined>;
  dynamic_mover_symbols?: Array<string | null | undefined>;
  dynamic_movers_status?: string | null;
  dynamic_movers_selected_count?: number | null;
  outcome_symbols?: Array<string | null | undefined>;
  pending_outcomes?: number | null;
  missing_candles?: number | null;
  provider_errors?: number | null;
  skipped_due_to_budget_count?: number | null;
  pending_provider_budget_count?: number | null;
  legacy_constraints?: ContinuousIntelligenceBudgetPlanInput["legacy_constraints"];
};

function nonNegativeInteger(value: number | null | undefined) {
  if (typeof value !== "number" || !Number.isFinite(value)) return 0;
  return Math.max(0, Math.round(value));
}

export function normalizeContinuousIntelligenceSymbols(
  values: Array<string | null | undefined>,
) {
  return Array.from(
    new Set(
      values
        .map((value) => value?.trim().toUpperCase() ?? "")
        .filter((value) => value.length > 0),
    ),
  ).sort();
}

export function classifyContinuousIntelligenceSession(input: {
  market_phase?: string | null;
  market_day_type?: string | null;
  is_trading_day?: boolean | null;
}): ContinuousIntelligenceSession {
  if (input.market_day_type === "weekend" || input.market_day_type === "holiday") {
    return "weekend_or_holiday";
  }

  if (input.is_trading_day === false) return "weekend_or_holiday";
  if (input.market_phase === "pre_market") return "premarket";
  if (
    input.market_phase === "regular" ||
    input.market_phase === "power_hour" ||
    input.market_phase === "closing_soon"
  ) {
    return "regular";
  }
  if (input.market_phase === "after_hours") return "after_hours";
  if (input.market_phase === "closed") return "overnight";

  return "unknown";
}

export function classifyContinuousIntelligenceProviderState(
  providerBudgetStatus: string | null | undefined,
): ContinuousIntelligenceProviderState {
  const status = providerBudgetStatus?.trim() ?? "";

  if (
    status === "provider_unavailable" ||
    status === "rate_limited" ||
    status === "over_budget" ||
    status === "disabled"
  ) {
    return "provider_unavailable";
  }

  if (status === "within_budget" || status === "approaching_limit") {
    return "available";
  }

  return "unknown";
}

export function buildContinuousIntelligenceBudgetPlanInput(
  input: ContinuousIntelligenceRuntimePlanInput,
): ContinuousIntelligenceBudgetPlanInput {
  const activePositionSymbols = normalizeContinuousIntelligenceSymbols(
    input.active_position_symbols ?? [],
  );
  const visibleRecommendationSymbols = normalizeContinuousIntelligenceSymbols(
    input.visible_recommendation_symbols ?? [],
  );
  const scannerSelectedSymbols = normalizeContinuousIntelligenceSymbols(
    input.scanner_selected_symbols ?? [],
  );
  const scannerContextSymbols = normalizeContinuousIntelligenceSymbols(
    input.scanner_context_symbols ?? [],
  );
  const dynamicMoverSymbols = normalizeContinuousIntelligenceSymbols(
    input.dynamic_mover_symbols ?? [],
  );
  const outcomeSymbols = normalizeContinuousIntelligenceSymbols([
    ...(input.outcome_symbols ?? []),
    ...visibleRecommendationSymbols,
  ]);
  const recoveryCreditDemand =
    nonNegativeInteger(input.missing_candles) +
    nonNegativeInteger(input.provider_errors) +
    nonNegativeInteger(input.skipped_due_to_budget_count) +
    nonNegativeInteger(input.pending_provider_budget_count);
  const providerState = classifyContinuousIntelligenceProviderState(
    input.provider_budget_status,
  );
  const capacityMetadataAvailable = providerState === "available";
  const dynamicMoversMetadataAvailable =
    typeof input.dynamic_movers_status === "string" &&
    input.dynamic_movers_status.trim().length > 0;
  const workloads: ContinuousIntelligenceWorkloadDemand[] = [
    {
      workload_id: "critical_open_position_monitoring",
      kind: "open_position_monitoring",
      label: "Open-position monitoring",
      priority: "critical",
      rest_layer: "hot",
      requested_symbols: activePositionSymbols,
      websocket_symbols: activePositionSymbols,
      protected_capacity: true,
      demand_source: "runtime_observed",
      refresh_objective: "Keep open-position risk and exit context visible.",
    },
    {
      workload_id: "critical_stop_exit_monitoring",
      kind: "stop_exit_monitoring",
      label: "Stop and exit monitoring",
      priority: "critical",
      rest_layer: "hot",
      requested_symbols: activePositionSymbols,
      websocket_symbols: activePositionSymbols,
      protected_capacity: true,
      demand_source: "runtime_observed",
      refresh_objective: "Reserve first capacity for stop, target, and exit checks.",
    },
    {
      workload_id: "critical_execution_ready_opportunities",
      kind: "execution_ready_opportunity_monitoring",
      label: "Execution-ready opportunity monitoring",
      priority: "critical",
      rest_layer: "hot",
      requested_symbols: [],
      websocket_symbols: [],
      requested_credits: 0,
      protected_capacity: true,
      demand_metadata_available: false,
      demand_source: "missing_runtime_metadata",
      refresh_objective:
        "Execution-ready intelligence requires a future versioned field; visible recommendations are not promoted.",
    },
    {
      workload_id: "high_recommendation_outcome_evaluation",
      kind: "recommendation_outcome_evaluation",
      label: "Recommendation outcome evaluation",
      priority: "high",
      rest_layer: "warm",
      requested_symbols: outcomeSymbols,
      requested_credits: Math.max(
        outcomeSymbols.length,
        nonNegativeInteger(input.pending_outcomes) * 3,
      ),
      protected_capacity: true,
      demand_source: "runtime_observed",
      refresh_objective:
        "Protect 15m, 30m, and 60m outcome completion from broad-refresh starvation.",
    },
    {
      workload_id: "high_hot_candidate_monitoring",
      kind: "hot_candidate_monitoring",
      label: "Hot candidate monitoring",
      priority: "high",
      rest_layer: "hot",
      requested_symbols: visibleRecommendationSymbols,
      websocket_symbols: visibleRecommendationSymbols,
      demand_source: "runtime_observed",
      refresh_objective: "Keep active recommendation candidates fresh.",
    },
    {
      workload_id: "high_recommendation_validation",
      kind: "recommendation_validation",
      label: "Recommendation validation",
      priority: "high",
      rest_layer: "warm",
      requested_symbols: visibleRecommendationSymbols,
      demand_source: "runtime_observed",
      refresh_objective: "Refresh validation context for visible recommendations.",
    },
    {
      workload_id: "high_failed_stale_data_recovery",
      kind: "failed_stale_data_recovery",
      label: "Failed or stale data recovery",
      priority: "high",
      rest_layer: "warm",
      requested_symbols: outcomeSymbols,
      requested_credits: recoveryCreditDemand,
      demand_metadata_available: recoveryCreditDemand > 0,
      demand_source:
        recoveryCreditDemand > 0 ? "runtime_observed" : "missing_runtime_metadata",
      refresh_objective:
        "Prioritize provider errors, missing candles, and budget-delayed retries.",
    },
    {
      workload_id: "normal_warm_universe_refresh",
      kind: "warm_universe_refresh",
      label: "Warm universe refresh",
      priority: "normal",
      rest_layer: "warm",
      requested_symbols: scannerSelectedSymbols,
      demand_source: "runtime_observed",
      refresh_objective: "Maintain a rolling view of the selected scanner universe.",
    },
    {
      workload_id: "normal_broad_universe_refresh",
      kind: "broad_universe_refresh",
      label: "Broad universe refresh",
      priority: "normal",
      rest_layer: "broad",
      requested_symbols: normalizeContinuousIntelligenceSymbols([
        ...scannerSelectedSymbols,
        ...scannerContextSymbols,
      ]),
      demand_source: "runtime_observed",
      refresh_objective: "Plan broad-market observation after protected work.",
    },
    {
      workload_id: "normal_dynamic_movers_discovery",
      kind: "dynamic_movers_discovery",
      label: "Dynamic movers discovery",
      priority: "normal",
      rest_layer: "broad",
      requested_symbols: dynamicMoverSymbols,
      requested_credits:
        dynamicMoverSymbols.length > 0
          ? dynamicMoverSymbols.length
          : nonNegativeInteger(input.dynamic_movers_selected_count),
      demand_metadata_available: dynamicMoversMetadataAvailable,
      demand_source: dynamicMoversMetadataAvailable
        ? "runtime_observed"
        : "missing_runtime_metadata",
      refresh_objective: "Use supplied dynamic movers only when metadata exists.",
    },
    {
      workload_id: "normal_continuous_shadow_sampling",
      kind: "continuous_shadow_sampling",
      label: "Continuous shadow sampling",
      priority: "normal",
      rest_layer: "warm",
      requested_symbols: visibleRecommendationSymbols,
      demand_source: "runtime_observed",
      refresh_objective:
        "Reserve planning capacity for observation-only intelligence experiments.",
    },
    {
      workload_id: "background_historical_backfill",
      kind: "historical_backfill",
      label: "Historical backfill",
      priority: "background",
      rest_layer: "background",
      requested_credits: 24,
      demand_source: "product_policy_default",
      refresh_objective: "Defer historical backfill behind live-critical work.",
    },
    {
      workload_id: "background_ticker_memory_enrichment",
      kind: "ticker_memory_enrichment",
      label: "Ticker memory enrichment",
      priority: "background",
      rest_layer: "background",
      requested_symbols: scannerContextSymbols,
      requested_credits: Math.min(24, scannerContextSymbols.length),
      demand_source: "product_policy_default",
      refresh_objective: "Use leftover budget for ticker memory quality.",
    },
    {
      workload_id: "background_replay",
      kind: "replay",
      label: "Replay",
      priority: "background",
      rest_layer: "background",
      requested_credits: 16,
      demand_source: "product_policy_default",
      refresh_objective: "Replay is queued until live observation has capacity.",
    },
    {
      workload_id: "background_feature_recomputation",
      kind: "feature_recomputation",
      label: "Feature recomputation",
      priority: "background",
      rest_layer: "background",
      requested_credits: 16,
      demand_source: "product_policy_default",
      refresh_objective: "Feature recomputation is background-only in this plan.",
    },
    {
      workload_id: "background_model_calibration_review_inputs",
      kind: "model_calibration_review_inputs",
      label: "Model calibration review inputs",
      priority: "background",
      rest_layer: "background",
      requested_credits: 12,
      demand_source: "product_policy_default",
      refresh_objective:
        "Prepare calibration review inputs without changing projection behavior.",
    },
  ];

  return {
    generated_at: input.generated_at,
    session: classifyContinuousIntelligenceSession({
      market_phase: input.market_phase,
      market_day_type: input.market_day_type,
      is_trading_day: input.is_trading_day,
    }),
    provider_state: providerState,
    capacity_metadata_available: capacityMetadataAvailable,
    workloads,
    legacy_constraints: input.legacy_constraints,
  };
}
