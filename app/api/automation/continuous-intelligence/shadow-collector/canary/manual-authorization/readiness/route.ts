import { NextResponse } from "next/server";

import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness,
  continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessContractVersion,
  continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessRoutePath,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-readiness";
import { buildContinuousIntelligenceShadowCanaryManualAuthorizationContext } from "@/lib/server/continuous-intelligence-shadow-canary-manual-authorization-context";
import { readContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness } from "@/lib/server/continuous-intelligence-shadow-canary-manual-authorization-issuance-readiness";
import { getServerSupabaseClient } from "@/lib/supabase-server";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function GET(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  if (!expectedSecret || request.headers.get("x-automation-secret") !== expectedSecret) {
    return json({
      contract_version: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessContractVersion,
      route_path: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessRoutePath,
      category: "request_auth_invalid",
      error: "Unauthorized.",
    }, 401);
  }
  if (new URL(request.url).search.length > 0 || request.body !== null) {
    return json({
      contract_version: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessContractVersion,
      route_path: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessRoutePath,
      category: "request_contract_invalid",
      error: "Issuance readiness accepts no parameters or request body.",
    }, 400);
  }

  const [context, probe] = await Promise.all([
    buildContinuousIntelligenceShadowCanaryManualAuthorizationContext(),
    readContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness(),
  ]);
  const readiness = buildContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadiness({
    now: context.now,
    request_authenticated: true,
    request_contract_valid: true,
    service_role_configuration_available: getServerSupabaseClient().client !== null,
    deployment_identity_available: context.deployment_commit !== null,
    binding: context.lifecycle_identity
      ? buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
          preflight: context.preflight,
          lifecycle_identity: context.lifecycle_identity,
          calendar_fingerprint: context.calendar_fingerprint,
          deployment_commit: context.deployment_commit,
          deployment_build_marker: context.deployment_build_marker,
        })
      : null,
    readiness_decision: context.readiness.decision,
    canary_disabled: context.canary_disabled,
    kill_switch_active: context.kill_switch_active,
    schedule_absent: context.schedule_absent,
    daily_capacity_available: context.daily_capacity_available,
    provider_budget_resolved: context.provider_budget_resolved,
    preflight_static_blockers_are_only_disabled_state: context.preflight_static_blockers_are_only_disabled_state,
    probe,
  });
  return json({
    contract_version: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessContractVersion,
    route_path: continuousIntelligenceShadowCanaryManualAuthorizationIssuanceReadinessRoutePath,
    readiness,
    usage_accounting: context.usage_accounting,
  });
}
