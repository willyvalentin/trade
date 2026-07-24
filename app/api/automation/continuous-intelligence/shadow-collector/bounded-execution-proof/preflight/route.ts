import { NextResponse } from "next/server";

import {
  boundedShadowCollectorExecutionProofPreflightContractVersion,
  boundedShadowCollectorExecutionProofPreflightRouteMarker,
  boundedShadowCollectorExecutionProofPreflightRoutePath,
  boundedShadowCollectorExecutionProofRuntime,
  buildBoundedShadowCollectorExecutionProofPlan,
  isBoundedShadowCollectorExecutionProofEnabled,
  parseBoundedShadowCollectorExecutionProofRequest,
} from "@/lib/bounded-shadow-collector-execution-proof";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

async function parseBody(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    return text.trim() ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return json(
      {
        error: "Unauthorized.",
        contract_version: boundedShadowCollectorExecutionProofPreflightContractVersion,
        route_marker: boundedShadowCollectorExecutionProofPreflightRouteMarker,
        route_path: boundedShadowCollectorExecutionProofPreflightRoutePath,
        authentication: { authenticated: false, failure_reason: "missing_or_invalid_automation_auth" },
      },
      401,
    );
  }

  const parsed = parseBoundedShadowCollectorExecutionProofRequest(await parseBody(request));
  if (!parsed.ok) {
    return json(
      {
        error: "Invalid bounded execution proof preflight input.",
        contract_version: boundedShadowCollectorExecutionProofPreflightContractVersion,
        route_marker: boundedShadowCollectorExecutionProofPreflightRouteMarker,
        route_path: boundedShadowCollectorExecutionProofPreflightRoutePath,
        input_error: parsed.error,
      },
      400,
    );
  }

  try {
    const providerMetadataStatus =
      process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS ?? null;
    const now = new Date();
    const planner = buildBoundedShadowCollectorExecutionProofPlan({
      now,
      provider_metadata_status: providerMetadataStatus,
      proof_ticker: parsed.value.ticker,
    });
    const result = boundedShadowCollectorExecutionProofRuntime.preflight({
      request: parsed.value,
      budget_plan: planner.budget_plan,
      provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
      provider_metadata_status: providerMetadataStatus,
      execution_feature_enabled: isBoundedShadowCollectorExecutionProofEnabled(
        process.env.TURE_CONTINUOUS_INTELLIGENCE_BOUNDED_SHADOW_EXECUTION_ENABLED,
      ),
      ticker_input_source: planner.ticker_input_source,
      evaluation_now: planner.evaluation_now,
    });
    const status = result.eligible
      ? 200
      : result.primary_blocker === "duplicate_request_in_flight" ||
          result.primary_blocker === "runtime_capacity_unavailable"
        ? 409
        : 403;
    console.info("[bounded-shadow-collector-execution-proof-preflight]", {
      route_marker: boundedShadowCollectorExecutionProofPreflightRouteMarker,
      eligible: result.eligible,
      primary_blocker: result.primary_blocker,
      provider_calls_executed: false,
      runtime_capacity_reserved: false,
    });
    return json(
      {
        contract_version: boundedShadowCollectorExecutionProofPreflightContractVersion,
        route_marker: boundedShadowCollectorExecutionProofPreflightRouteMarker,
        route_path: boundedShadowCollectorExecutionProofPreflightRoutePath,
        result,
      },
      status,
    );
  } catch {
    return json(
      {
        error: "Bounded execution proof preflight failed safely.",
        contract_version: boundedShadowCollectorExecutionProofPreflightContractVersion,
        route_marker: boundedShadowCollectorExecutionProofPreflightRouteMarker,
        route_path: boundedShadowCollectorExecutionProofPreflightRoutePath,
        failure_category: "internal_failure",
      },
      500,
    );
  }
}
