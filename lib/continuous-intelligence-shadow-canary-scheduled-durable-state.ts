import { isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity } from "@/lib/continuous-intelligence-shadow-canary-scheduled-admission";

export type ContinuousIntelligenceShadowCanaryScheduledDurableState = Readonly<{
  active_claims: "clear" | "same_occurrence_active" | "conflicting_scope_active" | "unavailable";
  persistence_stop: "clear" | "audit_failed" | "ledger_failed" | "usage_mismatch" | "finalization_unproven" | "unavailable";
  active_scheduled_claims: number | null;
  scheduled_claims_for_market_window: number | null;
}>;

type ScheduledClaim = {
  claim_id: string;
  execution_id: string;
  request_fingerprint: string;
  status: "claimed" | "attempted" | "completed" | "failed";
  source_receipt_id: string | null;
};

type ScheduledAudit = { daily_claim_id: string };
type ScheduledLedger = { source_receipt_id: string };

function unavailable(): ContinuousIntelligenceShadowCanaryScheduledDurableState {
  return {
    active_claims: "unavailable",
    persistence_stop: "unavailable",
    active_scheduled_claims: null,
    scheduled_claims_for_market_window: null,
  };
}

function isClaim(value: unknown): value is ScheduledClaim {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return typeof row.claim_id === "string" && typeof row.execution_id === "string" &&
    typeof row.request_fingerprint === "string" &&
    ["claimed", "attempted", "completed", "failed"].includes(row.status as string) &&
    (typeof row.source_receipt_id === "string" || row.source_receipt_id === null);
}

function isAudit(value: unknown): value is ScheduledAudit {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).daily_claim_id === "string";
}

function isLedger(value: unknown): value is ScheduledLedger {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value) &&
    typeof (value as Record<string, unknown>).source_receipt_id === "string";
}

export function evaluateContinuousIntelligenceShadowCanaryScheduledDurableState(input: {
  claims: unknown;
  audits: unknown;
  ledger: unknown;
  occurrence_id: string | null;
  request_fingerprint: string | null;
}): ContinuousIntelligenceShadowCanaryScheduledDurableState {
  if (!Array.isArray(input.claims) || !Array.isArray(input.audits) || !Array.isArray(input.ledger) ||
    !input.claims.every(isClaim) || !input.audits.every(isAudit) || !input.ledger.every(isLedger)) {
    return unavailable();
  }
  if (input.claims.some((claim) =>
    claim.execution_id.startsWith("scheduled_canary_execution_") &&
    !isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity(claim.execution_id),
  )) return unavailable();
  const scheduledClaims = input.claims.filter((claim) =>
    isContinuousIntelligenceShadowCanaryScheduledExecutionIdentity(claim.execution_id),
  );
  const active = scheduledClaims.filter((claim) => claim.status === "claimed" || claim.status === "attempted");
  const expectedExecutionId = input.occurrence_id
    ? `scheduled_canary_execution_${input.occurrence_id}`
    : null;
  const activeClaims = active.some((claim) => claim.execution_id === expectedExecutionId)
    ? "same_occurrence_active"
    : active.length > 0
      ? "conflicting_scope_active"
      : "clear";
  const scheduledClaimsForMarketWindow = input.request_fingerprint
    ? scheduledClaims.filter((claim) => claim.request_fingerprint === input.request_fingerprint).length
    : null;
  const terminal = scheduledClaims.filter((claim) => claim.status === "completed" || claim.status === "failed");
  if (terminal.some((claim) => !claim.source_receipt_id)) {
    return { active_claims: activeClaims, persistence_stop: "finalization_unproven", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
  }
  const auditClaimIds = new Set(input.audits.map((audit) => audit.daily_claim_id));
  if (terminal.some((claim) => !auditClaimIds.has(claim.claim_id))) {
    return { active_claims: activeClaims, persistence_stop: "audit_failed", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
  }
  const ledgerReceipts = new Set(input.ledger.map((entry) => entry.source_receipt_id));
  if (terminal.some((claim) => !ledgerReceipts.has(claim.source_receipt_id!))) {
    return { active_claims: activeClaims, persistence_stop: "ledger_failed", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
  }
  if (terminal.length !== input.audits.length || terminal.length !== input.ledger.length) {
    return { active_claims: activeClaims, persistence_stop: "usage_mismatch", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
  }
  return { active_claims: activeClaims, persistence_stop: "clear", active_scheduled_claims: active.length, scheduled_claims_for_market_window: scheduledClaimsForMarketWindow };
}
