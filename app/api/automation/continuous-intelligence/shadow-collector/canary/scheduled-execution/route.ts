import { NextResponse } from "next/server";
import { continuousIntelligenceShadowCanaryScheduledLiveShadowContractVersion, continuousIntelligenceShadowCanaryScheduledLiveShadowRoutePath, resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate } from "@/lib/continuous-intelligence-shadow-canary-scheduled-live-shadow";

export const dynamic = "force-dynamic";
export const maxDuration = 5;

export async function POST() {
  // Permanent default: this route has no admission, provider, or persistence imports.
  const gate = resolveContinuousIntelligenceShadowCanaryScheduledExecutionGate(undefined);
  return NextResponse.json({ contract_version: continuousIntelligenceShadowCanaryScheduledLiveShadowContractVersion, route_path: continuousIntelligenceShadowCanaryScheduledLiveShadowRoutePath, result: "scheduled_execution_disabled", gate, provider_calls: 0, claims_created: 0, audit_writes: 0, ledger_writes: 0 }, { status: 403, headers: { "Cache-Control": "no-store" } });
}
