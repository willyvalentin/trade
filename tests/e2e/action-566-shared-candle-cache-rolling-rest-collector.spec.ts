import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceBudgetPlan,
  type ContinuousIntelligenceBudgetPlan,
  type ContinuousIntelligenceDegradationLevel,
} from "../../lib/continuous-intelligence-budget-orchestrator";
import {
  buildContinuousIntelligenceBudgetPlanInput,
  classifyContinuousIntelligenceProviderState as classifyProviderStateFromRuntimeStatus,
} from "../../lib/continuous-intelligence-budget-plan-input";
import {
  buildRollingRestCollectorShadowSummary,
  createRollingRestCollectorShadowRuntime,
  isContinuousIntelligenceShadowCollectorEnabled,
} from "../../lib/rolling-rest-collector";
import {
  collectSharedCandlesWithCache,
  createSharedCandleCache,
  createSharedCandleRequestCoalescer,
  sharedCandleCacheContractVersion,
  type SharedCandleCacheCandle,
  type SharedCandleProviderRequest,
  type SharedCandleProviderResult,
} from "../../lib/shared-candle-cache";
import fs from "node:fs";

const now = "2026-07-21T14:00:00.000Z";

function plan(
  status: string = "within_budget",
  overrides: Partial<{
    degradation_level: ContinuousIntelligenceDegradationLevel;
    scanner_context_symbols: string[];
    pending_outcomes: number;
  }> = {},
): ContinuousIntelligenceBudgetPlan {
  const input = buildContinuousIntelligenceBudgetPlanInput({
    generated_at: now,
    market_phase: "regular",
    is_trading_day: true,
    provider_budget_status: status,
    active_position_symbols: [],
    visible_recommendation_symbols: ["AAPL", "MSFT", "AAPL"],
    scanner_selected_symbols: ["AAPL", "CAT", "MSFT", "NVDA"],
    scanner_context_symbols: overrides.scanner_context_symbols ?? ["JPM", "XOM"],
    dynamic_mover_symbols: ["NVDA"],
    dynamic_movers_status: "ready",
    dynamic_movers_selected_count: 1,
    outcome_symbols: ["AAPL", "MSFT"],
    pending_outcomes: overrides.pending_outcomes ?? 2,
    legacy_constraints: { shared_cache_status: "incomplete" },
  });

  return buildContinuousIntelligenceBudgetPlan({
    ...input,
    degradation_level: overrides.degradation_level ?? input.degradation_level,
  });
}

function candle(
  timestamp: string,
  overrides: Partial<SharedCandleCacheCandle> = {},
): SharedCandleCacheCandle {
  return {
    contract_version: sharedCandleCacheContractVersion,
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "1min",
    timestamp,
    open: 100,
    high: 101,
    low: 99,
    close: 100.5,
    volume: 1000,
    timezone: "America/New_York",
    adjusted: true,
    market_session: "regular",
    fetched_at: now,
    source_request_id: "request-1",
    validation_status: "valid",
    ...overrides,
  };
}

function providerResult(
  request: SharedCandleProviderRequest,
  candles: SharedCandleCacheCandle[],
): SharedCandleProviderResult {
  return {
    provider_attempted: true,
    provider_call_count: 1,
    requested_ticker_count: 1,
    returned_candle_count: candles.length,
    response_latency_ms: 12,
    timeout: false,
    rate_limit: false,
    provider_error_category: null,
    estimated_credits: 1,
    actual_credits: 1,
    candles: candles.map((item) => ({
      ...item,
      source_request_id: request.request_id,
    })),
  };
}

test("Action 566 shared cache handles exact hits, partial refreshes, stale refreshes, invalid rejection, sorting, lookahead and eviction", async () => {
  const cache = createSharedCandleCache({ max_entries: 3, ttl_ms: 60_000 });
  cache.merge([
    candle("2026-07-21T13:30:00.000Z"),
    candle("2026-07-21T13:32:00.000Z"),
    candle("2026-07-21T13:31:00.000Z"),
    candle("2026-07-21T13:31:00.000Z"),
    candle("2026-07-21T13:33:00.000Z", { high: 98, low: 99 }),
    candle("2026-07-21T13:40:00.000Z"),
  ]);

  const exactHit = cache.lookupExact({
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "1min",
    timestamp: "2026-07-21T13:32:00.000Z",
    timezone: "America/New_York",
    adjusted: true,
  });
  expect(exactHit.status).toBe("exact_hit");

  const partial = cache.lookupRange({
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "1min",
    start: "2026-07-21T13:30:00.000Z",
    end: "2026-07-21T13:32:00.000Z",
    timezone: "America/New_York",
    adjusted: true,
  });
  expect(partial.status).toBe("partial_hit");
  expect(partial.missing_ranges).toEqual([
    { start: "2026-07-21T13:30:00.000Z", end: "2026-07-21T13:30:00.000Z" },
  ]);
  expect(partial.candles.map((item) => item.timestamp)).toEqual([
    "2026-07-21T13:31:00.000Z",
    "2026-07-21T13:32:00.000Z",
  ]);

  const staleCache = createSharedCandleCache({ max_entries: 5, ttl_ms: 60_000 });
  staleCache.merge([
    candle("2026-07-21T13:30:00.000Z", {
      fetched_at: "2026-07-21T13:55:00.000Z",
    }),
  ]);
  const staleLookup = staleCache.lookupRange(
    {
      provider: "twelve_data",
      ticker: "AAPL",
      interval: "1min",
      start: "2026-07-21T13:30:00.000Z",
      end: "2026-07-21T13:30:00.000Z",
      timezone: "America/New_York",
      adjusted: true,
    },
    { now },
  );
  expect(staleLookup.stale_count).toBe(1);

  const lookahead = staleCache.merge(
    [candle("2026-07-21T14:01:00.000Z")],
    { analysis_cutoff: now },
  );
  expect(lookahead.lookahead_rejected_count).toBe(1);

  const snapshot = cache.snapshot();
  expect(snapshot.cache_size).toBeLessThanOrEqual(3);
});

test("Action 566 collector uses cache first, disables provider by default, and can populate only shadow cache when enabled", async () => {
  const cache = createSharedCandleCache({ max_entries: 20, ttl_ms: 60_000 });
  let calls = 0;
  const request = {
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "1min",
    start: "2026-07-21T13:30:00.000Z",
    end: "2026-07-21T13:31:00.000Z",
    timezone: "America/New_York",
    adjusted: true,
    analysis_cutoff: "2026-07-21T13:31:00.000Z",
  };

  const disabled = await collectSharedCandlesWithCache({
    cache,
    request,
    provider_state: "available",
    shadow_mode_enabled: false,
    request_id: "disabled",
    requester_id: "test",
    now,
    provider: async (providerRequest) => {
      calls += 1;
      return providerResult(providerRequest, [
        candle("2026-07-21T13:30:00.000Z"),
      ]);
    },
  });
  expect(disabled.provider_call_attempted).toBe(false);
  expect(disabled.deferred_reason).toBe("shadow_collector_disabled_cache_only");
  expect(calls).toBe(0);

  const enabled = await collectSharedCandlesWithCache({
    cache,
    request,
    provider_state: "available",
    shadow_mode_enabled: true,
    request_id: "enabled",
    requester_id: "test",
    now,
    provider: async (providerRequest) => {
      calls += 1;
      return providerResult(providerRequest, [
        candle("2026-07-21T13:30:00.000Z"),
        candle("2026-07-21T13:31:00.000Z"),
      ]);
    },
  });
  expect(enabled.provider_call_attempted).toBe(true);
  expect(enabled.merge_result?.accepted_count).toBe(2);
  expect(enabled.no_effect_boundary.recommendations_changed).toBe(false);
  expect(cache.snapshot().cache_size).toBe(2);

  const exactCacheHit = await collectSharedCandlesWithCache({
    cache,
    request,
    provider_state: "available",
    shadow_mode_enabled: true,
    request_id: "cache-hit",
    requester_id: "test",
    now,
    provider: async (providerRequest) => {
      calls += 1;
      return providerResult(providerRequest, []);
    },
  });
  expect(exactCacheHit.provider_call_attempted).toBe(false);
  expect(calls).toBe(1);
});

test("Action 566 runtime coalesces concurrent provider requests and cleans failed entries", async () => {
  const runtime = createRollingRestCollectorShadowRuntime({
    cache: createSharedCandleCache({ max_entries: 20, ttl_ms: 60_000 }),
    coalescer: createSharedCandleRequestCoalescer(),
  });
  let calls = 0;
  const request = {
    provider: "twelve_data",
    ticker: "AAPL",
    interval: "1min",
    start: "2026-07-21T13:30:00.000Z",
    end: "2026-07-21T13:30:00.000Z",
    timezone: "America/New_York",
    adjusted: true,
  };
  const operation = (requestId: string) =>
    runtime.execute({
      request,
      provider_state: "available",
      shadow_mode_enabled: true,
      request_id: requestId,
      requester_id: requestId,
      provider: async (providerRequest) => {
        calls += 1;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return providerResult(providerRequest, [
          candle("2026-07-21T13:30:00.000Z"),
        ]);
      },
    });

  const [first, second] = await Promise.all([
    operation("request-a"),
    operation("request-b"),
  ]);
  expect(first.candles).toHaveLength(1);
  expect(second.candles).toHaveLength(1);
  expect(calls).toBe(1);
  expect(runtime.snapshotAudit().coalescer_snapshot.joined_request_count).toBe(1);

  const failingRuntime = createRollingRestCollectorShadowRuntime();
  await expect(
    failingRuntime.execute({
      request,
      provider_state: "available",
      shadow_mode_enabled: true,
      request_id: "failed",
      requester_id: "test",
      provider: async () => {
        throw new Error("provider failed");
      },
    }),
  ).rejects.toThrow("provider failed");
  expect(failingRuntime.snapshotAudit().coalescer_snapshot.in_flight_count).toBe(0);
  expect(
    failingRuntime.snapshotAudit().coalescer_snapshot.entries[0]
      ?.completion_status,
  ).toBe("failed");

  let retryCalls = 0;
  const retried = await failingRuntime.execute({
    request,
    provider_state: "available",
    shadow_mode_enabled: true,
    request_id: "retry",
    requester_id: "test",
    provider: async (providerRequest) => {
      retryCalls += 1;
      return providerResult(providerRequest, [
        candle("2026-07-21T13:30:00.000Z"),
      ]);
    },
  });
  expect(retried.candles).toHaveLength(1);
  expect(retryCalls).toBe(1);
});

test("Action 566 consumes Action 565 budget plan as source of truth", () => {
  expect(isContinuousIntelligenceShadowCollectorEnabled(null)).toBe(false);
  expect(classifyProviderStateFromRuntimeStatus(undefined)).toBe("unknown");
  expect(classifyProviderStateFromRuntimeStatus("budget_unknown")).toBe("unknown");
  expect(classifyProviderStateFromRuntimeStatus("within_budget")).toBe(
    "available",
  );
  expect(classifyProviderStateFromRuntimeStatus("rate_limited")).toBe(
    "provider_unavailable",
  );

  const budgetPlan = plan("within_budget");
  const summary = buildRollingRestCollectorShadowSummary({
    budget_plan: budgetPlan,
    shadow_mode_enabled: null,
    now,
  });
  expect(summary.budget_plan_contract).toBe(
    "continuous_intelligence_budget_plan_v1",
  );
  expect(summary.budget_plan_version).toBe("1.0");
  expect(summary.policy.total_credits).toBe(377);
  expect(summary.policy.hard_reserve_credits).toBe(57);
  expect(summary.policy.normal_planned_max_credits).toBe(320);
  expect(summary.policy.websocket_slot_limit).toBe(8);
  expect(summary.allocation.reserved_credits).toBe(57);
  expect(summary.allocation.planned_max_credits).toBe(320);
  expect(summary.status).toBe("planning_only");
  expect(summary.shadow_mode_enabled).toBe(false);
  expect(summary.diagnostics.provider_calls_attempted).toBe(0);
  expect(summary.diagnostics.jobs_cache_checked).toBe(0);
  expect(summary.diagnostics.jobs_provider_executed).toBe(0);

  const executionReady = summary.jobs.find(
    (item) =>
      item.source_workload_kind === "execution_ready_opportunity_monitoring",
  );
  expect(executionReady?.requested_symbols).toEqual([]);
  expect(executionReady?.allocated_symbols).toEqual([]);
  expect(executionReady?.websocket_symbols).toEqual([]);
  expect(executionReady?.demand_metadata_available).toBe(false);
  expect(executionReady?.defer_reason).toBe("missing_execution_ready_metadata");

  const recommendationValidation = summary.jobs.find(
    (item) => item.source_workload_kind === "recommendation_validation",
  );
  expect(recommendationValidation?.requested_symbols).toEqual(["AAPL", "MSFT"]);
  expect(recommendationValidation?.allocated_symbols).toEqual(["AAPL", "MSFT"]);
  expect(recommendationValidation?.demand_source).toBe("runtime_observed");

  const constrainedPlan = plan("approaching_limit", {
    degradation_level: "constrained",
  });
  const constrained = buildRollingRestCollectorShadowSummary({
    budget_plan: constrainedPlan,
    shadow_mode_enabled: true,
    now,
  });
  expect(constrained.degradation_level).toBe("constrained");
  const broadRefresh = constrained.jobs.find(
    (item) => item.source_workload_kind === "broad_universe_refresh",
  );
  const broadLayer = constrained.jobs.find(
    (item) => item.source_workload_kind === "broad_universe_refresh",
  )?.rest_layer;
  const broadLayerPlan = constrainedPlan.rest_layers.find(
    (item) => item.layer === broadLayer,
  );
  expect(broadRefresh?.shard_index).toBe(0);
  expect(broadRefresh?.shard_count).toBe(broadLayerPlan?.shard_count);
  const historicalBackfill = constrained.jobs.find(
    (item) => item.source_workload_kind === "historical_backfill",
  );
  expect(historicalBackfill?.demand_source).toBe("product_policy_default");

  const criticalOnly = buildRollingRestCollectorShadowSummary({
    budget_plan: plan("over_budget"),
    shadow_mode_enabled: true,
    now,
  });
  expect(criticalOnly.provider_state).toBe("provider_unavailable");
  expect(
    criticalOnly.jobs.find((item) => item.priority === "normal")
      ?.provider_call_allowed,
  ).toBe(false);

  const source = fs.readFileSync("lib/rolling-rest-collector.ts", "utf8");
  expect(source).not.toContain("0.15");
  expect(source).not.toContain("provider_budget_guard_v1_shadow_adapter");
});

test("Action 566 diagnostics distinguish planned, cache-satisfied, partial, provider-executed and deferred jobs", () => {
  const summary = buildRollingRestCollectorShadowSummary({
    budget_plan: plan("within_budget"),
    shadow_mode_enabled: true,
    now,
    runtime_audit: {
      jobs_cache_checked: 3,
      jobs_provider_executed: 1,
      jobs_cache_satisfied: 1,
      jobs_partially_satisfied: 1,
      provider_calls_attempted: 1,
      provider_calls_succeeded: 1,
    },
    in_flight_joins: 2,
  });

  expect(summary.status).toBe("shadow_runtime_observed");
  expect(summary.diagnostics.jobs_planned).toBe(summary.jobs.length);
  expect(summary.diagnostics.jobs_cache_checked).toBe(3);
  expect(summary.diagnostics.jobs_provider_executed).toBe(1);
  expect(summary.diagnostics.jobs_cache_satisfied).toBe(1);
  expect(summary.diagnostics.jobs_partially_satisfied).toBe(1);
  expect(summary.diagnostics.in_flight_joins).toBe(2);

  const planningOnly = buildRollingRestCollectorShadowSummary({
    budget_plan: plan("within_budget"),
    shadow_mode_enabled: true,
    now,
  });
  expect(planningOnly.status).toBe("planning_only");

  const emptyDemand = planningOnly.jobs.find(
    (item) => item.workload_class === "outcome_evaluation",
  );
  expect(emptyDemand?.planner_allocated_credits).toBeGreaterThan(0);
  expect(emptyDemand?.executable_credits).toBe(0);
  expect(emptyDemand?.provider_call_allowed).toBe(false);
});

test("Action 566 diagnostics and documentation expose strict no-effect boundaries", () => {
  const diagnosticsSource = fs.readFileSync("app/trade-app.tsx", "utf8");
  const marketDiagnosticsSource = fs.readFileSync(
    "lib/market-diagnostics-console.ts",
    "utf8",
  );
  const doc = fs.readFileSync(
    "docs/action-566-shared-candle-cache-and-rolling-rest-collector.md",
    "utf8",
  );

  expect(diagnosticsSource).toContain(
    "trade-shared-candle-cache-rolling-rest-collector-json",
  );
  expect(marketDiagnosticsSource).toContain(
    "Shared Candle Cache and Rolling REST Collector",
  );
  expect(marketDiagnosticsSource).toContain(
    "does not affect recommendations, ranking, confidence, AI Projection",
  );
  expect(doc).toContain("process-local memory");
  expect(doc).toContain("Visible recommendation symbols");
  expect(doc).toContain("never promoted into execution-ready");
});
