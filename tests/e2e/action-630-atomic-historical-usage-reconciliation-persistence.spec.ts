import { readFileSync } from "node:fs";

import { expect, test } from "@playwright/test";

import {
  buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation,
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
  verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation,
  type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization,
} from "../../lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract";
import {
  buildContinuousIntelligenceHistoricalUsageReconciliationRpcInput,
  continuousIntelligenceHistoricalUsageReconciliationRpcName,
  createContinuousIntelligenceHistoricalUsageReconciliationStore,
  parseContinuousIntelligenceHistoricalUsageReconciliationRpcResult,
} from "../../lib/continuous-intelligence-historical-usage-reconciliation-store";

const migrationPath = "supabase/migrations/20260723002000_create_historical_usage_reconciliation_persistence.sql";
const claimId = "canary_claim_manual_canary_execution_20260723_manual_canary_authorization_00000000-0000-4000-8000-000000000609";
const builtIdentity = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({ target_claim_id: claimId });
if (!builtIdentity) throw new Error("Expected canonical reconciliation identity.");
const identity: string = builtIdentity;

function claim(overrides: Record<string, unknown> = {}) {
  return {
    claim_id: claimId,
    execution_id: "manual_canary_execution_20260723_manual_canary_authorization_00000000-0000-4000-8000-000000000609",
    status: "completed" as const,
    provider_usage: "confirmed" as const,
    audit: { audit_id: "manual_audit_action_609", claim_id: claimId },
    normal_ledger_present: false,
    reconciliation_present: false,
    ledger_failure: "verified_receipt_identity_collision" as const,
    duplicate_attempt: false,
    scope: "manual" as const,
    ...overrides,
  };
}

function authorization(
  overrides: Partial<ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization> = {},
): ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization {
  return {
    contract_version: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
    operation: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation,
    authorization_id: "historical_usage_reconciliation_authorization_609",
    target_claim_id: claimId,
    expected_audit_id: "manual_audit_action_609",
    expected_claim_capacity_units: 2 as const,
    expected_persisted_ledger_units: 1 as const,
    expected_missing_usage_units: 1 as const,
    reconciliation_identity: identity,
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

function rpcInput() {
  const input = buildContinuousIntelligenceHistoricalUsageReconciliationRpcInput({
    authorization: authorization(),
    claim: claim(),
    claim_capacity_units: 2,
    persisted_ledger_units: 1,
    verified_provider_usage_units: 2,
    evidence_digest: "a".repeat(64),
  });
  if (!input) throw new Error("Expected strict RPC input.");
  return input;
}

test("Action 630 migration creates isolated append-only reconciliation schemas and exact constraints", () => {
  const migration = readFileSync(migrationPath, "utf8");
  for (const marker of [
    "public.ci_hur_authorizations",
    "public.ci_hur_reconciliations",
    "public.ci_hur_audits",
    "usage_units = 1", "provider_request_count_for_reconciliation = 0",
    "target_claim_id text not null unique", "authorization_id text not null unique",
    "ci_hur_reconciliations_append_only", "ci_hur_reconciliation_audits_append_only",
    "ci_hur_reconciliation_audit_required", "deferrable initially deferred",
  ]) expect(migration).toContain(marker);
  expect(migration).toContain("record_type = 'historical_manual_usage_reconciliation'");
  expect(migration).not.toContain("update public.continuous_intelligence_credit_ledger");
  expect(migration).not.toContain("delete from public.continuous_intelligence_credit_ledger");
  expect(migration).not.toContain("continuous_intelligence_historical_usage_reconciliation_authorizations");
  expect(migration).not.toContain("continuous_intelligence_historical_usage_reconciliations");
  expect(migration).not.toContain("continuous_intelligence_historical_usage_reconciliation_audits");
});

test("Action 630 migration exposes only service-role reconciliation functions with locked search paths", () => {
  const migration = readFileSync(migrationPath, "utf8");
  expect(migration).toContain("create or replace function public.ci_hur_issue");
  expect(migration).toContain("create or replace function public.ci_hur_reconcile");
  expect(migration).toContain("set search_path = public");
  expect(migration).toContain("revoke all on function public.ci_hur_reconcile");
  expect(migration).toContain("from public, anon, authenticated");
  expect(migration).toContain("grant execute on function public.ci_hur_reconcile");
  expect(migration).toContain("to service_role");
  expect(migration).not.toContain("create policy");
});

test("Action 630 builds only exact Action-609-shaped RPC input and preserves preconditions", () => {
  expect(rpcInput()).toEqual({
    p_authorization_id: "historical_usage_reconciliation_authorization_609",
    p_reconciliation_identity: identity,
    p_target_claim_id: claimId,
    p_expected_source_audit_id: "manual_audit_action_609",
    p_expected_claim_capacity_units: 2,
    p_expected_ordinary_ledger_units: 1,
    p_expected_reconciliation_units: 0,
    p_expected_missing_usage_units: 1,
    p_deployment_commit: "1182f172fc85c0bf38e4b49adbf36ec4358ad6fe",
    p_contract_version: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
    p_evidence_digest: "a".repeat(64),
  });
  expect(buildContinuousIntelligenceHistoricalUsageReconciliationRpcInput({
    authorization: authorization({ target_claim_id: claimId.replace("609", "617") }),
    claim: claim(), claim_capacity_units: 2, persisted_ledger_units: 1, verified_provider_usage_units: 2, evidence_digest: "a".repeat(64),
  })).toBeNull();
  expect(buildContinuousIntelligenceHistoricalUsageReconciliationRpcInput({
    authorization: authorization(), claim: claim({ scope: "scheduled" }), claim_capacity_units: 2, persisted_ledger_units: 1, verified_provider_usage_units: 2, evidence_digest: "a".repeat(64),
  })).toBeNull();
});

test("Action 630 parses typed results strictly and preserves the exact applied accounting state", () => {
  expect(parseContinuousIntelligenceHistoricalUsageReconciliationRpcResult([{
    outcome: "reconciliation_applied", reconciliation_identity: identity, target_claim_id: claimId,
    authorization_id: "historical_usage_reconciliation_authorization_609", ordinary_ledger_units: 1,
    reconciliation_units: 1, total_accounted_usage_units: 2,
  }])).toMatchObject({ status: "reconciliation_applied", total_accounted_usage_units: 2 });
  expect(parseContinuousIntelligenceHistoricalUsageReconciliationRpcResult([{
    outcome: "provider_usage_unverified", reconciliation_identity: null, target_claim_id: null,
    authorization_id: "historical_usage_reconciliation_authorization_609", ordinary_ledger_units: null,
    reconciliation_units: null, total_accounted_usage_units: null,
  }])).toMatchObject({ status: "provider_usage_unverified" });
  expect(parseContinuousIntelligenceHistoricalUsageReconciliationRpcResult([{
    outcome: "unexpected", reconciliation_identity: null, target_claim_id: null, authorization_id: null,
    ordinary_ledger_units: null, reconciliation_units: null, total_accounted_usage_units: null,
  }])).toBeNull();
  expect(parseContinuousIntelligenceHistoricalUsageReconciliationRpcResult([
    { outcome: "historical_state_unavailable", reconciliation_identity: null, target_claim_id: null, authorization_id: null, ordinary_ledger_units: null, reconciliation_units: null, total_accounted_usage_units: null },
    { outcome: "historical_state_unavailable", reconciliation_identity: null, target_claim_id: null, authorization_id: null, ordinary_ledger_units: null, reconciliation_units: null, total_accounted_usage_units: null },
  ])).toBeNull();
});

test("Action 630 store calls only the reconciliation RPC and fails closed without a database or valid response", async () => {
  const calls: string[] = [];
  const store = createContinuousIntelligenceHistoricalUsageReconciliationStore({
    async rpc(name) {
      calls.push(name);
      return {
        data: [{ outcome: "reconciliation_precondition_mismatch", reconciliation_identity: null, target_claim_id: null, authorization_id: null, ordinary_ledger_units: null, reconciliation_units: null, total_accounted_usage_units: null }],
        error: null,
      };
    },
  });
  expect((await store.reconcile(rpcInput())).status).toBe("reconciliation_precondition_mismatch");
  expect(calls).toEqual([continuousIntelligenceHistoricalUsageReconciliationRpcName]);
  expect((await createContinuousIntelligenceHistoricalUsageReconciliationStore(null).reconcile(rpcInput())).status).toBe("historical_state_unavailable");
});

test("Action 630 keeps post-state accounting exact and has no provider execution or public route path", () => {
  const record = {
    record_type: "historical_manual_usage_reconciliation" as const,
    usage_units: 1 as const,
    provider_request_count_for_reconciliation: 0 as const,
    target_claim_id: claimId,
  };
  expect(verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation({
    claim_capacity_units: 2, normal_execution_ledger_units: 1, reconciliation_records: [record], target_claim_id: claimId,
  })).toEqual({ category: "reconciliation_complete", total_accounted_usage_units: 2 });
  expect(verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation({
    claim_capacity_units: 2, normal_execution_ledger_units: 1, reconciliation_records: [record, record], target_claim_id: claimId,
  }).category).toBe("reconciliation_duplicate");
  const store = readFileSync("lib/continuous-intelligence-historical-usage-reconciliation-store.ts", "utf8");
  const adapter = readFileSync("lib/server/continuous-intelligence-historical-usage-reconciliation-persistence.ts", "utf8");
  expect(store).not.toContain("fetch(");
  expect(store).not.toContain("getIntradayCandles");
  expect(store).not.toContain("execute(");
  expect(store).not.toContain("route.ts");
  expect(adapter.startsWith('import "server-only";')).toBe(true);
  expect(adapter).toContain("getServerSupabaseClient");
  expect(adapter).toContain("continuousIntelligenceHistoricalUsageReconciliationRpcName");
});
