import {
  continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
  evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility,
  type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization,
  type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationClaim,
} from "@/lib/continuous-intelligence-shadow-canary-historical-usage-reconciliation-contract";

export const continuousIntelligenceHistoricalUsageReconciliationIssueRpcName = "ci_hur_issue" as const;
export const continuousIntelligenceHistoricalUsageReconciliationRpcName = "ci_hur_reconcile" as const;

export type ContinuousIntelligenceHistoricalUsageReconciliationDatabase = {
  rpc: (name: string, args: Record<string, unknown>) => Promise<{ data: unknown; error: { code?: string } | null }>;
};

export type ContinuousIntelligenceHistoricalUsageReconciliationRpcInput = {
  p_authorization_id: string;
  p_reconciliation_identity: string;
  p_target_claim_id: string;
  p_expected_source_audit_id: string;
  p_expected_claim_capacity_units: 2;
  p_expected_ordinary_ledger_units: 1;
  p_expected_reconciliation_units: 0;
  p_expected_missing_usage_units: 1;
  p_deployment_commit: string;
  p_contract_version: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion;
  p_evidence_digest: string;
};

export type ContinuousIntelligenceHistoricalUsageReconciliationPersistenceResult =
  | {
      status: "reconciliation_applied" | "reconciliation_already_applied";
      reconciliation_identity: string;
      target_claim_id: string;
      authorization_id: string;
      ordinary_ledger_units: 1;
      reconciliation_units: 1;
      total_accounted_usage_units: 2;
    }
  | {
      status: "authorization_not_found" | "authorization_expired" | "authorization_already_consumed" | "authorization_target_mismatch" | "authorization_operation_mismatch" | "deployment_binding_mismatch" | "target_claim_not_found" | "target_claim_scope_mismatch" | "target_claim_not_completed" | "provider_usage_unverified" | "source_audit_missing" | "source_audit_mismatch" | "ledger_failure_evidence_mismatch" | "ordinary_ledger_already_present" | "reconciliation_precondition_mismatch" | "reconciliation_identity_conflict" | "reconciliation_audit_conflict" | "reconciliation_postcondition_failure" | "historical_state_unavailable" | "historical_state_malformed";
      reconciliation_identity: null;
      target_claim_id: null;
      authorization_id: string | null;
      ordinary_ledger_units: null;
      reconciliation_units: null;
      total_accounted_usage_units: null;
    };

type FailureStatus = Extract<
  ContinuousIntelligenceHistoricalUsageReconciliationPersistenceResult,
  { reconciliation_identity: null }
>["status"];

const knownFailureStatuses: Record<FailureStatus, true> = {
  authorization_not_found: true,
  authorization_expired: true,
  authorization_already_consumed: true,
  authorization_target_mismatch: true,
  authorization_operation_mismatch: true,
  deployment_binding_mismatch: true,
  target_claim_not_found: true,
  target_claim_scope_mismatch: true,
  target_claim_not_completed: true,
  provider_usage_unverified: true,
  source_audit_missing: true,
  source_audit_mismatch: true,
  ledger_failure_evidence_mismatch: true,
  ordinary_ledger_already_present: true,
  reconciliation_precondition_mismatch: true,
  reconciliation_identity_conflict: true,
  reconciliation_audit_conflict: true,
  reconciliation_postcondition_failure: true,
  historical_state_unavailable: true,
  historical_state_malformed: true,
};

function isKnownFailureStatus(value: string): value is FailureStatus {
  return Object.prototype.hasOwnProperty.call(knownFailureStatuses, value);
}

function isBoundedText(value: unknown, maximum: number): value is string {
  return typeof value === "string" && value.length > 0 && value.length <= maximum;
}

function singleRow(value: unknown): Record<string, unknown> | null {
  if (Array.isArray(value) && value.length !== 1) return null;
  const row = Array.isArray(value) ? value[0] : value;
  return typeof row === "object" && row !== null && !Array.isArray(row) ? row as Record<string, unknown> : null;
}

export function buildContinuousIntelligenceHistoricalUsageReconciliationRpcInput(input: {
  authorization: ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization;
  claim: ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationClaim;
  claim_capacity_units: 2;
  persisted_ledger_units: 1;
  verified_provider_usage_units: 2;
  evidence_digest: string;
}): ContinuousIntelligenceHistoricalUsageReconciliationRpcInput | null {
  const eligibility = evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility({
    claim: input.claim,
    allowed_target_claim_id: input.authorization.target_claim_id,
    claim_capacity_units: input.claim_capacity_units,
    persisted_ledger_units: input.persisted_ledger_units,
    verified_provider_usage_units: input.verified_provider_usage_units,
  });
  if (
    eligibility.category !== "eligible_verified_post_provider_ledger_failure" ||
    input.authorization.reconciliation_identity !== eligibility.reconciliation_identity ||
    input.authorization.target_claim_id !== eligibility.target_claim_id ||
    input.authorization.expected_audit_id !== eligibility.source_audit_id ||
    !/^[0-9a-f]{64}$/.test(input.evidence_digest)
  ) return null;
  return {
    p_authorization_id: input.authorization.authorization_id,
    p_reconciliation_identity: input.authorization.reconciliation_identity,
    p_target_claim_id: input.authorization.target_claim_id,
    p_expected_source_audit_id: input.authorization.expected_audit_id,
    p_expected_claim_capacity_units: 2,
    p_expected_ordinary_ledger_units: 1,
    p_expected_reconciliation_units: 0,
    p_expected_missing_usage_units: 1,
    p_deployment_commit: input.authorization.deployment_commit,
    p_contract_version: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
    p_evidence_digest: input.evidence_digest,
  };
}

export function parseContinuousIntelligenceHistoricalUsageReconciliationRpcResult(
  value: unknown,
): ContinuousIntelligenceHistoricalUsageReconciliationPersistenceResult | null {
  const row = singleRow(value);
  if (!row || typeof row.outcome !== "string") return null;
  if (row.outcome === "reconciliation_applied" || row.outcome === "reconciliation_already_applied") {
    if (
      !isBoundedText(row.reconciliation_identity, 320) || !isBoundedText(row.target_claim_id, 128) ||
      !isBoundedText(row.authorization_id, 160) || row.ordinary_ledger_units !== 1 ||
      row.reconciliation_units !== 1 || row.total_accounted_usage_units !== 2
    ) return null;
    return {
      status: row.outcome,
      reconciliation_identity: row.reconciliation_identity,
      target_claim_id: row.target_claim_id,
      authorization_id: row.authorization_id,
      ordinary_ledger_units: 1,
      reconciliation_units: 1,
      total_accounted_usage_units: 2,
    };
  }
  if (!isKnownFailureStatus(row.outcome)) return null;
  if (
    (row.reconciliation_identity !== null && row.reconciliation_identity !== undefined) ||
    (row.target_claim_id !== null && row.target_claim_id !== undefined) ||
    (row.ordinary_ledger_units !== null && row.ordinary_ledger_units !== undefined) ||
    (row.reconciliation_units !== null && row.reconciliation_units !== undefined) ||
    (row.total_accounted_usage_units !== null && row.total_accounted_usage_units !== undefined) ||
    (row.authorization_id !== null && row.authorization_id !== undefined && !isBoundedText(row.authorization_id, 160))
  ) return null;
  return {
    status: row.outcome,
    reconciliation_identity: null,
    target_claim_id: null,
    authorization_id: typeof row.authorization_id === "string" ? row.authorization_id : null,
    ordinary_ledger_units: null,
    reconciliation_units: null,
    total_accounted_usage_units: null,
  };
}

export function createContinuousIntelligenceHistoricalUsageReconciliationStore(
  database: ContinuousIntelligenceHistoricalUsageReconciliationDatabase | null,
) {
  return {
    async reconcile(
      input: ContinuousIntelligenceHistoricalUsageReconciliationRpcInput,
    ): Promise<ContinuousIntelligenceHistoricalUsageReconciliationPersistenceResult> {
      if (!database) return unavailable();
      try {
        const result = await database.rpc(continuousIntelligenceHistoricalUsageReconciliationRpcName, input);
        if (result.error) return unavailable();
        return parseContinuousIntelligenceHistoricalUsageReconciliationRpcResult(result.data) ?? unavailable();
      } catch {
        return unavailable();
      }
    },
  };
}

function unavailable(): ContinuousIntelligenceHistoricalUsageReconciliationPersistenceResult {
  return {
    status: "historical_state_unavailable",
    reconciliation_identity: null,
    target_claim_id: null,
    authorization_id: null,
    ordinary_ledger_units: null,
    reconciliation_units: null,
    total_accounted_usage_units: null,
  };
}
