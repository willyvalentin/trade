import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAudit,
  buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity,
  buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord,
  classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget,
  continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
  evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility,
  validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization,
  type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization,
} from "../../lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract";

const migrationPath = "supabase/migrations/20260723003000_allow_explicit_legacy_action_609_historical_usage_reconciliation.sql";
const target = continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target;
const canonicalClaimId = "canary_claim_manual_canary_execution_20260723_manual_canary_authorization_00000000-0000-4000-8000-000000000617";

function action609Claim(overrides: Record<string, unknown> = {}) {
  return {
    claim_id: target.claim_id,
    execution_id: target.execution_id,
    status: "completed" as const,
    provider_usage: "confirmed" as const,
    audit: { audit_id: target.source_audit_id, claim_id: target.claim_id },
    normal_ledger_present: false,
    reconciliation_present: false,
    ledger_failure: "verified_receipt_identity_collision" as const,
    duplicate_attempt: false,
    scope: "manual" as const,
    ...overrides,
  };
}

function eligibility(claim = action609Claim()) {
  return evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility({
    claim,
    allowed_target_claim_id: target.claim_id,
    claim_capacity_units: 2,
    persisted_ledger_units: 1,
    verified_provider_usage_units: 2,
  });
}

function authorization(): ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization {
  const identity = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({
    target_claim_id: target.claim_id,
    execution_id: target.execution_id,
    source_audit_id: target.source_audit_id,
  });
  if (!identity) throw new Error("Expected legacy Action 609 identity.");
  return {
    contract_version: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
    operation: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation,
    authorization_id: "historical_usage_reconciliation_authorization_609",
    target_claim_id: target.claim_id,
    expected_audit_id: target.source_audit_id,
    expected_claim_capacity_units: 2,
    expected_persisted_ledger_units: 1,
    expected_missing_usage_units: 1,
    reconciliation_identity: identity,
    requested_by: "operator_approved_historical_reconciliation",
    issued_at: "2026-07-23T14:59:00.000Z",
    expires_at: "2026-07-23T15:01:00.000Z",
    status: "issued",
    reason: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
    durable_accounting_mutation_acknowledged: true,
    deployment_commit: "91216b2cf59962a50d8ece600a8d48816669575f",
  };
}

test("Action 637 classifies only the exact Action 609 triple as the explicit legacy target", () => {
  expect(classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget({
    claim_id: target.claim_id, execution_id: target.execution_id, source_audit_id: target.source_audit_id,
  })).toBe("explicit_legacy_action_609_claim");
  expect(classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget({
    claim_id: "canary_claim_canary_execution_20260722_d827c872", execution_id: target.execution_id, source_audit_id: target.source_audit_id,
  })).toBe("unsupported_legacy_claim");
  expect(classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget({
    claim_id: target.claim_id, execution_id: "canary_execution_20260723_other", source_audit_id: target.source_audit_id,
  })).toBe("unsupported_legacy_claim");
  expect(classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget({
    claim_id: target.claim_id, execution_id: target.execution_id, source_audit_id: `${target.source_audit_id}_suffix`,
  })).toBe("unsupported_legacy_claim");
  expect(classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget({
    claim_id: target.claim_id.toUpperCase(), execution_id: target.execution_id, source_audit_id: target.source_audit_id,
  })).toBe("malformed_claim");
});

test("Action 637 preserves canonical manual classification while ordinary ledger evidence remains an eligibility blocker", () => {
  expect(classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget({
    claim_id: canonicalClaimId, execution_id: "manual_execution", source_audit_id: "manual_audit",
  })).toBe("canonical_manual_claim");
  expect(evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility({
    claim: {
      ...action609Claim({ claim_id: canonicalClaimId, execution_id: "manual_execution", audit: { audit_id: "manual_audit", claim_id: canonicalClaimId } }),
      normal_ledger_present: true,
    },
    allowed_target_claim_id: canonicalClaimId,
    claim_capacity_units: 2,
    persisted_ledger_units: 1,
    verified_provider_usage_units: 2,
  }).category).toBe("ineligible_ledger_already_present");
});

test("Action 637 derives an exact Action 609 identity and builds one linked reconciliation record and audit", () => {
  const result = eligibility();
  expect(result.category).toBe("eligible_verified_post_provider_ledger_failure");
  if (result.category !== "eligible_verified_post_provider_ledger_failure") throw new Error("Expected eligibility.");
  expect(result.reconciliation_identity).toBe(
    `historical_manual_usage_reconciliation:${continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion}:${target.claim_id}`,
  );
  const auth = authorization();
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({ authorization: auth, eligibility: result, now: new Date("2026-07-23T15:00:00.000Z") })).toBe(true);
  const record = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord({
    authorization: auth, claim: action609Claim(), historical_event_at: "2026-07-22T20:00:00.000Z", persisted_at: "2026-07-23T15:00:00.000Z",
  });
  expect(record).toMatchObject({ target_claim_id: target.claim_id, source_audit_id: target.source_audit_id, original_execution_id: target.execution_id, usage_units: 1, provider_request_count_for_reconciliation: 0 });
  if (!record) throw new Error("Expected record.");
  expect(buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAudit({ record })).toMatchObject({ reconciliation_identity: record.reconciliation_identity, target_claim_id: target.claim_id, resulting_usage_units: 1 });
});

test("Action 637 fails closed for legacy triple mismatches and authorization binding mismatches", () => {
  expect(eligibility(action609Claim({ execution_id: "canary_execution_20260723_wrong" })).category).toBe("ineligible_unsupported_legacy_target");
  expect(eligibility(action609Claim({ audit: { audit_id: "wrong_audit", claim_id: target.claim_id } })).category).toBe("ineligible_unsupported_legacy_target");
  const result = eligibility();
  if (result.category !== "eligible_verified_post_provider_ledger_failure") throw new Error("Expected eligibility.");
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: { ...authorization(), expected_audit_id: "wrong_audit" }, eligibility: result, now: new Date("2026-07-23T15:00:00.000Z"),
  })).toBe(false);
  expect(validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({
    authorization: { ...authorization(), expires_at: "2026-07-23T15:05:01.000Z" }, eligibility: result, now: new Date("2026-07-23T15:00:00.000Z"),
  })).toBe(false);
});

test("Action 637 SQL policy mirrors the exact TypeScript allowlist and retains service-role-only RPC grants", () => {
  const migration = readFileSync(migrationPath, "utf8");
  for (const marker of [target.claim_id, target.execution_id, target.source_audit_id, "ci_hur_target_allowed", "ci_hur_target_provider_result_allowed", "provider_success_with_candles", "create or replace function public.ci_hur_issue", "create or replace function public.ci_hur_reconcile"]) {
    expect(migration).toContain(marker);
  }
  expect(migration).toContain("revoke all on function public.ci_hur_issue");
  expect(migration).toContain("grant execute on function public.ci_hur_reconcile");
  expect(migration).toContain("'reconciliation_already_applied'::text, existing_reconciliation.reconciliation_identity");
  expect(migration).toContain("return query select 'reconciliation_already_applied'::text, existing_reconciliation.reconciliation_identity, existing_reconciliation.target_claim_id, existing_reconciliation.authorization_id, 1::smallint, 1::smallint, 2::smallint;\n      return;");
  expect(migration).not.toContain("canary_claim_canary_execution_.*");
  expect(migration).not.toContain("update public.continuous_intelligence_credit_ledger");
  expect(migration).not.toContain("delete from public.continuous_intelligence_credit_ledger");
});
