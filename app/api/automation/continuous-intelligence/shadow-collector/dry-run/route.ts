import { NextResponse } from "next/server";

import {
  authenticatedShadowCollectorDryRunRouteMarker,
  authenticatedShadowCollectorDryRunRoutePath,
  buildAuthenticatedShadowCollectorDryRunResponse,
  parseAuthenticatedShadowCollectorDryRunRequest,
} from "@/lib/authenticated-shadow-collector-dry-run";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

async function parseBody(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    if (!text.trim()) return {};
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function isDevelopmentOrTestRuntime() {
  return process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test";
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  const authenticated = Boolean(
    expectedSecret && providedSecret && providedSecret === expectedSecret,
  );

  if (!authenticated) {
    return json(
      {
        error: "Unauthorized.",
        contract_version: "authenticated_shadow_collector_dry_run_v1",
        route_marker: authenticatedShadowCollectorDryRunRouteMarker,
        route_path: authenticatedShadowCollectorDryRunRoutePath,
        authentication: {
          authenticated: false,
          source: "x_automation_secret",
          failure_reason: "missing_or_invalid_automation_auth",
        },
      },
      401,
    );
  }

  const parsedInput = parseAuthenticatedShadowCollectorDryRunRequest(
    await parseBody(request),
    { allow_session_override: isDevelopmentOrTestRuntime() },
  );
  if (!parsedInput.ok) {
    return json(
      {
        error: "Invalid dry-run input.",
        contract_version: "authenticated_shadow_collector_dry_run_v1",
        route_marker: authenticatedShadowCollectorDryRunRouteMarker,
        route_path: authenticatedShadowCollectorDryRunRoutePath,
        input_error: parsedInput.error.code,
      },
      400,
    );
  }

  try {
    const response = buildAuthenticatedShadowCollectorDryRunResponse({
      request: parsedInput.value,
      shadow_flag_value:
        process.env.TURE_CONTINUOUS_INTELLIGENCE_SHADOW_COLLECTOR_ENABLED,
    });

    console.info("[authenticated-shadow-collector-dry-run] planned", {
      route_marker: authenticatedShadowCollectorDryRunRouteMarker,
      jobs_available_from_plan: response.collector.jobs_available_from_plan,
      jobs_matching_workload_filter:
        response.collector.jobs_matching_workload_filter,
      jobs_accepted: response.collector.jobs_accepted,
      jobs_excluded_by_workload_filter:
        response.collector.jobs_excluded_by_workload_filter,
      jobs_truncated_by_max_jobs: response.collector.jobs_truncated_by_max_jobs,
      jobs_rejected_by_validation: response.collector.jobs_rejected_by_validation,
      jobs_deferred: response.collector.jobs_deferred,
      provider_execution_allowed:
        response.no_effect_boundary.provider_execution_allowed,
    });

    return json(response);
  } catch {
    return json(
      {
        error: "Dry-run planning failed.",
        contract_version: "authenticated_shadow_collector_dry_run_v1",
        route_marker: authenticatedShadowCollectorDryRunRouteMarker,
        route_path: authenticatedShadowCollectorDryRunRoutePath,
        failure_category: "planning_failure",
      },
      500,
    );
  }
}
