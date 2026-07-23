import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAudit,
  buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity,
  buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
  evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility,
  validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization,
  verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation,
} from "../../lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract";
import { evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation } from "../../lib/continuous-intelligence-shadow-canary-historical-manual-usage-reconciliation";
import { evaluateContinuousIntelligenceShadowCanaryScheduledDurableState } from "../../lib/continuous-intelligence-shadow-canary-scheduled-durable-state";

const action604ClaimId = "canary_claim_manual_canary_execution_20260722_manual_canary_authorization_00000000-0000-4000-8000-000000000604";
const action609ClaimId = "canary_claim_manual_canary_execution_20260723_manual_canary_authorization_00000000-0000-4000-8000-000000000609";
const action617ClaimId = "canary_claim_manual_canary_execution_20260723_manual_canary_authorization_00000000-0000-4000-8000-000000000617";
const now = new Date("2026-07-23T15:00:00.000Z");

function action609Claim(overrides: Record<string, unknown> = {}) {
  return {
    claim_id: action609ClaimId,
    execution_id: "manual_canary_execution_20260723_manual_canary_authorization_00000000-0000-4000-8000-000000000609",
    status: "completed" as const,
    provider_usage: "confirmed" as const,
    audit: { audit_id: "manual_audit_action_609", claim_id: action609ClaimId },
    normal_ledger_present: false,
    reconciliation_present: false,
    ledger_failure: "verified_receipt_identity_collision" as const,
    duplicate_attempt: false,
    scope: "manual" as const,
    ...overrides,
  };
}

function eligibility(
  overrides: Record<string, unknown> = {},
  counts: { claim_capacity_units: number; persisted_ledger_units: number; verified_provider_usage_units: number } = {
    claim_capacity_units: 2,
    persisted_ledger_units: 1,
    verified_provider_usage_units: 2,
  },
) {
  return evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility({
    claim: action609Claim(overrides),
    allowed_target_claim_id: action609ClaimId,
    ...counts,
  });
}

function authorization(targetClaimId = action609ClaimId, overrides: Record<string, unknown> = {}) {
  const reconciliationIdentity = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({ target_claim_id: targetClaimId });
  if (!reconciliationIdentity) throw new Error("Expected a canonical reconciliation identity.");
  return {
    contract_version: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
    operation: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation,
    authorization_id: "historical_usage_reconciliation_authorization_609",
    target_claim_id: targetClaimId,
    expected_audit_id: "manual_audit_action_609",
    expected_claim_capacity_units: 2 as const,
    expected_persisted_ledger_units: 1 as const,
    expected_missing_usage_units: 1 as const,
    reconciliation_identity: reconciliationIdentity,
    requested_by: "operator_approved_historical_reconciliation",
    issued_at: "2026-07-23T14:59:00.000Z",
    expires_at: "2026-07-23T15:01:00.000Z",
    status: "issued" as const,
    reason: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
    durable_accounting_mutation_acknowledged: true as const,
    deployment_commit: "1182f172fc85c0bf38e4b49adbf36ec4358ad6fe",
    ...overrides,
  };
}

test("Action 629 makes only the Action 609-shaped verified failure eligible", () => {
  expect(eligibility()).toMatchObject({
    category: "eligible_verified_post_provider_ledger_failure",
    target_claim_id: action609ClaimId,
    source_audit_id: "manual_audit_action_609",
  });
  expect(eligibility({ provider_usage: "unknown" }).category).toBe("ineligible_provider_usage_unverified");
  expect(eligibility({ audit: null }).category).toBe("ineligible_audit_missing");
  expect(eligibility({ normal_ledger_present: true }).category).toBe("ineligible_ledger_already_present");
  expect(eligibility({ reconciliation_present: true }).category).toBe("ineligible_reconciliation_already_present");
  expect(eligibility({ scope: "scheduled" }).category).toBe("ineligible_wrong_scope");
  expect(eligibility({ duplicate_attempt: true }).category).toBe("ineligible_duplicate_attempt");
  expect(eligibility({ claim_id: "malformed claim" }).category).toBe("ineligible_historical_state_malformed");
});

test("Action 629 identity is deterministic, claim-scoped, and distinct from normal receipts", () => {
  const action604Identity = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({ target_claim_id: action604ClaimId });
  const action609Identity = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({ target_claim_id: action609ClaimId });
  const action617Identity = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({ target_claim_id: action617ClaimId });
  expect(action609Identity).toBe(buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({ target_claim_id: action609ClaimId }));
  expect(new Set([action604Identity, action609Identity, action617Identity]).size).toBe(3);
  expect(action609Identity).toContain(action609ClaimId);
  expect(action609Identity).not.toContain("token");
  expect(action609Identity).not.toContain("lease");
  expect(action609Identity).not.toContain("manual_canary_receipt");
  const nextVersionIdentity = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({
    target_claim_id: action609ClaimId,
    contract_version: "continuous_intelligence_shadow_canary_historical_usage_reconciliation_v2",
  });
  expect(nextVersionIdentity).not.toBe(action609Identity);
  expect(nextVersionIdentity).toContain("_v2:");
});

test("Action 629 authorization is exact, bounded, and cannot move to another claim", () => {
  const eligible = eligibility();
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: authorization(), eligibility: eligible, now,
  })).toBe(true);
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: authorization(action617ClaimId), eligibility: eligible, now,
  })).toBe(false);
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: authorization(action609ClaimId, { expected_audit_id: "other_audit" }), eligibility: eligible, now,
  })).toBe(false);
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: authorization(action609ClaimId, { expires_at: "2026-07-23T14:59:59.000Z" }), eligibility: eligible, now,
  })).toBe(false);
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: authorization(action609ClaimId, { operation: "wrong_operation" }), eligibility: eligible, now,
  })).toBe(false);
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: authorization(action609ClaimId, { expires_at: "2026-07-23T15:10:00.000Z" }), eligibility: eligible, now,
  })).toBe(false);
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: authorization(), eligibility: eligibility({}, { claim_capacity_units: 3, persisted_ledger_units: 1, verified_provider_usage_units: 2 }), now,
  })).toBe(false);
});

test("Action 629 builds an append-only accounting record and a separate reconciliation audit without a provider call", () => {
  const record = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord({
    authorization: authorization(),
    claim: action609Claim(),
    historical_event_at: "2026-07-23T14:30:00.000Z",
    persisted_at: "2026-07-23T15:00:00.000Z",
  });
  expect(record).toMatchObject({
    target_claim_id: action609ClaimId,
    source_audit_id: "manual_audit_action_609",
    usage_units: 1,
    provider_request_count_for_reconciliation: 0,
    record_type: "historical_manual_usage_reconciliation",
  });
  expect(record?.record_id).not.toContain("manual_canary_receipt");
  expect(record?.record_id).not.toContain("token");
  expect(record?.record_id).not.toContain("lease");
  expect(record).toEqual(buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord({
    authorization: authorization(), claim: action609Claim(), historical_event_at: "2026-07-23T14:30:00.000Z", persisted_at: "2026-07-23T15:00:00.000Z",
  }));
  const audit = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAudit({ record: record! });
  expect(audit).toMatchObject({ target_claim_id: action609ClaimId, resulting_usage_units: 1, final_decision: "reconciled" });
});

test("Action 629 preserves one effective reconciliation and validates before and after readback", () => {
  const record = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord({
    authorization: authorization(), claim: action609Claim(), historical_event_at: "2026-07-23T14:30:00.000Z", persisted_at: "2026-07-23T15:00:00.000Z",
  });
  expect(verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation({
    claim_capacity_units: 2, normal_execution_ledger_units: 1, reconciliation_records: [], target_claim_id: action609ClaimId,
  })).toMatchObject({ category: "reconciliation_not_applied", total_accounted_usage_units: 1 });
  expect(verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation({
    claim_capacity_units: 2, normal_execution_ledger_units: 1, reconciliation_records: [record], target_claim_id: action609ClaimId,
  })).toEqual({ category: "reconciliation_complete", total_accounted_usage_units: 2 });
  expect(verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation({
    claim_capacity_units: 2, normal_execution_ledger_units: 1, reconciliation_records: [record, record], target_claim_id: action609ClaimId,
  }).category).toBe("reconciliation_duplicate");
  expect(verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation({
    claim_capacity_units: 2, normal_execution_ledger_units: 1, reconciliation_records: [record], target_claim_id: action617ClaimId,
  }).category).toBe("reconciliation_target_linkage_mismatch");
});

test("Action 629 preserves the Action 628 root cause and scheduled isolation before a future repair", () => {
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalManualUsageReconciliation({
    claims: [
      { claim_id: "manual_claim_action_609", attempt_identity: "manual_attempt_action_609", provider_usage: "confirmed", ledger_contract: "required", audit_linkage: "matching", ledger_linkage: "identity_collision" },
      { claim_id: "manual_claim_action_617", attempt_identity: "manual_attempt_action_617", provider_usage: "confirmed", ledger_contract: "required", audit_linkage: "matching", ledger_linkage: "matching" },
    ],
    persisted_ledger_units: 1,
  }).category).toBe("missing_ledger_after_verified_provider_usage");
  expect(evaluateContinuousIntelligenceShadowCanaryScheduledDurableState({
    claims: [], audits: [], ledger: [], occurrence_id: null, request_fingerprint: null,
  }).persistence_stop).toBe("clear");
});
