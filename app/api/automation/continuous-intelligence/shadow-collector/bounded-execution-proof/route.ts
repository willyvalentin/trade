import { NextResponse } from "next/server";

import {
  boundedShadowCollectorExecutionProofContractVersion,
  boundedShadowCollectorExecutionProofFlagName,
  boundedShadowCollectorExecutionProofRouteMarker,
  boundedShadowCollectorExecutionProofRoutePath,
  boundedShadowCollectorExecutionProofRuntime,
  buildBoundedShadowCollectorExecutionProofDiagnostics,
  isBoundedShadowCollectorExecutionProofEnabled,
  normalizeBoundedShadowCollectorProviderMetadataStatus,
  parseBoundedShadowCollectorExecutionProofRequest,
} from "@/lib/bounded-shadow-collector-execution-proof";
import { buildContinuousIntelligenceBudgetPlan } from "@/lib/continuous-intelligence-budget-orchestrator";
import { buildContinuousIntelligenceBudgetPlanInput } from "@/lib/continuous-intelligence-budget-plan-input";
import { getIntradayCandlesWithDiagnostics } from "@/lib/market-data";
import { buildMarketSessionEvaluation } from "@/lib/market-session";

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

function buildRoutePlan(input: {
  now: Date;
  providerBudgetStatus: string | null;
  proofTicker: string;
}) {
  const session = buildMarketSessionEvaluation({ now: input.now });
  const marketPhase =
    session.phase === "regular" || session.phase === "pre_market" || session.phase === "after_hours"
      ? session.phase
      : "unknown";
  const planInput = buildContinuousIntelligenceBudgetPlanInput({
    generated_at: input.now.toISOString(),
    market_phase: marketPhase,
    is_trading_day: !["closed", "holiday", "weekend"].includes(session.phase),
    provider_budget_status: input.providerBudgetStatus,
    active_position_symbols: [],
    visible_recommendation_symbols: [],
    scanner_selected_symbols: [],
    scanner_context_symbols: [input.proofTicker],
    dynamic_mover_symbols: [],
    dynamic_movers_status: undefined,
    dynamic_movers_selected_count: 0,
    outcome_symbols: [],
    pending_outcomes: 0,
    legacy_constraints: {},
  });
  return buildContinuousIntelligenceBudgetPlan(planInput);
}

function responseStatus(result: Awaited<ReturnType<typeof boundedShadowCollectorExecutionProofRuntime.execute>>) {
  if (result.ok) return 200;
  if (result.blocker === "duplicate_request_in_flight") return 409;
  if (
    result.blocker === "provider_timeout" ||
    result.blocker === "provider_failure" ||
    result.blocker === "invalid_provider_response"
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

  if (!isBoundedShadowCollectorExecutionProofEnabled(
    process.env.TURE_CONTINUOUS_INTELLIGENCE_BOUNDED_SHADOW_EXECUTION_ENABLED,
  )) {
    return json(
      {
        error: "Bounded execution proof is disabled.",
        contract_version: boundedShadowCollectorExecutionProofContractVersion,
        route_marker: boundedShadowCollectorExecutionProofRouteMarker,
        route_path: boundedShadowCollectorExecutionProofRoutePath,
        blocker: "feature_flag_disabled",
        execution_feature_flag: boundedShadowCollectorExecutionProofFlagName,
        diagnostics: buildBoundedShadowCollectorExecutionProofDiagnostics(),
      },
      403,
    );
  }

  try {
    const providerMetadataStatus = normalizeBoundedShadowCollectorProviderMetadataStatus(
      process.env.TURE_CONTINUOUS_INTELLIGENCE_PROVIDER_BUDGET_STATUS,
    );
    const now = new Date();
    const budgetPlan = buildRoutePlan({
      now,
      providerBudgetStatus: providerMetadataStatus,
      proofTicker: parsed.value.ticker,
    });
    const result = await boundedShadowCollectorExecutionProofRuntime.execute({
      request: parsed.value,
      budget_plan: budgetPlan,
      provider_configured: Boolean(process.env.TWELVE_DATA_API_KEY),
      provider_metadata_status: providerMetadataStatus,
      provider: async ({ ticker, interval, start, end, signal }) => {
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
        result,
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
