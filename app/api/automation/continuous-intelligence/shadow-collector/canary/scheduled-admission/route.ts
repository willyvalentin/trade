import { NextResponse } from "next/server";

import {
  buildContinuousIntelligenceShadowCanaryScheduledExecutionDisabledResult,
  continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion,
  continuousIntelligenceShadowCanaryScheduledAdmissionRoutePath,
  evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication,
  mapContinuousIntelligenceShadowCanaryScheduledPreflightCategory,
  parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest,
} from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";
import { buildContinuousIntelligenceShadowCanaryScheduledExecutionSafetyContext } from "@/lib/server/continuous-intelligence-shadow-canary-scheduled-execution-safety-context";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

export async function POST(request: Request) {
  const authentication = evaluateContinuousIntelligenceShadowCanarySchedulerAuthentication(
    process.env.AUTOMATION_SECRET,
    request.headers.get("x-automation-secret"),
  );
  if (authentication !== "scheduler_auth_ready") {
    return json({
      contract_version: continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion,
      route_path: continuousIntelligenceShadowCanaryScheduledAdmissionRoutePath,
      scheduler_authentication: authentication,
      provider_calls_executed: false,
      durable_writes_executed: false,
    }, 401);
  }
  let raw: unknown = null;
  try {
    const text = await request.text();
    if (text.length > 4_096) throw new Error("request too large");
    raw = JSON.parse(text);
  } catch {
    return json({
      contract_version: continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion,
      route_path: continuousIntelligenceShadowCanaryScheduledAdmissionRoutePath,
      failure_category: "unavailable",
      provider_calls_executed: false,
      durable_writes_executed: false,
    }, 400);
  }
  const scheduledRequest = parseContinuousIntelligenceShadowCanaryScheduledExecutionRequest(raw);
  const context = await buildContinuousIntelligenceShadowCanaryScheduledExecutionSafetyContext({
    request: scheduledRequest,
    scheduler_authentication: authentication,
  });
  const { admission, safety } = context;
  const execution = buildContinuousIntelligenceShadowCanaryScheduledExecutionDisabledResult(null);
  return json({
    contract_version: continuousIntelligenceShadowCanaryScheduledAdmissionContractVersion,
    route_path: continuousIntelligenceShadowCanaryScheduledAdmissionRoutePath,
    admission,
    scheduled_result_category: mapContinuousIntelligenceShadowCanaryScheduledPreflightCategory(admission),
    budget_status: safety.budget_status,
    active_claim_status: context.active_claim_status,
    persistence_stop: context.persistence_stop,
    execution_enabled: safety.execution_enabled,
    final_dry_decision: safety.final_dry_decision,
    // Durable admission lives in a server-only adapter. This public scheduler
    // boundary remains locally execution-disabled until Action 622 wires it to
    // one atomic admission-and-finalization workflow.
    execution,
    provider_calls_executed: false,
    durable_writes_executed: false,
    claim_mutations_executed: false,
  }, admission.status === "admission_ready" ? 200 : 409);
}
