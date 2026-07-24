import { NextResponse } from "next/server";

import { buildBoundedShadowCollectorExecutionProofBlockedResult } from "@/lib/bounded-shadow-collector-execution-proof";
import { buildBoundedShadowCollectorLiveProofReceipt } from "@/lib/bounded-shadow-collector-live-proof-receipt";
import { isBoundedShadowCollectorProofAuditEnabled } from "@/lib/bounded-shadow-collector-proof-audit-store";
import { isContinuousIntelligenceCreditLedgerEnabled } from "@/lib/continuous-intelligence-credit-ledger";
import {
  buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
  continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
  continuousIntelligenceShadowCanaryManualExecutionRoutePath,
  matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding,
} from "@/lib/continuous-intelligence-shadow-canary-manual-authorization";
import {
  buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity,
  buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId,
  executeContinuousIntelligenceShadowCanary,
  recheckContinuousIntelligenceShadowCanaryRuntimeWithManualExecutionLease,
} from "@/lib/continuous-intelligence-shadow-collector-canary";
import { getIntradayCandlesWithDiagnostics } from "@/lib/market-data";
import { persistBoundedShadowCollectorProofAudit } from "@/lib/server/bounded-shadow-collector-proof-audit-persistence";
import { persistContinuousIntelligenceCreditLedger } from "@/lib/server/continuous-intelligence-credit-ledger-persistence";
import {
  statusForContinuousIntelligenceShadowCanaryManualExecutionAdmission,
} from "@/lib/continuous-intelligence-shadow-canary-manual-execution-lease";
import {
  admitContinuousIntelligenceShadowCanaryManualExecutionWithLease,
  readContinuousIntelligenceShadowCanaryManualAuthorization,
} from "@/lib/server/continuous-intelligence-shadow-canary-manual-authorization-persistence";
import { finalizeContinuousIntelligenceShadowCanaryDailyClaim } from "@/lib/server/continuous-intelligence-shadow-canary-claim-persistence";
import { buildContinuousIntelligenceShadowCanaryManualAuthorizationContext } from "@/lib/server/continuous-intelligence-shadow-canary-manual-authorization-context";

export const dynamic = "force-dynamic";
export const maxDuration = 10;

const noStoreHeaders = { "Cache-Control": "no-store" };

function json(body: Record<string, unknown>, status = 200) {
  return NextResponse.json(body, { status, headers: noStoreHeaders });
}

function parse(value: unknown) {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const raw = value as Record<string, unknown>;
  if (Object.keys(raw).length !== 3 || typeof raw.authorization_id !== "string" || typeof raw.authorization_token !== "string" || typeof raw.execution_lease_id !== "string") return null;
  if (raw.authorization_id.length < 1 || raw.authorization_id.length > 128 || raw.authorization_token.length < 32 || raw.authorization_token.length > 256 || raw.execution_lease_id.length < 1 || raw.execution_lease_id.length > 128) return null;
  return { authorization_id: raw.authorization_id, authorization_token: raw.authorization_token, execution_lease_id: raw.execution_lease_id };
}

export async function POST(request: Request) {
  const expectedSecret = process.env.AUTOMATION_SECRET;
  if (!expectedSecret || request.headers.get("x-automation-secret") !== expectedSecret) {
    return json({ error: "Unauthorized.", contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion, route_path: continuousIntelligenceShadowCanaryManualExecutionRoutePath }, 401);
  }
  let input: ReturnType<typeof parse> = null;
  try { input = parse(JSON.parse(await request.text())); } catch { /* validation below */ }
  if (!input) return json({ error: "Invalid manual canary execution input.", failure_category: "validation_failed" }, 400);

  const context = await buildContinuousIntelligenceShadowCanaryManualAuthorizationContext();
  const lifecycleIdentity = context.lifecycle_identity
    ? buildContinuousIntelligenceShadowCanaryManualAdmissionLifecycleIdentity({
        lifecycle_identity: context.lifecycle_identity,
        authorization_id: input.authorization_id,
      })
    : null;
  const binding = lifecycleIdentity
    ? buildContinuousIntelligenceShadowCanaryManualAuthorizationBinding({
        preflight: context.preflight,
        lifecycle_identity: lifecycleIdentity,
        calendar_fingerprint: context.calendar_fingerprint,
        deployment_commit: context.deployment_commit,
        deployment_build_marker: context.deployment_build_marker,
      })
    : null;
  const auditEnabled = isBoundedShadowCollectorProofAuditEnabled(process.env.TURE_BOUNDED_PROOF_DURABLE_AUDIT_ENABLED);
  const ledgerEnabled = isContinuousIntelligenceCreditLedgerEnabled(process.env.TURE_CONTINUOUS_INTELLIGENCE_CREDIT_LEDGER_ENABLED);
  if (!binding || !context.preflight_static_blockers_are_only_disabled_state || !context.canary_disabled || !context.kill_switch_active || !context.schedule_absent || !context.daily_capacity_available || !context.provider_budget_resolved || !auditEnabled || !ledgerEnabled) {
    return json({ error: "Manual canary execution is blocked by current runtime state.", failure_category: "execution_preflight_blocked", provider_calls_executed: false }, 403);
  }
  const receiptId = lifecycleIdentity && context.preflight.request
    ? buildContinuousIntelligenceShadowCanaryManualAttemptReceiptId({
        request: context.preflight.request,
        lifecycle_identity: lifecycleIdentity,
      })
    : null;
  if (!receiptId) {
    return json({ error: "Manual canary execution has no canonical attempt identity.", failure_category: "execution_preflight_blocked", provider_calls_executed: false }, 403);
  }

  const authorizationRead = await readContinuousIntelligenceShadowCanaryManualAuthorization({ authorization_id: input.authorization_id, raw_token: input.authorization_token });
  if (authorizationRead.status !== "available" || !authorizationRead.authorization || !matchesContinuousIntelligenceShadowCanaryManualAuthorizationBinding(authorizationRead.authorization, binding)) {
    return json({ error: "Manual canary authorization is unavailable or no longer bound to this request.", failure_category: "authorization_preflight_blocked", provider_calls_executed: false }, 409);
  }

  const admission = await admitContinuousIntelligenceShadowCanaryManualExecutionWithLease({
    authorization_id: input.authorization_id,
    raw_token: input.authorization_token,
    execution_lease_id: input.execution_lease_id,
    request_fingerprint: binding.request_fingerprint,
    execution_id: binding.execution_id,
    claim_id: binding.claim_id,
    utc_day: context.now.toISOString().slice(0, 10),
  });
  if (admission.status !== "attempt_started") {
    return json(
      { error: "Manual canary execution was not admitted.", failure_category: admission.status, provider_calls_executed: false },
      statusForContinuousIntelligenceShadowCanaryManualExecutionAdmission(admission.status),
    );
  }

  const runtimeRecheck = recheckContinuousIntelligenceShadowCanaryRuntimeWithManualExecutionLease(context.preflight);
  let providerEntered = false;
  let result = buildBoundedShadowCollectorExecutionProofBlockedResult(
    "internal_execution_failure",
    context.preflight.canonical_execution_context?.proof_preflight.request_fingerprint ?? null,
    "Manual canary execution failed safely before provider entry.",
    0,
  );
  try {
    if (!runtimeRecheck.eligible || !context.canary_disabled || !context.kill_switch_active) {
      result = buildBoundedShadowCollectorExecutionProofBlockedResult("feature_flag_disabled", context.preflight.canonical_execution_context?.proof_preflight.request_fingerprint ?? null, "Manual canary execution was blocked before provider entry.", 0);
    } else {
      const execution = await executeContinuousIntelligenceShadowCanary({
        preflight: context.preflight,
        lifecycle_identity: context.lifecycle_identity!,
        runtime_recheck: runtimeRecheck,
        allow_disabled_default_override: true,
        provider: async ({ ticker, interval, start, end, signal }) => {
          providerEntered = true;
          const response = await getIntradayCandlesWithDiagnostics(ticker, interval, start, end, { signal });
          return { provider: "twelve_data", provider_call_count: 1, estimated_credits: 1, actual_credits: null, provider_outcome: "success", provider_status: response.diagnostics.response_status === "provider_error" ? "provider_error" : response.candles.length ? "available" : "empty", provider_error_category: response.diagnostics.response_status === "provider_error" ? response.diagnostics.response_category : null, fallback_used: response.diagnostics.fallback_used, response_structurally_valid: response.diagnostics.response_structurally_valid, retry_count: response.diagnostics.retry_count, rate_limited: response.diagnostics.rate_limited, candles: response.candles };
        },
      });
      result = execution.result;
    }
  } catch {
    result = buildBoundedShadowCollectorExecutionProofBlockedResult("internal_execution_failure", context.preflight.canonical_execution_context?.proof_preflight.request_fingerprint ?? null, "Manual canary execution failed safely.", providerEntered ? 1 : 0);
  }

  const terminalStatus = result.ok ? "completed" as const : "failed" as const;
  const finalized = await finalizeContinuousIntelligenceShadowCanaryDailyClaim({
    claim_id: binding.claim_id,
    execution_id: binding.execution_id,
    request_fingerprint: binding.request_fingerprint,
    status: terminalStatus,
    provider_attempted: providerEntered,
    source_receipt_id: receiptId,
    finalized_at: new Date().toISOString(),
  });
  if (!finalized.finalization_proven || !runtimeRecheck.proof_preflight || !context.preflight.request) {
    return json({ error: "Manual canary execution terminal containment could not be proven.", failure_category: "terminal_containment_unproven", provider_calls_executed: providerEntered }, 503);
  }
  const receipt = buildBoundedShadowCollectorLiveProofReceipt({
    request: context.preflight.request,
    preflight: runtimeRecheck.proof_preflight,
    result,
    operator_authorization_verified: true,
    authorization_consumed: true,
    receipt_id: receiptId,
    now: context.now,
    entry_kind: "bounded_manual_proof",
    daily_claim_id: binding.claim_id,
    daily_claim_status: finalized.claim_status,
    daily_claim_execution_id: binding.execution_id,
  });
  const audit = await persistBoundedShadowCollectorProofAudit(receipt);
  const ledger = await persistContinuousIntelligenceCreditLedger({ receipt, durable_audit: { status: audit.status, persisted: audit.persisted }, entry_kind: "bounded_manual_proof" });
  const durableComplete = audit.persisted && ledger.persisted;
  return json({
    contract_version: continuousIntelligenceShadowCanaryManualAuthorizationContractVersion,
    route_path: continuousIntelligenceShadowCanaryManualExecutionRoutePath,
    execution_status: durableComplete ? result.status : "failed",
    provider_calls_executed: providerEntered,
    daily_claim_status: finalized.claim_status,
    finalization_proven: true,
    audit: { status: audit.status, persisted: audit.persisted },
    ledger: { status: ledger.status, persisted: ledger.persisted },
    no_effect_boundary: { shared_cache_mutated: false, schedule_changes: false, recommendation_scanner_execution_effects: false },
  }, durableComplete && result.ok ? 200 : 502);
}
