export const continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion =
  "continuous_intelligence_shadow_canary_historical_usage_reconciliation_v1" as const;
export const continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation =
  "historical_manual_usage_ledger_reconciliation" as const;
export const continuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecordType =
  "historical_manual_usage_reconciliation" as const;
export const continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason =
  "verified_post_provider_receipt_identity_collision" as const;
export const continuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorizationTtlSeconds = 300 as const;

/**
 * One historical compatibility target. This is an immutable evidence binding, not
 * a pattern for admitting legacy claim IDs.
 */
export const continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target = Object.freeze({
  claim_id: "canary_claim_canary_execution_20260723_8feacb91",
  execution_id: "canary_execution_20260723_8feacb91",
  source_audit_id: "canary_receipt_AAPL_5min_2026-07-22T19-30-00.000Z_2026-07-22T20-00-00.000Z",
});

export type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTargetClassification =
  | "canonical_manual_claim"
  | "explicit_legacy_action_609_claim"
  | "unsupported_legacy_claim"
  | "malformed_claim";

export type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationClaim = {
  claim_id: string;
  execution_id: string;
  status: "completed" | "failed" | "attempted" | "claimed";
  provider_usage: "confirmed" | "not_reached" | "unknown";
  audit: { audit_id: string; claim_id: string } | null;
  normal_ledger_present: boolean;
  reconciliation_present: boolean;
  ledger_failure: "verified_receipt_identity_collision" | "none" | "unknown";
  duplicate_attempt: boolean;
  scope: "manual" | "scheduled" | "dry_run" | "synthetic";
};

export type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility =
  | { category: "eligible_verified_post_provider_ledger_failure"; reconciliation_identity: string; target_claim_id: string; source_audit_id: string }
  | { category: "ineligible_claim_not_found" | "ineligible_wrong_scope" | "ineligible_unsupported_legacy_target" | "ineligible_non_terminal_claim" | "ineligible_provider_usage_unverified" | "ineligible_audit_missing" | "ineligible_audit_linkage_mismatch" | "ineligible_ledger_already_present" | "ineligible_reconciliation_already_present" | "ineligible_duplicate_attempt" | "ineligible_usage_delta_not_exactly_one" | "ineligible_historical_state_unavailable" | "ineligible_historical_state_malformed"; reconciliation_identity: null };

export type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization = {
  contract_version: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion;
  operation: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation;
  authorization_id: string;
  target_claim_id: string;
  expected_audit_id: string;
  expected_claim_capacity_units: 2;
  expected_persisted_ledger_units: 1;
  expected_missing_usage_units: 1;
  reconciliation_identity: string;
  requested_by: string;
  issued_at: string;
  expires_at: string;
  status: "issued" | "consumed" | "expired" | "revoked";
  reason: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason;
  durable_accounting_mutation_acknowledged: true;
  deployment_commit: string;
};

export type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord = {
  record_id: string;
  reconciliation_identity: string;
  record_type: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecordType;
  target_claim_id: string;
  source_audit_id: string;
  original_execution_id: string;
  usage_units: 1;
  provider: "twelve_data";
  provider_request_count_for_reconciliation: 0;
  reason: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason;
  contract_version: typeof continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion;
  authorization_id: string;
  authorized_at: string;
  historical_event_at: string;
  persisted_at: string;
  deployment_commit: string;
};

export type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAudit = {
  audit_id: string;
  reconciliation_identity: string;
  target_claim_id: string;
  authorization_id: string;
  expected_claim_capacity_units: 2;
  expected_persisted_ledger_units: 1;
  actual_claim_capacity_units: 2;
  actual_persisted_ledger_units: 1;
  resulting_usage_units: 1;
  final_decision: "reconciled";
  persisted_at: string;
  deployment_commit: string;
};

export type ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationVerification =
  | { category: "reconciliation_complete"; total_accounted_usage_units: 2 }
  | { category: "reconciliation_not_applied" | "reconciliation_duplicate" | "reconciliation_usage_still_disagrees" | "reconciliation_overcount" | "reconciliation_target_linkage_mismatch" | "reconciliation_state_unavailable" | "reconciliation_state_malformed"; total_accounted_usage_units: number | null };

function isBoundedText(value: unknown, maximum: number): value is string {
  return typeof value === "string" && /^[A-Za-z0-9_.:-]+$/.test(value) && value.length > 0 && value.length <= maximum;
}

function isCanonicalManualClaimId(value: unknown): value is string {
  return typeof value === "string" && /^canary_claim_manual_canary_execution_\d{8}_manual_canary_authorization_[0-9a-f-]{36}$/.test(value);
}

export function classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget(input: {
  claim_id: unknown;
  execution_id: unknown;
  source_audit_id: unknown;
}): ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTargetClassification {
  if (isCanonicalManualClaimId(input.claim_id)) return "canonical_manual_claim";
  if (
    input.claim_id === continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.claim_id &&
    input.execution_id === continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.execution_id &&
    input.source_audit_id === continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.source_audit_id
  ) return "explicit_legacy_action_609_claim";
  if (typeof input.claim_id === "string" && input.claim_id.startsWith("canary_claim_canary_execution_")) {
    return "unsupported_legacy_claim";
  }
  return "malformed_claim";
}

export function isApprovedContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget(input: {
  claim_id: unknown;
  execution_id: unknown;
  source_audit_id: unknown;
}): boolean {
  const classification = classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget(input);
  return classification === "canonical_manual_claim" || classification === "explicit_legacy_action_609_claim";
}

function isCanonicalIsoTimestamp(value: unknown): value is string {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value) && Number.isFinite(Date.parse(value));
}

function isCanonicalReconciliationContractVersion(value: unknown): value is string {
  return typeof value === "string" && /^continuous_intelligence_shadow_canary_historical_usage_reconciliation_v[1-9]\d*$/.test(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return typeof value === "number" && Number.isInteger(value) && value >= 0;
}

export function buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity(input: {
  target_claim_id: unknown;
  execution_id?: unknown;
  source_audit_id?: unknown;
  contract_version?: unknown;
}): string | null {
  const contractVersion = input.contract_version ?? continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion;
  if (
    !isApprovedContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget({
      claim_id: input.target_claim_id,
      execution_id: input.execution_id,
      source_audit_id: input.source_audit_id,
    }) ||
    !isCanonicalReconciliationContractVersion(contractVersion)
  ) return null;
  // Claim IDs are durable, server-issued, non-secret identifiers. Keeping the
  // full claim ID prevents a market-contract collision and supports audit readback.
  const identity = `historical_manual_usage_reconciliation:${contractVersion}:${input.target_claim_id}`;
  return identity.length <= 320 ? identity : null;
}

export function evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility(input: {
  claim: unknown;
  allowed_target_claim_id: unknown;
  claim_capacity_units: unknown;
  persisted_ledger_units: unknown;
  verified_provider_usage_units: unknown;
}): ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility {
  if (input.claim === null) return { category: "ineligible_claim_not_found", reconciliation_identity: null };
  if (!input.claim || typeof input.claim !== "object" || Array.isArray(input.claim)) {
    return { category: "ineligible_historical_state_unavailable", reconciliation_identity: null };
  }
  const claim = input.claim as Partial<ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationClaim>;
  const targetClassification = classifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationTarget({
    claim_id: claim.claim_id,
    execution_id: claim.execution_id,
    source_audit_id: claim.audit?.audit_id,
  });
  if (
    targetClassification === "malformed_claim" ||
    !isBoundedText(claim.execution_id, 160) ||
    !["completed", "failed", "attempted", "claimed"].includes(claim.status ?? "") ||
    !["confirmed", "not_reached", "unknown"].includes(claim.provider_usage ?? "") ||
    !["manual", "scheduled", "dry_run", "synthetic"].includes(claim.scope ?? "") ||
    !["verified_receipt_identity_collision", "none", "unknown"].includes(claim.ledger_failure ?? "") ||
    typeof claim.normal_ledger_present !== "boolean" || typeof claim.reconciliation_present !== "boolean" || typeof claim.duplicate_attempt !== "boolean"
  ) return { category: "ineligible_historical_state_malformed", reconciliation_identity: null };
  if (targetClassification === "unsupported_legacy_claim") {
    return { category: "ineligible_unsupported_legacy_target", reconciliation_identity: null };
  }
  if (claim.scope !== "manual" || claim.claim_id !== input.allowed_target_claim_id) return { category: "ineligible_wrong_scope", reconciliation_identity: null };
  if (claim.status !== "completed") return { category: "ineligible_non_terminal_claim", reconciliation_identity: null };
  if (claim.provider_usage !== "confirmed") return { category: "ineligible_provider_usage_unverified", reconciliation_identity: null };
  if (!claim.audit) return { category: "ineligible_audit_missing", reconciliation_identity: null };
  if (!isBoundedText(claim.audit.audit_id, 160) || claim.audit.claim_id !== claim.claim_id) {
    return { category: "ineligible_audit_linkage_mismatch", reconciliation_identity: null };
  }
  if (claim.normal_ledger_present) return { category: "ineligible_ledger_already_present", reconciliation_identity: null };
  if (claim.reconciliation_present) return { category: "ineligible_reconciliation_already_present", reconciliation_identity: null };
  if (claim.duplicate_attempt) return { category: "ineligible_duplicate_attempt", reconciliation_identity: null };
  if (claim.ledger_failure !== "verified_receipt_identity_collision") {
    return { category: "ineligible_historical_state_unavailable", reconciliation_identity: null };
  }
  if (
    input.claim_capacity_units !== 2 || input.persisted_ledger_units !== 1 || input.verified_provider_usage_units !== 2 ||
    input.claim_capacity_units - input.persisted_ledger_units !== 1
  ) return { category: "ineligible_usage_delta_not_exactly_one", reconciliation_identity: null };
  const reconciliationIdentity = buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationIdentity({
    target_claim_id: claim.claim_id,
    execution_id: claim.execution_id,
    source_audit_id: claim.audit.audit_id,
  });
  return reconciliationIdentity
    ? { category: "eligible_verified_post_provider_ledger_failure", reconciliation_identity: reconciliationIdentity, target_claim_id: claim.claim_id, source_audit_id: claim.audit.audit_id }
    : { category: "ineligible_historical_state_malformed", reconciliation_identity: null };
}

export function validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization(input: {
  authorization: unknown;
  eligibility: ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility;
  now: Date;
}): boolean {
  if (input.eligibility.category !== "eligible_verified_post_provider_ledger_failure" || !Number.isFinite(input.now.getTime())) return false;
  if (!input.authorization || typeof input.authorization !== "object" || Array.isArray(input.authorization)) return false;
  const authorization = input.authorization as Partial<ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization>;
  if (
    authorization.contract_version !== continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion ||
    authorization.operation !== continuousIntelligenceShadowCanaryHistoricalUsageReconciliationOperation ||
    authorization.status !== "issued" || authorization.reason !== continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason ||
    authorization.durable_accounting_mutation_acknowledged !== true || authorization.expected_claim_capacity_units !== 2 ||
    authorization.expected_persisted_ledger_units !== 1 || authorization.expected_missing_usage_units !== 1 ||
    !isBoundedText(authorization.authorization_id, 160) || !isBoundedText(authorization.target_claim_id, 160) ||
    !isBoundedText(authorization.expected_audit_id, 160) || !isBoundedText(authorization.requested_by, 160) ||
    !isBoundedText(authorization.deployment_commit, 160) || !isCanonicalIsoTimestamp(authorization.issued_at) ||
    !isCanonicalIsoTimestamp(authorization.expires_at) || Date.parse(authorization.expires_at) <= input.now.getTime() ||
    Date.parse(authorization.expires_at) <= Date.parse(authorization.issued_at) ||
    Date.parse(authorization.expires_at) - Date.parse(authorization.issued_at) > continuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorizationTtlSeconds * 1000
  ) return false;
  return authorization.target_claim_id === input.eligibility.target_claim_id &&
    authorization.expected_audit_id === input.eligibility.source_audit_id &&
    authorization.reconciliation_identity === input.eligibility.reconciliation_identity;
}

export function buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord(input: {
  authorization: unknown;
  claim: unknown;
  historical_event_at: unknown;
  persisted_at: unknown;
}): ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord | null {
  if (!isCanonicalIsoTimestamp(input.historical_event_at) || !isCanonicalIsoTimestamp(input.persisted_at)) return null;
  if (!input.claim || typeof input.claim !== "object" || Array.isArray(input.claim)) return null;
  const claim = input.claim as Partial<ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationClaim>;
  const eligibility = evaluateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationEligibility({
    claim,
    allowed_target_claim_id: claim.claim_id,
    claim_capacity_units: 2,
    persisted_ledger_units: 1,
    verified_provider_usage_units: 2,
  });
  if (!validateContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization({ authorization: input.authorization, eligibility, now: new Date(input.persisted_at) })) return null;
  if (!claim.audit) return null;
  const authorization = input.authorization as ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAuthorization;
  const identity = eligibility.reconciliation_identity;
  if (!identity) return null;
  const recordId = `historical_usage_reconciliation_ledger:${identity}`;
  if (recordId.length > 384) return null;
  return Object.freeze({
    record_id: recordId,
    reconciliation_identity: identity,
    record_type: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecordType,
    target_claim_id: claim.claim_id!,
    source_audit_id: claim.audit.audit_id,
    original_execution_id: claim.execution_id!,
    usage_units: 1,
    provider: "twelve_data",
    provider_request_count_for_reconciliation: 0,
    reason: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationReason,
    contract_version: continuousIntelligenceShadowCanaryHistoricalUsageReconciliationContractVersion,
    authorization_id: authorization.authorization_id,
    authorized_at: authorization.issued_at,
    historical_event_at: input.historical_event_at,
    persisted_at: input.persisted_at,
    deployment_commit: authorization.deployment_commit,
  });
}

export function buildContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAudit(input: {
  record: ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord;
}): ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationAudit {
  return Object.freeze({
    audit_id: `historical_usage_reconciliation_audit:${input.record.reconciliation_identity}`,
    reconciliation_identity: input.record.reconciliation_identity,
    target_claim_id: input.record.target_claim_id,
    authorization_id: input.record.authorization_id,
    expected_claim_capacity_units: 2,
    expected_persisted_ledger_units: 1,
    actual_claim_capacity_units: 2,
    actual_persisted_ledger_units: 1,
    resulting_usage_units: 1,
    final_decision: "reconciled",
    persisted_at: input.record.persisted_at,
    deployment_commit: input.record.deployment_commit,
  });
}

export function verifyContinuousIntelligenceShadowCanaryHistoricalUsageReconciliation(input: {
  claim_capacity_units: unknown;
  normal_execution_ledger_units: unknown;
  reconciliation_records: unknown;
  target_claim_id: unknown;
}): ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationVerification {
  if (!isNonNegativeInteger(input.claim_capacity_units) || !isNonNegativeInteger(input.normal_execution_ledger_units) || !Array.isArray(input.reconciliation_records)) {
    return { category: "reconciliation_state_unavailable", total_accounted_usage_units: null };
  }
  const claimCapacityUnits = input.claim_capacity_units;
  const normalExecutionLedgerUnits = input.normal_execution_ledger_units;
  if (
    !isCanonicalManualClaimId(input.target_claim_id) &&
    input.target_claim_id !== continuousIntelligenceShadowCanaryHistoricalUsageLegacyAction609Target.claim_id
  ) {
    return { category: "reconciliation_state_malformed", total_accounted_usage_units: null };
  }
  const records = input.reconciliation_records as ContinuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecord[];
  if (!records.every((record) => record && record.record_type === continuousIntelligenceShadowCanaryHistoricalUsageReconciliationRecordType && record.usage_units === 1 && record.provider_request_count_for_reconciliation === 0 && record.target_claim_id === input.target_claim_id)) {
    return { category: "reconciliation_target_linkage_mismatch", total_accounted_usage_units: null };
  }
  if (records.length === 0) return { category: "reconciliation_not_applied", total_accounted_usage_units: normalExecutionLedgerUnits };
  if (records.length > 1) return { category: "reconciliation_duplicate", total_accounted_usage_units: normalExecutionLedgerUnits + records.length };
  const total = normalExecutionLedgerUnits + 1;
  if (total > claimCapacityUnits) return { category: "reconciliation_overcount", total_accounted_usage_units: total };
  if (total !== claimCapacityUnits) return { category: "reconciliation_usage_still_disagrees", total_accounted_usage_units: total };
  return { category: "reconciliation_complete", total_accounted_usage_units: 2 };
}
