import { NextResponse } from "next/server";

import {
  boundedShadowCollectorExecutionProofContractVersion,
  boundedShadowCollectorExecutionProofFlagName,
  boundedShadowCollectorExecutionProofAuthorizationHeaderName,
  boundedShadowCollectorExecutionProofRouteMarker,
  boundedShadowCollectorExecutionProofRoutePath,
  boundedShadowCollectorExecutionProofRuntime,
  buildBoundedShadowCollectorExecutionProofBlockedResult,
  buildBoundedShadowCollectorExecutionProofPlan,
  isBoundedShadowCollectorExecutionProofEnabled,
  parseBoundedShadowCollectorExecutionProofRequest,
  type BoundedShadowCollectorExecutionProofResult,
} from "@/lib/bounded-shadow-collector-execution-proof";
import { boundedShadowCollectorOperatorAuthorizationStore } from "@/lib/bounded-shadow-collector-operator-authorization";
import {
  boundedShadowCollectorLatestProofReceiptStore,
  buildBoundedShadowCollectorLiveProofReceipt,
} from "@/lib/bounded-shadow-collector-live-proof-receipt";
import { getIntradayCandlesWithDiagnostics } from "@/lib/market-data";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

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

function responseStatus(result: Awaited<ReturnType<typeof boundedShadowCollectorExecutionProofRuntime.execute>>) {
  if (result.ok) return 200;
  if (
    result.blocker === "duplicate_request_in_flight" ||
    result.blocker === "runtime_capacity_unavailable" ||
    result.blocker === "operator_authorization_in_use" ||
    result.blocker === "authorization_capacity_unavailable"
  ) return 409;
  if (
    result.blocker === "provider_timeout" ||
    result.blocker === "provider_failure" ||
    result.blocker === "invalid_provider_response" ||
    result.blocker === "internal_execution_failure"
  ) {
    return 502;
  }
  return 403;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  const providedSecret = request.headers.get("x-automation-secret");
  if (!expectedSecret || !providedSecret || providedSecret !== expectedSecret) {
    return json(
      {
        error: "Unauthorized.",
        contract_version: boundedShadowCollectorExecutionProofContractVersion,
        route_marker: boundedShadowCollectorExecutionProofRouteMarker,
        route_path: boundedShadowCollectorExecutionProofRoutePath,
        authentication: { authenticated: false, failure_reason: "missing_or_invalid_automation_auth" },
      },
      401,
    );
  }

  const parsed = parseBoundedShadowCollectorExecutionProofRequest(await parseBody(request));
  if (!parsed.ok) {
    return json(
      {
        error: "Invalid bounded execution proof input.",
        contract_version: boundedShadowCollectorExecutionProofContractVersion,
        route_marker: boundedShadowCollectorExecutionProofRouteMarker,
        route_path: boundedShadowCollectorExecutionProofRoutePath,
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
    const executionInput = {
      request: parsed.value,
      budget_plan: planner.budget_plan,
      provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
      provider_metadata_status: providerMetadataStatus,
      execution_feature_enabled: isBoundedShadowCollectorExecutionProofEnabled(
        process.env.TURE_CONTINUOUS_INTELLIGENCE_BOUNDED_SHADOW_EXECUTION_ENABLED,
      ),
      ticker_input_source: planner.ticker_input_source,
      evaluation_now: planner.evaluation_now,
    } as const;
    const executionPreflight = boundedShadowCollectorExecutionProofRuntime.preflight(executionInput);
    if (!executionPreflight.eligible) {
      const result = buildBoundedShadowCollectorExecutionProofBlockedResult(
        "authorization_preflight_blocked",
        executionPreflight.request_fingerprint,
        "Current execution preflight is not eligible.",
      );
      return json(
        {
          contract_version: boundedShadowCollectorExecutionProofContractVersion,
          route_marker: boundedShadowCollectorExecutionProofRouteMarker,
          route_path: boundedShadowCollectorExecutionProofRoutePath,
          execution_feature_flag: boundedShadowCollectorExecutionProofFlagName,
          result,
        },
        responseStatus(result),
      );
    }
    const authorization = await boundedShadowCollectorOperatorAuthorizationStore.begin(
      request.headers.get(boundedShadowCollectorExecutionProofAuthorizationHeaderName),
      parsed.value,
    );
    if (!authorization.ok) {
      const result = buildBoundedShadowCollectorExecutionProofBlockedResult(
        authorization.blocker,
        executionPreflight.request_fingerprint,
        "Operator authorization is not available for this execution.",
      );
      return json(
        {
          contract_version: boundedShadowCollectorExecutionProofContractVersion,
          route_marker: boundedShadowCollectorExecutionProofRouteMarker,
          route_path: boundedShadowCollectorExecutionProofRoutePath,
          execution_feature_flag: boundedShadowCollectorExecutionProofFlagName,
          result,
        },
        responseStatus(result),
      );
    }
    let result: BoundedShadowCollectorExecutionProofResult;
    let providerAttemptOccurred = false;
    try {
      result = await boundedShadowCollectorExecutionProofRuntime.execute({
        ...executionInput,
        provider: async ({ ticker, interval, start, end, signal }) => {
          providerAttemptOccurred = true;
          const response = await getIntradayCandlesWithDiagnostics(
            ticker,
            interval,
            start,
            end,
            { signal },
          );
          return {
            provider: "twelve_data",
            provider_call_count: 1,
            estimated_credits: 1,
            actual_credits: null,
            provider_outcome: "success",
            provider_status: response.diagnostics.response_status,
            provider_error_category:
              response.diagnostics.response_status === "provider_error"
                ? response.diagnostics.response_category
                : null,
            fallback_used: response.diagnostics.fallback_used,
            response_structurally_valid:
              response.diagnostics.response_structurally_valid,
            retry_count: response.diagnostics.retry_count,
            rate_limited: response.diagnostics.rate_limited,
            candles: response.candles,
          };
        },
      });
    } catch {
      result = buildBoundedShadowCollectorExecutionProofBlockedResult(
        "internal_execution_failure",
        executionPreflight.request_fingerprint,
        "Bounded execution proof could not be completed safely.",
        providerAttemptOccurred ? 1 : 0,
      );
    } finally {
      boundedShadowCollectorOperatorAuthorizationStore.consume(authorization.lease);
    }
    const receipt = buildBoundedShadowCollectorLiveProofReceipt({
      request: parsed.value,
      preflight: executionPreflight,
      result,
      operator_authorization_verified: true,
      authorization_consumed: true,
    });
    boundedShadowCollectorLatestProofReceiptStore.record(receipt);

    console.info("[bounded-shadow-collector-execution-proof]", {
      route_marker: boundedShadowCollectorExecutionProofRouteMarker,
      status: result.status,
      blocker: result.ok ? null : result.blocker,
      provider_request_count: result.ok ? result.execution.provider_request_count : result.provider_request_count,
    });

    return json(
      {
        contract_version: boundedShadowCollectorExecutionProofContractVersion,
        route_marker: boundedShadowCollectorExecutionProofRouteMarker,
        route_path: boundedShadowCollectorExecutionProofRoutePath,
        execution_feature_flag: boundedShadowCollectorExecutionProofFlagName,
        result: {
          ...result,
          operator_authorization_verified: true,
          authorization_single_use_consumed: true,
          authorization_request_bound: true,
        },
        receipt,
      },
      responseStatus(result),
    );
  } catch {
    return json(
      {
        error: "Bounded execution proof failed safely.",
        contract_version: boundedShadowCollectorExecutionProofContractVersion,
        route_marker: boundedShadowCollectorExecutionProofRouteMarker,
        route_path: boundedShadowCollectorExecutionProofRoutePath,
        failure_category: "internal_failure",
      },
      500,
    );
  }
}
