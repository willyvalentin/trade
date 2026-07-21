import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceBudgetPlan,
  continuousIntelligenceBudgetPlanJson,
  type ContinuousIntelligenceBudgetPlanInput,
  type ContinuousIntelligenceSession,
  type ContinuousIntelligenceWorkloadDemand,
} from "../../lib/continuous-intelligence-budget-orchestrator";
import {
  buildContinuousIntelligenceBudgetPlanInput,
  classifyContinuousIntelligenceProviderState,
} from "../../lib/continuous-intelligence-budget-plan-input";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function symbols(prefix: string, count: number) {
  return Array.from({ length: count }, (_, index) => `${prefix}${index + 1}`);
}

function baseInput(
  overrides: Partial<ContinuousIntelligenceBudgetPlanInput> = {},
): ContinuousIntelligenceBudgetPlanInput {
  return {
    generated_at: "2026-07-21T12:00:00.000Z",
    session: "regular",
    provider_state: "available",
    workloads: [],
    legacy_constraints: {
      grow_scan_ticker_cap: 25,
      grow_background_scan_cadence_minutes: 10,
      scanner_default_scan_budget: 50,
      scanner_max_scan_budget: 100,
      official_scan_windows_per_day: 3,
      scheduled_scan_cron: "*/15 13-19 * * 1-5",
      scheduled_scan_gate: "morning:inside_scan_window",
      outcome_max_batches: 5,
      outcome_max_snapshots: 10,
      market_data_fetch_mode: "direct Twelve Data fetches with cache:no-store",
      shared_cache_status: "partial intraday retention only",
      dynamic_movers_status: "available",
    },
    ...overrides,
  };
}

function workload(
  workload_id: string,
  priority: ContinuousIntelligenceWorkloadDemand["priority"],
  rest_layer: ContinuousIntelligenceWorkloadDemand["rest_layer"],
  requested_credits: number,
  requested_symbols: string[] = symbols(workload_id.slice(0, 3), requested_credits),
): ContinuousIntelligenceWorkloadDemand {
  return {
    workload_id,
    kind:
      priority === "background"
        ? "historical_backfill"
        : rest_layer === "broad"
          ? "broad_universe_refresh"
          : priority === "critical"
            ? "open_position_monitoring"
            : "recommendation_outcome_evaluation",
    label: workload_id.replaceAll("_", " "),
    priority,
    rest_layer,
    requested_credits,
    requested_symbols,
    websocket_symbols: requested_symbols,
    protected_capacity: priority === "critical",
  };
}

test.describe("Action 565 continuous market intelligence budget orchestrator", () => {
  test("keeps the 377 credit policy, 57 credit reserve, and 320 normal cap visible", () => {
    const plan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        workloads: [
          workload("critical_open_positions", "critical", "hot", 40),
          workload("high_outcomes", "high", "warm", 80),
          workload("normal_universe", "normal", "broad", 180),
          workload("background_backfill", "background", "background", 160),
        ],
      }),
    );

    expect(plan.policy).toMatchObject({
      total_credits: 377,
      hard_reserve_credits: 57,
      normal_planned_max_credits: 320,
      websocket_slot_limit: 8,
      provenance: "product_policy_pending_provider_usage_semantics_verification",
    });
    expect(plan.session_target).toMatchObject({
      session: "regular",
      min_credits: 260,
      max_credits: 300,
    });
    expect(plan.allocation.allocated_credits).toBeLessThanOrEqual(300);
    expect(plan.allocation.allocated_credits).toBeLessThanOrEqual(320);
    expect(plan.allocation.reserved_credits).toBe(57);
    expect(plan.allocation.negative_allocations_present).toBe(false);
    expect(plan.allocation.normal_planned_limit_respected).toBe(true);
    expect(plan.allocation.deferred_credits).toBeGreaterThan(0);
  });

  test("uses deterministic session targets and blocks optimistic unknown-session allocation", () => {
    const expected: Record<ContinuousIntelligenceSession, [number, number]> = {
      premarket: [220, 280],
      regular: [260, 300],
      after_hours: [140, 220],
      overnight: [250, 320],
      weekend_or_holiday: [0, 160],
      unknown: [0, 0],
    };

    for (const [session, [min, max]] of Object.entries(expected)) {
      const plan = buildContinuousIntelligenceBudgetPlan(
        baseInput({
          session: session as ContinuousIntelligenceSession,
          workloads: [workload("normal_universe", "normal", "broad", 25)],
        }),
      );

      expect(plan.session_target.min_credits).toBe(min);
      expect(plan.session_target.max_credits).toBe(max);
      expect(plan.allocation.allocated_credits).toBeLessThanOrEqual(max);
    }

    const unknownPlan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        session: "unknown",
        workloads: [workload("normal_universe", "normal", "broad", 25)],
      }),
    );

    expect(unknownPlan.status).toBe("unknown_capacity");
    expect(unknownPlan.degradation_level).toBe("unknown");
    expect(unknownPlan.allocation.allocated_credits).toBe(0);
    expect(unknownPlan.pause_reasons).toContain("unknown_capacity_metadata");
  });

  test("preempts background work before protected critical and outcome workloads", () => {
    const plan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        workloads: [
          workload("critical_open_positions", "critical", "hot", 30),
          workload("high_outcomes", "high", "warm", 90),
          workload("normal_universe", "normal", "broad", 220),
          workload("background_backfill", "background", "background", 70),
        ],
      }),
    );

    expect(plan.priority_allocation.critical.allocated_credits).toBe(30);
    expect(plan.priority_allocation.high.allocated_credits).toBe(90);
    expect(plan.protected_workloads).toContain("critical_open_positions");
    expect(plan.protected_workloads).toContain("high_outcomes");
    expect(plan.priority_allocation.background.deferred_credits).toBeGreaterThan(0);
    expect(plan.background_queue.items[0].defer_reason).toBe("hard_reserve_protected");
  });

  test("marks provider-blocked plans as non-executable without fabricating capacity", () => {
    const plan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        provider_state: "provider_unavailable",
        workloads: [
          workload("critical_open_positions", "critical", "hot", 8),
          workload("high_outcomes", "high", "warm", 12),
        ],
      }),
    );

    expect(plan.status).toBe("provider_blocked");
    expect(plan.degradation_level).toBe("provider_blocked");
    expect(plan.allocation.allocated_credits).toBe(0);
    expect(plan.pause_reasons).toContain("provider_unavailable");
    expect(plan.websocket_hot_set.assigned_count).toBe(0);
  });

  test("provider-budget status classification fails conservatively", () => {
    expect(classifyContinuousIntelligenceProviderState(null)).toBe("unknown");
    expect(classifyContinuousIntelligenceProviderState(undefined)).toBe("unknown");
    expect(classifyContinuousIntelligenceProviderState("")).toBe("unknown");
    expect(classifyContinuousIntelligenceProviderState("unexpected_status")).toBe(
      "unknown",
    );
    expect(classifyContinuousIntelligenceProviderState("budget_unknown")).toBe(
      "unknown",
    );
    expect(classifyContinuousIntelligenceProviderState("unknown")).toBe("unknown");
    expect(classifyContinuousIntelligenceProviderState("within_budget")).toBe(
      "available",
    );
    expect(classifyContinuousIntelligenceProviderState("approaching_limit")).toBe(
      "available",
    );
    expect(classifyContinuousIntelligenceProviderState("rate_limited")).toBe(
      "provider_unavailable",
    );
    expect(classifyContinuousIntelligenceProviderState("provider_unavailable")).toBe(
      "provider_unavailable",
    );
  });

  test("provider capacity metadata follows the normalized provider state", () => {
    const missingStatusInput = buildContinuousIntelligenceBudgetPlanInput({
      generated_at: "2026-07-21T12:00:00.000Z",
    });
    const unrecognizedStatusInput = buildContinuousIntelligenceBudgetPlanInput({
      generated_at: "2026-07-21T12:00:00.000Z",
      provider_budget_status: "surprisingly_green",
    });
    const withinBudgetInput = buildContinuousIntelligenceBudgetPlanInput({
      generated_at: "2026-07-21T12:00:00.000Z",
      provider_budget_status: "within_budget",
    });
    const rateLimitedInput = buildContinuousIntelligenceBudgetPlanInput({
      generated_at: "2026-07-21T12:00:00.000Z",
      provider_budget_status: "rate_limited",
    });

    expect(missingStatusInput.provider_state).toBe("unknown");
    expect(missingStatusInput.capacity_metadata_available).toBe(false);
    expect(unrecognizedStatusInput.provider_state).toBe("unknown");
    expect(unrecognizedStatusInput.capacity_metadata_available).toBe(false);
    expect(withinBudgetInput.provider_state).toBe("available");
    expect(withinBudgetInput.capacity_metadata_available).toBe(true);
    expect(rateLimitedInput.provider_state).toBe("provider_unavailable");
    expect(rateLimitedInput.capacity_metadata_available).toBe(false);
  });

  test("supports critical-only and unknown-capacity degradation explicitly", () => {
    const criticalOnlyPlan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        degradation_level: "critical_only",
        workloads: [
          workload("critical_open_positions", "critical", "hot", 10),
          workload("high_outcomes", "high", "warm", 15),
          workload("background_backfill", "background", "background", 15),
        ],
      }),
    );

    expect(criticalOnlyPlan.degradation_level).toBe("critical_only");
    expect(criticalOnlyPlan.priority_allocation.critical.allocated_credits).toBe(10);
    expect(criticalOnlyPlan.priority_allocation.high.allocated_credits).toBe(0);
    expect(criticalOnlyPlan.pause_reasons).toContain("higher_priority_work_preempted");

    const unknownCapacityPlan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        capacity_metadata_available: false,
        workloads: [workload("normal_universe", "normal", "broad", 10)],
      }),
    );

    expect(unknownCapacityPlan.status).toBe("unknown_capacity");
    expect(unknownCapacityPlan.degradation_level).toBe("unknown");
    expect(unknownCapacityPlan.allocation.allocated_credits).toBe(0);
    expect(unknownCapacityPlan.pause_reasons).toContain("unknown_capacity_metadata");
  });

  test("does not promote visible recommendations into execution-ready demand", () => {
    const plannerInput = buildContinuousIntelligenceBudgetPlanInput({
      generated_at: "2026-07-21T12:00:00.000Z",
      market_phase: "regular",
      market_day_type: "trading_day",
      is_trading_day: true,
      provider_budget_status: "within_budget",
      active_position_symbols: ["MSFT"],
      visible_recommendation_symbols: ["AAPL", "BAC"],
      scanner_selected_symbols: ["AAPL", "BAC", "CAT"],
      scanner_context_symbols: ["CRM"],
      dynamic_movers_status: "available",
      outcome_symbols: ["JPM"],
      pending_outcomes: 1,
    });
    const executionReadyDemand = plannerInput.workloads?.find(
      (item) => item.kind === "execution_ready_opportunity_monitoring",
    );
    const hotCandidateDemand = plannerInput.workloads?.find(
      (item) => item.kind === "hot_candidate_monitoring",
    );
    const validationDemand = plannerInput.workloads?.find(
      (item) => item.kind === "recommendation_validation",
    );
    const shadowDemand = plannerInput.workloads?.find(
      (item) => item.kind === "continuous_shadow_sampling",
    );
    const plan = buildContinuousIntelligenceBudgetPlan(plannerInput);
    const executionReadyAllocation = plan.workloads.find(
      (item) => item.kind === "execution_ready_opportunity_monitoring",
    );

    expect(executionReadyDemand).toMatchObject({
      requested_symbols: [],
      websocket_symbols: [],
      requested_credits: 0,
      demand_metadata_available: false,
      demand_source: "missing_runtime_metadata",
    });
    expect(executionReadyAllocation).toMatchObject({
      requested_symbols: [],
      allocated_symbols: [],
      demand_source: "missing_runtime_metadata",
      allocation_status: "deferred",
    });
    expect(executionReadyAllocation?.defer_reasons).toContain(
      "missing_execution_ready_metadata",
    );
    expect(hotCandidateDemand?.requested_symbols).toEqual(["AAPL", "BAC"]);
    expect(validationDemand?.requested_symbols).toEqual(["AAPL", "BAC"]);
    expect(shadowDemand?.requested_symbols).toEqual(["AAPL", "BAC"]);
  });

  test("marks background policy-default demand separately from observed runtime demand", () => {
    const plannerInput = buildContinuousIntelligenceBudgetPlanInput({
      generated_at: "2026-07-21T12:00:00.000Z",
      market_phase: "after_hours",
      provider_budget_status: "within_budget",
      scanner_context_symbols: ["AAPL", "MSFT", "NVDA"],
      visible_recommendation_symbols: ["CRM"],
    });
    const plan = buildContinuousIntelligenceBudgetPlan(plannerInput);
    const backgroundAllocations = plan.workloads.filter(
      (item) => item.priority === "background",
    );
    const hotCandidateAllocation = plan.workloads.find(
      (item) => item.kind === "hot_candidate_monitoring",
    );

    expect(backgroundAllocations.length).toBeGreaterThan(0);
    expect(
      backgroundAllocations.every(
        (item) => item.demand_source === "product_policy_default",
      ),
    ).toBe(true);
    expect(hotCandidateAllocation?.demand_source).toBe("runtime_observed");
  });

  test("undefined dynamic-movers status remains missing metadata consistently", () => {
    const plannerInput = buildContinuousIntelligenceBudgetPlanInput({
      generated_at: "2026-07-21T12:00:00.000Z",
      provider_budget_status: "within_budget",
      dynamic_mover_symbols: ["AAPL"],
      dynamic_movers_status: undefined,
      dynamic_movers_selected_count: 1,
    });
    const dynamicMoversDemand = plannerInput.workloads?.find(
      (item) => item.kind === "dynamic_movers_discovery",
    );

    expect(dynamicMoversDemand).toMatchObject({
      demand_metadata_available: false,
      demand_source: "missing_runtime_metadata",
    });
  });

  test("keeps REST layers, shard metadata, and defer reasons explicit", () => {
    const plan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        workloads: [
          workload("hot_positions", "critical", "hot", 6),
          workload("warm_outcomes", "high", "warm", 22),
          workload("broad_universe", "normal", "broad", 60),
          workload("background_backfill", "background", "background", 30),
        ],
      }),
    );

    expect(plan.rest_layers.map((layer) => layer.layer)).toEqual([
      "hot",
      "warm",
      "broad",
      "background",
    ]);
    expect(plan.rest_layers.find((layer) => layer.layer === "hot")).toMatchObject({
      shard_size: 8,
      shard_count: 1,
    });
    expect(plan.rest_layers.find((layer) => layer.layer === "warm")).toMatchObject({
      shard_size: 20,
      shard_count: 2,
    });
    expect(plan.rest_layers.find((layer) => layer.layer === "broad")).toMatchObject({
      shard_size: 50,
      shard_count: 2,
    });
    expect(
      plan.rest_layers.find((layer) => layer.layer === "background")?.refresh_objective,
    ).toContain("residual capacity");
  });

  test("assigns at most eight WebSocket hot-set slots and defers duplicates deterministically", () => {
    const plan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        workloads: [
          {
            ...workload(
              "critical_open_positions",
              "critical",
              "hot",
              4,
              ["AAPL", "MSFT", "NVDA", "TSLA"],
            ),
            kind: "open_position_monitoring",
          },
          {
            ...workload(
              "critical_executions",
              "critical",
              "hot",
              6,
              ["AAPL", "AMD", "BAC", "CAT", "CRM", "JPM"],
            ),
            kind: "execution_ready_opportunity_monitoring",
          },
          {
            ...workload(
              "normal_discovery",
              "normal",
              "broad",
              8,
              ["META", "NFLX", "ORCL", "XOM", "SHOP", "SQ", "UBER", "V"],
            ),
            kind: "dynamic_movers_discovery",
          },
        ],
      }),
    );

    expect(plan.websocket_hot_set.assigned_count).toBe(8);
    expect(plan.websocket_hot_set.assignments.map((item) => item.symbol)).toContain(
      "AAPL",
    );
    expect(
      plan.websocket_hot_set.deferred.some(
        (item) =>
          item.symbol === "AAPL" &&
          item.displacement_or_defer_reason === "duplicate_lower_priority_symbol",
      ),
    ).toBe(true);
    expect(
      plan.websocket_hot_set.deferred.some(
        (item) =>
          item.displacement_or_defer_reason === "websocket_slot_limit_reached",
      ),
    ).toBe(true);
  });

  test("returns stable JSON for equivalent inputs and exposes deterministic horizon views", () => {
    const input = baseInput({
      workloads: [
        workload("normal_universe", "normal", "broad", 3, ["msft", "AAPL", "aapl"]),
      ],
    });
    const first = buildContinuousIntelligenceBudgetPlan(input);
    const second = buildContinuousIntelligenceBudgetPlan({
      ...input,
      workloads: [
        workload("normal_universe", "normal", "broad", 3, ["AAPL", "MSFT"]),
      ],
    });

    expect(continuousIntelligenceBudgetPlanJson(first)).toBe(
      continuousIntelligenceBudgetPlanJson(second),
    );
    expect(first.horizons.next_minute.planning_note).toContain("no timers");
    expect(first.horizons.next_5_minutes.allocated_credits).toBeGreaterThanOrEqual(1);
    expect(first.horizons.next_15_minutes.active_rest_layers).toEqual(["broad"]);
  });

  test("surfaces legacy constraints without changing old budget guards or schedules", () => {
    const plan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        workloads: [workload("normal_universe", "normal", "broad", 10)],
      }),
    );
    const constraintIds = plan.legacy_constraints.map((item) => item.constraint_id);

    expect(constraintIds).toEqual([
      "grow_scan_ticker_cap",
      "grow_background_scan_cadence",
      "scanner_universe_budget_fragmentation",
      "three_official_scan_windows",
      "scheduled_scan_gate",
      "scheduled_outcome_evaluation_limits",
      "market_data_fetch_mode",
      "shared_cache_gap",
      "dynamic_movers_provider_status",
    ]);
    expect(plan.legacy_constraints[0]).toMatchObject({
      observed_value: 25,
      reason_code: "legacy_scan_cap_grow_25",
      mismatch: true,
    });
    expect(read("netlify/functions/scheduled-scan.ts")).toContain(
      'schedule: "*/15 13-19 * * 1-5"',
    );
    expect(read("netlify/functions/scheduled-outcome-evaluation.ts")).toContain(
      'schedule: "*/15 14-21 * * 1-5"',
    );
  });

  test("integrates with Market Diagnostics while preserving the Provider Budget Guard", () => {
    const diagnosticsSource = read("lib/market-diagnostics-console.ts");
    const appSource = read("app/trade-app.tsx");

    expect(diagnosticsSource).toContain("Continuous Intelligence Budget Plan");
    expect(diagnosticsSource).toContain("continuous_intelligence_budget_plan");
    expect(diagnosticsSource).toContain("provider_budget_guard");
    expect(diagnosticsSource).toContain("Provider budget");
    expect(appSource).toContain("buildContinuousIntelligenceBudgetPlanInput");
    expect(appSource).toContain("buildContinuousIntelligenceBudgetPlan");
    expect(appSource).toContain("trade-continuous-intelligence-budget-plan-json");
    expect(appSource).toContain("continuous_intelligence_budget_plan: continuousIntelligenceBudgetPlan");
    expect(appSource).not.toContain(
      'kind: "execution_ready_opportunity_monitoring"',
    );
  });

  test("planner and integration remain planning-only with no runtime side effects", () => {
    const plannerSource = read("lib/continuous-intelligence-budget-orchestrator.ts");
    const adapterSource = read("lib/continuous-intelligence-budget-plan-input.ts");
    const diagnosticsSource = read("lib/market-diagnostics-console.ts");
    const appSource = read("app/trade-app.tsx");

    for (const source of [plannerSource, adapterSource]) {
      expect(source).not.toContain("fetch(");
      expect(source).not.toContain("supabase");
      expect(source).not.toContain("createClient");
      expect(source).not.toContain("new WebSocket");
      expect(source).not.toContain("process.env");
      expect(source).not.toContain("setInterval");
      expect(source).not.toContain("setTimeout");
    }
    expect(appSource).not.toContain("new WebSocket(");
    expect(diagnosticsSource).toContain("no provider calls, WebSocket connections");

    const plan = buildContinuousIntelligenceBudgetPlan(
      baseInput({
        workloads: [workload("normal_universe", "normal", "broad", 10)],
      }),
    );

    expect(plan.no_effect_boundaries).toEqual({
      provider_calls: false,
      websocket_connections: false,
      schedule_changes: false,
      recommendation_publication: false,
      ranking_changes: false,
      execution_changes: false,
      database_writes: false,
      migrations: false,
    });
  });
});
