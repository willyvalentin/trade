import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  boundedShadowCollectorExecutionProofPreflightContractVersion,
  boundedShadowCollectorExecutionProofPreflightRouteMarker,
  buildBoundedShadowCollectorExecutionProofDiagnostics,
  buildBoundedShadowCollectorExecutionProofPreflightDiagnostics,
  createBoundedShadowCollectorExecutionProofRuntime,
  parseBoundedShadowCollectorExecutionProofRequest,
  type BoundedShadowCollectorExecutionProofProviderResult,
} from "../../lib/bounded-shadow-collector-execution-proof";
import { buildContinuousIntelligenceBudgetPlan } from "../../lib/continuous-intelligence-budget-orchestrator";
import { buildContinuousIntelligenceBudgetPlanInput } from "../../lib/continuous-intelligence-budget-plan-input";

const now = "2026-07-21T14:30:00.000Z";
const routePath =
  "app/api/automation/continuous-intelligence/shadow-collector/bounded-execution-proof/preflight/route.ts";

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
  if (!parsed.ok) throw new Error("Expected valid preflight request fixture.");
  return parsed.value;
}

function plan(ticker: string | null = "AAPL") {
  return buildContinuousIntelligenceBudgetPlan(
    buildContinuousIntelligenceBudgetPlanInput({
      generated_at: now,
      market_phase: "regular",
      is_trading_day: true,
      provider_budget_status: "within_budget",
      active_position_symbols: [],
      visible_recommendation_symbols: [],
      scanner_selected_symbols: [],
      scanner_context_symbols: ticker ? [ticker] : [],
      dynamic_mover_symbols: [],
      dynamic_movers_status: null,
      dynamic_movers_selected_count: 0,
      outcome_symbols: [],
      pending_outcomes: 0,
      legacy_constraints: {},
    }),
  );
}

function preflightInput(overrides: Partial<{
  budget_plan: ReturnType<typeof plan> | null;
  provider_configured: boolean;
  provider_metadata_status: string | null;
  execution_feature_enabled: boolean;
  request: ReturnType<typeof request>;
}> = {}) {
  return {
    request: overrides.request ?? request(),
    budget_plan: "budget_plan" in overrides ? overrides.budget_plan ?? null : plan(),
    provider_configured: overrides.provider_configured ?? true,
    provider_metadata_status:
      "provider_metadata_status" in overrides
        ? overrides.provider_metadata_status ?? null
        : "within_budget",
    execution_feature_enabled: overrides.execution_feature_enabled ?? true,
    ticker_input_source: "scanner_context_symbols" as const,
    evaluation_now: now,
  };
}

function providerResult(): BoundedShadowCollectorExecutionProofProviderResult {
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
    candles: [],
  };
}

test("Action 569 provides an authenticated POST-only no-store preflight boundary", () => {
  const route = read(routePath);
  expect(route).toContain('export const dynamic = "force-dynamic"');
  expect(route).toContain('export const maxDuration = 5');
  expect(route).toContain('"Cache-Control": "no-store"');
  expect(route).toContain("x-automation-secret");
  expect(route).toContain("},\n      401,");
  expect(route).not.toContain("export async function GET");
  expect(route).not.toContain("getIntradayCandlesWithDiagnostics");
  expect(route).not.toContain("TWELVE_DATA_API_KEY=");
});

test("Action 569 reuses validation and exposes independent fail-closed readiness gates", () => {
  const invalid = parseBoundedShadowCollectorExecutionProofRequest(
    { tickers: ["AAPL", "MSFT"], interval: "5min", start: now, end: now },
    { now },
  );
  expect(invalid).toMatchObject({ ok: false, error: "exactly_one_ticker_required" });

  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  const disabled = runtime.preflight(preflightInput({ execution_feature_enabled: false }));
  const missingProvider = runtime.preflight(preflightInput({ provider_configured: false }));
  const missingMetadata = runtime.preflight(preflightInput({ provider_metadata_status: null }));
  const disallowedMetadata = runtime.preflight(
    preflightInput({ provider_metadata_status: "provider_blocked" }),
  );
  const notAllocated = runtime.preflight(preflightInput({ budget_plan: plan(null) }));

  expect(disabled).toMatchObject({ status: "blocked", primary_blocker: "feature_flag_disabled" });
  expect(disabled.feature_flag.action_567_planning_flag_is_execution_authorization).toBe(false);
  expect(missingProvider).toMatchObject({ primary_blocker: "provider_not_configured" });
  expect(missingMetadata).toMatchObject({ primary_blocker: "provider_metadata_unresolved" });
  expect(disallowedMetadata).toMatchObject({ primary_blocker: "budget_not_available" });
  expect(disallowedMetadata.gates).toMatchObject({
    provider_budget_metadata_resolved: true,
    provider_budget_status_accepted: false,
  });
  expect(notAllocated).toMatchObject({ primary_blocker: "planner_authorization_unavailable" });
  expect(notAllocated.gates.policy_totals_match).toBe(true);
  expect(notAllocated.gates.matching_planner_workload_exists).toBe(false);
});

test("Action 569 only authorizes an allocated non-protected normal workload and preserves policy boundaries", () => {
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  const base = plan();
  const zeroCredit = {
    ...base,
    workloads: base.workloads.map((workload) =>
      workload.workload_id === "normal_broad_universe_refresh"
        ? { ...workload, allocated_credits: 0, allocated_symbols: [] }
        : workload,
    ),
  };
  const executionReadyOnly = {
    ...zeroCredit,
    workloads: zeroCredit.workloads.map((workload) =>
      workload.kind === "execution_ready_opportunity_monitoring"
        ? { ...workload, allocated_credits: 1, allocated_symbols: ["AAPL"] }
        : workload,
    ),
  };
  const protectedPlan = {
    ...base,
    workloads: base.workloads.map((workload) =>
      workload.workload_id === "normal_broad_universe_refresh"
        ? { ...workload, protected_capacity: true }
        : workload,
    ),
  };
  const brokenPolicy = structuredClone(base);
  Object.defineProperty(brokenPolicy.policy, "total_credits", { value: 376 });
  const brokenReserve = structuredClone(base);
  Object.defineProperty(brokenReserve.allocation, "reserved_credits", { value: 0 });
  const nonPlanning = structuredClone(base);
  Object.defineProperty(nonPlanning, "status", { value: "active" });
  const providerBlocked = structuredClone(base);
  Object.defineProperty(providerBlocked, "degradation_level", { value: "provider_blocked" });
  const unknownDegradation = structuredClone(base);
  Object.defineProperty(unknownDegradation, "degradation_level", { value: "unknown" });

  expect(runtime.preflight(preflightInput({ budget_plan: zeroCredit }))).toMatchObject({
    primary_blocker: "planner_authorization_unavailable",
  });
  expect(runtime.preflight(preflightInput({ budget_plan: executionReadyOnly }))).toMatchObject({
    primary_blocker: "planner_authorization_unavailable",
  });
  expect(runtime.preflight(preflightInput({ budget_plan: protectedPlan }))).toMatchObject({
    primary_blocker: "planner_authorization_unavailable",
  });
  expect(runtime.preflight(preflightInput({ budget_plan: brokenPolicy }))).toMatchObject({
    primary_blocker: "budget_not_available",
  });
  expect(runtime.preflight(preflightInput({ budget_plan: brokenReserve }))).toMatchObject({
    primary_blocker: "reserve_boundary_violation",
  });
  for (const unavailablePlan of [nonPlanning, providerBlocked, unknownDegradation]) {
    const unavailable = runtime.preflight(preflightInput({ budget_plan: unavailablePlan }));
    expect(unavailable).toMatchObject({ primary_blocker: "budget_not_available" });
    expect(unavailable.eligible).toBe(false);
  }

  const ready = runtime.preflight(preflightInput());
  expect(ready).toMatchObject({
    contract_version: boundedShadowCollectorExecutionProofPreflightContractVersion,
    eligible: true,
    status: "ready",
    planner: {
      authorization: {
        ticker_allocated_by_planner: true,
        proof_executable_credits: 1,
        credit_source: "normal_planned_capacity",
        execution_ready_reserve_consumed: false,
      },
    },
  });
  expect(ready.gates).toMatchObject({
    planner_status_is_planning_only: true,
    planner_degradation_allows_bounded_proof: true,
    ticker_entered_through_scanner_context: true,
    provider_request_ceiling_is_one: true,
    provider_credit_ceiling_is_one: true,
    timeout_ceiling_is_five_seconds: true,
  });
  expect(ready.generated_at).toBe(now);
});

test("Action 569 preflight observes but never reserves process-local capacity or invokes a provider", async () => {
  const runtime = createBoundedShadowCollectorExecutionProofRuntime();
  let providerCalls = 0;
  let releasePending = () => {};
  const pending = new Promise<void>((resolve) => {
    releasePending = resolve;
  });
  const before = runtime.snapshot();
  const first = runtime.preflight(preflightInput());
  const second = runtime.preflight(preflightInput());
  expect(first.eligible).toBe(true);
  expect(second.eligible).toBe(true);
  expect(runtime.snapshot()).toEqual(before);
  expect(providerCalls).toBe(0);

  const executing = runtime.execute({
    ...preflightInput(),
    provider: async () => {
      providerCalls += 1;
      await pending;
      return providerResult();
    },
  });
  await Promise.resolve();
  const identical = runtime.preflight(preflightInput());
  const different = runtime.preflight(
    preflightInput({ request: request("MSFT"), budget_plan: plan("MSFT") }),
  );
  expect(identical).toMatchObject({ primary_blocker: "duplicate_request_in_flight" });
  expect(different).toMatchObject({ primary_blocker: "runtime_capacity_unavailable" });
  expect(providerCalls).toBe(1);
  releasePending();
  await executing;
  expect(runtime.snapshot()).toEqual({ in_flight_count: 0, max_in_flight_requests: 1 });
});

test("Action 569 diagnostics and preflight output remain sanitized and explicitly non-executing", () => {
  const diagnostics = buildBoundedShadowCollectorExecutionProofPreflightDiagnostics();
  const executionDiagnostics = buildBoundedShadowCollectorExecutionProofDiagnostics();
  expect(diagnostics).toMatchObject({
    route_marker: boundedShadowCollectorExecutionProofPreflightRouteMarker,
    status: "not_observed",
    browser_route_invocation: false,
    provider_call_inferred_by_client: false,
    execution_capacity_reserved: false,
  });
  expect(executionDiagnostics.route_present).toBe(true);
  const serialized = JSON.stringify(diagnostics);
  expect(serialized).not.toContain("api_key");
  expect(serialized).not.toContain("supabase");
  expect(
    createBoundedShadowCollectorExecutionProofRuntime().preflight(preflightInput())
      .execution_recheck_required,
  ).toBe(true);
});
