import { randomUUID } from "node:crypto";

import { NextResponse } from "next/server";

import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
  continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
  continuousIntelligenceShadowCanaryManualAuthorizationRoutePath,
  sanitizeContinuousIntelligenceShadowCanaryManualAuthorization,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization-issuance-response";
import { sanitizeContinuousIntelligenceShadowCanaryManualExecutionLease } from "@/lib/continuous-intelligence-shadow-canary-manual-execution-lease";
import { buildContinuousIntelligenceShadowCanaryManualAuthorizationContext } from "@/lib/server/continuous-intelligence-shadow-canary-manual-authorization-context";
import {
  generateContinuousIntelligenceShadowCanaryManualAuthorizationToken,
  issueContinuousIntelligenceShadowCanaryManualAuthorizationWithLease,
} from "@/lib/server/continuous-intelligence-shadow-canary-manual-authorization-persistence";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };
const acceptedBody = JSON.stringify({
  contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
});

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

async function isFixedBody(request: Request) {
  const text = await request.text();
  return text.trim().length === 0 || text.trim() === acceptedBody;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  if (!expectedSecret || request.headers.get("x-automation-secret") !== expectedSecret) {
    return json({ error: "Unauthorized.", contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion, route_path: continuousIntelligenceShadowCanaryManualAuthorizationRoutePath }, 401);
  }
  if (!(await isFixedBody(request))) {
    return json({ error: "Manual canary authorization accepts no execution parameters.", contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion, route_path: continuousIntelligenceShadowCanaryManualAuthorizationRoutePath, failure_category: "validation_failed" }, 400);
  }
  try {
    const context = await buildContinuousIntelligenceShadowCanaryManualAuthorizationContext();
    const binding = context.lifecycle_identity
      ? buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
          preflight: context.preflight,
          lifecycle_identity: context.lifecycle_identity,
          calendar_fingerprint: context.calendar_fingerprint,
          deployment_commit: context.deployment_commit,
          deployment_build_marker: context.deployment_build_marker,
        })
      : null;
    const eligible =
      context.readiness.decision === "ready_for_one_manual_canary_attempt" &&
      context.canary_disabled &&
      context.kill_switch_active &&
      context.schedule_absent &&
      context.daily_capacity_available &&
      context.provider_budget_resolved &&
      context.preflight_static_blockers_are_only_disabled_state &&
      binding !== null;
    if (!eligible || !binding) {
      return json({
        error: "Manual canary authorization is blocked by current verified state.",
        contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
        route_path: continuousIntelligenceShadowCanaryManualAuthorizationRoutePath,
        blocker: "authorization_preflight_blocked",
        readiness_decision: context.readiness.decision,
        provider_calls_executed: false,
        claims_created: false,
        audit_or_ledger_writes_executed: false,
      }, 403);
    }
    const rawToken = generateContinuousIntelligenceShadowCanaryManualAuthorizationToken();
    const result = await issueContinuousIntelligenceShadowCanaryManualAuthorizationWithLease({
      binding,
      authorization_id: `manual_canary_authorization_${randomUUID()}`,
      execution_lease_id: `manual_canary_execution_lease_${randomUUID()}`,
      raw_token: rawToken,
      now: context.now,
    });
    if (result.status !== "issued" || !result.authorization || !result.lease) {
      return json({
        error: "Manual canary authorization was not issued.",
        contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
        route_path: continuousIntelligenceShadowCanaryManualAuthorizationRoutePath,
        blocker: result.status,
        authorization: result.authorization
          ? sanitizeContinuousIntelligenceShadowCanaryManualAuthorization(result.authorization)
          : null,
        provider_calls_executed: false,
        claims_created: false,
        audit_or_ledger_writes_executed: false,
      }, result.status === "unavailable" ? 503 : 409);
    }
    const response = {
      contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
      route_path: continuousIntelligenceShadowCanaryManualAuthorizationRoutePath,
      issued: true,
      authorization: sanitizeContinuousIntelligenceShadowCanaryManualAuthorization(result.authorization),
      execution_lease: sanitizeContinuousIntelligenceShadowCanaryManualExecutionLease(result.lease),
      authorization_token: rawToken,
      raw_token_returned_once: true,
      provider_calls_executed: false,
      claims_created: false,
      attempts_begun: false,
      audit_or_ledger_writes_executed: false,
      no_effect_boundary: "Provider execution has not occurred.",
    } as const;
    const validation = validateContinuousIntelligenceShadowCanaryManualAuthorizationIssuanceResponse({
      http_status: 200,
      body: response,
      now: context.now,
      expected: {
        authorization_id: result.authorization.authorization_id,
        execution_lease_id: result.lease.execution_lease_id,
      },
    });
    if (!validation.ok) {
      return json({
        error: "Manual canary issuance response failed semantic validation.",
        contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
        route_path: continuousIntelligenceShadowCanaryManualAuthorizationRoutePath,
        terminal_status: validation.terminal_status,
        diagnostic_code: validation.diagnostic_code,
        validation_stage: validation.validation_stage,
        failed_fields: validation.failed_fields,
        provider_calls_executed: false,
        claims_created: false,
        attempts_begun: false,
        audit_or_ledger_writes_executed: false,
      }, 503);
    }
    return json(response);
  } catch {
    return json({
      error: "Manual canary authorization failed safely.",
      contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
      route_path: continuousIntelligenceShadowCanaryManualAuthorizationRoutePath,
      failure_category: "runtime_unavailable",
    }, 503);
  }
}
