import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { expect, test } from "@playwright/test";

import {
  authenticatedShadowCollectorDryRunContractVersion,
  authenticatedShadowCollectorDryRunLimits,
  authenticatedShadowCollectorDryRunRouteMarker,
  buildAuthenticatedShadowCollectorDryRunDiagnostics,
  buildAuthenticatedShadowCollectorDryRunResponse,
  parseAuthenticatedShadowCollectorDryRunRequest,
} from "../../lib/authenticated-shadow-collector-dry-run";
import { POST } from "../../app/api/automation/continuous-intelligence/shadow-collector/dry-run/route";

const routePath =
  "app/api/automation/continuous-intelligence/shadow-collector/dry-run/route.ts";
const secret = "action-567-test-automation-secret";

function read(path: string) {
  return readFileSync(resolve(process.cwd(), path), "utf8");
}

function request(body: unknown, suppliedSecret: string | null = secret) {
  const headers = new Headers({ "content-type": "application/json" });
  if (suppliedSecret !== null) {
    headers.set("x-automation-secret", suppliedSecret);
  }
  return new Request("http://localhost/api/automation/continuous-intelligence/shadow-collector/dry-run", {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
}

async function withRouteEnvironment(
  env: Record<string, string | undefined>,
  callback: () => Promise<void>,
) {
  const prior = Object.fromEntries(
    Object.keys(env).map((key) => [key, process.env[key]]),
  );

  try {
    for (const [key, value] of Object.entries(env)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await callback();
  } finally {
    for (const [key, value] of Object.entries(prior)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test.describe.configure({ mode: "serial" });

test.describe("Action 567 authenticated shadow collector dry-run boundary", () => {
  test("rejects unauthenticated requests without returning the credential", async () => {
    await withRouteEnvironment({ AUTOMATION_SECRET: secret }, async () => {
      const response = await POST(request({}, "not-the-secret"));
      const body = await response.json();

      expect(response.status).toBe(401);
      expect(body).toMatchObject({
        contract_version: authenticatedShadowCollectorDryRunContractVersion,
        route_marker: authenticatedShadowCollectorDryRunRouteMarker,
        authentication: {
          authenticated: false,
          failure_reason: "missing_or_invalid_automation_auth",
        },
      });
      expect(JSON.stringify(body)).not.toContain(secret);
      expect(JSON.stringify(body)).not.toContain("not-the-secret");
    });
  });

  test("accepts the automation boundary but always produces a dry-run plan", async () => {
    await withRouteEnvironment(
      {
        AUTOMATION_SECRET: secret,
        TURE_CONTINUOUS_INTELLIGENCE_SHADOW_COLLECTOR_ENABLED: undefined,
      },
      async () => {
        const response = await POST(
          request({
            tickers: ["MSFT", "AAPL", "AAPL"],
            interval: "5min",
            start: "2026-07-21T14:00:00.000Z",
            end: "2026-07-21T14:30:00.000Z",
          }),
        );
        const body = await response.json();

        expect(response.status).toBe(200);
        expect(body.authentication.authenticated).toBe(true);
        expect(body.feature_flag.enabled).toBe(false);
        expect(body.dry_run).toMatchObject({
          dry_run_only: true,
          execution_disabled: true,
        });
        expect(body.planner).toMatchObject({
          contract: "continuous_intelligence_budget_plan_v1",
          version: "1.0",
          hard_reserve_preserved: true,
          policy_totals: {
            total_credits: 377,
            hard_reserve_credits: 57,
            normal_planned_max_credits: 320,
          },
        });
        expect(body.collector).toMatchObject({
          contract: "rolling_rest_collector_v1",
          cache_version: "shared_candle_cache_v1",
          executable_credits: 0,
          jobs_rejected_by_validation: 0,
        });
        expect(body.request_application).toMatchObject({
          validated_request_metadata: {
            tickers: true,
            interval: true,
            time_range: true,
            estimated_credits: false,
          },
          applied_to_plan: {
            tickers_as_scanner_context: true,
          },
          applied_to_response_job_selection: {
            workload_class_filter: false,
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
        });
        expect(body.collector.jobs.every((job: { interval: unknown }) => job.interval === null)).toBe(true);
        expect(body.no_effect_boundary).toMatchObject({
          provider_execution_allowed: false,
          provider_calls_executed: false,
          cache_mutation_allowed: false,
          cache_mutated: false,
          database_writes_allowed: false,
          database_writes_executed: false,
          collector_runtime_created: false,
          collector_runtime_executed: false,
        });
        expect(JSON.stringify(body)).not.toContain(secret);
      },
    );
  });

  test("treats invalid flags as disabled and never grants execution when enabled", async () => {
    const parsed = parseAuthenticatedShadowCollectorDryRunRequest({
      tickers: ["AAPL"],
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const invalidFlag = buildAuthenticatedShadowCollectorDryRunResponse({
      request: parsed.value,
      shadow_flag_value: "not-a-flag",
      now: "2026-07-21T14:00:00.000Z",
    });
    const enabledFlag = buildAuthenticatedShadowCollectorDryRunResponse({
      request: parsed.value,
      shadow_flag_value: "enabled",
      now: "2026-07-21T14:00:00.000Z",
    });

    expect(invalidFlag.feature_flag.enabled).toBe(false);
    expect(enabledFlag.feature_flag.enabled).toBe(true);
    expect(enabledFlag.dry_run.execution_disabled).toBe(true);
    expect(enabledFlag.no_effect_boundary.provider_execution_allowed).toBe(false);
    expect(enabledFlag.collector.executable_credits).toBe(0);
  });

  test("fails closed for untrusted request controls", async () => {
    const tooMany = parseAuthenticatedShadowCollectorDryRunRequest({
      tickers: Array.from(
        { length: authenticatedShadowCollectorDryRunLimits.max_requested_tickers + 1 },
        (_, index) => `A${index}`,
      ),
    });
    const invalidTicker = parseAuthenticatedShadowCollectorDryRunRequest({
      tickers: ["AAPL;DROP"],
    });
    const invalidInterval = parseAuthenticatedShadowCollectorDryRunRequest({
      interval: "60min",
    });
    const oversizedRange = parseAuthenticatedShadowCollectorDryRunRequest({
      start: "2026-07-21T00:00:00.000Z",
      end: "2026-07-21T12:01:00.000Z",
    });
    const arbitraryEndpoint = parseAuthenticatedShadowCollectorDryRunRequest({
      endpoint: "https://example.invalid/provider",
    });

    expect(tooMany).toMatchObject({ ok: false, error: { code: "ticker_limit_exceeded" } });
    expect(invalidTicker).toMatchObject({ ok: false, error: { code: "invalid_ticker" } });
    expect(invalidInterval).toMatchObject({ ok: false, error: { code: "invalid_interval" } });
    expect(oversizedRange).toMatchObject({ ok: false, error: { code: "time_range_exceeds_limit" } });
    expect(arbitraryEndpoint).toMatchObject({
      ok: false,
      error: { code: "arbitrary_target_input_forbidden" },
    });
  });

  test("keeps validated interval, range, and estimated credits out of applied job metadata", () => {
    const baseline = parseAuthenticatedShadowCollectorDryRunRequest({
      tickers: ["AAPL"],
    });
    const requested = parseAuthenticatedShadowCollectorDryRunRequest({
      tickers: ["AAPL"],
      interval: "5min",
      start: "2026-07-21T14:00:00.000Z",
      end: "2026-07-21T14:30:00.000Z",
      estimated_credits: 320,
    });
    expect(baseline.ok).toBe(true);
    expect(requested.ok).toBe(true);
    if (!baseline.ok || !requested.ok) return;

    const baselineResponse = buildAuthenticatedShadowCollectorDryRunResponse({
      request: baseline.value,
      now: "2026-07-21T14:00:00.000Z",
    });
    const requestedResponse = buildAuthenticatedShadowCollectorDryRunResponse({
      request: requested.value,
      now: "2026-07-21T14:00:00.000Z",
    });

    expect(requestedResponse.request_application.applied_to_jobs).toEqual({
      interval: false,
      time_range: false,
      estimated_credits: false,
    });
    expect(requestedResponse.collector.jobs.every((job) => job.interval === null)).toBe(true);
    expect(requestedResponse.planner.policy_totals).toEqual(
      baselineResponse.planner.policy_totals,
    );
    expect(requestedResponse.collector.planner_credits).toEqual(
      baselineResponse.collector.planner_credits,
    );
  });

  test("reports workload filtering and max-job truncation without calling either rejection", () => {
    const parsed = parseAuthenticatedShadowCollectorDryRunRequest({
      workload_classes: ["broad_universe_refresh"],
      max_jobs: 1,
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const response = buildAuthenticatedShadowCollectorDryRunResponse({
      request: parsed.value,
      now: "2026-07-21T14:00:00.000Z",
    });
    const counters = response.collector;

    expect(counters.jobs_available_from_plan).toBeGreaterThan(
      counters.jobs_matching_workload_filter,
    );
    expect(counters.jobs_matching_workload_filter).toBeGreaterThan(1);
    expect(counters.jobs_accepted).toBe(1);
    expect(counters.jobs_excluded_by_workload_filter).toBe(
      counters.jobs_available_from_plan - counters.jobs_matching_workload_filter,
    );
    expect(counters.jobs_truncated_by_max_jobs).toBe(
      counters.jobs_matching_workload_filter - counters.jobs_accepted,
    );
    expect(counters.jobs_rejected_by_validation).toBe(0);
  });

  test("preserves Action 565 and 566 metadata without promoting visible symbols to execution-ready demand", () => {
    const parsed = parseAuthenticatedShadowCollectorDryRunRequest({
      tickers: ["AAPL", "MSFT"],
      workload_classes: [
        "execution_ready_opportunity_monitoring",
        "broad_universe_refresh",
      ],
    });
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;

    const response = buildAuthenticatedShadowCollectorDryRunResponse({
      request: parsed.value,
      now: "2026-07-21T14:00:00.000Z",
    });
    const executionReady = response.collector.jobs.find(
      (job) => job.source_workload_kind === "execution_ready_opportunity_monitoring",
    );
    const broad = response.collector.jobs.find(
      (job) => job.workload_class === "broad_universe_refresh",
    );

    expect(executionReady).toMatchObject({
      requested_symbols: [],
      allocated_symbols: [],
      demand_metadata_available: false,
      defer_reason: "missing_execution_ready_metadata",
    });
    expect(broad).toMatchObject({
      demand_source: "runtime_observed",
      shard_count: expect.any(Number),
      shard_size: expect.any(Number),
    });
    expect(response.collector.jobs.every((job) => job.provider_call_allowed === false)).toBe(true);
  });

  test("renders passive diagnostics and keeps the route free of collector execution", () => {
    const diagnostics = buildAuthenticatedShadowCollectorDryRunDiagnostics();
    const marketDiagnosticsSource = read("lib/market-diagnostics-console.ts");
    const appSource = read("app/trade-app.tsx");
    const routeSource = read(routePath);

    expect(diagnostics).toMatchObject({
      status: "not_observed",
      route_present: true,
      authentication_required: true,
      dry_run_only: true,
      provider_execution_allowed: false,
      database_writes_allowed: false,
      cache_mutation_allowed: false,
      schedule_present: false,
    });
    expect(marketDiagnosticsSource).toContain("Authenticated Shadow Collector Dry Run");
    expect(appSource).toContain("trade-authenticated-shadow-collector-dry-run-json");
    expect(routeSource).toContain("x-automation-secret");
    expect(routeSource).not.toContain("createRollingRestCollectorShadowRuntime");
    expect(routeSource).not.toContain("Twelve Data");
    expect(routeSource).not.toContain("getServerSupabaseClient");
  });
});
