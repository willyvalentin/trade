import { NextResponse } from "next/server";

import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
  buildContinuousIntelligenceShadowCanaryManualExecutionHandoff,
  continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
  continuousIntelligenceShadowCanaryManualExecutionGateRoutePath,
  evaluateContinuousIntelligenceShadowCanaryManualExecutionGate,
  sanitizeContinuousIntelligenceShadowCanaryManualAuthorization,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization";
import { buildContinuousIntelligenceShadowCanaryManualAuthorizationContext } from "@/lib/server/continuous-intelligence-shadow-canary-manual-authorization-context";
import {
  consumeContinuousIntelligenceShadowCanaryManualAuthorization,
  readContinuousIntelligenceShadowCanaryManualAuthorization,
  readContinuousIntelligenceShadowCanaryManualAuthorizationClaimConflict,
} from "@/lib/server/continuous-intelligence-shadow-canary-manual-authorization-persistence";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };

type GateInput = {
  authorization_id: string;
  authorization_token: string;
  dry_run?: boolean;
};

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

function parse(value: unknown): GateInput | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  const keys = Object.keys(raw);
  if (!keys.every((key) => key === "authorization_id" || key === "authorization_token" || key === "dry_run")) return null;
  if (typeof raw.authorization_id !== "string" || raw.authorization_id.length < 1 || raw.authorization_id.length > 128) return null;
  if (typeof raw.authorization_token !== "string" || raw.authorization_token.length < 32 || raw.authorization_token.length > 256) return null;
  if (raw.dry_run !== undefined && raw.dry_run !== true) return null;
  return { authorization_id: raw.authorization_id, authorization_token: raw.authorization_token, dry_run: raw.dry_run === true };
}

async function body(request: Request): Promise<unknown> {
  try {
    const text = await request.text();
    return text.trim() ? JSON.parse(text) : null;
  } catch {
    return null;
  }
}

function statusFor(outcome: string) {
  if (outcome === "ready_for_one_manual_execution") return 200;
  if (outcome === "runtime_unavailable") return 503;
  return 409;
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  if (!expectedSecret || request.headers.get("x-automation-secret") !== expectedSecret) {
    return json({ error: "Unauthorized.", contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion, route_path: continuousIntelligenceShadowCanaryManualExecutionGateRoutePath }, 401);
  }
  const input = parse(await body(request));
  if (!input) {
    return json({ error: "Invalid manual canary gate input.", contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion, route_path: continuousIntelligenceShadowCanaryManualExecutionGateRoutePath, failure_category: "validation_failed" }, 400);
  }
  try {
    const context = await buildContinuousIntelligenceShadowCanaryManualAuthorizationContext();
    const expectedBinding = context.lifecycle_identity
      ? buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
          preflight: context.preflight,
          lifecycle_identity: context.lifecycle_identity,
          calendar_fingerprint: context.calendar_fingerprint,
          deployment_commit: context.deployment_commit,
          deployment_build_marker: context.deployment_build_marker,
        })
      : null;
    const authorizationRead = await readContinuousIntelligenceShadowCanaryManualAuthorization({
      authorization_id: input.authorization_id,
      raw_token: input.authorization_token,
    });
    const claimState = expectedBinding
      ? await readContinuousIntelligenceShadowCanaryManualAuthorizationClaimConflict({ claim_id: expectedBinding.claim_id })
      : { status: "unavailable" as const, active_conflict: true };
    let outcome = evaluateContinuousIntelligenceShadowCanaryManualExecutionGate({
      authorization: authorizationRead.authorization,
      expected_binding: expectedBinding,
      facts: {
        readiness_decision: context.readiness.decision,
        canary_disabled: context.canary_disabled,
        kill_switch_active: context.kill_switch_active,
        schedule_absent: context.schedule_absent,
        daily_capacity_available: context.daily_capacity_available,
        provider_budget_resolved: context.provider_budget_resolved,
        active_claim_conflict: claimState.active_conflict,
      },
      now: context.now,
    });
    if (authorizationRead.status === "unavailable" || claimState.status === "unavailable") outcome = "runtime_unavailable";
    if (authorizationRead.status === "invalid_token") outcome = "authorization_missing";

    let authorization = authorizationRead.authorization;
    if (outcome === "ready_for_one_manual_execution" && !input.dry_run && expectedBinding) {
      const consumed = await consumeContinuousIntelligenceShadowCanaryManualAuthorization({
        authorization_id: input.authorization_id,
        raw_token: input.authorization_token,
        request_fingerprint: expectedBinding.request_fingerprint,
        execution_id: expectedBinding.execution_id,
        claim_id: expectedBinding.claim_id,
      });
      authorization = consumed.authorization;
      if (consumed.status !== "consumed") {
        outcome = consumed.status === "already_consumed" ? "authorization_consumed" :
          consumed.status === "expired" ? "authorization_expired" :
            consumed.status === "identity_mismatch" ? "authorization_identity_mismatch" : "runtime_unavailable";
      }
    }
    const executionHandoff = buildContinuousIntelligenceShadowCanaryManualExecutionHandoff({
      authorization,
      gate_outcome: outcome,
      gate_evaluated_at: context.now,
      dry_run: input.dry_run === true,
    });
    return json({
      contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
      route_path: continuousIntelligenceShadowCanaryManualExecutionGateRoutePath,
      outcome,
      dry_run: input.dry_run === true,
      authorization: authorization ? sanitizeContinuousIntelligenceShadowCanaryManualAuthorization(authorization) : null,
      execution_handoff: executionHandoff,
      execution_continuation_warning:
        "A consumed authorization is not an execution permit. Action 581 must continue atomically on the server after a fresh immediate recheck.",
      request: expectedBinding ? {
        request_fingerprint: expectedBinding.request_fingerprint,
        ticker: expectedBinding.ticker,
        interval: expectedBinding.interval,
        requested_start: expectedBinding.requested_start,
        requested_end: expectedBinding.requested_end,
      } : null,
      provider_execution_warning: "Provider execution has not occurred.",
      no_effect_facts: {
        provider_calls_executed: false,
        claims_created: false,
        attempts_begun: false,
        audit_or_ledger_writes_executed: false,
        schedule_changes: false,
      },
    }, statusFor(outcome));
  } catch {
    return json({
      error: "Manual canary final gate failed safely.",
      contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
      route_path: continuousIntelligenceShadowCanaryManualExecutionGateRoutePath,
      outcome: "runtime_unavailable",
      provider_execution_warning: "Provider execution has not occurred.",
    }, 503);
  }
}
