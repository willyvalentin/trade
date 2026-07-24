import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  boundedShadowCollectorExecutionProofContractVersion,
  boundedShadowCollectorExecutionProofFlagName,
  boundedShadowCollectorExecutionProofLimits,
  buildBoundedShadowCollectorExecutionProofDiagnostics,
  createBoundedShadowCollectorExecutionProofRuntime,
  isBoundedShadowCollectorExecutionProofEnabled,
  normalizeBoundedShadowCollectorProviderMetadataStatus,
  parseBoundedShadowCollectorExecutionProofRequest,
  type BoundedShadowCollectorExecutionProofProviderResult,
} from "../../lib/bounded-shadow-collector-execution-proof";
import { buildContinuousIntelligenceBudgetPlan } from "../../lib/continuous-intelligence-budget-orchestrator";
import { buildContinuousIntelligenceBudgetPlanInput } from "../../lib/continuous-intelligence-budget-plan-input";

const now = "2026-07-21T14:30:00.000Z";
const routePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/route.ts";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function request(ticker = "AAPL") {
  const parsed = parseBoundedShadowCollectorExecutionProofRequest(
    {
      tickers: [ticker],
      interval: "5min",
      start: "2026-07-21T14:00:00.000Z",
      end: "2026-07-21T14:30:00.000Z",
    },
    { now },
  );
  expect(parsed.ok).toBe(true);
  if (!parsed.ok) throw new Error("Expected valid bounded proof request.");
  return parsed.value;
}

function plan(proofTicker: string | null = "AAPL") {
  return buildContinuousIntelligenceBudgetPlan(
    buildContinuousIntelligenceBudgetPlanInput({
      generated_at: now,
      market_phase: "regular",
      is_trading_day: true,
      provider_budget_status: "within_budget",
      active_position_symbols: [],
      visible_recommendation_symbols: [],
      scanner_selected_symbols: [],
      scanner_context_symbols: proofTicker ? [proofTicker] : [],
      dynamic_mover_symbols: [],
      dynamic_movers_status: null,
      dynamic_movers_selected_count: 0,
      outcome_symbols: [],
      pending_outcomes: 0,
      legacy_constraints: {},
    }),
  );
}

function providerResult(
  overrides: Partial<BoundedShadowCollectorExecutionProofProviderResult> = {},
): BoundedShadowCollectorExecutionProofProviderResult {
  return {
    provider: "twelve_data",
    provider_call_count: 1,
    estimated_credits: 1,
    actual_credits: 1,
    provider_outcome: "success",
    provider_status: "available",
    provider_error_category: null,
    fallback_used: false,
    response_structurally_valid: true,
    retry_count: 0,
    rate_limited: false,
    candles: [
      {
        timestamp: Date.parse("2026-07-21T14:05:00.000Z") / 1000,
        open: 99,
        high: 101,
        low: 98,
        close: 100,
        volume: 50,
      },
    ],
    ...overrides,
  };
}

function executionInput(overrides: Partial<{
  provider_configured: boolean;
  provider_metadata_status: "within_budget" | "approaching_limit" | null;
  budget_plan: ReturnType<typeof plan> | null;
  request: ReturnType<typeof request>;
  provider: Parameters<ReturnType<typeof createBoundedShadowCollectorExecutionProofRuntime>["execute"]>[0]["provider"];
  timeout_ms: number;
  execution_feature_enabled: boolean;
}> = {}) {
  return {
    request: overrides.request ?? request(),
    budget_plan:
      "budget_plan" in overrides ? overrides.budget_plan ?? null : plan("AAPL"),
    provider_configured: overrides.provider_configured ?? true,
    provider_metadata_status:
      "provider_metadata_status" in overrides
        ? overrides.provider_metadata_status ?? null
        : "within_budget",
    execution_feature_enabled: overrides.execution_feature_enabled ?? true,
    ticker_input_source: "scanner_context_symbols" as const,
    evaluation_now: now,
    provider: overrides.provider ?? (async () => providerResult()),
    timeout_ms: overrides.timeout_ms,
  };
}

test("Action 568 exposes a POST-only, no-store automation boundary without invoking it", () => {
  const route = read(routePath);
  expect(route).toContain('export const dynamic = "force-dynamic"');
  expect(route).toContain('export const maxDuration = 10');
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).toContain('x-automation-secret');
  expect(route).toContain("},\n      401,");
  expect(route).not.toContain("export async function GET");
  expect(route).toContain(boundedShadowCollectorExecutionProofFlagName);
  expect(route).not.toContain("TURE_CONTINUOUS_INTELLIGENCE_SHADOW_COLLECTOR_ENABLED");
});

test("Action 568 request and enablement gates fail closed before any provider call", async () => {
  const prohibited = parseBoundedShadowCollectorExecutionProofRequest({
    tickers: ["AAPL"],
    interval: "5min",
    start: "2026-07-21T14:00:00.000Z",
    end: "2026-07-21T14:30:00.000Z",
    provider: "other",
  }, { now });
  const tooManyTickers = parseBoundedShadowCollectorExecutionProofRequest({
    tickers: ["AAPL", "MSFT"],
    interval: "5min",
    start: "2026-07-21T14:00:00.000Z",
    end: "2026-07-21T14:30:00.000Z",
  }, { now });
  const unsupportedInterval = parseBoundedShadowCollectorExecutionProofRequest({
    tickers: ["AAPL"],
    interval: "1min",
    start: "2026-07-21T14:00:00.000Z",
    end: "2026-07-21T14:30:00.000Z",
  }, { now });
  const oversizedRange = parseBoundedShadowCollectorExecutionProofRequest({
    tickers: ["AAPL"],
    interval: "5min",
    start: "2026-07-21T13:59:59.999Z",
    end: "2026-07-21T14:30:00.000Z",
  }, { now });
  const invalidTime = parseBoundedShadowCollectorExecutionProofRequest({
    tickers: ["AAPL"],
    interval: "5min",
    start: "not-a-time",
    end: "2026-07-21T14:30:00.000Z",
  }, { now });

  expect(prohibited).toMatchObject({ ok: false, error: "arbitrary_target_input_forbidden" });
  expect(tooManyTickers).toMatchObject({ ok: false, error: "exactly_one_ticker_required" });
  expect(unsupportedInterval).toMatchObject({ ok: false, error: "unsupported_interval" });
  expect(oversizedRange).toMatchObject({ ok: false, error: "time_range_too_large" });
  expect(invalidTime).toMatchObject({ ok: false, error: "invalid_time_range" });
  expect(isBoundedShadowCollectorExecutionProofEnabled(undefined)).toBe(false);
  expect(isBoundedShadowCollectorExecutionProofEnabled("false")).toBe(false);
  expect(isBoundedShadowCollectorExecutionProofEnabled("malformed")).toBe(false);
  expect(isBoundedShadowCollectorExecutionProofEnabled("enabled")).toBe(true);
  expect(normalizeBoundedShadowCollectorProviderMetadataStatus(undefined)).toBeNull();
  expect(normalizeBoundedShadowCollectorProviderMetadataStatus("budget_unknown")).toBeNull();

  let calls = 0;
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  const result = await runtime.execute(executionInput({
    provider_configured: false,
    provider: async () => {
      calls += 1;
      return providerResult();
    },
  }));
  expect(result).toMatchObject({ ok: false, blocker: "provider_not_configured", provider_request_count: 0 });
  expect(calls).toBe(0);
});

test("Action 568 requires an explicit normal-capacity Action 565 planner authorization", async () => {
  const budgetPlan = plan("AAPL");
  expect(budgetPlan.contract).toBe("continuous_intelligence_budget_plan_v1");
  expect(budgetPlan.policy).toMatchObject({
    total_credits: 377,
    hard_reserve_credits: 57,
    normal_planned_max_credits: 320,
  });
  expect(
    budgetPlan.workloads.find(
      (workload) => workload.kind === "execution_ready_opportunity_monitoring",
    ),
  ).toMatchObject({ allocated_credits: 0, demand_source: "missing_runtime_metadata" });

  const normalAuthorization = budgetPlan.workloads.find(
    (workload) =>
      workload.priority === "normal" &&
      workload.protected_capacity === false &&
      workload.allocated_symbols.includes("AAPL"),
  );
  expect(normalAuthorization).toMatchObject({
    workload_id: "normal_broad_universe_refresh",
    allocated_credits: 1,
    demand_source: "runtime_observed",
  });

  let calls = 0;
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  const unresolved = await runtime.execute(executionInput({
    provider_metadata_status: null,
    provider: async () => {
      calls += 1;
      return providerResult();
    },
  }));
  const missingPlan = await runtime.execute(executionInput({
    budget_plan: null,
    provider: async () => {
      calls += 1;
      return providerResult();
    },
  }));
  const totalsOnly = await runtime.execute(executionInput({
    budget_plan: plan(null),
    provider: async () => {
      calls += 1;
      return providerResult();
    },
  }));
  const zeroAllocated = await runtime.execute(executionInput({
    budget_plan: {
      ...budgetPlan,
      workloads: budgetPlan.workloads.map((workload) =>
        workload.workload_id === "normal_broad_universe_refresh"
          ? { ...workload, allocated_credits: 0, allocated_symbols: [] }
          : workload,
      ),
    },
    provider: async () => {
      calls += 1;
      return providerResult();
    },
  }));
  const executionReadyOnly = await runtime.execute(executionInput({
    budget_plan: {
      ...budgetPlan,
      workloads: budgetPlan.workloads.map((workload) => {
        if (workload.workload_id === "normal_broad_universe_refresh") {
          return { ...workload, allocated_credits: 0, allocated_symbols: [] };
        }
        if (workload.kind === "execution_ready_opportunity_monitoring") {
          return { ...workload, allocated_credits: 1, allocated_symbols: ["AAPL"] };
        }
        return workload;
      }),
    },
    provider: async () => {
      calls += 1;
      return providerResult();
    },
  }));
  const protectedNormalWorkload = await runtime.execute(executionInput({
    budget_plan: {
      ...budgetPlan,
      workloads: budgetPlan.workloads.map((workload) =>
        workload.workload_id === "normal_broad_universe_refresh"
          ? { ...workload, protected_capacity: true }
          : workload,
      ),
    },
    provider: async () => {
      calls += 1;
      return providerResult();
    },
  }));
  expect(unresolved).toMatchObject({ ok: false, blocker: "provider_metadata_unresolved" });
  expect(missingPlan).toMatchObject({ ok: false, blocker: "planner_unavailable" });
  expect(totalsOnly).toMatchObject({ ok: false, blocker: "planner_authorization_unavailable" });
  expect(zeroAllocated).toMatchObject({ ok: false, blocker: "planner_authorization_unavailable" });
  expect(executionReadyOnly).toMatchObject({ ok: false, blocker: "planner_authorization_unavailable" });
  expect(protectedNormalWorkload).toMatchObject({ ok: false, blocker: "planner_authorization_unavailable" });
  expect(calls).toBe(0);
});

test("Action 568 blocks otherwise-correct policy totals when planner state is unavailable", async () => {
  const base = plan("AAPL");
  const nonPlanning = structuredClone(base);
  Object.defineProperty(nonPlanning, "status", { value: "active" });
  const providerBlocked = structuredClone(base);
  Object.defineProperty(providerBlocked, "degradation_level", { value: "provider_blocked" });
  const unknownDegradation = structuredClone(base);
  Object.defineProperty(unknownDegradation, "degradation_level", { value: "unknown" });
  let calls = 0;
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  for (const unavailablePlan of [nonPlanning, providerBlocked, unknownDegradation]) {
    const result = await runtime.execute(executionInput({
      budget_plan: unavailablePlan,
      provider: async () => {
        calls += 1;
        return providerResult();
      },
    }));
    expect(result).toMatchObject({ ok: false, blocker: "budget_not_available", provider_request_count: 0 });
  }
  expect(calls).toBe(0);
});

test("Action 568 executes one sanitized injected provider request without cache or downstream effects", async () => {
  let calls = 0;
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  const result = await runtime.execute(executionInput({
    provider: async ({ ticker, interval, start, end }) => {
      calls += 1;
      expect(ticker).toBe("AAPL");
      expect(interval).toBe("5min");
      expect(end.getTime() - start.getTime()).toBeLessThanOrEqual(
        boundedShadowCollectorExecutionProofLimits.max_time_range_ms,
      );
      return providerResult();
    },
  }));

  expect(calls).toBe(1);
  expect(result).toMatchObject({
    ok: true,
    status: "executed",
    planner: {
      contract: "continuous_intelligence_budget_plan_v1",
      hard_reserve_preserved: true,
      authorization: {
        workload_id: "normal_broad_universe_refresh",
        workload_class: "broad_universe_refresh",
        ticker_allocated_by_planner: true,
        proof_executable_credits: 1,
        credit_source: "normal_planned_capacity",
        execution_ready_reserve_consumed: false,
      },
    },
    execution: {
      provider_request_count: 1,
      estimated_credits: 1,
      actual_credits: 1,
      candle_count: 1,
    },
    no_effect_boundary: {
      shared_cache_mutated: false,
      supabase_writes_executed: false,
      recommendation_changes: false,
      ranking_changes: false,
      scanner_changes: false,
      execution_changes: false,
      broker_actions: false,
      schedule_changes: false,
    },
  });
  expect(JSON.stringify(result)).not.toContain('"open":99');
});

test("Action 568 stops after one failing, timed-out, or unsafe provider response", async () => {
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  let failedCalls = 0;
  const failed = await runtime.execute(executionInput({
    provider: async () => {
      failedCalls += 1;
      throw new Error("provider failed");
    },
  }));
  const timeout = await runtime.execute(executionInput({
    timeout_ms: 5,
    provider: ({ signal }) =>
      new Promise((_, reject) => {
        signal.addEventListener("abort", () => reject(new Error("aborted")), {
          once: true,
        });
      }),
  }));
  const invalid = await runtime.execute(executionInput({
    provider: async () => providerResult({ provider_call_count: 2 }),
  }));
  const fallback = await runtime.execute(executionInput({
    provider: async () => providerResult({ fallback_used: true }),
  }));
  const hiddenRetry = await runtime.execute(executionInput({
    provider: async () => providerResult({ retry_count: 1 }),
  }));
  const providerError = await runtime.execute(executionInput({
    provider: async () =>
      providerResult({
        provider_outcome: "provider_error",
        provider_status: "provider_error",
        provider_error_category: "rate_limited",
        rate_limited: true,
        candles: [],
      }),
  }));
  const invalidEmpty = await runtime.execute(executionInput({
    provider: async () =>
      providerResult({
        provider_status: "empty",
        provider_error_category: "upstream_error",
        candles: [],
      }),
  }));
  const providerBlocked = await runtime.execute(executionInput({
    provider: async () =>
      providerResult({
        provider_outcome: "provider_blocked",
        provider_status: "provider_error",
        provider_error_category: "provider_blocked",
        candles: [],
      }),
  }));
  const validEmpty = await runtime.execute(executionInput({
    provider: async () => providerResult({ provider_status: "empty", candles: [] }),
  }));
  expect(failed).toMatchObject({ ok: false, blocker: "provider_failure", provider_request_count: 1 });
  expect(timeout).toMatchObject({ ok: false, blocker: "provider_timeout", provider_request_count: 1 });
  expect(invalid).toMatchObject({ ok: false, blocker: "invalid_provider_response", provider_request_count: 1 });
  expect(fallback).toMatchObject({ ok: false, blocker: "invalid_provider_response", provider_request_count: 1 });
  expect(hiddenRetry).toMatchObject({ ok: false, blocker: "invalid_provider_response", provider_request_count: 1 });
  expect(providerError).toMatchObject({ ok: false, blocker: "invalid_provider_response", provider_request_count: 1 });
  expect(invalidEmpty).toMatchObject({ ok: false, blocker: "invalid_provider_response", provider_request_count: 1 });
  expect(providerBlocked).toMatchObject({ ok: false, blocker: "invalid_provider_response", provider_request_count: 1 });
  expect(validEmpty).toMatchObject({
    ok: true,
    execution: { provider_status_category: "empty", candle_count: 0 },
  });
  expect(failedCalls).toBe(1);
});

test("Action 568 permits only one process-local proof operation and cleans up completed state", async () => {
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  let resolveProvider: (value: BoundedShadowCollectorExecutionProofProviderResult) => void =
    () => {};
  let calls = 0;
  const first = runtime.execute(executionInput({
    provider: async () => {
      calls += 1;
      return new Promise((resolve) => {
        resolveProvider = resolve;
      });
    },
  }));
  await Promise.resolve();
  const duplicate = await runtime.execute(executionInput({ provider: async () => providerResult() }));
  const different = await runtime.execute(executionInput({
    request: request("MSFT"),
    budget_plan: plan("MSFT"),
    provider: async () => providerResult(),
  }));
  expect(duplicate).toMatchObject({ ok: false, blocker: "duplicate_request_in_flight" });
  expect(different).toMatchObject({ ok: false, blocker: "runtime_capacity_unavailable" });
  expect(calls).toBe(1);
  resolveProvider(providerResult());
  await expect(first).resolves.toMatchObject({ ok: true, status: "executed" });
  expect(runtime.snapshot().in_flight_count).toBe(0);
});

test("Action 568 diagnostics are passive and its core has no persistence or cache mutation path", () => {
  const diagnostics = buildBoundedShadowCollectorExecutionProofDiagnostics();
  const source = read("lib/bounded-shadow-collector-execution-proof.ts");
  expect(diagnostics).toMatchObject({
    contract_version: boundedShadowCollectorExecutionProofContractVersion,
    status: "not_observed",
    latest_safe_observed_result: null,
    execution_feature_flag_state: "unknown",
    provider_call_inferred_by_client: false,
    browser_route_invocation: false,
  });
  expect(source).not.toContain("createClient");
  expect(source).not.toContain(".insert(");
  expect(source).not.toContain(".upsert(");
  expect(source).not.toContain("createSharedCandleCache");
  expect(source).not.toContain("collectSharedCandlesWithCache");
  expect(source).not.toContain("localStorage");
});
