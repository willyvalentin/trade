import { NextResponse } from "next/server";

import {
  boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
  boundedShadowCollectorExecutionProofAuthorizationRoutePath,
  boundedShadowCollectorExecutionProofPreflightContractVersion,
  boundedShadowCollectorExecutionProofRuntime,
  buildBoundedShadowCollectorExecutionProofPlan,
  isBoundedShadowCollectorExecutionProofEnabled,
  parseBoundedShadowCollectorExecutionProofRequest,
} from "@/lib/bounded-shadow-collector-execution-proof";
import {
  boundedShadowCollectorOperatorAuthorizationContractVersion,
  boundedShadowCollectorOperatorAuthorizationStore,
} from "@/lib/bounded-shadow-collector-operator-authorization";

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
        contract_version: boundedShadowCollectorOperatorAuthorizationContractVersion,
        route_marker: boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
        route_path: boundedShadowCollectorExecutionProofAuthorizationRoutePath,
        authentication: { authenticated: false, failure_reason: "missing_or_invalid_automation_auth" },
      },
      401,
    );
  }
  const parsed = parseBoundedShadowCollectorExecutionProofRequest(await parseBody(request));
  if (!parsed.ok) {
    return json(
      {
        error: "Invalid bounded execution authorization input.",
        contract_version: boundedShadowCollectorOperatorAuthorizationContractVersion,
        route_marker: boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
        route_path: boundedShadowCollectorExecutionProofAuthorizationRoutePath,
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
    const preflight = boundedShadowCollectorExecutionProofRuntime.preflight({
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
    if (!preflight.eligible) {
      return json(
        {
          error: "Authorization issuance is blocked by current preflight.",
          contract_version: boundedShadowCollectorOperatorAuthorizationContractVersion,
          route_marker: boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
          route_path: boundedShadowCollectorExecutionProofAuthorizationRoutePath,
          blocker: "authorization_preflight_blocked",
          preflight_contract_version: boundedShadowCollectorExecutionProofPreflightContractVersion,
          primary_preflight_blocker: preflight.primary_blocker,
          provider_calls_executed: false,
          runtime_capacity_reserved: false,
        },
        preflight.primary_blocker === "duplicate_request_in_flight" ||
          preflight.primary_blocker === "runtime_capacity_unavailable"
          ? 409
          : 403,
      );
    }
    const issued = await boundedShadowCollectorOperatorAuthorizationStore.issue(parsed.value);
    if (!issued.ok) {
      return json(
        {
          error: "Authorization issuance is unavailable.",
          contract_version: boundedShadowCollectorOperatorAuthorizationContractVersion,
          route_marker: boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
          route_path: boundedShadowCollectorExecutionProofAuthorizationRoutePath,
          blocker: issued.blocker,
          provider_calls_executed: false,
          runtime_capacity_reserved: false,
        },
        409,
      );
    }
    return json({
      contract_version: boundedShadowCollectorOperatorAuthorizationContractVersion,
      route_marker: boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
      route_path: boundedShadowCollectorExecutionProofAuthorizationRoutePath,
      issued: true,
      authorization_token: issued.token,
      request_fingerprint: issued.request_fingerprint,
      issued_at: issued.issued_at,
      expires_at: issued.expires_at,
      ttl_seconds: issued.ttl_seconds,
      single_use: true,
      request_bound: true,
      process_local_only: true,
      durable: false,
      cross_instance_valid: false,
      preflight_eligible_at_issuance: true,
      provider_calls_executed: false,
      runtime_capacity_reserved: false,
      no_effect_boundary: {
        shared_cache_mutated: false,
        supabase_writes_executed: false,
        schedule_changes: false,
        downstream_behavior_changed: false,
      },
    });
  } catch {
    return json(
      {
        error: "Authorization issuance failed safely.",
        contract_version: boundedShadowCollectorOperatorAuthorizationContractVersion,
        route_marker: boundedShadowCollectorExecutionProofAuthorizationRouteMarker,
        route_path: boundedShadowCollectorExecutionProofAuthorizationRoutePath,
        failure_category: "internal_failure",
      },
      500,
    );
  }
}
